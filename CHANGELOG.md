# Change Log

## [Unreleased](https://github.com/alonrbar/react-tablize/tree/develop)

This version removes the notion of a "tag type" and uses instead the notion of "content type". Instead of inferring the type from the tag _prefix_ the type is now explicitly declared in the supplied JSON _data_.

**Example:**

_Before:_

```text
tag: "{@newPage}"  
data: {  
    newPage: "<w:br w:type="page"/>"
}
```

_After:_

```text
tag: "{newPage}"
data: {
    newPage: {
        _type: "rawXml",
        xml: "<w:br w:type="page"/>"
    }
}
```

The only exceptions are the "loop" content type which still uses the "#" opening prefix and "/" closing prefix, and the "text" content type which is the default and does not requires explicitly stating it.

### Added

- Template plugins can be async.

### Changed

- **BREAKING**: `RawXmlPlugin` requires data of the form `{ _type: 'rawXml', xml: string }`.
- **BREAKING** `TemplateCompiler.compile` returns a promise.

### Removed

- **BREAKING**: Remove the `Tag.type` property.

## [0.5.2 - 2019-09-11](https://github.com/alonrbar/easy-template-x/tree/v0.5.2)

### Fixed

- "Binary type 'Buffer' is not supported." on Node 12.

## [0.5.1 - 2019-06-05](https://github.com/alonrbar/easy-template-x/tree/v0.5.1)

### Fixed

- Handle non-textual values (numbers, booleans...) in TextPlugin.

## [0.5.0 - 2019-05-07](https://github.com/alonrbar/easy-template-x/tree/v0.5.0)

### Added

- Loop over lists and table rows.  
  **Notice**:
    The loop logic for tables is a bit different than the logic of the existing
    paragraph loop. Instead of repeating the content in between the opening and
    closing tags it repeats entire rows (including content in the row that
    appears before the opening or after the closing tag). The same goes for
    lists - the entire bullet is repeated.
- Throw MalformedFileError when fails to open template file as zip.
- Continuous integration with CircleCI.

### Changed

- Change dev stack to Babel, Jest and ESLint.

## [0.4.0 - 2018-12-13](https://github.com/alonrbar/easy-template-x/tree/v0.4.0)

### Added

- Easily find out what tags are present in a given template (TemplateHandler.parseTags).

## [0.3.4 - 2018-12-09](https://github.com/alonrbar/easy-template-x/tree/v0.3.4)

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