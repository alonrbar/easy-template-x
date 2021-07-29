# Change Log

## [2.1.0 - 2021-07-29](https://github.com/alonrbar/easy-template-x/tree/v2.1.0)

### Added

- Add skipEmptyTag option ([#45](https://github.com/alonrbar/easy-template-x/issues/45)).

## [2.0.0 - 2021-03-19](https://github.com/alonrbar/easy-template-x/tree/v2.0.0)

### Added

- Support for simple conditions ([docs](https://github.com/alonrbar/easy-template-x#conditions)).
- Support for custom data resolvers - enables advanced syntax support ([docs](https://github.com/alonrbar/easy-template-x#advanced-syntax-and-custom-resolvers)).

### Changed

- **BREAKING** - Container closing tag name is ignored and no longer throws when
  the closing tag has different name than the opening one ([docs](https://github.com/alonrbar/easy-template-x#loop-plugin)).

## [1.0.1 - 2020-09-25](https://github.com/alonrbar/easy-template-x/tree/v1.0.1)

### Changed

- Update dependencies (jszip, xmldom).

## [1.0.0 - 2020-08-09](https://github.com/alonrbar/easy-template-x/tree/v1.0.0)

**Stable release** - from now on breaking changes to the public API (the public
interface of `TemplateHandler`) will introduce a new major release.

### Fixed

- Initial content types parsing.
- Bug in paragraph loops (#36).

## [0.12.0 - 2020-08-01](https://github.com/alonrbar/easy-template-x/tree/v0.12.0)

### Added

- Headers and footers support.

## [0.11.1 - 2020-03-29](https://github.com/alonrbar/easy-template-x/tree/v0.11.1)

### Fixed

- Consistent handling of `RawXmlContent` when the `xml` prop is null.

## [0.11.0 - 2020-03-29](https://github.com/alonrbar/easy-template-x/tree/v0.11.0)

### Added

- Support for `RawXmlContent.replaceParagraph`.

## [0.10.4 - 2020-03-02](https://github.com/alonrbar/easy-template-x/tree/v0.10.4)

### Added

- Expose "Community Extensions" on npm (readme changes).

## [0.10.3 - 2020-02-16](https://github.com/alonrbar/easy-template-x/tree/v0.10.3)

### Fixed

- Parsing of tags with custom delimiters.

## [0.10.2 - 2020-02-16](https://github.com/alonrbar/easy-template-x/tree/v0.10.2)

### Fixed

- Parsing of tags with custom delimiters.

## [0.10.1 - 2020-02-12](https://github.com/alonrbar/easy-template-x/tree/v0.10.1)

### Fixed

- Export extensions types.

## [0.10.0 - 2020-02-10](https://github.com/alonrbar/easy-template-x/tree/v0.10.0)

### Added

- Expose `Docx.rawZipFile` property.

## [0.9.0 - 2020-02-10](https://github.com/alonrbar/easy-template-x/tree/v0.9.0)

### Added

- Extensions API (#24).

## [0.8.3 - 2019-12-27](https://github.com/alonrbar/easy-template-x/tree/v0.8.3)

### Added

- Allow overriding container tag logic using explicit content type.

## [0.8.2 - 2019-11-30](https://github.com/alonrbar/easy-template-x/tree/v0.8.2)

### Changed

- `ScopeData.getScopeData` is now generic (#17).
- The `data` argument of `TemplateHandler.process` is now strongly typed.
- Bundle with Rollup instead of Webpack.
- Auto generate typings.

## [0.8.1 - 2019-11-02](https://github.com/alonrbar/easy-template-x/tree/v0.8.1)

### Fixed

- Fix typings.

## [0.8.0 - 2019-10-20](https://github.com/alonrbar/easy-template-x/tree/v0.8.0)

### Changed

- **BREAKING**: Delimiters can not contain leading or trailing whitespace.
- Loosen up `TemplateHandlerOptions` typings.

### Fixed

- Loop tag names trimming.
- Custom loop delimiters support.
- Zip export and typings.

## [0.7.3 - 2019-10-11](https://github.com/alonrbar/easy-template-x/tree/v0.7.3)

### Added

- Link to [live demo](https://codesandbox.io/s/easy-template-x-demo-x4ppu?fontsize=14&module=%2Findex.ts) on CodeSandbox.

## [0.7.2 - 2019-10-10](https://github.com/alonrbar/easy-template-x/tree/v0.7.2)

### Fixed

- Re-fix "Binary type 'Buffer' is not supported" on Node.

## [0.7.1 - 2019-10-03](https://github.com/alonrbar/easy-template-x/tree/v0.7.1)

### Fixed

- Link plugin in cases where the link tag is not the only node in it's run.

## [0.7.0 - 2019-10-02](https://github.com/alonrbar/easy-template-x/tree/v0.7.0)

### Added

- Link plugin.
- `TemplateHandler.version` property.

## [0.6.0 - 2019-09-29](https://github.com/alonrbar/easy-template-x/tree/v0.6.0)

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

- Image plugin.
- Support multi-character delimiters.
- Template plugins can be async.
- Improved the docs (readme).

### Changed

- **BREAKING**: `RawXmlPlugin` requires data of the form `{ _type: 'rawXml', xml: string }`.

### Removed

- **BREAKING**: Remove the `Tag.type` property.

### Fixed

- Parsing error in some cases where multiple tags are declared in the same run.

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
