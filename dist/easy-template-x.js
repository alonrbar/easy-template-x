(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("easy-template-x", [], factory);
	else if(typeof exports === 'object')
		exports["easy-template-x"] = factory();
	else
		root["easy-template-x"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/compilation/delimiterMark.ts":
/*!******************************************!*\
  !*** ./src/compilation/delimiterMark.ts ***!
  \******************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/***/ }),

/***/ "./src/compilation/delimiterSearcher.ts":
/*!**********************************************!*\
  !*** ./src/compilation/delimiterSearcher.ts ***!
  \**********************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DelimiterSearcher = void 0;

var _errors = __webpack_require__(/*! ../errors */ "./src/errors/index.ts");

var _utils = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");

var _xml = __webpack_require__(/*! ../xml */ "./src/xml/index.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class MatchState {
  constructor() {
    _defineProperty(this, "delimiterIndex", 0);

    _defineProperty(this, "openNodes", []);

    _defineProperty(this, "firstMatchIndex", -1);
  }

  reset() {
    this.delimiterIndex = 0;
    this.openNodes = [];
    this.firstMatchIndex = -1;
  }

}

class DelimiterSearcher {
  constructor(docxParser) {
    this.docxParser = docxParser;

    _defineProperty(this, "maxXmlDepth", 20);

    _defineProperty(this, "startDelimiter", "{");

    _defineProperty(this, "endDelimiter", "}");

    if (!docxParser) throw new _errors.MissingArgumentError("docxParser");
  }

  findDelimiters(node) {
    //
    // Performance note: 
    //
    // The search efficiency is o(m*n) where n is the text size and m is the
    // delimiter length. We could use a variation of the KMP algorithm here
    // to reduce it to o(m+n) but since our m is expected to be small
    // (delimiters defaults to 2 characters and even on custom inputs are
    // not expected to be much longer) it does not worth the extra
    // complexity and effort.
    //
    const delimiters = [];
    const match = new MatchState();
    const depth = new _xml.XmlDepthTracker(this.maxXmlDepth);
    let lookForOpenDelimiter = true;

    while (node) {
      // reset state on paragraph transition
      if (this.docxParser.isParagraphNode(node)) {
        match.reset();
      } // skip irrelevant nodes


      if (!this.shouldSearchNode(node)) {
        node = this.findNextNode(node, depth);
        continue;
      } // search delimiters in text nodes


      match.openNodes.push(node);
      let textIndex = 0;

      while (textIndex < node.textContent.length) {
        const delimiterPattern = lookForOpenDelimiter ? this.startDelimiter : this.endDelimiter; // char match

        const char = node.textContent[textIndex];

        if (char === delimiterPattern[match.delimiterIndex]) {
          // first match
          if (match.firstMatchIndex === -1) {
            match.firstMatchIndex = textIndex;
          } // full delimiter match


          if (match.delimiterIndex === delimiterPattern.length - 1) {
            // move all delimiters characters to the same text node
            if (match.openNodes.length > 1) {
              const firstNode = (0, _utils.first)(match.openNodes);
              const lastNode = (0, _utils.last)(match.openNodes);
              this.docxParser.joinTextNodesRange(firstNode, lastNode);
              textIndex += firstNode.textContent.length - node.textContent.length;
              node = firstNode;
            } // store delimiter


            const delimiterMark = this.createDelimiterMark(match, lookForOpenDelimiter);
            delimiters.push(delimiterMark); // update state

            lookForOpenDelimiter = !lookForOpenDelimiter;
            match.reset();

            if (textIndex < node.textContent.length - 1) {
              match.openNodes.push(node);
            }
          } else {
            match.delimiterIndex++;
          }
        } // no match
        else {
            //
            // go back to first open node
            //
            // Required for cases where the text has repeating
            // characters that are the same as a delimiter prefix.  
            // For instance:  
            // Delimiter is '{!' and template text contains the string '{{!'
            //
            if (match.firstMatchIndex !== -1) {
              node = (0, _utils.first)(match.openNodes);
              textIndex = match.firstMatchIndex;
            } // update state


            match.reset();

            if (textIndex < node.textContent.length - 1) {
              match.openNodes.push(node);
            }
          }

        textIndex++;
      }

      node = this.findNextNode(node, depth);
    }

    return delimiters;
  }

  shouldSearchNode(node) {
    if (!_xml.XmlNode.isTextNode(node)) return false;
    if (!node.textContent) return false;
    if (!node.parentNode) return false;
    if (!this.docxParser.isTextNode(node.parentNode)) return false;
    return true;
  }

  findNextNode(node, depth) {
    // children
    if (node.childNodes && node.childNodes.length) {
      depth.increment();
      return node.childNodes[0];
    } // siblings


    if (node.nextSibling) return node.nextSibling; // parent sibling

    while (node.parentNode) {
      if (node.parentNode.nextSibling) {
        depth.decrement();
        return node.parentNode.nextSibling;
      } // go up


      depth.decrement();
      node = node.parentNode;
    }

    return null;
  }

  createDelimiterMark(match, isOpenDelimiter) {
    return {
      index: match.firstMatchIndex,
      isOpen: isOpenDelimiter,
      xmlTextNode: match.openNodes[0]
    };
  }

}

exports.DelimiterSearcher = DelimiterSearcher;

/***/ }),

/***/ "./src/compilation/index.ts":
/*!**********************************!*\
  !*** ./src/compilation/index.ts ***!
  \**********************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _delimiterMark = __webpack_require__(/*! ./delimiterMark */ "./src/compilation/delimiterMark.ts");

Object.keys(_delimiterMark).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _delimiterMark[key];
    }
  });
});

var _delimiterSearcher = __webpack_require__(/*! ./delimiterSearcher */ "./src/compilation/delimiterSearcher.ts");

Object.keys(_delimiterSearcher).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _delimiterSearcher[key];
    }
  });
});

var _scopeData = __webpack_require__(/*! ./scopeData */ "./src/compilation/scopeData.ts");

Object.keys(_scopeData).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _scopeData[key];
    }
  });
});

var _tag = __webpack_require__(/*! ./tag */ "./src/compilation/tag.ts");

Object.keys(_tag).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _tag[key];
    }
  });
});

var _tagParser = __webpack_require__(/*! ./tagParser */ "./src/compilation/tagParser.ts");

Object.keys(_tagParser).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _tagParser[key];
    }
  });
});

var _templateCompiler = __webpack_require__(/*! ./templateCompiler */ "./src/compilation/templateCompiler.ts");

Object.keys(_templateCompiler).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _templateCompiler[key];
    }
  });
});

var _templateContext = __webpack_require__(/*! ./templateContext */ "./src/compilation/templateContext.ts");

Object.keys(_templateContext).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _templateContext[key];
    }
  });
});

/***/ }),

/***/ "./src/compilation/scopeData.ts":
/*!**************************************!*\
  !*** ./src/compilation/scopeData.ts ***!
  \**************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScopeData = void 0;

var _utils = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const getProp = __webpack_require__(/*! lodash.get */ "lodash.get");

class ScopeData {
  constructor(data) {
    _defineProperty(this, "path", []);

    _defineProperty(this, "allData", void 0);

    this.allData = data;
  }

  getScopeData() {
    const lastKey = (0, _utils.last)(this.path);
    let result;
    let curPath = this.path.slice();

    while (result === undefined && curPath.length) {
      const curScopePath = curPath.slice(0, curPath.length - 1);
      result = getProp(this.allData, curScopePath.concat(lastKey));
      curPath = curScopePath;
    }

    return result;
  }

}

exports.ScopeData = ScopeData;

/***/ }),

/***/ "./src/compilation/tag.ts":
/*!********************************!*\
  !*** ./src/compilation/tag.ts ***!
  \********************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TagDisposition = void 0;
let TagDisposition;
exports.TagDisposition = TagDisposition;

(function (TagDisposition) {
  TagDisposition["Open"] = "Open";
  TagDisposition["Close"] = "Close";
  TagDisposition["SelfClosed"] = "SelfClosed";
})(TagDisposition || (exports.TagDisposition = TagDisposition = {}));

/***/ }),

/***/ "./src/compilation/tagParser.ts":
/*!**************************************!*\
  !*** ./src/compilation/tagParser.ts ***!
  \**************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TagParser = void 0;

var _errors = __webpack_require__(/*! ../errors */ "./src/errors/index.ts");

var _tag = __webpack_require__(/*! ./tag */ "./src/compilation/tag.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class TagParser {
  constructor(docParser, delimiters) {
    this.docParser = docParser;
    this.delimiters = delimiters;

    _defineProperty(this, "tagRegex", void 0);

    if (!docParser) throw new _errors.MissingArgumentError("docParser");
    if (!delimiters) throw new _errors.MissingArgumentError("delimiters"); // TODO: regex escape

    this.tagRegex = new RegExp(`^[${delimiters.tagStart}](.*?)[${delimiters.tagEnd}]`, 'mi');
  }

  parse(delimiters) {
    const tags = [];
    let openedTag;
    let openedDelimiter;

    for (let i = 0; i < delimiters.length; i++) {
      const delimiter = delimiters[i]; // close before open

      if (!openedTag && !delimiter.isOpen) {
        const closeTagText = delimiter.xmlTextNode.textContent;
        throw new _errors.MissingStartDelimiterError(closeTagText);
      } // open before close


      if (openedTag && delimiter.isOpen) {
        const openTagText = openedDelimiter.xmlTextNode.textContent;
        throw new _errors.MissingCloseDelimiterError(openTagText);
      } // valid open


      if (!openedTag && delimiter.isOpen) {
        openedTag = {};
        openedDelimiter = delimiter;
      } // valid close


      if (openedTag && !delimiter.isOpen) {
        // normalize the underlying xml structure
        // (make sure the tag's node only includes the tag's text)
        this.normalizeTagNodes(openedDelimiter, delimiter, i, delimiters);
        openedTag.xmlTextNode = openedDelimiter.xmlTextNode; // extract tag info from tag's text

        this.processTag(openedTag);
        tags.push(openedTag);
        openedTag = null;
        openedDelimiter = null;
      }
    }

    return tags;
  }
  /**
   * Consolidate all tag's text into a single text node.
   * 
   * Example: 
   * 
   * Text node before: "some text {some tag} some more text" 
   * Text nodes after: [ "some text ", "{some tag}", " some more text" ]
   */


  normalizeTagNodes(openDelimiter, closeDelimiter, closeDelimiterIndex, allDelimiters) {
    let startTextNode = openDelimiter.xmlTextNode;
    let endTextNode = closeDelimiter.xmlTextNode;
    const sameNode = startTextNode === endTextNode; // trim start

    if (openDelimiter.index > 0) {
      this.docParser.splitTextNode(startTextNode, openDelimiter.index, true);

      if (sameNode) {
        closeDelimiter.index -= openDelimiter.index;
      }
    } // trim end


    if (closeDelimiter.index < endTextNode.textContent.length - 1) {
      endTextNode = this.docParser.splitTextNode(endTextNode, closeDelimiter.index + 1, true);

      if (sameNode) {
        startTextNode = endTextNode;
      }
    } // join nodes


    if (!sameNode) {
      this.docParser.joinTextNodesRange(startTextNode, endTextNode);
      endTextNode = startTextNode;
    } // update offsets of next delimiters


    for (let i = closeDelimiterIndex + 1; i < allDelimiters.length; i++) {
      let updated = false;
      const curDelimiter = allDelimiters[i];

      if (curDelimiter.xmlTextNode === openDelimiter.xmlTextNode) {
        curDelimiter.index -= openDelimiter.index;
        updated = true;
      }

      if (curDelimiter.xmlTextNode === closeDelimiter.xmlTextNode) {
        curDelimiter.index -= closeDelimiter.index + 1;
        updated = true;
      }

      if (!updated) break;
    } // update references


    openDelimiter.xmlTextNode = startTextNode;
    closeDelimiter.xmlTextNode = endTextNode;
  }

  processTag(tag) {
    tag.rawText = tag.xmlTextNode.textContent;
    const tagParts = this.tagRegex.exec(tag.rawText);
    const tagContent = (tagParts[1] || '').trim();

    if (!tagContent || !tagContent.length) {
      tag.disposition = _tag.TagDisposition.SelfClosed;
      return;
    }

    if (tagContent.startsWith(this.delimiters.containerTagOpen)) {
      tag.disposition = _tag.TagDisposition.Open;
      tag.name = tagContent.slice(this.delimiters.containerTagOpen.length).trim();
    } else if (tagContent.startsWith(this.delimiters.containerTagClose)) {
      tag.disposition = _tag.TagDisposition.Close;
      tag.name = tagContent.slice(this.delimiters.containerTagClose.length).trim();
    } else {
      tag.disposition = _tag.TagDisposition.SelfClosed;
      tag.name = tagContent;
    }
  }

}

exports.TagParser = TagParser;

/***/ }),

/***/ "./src/compilation/templateCompiler.ts":
/*!*********************************************!*\
  !*** ./src/compilation/templateCompiler.ts ***!
  \*********************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TemplateCompiler = void 0;

var _errors = __webpack_require__(/*! ../errors */ "./src/errors/index.ts");

var _plugins = __webpack_require__(/*! ../plugins */ "./src/plugins/index.ts");

var _utils = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");

