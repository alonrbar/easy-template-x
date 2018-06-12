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

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./src/index.ts":
/*!***********************************!*\
  !*** ./src/index.ts + 33 modules ***!
  \***********************************/
/*! exports provided: Delimiters, DocxParser, TemplateHandler, TemplateHandlerOptions, Binary, XmlNodeType, TEXT_NODE_NAME_VALUE, XmlNode, XmlParser, DelimiterMark, DelimiterSearcher, ScopeData, TagDisposition, Tag, TagParser, TemplateCompiler, MaxXmlDepthError, MissingArgumentError, MissingCloseDelimiterError, MissingStartDelimiterError, UnclosedTagError, UnidentifiedFileTypeError, UnknownPrefixError, UnopenedTagError, UnsupportedFileTypeError, createDefaultPlugins, LoopPlugin, RawXmlPlugin, TemplatePlugin, TextPlugin */
/*! ModuleConcatenation bailout: Cannot concat with ./src/utils/platform.ts (<- Module uses injected variables (process)) */
/*! ModuleConcatenation bailout: Cannot concat with external "jszip" (<- Module is not an ECMAScript module) */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// CONCATENATED MODULE: ./src/compilation/delimiterMark.ts
var DelimiterMark = (function () {
    function DelimiterMark(initial) {
        Object.assign(this, initial);
    }
    return DelimiterMark;
}());


// CONCATENATED MODULE: ./src/errors/maxXmlDepthError.ts
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MaxXmlDepthError = (function (_super) {
    __extends(MaxXmlDepthError, _super);
    function MaxXmlDepthError(maxDepth) {
        var _this = _super.call(this, "XML maximum depth reached (max depth: " + maxDepth + ").") || this;
        _this.maxDepth = maxDepth;
        Object.setPrototypeOf(_this, MaxXmlDepthError.prototype);
        return _this;
    }
    return MaxXmlDepthError;
}(Error));


// CONCATENATED MODULE: ./src/errors/missingArgumentError.ts
var missingArgumentError_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MissingArgumentError = (function (_super) {
    missingArgumentError_extends(MissingArgumentError, _super);
    function MissingArgumentError(argName) {
        var _this = _super.call(this, "Argument '" + argName + "' is missing.") || this;
        Object.setPrototypeOf(_this, MissingArgumentError.prototype);
        return _this;
    }
    return MissingArgumentError;
}(Error));


// CONCATENATED MODULE: ./src/errors/missingCloseDelimiterError.ts
var missingCloseDelimiterError_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MissingCloseDelimiterError = (function (_super) {
    missingCloseDelimiterError_extends(MissingCloseDelimiterError, _super);
    function MissingCloseDelimiterError(tagName) {
        var _this = _super.call(this, "Tag '" + tagName + "' does not have a closing delimiter.") || this;
        _this.tagName = tagName;
        Object.setPrototypeOf(_this, MissingCloseDelimiterError.prototype);
        return _this;
    }
    return MissingCloseDelimiterError;
}(Error));


// CONCATENATED MODULE: ./src/errors/missingStartDelimiterError.ts
var missingStartDelimiterError_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MissingStartDelimiterError = (function (_super) {
    missingStartDelimiterError_extends(MissingStartDelimiterError, _super);
    function MissingStartDelimiterError(tagName) {
        var _this = _super.call(this, "Tag '" + tagName + "' does not have an opening delimiter.") || this;
        _this.tagName = tagName;
        Object.setPrototypeOf(_this, MissingStartDelimiterError.prototype);
        return _this;
    }
    return MissingStartDelimiterError;
}(Error));


// CONCATENATED MODULE: ./src/errors/unclosedTagError.ts
var unclosedTagError_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var UnclosedTagError = (function (_super) {
    unclosedTagError_extends(UnclosedTagError, _super);
    function UnclosedTagError(tagName) {
        var _this = _super.call(this, "Tag '" + tagName + "' is never closed.") || this;
        _this.tagName = tagName;
        Object.setPrototypeOf(_this, UnclosedTagError.prototype);
        return _this;
    }
    return UnclosedTagError;
}(Error));


// CONCATENATED MODULE: ./src/errors/unidentifiedFileTypeError.ts
var unidentifiedFileTypeError_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var UnidentifiedFileTypeError = (function (_super) {
    unidentifiedFileTypeError_extends(UnidentifiedFileTypeError, _super);
    function UnidentifiedFileTypeError() {
        var _this = _super.call(this, "The filetype for this file could not be identified, is this file corrupted?") || this;
        Object.setPrototypeOf(_this, UnidentifiedFileTypeError.prototype);
        return _this;
    }
    return UnidentifiedFileTypeError;
}(Error));


// CONCATENATED MODULE: ./src/errors/unknownPrefixError.ts
var unknownPrefixError_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var UnknownPrefixError = (function (_super) {
    unknownPrefixError_extends(UnknownPrefixError, _super);
    function UnknownPrefixError(tagRawText) {
        var _this = _super.call(this, "Tag '" + tagRawText + "' does not match any of the known prefixes.") || this;
        _this.tagRawText = tagRawText;
        Object.setPrototypeOf(_this, UnknownPrefixError.prototype);
        return _this;
    }
    return UnknownPrefixError;
}(Error));


// CONCATENATED MODULE: ./src/errors/unopenedTagError.ts
var unopenedTagError_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var UnopenedTagError = (function (_super) {
    unopenedTagError_extends(UnopenedTagError, _super);
    function UnopenedTagError(tagName) {
        var _this = _super.call(this, "Tag '" + tagName + "' is closed but was never opened.") || this;
        _this.tagName = tagName;
        Object.setPrototypeOf(_this, UnopenedTagError.prototype);
        return _this;
    }
    return UnopenedTagError;
}(Error));


// CONCATENATED MODULE: ./src/errors/unsupportedFileTypeError.ts
var unsupportedFileTypeError_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var UnsupportedFileTypeError = (function (_super) {
    unsupportedFileTypeError_extends(UnsupportedFileTypeError, _super);
    function UnsupportedFileTypeError(fileType) {
        var _this = _super.call(this, "Filetype \"" + fileType + "\" is not supported.") || this;
        Object.setPrototypeOf(_this, UnsupportedFileTypeError.prototype);
        return _this;
    }
    return UnsupportedFileTypeError;
}(Error));


// CONCATENATED MODULE: ./src/errors/index.ts










// CONCATENATED MODULE: ./src/utils/array.ts
function pushMany(destArray, items) {
    Array.prototype.push.apply(destArray, items);
}
function last(array) {
    if (!array.length)
        return undefined;
    return array[array.length - 1];
}

// CONCATENATED MODULE: ./src/utils/binary.ts

