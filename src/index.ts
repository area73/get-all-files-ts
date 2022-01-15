/**
 * Copyright 2022 Rodrigo Erades
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as fs from 'node:fs';

import {sep, resolve, posix, join} from 'node:path';

import * as fa from 'node:fs/promises';

export interface OptionsParameters {
  /**
   * An array of excluded dirs. Similar to `isExcludedDir` but without the hassle fo creating a
   * predicate. Just give it a list of dirs to be excluded.
   */
  excludedDirs?: string[];
  /**
   * A predicate that determines whether the directory with the given `dirname`
   * should be crawled.
   *
   * There is no `isExcludedFile` option because you can exclude
   * files by checking conditions while lazily iterating using`getAllFiles.sync` or
   * `getAllFiles.async`
   * */
  isExcludedDir?: (dirname: string) => boolean;
  /**
   * Whether to resolve paths to absolute paths (relative to `process.cwd()`).
   */
  resolve?: boolean;
}

/**
 *
 * @description a function to replace window's path separator to unix like separator '/'
 * and also remove ending separator to standardized path.
 *
 * @param path a string path like to normalize
 * @returns normalized path (unix style)
 */
const normalizeOpSysPath = (path: string) => path.replace(/\\/g, '/').replace(/(\/|\\)$/g, '');

/**
 *
 * @description Helper function to check wether a given list of filepaths are included in
 * searching directory
 *
 * @param excludedPaths list of directories to be excluded
 * @param reference root reference of searching directory
 * @returns boolean
 */
const isDirInList = (excludedPaths: string[] | undefined, reference: string) =>
  excludedPaths
    ? excludedPaths
      .map(normalizeOpSysPath)
      .map((s: string) => {
        console.log(normalizeOpSysPath(reference) === s, normalizeOpSysPath(reference), '/', s);
        return s;
      })
      .includes(normalizeOpSysPath(reference))
    : false;

/**
 *
 * @description helper function to return absolute or relative filename
 * @param filename
 * @param useAbsoluteRute
 * @returns a normalized filename, if useAbsoluteRoute it will return an absolute filename otherwise
 *  it will return filename unmodify
 */
const normalizeDirname = (filename: string, useAbsoluteRute?: boolean) => useAbsoluteRute ? resolve(filename) : filename;

/**
 *
 * @description helper function to determine if a dirname is skip or not according to options
 * @param dirname
 * @param options
 * @returns true if found as excluded
 */
const isExcluded = (dirname: string, options?: OptionsParameters) => {
  if (options?.isExcludedDir?.(dirname)) {
    return true;
  }

  if (isDirInList(options?.excludedDirs, dirname)) {
    return true;
  }

  return false;
};

/**
 *
 * @description traverse function to walk through all file directories
 * @param dirname root dirname to look
 * @param options  <OptionsParameters>
 * @returns Generator
 */
const traverseSync = function * (dirname: string, options?: OptionsParameters): Generator {
  if (isExcluded(dirname, options)) {
    return;
  }

  const direntList = fs.readdirSync(dirname, {withFileTypes: true});
  for (const dirent of direntList) {
    const filename = join(dirname, posix.normalize(dirent.name));

    if (dirent.isDirectory()) {
      yield * traverseSync(join(filename, sep), options);
    } else {
      yield filename;
    }
  }
};

const noop = function (_parameter: unknown) {
  // Do nothing;
};

/**
 *
 * @description a notifier will keep track of each async call made to read a dir and will act as a
 * global promise
 * @returns notifier
 */
const notifier = () => {
  let done = false;
  let resolve = noop;
  let reject = noop;

  let notified = new Promise((pResolve, pReject) => {
    resolve = pResolve;
    reject = pReject;
  });

  return {
    resolve() {
      const oldResolve = resolve;
      notified = new Promise((pResolve, pReject) => {
        resolve = pResolve;
        reject = pReject;
      });
      oldResolve(undefined);
    },
    reject(error: NodeJS.ErrnoException) {
      reject(error);
    },
    get done() {
      return done;
    },
    set done(value) {
      done = value;
    },
    async onResolved() {
      return notified;
    },
  };
};