var _tag = __webpack_require__(/*! ./tag */ "./src/compilation/tag.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * The TemplateCompiler works roughly the same way as a source code compiler.
 * It's main steps are:
 * 
 * 1. find delimiters (lexical analysis) :: (Document) => DelimiterMark[]
 * 2. extract tags (syntax analysis) :: (DelimiterMark[]) => Tag[]
 * 3. perform document replace (code generation) :: (Tag[], data) => Document*
 * 
 * see: https://en.wikipedia.org/wiki/Compiler
 */
class TemplateCompiler {
  constructor(delimiterSearcher, tagParser, plugins, defaultContentType, containerContentType) {
    this.delimiterSearcher = delimiterSearcher;
    this.tagParser = tagParser;
    this.defaultContentType = defaultContentType;
    this.containerContentType = containerContentType;

    _defineProperty(this, "pluginsLookup", void 0);

    this.pluginsLookup = (0, _utils.toDictionary)(plugins, p => p.contentType);
  }
  /**
   * Compiles the template and performs the required replacements using the
   * specified data.
   */


  async compile(node, data, context) {
    const tags = this.parseTags(node);
    await this.doTagReplacements(tags, data, context);
  }

  parseTags(node) {
    const delimiters = this.delimiterSearcher.findDelimiters(node);
    const tags = this.tagParser.parse(delimiters);
    return tags;
  } //
  // private methods
  //


  async doTagReplacements(tags, data, context) {
    for (let tagIndex = 0; tagIndex < tags.length; tagIndex++) {
      const tag = tags[tagIndex];
      data.path.push(tag.name);
      const contentType = this.detectContentType(tag, data);
      const plugin = this.pluginsLookup[contentType];

      if (!plugin) {
        throw new _errors.UnknownContentTypeError(contentType, tag.rawText, data.path.join('.'));
      }

      if (tag.disposition === _tag.TagDisposition.SelfClosed) {
        // replace simple tag                
        const job = plugin.simpleTagReplacements(tag, data, context);

        if ((0, _utils.isPromiseLike)(job)) {
          await job;
        }
      } else if (tag.disposition === _tag.TagDisposition.Open) {
        // get all tags between the open and close tags
        const closingTagIndex = this.findCloseTagIndex(tagIndex, tag, tags);
        const scopeTags = tags.slice(tagIndex, closingTagIndex + 1);
        tagIndex = closingTagIndex; // replace container tag

        const job = plugin.containerTagReplacements(scopeTags, data, context);

        if ((0, _utils.isPromiseLike)(job)) {
          await job;
        }
      }

      data.path.pop();
    }
  }

  detectContentType(tag, data) {
    if (tag.disposition === _tag.TagDisposition.Open || tag.disposition === _tag.TagDisposition.Close) return this.containerContentType;
    const scopeData = data.getScopeData();
    if (_plugins.PluginContent.isPluginContent(scopeData)) return scopeData._type;
    return this.defaultContentType;
  }

  findCloseTagIndex(fromIndex, openTag, tags) {
    let i = fromIndex;

    for (; i < tags.length; i++) {
      const closeTag = tags[i];

      if (closeTag.name === openTag.name && closeTag.disposition === _tag.TagDisposition.Close) {
        break;
      }
    }

    if (i === tags.length) {
      throw new _errors.UnclosedTagError(openTag.name);
    }

    return i;
  }

}

exports.TemplateCompiler = TemplateCompiler;

/***/ }),

/***/ "./src/compilation/templateContext.ts":
/*!********************************************!*\
  !*** ./src/compilation/templateContext.ts ***!
  \********************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/***/ }),

/***/ "./src/delimiters.ts":
/*!***************************!*\
  !*** ./src/delimiters.ts ***!
  \***************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Delimiters = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Delimiters {
  constructor(initial) {
    _defineProperty(this, "tagStart", "{");

    _defineProperty(this, "tagEnd", "}");

    _defineProperty(this, "containerTagOpen", "#");

    _defineProperty(this, "containerTagClose", "/");

    Object.assign(this, initial);
    this.encodeAndValidate();
    if (this.containerTagOpen === this.containerTagClose) throw new Error(`${"containerTagOpen"} can not be equal to ${"containerTagClose"}`);
  }

  encodeAndValidate() {
    const keys = ['tagStart', 'tagEnd', 'containerTagOpen', 'containerTagClose'];

    for (const key of keys) {
      const value = this[key];
      if (!value) throw new Error(`${key} can not be empty.`);
      if (value !== value.trim()) throw new Error(`${key} can not contain leading or trailing whitespace.`);
    }
  }

}

exports.Delimiters = Delimiters;

/***/ }),

/***/ "./src/errors/index.ts":
/*!*****************************!*\
  !*** ./src/errors/index.ts ***!
  \*****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _malformedFileError = __webpack_require__(/*! ./malformedFileError */ "./src/errors/malformedFileError.ts");

Object.keys(_malformedFileError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _malformedFileError[key];
    }
  });
});

var _maxXmlDepthError = __webpack_require__(/*! ./maxXmlDepthError */ "./src/errors/maxXmlDepthError.ts");

Object.keys(_maxXmlDepthError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _maxXmlDepthError[key];
    }
  });
});

var _missingArgumentError = __webpack_require__(/*! ./missingArgumentError */ "./src/errors/missingArgumentError.ts");

Object.keys(_missingArgumentError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _missingArgumentError[key];
    }
  });
});

var _missingCloseDelimiterError = __webpack_require__(/*! ./missingCloseDelimiterError */ "./src/errors/missingCloseDelimiterError.ts");

Object.keys(_missingCloseDelimiterError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _missingCloseDelimiterError[key];
    }
  });
});

var _missingStartDelimiterError = __webpack_require__(/*! ./missingStartDelimiterError */ "./src/errors/missingStartDelimiterError.ts");

Object.keys(_missingStartDelimiterError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _missingStartDelimiterError[key];
    }
  });
});

var _unclosedTagError = __webpack_require__(/*! ./unclosedTagError */ "./src/errors/unclosedTagError.ts");

Object.keys(_unclosedTagError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _unclosedTagError[key];
    }
  });
});

var _unidentifiedFileTypeError = __webpack_require__(/*! ./unidentifiedFileTypeError */ "./src/errors/unidentifiedFileTypeError.ts");

Object.keys(_unidentifiedFileTypeError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _unidentifiedFileTypeError[key];
    }
  });
});

var _unknownContentTypeError = __webpack_require__(/*! ./unknownContentTypeError */ "./src/errors/unknownContentTypeError.ts");

Object.keys(_unknownContentTypeError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _unknownContentTypeError[key];
    }
  });
});

var _unopenedTagError = __webpack_require__(/*! ./unopenedTagError */ "./src/errors/unopenedTagError.ts");

Object.keys(_unopenedTagError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _unopenedTagError[key];
    }
  });
});

var _unsupportedFileTypeError = __webpack_require__(/*! ./unsupportedFileTypeError */ "./src/errors/unsupportedFileTypeError.ts");

Object.keys(_unsupportedFileTypeError).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _unsupportedFileTypeError[key];
    }
  });
});

/***/ }),

/***/ "./src/errors/malformedFileError.ts":
/*!******************************************!*\
  !*** ./src/errors/malformedFileError.ts ***!
  \******************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MalformedFileError = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class MalformedFileError extends Error {
  constructor(expectedFileType) {
    super(`Malformed file detected. Make sure the file is a valid ${expectedFileType} file.`);

    _defineProperty(this, "expectedFileType", void 0);

    this.expectedFileType = expectedFileType; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, MalformedFileError.prototype);
  }

}

exports.MalformedFileError = MalformedFileError;

/***/ }),

/***/ "./src/errors/maxXmlDepthError.ts":
/*!****************************************!*\
  !*** ./src/errors/maxXmlDepthError.ts ***!
  \****************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MaxXmlDepthError = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class MaxXmlDepthError extends Error {
  constructor(maxDepth) {
    super(`XML maximum depth reached (max depth: ${maxDepth}).`);

    _defineProperty(this, "maxDepth", void 0);

    this.maxDepth = maxDepth; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, MaxXmlDepthError.prototype);
  }

}

exports.MaxXmlDepthError = MaxXmlDepthError;

/***/ }),

/***/ "./src/errors/missingArgumentError.ts":
/*!********************************************!*\
  !*** ./src/errors/missingArgumentError.ts ***!
  \********************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MissingArgumentError = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class MissingArgumentError extends Error {
  constructor(argName) {
    super(`Argument '${argName}' is missing.`);

    _defineProperty(this, "argName", void 0);

    this.argName = argName; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, MissingArgumentError.prototype);
  }

}

exports.MissingArgumentError = MissingArgumentError;

/***/ }),

/***/ "./src/errors/missingCloseDelimiterError.ts":
/*!**************************************************!*\
  !*** ./src/errors/missingCloseDelimiterError.ts ***!
  \**************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MissingCloseDelimiterError = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class MissingCloseDelimiterError extends Error {
  constructor(openDelimiterText) {
    super(`Close delimiter is missing from '${openDelimiterText}'.`);

    _defineProperty(this, "openDelimiterText", void 0);

    this.openDelimiterText = openDelimiterText; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, MissingCloseDelimiterError.prototype);
  }

}

exports.MissingCloseDelimiterError = MissingCloseDelimiterError;

/***/ }),

/***/ "./src/errors/missingStartDelimiterError.ts":
/*!**************************************************!*\
  !*** ./src/errors/missingStartDelimiterError.ts ***!
  \**************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MissingStartDelimiterError = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class MissingStartDelimiterError extends Error {
  constructor(closeDelimiterText) {
    super(`Open delimiter is missing from '${closeDelimiterText}'.`);

    _defineProperty(this, "closeDelimiterText", void 0);

    this.closeDelimiterText = closeDelimiterText; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, MissingStartDelimiterError.prototype);
  }

}

exports.MissingStartDelimiterError = MissingStartDelimiterError;

/***/ }),

/***/ "./src/errors/unclosedTagError.ts":
/*!****************************************!*\
  !*** ./src/errors/unclosedTagError.ts ***!
  \****************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnclosedTagError = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class UnclosedTagError extends Error {
  constructor(tagName) {
    super(`Tag '${tagName}' is never closed.`);

    _defineProperty(this, "tagName", void 0);

    this.tagName = tagName; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, UnclosedTagError.prototype);
  }

}

exports.UnclosedTagError = UnclosedTagError;

/***/ }),

/***/ "./src/errors/unidentifiedFileTypeError.ts":
/*!*************************************************!*\
  !*** ./src/errors/unidentifiedFileTypeError.ts ***!
  \*************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnidentifiedFileTypeError = void 0;

class UnidentifiedFileTypeError extends Error {
  constructor() {
    super(`The filetype for this file could not be identified, is this file corrupted?`); // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, UnidentifiedFileTypeError.prototype);
  }

}

exports.UnidentifiedFileTypeError = UnidentifiedFileTypeError;

/***/ }),

/***/ "./src/errors/unknownContentTypeError.ts":
/*!***********************************************!*\
  !*** ./src/errors/unknownContentTypeError.ts ***!
  \***********************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnknownContentTypeError = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class UnknownContentTypeError extends Error {
  constructor(contentType, tagRawText, path) {
    super(`Content type '${contentType}' does not have a registered plugin to handle it.`);

    _defineProperty(this, "tagRawText", void 0);

    _defineProperty(this, "contentType", void 0);

    _defineProperty(this, "path", void 0);

    this.contentType = contentType;
    this.tagRawText = tagRawText;
    this.path = path; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, UnknownContentTypeError.prototype);
  }

}

exports.UnknownContentTypeError = UnknownContentTypeError;

/***/ }),

/***/ "./src/errors/unopenedTagError.ts":
/*!****************************************!*\
  !*** ./src/errors/unopenedTagError.ts ***!
  \****************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnopenedTagError = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class UnopenedTagError extends Error {
  constructor(tagName) {
    super(`Tag '${tagName}' is closed but was never opened.`);

    _defineProperty(this, "tagName", void 0);

    this.tagName = tagName; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, UnopenedTagError.prototype);
  }

}

exports.UnopenedTagError = UnopenedTagError;

/***/ }),

/***/ "./src/errors/unsupportedFileTypeError.ts":
/*!************************************************!*\
  !*** ./src/errors/unsupportedFileTypeError.ts ***!
  \************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnsupportedFileTypeError = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class UnsupportedFileTypeError extends Error {
  constructor(fileType) {
    super(`Filetype "${fileType}" is not supported.`);

    _defineProperty(this, "fileType", void 0);

    this.fileType = fileType; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, UnsupportedFileTypeError.prototype);
  }

}

exports.UnsupportedFileTypeError = UnsupportedFileTypeError;

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _compilation = __webpack_require__(/*! ./compilation */ "./src/compilation/index.ts");

Object.keys(_compilation).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _compilation[key];
    }
  });
});

var _errors = __webpack_require__(/*! ./errors */ "./src/errors/index.ts");

Object.keys(_errors).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _errors[key];
    }
  });
});

var _office = __webpack_require__(/*! ./office */ "./src/office/index.ts");

Object.keys(_office).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _office[key];
    }
  });
});

var _plugins = __webpack_require__(/*! ./plugins */ "./src/plugins/index.ts");

Object.keys(_plugins).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _plugins[key];
    }
  });
});

var _utils = __webpack_require__(/*! ./utils */ "./src/utils/index.ts");

Object.keys(_utils).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _utils[key];
    }
  });
});

var _xml = __webpack_require__(/*! ./xml */ "./src/xml/index.ts");

Object.keys(_xml).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _xml[key];
    }
  });
});

var _zip = __webpack_require__(/*! ./zip */ "./src/zip/index.ts");

Object.keys(_zip).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _zip[key];
    }
  });
});

var _delimiters = __webpack_require__(/*! ./delimiters */ "./src/delimiters.ts");

Object.keys(_delimiters).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _delimiters[key];
    }
  });
});

var _mimeType = __webpack_require__(/*! ./mimeType */ "./src/mimeType.ts");

Object.keys(_mimeType).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _mimeType[key];
    }
  });
});

var _templateData = __webpack_require__(/*! ./templateData */ "./src/templateData.ts");

Object.keys(_templateData).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _templateData[key];
    }
  });
});

var _templateHandler = __webpack_require__(/*! ./templateHandler */ "./src/templateHandler.ts");

Object.keys(_templateHandler).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _templateHandler[key];
    }
  });
});

var _templateHandlerOptions = __webpack_require__(/*! ./templateHandlerOptions */ "./src/templateHandlerOptions.ts");

Object.keys(_templateHandlerOptions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _templateHandlerOptions[key];
    }
  });
});

/***/ }),

/***/ "./src/mimeType.ts":
/*!*************************!*\
  !*** ./src/mimeType.ts ***!
  \*************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MimeTypeHelper = exports.MimeType = void 0;

var _errors = __webpack_require__(/*! ./errors */ "./src/errors/index.ts");

let MimeType;
exports.MimeType = MimeType;

(function (MimeType) {
  MimeType["Png"] = "image/png";
  MimeType["Jpeg"] = "image/jpeg";
  MimeType["Gif"] = "image/gif";
  MimeType["Bmp"] = "image/bmp";
  MimeType["Svg"] = "image/svg+xml";
})(MimeType || (exports.MimeType = MimeType = {}));

class MimeTypeHelper {
  static getDefaultExtension(mime) {
    switch (mime) {
      case MimeType.Png:
        return 'png';

      case MimeType.Jpeg:
        return 'jpg';

      case MimeType.Gif:
        return 'gif';

      case MimeType.Bmp:
        return 'bmp';

      case MimeType.Svg:
        return 'svg';

      default:
        throw new _errors.UnsupportedFileTypeError(mime);
    }
  }