var binary_Binary;
(function (Binary) {
    function toJsZipOutputType(binary) {
        if (!binary)
            throw new MissingArgumentError("binary");
        var type = binary.constructor.name.toLowerCase();
        switch (type) {
            case 'blob':
                return type;
            case 'arraybuffer':
                return type;
            case 'buffer':
                return 'nodebuffer';
            default:
                throw new Error("Binary type '" + type + "' is not supported.");
        }
    }
    Binary.toJsZipOutputType = toJsZipOutputType;
})(binary_Binary || (binary_Binary = {}));

// EXTERNAL MODULE: ./src/utils/platform.ts
var platform = __webpack_require__("./src/utils/platform.ts");

// CONCATENATED MODULE: ./src/utils/index.ts




// CONCATENATED MODULE: ./src/xmlNode.ts


var XmlNodeType;
(function (XmlNodeType) {
    XmlNodeType["Text"] = "Text";
    XmlNodeType["General"] = "General";
})(XmlNodeType || (XmlNodeType = {}));
var TEXT_NODE_NAME_VALUE = '#text';
var xmlNode_XmlNode;
(function (XmlNode) {
    XmlNode.TEXT_NODE_NAME = TEXT_NODE_NAME_VALUE;
    function createTextNode(text) {
        return {
            nodeType: XmlNodeType.Text,
            nodeName: XmlNode.TEXT_NODE_NAME,
            textContent: text
        };
    }
    XmlNode.createTextNode = createTextNode;
    function createGeneralNode(name) {
        return {
            nodeType: XmlNodeType.General,
            nodeName: name
        };
    }
    XmlNode.createGeneralNode = createGeneralNode;
    function encodeValue(str) {
        if (str === null || str === undefined)
            throw new MissingArgumentError("str");
        if (typeof str !== 'string')
            throw new TypeError("Expected a string, got '" + str.constructor.name + "'.");
        return str.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
            return '';
        });
    }
    XmlNode.encodeValue = encodeValue;
    function serialize(node) {
        if (isTextNode(node))
            return encodeValue(node.textContent) || '';
        var attributes = '';
        if (node.attributes && node.attributes.length) {
            attributes = ' ' + node.attributes
                .map(function (attr) { return attr.name + "=\"" + attr.value + "\""; })
                .join(' ');
        }
        var hasChildren = (node.childNodes || []).length > 0;
        var suffix = hasChildren ? '' : '/';
        var openTag = "<" + node.nodeName + attributes + suffix + ">";
        var xml;
        if (hasChildren) {
            var childrenXml = node.childNodes
                .map(function (child) { return serialize(child); })
                .join('');
            var closeTag = "</" + node.nodeName + ">";
            xml = openTag + childrenXml + closeTag;
        }
        else {
            xml = openTag;
        }
        return xml;
    }
    XmlNode.serialize = serialize;
    function fromDomNode(domNode) {
        var xmlNode;
        if (domNode.nodeType === domNode.TEXT_NODE) {
            xmlNode = createTextNode(domNode.textContent);
        }
        else {
            xmlNode = createGeneralNode(domNode.nodeName);
            if (domNode.nodeType === domNode.ELEMENT_NODE) {
                var attributes = domNode.attributes;
                if (attributes) {
                    xmlNode.attributes = [];
                    for (var i = 0; i < attributes.length; i++) {
                        var curAttribute = attributes.item(i);
                        xmlNode.attributes.push({
                            name: curAttribute.name,
                            value: curAttribute.value
                        });
                    }
                }
            }
        }
        if (domNode.childNodes) {
            xmlNode.childNodes = [];
            var prevChild = void 0;
            for (var i = 0; i < domNode.childNodes.length; i++) {
                var domChild = domNode.childNodes.item(i);
                var curChild = fromDomNode(domChild);
                xmlNode.childNodes.push(curChild);
                curChild.parentNode = xmlNode;
                if (prevChild) {
                    prevChild.nextSibling = curChild;
                }
                prevChild = curChild;
            }
        }
        return xmlNode;
    }
    XmlNode.fromDomNode = fromDomNode;
    function isTextNode(node) {
        if (node.nodeType === XmlNodeType.Text || node.nodeName === XmlNode.TEXT_NODE_NAME) {
            if (!(node.nodeType === XmlNodeType.Text && node.nodeName === XmlNode.TEXT_NODE_NAME)) {
                throw new Error("Invalid text node. Type: '" + node.nodeType + "', Name: '" + node.nodeName + "'.");
            }
            return true;
        }
        return false;
    }
    XmlNode.isTextNode = isTextNode;
    function cloneNode(node, deep) {
        if (!node)
            throw new MissingArgumentError(nameof(node));
        if (!deep) {
            var clone = Object.assign({}, node);
            clone.parentNode = null;
            clone.childNodes = (node.childNodes ? [] : null);
            clone.nextSibling = null;
            return clone;
        }
        else {
            var clone = cloneNodeDeep(node);
            clone.parentNode = null;
            return clone;
        }
    }
    XmlNode.cloneNode = cloneNode;
    function insertBefore(newNode, referenceNode) {
        if (!newNode)
            throw new MissingArgumentError(nameof(newNode));
        if (!referenceNode)
            throw new MissingArgumentError(nameof(referenceNode));
        if (!referenceNode.parentNode)
            throw new Error("'" + nameof(referenceNode) + "' has no parent");
        var childNodes = referenceNode.parentNode.childNodes;
        var beforeNodeIndex = childNodes.indexOf(referenceNode);
        XmlNode.insertChild(referenceNode.parentNode, newNode, beforeNodeIndex);
    }
    XmlNode.insertBefore = insertBefore;
    function insertAfter(newNode, referenceNode) {
        if (!newNode)
            throw new MissingArgumentError(nameof(newNode));
        if (!referenceNode)
            throw new MissingArgumentError(nameof(referenceNode));
        if (!referenceNode.parentNode)
            throw new Error("'" + nameof(referenceNode) + "' has no parent");
        var childNodes = referenceNode.parentNode.childNodes;
        var referenceNodeIndex = childNodes.indexOf(referenceNode);
        XmlNode.insertChild(referenceNode.parentNode, newNode, referenceNodeIndex + 1);
    }
    XmlNode.insertAfter = insertAfter;
    function insertChild(parent, child, childIndex) {
        if (!parent)
            throw new MissingArgumentError(nameof(parent));
        if (isTextNode(parent))
            throw new Error('Appending children to text nodes is forbidden');
        if (!child)
            throw new MissingArgumentError(nameof(child));
        if (!parent.childNodes)
            parent.childNodes = [];
        if (childIndex === parent.childNodes.length) {
            XmlNode.appendChild(parent, child);
            return;
        }
        if (childIndex > parent.childNodes.length)
            throw new RangeError("Child index " + childIndex + " is out of range. Parent has only " + parent.childNodes.length + " child nodes.");
        child.parentNode = parent;
        var childAfter = parent.childNodes[childIndex];
        child.nextSibling = childAfter;
        if (childIndex > 0) {
            var childBefore = parent.childNodes[childIndex - 1];
            childBefore.nextSibling = child;
        }
        parent.childNodes.splice(childIndex, 0, child);
    }
    XmlNode.insertChild = insertChild;
    function appendChild(parent, child) {
        if (!parent)
            throw new MissingArgumentError(nameof(parent));
        if (isTextNode(parent))
            throw new Error('Appending children to text nodes is forbidden');
        if (!child)
            throw new MissingArgumentError(nameof(child));
        if (!parent.childNodes)
            parent.childNodes = [];
        if (parent.childNodes.length) {
            var currentLastChild = parent.childNodes[parent.childNodes.length - 1];
            currentLastChild.nextSibling = child;
        }
        child.nextSibling = null;
        child.parentNode = parent;
        parent.childNodes.push(child);
    }
    XmlNode.appendChild = appendChild;
    function remove(node) {
        if (!node)
            throw new MissingArgumentError(nameof(node));
        if (!node.parentNode)
            throw new Error('Node has no parent');
        removeChild(node.parentNode, node);
    }
    XmlNode.remove = remove;
    function removeChild(parent, childOrIndex) {
        if (!parent)
            throw new MissingArgumentError(nameof(parent));
        if (childOrIndex === null || childOrIndex === undefined)
            throw new MissingArgumentError(nameof(childOrIndex));
        if (!parent.childNodes || !parent.childNodes.length)
            throw new Error('Parent node has node children');
        var childIndex;
        if (typeof childOrIndex === 'number') {
            childIndex = childOrIndex;
        }
        else {
            childIndex = parent.childNodes.indexOf(childOrIndex);
            if (childIndex === -1)
                throw new Error('Specified child node is not a child of the specified parent');
        }
        if (childIndex >= parent.childNodes.length)
            throw new RangeError("Child index " + childIndex + " is out of range. Parent has only " + parent.childNodes.length + " child nodes.");
        var child = parent.childNodes[childIndex];
        if (childIndex > 0) {
            var beforeChild = parent.childNodes[childIndex - 1];
            beforeChild.nextSibling = child.nextSibling;
        }
        child.parentNode = null;
        child.nextSibling = null;
        return parent.childNodes.splice(childIndex, 1)[0];
    }
    XmlNode.removeChild = removeChild;
    function lastTextChild(node) {
        if (isTextNode(node)) {
            return node;
        }
        if (node.childNodes) {
            var allTextNodes = node.childNodes.filter(function (child) { return isTextNode(child); });
            if (allTextNodes.length) {
                var lastTextNode = last(allTextNodes);
                if (!lastTextNode.textContent)
                    lastTextNode.textContent = '';
                return lastTextNode;
            }
        }
        var newTextNode = {
            nodeType: XmlNodeType.Text,
            nodeName: XmlNode.TEXT_NODE_NAME,
            textContent: ''
        };
        appendChild(node, newTextNode);
        return newTextNode;
    }
    XmlNode.lastTextChild = lastTextChild;
    function removeSiblings(from, to) {
        if (from === to)
            return [];
        var removed = [];
        var lastRemoved;
        from = from.nextSibling;
        while (from !== to) {
            var removeMe = from;
            from = from.nextSibling;
            XmlNode.remove(removeMe);
            removed.push(removeMe);
            if (lastRemoved)
                lastRemoved.nextSibling = removeMe;
            lastRemoved = removeMe;
        }
        return removed;
    }
    XmlNode.removeSiblings = removeSiblings;
    function splitByChild(root, markerNode, removeMarkerNode) {
        var path = getDescendantPath(root, markerNode);
        var split = XmlNode.cloneNode(root, false);
        var childIndex = path[0] + 1;
        while (childIndex < root.childNodes.length) {
            var curChild = root.childNodes[childIndex];
            XmlNode.remove(curChild);
            XmlNode.appendChild(split, curChild);
        }
        if (root.parentNode) {
            XmlNode.insertAfter(split, root);
        }
        if (removeMarkerNode && root.childNodes.length) {
            XmlNode.removeChild(root, root.childNodes.length - 1);
        }
        return [root, split];
    }
    XmlNode.splitByChild = splitByChild;
    function cloneNodeDeep(original) {
        var clone = {};
        clone.nodeType = original.nodeType;
        clone.nodeName = original.nodeName;
        if (isTextNode(original)) {
            clone.textContent = original.textContent;
        }
        else {
            var attributes = original.attributes;
            if (attributes) {
                clone.attributes = attributes.map(function (attr) { return ({ name: attr.name, value: attr.value }); });
            }
        }
        if (original.childNodes) {
            clone.childNodes = [];
            var prevChildClone = void 0;
            for (var _i = 0, _a = original.childNodes; _i < _a.length; _i++) {
                var child = _a[_i];
                var childClone = cloneNodeDeep(child);
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
        var path = [];
        var node = descendant;
        while (node !== root) {
            var parent_1 = node.parentNode;
            if (!parent_1)
                throw new Error("Argument " + nameof(descendant) + " is not a descendant of " + nameof(root));
            var curChildIndex = parent_1.childNodes.indexOf(node);
            path.push(curChildIndex);
            node = parent_1;
        }
        return path.reverse();
    }
})(xmlNode_XmlNode || (xmlNode_XmlNode = {}));

