# Change Log

## [Unreleased](https://github.com/alonrbar/easy-template-x/tree/develop)

### Added

- Loop lists and table rows.  
  Notice: The loop logic for tables is a bit different than the logic of the
          existing paragraph loop. Instead of repeating the content in between
          the opening and closing tags it repeats entire rows (including content
          in the row that appears before the opening or after the closing tag).
          The same goes for lists - the entire bullet is repeated.
- Throw MalformedFileError when fails to open template file as zip.

### Changed

- Change stack to Babel, Jest and ESLint.

## [0.4.0 - 2018-13-12](https://github.com/alonrbar/easy-template-x/tree/v0.4.0)

### Added

- Easily find out what tags are present in a given template (TemplateHandler.parseTags).

## [0.3.4 - 2018-09-12](https://github.com/alonrbar/easy-template-x/tree/v0.3.4)

### Added

- Full browser example in readme file.

## [0.3.3 - 2018-07-17](https://github.com/alonrbar/easy-template-x/tree/v0.3.3)

### Added

- Package keywords for npm visibility.

## [0.3.2 - 2018-06-22](https://github.com/alonrbar/easy-template-x/tree/v0.3.2)

### Fixed

- Fix serialization of text nodes with empty values.

## [0.3.1 - 2018-06-13](https://github.com/alonrbar/easy-template-x/tree/v0.3.1)

### Added

- Add readme badges

## [0.3.0 - 2018-06-13](https://github.com/alonrbar/easy-template-x/tree/v0.3.0)

### Added

- Preserve leading and trailing whitespace
- More info on missing delimiter errors

## [0.2.1 - 2018-06-12](https://github.com/alonrbar/easy-template-x/tree/v0.2.1)

### Fixed

- Various bug fixes

## [0.2.0 - 2018-06-12](https://github.com/alonrbar/easy-template-x/tree/v0.2.0)

### Added

- Typings file

## [0.1.0 - 2018-06-12](https://github.com/alonrbar/easy-template-x/tree/v0.1.0)

- First version

---

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

#### [Types of changes](http://keepachangelog.com)

- **Added** for new features.
- **Changed** for changes in existing functionality.
- **Deprecated** for soon-to-be removed features.
- **Removed** for now removed features.
- **Fixed** for any bug fixes.
- **Security** in case of vulnerabilities.