  static getOfficeRelType(mime) {
    switch (mime) {
      case MimeType.Png:
      case MimeType.Jpeg:
      case MimeType.Gif:
      case MimeType.Bmp:
      case MimeType.Svg:
        return "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image";

      default:
        throw new _errors.UnsupportedFileTypeError(mime);
    }
  }

}

exports.MimeTypeHelper = MimeTypeHelper;

/***/ }),

/***/ "./src/office/contentTypesFile.ts":
/*!****************************************!*\
  !*** ./src/office/contentTypesFile.ts ***!
  \****************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContentTypesFile = void 0;

var _mimeType = __webpack_require__(/*! ../mimeType */ "./src/mimeType.ts");

var _xml = __webpack_require__(/*! ../xml */ "./src/xml/index.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * http://officeopenxml.com/anatomyofOOXML.php
 */
class ContentTypesFile {
  constructor(zip, xmlParser) {
    this.zip = zip;
    this.xmlParser = xmlParser;

    _defineProperty(this, "addedNew", false);

    _defineProperty(this, "root", void 0);

    _defineProperty(this, "contentTypes", void 0);
  }

  async ensureContentType(mime) {
    // parse the content types file
    await this.parseContentTypesFile(); // already exists

    if (this.contentTypes[mime]) return; // add new

    const extension = _mimeType.MimeTypeHelper.getDefaultExtension(mime);

    const typeNode = _xml.XmlNode.createGeneralNode('Default');

    typeNode.attributes = {
      "Extension": extension,
      "ContentType": mime
    };
    this.root.childNodes.push(typeNode); // update state

    this.addedNew = true;
    this.contentTypes[mime] = true;
  }

  async count() {
    await this.parseContentTypesFile();
    return this.root.childNodes.filter(node => !_xml.XmlNode.isTextNode(node)).length;
  }
  /**
   * Save the Content Types file back to the zip.  
   * Called automatically by the holding `Docx` before exporting.
   */


  async save() {
    // not change - no need to save
    if (!this.addedNew) return;
    const xmlContent = this.xmlParser.serialize(this.root);
    this.zip.setFile(ContentTypesFile.contentTypesFilePath, xmlContent);
  }

  async parseContentTypesFile() {
    if (this.root) return; // parse the xml file

    const contentTypesXml = await this.zip.getFile(ContentTypesFile.contentTypesFilePath).getContentText();
    this.root = this.xmlParser.parse(contentTypesXml); // build the content types lookup

    this.contentTypes = {};

    for (const node of this.root.childNodes) {
      if (node.nodeName !== 'Default') continue;
      const genNode = node;
      const contentTypeAttribute = genNode.attributes['ContentType'];
      if (!contentTypeAttribute) continue;
      this.contentTypes[contentTypeAttribute];
    }
  }

}

exports.ContentTypesFile = ContentTypesFile;

_defineProperty(ContentTypesFile, "contentTypesFilePath", '[Content_Types].xml');

/***/ }),

/***/ "./src/office/docx.ts":
/*!****************************!*\
  !*** ./src/office/docx.ts ***!
  \****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Docx = void 0;

var _errors = __webpack_require__(/*! ../errors */ "./src/errors/index.ts");

var _contentTypesFile = __webpack_require__(/*! ./contentTypesFile */ "./src/office/contentTypesFile.ts");

var _mediaFiles = __webpack_require__(/*! ./mediaFiles */ "./src/office/mediaFiles.ts");

var _rels = __webpack_require__(/*! ./rels */ "./src/office/rels.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Represents a single docx file.
 */
class Docx {
  get documentPath() {
    if (!this._documentPath) {
      if (this.zip.isFileExist("word/document.xml")) {
        this._documentPath = "word/document.xml";
      } // https://github.com/open-xml-templating/docxtemplater/issues/366
      else if (this.zip.isFileExist("word/document2.xml")) {
          this._documentPath = "word/document2.xml";
        }
    }

    return this._documentPath;
  }

  constructor(zip, xmlParser) {
    this.zip = zip;
    this.xmlParser = xmlParser;

    _defineProperty(this, "rels", void 0);

    _defineProperty(this, "mediaFiles", void 0);

    _defineProperty(this, "contentTypes", void 0);

    _defineProperty(this, "_documentPath", void 0);

    _defineProperty(this, "_document", void 0);

    if (!this.documentPath) throw new _errors.MalformedFileError('docx');
    this.rels = new _rels.Rels(this.documentPath, zip, xmlParser);
    this.mediaFiles = new _mediaFiles.MediaFiles(zip);
    this.contentTypes = new _contentTypesFile.ContentTypesFile(zip, xmlParser);
  } //
  // public methods
  //

  /**
   * The xml root of the main document file.
   */


  async getDocument() {
    if (!this._document) {
      const xml = await this.zip.getFile(this.documentPath).getContentText();
      this._document = this.xmlParser.parse(xml);
    }

    return this._document;
  }
  /**
   * Get the text content of the main document file.
   */


  async getDocumentText() {
    const xmlDocument = await this.getDocument(); // ugly but good enough...

    const xml = this.xmlParser.serialize(xmlDocument);
    const domDocument = this.xmlParser.domParse(xml);
    return domDocument.documentElement.textContent;
  }

  async export(outputType) {
    await this.saveChanges();
    return await this.zip.export(outputType);
  } //
  // private methods
  //        


  async saveChanges() {
    // save main document
    const document = await this.getDocument();
    const xmlContent = this.xmlParser.serialize(document);
    this.zip.setFile(this.documentPath, xmlContent); // save other parts

    await this.rels.save();
    await this.contentTypes.save();
  }

}

exports.Docx = Docx;

/***/ }),

/***/ "./src/office/docxParser.ts":
/*!**********************************!*\
  !*** ./src/office/docxParser.ts ***!
  \**********************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DocxParser = void 0;

var _xml = __webpack_require__(/*! ../xml */ "./src/xml/index.ts");

var _docx = __webpack_require__(/*! ./docx */ "./src/office/docx.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class DocxParser {
  /*
   * Word markup intro:
   * 
   * In Word text nodes are contained in "run" nodes (which specifies text
   * properties such as font and color). The "run" nodes in turn are
   * contained in paragraph nodes which is the core unit of content.
   * 
   * Example:
   *
   * <w:p>    <-- paragraph
   *   <w:r>      <-- run
   *     <w:rPr>      <-- run properties
   *       <w:b/>     <-- bold
   *     </w:rPr>
   *     <w:t>This is text.</w:t>     <-- actual text
   *   </w:r>
   * </w:p> 
   *
   * see: http://officeopenxml.com/WPcontentOverview.php
   */
  //
  // constructor
  //
  constructor(xmlParser) {
    this.xmlParser = xmlParser;
  } //
  // parse document
  //


  load(zip) {
    return new _docx.Docx(zip, this.xmlParser);
  } //
  // content manipulation
  //

  /**
   * Split the text node into two text nodes, each with it's own wrapping <w:t> node.
   * Returns the newly created text node.
   * 
   * @param textNode 
   * @param splitIndex 
   * @param addBefore Should the new node be added before or after the original node.
   */


  splitTextNode(textNode, splitIndex, addBefore) {
    let firstXmlTextNode;
    let secondXmlTextNode; // split nodes

    const wordTextNode = this.containingTextNode(textNode);

    const newWordTextNode = _xml.XmlNode.cloneNode(wordTextNode, true); // set space preserve to prevent display differences after splitting
    // (otherwise if there was a space in the middle of the text node and it
    // is now at the beginning or end of the text node it will be ignored)


    this.setSpacePreserveAttribute(wordTextNode);
    this.setSpacePreserveAttribute(newWordTextNode);

    if (addBefore) {
      // insert new node before existing one
      _xml.XmlNode.insertBefore(newWordTextNode, wordTextNode);

      firstXmlTextNode = _xml.XmlNode.lastTextChild(newWordTextNode);
      secondXmlTextNode = textNode;
    } else {
      // insert new node after existing one
      const curIndex = wordTextNode.parentNode.childNodes.indexOf(wordTextNode);

      _xml.XmlNode.insertChild(wordTextNode.parentNode, newWordTextNode, curIndex + 1);

      firstXmlTextNode = textNode;
      secondXmlTextNode = _xml.XmlNode.lastTextChild(newWordTextNode);
    } // edit text


    const firstText = firstXmlTextNode.textContent;
    const secondText = secondXmlTextNode.textContent;
    firstXmlTextNode.textContent = firstText.substring(0, splitIndex);
    secondXmlTextNode.textContent = secondText.substring(splitIndex);
    return addBefore ? firstXmlTextNode : secondXmlTextNode;
  }
  /**
   * Move all text between the 'from' and 'to' nodes to the 'from' node.
   */


  joinTextNodesRange(from, to) {
    // find run nodes
    const firstRunNode = this.containingRunNode(from);
    const secondRunNode = this.containingRunNode(to);
    const paragraphNode = firstRunNode.parentNode;
    if (secondRunNode.parentNode !== paragraphNode) throw new Error('Can not join text nodes from separate paragraphs.'); // find "word text nodes"

    const firstWordTextNode = this.containingTextNode(from);
    const secondWordTextNode = this.containingTextNode(to);
    const totalText = []; // iterate runs

    let curRunNode = firstRunNode;

    while (curRunNode) {
      // iterate text nodes
      let curWordTextNode;

      if (curRunNode === firstRunNode) {
        curWordTextNode = firstWordTextNode;
      } else {
        curWordTextNode = this.firstTextNodeChild(curRunNode);
      }

      while (curWordTextNode) {
        if (curWordTextNode.nodeName !== DocxParser.TEXT_NODE) continue; // move text to first node

        const curXmlTextNode = _xml.XmlNode.lastTextChild(curWordTextNode);

        totalText.push(curXmlTextNode.textContent); // next text node

        const textToRemove = curWordTextNode;

        if (curWordTextNode === secondWordTextNode) {
          curWordTextNode = null;
        } else {
          curWordTextNode = curWordTextNode.nextSibling;
        } // remove current text node


        if (textToRemove !== firstWordTextNode) {
          _xml.XmlNode.remove(textToRemove);
        }
      } // next run


      const runToRemove = curRunNode;

      if (curRunNode === secondRunNode) {
        curRunNode = null;
      } else {
        curRunNode = curRunNode.nextSibling;
      } // remove current run


      if (!runToRemove.childNodes || !runToRemove.childNodes.length) {
        _xml.XmlNode.remove(runToRemove);
      }
    } // set the text content


    const firstXmlTextNode = _xml.XmlNode.lastTextChild(firstWordTextNode);

    firstXmlTextNode.textContent = totalText.join('');
  }
  /**
   * Take all runs from 'second' and move them to 'first'.
   */


  joinParagraphs(first, second) {
    if (first === second) return;
    let childIndex = 0;

    while (second.childNodes && childIndex < second.childNodes.length) {
      const curChild = second.childNodes[childIndex];

      if (curChild.nodeName === DocxParser.RUN_NODE) {
        _xml.XmlNode.removeChild(second, childIndex);

        _xml.XmlNode.appendChild(first, curChild);
      } else {
        childIndex++;
      }
    }
  }

  setSpacePreserveAttribute(node) {
    if (!node.attributes) {
      node.attributes = {};
    }

    if (!node.attributes['xml:space']) {
      node.attributes['xml:space'] = 'preserve';
    }
  } //
  // node queries
  //


  isTextNode(node) {
    return node.nodeName === DocxParser.TEXT_NODE;
  }

  isTableCellNode(node) {
    return node.nodeName === DocxParser.TABLE_CELL_NODE;
  }

  isParagraphNode(node) {
    return node.nodeName === DocxParser.PARAGRAPH_NODE;
  }

  isListParagraph(paragraphNode) {
    const paragraphProperties = this.paragraphPropertiesNode(paragraphNode);

    const listNumberProperties = _xml.XmlNode.findChildByName(paragraphProperties, DocxParser.NUMBER_PROPERTIES_NODE);

    return !!listNumberProperties;
  }

  paragraphPropertiesNode(paragraphNode) {
    if (!this.isParagraphNode(paragraphNode)) throw new Error(`Expected paragraph node but received a '${paragraphNode.nodeName}' node.`);
    return _xml.XmlNode.findChildByName(paragraphNode, DocxParser.PARAGRAPH_PROPERTIES_NODE);
  }
  /**
   * Search for the first direct child **Word** text node (i.e. a <w:t> node).
   */


  firstTextNodeChild(node) {
    if (!node) return null;
    if (node.nodeName !== DocxParser.RUN_NODE) return null;
    if (!node.childNodes) return null;

    for (const child of node.childNodes) {
      if (child.nodeName === DocxParser.TEXT_NODE) return child;
    }

    return null;
  }
  /**
   * Search **upwards** for the first **Word** text node (i.e. a <w:t> node).
   */


  containingTextNode(node) {
    if (!node) return null;
    if (!_xml.XmlNode.isTextNode(node)) throw new Error(`'Invalid argument ${"node"}. Expected a XmlTextNode.`);
    return _xml.XmlNode.findParentByName(node, DocxParser.TEXT_NODE);
  }
  /**
   * Search **upwards** for the first run node.
   */


  containingRunNode(node) {
    return _xml.XmlNode.findParentByName(node, DocxParser.RUN_NODE);
  }
  /**
   * Search **upwards** for the first paragraph node.
   */


  containingParagraphNode(node) {
    return _xml.XmlNode.findParentByName(node, DocxParser.PARAGRAPH_NODE);
  }
  /**
   * Search **upwards** for the first "table row" node.
   */


  containingTableRowNode(node) {
    return _xml.XmlNode.findParentByName(node, DocxParser.TABLE_ROW_NODE);
  }

}

exports.DocxParser = DocxParser;

_defineProperty(DocxParser, "PARAGRAPH_NODE", 'w:p');

_defineProperty(DocxParser, "PARAGRAPH_PROPERTIES_NODE", 'w:pPr');

_defineProperty(DocxParser, "RUN_NODE", 'w:r');

_defineProperty(DocxParser, "RUN_PROPERTIES_NODE", 'w:rPr');

_defineProperty(DocxParser, "TEXT_NODE", 'w:t');

_defineProperty(DocxParser, "TABLE_ROW_NODE", 'w:tr');

_defineProperty(DocxParser, "TABLE_CELL_NODE", 'w:tc');

_defineProperty(DocxParser, "NUMBER_PROPERTIES_NODE", 'w:numPr');

/***/ }),

/***/ "./src/office/index.ts":
/*!*****************************!*\
  !*** ./src/office/index.ts ***!
  \*****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _docx = __webpack_require__(/*! ./docx */ "./src/office/docx.ts");