// CONCATENATED MODULE: ./src/compilation/delimiterSearcher.ts



var delimiterSearcher_DelimiterSearcher = (function () {
    function DelimiterSearcher() {
        this.maxXmlDepth = 20;
        this.startDelimiter = "{";
        this.endDelimiter = "}";
    }
    DelimiterSearcher.prototype.findDelimiters = function (node) {
        var delimiters = [];
        this.findRecurse(node, delimiters, 0);
        return delimiters;
    };
    DelimiterSearcher.prototype.findRecurse = function (node, delimiters, depth) {
        if (depth > this.maxXmlDepth)
            throw new MaxXmlDepthError(this.maxXmlDepth);
        if (!node)
            return;
        if (xmlNode_XmlNode.isTextNode(node)) {
            var curTokens = this.findInNode(node);
            if (curTokens.length) {
                pushMany(delimiters, curTokens);
            }
            return;
        }
        var childNodesLength = (node.childNodes ? node.childNodes.length : 0);
        for (var i = 0; i < childNodesLength; i++) {
            var child = node.childNodes[i];
            this.findRecurse(child, delimiters, depth + 1);
        }
    };
    DelimiterSearcher.prototype.findInNode = function (node) {
        if (!node.textContent) {
            return [];
        }
        var delimiterMarks = [];
        for (var i = 0; i < node.textContent.length; i++) {
            if (node.textContent[i] === this.startDelimiter) {
                delimiterMarks.push({
                    index: i,
                    isOpen: true,
                    xmlTextNode: node
                });
            }
            else if (node.textContent[i] === this.endDelimiter) {
                delimiterMarks.push({
                    index: i,
                    isOpen: false,
                    xmlTextNode: node
                });
            }
        }
        return delimiterMarks;
    };
    return DelimiterSearcher;
}());


