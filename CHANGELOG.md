# Changelog

## [7.0.3 - 2025-12-14](https://github.com/alonrbar/easy-template-x/tree/v7.0.3)

### Fixed

- Throw an informative error when a loop tag is found inside a content control.

## [7.0.2 - 2025-10-25](https://github.com/alonrbar/easy-template-x/tree/v7.0.2)

### Changed

- Improved error message for misplaced image tags.

## [7.0.1 - 2025-09-15](https://github.com/alonrbar/easy-template-x/tree/v7.0.1)

### Fixed

- Fix typings.

## [7.0.0 - 2025-09-15](https://github.com/alonrbar/easy-template-x/tree/v7.0.0)

### Added

- Image placeholders support ([#137](https://github.com/alonrbar/easy-template-x/issues/137)).

### Changed

- **BREAKING** - The `Tag` interface has been changed. There now two types of tags: `TextNodeTag` and `AttributeTag`. This may affect users calling the `TemplateHandler.parseTags` method (see the [tag file](https://github.com/alonrbar/easy-template-x/blob/v7.0.0/src/compilation/tag.ts) for details).
- `MalformedFileError` error is thrown from additional places and the error messages were changed to be more informative.

## [6.2.3 - 2025-09-13](https://github.com/alonrbar/easy-template-x/tree/v6.2.3)

### Fixed

- Fix handling absolute rels target paths ([#145](https://github.com/alonrbar/easy-template-x/pull/145)).

## [6.2.2 - 2025-08-31](https://github.com/alonrbar/easy-template-x/tree/v6.2.2)

### Fixed

- Fix inserting images over multiple `process` calls ([#142](https://github.com/alonrbar/easy-template-x/issues/142)).
- Improved previous fix for inserting images into a document with other existing images.

## [6.2.1 - 2025-05-03](https://github.com/alonrbar/easy-template-x/tree/v6.2.1)

### Fixed

- Fix inserting images into a document with other existing images (used to create
  invalid documents in some cases).

## [6.2.0 - 2025-04-03](https://github.com/alonrbar/easy-template-x/tree/v6.2.0)

### Added

- Support iterating rows that include merged cells ([#48](https://github.com/alonrbar/easy-template-x/issues/48) and [#87](https://github.com/alonrbar/easy-template-x/issues/87)).
- Throw an informative `TemplateSyntaxError` when trying to repeat rows across tables (either adjacent or nested).

## [6.1.1 - 2025-03-29](https://github.com/alonrbar/easy-template-x/tree/v6.1.1)

### Fixed

- Fix preserving chart series style.
- Fix chart series accent color handling.

## [6.1.0 - 2025-03-25](https://github.com/alonrbar/easy-template-x/tree/v6.1.0)

### Added

- Improved error handling by adding differentiation between internal and user
  errors with new root error types: `InternalError`, `TemplateSyntaxError` and
  `TemplateDataError` (while the package may still throw errors of other types
  this change should simplify error handling).
- Better input validation for chart plugin (throws `TemplateDataError` with an
  informative message on invalid input).

## [6.0.1 - 2025-03-23](https://github.com/alonrbar/easy-template-x/tree/v6.0.1)

### Fixed

- Table column loop when table has custom styles.

## [6.0.0 - 2025-03-20](https://github.com/alonrbar/easy-template-x/tree/v6.0.0)

## Added

- Chart plugin ([#69](https://github.com/alonrbar/easy-template-x/issues/69)).

### Changed

- **BREAKING** - Changes to the plugin utilities. See [this
  commit](https://github.com/alonrbar/easy-template-x/commit/1d0fb0b5e64503bbb5105819f70edcfe2eba9fdd)
  for a demonstration of the changes. This change should not effect you if you
  do not develop or use third-party plugins.
- **BREAKING** - There have been some changes to the `TemplateHandler.parseTags`, `TemplateHandler.getText`
  and `TemplateHandler.getXml` method signatures. See the changes to
  TemplateHandler in [this
  commit](https://github.com/alonrbar/easy-template-x/commit/9fe1e3d9bb81c76cb55f6c10d476af16e4cc8a40)
  for details.

### Fixed

- Fixed handling some cases of empty tag values.

## [5.1.0 - 2025-03-16](https://github.com/alonrbar/easy-template-x/tree/v5.1.0)

## Added

- **BREAKING** - Table columns loop support
  ([#41](https://github.com/alonrbar/easy-template-x/issues/41)).  

  This change makes loops that are wrapping a single column (i.e. loop tags in
  the same column but different rows) to behave like a column loop, instead of
  row loop as it was until now. If it breaks a template of yours, it can be
  resolved by either changing the placement of the opening and closing tags or
  using the `loopOver` option with a `column` value.

## [5.0.1 - 2025-01-31](https://github.com/alonrbar/easy-template-x/tree/v5.0.1)

## Added

- Link to https://templatedocs.io.

## [5.0.0 - 2025-01-28](https://github.com/alonrbar/easy-template-x/tree/v5.0.0)

### Fixed

- **BREAKING** - Fix list conditions
  ([#123](https://github.com/alonrbar/easy-template-x/issues/123)).

  It may break some templates that are using loops in lists but are sometimes
  passing empty values (e.g. null or undefined) to hide the list completely. In
  these cases they should pass an empty array instead, to make sure the list is
  removed and not just its content.

## [4.1.8 - 2025-01-28](https://github.com/alonrbar/easy-template-x/tree/v4.1.8)

### Fixed

- Throw MissingCloseDelimiterError when tag is split between paragraphs ([#126](https://github.com/alonrbar/easy-template-x/issues/126)).

## [4.1.7 - 2025-01-27](https://github.com/alonrbar/easy-template-x/tree/v4.1.7)

### Fixed

- Fix processing of header and footer referenced in the middle of the document ([#127](https://github.com/alonrbar/easy-template-x/issues/127)).

## [4.1.6 - 2025-01-26](https://github.com/alonrbar/easy-template-x/tree/v4.1.6)

### Fixed

- Fix `parseTags` error when the content part does not exist.

## [4.1.5 - 2025-01-26](https://github.com/alonrbar/easy-template-x/tree/v4.1.5)

### Fixed

- Fix not publishing the release bundle (dist).

## [4.1.4 - 2025-01-26](https://github.com/alonrbar/easy-template-x/tree/v4.1.4)

### Changed

- **BREAKING** - Use `Object.freeze` instead of TypeScript enums for constants.
  It can break TypeScript typings in some cases. See [this commit](https://github.com/alonrbar/easy-template-x/commit/fdd67af4605c03bb2a11dab33fe00ce8ba699a88) for examples on how to fix it.

### Fixed

- Parsing of rels target paths in some uncommon cases.

## [4.1.3 - 2024-12-05](https://github.com/alonrbar/easy-template-x/tree/v4.1.3)

### Fixed

- Fix "Module not found: Default condition should be last one" error.

## [4.1.2 - 2024-12-05](https://github.com/alonrbar/easy-template-x/tree/v4.1.2)

### Fixed

- Re-fix importing the package without a bundler ([#120](https://github.com/alonrbar/easy-template-x/issues/120)).

## [4.1.1 - 2024-08-12](https://github.com/alonrbar/easy-template-x/tree/v4.1.1)

### Fixed

- Fix importing the package without a bundler ([#120](https://github.com/alonrbar/easy-template-x/issues/120)).

## [4.1.0 - 2024-07-17](https://github.com/alonrbar/easy-template-x/tree/v4.1.0)

### Added

- Image transparency support ([#109](https://github.com/alonrbar/easy-template-x/issues/109)).

## [4.0.0 - 2024-07-07](https://github.com/alonrbar/easy-template-x/tree/v4.0.0)

This version introduces the notion of "tag options". These options are controlled through the template and are useful for situations where we want to allow the template author to use the same data in different ways. For instance, if we have a collection in the data and we want to allow the template author to use this collection inside a table to either produce _multiple rows_ **or** in order to expand the collection inside a _single table cell_. In this case, the template author will be able to specify either `{# my collection [loopOver: "row"]}` or `{# my collection [loopOver: "content"]}` to control the resulting outcome.

### Added

- **BREAKING** - Introduce "tag options" syntax: `{tag name [options]}`. E.g. `{# Students [loopOver: "rows"]}`.
  - This may break existing templates that use brackets as part of their tag names.
  - If you still need to use brackets in the tag name (for instance if you are using an  [advanced syntax](https://github.com/alonrbar/easy-template-x?tab=readme-ov-file#advanced-syntax-and-custom-resolvers) and access an array element by index), you can change the tag options delimiters through the [TemplateHandler options](https://github.com/alonrbar/easy-template-x?tab=readme-ov-file#template-handler-options) (e.g. use `[[ options ]]` instead of `[ options ]`).
- `loopOver` tag option, to control loop behavior in tables, as explained above.

### Changed

- **BREAKING** - A loop inside a single table cell is assumed to be a paragraph loop, not a table loop (will repeat content, not rows; should fix [#50](https://github.com/alonrbar/easy-template-x/issues/50), [#52](https://github.com/alonrbar/easy-template-x/issues/52), [#56](https://github.com/alonrbar/easy-template-x/issues/56), [#85](https://github.com/alonrbar/easy-template-x/issues/85), [#92](https://github.com/alonrbar/easy-template-x/issues/92) and [#110](https://github.com/alonrbar/easy-template-x/issues/110)). The default behavior can be overridden by using the new `loopOver` option.

## [3.2.1 - 2024-05-25](https://github.com/alonrbar/easy-template-x/tree/v3.2.1)

### Fixed

- Properly handle XML comments in template doc ([#113](https://github.com/alonrbar/easy-template-x/pull/113)).

## [3.2.0 - 2023-05-27](https://github.com/alonrbar/easy-template-x/tree/v3.2.0)

### Added

- Link tooltip support ([#91](https://github.com/alonrbar/easy-template-x/pull/91)).

## [3.1.0 - 2023-04-01](https://github.com/alonrbar/easy-template-x/tree/v3.1.0)

### Added

- Image alt text support ([#86](https://github.com/alonrbar/easy-template-x/pull/86)).

### Changed

- Update dependencies (xmldom).

## [3.0.4 - 2022-12-12](https://github.com/alonrbar/easy-template-x/tree/v3.0.4)

### Fixed

- Encode attribute values ([#62](https://github.com/alonrbar/easy-template-x/issues/62)).

## [3.0.3 - 2022-12-12](https://github.com/alonrbar/easy-template-x/tree/v3.0.3)

### Changed

- Update dependencies (jszip, xmldom) ([#73](https://github.com/alonrbar/easy-template-x/issues/73)).

## [3.0.2 - 2022-08-20](https://github.com/alonrbar/easy-template-x/tree/v3.0.2)

### Added

- Add documentation for the `parseTags` method ([here](https://github.com/alonrbar/easy-template-x#listing-tags)) ([#65](https://github.com/alonrbar/easy-template-x/issues/65)).

## [3.0.1 - 2022-08-20](https://github.com/alonrbar/easy-template-x/tree/v3.0.1)

### Fixed

- Use ESM import for `lodash.get` so the package can be used with modern bundlers ([#66](https://github.com/alonrbar/easy-template-x/issues/66)).

## [3.0.0 - 2022-07-04](https://github.com/alonrbar/easy-template-x/tree/v3.0.0)

### Added

- **BREAKING** - Add support for nesting tags, loops and other conditions inside simple conditions ([#49](https://github.com/alonrbar/easy-template-x/issues/49)). This requires changing the way some values are look up in the input data. Please see the readme file for details ([here](https://github.com/alonrbar/easy-template-x#nested-conditions)).

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
- Bug in paragraph loops ([#36](https://github.com/alonrbar/easy-template-x/issues/36)).

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

- Extensions API ([#24](https://github.com/alonrbar/easy-template-x/issues/24)).

## [0.8.3 - 2019-12-27](https://github.com/alonrbar/easy-template-x/tree/v0.8.3)

### Added

- Allow overriding container tag logic using explicit content type.

## [0.8.2 - 2019-11-30](https://github.com/alonrbar/easy-template-x/tree/v0.8.2)

### Changed

- `ScopeData.getScopeData` is now generic ([#17](https://github.com/alonrbar/easy-template-x/issues/17)).
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

**[Types of changes:](http://keepachangelog.com)**

- **Added** for new features.
- **Changed** for changes in existing functionality.
- **Deprecated** for soon-to-be removed features.
- **Removed** for now removed features.
- **Fixed** for any bug fixes.
- **Security** in case of vulnerabilities.
