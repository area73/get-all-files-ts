import * as fs from 'node:fs';
import {getAllFilesSync, getAllFiles} from './index';

const normalizeOpSysPath = (path: string) => path.replace(/\\/g, '/').replace(/(\/|\\)$/g, '');

const isExcludedDir
  = (excludedPaths: string[]) =>
    (reference: string) =>
      excludedPaths
        .map(normalizeOpSysPath)
        .includes(normalizeOpSysPath(reference));

describe('Getting files synchronously', () => {
  describe('when no options are passed', () => {
    let filesSync: ReturnType <typeof getAllFilesSync>;
    beforeEach(() => {
      const rootDir = 'test/fixtures';
      filesSync = getAllFilesSync(rootDir);
    });

    it('should return an object iterator of existing filepaths and those filepaths should exist', () => {
      let fileExist = true;
      for (const filename of filesSync.toArray()) {
        fileExist = fs.existsSync(filename);
        if (!fileExist) {
          break;
        }
      }

      expect(fileExist).toBe(true);
    });

    it('should return an array with filenames', () => {
      const syncArray = filesSync.toArray();
      expect(syncArray).toBeInstanceOf(Array);
    });

    it('should find 8 files', () => {
      expect(filesSync.toArray().length).toBe(8);
    });
  });

  describe('when passing an options object with a "isExcludedDir" function option', () => {
    it('should find 2 files in root dir, excluding one directory', () => {
      const excludedDirs = isExcludedDir(['test/fixtures/blah/']);
      const rootDir = 'test/fixtures';
      const filesSync = getAllFilesSync(rootDir, {isExcludedDir: excludedDirs});
      expect(filesSync.toArray().length).toBe(2);
    });

    it('should find 2 files in root dir, excluding one directory with absolute path passing resolve = true in options object', () => {
      const absolutePath = `${__dirname.slice(0, -4)}/test/fixtures/blah/`;
      const excludedDirs = isExcludedDir([absolutePath]);
      const rootDir = 'test/fixtures';
      const filesSync = getAllFilesSync(rootDir, {resolve: true, isExcludedDir: excludedDirs});
      expect(filesSync.toArray().length).toBe(2);
    });

    it('should find 0 files in root dir, excluding two directories', () => {
      const excludedDirs = isExcludedDir(['test/fixtures/blah/sort of real/', 'test/fixtures/blah/unreal/']);
      const rootDir = 'test/fixtures/blah';
      const filesSync = getAllFilesSync(rootDir, {isExcludedDir: excludedDirs});
      expect(filesSync.toArray().length).toBe(0);
    });
  });

  describe('when passing an options object with "excludedDirs" option', () => {
    it('should find 2 files in root dir', () => {
      const excludedDirs = ['test/fixtures/blah/'];
      const rootDir = 'test/fixtures';
      const filesSync = getAllFilesSync(rootDir, {excludedDirs});
      expect(filesSync.toArray().length).toBe(2);
    });

    it('should find 2 files in root dir, excluding one directory with absolute path passing resolve = true in options object', () => {
      const absolutePath = `${__dirname.slice(0, -4)}/test/fixtures/blah/`;
      const excludedDirs = [absolutePath];
      const rootDir = 'test/fixtures';
      const filesSync = getAllFilesSync(rootDir, {resolve: true, excludedDirs});
      expect(filesSync.toArray().length).toBe(2);
    });

    it('should find 0 files in root dir, excluding one directory', () => {
      const excludedDirs = ['test/fixtures/blah/sort of real/', 'test/fixtures/blah/unreal/'];
      const rootDir = 'test/fixtures/blah';
      const filesSync = getAllFilesSync(rootDir, {excludedDirs});
      expect(filesSync.toArray().length).toBe(0);
    });
  });
});

describe('Getting files asynchronously', () => {
  let filesAsyncArray: Array<string | undefined>;
  beforeEach(async () => {
    filesAsyncArray = await getAllFiles('test/fixtures').toArray();
  });

  describe('when no options are passed', () => {
    it('should return an object iterator of existing filepaths and those filepaths should exist', () => {
      let fileExist = true;
      for (const filename of filesAsyncArray) {
        fileExist = fs.existsSync(filename!);
        if (!fileExist) {
          break;
        }
      }

      expect(fileExist).toBe(true);
    });

    it('should return an array with filenames', () => {
      expect(filesAsyncArray).toBeInstanceOf(Array);
    });

    it('should find 8 files', () => {
      expect(filesAsyncArray.length).toBe(8);
    });
  });

  describe('when passing an options object with a "isExcludedDir" function option', () => {
    it('should find 2 files in root dir, excluding one directory with absolute path passing resolve = true in options object', async () => {
      const excludedDirs = isExcludedDir(['test/fixtures/blah/']);
      const rootDir = 'test/fixtures';
      const filesAsyncArray = await getAllFiles(rootDir, {isExcludedDir: excludedDirs}).toArray();
      expect(filesAsyncArray.length).toBe(2);
    });
    it('should find 0 files in root dir, excluding one directory', async () => {
      const excludedDirs = isExcludedDir(['test/fixtures/blah/sort of real/', 'test/fixtures/blah/unreal/']);
      const rootDir = 'test/fixtures/blah';
      const filesAsyncArray = await getAllFiles(rootDir, {isExcludedDir: excludedDirs}).toArray();
      expect(filesAsyncArray.length).toBe(0);
    });
  });

  describe('when passing an options object with "excludedDirs" option', () => {
    it('should find 2 files in root dir, excluding one directory with absolute path passing resolve = true in options object', async () => {
      const excludedDirs = ['test/fixtures/blah/'];
      const rootDir = 'test/fixtures';
      const filesAsyncArray = await getAllFiles(rootDir, {excludedDirs}).toArray();
      expect(filesAsyncArray.length).toBe(2);
    });
    it('should find 0 files in root dir, excluding one directory', async () => {
      const excludedDirs = ['test/fixtures/blah/sort of real/', 'test/fixtures/blah/unreal/'];
      const rootDir = 'test/fixtures/blah';
      const filesAsyncArray = await getAllFiles(rootDir, {excludedDirs}).toArray();
      expect(filesAsyncArray.length).toBe(0);
    });
  });
});