Object.keys(_docx).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _docx[key];
    }
  });
});

var _docxParser = __webpack_require__(/*! ./docxParser */ "./src/office/docxParser.ts");

Object.keys(_docxParser).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _docxParser[key];
    }
  });
});

/***/ }),

/***/ "./src/office/mediaFiles.ts":
/*!**********************************!*\
  !*** ./src/office/mediaFiles.ts ***!
  \**********************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MediaFiles = void 0;

var _mimeType = __webpack_require__(/*! ../mimeType */ "./src/mimeType.ts");

var _utils = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Handles media files of the main document.
 */
class MediaFiles {
  constructor(zip) {
    this.zip = zip;

    _defineProperty(this, "hashes", void 0);

    _defineProperty(this, "files", new Map());

    _defineProperty(this, "nextFileId", 0);
  }
  /**
   * Returns the media file path.
   */


  async add(mediaFile, mime) {
    // check if already added
    if (this.files.has(mediaFile)) return this.files.get(mediaFile); // hash existing media files

    await this.hashMediaFiles(); // hash the new file  
    // Note: Even though hashing the base64 string may seem inefficient
    // (requires extra step in some cases) in practice it is significantly
    // faster than hashing a 'binarystring'.

    const base64 = await _utils.Binary.toBase64(mediaFile);
    const hash = (0, _utils.sha1)(base64); // check if file already exists
    // note: this can be optimized by keeping both mapping by filename as well as by hash

    let path = Object.keys(this.hashes).find(p => this.hashes[p] === hash);
    if (path) return path; // generate unique media file name

    const extension = _mimeType.MimeTypeHelper.getDefaultExtension(mime);

    do {
      this.nextFileId++;
      path = `${MediaFiles.mediaDir}/media${this.nextFileId}.${extension}`;
    } while (this.hashes[path]); // add media to zip


    await this.zip.setFile(path, mediaFile); // add media to our lookups

    this.hashes[path] = hash;
    this.files.set(mediaFile, path); // return

    return path;
  }

  async count() {
    await this.hashMediaFiles();
    return Object.keys(this.hashes).length;
  }

  async hashMediaFiles() {
    if (this.hashes) return;
    this.hashes = {};

    for (const path of this.zip.listFiles()) {
      if (!path.startsWith(MediaFiles.mediaDir)) continue;

      const filename = _utils.Path.getFilename(path);

      if (!filename) continue;
      const fileData = await this.zip.getFile(path).getContentBase64();
      const fileHash = (0, _utils.sha1)(fileData);
      this.hashes[filename] = fileHash;
    }
  }

}

exports.MediaFiles = MediaFiles;

_defineProperty(MediaFiles, "mediaDir", 'word/media');

/***/ }),

/***/ "./src/office/rels.ts":
/*!****************************!*\
  !*** ./src/office/rels.ts ***!
  \****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Rels = void 0;

var _utils = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");

var _xml = __webpack_require__(/*! ../xml */ "./src/xml/index.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Handles the relationship logic of a single docx "part".  
 * http://officeopenxml.com/anatomyofOOXML.php
 */
class Rels {
  constructor(partPath, zip, xmlParser) {
    this.zip = zip;
    this.xmlParser = xmlParser;

    _defineProperty(this, "root", void 0);

    _defineProperty(this, "relIds", void 0);

    _defineProperty(this, "relTargets", void 0);

    _defineProperty(this, "nextRelId", 0);

    _defineProperty(this, "partDir", void 0);

    _defineProperty(this, "relsFilePath", void 0);

    this.partDir = _utils.Path.getDirectory(partPath);

    const partFilename = _utils.Path.getFilename(partPath);

    this.relsFilePath = `${this.partDir}/_rels/${partFilename}.rels`;
  }
  /**
   * Returns the rel ID.
   */


  async add(relTarget, relType, additionalAttributes) {
    // if relTarget is an internal file it should be relative to the part dir
    if (relTarget.startsWith(this.partDir)) {
      relTarget = relTarget.substr(this.partDir.length + 1);
    } // parse rels file


    await this.parseRelsFile(); // already exists?

    const relTargetKey = this.getRelTargetKey(relType, relTarget);
    let relId = this.relTargets[relTargetKey];
    if (relId) return relId; // add rel node

    relId = this.getNextRelId();

    const relNode = _xml.XmlNode.createGeneralNode('Relationship');

    relNode.attributes = Object.assign({
      "Id": relId,
      "Type": relType,
      "Target": relTarget
    }, additionalAttributes);
    this.root.childNodes.push(relNode); // update lookups

    this.relIds[relId] = true;
    this.relTargets[relTargetKey] = relId; // return

    return relId;
  }
  /**
   * Save the rels file back to the zip.  
   * Called automatically by the holding `Docx` before exporting.
   */


  async save() {
    // not change - no need to save
    if (!this.root) return;
    const xmlContent = this.xmlParser.serialize(this.root);
    this.zip.setFile(this.relsFilePath, xmlContent);
  } //
  // private methods
  //


  getNextRelId() {
    let relId;
    ;

    do {
      this.nextRelId++;
      relId = 'rId' + this.nextRelId;
    } while (this.relIds[relId]);

    return relId;
  }