// CONCATENATED MODULE: ./src/compilation/scopeData.ts

var getProp = __webpack_require__(/*! lodash.get */ "lodash.get");
var scopeData_ScopeData = (function () {
    function ScopeData(data) {
        this.path = [];
        this.allData = data;
    }
    ScopeData.prototype.getScopeData = function () {
        var lastKey = last(this.path);
        var result;
        var curPath = this.path.slice();
        while (result === undefined && curPath.length) {
            var curScopePath = curPath.slice(0, curPath.length - 1);
            result = getProp(this.allData, curScopePath.concat(lastKey));
            curPath = curScopePath;
        }
        return result;
    };
    return ScopeData;
}());


// CONCATENATED MODULE: ./src/compilation/tag.ts
var TagDisposition;
(function (TagDisposition) {
    TagDisposition["Open"] = "Open";
    TagDisposition["Close"] = "Close";
    TagDisposition["SelfClosed"] = "SelfClosed";
})(TagDisposition || (TagDisposition = {}));
var Tag = (function () {
    function Tag(initial) {
        Object.assign(this, initial);
    }
    return Tag;
}());


// CONCATENATED MODULE: ./src/compilation/tagParser.ts


var tagParser_TagParser = (function () {
    function TagParser(tagPrefixes, docParser) {
        this.tagPrefixes = tagPrefixes;
        this.docParser = docParser;
        this.startDelimiter = "{";
        this.endDelimiter = "}";
        if (!tagPrefixes || !tagPrefixes.length)
            throw new MissingArgumentError("tagPrefixes");
        if (!docParser)
            throw new MissingArgumentError("docParser");
    }
    TagParser.prototype.parse = function (delimiters) {
        var tags = [];
        var openedTag;
        var openedDelimiter;
        var lastNormalizedNode;
        var lastInflictedOffset;
        for (var _i = 0, delimiters_1 = delimiters; _i < delimiters_1.length; _i++) {
            var delimiter = delimiters_1[_i];
            if (!openedTag && !delimiter.isOpen) {
                throw new MissingStartDelimiterError('Unknown');
            }
            if (openedTag && delimiter.isOpen) {
                throw new MissingCloseDelimiterError('Unknown');
            }
            if (!openedTag && delimiter.isOpen) {
                openedTag = new Tag();
                openedDelimiter = delimiter;
            }
            if (openedTag && !delimiter.isOpen) {
                if (lastNormalizedNode === openedDelimiter.xmlTextNode) {
                    openedDelimiter.index -= lastInflictedOffset;
                }
                if (lastNormalizedNode === delimiter.xmlTextNode) {
                    delimiter.index -= lastInflictedOffset;
                }
                lastNormalizedNode = delimiter.xmlTextNode;
                lastInflictedOffset = this.normalizeTagNodes(openedDelimiter, delimiter);
                openedTag.xmlTextNode = openedDelimiter.xmlTextNode;
                this.processTag(openedTag);
                tags.push(openedTag);
                openedTag = null;
                openedDelimiter = null;
            }
        }
        return tags;
    };
    TagParser.prototype.normalizeTagNodes = function (openDelimiter, closeDelimiter) {
        var inflictedOffset = 0;
        var startTextNode = openDelimiter.xmlTextNode;
        var endTextNode = closeDelimiter.xmlTextNode;
        var sameNode = (startTextNode === endTextNode);
        if (openDelimiter.index > 0) {
            inflictedOffset += openDelimiter.index;
            this.docParser.splitTextNode(startTextNode, openDelimiter.index, true);
        }
        if (closeDelimiter.index < endTextNode.textContent.length - 1) {
            inflictedOffset += closeDelimiter.index + 1;
            endTextNode = this.docParser.splitTextNode(endTextNode, closeDelimiter.index + 1, true);
            if (sameNode) {
                startTextNode = endTextNode;
            }
        }
        if (!sameNode) {
            this.docParser.joinTextNodesRange(startTextNode, endTextNode);
            endTextNode = startTextNode;
        }
        openDelimiter.xmlTextNode = startTextNode;
        closeDelimiter.xmlTextNode = endTextNode;
        return inflictedOffset;
    };
    TagParser.prototype.processTag = function (tag) {
        tag.rawText = tag.xmlTextNode.textContent;
        for (var _i = 0, _a = this.tagPrefixes; _i < _a.length; _i++) {
            var prefix = _a[_i];
            var pattern = "^[" + this.startDelimiter + "](\\s*?)" + prefix.prefix + "(.*?)[" + this.endDelimiter + "]";
            var regex = new RegExp(pattern, 'gmi');
            var match = regex.exec(tag.rawText);
            if (match && match.length) {
                tag.name = match[2];
                tag.type = prefix.tagType;
                tag.disposition = prefix.tagDisposition;
                break;
            }
        }
        if (!tag.name)
            throw new UnknownPrefixError(tag.rawText);
    };
    return TagParser;
}());


// CONCATENATED MODULE: ./src/compilation/templateCompiler.ts


var templateCompiler_TemplateCompiler = (function () {
    function TemplateCompiler(delimiterSearcher, tagParser, plugins) {
        this.delimiterSearcher = delimiterSearcher;
        this.tagParser = tagParser;
        this.plugins = plugins;
    }
    TemplateCompiler.prototype.compile = function (node, data, context) {
        var delimiters = this.delimiterSearcher.findDelimiters(node);
        var tags = this.tagParser.parse(delimiters);
        this.doTagReplacements(tags, data, context);
    };
    TemplateCompiler.prototype.doTagReplacements = function (tags, data, context) {
        var _loop_1 = function (i) {
            var tag = tags[i];
            data.path.push(tag.name);
            if (tag.disposition === TagDisposition.SelfClosed) {
                for (var _i = 0, _a = this_1.plugins; _i < _a.length; _i++) {
                    var plugin = _a[_i];
                    if (plugin.prefixes.some(function (prefix) { return prefix.tagType === tag.type; })) {
                        plugin.simpleTagReplacements(tag, data, context);
                        break;
                    }
                }
            }
            else if (tag.disposition === TagDisposition.Open) {
                var j = this_1.findCloseTagIndex(i, tag, tags);
                var scopeTags = tags.slice(i, j + 1);
                i = j;
                for (var _b = 0, _c = this_1.plugins; _b < _c.length; _b++) {
                    var plugin = _c[_b];
                    if (plugin.prefixes.some(function (prefix) { return prefix.tagType === tag.type; })) {
                        plugin.containerTagReplacements(scopeTags, data, context);
                        break;
                    }
                }
            }
            data.path.pop();
            out_i_1 = i;
        };
        var this_1 = this, out_i_1;
        for (var i = 0; i < tags.length; i++) {
            _loop_1(i);
            i = out_i_1;
        }
    };
    TemplateCompiler.prototype.findCloseTagIndex = function (fromIndex, openTag, tags) {
        var i = fromIndex;
        for (; i < tags.length; i++) {
            var closeTag = tags[i];
            if (closeTag.name === openTag.name &&
                closeTag.type === openTag.type &&
                closeTag.disposition === TagDisposition.Close) {
                break;
            }
        }
        if (i === tags.length) {
            throw new UnclosedTagError(openTag.name);
        }
        return i;
    };
    return TemplateCompiler;
}());


