
# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased] - yyyy-mm-dd

Here we write upgrading notes for brands. It's a team effort to make them as
straightforward as possible.

### Added
- [PROJECTNAME-XXXX](http://tickets.projectname.com/browse/PROJECTNAME-XXXX)
  MINOR Ticket title goes here.
- [PROJECTNAME-YYYY](http://tickets.projectname.com/browse/PROJECTNAME-YYYY)
  PATCH Ticket title goes here.

### Changed

### Fixed


## [1.0.1] - 2022-01-15

### Added

CHANGELOG


## [1.0.0] - 2022-01-15

### New version release
Forked from https://github.com/TomerAberbach/get-all-files

### Added

* files are now typeScript native*.ts
* more types added.
* added XO as linter.
* removed Ava testing framework in favor of  jest as testing framework.
* Added new tests.
* Added jsDoc on private and public functions.
* Added extra param in options `excludedDirs?: string[]`:
   * An array of excluded dirs. Similar to `isExcludedDir` but without the hassle fo creating a
     predicate. Just give it a list of dirs to be excluded.

### Changed

### Fixed