  async parseRelsFile() {
    if (this.root) return; // parse the xml file

    let relsXml;
    const relsFile = this.zip.getFile(this.relsFilePath);

    if (relsFile) {
      relsXml = await relsFile.getContentText();
    } else {
      relsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                      </Relationships>`;
    }

    this.root = this.xmlParser.parse(relsXml); // build lookups

    this.relIds = {};
    this.relTargets = {};

    for (const rel of this.root.childNodes) {
      const attributes = rel.attributes;
      if (!attributes) continue; // relIds lookup

      const idAttr = attributes['Id'];
      if (!idAttr) continue;
      this.relIds[idAttr] = true; // rel target lookup

      const typeAttr = attributes['Type'];
      const targetAttr = attributes['Target'];

      if (typeAttr && targetAttr) {
        const relTargetKey = this.getRelTargetKey(typeAttr, targetAttr);
        this.relTargets[relTargetKey] = idAttr;
      }
    }
  }

  getRelTargetKey(type, target) {
    return `${type} - ${target}`;
  }

}

exports.Rels = Rels;

/***/ }),

/***/ "./src/plugins/defaultPlugins.ts":
/*!***************************************!*\
  !*** ./src/plugins/defaultPlugins.ts ***!
  \***************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDefaultPlugins = createDefaultPlugins;

var _imagePlugin = __webpack_require__(/*! ./imagePlugin */ "./src/plugins/imagePlugin.ts");

var _linkPlugin = __webpack_require__(/*! ./linkPlugin */ "./src/plugins/linkPlugin.ts");

var _loopPlugin = __webpack_require__(/*! ./loopPlugin */ "./src/plugins/loopPlugin.ts");

var _rawXmlPlugin = __webpack_require__(/*! ./rawXmlPlugin */ "./src/plugins/rawXmlPlugin.ts");

var _textPlugin = __webpack_require__(/*! ./textPlugin */ "./src/plugins/textPlugin.ts");

function createDefaultPlugins() {
  return [new _loopPlugin.LoopPlugin(), new _rawXmlPlugin.RawXmlPlugin(), new _imagePlugin.ImagePlugin(), new _linkPlugin.LinkPlugin(), new _textPlugin.TextPlugin()];
}

/***/ }),

/***/ "./src/plugins/imageContent.ts":
/*!*************************************!*\
  !*** ./src/plugins/imageContent.ts ***!
  \*************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/***/ }),

/***/ "./src/plugins/imagePlugin.ts":
/*!************************************!*\
  !*** ./src/plugins/imagePlugin.ts ***!
  \************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ImagePlugin = void 0;

var _mimeType = __webpack_require__(/*! ../mimeType */ "./src/mimeType.ts");

var _xml = __webpack_require__(/*! ../xml */ "./src/xml/index.ts");

var _templatePlugin = __webpack_require__(/*! ./templatePlugin */ "./src/plugins/templatePlugin.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Apparently it is not that important for the ID to be unique...  
 * Word displays two images correctly even if they both have the same ID.
 * Further more, Word will assign each a unique ID upon saving (it assigns
 * consecutive integers starting with 1).  
 * 
 * Note: The same principal applies to image names.
 *
 * Tested in Word v1908
 */
let nextImageId = 1;

class ImagePlugin extends _templatePlugin.TemplatePlugin {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "contentType", 'image');
  }

  async simpleTagReplacements(tag, data, context) {
    const wordTextNode = this.utilities.docxParser.containingTextNode(tag.xmlTextNode);
    const content = data.getScopeData();

    if (!content || !content.source) {
      _xml.XmlNode.remove(wordTextNode);

      return;
    } // add the image file into the archive


    const mediaFilePath = await context.docx.mediaFiles.add(content.source, content.format);

    const relType = _mimeType.MimeTypeHelper.getOfficeRelType(content.format);

    const relId = await context.docx.rels.add(mediaFilePath, relType);
    await context.docx.contentTypes.ensureContentType(content.format); // create the xml markup

    const imageId = nextImageId++;
    const imageXml = this.createMarkup(imageId, relId, content.width, content.height);

    _xml.XmlNode.insertAfter(imageXml, wordTextNode);

    _xml.XmlNode.remove(wordTextNode);
  }

  createMarkup(imageId, relId, width, height) {
    // http://officeopenxml.com/drwPicInline.php
    //
    // Performance note:  
    //
    // I've tried to improve the markup generation performance by parsing
    // the string once and caching the result (and of course customizing it
    // per image) but it made no change whatsoever (in both cases 1000 items
    // loop takes around 8 seconds on my machine) so I'm sticking with this
    // approach which I find to be more readable.
    //
    const name = `Picture ${imageId}`;
    const markupText = `
            <w:drawing>
                <wp:inline distT="0" distB="0" distL="0" distR="0">
                    <wp:extent cx="${this.pixelsToEmu(width)}" cy="${this.pixelsToEmu(height)}"/>
                    <wp:effectExtent l="0" t="0" r="0" b="0"/>
                    <wp:docPr id="${imageId}" name="${name}"/>
                    <wp:cNvGraphicFramePr>
                        <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
                    </wp:cNvGraphicFramePr>
                    <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                            ${this.pictureMarkup(name, relId, width, height)}
                        </a:graphicData>
                    </a:graphic>
                </wp:inline>
            </w:drawing>
        `;
    const markupXml = this.utilities.xmlParser.parse(markupText);

    _xml.XmlNode.removeEmptyTextNodes(markupXml); // remove whitespace


    return markupXml;
  }

  pictureMarkup(name, relId, width, height) {
    // http://officeopenxml.com/drwPic.php
    // legend:
    // nvPicPr - non-visual picture properties - id, name, etc.
    // blipFill - binary large image (or) picture fill - image size, image fill, etc.
    // spPr - shape properties - frame size, frame fill, etc.
    return `
            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                    <pic:cNvPr id="0" name="${name}"/>
                    <pic:cNvPicPr>
                        <a:picLocks noChangeAspect="1" noChangeArrowheads="1"/>
                    </pic:cNvPicPr>
                </pic:nvPicPr>
                <pic:blipFill>
                    <a:blip r:embed="${relId}">
                        <a:extLst>
                            <a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}">
                                <a14:useLocalDpi xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main" val="0"/>
                            </a:ext>
                        </a:extLst>
                    </a:blip>
                    <a:srcRect/>
                    <a:stretch>
                        <a:fillRect/>
                    </a:stretch>
                </pic:blipFill>
                <pic:spPr bwMode="auto">
                    <a:xfrm>
                        <a:off x="0" y="0"/>
                        <a:ext cx="${this.pixelsToEmu(width)}" cy="${this.pixelsToEmu(height)}"/>
                    </a:xfrm>
                    <a:prstGeom prst="rect">
                        <a:avLst/>
                    </a:prstGeom>
                    <a:noFill/>
                    <a:ln>
                        <a:noFill/>
                    </a:ln>
                </pic:spPr>
            </pic:pic>
        `;
  }

  pixelsToEmu(pixels) {
    // https://stackoverflow.com/questions/20194403/openxml-distance-size-units
    // https://docs.microsoft.com/en-us/windows/win32/vml/msdn-online-vml-units#other-units-of-measurement
    // https://en.wikipedia.org/wiki/Office_Open_XML_file_formats#DrawingML
    // http://www.java2s.com/Code/CSharp/2D-Graphics/ConvertpixelstoEMUEMUtopixels.htm
    return Math.round(pixels * 9525);
  }

}

exports.ImagePlugin = ImagePlugin;

/***/ }),

/***/ "./src/plugins/index.ts":
/*!******************************!*\
  !*** ./src/plugins/index.ts ***!
  \******************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defaultPlugins = __webpack_require__(/*! ./defaultPlugins */ "./src/plugins/defaultPlugins.ts");

Object.keys(_defaultPlugins).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _defaultPlugins[key];
    }
  });
});

var _imageContent = __webpack_require__(/*! ./imageContent */ "./src/plugins/imageContent.ts");

Object.keys(_imageContent).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _imageContent[key];
    }
  });
});

var _imagePlugin = __webpack_require__(/*! ./imagePlugin */ "./src/plugins/imagePlugin.ts");

Object.keys(_imagePlugin).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _imagePlugin[key];
    }
  });
});

var _linkContent = __webpack_require__(/*! ./linkContent */ "./src/plugins/linkContent.ts");

Object.keys(_linkContent).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _linkContent[key];
    }
  });
});

var _linkPlugin = __webpack_require__(/*! ./linkPlugin */ "./src/plugins/linkPlugin.ts");

Object.keys(_linkPlugin).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _linkPlugin[key];
    }
  });
});

var _loopPlugin = __webpack_require__(/*! ./loopPlugin */ "./src/plugins/loopPlugin.ts");

Object.keys(_loopPlugin).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _loopPlugin[key];
    }
  });
});

var _pluginContent = __webpack_require__(/*! ./pluginContent */ "./src/plugins/pluginContent.ts");

Object.keys(_pluginContent).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _pluginContent[key];
    }
  });
});

var _rawXmlContent = __webpack_require__(/*! ./rawXmlContent */ "./src/plugins/rawXmlContent.ts");

Object.keys(_rawXmlContent).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _rawXmlContent[key];
    }
  });
});

var _rawXmlPlugin = __webpack_require__(/*! ./rawXmlPlugin */ "./src/plugins/rawXmlPlugin.ts");

Object.keys(_rawXmlPlugin).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _rawXmlPlugin[key];
    }
  });
});

var _templatePlugin = __webpack_require__(/*! ./templatePlugin */ "./src/plugins/templatePlugin.ts");

Object.keys(_templatePlugin).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _templatePlugin[key];
    }
  });
});

var _textPlugin = __webpack_require__(/*! ./textPlugin */ "./src/plugins/textPlugin.ts");

Object.keys(_textPlugin).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _textPlugin[key];
    }
  });
});

/***/ }),

/***/ "./src/plugins/linkContent.ts":
/*!************************************!*\
  !*** ./src/plugins/linkContent.ts ***!
  \************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/***/ }),

/***/ "./src/plugins/linkPlugin.ts":
/*!***********************************!*\
  !*** ./src/plugins/linkPlugin.ts ***!
  \***********************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LinkPlugin = void 0;

var _office = __webpack_require__(/*! ../office */ "./src/office/index.ts");

var _xml = __webpack_require__(/*! ../xml */ "./src/xml/index.ts");

var _templatePlugin = __webpack_require__(/*! ./templatePlugin */ "./src/plugins/templatePlugin.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class LinkPlugin extends _templatePlugin.TemplatePlugin {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "contentType", 'link');
  }

  async simpleTagReplacements(tag, data, context) {
    const wordTextNode = this.utilities.docxParser.containingTextNode(tag.xmlTextNode);
    const content = data.getScopeData();

    if (!content || !content.target) {
      _xml.XmlNode.remove(wordTextNode);

      return;
    } // add rel


    const linkAttributes = {
      TargetMode: 'External'
    };
    const relId = await context.docx.rels.add(content.target, LinkPlugin.linkRelType, linkAttributes); // generate markup

    const wordRunNode = this.utilities.docxParser.containingRunNode(wordTextNode);
    const linkMarkup = this.generateMarkup(content, relId, wordRunNode); // add to document

    this.insertHyperlinkNode(linkMarkup, wordRunNode, wordTextNode);
  }

  generateMarkup(content, relId, wordRunNode) {
    // http://officeopenxml.com/WPhyperlink.php
    const markupText = `
            <w:hyperlink r:id="${relId}" w:history="1">
                <w:r>
                    <w:t>${content.text || content.target}</w:t>
                </w:r>
            </w:hyperlink>
        `;
    const markupXml = this.utilities.xmlParser.parse(markupText);

    _xml.XmlNode.removeEmptyTextNodes(markupXml); // remove whitespace
    // copy props from original run node (preserve style)        


    const runProps = wordRunNode.childNodes.find(node => node.nodeName === _office.DocxParser.RUN_PROPERTIES_NODE);

    if (runProps) {
      const linkRunProps = _xml.XmlNode.cloneNode(runProps, true);

      markupXml.childNodes[0].childNodes.unshift(linkRunProps);
    }

    return markupXml;
  }

  insertHyperlinkNode(linkMarkup, tagRunNode, tagTextNode) {
    // Links are inserted at the 'run' level.  
    // Therefor we isolate the link tag to it's own run (it is already
    // isolated to it's own text node), insert the link markup and remove
    // the run.
    let textNodesInRun = tagRunNode.childNodes.filter(node => node.nodeName === _office.DocxParser.TEXT_NODE);

    if (textNodesInRun.length > 1) {
      const [runBeforeTag] = _xml.XmlNode.splitByChild(tagRunNode, tagTextNode, true);

      textNodesInRun = runBeforeTag.childNodes.filter(node => node.nodeName === _office.DocxParser.TEXT_NODE);

      _xml.XmlNode.insertAfter(linkMarkup, runBeforeTag);

      if (textNodesInRun.length === 0) {
        _xml.XmlNode.remove(runBeforeTag);
      }
    } // already isolated
    else {
        _xml.XmlNode.insertAfter(linkMarkup, tagRunNode);

        _xml.XmlNode.remove(tagRunNode);
      }
  }

}

exports.LinkPlugin = LinkPlugin;

_defineProperty(LinkPlugin, "linkRelType", 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink');

/***/ }),

/***/ "./src/plugins/loop/iLoopStrategy.ts":
/*!*******************************************!*\
  !*** ./src/plugins/loop/iLoopStrategy.ts ***!
  \*******************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/***/ }),

/***/ "./src/plugins/loop/index.ts":
/*!***********************************!*\
  !*** ./src/plugins/loop/index.ts ***!
  \***********************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _iLoopStrategy = __webpack_require__(/*! ./iLoopStrategy */ "./src/plugins/loop/iLoopStrategy.ts");

Object.keys(_iLoopStrategy).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _iLoopStrategy[key];
    }
  });
});

var _loopListStrategy = __webpack_require__(/*! ./loopListStrategy */ "./src/plugins/loop/loopListStrategy.ts");

Object.keys(_loopListStrategy).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _loopListStrategy[key];
    }
  });
});

var _loopParagraphStrategy = __webpack_require__(/*! ./loopParagraphStrategy */ "./src/plugins/loop/loopParagraphStrategy.ts");

Object.keys(_loopParagraphStrategy).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _loopParagraphStrategy[key];
    }
  });
});

var _loopTableStrategy = __webpack_require__(/*! ./loopTableStrategy */ "./src/plugins/loop/loopTableStrategy.ts");

Object.keys(_loopTableStrategy).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _loopTableStrategy[key];
    }
  });
});

/***/ }),

/***/ "./src/plugins/loop/loopListStrategy.ts":
/*!**********************************************!*\
  !*** ./src/plugins/loop/loopListStrategy.ts ***!
  \**********************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoopListStrategy = void 0;

var _xml = __webpack_require__(/*! ../../xml */ "./src/xml/index.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class LoopListStrategy {
  constructor() {
    _defineProperty(this, "utilities", void 0);
  }

  setUtilities(utilities) {
    this.utilities = utilities;
  }

  isApplicable(openTag, closeTag) {
    const containingParagraph = this.utilities.docxParser.containingParagraphNode(openTag.xmlTextNode);
    return this.utilities.docxParser.isListParagraph(containingParagraph);
  }

  splitBefore(openTag, closeTag) {
    const firstParagraph = this.utilities.docxParser.containingParagraphNode(openTag.xmlTextNode);
    const lastParagraph = this.utilities.docxParser.containingParagraphNode(closeTag.xmlTextNode);

    const paragraphsToRepeat = _xml.XmlNode.siblingsInRange(firstParagraph, lastParagraph); // remove the loop tags


    _xml.XmlNode.remove(openTag.xmlTextNode);

    _xml.XmlNode.remove(closeTag.xmlTextNode);

    return {
      firstNode: firstParagraph,
      nodesToRepeat: paragraphsToRepeat,
      lastNode: lastParagraph
    };
  }

  mergeBack(paragraphGroups, firstParagraph, lastParagraphs) {
    for (const curParagraphsGroup of paragraphGroups) {
      for (const paragraph of curParagraphsGroup) {
        _xml.XmlNode.insertBefore(paragraph, lastParagraphs);
      }
    } // remove the old paragraphs


    _xml.XmlNode.remove(firstParagraph);

    if (firstParagraph !== lastParagraphs) {
      _xml.XmlNode.remove(lastParagraphs);
    }
  }

}

exports.LoopListStrategy = LoopListStrategy;

/***/ }),

/***/ "./src/plugins/loop/loopParagraphStrategy.ts":
/*!***************************************************!*\
  !*** ./src/plugins/loop/loopParagraphStrategy.ts ***!
  \***************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoopParagraphStrategy = void 0;

var _xml = __webpack_require__(/*! ../../xml */ "./src/xml/index.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class LoopParagraphStrategy {
  constructor() {
    _defineProperty(this, "utilities", void 0);
  }

  setUtilities(utilities) {
    this.utilities = utilities;
  }

  isApplicable(openTag, closeTag) {
    return true;
  }

  splitBefore(openTag, closeTag) {
    // gather some info
    let firstParagraph = this.utilities.docxParser.containingParagraphNode(openTag.xmlTextNode);
    let lastParagraph = this.utilities.docxParser.containingParagraphNode(closeTag.xmlTextNode);
    const areSame = firstParagraph === lastParagraph;
    const parent = firstParagraph.parentNode;
    const firstParagraphIndex = parent.childNodes.indexOf(firstParagraph);
    const lastParagraphIndex = areSame ? firstParagraphIndex : parent.childNodes.indexOf(lastParagraph); // split first paragraphs

    let splitResult = _xml.XmlNode.splitByChild(firstParagraph, openTag.xmlTextNode, true);

    firstParagraph = splitResult[0];
    const firstParagraphSplit = splitResult[1];
    if (areSame) lastParagraph = firstParagraphSplit; // split last paragraph

    splitResult = _xml.XmlNode.splitByChild(lastParagraph, closeTag.xmlTextNode, true);
    const lastParagraphSplit = splitResult[0];
    lastParagraph = splitResult[1]; // fix references

    _xml.XmlNode.removeChild(parent, firstParagraphIndex + 1);

    if (!areSame) _xml.XmlNode.removeChild(parent, lastParagraphIndex);
    firstParagraphSplit.parentNode = null;
    lastParagraphSplit.parentNode = null; // extract all paragraphs in between

    let middleParagraphs;

    if (areSame) {
      this.utilities.docxParser.joinParagraphs(firstParagraphSplit, lastParagraphSplit);
      middleParagraphs = [firstParagraphSplit];
    } else {
      const inBetween = _xml.XmlNode.removeSiblings(firstParagraph, lastParagraph);

      middleParagraphs = [firstParagraphSplit].concat(inBetween).concat(lastParagraphSplit);
    }

    return {
      firstNode: firstParagraph,
      nodesToRepeat: middleParagraphs,
      lastNode: lastParagraph
    };
  }

  mergeBack(middleParagraphs, firstParagraph, lastParagraph) {
    let mergeTo = firstParagraph;

    for (const curParagraphsGroup of middleParagraphs) {
      // merge first paragraphs
      this.utilities.docxParser.joinParagraphs(mergeTo, curParagraphsGroup[0]); // add middle and last paragraphs to the original document

      for (let i = 1; i < curParagraphsGroup.length; i++) {
        _xml.XmlNode.insertBefore(curParagraphsGroup[i], lastParagraph);

        mergeTo = curParagraphsGroup[i];
      }
    } // merge last paragraph


    this.utilities.docxParser.joinParagraphs(mergeTo, lastParagraph); // remove the old last paragraph (was merged into the new one)

    _xml.XmlNode.remove(lastParagraph);
  }

}

exports.LoopParagraphStrategy = LoopParagraphStrategy;

/***/ }),

/***/ "./src/plugins/loop/loopTableStrategy.ts":
/*!***********************************************!*\
  !*** ./src/plugins/loop/loopTableStrategy.ts ***!
  \***********************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoopTableStrategy = void 0;

var _xml = __webpack_require__(/*! ../../xml */ "./src/xml/index.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class LoopTableStrategy {
  constructor() {
    _defineProperty(this, "utilities", void 0);
  }

  setUtilities(utilities) {
    this.utilities = utilities;
  }

  isApplicable(openTag, closeTag) {
    const containingParagraph = this.utilities.docxParser.containingParagraphNode(openTag.xmlTextNode);
    if (!containingParagraph.parentNode) return false;
    return this.utilities.docxParser.isTableCellNode(containingParagraph.parentNode);
  }

  splitBefore(openTag, closeTag) {
    const firstRow = this.utilities.docxParser.containingTableRowNode(openTag.xmlTextNode);
    const lastRow = this.utilities.docxParser.containingTableRowNode(closeTag.xmlTextNode);

    const rowsToRepeat = _xml.XmlNode.siblingsInRange(firstRow, lastRow); // remove the loop tags


    _xml.XmlNode.remove(openTag.xmlTextNode);

    _xml.XmlNode.remove(closeTag.xmlTextNode);

    return {
      firstNode: firstRow,
      nodesToRepeat: rowsToRepeat,
      lastNode: lastRow
    };
  }

  mergeBack(rowGroups, firstRow, lastRow) {
    for (const curRowsGroup of rowGroups) {
      for (const row of curRowsGroup) {
        _xml.XmlNode.insertBefore(row, lastRow);
      }
    } // remove the old rows


    _xml.XmlNode.remove(firstRow);

    if (firstRow !== lastRow) {
      _xml.XmlNode.remove(lastRow);
    }
  }

}

exports.LoopTableStrategy = LoopTableStrategy;

/***/ }),

/***/ "./src/plugins/loopPlugin.ts":
/*!***********************************!*\
  !*** ./src/plugins/loopPlugin.ts ***!
  \***********************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoopPlugin = exports.LOOP_CONTENT_TYPE = void 0;

var _utils = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");

var _xml = __webpack_require__(/*! ../xml */ "./src/xml/index.ts");

var _loop = __webpack_require__(/*! ./loop */ "./src/plugins/loop/index.ts");

var _templatePlugin = __webpack_require__(/*! ./templatePlugin */ "./src/plugins/templatePlugin.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const LOOP_CONTENT_TYPE = 'loop';
exports.LOOP_CONTENT_TYPE = LOOP_CONTENT_TYPE;

class LoopPlugin extends _templatePlugin.TemplatePlugin {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "contentType", LOOP_CONTENT_TYPE);

    _defineProperty(this, "loopStrategies", [new _loop.LoopTableStrategy(), new _loop.LoopListStrategy(), new _loop.LoopParagraphStrategy() // the default strategy
    ]);
  }

  setUtilities(utilities) {
    this.utilities = utilities;
    this.loopStrategies.forEach(strategy => strategy.setUtilities(utilities));
  }

  async containerTagReplacements(tags, data, context) {
    let value = data.getScopeData();
    if (!value || !Array.isArray(value) || !value.length) value = []; // vars

    const openTag = tags[0];
    const closeTag = (0, _utils.last)(tags); // select the suitable strategy

    const loopStrategy = this.loopStrategies.find(strategy => strategy.isApplicable(openTag, closeTag));
    if (!loopStrategy) throw new Error(`No loop strategy found for tag '${openTag.rawText}'.`); // prepare to loop

    const {
      firstNode,
      nodesToRepeat,
      lastNode
    } = loopStrategy.splitBefore(openTag, closeTag); // repeat (loop) the content

    const repeatedNodes = this.repeat(nodesToRepeat, value.length); // recursive compilation 
    // (this step can be optimized in the future if we'll keep track of the
    // path to each token and use that to create new tokens instead of
    // search through the text again)

    const compiledNodes = await this.compile(repeatedNodes, data, context); // merge back to the document

    loopStrategy.mergeBack(compiledNodes, firstNode, lastNode);
  }

  repeat(nodes, times) {
    if (!nodes.length || !times) return [];
    const allResults = [];

    for (let i = 0; i < times; i++) {
      const curResult = nodes.map(node => _xml.XmlNode.cloneNode(node, true));
      allResults.push(curResult);
    }

    return allResults;
  }

  async compile(nodeGroups, data, context) {
    const compiledNodeGroups = []; // compile each node group with it's relevant data

    for (let i = 0; i < nodeGroups.length; i++) {
      // create dummy root node
      const curNodes = nodeGroups[i];

      const dummyRootNode = _xml.XmlNode.createGeneralNode('dummyRootNode');

      curNodes.forEach(node => _xml.XmlNode.appendChild(dummyRootNode, node)); // compile the new root

      data.path.push(i);
      await this.utilities.compiler.compile(dummyRootNode, data, context);
      data.path.pop(); // disconnect from dummy root

      const curResult = [];

      while (dummyRootNode.childNodes && dummyRootNode.childNodes.length) {
        const child = _xml.XmlNode.removeChild(dummyRootNode, 0);

        curResult.push(child);
      }

      compiledNodeGroups.push(curResult);
    }

    return compiledNodeGroups;
  }

}

exports.LoopPlugin = LoopPlugin;

/***/ }),

/***/ "./src/plugins/pluginContent.ts":
/*!**************************************!*\
  !*** ./src/plugins/pluginContent.ts ***!
  \**************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PluginContent = void 0;
const PluginContent = {
  isPluginContent(content) {
    return !!content && typeof content._type === 'string';
  }

};
exports.PluginContent = PluginContent;

/***/ }),

/***/ "./src/plugins/rawXmlContent.ts":
/*!**************************************!*\
  !*** ./src/plugins/rawXmlContent.ts ***!
  \**************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/***/ }),

/***/ "./src/plugins/rawXmlPlugin.ts":
/*!*************************************!*\
  !*** ./src/plugins/rawXmlPlugin.ts ***!
  \*************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RawXmlPlugin = void 0;

var _xml = __webpack_require__(/*! ../xml */ "./src/xml/index.ts");

var _templatePlugin = __webpack_require__(/*! ./templatePlugin */ "./src/plugins/templatePlugin.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class RawXmlPlugin extends _templatePlugin.TemplatePlugin {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "contentType", 'rawXml');
  }

  /**
   * Replace the current <w:t> node with the specified xml markup.
   */
  simpleTagReplacements(tag, data) {
    const wordTextNode = this.utilities.docxParser.containingTextNode(tag.xmlTextNode);
    const value = data.getScopeData();

    if (value && typeof value.xml === 'string') {
      const newNode = this.utilities.xmlParser.parse(value.xml);

      _xml.XmlNode.insertBefore(newNode, wordTextNode);
    }

    _xml.XmlNode.remove(wordTextNode);
  }

}

exports.RawXmlPlugin = RawXmlPlugin;

/***/ }),

/***/ "./src/plugins/templatePlugin.ts":
/*!***************************************!*\
  !*** ./src/plugins/templatePlugin.ts ***!
  \***************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TemplatePlugin = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* eslint-disable @typescript-eslint/member-ordering */
class TemplatePlugin {
  constructor() {
    _defineProperty(this, "contentType", void 0);

    _defineProperty(this, "utilities", void 0);
  }

  /**
   * Called by the TemplateHandler at runtime.
   */
  setUtilities(utilities) {
    this.utilities = utilities;
  }
  /**
   * This method is called for each self-closing tag.
   * It should implement the specific document manipulation required by the tag.
   */


  simpleTagReplacements(tag, data, context) {} // noop

  /**
   * This method is called for each container tag. It should implement the
   * specific document manipulation required by the tag.
   *
   * @param tags All tags between the opening tag and closing tag (inclusive,
   * i.e. tags[0] is the opening tag and the last item in the tags array is
   * the closing tag).
   */


  containerTagReplacements(tags, data, context) {// noop
  }

}

exports.TemplatePlugin = TemplatePlugin;

/***/ }),

/***/ "./src/plugins/textPlugin.ts":
/*!***********************************!*\
  !*** ./src/plugins/textPlugin.ts ***!
  \***********************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextPlugin = exports.TEXT_CONTENT_TYPE = void 0;

var _office = __webpack_require__(/*! ../office */ "./src/office/index.ts");

var _xml = __webpack_require__(/*! ../xml */ "./src/xml/index.ts");

var _templatePlugin = __webpack_require__(/*! ./templatePlugin */ "./src/plugins/templatePlugin.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const TEXT_CONTENT_TYPE = 'text';
exports.TEXT_CONTENT_TYPE = TEXT_CONTENT_TYPE;

class TextPlugin extends _templatePlugin.TemplatePlugin {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "contentType", TEXT_CONTENT_TYPE);
  }

  /**
   * Replace the node text content with the specified value.
   */
  simpleTagReplacements(tag, data) {
    const value = data.getScopeData();
    const stringValue = value === null || value === undefined ? '' : value.toString();
    const lines = stringValue.split('\n');

    if (lines.length < 2) {
      this.replaceSingleLine(tag.xmlTextNode, lines.length ? lines[0] : '');
    } else {
      this.replaceMultiLine(tag.xmlTextNode, lines);
    }
  }

  replaceSingleLine(textNode, text) {
    // set text
    textNode.textContent = text; // make sure leading and trailing whitespace are preserved

    const wordTextNode = this.utilities.docxParser.containingTextNode(textNode);
    this.utilities.docxParser.setSpacePreserveAttribute(wordTextNode);
  }

  replaceMultiLine(textNode, lines) {
    const runNode = this.utilities.docxParser.containingRunNode(textNode); // first line

    textNode.textContent = lines[0]; // other lines

    for (let i = 1; i < lines.length; i++) {
      // add line break
      const lineBreak = this.getLineBreak();

      _xml.XmlNode.appendChild(runNode, lineBreak); // add text


      const lineNode = this.createWordTextNode(lines[i]);

      _xml.XmlNode.appendChild(runNode, lineNode);
    }
  }

  getLineBreak() {
    return _xml.XmlNode.createGeneralNode('w:br');
  }

  createWordTextNode(text) {
    const wordTextNode = _xml.XmlNode.createGeneralNode(_office.DocxParser.TEXT_NODE);

    wordTextNode.attributes = {};
    this.utilities.docxParser.setSpacePreserveAttribute(wordTextNode);
    wordTextNode.childNodes = [_xml.XmlNode.createTextNode(text)];
    return wordTextNode;
  }

}

exports.TextPlugin = TextPlugin;

/***/ }),

/***/ "./src/templateData.ts":
/*!*****************************!*\
  !*** ./src/templateData.ts ***!
  \*****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/***/ }),

/***/ "./src/templateHandler.ts":
/*!********************************!*\
  !*** ./src/templateHandler.ts ***!
  \********************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TemplateHandler = void 0;

var _compilation = __webpack_require__(/*! ./compilation */ "./src/compilation/index.ts");

var _errors = __webpack_require__(/*! ./errors */ "./src/errors/index.ts");

var _office = __webpack_require__(/*! ./office */ "./src/office/index.ts");

var _templateHandlerOptions = __webpack_require__(/*! ./templateHandlerOptions */ "./src/templateHandlerOptions.ts");

var _utils = __webpack_require__(/*! ./utils */ "./src/utils/index.ts");

var _xml = __webpack_require__(/*! ./xml */ "./src/xml/index.ts");

var _zip = __webpack_require__(/*! ./zip */ "./src/zip/index.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class TemplateHandler {
  /**
   * Version number of the `easy-template-x` library.
   */
  constructor(options) {
    _defineProperty(this, "version", typeof _utils.EASY_VERSION !== 'undefined' ? _utils.EASY_VERSION : 'null');

    _defineProperty(this, "xmlParser", new _xml.XmlParser());

    _defineProperty(this, "docxParser", void 0);

    _defineProperty(this, "compiler", void 0);

    _defineProperty(this, "options", void 0);

    this.options = new _templateHandlerOptions.TemplateHandlerOptions(options); //
    // this is the library's composition root
    //

    this.docxParser = new _office.DocxParser(this.xmlParser);
    const delimiterSearcher = new _compilation.DelimiterSearcher(this.docxParser);
    delimiterSearcher.startDelimiter = this.options.delimiters.tagStart;
    delimiterSearcher.endDelimiter = this.options.delimiters.tagEnd;
    delimiterSearcher.maxXmlDepth = this.options.maxXmlDepth;
    const tagParser = new _compilation.TagParser(this.docxParser, this.options.delimiters);
    this.compiler = new _compilation.TemplateCompiler(delimiterSearcher, tagParser, this.options.plugins, this.options.defaultContentType, this.options.containerContentType);
    this.options.plugins.forEach(plugin => {
      plugin.setUtilities({
        xmlParser: this.xmlParser,
        docxParser: this.docxParser,
        compiler: this.compiler
      });
    });
  }

  async process(templateFile, data) {
    // load the docx file
    const docx = await this.loadDocx(templateFile);
    const document = await docx.getDocument(); // process content (do replacements)        

    const scopeData = new _compilation.ScopeData(data);
    const context = {
      docx
    };
    await this.compiler.compile(document, scopeData, context); // export the result

    return docx.export(templateFile.constructor);
  }

  async parseTags(templateFile) {
    const docx = await this.loadDocx(templateFile);
    const document = await docx.getDocument();
    return this.compiler.parseTags(document);
  }
  /**
   * Get the text content of the main document file.
   */


  async getText(docxFile) {
    const docx = await this.loadDocx(docxFile);
    const text = await docx.getDocumentText();
    return text;
  }
  /**
   * Get the xml tree of the main document file.
   */


  async getXml(docxFile) {
    const docx = await this.loadDocx(docxFile);
    const document = await docx.getDocument();
    return document;
  } //
  // private methods
  //


  async loadDocx(file) {
    // load the zip file
    let zip;

    try {
      zip = await _zip.Zip.load(file);
    } catch (_unused) {
      throw new _errors.MalformedFileError('docx');
    } // load the docx file


    const docx = this.docxParser.load(zip);
    return docx;
  }

}

exports.TemplateHandler = TemplateHandler;

/***/ }),

/***/ "./src/templateHandlerOptions.ts":
/*!***************************************!*\
  !*** ./src/templateHandlerOptions.ts ***!
  \***************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TemplateHandlerOptions = void 0;

var _delimiters = __webpack_require__(/*! ./delimiters */ "./src/delimiters.ts");

var _plugins = __webpack_require__(/*! ./plugins */ "./src/plugins/index.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class TemplateHandlerOptions {
  constructor(initial) {
    _defineProperty(this, "plugins", (0, _plugins.createDefaultPlugins)());

    _defineProperty(this, "defaultContentType", _plugins.TEXT_CONTENT_TYPE);

    _defineProperty(this, "containerContentType", _plugins.LOOP_CONTENT_TYPE);

    _defineProperty(this, "delimiters", new _delimiters.Delimiters());

    _defineProperty(this, "maxXmlDepth", 20);

    Object.assign(this, initial);

    if (initial) {
      this.delimiters = new _delimiters.Delimiters(initial.delimiters);
    }

    if (!this.plugins.length) {
      throw new Error('Plugins list can not be empty');
    }
  }

}

exports.TemplateHandlerOptions = TemplateHandlerOptions;

/***/ }),

/***/ "./src/utils/array.ts":
/*!****************************!*\
  !*** ./src/utils/array.ts ***!
  \****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pushMany = pushMany;
exports.first = first;
exports.last = last;
exports.toDictionary = toDictionary;

function pushMany(destArray, items) {
  Array.prototype.push.apply(destArray, items);
}

function first(array) {
  if (!array.length) return undefined;
  return array[0];
}

function last(array) {
  if (!array.length) return undefined;
  return array[array.length - 1];
}

function toDictionary(array, keySelector, valueSelector) {
  if (!array.length) return {};
  const res = {};
  array.forEach((item, index) => {
    const key = keySelector(item, index);
    const value = valueSelector ? valueSelector(item, index) : item;
    if (res[key]) throw new Error(`Key '${key}' already exists in the dictionary.`);
    res[key] = value;
  });
  return res;
}

;

/***/ }),

/***/ "./src/utils/base64.ts":
/*!*****************************!*\
  !*** ./src/utils/base64.ts ***!
  \*****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Base64 = void 0;

class Base64 {
  static encode(str) {
    // browser
    if (typeof btoa !== 'undefined') return btoa(str); // node
    // https://stackoverflow.com/questions/23097928/node-js-btoa-is-not-defined-error#38446960

    return new Buffer(str, 'binary').toString('base64');
  }

}

exports.Base64 = Base64;

/***/ }),

/***/ "./src/utils/binary.ts":
/*!*****************************!*\
  !*** ./src/utils/binary.ts ***!
  \*****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Binary = void 0;

var _base = __webpack_require__(/*! ./base64 */ "./src/utils/base64.ts");

var _types = __webpack_require__(/*! ./types */ "./src/utils/types.ts");

const Binary = {
  //
  // type detection
  //
  isBlob(binary) {
    return this.isBlobConstructor(binary.constructor);
  },

  isArrayBuffer(binary) {
    return this.isArrayBufferConstructor(binary.constructor);
  },

  isBuffer(binary) {
    return this.isBufferConstructor(binary.constructor);
  },

  isBlobConstructor(binaryType) {
    return typeof Blob !== 'undefined' && (0, _types.inheritsFrom)(binaryType, Blob);
  },

  isArrayBufferConstructor(binaryType) {
    return typeof ArrayBuffer !== 'undefined' && (0, _types.inheritsFrom)(binaryType, ArrayBuffer);
  },

  isBufferConstructor(binaryType) {
    return typeof Buffer !== 'undefined' && (0, _types.inheritsFrom)(binaryType, Buffer);
  },

  //
  // utilities
  //
  toBase64(binary) {
    if (this.isBlob(binary)) {
      return new Promise(resolve => {
        const fileReader = new FileReader();

        fileReader.onload = function () {
          const base64 = _base.Base64.encode(this.result);

          resolve(base64);
        };

        fileReader.readAsBinaryString(binary);
      });
    }

    if (this.isBuffer(binary)) {
      return Promise.resolve(binary.toString('base64'));
    }

    if (this.isArrayBuffer(binary)) {
      // https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string#42334410
      const binaryStr = new Uint8Array(binary).reduce((str, byte) => str + String.fromCharCode(byte), '');

      const base64 = _base.Base64.encode(binaryStr);

      return Promise.resolve(base64);
    }

    throw new Error(`Binary type '${binary.constructor.name}' is not supported.`);
  }

};
exports.Binary = Binary;

/***/ }),

/***/ "./src/utils/index.ts":
/*!****************************!*\
  !*** ./src/utils/index.ts ***!
  \****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _array = __webpack_require__(/*! ./array */ "./src/utils/array.ts");

Object.keys(_array).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _array[key];
    }
  });
});

var _base = __webpack_require__(/*! ./base64 */ "./src/utils/base64.ts");

Object.keys(_base).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _base[key];
    }
  });
});

var _binary = __webpack_require__(/*! ./binary */ "./src/utils/binary.ts");

Object.keys(_binary).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _binary[key];
    }
  });
});

var _path = __webpack_require__(/*! ./path */ "./src/utils/path.ts");

Object.keys(_path).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _path[key];
    }
  });
});

var _sha = __webpack_require__(/*! ./sha1 */ "./src/utils/sha1.ts");

Object.keys(_sha).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _sha[key];
    }
  });
});

var _types = __webpack_require__(/*! ./types */ "./src/utils/types.ts");

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});

var _misc = __webpack_require__(/*! ./misc */ "./src/utils/misc.ts");

Object.keys(_misc).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _misc[key];
    }
  });
});

/***/ }),

/***/ "./src/utils/misc.ts":
/*!***************************!*\
  !*** ./src/utils/misc.ts ***!
  \***************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EASY_VERSION = void 0;

/**
 * Version number of the `easy-template-x` library.
 */
const EASY_VERSION = null; // eslint-disable-line

exports.EASY_VERSION = EASY_VERSION;

/***/ }),

/***/ "./src/utils/path.ts":
/*!***************************!*\
  !*** ./src/utils/path.ts ***!
  \***************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Path = void 0;

class Path {
  static getFilename(path) {
    const lastSlashIndex = path.lastIndexOf('/');
    return path.substr(lastSlashIndex + 1);
  }

  static getDirectory(path) {
    const lastSlashIndex = path.lastIndexOf('/');
    return path.substring(0, lastSlashIndex);
  }

}

exports.Path = Path;

/***/ }),

/***/ "./src/utils/sha1.ts":
/*!***************************!*\
  !*** ./src/utils/sha1.ts ***!
  \***************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sha1 = sha1;

/**
 * Secure Hash Algorithm (SHA1)
 * 
 * Taken from here: http://www.webtoolkit.info/javascript-sha1.html
 * 
 * Recommended here: https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript#6122732
 */
function sha1(msg) {
  msg = utf8Encode(msg);
  const msgLength = msg.length;
  let i, j;
  const wordArray = [];

  for (i = 0; i < msgLength - 3; i += 4) {
    j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 | msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
    wordArray.push(j);
  }

  switch (msgLength % 4) {
    case 0:
      i = 0x080000000;
      break;

    case 1:
      i = msg.charCodeAt(msgLength - 1) << 24 | 0x0800000;
      break;

    case 2:
      i = msg.charCodeAt(msgLength - 2) << 24 | msg.charCodeAt(msgLength - 1) << 16 | 0x08000;
      break;

    case 3:
      i = msg.charCodeAt(msgLength - 3) << 24 | msg.charCodeAt(msgLength - 2) << 16 | msg.charCodeAt(msgLength - 1) << 8 | 0x80;
      break;
  }

  wordArray.push(i);

  while (wordArray.length % 16 != 14) {
    wordArray.push(0);
  }

  wordArray.push(msgLength >>> 29);
  wordArray.push(msgLength << 3 & 0x0ffffffff);
  const w = new Array(80);
  let H0 = 0x67452301;
  let H1 = 0xEFCDAB89;
  let H2 = 0x98BADCFE;
  let H3 = 0x10325476;
  let H4 = 0xC3D2E1F0;
  let A, B, C, D, E;
  let temp;

  for (let blockStart = 0; blockStart < wordArray.length; blockStart += 16) {
    for (i = 0; i < 16; i++) {
      w[i] = wordArray[blockStart + i];
    }

    for (i = 16; i <= 79; i++) {
      w[i] = rotateLeft(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
    }

    A = H0;
    B = H1;
    C = H2;
    D = H3;
    E = H4;

    for (i = 0; i <= 19; i++) {
      temp = rotateLeft(A, 5) + (B & C | ~B & D) + E + w[i] + 0x5A827999 & 0x0ffffffff;
      E = D;
      D = C;
      C = rotateLeft(B, 30);
      B = A;
      A = temp;
    }

    for (i = 20; i <= 39; i++) {
      temp = rotateLeft(A, 5) + (B ^ C ^ D) + E + w[i] + 0x6ED9EBA1 & 0x0ffffffff;
      E = D;
      D = C;
      C = rotateLeft(B, 30);
      B = A;
      A = temp;
    }

    for (i = 40; i <= 59; i++) {
      temp = rotateLeft(A, 5) + (B & C | B & D | C & D) + E + w[i] + 0x8F1BBCDC & 0x0ffffffff;
      E = D;
      D = C;
      C = rotateLeft(B, 30);
      B = A;
      A = temp;
    }

    for (i = 60; i <= 79; i++) {
      temp = rotateLeft(A, 5) + (B ^ C ^ D) + E + w[i] + 0xCA62C1D6 & 0x0ffffffff;
      E = D;
      D = C;
      C = rotateLeft(B, 30);
      B = A;
      A = temp;
    }

    H0 = H0 + A & 0x0ffffffff;
    H1 = H1 + B & 0x0ffffffff;
    H2 = H2 + C & 0x0ffffffff;
    H3 = H3 + D & 0x0ffffffff;
    H4 = H4 + E & 0x0ffffffff;
  }

  temp = cvtHex(H0) + cvtHex(H1) + cvtHex(H2) + cvtHex(H3) + cvtHex(H4);
  return temp.toLowerCase();
}

function rotateLeft(n, s) {
  const t4 = n << s | n >>> 32 - s;
  return t4;
}

function cvtHex(val) {
  let str = "";

  for (let i = 7; i >= 0; i--) {
    const v = val >>> i * 4 & 0x0f;
    str += v.toString(16);
  }

  return str;
}

function utf8Encode(str) {
  str = str.replace(/\r\n/g, "\n");
  let utfStr = "";

  for (let n = 0; n < str.length; n++) {
    const c = str.charCodeAt(n);

    if (c < 128) {
      utfStr += String.fromCharCode(c);
    } else if (c > 127 && c < 2048) {
      utfStr += String.fromCharCode(c >> 6 | 192);
      utfStr += String.fromCharCode(c & 63 | 128);
    } else {
      utfStr += String.fromCharCode(c >> 12 | 224);
      utfStr += String.fromCharCode(c >> 6 & 63 | 128);
      utfStr += String.fromCharCode(c & 63 | 128);
    }
  }

  return utfStr;
}

/***/ }),

/***/ "./src/utils/types.ts":
/*!****************************!*\
  !*** ./src/utils/types.ts ***!
  \****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inheritsFrom = inheritsFrom;
exports.isPromiseLike = isPromiseLike;

function inheritsFrom(derived, base) {
  // https://stackoverflow.com/questions/14486110/how-to-check-if-a-javascript-class-inherits-another-without-creating-an-obj
  return derived === base || derived.prototype instanceof base;
}

function isPromiseLike(candidate) {
  return !!candidate && typeof candidate === 'object' && typeof candidate.then === 'function';
}

/***/ }),

/***/ "./src/xml/index.ts":
/*!**************************!*\
  !*** ./src/xml/index.ts ***!
  \**************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _xmlDepthTracker = __webpack_require__(/*! ./xmlDepthTracker */ "./src/xml/xmlDepthTracker.ts");

Object.keys(_xmlDepthTracker).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _xmlDepthTracker[key];
    }
  });
});

var _xmlNode = __webpack_require__(/*! ./xmlNode */ "./src/xml/xmlNode.ts");

Object.keys(_xmlNode).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _xmlNode[key];
    }
  });
});

var _xmlParser = __webpack_require__(/*! ./xmlParser */ "./src/xml/xmlParser.ts");

Object.keys(_xmlParser).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _xmlParser[key];
    }
  });
});

/***/ }),

/***/ "./src/xml/xmlDepthTracker.ts":
/*!************************************!*\
  !*** ./src/xml/xmlDepthTracker.ts ***!
  \************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.XmlDepthTracker = void 0;

var _errors = __webpack_require__(/*! ../errors */ "./src/errors/index.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class XmlDepthTracker {
  constructor(maxDepth) {
    this.maxDepth = maxDepth;

    _defineProperty(this, "depth", 0);
  }

  increment() {
    this.depth++;

    if (this.depth > this.maxDepth) {
      throw new _errors.MaxXmlDepthError(this.maxDepth);
    }
  }

  decrement() {
    this.depth--;
  }

}

exports.XmlDepthTracker = XmlDepthTracker;

/***/ }),

/***/ "./src/xml/xmlNode.ts":
/*!****************************!*\
  !*** ./src/xml/xmlNode.ts ***!
  \****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.XmlNode = exports.TEXT_NODE_NAME = exports.XmlNodeType = void 0;

var _errors = __webpack_require__(/*! ../errors */ "./src/errors/index.ts");

var _utils = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");

let XmlNodeType;
exports.XmlNodeType = XmlNodeType;

(function (XmlNodeType) {
  XmlNodeType["Text"] = "Text";
  XmlNodeType["General"] = "General";
})(XmlNodeType || (exports.XmlNodeType = XmlNodeType = {}));

const TEXT_NODE_NAME = '#text'; // see: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName

exports.TEXT_NODE_NAME = TEXT_NODE_NAME;
const XmlNode = {
  //
  // factories
  //
  createTextNode(text) {
    return {
      nodeType: XmlNodeType.Text,
      nodeName: TEXT_NODE_NAME,
      textContent: text
    };
  },

  createGeneralNode(name) {
    return {
      nodeType: XmlNodeType.General,
      nodeName: name
    };
  },

  //
  // serialization
  //

  /**
   * Encode string to make it safe to use inside xml tags.
   * 
   * https://stackoverflow.com/questions/7918868/how-to-escape-xml-entities-in-javascript
   */
  encodeValue(str) {
    if (str === null || str === undefined) throw new _errors.MissingArgumentError("str");
    if (typeof str !== 'string') throw new TypeError(`Expected a string, got '${str.constructor.name}'.`);
    return str.replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<':
          return '&lt;';

        case '>':
          return '&gt;';

        case '&':
          return '&amp;';

        case '\'':
          return '&apos;';

        case '"':
          return '&quot;';
      }

      return '';
    });
  },

  serialize(node) {
    if (this.isTextNode(node)) return this.encodeValue(node.textContent || ''); // attributes

    let attributes = '';

    if (node.attributes) {
      const attributeNames = Object.keys(node.attributes);

      if (attributeNames.length) {
        attributes = ' ' + attributeNames.map(name => `${name}="${node.attributes[name]}"`).join(' ');
      }
    } // open tag


    const hasChildren = (node.childNodes || []).length > 0;
    const suffix = hasChildren ? '' : '/';
    const openTag = `<${node.nodeName}${attributes}${suffix}>`;
    let xml;

    if (hasChildren) {
      // child nodes
      const childrenXml = node.childNodes.map(child => this.serialize(child)).join(''); // close tag

      const closeTag = `</${node.nodeName}>`;
      xml = openTag + childrenXml + closeTag;
    } else {
      xml = openTag;
    }

    return xml;
  },

  /**
   * The conversion is always deep.
   */
  fromDomNode(domNode) {
    let xmlNode; // basic properties

    if (domNode.nodeType === domNode.TEXT_NODE) {
      xmlNode = this.createTextNode(domNode.textContent);
    } else {
      xmlNode = this.createGeneralNode(domNode.nodeName); // attributes

      if (domNode.nodeType === domNode.ELEMENT_NODE) {
        const attributes = domNode.attributes;

        if (attributes) {
          xmlNode.attributes = {};

          for (let i = 0; i < attributes.length; i++) {
            const curAttribute = attributes.item(i);
            xmlNode.attributes[curAttribute.name] = curAttribute.value;
          }
        }
      }
    } // children


    if (domNode.childNodes) {
      xmlNode.childNodes = [];
      let prevChild;

      for (let i = 0; i < domNode.childNodes.length; i++) {
        // clone child
        const domChild = domNode.childNodes.item(i);
        const curChild = this.fromDomNode(domChild); // set references                

        xmlNode.childNodes.push(curChild);
        curChild.parentNode = xmlNode;

        if (prevChild) {
          prevChild.nextSibling = curChild;
        }

        prevChild = curChild;
      }
    }

    return xmlNode;
  },

  //
  // core functions
  //
  isTextNode(node) {
    if (node.nodeType === XmlNodeType.Text || node.nodeName === TEXT_NODE_NAME) {
      if (!(node.nodeType === XmlNodeType.Text && node.nodeName === TEXT_NODE_NAME)) {
        throw new Error(`Invalid text node. Type: '${node.nodeType}', Name: '${node.nodeName}'.`);
      }

      return true;
    }

    return false;
  },

  cloneNode(node, deep) {
    if (!node) throw new _errors.MissingArgumentError("node");

    if (!deep) {
      const clone = Object.assign({}, node);
      clone.parentNode = null;
      clone.childNodes = node.childNodes ? [] : null;
      clone.nextSibling = null;
      return clone;
    } else {
      const clone = cloneNodeDeep(node);
      clone.parentNode = null;
      return clone;
    }
  },

  /**
   * Insert the node as a new sibling, before the original node.
   *
   * * **Note**: It is more efficient to use the insertChild function if you
   *   already know the relevant index.
   */
  insertBefore(newNode, referenceNode) {
    if (!newNode) throw new _errors.MissingArgumentError("newNode");
    if (!referenceNode) throw new _errors.MissingArgumentError("referenceNode");
    if (!referenceNode.parentNode) throw new Error(`'${"referenceNode"}' has no parent`);
    const childNodes = referenceNode.parentNode.childNodes;
    const beforeNodeIndex = childNodes.indexOf(referenceNode);
    XmlNode.insertChild(referenceNode.parentNode, newNode, beforeNodeIndex);
  },

  /**
   * Insert the node as a new sibling, after the original node.
   *
   * * **Note**: It is more efficient to use the insertChild function if you
   *   already know the relevant index.
   */
  insertAfter(newNode, referenceNode) {
    if (!newNode) throw new _errors.MissingArgumentError("newNode");
    if (!referenceNode) throw new _errors.MissingArgumentError("referenceNode");
    if (!referenceNode.parentNode) throw new Error(`'${"referenceNode"}' has no parent`);
    const childNodes = referenceNode.parentNode.childNodes;
    const referenceNodeIndex = childNodes.indexOf(referenceNode);
    XmlNode.insertChild(referenceNode.parentNode, newNode, referenceNodeIndex + 1);
  },

  insertChild(parent, child, childIndex) {
    if (!parent) throw new _errors.MissingArgumentError("parent");
    if (XmlNode.isTextNode(parent)) throw new Error('Appending children to text nodes is forbidden');
    if (!child) throw new _errors.MissingArgumentError("child");
    if (!parent.childNodes) parent.childNodes = []; // revert to append

    if (childIndex === parent.childNodes.length) {
      XmlNode.appendChild(parent, child);
      return;
    }

    if (childIndex > parent.childNodes.length) throw new RangeError(`Child index ${childIndex} is out of range. Parent has only ${parent.childNodes.length} child nodes.`); // update references

    child.parentNode = parent;
    const childAfter = parent.childNodes[childIndex];
    child.nextSibling = childAfter;

    if (childIndex > 0) {
      const childBefore = parent.childNodes[childIndex - 1];
      childBefore.nextSibling = child;
    } // append


    parent.childNodes.splice(childIndex, 0, child);
  },

  appendChild(parent, child) {
    if (!parent) throw new _errors.MissingArgumentError("parent");
    if (XmlNode.isTextNode(parent)) throw new Error('Appending children to text nodes is forbidden');
    if (!child) throw new _errors.MissingArgumentError("child");
    if (!parent.childNodes) parent.childNodes = []; // update references

    if (parent.childNodes.length) {
      const currentLastChild = parent.childNodes[parent.childNodes.length - 1];
      currentLastChild.nextSibling = child;
    }

    child.nextSibling = null;
    child.parentNode = parent; // append

    parent.childNodes.push(child);
  },

  /**
   * Removes the node from it's parent.
   * 
   * * **Note**: It is more efficient to call removeChild(parent, childIndex).
   */
  remove(node) {
    if (!node) throw new _errors.MissingArgumentError("node");
    if (!node.parentNode) throw new Error('Node has no parent');
    removeChild(node.parentNode, node);
  },

  removeChild,

  //
  // utility functions
  //    

  /**
   * Gets the last direct child text node if it exists. Otherwise creates a
   * new text node, appends it to 'node' and return the newly created text
   * node.
   *
   * The function also makes sure the returned text node has a valid string
   * value.
   */
  lastTextChild(node) {
    if (XmlNode.isTextNode(node)) {
      return node;
    } // existing text nodes


    if (node.childNodes) {
      const allTextNodes = node.childNodes.filter(child => XmlNode.isTextNode(child));

      if (allTextNodes.length) {
        const lastTextNode = (0, _utils.last)(allTextNodes);
        if (!lastTextNode.textContent) lastTextNode.textContent = '';
        return lastTextNode;
      }
    } // create new text node


    const newTextNode = {
      nodeType: XmlNodeType.Text,
      nodeName: TEXT_NODE_NAME,
      textContent: ''
    };
    XmlNode.appendChild(node, newTextNode);
    return newTextNode;
  },

  /**
   * Remove sibling nodes between 'from' and 'to' excluding both.
   * Return the removed nodes.
   */
  removeSiblings(from, to) {
    if (from === to) return [];
    const removed = [];
    let lastRemoved;
    from = from.nextSibling;

    while (from !== to) {
      const removeMe = from;
      from = from.nextSibling;
      XmlNode.remove(removeMe);
      removed.push(removeMe);
      if (lastRemoved) lastRemoved.nextSibling = removeMe;
      lastRemoved = removeMe;
    }

    return removed;
  },

  /**
   * Split the original node into two sibling nodes.
   * Returns both nodes.
   *
   * @param root The node to split
   * @param markerNode The node that marks the split position.      
   */
  splitByChild(root, markerNode, removeMarkerNode) {
    // find the split path
    const path = getDescendantPath(root, markerNode); // split

    const split = XmlNode.cloneNode(root, false);
    const childIndex = path[0] + 1;

    while (childIndex < root.childNodes.length) {
      const curChild = root.childNodes[childIndex];
      XmlNode.remove(curChild);
      XmlNode.appendChild(split, curChild);
    }

    if (root.parentNode) {
      XmlNode.insertAfter(split, root);
    } // remove marker node


    if (removeMarkerNode && root.childNodes.length) {
      XmlNode.removeChild(root, root.childNodes.length - 1);
    }

    return [root, split];
  },

  findParent(node, predicate) {
    if (!node) return null;

    while (node.parentNode) {
      if (predicate(node)) return node;
      node = node.parentNode;
    }

    return null;
  },

  findParentByName(node, nodeName) {
    return XmlNode.findParent(node, n => n.nodeName === nodeName);
  },

  findChildByName(node, childName) {
    if (!node) return null;
    return (node.childNodes || []).find(child => child.nodeName === childName);
  },

  /**
   * Returns all siblings between 'firstNode' and 'lastNode' inclusive.
   */
  siblingsInRange(firstNode, lastNode) {
    if (!firstNode) throw new _errors.MissingArgumentError("firstNode");
    if (!lastNode) throw new _errors.MissingArgumentError("lastNode");
    const range = [];
    let curNode = firstNode;

    while (curNode && curNode !== lastNode) {
      range.push(curNode);
      curNode = curNode.nextSibling;
    }

    if (!curNode) throw new Error('Nodes are not siblings.');
    range.push(lastNode);
    return range;
  },

  /**
   * Recursively removes text nodes leaving only "general nodes".
   */
  removeEmptyTextNodes(node) {
    recursiveRemoveEmptyTextNodes(node);
  }

}; //
// overloaded functions
//

/**
 * Remove a child node from it's parent. Returns the removed child.
 * 
 * * **Note:** Prefer calling with explicit index.
 */

exports.XmlNode = XmlNode;

function removeChild(parent, childOrIndex) {
  if (!parent) throw new _errors.MissingArgumentError("parent");
  if (childOrIndex === null || childOrIndex === undefined) throw new _errors.MissingArgumentError("childOrIndex");
  if (!parent.childNodes || !parent.childNodes.length) throw new Error('Parent node has node children'); // get child index

  let childIndex;

  if (typeof childOrIndex === 'number') {
    childIndex = childOrIndex;
  } else {
    childIndex = parent.childNodes.indexOf(childOrIndex);
    if (childIndex === -1) throw new Error('Specified child node is not a child of the specified parent');
  }

  if (childIndex >= parent.childNodes.length) throw new RangeError(`Child index ${childIndex} is out of range. Parent has only ${parent.childNodes.length} child nodes.`); // update references

  const child = parent.childNodes[childIndex];

  if (childIndex > 0) {
    const beforeChild = parent.childNodes[childIndex - 1];
    beforeChild.nextSibling = child.nextSibling;
  }

  child.parentNode = null;
  child.nextSibling = null; // remove and return

  return parent.childNodes.splice(childIndex, 1)[0];
} //
// private functions
//


function cloneNodeDeep(original) {
  const clone = {}; // basic properties

  clone.nodeType = original.nodeType;
  clone.nodeName = original.nodeName;

  if (XmlNode.isTextNode(original)) {
    clone.textContent = original.textContent;
  } else {
    const attributes = original.attributes;

    if (attributes) {
      clone.attributes = Object.assign({}, attributes);
    }
  } // children


  if (original.childNodes) {
    clone.childNodes = [];
    let prevChildClone;

    for (const child of original.childNodes) {
      // clone child
      const childClone = cloneNodeDeep(child); // set references                

      clone.childNodes.push(childClone);
      childClone.parentNode = clone;

      if (prevChildClone) {
        prevChildClone.nextSibling = childClone;
      }

      prevChildClone = childClone;
    }
  }

  return clone;
}

function getDescendantPath(root, descendant) {
  const path = [];
  let node = descendant;

  while (node !== root) {
    const parent = node.parentNode;
    if (!parent) throw new Error(`Argument ${"descendant"} is not a descendant of ${"root"}`);
    const curChildIndex = parent.childNodes.indexOf(node);
    path.push(curChildIndex);
    node = parent;
  }

  return path.reverse();
}

function recursiveRemoveEmptyTextNodes(node) {
  if (!node.childNodes) return node;
  const oldChildren = node.childNodes;
  node.childNodes = [];

  for (const child of oldChildren) {
    if (XmlNode.isTextNode(child)) {
      // https://stackoverflow.com/questions/1921688/filtering-whitespace-only-strings-in-javascript#1921694
      if (child.textContent && child.textContent.match(/\S/)) {
        node.childNodes.push(child);
      }

      continue;
    }

    const strippedChild = recursiveRemoveEmptyTextNodes(child);
    node.childNodes.push(strippedChild);
  }

  return node;
}

/***/ }),

/***/ "./src/xml/xmlParser.ts":
/*!******************************!*\
  !*** ./src/xml/xmlParser.ts ***!
  \******************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.XmlParser = void 0;

var xmldom = __webpack_require__(/*! xmldom */ "xmldom");

var _errors = __webpack_require__(/*! ../errors */ "./src/errors/index.ts");

var _xmlNode = __webpack_require__(/*! ./xmlNode */ "./src/xml/xmlNode.ts");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class XmlParser {
  /**
   * We always use the DOMParser from 'xmldom', even in the browser since it
   * handles xml namespaces more forgivingly (required mainly by the
   * RawXmlPlugin).
   */
  parse(str) {
    const doc = this.domParse(str);
    return _xmlNode.XmlNode.fromDomNode(doc.documentElement);
  }

  domParse(str) {
    if (str === null || str === undefined) throw new _errors.MissingArgumentError("str");
    return XmlParser.parser.parseFromString(str, "text/xml");
  }

  serialize(xmlNode) {
    return XmlParser.xmlHeader + _xmlNode.XmlNode.serialize(xmlNode);
  }

}

exports.XmlParser = XmlParser;

_defineProperty(XmlParser, "xmlHeader", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>');

_defineProperty(XmlParser, "parser", new xmldom.DOMParser());

/***/ }),

/***/ "./src/zip/index.ts":
/*!**************************!*\
  !*** ./src/zip/index.ts ***!
  \**************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _zip = __webpack_require__(/*! ./zip */ "./src/zip/zip.ts");

Object.keys(_zip).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _zip[key];
    }
  });
});

var _zipObject = __webpack_require__(/*! ./zipObject */ "./src/zip/zipObject.ts");

Object.keys(_zipObject).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _zipObject[key];
    }
  });
});

/***/ }),

/***/ "./src/zip/jsZipHelper.ts":
/*!********************************!*\
  !*** ./src/zip/jsZipHelper.ts ***!
  \********************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsZipHelper = void 0;

var _errors = __webpack_require__(/*! ../errors */ "./src/errors/index.ts");

var _utils = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");

class JsZipHelper {
  static toJsZipOutputType(binaryOrType) {
    if (!binaryOrType) throw new _errors.MissingArgumentError("binaryOrType");
    let binaryType;

    if (typeof binaryOrType === 'function') {
      binaryType = binaryOrType;
    } else {
      binaryType = binaryOrType.constructor;
    }

    if (_utils.Binary.isBlobConstructor(binaryType)) return 'blob';
    if (_utils.Binary.isArrayBufferConstructor(binaryType)) return 'arraybuffer';
    if (_utils.Binary.isBufferConstructor(binaryType)) return 'nodebuffer';
    throw new Error(`Binary type '${binaryType.name}' is not supported.`);
  }

}

exports.JsZipHelper = JsZipHelper;

/***/ }),

/***/ "./src/zip/zip.ts":
/*!************************!*\
  !*** ./src/zip/zip.ts ***!
  \************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Zip = void 0;

var JSZip = __webpack_require__(/*! jszip */ "jszip");

var _jsZipHelper = __webpack_require__(/*! ./jsZipHelper */ "./src/zip/jsZipHelper.ts");

var _zipObject = __webpack_require__(/*! ./zipObject */ "./src/zip/zipObject.ts");

class Zip {
  static async load(file) {
    const zip = await JSZip.loadAsync(file);
    return new Zip(zip);
  }

  constructor(zip) {
    this.zip = zip;
  }

  getFile(path) {
    return new _zipObject.ZipObject(this.zip.files[path]);
  }

  setFile(path, content) {
    this.zip.file(path, content);
  }

  isFileExist(path) {
    return !!this.zip.files[path];
  }

  listFiles() {
    return Object.keys(this.zip.files);
  }

  async export(outputType) {
    const zipOutputType = _jsZipHelper.JsZipHelper.toJsZipOutputType(outputType);

    const output = await this.zip.generateAsync({
      type: zipOutputType,
      compression: "DEFLATE",
      compressionOptions: {
        level: 6 // between 1 (best speed) and 9 (best compression)

      }
    });
    return output;
  }

}

exports.Zip = Zip;

/***/ }),

/***/ "./src/zip/zipObject.ts":
/*!******************************!*\
  !*** ./src/zip/zipObject.ts ***!
  \******************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ZipObject = void 0;

var _jsZipHelper = __webpack_require__(/*! ./jsZipHelper */ "./src/zip/jsZipHelper.ts");

class ZipObject {
  get name() {
    return this.zipObject.name;
  }

  set name(value) {
    this.zipObject.name = value;
  }

  get isDirectory() {
    return this.zipObject.dir;
  }

  constructor(zipObject) {
    this.zipObject = zipObject;
  }

  getContentText() {
    return this.zipObject.async('text');
  }

  getContentBase64() {
    return this.zipObject.async('binarystring');
  }

  getContentBinary(outputType) {
    const zipOutputType = _jsZipHelper.JsZipHelper.toJsZipOutputType(outputType);

    return this.zipObject.async(zipOutputType);
  }

}

exports.ZipObject = ZipObject;

/***/ }),

/***/ 0:
/*!****************************!*\
  !*** multi ./src/index.ts ***!
  \****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/ache/easy-template-x/src/index.ts */"./src/index.ts");


/***/ }),

/***/ "jszip":
/*!************************!*\
  !*** external "jszip" ***!
  \************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

module.exports = require("jszip");

/***/ }),

/***/ "lodash.get":
/*!*****************************!*\
  !*** external "lodash.get" ***!
  \*****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

module.exports = require("lodash.get");

/***/ }),

/***/ "xmldom":
/*!*************************!*\
  !*** external "xmldom" ***!
  \*************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

module.exports = require("xmldom");

/***/ })

/******/ });
});
//# sourceMappingURL=easy-template-x.js.map