// CONCATENATED MODULE: ./src/compilation/index.ts







// CONCATENATED MODULE: ./src/plugins/templatePlugin.ts
var TemplatePlugin = (function () {
    function TemplatePlugin() {
    }
    TemplatePlugin.prototype.setUtilities = function (utilities) {
        this.utilities = utilities;
    };
    TemplatePlugin.prototype.simpleTagReplacements = function (tag, data, context) {
    };
    TemplatePlugin.prototype.containerTagReplacements = function (tags, data, context) {
    };
    return TemplatePlugin;
}());


// CONCATENATED MODULE: ./src/plugins/loopPlugin.ts
var loopPlugin_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();




var loopPlugin_LoopPlugin = (function (_super) {
    loopPlugin_extends(LoopPlugin, _super);
    function LoopPlugin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefixes = [
            {
                prefix: '#',
                tagType: 'loop',
                tagDisposition: TagDisposition.Open
            },
            {
                prefix: '/',
                tagType: 'loop',
                tagDisposition: TagDisposition.Close
            }
        ];
        return _this;
    }
    LoopPlugin.prototype.containerTagReplacements = function (tags, data, context) {
        var value = data.getScopeData();
        if (!value || !Array.isArray(value) || !value.length)
            value = [];
        var openTag = tags[0];
        var closeTag = last(tags);
        var firstNode = this.utilities.docxParser.containingParagraphNode(openTag.xmlTextNode);
        var lastNode = this.utilities.docxParser.containingParagraphNode(closeTag.xmlTextNode);
        var middleNodes;
        var sameNodes = (firstNode === lastNode);
        var result = this.splitParagraphs(openTag.xmlTextNode, closeTag.xmlTextNode);
        firstNode = result.firstParagraph;
        lastNode = result.lastParagraph;
        middleNodes = result.middleParagraphs;
        var repeatedNodes = this.repeat(middleNodes, value.length);
        var compiledNodes = this.compile(repeatedNodes, data, context);
        this.mergeBack(compiledNodes, firstNode, lastNode, sameNodes);
    };
    LoopPlugin.prototype.splitParagraphs = function (openTagNode, closeTagNode) {
        var firstParagraph = this.utilities.docxParser.containingParagraphNode(openTagNode);
        var lastParagraph = this.utilities.docxParser.containingParagraphNode(closeTagNode);
        var areSame = (firstParagraph === lastParagraph);
        var parent = firstParagraph.parentNode;
        var firstParagraphIndex = parent.childNodes.indexOf(firstParagraph);
        var lastParagraphIndex = areSame ? firstParagraphIndex : parent.childNodes.indexOf(lastParagraph);
        var splitResult = xmlNode_XmlNode.splitByChild(firstParagraph, openTagNode, true);
        firstParagraph = splitResult[0];
        var firstParagraphSplit = splitResult[1];
        if (areSame)
            lastParagraph = firstParagraphSplit;
        splitResult = xmlNode_XmlNode.splitByChild(lastParagraph, closeTagNode, true);
        var lastParagraphSplit = splitResult[0];
        lastParagraph = splitResult[1];
        xmlNode_XmlNode.removeChild(parent, firstParagraphIndex + 1);
        if (!areSame)
            xmlNode_XmlNode.removeChild(parent, lastParagraphIndex);
        firstParagraphSplit.parentNode = null;
        lastParagraphSplit.parentNode = null;
        var middleParagraphs;
        if (areSame) {
            this.utilities.docxParser.joinParagraphs(firstParagraphSplit, lastParagraphSplit);
            middleParagraphs = [firstParagraphSplit];
        }
        else {
            var inBetween = xmlNode_XmlNode.removeSiblings(firstParagraph, lastParagraph);
            middleParagraphs = [firstParagraphSplit].concat(inBetween).concat(lastParagraphSplit);
        }
        return {
            firstParagraph: firstParagraph,
            middleParagraphs: middleParagraphs,
            lastParagraph: lastParagraph
        };
    };
    LoopPlugin.prototype.repeat = function (nodes, times) {
        if (!nodes.length || !times)
            return [];
        var allResults = [];
        for (var i = 0; i < times; i++) {
            var curResult = nodes.map(function (node) { return xmlNode_XmlNode.cloneNode(node, true); });
            allResults.push(curResult);
        }
        return allResults;
    };
    LoopPlugin.prototype.compile = function (nodeGroups, data, context) {
        var compiledNodeGroups = [];
        var _loop_1 = function (i) {
            var curNodes = nodeGroups[i];
            var dummyRootNode = xmlNode_XmlNode.createGeneralNode('dummyRootNode');
            curNodes.forEach(function (node) { return xmlNode_XmlNode.appendChild(dummyRootNode, node); });
            data.path.push(i);
            this_1.utilities.compiler.compile(dummyRootNode, data, context);
            data.path.pop();
            var curResult = [];
            while (dummyRootNode.childNodes && dummyRootNode.childNodes.length) {
                var child = xmlNode_XmlNode.removeChild(dummyRootNode, 0);
                curResult.push(child);
            }
            compiledNodeGroups.push(curResult);
        };
        var this_1 = this;
        for (var i = 0; i < nodeGroups.length; i++) {
            _loop_1(i);
        }
        return compiledNodeGroups;
    };
    LoopPlugin.prototype.mergeBack = function (nodeGroups, firstParagraph, lastParagraph, sameNodes) {
        var mergeTo = firstParagraph;
        for (var _i = 0, nodeGroups_1 = nodeGroups; _i < nodeGroups_1.length; _i++) {
            var curNodeGroup = nodeGroups_1[_i];
            this.utilities.docxParser.joinParagraphs(mergeTo, curNodeGroup[0]);
            for (var i = 1; i < curNodeGroup.length; i++) {
                xmlNode_XmlNode.insertBefore(curNodeGroup[i], lastParagraph);
                mergeTo = curNodeGroup[i];
            }
        }
        this.utilities.docxParser.joinParagraphs(mergeTo, lastParagraph);
        xmlNode_XmlNode.remove(lastParagraph);
    };
    return LoopPlugin;
}(TemplatePlugin));