/**
 *
 * @description traverse function to walk through all file directories
 * @param dirnames
 * @param filenames
 * @param globalNotifier
 * @param options {OptionsParameters}
 * @returns void
 */
function traverse(dirnames: string[], filenames: string[], globalNotifier: ReturnType<typeof notifier>, options?: OptionsParameters) {
  if (dirnames.length === 0) {
    globalNotifier.done = true;
    return;
  }

  const children: string[] = [];
  let pendingPromises = 0;
  for (const dirname of dirnames) {
    if (isExcluded(dirname, options)) {
      continue;
    }

    pendingPromises++;
    fs.readdir(dirname, {withFileTypes: true}, (error, dirents) => {
      error && globalNotifier.reject(error);

      for (const dirent of dirents) {
        const filename = join(dirname, dirent.name);

        if (dirent.isDirectory()) {
          children.push(filename);
        } else {
          filenames.push(filename);
        }
      }

      globalNotifier.resolve();

      if (--pendingPromises === 0) {
        traverse(children, filenames, globalNotifier, options);
      }
    });
  }

  if (pendingPromises === 0) {
    globalNotifier.done = true;
  }
}

/**
 * Returns a lazy
 * [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)
 * /
 * [iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)
 * that iterates over the file paths recursively found at `path` in no particular order.
 *
 * Calling `toArray` on the returned value returns an array of the file paths.
 *
 * @example
 *
 * ```js
 * import { getAllFilesSync } from '@a73/get-all-files'
 *    // Lazily iterate over filenames synchronously
 *    for (const filename of getAllFilesSync(`path/to/dir/or/file`)) {
 *      // Could break early on some condition and get-all-files
 *    // won't have unnecessarily accumulated the filenames in an array
 *    console.log(filename)
 *    }
 *
 *    // Get array of filenames synchronously
 *    console.log(getAllFilesSync(`path/to/dir/or/file`).toArray());
 * ```
 *
 * @param filename entry point path to look for files
 * @param options wether to use absolute or relative paths and excluded dirs
 * @returns an Iterator with a .toString() helper function to return a list of filenames
 */
export const getAllFilesSync = (filename: string, options?: OptionsParameters) => {
  const files = {
    * [Symbol.iterator]() {
      if (!fs.lstatSync(filename).isDirectory()) {
        yield filename;
        return;
      }

      yield * (traverseSync)(normalizeDirname(filename, options?.resolve), options);
    },
    toArray: () => [...files] as string[],
  };

  return files;
};

/**
 * Returns a lazy
 * [async iterable/iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator)
 * that asynchronously iterates over the file paths recursively found at `path` in
 * no particular order.
 *
 * Calling `toArray` on the returned value returns a promise that resolves to an
 * array of the file paths.
 *
 * @example
 * ```js
 *  import { getAllFiles } from '@a73/get-all-files';
 *
 *    // Lazily iterate over filenames asynchronously
 *    for await (const filename of getAllFiles(`path/to/dir/or/file`)) {
 *      // Could break early on some condition and get-all-files
 *      // won't have unnecessarily accumulated the filenames in an array
 *      console.log(filename)
 *    }
 *
 *    // Get array of filenames asynchronously
 *    console.log(await getAllFiles(`path/to/dir/or/file`).toArray())
 * ```
 * @async Iterable / Iterator
 *
 * @param filename entry point path to look for files
 * @param options wether to use absolute or relative paths and excluded dirs
 * @returns  an Iterator with a .toString() helper function to return a list of filenames
 */
export const getAllFiles = (filename: string, options?: OptionsParameters) => {
  const files = {
    async * [Symbol.asyncIterator]() {
      const {isDirectory} = await fa.lstat(filename);
      if (!isDirectory) {
        yield filename;
        return;
      }

      const filenames: string[] = [];
      const globalNotifier = notifier();

      traverse([normalizeDirname(filename, options?.resolve)], filenames, globalNotifier, options);

      do {
        // eslint-disable-next-line no-await-in-loop
        await globalNotifier.onResolved();
        while (filenames.length > 0) {
          yield filenames.pop();
        }
      } while (!globalNotifier.done);
    },
    toArray: async () => {
      const filenames = [];
      for await (const filename of files) {
        filenames.push(filename);
      }

      return filenames;
    },
  };
  return files;
};

