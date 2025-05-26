# get-all-files-ts

<div align="center">
  <a href="https://npmjs.org/package/@a73/get-all-files-ts">
    <img src="https://badgen.now.sh/npm/v/@a73/get-all-files-ts" alt="version" />
  </a>
  <a href="https://github.com/area73/get-all-files-ts/actions">
    <img src="https://github.com/area73/get-all-files-ts/workflows/CI/badge.svg" alt="CI" />
  </a>
</div>

**get-all-files-ts** is a speedy recursive directory crawler with support for lazy syncing and async iterators. This crawler has been coded in TypeScript.

This project is a fork of [get-all-files](https://github.com/TomerAberbach/get-all-files).

## Differences from the Original Version:
* Files have been converted to native TypeScript (*.ts) format.
* Addition of more types.
* Inclusion of XO as a linter.
* Removed Ava testing framework; switched to Jest as the main testing framework.
* Additional tests added.
* jsDoc included for private and public functions.
* `excludedDirs?: string[]` parameter included in options. This parameter enables you to exclude directories by simply entering them in a list, removing the need to create a predicate function.

## Installation

To install, use the command below:

```sh
$ npm i @a73/get-all-files-ts
```

## How to Use

For usage examples, please check out the [`get-all-files-ts` github pages](https://area73.github.io/get-all-files-ts/).


## Documentation

This library uses [typedoc](https://typedoc.org/), a documentation generator for TypeScript projects similar to jsDoc. You can find the documentation in the `/docs` folder or visit it online at https://area73.github.io/get-all-files-ts/

## Contribute

Star ratings are very much appreciated!

For bugs and feature requests, [please create an issue](https://github.com/area73/get-all-files-ts/issues/new).

## License

[MIT](https://github.com/area73/get-all-files-ts/blob/main/license) © [Rodrigo Erades](https://github.com/area73)