// CONCATENATED MODULE: ./src/plugins/rawXmlPlugin.ts
var rawXmlPlugin_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



var rawXmlPlugin_RawXmlPlugin = (function (_super) {
    rawXmlPlugin_extends(RawXmlPlugin, _super);
    function RawXmlPlugin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefixes = [{
                prefix: '@',
                tagType: 'rawXml',
                tagDisposition: TagDisposition.SelfClosed
            }];
        return _this;
    }
    RawXmlPlugin.prototype.simpleTagReplacements = function (tag, data) {
        var wordTextNode = this.utilities.docxParser.containingTextNode(tag.xmlTextNode);
        var value = data.getScopeData();
        if (typeof value === 'string') {
            var newNode = this.utilities.xmlParser.parse(value);
            xmlNode_XmlNode.insertBefore(newNode, wordTextNode);
        }
        xmlNode_XmlNode.remove(wordTextNode);
    };
    return RawXmlPlugin;
}(TemplatePlugin));


// CONCATENATED MODULE: ./src/docxParser.ts

var docxParser_DocxParser = (function () {
    function DocxParser() {
    }
    DocxParser.prototype.contentFilePaths = function (zip) {
        var baseTags = [
            "word/document.xml",
            "word/document2.xml"
        ];
        var headersAndFooters = zip
            .file(/word\/(header|footer)\d+\.xml/)
            .map(function (file) { return file.name; });
        return headersAndFooters.concat(baseTags);
    };
    DocxParser.prototype.mainFilePath = function (zip) {
        if (zip.files["word/document.xml"]) {
            return "word/document.xml";
        }
        if (zip.files["word/document2.xml"]) {
            return "word/document2.xml";
        }
        return undefined;
    };
    DocxParser.prototype.splitTextNode = function (textNode, splitIndex, addBefore) {
        var firstXmlTextNode;
        var secondXmlTextNode;
        var wordTextNode = this.containingTextNode(textNode);
        var newWordTextNode = xmlNode_XmlNode.cloneNode(wordTextNode, true);
        if (addBefore) {
            xmlNode_XmlNode.insertBefore(newWordTextNode, wordTextNode);
            firstXmlTextNode = xmlNode_XmlNode.lastTextChild(newWordTextNode);
            secondXmlTextNode = textNode;
        }
        else {
            var curIndex = wordTextNode.parentNode.childNodes.indexOf(wordTextNode);
            xmlNode_XmlNode.insertChild(wordTextNode.parentNode, newWordTextNode, curIndex + 1);
            firstXmlTextNode = textNode;
            secondXmlTextNode = xmlNode_XmlNode.lastTextChild(newWordTextNode);
        }
        var firstText = firstXmlTextNode.textContent;
        var secondText = secondXmlTextNode.textContent;
        firstXmlTextNode.textContent = firstText.substring(0, splitIndex);
        secondXmlTextNode.textContent = secondText.substring(splitIndex);
        return (addBefore ? firstXmlTextNode : secondXmlTextNode);
    };
    DocxParser.prototype.joinTextNodesRange = function (from, to) {
        var firstRunNode = this.containingRunNode(from);
        var secondRunNode = this.containingRunNode(to);
        var paragraphNode = firstRunNode.parentNode;
        if (secondRunNode.parentNode !== paragraphNode)
            throw new Error('Can not join text nodes from separate paragraphs.');
        var firstWordTextNode = this.containingTextNode(from);
        var secondWordTextNode = this.containingTextNode(to);
        var totalText = [];
        var curRunNode = firstRunNode;
        while (curRunNode) {
            var curWordTextNode = void 0;
            if (curRunNode === firstRunNode) {
                curWordTextNode = firstWordTextNode;
            }
            else {
                curWordTextNode = this.firstTextNodeChild(curRunNode);
            }
            while (curWordTextNode) {
                if (curWordTextNode.nodeName !== DocxParser.TEXT_NODE)
                    continue;
                var curXmlTextNode = xmlNode_XmlNode.lastTextChild(curWordTextNode);
                totalText.push(curXmlTextNode.textContent);
                var textToRemove = curWordTextNode;
                if (curWordTextNode === secondWordTextNode) {
                    curWordTextNode = null;
                }
                else {
                    curWordTextNode = curWordTextNode.nextSibling;
                }
                if (textToRemove !== firstWordTextNode) {
                    xmlNode_XmlNode.remove(textToRemove);
                }
            }
            var runToRemove = curRunNode;
            if (curRunNode === secondRunNode) {
                curRunNode = null;
            }
            else {
                curRunNode = curRunNode.nextSibling;
            }
            if (!runToRemove.childNodes || !runToRemove.childNodes.length) {
                xmlNode_XmlNode.remove(runToRemove);
            }
        }
        var firstXmlTextNode = xmlNode_XmlNode.lastTextChild(firstWordTextNode);
        firstXmlTextNode.textContent = totalText.join('');
    };
    DocxParser.prototype.joinParagraphs = function (first, second) {
        if (first === second)
            return;
        var childIndex = 0;
        while (second.childNodes && childIndex < second.childNodes.length) {
            var curChild = second.childNodes[childIndex];
            if (curChild.nodeName === DocxParser.RUN_NODE) {
                xmlNode_XmlNode.removeChild(second, childIndex);
                xmlNode_XmlNode.appendChild(first, curChild);
            }
            else {
                childIndex++;
            }
        }
    };
    DocxParser.prototype.firstTextNodeChild = function (node) {
        if (!node)
            return null;
        if (node.nodeName !== DocxParser.RUN_NODE)
            return null;
        if (!node.childNodes)
            return null;
        for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
            var child = _a[_i];
            if (child.nodeName === DocxParser.TEXT_NODE)
                return child;
        }
        return null;
    };
    DocxParser.prototype.containingTextNode = function (node) {
        if (!node)
            return null;
        if (!xmlNode_XmlNode.isTextNode(node))
            throw new Error("'Invalid argument " + "node" + ". Expected a XmlTextNode.");
        var genNode = node;
        while (genNode.parentNode) {
            if (genNode.nodeName === DocxParser.TEXT_NODE)
                return genNode;
            genNode = genNode.parentNode;
        }
        return null;
    };
    DocxParser.prototype.containingRunNode = function (node) {
        if (!node)
            return null;
        if (node.nodeName === DocxParser.RUN_NODE)
            return node;
        return this.containingRunNode(node.parentNode);
    };
    DocxParser.prototype.containingParagraphNode = function (node) {
        if (!node)
            return null;
        if (node.nodeName === DocxParser.PARAGRAPH_NODE)
            return node;
        return this.containingParagraphNode(node.parentNode);
    };
    DocxParser.PARAGRAPH_NODE = 'w:p';
    DocxParser.RUN_NODE = 'w:r';
    DocxParser.TEXT_NODE = 'w:t';
    return DocxParser;
}());


// CONCATENATED MODULE: ./src/plugins/textPlugin.ts
var textPlugin_extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();




var textPlugin_TextPlugin = (function (_super) {
    textPlugin_extends(TextPlugin, _super);
    function TextPlugin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefixes = [{
                prefix: '',
                tagType: 'text',
                tagDisposition: TagDisposition.SelfClosed
            }];
        return _this;
    }
    TextPlugin.prototype.simpleTagReplacements = function (tag, data) {
        var value = (data.getScopeData() || '').split('\n');
        if (value.length < 2) {
            this.replaceSingleLine(tag.xmlTextNode, value.length ? value[0] : '');
        }
        else {
            this.replaceMultiLine(tag.xmlTextNode, value);
        }
    };
    TextPlugin.prototype.replaceSingleLine = function (textNode, text) {
        textNode.textContent = text;
    };
    TextPlugin.prototype.replaceMultiLine = function (textNode, lines) {
        var runNode = this.utilities.docxParser.containingRunNode(textNode);
        textNode.textContent = lines[0];
        for (var i = 1; i < lines.length; i++) {
            var lineBreak = this.getLineBreak();
            xmlNode_XmlNode.appendChild(runNode, lineBreak);
            var lineNode = this.createWordTextNode(lines[i]);
            xmlNode_XmlNode.appendChild(runNode, lineNode);
        }
    };
    TextPlugin.prototype.getLineBreak = function () {
        return {
            nodeType: XmlNodeType.General,
            nodeName: 'w:br'
        };
    };
    TextPlugin.prototype.createWordTextNode = function (text) {
        var wordTextNode = xmlNode_XmlNode.createGeneralNode(docxParser_DocxParser.TEXT_NODE);
        wordTextNode.childNodes = [
            xmlNode_XmlNode.createTextNode(text)
        ];
        return wordTextNode;
    };
    return TextPlugin;
}(TemplatePlugin));


// CONCATENATED MODULE: ./src/plugins/defaultPlugins.ts



function createDefaultPlugins() {
    return [
        new loopPlugin_LoopPlugin(),
        new rawXmlPlugin_RawXmlPlugin(),
        new textPlugin_TextPlugin()
    ];
}

// CONCATENATED MODULE: ./src/plugins/index.ts






// CONCATENATED MODULE: ./src/delimiters.ts

var delimiters_Delimiters = (function () {
    function Delimiters(initial) {
        this.start = "{";
        this.end = "}";
        if (initial) {
            if (initial.start)
                this.start = xmlNode_XmlNode.encodeValue(initial.start);
            if (initial.end)
                this.end = xmlNode_XmlNode.encodeValue(initial.end);
        }
        if (!this.start || !this.end)
            throw new Error('Both delimiters must be specified.');
        if (this.start === this.end)
            throw new Error('Start and end delimiters can not be the same.');
        if (this.start.length > 1 || this.end.length > 1)
            throw new Error("Only single character delimiters supported (start: '" + this.start + "', end: '" + this.end + "').");
    }
    return Delimiters;
}());


// EXTERNAL MODULE: external "jszip"
var external_jszip_ = __webpack_require__("jszip");

// CONCATENATED MODULE: ./src/fileType.ts

var fileType_FileType;
(function (FileType) {
    FileType["Docx"] = "docx";
    FileType["Pptx"] = "pptx";
    FileType["Odt"] = "odt";
})(fileType_FileType || (fileType_FileType = {}));
(function (FileType) {
    function getFileType(zipFile) {
        if (isDocx(zipFile))
            return FileType.Docx;
        if (isPptx(zipFile))
            return FileType.Pptx;
        if (isOdt(zipFile))
            return FileType.Odt;
        throw new UnidentifiedFileTypeError();
    }
    FileType.getFileType = getFileType;
    function isDocx(zipFile) {
        return !!(zipFile.files["word/document.xml"] || zipFile.files["word/document2.xml"]);
    }
    FileType.isDocx = isDocx;
    function isPptx(zipFile) {
        return !!zipFile.files["ppt/presentation.xml"];
    }
    FileType.isPptx = isPptx;
    function isOdt(zipFile) {
        return !!zipFile.files['mimetype'];
    }
    FileType.isOdt = isOdt;
})(fileType_FileType || (fileType_FileType = {}));

// CONCATENATED MODULE: ./src/templateHandlerOptions.ts


var templateHandlerOptions_TemplateHandlerOptions = (function () {
    function TemplateHandlerOptions(initial) {
        this.plugins = createDefaultPlugins();
        this.delimiters = new delimiters_Delimiters();
        this.maxXmlDepth = 20;
        Object.assign(this, initial);
        if (initial) {
            this.delimiters = new delimiters_Delimiters(initial.delimiters);
        }
        if (!this.plugins.length) {
            throw new Error('Plugins list can not be empty');
        }
    }
    return TemplateHandlerOptions;
}());


// CONCATENATED MODULE: ./src/xmlParser.ts



var xmlServices;
if (platform["platform"].isNode) {
    xmlServices = __webpack_require__(/*! xmldom */ "xmldom");
}
else {
    xmlServices = window;
}
var DomParserType = xmlServices.DOMParser;
var xmlParser_XmlParser = (function () {
    function XmlParser() {
    }
    XmlParser.prototype.parse = function (str) {
        var doc = this.domParse(str);
        return xmlNode_XmlNode.fromDomNode(doc.documentElement);
    };
    XmlParser.prototype.domParse = function (str) {
        if (str === null || str === undefined)
            throw new MissingArgumentError("str");
        return XmlParser.parser.parseFromString(str, "text/xml");
    };
    XmlParser.prototype.serialize = function (xmlNode) {
        return XmlParser.xmlHeader + xmlNode_XmlNode.serialize(xmlNode);
    };
    XmlParser.xmlHeader = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    XmlParser.parser = new DomParserType();
    return XmlParser;
}());


// CONCATENATED MODULE: ./src/templateHandler.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};








var templateHandler_TemplateHandler = (function () {
    function TemplateHandler(options) {
        var _this = this;
        this.docxParser = new docxParser_DocxParser();
        this.xmlParser = new xmlParser_XmlParser();
        this.options = new templateHandlerOptions_TemplateHandlerOptions(options);
        var delimiterSearcher = new delimiterSearcher_DelimiterSearcher();
        delimiterSearcher.startDelimiter = this.options.delimiters.start;
        delimiterSearcher.endDelimiter = this.options.delimiters.end;
        delimiterSearcher.maxXmlDepth = this.options.maxXmlDepth;
        var prefixes = this.options.plugins
            .map(function (plugin) { return plugin.prefixes; })
            .reduce(function (total, current) { return total.concat(current); }, []);
        var tagParser = new tagParser_TagParser(prefixes, this.docxParser);
        tagParser.startDelimiter = this.options.delimiters.start;
        tagParser.endDelimiter = this.options.delimiters.end;
        this.compiler = new templateCompiler_TemplateCompiler(delimiterSearcher, tagParser, this.options.plugins);
        this.options.plugins.forEach(function (plugin) {
            plugin.setUtilities({
                xmlParser: _this.xmlParser,
                docxParser: _this.docxParser,
                compiler: _this.compiler
            });
        });
    }
    TemplateHandler.prototype.process = function (templateFile, data) {
        return __awaiter(this, void 0, void 0, function () {
            var docFile, contentDocuments, scopeData, context, _i, _a, file, _b, _c, file, processedFile, xmlContent, outputType;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4, this.loadDocx(templateFile)];
                    case 1:
                        docFile = _d.sent();
                        return [4, this.parseContentDocuments(docFile)];
                    case 2:
                        contentDocuments = _d.sent();
                        scopeData = new scopeData_ScopeData(data);
                        context = {
                            zipFile: docFile,
                            currentFilePath: null
                        };
                        for (_i = 0, _a = Object.keys(contentDocuments); _i < _a.length; _i++) {
                            file = _a[_i];
                            context.currentFilePath = file;
                            this.compiler.compile(contentDocuments[file], scopeData, context);
                        }
                        for (_b = 0, _c = Object.keys(contentDocuments); _b < _c.length; _b++) {
                            file = _c[_b];
                            processedFile = contentDocuments[file];
                            xmlContent = this.xmlParser.serialize(processedFile);
                            docFile.file(file, xmlContent, { createFolders: true });
                        }
                        outputType = binary_Binary.toJsZipOutputType(templateFile);
                        return [2, docFile.generateAsync({ type: outputType })];
                }
            });
        });
    };
    TemplateHandler.prototype.getText = function (docxFile) {
        return __awaiter(this, void 0, void 0, function () {
            var zipFile, mainXmlFile, xmlContent, document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.loadDocx(docxFile)];
                    case 1:
                        zipFile = _a.sent();
                        mainXmlFile = this.docxParser.mainFilePath(zipFile);
                        return [4, zipFile.files[mainXmlFile].async('text')];
                    case 2:
                        xmlContent = _a.sent();
                        document = this.xmlParser.domParse(xmlContent);
                        return [2, document.documentElement.textContent];
                }
            });
        });
    };
    TemplateHandler.prototype.loadDocx = function (file) {
        return __awaiter(this, void 0, void 0, function () {
            var docFile, fileType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, external_jszip_["loadAsync"](file)];
                    case 1:
                        docFile = _a.sent();
                        fileType = fileType_FileType.getFileType(docFile);
                        if (fileType !== fileType_FileType.Docx)
                            throw new UnsupportedFileTypeError(fileType);
                        return [2, docFile];
                }
            });
        });
    };
    TemplateHandler.prototype.parseContentDocuments = function (docFile) {
        return __awaiter(this, void 0, void 0, function () {
            var contentFiles, existingContentFiles, contentDocuments, _i, existingContentFiles_1, file, textContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contentFiles = this.docxParser.contentFilePaths(docFile);
                        existingContentFiles = contentFiles.filter(function (file) { return docFile.files[file]; });
                        contentDocuments = {};
                        _i = 0, existingContentFiles_1 = existingContentFiles;
                        _a.label = 1;
                    case 1:
                        if (!(_i < existingContentFiles_1.length)) return [3, 4];
                        file = existingContentFiles_1[_i];
                        return [4, docFile.files[file].async('text')];
                    case 2:
                        textContent = _a.sent();
                        contentDocuments[file] = this.xmlParser.parse(textContent);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3, 1];
                    case 4: return [2, contentDocuments];
                }
            });
        });
    };
    return TemplateHandler;
}());


// CONCATENATED MODULE: ./src/index.ts
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "DelimiterMark", function() { return DelimiterMark; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "DelimiterSearcher", function() { return delimiterSearcher_DelimiterSearcher; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "ScopeData", function() { return scopeData_ScopeData; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "TagDisposition", function() { return TagDisposition; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Tag", function() { return Tag; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "TagParser", function() { return tagParser_TagParser; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "TemplateCompiler", function() { return templateCompiler_TemplateCompiler; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "MaxXmlDepthError", function() { return MaxXmlDepthError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "MissingArgumentError", function() { return MissingArgumentError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "MissingCloseDelimiterError", function() { return MissingCloseDelimiterError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "MissingStartDelimiterError", function() { return MissingStartDelimiterError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "UnclosedTagError", function() { return UnclosedTagError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "UnidentifiedFileTypeError", function() { return UnidentifiedFileTypeError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "UnknownPrefixError", function() { return UnknownPrefixError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "UnopenedTagError", function() { return UnopenedTagError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "UnsupportedFileTypeError", function() { return UnsupportedFileTypeError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "createDefaultPlugins", function() { return createDefaultPlugins; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "LoopPlugin", function() { return loopPlugin_LoopPlugin; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "RawXmlPlugin", function() { return rawXmlPlugin_RawXmlPlugin; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "TemplatePlugin", function() { return TemplatePlugin; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "TextPlugin", function() { return textPlugin_TextPlugin; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Delimiters", function() { return delimiters_Delimiters; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "DocxParser", function() { return docxParser_DocxParser; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "TemplateHandler", function() { return templateHandler_TemplateHandler; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "TemplateHandlerOptions", function() { return templateHandlerOptions_TemplateHandlerOptions; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Binary", function() { return binary_Binary; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "XmlNodeType", function() { return XmlNodeType; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "TEXT_NODE_NAME_VALUE", function() { return TEXT_NODE_NAME_VALUE; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "XmlNode", function() { return xmlNode_XmlNode; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "XmlParser", function() { return xmlParser_XmlParser; });












/***/ }),

/***/ "./src/utils/platform.ts":
/*!*******************************!*\
  !*** ./src/utils/platform.ts ***!
  \*******************************/
/*! exports provided: platform */
/*! ModuleConcatenation bailout: Module uses injected variables (process) */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(process) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "platform", function() { return platform; });
var Platform = (function () {
    function Platform() {
        this._isNode = null;
    }
    Object.defineProperty(Platform.prototype, "isNode", {
        get: function () {
            if (this._isNode === null) {
                var isNodeJS = ((typeof process !== 'undefined') &&
                    (typeof process.release !== 'undefined') &&
                    process.release.name === 'node');
                var isBrowser = (typeof window !== 'undefined');
                this._isNode = (isNodeJS || !isBrowser);
            }
            return this._isNode;
        },
        enumerable: true,
        configurable: true
    });
    return Platform;
}());
var platform = new Platform();

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ 0:
/*!****************************!*\
  !*** multi ./src/index.ts ***!
  \****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! C:\Users\Alon\Documents\devel\easy-template-x\src\index.ts */"./src/index.ts");


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