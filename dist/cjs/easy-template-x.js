'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var xmldom = require('xmldom');
var JSZip = require('jszip');

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

class MalformedFileError extends Error {
  constructor(expectedFileType) {
    super(`Malformed file detected. Make sure the file is a valid ${expectedFileType} file.`);

    _defineProperty(this, "expectedFileType", void 0);

    this.expectedFileType = expectedFileType; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, MalformedFileError.prototype);
  }

}

class MaxXmlDepthError extends Error {
  constructor(maxDepth) {
    super(`XML maximum depth reached (max depth: ${maxDepth}).`);

    _defineProperty(this, "maxDepth", void 0);

    this.maxDepth = maxDepth; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, MaxXmlDepthError.prototype);
  }

}

class MissingArgumentError extends Error {
  constructor(argName) {
    super(`Argument '${argName}' is missing.`);

    _defineProperty(this, "argName", void 0);

    this.argName = argName; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, MissingArgumentError.prototype);
  }

}

class MissingCloseDelimiterError extends Error {
  constructor(openDelimiterText) {
    super(`Close delimiter is missing from '${openDelimiterText}'.`);

    _defineProperty(this, "openDelimiterText", void 0);

    this.openDelimiterText = openDelimiterText; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, MissingCloseDelimiterError.prototype);
  }

}

class MissingStartDelimiterError extends Error {
  constructor(closeDelimiterText) {
    super(`Open delimiter is missing from '${closeDelimiterText}'.`);

    _defineProperty(this, "closeDelimiterText", void 0);

    this.closeDelimiterText = closeDelimiterText; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, MissingStartDelimiterError.prototype);
  }

}

class UnclosedTagError extends Error {
  constructor(tagName) {
    super(`Tag '${tagName}' is never closed.`);

    _defineProperty(this, "tagName", void 0);

    this.tagName = tagName; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, UnclosedTagError.prototype);
  }

}

class UnidentifiedFileTypeError extends Error {
  constructor() {
    super(`The filetype for this file could not be identified, is this file corrupted?`); // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, UnidentifiedFileTypeError.prototype);
  }

}

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

class UnopenedTagError extends Error {
  constructor(tagName) {
    super(`Tag '${tagName}' is closed but was never opened.`);

    _defineProperty(this, "tagName", void 0);

    this.tagName = tagName; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, UnopenedTagError.prototype);
  }

}

class UnsupportedFileTypeError extends Error {
  constructor(fileType) {
    super(`Filetype "${fileType}" is not supported.`);

    _defineProperty(this, "fileType", void 0);

    this.fileType = fileType; // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

    Object.setPrototypeOf(this, UnsupportedFileTypeError.prototype);
  }

}

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

class Base64 {
  static encode(str) {
    // browser
    if (typeof btoa !== 'undefined') return btoa(str); // node
    // https://stackoverflow.com/questions/23097928/node-js-btoa-is-not-defined-error#38446960

    return new Buffer(str, 'binary').toString('base64');
  }

}

function inheritsFrom(derived, base) {
  // https://stackoverflow.com/questions/14486110/how-to-check-if-a-javascript-class-inherits-another-without-creating-an-obj
  return derived === base || derived.prototype instanceof base;
}
function isPromiseLike(candidate) {
  return !!candidate && typeof candidate === 'object' && typeof candidate.then === 'function';
}

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
    return typeof Blob !== 'undefined' && inheritsFrom(binaryType, Blob);
  },

  isArrayBufferConstructor(binaryType) {
    return typeof ArrayBuffer !== 'undefined' && inheritsFrom(binaryType, ArrayBuffer);
  },

  isBufferConstructor(binaryType) {
    return typeof Buffer !== 'undefined' && inheritsFrom(binaryType, Buffer);
  },

  //
  // utilities
  //
  toBase64(binary) {
    if (this.isBlob(binary)) {
      return new Promise(resolve => {
        const fileReader = new FileReader();

        fileReader.onload = function () {
          const base64 = Base64.encode(this.result);
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
      const base64 = Base64.encode(binaryStr);
      return Promise.resolve(base64);
    }

    throw new Error(`Binary type '${binary.constructor.name}' is not supported.`);
  }

};

class Path {
  static getFilename(path) {
    const lastSlashIndex = path.lastIndexOf('/');
    return path.substr(lastSlashIndex + 1);
  }

  static getDirectory(path) {
    const lastSlashIndex = path.lastIndexOf('/');
    return path.substring(0, lastSlashIndex);
  }

  static combine(...parts) {
    return parts.filter(part => part === null || part === void 0 ? void 0 : part.trim()).join('/');
  }

}

class Regex {
  static escape(str) {
    // https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }

}

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

class XmlDepthTracker {
  constructor(maxDepth) {
    this.maxDepth = maxDepth;

    _defineProperty(this, "depth", 0);
  }

  increment() {
    this.depth++;

    if (this.depth > this.maxDepth) {
      throw new MaxXmlDepthError(this.maxDepth);
    }
  }

  decrement() {
    this.depth--;
  }

}

(function (XmlNodeType) {
  XmlNodeType["Text"] = "Text";
  XmlNodeType["General"] = "General";
})(exports.XmlNodeType || (exports.XmlNodeType = {}));

const TEXT_NODE_NAME = '#text'; // see: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName

const XmlNode = {
  //
  // factories
  //
  createTextNode(text) {
    return {
      nodeType: exports.XmlNodeType.Text,
      nodeName: TEXT_NODE_NAME,
      textContent: text
    };
  },

  createGeneralNode(name) {
    return {
      nodeType: exports.XmlNodeType.General,
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
    if (str === null || str === undefined) throw new MissingArgumentError("str");
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
    if (node.nodeType === exports.XmlNodeType.Text || node.nodeName === TEXT_NODE_NAME) {
      if (!(node.nodeType === exports.XmlNodeType.Text && node.nodeName === TEXT_NODE_NAME)) {
        throw new Error(`Invalid text node. Type: '${node.nodeType}', Name: '${node.nodeName}'.`);
      }

      return true;
    }

    return false;
  },

  cloneNode(node, deep) {
    if (!node) throw new MissingArgumentError("node");

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
    if (!newNode) throw new MissingArgumentError("newNode");
    if (!referenceNode) throw new MissingArgumentError("referenceNode");
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
    if (!newNode) throw new MissingArgumentError("newNode");
    if (!referenceNode) throw new MissingArgumentError("referenceNode");
    if (!referenceNode.parentNode) throw new Error(`'${"referenceNode"}' has no parent`);
    const childNodes = referenceNode.parentNode.childNodes;
    const referenceNodeIndex = childNodes.indexOf(referenceNode);
    XmlNode.insertChild(referenceNode.parentNode, newNode, referenceNodeIndex + 1);
  },

  insertChild(parent, child, childIndex) {
    if (!parent) throw new MissingArgumentError("parent");
    if (XmlNode.isTextNode(parent)) throw new Error('Appending children to text nodes is forbidden');
    if (!child) throw new MissingArgumentError("child");
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
    if (!parent) throw new MissingArgumentError("parent");
    if (XmlNode.isTextNode(parent)) throw new Error('Appending children to text nodes is forbidden');
    if (!child) throw new MissingArgumentError("child");
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
    if (!node) throw new MissingArgumentError("node");
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
        const lastTextNode = last(allTextNodes);
        if (!lastTextNode.textContent) lastTextNode.textContent = '';
        return lastTextNode;
      }
    } // create new text node


    const newTextNode = {
      nodeType: exports.XmlNodeType.Text,
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
   * Split the original node into two sibling nodes. Returns both nodes.
   *
   * @param parent The node to split
   * @param child The node that marks the split position.
   * @param removeChild Should this method remove the child while splitting.
   *
   * @returns Two nodes - `left` and `right`. If the `removeChild` argument is
   * `false` then the original child node is the first child of `right`.
   */
  splitByChild(parent, child, removeChild) {
    if (child.parentNode != parent) throw new Error(`Node '${"child"}' is not a direct child of '${"parent"}'.`); // create childless clone 'left'

    const left = XmlNode.cloneNode(parent, false);

    if (parent.parentNode) {
      XmlNode.insertBefore(left, parent);
    }

    const right = parent; // move nodes from 'right' to 'left'

    let curChild = right.childNodes[0];

    while (curChild != child) {
      XmlNode.remove(curChild);
      XmlNode.appendChild(left, curChild);
      curChild = right.childNodes[0];
    } // remove child


    if (removeChild) {
      XmlNode.removeChild(right, 0);
    }

    return [left, right];
  },

  findParent(node, predicate) {
    while (node) {
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
    if (!firstNode) throw new MissingArgumentError("firstNode");
    if (!lastNode) throw new MissingArgumentError("lastNode");
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

function removeChild(parent, childOrIndex) {
  if (!parent) throw new MissingArgumentError("parent");
  if (childOrIndex === null || childOrIndex === undefined) throw new MissingArgumentError("childOrIndex");
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

class XmlParser {
  /**
   * We always use the DOMParser from 'xmldom', even in the browser since it
   * handles xml namespaces more forgivingly (required mainly by the
   * RawXmlPlugin).
   */
  parse(str) {
    const doc = this.domParse(str);
    return XmlNode.fromDomNode(doc.documentElement);
  }

  domParse(str) {
    if (str === null || str === undefined) throw new MissingArgumentError("str");
    return XmlParser.parser.parseFromString(str, "text/xml");
  }

  serialize(xmlNode) {
    return XmlParser.xmlHeader + XmlNode.serialize(xmlNode);
  }

}

_defineProperty(XmlParser, "xmlHeader", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>');

_defineProperty(XmlParser, "parser", new xmldom.DOMParser());

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

    if (!docxParser) throw new MissingArgumentError("docxParser");
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
    const depth = new XmlDepthTracker(this.maxXmlDepth);
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
              const firstNode = first(match.openNodes);
              const lastNode = last(match.openNodes);
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
              node = first(match.openNodes);
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
    if (!XmlNode.isTextNode(node)) return false;
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

const getProp = require('lodash.get');

const TOKEN_ITEM_OF_ARRAY = '@item';
const TOKEN_INDEX_OF_ARRAY = '@index';
const TOKEN_COUNT_OF_ARRAY = '@count';
class ScopeData {
  constructor(data) {
    _defineProperty(this, "path", []);

    _defineProperty(this, "allData", void 0);

    this.allData = data;
  }

  getScopeData() {
    const lastKey = last(this.path);
    let result;
    let curPath = this.path.slice();

    while (result === undefined && curPath.length) {
      const curScopePath = curPath.slice(0, curPath.length - 1);

      if (lastKey === TOKEN_ITEM_OF_ARRAY) {
        result = getProp(this.allData, curScopePath);
      } else if (lastKey === TOKEN_INDEX_OF_ARRAY) {
        result = last(curScopePath);
      } else if (lastKey === TOKEN_COUNT_OF_ARRAY) {
        result = last(curScopePath) + 1;
      } else {
        result = getProp(this.allData, curScopePath.concat(lastKey));
      }

      curPath = curScopePath;
    }

    return result;
  }

}

(function (TagDisposition) {
  TagDisposition["Open"] = "Open";
  TagDisposition["Close"] = "Close";
  TagDisposition["SelfClosed"] = "SelfClosed";
})(exports.TagDisposition || (exports.TagDisposition = {}));

class TagParser {
  constructor(docParser, delimiters) {
    this.docParser = docParser;
    this.delimiters = delimiters;

    _defineProperty(this, "tagRegex", void 0);

    if (!docParser) throw new MissingArgumentError("docParser");
    if (!delimiters) throw new MissingArgumentError("delimiters");
    this.tagRegex = new RegExp(`^${Regex.escape(delimiters.tagStart)}(.*?)${Regex.escape(delimiters.tagEnd)}`, 'm');
  }

  parse(delimiters) {
    const tags = [];
    let openedTag;
    let openedDelimiter;

    for (let i = 0; i < delimiters.length; i++) {
      const delimiter = delimiters[i]; // close before open

      if (!openedTag && !delimiter.isOpen) {
        const closeTagText = delimiter.xmlTextNode.textContent;
        throw new MissingStartDelimiterError(closeTagText);
      } // open before close


      if (openedTag && delimiter.isOpen) {
        const openTagText = openedDelimiter.xmlTextNode.textContent;
        throw new MissingCloseDelimiterError(openTagText);
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
      endTextNode = this.docParser.splitTextNode(endTextNode, closeDelimiter.index + this.delimiters.tagEnd.length, true);

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
        curDelimiter.index -= closeDelimiter.index + this.delimiters.tagEnd.length;
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
      tag.disposition = exports.TagDisposition.SelfClosed;
      return;
    }

    if (tagContent.startsWith(this.delimiters.containerTagOpen)) {
      tag.disposition = exports.TagDisposition.Open;
      tag.name = tagContent.slice(this.delimiters.containerTagOpen.length).trim();
    } else if (tagContent.startsWith(this.delimiters.containerTagClose)) {
      tag.disposition = exports.TagDisposition.Close;
      tag.name = tagContent.slice(this.delimiters.containerTagClose.length).trim();
    } else {
      tag.disposition = exports.TagDisposition.SelfClosed;
      tag.name = tagContent;
    }
  }

}

(function (MimeType) {
  MimeType["Png"] = "image/png";
  MimeType["Jpeg"] = "image/jpeg";
  MimeType["Gif"] = "image/gif";
  MimeType["Bmp"] = "image/bmp";
  MimeType["Svg"] = "image/svg+xml";
})(exports.MimeType || (exports.MimeType = {}));

class MimeTypeHelper {
  static getDefaultExtension(mime) {
    switch (mime) {
      case exports.MimeType.Png:
        return 'png';

      case exports.MimeType.Jpeg:
        return 'jpg';

      case exports.MimeType.Gif:
        return 'gif';

      case exports.MimeType.Bmp:
        return 'bmp';

      case exports.MimeType.Svg:
        return 'svg';

      default:
        throw new UnsupportedFileTypeError(mime);
    }
  }

  static getOfficeRelType(mime) {
    switch (mime) {
      case exports.MimeType.Png:
      case exports.MimeType.Jpeg:
      case exports.MimeType.Gif:
      case exports.MimeType.Bmp:
      case exports.MimeType.Svg:
        return "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image";

      default:
        throw new UnsupportedFileTypeError(mime);
    }
  }

}

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
class ImagePlugin extends TemplatePlugin {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "contentType", 'image');
  }

  async simpleTagReplacements(tag, data, context) {
    const wordTextNode = this.utilities.docxParser.containingTextNode(tag.xmlTextNode);
    const content = data.getScopeData();

    if (!content || !content.source) {
      XmlNode.remove(wordTextNode);
      return;
    } // add the image file into the archive


    const mediaFilePath = await context.docx.mediaFiles.add(content.source, content.format);
    const relType = MimeTypeHelper.getOfficeRelType(content.format);
    const relId = await context.currentPart.rels.add(mediaFilePath, relType);
    await context.docx.contentTypes.ensureContentType(content.format); // create the xml markup

    const imageId = nextImageId++;
    const imageXml = this.createMarkup(imageId, relId, content.width, content.height);
    XmlNode.insertAfter(imageXml, wordTextNode);
    XmlNode.remove(wordTextNode);
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
    XmlNode.removeEmptyTextNodes(markupXml); // remove whitespace

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

(function (ContentPartType) {
  ContentPartType["MainDocument"] = "MainDocument";
  ContentPartType["DefaultHeader"] = "DefaultHeader";
  ContentPartType["FirstHeader"] = "FirstHeader";
  ContentPartType["EvenPagesHeader"] = "EvenPagesHeader";
  ContentPartType["DefaultFooter"] = "DefaultFooter";
  ContentPartType["FirstFooter"] = "FirstFooter";
  ContentPartType["EvenPagesFooter"] = "EvenPagesFooter";
})(exports.ContentPartType || (exports.ContentPartType = {}));

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

    const extension = MimeTypeHelper.getDefaultExtension(mime);
    const typeNode = XmlNode.createGeneralNode('Default');
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
    return this.root.childNodes.filter(node => !XmlNode.isTextNode(node)).length;
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
      this.contentTypes[contentTypeAttribute] = true;
    }
  }

}

_defineProperty(ContentTypesFile, "contentTypesFilePath", '[Content_Types].xml');

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

    const base64 = await Binary.toBase64(mediaFile);
    const hash = sha1(base64); // check if file already exists
    // note: this can be optimized by keeping both mapping by filename as well as by hash

    let path = Object.keys(this.hashes).find(p => this.hashes[p] === hash);
    if (path) return path; // generate unique media file name

    const extension = MimeTypeHelper.getDefaultExtension(mime);

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
      const filename = Path.getFilename(path);
      if (!filename) continue;
      const fileData = await this.zip.getFile(path).getContentBase64();
      const fileHash = sha1(fileData);
      this.hashes[filename] = fileHash;
    }
  }

}

_defineProperty(MediaFiles, "mediaDir", 'word/media');

class Relationship {
  static fromXml(xml) {
    var _xml$attributes, _xml$attributes2, _xml$attributes3, _xml$attributes4;

    return new Relationship({
      id: (_xml$attributes = xml.attributes) === null || _xml$attributes === void 0 ? void 0 : _xml$attributes['Id'],
      type: (_xml$attributes2 = xml.attributes) === null || _xml$attributes2 === void 0 ? void 0 : _xml$attributes2['Type'],
      target: (_xml$attributes3 = xml.attributes) === null || _xml$attributes3 === void 0 ? void 0 : _xml$attributes3['Target'],
      targetMode: (_xml$attributes4 = xml.attributes) === null || _xml$attributes4 === void 0 ? void 0 : _xml$attributes4['TargetMode']
    });
  }

  constructor(initial) {
    _defineProperty(this, "id", void 0);

    _defineProperty(this, "type", void 0);

    _defineProperty(this, "target", void 0);

    _defineProperty(this, "targetMode", void 0);

    Object.assign(this, initial);
  }

  toXml() {
    const node = XmlNode.createGeneralNode('Relationship');
    node.attributes = {}; // set only non-empty attributes

    for (const propKey of Object.keys(this)) {
      const value = this[propKey];

      if (value && typeof value === 'string') {
        const attrName = propKey[0].toUpperCase() + propKey.substr(1);
        node.attributes[attrName] = value;
      }
    }

    return node;
  }

}

/**
 * Handles the relationship logic of a single docx "part".
 * http://officeopenxml.com/anatomyofOOXML.php
 */

class Rels {
  constructor(partPath, zip, xmlParser) {
    this.zip = zip;
    this.xmlParser = xmlParser;

    _defineProperty(this, "rels", void 0);

    _defineProperty(this, "relTargets", void 0);

    _defineProperty(this, "nextRelId", 0);

    _defineProperty(this, "partDir", void 0);

    _defineProperty(this, "relsFilePath", void 0);

    this.partDir = partPath && Path.getDirectory(partPath);
    const partFilename = partPath && Path.getFilename(partPath);
    this.relsFilePath = Path.combine(this.partDir, '_rels', `${partFilename !== null && partFilename !== void 0 ? partFilename : ''}.rels`);
  }
  /**
   * Returns the rel ID.
   */


  async add(relTarget, relType, relTargetMode) {
    // if relTarget is an internal file it should be relative to the part dir
    if (this.partDir && relTarget.startsWith(this.partDir)) {
      relTarget = relTarget.substr(this.partDir.length + 1);
    } // parse rels file


    await this.parseRelsFile(); // already exists?

    const relTargetKey = this.getRelTargetKey(relType, relTarget);
    let relId = this.relTargets[relTargetKey];
    if (relId) return relId; // create rel node

    relId = this.getNextRelId();
    const rel = new Relationship({
      id: relId,
      type: relType,
      target: relTarget,
      targetMode: relTargetMode
    }); // update lookups

    this.rels[relId] = rel;
    this.relTargets[relTargetKey] = relId; // return

    return relId;
  }

  async list() {
    await this.parseRelsFile();
    return Object.values(this.rels);
  }
  /**
   * Save the rels file back to the zip.
   * Called automatically by the holding `Docx` before exporting.
   */


  async save() {
    // not change - no need to save
    if (!this.rels) return; // create rels xml

    const root = this.createRootNode();
    root.childNodes = Object.values(this.rels).map(rel => rel.toXml()); // serialize and save

    const xmlContent = this.xmlParser.serialize(root);
    this.zip.setFile(this.relsFilePath, xmlContent);
  } //
  // private methods
  //


  getNextRelId() {
    let relId;

    do {
      this.nextRelId++;
      relId = 'rId' + this.nextRelId;
    } while (this.rels[relId]);

    return relId;
  }

  async parseRelsFile() {
    // already parsed
    if (this.rels) return; // parse xml

    let root;
    const relsFile = this.zip.getFile(this.relsFilePath);

    if (relsFile) {
      const xml = await relsFile.getContentText();
      root = this.xmlParser.parse(xml);
    } else {
      root = this.createRootNode();
    } // parse relationship nodes


    this.rels = {};
    this.relTargets = {};

    for (const relNode of root.childNodes) {
      const attributes = relNode.attributes;
      if (!attributes) continue;
      const idAttr = attributes['Id'];
      if (!idAttr) continue; // store rel

      const rel = Relationship.fromXml(relNode);
      this.rels[idAttr] = rel; // create rel target lookup

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

  createRootNode() {
    const root = XmlNode.createGeneralNode('Relationships');
    root.attributes = {
      'xmlns': 'http://schemas.openxmlformats.org/package/2006/relationships'
    };
    root.childNodes = [];
    return root;
  }

}

/**
 * Represents an xml file that is part of an OPC package.
 *
 * See: https://en.wikipedia.org/wiki/Open_Packaging_Conventions
 */

class XmlPart {
  constructor(path, zip, xmlParser) {
    this.path = path;
    this.zip = zip;
    this.xmlParser = xmlParser;

    _defineProperty(this, "rels", void 0);

    _defineProperty(this, "root", void 0);

    this.rels = new Rels(this.path, zip, xmlParser);
  } //
  // public methods
  //

  /**
   * Get the xml root node of the part.
   * Changes to the xml will be persisted to the underlying zip file.
   */


  async xmlRoot() {
    if (!this.root) {
      const xml = await this.zip.getFile(this.path).getContentText();
      this.root = this.xmlParser.parse(xml);
    }

    return this.root;
  }
  /**
   * Get the text content of the part.
   */


  async getText() {
    const xmlDocument = await this.xmlRoot(); // ugly but good enough...

    const xml = this.xmlParser.serialize(xmlDocument);
    const domDocument = this.xmlParser.domParse(xml);
    return domDocument.documentElement.textContent;
  }

  async saveChanges() {
    // save xml
    if (this.root) {
      const xmlRoot = await this.xmlRoot();
      const xmlContent = this.xmlParser.serialize(xmlRoot);
      this.zip.setFile(this.path, xmlContent);
    } // save rels


    await this.rels.save();
  }

}

/**
 * Represents a single docx file.
 */

class Docx {
  //
  // static methods
  //
  static async open(zip, xmlParser) {
    const mainDocumentPath = await Docx.getMainDocumentPath(zip, xmlParser);
    if (!mainDocumentPath) throw new MalformedFileError('docx');
    return new Docx(mainDocumentPath, zip, xmlParser);
  }

  static async getMainDocumentPath(zip, xmlParser) {
    var _relations$find;

    const rootPart = '';
    const rootRels = new Rels(rootPart, zip, xmlParser);
    const relations = await rootRels.list();
    return (_relations$find = relations.find(rel => rel.type == Docx.mainDocumentRelType)) === null || _relations$find === void 0 ? void 0 : _relations$find.target;
  } //
  // fields
  //


  /**
   * **Notice:** You should only use this property if there is no other way to
   * do what you need. Use with caution.
   */
  get rawZipFile() {
    return this.zip;
  } //
  // constructor
  //


  constructor(mainDocumentPath, zip, xmlParser) {
    this.zip = zip;
    this.xmlParser = xmlParser;

    _defineProperty(this, "mainDocument", void 0);

    _defineProperty(this, "mediaFiles", void 0);

    _defineProperty(this, "contentTypes", void 0);

    _defineProperty(this, "_parts", {});

    this.mainDocument = new XmlPart(mainDocumentPath, zip, xmlParser);
    this.mediaFiles = new MediaFiles(zip);
    this.contentTypes = new ContentTypesFile(zip, xmlParser);
  } //
  // public methods
  //


  async getContentPart(type) {
    switch (type) {
      case exports.ContentPartType.MainDocument:
        return this.mainDocument;

      default:
        return await this.getHeaderOrFooter(type);
    }
  }
  /**
   * Returns the xml parts of the main document, headers and footers.
   */


  async getContentParts() {
    const partTypes = [exports.ContentPartType.MainDocument, exports.ContentPartType.DefaultHeader, exports.ContentPartType.FirstHeader, exports.ContentPartType.EvenPagesHeader, exports.ContentPartType.DefaultFooter, exports.ContentPartType.FirstFooter, exports.ContentPartType.EvenPagesFooter];
    const parts = await Promise.all(partTypes.map(p => this.getContentPart(p)));
    return parts.filter(p => !!p);
  }

  async export(outputType) {
    await this.saveChanges();
    return await this.zip.export(outputType);
  } //
  // private methods
  //


  async getHeaderOrFooter(type) {
    var _sectionProps$childNo, _ref, _ref$attributes;

    const nodeName = this.headerFooterNodeName(type);
    const nodeTypeAttribute = this.headerFooterType(type); // find the last section properties
    // see: http://officeopenxml.com/WPsection.php

    const docRoot = await this.mainDocument.xmlRoot();
    const body = docRoot.childNodes[0];
    const sectionProps = last(body.childNodes.filter(node => node.nodeType === exports.XmlNodeType.General));
    if (sectionProps.nodeName != 'w:sectPr') return null; // find the header or footer reference

    const reference = (_sectionProps$childNo = sectionProps.childNodes) === null || _sectionProps$childNo === void 0 ? void 0 : _sectionProps$childNo.find(node => {
      var _node$attributes;

      return node.nodeType === exports.XmlNodeType.General && node.nodeName === nodeName && ((_node$attributes = node.attributes) === null || _node$attributes === void 0 ? void 0 : _node$attributes['w:type']) === nodeTypeAttribute;
    });
    const relId = (_ref = reference) === null || _ref === void 0 ? void 0 : (_ref$attributes = _ref.attributes) === null || _ref$attributes === void 0 ? void 0 : _ref$attributes['r:id'];
    if (!relId) return null; // return the XmlPart

    const rels = await this.mainDocument.rels.list();
    const relTarget = rels.find(r => r.id === relId).target;

    if (!this._parts[relTarget]) {
      const part = new XmlPart("word/" + relTarget, this.zip, this.xmlParser);
      this._parts[relTarget] = part;
    }

    return this._parts[relTarget];
  }

  headerFooterNodeName(contentPartType) {
    switch (contentPartType) {
      case exports.ContentPartType.DefaultHeader:
      case exports.ContentPartType.FirstHeader:
      case exports.ContentPartType.EvenPagesHeader:
        return 'w:headerReference';

      case exports.ContentPartType.DefaultFooter:
      case exports.ContentPartType.FirstFooter:
      case exports.ContentPartType.EvenPagesFooter:
        return 'w:footerReference';

      default:
        throw new Error(`Invalid content part type: '${contentPartType}'.`);
    }
  }

  headerFooterType(contentPartType) {
    // https://docs.microsoft.com/en-us/dotnet/api/documentformat.openxml.wordprocessing.headerfootervalues?view=openxml-2.8.1
    switch (contentPartType) {
      case exports.ContentPartType.DefaultHeader:
      case exports.ContentPartType.DefaultFooter:
        return 'default';

      case exports.ContentPartType.FirstHeader:
      case exports.ContentPartType.FirstFooter:
        return 'first';

      case exports.ContentPartType.EvenPagesHeader:
      case exports.ContentPartType.EvenPagesFooter:
        return 'even';

      default:
        throw new Error(`Invalid content part type: '${contentPartType}'.`);
    }
  }

  async saveChanges() {
    const parts = [this.mainDocument, ...Object.values(this._parts)];

    for (const part of parts) {
      await part.saveChanges();
    }

    await this.contentTypes.save();
  }

}

_defineProperty(Docx, "mainDocumentRelType", 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument');

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
    return Docx.open(zip, this.xmlParser);
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
    const newWordTextNode = XmlNode.cloneNode(wordTextNode, true); // set space preserve to prevent display differences after splitting
    // (otherwise if there was a space in the middle of the text node and it
    // is now at the beginning or end of the text node it will be ignored)

    this.setSpacePreserveAttribute(wordTextNode);
    this.setSpacePreserveAttribute(newWordTextNode);

    if (addBefore) {
      // insert new node before existing one
      XmlNode.insertBefore(newWordTextNode, wordTextNode);
      firstXmlTextNode = XmlNode.lastTextChild(newWordTextNode);
      secondXmlTextNode = textNode;
    } else {
      // insert new node after existing one
      const curIndex = wordTextNode.parentNode.childNodes.indexOf(wordTextNode);
      XmlNode.insertChild(wordTextNode.parentNode, newWordTextNode, curIndex + 1);
      firstXmlTextNode = textNode;
      secondXmlTextNode = XmlNode.lastTextChild(newWordTextNode);
    } // edit text


    const firstText = firstXmlTextNode.textContent;
    const secondText = secondXmlTextNode.textContent;
    firstXmlTextNode.textContent = firstText.substring(0, splitIndex);
    secondXmlTextNode.textContent = secondText.substring(splitIndex);
    return addBefore ? firstXmlTextNode : secondXmlTextNode;
  }
  /**
   * Split the paragraph around the specified text node.
   *
   * @returns Two paragraphs - `left` and `right`. If the `removeTextNode` argument is
   * `false` then the original text node is the first text node of `right`.
   */


  splitParagraphByTextNode(paragraph, textNode, removeTextNode) {
    // input validation
    const containingParagraph = this.containingParagraphNode(textNode);
    if (containingParagraph != paragraph) throw new Error(`Node '${"textNode"}' is not a descendant of '${"paragraph"}'.`);
    const runNode = this.containingRunNode(textNode);
    const wordTextNode = this.containingTextNode(textNode); // create run clone

    const leftRun = XmlNode.cloneNode(runNode, false);
    const rightRun = runNode;
    XmlNode.insertBefore(leftRun, rightRun); // copy props from original run node (preserve style)

    const runProps = rightRun.childNodes.find(node => node.nodeName === DocxParser.RUN_PROPERTIES_NODE);

    if (runProps) {
      const leftRunProps = XmlNode.cloneNode(runProps, true);
      XmlNode.appendChild(leftRun, leftRunProps);
    } // move nodes from 'right' to 'left'


    const firstRunChildIndex = runProps ? 1 : 0;
    let curChild = rightRun.childNodes[firstRunChildIndex];

    while (curChild != wordTextNode) {
      XmlNode.remove(curChild);
      XmlNode.appendChild(leftRun, curChild);
      curChild = rightRun.childNodes[firstRunChildIndex];
    } // remove text node


    if (removeTextNode) {
      XmlNode.removeChild(rightRun, firstRunChildIndex);
    } // create paragraph clone


    const leftPara = XmlNode.cloneNode(containingParagraph, false);
    const rightPara = containingParagraph;
    XmlNode.insertBefore(leftPara, rightPara); // copy props from original paragraph (preserve style)

    const paragraphProps = rightPara.childNodes.find(node => node.nodeName === DocxParser.PARAGRAPH_PROPERTIES_NODE);

    if (paragraphProps) {
      const leftParagraphProps = XmlNode.cloneNode(paragraphProps, true);
      XmlNode.appendChild(leftPara, leftParagraphProps);
    } // move nodes from 'right' to 'left'


    const firstParaChildIndex = paragraphProps ? 1 : 0;
    curChild = rightPara.childNodes[firstParaChildIndex];

    while (curChild != rightRun) {
      XmlNode.remove(curChild);
      XmlNode.appendChild(leftPara, curChild);
      curChild = rightPara.childNodes[firstParaChildIndex];
    } // clean paragraphs - remove empty runs


    if (this.isEmptyRun(leftRun)) XmlNode.remove(leftRun);
    if (this.isEmptyRun(rightRun)) XmlNode.remove(rightRun);
    return [leftPara, rightPara];
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

        const curXmlTextNode = XmlNode.lastTextChild(curWordTextNode);
        totalText.push(curXmlTextNode.textContent); // next text node

        const textToRemove = curWordTextNode;

        if (curWordTextNode === secondWordTextNode) {
          curWordTextNode = null;
        } else {
          curWordTextNode = curWordTextNode.nextSibling;
        } // remove current text node


        if (textToRemove !== firstWordTextNode) {
          XmlNode.remove(textToRemove);
        }
      } // next run


      const runToRemove = curRunNode;

      if (curRunNode === secondRunNode) {
        curRunNode = null;
      } else {
        curRunNode = curRunNode.nextSibling;
      } // remove current run


      if (!runToRemove.childNodes || !runToRemove.childNodes.length) {
        XmlNode.remove(runToRemove);
      }
    } // set the text content


    const firstXmlTextNode = XmlNode.lastTextChild(firstWordTextNode);
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
        XmlNode.removeChild(second, childIndex);
        XmlNode.appendChild(first, curChild);
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

  isRunNode(node) {
    return node.nodeName === DocxParser.RUN_NODE;
  }

  isRunPropertiesNode(node) {
    return node.nodeName === DocxParser.RUN_PROPERTIES_NODE;
  }

  isTableCellNode(node) {
    return node.nodeName === DocxParser.TABLE_CELL_NODE;
  }

  isParagraphNode(node) {
    return node.nodeName === DocxParser.PARAGRAPH_NODE;
  }

  isListParagraph(paragraphNode) {
    const paragraphProperties = this.paragraphPropertiesNode(paragraphNode);
    const listNumberProperties = XmlNode.findChildByName(paragraphProperties, DocxParser.NUMBER_PROPERTIES_NODE);
    return !!listNumberProperties;
  }

  paragraphPropertiesNode(paragraphNode) {
    if (!this.isParagraphNode(paragraphNode)) throw new Error(`Expected paragraph node but received a '${paragraphNode.nodeName}' node.`);
    return XmlNode.findChildByName(paragraphNode, DocxParser.PARAGRAPH_PROPERTIES_NODE);
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
    if (!XmlNode.isTextNode(node)) throw new Error(`'Invalid argument ${"node"}. Expected a XmlTextNode.`);
    return XmlNode.findParentByName(node, DocxParser.TEXT_NODE);
  }
  /**
   * Search **upwards** for the first run node.
   */


  containingRunNode(node) {
    return XmlNode.findParentByName(node, DocxParser.RUN_NODE);
  }
  /**
   * Search **upwards** for the first paragraph node.
   */


  containingParagraphNode(node) {
    return XmlNode.findParentByName(node, DocxParser.PARAGRAPH_NODE);
  }
  /**
   * Search **upwards** for the first "table row" node.
   */


  containingTableRowNode(node) {
    return XmlNode.findParentByName(node, DocxParser.TABLE_ROW_NODE);
  } //
  // advanced node queries
  //


  isEmptyTextNode(node) {
    var _node$childNodes;

    if (!this.isTextNode(node)) throw new Error(`Text node expected but '${node.nodeName}' received.`);
    if (!((_node$childNodes = node.childNodes) === null || _node$childNodes === void 0 ? void 0 : _node$childNodes.length)) return true;
    const xmlTextNode = node.childNodes[0];
    if (!XmlNode.isTextNode(xmlTextNode)) throw new Error("Invalid XML structure. 'w:t' node should contain a single text node only.");
    if (!xmlTextNode.textContent) return true;
    return false;
  }

  isEmptyRun(node) {
    if (!this.isRunNode(node)) throw new Error(`Run node expected but '${node.nodeName}' received.`);

    for (const child of (_node$childNodes2 = node.childNodes) !== null && _node$childNodes2 !== void 0 ? _node$childNodes2 : []) {
      var _node$childNodes2;

      if (this.isRunPropertiesNode(child)) continue;
      if (this.isTextNode(child) && this.isEmptyTextNode(child)) continue;
      return false;
    }

    return true;
  }

}

_defineProperty(DocxParser, "PARAGRAPH_NODE", 'w:p');

_defineProperty(DocxParser, "PARAGRAPH_PROPERTIES_NODE", 'w:pPr');

_defineProperty(DocxParser, "RUN_NODE", 'w:r');

_defineProperty(DocxParser, "RUN_PROPERTIES_NODE", 'w:rPr');

_defineProperty(DocxParser, "TEXT_NODE", 'w:t');

_defineProperty(DocxParser, "TABLE_ROW_NODE", 'w:tr');

_defineProperty(DocxParser, "TABLE_CELL_NODE", 'w:tc');

_defineProperty(DocxParser, "NUMBER_PROPERTIES_NODE", 'w:numPr');

class LinkPlugin extends TemplatePlugin {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "contentType", 'link');
  }

  async simpleTagReplacements(tag, data, context) {
    const wordTextNode = this.utilities.docxParser.containingTextNode(tag.xmlTextNode);
    const content = data.getScopeData();

    if (!content || !content.target) {
      XmlNode.remove(wordTextNode);
      return;
    } // add rel


    const relId = await context.currentPart.rels.add(content.target, LinkPlugin.linkRelType, 'External'); // generate markup

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
    XmlNode.removeEmptyTextNodes(markupXml); // remove whitespace
    // copy props from original run node (preserve style)

    const runProps = wordRunNode.childNodes.find(node => node.nodeName === DocxParser.RUN_PROPERTIES_NODE);

    if (runProps) {
      const linkRunProps = XmlNode.cloneNode(runProps, true);
      markupXml.childNodes[0].childNodes.unshift(linkRunProps);
    }

    return markupXml;
  }

  insertHyperlinkNode(linkMarkup, tagRunNode, tagTextNode) {
    // Links are inserted at the 'run' level.
    // Therefor we isolate the link tag to it's own run (it is already
    // isolated to it's own text node), insert the link markup and remove
    // the run.
    let textNodesInRun = tagRunNode.childNodes.filter(node => node.nodeName === DocxParser.TEXT_NODE);

    if (textNodesInRun.length > 1) {
      const [runBeforeTag] = XmlNode.splitByChild(tagRunNode, tagTextNode, true);
      textNodesInRun = runBeforeTag.childNodes.filter(node => node.nodeName === DocxParser.TEXT_NODE);
      XmlNode.insertAfter(linkMarkup, runBeforeTag);

      if (textNodesInRun.length === 0) {
        XmlNode.remove(runBeforeTag);
      }
    } // already isolated
    else {
        XmlNode.insertAfter(linkMarkup, tagRunNode);
        XmlNode.remove(tagRunNode);
      }
  }

}

_defineProperty(LinkPlugin, "linkRelType", 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink');

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
    const paragraphsToRepeat = XmlNode.siblingsInRange(firstParagraph, lastParagraph); // remove the loop tags

    XmlNode.remove(openTag.xmlTextNode);
    XmlNode.remove(closeTag.xmlTextNode);
    return {
      firstNode: firstParagraph,
      nodesToRepeat: paragraphsToRepeat,
      lastNode: lastParagraph
    };
  }

  mergeBack(paragraphGroups, firstParagraph, lastParagraphs) {
    for (const curParagraphsGroup of paragraphGroups) {
      for (const paragraph of curParagraphsGroup) {
        XmlNode.insertBefore(paragraph, lastParagraphs);
      }
    } // remove the old paragraphs


    XmlNode.remove(firstParagraph);

    if (firstParagraph !== lastParagraphs) {
      XmlNode.remove(lastParagraphs);
    }
  }

}

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
    const areSame = firstParagraph === lastParagraph; // split first paragraph

    let splitResult = this.utilities.docxParser.splitParagraphByTextNode(firstParagraph, openTag.xmlTextNode, true);
    firstParagraph = splitResult[0];
    let afterFirstParagraph = splitResult[1];
    if (areSame) lastParagraph = afterFirstParagraph; // split last paragraph

    splitResult = this.utilities.docxParser.splitParagraphByTextNode(lastParagraph, closeTag.xmlTextNode, true);
    const beforeLastParagraph = splitResult[0];
    lastParagraph = splitResult[1];
    if (areSame) afterFirstParagraph = beforeLastParagraph; // disconnect splitted paragraph from their parents

    XmlNode.remove(afterFirstParagraph);
    if (!areSame) XmlNode.remove(beforeLastParagraph); // extract all paragraphs in between

    let middleParagraphs;

    if (areSame) {
      middleParagraphs = [afterFirstParagraph];
    } else {
      const inBetween = XmlNode.removeSiblings(firstParagraph, lastParagraph);
      middleParagraphs = [afterFirstParagraph].concat(inBetween).concat(beforeLastParagraph);
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
        XmlNode.insertBefore(curParagraphsGroup[i], lastParagraph);
        mergeTo = curParagraphsGroup[i];
      }
    } // merge last paragraph


    this.utilities.docxParser.joinParagraphs(mergeTo, lastParagraph); // remove the old last paragraph (was merged into the new one)

    XmlNode.remove(lastParagraph);
  }

}

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
    const rowsToRepeat = XmlNode.siblingsInRange(firstRow, lastRow); // remove the loop tags

    XmlNode.remove(openTag.xmlTextNode);
    XmlNode.remove(closeTag.xmlTextNode);
    return {
      firstNode: firstRow,
      nodesToRepeat: rowsToRepeat,
      lastNode: lastRow
    };
  }

  mergeBack(rowGroups, firstRow, lastRow) {
    for (const curRowsGroup of rowGroups) {
      for (const row of curRowsGroup) {
        XmlNode.insertBefore(row, lastRow);
      }
    } // remove the old rows


    XmlNode.remove(firstRow);

    if (firstRow !== lastRow) {
      XmlNode.remove(lastRow);
    }
  }

}

const LOOP_CONTENT_TYPE = 'loop';
class LoopPlugin extends TemplatePlugin {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "contentType", LOOP_CONTENT_TYPE);

    _defineProperty(this, "loopStrategies", [new LoopTableStrategy(), new LoopListStrategy(), new LoopParagraphStrategy() // the default strategy
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
    const closeTag = last(tags); // select the suitable strategy

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
      const curResult = nodes.map(node => XmlNode.cloneNode(node, true));
      allResults.push(curResult);
    }

    return allResults;
  }

  async compile(nodeGroups, data, context) {
    const compiledNodeGroups = []; // compile each node group with it's relevant data

    for (let i = 0; i < nodeGroups.length; i++) {
      // create dummy root node
      const curNodes = nodeGroups[i];
      const dummyRootNode = XmlNode.createGeneralNode('dummyRootNode');
      curNodes.forEach(node => XmlNode.appendChild(dummyRootNode, node)); // compile the new root

      data.path.push(i);
      await this.utilities.compiler.compile(dummyRootNode, data, context);
      data.path.pop(); // disconnect from dummy root

      const curResult = [];

      while (dummyRootNode.childNodes && dummyRootNode.childNodes.length) {
        const child = XmlNode.removeChild(dummyRootNode, 0);
        curResult.push(child);
      }

      compiledNodeGroups.push(curResult);
    }

    return compiledNodeGroups;
  }

}

class RawXmlPlugin extends TemplatePlugin {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "contentType", 'rawXml');
  }

  simpleTagReplacements(tag, data) {
    const value = data.getScopeData();
    const replaceNode = (value === null || value === void 0 ? void 0 : value.replaceParagraph) ? this.utilities.docxParser.containingParagraphNode(tag.xmlTextNode) : this.utilities.docxParser.containingTextNode(tag.xmlTextNode);

    if (typeof (value === null || value === void 0 ? void 0 : value.xml) === 'string') {
      const newNode = this.utilities.xmlParser.parse(value.xml);
      XmlNode.insertBefore(newNode, replaceNode);
    }

    XmlNode.remove(replaceNode);
  }

}

const TEXT_CONTENT_TYPE = 'text';
class TextPlugin extends TemplatePlugin {
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
      XmlNode.appendChild(runNode, lineBreak); // add text

      const lineNode = this.createWordTextNode(lines[i]);
      XmlNode.appendChild(runNode, lineNode);
    }
  }

  getLineBreak() {
    return XmlNode.createGeneralNode('w:br');
  }

  createWordTextNode(text) {
    const wordTextNode = XmlNode.createGeneralNode(DocxParser.TEXT_NODE);
    wordTextNode.attributes = {};
    this.utilities.docxParser.setSpacePreserveAttribute(wordTextNode);
    wordTextNode.childNodes = [XmlNode.createTextNode(text)];
    return wordTextNode;
  }

}

function createDefaultPlugins() {
  return [new LoopPlugin(), new RawXmlPlugin(), new ImagePlugin(), new LinkPlugin(), new TextPlugin()];
}

const PluginContent = {
  isPluginContent(content) {
    return !!content && typeof content._type === 'string';
  }

};

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

    this.pluginsLookup = toDictionary(plugins, p => p.contentType);
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
        throw new UnknownContentTypeError(contentType, tag.rawText, data.path.join('.'));
      }

      if (tag.disposition === exports.TagDisposition.SelfClosed) {
        // replace simple tag
        const job = plugin.simpleTagReplacements(tag, data, context);

        if (isPromiseLike(job)) {
          await job;
        }
      } else if (tag.disposition === exports.TagDisposition.Open) {
        // get all tags between the open and close tags
        const closingTagIndex = this.findCloseTagIndex(tagIndex, tag, tags);
        const scopeTags = tags.slice(tagIndex, closingTagIndex + 1);
        tagIndex = closingTagIndex; // replace container tag

        const job = plugin.containerTagReplacements(scopeTags, data, context);

        if (isPromiseLike(job)) {
          await job;
        }
      }

      data.path.pop();
    }
  }

  detectContentType(tag, data) {
    // explicit content type
    const scopeData = data.getScopeData();
    if (PluginContent.isPluginContent(scopeData)) return scopeData._type; // implicit - loop

    if (tag.disposition === exports.TagDisposition.Open || tag.disposition === exports.TagDisposition.Close) return this.containerContentType; // implicit - text

    return this.defaultContentType;
  }

  findCloseTagIndex(fromIndex, openTag, tags) {
    let i = fromIndex;

    for (; i < tags.length; i++) {
      const closeTag = tags[i];

      if (closeTag.name === openTag.name && closeTag.disposition === exports.TagDisposition.Close) {
        break;
      }
    }

    if (i === tags.length) {
      throw new UnclosedTagError(openTag.name);
    }

    return i;
  }

}

class TemplateExtension {
  constructor() {
    _defineProperty(this, "utilities", void 0);
  }

  /**
   * Called by the TemplateHandler at runtime.
   */
  setUtilities(utilities) {
    this.utilities = utilities;
  }

}

class JsZipHelper {
  static toJsZipOutputType(binaryOrType) {
    if (!binaryOrType) throw new MissingArgumentError("binaryOrType");
    let binaryType;

    if (typeof binaryOrType === 'function') {
      binaryType = binaryOrType;
    } else {
      binaryType = binaryOrType.constructor;
    }

    if (Binary.isBlobConstructor(binaryType)) return 'blob';
    if (Binary.isArrayBufferConstructor(binaryType)) return 'arraybuffer';
    if (Binary.isBufferConstructor(binaryType)) return 'nodebuffer';
    throw new Error(`Binary type '${binaryType.name}' is not supported.`);
  }

}

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
    const zipOutputType = JsZipHelper.toJsZipOutputType(outputType);
    return this.zipObject.async(zipOutputType);
  }

}

class Zip {
  static async load(file) {
    const zip = await JSZip.loadAsync(file);
    return new Zip(zip);
  }

  constructor(zip) {
    this.zip = zip;
  }

  getFile(path) {
    const internalZipObject = this.zip.files[path];
    if (!internalZipObject) return null;
    return new ZipObject(internalZipObject);
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
    const zipOutputType = JsZipHelper.toJsZipOutputType(outputType);
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

class TemplateHandlerOptions {
  constructor(initial) {
    _defineProperty(this, "plugins", createDefaultPlugins());

    _defineProperty(this, "defaultContentType", TEXT_CONTENT_TYPE);

    _defineProperty(this, "containerContentType", LOOP_CONTENT_TYPE);

    _defineProperty(this, "delimiters", new Delimiters());

    _defineProperty(this, "maxXmlDepth", 20);

    _defineProperty(this, "extensions", {});

    Object.assign(this, initial);

    if (initial) {
      this.delimiters = new Delimiters(initial.delimiters);
    }

    if (!this.plugins.length) {
      throw new Error('Plugins list can not be empty');
    }
  }

}

class TemplateHandler {
  /**
   * Version number of the `easy-template-x` library.
   */
  constructor(options) {
    var _this$options$extensi, _this$options$extensi2, _this$options$extensi3, _this$options$extensi4;

    _defineProperty(this, "version",  "1.0.1" );

    _defineProperty(this, "xmlParser", new XmlParser());

    _defineProperty(this, "docxParser", void 0);

    _defineProperty(this, "compiler", void 0);

    _defineProperty(this, "options", void 0);

    this.options = new TemplateHandlerOptions(options); //
    // this is the library's composition root
    //

    this.docxParser = new DocxParser(this.xmlParser);
    const delimiterSearcher = new DelimiterSearcher(this.docxParser);
    delimiterSearcher.startDelimiter = this.options.delimiters.tagStart;
    delimiterSearcher.endDelimiter = this.options.delimiters.tagEnd;
    delimiterSearcher.maxXmlDepth = this.options.maxXmlDepth;
    const tagParser = new TagParser(this.docxParser, this.options.delimiters);
    this.compiler = new TemplateCompiler(delimiterSearcher, tagParser, this.options.plugins, this.options.defaultContentType, this.options.containerContentType);
    this.options.plugins.forEach(plugin => {
      plugin.setUtilities({
        xmlParser: this.xmlParser,
        docxParser: this.docxParser,
        compiler: this.compiler
      });
    });
    const extensionUtilities = {
      xmlParser: this.xmlParser,
      docxParser: this.docxParser,
      tagParser,
      compiler: this.compiler
    };
    (_this$options$extensi = this.options.extensions) === null || _this$options$extensi === void 0 ? void 0 : (_this$options$extensi2 = _this$options$extensi.beforeCompilation) === null || _this$options$extensi2 === void 0 ? void 0 : _this$options$extensi2.forEach(extension => {
      extension.setUtilities(extensionUtilities);
    });
    (_this$options$extensi3 = this.options.extensions) === null || _this$options$extensi3 === void 0 ? void 0 : (_this$options$extensi4 = _this$options$extensi3.afterCompilation) === null || _this$options$extensi4 === void 0 ? void 0 : _this$options$extensi4.forEach(extension => {
      extension.setUtilities(extensionUtilities);
    });
  } //
  // public methods
  //


  async process(templateFile, data) {
    // load the docx file
    const docx = await this.loadDocx(templateFile); // prepare context

    const scopeData = new ScopeData(data);
    const context = {
      docx,
      currentPart: null
    };
    const contentParts = await docx.getContentParts();

    for (const part of contentParts) {
      var _this$options$extensi5, _this$options$extensi6;

      context.currentPart = part; // extensions - before compilation

      await this.callExtensions((_this$options$extensi5 = this.options.extensions) === null || _this$options$extensi5 === void 0 ? void 0 : _this$options$extensi5.beforeCompilation, scopeData, context); // compilation (do replacements)

      const xmlRoot = await part.xmlRoot();
      await this.compiler.compile(xmlRoot, scopeData, context); // extensions - after compilation

      await this.callExtensions((_this$options$extensi6 = this.options.extensions) === null || _this$options$extensi6 === void 0 ? void 0 : _this$options$extensi6.afterCompilation, scopeData, context);
    } // export the result


    return docx.export(templateFile.constructor);
  }
  /**
   * Get the text content of a single part of the document.
   * If the part does not exists returns null.
   *
   * @param contentPart
   * The content part of which to get it's text content.
   * Defaults to `ContentPartType.MainDocument`.
   */


  async parseTags(templateFile, contentPart = exports.ContentPartType.MainDocument) {
    const docx = await this.loadDocx(templateFile);
    const part = await docx.getContentPart(contentPart);
    const xmlRoot = await part.xmlRoot();
    return this.compiler.parseTags(xmlRoot);
  }
  /**
   * Get the text content of a single part of the document.
   * If the part does not exists returns null.
   *
   * @param contentPart
   * The content part of which to get it's text content.
   * Defaults to `ContentPartType.MainDocument`.
   */


  async getText(docxFile, contentPart = exports.ContentPartType.MainDocument) {
    const docx = await this.loadDocx(docxFile);
    const part = await docx.getContentPart(contentPart);
    const text = await part.getText();
    return text;
  }
  /**
   * Get the xml root of a single part of the document.
   * If the part does not exists returns null.
   *
   * @param contentPart
   * The content part of which to get it's text content.
   * Defaults to `ContentPartType.MainDocument`.
   */


  async getXml(docxFile, contentPart = exports.ContentPartType.MainDocument) {
    const docx = await this.loadDocx(docxFile);
    const part = await docx.getContentPart(contentPart);
    const xmlRoot = await part.xmlRoot();
    return xmlRoot;
  } //
  // private methods
  //


  async callExtensions(extensions, scopeData, context) {
    if (!extensions) return;

    for (const extension of extensions) {
      await extension.execute(scopeData, context);
    }
  }

  async loadDocx(file) {
    // load the zip file
    let zip;

    try {
      zip = await Zip.load(file);
    } catch (_unused) {
      throw new MalformedFileError('docx');
    } // load the docx file


    const docx = await this.docxParser.load(zip);
    return docx;
  }

}

exports.Base64 = Base64;
exports.Binary = Binary;
exports.DelimiterSearcher = DelimiterSearcher;
exports.Delimiters = Delimiters;
exports.Docx = Docx;
exports.DocxParser = DocxParser;
exports.ImagePlugin = ImagePlugin;
exports.LOOP_CONTENT_TYPE = LOOP_CONTENT_TYPE;
exports.LinkPlugin = LinkPlugin;
exports.LoopPlugin = LoopPlugin;
exports.MalformedFileError = MalformedFileError;
exports.MaxXmlDepthError = MaxXmlDepthError;
exports.MimeTypeHelper = MimeTypeHelper;
exports.MissingArgumentError = MissingArgumentError;
exports.MissingCloseDelimiterError = MissingCloseDelimiterError;
exports.MissingStartDelimiterError = MissingStartDelimiterError;
exports.Path = Path;
exports.PluginContent = PluginContent;
exports.RawXmlPlugin = RawXmlPlugin;
exports.Regex = Regex;
exports.ScopeData = ScopeData;
exports.TEXT_CONTENT_TYPE = TEXT_CONTENT_TYPE;
exports.TEXT_NODE_NAME = TEXT_NODE_NAME;
exports.TagParser = TagParser;
exports.TemplateCompiler = TemplateCompiler;
exports.TemplateExtension = TemplateExtension;
exports.TemplateHandler = TemplateHandler;
exports.TemplateHandlerOptions = TemplateHandlerOptions;
exports.TemplatePlugin = TemplatePlugin;
exports.TextPlugin = TextPlugin;
exports.UnclosedTagError = UnclosedTagError;
exports.UnidentifiedFileTypeError = UnidentifiedFileTypeError;
exports.UnknownContentTypeError = UnknownContentTypeError;
exports.UnopenedTagError = UnopenedTagError;
exports.UnsupportedFileTypeError = UnsupportedFileTypeError;
exports.XmlDepthTracker = XmlDepthTracker;
exports.XmlNode = XmlNode;
exports.XmlParser = XmlParser;
exports.XmlPart = XmlPart;
exports.Zip = Zip;
exports.ZipObject = ZipObject;
exports.createDefaultPlugins = createDefaultPlugins;
exports.first = first;
exports.inheritsFrom = inheritsFrom;
exports.isPromiseLike = isPromiseLike;
exports.last = last;
exports.pushMany = pushMany;
exports.sha1 = sha1;
exports.toDictionary = toDictionary;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWFzeS10ZW1wbGF0ZS14LmpzIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXJyb3JzL21hbGZvcm1lZEZpbGVFcnJvci50cyIsIi4uLy4uL3NyYy9lcnJvcnMvbWF4WG1sRGVwdGhFcnJvci50cyIsIi4uLy4uL3NyYy9lcnJvcnMvbWlzc2luZ0FyZ3VtZW50RXJyb3IudHMiLCIuLi8uLi9zcmMvZXJyb3JzL21pc3NpbmdDbG9zZURlbGltaXRlckVycm9yLnRzIiwiLi4vLi4vc3JjL2Vycm9ycy9taXNzaW5nU3RhcnREZWxpbWl0ZXJFcnJvci50cyIsIi4uLy4uL3NyYy9lcnJvcnMvdW5jbG9zZWRUYWdFcnJvci50cyIsIi4uLy4uL3NyYy9lcnJvcnMvdW5pZGVudGlmaWVkRmlsZVR5cGVFcnJvci50cyIsIi4uLy4uL3NyYy9lcnJvcnMvdW5rbm93bkNvbnRlbnRUeXBlRXJyb3IudHMiLCIuLi8uLi9zcmMvZXJyb3JzL3Vub3BlbmVkVGFnRXJyb3IudHMiLCIuLi8uLi9zcmMvZXJyb3JzL3Vuc3VwcG9ydGVkRmlsZVR5cGVFcnJvci50cyIsIi4uLy4uL3NyYy91dGlscy9hcnJheS50cyIsIi4uLy4uL3NyYy91dGlscy9iYXNlNjQudHMiLCIuLi8uLi9zcmMvdXRpbHMvdHlwZXMudHMiLCIuLi8uLi9zcmMvdXRpbHMvYmluYXJ5LnRzIiwiLi4vLi4vc3JjL3V0aWxzL3BhdGgudHMiLCIuLi8uLi9zcmMvdXRpbHMvcmVnZXgudHMiLCIuLi8uLi9zcmMvdXRpbHMvc2hhMS50cyIsIi4uLy4uL3NyYy94bWwveG1sRGVwdGhUcmFja2VyLnRzIiwiLi4vLi4vc3JjL3htbC94bWxOb2RlLnRzIiwiLi4vLi4vc3JjL3htbC94bWxQYXJzZXIudHMiLCIuLi8uLi9zcmMvY29tcGlsYXRpb24vZGVsaW1pdGVyU2VhcmNoZXIudHMiLCIuLi8uLi9zcmMvY29tcGlsYXRpb24vc2NvcGVEYXRhLnRzIiwiLi4vLi4vc3JjL2NvbXBpbGF0aW9uL3RhZy50cyIsIi4uLy4uL3NyYy9jb21waWxhdGlvbi90YWdQYXJzZXIudHMiLCIuLi8uLi9zcmMvbWltZVR5cGUudHMiLCIuLi8uLi9zcmMvcGx1Z2lucy90ZW1wbGF0ZVBsdWdpbi50cyIsIi4uLy4uL3NyYy9wbHVnaW5zL2ltYWdlL2ltYWdlUGx1Z2luLnRzIiwiLi4vLi4vc3JjL29mZmljZS9jb250ZW50UGFydFR5cGUudHMiLCIuLi8uLi9zcmMvb2ZmaWNlL2NvbnRlbnRUeXBlc0ZpbGUudHMiLCIuLi8uLi9zcmMvb2ZmaWNlL21lZGlhRmlsZXMudHMiLCIuLi8uLi9zcmMvb2ZmaWNlL3JlbGF0aW9uc2hpcC50cyIsIi4uLy4uL3NyYy9vZmZpY2UvcmVscy50cyIsIi4uLy4uL3NyYy9vZmZpY2UveG1sUGFydC50cyIsIi4uLy4uL3NyYy9vZmZpY2UvZG9jeC50cyIsIi4uLy4uL3NyYy9vZmZpY2UvZG9jeFBhcnNlci50cyIsIi4uLy4uL3NyYy9wbHVnaW5zL2xpbmsvbGlua1BsdWdpbi50cyIsIi4uLy4uL3NyYy9wbHVnaW5zL2xvb3Avc3RyYXRlZ3kvbG9vcExpc3RTdHJhdGVneS50cyIsIi4uLy4uL3NyYy9wbHVnaW5zL2xvb3Avc3RyYXRlZ3kvbG9vcFBhcmFncmFwaFN0cmF0ZWd5LnRzIiwiLi4vLi4vc3JjL3BsdWdpbnMvbG9vcC9zdHJhdGVneS9sb29wVGFibGVTdHJhdGVneS50cyIsIi4uLy4uL3NyYy9wbHVnaW5zL2xvb3AvbG9vcFBsdWdpbi50cyIsIi4uLy4uL3NyYy9wbHVnaW5zL3Jhd1htbC9yYXdYbWxQbHVnaW4udHMiLCIuLi8uLi9zcmMvcGx1Z2lucy90ZXh0L3RleHRQbHVnaW4udHMiLCIuLi8uLi9zcmMvcGx1Z2lucy9kZWZhdWx0UGx1Z2lucy50cyIsIi4uLy4uL3NyYy9wbHVnaW5zL3BsdWdpbkNvbnRlbnQudHMiLCIuLi8uLi9zcmMvY29tcGlsYXRpb24vdGVtcGxhdGVDb21waWxlci50cyIsIi4uLy4uL3NyYy9leHRlbnNpb25zL3RlbXBsYXRlRXh0ZW5zaW9uLnRzIiwiLi4vLi4vc3JjL3ppcC9qc1ppcEhlbHBlci50cyIsIi4uLy4uL3NyYy96aXAvemlwT2JqZWN0LnRzIiwiLi4vLi4vc3JjL3ppcC96aXAudHMiLCIuLi8uLi9zcmMvZGVsaW1pdGVycy50cyIsIi4uLy4uL3NyYy90ZW1wbGF0ZUhhbmRsZXJPcHRpb25zLnRzIiwiLi4vLi4vc3JjL3RlbXBsYXRlSGFuZGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgTWFsZm9ybWVkRmlsZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXG4gICAgcHVibGljIHJlYWRvbmx5IGV4cGVjdGVkRmlsZVR5cGU6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGV4cGVjdGVkRmlsZVR5cGU6IHN0cmluZykge1xuICAgICAgICBzdXBlcihgTWFsZm9ybWVkIGZpbGUgZGV0ZWN0ZWQuIE1ha2Ugc3VyZSB0aGUgZmlsZSBpcyBhIHZhbGlkICR7ZXhwZWN0ZWRGaWxlVHlwZX0gZmlsZS5gKTtcblxuICAgICAgICB0aGlzLmV4cGVjdGVkRmlsZVR5cGUgPSBleHBlY3RlZEZpbGVUeXBlO1xuXG4gICAgICAgIC8vIHR5cGVzY3JpcHQgaGFjazogaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0LXdpa2kvYmxvYi9tYXN0ZXIvQnJlYWtpbmctQ2hhbmdlcy5tZCNleHRlbmRpbmctYnVpbHQtaW5zLWxpa2UtZXJyb3ItYXJyYXktYW5kLW1hcC1tYXktbm8tbG9uZ2VyLXdvcmtcbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIE1hbGZvcm1lZEZpbGVFcnJvci5wcm90b3R5cGUpO1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgTWF4WG1sRGVwdGhFcnJvciBleHRlbmRzIEVycm9yIHtcblxuICAgIHB1YmxpYyByZWFkb25seSBtYXhEZXB0aDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IobWF4RGVwdGg6IG51bWJlcikge1xuICAgICAgICBzdXBlcihgWE1MIG1heGltdW0gZGVwdGggcmVhY2hlZCAobWF4IGRlcHRoOiAke21heERlcHRofSkuYCk7XG5cbiAgICAgICAgdGhpcy5tYXhEZXB0aCA9IG1heERlcHRoO1xuXG4gICAgICAgIC8vIHR5cGVzY3JpcHQgaGFjazogaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0LXdpa2kvYmxvYi9tYXN0ZXIvQnJlYWtpbmctQ2hhbmdlcy5tZCNleHRlbmRpbmctYnVpbHQtaW5zLWxpa2UtZXJyb3ItYXJyYXktYW5kLW1hcC1tYXktbm8tbG9uZ2VyLXdvcmtcbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIE1heFhtbERlcHRoRXJyb3IucHJvdG90eXBlKTtcbiAgICB9XG59IiwiZXhwb3J0IGNsYXNzIE1pc3NpbmdBcmd1bWVudEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXG4gICAgcHVibGljIHJlYWRvbmx5IGFyZ05hbWU6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGFyZ05hbWU6IHN0cmluZykge1xuICAgICAgICBzdXBlcihgQXJndW1lbnQgJyR7YXJnTmFtZX0nIGlzIG1pc3NpbmcuYCk7XG5cbiAgICAgICAgdGhpcy5hcmdOYW1lID0gYXJnTmFtZTtcblxuICAgICAgICAvLyB0eXBlc2NyaXB0IGhhY2s6IGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC13aWtpL2Jsb2IvbWFzdGVyL0JyZWFraW5nLUNoYW5nZXMubWQjZXh0ZW5kaW5nLWJ1aWx0LWlucy1saWtlLWVycm9yLWFycmF5LWFuZC1tYXAtbWF5LW5vLWxvbmdlci13b3JrXG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBNaXNzaW5nQXJndW1lbnRFcnJvci5wcm90b3R5cGUpO1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgTWlzc2luZ0Nsb3NlRGVsaW1pdGVyRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgb3BlbkRlbGltaXRlclRleHQ6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKG9wZW5EZWxpbWl0ZXJUZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoYENsb3NlIGRlbGltaXRlciBpcyBtaXNzaW5nIGZyb20gJyR7b3BlbkRlbGltaXRlclRleHR9Jy5gKTtcblxuICAgICAgICB0aGlzLm9wZW5EZWxpbWl0ZXJUZXh0ID0gb3BlbkRlbGltaXRlclRleHQ7XG5cbiAgICAgICAgLy8gdHlwZXNjcmlwdCBoYWNrOiBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQtd2lraS9ibG9iL21hc3Rlci9CcmVha2luZy1DaGFuZ2VzLm1kI2V4dGVuZGluZy1idWlsdC1pbnMtbGlrZS1lcnJvci1hcnJheS1hbmQtbWFwLW1heS1uby1sb25nZXItd29ya1xuICAgICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgTWlzc2luZ0Nsb3NlRGVsaW1pdGVyRXJyb3IucHJvdG90eXBlKTtcbiAgICB9XG59IiwiZXhwb3J0IGNsYXNzIE1pc3NpbmdTdGFydERlbGltaXRlckVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXG4gICAgcHVibGljIHJlYWRvbmx5IGNsb3NlRGVsaW1pdGVyVGV4dDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoY2xvc2VEZWxpbWl0ZXJUZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoYE9wZW4gZGVsaW1pdGVyIGlzIG1pc3NpbmcgZnJvbSAnJHtjbG9zZURlbGltaXRlclRleHR9Jy5gKTtcblxuICAgICAgICB0aGlzLmNsb3NlRGVsaW1pdGVyVGV4dCA9IGNsb3NlRGVsaW1pdGVyVGV4dDtcblxuICAgICAgICAvLyB0eXBlc2NyaXB0IGhhY2s6IGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC13aWtpL2Jsb2IvbWFzdGVyL0JyZWFraW5nLUNoYW5nZXMubWQjZXh0ZW5kaW5nLWJ1aWx0LWlucy1saWtlLWVycm9yLWFycmF5LWFuZC1tYXAtbWF5LW5vLWxvbmdlci13b3JrXG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBNaXNzaW5nU3RhcnREZWxpbWl0ZXJFcnJvci5wcm90b3R5cGUpO1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgVW5jbG9zZWRUYWdFcnJvciBleHRlbmRzIEVycm9yIHtcblxuICAgIHB1YmxpYyByZWFkb25seSB0YWdOYW1lOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3Rvcih0YWdOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoYFRhZyAnJHt0YWdOYW1lfScgaXMgbmV2ZXIgY2xvc2VkLmApO1xuXG4gICAgICAgIHRoaXMudGFnTmFtZSA9IHRhZ05hbWU7XG5cbiAgICAgICAgLy8gdHlwZXNjcmlwdCBoYWNrOiBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQtd2lraS9ibG9iL21hc3Rlci9CcmVha2luZy1DaGFuZ2VzLm1kI2V4dGVuZGluZy1idWlsdC1pbnMtbGlrZS1lcnJvci1hcnJheS1hbmQtbWFwLW1heS1uby1sb25nZXItd29ya1xuICAgICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgVW5jbG9zZWRUYWdFcnJvci5wcm90b3R5cGUpO1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgVW5pZGVudGlmaWVkRmlsZVR5cGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoYFRoZSBmaWxldHlwZSBmb3IgdGhpcyBmaWxlIGNvdWxkIG5vdCBiZSBpZGVudGlmaWVkLCBpcyB0aGlzIGZpbGUgY29ycnVwdGVkP2ApO1xuXG4gICAgICAgIC8vIHR5cGVzY3JpcHQgaGFjazogaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0LXdpa2kvYmxvYi9tYXN0ZXIvQnJlYWtpbmctQ2hhbmdlcy5tZCNleHRlbmRpbmctYnVpbHQtaW5zLWxpa2UtZXJyb3ItYXJyYXktYW5kLW1hcC1tYXktbm8tbG9uZ2VyLXdvcmtcbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIFVuaWRlbnRpZmllZEZpbGVUeXBlRXJyb3IucHJvdG90eXBlKTtcbiAgICB9XG59IiwiZXhwb3J0IGNsYXNzIFVua25vd25Db250ZW50VHlwZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXG4gICAgcHVibGljIHJlYWRvbmx5IHRhZ1Jhd1RleHQ6IHN0cmluZztcbiAgICBwdWJsaWMgcmVhZG9ubHkgY29udGVudFR5cGU6IHN0cmluZztcbiAgICBwdWJsaWMgcmVhZG9ubHkgcGF0aDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoY29udGVudFR5cGU6IHN0cmluZywgdGFnUmF3VGV4dDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoYENvbnRlbnQgdHlwZSAnJHtjb250ZW50VHlwZX0nIGRvZXMgbm90IGhhdmUgYSByZWdpc3RlcmVkIHBsdWdpbiB0byBoYW5kbGUgaXQuYCk7XG5cbiAgICAgICAgdGhpcy5jb250ZW50VHlwZSA9IGNvbnRlbnRUeXBlO1xuICAgICAgICB0aGlzLnRhZ1Jhd1RleHQgPSB0YWdSYXdUZXh0O1xuICAgICAgICB0aGlzLnBhdGggPSBwYXRoO1xuXG4gICAgICAgIC8vIHR5cGVzY3JpcHQgaGFjazogaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0LXdpa2kvYmxvYi9tYXN0ZXIvQnJlYWtpbmctQ2hhbmdlcy5tZCNleHRlbmRpbmctYnVpbHQtaW5zLWxpa2UtZXJyb3ItYXJyYXktYW5kLW1hcC1tYXktbm8tbG9uZ2VyLXdvcmtcbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIFVua25vd25Db250ZW50VHlwZUVycm9yLnByb3RvdHlwZSk7XG4gICAgfVxufSIsImV4cG9ydCBjbGFzcyBVbm9wZW5lZFRhZ0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuXG4gICAgcHVibGljIHJlYWRvbmx5IHRhZ05hbWU6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHRhZ05hbWU6IHN0cmluZykge1xuICAgICAgICBzdXBlcihgVGFnICcke3RhZ05hbWV9JyBpcyBjbG9zZWQgYnV0IHdhcyBuZXZlciBvcGVuZWQuYCk7XG5cbiAgICAgICAgdGhpcy50YWdOYW1lID0gdGFnTmFtZTtcblxuICAgICAgICAvLyB0eXBlc2NyaXB0IGhhY2s6IGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC13aWtpL2Jsb2IvbWFzdGVyL0JyZWFraW5nLUNoYW5nZXMubWQjZXh0ZW5kaW5nLWJ1aWx0LWlucy1saWtlLWVycm9yLWFycmF5LWFuZC1tYXAtbWF5LW5vLWxvbmdlci13b3JrXG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBVbm9wZW5lZFRhZ0Vycm9yLnByb3RvdHlwZSk7XG4gICAgfVxufSIsImV4cG9ydCBjbGFzcyBVbnN1cHBvcnRlZEZpbGVUeXBlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgZmlsZVR5cGU6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGZpbGVUeXBlOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoYEZpbGV0eXBlIFwiJHtmaWxlVHlwZX1cIiBpcyBub3Qgc3VwcG9ydGVkLmApO1xuXG4gICAgICAgIHRoaXMuZmlsZVR5cGUgPSBmaWxlVHlwZTtcblxuICAgICAgICAvLyB0eXBlc2NyaXB0IGhhY2s6IGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC13aWtpL2Jsb2IvbWFzdGVyL0JyZWFraW5nLUNoYW5nZXMubWQjZXh0ZW5kaW5nLWJ1aWx0LWlucy1saWtlLWVycm9yLWFycmF5LWFuZC1tYXAtbWF5LW5vLWxvbmdlci13b3JrXG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBVbnN1cHBvcnRlZEZpbGVUeXBlRXJyb3IucHJvdG90eXBlKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgSU1hcCB9IGZyb20gJy4uL3R5cGVzJztcblxuZXhwb3J0IHR5cGUgSXRlbU1hcHBlcjxUSW4sIFRPdXQgPSBzdHJpbmc+ID0gKGl0ZW06IFRJbiwgaW5kZXg6IG51bWJlcikgPT4gVE91dDtcblxuZXhwb3J0IGZ1bmN0aW9uIHB1c2hNYW55PFQ+KGRlc3RBcnJheTogVFtdLCBpdGVtczogVFtdKTogdm9pZCB7XG4gICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoZGVzdEFycmF5LCBpdGVtcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaXJzdDxUPihhcnJheTogVFtdKTogVCB7XG4gICAgaWYgKCFhcnJheS5sZW5ndGgpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIGFycmF5WzBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGFzdDxUPihhcnJheTogVFtdKTogVCB7XG4gICAgaWYgKCFhcnJheS5sZW5ndGgpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9EaWN0aW9uYXJ5PFRJbiwgVE91dCA9IFRJbj4oYXJyYXk6IFRJbltdLCBrZXlTZWxlY3RvcjogSXRlbU1hcHBlcjxUSW4+LCB2YWx1ZVNlbGVjdG9yPzogSXRlbU1hcHBlcjxUSW4sIFRPdXQ+KTogSU1hcDxUT3V0PiB7XG4gICAgaWYgKCFhcnJheS5sZW5ndGgpXG4gICAgICAgIHJldHVybiB7fTtcblxuICAgIGNvbnN0IHJlczogSU1hcDxhbnk+ID0ge307XG4gICAgYXJyYXkuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3Qga2V5ID0ga2V5U2VsZWN0b3IoaXRlbSwgaW5kZXgpO1xuICAgICAgICBjb25zdCB2YWx1ZSA9ICh2YWx1ZVNlbGVjdG9yID8gdmFsdWVTZWxlY3RvcihpdGVtLCBpbmRleCkgOiBpdGVtKTtcbiAgICAgICAgaWYgKHJlc1trZXldKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBLZXkgJyR7a2V5fScgYWxyZWFkeSBleGlzdHMgaW4gdGhlIGRpY3Rpb25hcnkuYCk7XG4gICAgICAgIHJlc1trZXldID0gdmFsdWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlcztcbn07XG4iLCJleHBvcnQgY2xhc3MgQmFzZTY0IHtcblxuICAgIHB1YmxpYyBzdGF0aWMgZW5jb2RlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgXG4gICAgICAgIC8vIGJyb3dzZXJcbiAgICAgICAgaWYgKHR5cGVvZiBidG9hICE9PSAndW5kZWZpbmVkJykgXG4gICAgICAgICAgICByZXR1cm4gYnRvYShzdHIpO1xuXG4gICAgICAgIC8vIG5vZGVcbiAgICAgICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjMwOTc5Mjgvbm9kZS1qcy1idG9hLWlzLW5vdC1kZWZpbmVkLWVycm9yIzM4NDQ2OTYwXG4gICAgICAgIHJldHVybiBuZXcgQnVmZmVyKHN0ciwgJ2JpbmFyeScpLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgQ29uc3RydWN0b3IgfSBmcm9tICcuLi90eXBlcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmhlcml0c0Zyb20oZGVyaXZlZDogQ29uc3RydWN0b3I8YW55PiwgYmFzZTogQ29uc3RydWN0b3I8YW55Pik6IGJvb2xlYW4ge1xuICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE0NDg2MTEwL2hvdy10by1jaGVjay1pZi1hLWphdmFzY3JpcHQtY2xhc3MtaW5oZXJpdHMtYW5vdGhlci13aXRob3V0LWNyZWF0aW5nLWFuLW9ialxuICAgIHJldHVybiBkZXJpdmVkID09PSBiYXNlIHx8IGRlcml2ZWQucHJvdG90eXBlIGluc3RhbmNlb2YgYmFzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvbWlzZUxpa2U8VD4oY2FuZGlkYXRlOiBhbnkpOiBjYW5kaWRhdGUgaXMgUHJvbWlzZUxpa2U8VD4ge1xuICAgIHJldHVybiAhIWNhbmRpZGF0ZSAmJiB0eXBlb2YgY2FuZGlkYXRlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgY2FuZGlkYXRlLnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG4iLCJpbXBvcnQgeyBDb25zdHJ1Y3RvciB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IEJhc2U2NCB9IGZyb20gJy4vYmFzZTY0JztcbmltcG9ydCB7IGluaGVyaXRzRnJvbSB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgdHlwZSBCaW5hcnkgPSBCbG9iIHwgQnVmZmVyIHwgQXJyYXlCdWZmZXI7XG5cbmV4cG9ydCBjb25zdCBCaW5hcnkgPSB7XG5cbiAgICAvL1xuICAgIC8vIHR5cGUgZGV0ZWN0aW9uXG4gICAgLy9cblxuICAgIGlzQmxvYihiaW5hcnk6IGFueSk6IGJpbmFyeSBpcyBCbG9iIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNCbG9iQ29uc3RydWN0b3IoYmluYXJ5LmNvbnN0cnVjdG9yKTtcbiAgICB9LFxuXG4gICAgaXNBcnJheUJ1ZmZlcihiaW5hcnk6IGFueSk6IGJpbmFyeSBpcyBBcnJheUJ1ZmZlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzQXJyYXlCdWZmZXJDb25zdHJ1Y3RvcihiaW5hcnkuY29uc3RydWN0b3IpO1xuICAgIH0sXG5cbiAgICBpc0J1ZmZlcihiaW5hcnk6IGFueSk6IGJpbmFyeSBpcyBCdWZmZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0J1ZmZlckNvbnN0cnVjdG9yKGJpbmFyeS5jb25zdHJ1Y3Rvcik7XG4gICAgfSxcblxuICAgIGlzQmxvYkNvbnN0cnVjdG9yKGJpbmFyeVR5cGU6IENvbnN0cnVjdG9yPGFueT4pOiBiaW5hcnlUeXBlIGlzIENvbnN0cnVjdG9yPEJsb2I+IHtcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgQmxvYiAhPT0gJ3VuZGVmaW5lZCcgJiYgaW5oZXJpdHNGcm9tKGJpbmFyeVR5cGUsIEJsb2IpKTtcbiAgICB9LFxuXG4gICAgaXNBcnJheUJ1ZmZlckNvbnN0cnVjdG9yKGJpbmFyeVR5cGU6IENvbnN0cnVjdG9yPGFueT4pOiBiaW5hcnlUeXBlIGlzIENvbnN0cnVjdG9yPEFycmF5QnVmZmVyPiB7XG4gICAgICAgIHJldHVybiAodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiBpbmhlcml0c0Zyb20oYmluYXJ5VHlwZSwgQXJyYXlCdWZmZXIpKTtcbiAgICB9LFxuXG4gICAgaXNCdWZmZXJDb25zdHJ1Y3RvcihiaW5hcnlUeXBlOiBDb25zdHJ1Y3Rvcjxhbnk+KTogYmluYXJ5VHlwZSBpcyBDb25zdHJ1Y3RvcjxCdWZmZXI+IHtcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgQnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiBpbmhlcml0c0Zyb20oYmluYXJ5VHlwZSwgQnVmZmVyKSk7XG4gICAgfSxcblxuICAgIC8vXG4gICAgLy8gdXRpbGl0aWVzXG4gICAgLy9cblxuICAgIHRvQmFzZTY0KGJpbmFyeTogQmluYXJ5KTogUHJvbWlzZTxzdHJpbmc+IHtcblxuICAgICAgICBpZiAodGhpcy5pc0Jsb2IoYmluYXJ5KSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICAgICAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBiYXNlNjQgPSBCYXNlNjQuZW5jb2RlKHRoaXMucmVzdWx0IGFzIHN0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoYmFzZTY0KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGZpbGVSZWFkZXIucmVhZEFzQmluYXJ5U3RyaW5nKGJpbmFyeSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlzQnVmZmVyKGJpbmFyeSkpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYmluYXJ5LnRvU3RyaW5nKCdiYXNlNjQnKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc0FycmF5QnVmZmVyKGJpbmFyeSkpIHtcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzkyNjc4OTkvYXJyYXlidWZmZXItdG8tYmFzZTY0LWVuY29kZWQtc3RyaW5nIzQyMzM0NDEwXG4gICAgICAgICAgICBjb25zdCBiaW5hcnlTdHIgPSBuZXcgVWludDhBcnJheShiaW5hcnkpLnJlZHVjZSgoc3RyLCBieXRlKSA9PiBzdHIgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGUpLCAnJyk7XG4gICAgICAgICAgICBjb25zdCBiYXNlNjQgPSBCYXNlNjQuZW5jb2RlKGJpbmFyeVN0cik7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGJhc2U2NCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEJpbmFyeSB0eXBlICckeyhiaW5hcnkgYXMgYW55KS5jb25zdHJ1Y3Rvci5uYW1lfScgaXMgbm90IHN1cHBvcnRlZC5gKTtcbiAgICB9XG59O1xuXG4iLCJleHBvcnQgY2xhc3MgUGF0aCB7XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldEZpbGVuYW1lKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGxhc3RTbGFzaEluZGV4ID0gcGF0aC5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICByZXR1cm4gcGF0aC5zdWJzdHIobGFzdFNsYXNoSW5kZXggKyAxKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldERpcmVjdG9yeShwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBsYXN0U2xhc2hJbmRleCA9IHBhdGgubGFzdEluZGV4T2YoJy8nKTtcbiAgICAgICAgcmV0dXJuIHBhdGguc3Vic3RyaW5nKDAsIGxhc3RTbGFzaEluZGV4KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGNvbWJpbmUoLi4ucGFydHM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHBhcnRzLmZpbHRlcihwYXJ0ID0+IHBhcnQ/LnRyaW0oKSkuam9pbignLycpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBSZWdleCB7XG5cbiAgICBwdWJsaWMgc3RhdGljIGVzY2FwZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzExNDQ3ODMvaG93LXRvLXJlcGxhY2UtYWxsLW9jY3VycmVuY2VzLW9mLWEtc3RyaW5nLWluLWphdmFzY3JpcHRcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgXCJcXFxcJCZcIik7IC8vICQmIG1lYW5zIHRoZSB3aG9sZSBtYXRjaGVkIHN0cmluZ1xuICAgIH1cbn1cbiIsIi8qKlxuICogU2VjdXJlIEhhc2ggQWxnb3JpdGhtIChTSEExKVxuICogXG4gKiBUYWtlbiBmcm9tIGhlcmU6IGh0dHA6Ly93d3cud2VidG9vbGtpdC5pbmZvL2phdmFzY3JpcHQtc2hhMS5odG1sXG4gKiBcbiAqIFJlY29tbWVuZGVkIGhlcmU6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzYxMjI1NzEvc2ltcGxlLW5vbi1zZWN1cmUtaGFzaC1mdW5jdGlvbi1mb3ItamF2YXNjcmlwdCM2MTIyNzMyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaGExKG1zZzogc3RyaW5nKSB7XG5cbiAgICBtc2cgPSB1dGY4RW5jb2RlKG1zZyk7XG4gICAgY29uc3QgbXNnTGVuZ3RoID0gbXNnLmxlbmd0aDtcblxuICAgIGxldCBpLCBqO1xuXG4gICAgY29uc3Qgd29yZEFycmF5ID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IG1zZ0xlbmd0aCAtIDM7IGkgKz0gNCkge1xuICAgICAgICBqID0gbXNnLmNoYXJDb2RlQXQoaSkgPDwgMjQgfCBtc2cuY2hhckNvZGVBdChpICsgMSkgPDwgMTYgfFxuICAgICAgICAgICAgbXNnLmNoYXJDb2RlQXQoaSArIDIpIDw8IDggfCBtc2cuY2hhckNvZGVBdChpICsgMyk7XG4gICAgICAgIHdvcmRBcnJheS5wdXNoKGopO1xuICAgIH1cblxuICAgIHN3aXRjaCAobXNnTGVuZ3RoICUgNCkge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBpID0gMHgwODAwMDAwMDA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgaSA9IG1zZy5jaGFyQ29kZUF0KG1zZ0xlbmd0aCAtIDEpIDw8IDI0IHwgMHgwODAwMDAwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGkgPSBtc2cuY2hhckNvZGVBdChtc2dMZW5ndGggLSAyKSA8PCAyNCB8IG1zZy5jaGFyQ29kZUF0KG1zZ0xlbmd0aCAtIDEpIDw8IDE2IHwgMHgwODAwMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBpID0gbXNnLmNoYXJDb2RlQXQobXNnTGVuZ3RoIC0gMykgPDwgMjQgfCBtc2cuY2hhckNvZGVBdChtc2dMZW5ndGggLSAyKSA8PCAxNiB8IG1zZy5jaGFyQ29kZUF0KG1zZ0xlbmd0aCAtIDEpIDw8IDggfCAweDgwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHdvcmRBcnJheS5wdXNoKGkpO1xuXG4gICAgd2hpbGUgKCh3b3JkQXJyYXkubGVuZ3RoICUgMTYpICE9IDE0KSB7XG4gICAgICAgIHdvcmRBcnJheS5wdXNoKDApO1xuICAgIH1cblxuICAgIHdvcmRBcnJheS5wdXNoKG1zZ0xlbmd0aCA+Pj4gMjkpO1xuICAgIHdvcmRBcnJheS5wdXNoKChtc2dMZW5ndGggPDwgMykgJiAweDBmZmZmZmZmZik7XG5cbiAgICBjb25zdCB3ID0gbmV3IEFycmF5KDgwKTtcbiAgICBsZXQgSDAgPSAweDY3NDUyMzAxO1xuICAgIGxldCBIMSA9IDB4RUZDREFCODk7XG4gICAgbGV0IEgyID0gMHg5OEJBRENGRTtcbiAgICBsZXQgSDMgPSAweDEwMzI1NDc2O1xuICAgIGxldCBINCA9IDB4QzNEMkUxRjA7XG4gICAgbGV0IEEsIEIsIEMsIEQsIEU7XG4gICAgbGV0IHRlbXA7XG4gICAgZm9yIChsZXQgYmxvY2tTdGFydCA9IDA7IGJsb2NrU3RhcnQgPCB3b3JkQXJyYXkubGVuZ3RoOyBibG9ja1N0YXJ0ICs9IDE2KSB7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDE2OyBpKyspIHtcbiAgICAgICAgICAgIHdbaV0gPSB3b3JkQXJyYXlbYmxvY2tTdGFydCArIGldO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDE2OyBpIDw9IDc5OyBpKyspIHtcbiAgICAgICAgICAgIHdbaV0gPSByb3RhdGVMZWZ0KHdbaSAtIDNdIF4gd1tpIC0gOF0gXiB3W2kgLSAxNF0gXiB3W2kgLSAxNl0sIDEpO1xuICAgICAgICB9XG4gICAgICAgIEEgPSBIMDtcbiAgICAgICAgQiA9IEgxO1xuICAgICAgICBDID0gSDI7XG4gICAgICAgIEQgPSBIMztcbiAgICAgICAgRSA9IEg0O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDw9IDE5OyBpKyspIHtcbiAgICAgICAgICAgIHRlbXAgPSAocm90YXRlTGVmdChBLCA1KSArICgoQiAmIEMpIHwgKH5CICYgRCkpICsgRSArIHdbaV0gKyAweDVBODI3OTk5KSAmIDB4MGZmZmZmZmZmO1xuICAgICAgICAgICAgRSA9IEQ7XG4gICAgICAgICAgICBEID0gQztcbiAgICAgICAgICAgIEMgPSByb3RhdGVMZWZ0KEIsIDMwKTtcbiAgICAgICAgICAgIEIgPSBBO1xuICAgICAgICAgICAgQSA9IHRlbXA7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMjA7IGkgPD0gMzk7IGkrKykge1xuICAgICAgICAgICAgdGVtcCA9IChyb3RhdGVMZWZ0KEEsIDUpICsgKEIgXiBDIF4gRCkgKyBFICsgd1tpXSArIDB4NkVEOUVCQTEpICYgMHgwZmZmZmZmZmY7XG4gICAgICAgICAgICBFID0gRDtcbiAgICAgICAgICAgIEQgPSBDO1xuICAgICAgICAgICAgQyA9IHJvdGF0ZUxlZnQoQiwgMzApO1xuICAgICAgICAgICAgQiA9IEE7XG4gICAgICAgICAgICBBID0gdGVtcDtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSA0MDsgaSA8PSA1OTsgaSsrKSB7XG4gICAgICAgICAgICB0ZW1wID0gKHJvdGF0ZUxlZnQoQSwgNSkgKyAoKEIgJiBDKSB8IChCICYgRCkgfCAoQyAmIEQpKSArIEUgKyB3W2ldICsgMHg4RjFCQkNEQykgJiAweDBmZmZmZmZmZjtcbiAgICAgICAgICAgIEUgPSBEO1xuICAgICAgICAgICAgRCA9IEM7XG4gICAgICAgICAgICBDID0gcm90YXRlTGVmdChCLCAzMCk7XG4gICAgICAgICAgICBCID0gQTtcbiAgICAgICAgICAgIEEgPSB0ZW1wO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDYwOyBpIDw9IDc5OyBpKyspIHtcbiAgICAgICAgICAgIHRlbXAgPSAocm90YXRlTGVmdChBLCA1KSArIChCIF4gQyBeIEQpICsgRSArIHdbaV0gKyAweENBNjJDMUQ2KSAmIDB4MGZmZmZmZmZmO1xuICAgICAgICAgICAgRSA9IEQ7XG4gICAgICAgICAgICBEID0gQztcbiAgICAgICAgICAgIEMgPSByb3RhdGVMZWZ0KEIsIDMwKTtcbiAgICAgICAgICAgIEIgPSBBO1xuICAgICAgICAgICAgQSA9IHRlbXA7XG4gICAgICAgIH1cbiAgICAgICAgSDAgPSAoSDAgKyBBKSAmIDB4MGZmZmZmZmZmO1xuICAgICAgICBIMSA9IChIMSArIEIpICYgMHgwZmZmZmZmZmY7XG4gICAgICAgIEgyID0gKEgyICsgQykgJiAweDBmZmZmZmZmZjtcbiAgICAgICAgSDMgPSAoSDMgKyBEKSAmIDB4MGZmZmZmZmZmO1xuICAgICAgICBINCA9IChINCArIEUpICYgMHgwZmZmZmZmZmY7XG4gICAgfVxuICAgIHRlbXAgPSBjdnRIZXgoSDApICsgY3Z0SGV4KEgxKSArIGN2dEhleChIMikgKyBjdnRIZXgoSDMpICsgY3Z0SGV4KEg0KTtcbiAgICByZXR1cm4gdGVtcC50b0xvd2VyQ2FzZSgpO1xufVxuXG5mdW5jdGlvbiByb3RhdGVMZWZ0KG46IGFueSwgczogYW55KSB7XG4gICAgY29uc3QgdDQgPSAobiA8PCBzKSB8IChuID4+PiAoMzIgLSBzKSk7XG4gICAgcmV0dXJuIHQ0O1xufVxuXG5mdW5jdGlvbiBjdnRIZXgodmFsOiBhbnkpIHtcbiAgICBsZXQgc3RyID0gXCJcIjtcbiAgICBmb3IgKGxldCBpID0gNzsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgY29uc3QgdiA9ICh2YWwgPj4+IChpICogNCkpICYgMHgwZjtcbiAgICAgICAgc3RyICs9IHYudG9TdHJpbmcoMTYpO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xufVxuXG5mdW5jdGlvbiB1dGY4RW5jb2RlKHN0cjogc3RyaW5nKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcclxcbi9nLCBcIlxcblwiKTtcbiAgICBsZXQgdXRmU3RyID0gXCJcIjtcbiAgICBmb3IgKGxldCBuID0gMDsgbiA8IHN0ci5sZW5ndGg7IG4rKykge1xuICAgICAgICBjb25zdCBjID0gc3RyLmNoYXJDb2RlQXQobik7XG4gICAgICAgIGlmIChjIDwgMTI4KSB7XG4gICAgICAgICAgICB1dGZTdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjKTtcblxuICAgICAgICB9IGVsc2UgaWYgKChjID4gMTI3KSAmJiAoYyA8IDIwNDgpKSB7XG4gICAgICAgICAgICB1dGZTdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgoYyA+PiA2KSB8IDE5Mik7XG4gICAgICAgICAgICB1dGZTdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgoYyAmIDYzKSB8IDEyOCk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHV0ZlN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjID4+IDEyKSB8IDIyNCk7XG4gICAgICAgICAgICB1dGZTdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgoKGMgPj4gNikgJiA2MykgfCAxMjgpO1xuICAgICAgICAgICAgdXRmU3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGMgJiA2MykgfCAxMjgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1dGZTdHI7XG59XG4iLCJpbXBvcnQgeyBNYXhYbWxEZXB0aEVycm9yIH0gZnJvbSAnLi4vZXJyb3JzJztcblxuZXhwb3J0IGNsYXNzIFhtbERlcHRoVHJhY2tlciB7XG4gICAgXG4gICAgcHJpdmF0ZSBkZXB0aCA9IDA7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IG1heERlcHRoOiBudW1iZXIpIHsgfVxuXG4gICAgcHVibGljIGluY3JlbWVudCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5kZXB0aCsrO1xuICAgICAgICBpZiAodGhpcy5kZXB0aCA+IHRoaXMubWF4RGVwdGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNYXhYbWxEZXB0aEVycm9yKHRoaXMubWF4RGVwdGgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRlY3JlbWVudCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5kZXB0aC0tO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBNaXNzaW5nQXJndW1lbnRFcnJvciB9IGZyb20gJy4uL2Vycm9ycyc7XG5pbXBvcnQgeyBJTWFwIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgbGFzdCB9IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGVudW0gWG1sTm9kZVR5cGUge1xuICAgIFRleHQgPSBcIlRleHRcIixcbiAgICBHZW5lcmFsID0gXCJHZW5lcmFsXCJcbn1cblxuZXhwb3J0IHR5cGUgWG1sTm9kZSA9IFhtbFRleHROb2RlIHwgWG1sR2VuZXJhbE5vZGU7XG5cbmV4cG9ydCBpbnRlcmZhY2UgWG1sTm9kZUJhc2Uge1xuICAgIG5vZGVUeXBlOiBYbWxOb2RlVHlwZTtcbiAgICBub2RlTmFtZTogc3RyaW5nO1xuICAgIHBhcmVudE5vZGU/OiBYbWxOb2RlO1xuICAgIGNoaWxkTm9kZXM/OiBYbWxOb2RlW107XG4gICAgbmV4dFNpYmxpbmc/OiBYbWxOb2RlO1xufVxuXG5leHBvcnQgY29uc3QgVEVYVF9OT0RFX05BTUUgPSAnI3RleHQnOyAvLyBzZWU6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ob2RlL25vZGVOYW1lXG5cbmV4cG9ydCBpbnRlcmZhY2UgWG1sVGV4dE5vZGUgZXh0ZW5kcyBYbWxOb2RlQmFzZSB7XG4gICAgbm9kZVR5cGU6IFhtbE5vZGVUeXBlLlRleHQ7XG4gICAgbm9kZU5hbWU6IHR5cGVvZiBURVhUX05PREVfTkFNRTtcbiAgICB0ZXh0Q29udGVudDogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFhtbEdlbmVyYWxOb2RlIGV4dGVuZHMgWG1sTm9kZUJhc2Uge1xuICAgIG5vZGVUeXBlOiBYbWxOb2RlVHlwZS5HZW5lcmFsO1xuICAgIGF0dHJpYnV0ZXM/OiBJTWFwPHN0cmluZz47XG59XG5cbmV4cG9ydCBjb25zdCBYbWxOb2RlID0ge1xuXG4gICAgLy9cbiAgICAvLyBmYWN0b3JpZXNcbiAgICAvL1xuXG4gICAgY3JlYXRlVGV4dE5vZGUodGV4dD86IHN0cmluZyk6IFhtbFRleHROb2RlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5vZGVUeXBlOiBYbWxOb2RlVHlwZS5UZXh0LFxuICAgICAgICAgICAgbm9kZU5hbWU6IFRFWFRfTk9ERV9OQU1FLFxuICAgICAgICAgICAgdGV4dENvbnRlbnQ6IHRleHRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgY3JlYXRlR2VuZXJhbE5vZGUobmFtZTogc3RyaW5nKTogWG1sR2VuZXJhbE5vZGUge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbm9kZVR5cGU6IFhtbE5vZGVUeXBlLkdlbmVyYWwsXG4gICAgICAgICAgICBub2RlTmFtZTogbmFtZVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvL1xuICAgIC8vIHNlcmlhbGl6YXRpb25cbiAgICAvL1xuXG4gICAgLyoqXG4gICAgICogRW5jb2RlIHN0cmluZyB0byBtYWtlIGl0IHNhZmUgdG8gdXNlIGluc2lkZSB4bWwgdGFncy5cbiAgICAgKlxuICAgICAqIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzc5MTg4NjgvaG93LXRvLWVzY2FwZS14bWwtZW50aXRpZXMtaW4tamF2YXNjcmlwdFxuICAgICAqL1xuICAgIGVuY29kZVZhbHVlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKHN0ciA9PT0gbnVsbCB8fCBzdHIgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHRocm93IG5ldyBNaXNzaW5nQXJndW1lbnRFcnJvcihuYW1lb2Yoc3RyKSk7XG4gICAgICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJylcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGEgc3RyaW5nLCBnb3QgJyR7KHN0ciBhcyBhbnkpLmNvbnN0cnVjdG9yLm5hbWV9Jy5gKTtcblxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1s8PiYnXCJdL2csIGMgPT4ge1xuICAgICAgICAgICAgc3dpdGNoIChjKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnPCc6IHJldHVybiAnJmx0Oyc7XG4gICAgICAgICAgICAgICAgY2FzZSAnPic6IHJldHVybiAnJmd0Oyc7XG4gICAgICAgICAgICAgICAgY2FzZSAnJic6IHJldHVybiAnJmFtcDsnO1xuICAgICAgICAgICAgICAgIGNhc2UgJ1xcJyc6IHJldHVybiAnJmFwb3M7JztcbiAgICAgICAgICAgICAgICBjYXNlICdcIic6IHJldHVybiAnJnF1b3Q7JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHNlcmlhbGl6ZShub2RlOiBYbWxOb2RlKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKHRoaXMuaXNUZXh0Tm9kZShub2RlKSlcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVuY29kZVZhbHVlKG5vZGUudGV4dENvbnRlbnQgfHwgJycpO1xuXG4gICAgICAgIC8vIGF0dHJpYnV0ZXNcbiAgICAgICAgbGV0IGF0dHJpYnV0ZXMgPSAnJztcbiAgICAgICAgaWYgKG5vZGUuYXR0cmlidXRlcykge1xuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlTmFtZXMgPSBPYmplY3Qua2V5cyhub2RlLmF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZU5hbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSAnICcgKyBhdHRyaWJ1dGVOYW1lc1xuICAgICAgICAgICAgICAgICAgICAubWFwKG5hbWUgPT4gYCR7bmFtZX09XCIke25vZGUuYXR0cmlidXRlc1tuYW1lXX1cImApXG4gICAgICAgICAgICAgICAgICAgIC5qb2luKCcgJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvcGVuIHRhZ1xuICAgICAgICBjb25zdCBoYXNDaGlsZHJlbiA9IChub2RlLmNoaWxkTm9kZXMgfHwgW10pLmxlbmd0aCA+IDA7XG4gICAgICAgIGNvbnN0IHN1ZmZpeCA9IGhhc0NoaWxkcmVuID8gJycgOiAnLyc7XG4gICAgICAgIGNvbnN0IG9wZW5UYWcgPSBgPCR7bm9kZS5ub2RlTmFtZX0ke2F0dHJpYnV0ZXN9JHtzdWZmaXh9PmA7XG5cbiAgICAgICAgbGV0IHhtbDogc3RyaW5nO1xuXG4gICAgICAgIGlmIChoYXNDaGlsZHJlbikge1xuXG4gICAgICAgICAgICAvLyBjaGlsZCBub2Rlc1xuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW5YbWwgPSBub2RlLmNoaWxkTm9kZXNcbiAgICAgICAgICAgICAgICAubWFwKGNoaWxkID0+IHRoaXMuc2VyaWFsaXplKGNoaWxkKSlcbiAgICAgICAgICAgICAgICAuam9pbignJyk7XG5cbiAgICAgICAgICAgIC8vIGNsb3NlIHRhZ1xuICAgICAgICAgICAgY29uc3QgY2xvc2VUYWcgPSBgPC8ke25vZGUubm9kZU5hbWV9PmA7XG5cbiAgICAgICAgICAgIHhtbCA9IG9wZW5UYWcgKyBjaGlsZHJlblhtbCArIGNsb3NlVGFnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeG1sID0gb3BlblRhZztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB4bWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb252ZXJzaW9uIGlzIGFsd2F5cyBkZWVwLlxuICAgICAqL1xuICAgIGZyb21Eb21Ob2RlKGRvbU5vZGU6IE5vZGUpOiBYbWxOb2RlIHtcbiAgICAgICAgbGV0IHhtbE5vZGU6IFhtbE5vZGU7XG5cbiAgICAgICAgLy8gYmFzaWMgcHJvcGVydGllc1xuICAgICAgICBpZiAoZG9tTm9kZS5ub2RlVHlwZSA9PT0gZG9tTm9kZS5URVhUX05PREUpIHtcblxuICAgICAgICAgICAgeG1sTm9kZSA9IHRoaXMuY3JlYXRlVGV4dE5vZGUoZG9tTm9kZS50ZXh0Q29udGVudCk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgeG1sTm9kZSA9IHRoaXMuY3JlYXRlR2VuZXJhbE5vZGUoZG9tTm9kZS5ub2RlTmFtZSk7XG5cbiAgICAgICAgICAgIC8vIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgIGlmIChkb21Ob2RlLm5vZGVUeXBlID09PSBkb21Ob2RlLkVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSAoZG9tTm9kZSBhcyBFbGVtZW50KS5hdHRyaWJ1dGVzO1xuICAgICAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICh4bWxOb2RlIGFzIFhtbEdlbmVyYWxOb2RlKS5hdHRyaWJ1dGVzID0ge307XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY3VyQXR0cmlidXRlID0gYXR0cmlidXRlcy5pdGVtKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgKHhtbE5vZGUgYXMgWG1sR2VuZXJhbE5vZGUpLmF0dHJpYnV0ZXNbY3VyQXR0cmlidXRlLm5hbWVdID0gY3VyQXR0cmlidXRlLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2hpbGRyZW5cbiAgICAgICAgaWYgKGRvbU5vZGUuY2hpbGROb2Rlcykge1xuICAgICAgICAgICAgeG1sTm9kZS5jaGlsZE5vZGVzID0gW107XG4gICAgICAgICAgICBsZXQgcHJldkNoaWxkOiBYbWxOb2RlO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkb21Ob2RlLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgIC8vIGNsb25lIGNoaWxkXG4gICAgICAgICAgICAgICAgY29uc3QgZG9tQ2hpbGQgPSBkb21Ob2RlLmNoaWxkTm9kZXMuaXRlbShpKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJDaGlsZCA9IHRoaXMuZnJvbURvbU5vZGUoZG9tQ2hpbGQpO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHJlZmVyZW5jZXNcbiAgICAgICAgICAgICAgICB4bWxOb2RlLmNoaWxkTm9kZXMucHVzaChjdXJDaGlsZCk7XG4gICAgICAgICAgICAgICAgY3VyQ2hpbGQucGFyZW50Tm9kZSA9IHhtbE5vZGU7XG4gICAgICAgICAgICAgICAgaWYgKHByZXZDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICBwcmV2Q2hpbGQubmV4dFNpYmxpbmcgPSBjdXJDaGlsZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHJldkNoaWxkID0gY3VyQ2hpbGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geG1sTm9kZSBhcyBYbWxOb2RlO1xuICAgIH0sXG5cbiAgICAvL1xuICAgIC8vIGNvcmUgZnVuY3Rpb25zXG4gICAgLy9cblxuICAgIGlzVGV4dE5vZGUobm9kZTogWG1sTm9kZSk6IG5vZGUgaXMgWG1sVGV4dE5vZGUge1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gWG1sTm9kZVR5cGUuVGV4dCB8fCBub2RlLm5vZGVOYW1lID09PSBURVhUX05PREVfTkFNRSkge1xuICAgICAgICAgICAgaWYgKCEobm9kZS5ub2RlVHlwZSA9PT0gWG1sTm9kZVR5cGUuVGV4dCAmJiBub2RlLm5vZGVOYW1lID09PSBURVhUX05PREVfTkFNRSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdGV4dCBub2RlLiBUeXBlOiAnJHtub2RlLm5vZGVUeXBlfScsIE5hbWU6ICcke25vZGUubm9kZU5hbWV9Jy5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgY2xvbmVOb2RlPFQgZXh0ZW5kcyBYbWxOb2RlPihub2RlOiBULCBkZWVwOiBib29sZWFuKTogVCB7XG4gICAgICAgIGlmICghbm9kZSlcbiAgICAgICAgICAgIHRocm93IG5ldyBNaXNzaW5nQXJndW1lbnRFcnJvcihuYW1lb2Yobm9kZSkpO1xuXG4gICAgICAgIGlmICghZGVlcCkge1xuICAgICAgICAgICAgY29uc3QgY2xvbmUgPSBPYmplY3QuYXNzaWduKHt9LCBub2RlKTtcbiAgICAgICAgICAgIGNsb25lLnBhcmVudE5vZGUgPSBudWxsO1xuICAgICAgICAgICAgY2xvbmUuY2hpbGROb2RlcyA9IChub2RlLmNoaWxkTm9kZXMgPyBbXSA6IG51bGwpO1xuICAgICAgICAgICAgY2xvbmUubmV4dFNpYmxpbmcgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIGNsb25lO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgY2xvbmUgPSBjbG9uZU5vZGVEZWVwKG5vZGUpO1xuICAgICAgICAgICAgY2xvbmUucGFyZW50Tm9kZSA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gY2xvbmU7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0IHRoZSBub2RlIGFzIGEgbmV3IHNpYmxpbmcsIGJlZm9yZSB0aGUgb3JpZ2luYWwgbm9kZS5cbiAgICAgKlxuICAgICAqICogKipOb3RlKio6IEl0IGlzIG1vcmUgZWZmaWNpZW50IHRvIHVzZSB0aGUgaW5zZXJ0Q2hpbGQgZnVuY3Rpb24gaWYgeW91XG4gICAgICogICBhbHJlYWR5IGtub3cgdGhlIHJlbGV2YW50IGluZGV4LlxuICAgICAqL1xuICAgIGluc2VydEJlZm9yZShuZXdOb2RlOiBYbWxOb2RlLCByZWZlcmVuY2VOb2RlOiBYbWxOb2RlKTogdm9pZCB7XG4gICAgICAgIGlmICghbmV3Tm9kZSlcbiAgICAgICAgICAgIHRocm93IG5ldyBNaXNzaW5nQXJndW1lbnRFcnJvcihuYW1lb2YobmV3Tm9kZSkpO1xuICAgICAgICBpZiAoIXJlZmVyZW5jZU5vZGUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlzc2luZ0FyZ3VtZW50RXJyb3IobmFtZW9mKHJlZmVyZW5jZU5vZGUpKTtcblxuICAgICAgICBpZiAoIXJlZmVyZW5jZU5vZGUucGFyZW50Tm9kZSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7bmFtZW9mKHJlZmVyZW5jZU5vZGUpfScgaGFzIG5vIHBhcmVudGApO1xuXG4gICAgICAgIGNvbnN0IGNoaWxkTm9kZXMgPSByZWZlcmVuY2VOb2RlLnBhcmVudE5vZGUuY2hpbGROb2RlcztcbiAgICAgICAgY29uc3QgYmVmb3JlTm9kZUluZGV4ID0gY2hpbGROb2Rlcy5pbmRleE9mKHJlZmVyZW5jZU5vZGUpO1xuICAgICAgICBYbWxOb2RlLmluc2VydENoaWxkKHJlZmVyZW5jZU5vZGUucGFyZW50Tm9kZSwgbmV3Tm9kZSwgYmVmb3JlTm9kZUluZGV4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0IHRoZSBub2RlIGFzIGEgbmV3IHNpYmxpbmcsIGFmdGVyIHRoZSBvcmlnaW5hbCBub2RlLlxuICAgICAqXG4gICAgICogKiAqKk5vdGUqKjogSXQgaXMgbW9yZSBlZmZpY2llbnQgdG8gdXNlIHRoZSBpbnNlcnRDaGlsZCBmdW5jdGlvbiBpZiB5b3VcbiAgICAgKiAgIGFscmVhZHkga25vdyB0aGUgcmVsZXZhbnQgaW5kZXguXG4gICAgICovXG4gICAgaW5zZXJ0QWZ0ZXIobmV3Tm9kZTogWG1sTm9kZSwgcmVmZXJlbmNlTm9kZTogWG1sTm9kZSk6IHZvaWQge1xuICAgICAgICBpZiAoIW5ld05vZGUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlzc2luZ0FyZ3VtZW50RXJyb3IobmFtZW9mKG5ld05vZGUpKTtcbiAgICAgICAgaWYgKCFyZWZlcmVuY2VOb2RlKVxuICAgICAgICAgICAgdGhyb3cgbmV3IE1pc3NpbmdBcmd1bWVudEVycm9yKG5hbWVvZihyZWZlcmVuY2VOb2RlKSk7XG5cbiAgICAgICAgaWYgKCFyZWZlcmVuY2VOb2RlLnBhcmVudE5vZGUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke25hbWVvZihyZWZlcmVuY2VOb2RlKX0nIGhhcyBubyBwYXJlbnRgKTtcblxuICAgICAgICBjb25zdCBjaGlsZE5vZGVzID0gcmVmZXJlbmNlTm9kZS5wYXJlbnROb2RlLmNoaWxkTm9kZXM7XG4gICAgICAgIGNvbnN0IHJlZmVyZW5jZU5vZGVJbmRleCA9IGNoaWxkTm9kZXMuaW5kZXhPZihyZWZlcmVuY2VOb2RlKTtcbiAgICAgICAgWG1sTm9kZS5pbnNlcnRDaGlsZChyZWZlcmVuY2VOb2RlLnBhcmVudE5vZGUsIG5ld05vZGUsIHJlZmVyZW5jZU5vZGVJbmRleCArIDEpO1xuICAgIH0sXG5cbiAgICBpbnNlcnRDaGlsZChwYXJlbnQ6IFhtbE5vZGUsIGNoaWxkOiBYbWxOb2RlLCBjaGlsZEluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKCFwYXJlbnQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlzc2luZ0FyZ3VtZW50RXJyb3IobmFtZW9mKHBhcmVudCkpO1xuICAgICAgICBpZiAoWG1sTm9kZS5pc1RleHROb2RlKHBhcmVudCkpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FwcGVuZGluZyBjaGlsZHJlbiB0byB0ZXh0IG5vZGVzIGlzIGZvcmJpZGRlbicpO1xuICAgICAgICBpZiAoIWNoaWxkKVxuICAgICAgICAgICAgdGhyb3cgbmV3IE1pc3NpbmdBcmd1bWVudEVycm9yKG5hbWVvZihjaGlsZCkpO1xuXG4gICAgICAgIGlmICghcGFyZW50LmNoaWxkTm9kZXMpXG4gICAgICAgICAgICBwYXJlbnQuY2hpbGROb2RlcyA9IFtdO1xuXG4gICAgICAgIC8vIHJldmVydCB0byBhcHBlbmRcbiAgICAgICAgaWYgKGNoaWxkSW5kZXggPT09IHBhcmVudC5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgWG1sTm9kZS5hcHBlbmRDaGlsZChwYXJlbnQsIGNoaWxkKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaGlsZEluZGV4ID4gcGFyZW50LmNoaWxkTm9kZXMubGVuZ3RoKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYENoaWxkIGluZGV4ICR7Y2hpbGRJbmRleH0gaXMgb3V0IG9mIHJhbmdlLiBQYXJlbnQgaGFzIG9ubHkgJHtwYXJlbnQuY2hpbGROb2Rlcy5sZW5ndGh9IGNoaWxkIG5vZGVzLmApO1xuXG4gICAgICAgIC8vIHVwZGF0ZSByZWZlcmVuY2VzXG4gICAgICAgIGNoaWxkLnBhcmVudE5vZGUgPSBwYXJlbnQ7XG5cbiAgICAgICAgY29uc3QgY2hpbGRBZnRlciA9IHBhcmVudC5jaGlsZE5vZGVzW2NoaWxkSW5kZXhdO1xuICAgICAgICBjaGlsZC5uZXh0U2libGluZyA9IGNoaWxkQWZ0ZXI7XG5cbiAgICAgICAgaWYgKGNoaWxkSW5kZXggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBjaGlsZEJlZm9yZSA9IHBhcmVudC5jaGlsZE5vZGVzW2NoaWxkSW5kZXggLSAxXTtcbiAgICAgICAgICAgIGNoaWxkQmVmb3JlLm5leHRTaWJsaW5nID0gY2hpbGQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhcHBlbmRcbiAgICAgICAgcGFyZW50LmNoaWxkTm9kZXMuc3BsaWNlKGNoaWxkSW5kZXgsIDAsIGNoaWxkKTtcbiAgICB9LFxuXG4gICAgYXBwZW5kQ2hpbGQocGFyZW50OiBYbWxOb2RlLCBjaGlsZDogWG1sTm9kZSk6IHZvaWQge1xuICAgICAgICBpZiAoIXBhcmVudClcbiAgICAgICAgICAgIHRocm93IG5ldyBNaXNzaW5nQXJndW1lbnRFcnJvcihuYW1lb2YocGFyZW50KSk7XG4gICAgICAgIGlmIChYbWxOb2RlLmlzVGV4dE5vZGUocGFyZW50KSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQXBwZW5kaW5nIGNoaWxkcmVuIHRvIHRleHQgbm9kZXMgaXMgZm9yYmlkZGVuJyk7XG4gICAgICAgIGlmICghY2hpbGQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlzc2luZ0FyZ3VtZW50RXJyb3IobmFtZW9mKGNoaWxkKSk7XG5cbiAgICAgICAgaWYgKCFwYXJlbnQuY2hpbGROb2RlcylcbiAgICAgICAgICAgIHBhcmVudC5jaGlsZE5vZGVzID0gW107XG5cbiAgICAgICAgLy8gdXBkYXRlIHJlZmVyZW5jZXNcbiAgICAgICAgaWYgKHBhcmVudC5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudExhc3RDaGlsZCA9IHBhcmVudC5jaGlsZE5vZGVzW3BhcmVudC5jaGlsZE5vZGVzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgY3VycmVudExhc3RDaGlsZC5uZXh0U2libGluZyA9IGNoaWxkO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkLm5leHRTaWJsaW5nID0gbnVsbDtcbiAgICAgICAgY2hpbGQucGFyZW50Tm9kZSA9IHBhcmVudDtcblxuICAgICAgICAvLyBhcHBlbmRcbiAgICAgICAgcGFyZW50LmNoaWxkTm9kZXMucHVzaChjaGlsZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIG5vZGUgZnJvbSBpdCdzIHBhcmVudC5cbiAgICAgKlxuICAgICAqICogKipOb3RlKio6IEl0IGlzIG1vcmUgZWZmaWNpZW50IHRvIGNhbGwgcmVtb3ZlQ2hpbGQocGFyZW50LCBjaGlsZEluZGV4KS5cbiAgICAgKi9cbiAgICByZW1vdmUobm9kZTogWG1sTm9kZSk6IHZvaWQge1xuICAgICAgICBpZiAoIW5vZGUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlzc2luZ0FyZ3VtZW50RXJyb3IobmFtZW9mKG5vZGUpKTtcblxuICAgICAgICBpZiAoIW5vZGUucGFyZW50Tm9kZSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm9kZSBoYXMgbm8gcGFyZW50Jyk7XG5cbiAgICAgICAgcmVtb3ZlQ2hpbGQobm9kZS5wYXJlbnROb2RlLCBub2RlKTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlQ2hpbGQsXG5cbiAgICAvL1xuICAgIC8vIHV0aWxpdHkgZnVuY3Rpb25zXG4gICAgLy9cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGxhc3QgZGlyZWN0IGNoaWxkIHRleHQgbm9kZSBpZiBpdCBleGlzdHMuIE90aGVyd2lzZSBjcmVhdGVzIGFcbiAgICAgKiBuZXcgdGV4dCBub2RlLCBhcHBlbmRzIGl0IHRvICdub2RlJyBhbmQgcmV0dXJuIHRoZSBuZXdseSBjcmVhdGVkIHRleHRcbiAgICAgKiBub2RlLlxuICAgICAqXG4gICAgICogVGhlIGZ1bmN0aW9uIGFsc28gbWFrZXMgc3VyZSB0aGUgcmV0dXJuZWQgdGV4dCBub2RlIGhhcyBhIHZhbGlkIHN0cmluZ1xuICAgICAqIHZhbHVlLlxuICAgICAqL1xuICAgIGxhc3RUZXh0Q2hpbGQobm9kZTogWG1sTm9kZSk6IFhtbFRleHROb2RlIHtcbiAgICAgICAgaWYgKFhtbE5vZGUuaXNUZXh0Tm9kZShub2RlKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBleGlzdGluZyB0ZXh0IG5vZGVzXG4gICAgICAgIGlmIChub2RlLmNoaWxkTm9kZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbFRleHROb2RlcyA9IG5vZGUuY2hpbGROb2Rlcy5maWx0ZXIoY2hpbGQgPT4gWG1sTm9kZS5pc1RleHROb2RlKGNoaWxkKSkgYXMgWG1sVGV4dE5vZGVbXTtcbiAgICAgICAgICAgIGlmIChhbGxUZXh0Tm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdFRleHROb2RlID0gbGFzdChhbGxUZXh0Tm9kZXMpO1xuICAgICAgICAgICAgICAgIGlmICghbGFzdFRleHROb2RlLnRleHRDb250ZW50KVxuICAgICAgICAgICAgICAgICAgICBsYXN0VGV4dE5vZGUudGV4dENvbnRlbnQgPSAnJztcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFzdFRleHROb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gY3JlYXRlIG5ldyB0ZXh0IG5vZGVcbiAgICAgICAgY29uc3QgbmV3VGV4dE5vZGU6IFhtbFRleHROb2RlID0ge1xuICAgICAgICAgICAgbm9kZVR5cGU6IFhtbE5vZGVUeXBlLlRleHQsXG4gICAgICAgICAgICBub2RlTmFtZTogVEVYVF9OT0RFX05BTUUsXG4gICAgICAgICAgICB0ZXh0Q29udGVudDogJydcbiAgICAgICAgfTtcblxuICAgICAgICBYbWxOb2RlLmFwcGVuZENoaWxkKG5vZGUsIG5ld1RleHROb2RlKTtcbiAgICAgICAgcmV0dXJuIG5ld1RleHROb2RlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgc2libGluZyBub2RlcyBiZXR3ZWVuICdmcm9tJyBhbmQgJ3RvJyBleGNsdWRpbmcgYm90aC5cbiAgICAgKiBSZXR1cm4gdGhlIHJlbW92ZWQgbm9kZXMuXG4gICAgICovXG4gICAgcmVtb3ZlU2libGluZ3MoZnJvbTogWG1sTm9kZSwgdG86IFhtbE5vZGUpOiBYbWxOb2RlW10ge1xuICAgICAgICBpZiAoZnJvbSA9PT0gdG8pXG4gICAgICAgICAgICByZXR1cm4gW107XG5cbiAgICAgICAgY29uc3QgcmVtb3ZlZDogWG1sTm9kZVtdID0gW107XG4gICAgICAgIGxldCBsYXN0UmVtb3ZlZDogWG1sTm9kZTtcbiAgICAgICAgZnJvbSA9IGZyb20ubmV4dFNpYmxpbmc7XG4gICAgICAgIHdoaWxlIChmcm9tICE9PSB0bykge1xuICAgICAgICAgICAgY29uc3QgcmVtb3ZlTWUgPSBmcm9tO1xuICAgICAgICAgICAgZnJvbSA9IGZyb20ubmV4dFNpYmxpbmc7XG5cbiAgICAgICAgICAgIFhtbE5vZGUucmVtb3ZlKHJlbW92ZU1lKTtcbiAgICAgICAgICAgIHJlbW92ZWQucHVzaChyZW1vdmVNZSk7XG5cbiAgICAgICAgICAgIGlmIChsYXN0UmVtb3ZlZClcbiAgICAgICAgICAgICAgICBsYXN0UmVtb3ZlZC5uZXh0U2libGluZyA9IHJlbW92ZU1lO1xuICAgICAgICAgICAgbGFzdFJlbW92ZWQgPSByZW1vdmVNZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZW1vdmVkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTcGxpdCB0aGUgb3JpZ2luYWwgbm9kZSBpbnRvIHR3byBzaWJsaW5nIG5vZGVzLiBSZXR1cm5zIGJvdGggbm9kZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcGFyZW50IFRoZSBub2RlIHRvIHNwbGl0XG4gICAgICogQHBhcmFtIGNoaWxkIFRoZSBub2RlIHRoYXQgbWFya3MgdGhlIHNwbGl0IHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSByZW1vdmVDaGlsZCBTaG91bGQgdGhpcyBtZXRob2QgcmVtb3ZlIHRoZSBjaGlsZCB3aGlsZSBzcGxpdHRpbmcuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUd28gbm9kZXMgLSBgbGVmdGAgYW5kIGByaWdodGAuIElmIHRoZSBgcmVtb3ZlQ2hpbGRgIGFyZ3VtZW50IGlzXG4gICAgICogYGZhbHNlYCB0aGVuIHRoZSBvcmlnaW5hbCBjaGlsZCBub2RlIGlzIHRoZSBmaXJzdCBjaGlsZCBvZiBgcmlnaHRgLlxuICAgICAqL1xuICAgIHNwbGl0QnlDaGlsZChwYXJlbnQ6IFhtbE5vZGUsIGNoaWxkOiBYbWxOb2RlLCByZW1vdmVDaGlsZDogYm9vbGVhbik6IFtYbWxOb2RlLCBYbWxOb2RlXSB7XG5cbiAgICAgICAgaWYgKGNoaWxkLnBhcmVudE5vZGUgIT0gcGFyZW50KVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBOb2RlICcke25hbWVvZihjaGlsZCl9JyBpcyBub3QgYSBkaXJlY3QgY2hpbGQgb2YgJyR7bmFtZW9mKHBhcmVudCl9Jy5gKTtcblxuICAgICAgICAvLyBjcmVhdGUgY2hpbGRsZXNzIGNsb25lICdsZWZ0J1xuICAgICAgICBjb25zdCBsZWZ0ID0gWG1sTm9kZS5jbG9uZU5vZGUocGFyZW50LCBmYWxzZSk7XG4gICAgICAgIGlmIChwYXJlbnQucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgWG1sTm9kZS5pbnNlcnRCZWZvcmUobGVmdCwgcGFyZW50KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByaWdodCA9IHBhcmVudDtcblxuICAgICAgICAvLyBtb3ZlIG5vZGVzIGZyb20gJ3JpZ2h0JyB0byAnbGVmdCdcbiAgICAgICAgbGV0IGN1ckNoaWxkID0gcmlnaHQuY2hpbGROb2Rlc1swXTtcbiAgICAgICAgd2hpbGUgKGN1ckNoaWxkICE9IGNoaWxkKSB7XG4gICAgICAgICAgICBYbWxOb2RlLnJlbW92ZShjdXJDaGlsZCk7XG4gICAgICAgICAgICBYbWxOb2RlLmFwcGVuZENoaWxkKGxlZnQsIGN1ckNoaWxkKTtcbiAgICAgICAgICAgIGN1ckNoaWxkID0gcmlnaHQuY2hpbGROb2Rlc1swXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlbW92ZSBjaGlsZFxuICAgICAgICBpZiAocmVtb3ZlQ2hpbGQpIHtcbiAgICAgICAgICAgIFhtbE5vZGUucmVtb3ZlQ2hpbGQocmlnaHQsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtsZWZ0LCByaWdodF07XG4gICAgfSxcblxuICAgIGZpbmRQYXJlbnQobm9kZTogWG1sTm9kZSwgcHJlZGljYXRlOiAobm9kZTogWG1sTm9kZSkgPT4gYm9vbGVhbik6IFhtbE5vZGUge1xuXG4gICAgICAgIHdoaWxlIChub2RlKSB7XG5cbiAgICAgICAgICAgIGlmIChwcmVkaWNhdGUobm9kZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG5cbiAgICAgICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgZmluZFBhcmVudEJ5TmFtZShub2RlOiBYbWxOb2RlLCBub2RlTmFtZTogc3RyaW5nKTogWG1sTm9kZSB7XG4gICAgICAgIHJldHVybiBYbWxOb2RlLmZpbmRQYXJlbnQobm9kZSwgbiA9PiBuLm5vZGVOYW1lID09PSBub2RlTmFtZSk7XG4gICAgfSxcblxuICAgIGZpbmRDaGlsZEJ5TmFtZShub2RlOiBYbWxOb2RlLCBjaGlsZE5hbWU6IHN0cmluZyk6IFhtbE5vZGUge1xuICAgICAgICBpZiAoIW5vZGUpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIChub2RlLmNoaWxkTm9kZXMgfHwgW10pLmZpbmQoY2hpbGQgPT4gY2hpbGQubm9kZU5hbWUgPT09IGNoaWxkTmFtZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIHNpYmxpbmdzIGJldHdlZW4gJ2ZpcnN0Tm9kZScgYW5kICdsYXN0Tm9kZScgaW5jbHVzaXZlLlxuICAgICAqL1xuICAgIHNpYmxpbmdzSW5SYW5nZShmaXJzdE5vZGU6IFhtbE5vZGUsIGxhc3ROb2RlOiBYbWxOb2RlKTogWG1sTm9kZVtdIHtcbiAgICAgICAgaWYgKCFmaXJzdE5vZGUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlzc2luZ0FyZ3VtZW50RXJyb3IobmFtZW9mKGZpcnN0Tm9kZSkpO1xuICAgICAgICBpZiAoIWxhc3ROb2RlKVxuICAgICAgICAgICAgdGhyb3cgbmV3IE1pc3NpbmdBcmd1bWVudEVycm9yKG5hbWVvZihsYXN0Tm9kZSkpO1xuXG4gICAgICAgIGNvbnN0IHJhbmdlOiBYbWxOb2RlW10gPSBbXTtcbiAgICAgICAgbGV0IGN1ck5vZGUgPSBmaXJzdE5vZGU7XG4gICAgICAgIHdoaWxlIChjdXJOb2RlICYmIGN1ck5vZGUgIT09IGxhc3ROb2RlKSB7XG4gICAgICAgICAgICByYW5nZS5wdXNoKGN1ck5vZGUpO1xuICAgICAgICAgICAgY3VyTm9kZSA9IGN1ck5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWN1ck5vZGUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vZGVzIGFyZSBub3Qgc2libGluZ3MuJyk7XG5cbiAgICAgICAgcmFuZ2UucHVzaChsYXN0Tm9kZSk7XG4gICAgICAgIHJldHVybiByYW5nZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVjdXJzaXZlbHkgcmVtb3ZlcyB0ZXh0IG5vZGVzIGxlYXZpbmcgb25seSBcImdlbmVyYWwgbm9kZXNcIi5cbiAgICAgKi9cbiAgICByZW1vdmVFbXB0eVRleHROb2Rlcyhub2RlOiBYbWxOb2RlKTogdm9pZCB7XG4gICAgICAgIHJlY3Vyc2l2ZVJlbW92ZUVtcHR5VGV4dE5vZGVzKG5vZGUpO1xuICAgIH0sXG59O1xuXG4vL1xuLy8gb3ZlcmxvYWRlZCBmdW5jdGlvbnNcbi8vXG5cbi8qKlxuICogUmVtb3ZlIGEgY2hpbGQgbm9kZSBmcm9tIGl0J3MgcGFyZW50LiBSZXR1cm5zIHRoZSByZW1vdmVkIGNoaWxkLlxuICpcbiAqICogKipOb3RlOioqIFByZWZlciBjYWxsaW5nIHdpdGggZXhwbGljaXQgaW5kZXguXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkKHBhcmVudDogWG1sTm9kZSwgY2hpbGQ6IFhtbE5vZGUpOiBYbWxOb2RlO1xuLyoqXG4gKiBSZW1vdmUgYSBjaGlsZCBub2RlIGZyb20gaXQncyBwYXJlbnQuIFJldHVybnMgdGhlIHJlbW92ZWQgY2hpbGQuXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkKHBhcmVudDogWG1sTm9kZSwgY2hpbGRJbmRleDogbnVtYmVyKTogWG1sTm9kZTtcbmZ1bmN0aW9uIHJlbW92ZUNoaWxkKHBhcmVudDogWG1sTm9kZSwgY2hpbGRPckluZGV4OiBYbWxOb2RlIHwgbnVtYmVyKTogWG1sTm9kZSB7XG4gICAgaWYgKCFwYXJlbnQpXG4gICAgICAgIHRocm93IG5ldyBNaXNzaW5nQXJndW1lbnRFcnJvcihuYW1lb2YocGFyZW50KSk7XG4gICAgaWYgKGNoaWxkT3JJbmRleCA9PT0gbnVsbCB8fCBjaGlsZE9ySW5kZXggPT09IHVuZGVmaW5lZClcbiAgICAgICAgdGhyb3cgbmV3IE1pc3NpbmdBcmd1bWVudEVycm9yKG5hbWVvZihjaGlsZE9ySW5kZXgpKTtcblxuICAgIGlmICghcGFyZW50LmNoaWxkTm9kZXMgfHwgIXBhcmVudC5jaGlsZE5vZGVzLmxlbmd0aClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXJlbnQgbm9kZSBoYXMgbm9kZSBjaGlsZHJlbicpO1xuXG4gICAgLy8gZ2V0IGNoaWxkIGluZGV4XG4gICAgbGV0IGNoaWxkSW5kZXg6IG51bWJlcjtcbiAgICBpZiAodHlwZW9mIGNoaWxkT3JJbmRleCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgY2hpbGRJbmRleCA9IGNoaWxkT3JJbmRleDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjaGlsZEluZGV4ID0gcGFyZW50LmNoaWxkTm9kZXMuaW5kZXhPZihjaGlsZE9ySW5kZXgpO1xuICAgICAgICBpZiAoY2hpbGRJbmRleCA9PT0gLTEpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NwZWNpZmllZCBjaGlsZCBub2RlIGlzIG5vdCBhIGNoaWxkIG9mIHRoZSBzcGVjaWZpZWQgcGFyZW50Jyk7XG4gICAgfVxuXG4gICAgaWYgKGNoaWxkSW5kZXggPj0gcGFyZW50LmNoaWxkTm9kZXMubGVuZ3RoKVxuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgQ2hpbGQgaW5kZXggJHtjaGlsZEluZGV4fSBpcyBvdXQgb2YgcmFuZ2UuIFBhcmVudCBoYXMgb25seSAke3BhcmVudC5jaGlsZE5vZGVzLmxlbmd0aH0gY2hpbGQgbm9kZXMuYCk7XG5cbiAgICAvLyB1cGRhdGUgcmVmZXJlbmNlc1xuICAgIGNvbnN0IGNoaWxkID0gcGFyZW50LmNoaWxkTm9kZXNbY2hpbGRJbmRleF07XG4gICAgaWYgKGNoaWxkSW5kZXggPiAwKSB7XG4gICAgICAgIGNvbnN0IGJlZm9yZUNoaWxkID0gcGFyZW50LmNoaWxkTm9kZXNbY2hpbGRJbmRleCAtIDFdO1xuICAgICAgICBiZWZvcmVDaGlsZC5uZXh0U2libGluZyA9IGNoaWxkLm5leHRTaWJsaW5nO1xuICAgIH1cbiAgICBjaGlsZC5wYXJlbnROb2RlID0gbnVsbDtcbiAgICBjaGlsZC5uZXh0U2libGluZyA9IG51bGw7XG5cbiAgICAvLyByZW1vdmUgYW5kIHJldHVyblxuICAgIHJldHVybiBwYXJlbnQuY2hpbGROb2Rlcy5zcGxpY2UoY2hpbGRJbmRleCwgMSlbMF07XG59XG5cbi8vXG4vLyBwcml2YXRlIGZ1bmN0aW9uc1xuLy9cblxuZnVuY3Rpb24gY2xvbmVOb2RlRGVlcDxUIGV4dGVuZHMgWG1sTm9kZT4ob3JpZ2luYWw6IFQpOiBUIHtcblxuICAgIGNvbnN0IGNsb25lOiBYbWxOb2RlID0gKHt9IGFzIGFueSk7XG5cbiAgICAvLyBiYXNpYyBwcm9wZXJ0aWVzXG4gICAgY2xvbmUubm9kZVR5cGUgPSBvcmlnaW5hbC5ub2RlVHlwZTtcbiAgICBjbG9uZS5ub2RlTmFtZSA9IG9yaWdpbmFsLm5vZGVOYW1lO1xuICAgIGlmIChYbWxOb2RlLmlzVGV4dE5vZGUob3JpZ2luYWwpKSB7XG4gICAgICAgIChjbG9uZSBhcyBYbWxUZXh0Tm9kZSkudGV4dENvbnRlbnQgPSBvcmlnaW5hbC50ZXh0Q29udGVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0gKG9yaWdpbmFsIGFzIFhtbEdlbmVyYWxOb2RlKS5hdHRyaWJ1dGVzO1xuICAgICAgICBpZiAoYXR0cmlidXRlcykge1xuICAgICAgICAgICAgKGNsb25lIGFzIFhtbEdlbmVyYWxOb2RlKS5hdHRyaWJ1dGVzID0gT2JqZWN0LmFzc2lnbih7fSwgYXR0cmlidXRlcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjaGlsZHJlblxuICAgIGlmIChvcmlnaW5hbC5jaGlsZE5vZGVzKSB7XG4gICAgICAgIGNsb25lLmNoaWxkTm9kZXMgPSBbXTtcbiAgICAgICAgbGV0IHByZXZDaGlsZENsb25lOiBYbWxOb2RlO1xuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIG9yaWdpbmFsLmNoaWxkTm9kZXMpIHtcblxuICAgICAgICAgICAgLy8gY2xvbmUgY2hpbGRcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkQ2xvbmUgPSBjbG9uZU5vZGVEZWVwKGNoaWxkKTtcblxuICAgICAgICAgICAgLy8gc2V0IHJlZmVyZW5jZXNcbiAgICAgICAgICAgIGNsb25lLmNoaWxkTm9kZXMucHVzaChjaGlsZENsb25lKTtcbiAgICAgICAgICAgIGNoaWxkQ2xvbmUucGFyZW50Tm9kZSA9IGNsb25lO1xuICAgICAgICAgICAgaWYgKHByZXZDaGlsZENsb25lKSB7XG4gICAgICAgICAgICAgICAgcHJldkNoaWxkQ2xvbmUubmV4dFNpYmxpbmcgPSBjaGlsZENsb25lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJldkNoaWxkQ2xvbmUgPSBjaGlsZENsb25lO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsb25lIGFzIFQ7XG59XG5cbmZ1bmN0aW9uIHJlY3Vyc2l2ZVJlbW92ZUVtcHR5VGV4dE5vZGVzKG5vZGU6IFhtbE5vZGUpOiBYbWxOb2RlIHtcblxuICAgIGlmICghbm9kZS5jaGlsZE5vZGVzKVxuICAgICAgICByZXR1cm4gbm9kZTtcblxuICAgIGNvbnN0IG9sZENoaWxkcmVuID0gbm9kZS5jaGlsZE5vZGVzO1xuICAgIG5vZGUuY2hpbGROb2RlcyA9IFtdO1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2Ygb2xkQ2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKFhtbE5vZGUuaXNUZXh0Tm9kZShjaGlsZCkpIHtcblxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTkyMTY4OC9maWx0ZXJpbmctd2hpdGVzcGFjZS1vbmx5LXN0cmluZ3MtaW4tamF2YXNjcmlwdCMxOTIxNjk0XG4gICAgICAgICAgICBpZiAoY2hpbGQudGV4dENvbnRlbnQgJiYgY2hpbGQudGV4dENvbnRlbnQubWF0Y2goL1xcUy8pKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5jaGlsZE5vZGVzLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdHJpcHBlZENoaWxkID0gcmVjdXJzaXZlUmVtb3ZlRW1wdHlUZXh0Tm9kZXMoY2hpbGQpO1xuICAgICAgICBub2RlLmNoaWxkTm9kZXMucHVzaChzdHJpcHBlZENoaWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZTtcbn1cbiIsImltcG9ydCAqIGFzIHhtbGRvbSBmcm9tICd4bWxkb20nO1xuaW1wb3J0IHsgTWlzc2luZ0FyZ3VtZW50RXJyb3IgfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHsgWG1sTm9kZSB9IGZyb20gJy4veG1sTm9kZSc7XG5cbmV4cG9ydCBjbGFzcyBYbWxQYXJzZXIge1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgeG1sSGVhZGVyID0gJzw/eG1sIHZlcnNpb249XCIxLjBcIiBlbmNvZGluZz1cIlVURi04XCIgc3RhbmRhbG9uZT1cInllc1wiPz4nO1xuICAgIC8qKlxuICAgICAqIFdlIGFsd2F5cyB1c2UgdGhlIERPTVBhcnNlciBmcm9tICd4bWxkb20nLCBldmVuIGluIHRoZSBicm93c2VyIHNpbmNlIGl0XG4gICAgICogaGFuZGxlcyB4bWwgbmFtZXNwYWNlcyBtb3JlIGZvcmdpdmluZ2x5IChyZXF1aXJlZCBtYWlubHkgYnkgdGhlXG4gICAgICogUmF3WG1sUGx1Z2luKS5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBwYXJzZXIgPSBuZXcgeG1sZG9tLkRPTVBhcnNlcigpO1xuXG4gICAgcHVibGljIHBhcnNlKHN0cjogc3RyaW5nKTogWG1sTm9kZSB7XG4gICAgICAgIGNvbnN0IGRvYyA9IHRoaXMuZG9tUGFyc2Uoc3RyKTtcbiAgICAgICAgcmV0dXJuIFhtbE5vZGUuZnJvbURvbU5vZGUoZG9jLmRvY3VtZW50RWxlbWVudCk7XG4gICAgfVxuXG4gICAgcHVibGljIGRvbVBhcnNlKHN0cjogc3RyaW5nKTogRG9jdW1lbnQge1xuICAgICAgICBpZiAoc3RyID09PSBudWxsIHx8IHN0ciA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgdGhyb3cgbmV3IE1pc3NpbmdBcmd1bWVudEVycm9yKG5hbWVvZihzdHIpKTtcblxuICAgICAgICByZXR1cm4gWG1sUGFyc2VyLnBhcnNlci5wYXJzZUZyb21TdHJpbmcoc3RyLCBcInRleHQveG1sXCIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXJpYWxpemUoeG1sTm9kZTogWG1sTm9kZSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBYbWxQYXJzZXIueG1sSGVhZGVyICsgWG1sTm9kZS5zZXJpYWxpemUoeG1sTm9kZSk7XG4gICAgfSAgICBcbn1cbiIsImltcG9ydCB7IE1pc3NpbmdBcmd1bWVudEVycm9yIH0gZnJvbSAnLi4vZXJyb3JzJztcbmltcG9ydCB7IERvY3hQYXJzZXIgfSBmcm9tICcuLi9vZmZpY2UnO1xuaW1wb3J0IHsgZmlyc3QsIGxhc3QgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBYbWxEZXB0aFRyYWNrZXIsIFhtbE5vZGUsIFhtbFRleHROb2RlIH0gZnJvbSAnLi4veG1sJztcbmltcG9ydCB7IERlbGltaXRlck1hcmsgfSBmcm9tICcuL2RlbGltaXRlck1hcmsnO1xuXG5jbGFzcyBNYXRjaFN0YXRlIHtcblxuICAgIHB1YmxpYyBkZWxpbWl0ZXJJbmRleCA9IDA7XG4gICAgcHVibGljIG9wZW5Ob2RlczogWG1sVGV4dE5vZGVbXSA9IFtdO1xuICAgIHB1YmxpYyBmaXJzdE1hdGNoSW5kZXggPSAtMTtcblxuICAgIHB1YmxpYyByZXNldCgpIHtcbiAgICAgICAgdGhpcy5kZWxpbWl0ZXJJbmRleCA9IDA7XG4gICAgICAgIHRoaXMub3Blbk5vZGVzID0gW107XG4gICAgICAgIHRoaXMuZmlyc3RNYXRjaEluZGV4ID0gLTE7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsaW1pdGVyU2VhcmNoZXIge1xuXG4gICAgcHVibGljIG1heFhtbERlcHRoID0gMjA7XG4gICAgcHVibGljIHN0YXJ0RGVsaW1pdGVyID0gXCJ7XCI7XG4gICAgcHVibGljIGVuZERlbGltaXRlciA9IFwifVwiO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBkb2N4UGFyc2VyOiBEb2N4UGFyc2VyKSB7XG4gICAgICAgIGlmICghZG9jeFBhcnNlcilcbiAgICAgICAgICAgIHRocm93IG5ldyBNaXNzaW5nQXJndW1lbnRFcnJvcihuYW1lb2YoZG9jeFBhcnNlcikpO1xuICAgIH1cblxuICAgIHB1YmxpYyBmaW5kRGVsaW1pdGVycyhub2RlOiBYbWxOb2RlKTogRGVsaW1pdGVyTWFya1tdIHtcblxuICAgICAgICAvL1xuICAgICAgICAvLyBQZXJmb3JtYW5jZSBub3RlOiBcbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlIHNlYXJjaCBlZmZpY2llbmN5IGlzIG8obSpuKSB3aGVyZSBuIGlzIHRoZSB0ZXh0IHNpemUgYW5kIG0gaXMgdGhlXG4gICAgICAgIC8vIGRlbGltaXRlciBsZW5ndGguIFdlIGNvdWxkIHVzZSBhIHZhcmlhdGlvbiBvZiB0aGUgS01QIGFsZ29yaXRobSBoZXJlXG4gICAgICAgIC8vIHRvIHJlZHVjZSBpdCB0byBvKG0rbikgYnV0IHNpbmNlIG91ciBtIGlzIGV4cGVjdGVkIHRvIGJlIHNtYWxsXG4gICAgICAgIC8vIChkZWxpbWl0ZXJzIGRlZmF1bHRzIHRvIDIgY2hhcmFjdGVycyBhbmQgZXZlbiBvbiBjdXN0b20gaW5wdXRzIGFyZVxuICAgICAgICAvLyBub3QgZXhwZWN0ZWQgdG8gYmUgbXVjaCBsb25nZXIpIGl0IGRvZXMgbm90IHdvcnRoIHRoZSBleHRyYVxuICAgICAgICAvLyBjb21wbGV4aXR5IGFuZCBlZmZvcnQuXG4gICAgICAgIC8vXG5cbiAgICAgICAgY29uc3QgZGVsaW1pdGVyczogRGVsaW1pdGVyTWFya1tdID0gW107XG4gICAgICAgIGNvbnN0IG1hdGNoID0gbmV3IE1hdGNoU3RhdGUoKTtcbiAgICAgICAgY29uc3QgZGVwdGggPSBuZXcgWG1sRGVwdGhUcmFja2VyKHRoaXMubWF4WG1sRGVwdGgpO1xuICAgICAgICBsZXQgbG9va0Zvck9wZW5EZWxpbWl0ZXIgPSB0cnVlO1xuXG4gICAgICAgIHdoaWxlIChub2RlKSB7XG5cbiAgICAgICAgICAgIC8vIHJlc2V0IHN0YXRlIG9uIHBhcmFncmFwaCB0cmFuc2l0aW9uXG4gICAgICAgICAgICBpZiAodGhpcy5kb2N4UGFyc2VyLmlzUGFyYWdyYXBoTm9kZShub2RlKSkge1xuICAgICAgICAgICAgICAgIG1hdGNoLnJlc2V0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHNraXAgaXJyZWxldmFudCBub2Rlc1xuICAgICAgICAgICAgaWYgKCF0aGlzLnNob3VsZFNlYXJjaE5vZGUobm9kZSkpIHtcbiAgICAgICAgICAgICAgICBub2RlID0gdGhpcy5maW5kTmV4dE5vZGUobm9kZSwgZGVwdGgpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzZWFyY2ggZGVsaW1pdGVycyBpbiB0ZXh0IG5vZGVzXG4gICAgICAgICAgICBtYXRjaC5vcGVuTm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgICAgIGxldCB0ZXh0SW5kZXggPSAwO1xuICAgICAgICAgICAgd2hpbGUgKHRleHRJbmRleCA8IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoKSB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkZWxpbWl0ZXJQYXR0ZXJuID0gbG9va0Zvck9wZW5EZWxpbWl0ZXIgPyB0aGlzLnN0YXJ0RGVsaW1pdGVyIDogdGhpcy5lbmREZWxpbWl0ZXI7XG5cbiAgICAgICAgICAgICAgICAvLyBjaGFyIG1hdGNoXG4gICAgICAgICAgICAgICAgY29uc3QgY2hhciA9IG5vZGUudGV4dENvbnRlbnRbdGV4dEluZGV4XTtcbiAgICAgICAgICAgICAgICBpZiAoY2hhciA9PT0gZGVsaW1pdGVyUGF0dGVyblttYXRjaC5kZWxpbWl0ZXJJbmRleF0pIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBmaXJzdCBtYXRjaFxuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2guZmlyc3RNYXRjaEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2guZmlyc3RNYXRjaEluZGV4ID0gdGV4dEluZGV4O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZnVsbCBkZWxpbWl0ZXIgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoLmRlbGltaXRlckluZGV4ID09PSBkZWxpbWl0ZXJQYXR0ZXJuLmxlbmd0aCAtIDEpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbW92ZSBhbGwgZGVsaW1pdGVycyBjaGFyYWN0ZXJzIHRvIHRoZSBzYW1lIHRleHQgbm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoLm9wZW5Ob2Rlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlyc3ROb2RlID0gZmlyc3QobWF0Y2gub3Blbk5vZGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXN0Tm9kZSA9IGxhc3QobWF0Y2gub3Blbk5vZGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRvY3hQYXJzZXIuam9pblRleHROb2Rlc1JhbmdlKGZpcnN0Tm9kZSwgbGFzdE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRJbmRleCArPSAoZmlyc3ROb2RlLnRleHRDb250ZW50Lmxlbmd0aCAtIG5vZGUudGV4dENvbnRlbnQubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlID0gZmlyc3ROb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzdG9yZSBkZWxpbWl0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlbGltaXRlck1hcmsgPSB0aGlzLmNyZWF0ZURlbGltaXRlck1hcmsobWF0Y2gsIGxvb2tGb3JPcGVuRGVsaW1pdGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGltaXRlcnMucHVzaChkZWxpbWl0ZXJNYXJrKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBsb29rRm9yT3BlbkRlbGltaXRlciA9ICFsb29rRm9yT3BlbkRlbGltaXRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGV4dEluZGV4IDwgbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2gub3Blbk5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoLmRlbGltaXRlckluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBubyBtYXRjaFxuICAgICAgICAgICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vIGdvIGJhY2sgdG8gZmlyc3Qgb3BlbiBub2RlXG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlcXVpcmVkIGZvciBjYXNlcyB3aGVyZSB0aGUgdGV4dCBoYXMgcmVwZWF0aW5nXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoYXJhY3RlcnMgdGhhdCBhcmUgdGhlIHNhbWUgYXMgYSBkZWxpbWl0ZXIgcHJlZml4LiAgXG4gICAgICAgICAgICAgICAgICAgIC8vIEZvciBpbnN0YW5jZTogIFxuICAgICAgICAgICAgICAgICAgICAvLyBEZWxpbWl0ZXIgaXMgJ3shJyBhbmQgdGVtcGxhdGUgdGV4dCBjb250YWlucyB0aGUgc3RyaW5nICd7eyEnXG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaC5maXJzdE1hdGNoSW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlID0gZmlyc3QobWF0Y2gub3Blbk5vZGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHRJbmRleCA9IG1hdGNoLmZpcnN0TWF0Y2hJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBzdGF0ZVxuICAgICAgICAgICAgICAgICAgICBtYXRjaC5yZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGV4dEluZGV4IDwgbm9kZS50ZXh0Q29udGVudC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaC5vcGVuTm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRleHRJbmRleCsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBub2RlID0gdGhpcy5maW5kTmV4dE5vZGUobm9kZSwgZGVwdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRlbGltaXRlcnM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG91bGRTZWFyY2hOb2RlKG5vZGU6IFhtbE5vZGUpOiBub2RlIGlzIFhtbFRleHROb2RlIHtcblxuICAgICAgICBpZiAoIVhtbE5vZGUuaXNUZXh0Tm9kZShub2RlKSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKCFub2RlLnRleHRDb250ZW50KVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoIW5vZGUucGFyZW50Tm9kZSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKCF0aGlzLmRvY3hQYXJzZXIuaXNUZXh0Tm9kZShub2RlLnBhcmVudE5vZGUpKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZE5leHROb2RlKG5vZGU6IFhtbE5vZGUsIGRlcHRoOiBYbWxEZXB0aFRyYWNrZXIpOiBYbWxOb2RlIHtcblxuICAgICAgICAvLyBjaGlsZHJlblxuICAgICAgICBpZiAobm9kZS5jaGlsZE5vZGVzICYmIG5vZGUuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRlcHRoLmluY3JlbWVudCgpO1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUuY2hpbGROb2Rlc1swXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNpYmxpbmdzXG4gICAgICAgIGlmIChub2RlLm5leHRTaWJsaW5nKVxuICAgICAgICAgICAgcmV0dXJuIG5vZGUubmV4dFNpYmxpbmc7XG5cbiAgICAgICAgLy8gcGFyZW50IHNpYmxpbmdcbiAgICAgICAgd2hpbGUgKG5vZGUucGFyZW50Tm9kZSkge1xuXG4gICAgICAgICAgICBpZiAobm9kZS5wYXJlbnROb2RlLm5leHRTaWJsaW5nKSB7XG4gICAgICAgICAgICAgICAgZGVwdGguZGVjcmVtZW50KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUucGFyZW50Tm9kZS5uZXh0U2libGluZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZ28gdXBcbiAgICAgICAgICAgIGRlcHRoLmRlY3JlbWVudCgpO1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlRGVsaW1pdGVyTWFyayhtYXRjaDogTWF0Y2hTdGF0ZSwgaXNPcGVuRGVsaW1pdGVyOiBib29sZWFuKTogRGVsaW1pdGVyTWFyayB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbmRleDogbWF0Y2guZmlyc3RNYXRjaEluZGV4LFxuICAgICAgICAgICAgaXNPcGVuOiBpc09wZW5EZWxpbWl0ZXIsXG4gICAgICAgICAgICB4bWxUZXh0Tm9kZTogbWF0Y2gub3Blbk5vZGVzWzBdXG4gICAgICAgIH07XG4gICAgfVxufSIsImltcG9ydCB7VGVtcGxhdGVDb250ZW50LCBUZW1wbGF0ZURhdGF9IGZyb20gJy4uL3RlbXBsYXRlRGF0YSc7XG5pbXBvcnQge2xhc3R9IGZyb20gJy4uL3V0aWxzJztcblxuY29uc3QgZ2V0UHJvcCA9IHJlcXVpcmUoJ2xvZGFzaC5nZXQnKTtcbmNvbnN0IFRPS0VOX0lURU1fT0ZfQVJSQVkgPSAnQGl0ZW0nO1xuY29uc3QgVE9LRU5fSU5ERVhfT0ZfQVJSQVkgPSAnQGluZGV4JztcbmNvbnN0IFRPS0VOX0NPVU5UX09GX0FSUkFZID0gJ0Bjb3VudCc7XG5cbmV4cG9ydCBjbGFzcyBTY29wZURhdGEge1xuICAgIHB1YmxpYyByZWFkb25seSBwYXRoOiAoc3RyaW5nIHwgbnVtYmVyKVtdID0gW107XG4gICAgcHVibGljIHJlYWRvbmx5IGFsbERhdGE6IFRlbXBsYXRlRGF0YTtcblxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IFRlbXBsYXRlRGF0YSkge1xuICAgICAgICB0aGlzLmFsbERhdGEgPSBkYXRhO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRTY29wZURhdGE8VCBleHRlbmRzIFRlbXBsYXRlQ29udGVudCB8IFRlbXBsYXRlRGF0YVtdPigpOiBUIHtcbiAgICAgICAgY29uc3QgbGFzdEtleSA9IGxhc3QodGhpcy5wYXRoKTtcblxuICAgICAgICBsZXQgcmVzdWx0OiBhbnk7XG4gICAgICAgIGxldCBjdXJQYXRoID0gdGhpcy5wYXRoLnNsaWNlKCk7XG5cbiAgICAgICAgd2hpbGUgKHJlc3VsdCA9PT0gdW5kZWZpbmVkICYmIGN1clBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJTY29wZVBhdGggPSBjdXJQYXRoLnNsaWNlKDAsIGN1clBhdGgubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICBpZiAobGFzdEtleSA9PT0gVE9LRU5fSVRFTV9PRl9BUlJBWSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGdldFByb3AodGhpcy5hbGxEYXRhLCBjdXJTY29wZVBhdGgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsYXN0S2V5ID09PSBUT0tFTl9JTkRFWF9PRl9BUlJBWSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGxhc3QoY3VyU2NvcGVQYXRoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGFzdEtleSA9PT0gVE9LRU5fQ09VTlRfT0ZfQVJSQVkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBsYXN0KGN1clNjb3BlUGF0aCkgYXMgbnVtYmVyICsgMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZ2V0UHJvcCh0aGlzLmFsbERhdGEsIGN1clNjb3BlUGF0aC5jb25jYXQobGFzdEtleSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdXJQYXRoID0gY3VyU2NvcGVQYXRoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgWG1sVGV4dE5vZGUgfSBmcm9tICcuLi94bWwnO1xuXG5leHBvcnQgZW51bSBUYWdEaXNwb3NpdGlvbiB7XG4gICAgT3BlbiA9IFwiT3BlblwiLFxuICAgIENsb3NlID0gXCJDbG9zZVwiLFxuICAgIFNlbGZDbG9zZWQgPSBcIlNlbGZDbG9zZWRcIlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRhZyB7ICAgIFxuICAgIG5hbWU6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBUaGUgZnVsbCB0YWcgdGV4dCwgZm9yIGluc3RhbmNlOiBcInsjbXktdGFnfVwiLlxuICAgICAqL1xuICAgIHJhd1RleHQ6IHN0cmluZztcbiAgICBkaXNwb3NpdGlvbjogVGFnRGlzcG9zaXRpb247XG4gICAgeG1sVGV4dE5vZGU6IFhtbFRleHROb2RlO1xufSIsImltcG9ydCB7IERlbGltaXRlcnMgfSBmcm9tICcuLi9kZWxpbWl0ZXJzJztcbmltcG9ydCB7IE1pc3NpbmdBcmd1bWVudEVycm9yLCBNaXNzaW5nQ2xvc2VEZWxpbWl0ZXJFcnJvciwgTWlzc2luZ1N0YXJ0RGVsaW1pdGVyRXJyb3IgfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHsgRG9jeFBhcnNlciB9IGZyb20gJy4uL29mZmljZSc7XG5pbXBvcnQgeyBSZWdleCB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IERlbGltaXRlck1hcmsgfSBmcm9tICcuL2RlbGltaXRlck1hcmsnO1xuaW1wb3J0IHsgVGFnLCBUYWdEaXNwb3NpdGlvbiB9IGZyb20gJy4vdGFnJztcblxuZXhwb3J0IGNsYXNzIFRhZ1BhcnNlciB7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHRhZ1JlZ2V4OiBSZWdFeHA7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBkb2NQYXJzZXI6IERvY3hQYXJzZXIsXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgZGVsaW1pdGVyczogRGVsaW1pdGVyc1xuICAgICkge1xuICAgICAgICBpZiAoIWRvY1BhcnNlcilcbiAgICAgICAgICAgIHRocm93IG5ldyBNaXNzaW5nQXJndW1lbnRFcnJvcihuYW1lb2YoZG9jUGFyc2VyKSk7XG4gICAgICAgIGlmICghZGVsaW1pdGVycylcbiAgICAgICAgICAgIHRocm93IG5ldyBNaXNzaW5nQXJndW1lbnRFcnJvcihuYW1lb2YoZGVsaW1pdGVycykpO1xuXG4gICAgICAgIHRoaXMudGFnUmVnZXggPSBuZXcgUmVnRXhwKGBeJHtSZWdleC5lc2NhcGUoZGVsaW1pdGVycy50YWdTdGFydCl9KC4qPykke1JlZ2V4LmVzY2FwZShkZWxpbWl0ZXJzLnRhZ0VuZCl9YCwgJ20nKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcGFyc2UoZGVsaW1pdGVyczogRGVsaW1pdGVyTWFya1tdKTogVGFnW10ge1xuICAgICAgICBjb25zdCB0YWdzOiBUYWdbXSA9IFtdO1xuXG4gICAgICAgIGxldCBvcGVuZWRUYWc6IFBhcnRpYWw8VGFnPjtcbiAgICAgICAgbGV0IG9wZW5lZERlbGltaXRlcjogRGVsaW1pdGVyTWFyaztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZWxpbWl0ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBkZWxpbWl0ZXIgPSBkZWxpbWl0ZXJzW2ldO1xuXG4gICAgICAgICAgICAvLyBjbG9zZSBiZWZvcmUgb3BlblxuICAgICAgICAgICAgaWYgKCFvcGVuZWRUYWcgJiYgIWRlbGltaXRlci5pc09wZW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbG9zZVRhZ1RleHQgPSBkZWxpbWl0ZXIueG1sVGV4dE5vZGUudGV4dENvbnRlbnQ7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1pc3NpbmdTdGFydERlbGltaXRlckVycm9yKGNsb3NlVGFnVGV4dCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG9wZW4gYmVmb3JlIGNsb3NlXG4gICAgICAgICAgICBpZiAob3BlbmVkVGFnICYmIGRlbGltaXRlci5pc09wZW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvcGVuVGFnVGV4dCA9IG9wZW5lZERlbGltaXRlci54bWxUZXh0Tm9kZS50ZXh0Q29udGVudDtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWlzc2luZ0Nsb3NlRGVsaW1pdGVyRXJyb3Iob3BlblRhZ1RleHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB2YWxpZCBvcGVuXG4gICAgICAgICAgICBpZiAoIW9wZW5lZFRhZyAmJiBkZWxpbWl0ZXIuaXNPcGVuKSB7XG4gICAgICAgICAgICAgICAgb3BlbmVkVGFnID0ge307XG4gICAgICAgICAgICAgICAgb3BlbmVkRGVsaW1pdGVyID0gZGVsaW1pdGVyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB2YWxpZCBjbG9zZVxuICAgICAgICAgICAgaWYgKG9wZW5lZFRhZyAmJiAhZGVsaW1pdGVyLmlzT3Blbikge1xuXG4gICAgICAgICAgICAgICAgLy8gbm9ybWFsaXplIHRoZSB1bmRlcmx5aW5nIHhtbCBzdHJ1Y3R1cmVcbiAgICAgICAgICAgICAgICAvLyAobWFrZSBzdXJlIHRoZSB0YWcncyBub2RlIG9ubHkgaW5jbHVkZXMgdGhlIHRhZydzIHRleHQpXG4gICAgICAgICAgICAgICAgdGhpcy5ub3JtYWxpemVUYWdOb2RlcyhvcGVuZWREZWxpbWl0ZXIsIGRlbGltaXRlciwgaSwgZGVsaW1pdGVycyk7XG4gICAgICAgICAgICAgICAgb3BlbmVkVGFnLnhtbFRleHROb2RlID0gb3BlbmVkRGVsaW1pdGVyLnhtbFRleHROb2RlO1xuXG4gICAgICAgICAgICAgICAgLy8gZXh0cmFjdCB0YWcgaW5mbyBmcm9tIHRhZydzIHRleHRcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NUYWcob3BlbmVkVGFnIGFzIFRhZyk7XG4gICAgICAgICAgICAgICAgdGFncy5wdXNoKG9wZW5lZFRhZyBhcyBUYWcpO1xuICAgICAgICAgICAgICAgIG9wZW5lZFRhZyA9IG51bGw7XG4gICAgICAgICAgICAgICAgb3BlbmVkRGVsaW1pdGVyID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YWdzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnNvbGlkYXRlIGFsbCB0YWcncyB0ZXh0IGludG8gYSBzaW5nbGUgdGV4dCBub2RlLlxuICAgICAqXG4gICAgICogRXhhbXBsZTpcbiAgICAgKlxuICAgICAqIFRleHQgbm9kZSBiZWZvcmU6IFwic29tZSB0ZXh0IHtzb21lIHRhZ30gc29tZSBtb3JlIHRleHRcIlxuICAgICAqIFRleHQgbm9kZXMgYWZ0ZXI6IFsgXCJzb21lIHRleHQgXCIsIFwie3NvbWUgdGFnfVwiLCBcIiBzb21lIG1vcmUgdGV4dFwiIF1cbiAgICAgKi9cbiAgICBwcml2YXRlIG5vcm1hbGl6ZVRhZ05vZGVzKFxuICAgICAgICBvcGVuRGVsaW1pdGVyOiBEZWxpbWl0ZXJNYXJrLFxuICAgICAgICBjbG9zZURlbGltaXRlcjogRGVsaW1pdGVyTWFyayxcbiAgICAgICAgY2xvc2VEZWxpbWl0ZXJJbmRleDogbnVtYmVyLFxuICAgICAgICBhbGxEZWxpbWl0ZXJzOiBEZWxpbWl0ZXJNYXJrW11cbiAgICApOiB2b2lkIHtcblxuICAgICAgICBsZXQgc3RhcnRUZXh0Tm9kZSA9IG9wZW5EZWxpbWl0ZXIueG1sVGV4dE5vZGU7XG4gICAgICAgIGxldCBlbmRUZXh0Tm9kZSA9IGNsb3NlRGVsaW1pdGVyLnhtbFRleHROb2RlO1xuICAgICAgICBjb25zdCBzYW1lTm9kZSA9IChzdGFydFRleHROb2RlID09PSBlbmRUZXh0Tm9kZSk7XG5cbiAgICAgICAgLy8gdHJpbSBzdGFydFxuICAgICAgICBpZiAob3BlbkRlbGltaXRlci5pbmRleCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuZG9jUGFyc2VyLnNwbGl0VGV4dE5vZGUoc3RhcnRUZXh0Tm9kZSwgb3BlbkRlbGltaXRlci5pbmRleCwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoc2FtZU5vZGUpIHtcbiAgICAgICAgICAgICAgICBjbG9zZURlbGltaXRlci5pbmRleCAtPSBvcGVuRGVsaW1pdGVyLmluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdHJpbSBlbmRcbiAgICAgICAgaWYgKGNsb3NlRGVsaW1pdGVyLmluZGV4IDwgZW5kVGV4dE5vZGUudGV4dENvbnRlbnQubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgZW5kVGV4dE5vZGUgPSB0aGlzLmRvY1BhcnNlci5zcGxpdFRleHROb2RlKGVuZFRleHROb2RlLCBjbG9zZURlbGltaXRlci5pbmRleCArIHRoaXMuZGVsaW1pdGVycy50YWdFbmQubGVuZ3RoLCB0cnVlKTtcbiAgICAgICAgICAgIGlmIChzYW1lTm9kZSkge1xuICAgICAgICAgICAgICAgIHN0YXJ0VGV4dE5vZGUgPSBlbmRUZXh0Tm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGpvaW4gbm9kZXNcbiAgICAgICAgaWYgKCFzYW1lTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5kb2NQYXJzZXIuam9pblRleHROb2Rlc1JhbmdlKHN0YXJ0VGV4dE5vZGUsIGVuZFRleHROb2RlKTtcbiAgICAgICAgICAgIGVuZFRleHROb2RlID0gc3RhcnRUZXh0Tm9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSBvZmZzZXRzIG9mIG5leHQgZGVsaW1pdGVyc1xuICAgICAgICBmb3IgKGxldCBpID0gY2xvc2VEZWxpbWl0ZXJJbmRleCArIDE7IGkgPCBhbGxEZWxpbWl0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgIGxldCB1cGRhdGVkID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zdCBjdXJEZWxpbWl0ZXIgPSBhbGxEZWxpbWl0ZXJzW2ldO1xuXG4gICAgICAgICAgICBpZiAoY3VyRGVsaW1pdGVyLnhtbFRleHROb2RlID09PSBvcGVuRGVsaW1pdGVyLnhtbFRleHROb2RlKSB7XG4gICAgICAgICAgICAgICAgY3VyRGVsaW1pdGVyLmluZGV4IC09IG9wZW5EZWxpbWl0ZXIuaW5kZXg7XG4gICAgICAgICAgICAgICAgdXBkYXRlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjdXJEZWxpbWl0ZXIueG1sVGV4dE5vZGUgPT09IGNsb3NlRGVsaW1pdGVyLnhtbFRleHROb2RlKSB7XG4gICAgICAgICAgICAgICAgY3VyRGVsaW1pdGVyLmluZGV4IC09IGNsb3NlRGVsaW1pdGVyLmluZGV4ICsgdGhpcy5kZWxpbWl0ZXJzLnRhZ0VuZC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdXBkYXRlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdXBkYXRlZClcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSByZWZlcmVuY2VzXG4gICAgICAgIG9wZW5EZWxpbWl0ZXIueG1sVGV4dE5vZGUgPSBzdGFydFRleHROb2RlO1xuICAgICAgICBjbG9zZURlbGltaXRlci54bWxUZXh0Tm9kZSA9IGVuZFRleHROb2RlO1xuICAgIH1cblxuICAgIHByaXZhdGUgcHJvY2Vzc1RhZyh0YWc6IFRhZyk6IHZvaWQge1xuICAgICAgICB0YWcucmF3VGV4dCA9IHRhZy54bWxUZXh0Tm9kZS50ZXh0Q29udGVudDtcblxuICAgICAgICBjb25zdCB0YWdQYXJ0cyA9IHRoaXMudGFnUmVnZXguZXhlYyh0YWcucmF3VGV4dCk7XG4gICAgICAgIGNvbnN0IHRhZ0NvbnRlbnQgPSAodGFnUGFydHNbMV0gfHwgJycpLnRyaW0oKTtcbiAgICAgICAgaWYgKCF0YWdDb250ZW50IHx8ICF0YWdDb250ZW50Lmxlbmd0aCkge1xuICAgICAgICAgICAgdGFnLmRpc3Bvc2l0aW9uID0gVGFnRGlzcG9zaXRpb24uU2VsZkNsb3NlZDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0YWdDb250ZW50LnN0YXJ0c1dpdGgodGhpcy5kZWxpbWl0ZXJzLmNvbnRhaW5lclRhZ09wZW4pKSB7XG4gICAgICAgICAgICB0YWcuZGlzcG9zaXRpb24gPSBUYWdEaXNwb3NpdGlvbi5PcGVuO1xuICAgICAgICAgICAgdGFnLm5hbWUgPSB0YWdDb250ZW50LnNsaWNlKHRoaXMuZGVsaW1pdGVycy5jb250YWluZXJUYWdPcGVuLmxlbmd0aCkudHJpbSgpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAodGFnQ29udGVudC5zdGFydHNXaXRoKHRoaXMuZGVsaW1pdGVycy5jb250YWluZXJUYWdDbG9zZSkpIHtcbiAgICAgICAgICAgIHRhZy5kaXNwb3NpdGlvbiA9IFRhZ0Rpc3Bvc2l0aW9uLkNsb3NlO1xuICAgICAgICAgICAgdGFnLm5hbWUgPSB0YWdDb250ZW50LnNsaWNlKHRoaXMuZGVsaW1pdGVycy5jb250YWluZXJUYWdDbG9zZS5sZW5ndGgpLnRyaW0oKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFnLmRpc3Bvc2l0aW9uID0gVGFnRGlzcG9zaXRpb24uU2VsZkNsb3NlZDtcbiAgICAgICAgICAgIHRhZy5uYW1lID0gdGFnQ29udGVudDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IFVuc3VwcG9ydGVkRmlsZVR5cGVFcnJvciB9IGZyb20gJy4vZXJyb3JzJztcblxuZXhwb3J0IGVudW0gTWltZVR5cGUge1xuICAgIFBuZyA9ICdpbWFnZS9wbmcnLFxuICAgIEpwZWcgPSAnaW1hZ2UvanBlZycsXG4gICAgR2lmID0gJ2ltYWdlL2dpZicsXG4gICAgQm1wID0gJ2ltYWdlL2JtcCcsXG4gICAgU3ZnID0gJ2ltYWdlL3N2Zyt4bWwnXG59XG5cbmV4cG9ydCBjbGFzcyBNaW1lVHlwZUhlbHBlciB7XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldERlZmF1bHRFeHRlbnNpb24obWltZTogTWltZVR5cGUpOiBzdHJpbmcge1xuICAgICAgICBzd2l0Y2ggKG1pbWUpIHtcbiAgICAgICAgICAgIGNhc2UgTWltZVR5cGUuUG5nOlxuICAgICAgICAgICAgICAgIHJldHVybiAncG5nJztcbiAgICAgICAgICAgIGNhc2UgTWltZVR5cGUuSnBlZzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2pwZyc7XG4gICAgICAgICAgICBjYXNlIE1pbWVUeXBlLkdpZjpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2dpZic7XG4gICAgICAgICAgICBjYXNlIE1pbWVUeXBlLkJtcDpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2JtcCc7XG4gICAgICAgICAgICBjYXNlIE1pbWVUeXBlLlN2ZzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3N2Zyc7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZEZpbGVUeXBlRXJyb3IobWltZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldE9mZmljZVJlbFR5cGUobWltZTogTWltZVR5cGUpOiBzdHJpbmcge1xuICAgICAgICBzd2l0Y2ggKG1pbWUpIHtcbiAgICAgICAgICAgIGNhc2UgTWltZVR5cGUuUG5nOlxuICAgICAgICAgICAgY2FzZSBNaW1lVHlwZS5KcGVnOlxuICAgICAgICAgICAgY2FzZSBNaW1lVHlwZS5HaWY6XG4gICAgICAgICAgICBjYXNlIE1pbWVUeXBlLkJtcDpcbiAgICAgICAgICAgIGNhc2UgTWltZVR5cGUuU3ZnOlxuICAgICAgICAgICAgICAgIHJldHVybiBcImh0dHA6Ly9zY2hlbWFzLm9wZW54bWxmb3JtYXRzLm9yZy9vZmZpY2VEb2N1bWVudC8yMDA2L3JlbGF0aW9uc2hpcHMvaW1hZ2VcIjtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVuc3VwcG9ydGVkRmlsZVR5cGVFcnJvcihtaW1lKTtcbiAgICAgICAgfVxuICAgIH1cbn0iLCJpbXBvcnQgeyBTY29wZURhdGEsIFRhZywgVGVtcGxhdGVDb21waWxlciwgVGVtcGxhdGVDb250ZXh0IH0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuaW1wb3J0IHsgRG9jeFBhcnNlciB9IGZyb20gJy4uL29mZmljZSc7XG5pbXBvcnQgeyBYbWxQYXJzZXIgfSBmcm9tICcuLi94bWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFBsdWdpblV0aWxpdGllcyB7XG4gICAgY29tcGlsZXI6IFRlbXBsYXRlQ29tcGlsZXI7XG4gICAgZG9jeFBhcnNlcjogRG9jeFBhcnNlcjtcbiAgICB4bWxQYXJzZXI6IFhtbFBhcnNlcjtcbn1cblxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L21lbWJlci1vcmRlcmluZyAqL1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVGVtcGxhdGVQbHVnaW4ge1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbnRlbnQgdHlwZSB0aGlzIHBsdWdpbiBoYW5kbGVzLlxuICAgICAqL1xuICAgIHB1YmxpYyBhYnN0cmFjdCByZWFkb25seSBjb250ZW50VHlwZTogc3RyaW5nO1xuXG4gICAgcHJvdGVjdGVkIHV0aWxpdGllczogUGx1Z2luVXRpbGl0aWVzO1xuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIGJ5IHRoZSBUZW1wbGF0ZUhhbmRsZXIgYXQgcnVudGltZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VXRpbGl0aWVzKHV0aWxpdGllczogUGx1Z2luVXRpbGl0aWVzKSB7XG4gICAgICAgIHRoaXMudXRpbGl0aWVzID0gdXRpbGl0aWVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCBmb3IgZWFjaCBzZWxmLWNsb3NpbmcgdGFnLlxuICAgICAqIEl0IHNob3VsZCBpbXBsZW1lbnQgdGhlIHNwZWNpZmljIGRvY3VtZW50IG1hbmlwdWxhdGlvbiByZXF1aXJlZCBieSB0aGUgdGFnLlxuICAgICAqL1xuICAgIHB1YmxpYyBzaW1wbGVUYWdSZXBsYWNlbWVudHModGFnOiBUYWcsIGRhdGE6IFNjb3BlRGF0YSwgY29udGV4dDogVGVtcGxhdGVDb250ZXh0KTogdm9pZCB8IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAvLyBub29wXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIGZvciBlYWNoIGNvbnRhaW5lciB0YWcuIEl0IHNob3VsZCBpbXBsZW1lbnQgdGhlXG4gICAgICogc3BlY2lmaWMgZG9jdW1lbnQgbWFuaXB1bGF0aW9uIHJlcXVpcmVkIGJ5IHRoZSB0YWcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGFncyBBbGwgdGFncyBiZXR3ZWVuIHRoZSBvcGVuaW5nIHRhZyBhbmQgY2xvc2luZyB0YWcgKGluY2x1c2l2ZSxcbiAgICAgKiBpLmUuIHRhZ3NbMF0gaXMgdGhlIG9wZW5pbmcgdGFnIGFuZCB0aGUgbGFzdCBpdGVtIGluIHRoZSB0YWdzIGFycmF5IGlzXG4gICAgICogdGhlIGNsb3NpbmcgdGFnKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29udGFpbmVyVGFnUmVwbGFjZW1lbnRzKHRhZ3M6IFRhZ1tdLCBkYXRhOiBTY29wZURhdGEsIGNvbnRleHQ6IFRlbXBsYXRlQ29udGV4dCk6IHZvaWQgfCBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgLy8gbm9vcFxuICAgIH1cbn0iLCJpbXBvcnQgeyBTY29wZURhdGEsIFRhZywgVGVtcGxhdGVDb250ZXh0IH0gZnJvbSAnLi4vLi4vY29tcGlsYXRpb24nO1xuaW1wb3J0IHsgTWltZVR5cGVIZWxwZXIgfSBmcm9tICcuLi8uLi9taW1lVHlwZSc7XG5pbXBvcnQgeyBYbWxHZW5lcmFsTm9kZSwgWG1sTm9kZSB9IGZyb20gJy4uLy4uL3htbCc7XG5pbXBvcnQgeyBUZW1wbGF0ZVBsdWdpbiB9IGZyb20gJy4uL3RlbXBsYXRlUGx1Z2luJztcbmltcG9ydCB7IEltYWdlQ29udGVudCB9IGZyb20gJy4vaW1hZ2VDb250ZW50JztcblxuLyoqXG4gKiBBcHBhcmVudGx5IGl0IGlzIG5vdCB0aGF0IGltcG9ydGFudCBmb3IgdGhlIElEIHRvIGJlIHVuaXF1ZS4uLlxuICogV29yZCBkaXNwbGF5cyB0d28gaW1hZ2VzIGNvcnJlY3RseSBldmVuIGlmIHRoZXkgYm90aCBoYXZlIHRoZSBzYW1lIElELlxuICogRnVydGhlciBtb3JlLCBXb3JkIHdpbGwgYXNzaWduIGVhY2ggYSB1bmlxdWUgSUQgdXBvbiBzYXZpbmcgKGl0IGFzc2lnbnNcbiAqIGNvbnNlY3V0aXZlIGludGVnZXJzIHN0YXJ0aW5nIHdpdGggMSkuXG4gKlxuICogTm90ZTogVGhlIHNhbWUgcHJpbmNpcGFsIGFwcGxpZXMgdG8gaW1hZ2UgbmFtZXMuXG4gKlxuICogVGVzdGVkIGluIFdvcmQgdjE5MDhcbiAqL1xubGV0IG5leHRJbWFnZUlkID0gMTtcblxuZXhwb3J0IGNsYXNzIEltYWdlUGx1Z2luIGV4dGVuZHMgVGVtcGxhdGVQbHVnaW4ge1xuXG4gICAgcHVibGljIHJlYWRvbmx5IGNvbnRlbnRUeXBlID0gJ2ltYWdlJztcblxuICAgIHB1YmxpYyBhc3luYyBzaW1wbGVUYWdSZXBsYWNlbWVudHModGFnOiBUYWcsIGRhdGE6IFNjb3BlRGF0YSwgY29udGV4dDogVGVtcGxhdGVDb250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XG5cbiAgICAgICAgY29uc3Qgd29yZFRleHROb2RlID0gdGhpcy51dGlsaXRpZXMuZG9jeFBhcnNlci5jb250YWluaW5nVGV4dE5vZGUodGFnLnhtbFRleHROb2RlKTtcblxuICAgICAgICBjb25zdCBjb250ZW50ID0gZGF0YS5nZXRTY29wZURhdGE8SW1hZ2VDb250ZW50PigpO1xuICAgICAgICBpZiAoIWNvbnRlbnQgfHwgIWNvbnRlbnQuc291cmNlKSB7XG4gICAgICAgICAgICBYbWxOb2RlLnJlbW92ZSh3b3JkVGV4dE5vZGUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIHRoZSBpbWFnZSBmaWxlIGludG8gdGhlIGFyY2hpdmVcbiAgICAgICAgY29uc3QgbWVkaWFGaWxlUGF0aCA9IGF3YWl0IGNvbnRleHQuZG9jeC5tZWRpYUZpbGVzLmFkZChjb250ZW50LnNvdXJjZSwgY29udGVudC5mb3JtYXQpO1xuICAgICAgICBjb25zdCByZWxUeXBlID0gTWltZVR5cGVIZWxwZXIuZ2V0T2ZmaWNlUmVsVHlwZShjb250ZW50LmZvcm1hdCk7XG4gICAgICAgIGNvbnN0IHJlbElkID0gYXdhaXQgY29udGV4dC5jdXJyZW50UGFydC5yZWxzLmFkZChtZWRpYUZpbGVQYXRoLCByZWxUeXBlKTtcbiAgICAgICAgYXdhaXQgY29udGV4dC5kb2N4LmNvbnRlbnRUeXBlcy5lbnN1cmVDb250ZW50VHlwZShjb250ZW50LmZvcm1hdCk7XG5cbiAgICAgICAgLy8gY3JlYXRlIHRoZSB4bWwgbWFya3VwXG4gICAgICAgIGNvbnN0IGltYWdlSWQgPSBuZXh0SW1hZ2VJZCsrO1xuICAgICAgICBjb25zdCBpbWFnZVhtbCA9IHRoaXMuY3JlYXRlTWFya3VwKGltYWdlSWQsIHJlbElkLCBjb250ZW50LndpZHRoLCBjb250ZW50LmhlaWdodCk7XG5cbiAgICAgICAgWG1sTm9kZS5pbnNlcnRBZnRlcihpbWFnZVhtbCwgd29yZFRleHROb2RlKTtcbiAgICAgICAgWG1sTm9kZS5yZW1vdmUod29yZFRleHROb2RlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZU1hcmt1cChpbWFnZUlkOiBudW1iZXIsIHJlbElkOiBzdHJpbmcsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogWG1sTm9kZSB7XG5cbiAgICAgICAgLy8gaHR0cDovL29mZmljZW9wZW54bWwuY29tL2Ryd1BpY0lubGluZS5waHBcblxuICAgICAgICAvL1xuICAgICAgICAvLyBQZXJmb3JtYW5jZSBub3RlOlxuICAgICAgICAvL1xuICAgICAgICAvLyBJJ3ZlIHRyaWVkIHRvIGltcHJvdmUgdGhlIG1hcmt1cCBnZW5lcmF0aW9uIHBlcmZvcm1hbmNlIGJ5IHBhcnNpbmdcbiAgICAgICAgLy8gdGhlIHN0cmluZyBvbmNlIGFuZCBjYWNoaW5nIHRoZSByZXN1bHQgKGFuZCBvZiBjb3Vyc2UgY3VzdG9taXppbmcgaXRcbiAgICAgICAgLy8gcGVyIGltYWdlKSBidXQgaXQgbWFkZSBubyBjaGFuZ2Ugd2hhdHNvZXZlciAoaW4gYm90aCBjYXNlcyAxMDAwIGl0ZW1zXG4gICAgICAgIC8vIGxvb3AgdGFrZXMgYXJvdW5kIDggc2Vjb25kcyBvbiBteSBtYWNoaW5lKSBzbyBJJ20gc3RpY2tpbmcgd2l0aCB0aGlzXG4gICAgICAgIC8vIGFwcHJvYWNoIHdoaWNoIEkgZmluZCB0byBiZSBtb3JlIHJlYWRhYmxlLlxuICAgICAgICAvL1xuXG4gICAgICAgIGNvbnN0IG5hbWUgPSBgUGljdHVyZSAke2ltYWdlSWR9YDtcbiAgICAgICAgY29uc3QgbWFya3VwVGV4dCA9IGBcbiAgICAgICAgICAgIDx3OmRyYXdpbmc+XG4gICAgICAgICAgICAgICAgPHdwOmlubGluZSBkaXN0VD1cIjBcIiBkaXN0Qj1cIjBcIiBkaXN0TD1cIjBcIiBkaXN0Uj1cIjBcIj5cbiAgICAgICAgICAgICAgICAgICAgPHdwOmV4dGVudCBjeD1cIiR7dGhpcy5waXhlbHNUb0VtdSh3aWR0aCl9XCIgY3k9XCIke3RoaXMucGl4ZWxzVG9FbXUoaGVpZ2h0KX1cIi8+XG4gICAgICAgICAgICAgICAgICAgIDx3cDplZmZlY3RFeHRlbnQgbD1cIjBcIiB0PVwiMFwiIHI9XCIwXCIgYj1cIjBcIi8+XG4gICAgICAgICAgICAgICAgICAgIDx3cDpkb2NQciBpZD1cIiR7aW1hZ2VJZH1cIiBuYW1lPVwiJHtuYW1lfVwiLz5cbiAgICAgICAgICAgICAgICAgICAgPHdwOmNOdkdyYXBoaWNGcmFtZVByPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGE6Z3JhcGhpY0ZyYW1lTG9ja3MgeG1sbnM6YT1cImh0dHA6Ly9zY2hlbWFzLm9wZW54bWxmb3JtYXRzLm9yZy9kcmF3aW5nbWwvMjAwNi9tYWluXCIgbm9DaGFuZ2VBc3BlY3Q9XCIxXCIvPlxuICAgICAgICAgICAgICAgICAgICA8L3dwOmNOdkdyYXBoaWNGcmFtZVByPlxuICAgICAgICAgICAgICAgICAgICA8YTpncmFwaGljIHhtbG5zOmE9XCJodHRwOi8vc2NoZW1hcy5vcGVueG1sZm9ybWF0cy5vcmcvZHJhd2luZ21sLzIwMDYvbWFpblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGE6Z3JhcGhpY0RhdGEgdXJpPVwiaHR0cDovL3NjaGVtYXMub3BlbnhtbGZvcm1hdHMub3JnL2RyYXdpbmdtbC8yMDA2L3BpY3R1cmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMucGljdHVyZU1hcmt1cChuYW1lLCByZWxJZCwgd2lkdGgsIGhlaWdodCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2E6Z3JhcGhpY0RhdGE+XG4gICAgICAgICAgICAgICAgICAgIDwvYTpncmFwaGljPlxuICAgICAgICAgICAgICAgIDwvd3A6aW5saW5lPlxuICAgICAgICAgICAgPC93OmRyYXdpbmc+XG4gICAgICAgIGA7XG5cbiAgICAgICAgY29uc3QgbWFya3VwWG1sID0gdGhpcy51dGlsaXRpZXMueG1sUGFyc2VyLnBhcnNlKG1hcmt1cFRleHQpIGFzIFhtbEdlbmVyYWxOb2RlO1xuICAgICAgICBYbWxOb2RlLnJlbW92ZUVtcHR5VGV4dE5vZGVzKG1hcmt1cFhtbCk7IC8vIHJlbW92ZSB3aGl0ZXNwYWNlXG5cbiAgICAgICAgcmV0dXJuIG1hcmt1cFhtbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHBpY3R1cmVNYXJrdXAobmFtZTogc3RyaW5nLCByZWxJZDogc3RyaW5nLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuXG4gICAgICAgIC8vIGh0dHA6Ly9vZmZpY2VvcGVueG1sLmNvbS9kcndQaWMucGhwXG5cbiAgICAgICAgLy8gbGVnZW5kOlxuICAgICAgICAvLyBudlBpY1ByIC0gbm9uLXZpc3VhbCBwaWN0dXJlIHByb3BlcnRpZXMgLSBpZCwgbmFtZSwgZXRjLlxuICAgICAgICAvLyBibGlwRmlsbCAtIGJpbmFyeSBsYXJnZSBpbWFnZSAob3IpIHBpY3R1cmUgZmlsbCAtIGltYWdlIHNpemUsIGltYWdlIGZpbGwsIGV0Yy5cbiAgICAgICAgLy8gc3BQciAtIHNoYXBlIHByb3BlcnRpZXMgLSBmcmFtZSBzaXplLCBmcmFtZSBmaWxsLCBldGMuXG5cbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIDxwaWM6cGljIHhtbG5zOnBpYz1cImh0dHA6Ly9zY2hlbWFzLm9wZW54bWxmb3JtYXRzLm9yZy9kcmF3aW5nbWwvMjAwNi9waWN0dXJlXCI+XG4gICAgICAgICAgICAgICAgPHBpYzpudlBpY1ByPlxuICAgICAgICAgICAgICAgICAgICA8cGljOmNOdlByIGlkPVwiMFwiIG5hbWU9XCIke25hbWV9XCIvPlxuICAgICAgICAgICAgICAgICAgICA8cGljOmNOdlBpY1ByPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGE6cGljTG9ja3Mgbm9DaGFuZ2VBc3BlY3Q9XCIxXCIgbm9DaGFuZ2VBcnJvd2hlYWRzPVwiMVwiLz5cbiAgICAgICAgICAgICAgICAgICAgPC9waWM6Y052UGljUHI+XG4gICAgICAgICAgICAgICAgPC9waWM6bnZQaWNQcj5cbiAgICAgICAgICAgICAgICA8cGljOmJsaXBGaWxsPlxuICAgICAgICAgICAgICAgICAgICA8YTpibGlwIHI6ZW1iZWQ9XCIke3JlbElkfVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGE6ZXh0THN0PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhOmV4dCB1cmk9XCJ7MjhBMDA5MkItQzUwQy00MDdFLUE5NDctNzBFNzQwNDgxQzFDfVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YTE0OnVzZUxvY2FsRHBpIHhtbG5zOmExND1cImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vb2ZmaWNlL2RyYXdpbmcvMjAxMC9tYWluXCIgdmFsPVwiMFwiLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E6ZXh0PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9hOmV4dExzdD5cbiAgICAgICAgICAgICAgICAgICAgPC9hOmJsaXA+XG4gICAgICAgICAgICAgICAgICAgIDxhOnNyY1JlY3QvPlxuICAgICAgICAgICAgICAgICAgICA8YTpzdHJldGNoPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGE6ZmlsbFJlY3QvPlxuICAgICAgICAgICAgICAgICAgICA8L2E6c3RyZXRjaD5cbiAgICAgICAgICAgICAgICA8L3BpYzpibGlwRmlsbD5cbiAgICAgICAgICAgICAgICA8cGljOnNwUHIgYndNb2RlPVwiYXV0b1wiPlxuICAgICAgICAgICAgICAgICAgICA8YTp4ZnJtPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGE6b2ZmIHg9XCIwXCIgeT1cIjBcIi8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YTpleHQgY3g9XCIke3RoaXMucGl4ZWxzVG9FbXUod2lkdGgpfVwiIGN5PVwiJHt0aGlzLnBpeGVsc1RvRW11KGhlaWdodCl9XCIvPlxuICAgICAgICAgICAgICAgICAgICA8L2E6eGZybT5cbiAgICAgICAgICAgICAgICAgICAgPGE6cHJzdEdlb20gcHJzdD1cInJlY3RcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxhOmF2THN0Lz5cbiAgICAgICAgICAgICAgICAgICAgPC9hOnByc3RHZW9tPlxuICAgICAgICAgICAgICAgICAgICA8YTpub0ZpbGwvPlxuICAgICAgICAgICAgICAgICAgICA8YTpsbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxhOm5vRmlsbC8+XG4gICAgICAgICAgICAgICAgICAgIDwvYTpsbj5cbiAgICAgICAgICAgICAgICA8L3BpYzpzcFByPlxuICAgICAgICAgICAgPC9waWM6cGljPlxuICAgICAgICBgO1xuICAgIH1cblxuICAgIHByaXZhdGUgcGl4ZWxzVG9FbXUocGl4ZWxzOiBudW1iZXIpOiBudW1iZXIge1xuXG4gICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzIwMTk0NDAzL29wZW54bWwtZGlzdGFuY2Utc2l6ZS11bml0c1xuICAgICAgICAvLyBodHRwczovL2RvY3MubWljcm9zb2Z0LmNvbS9lbi11cy93aW5kb3dzL3dpbjMyL3ZtbC9tc2RuLW9ubGluZS12bWwtdW5pdHMjb3RoZXItdW5pdHMtb2YtbWVhc3VyZW1lbnRcbiAgICAgICAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvT2ZmaWNlX09wZW5fWE1MX2ZpbGVfZm9ybWF0cyNEcmF3aW5nTUxcbiAgICAgICAgLy8gaHR0cDovL3d3dy5qYXZhMnMuY29tL0NvZGUvQ1NoYXJwLzJELUdyYXBoaWNzL0NvbnZlcnRwaXhlbHN0b0VNVUVNVXRvcGl4ZWxzLmh0bVxuXG4gICAgICAgIHJldHVybiBNYXRoLnJvdW5kKHBpeGVscyAqIDk1MjUpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBlbnVtIENvbnRlbnRQYXJ0VHlwZSB7XG4gICAgTWFpbkRvY3VtZW50ID0gJ01haW5Eb2N1bWVudCcsXG4gICAgRGVmYXVsdEhlYWRlciA9ICdEZWZhdWx0SGVhZGVyJyxcbiAgICBGaXJzdEhlYWRlciA9ICdGaXJzdEhlYWRlcicsXG4gICAgRXZlblBhZ2VzSGVhZGVyID0gJ0V2ZW5QYWdlc0hlYWRlcicsXG4gICAgRGVmYXVsdEZvb3RlciA9ICdEZWZhdWx0Rm9vdGVyJyxcbiAgICBGaXJzdEZvb3RlciA9ICdGaXJzdEZvb3RlcicsXG4gICAgRXZlblBhZ2VzRm9vdGVyID0gJ0V2ZW5QYWdlc0Zvb3RlcicsXG59XG4iLCJpbXBvcnQgeyBNaW1lVHlwZSwgTWltZVR5cGVIZWxwZXIgfSBmcm9tICcuLi9taW1lVHlwZSc7XG5pbXBvcnQgeyBJTWFwIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgWG1sR2VuZXJhbE5vZGUsIFhtbE5vZGUsIFhtbFBhcnNlciB9IGZyb20gJy4uL3htbCc7XG5pbXBvcnQgeyBaaXAgfSBmcm9tICcuLi96aXAnO1xuXG4vKipcbiAqIGh0dHA6Ly9vZmZpY2VvcGVueG1sLmNvbS9hbmF0b215b2ZPT1hNTC5waHBcbiAqL1xuZXhwb3J0IGNsYXNzIENvbnRlbnRUeXBlc0ZpbGUge1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgY29udGVudFR5cGVzRmlsZVBhdGggPSAnW0NvbnRlbnRfVHlwZXNdLnhtbCc7XG5cbiAgICBwcml2YXRlIGFkZGVkTmV3ID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIHJvb3Q6IFhtbE5vZGU7XG5cbiAgICBwcml2YXRlIGNvbnRlbnRUeXBlczogSU1hcDxib29sZWFuPjtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IHppcDogWmlwLFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IHhtbFBhcnNlcjogWG1sUGFyc2VyXG4gICAgKSB7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGVuc3VyZUNvbnRlbnRUeXBlKG1pbWU6IE1pbWVUeXBlKTogUHJvbWlzZTx2b2lkPiB7XG5cbiAgICAgICAgLy8gcGFyc2UgdGhlIGNvbnRlbnQgdHlwZXMgZmlsZVxuICAgICAgICBhd2FpdCB0aGlzLnBhcnNlQ29udGVudFR5cGVzRmlsZSgpO1xuXG4gICAgICAgIC8vIGFscmVhZHkgZXhpc3RzXG4gICAgICAgIGlmICh0aGlzLmNvbnRlbnRUeXBlc1ttaW1lXSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAvLyBhZGQgbmV3XG4gICAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IE1pbWVUeXBlSGVscGVyLmdldERlZmF1bHRFeHRlbnNpb24obWltZSk7XG4gICAgICAgIGNvbnN0IHR5cGVOb2RlID0gWG1sTm9kZS5jcmVhdGVHZW5lcmFsTm9kZSgnRGVmYXVsdCcpO1xuICAgICAgICB0eXBlTm9kZS5hdHRyaWJ1dGVzID0ge1xuICAgICAgICAgICAgXCJFeHRlbnNpb25cIjogZXh0ZW5zaW9uLFxuICAgICAgICAgICAgXCJDb250ZW50VHlwZVwiOiBtaW1lXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucm9vdC5jaGlsZE5vZGVzLnB1c2godHlwZU5vZGUpO1xuXG4gICAgICAgIC8vIHVwZGF0ZSBzdGF0ZVxuICAgICAgICB0aGlzLmFkZGVkTmV3ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb250ZW50VHlwZXNbbWltZV0gPSB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBjb3VudCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICBhd2FpdCB0aGlzLnBhcnNlQ29udGVudFR5cGVzRmlsZSgpO1xuICAgICAgICByZXR1cm4gdGhpcy5yb290LmNoaWxkTm9kZXMuZmlsdGVyKG5vZGUgPT4gIVhtbE5vZGUuaXNUZXh0Tm9kZShub2RlKSkubGVuZ3RoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhdmUgdGhlIENvbnRlbnQgVHlwZXMgZmlsZSBiYWNrIHRvIHRoZSB6aXAuXG4gICAgICogQ2FsbGVkIGF1dG9tYXRpY2FsbHkgYnkgdGhlIGhvbGRpbmcgYERvY3hgIGJlZm9yZSBleHBvcnRpbmcuXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIHNhdmUoKTogUHJvbWlzZTx2b2lkPiB7XG5cbiAgICAgICAgLy8gbm90IGNoYW5nZSAtIG5vIG5lZWQgdG8gc2F2ZVxuICAgICAgICBpZiAoIXRoaXMuYWRkZWROZXcpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgY29uc3QgeG1sQ29udGVudCA9IHRoaXMueG1sUGFyc2VyLnNlcmlhbGl6ZSh0aGlzLnJvb3QpO1xuICAgICAgICB0aGlzLnppcC5zZXRGaWxlKENvbnRlbnRUeXBlc0ZpbGUuY29udGVudFR5cGVzRmlsZVBhdGgsIHhtbENvbnRlbnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcGFyc2VDb250ZW50VHlwZXNGaWxlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAodGhpcy5yb290KVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIC8vIHBhcnNlIHRoZSB4bWwgZmlsZVxuICAgICAgICBjb25zdCBjb250ZW50VHlwZXNYbWwgPSBhd2FpdCB0aGlzLnppcC5nZXRGaWxlKENvbnRlbnRUeXBlc0ZpbGUuY29udGVudFR5cGVzRmlsZVBhdGgpLmdldENvbnRlbnRUZXh0KCk7XG4gICAgICAgIHRoaXMucm9vdCA9IHRoaXMueG1sUGFyc2VyLnBhcnNlKGNvbnRlbnRUeXBlc1htbCk7XG5cbiAgICAgICAgLy8gYnVpbGQgdGhlIGNvbnRlbnQgdHlwZXMgbG9va3VwXG4gICAgICAgIHRoaXMuY29udGVudFR5cGVzID0ge307XG4gICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiB0aGlzLnJvb3QuY2hpbGROb2Rlcykge1xuXG4gICAgICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSAhPT0gJ0RlZmF1bHQnKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjb25zdCBnZW5Ob2RlID0gKG5vZGUgYXMgWG1sR2VuZXJhbE5vZGUpO1xuICAgICAgICAgICAgY29uc3QgY29udGVudFR5cGVBdHRyaWJ1dGUgPSBnZW5Ob2RlLmF0dHJpYnV0ZXNbJ0NvbnRlbnRUeXBlJ107XG4gICAgICAgICAgICBpZiAoIWNvbnRlbnRUeXBlQXR0cmlidXRlKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRUeXBlc1tjb250ZW50VHlwZUF0dHJpYnV0ZV0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgTWltZVR5cGUsIE1pbWVUeXBlSGVscGVyIH0gZnJvbSAnLi4vbWltZVR5cGUnO1xuaW1wb3J0IHsgSU1hcCB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IEJpbmFyeSwgUGF0aCwgc2hhMSB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IFppcCB9IGZyb20gJy4uL3ppcCc7XG5cbi8qKlxuICogSGFuZGxlcyBtZWRpYSBmaWxlcyBvZiB0aGUgbWFpbiBkb2N1bWVudC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1lZGlhRmlsZXMge1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgbWVkaWFEaXIgPSAnd29yZC9tZWRpYSc7XG5cbiAgICBwcml2YXRlIGhhc2hlczogSU1hcDxzdHJpbmc+O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZmlsZXMgPSBuZXcgTWFwPEJpbmFyeSwgc3RyaW5nPigpO1xuICAgIHByaXZhdGUgbmV4dEZpbGVJZCA9IDA7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHppcDogWmlwKSB7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbWVkaWEgZmlsZSBwYXRoLlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBhZGQobWVkaWFGaWxlOiBCaW5hcnksIG1pbWU6IE1pbWVUeXBlKTogUHJvbWlzZTxzdHJpbmc+IHtcblxuICAgICAgICAvLyBjaGVjayBpZiBhbHJlYWR5IGFkZGVkXG4gICAgICAgIGlmICh0aGlzLmZpbGVzLmhhcyhtZWRpYUZpbGUpKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsZXMuZ2V0KG1lZGlhRmlsZSk7XG5cbiAgICAgICAgLy8gaGFzaCBleGlzdGluZyBtZWRpYSBmaWxlc1xuICAgICAgICBhd2FpdCB0aGlzLmhhc2hNZWRpYUZpbGVzKCk7XG5cbiAgICAgICAgLy8gaGFzaCB0aGUgbmV3IGZpbGVcbiAgICAgICAgLy8gTm90ZTogRXZlbiB0aG91Z2ggaGFzaGluZyB0aGUgYmFzZTY0IHN0cmluZyBtYXkgc2VlbSBpbmVmZmljaWVudFxuICAgICAgICAvLyAocmVxdWlyZXMgZXh0cmEgc3RlcCBpbiBzb21lIGNhc2VzKSBpbiBwcmFjdGljZSBpdCBpcyBzaWduaWZpY2FudGx5XG4gICAgICAgIC8vIGZhc3RlciB0aGFuIGhhc2hpbmcgYSAnYmluYXJ5c3RyaW5nJy5cbiAgICAgICAgY29uc3QgYmFzZTY0ID0gYXdhaXQgQmluYXJ5LnRvQmFzZTY0KG1lZGlhRmlsZSk7XG4gICAgICAgIGNvbnN0IGhhc2ggPSBzaGExKGJhc2U2NCk7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgZmlsZSBhbHJlYWR5IGV4aXN0c1xuICAgICAgICAvLyBub3RlOiB0aGlzIGNhbiBiZSBvcHRpbWl6ZWQgYnkga2VlcGluZyBib3RoIG1hcHBpbmcgYnkgZmlsZW5hbWUgYXMgd2VsbCBhcyBieSBoYXNoXG4gICAgICAgIGxldCBwYXRoID0gT2JqZWN0LmtleXModGhpcy5oYXNoZXMpLmZpbmQocCA9PiB0aGlzLmhhc2hlc1twXSA9PT0gaGFzaCk7XG4gICAgICAgIGlmIChwYXRoKVxuICAgICAgICAgICAgcmV0dXJuIHBhdGg7XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgdW5pcXVlIG1lZGlhIGZpbGUgbmFtZVxuICAgICAgICBjb25zdCBleHRlbnNpb24gPSBNaW1lVHlwZUhlbHBlci5nZXREZWZhdWx0RXh0ZW5zaW9uKG1pbWUpO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICB0aGlzLm5leHRGaWxlSWQrKztcbiAgICAgICAgICAgIHBhdGggPSBgJHtNZWRpYUZpbGVzLm1lZGlhRGlyfS9tZWRpYSR7dGhpcy5uZXh0RmlsZUlkfS4ke2V4dGVuc2lvbn1gO1xuICAgICAgICB9IHdoaWxlICh0aGlzLmhhc2hlc1twYXRoXSk7XG5cbiAgICAgICAgLy8gYWRkIG1lZGlhIHRvIHppcFxuICAgICAgICBhd2FpdCB0aGlzLnppcC5zZXRGaWxlKHBhdGgsIG1lZGlhRmlsZSk7XG5cbiAgICAgICAgLy8gYWRkIG1lZGlhIHRvIG91ciBsb29rdXBzXG4gICAgICAgIHRoaXMuaGFzaGVzW3BhdGhdID0gaGFzaDtcbiAgICAgICAgdGhpcy5maWxlcy5zZXQobWVkaWFGaWxlLCBwYXRoKTtcblxuICAgICAgICAvLyByZXR1cm5cbiAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGNvdW50KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIGF3YWl0IHRoaXMuaGFzaE1lZGlhRmlsZXMoKTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuaGFzaGVzKS5sZW5ndGg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBoYXNoTWVkaWFGaWxlcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKHRoaXMuaGFzaGVzKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuaGFzaGVzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgcGF0aCBvZiB0aGlzLnppcC5saXN0RmlsZXMoKSkge1xuXG4gICAgICAgICAgICBpZiAoIXBhdGguc3RhcnRzV2l0aChNZWRpYUZpbGVzLm1lZGlhRGlyKSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBQYXRoLmdldEZpbGVuYW1lKHBhdGgpO1xuICAgICAgICAgICAgaWYgKCFmaWxlbmFtZSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgY29uc3QgZmlsZURhdGEgPSBhd2FpdCB0aGlzLnppcC5nZXRGaWxlKHBhdGgpLmdldENvbnRlbnRCYXNlNjQoKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVIYXNoID0gc2hhMShmaWxlRGF0YSk7XG4gICAgICAgICAgICB0aGlzLmhhc2hlc1tmaWxlbmFtZV0gPSBmaWxlSGFzaDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IFhtbEdlbmVyYWxOb2RlLCBYbWxOb2RlIH0gZnJvbSAnLi4veG1sJztcblxuZXhwb3J0IHR5cGUgUmVsVGFyZ2V0TW9kZSA9ICdJbnRlcm5hbCcgfCAnRXh0ZXJuYWwnO1xuXG5leHBvcnQgY2xhc3MgUmVsYXRpb25zaGlwIHtcblxuICAgIHB1YmxpYyBzdGF0aWMgZnJvbVhtbCh4bWw6IFhtbEdlbmVyYWxOb2RlKTogUmVsYXRpb25zaGlwIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWxhdGlvbnNoaXAoe1xuICAgICAgICAgICAgaWQ6IHhtbC5hdHRyaWJ1dGVzPy5bJ0lkJ10sXG4gICAgICAgICAgICB0eXBlOiB4bWwuYXR0cmlidXRlcz8uWydUeXBlJ10sXG4gICAgICAgICAgICB0YXJnZXQ6IHhtbC5hdHRyaWJ1dGVzPy5bJ1RhcmdldCddLFxuICAgICAgICAgICAgdGFyZ2V0TW9kZTogeG1sLmF0dHJpYnV0ZXM/LlsnVGFyZ2V0TW9kZSddIGFzIFJlbFRhcmdldE1vZGUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlkOiBzdHJpbmc7XG4gICAgdHlwZTogc3RyaW5nO1xuICAgIHRhcmdldDogc3RyaW5nO1xuICAgIHRhcmdldE1vZGU6IFJlbFRhcmdldE1vZGU7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbml0aWFsPzogUGFydGlhbDxSZWxhdGlvbnNoaXA+KSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgaW5pdGlhbCk7XG4gICAgfVxuXG4gICAgcHVibGljIHRvWG1sKCk6IFhtbEdlbmVyYWxOb2RlIHtcblxuICAgICAgICBjb25zdCBub2RlID0gWG1sTm9kZS5jcmVhdGVHZW5lcmFsTm9kZSgnUmVsYXRpb25zaGlwJyk7XG4gICAgICAgIG5vZGUuYXR0cmlidXRlcyA9IHt9O1xuXG4gICAgICAgIC8vIHNldCBvbmx5IG5vbi1lbXB0eSBhdHRyaWJ1dGVzXG4gICAgICAgIGZvciAoY29uc3QgcHJvcEtleSBvZiBPYmplY3Qua2V5cyh0aGlzKSkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSAodGhpcyBhcyBhbnkpW3Byb3BLZXldO1xuICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdHRyTmFtZSA9IHByb3BLZXlbMF0udG9VcHBlckNhc2UoKSArIHByb3BLZXkuc3Vic3RyKDEpO1xuICAgICAgICAgICAgICAgIG5vZGUuYXR0cmlidXRlc1thdHRyTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IElNYXAgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBQYXRoIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgWG1sR2VuZXJhbE5vZGUsIFhtbE5vZGUsIFhtbFBhcnNlciB9IGZyb20gJy4uL3htbCc7XG5pbXBvcnQgeyBaaXAgfSBmcm9tICcuLi96aXAnO1xuaW1wb3J0IHsgUmVsYXRpb25zaGlwLCBSZWxUYXJnZXRNb2RlIH0gZnJvbSAnLi9yZWxhdGlvbnNoaXAnO1xuXG4vKipcbiAqIEhhbmRsZXMgdGhlIHJlbGF0aW9uc2hpcCBsb2dpYyBvZiBhIHNpbmdsZSBkb2N4IFwicGFydFwiLlxuICogaHR0cDovL29mZmljZW9wZW54bWwuY29tL2FuYXRvbXlvZk9PWE1MLnBocFxuICovXG5leHBvcnQgY2xhc3MgUmVscyB7XG5cbiAgICBwcml2YXRlIHJlbHM6IElNYXA8UmVsYXRpb25zaGlwPjtcbiAgICBwcml2YXRlIHJlbFRhcmdldHM6IElNYXA8c3RyaW5nPjtcbiAgICBwcml2YXRlIG5leHRSZWxJZCA9IDA7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHBhcnREaXI6IHN0cmluZztcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJlbHNGaWxlUGF0aDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHBhcnRQYXRoOiBzdHJpbmcsXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgemlwOiBaaXAsXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgeG1sUGFyc2VyOiBYbWxQYXJzZXJcbiAgICApIHtcblxuICAgICAgICB0aGlzLnBhcnREaXIgPSBwYXJ0UGF0aCAmJiBQYXRoLmdldERpcmVjdG9yeShwYXJ0UGF0aCk7XG4gICAgICAgIGNvbnN0IHBhcnRGaWxlbmFtZSA9IHBhcnRQYXRoICYmIFBhdGguZ2V0RmlsZW5hbWUocGFydFBhdGgpO1xuICAgICAgICB0aGlzLnJlbHNGaWxlUGF0aCA9IFBhdGguY29tYmluZSh0aGlzLnBhcnREaXIsICdfcmVscycsIGAke3BhcnRGaWxlbmFtZSA/PyAnJ30ucmVsc2ApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHJlbCBJRC5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgYWRkKHJlbFRhcmdldDogc3RyaW5nLCByZWxUeXBlOiBzdHJpbmcsIHJlbFRhcmdldE1vZGU/OiBSZWxUYXJnZXRNb2RlKTogUHJvbWlzZTxzdHJpbmc+IHtcblxuICAgICAgICAvLyBpZiByZWxUYXJnZXQgaXMgYW4gaW50ZXJuYWwgZmlsZSBpdCBzaG91bGQgYmUgcmVsYXRpdmUgdG8gdGhlIHBhcnQgZGlyXG4gICAgICAgIGlmICh0aGlzLnBhcnREaXIgJiYgcmVsVGFyZ2V0LnN0YXJ0c1dpdGgodGhpcy5wYXJ0RGlyKSkge1xuICAgICAgICAgICAgcmVsVGFyZ2V0ID0gcmVsVGFyZ2V0LnN1YnN0cih0aGlzLnBhcnREaXIubGVuZ3RoICsgMSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwYXJzZSByZWxzIGZpbGVcbiAgICAgICAgYXdhaXQgdGhpcy5wYXJzZVJlbHNGaWxlKCk7XG5cbiAgICAgICAgLy8gYWxyZWFkeSBleGlzdHM/XG4gICAgICAgIGNvbnN0IHJlbFRhcmdldEtleSA9IHRoaXMuZ2V0UmVsVGFyZ2V0S2V5KHJlbFR5cGUsIHJlbFRhcmdldCk7XG4gICAgICAgIGxldCByZWxJZCA9IHRoaXMucmVsVGFyZ2V0c1tyZWxUYXJnZXRLZXldO1xuICAgICAgICBpZiAocmVsSWQpXG4gICAgICAgICAgICByZXR1cm4gcmVsSWQ7XG5cbiAgICAgICAgLy8gY3JlYXRlIHJlbCBub2RlXG4gICAgICAgIHJlbElkID0gdGhpcy5nZXROZXh0UmVsSWQoKTtcbiAgICAgICAgY29uc3QgcmVsID0gbmV3IFJlbGF0aW9uc2hpcCh7XG4gICAgICAgICAgICBpZDogcmVsSWQsXG4gICAgICAgICAgICB0eXBlOiByZWxUeXBlLFxuICAgICAgICAgICAgdGFyZ2V0OiByZWxUYXJnZXQsXG4gICAgICAgICAgICB0YXJnZXRNb2RlOiByZWxUYXJnZXRNb2RlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSBsb29rdXBzXG4gICAgICAgIHRoaXMucmVsc1tyZWxJZF0gPSByZWw7XG4gICAgICAgIHRoaXMucmVsVGFyZ2V0c1tyZWxUYXJnZXRLZXldID0gcmVsSWQ7XG5cbiAgICAgICAgLy8gcmV0dXJuXG4gICAgICAgIHJldHVybiByZWxJZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgbGlzdCgpOiBQcm9taXNlPFJlbGF0aW9uc2hpcFtdPiB7XG4gICAgICAgIGF3YWl0IHRoaXMucGFyc2VSZWxzRmlsZSgpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLnJlbHMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhdmUgdGhlIHJlbHMgZmlsZSBiYWNrIHRvIHRoZSB6aXAuXG4gICAgICogQ2FsbGVkIGF1dG9tYXRpY2FsbHkgYnkgdGhlIGhvbGRpbmcgYERvY3hgIGJlZm9yZSBleHBvcnRpbmcuXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIHNhdmUoKTogUHJvbWlzZTx2b2lkPiB7XG5cbiAgICAgICAgLy8gbm90IGNoYW5nZSAtIG5vIG5lZWQgdG8gc2F2ZVxuICAgICAgICBpZiAoIXRoaXMucmVscylcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAvLyBjcmVhdGUgcmVscyB4bWxcbiAgICAgICAgY29uc3Qgcm9vdCA9IHRoaXMuY3JlYXRlUm9vdE5vZGUoKTtcbiAgICAgICAgcm9vdC5jaGlsZE5vZGVzID0gT2JqZWN0LnZhbHVlcyh0aGlzLnJlbHMpLm1hcChyZWwgPT4gcmVsLnRvWG1sKCkpO1xuXG4gICAgICAgIC8vIHNlcmlhbGl6ZSBhbmQgc2F2ZVxuICAgICAgICBjb25zdCB4bWxDb250ZW50ID0gdGhpcy54bWxQYXJzZXIuc2VyaWFsaXplKHJvb3QpO1xuICAgICAgICB0aGlzLnppcC5zZXRGaWxlKHRoaXMucmVsc0ZpbGVQYXRoLCB4bWxDb250ZW50KTtcbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIHByaXZhdGUgbWV0aG9kc1xuICAgIC8vXG5cbiAgICBwcml2YXRlIGdldE5leHRSZWxJZCgpOiBzdHJpbmcge1xuXG4gICAgICAgIGxldCByZWxJZDogc3RyaW5nOztcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgdGhpcy5uZXh0UmVsSWQrKztcbiAgICAgICAgICAgIHJlbElkID0gJ3JJZCcgKyB0aGlzLm5leHRSZWxJZDtcbiAgICAgICAgfSB3aGlsZSAodGhpcy5yZWxzW3JlbElkXSk7XG5cbiAgICAgICAgcmV0dXJuIHJlbElkO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcGFyc2VSZWxzRmlsZSgpOiBQcm9taXNlPHZvaWQ+IHtcblxuICAgICAgICAvLyBhbHJlYWR5IHBhcnNlZFxuICAgICAgICBpZiAodGhpcy5yZWxzKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIC8vIHBhcnNlIHhtbFxuICAgICAgICBsZXQgcm9vdDogWG1sTm9kZTtcbiAgICAgICAgY29uc3QgcmVsc0ZpbGUgPSB0aGlzLnppcC5nZXRGaWxlKHRoaXMucmVsc0ZpbGVQYXRoKTtcbiAgICAgICAgaWYgKHJlbHNGaWxlKSB7XG4gICAgICAgICAgICBjb25zdCB4bWwgPSBhd2FpdCByZWxzRmlsZS5nZXRDb250ZW50VGV4dCgpO1xuICAgICAgICAgICAgcm9vdCA9IHRoaXMueG1sUGFyc2VyLnBhcnNlKHhtbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByb290ID0gdGhpcy5jcmVhdGVSb290Tm9kZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGFyc2UgcmVsYXRpb25zaGlwIG5vZGVzXG4gICAgICAgIHRoaXMucmVscyA9IHt9O1xuICAgICAgICB0aGlzLnJlbFRhcmdldHMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCByZWxOb2RlIG9mIHJvb3QuY2hpbGROb2Rlcykge1xuXG4gICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0gKHJlbE5vZGUgYXMgWG1sR2VuZXJhbE5vZGUpLmF0dHJpYnV0ZXM7XG4gICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXMpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIGNvbnN0IGlkQXR0ciA9IGF0dHJpYnV0ZXNbJ0lkJ107XG4gICAgICAgICAgICBpZiAoIWlkQXR0cilcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gc3RvcmUgcmVsXG4gICAgICAgICAgICBjb25zdCByZWwgPSBSZWxhdGlvbnNoaXAuZnJvbVhtbChyZWxOb2RlIGFzIFhtbEdlbmVyYWxOb2RlKTtcbiAgICAgICAgICAgIHRoaXMucmVsc1tpZEF0dHJdID0gcmVsO1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgcmVsIHRhcmdldCBsb29rdXBcbiAgICAgICAgICAgIGNvbnN0IHR5cGVBdHRyID0gYXR0cmlidXRlc1snVHlwZSddO1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0QXR0ciA9IGF0dHJpYnV0ZXNbJ1RhcmdldCddO1xuICAgICAgICAgICAgaWYgKHR5cGVBdHRyICYmIHRhcmdldEF0dHIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWxUYXJnZXRLZXkgPSB0aGlzLmdldFJlbFRhcmdldEtleSh0eXBlQXR0ciwgdGFyZ2V0QXR0cik7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWxUYXJnZXRzW3JlbFRhcmdldEtleV0gPSBpZEF0dHI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFJlbFRhcmdldEtleSh0eXBlOiBzdHJpbmcsIHRhcmdldDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGAke3R5cGV9IC0gJHt0YXJnZXR9YDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVJvb3ROb2RlKCk6IFhtbEdlbmVyYWxOb2RlIHtcbiAgICAgICAgY29uc3Qgcm9vdCA9IFhtbE5vZGUuY3JlYXRlR2VuZXJhbE5vZGUoJ1JlbGF0aW9uc2hpcHMnKTtcbiAgICAgICAgcm9vdC5hdHRyaWJ1dGVzID0ge1xuICAgICAgICAgICAgJ3htbG5zJzogJ2h0dHA6Ly9zY2hlbWFzLm9wZW54bWxmb3JtYXRzLm9yZy9wYWNrYWdlLzIwMDYvcmVsYXRpb25zaGlwcydcbiAgICAgICAgfTtcbiAgICAgICAgcm9vdC5jaGlsZE5vZGVzID0gW107XG4gICAgICAgIHJldHVybiByb290O1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFhtbE5vZGUsIFhtbFBhcnNlciB9IGZyb20gJy4uL3htbCc7XG5pbXBvcnQgeyBaaXAgfSBmcm9tICcuLi96aXAnO1xuaW1wb3J0IHsgUmVscyB9IGZyb20gJy4vcmVscyc7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiB4bWwgZmlsZSB0aGF0IGlzIHBhcnQgb2YgYW4gT1BDIHBhY2thZ2UuXG4gKlxuICogU2VlOiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9PcGVuX1BhY2thZ2luZ19Db252ZW50aW9uc1xuICovXG5leHBvcnQgY2xhc3MgWG1sUGFydCB7XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgcmVsczogUmVscztcblxuICAgIHByaXZhdGUgcm9vdDogWG1sTm9kZTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgcGF0aDogc3RyaW5nLFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IHppcDogWmlwLFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IHhtbFBhcnNlcjogWG1sUGFyc2VyXG4gICAgKSB7XG4gICAgICAgIHRoaXMucmVscyA9IG5ldyBSZWxzKHRoaXMucGF0aCwgemlwLCB4bWxQYXJzZXIpO1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gcHVibGljIG1ldGhvZHNcbiAgICAvL1xuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB4bWwgcm9vdCBub2RlIG9mIHRoZSBwYXJ0LlxuICAgICAqIENoYW5nZXMgdG8gdGhlIHhtbCB3aWxsIGJlIHBlcnNpc3RlZCB0byB0aGUgdW5kZXJseWluZyB6aXAgZmlsZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgeG1sUm9vdCgpOiBQcm9taXNlPFhtbE5vZGU+IHtcbiAgICAgICAgaWYgKCF0aGlzLnJvb3QpIHtcbiAgICAgICAgICAgIGNvbnN0IHhtbCA9IGF3YWl0IHRoaXMuemlwLmdldEZpbGUodGhpcy5wYXRoKS5nZXRDb250ZW50VGV4dCgpO1xuICAgICAgICAgICAgdGhpcy5yb290ID0gdGhpcy54bWxQYXJzZXIucGFyc2UoeG1sKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5yb290O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdGV4dCBjb250ZW50IG9mIHRoZSBwYXJ0LlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBnZXRUZXh0KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IHhtbERvY3VtZW50ID0gYXdhaXQgdGhpcy54bWxSb290KCk7XG5cbiAgICAgICAgLy8gdWdseSBidXQgZ29vZCBlbm91Z2guLi5cbiAgICAgICAgY29uc3QgeG1sID0gdGhpcy54bWxQYXJzZXIuc2VyaWFsaXplKHhtbERvY3VtZW50KTtcbiAgICAgICAgY29uc3QgZG9tRG9jdW1lbnQgPSB0aGlzLnhtbFBhcnNlci5kb21QYXJzZSh4bWwpO1xuXG4gICAgICAgIHJldHVybiBkb21Eb2N1bWVudC5kb2N1bWVudEVsZW1lbnQudGV4dENvbnRlbnQ7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHNhdmVDaGFuZ2VzKCkge1xuXG4gICAgICAgIC8vIHNhdmUgeG1sXG4gICAgICAgIGlmICh0aGlzLnJvb3QpIHtcbiAgICAgICAgICAgIGNvbnN0IHhtbFJvb3QgPSBhd2FpdCB0aGlzLnhtbFJvb3QoKTtcbiAgICAgICAgICAgIGNvbnN0IHhtbENvbnRlbnQgPSB0aGlzLnhtbFBhcnNlci5zZXJpYWxpemUoeG1sUm9vdCk7XG4gICAgICAgICAgICB0aGlzLnppcC5zZXRGaWxlKHRoaXMucGF0aCwgeG1sQ29udGVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzYXZlIHJlbHNcbiAgICAgICAgYXdhaXQgdGhpcy5yZWxzLnNhdmUoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBNYWxmb3JtZWRGaWxlRXJyb3IgfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHsgQ29uc3RydWN0b3IsIElNYXAgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBCaW5hcnksIGxhc3QgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBYbWxHZW5lcmFsTm9kZSwgWG1sTm9kZVR5cGUsIFhtbFBhcnNlciB9IGZyb20gJy4uL3htbCc7XG5pbXBvcnQgeyBaaXAgfSBmcm9tICcuLi96aXAnO1xuaW1wb3J0IHsgQ29udGVudFBhcnRUeXBlIH0gZnJvbSAnLi9jb250ZW50UGFydFR5cGUnO1xuaW1wb3J0IHsgQ29udGVudFR5cGVzRmlsZSB9IGZyb20gJy4vY29udGVudFR5cGVzRmlsZSc7XG5pbXBvcnQgeyBNZWRpYUZpbGVzIH0gZnJvbSAnLi9tZWRpYUZpbGVzJztcbmltcG9ydCB7IFJlbHMgfSBmcm9tICcuL3JlbHMnO1xuaW1wb3J0IHsgWG1sUGFydCB9IGZyb20gJy4veG1sUGFydCc7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHNpbmdsZSBkb2N4IGZpbGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBEb2N4IHtcblxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IG1haW5Eb2N1bWVudFJlbFR5cGUgPSAnaHR0cDovL3NjaGVtYXMub3BlbnhtbGZvcm1hdHMub3JnL29mZmljZURvY3VtZW50LzIwMDYvcmVsYXRpb25zaGlwcy9vZmZpY2VEb2N1bWVudCc7XG5cbiAgICAvL1xuICAgIC8vIHN0YXRpYyBtZXRob2RzXG4gICAgLy9cblxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgb3Blbih6aXA6IFppcCwgeG1sUGFyc2VyOiBYbWxQYXJzZXIpOiBQcm9taXNlPERvY3g+IHtcbiAgICAgICAgY29uc3QgbWFpbkRvY3VtZW50UGF0aCA9IGF3YWl0IERvY3guZ2V0TWFpbkRvY3VtZW50UGF0aCh6aXAsIHhtbFBhcnNlcik7XG4gICAgICAgIGlmICghbWFpbkRvY3VtZW50UGF0aClcbiAgICAgICAgICAgIHRocm93IG5ldyBNYWxmb3JtZWRGaWxlRXJyb3IoJ2RvY3gnKTtcblxuICAgICAgICByZXR1cm4gbmV3IERvY3gobWFpbkRvY3VtZW50UGF0aCwgemlwLCB4bWxQYXJzZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIGdldE1haW5Eb2N1bWVudFBhdGgoemlwOiBaaXAsIHhtbFBhcnNlcjogWG1sUGFyc2VyKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3Qgcm9vdFBhcnQgPSAnJztcbiAgICAgICAgY29uc3Qgcm9vdFJlbHMgPSBuZXcgUmVscyhyb290UGFydCwgemlwLCB4bWxQYXJzZXIpO1xuICAgICAgICBjb25zdCByZWxhdGlvbnMgPSBhd2FpdCByb290UmVscy5saXN0KCk7XG4gICAgICAgIHJldHVybiByZWxhdGlvbnMuZmluZChyZWwgPT4gcmVsLnR5cGUgPT0gRG9jeC5tYWluRG9jdW1lbnRSZWxUeXBlKT8udGFyZ2V0O1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gZmllbGRzXG4gICAgLy9cblxuICAgIHB1YmxpYyByZWFkb25seSBtYWluRG9jdW1lbnQ6IFhtbFBhcnQ7XG4gICAgcHVibGljIHJlYWRvbmx5IG1lZGlhRmlsZXM6IE1lZGlhRmlsZXM7XG4gICAgcHVibGljIHJlYWRvbmx5IGNvbnRlbnRUeXBlczogQ29udGVudFR5cGVzRmlsZTtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgX3BhcnRzOiBJTWFwPFhtbFBhcnQ+ID0ge307XG5cbiAgICAvKipcbiAgICAgKiAqKk5vdGljZToqKiBZb3Ugc2hvdWxkIG9ubHkgdXNlIHRoaXMgcHJvcGVydHkgaWYgdGhlcmUgaXMgbm8gb3RoZXIgd2F5IHRvXG4gICAgICogZG8gd2hhdCB5b3UgbmVlZC4gVXNlIHdpdGggY2F1dGlvbi5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHJhd1ppcEZpbGUoKTogWmlwIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuemlwO1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gY29uc3RydWN0b3JcbiAgICAvL1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcbiAgICAgICAgbWFpbkRvY3VtZW50UGF0aDogc3RyaW5nLFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IHppcDogWmlwLFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IHhtbFBhcnNlcjogWG1sUGFyc2VyXG4gICAgKSB7XG4gICAgICAgIHRoaXMubWFpbkRvY3VtZW50ID0gbmV3IFhtbFBhcnQobWFpbkRvY3VtZW50UGF0aCwgemlwLCB4bWxQYXJzZXIpO1xuICAgICAgICB0aGlzLm1lZGlhRmlsZXMgPSBuZXcgTWVkaWFGaWxlcyh6aXApO1xuICAgICAgICB0aGlzLmNvbnRlbnRUeXBlcyA9IG5ldyBDb250ZW50VHlwZXNGaWxlKHppcCwgeG1sUGFyc2VyKTtcbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIHB1YmxpYyBtZXRob2RzXG4gICAgLy9cblxuICAgIHB1YmxpYyBhc3luYyBnZXRDb250ZW50UGFydCh0eXBlOiBDb250ZW50UGFydFR5cGUpOiBQcm9taXNlPFhtbFBhcnQ+IHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIENvbnRlbnRQYXJ0VHlwZS5NYWluRG9jdW1lbnQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFpbkRvY3VtZW50O1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRIZWFkZXJPckZvb3Rlcih0eXBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHhtbCBwYXJ0cyBvZiB0aGUgbWFpbiBkb2N1bWVudCwgaGVhZGVycyBhbmQgZm9vdGVycy5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgZ2V0Q29udGVudFBhcnRzKCk6IFByb21pc2U8WG1sUGFydFtdPiB7XG4gICAgICAgIGNvbnN0IHBhcnRUeXBlcyA9IFtcbiAgICAgICAgICAgIENvbnRlbnRQYXJ0VHlwZS5NYWluRG9jdW1lbnQsXG4gICAgICAgICAgICBDb250ZW50UGFydFR5cGUuRGVmYXVsdEhlYWRlcixcbiAgICAgICAgICAgIENvbnRlbnRQYXJ0VHlwZS5GaXJzdEhlYWRlcixcbiAgICAgICAgICAgIENvbnRlbnRQYXJ0VHlwZS5FdmVuUGFnZXNIZWFkZXIsXG4gICAgICAgICAgICBDb250ZW50UGFydFR5cGUuRGVmYXVsdEZvb3RlcixcbiAgICAgICAgICAgIENvbnRlbnRQYXJ0VHlwZS5GaXJzdEZvb3RlcixcbiAgICAgICAgICAgIENvbnRlbnRQYXJ0VHlwZS5FdmVuUGFnZXNGb290ZXJcbiAgICAgICAgXTtcbiAgICAgICAgY29uc3QgcGFydHMgPSBhd2FpdCBQcm9taXNlLmFsbChwYXJ0VHlwZXMubWFwKHAgPT4gdGhpcy5nZXRDb250ZW50UGFydChwKSkpO1xuICAgICAgICByZXR1cm4gcGFydHMuZmlsdGVyKHAgPT4gISFwKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgZXhwb3J0PFQgZXh0ZW5kcyBCaW5hcnk+KG91dHB1dFR5cGU6IENvbnN0cnVjdG9yPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZUNoYW5nZXMoKTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuemlwLmV4cG9ydChvdXRwdXRUeXBlKTtcbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIHByaXZhdGUgbWV0aG9kc1xuICAgIC8vXG5cbiAgICBwcml2YXRlIGFzeW5jIGdldEhlYWRlck9yRm9vdGVyKHR5cGU6IENvbnRlbnRQYXJ0VHlwZSk6IFByb21pc2U8WG1sUGFydD4ge1xuXG4gICAgICAgIGNvbnN0IG5vZGVOYW1lID0gdGhpcy5oZWFkZXJGb290ZXJOb2RlTmFtZSh0eXBlKTtcbiAgICAgICAgY29uc3Qgbm9kZVR5cGVBdHRyaWJ1dGUgPSB0aGlzLmhlYWRlckZvb3RlclR5cGUodHlwZSk7XG5cbiAgICAgICAgLy8gZmluZCB0aGUgbGFzdCBzZWN0aW9uIHByb3BlcnRpZXNcbiAgICAgICAgLy8gc2VlOiBodHRwOi8vb2ZmaWNlb3BlbnhtbC5jb20vV1BzZWN0aW9uLnBocFxuICAgICAgICBjb25zdCBkb2NSb290ID0gYXdhaXQgdGhpcy5tYWluRG9jdW1lbnQueG1sUm9vdCgpO1xuICAgICAgICBjb25zdCBib2R5ID0gZG9jUm9vdC5jaGlsZE5vZGVzWzBdO1xuICAgICAgICBjb25zdCBzZWN0aW9uUHJvcHMgPSBsYXN0KGJvZHkuY2hpbGROb2Rlcy5maWx0ZXIobm9kZSA9PiBub2RlLm5vZGVUeXBlID09PSBYbWxOb2RlVHlwZS5HZW5lcmFsKSk7XG4gICAgICAgIGlmIChzZWN0aW9uUHJvcHMubm9kZU5hbWUgIT0gJ3c6c2VjdFByJylcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIC8vIGZpbmQgdGhlIGhlYWRlciBvciBmb290ZXIgcmVmZXJlbmNlXG4gICAgICAgIGNvbnN0IHJlZmVyZW5jZSA9IHNlY3Rpb25Qcm9wcy5jaGlsZE5vZGVzPy5maW5kKG5vZGUgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IFhtbE5vZGVUeXBlLkdlbmVyYWwgJiZcbiAgICAgICAgICAgICAgICBub2RlLm5vZGVOYW1lID09PSBub2RlTmFtZSAmJlxuICAgICAgICAgICAgICAgIG5vZGUuYXR0cmlidXRlcz8uWyd3OnR5cGUnXSA9PT0gbm9kZVR5cGVBdHRyaWJ1dGU7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZWxJZCA9IChyZWZlcmVuY2UgYXMgWG1sR2VuZXJhbE5vZGUpPy5hdHRyaWJ1dGVzPy5bJ3I6aWQnXTtcbiAgICAgICAgaWYgKCFyZWxJZClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIC8vIHJldHVybiB0aGUgWG1sUGFydFxuICAgICAgICBjb25zdCByZWxzID0gYXdhaXQgdGhpcy5tYWluRG9jdW1lbnQucmVscy5saXN0KCk7XG4gICAgICAgIGNvbnN0IHJlbFRhcmdldCA9IHJlbHMuZmluZChyID0+IHIuaWQgPT09IHJlbElkKS50YXJnZXQ7XG4gICAgICAgIGlmICghdGhpcy5fcGFydHNbcmVsVGFyZ2V0XSkge1xuICAgICAgICAgICAgY29uc3QgcGFydCA9IG5ldyBYbWxQYXJ0KFwid29yZC9cIiArIHJlbFRhcmdldCwgdGhpcy56aXAsIHRoaXMueG1sUGFyc2VyKTtcbiAgICAgICAgICAgIHRoaXMuX3BhcnRzW3JlbFRhcmdldF0gPSBwYXJ0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0c1tyZWxUYXJnZXRdO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGVhZGVyRm9vdGVyTm9kZU5hbWUoY29udGVudFBhcnRUeXBlOiBDb250ZW50UGFydFR5cGUpOiBzdHJpbmcge1xuICAgICAgICBzd2l0Y2ggKGNvbnRlbnRQYXJ0VHlwZSkge1xuXG4gICAgICAgICAgICBjYXNlIENvbnRlbnRQYXJ0VHlwZS5EZWZhdWx0SGVhZGVyOlxuICAgICAgICAgICAgY2FzZSBDb250ZW50UGFydFR5cGUuRmlyc3RIZWFkZXI6XG4gICAgICAgICAgICBjYXNlIENvbnRlbnRQYXJ0VHlwZS5FdmVuUGFnZXNIZWFkZXI6XG4gICAgICAgICAgICAgICAgcmV0dXJuICd3OmhlYWRlclJlZmVyZW5jZSc7XG5cbiAgICAgICAgICAgIGNhc2UgQ29udGVudFBhcnRUeXBlLkRlZmF1bHRGb290ZXI6XG4gICAgICAgICAgICBjYXNlIENvbnRlbnRQYXJ0VHlwZS5GaXJzdEZvb3RlcjpcbiAgICAgICAgICAgIGNhc2UgQ29udGVudFBhcnRUeXBlLkV2ZW5QYWdlc0Zvb3RlcjpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3c6Zm9vdGVyUmVmZXJlbmNlJztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgY29udGVudCBwYXJ0IHR5cGU6ICcke2NvbnRlbnRQYXJ0VHlwZX0nLmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoZWFkZXJGb290ZXJUeXBlKGNvbnRlbnRQYXJ0VHlwZTogQ29udGVudFBhcnRUeXBlKTogc3RyaW5nIHtcblxuICAgICAgICAvLyBodHRwczovL2RvY3MubWljcm9zb2Z0LmNvbS9lbi11cy9kb3RuZXQvYXBpL2RvY3VtZW50Zm9ybWF0Lm9wZW54bWwud29yZHByb2Nlc3NpbmcuaGVhZGVyZm9vdGVydmFsdWVzP3ZpZXc9b3BlbnhtbC0yLjguMVxuXG4gICAgICAgIHN3aXRjaCAoY29udGVudFBhcnRUeXBlKSB7XG5cbiAgICAgICAgICAgIGNhc2UgQ29udGVudFBhcnRUeXBlLkRlZmF1bHRIZWFkZXI6XG4gICAgICAgICAgICBjYXNlIENvbnRlbnRQYXJ0VHlwZS5EZWZhdWx0Rm9vdGVyOlxuICAgICAgICAgICAgICAgIHJldHVybiAnZGVmYXVsdCc7XG5cbiAgICAgICAgICAgIGNhc2UgQ29udGVudFBhcnRUeXBlLkZpcnN0SGVhZGVyOlxuICAgICAgICAgICAgY2FzZSBDb250ZW50UGFydFR5cGUuRmlyc3RGb290ZXI6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdmaXJzdCc7XG5cbiAgICAgICAgICAgIGNhc2UgQ29udGVudFBhcnRUeXBlLkV2ZW5QYWdlc0hlYWRlcjpcbiAgICAgICAgICAgIGNhc2UgQ29udGVudFBhcnRUeXBlLkV2ZW5QYWdlc0Zvb3RlcjpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2V2ZW4nO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBjb250ZW50IHBhcnQgdHlwZTogJyR7Y29udGVudFBhcnRUeXBlfScuYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHNhdmVDaGFuZ2VzKCkge1xuXG4gICAgICAgIGNvbnN0IHBhcnRzID0gW1xuICAgICAgICAgICAgdGhpcy5tYWluRG9jdW1lbnQsXG4gICAgICAgICAgICAuLi5PYmplY3QudmFsdWVzKHRoaXMuX3BhcnRzKVxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgcGFydHMpIHtcbiAgICAgICAgICAgIGF3YWl0IHBhcnQuc2F2ZUNoYW5nZXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHRoaXMuY29udGVudFR5cGVzLnNhdmUoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBYbWxHZW5lcmFsTm9kZSwgWG1sTm9kZSwgWG1sUGFyc2VyLCBYbWxUZXh0Tm9kZSB9IGZyb20gJy4uL3htbCc7XG5pbXBvcnQgeyBaaXAgfSBmcm9tICcuLi96aXAnO1xuaW1wb3J0IHsgRG9jeCB9IGZyb20gJy4vZG9jeCc7XG5cbmV4cG9ydCBjbGFzcyBEb2N4UGFyc2VyIHtcblxuICAgIC8qXG4gICAgICogV29yZCBtYXJrdXAgaW50cm86XG4gICAgICpcbiAgICAgKiBJbiBXb3JkIHRleHQgbm9kZXMgYXJlIGNvbnRhaW5lZCBpbiBcInJ1blwiIG5vZGVzICh3aGljaCBzcGVjaWZpZXMgdGV4dFxuICAgICAqIHByb3BlcnRpZXMgc3VjaCBhcyBmb250IGFuZCBjb2xvcikuIFRoZSBcInJ1blwiIG5vZGVzIGluIHR1cm4gYXJlXG4gICAgICogY29udGFpbmVkIGluIHBhcmFncmFwaCBub2RlcyB3aGljaCBpcyB0aGUgY29yZSB1bml0IG9mIGNvbnRlbnQuXG4gICAgICpcbiAgICAgKiBFeGFtcGxlOlxuICAgICAqXG4gICAgICogPHc6cD4gICAgPC0tIHBhcmFncmFwaFxuICAgICAqICAgPHc6cj4gICAgICA8LS0gcnVuXG4gICAgICogICAgIDx3OnJQcj4gICAgICA8LS0gcnVuIHByb3BlcnRpZXNcbiAgICAgKiAgICAgICA8dzpiLz4gICAgIDwtLSBib2xkXG4gICAgICogICAgIDwvdzpyUHI+XG4gICAgICogICAgIDx3OnQ+VGhpcyBpcyB0ZXh0Ljwvdzp0PiAgICAgPC0tIGFjdHVhbCB0ZXh0XG4gICAgICogICA8L3c6cj5cbiAgICAgKiA8L3c6cD5cbiAgICAgKlxuICAgICAqIHNlZTogaHR0cDovL29mZmljZW9wZW54bWwuY29tL1dQY29udGVudE92ZXJ2aWV3LnBocFxuICAgICAqL1xuXG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBQQVJBR1JBUEhfTk9ERSA9ICd3OnAnO1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUEFSQUdSQVBIX1BST1BFUlRJRVNfTk9ERSA9ICd3OnBQcic7XG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBSVU5fTk9ERSA9ICd3OnInO1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUlVOX1BST1BFUlRJRVNfTk9ERSA9ICd3OnJQcic7XG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBURVhUX05PREUgPSAndzp0JztcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFRBQkxFX1JPV19OT0RFID0gJ3c6dHInO1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVEFCTEVfQ0VMTF9OT0RFID0gJ3c6dGMnO1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTlVNQkVSX1BST1BFUlRJRVNfTk9ERSA9ICd3Om51bVByJztcblxuICAgIC8vXG4gICAgLy8gY29uc3RydWN0b3JcbiAgICAvL1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgeG1sUGFyc2VyOiBYbWxQYXJzZXJcbiAgICApIHtcbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIHBhcnNlIGRvY3VtZW50XG4gICAgLy9cblxuICAgIHB1YmxpYyBsb2FkKHppcDogWmlwKTogUHJvbWlzZTxEb2N4PiB7XG4gICAgICAgIHJldHVybiBEb2N4Lm9wZW4oemlwLCB0aGlzLnhtbFBhcnNlcik7XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyBjb250ZW50IG1hbmlwdWxhdGlvblxuICAgIC8vXG5cbiAgICAvKipcbiAgICAgKiBTcGxpdCB0aGUgdGV4dCBub2RlIGludG8gdHdvIHRleHQgbm9kZXMsIGVhY2ggd2l0aCBpdCdzIG93biB3cmFwcGluZyA8dzp0PiBub2RlLlxuICAgICAqIFJldHVybnMgdGhlIG5ld2x5IGNyZWF0ZWQgdGV4dCBub2RlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHRleHROb2RlXG4gICAgICogQHBhcmFtIHNwbGl0SW5kZXhcbiAgICAgKiBAcGFyYW0gYWRkQmVmb3JlIFNob3VsZCB0aGUgbmV3IG5vZGUgYmUgYWRkZWQgYmVmb3JlIG9yIGFmdGVyIHRoZSBvcmlnaW5hbCBub2RlLlxuICAgICAqL1xuICAgIHB1YmxpYyBzcGxpdFRleHROb2RlKHRleHROb2RlOiBYbWxUZXh0Tm9kZSwgc3BsaXRJbmRleDogbnVtYmVyLCBhZGRCZWZvcmU6IGJvb2xlYW4pOiBYbWxUZXh0Tm9kZSB7XG5cbiAgICAgICAgbGV0IGZpcnN0WG1sVGV4dE5vZGU6IFhtbFRleHROb2RlO1xuICAgICAgICBsZXQgc2Vjb25kWG1sVGV4dE5vZGU6IFhtbFRleHROb2RlO1xuXG4gICAgICAgIC8vIHNwbGl0IG5vZGVzXG4gICAgICAgIGNvbnN0IHdvcmRUZXh0Tm9kZSA9IHRoaXMuY29udGFpbmluZ1RleHROb2RlKHRleHROb2RlKTtcbiAgICAgICAgY29uc3QgbmV3V29yZFRleHROb2RlID0gWG1sTm9kZS5jbG9uZU5vZGUod29yZFRleHROb2RlLCB0cnVlKTtcblxuICAgICAgICAvLyBzZXQgc3BhY2UgcHJlc2VydmUgdG8gcHJldmVudCBkaXNwbGF5IGRpZmZlcmVuY2VzIGFmdGVyIHNwbGl0dGluZ1xuICAgICAgICAvLyAob3RoZXJ3aXNlIGlmIHRoZXJlIHdhcyBhIHNwYWNlIGluIHRoZSBtaWRkbGUgb2YgdGhlIHRleHQgbm9kZSBhbmQgaXRcbiAgICAgICAgLy8gaXMgbm93IGF0IHRoZSBiZWdpbm5pbmcgb3IgZW5kIG9mIHRoZSB0ZXh0IG5vZGUgaXQgd2lsbCBiZSBpZ25vcmVkKVxuICAgICAgICB0aGlzLnNldFNwYWNlUHJlc2VydmVBdHRyaWJ1dGUod29yZFRleHROb2RlKTtcbiAgICAgICAgdGhpcy5zZXRTcGFjZVByZXNlcnZlQXR0cmlidXRlKG5ld1dvcmRUZXh0Tm9kZSk7XG5cbiAgICAgICAgaWYgKGFkZEJlZm9yZSkge1xuXG4gICAgICAgICAgICAvLyBpbnNlcnQgbmV3IG5vZGUgYmVmb3JlIGV4aXN0aW5nIG9uZVxuICAgICAgICAgICAgWG1sTm9kZS5pbnNlcnRCZWZvcmUobmV3V29yZFRleHROb2RlLCB3b3JkVGV4dE5vZGUpO1xuXG4gICAgICAgICAgICBmaXJzdFhtbFRleHROb2RlID0gWG1sTm9kZS5sYXN0VGV4dENoaWxkKG5ld1dvcmRUZXh0Tm9kZSk7XG4gICAgICAgICAgICBzZWNvbmRYbWxUZXh0Tm9kZSA9IHRleHROb2RlO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIGluc2VydCBuZXcgbm9kZSBhZnRlciBleGlzdGluZyBvbmVcbiAgICAgICAgICAgIGNvbnN0IGN1ckluZGV4ID0gd29yZFRleHROb2RlLnBhcmVudE5vZGUuY2hpbGROb2Rlcy5pbmRleE9mKHdvcmRUZXh0Tm9kZSk7XG4gICAgICAgICAgICBYbWxOb2RlLmluc2VydENoaWxkKHdvcmRUZXh0Tm9kZS5wYXJlbnROb2RlLCBuZXdXb3JkVGV4dE5vZGUsIGN1ckluZGV4ICsgMSk7XG5cbiAgICAgICAgICAgIGZpcnN0WG1sVGV4dE5vZGUgPSB0ZXh0Tm9kZTtcbiAgICAgICAgICAgIHNlY29uZFhtbFRleHROb2RlID0gWG1sTm9kZS5sYXN0VGV4dENoaWxkKG5ld1dvcmRUZXh0Tm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBlZGl0IHRleHRcbiAgICAgICAgY29uc3QgZmlyc3RUZXh0ID0gZmlyc3RYbWxUZXh0Tm9kZS50ZXh0Q29udGVudDtcbiAgICAgICAgY29uc3Qgc2Vjb25kVGV4dCA9IHNlY29uZFhtbFRleHROb2RlLnRleHRDb250ZW50O1xuICAgICAgICBmaXJzdFhtbFRleHROb2RlLnRleHRDb250ZW50ID0gZmlyc3RUZXh0LnN1YnN0cmluZygwLCBzcGxpdEluZGV4KTtcbiAgICAgICAgc2Vjb25kWG1sVGV4dE5vZGUudGV4dENvbnRlbnQgPSBzZWNvbmRUZXh0LnN1YnN0cmluZyhzcGxpdEluZGV4KTtcblxuICAgICAgICByZXR1cm4gKGFkZEJlZm9yZSA/IGZpcnN0WG1sVGV4dE5vZGUgOiBzZWNvbmRYbWxUZXh0Tm9kZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3BsaXQgdGhlIHBhcmFncmFwaCBhcm91bmQgdGhlIHNwZWNpZmllZCB0ZXh0IG5vZGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUd28gcGFyYWdyYXBocyAtIGBsZWZ0YCBhbmQgYHJpZ2h0YC4gSWYgdGhlIGByZW1vdmVUZXh0Tm9kZWAgYXJndW1lbnQgaXNcbiAgICAgKiBgZmFsc2VgIHRoZW4gdGhlIG9yaWdpbmFsIHRleHQgbm9kZSBpcyB0aGUgZmlyc3QgdGV4dCBub2RlIG9mIGByaWdodGAuXG4gICAgICovXG4gICAgcHVibGljIHNwbGl0UGFyYWdyYXBoQnlUZXh0Tm9kZShwYXJhZ3JhcGg6IFhtbE5vZGUsIHRleHROb2RlOiBYbWxUZXh0Tm9kZSwgcmVtb3ZlVGV4dE5vZGU6IGJvb2xlYW4pOiBbWG1sTm9kZSwgWG1sTm9kZV0ge1xuXG4gICAgICAgIC8vIGlucHV0IHZhbGlkYXRpb25cbiAgICAgICAgY29uc3QgY29udGFpbmluZ1BhcmFncmFwaCA9IHRoaXMuY29udGFpbmluZ1BhcmFncmFwaE5vZGUodGV4dE5vZGUpO1xuICAgICAgICBpZiAoY29udGFpbmluZ1BhcmFncmFwaCAhPSBwYXJhZ3JhcGgpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vZGUgJyR7bmFtZW9mKHRleHROb2RlKX0nIGlzIG5vdCBhIGRlc2NlbmRhbnQgb2YgJyR7bmFtZW9mKHBhcmFncmFwaCl9Jy5gKTtcblxuICAgICAgICBjb25zdCBydW5Ob2RlID0gdGhpcy5jb250YWluaW5nUnVuTm9kZSh0ZXh0Tm9kZSk7XG4gICAgICAgIGNvbnN0IHdvcmRUZXh0Tm9kZSA9IHRoaXMuY29udGFpbmluZ1RleHROb2RlKHRleHROb2RlKTtcblxuICAgICAgICAvLyBjcmVhdGUgcnVuIGNsb25lXG4gICAgICAgIGNvbnN0IGxlZnRSdW4gPSBYbWxOb2RlLmNsb25lTm9kZShydW5Ob2RlLCBmYWxzZSk7XG4gICAgICAgIGNvbnN0IHJpZ2h0UnVuID0gcnVuTm9kZTtcbiAgICAgICAgWG1sTm9kZS5pbnNlcnRCZWZvcmUobGVmdFJ1biwgcmlnaHRSdW4pO1xuXG4gICAgICAgIC8vIGNvcHkgcHJvcHMgZnJvbSBvcmlnaW5hbCBydW4gbm9kZSAocHJlc2VydmUgc3R5bGUpXG4gICAgICAgIGNvbnN0IHJ1blByb3BzID0gcmlnaHRSdW4uY2hpbGROb2Rlcy5maW5kKG5vZGUgPT4gbm9kZS5ub2RlTmFtZSA9PT0gRG9jeFBhcnNlci5SVU5fUFJPUEVSVElFU19OT0RFKTtcbiAgICAgICAgaWYgKHJ1blByb3BzKSB7XG4gICAgICAgICAgICBjb25zdCBsZWZ0UnVuUHJvcHMgPSBYbWxOb2RlLmNsb25lTm9kZShydW5Qcm9wcywgdHJ1ZSk7XG4gICAgICAgICAgICBYbWxOb2RlLmFwcGVuZENoaWxkKGxlZnRSdW4sIGxlZnRSdW5Qcm9wcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtb3ZlIG5vZGVzIGZyb20gJ3JpZ2h0JyB0byAnbGVmdCdcbiAgICAgICAgY29uc3QgZmlyc3RSdW5DaGlsZEluZGV4ID0gKHJ1blByb3BzID8gMSA6IDApO1xuICAgICAgICBsZXQgY3VyQ2hpbGQgPSByaWdodFJ1bi5jaGlsZE5vZGVzW2ZpcnN0UnVuQ2hpbGRJbmRleF07XG4gICAgICAgIHdoaWxlIChjdXJDaGlsZCAhPSB3b3JkVGV4dE5vZGUpIHtcbiAgICAgICAgICAgIFhtbE5vZGUucmVtb3ZlKGN1ckNoaWxkKTtcbiAgICAgICAgICAgIFhtbE5vZGUuYXBwZW5kQ2hpbGQobGVmdFJ1biwgY3VyQ2hpbGQpO1xuICAgICAgICAgICAgY3VyQ2hpbGQgPSByaWdodFJ1bi5jaGlsZE5vZGVzW2ZpcnN0UnVuQ2hpbGRJbmRleF07XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZW1vdmUgdGV4dCBub2RlXG4gICAgICAgIGlmIChyZW1vdmVUZXh0Tm9kZSkge1xuICAgICAgICAgICAgWG1sTm9kZS5yZW1vdmVDaGlsZChyaWdodFJ1biwgZmlyc3RSdW5DaGlsZEluZGV4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNyZWF0ZSBwYXJhZ3JhcGggY2xvbmVcbiAgICAgICAgY29uc3QgbGVmdFBhcmEgPSBYbWxOb2RlLmNsb25lTm9kZShjb250YWluaW5nUGFyYWdyYXBoLCBmYWxzZSk7XG4gICAgICAgIGNvbnN0IHJpZ2h0UGFyYSA9IGNvbnRhaW5pbmdQYXJhZ3JhcGg7XG4gICAgICAgIFhtbE5vZGUuaW5zZXJ0QmVmb3JlKGxlZnRQYXJhLCByaWdodFBhcmEpO1xuXG4gICAgICAgIC8vIGNvcHkgcHJvcHMgZnJvbSBvcmlnaW5hbCBwYXJhZ3JhcGggKHByZXNlcnZlIHN0eWxlKVxuICAgICAgICBjb25zdCBwYXJhZ3JhcGhQcm9wcyA9IHJpZ2h0UGFyYS5jaGlsZE5vZGVzLmZpbmQobm9kZSA9PiBub2RlLm5vZGVOYW1lID09PSBEb2N4UGFyc2VyLlBBUkFHUkFQSF9QUk9QRVJUSUVTX05PREUpO1xuICAgICAgICBpZiAocGFyYWdyYXBoUHJvcHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGxlZnRQYXJhZ3JhcGhQcm9wcyA9IFhtbE5vZGUuY2xvbmVOb2RlKHBhcmFncmFwaFByb3BzLCB0cnVlKTtcbiAgICAgICAgICAgIFhtbE5vZGUuYXBwZW5kQ2hpbGQobGVmdFBhcmEsIGxlZnRQYXJhZ3JhcGhQcm9wcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtb3ZlIG5vZGVzIGZyb20gJ3JpZ2h0JyB0byAnbGVmdCdcbiAgICAgICAgY29uc3QgZmlyc3RQYXJhQ2hpbGRJbmRleCA9IChwYXJhZ3JhcGhQcm9wcyA/IDEgOiAwKTtcbiAgICAgICAgY3VyQ2hpbGQgPSByaWdodFBhcmEuY2hpbGROb2Rlc1tmaXJzdFBhcmFDaGlsZEluZGV4XTtcbiAgICAgICAgd2hpbGUgKGN1ckNoaWxkICE9IHJpZ2h0UnVuKSB7XG4gICAgICAgICAgICBYbWxOb2RlLnJlbW92ZShjdXJDaGlsZCk7XG4gICAgICAgICAgICBYbWxOb2RlLmFwcGVuZENoaWxkKGxlZnRQYXJhLCBjdXJDaGlsZCk7XG4gICAgICAgICAgICBjdXJDaGlsZCA9IHJpZ2h0UGFyYS5jaGlsZE5vZGVzW2ZpcnN0UGFyYUNoaWxkSW5kZXhdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2xlYW4gcGFyYWdyYXBocyAtIHJlbW92ZSBlbXB0eSBydW5zXG4gICAgICAgIGlmICh0aGlzLmlzRW1wdHlSdW4obGVmdFJ1bikpXG4gICAgICAgICAgICBYbWxOb2RlLnJlbW92ZShsZWZ0UnVuKTtcbiAgICAgICAgaWYgKHRoaXMuaXNFbXB0eVJ1bihyaWdodFJ1bikpXG4gICAgICAgICAgICBYbWxOb2RlLnJlbW92ZShyaWdodFJ1bik7XG5cbiAgICAgICAgcmV0dXJuIFtsZWZ0UGFyYSwgcmlnaHRQYXJhXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIGFsbCB0ZXh0IGJldHdlZW4gdGhlICdmcm9tJyBhbmQgJ3RvJyBub2RlcyB0byB0aGUgJ2Zyb20nIG5vZGUuXG4gICAgICovXG4gICAgcHVibGljIGpvaW5UZXh0Tm9kZXNSYW5nZShmcm9tOiBYbWxUZXh0Tm9kZSwgdG86IFhtbFRleHROb2RlKTogdm9pZCB7XG5cbiAgICAgICAgLy8gZmluZCBydW4gbm9kZXNcbiAgICAgICAgY29uc3QgZmlyc3RSdW5Ob2RlID0gdGhpcy5jb250YWluaW5nUnVuTm9kZShmcm9tKTtcbiAgICAgICAgY29uc3Qgc2Vjb25kUnVuTm9kZSA9IHRoaXMuY29udGFpbmluZ1J1bk5vZGUodG8pO1xuXG4gICAgICAgIGNvbnN0IHBhcmFncmFwaE5vZGUgPSBmaXJzdFJ1bk5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgaWYgKHNlY29uZFJ1bk5vZGUucGFyZW50Tm9kZSAhPT0gcGFyYWdyYXBoTm9kZSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG5vdCBqb2luIHRleHQgbm9kZXMgZnJvbSBzZXBhcmF0ZSBwYXJhZ3JhcGhzLicpO1xuXG4gICAgICAgIC8vIGZpbmQgXCJ3b3JkIHRleHQgbm9kZXNcIlxuICAgICAgICBjb25zdCBmaXJzdFdvcmRUZXh0Tm9kZSA9IHRoaXMuY29udGFpbmluZ1RleHROb2RlKGZyb20pO1xuICAgICAgICBjb25zdCBzZWNvbmRXb3JkVGV4dE5vZGUgPSB0aGlzLmNvbnRhaW5pbmdUZXh0Tm9kZSh0byk7XG4gICAgICAgIGNvbnN0IHRvdGFsVGV4dDogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAvLyBpdGVyYXRlIHJ1bnNcbiAgICAgICAgbGV0IGN1clJ1bk5vZGUgPSBmaXJzdFJ1bk5vZGU7XG4gICAgICAgIHdoaWxlIChjdXJSdW5Ob2RlKSB7XG5cbiAgICAgICAgICAgIC8vIGl0ZXJhdGUgdGV4dCBub2Rlc1xuICAgICAgICAgICAgbGV0IGN1cldvcmRUZXh0Tm9kZTogWG1sTm9kZTtcbiAgICAgICAgICAgIGlmIChjdXJSdW5Ob2RlID09PSBmaXJzdFJ1bk5vZGUpIHtcbiAgICAgICAgICAgICAgICBjdXJXb3JkVGV4dE5vZGUgPSBmaXJzdFdvcmRUZXh0Tm9kZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VyV29yZFRleHROb2RlID0gdGhpcy5maXJzdFRleHROb2RlQ2hpbGQoY3VyUnVuTm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aGlsZSAoY3VyV29yZFRleHROb2RlKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VyV29yZFRleHROb2RlLm5vZGVOYW1lICE9PSBEb2N4UGFyc2VyLlRFWFRfTk9ERSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAvLyBtb3ZlIHRleHQgdG8gZmlyc3Qgbm9kZVxuICAgICAgICAgICAgICAgIGNvbnN0IGN1clhtbFRleHROb2RlID0gWG1sTm9kZS5sYXN0VGV4dENoaWxkKGN1cldvcmRUZXh0Tm9kZSk7XG4gICAgICAgICAgICAgICAgdG90YWxUZXh0LnB1c2goY3VyWG1sVGV4dE5vZGUudGV4dENvbnRlbnQpO1xuXG4gICAgICAgICAgICAgICAgLy8gbmV4dCB0ZXh0IG5vZGVcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0VG9SZW1vdmUgPSBjdXJXb3JkVGV4dE5vZGU7XG4gICAgICAgICAgICAgICAgaWYgKGN1cldvcmRUZXh0Tm9kZSA9PT0gc2Vjb25kV29yZFRleHROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cldvcmRUZXh0Tm9kZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3VyV29yZFRleHROb2RlID0gY3VyV29yZFRleHROb2RlLm5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBjdXJyZW50IHRleHQgbm9kZVxuICAgICAgICAgICAgICAgIGlmICh0ZXh0VG9SZW1vdmUgIT09IGZpcnN0V29yZFRleHROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIFhtbE5vZGUucmVtb3ZlKHRleHRUb1JlbW92ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBuZXh0IHJ1blxuICAgICAgICAgICAgY29uc3QgcnVuVG9SZW1vdmUgPSBjdXJSdW5Ob2RlO1xuICAgICAgICAgICAgaWYgKGN1clJ1bk5vZGUgPT09IHNlY29uZFJ1bk5vZGUpIHtcbiAgICAgICAgICAgICAgICBjdXJSdW5Ob2RlID0gbnVsbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VyUnVuTm9kZSA9IGN1clJ1bk5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHJlbW92ZSBjdXJyZW50IHJ1blxuICAgICAgICAgICAgaWYgKCFydW5Ub1JlbW92ZS5jaGlsZE5vZGVzIHx8ICFydW5Ub1JlbW92ZS5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIFhtbE5vZGUucmVtb3ZlKHJ1blRvUmVtb3ZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNldCB0aGUgdGV4dCBjb250ZW50XG4gICAgICAgIGNvbnN0IGZpcnN0WG1sVGV4dE5vZGUgPSBYbWxOb2RlLmxhc3RUZXh0Q2hpbGQoZmlyc3RXb3JkVGV4dE5vZGUpO1xuICAgICAgICBmaXJzdFhtbFRleHROb2RlLnRleHRDb250ZW50ID0gdG90YWxUZXh0LmpvaW4oJycpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRha2UgYWxsIHJ1bnMgZnJvbSAnc2Vjb25kJyBhbmQgbW92ZSB0aGVtIHRvICdmaXJzdCcuXG4gICAgICovXG4gICAgcHVibGljIGpvaW5QYXJhZ3JhcGhzKGZpcnN0OiBYbWxOb2RlLCBzZWNvbmQ6IFhtbE5vZGUpOiB2b2lkIHtcbiAgICAgICAgaWYgKGZpcnN0ID09PSBzZWNvbmQpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgbGV0IGNoaWxkSW5kZXggPSAwO1xuICAgICAgICB3aGlsZSAoc2Vjb25kLmNoaWxkTm9kZXMgJiYgY2hpbGRJbmRleCA8IHNlY29uZC5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgY3VyQ2hpbGQgPSBzZWNvbmQuY2hpbGROb2Rlc1tjaGlsZEluZGV4XTtcbiAgICAgICAgICAgIGlmIChjdXJDaGlsZC5ub2RlTmFtZSA9PT0gRG9jeFBhcnNlci5SVU5fTk9ERSkge1xuICAgICAgICAgICAgICAgIFhtbE5vZGUucmVtb3ZlQ2hpbGQoc2Vjb25kLCBjaGlsZEluZGV4KTtcbiAgICAgICAgICAgICAgICBYbWxOb2RlLmFwcGVuZENoaWxkKGZpcnN0LCBjdXJDaGlsZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNoaWxkSW5kZXgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRTcGFjZVByZXNlcnZlQXR0cmlidXRlKG5vZGU6IFhtbEdlbmVyYWxOb2RlKTogdm9pZCB7XG4gICAgICAgIGlmICghbm9kZS5hdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBub2RlLmF0dHJpYnV0ZXMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW5vZGUuYXR0cmlidXRlc1sneG1sOnNwYWNlJ10pIHtcbiAgICAgICAgICAgIG5vZGUuYXR0cmlidXRlc1sneG1sOnNwYWNlJ10gPSAncHJlc2VydmUnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyBub2RlIHF1ZXJpZXNcbiAgICAvL1xuXG4gICAgcHVibGljIGlzVGV4dE5vZGUobm9kZTogWG1sTm9kZSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gbm9kZS5ub2RlTmFtZSA9PT0gRG9jeFBhcnNlci5URVhUX05PREU7XG4gICAgfVxuXG4gICAgcHVibGljIGlzUnVuTm9kZShub2RlOiBYbWxOb2RlKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBub2RlLm5vZGVOYW1lID09PSBEb2N4UGFyc2VyLlJVTl9OT0RFO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc1J1blByb3BlcnRpZXNOb2RlKG5vZGU6IFhtbE5vZGUpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIG5vZGUubm9kZU5hbWUgPT09IERvY3hQYXJzZXIuUlVOX1BST1BFUlRJRVNfTk9ERTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNUYWJsZUNlbGxOb2RlKG5vZGU6IFhtbE5vZGUpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIG5vZGUubm9kZU5hbWUgPT09IERvY3hQYXJzZXIuVEFCTEVfQ0VMTF9OT0RFO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc1BhcmFncmFwaE5vZGUobm9kZTogWG1sTm9kZSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gbm9kZS5ub2RlTmFtZSA9PT0gRG9jeFBhcnNlci5QQVJBR1JBUEhfTk9ERTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNMaXN0UGFyYWdyYXBoKHBhcmFncmFwaE5vZGU6IFhtbE5vZGUpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgcGFyYWdyYXBoUHJvcGVydGllcyA9IHRoaXMucGFyYWdyYXBoUHJvcGVydGllc05vZGUocGFyYWdyYXBoTm9kZSk7XG4gICAgICAgIGNvbnN0IGxpc3ROdW1iZXJQcm9wZXJ0aWVzID0gWG1sTm9kZS5maW5kQ2hpbGRCeU5hbWUocGFyYWdyYXBoUHJvcGVydGllcywgRG9jeFBhcnNlci5OVU1CRVJfUFJPUEVSVElFU19OT0RFKTtcbiAgICAgICAgcmV0dXJuICEhbGlzdE51bWJlclByb3BlcnRpZXM7XG4gICAgfVxuXG4gICAgcHVibGljIHBhcmFncmFwaFByb3BlcnRpZXNOb2RlKHBhcmFncmFwaE5vZGU6IFhtbE5vZGUpOiBYbWxOb2RlIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUGFyYWdyYXBoTm9kZShwYXJhZ3JhcGhOb2RlKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgcGFyYWdyYXBoIG5vZGUgYnV0IHJlY2VpdmVkIGEgJyR7cGFyYWdyYXBoTm9kZS5ub2RlTmFtZX0nIG5vZGUuYCk7XG5cbiAgICAgICAgcmV0dXJuIFhtbE5vZGUuZmluZENoaWxkQnlOYW1lKHBhcmFncmFwaE5vZGUsIERvY3hQYXJzZXIuUEFSQUdSQVBIX1BST1BFUlRJRVNfTk9ERSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VhcmNoIGZvciB0aGUgZmlyc3QgZGlyZWN0IGNoaWxkICoqV29yZCoqIHRleHQgbm9kZSAoaS5lLiBhIDx3OnQ+IG5vZGUpLlxuICAgICAqL1xuICAgIHB1YmxpYyBmaXJzdFRleHROb2RlQ2hpbGQobm9kZTogWG1sTm9kZSk6IFhtbE5vZGUge1xuXG4gICAgICAgIGlmICghbm9kZSlcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIGlmIChub2RlLm5vZGVOYW1lICE9PSBEb2N4UGFyc2VyLlJVTl9OT0RFKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgaWYgKCFub2RlLmNoaWxkTm9kZXMpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIG5vZGUuY2hpbGROb2Rlcykge1xuICAgICAgICAgICAgaWYgKGNoaWxkLm5vZGVOYW1lID09PSBEb2N4UGFyc2VyLlRFWFRfTk9ERSlcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZWFyY2ggKip1cHdhcmRzKiogZm9yIHRoZSBmaXJzdCAqKldvcmQqKiB0ZXh0IG5vZGUgKGkuZS4gYSA8dzp0PiBub2RlKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29udGFpbmluZ1RleHROb2RlKG5vZGU6IFhtbFRleHROb2RlKTogWG1sR2VuZXJhbE5vZGUge1xuXG4gICAgICAgIGlmICghbm9kZSlcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIGlmICghWG1sTm9kZS5pc1RleHROb2RlKG5vZGUpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnSW52YWxpZCBhcmd1bWVudCAke25hbWVvZihub2RlKX0uIEV4cGVjdGVkIGEgWG1sVGV4dE5vZGUuYCk7XG5cbiAgICAgICAgcmV0dXJuIFhtbE5vZGUuZmluZFBhcmVudEJ5TmFtZShub2RlLCBEb2N4UGFyc2VyLlRFWFRfTk9ERSkgYXMgWG1sR2VuZXJhbE5vZGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VhcmNoICoqdXB3YXJkcyoqIGZvciB0aGUgZmlyc3QgcnVuIG5vZGUuXG4gICAgICovXG4gICAgcHVibGljIGNvbnRhaW5pbmdSdW5Ob2RlKG5vZGU6IFhtbE5vZGUpOiBYbWxOb2RlIHtcbiAgICAgICAgcmV0dXJuIFhtbE5vZGUuZmluZFBhcmVudEJ5TmFtZShub2RlLCBEb2N4UGFyc2VyLlJVTl9OT0RFKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZWFyY2ggKip1cHdhcmRzKiogZm9yIHRoZSBmaXJzdCBwYXJhZ3JhcGggbm9kZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29udGFpbmluZ1BhcmFncmFwaE5vZGUobm9kZTogWG1sTm9kZSk6IFhtbE5vZGUge1xuICAgICAgICByZXR1cm4gWG1sTm9kZS5maW5kUGFyZW50QnlOYW1lKG5vZGUsIERvY3hQYXJzZXIuUEFSQUdSQVBIX05PREUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlYXJjaCAqKnVwd2FyZHMqKiBmb3IgdGhlIGZpcnN0IFwidGFibGUgcm93XCIgbm9kZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29udGFpbmluZ1RhYmxlUm93Tm9kZShub2RlOiBYbWxOb2RlKTogWG1sTm9kZSB7XG4gICAgICAgIHJldHVybiBYbWxOb2RlLmZpbmRQYXJlbnRCeU5hbWUobm9kZSwgRG9jeFBhcnNlci5UQUJMRV9ST1dfTk9ERSk7XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyBhZHZhbmNlZCBub2RlIHF1ZXJpZXNcbiAgICAvL1xuXG4gICAgcHVibGljIGlzRW1wdHlUZXh0Tm9kZShub2RlOiBYbWxOb2RlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5pc1RleHROb2RlKG5vZGUpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUZXh0IG5vZGUgZXhwZWN0ZWQgYnV0ICcke25vZGUubm9kZU5hbWV9JyByZWNlaXZlZC5gKTtcblxuICAgICAgICBpZiAoIW5vZGUuY2hpbGROb2Rlcz8ubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgY29uc3QgeG1sVGV4dE5vZGUgPSBub2RlLmNoaWxkTm9kZXNbMF07XG4gICAgICAgIGlmICghWG1sTm9kZS5pc1RleHROb2RlKHhtbFRleHROb2RlKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgWE1MIHN0cnVjdHVyZS4gJ3c6dCcgbm9kZSBzaG91bGQgY29udGFpbiBhIHNpbmdsZSB0ZXh0IG5vZGUgb25seS5cIik7XG5cbiAgICAgICAgaWYgKCF4bWxUZXh0Tm9kZS50ZXh0Q29udGVudClcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNFbXB0eVJ1bihub2RlOiBYbWxOb2RlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5pc1J1bk5vZGUobm9kZSkpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJ1biBub2RlIGV4cGVjdGVkIGJ1dCAnJHtub2RlLm5vZGVOYW1lfScgcmVjZWl2ZWQuYCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiAobm9kZS5jaGlsZE5vZGVzID8/IFtdKSkge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pc1J1blByb3BlcnRpZXNOb2RlKGNoaWxkKSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNUZXh0Tm9kZShjaGlsZCkgJiYgdGhpcy5pc0VtcHR5VGV4dE5vZGUoY2hpbGQpKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBTY29wZURhdGEsIFRhZywgVGVtcGxhdGVDb250ZXh0IH0gZnJvbSAnLi4vLi4vY29tcGlsYXRpb24nO1xuaW1wb3J0IHsgRG9jeFBhcnNlciB9IGZyb20gJy4uLy4uL29mZmljZSc7XG5pbXBvcnQgeyBYbWxOb2RlIH0gZnJvbSAnLi4vLi4veG1sJztcbmltcG9ydCB7IFRlbXBsYXRlUGx1Z2luIH0gZnJvbSAnLi4vdGVtcGxhdGVQbHVnaW4nO1xuaW1wb3J0IHsgTGlua0NvbnRlbnQgfSBmcm9tICcuL2xpbmtDb250ZW50JztcblxuZXhwb3J0IGNsYXNzIExpbmtQbHVnaW4gZXh0ZW5kcyBUZW1wbGF0ZVBsdWdpbiB7XG5cbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBsaW5rUmVsVHlwZSA9ICdodHRwOi8vc2NoZW1hcy5vcGVueG1sZm9ybWF0cy5vcmcvb2ZmaWNlRG9jdW1lbnQvMjAwNi9yZWxhdGlvbnNoaXBzL2h5cGVybGluayc7XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgY29udGVudFR5cGUgPSAnbGluayc7XG5cbiAgICBwdWJsaWMgYXN5bmMgc2ltcGxlVGFnUmVwbGFjZW1lbnRzKHRhZzogVGFnLCBkYXRhOiBTY29wZURhdGEsIGNvbnRleHQ6IFRlbXBsYXRlQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuXG4gICAgICAgIGNvbnN0IHdvcmRUZXh0Tm9kZSA9IHRoaXMudXRpbGl0aWVzLmRvY3hQYXJzZXIuY29udGFpbmluZ1RleHROb2RlKHRhZy54bWxUZXh0Tm9kZSk7XG5cbiAgICAgICAgY29uc3QgY29udGVudCA9IGRhdGEuZ2V0U2NvcGVEYXRhPExpbmtDb250ZW50PigpO1xuICAgICAgICBpZiAoIWNvbnRlbnQgfHwgIWNvbnRlbnQudGFyZ2V0KSB7XG4gICAgICAgICAgICBYbWxOb2RlLnJlbW92ZSh3b3JkVGV4dE5vZGUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIHJlbFxuICAgICAgICBjb25zdCByZWxJZCA9IGF3YWl0IGNvbnRleHQuY3VycmVudFBhcnQucmVscy5hZGQoY29udGVudC50YXJnZXQsIExpbmtQbHVnaW4ubGlua1JlbFR5cGUsICdFeHRlcm5hbCcpO1xuXG4gICAgICAgIC8vIGdlbmVyYXRlIG1hcmt1cFxuICAgICAgICBjb25zdCB3b3JkUnVuTm9kZSA9IHRoaXMudXRpbGl0aWVzLmRvY3hQYXJzZXIuY29udGFpbmluZ1J1bk5vZGUod29yZFRleHROb2RlKTtcbiAgICAgICAgY29uc3QgbGlua01hcmt1cCA9IHRoaXMuZ2VuZXJhdGVNYXJrdXAoY29udGVudCwgcmVsSWQsIHdvcmRSdW5Ob2RlKTtcblxuICAgICAgICAvLyBhZGQgdG8gZG9jdW1lbnRcbiAgICAgICAgdGhpcy5pbnNlcnRIeXBlcmxpbmtOb2RlKGxpbmtNYXJrdXAsIHdvcmRSdW5Ob2RlLCB3b3JkVGV4dE5vZGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVNYXJrdXAoY29udGVudDogTGlua0NvbnRlbnQsIHJlbElkOiBzdHJpbmcsIHdvcmRSdW5Ob2RlOiBYbWxOb2RlKSB7XG5cbiAgICAgICAgLy8gaHR0cDovL29mZmljZW9wZW54bWwuY29tL1dQaHlwZXJsaW5rLnBocFxuXG4gICAgICAgIGNvbnN0IG1hcmt1cFRleHQgPSBgXG4gICAgICAgICAgICA8dzpoeXBlcmxpbmsgcjppZD1cIiR7cmVsSWR9XCIgdzpoaXN0b3J5PVwiMVwiPlxuICAgICAgICAgICAgICAgIDx3OnI+XG4gICAgICAgICAgICAgICAgICAgIDx3OnQ+JHtjb250ZW50LnRleHQgfHwgY29udGVudC50YXJnZXR9PC93OnQ+XG4gICAgICAgICAgICAgICAgPC93OnI+XG4gICAgICAgICAgICA8L3c6aHlwZXJsaW5rPlxuICAgICAgICBgO1xuICAgICAgICBjb25zdCBtYXJrdXBYbWwgPSB0aGlzLnV0aWxpdGllcy54bWxQYXJzZXIucGFyc2UobWFya3VwVGV4dCk7XG4gICAgICAgIFhtbE5vZGUucmVtb3ZlRW1wdHlUZXh0Tm9kZXMobWFya3VwWG1sKTsgLy8gcmVtb3ZlIHdoaXRlc3BhY2VcblxuICAgICAgICAvLyBjb3B5IHByb3BzIGZyb20gb3JpZ2luYWwgcnVuIG5vZGUgKHByZXNlcnZlIHN0eWxlKVxuICAgICAgICBjb25zdCBydW5Qcm9wcyA9IHdvcmRSdW5Ob2RlLmNoaWxkTm9kZXMuZmluZChub2RlID0+IG5vZGUubm9kZU5hbWUgPT09IERvY3hQYXJzZXIuUlVOX1BST1BFUlRJRVNfTk9ERSk7XG4gICAgICAgIGlmIChydW5Qcm9wcykge1xuICAgICAgICAgICAgY29uc3QgbGlua1J1blByb3BzID0gWG1sTm9kZS5jbG9uZU5vZGUocnVuUHJvcHMsIHRydWUpO1xuICAgICAgICAgICAgbWFya3VwWG1sLmNoaWxkTm9kZXNbMF0uY2hpbGROb2Rlcy51bnNoaWZ0KGxpbmtSdW5Qcm9wcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWFya3VwWG1sO1xuICAgIH1cblxuICAgIHByaXZhdGUgaW5zZXJ0SHlwZXJsaW5rTm9kZShsaW5rTWFya3VwOiBYbWxOb2RlLCB0YWdSdW5Ob2RlOiBYbWxOb2RlLCB0YWdUZXh0Tm9kZTogWG1sTm9kZSkge1xuXG4gICAgICAgIC8vIExpbmtzIGFyZSBpbnNlcnRlZCBhdCB0aGUgJ3J1bicgbGV2ZWwuXG4gICAgICAgIC8vIFRoZXJlZm9yIHdlIGlzb2xhdGUgdGhlIGxpbmsgdGFnIHRvIGl0J3Mgb3duIHJ1biAoaXQgaXMgYWxyZWFkeVxuICAgICAgICAvLyBpc29sYXRlZCB0byBpdCdzIG93biB0ZXh0IG5vZGUpLCBpbnNlcnQgdGhlIGxpbmsgbWFya3VwIGFuZCByZW1vdmVcbiAgICAgICAgLy8gdGhlIHJ1bi5cbiAgICAgICAgbGV0IHRleHROb2Rlc0luUnVuID0gdGFnUnVuTm9kZS5jaGlsZE5vZGVzLmZpbHRlcihub2RlID0+IG5vZGUubm9kZU5hbWUgPT09IERvY3hQYXJzZXIuVEVYVF9OT0RFKTtcbiAgICAgICAgaWYgKHRleHROb2Rlc0luUnVuLmxlbmd0aCA+IDEpIHtcblxuICAgICAgICAgICAgY29uc3QgW3J1bkJlZm9yZVRhZ10gPSBYbWxOb2RlLnNwbGl0QnlDaGlsZCh0YWdSdW5Ob2RlLCB0YWdUZXh0Tm9kZSwgdHJ1ZSk7XG4gICAgICAgICAgICB0ZXh0Tm9kZXNJblJ1biA9IHJ1bkJlZm9yZVRhZy5jaGlsZE5vZGVzLmZpbHRlcihub2RlID0+IG5vZGUubm9kZU5hbWUgPT09IERvY3hQYXJzZXIuVEVYVF9OT0RFKTtcblxuICAgICAgICAgICAgWG1sTm9kZS5pbnNlcnRBZnRlcihsaW5rTWFya3VwLCBydW5CZWZvcmVUYWcpO1xuICAgICAgICAgICAgaWYgKHRleHROb2Rlc0luUnVuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIFhtbE5vZGUucmVtb3ZlKHJ1bkJlZm9yZVRhZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhbHJlYWR5IGlzb2xhdGVkXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgWG1sTm9kZS5pbnNlcnRBZnRlcihsaW5rTWFya3VwLCB0YWdSdW5Ob2RlKTtcbiAgICAgICAgICAgIFhtbE5vZGUucmVtb3ZlKHRhZ1J1bk5vZGUpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgVGFnIH0gZnJvbSAnLi4vLi4vLi4vY29tcGlsYXRpb24nO1xuaW1wb3J0IHsgWG1sTm9kZSB9IGZyb20gJy4uLy4uLy4uL3htbCc7XG5pbXBvcnQgeyBQbHVnaW5VdGlsaXRpZXMgfSBmcm9tICcuLi8uLi90ZW1wbGF0ZVBsdWdpbic7XG5pbXBvcnQgeyBJTG9vcFN0cmF0ZWd5LCBTcGxpdEJlZm9yZVJlc3VsdCB9IGZyb20gJy4vaUxvb3BTdHJhdGVneSc7XG5cbmV4cG9ydCBjbGFzcyBMb29wTGlzdFN0cmF0ZWd5IGltcGxlbWVudHMgSUxvb3BTdHJhdGVneSB7XG5cbiAgICBwcml2YXRlIHV0aWxpdGllczogUGx1Z2luVXRpbGl0aWVzO1xuXG4gICAgcHVibGljIHNldFV0aWxpdGllcyh1dGlsaXRpZXM6IFBsdWdpblV0aWxpdGllcykge1xuICAgICAgICB0aGlzLnV0aWxpdGllcyA9IHV0aWxpdGllcztcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNBcHBsaWNhYmxlKG9wZW5UYWc6IFRhZywgY2xvc2VUYWc6IFRhZyk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBjb250YWluaW5nUGFyYWdyYXBoID0gdGhpcy51dGlsaXRpZXMuZG9jeFBhcnNlci5jb250YWluaW5nUGFyYWdyYXBoTm9kZShvcGVuVGFnLnhtbFRleHROb2RlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudXRpbGl0aWVzLmRvY3hQYXJzZXIuaXNMaXN0UGFyYWdyYXBoKGNvbnRhaW5pbmdQYXJhZ3JhcGgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzcGxpdEJlZm9yZShvcGVuVGFnOiBUYWcsIGNsb3NlVGFnOiBUYWcpOiBTcGxpdEJlZm9yZVJlc3VsdCB7XG5cbiAgICAgICAgY29uc3QgZmlyc3RQYXJhZ3JhcGggPSB0aGlzLnV0aWxpdGllcy5kb2N4UGFyc2VyLmNvbnRhaW5pbmdQYXJhZ3JhcGhOb2RlKG9wZW5UYWcueG1sVGV4dE5vZGUpO1xuICAgICAgICBjb25zdCBsYXN0UGFyYWdyYXBoID0gdGhpcy51dGlsaXRpZXMuZG9jeFBhcnNlci5jb250YWluaW5nUGFyYWdyYXBoTm9kZShjbG9zZVRhZy54bWxUZXh0Tm9kZSk7XG4gICAgICAgIGNvbnN0IHBhcmFncmFwaHNUb1JlcGVhdCA9IFhtbE5vZGUuc2libGluZ3NJblJhbmdlKGZpcnN0UGFyYWdyYXBoLCBsYXN0UGFyYWdyYXBoKTtcblxuICAgICAgICAvLyByZW1vdmUgdGhlIGxvb3AgdGFnc1xuICAgICAgICBYbWxOb2RlLnJlbW92ZShvcGVuVGFnLnhtbFRleHROb2RlKTtcbiAgICAgICAgWG1sTm9kZS5yZW1vdmUoY2xvc2VUYWcueG1sVGV4dE5vZGUpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmaXJzdE5vZGU6IGZpcnN0UGFyYWdyYXBoLFxuICAgICAgICAgICAgbm9kZXNUb1JlcGVhdDogcGFyYWdyYXBoc1RvUmVwZWF0LFxuICAgICAgICAgICAgbGFzdE5vZGU6IGxhc3RQYXJhZ3JhcGhcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbWVyZ2VCYWNrKHBhcmFncmFwaEdyb3VwczogWG1sTm9kZVtdW10sIGZpcnN0UGFyYWdyYXBoOiBYbWxOb2RlLCBsYXN0UGFyYWdyYXBoczogWG1sTm9kZSk6IHZvaWQge1xuXG4gICAgICAgIGZvciAoY29uc3QgY3VyUGFyYWdyYXBoc0dyb3VwIG9mIHBhcmFncmFwaEdyb3Vwcykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBwYXJhZ3JhcGggb2YgY3VyUGFyYWdyYXBoc0dyb3VwKSB7XG4gICAgICAgICAgICAgICAgWG1sTm9kZS5pbnNlcnRCZWZvcmUocGFyYWdyYXBoLCBsYXN0UGFyYWdyYXBocyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZW1vdmUgdGhlIG9sZCBwYXJhZ3JhcGhzXG4gICAgICAgIFhtbE5vZGUucmVtb3ZlKGZpcnN0UGFyYWdyYXBoKTtcbiAgICAgICAgaWYgKGZpcnN0UGFyYWdyYXBoICE9PSBsYXN0UGFyYWdyYXBocykge1xuICAgICAgICAgICAgWG1sTm9kZS5yZW1vdmUobGFzdFBhcmFncmFwaHMpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgVGFnIH0gZnJvbSAnLi4vLi4vLi4vY29tcGlsYXRpb24nO1xuaW1wb3J0IHsgWG1sTm9kZSB9IGZyb20gJy4uLy4uLy4uL3htbCc7XG5pbXBvcnQgeyBQbHVnaW5VdGlsaXRpZXMgfSBmcm9tICcuLi8uLi90ZW1wbGF0ZVBsdWdpbic7XG5pbXBvcnQgeyBJTG9vcFN0cmF0ZWd5LCBTcGxpdEJlZm9yZVJlc3VsdCB9IGZyb20gJy4vaUxvb3BTdHJhdGVneSc7XG5cbmV4cG9ydCBjbGFzcyBMb29wUGFyYWdyYXBoU3RyYXRlZ3kgaW1wbGVtZW50cyBJTG9vcFN0cmF0ZWd5IHtcblxuICAgIHByaXZhdGUgdXRpbGl0aWVzOiBQbHVnaW5VdGlsaXRpZXM7XG5cbiAgICBwdWJsaWMgc2V0VXRpbGl0aWVzKHV0aWxpdGllczogUGx1Z2luVXRpbGl0aWVzKSB7XG4gICAgICAgIHRoaXMudXRpbGl0aWVzID0gdXRpbGl0aWVzO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc0FwcGxpY2FibGUob3BlblRhZzogVGFnLCBjbG9zZVRhZzogVGFnKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzcGxpdEJlZm9yZShvcGVuVGFnOiBUYWcsIGNsb3NlVGFnOiBUYWcpOiBTcGxpdEJlZm9yZVJlc3VsdCB7XG5cbiAgICAgICAgLy8gZ2F0aGVyIHNvbWUgaW5mb1xuICAgICAgICBsZXQgZmlyc3RQYXJhZ3JhcGggPSB0aGlzLnV0aWxpdGllcy5kb2N4UGFyc2VyLmNvbnRhaW5pbmdQYXJhZ3JhcGhOb2RlKG9wZW5UYWcueG1sVGV4dE5vZGUpO1xuICAgICAgICBsZXQgbGFzdFBhcmFncmFwaCA9IHRoaXMudXRpbGl0aWVzLmRvY3hQYXJzZXIuY29udGFpbmluZ1BhcmFncmFwaE5vZGUoY2xvc2VUYWcueG1sVGV4dE5vZGUpO1xuICAgICAgICBjb25zdCBhcmVTYW1lID0gKGZpcnN0UGFyYWdyYXBoID09PSBsYXN0UGFyYWdyYXBoKTtcblxuICAgICAgICAvLyBzcGxpdCBmaXJzdCBwYXJhZ3JhcGhcbiAgICAgICAgbGV0IHNwbGl0UmVzdWx0ID0gdGhpcy51dGlsaXRpZXMuZG9jeFBhcnNlci5zcGxpdFBhcmFncmFwaEJ5VGV4dE5vZGUoZmlyc3RQYXJhZ3JhcGgsIG9wZW5UYWcueG1sVGV4dE5vZGUsIHRydWUpO1xuICAgICAgICBmaXJzdFBhcmFncmFwaCA9IHNwbGl0UmVzdWx0WzBdO1xuICAgICAgICBsZXQgYWZ0ZXJGaXJzdFBhcmFncmFwaCA9IHNwbGl0UmVzdWx0WzFdO1xuICAgICAgICBpZiAoYXJlU2FtZSlcbiAgICAgICAgICAgIGxhc3RQYXJhZ3JhcGggPSBhZnRlckZpcnN0UGFyYWdyYXBoO1xuXG4gICAgICAgIC8vIHNwbGl0IGxhc3QgcGFyYWdyYXBoXG4gICAgICAgIHNwbGl0UmVzdWx0ID0gdGhpcy51dGlsaXRpZXMuZG9jeFBhcnNlci5zcGxpdFBhcmFncmFwaEJ5VGV4dE5vZGUobGFzdFBhcmFncmFwaCwgY2xvc2VUYWcueG1sVGV4dE5vZGUsIHRydWUpO1xuICAgICAgICBjb25zdCBiZWZvcmVMYXN0UGFyYWdyYXBoID0gc3BsaXRSZXN1bHRbMF07XG4gICAgICAgIGxhc3RQYXJhZ3JhcGggPSBzcGxpdFJlc3VsdFsxXTtcbiAgICAgICAgaWYgKGFyZVNhbWUpXG4gICAgICAgICAgICBhZnRlckZpcnN0UGFyYWdyYXBoID0gYmVmb3JlTGFzdFBhcmFncmFwaDtcblxuICAgICAgICAvLyBkaXNjb25uZWN0IHNwbGl0dGVkIHBhcmFncmFwaCBmcm9tIHRoZWlyIHBhcmVudHNcbiAgICAgICAgWG1sTm9kZS5yZW1vdmUoYWZ0ZXJGaXJzdFBhcmFncmFwaCk7XG4gICAgICAgIGlmICghYXJlU2FtZSlcbiAgICAgICAgICAgIFhtbE5vZGUucmVtb3ZlKGJlZm9yZUxhc3RQYXJhZ3JhcGgpO1xuXG4gICAgICAgIC8vIGV4dHJhY3QgYWxsIHBhcmFncmFwaHMgaW4gYmV0d2VlblxuICAgICAgICBsZXQgbWlkZGxlUGFyYWdyYXBoczogWG1sTm9kZVtdO1xuICAgICAgICBpZiAoYXJlU2FtZSkge1xuICAgICAgICAgICAgbWlkZGxlUGFyYWdyYXBocyA9IFthZnRlckZpcnN0UGFyYWdyYXBoXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGluQmV0d2VlbiA9IFhtbE5vZGUucmVtb3ZlU2libGluZ3MoZmlyc3RQYXJhZ3JhcGgsIGxhc3RQYXJhZ3JhcGgpO1xuICAgICAgICAgICAgbWlkZGxlUGFyYWdyYXBocyA9IFthZnRlckZpcnN0UGFyYWdyYXBoXS5jb25jYXQoaW5CZXR3ZWVuKS5jb25jYXQoYmVmb3JlTGFzdFBhcmFncmFwaCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmlyc3ROb2RlOiBmaXJzdFBhcmFncmFwaCxcbiAgICAgICAgICAgIG5vZGVzVG9SZXBlYXQ6IG1pZGRsZVBhcmFncmFwaHMsXG4gICAgICAgICAgICBsYXN0Tm9kZTogbGFzdFBhcmFncmFwaFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBtZXJnZUJhY2sobWlkZGxlUGFyYWdyYXBoczogWG1sTm9kZVtdW10sIGZpcnN0UGFyYWdyYXBoOiBYbWxOb2RlLCBsYXN0UGFyYWdyYXBoOiBYbWxOb2RlKTogdm9pZCB7XG5cbiAgICAgICAgbGV0IG1lcmdlVG8gPSBmaXJzdFBhcmFncmFwaDtcbiAgICAgICAgZm9yIChjb25zdCBjdXJQYXJhZ3JhcGhzR3JvdXAgb2YgbWlkZGxlUGFyYWdyYXBocykge1xuXG4gICAgICAgICAgICAvLyBtZXJnZSBmaXJzdCBwYXJhZ3JhcGhzXG4gICAgICAgICAgICB0aGlzLnV0aWxpdGllcy5kb2N4UGFyc2VyLmpvaW5QYXJhZ3JhcGhzKG1lcmdlVG8sIGN1clBhcmFncmFwaHNHcm91cFswXSk7XG5cbiAgICAgICAgICAgIC8vIGFkZCBtaWRkbGUgYW5kIGxhc3QgcGFyYWdyYXBocyB0byB0aGUgb3JpZ2luYWwgZG9jdW1lbnRcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgY3VyUGFyYWdyYXBoc0dyb3VwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgWG1sTm9kZS5pbnNlcnRCZWZvcmUoY3VyUGFyYWdyYXBoc0dyb3VwW2ldLCBsYXN0UGFyYWdyYXBoKTtcbiAgICAgICAgICAgICAgICBtZXJnZVRvID0gY3VyUGFyYWdyYXBoc0dyb3VwW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWVyZ2UgbGFzdCBwYXJhZ3JhcGhcbiAgICAgICAgdGhpcy51dGlsaXRpZXMuZG9jeFBhcnNlci5qb2luUGFyYWdyYXBocyhtZXJnZVRvLCBsYXN0UGFyYWdyYXBoKTtcblxuICAgICAgICAvLyByZW1vdmUgdGhlIG9sZCBsYXN0IHBhcmFncmFwaCAod2FzIG1lcmdlZCBpbnRvIHRoZSBuZXcgb25lKVxuICAgICAgICBYbWxOb2RlLnJlbW92ZShsYXN0UGFyYWdyYXBoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBUYWcgfSBmcm9tICcuLi8uLi8uLi9jb21waWxhdGlvbic7XG5pbXBvcnQgeyBYbWxOb2RlIH0gZnJvbSAnLi4vLi4vLi4veG1sJztcbmltcG9ydCB7IFBsdWdpblV0aWxpdGllcyB9IGZyb20gJy4uLy4uL3RlbXBsYXRlUGx1Z2luJztcbmltcG9ydCB7IElMb29wU3RyYXRlZ3ksIFNwbGl0QmVmb3JlUmVzdWx0IH0gZnJvbSAnLi9pTG9vcFN0cmF0ZWd5JztcblxuZXhwb3J0IGNsYXNzIExvb3BUYWJsZVN0cmF0ZWd5IGltcGxlbWVudHMgSUxvb3BTdHJhdGVneSB7XG5cbiAgICBwcml2YXRlIHV0aWxpdGllczogUGx1Z2luVXRpbGl0aWVzO1xuXG4gICAgcHVibGljIHNldFV0aWxpdGllcyh1dGlsaXRpZXM6IFBsdWdpblV0aWxpdGllcykge1xuICAgICAgICB0aGlzLnV0aWxpdGllcyA9IHV0aWxpdGllcztcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNBcHBsaWNhYmxlKG9wZW5UYWc6IFRhZywgY2xvc2VUYWc6IFRhZyk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBjb250YWluaW5nUGFyYWdyYXBoID0gdGhpcy51dGlsaXRpZXMuZG9jeFBhcnNlci5jb250YWluaW5nUGFyYWdyYXBoTm9kZShvcGVuVGFnLnhtbFRleHROb2RlKTtcbiAgICAgICAgaWYgKCFjb250YWluaW5nUGFyYWdyYXBoLnBhcmVudE5vZGUpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLnV0aWxpdGllcy5kb2N4UGFyc2VyLmlzVGFibGVDZWxsTm9kZShjb250YWluaW5nUGFyYWdyYXBoLnBhcmVudE5vZGUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzcGxpdEJlZm9yZShvcGVuVGFnOiBUYWcsIGNsb3NlVGFnOiBUYWcpOiBTcGxpdEJlZm9yZVJlc3VsdCB7XG5cbiAgICAgICAgY29uc3QgZmlyc3RSb3cgPSB0aGlzLnV0aWxpdGllcy5kb2N4UGFyc2VyLmNvbnRhaW5pbmdUYWJsZVJvd05vZGUob3BlblRhZy54bWxUZXh0Tm9kZSk7XG4gICAgICAgIGNvbnN0IGxhc3RSb3cgPSB0aGlzLnV0aWxpdGllcy5kb2N4UGFyc2VyLmNvbnRhaW5pbmdUYWJsZVJvd05vZGUoY2xvc2VUYWcueG1sVGV4dE5vZGUpO1xuICAgICAgICBjb25zdCByb3dzVG9SZXBlYXQgPSBYbWxOb2RlLnNpYmxpbmdzSW5SYW5nZShmaXJzdFJvdywgbGFzdFJvdyk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBsb29wIHRhZ3NcbiAgICAgICAgWG1sTm9kZS5yZW1vdmUob3BlblRhZy54bWxUZXh0Tm9kZSk7XG4gICAgICAgIFhtbE5vZGUucmVtb3ZlKGNsb3NlVGFnLnhtbFRleHROb2RlKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmlyc3ROb2RlOiBmaXJzdFJvdyxcbiAgICAgICAgICAgIG5vZGVzVG9SZXBlYXQ6IHJvd3NUb1JlcGVhdCxcbiAgICAgICAgICAgIGxhc3ROb2RlOiBsYXN0Um93XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIG1lcmdlQmFjayhyb3dHcm91cHM6IFhtbE5vZGVbXVtdLCBmaXJzdFJvdzogWG1sTm9kZSwgbGFzdFJvdzogWG1sTm9kZSk6IHZvaWQge1xuXG4gICAgICAgIGZvciAoY29uc3QgY3VyUm93c0dyb3VwIG9mIHJvd0dyb3Vwcykge1xuICAgICAgICAgICAgZm9yIChjb25zdCByb3cgb2YgY3VyUm93c0dyb3VwKSB7XG4gICAgICAgICAgICAgICAgWG1sTm9kZS5pbnNlcnRCZWZvcmUocm93LCBsYXN0Um93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlbW92ZSB0aGUgb2xkIHJvd3NcbiAgICAgICAgWG1sTm9kZS5yZW1vdmUoZmlyc3RSb3cpO1xuICAgICAgICBpZiAoZmlyc3RSb3cgIT09IGxhc3RSb3cpIHtcbiAgICAgICAgICAgIFhtbE5vZGUucmVtb3ZlKGxhc3RSb3cpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgU2NvcGVEYXRhLCBUYWcsIFRlbXBsYXRlQ29udGV4dCB9IGZyb20gJy4uLy4uL2NvbXBpbGF0aW9uJztcbmltcG9ydCB7IFRlbXBsYXRlRGF0YSB9IGZyb20gJy4uLy4uL3RlbXBsYXRlRGF0YSc7XG5pbXBvcnQgeyBsYXN0IH0gZnJvbSAnLi4vLi4vdXRpbHMnO1xuaW1wb3J0IHsgWG1sTm9kZSB9IGZyb20gJy4uLy4uL3htbCc7XG5pbXBvcnQgeyBQbHVnaW5VdGlsaXRpZXMsIFRlbXBsYXRlUGx1Z2luIH0gZnJvbSAnLi4vdGVtcGxhdGVQbHVnaW4nO1xuaW1wb3J0IHsgSUxvb3BTdHJhdGVneSwgTG9vcExpc3RTdHJhdGVneSwgTG9vcFBhcmFncmFwaFN0cmF0ZWd5LCBMb29wVGFibGVTdHJhdGVneSB9IGZyb20gJy4vc3RyYXRlZ3knO1xuXG5leHBvcnQgY29uc3QgTE9PUF9DT05URU5UX1RZUEUgPSAnbG9vcCc7XG5cbmV4cG9ydCBjbGFzcyBMb29wUGx1Z2luIGV4dGVuZHMgVGVtcGxhdGVQbHVnaW4ge1xuXG4gICAgcHVibGljIHJlYWRvbmx5IGNvbnRlbnRUeXBlID0gTE9PUF9DT05URU5UX1RZUEU7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvb3BTdHJhdGVnaWVzOiBJTG9vcFN0cmF0ZWd5W10gPSBbXG4gICAgICAgIG5ldyBMb29wVGFibGVTdHJhdGVneSgpLFxuICAgICAgICBuZXcgTG9vcExpc3RTdHJhdGVneSgpLFxuICAgICAgICBuZXcgTG9vcFBhcmFncmFwaFN0cmF0ZWd5KCkgLy8gdGhlIGRlZmF1bHQgc3RyYXRlZ3lcbiAgICBdO1xuXG4gICAgcHVibGljIHNldFV0aWxpdGllcyh1dGlsaXRpZXM6IFBsdWdpblV0aWxpdGllcykge1xuICAgICAgICB0aGlzLnV0aWxpdGllcyA9IHV0aWxpdGllcztcbiAgICAgICAgdGhpcy5sb29wU3RyYXRlZ2llcy5mb3JFYWNoKHN0cmF0ZWd5ID0+IHN0cmF0ZWd5LnNldFV0aWxpdGllcyh1dGlsaXRpZXMpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgY29udGFpbmVyVGFnUmVwbGFjZW1lbnRzKHRhZ3M6IFRhZ1tdLCBkYXRhOiBTY29wZURhdGEsIGNvbnRleHQ6IFRlbXBsYXRlQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuXG4gICAgICAgIGxldCB2YWx1ZSA9IGRhdGEuZ2V0U2NvcGVEYXRhPFRlbXBsYXRlRGF0YVtdPigpO1xuXG4gICAgICAgIGlmICghdmFsdWUgfHwgIUFycmF5LmlzQXJyYXkodmFsdWUpIHx8ICF2YWx1ZS5sZW5ndGgpXG4gICAgICAgICAgICB2YWx1ZSA9IFtdO1xuXG4gICAgICAgIC8vIHZhcnNcbiAgICAgICAgY29uc3Qgb3BlblRhZyA9IHRhZ3NbMF07XG4gICAgICAgIGNvbnN0IGNsb3NlVGFnID0gbGFzdCh0YWdzKTtcblxuICAgICAgICAvLyBzZWxlY3QgdGhlIHN1aXRhYmxlIHN0cmF0ZWd5XG4gICAgICAgIGNvbnN0IGxvb3BTdHJhdGVneSA9IHRoaXMubG9vcFN0cmF0ZWdpZXMuZmluZChzdHJhdGVneSA9PiBzdHJhdGVneS5pc0FwcGxpY2FibGUob3BlblRhZywgY2xvc2VUYWcpKTtcbiAgICAgICAgaWYgKCFsb29wU3RyYXRlZ3kpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIGxvb3Agc3RyYXRlZ3kgZm91bmQgZm9yIHRhZyAnJHtvcGVuVGFnLnJhd1RleHR9Jy5gKTtcblxuICAgICAgICAvLyBwcmVwYXJlIHRvIGxvb3BcbiAgICAgICAgY29uc3QgeyBmaXJzdE5vZGUsIG5vZGVzVG9SZXBlYXQsIGxhc3ROb2RlIH0gPSBsb29wU3RyYXRlZ3kuc3BsaXRCZWZvcmUob3BlblRhZywgY2xvc2VUYWcpO1xuXG4gICAgICAgIC8vIHJlcGVhdCAobG9vcCkgdGhlIGNvbnRlbnRcbiAgICAgICAgY29uc3QgcmVwZWF0ZWROb2RlcyA9IHRoaXMucmVwZWF0KG5vZGVzVG9SZXBlYXQsIHZhbHVlLmxlbmd0aCk7XG5cbiAgICAgICAgLy8gcmVjdXJzaXZlIGNvbXBpbGF0aW9uXG4gICAgICAgIC8vICh0aGlzIHN0ZXAgY2FuIGJlIG9wdGltaXplZCBpbiB0aGUgZnV0dXJlIGlmIHdlJ2xsIGtlZXAgdHJhY2sgb2YgdGhlXG4gICAgICAgIC8vIHBhdGggdG8gZWFjaCB0b2tlbiBhbmQgdXNlIHRoYXQgdG8gY3JlYXRlIG5ldyB0b2tlbnMgaW5zdGVhZCBvZlxuICAgICAgICAvLyBzZWFyY2ggdGhyb3VnaCB0aGUgdGV4dCBhZ2FpbilcbiAgICAgICAgY29uc3QgY29tcGlsZWROb2RlcyA9IGF3YWl0IHRoaXMuY29tcGlsZShyZXBlYXRlZE5vZGVzLCBkYXRhLCBjb250ZXh0KTtcblxuICAgICAgICAvLyBtZXJnZSBiYWNrIHRvIHRoZSBkb2N1bWVudFxuICAgICAgICBsb29wU3RyYXRlZ3kubWVyZ2VCYWNrKGNvbXBpbGVkTm9kZXMsIGZpcnN0Tm9kZSwgbGFzdE5vZGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVwZWF0KG5vZGVzOiBYbWxOb2RlW10sIHRpbWVzOiBudW1iZXIpOiBYbWxOb2RlW11bXSB7XG4gICAgICAgIGlmICghbm9kZXMubGVuZ3RoIHx8ICF0aW1lcylcbiAgICAgICAgICAgIHJldHVybiBbXTtcblxuICAgICAgICBjb25zdCBhbGxSZXN1bHRzOiBYbWxOb2RlW11bXSA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGltZXM7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY3VyUmVzdWx0ID0gbm9kZXMubWFwKG5vZGUgPT4gWG1sTm9kZS5jbG9uZU5vZGUobm9kZSwgdHJ1ZSkpO1xuICAgICAgICAgICAgYWxsUmVzdWx0cy5wdXNoKGN1clJlc3VsdCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYWxsUmVzdWx0cztcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNvbXBpbGUobm9kZUdyb3VwczogWG1sTm9kZVtdW10sIGRhdGE6IFNjb3BlRGF0YSwgY29udGV4dDogVGVtcGxhdGVDb250ZXh0KTogUHJvbWlzZTxYbWxOb2RlW11bXT4ge1xuICAgICAgICBjb25zdCBjb21waWxlZE5vZGVHcm91cHM6IFhtbE5vZGVbXVtdID0gW107XG5cbiAgICAgICAgLy8gY29tcGlsZSBlYWNoIG5vZGUgZ3JvdXAgd2l0aCBpdCdzIHJlbGV2YW50IGRhdGFcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlR3JvdXBzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBkdW1teSByb290IG5vZGVcbiAgICAgICAgICAgIGNvbnN0IGN1ck5vZGVzID0gbm9kZUdyb3Vwc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IGR1bW15Um9vdE5vZGUgPSBYbWxOb2RlLmNyZWF0ZUdlbmVyYWxOb2RlKCdkdW1teVJvb3ROb2RlJyk7XG4gICAgICAgICAgICBjdXJOb2Rlcy5mb3JFYWNoKG5vZGUgPT4gWG1sTm9kZS5hcHBlbmRDaGlsZChkdW1teVJvb3ROb2RlLCBub2RlKSk7XG5cbiAgICAgICAgICAgIC8vIGNvbXBpbGUgdGhlIG5ldyByb290XG4gICAgICAgICAgICBkYXRhLnBhdGgucHVzaChpKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMudXRpbGl0aWVzLmNvbXBpbGVyLmNvbXBpbGUoZHVtbXlSb290Tm9kZSwgZGF0YSwgY29udGV4dCk7XG4gICAgICAgICAgICBkYXRhLnBhdGgucG9wKCk7XG5cbiAgICAgICAgICAgIC8vIGRpc2Nvbm5lY3QgZnJvbSBkdW1teSByb290XG4gICAgICAgICAgICBjb25zdCBjdXJSZXN1bHQ6IFhtbE5vZGVbXSA9IFtdO1xuICAgICAgICAgICAgd2hpbGUgKGR1bW15Um9vdE5vZGUuY2hpbGROb2RlcyAmJiBkdW1teVJvb3ROb2RlLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBYbWxOb2RlLnJlbW92ZUNoaWxkKGR1bW15Um9vdE5vZGUsIDApO1xuICAgICAgICAgICAgICAgIGN1clJlc3VsdC5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBpbGVkTm9kZUdyb3Vwcy5wdXNoKGN1clJlc3VsdCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29tcGlsZWROb2RlR3JvdXBzO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFNjb3BlRGF0YSwgVGFnIH0gZnJvbSAnLi4vLi4vY29tcGlsYXRpb24nO1xuaW1wb3J0IHsgWG1sTm9kZSB9IGZyb20gJy4uLy4uL3htbCc7XG5pbXBvcnQgeyBUZW1wbGF0ZVBsdWdpbiB9IGZyb20gJy4uL3RlbXBsYXRlUGx1Z2luJztcbmltcG9ydCB7IFJhd1htbENvbnRlbnQgfSBmcm9tICcuL3Jhd1htbENvbnRlbnQnO1xuXG5leHBvcnQgY2xhc3MgUmF3WG1sUGx1Z2luIGV4dGVuZHMgVGVtcGxhdGVQbHVnaW4ge1xuXG4gICAgcHVibGljIHJlYWRvbmx5IGNvbnRlbnRUeXBlID0gJ3Jhd1htbCc7XG5cbiAgICBwdWJsaWMgc2ltcGxlVGFnUmVwbGFjZW1lbnRzKHRhZzogVGFnLCBkYXRhOiBTY29wZURhdGEpOiB2b2lkIHtcblxuICAgICAgICBjb25zdCB2YWx1ZSA9IGRhdGEuZ2V0U2NvcGVEYXRhPFJhd1htbENvbnRlbnQ+KCk7XG5cbiAgICAgICAgY29uc3QgcmVwbGFjZU5vZGUgPSB2YWx1ZT8ucmVwbGFjZVBhcmFncmFwaCA/XG4gICAgICAgICAgICB0aGlzLnV0aWxpdGllcy5kb2N4UGFyc2VyLmNvbnRhaW5pbmdQYXJhZ3JhcGhOb2RlKHRhZy54bWxUZXh0Tm9kZSkgOlxuICAgICAgICAgICAgdGhpcy51dGlsaXRpZXMuZG9jeFBhcnNlci5jb250YWluaW5nVGV4dE5vZGUodGFnLnhtbFRleHROb2RlKTtcblxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlPy54bWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdOb2RlID0gdGhpcy51dGlsaXRpZXMueG1sUGFyc2VyLnBhcnNlKHZhbHVlLnhtbCk7XG4gICAgICAgICAgICBYbWxOb2RlLmluc2VydEJlZm9yZShuZXdOb2RlLCByZXBsYWNlTm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICBYbWxOb2RlLnJlbW92ZShyZXBsYWNlTm9kZSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgU2NvcGVEYXRhLCBUYWcgfSBmcm9tICcuLi8uLi9jb21waWxhdGlvbic7XG5pbXBvcnQgeyBEb2N4UGFyc2VyIH0gZnJvbSAnLi4vLi4vb2ZmaWNlJztcbmltcG9ydCB7IFhtbE5vZGUsIFhtbFRleHROb2RlIH0gZnJvbSAnLi4vLi4veG1sJztcbmltcG9ydCB7IFRlbXBsYXRlUGx1Z2luIH0gZnJvbSAnLi4vdGVtcGxhdGVQbHVnaW4nO1xuXG5leHBvcnQgY29uc3QgVEVYVF9DT05URU5UX1RZUEUgPSAndGV4dCc7XG5cbmV4cG9ydCBjbGFzcyBUZXh0UGx1Z2luIGV4dGVuZHMgVGVtcGxhdGVQbHVnaW4ge1xuXG4gICAgcHVibGljIHJlYWRvbmx5IGNvbnRlbnRUeXBlID0gVEVYVF9DT05URU5UX1RZUEU7XG5cbiAgICAvKipcbiAgICAgKiBSZXBsYWNlIHRoZSBub2RlIHRleHQgY29udGVudCB3aXRoIHRoZSBzcGVjaWZpZWQgdmFsdWUuXG4gICAgICovXG4gICAgcHVibGljIHNpbXBsZVRhZ1JlcGxhY2VtZW50cyh0YWc6IFRhZywgZGF0YTogU2NvcGVEYXRhKTogdm9pZCB7XG5cbiAgICAgICAgY29uc3QgdmFsdWUgPSBkYXRhLmdldFNjb3BlRGF0YSgpO1xuICAgICAgICBjb25zdCBzdHJpbmdWYWx1ZSA9ICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSA/ICcnIDogdmFsdWUudG9TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgbGluZXMgPSBzdHJpbmdWYWx1ZS5zcGxpdCgnXFxuJyk7XG5cbiAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgIHRoaXMucmVwbGFjZVNpbmdsZUxpbmUodGFnLnhtbFRleHROb2RlLCBsaW5lcy5sZW5ndGggPyBsaW5lc1swXSA6ICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVwbGFjZU11bHRpTGluZSh0YWcueG1sVGV4dE5vZGUsIGxpbmVzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVwbGFjZVNpbmdsZUxpbmUodGV4dE5vZGU6IFhtbFRleHROb2RlLCB0ZXh0OiBzdHJpbmcpIHtcblxuICAgICAgICAvLyBzZXQgdGV4dFxuICAgICAgICB0ZXh0Tm9kZS50ZXh0Q29udGVudCA9IHRleHQ7XG5cbiAgICAgICAgLy8gbWFrZSBzdXJlIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UgYXJlIHByZXNlcnZlZFxuICAgICAgICBjb25zdCB3b3JkVGV4dE5vZGUgPSB0aGlzLnV0aWxpdGllcy5kb2N4UGFyc2VyLmNvbnRhaW5pbmdUZXh0Tm9kZSh0ZXh0Tm9kZSk7XG4gICAgICAgIHRoaXMudXRpbGl0aWVzLmRvY3hQYXJzZXIuc2V0U3BhY2VQcmVzZXJ2ZUF0dHJpYnV0ZSh3b3JkVGV4dE5vZGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVwbGFjZU11bHRpTGluZSh0ZXh0Tm9kZTogWG1sVGV4dE5vZGUsIGxpbmVzOiBzdHJpbmdbXSkge1xuXG4gICAgICAgIGNvbnN0IHJ1bk5vZGUgPSB0aGlzLnV0aWxpdGllcy5kb2N4UGFyc2VyLmNvbnRhaW5pbmdSdW5Ob2RlKHRleHROb2RlKTtcblxuICAgICAgICAvLyBmaXJzdCBsaW5lXG4gICAgICAgIHRleHROb2RlLnRleHRDb250ZW50ID0gbGluZXNbMF07XG5cbiAgICAgICAgLy8gb3RoZXIgbGluZXNcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAvLyBhZGQgbGluZSBicmVha1xuICAgICAgICAgICAgY29uc3QgbGluZUJyZWFrID0gdGhpcy5nZXRMaW5lQnJlYWsoKTtcbiAgICAgICAgICAgIFhtbE5vZGUuYXBwZW5kQ2hpbGQocnVuTm9kZSwgbGluZUJyZWFrKTtcblxuICAgICAgICAgICAgLy8gYWRkIHRleHRcbiAgICAgICAgICAgIGNvbnN0IGxpbmVOb2RlID0gdGhpcy5jcmVhdGVXb3JkVGV4dE5vZGUobGluZXNbaV0pO1xuICAgICAgICAgICAgWG1sTm9kZS5hcHBlbmRDaGlsZChydW5Ob2RlLCBsaW5lTm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldExpbmVCcmVhaygpOiBYbWxOb2RlIHtcbiAgICAgICAgcmV0dXJuIFhtbE5vZGUuY3JlYXRlR2VuZXJhbE5vZGUoJ3c6YnInKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVdvcmRUZXh0Tm9kZSh0ZXh0OiBzdHJpbmcpOiBYbWxOb2RlIHtcbiAgICAgICAgY29uc3Qgd29yZFRleHROb2RlID0gWG1sTm9kZS5jcmVhdGVHZW5lcmFsTm9kZShEb2N4UGFyc2VyLlRFWFRfTk9ERSk7XG5cbiAgICAgICAgd29yZFRleHROb2RlLmF0dHJpYnV0ZXMgPSB7fTtcbiAgICAgICAgdGhpcy51dGlsaXRpZXMuZG9jeFBhcnNlci5zZXRTcGFjZVByZXNlcnZlQXR0cmlidXRlKHdvcmRUZXh0Tm9kZSk7XG5cbiAgICAgICAgd29yZFRleHROb2RlLmNoaWxkTm9kZXMgPSBbXG4gICAgICAgICAgICBYbWxOb2RlLmNyZWF0ZVRleHROb2RlKHRleHQpXG4gICAgICAgIF07XG5cbiAgICAgICAgcmV0dXJuIHdvcmRUZXh0Tm9kZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBJbWFnZVBsdWdpbiB9IGZyb20gJy4vaW1hZ2UnO1xuaW1wb3J0IHsgTGlua1BsdWdpbiB9IGZyb20gJy4vbGluayc7XG5pbXBvcnQgeyBMb29wUGx1Z2luIH0gZnJvbSAnLi9sb29wJztcbmltcG9ydCB7IFJhd1htbFBsdWdpbiB9IGZyb20gJy4vcmF3WG1sJztcbmltcG9ydCB7IFRlbXBsYXRlUGx1Z2luIH0gZnJvbSAnLi90ZW1wbGF0ZVBsdWdpbic7XG5pbXBvcnQgeyBUZXh0UGx1Z2luIH0gZnJvbSAnLi90ZXh0JztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlZmF1bHRQbHVnaW5zKCk6IFRlbXBsYXRlUGx1Z2luW10ge1xuICAgIHJldHVybiBbXG4gICAgICAgIG5ldyBMb29wUGx1Z2luKCksXG4gICAgICAgIG5ldyBSYXdYbWxQbHVnaW4oKSxcbiAgICAgICAgbmV3IEltYWdlUGx1Z2luKCksXG4gICAgICAgIG5ldyBMaW5rUGx1Z2luKCksXG4gICAgICAgIG5ldyBUZXh0UGx1Z2luKClcbiAgICBdO1xufVxuIiwiXG5leHBvcnQgaW50ZXJmYWNlIFBsdWdpbkNvbnRlbnQge1xuICAgIF90eXBlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBQbHVnaW5Db250ZW50ID0ge1xuICAgIGlzUGx1Z2luQ29udGVudChjb250ZW50OiBhbnkpOiBjb250ZW50IGlzIFBsdWdpbkNvbnRlbnQge1xuICAgICAgICByZXR1cm4gISFjb250ZW50ICYmIHR5cGVvZiBjb250ZW50Ll90eXBlID09PSAnc3RyaW5nJztcbiAgICB9XG59OyIsImltcG9ydCB7IFVuY2xvc2VkVGFnRXJyb3IsIFVua25vd25Db250ZW50VHlwZUVycm9yIH0gZnJvbSAnLi4vZXJyb3JzJztcbmltcG9ydCB7IFBsdWdpbkNvbnRlbnQsIFRlbXBsYXRlUGx1Z2luIH0gZnJvbSAnLi4vcGx1Z2lucyc7XG5pbXBvcnQgeyBJTWFwIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgaXNQcm9taXNlTGlrZSwgdG9EaWN0aW9uYXJ5IH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgWG1sTm9kZSB9IGZyb20gJy4uL3htbCc7XG5pbXBvcnQgeyBEZWxpbWl0ZXJTZWFyY2hlciB9IGZyb20gJy4vZGVsaW1pdGVyU2VhcmNoZXInO1xuaW1wb3J0IHsgU2NvcGVEYXRhIH0gZnJvbSAnLi9zY29wZURhdGEnO1xuaW1wb3J0IHsgVGFnLCBUYWdEaXNwb3NpdGlvbiB9IGZyb20gJy4vdGFnJztcbmltcG9ydCB7IFRhZ1BhcnNlciB9IGZyb20gJy4vdGFnUGFyc2VyJztcbmltcG9ydCB7IFRlbXBsYXRlQ29udGV4dCB9IGZyb20gJy4vdGVtcGxhdGVDb250ZXh0JztcblxuLyoqXG4gKiBUaGUgVGVtcGxhdGVDb21waWxlciB3b3JrcyByb3VnaGx5IHRoZSBzYW1lIHdheSBhcyBhIHNvdXJjZSBjb2RlIGNvbXBpbGVyLlxuICogSXQncyBtYWluIHN0ZXBzIGFyZTpcbiAqXG4gKiAxLiBmaW5kIGRlbGltaXRlcnMgKGxleGljYWwgYW5hbHlzaXMpIDo6IChEb2N1bWVudCkgPT4gRGVsaW1pdGVyTWFya1tdXG4gKiAyLiBleHRyYWN0IHRhZ3MgKHN5bnRheCBhbmFseXNpcykgOjogKERlbGltaXRlck1hcmtbXSkgPT4gVGFnW11cbiAqIDMuIHBlcmZvcm0gZG9jdW1lbnQgcmVwbGFjZSAoY29kZSBnZW5lcmF0aW9uKSA6OiAoVGFnW10sIGRhdGEpID0+IERvY3VtZW50KlxuICpcbiAqIHNlZTogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ29tcGlsZXJcbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlQ29tcGlsZXIge1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBwbHVnaW5zTG9va3VwOiBJTWFwPFRlbXBsYXRlUGx1Z2luPjtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGRlbGltaXRlclNlYXJjaGVyOiBEZWxpbWl0ZXJTZWFyY2hlcixcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSB0YWdQYXJzZXI6IFRhZ1BhcnNlcixcbiAgICAgICAgcGx1Z2luczogVGVtcGxhdGVQbHVnaW5bXSxcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBkZWZhdWx0Q29udGVudFR5cGU6IHN0cmluZyxcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBjb250YWluZXJDb250ZW50VHlwZTogc3RyaW5nXG4gICAgKSB7XG4gICAgICAgIHRoaXMucGx1Z2luc0xvb2t1cCA9IHRvRGljdGlvbmFyeShwbHVnaW5zLCBwID0+IHAuY29udGVudFR5cGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBpbGVzIHRoZSB0ZW1wbGF0ZSBhbmQgcGVyZm9ybXMgdGhlIHJlcXVpcmVkIHJlcGxhY2VtZW50cyB1c2luZyB0aGVcbiAgICAgKiBzcGVjaWZpZWQgZGF0YS5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgY29tcGlsZShub2RlOiBYbWxOb2RlLCBkYXRhOiBTY29wZURhdGEsIGNvbnRleHQ6IFRlbXBsYXRlQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCB0YWdzID0gdGhpcy5wYXJzZVRhZ3Mobm9kZSk7XG4gICAgICAgIGF3YWl0IHRoaXMuZG9UYWdSZXBsYWNlbWVudHModGFncywgZGF0YSwgY29udGV4dCk7XG4gICAgfVxuXG4gICAgcHVibGljIHBhcnNlVGFncyhub2RlOiBYbWxOb2RlKTogVGFnW10ge1xuICAgICAgICBjb25zdCBkZWxpbWl0ZXJzID0gdGhpcy5kZWxpbWl0ZXJTZWFyY2hlci5maW5kRGVsaW1pdGVycyhub2RlKTtcbiAgICAgICAgY29uc3QgdGFncyA9IHRoaXMudGFnUGFyc2VyLnBhcnNlKGRlbGltaXRlcnMpO1xuICAgICAgICByZXR1cm4gdGFncztcbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIHByaXZhdGUgbWV0aG9kc1xuICAgIC8vXG5cbiAgICBwcml2YXRlIGFzeW5jIGRvVGFnUmVwbGFjZW1lbnRzKHRhZ3M6IFRhZ1tdLCBkYXRhOiBTY29wZURhdGEsIGNvbnRleHQ6IFRlbXBsYXRlQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuXG4gICAgICAgIGZvciAobGV0IHRhZ0luZGV4ID0gMDsgdGFnSW5kZXggPCB0YWdzLmxlbmd0aDsgdGFnSW5kZXgrKykge1xuXG4gICAgICAgICAgICBjb25zdCB0YWcgPSB0YWdzW3RhZ0luZGV4XTtcbiAgICAgICAgICAgIGRhdGEucGF0aC5wdXNoKHRhZy5uYW1lKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gdGhpcy5kZXRlY3RDb250ZW50VHlwZSh0YWcsIGRhdGEpO1xuICAgICAgICAgICAgY29uc3QgcGx1Z2luID0gdGhpcy5wbHVnaW5zTG9va3VwW2NvbnRlbnRUeXBlXTtcbiAgICAgICAgICAgIGlmICghcGx1Z2luKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFVua25vd25Db250ZW50VHlwZUVycm9yKFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgdGFnLnJhd1RleHQsXG4gICAgICAgICAgICAgICAgICAgIGRhdGEucGF0aC5qb2luKCcuJylcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGFnLmRpc3Bvc2l0aW9uID09PSBUYWdEaXNwb3NpdGlvbi5TZWxmQ2xvc2VkKSB7XG5cbiAgICAgICAgICAgICAgICAvLyByZXBsYWNlIHNpbXBsZSB0YWdcbiAgICAgICAgICAgICAgICBjb25zdCBqb2IgPSBwbHVnaW4uc2ltcGxlVGFnUmVwbGFjZW1lbnRzKHRhZywgZGF0YSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgaWYgKGlzUHJvbWlzZUxpa2Uoam9iKSkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBqb2I7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRhZy5kaXNwb3NpdGlvbiA9PT0gVGFnRGlzcG9zaXRpb24uT3Blbikge1xuXG4gICAgICAgICAgICAgICAgLy8gZ2V0IGFsbCB0YWdzIGJldHdlZW4gdGhlIG9wZW4gYW5kIGNsb3NlIHRhZ3NcbiAgICAgICAgICAgICAgICBjb25zdCBjbG9zaW5nVGFnSW5kZXggPSB0aGlzLmZpbmRDbG9zZVRhZ0luZGV4KHRhZ0luZGV4LCB0YWcsIHRhZ3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNjb3BlVGFncyA9IHRhZ3Muc2xpY2UodGFnSW5kZXgsIGNsb3NpbmdUYWdJbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIHRhZ0luZGV4ID0gY2xvc2luZ1RhZ0luZGV4O1xuXG4gICAgICAgICAgICAgICAgLy8gcmVwbGFjZSBjb250YWluZXIgdGFnXG4gICAgICAgICAgICAgICAgY29uc3Qgam9iID0gcGx1Z2luLmNvbnRhaW5lclRhZ1JlcGxhY2VtZW50cyhzY29wZVRhZ3MsIGRhdGEsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIGlmIChpc1Byb21pc2VMaWtlKGpvYikpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgam9iO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGF0YS5wYXRoLnBvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkZXRlY3RDb250ZW50VHlwZSh0YWc6IFRhZywgZGF0YTogU2NvcGVEYXRhKTogc3RyaW5nIHtcblxuICAgICAgICAvLyBleHBsaWNpdCBjb250ZW50IHR5cGVcbiAgICAgICAgY29uc3Qgc2NvcGVEYXRhID0gZGF0YS5nZXRTY29wZURhdGEoKTtcbiAgICAgICAgaWYgKFBsdWdpbkNvbnRlbnQuaXNQbHVnaW5Db250ZW50KHNjb3BlRGF0YSkpXG4gICAgICAgICAgICByZXR1cm4gc2NvcGVEYXRhLl90eXBlO1xuXG4gICAgICAgIC8vIGltcGxpY2l0IC0gbG9vcFxuICAgICAgICBpZiAodGFnLmRpc3Bvc2l0aW9uID09PSBUYWdEaXNwb3NpdGlvbi5PcGVuIHx8IHRhZy5kaXNwb3NpdGlvbiA9PT0gVGFnRGlzcG9zaXRpb24uQ2xvc2UpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXJDb250ZW50VHlwZTtcblxuICAgICAgICAvLyBpbXBsaWNpdCAtIHRleHRcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdENvbnRlbnRUeXBlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZENsb3NlVGFnSW5kZXgoZnJvbUluZGV4OiBudW1iZXIsIG9wZW5UYWc6IFRhZywgdGFnczogVGFnW10pOiBudW1iZXIge1xuXG4gICAgICAgIGxldCBpID0gZnJvbUluZGV4O1xuICAgICAgICBmb3IgKDsgaSA8IHRhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNsb3NlVGFnID0gdGFnc1tpXTtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBjbG9zZVRhZy5uYW1lID09PSBvcGVuVGFnLm5hbWUgJiZcbiAgICAgICAgICAgICAgICBjbG9zZVRhZy5kaXNwb3NpdGlvbiA9PT0gVGFnRGlzcG9zaXRpb24uQ2xvc2VcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGkgPT09IHRhZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVW5jbG9zZWRUYWdFcnJvcihvcGVuVGFnLm5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgU2NvcGVEYXRhLCBUYWdQYXJzZXIsIFRlbXBsYXRlQ29tcGlsZXIsIFRlbXBsYXRlQ29udGV4dCB9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcbmltcG9ydCB7IERvY3hQYXJzZXIgfSBmcm9tICcuLi9vZmZpY2UnO1xuaW1wb3J0IHsgWG1sUGFyc2VyIH0gZnJvbSAnLi4veG1sJztcblxuZXhwb3J0IGludGVyZmFjZSBFeHRlbnNpb25VdGlsaXRpZXMge1xuICAgIGNvbXBpbGVyOiBUZW1wbGF0ZUNvbXBpbGVyO1xuICAgIHRhZ1BhcnNlcjogVGFnUGFyc2VyO1xuICAgIGRvY3hQYXJzZXI6IERvY3hQYXJzZXI7XG4gICAgeG1sUGFyc2VyOiBYbWxQYXJzZXI7XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUZW1wbGF0ZUV4dGVuc2lvbiB7XG5cbiAgICBwcm90ZWN0ZWQgdXRpbGl0aWVzOiBFeHRlbnNpb25VdGlsaXRpZXM7XG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgYnkgdGhlIFRlbXBsYXRlSGFuZGxlciBhdCBydW50aW1lLlxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRVdGlsaXRpZXModXRpbGl0aWVzOiBFeHRlbnNpb25VdGlsaXRpZXMpIHtcbiAgICAgICAgdGhpcy51dGlsaXRpZXMgPSB1dGlsaXRpZXM7XG4gICAgfVxuXG4gICAgcHVibGljIGFic3RyYWN0IGV4ZWN1dGUoZGF0YTogU2NvcGVEYXRhLCBjb250ZXh0OiBUZW1wbGF0ZUNvbnRleHQpOiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbn1cbiIsImltcG9ydCAqIGFzIEpTWmlwIGZyb20gJ2pzemlwJztcbmltcG9ydCB7IE1pc3NpbmdBcmd1bWVudEVycm9yIH0gZnJvbSAnLi4vZXJyb3JzJztcbmltcG9ydCB7IENvbnN0cnVjdG9yIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgQmluYXJ5IH0gZnJvbSAnLi4vdXRpbHMnO1xuXG5leHBvcnQgY2xhc3MgSnNaaXBIZWxwZXIge1xuXG4gICAgcHVibGljIHN0YXRpYyB0b0pzWmlwT3V0cHV0VHlwZShiaW5hcnk6IEJpbmFyeSk6IEpTWmlwLk91dHB1dFR5cGU7XG4gICAgcHVibGljIHN0YXRpYyB0b0pzWmlwT3V0cHV0VHlwZShiaW5hcnlUeXBlOiBDb25zdHJ1Y3RvcjxCaW5hcnk+KTogSlNaaXAuT3V0cHV0VHlwZTtcbiAgICBwdWJsaWMgc3RhdGljIHRvSnNaaXBPdXRwdXRUeXBlKGJpbmFyeU9yVHlwZTogQmluYXJ5IHwgQ29uc3RydWN0b3I8QmluYXJ5Pik6IEpTWmlwLk91dHB1dFR5cGUge1xuXG4gICAgICAgIGlmICghYmluYXJ5T3JUeXBlKVxuICAgICAgICAgICAgdGhyb3cgbmV3IE1pc3NpbmdBcmd1bWVudEVycm9yKG5hbWVvZihiaW5hcnlPclR5cGUpKTtcblxuICAgICAgICBsZXQgYmluYXJ5VHlwZTogQ29uc3RydWN0b3I8QmluYXJ5PjtcbiAgICAgICAgaWYgKHR5cGVvZiBiaW5hcnlPclR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGJpbmFyeVR5cGUgPSBiaW5hcnlPclR5cGUgYXMgQ29uc3RydWN0b3I8QmluYXJ5PjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJpbmFyeVR5cGUgPSBiaW5hcnlPclR5cGUuY29uc3RydWN0b3IgYXMgQ29uc3RydWN0b3I8QmluYXJ5PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChCaW5hcnkuaXNCbG9iQ29uc3RydWN0b3IoYmluYXJ5VHlwZSkpXG4gICAgICAgICAgICByZXR1cm4gJ2Jsb2InO1xuICAgICAgICBpZiAoQmluYXJ5LmlzQXJyYXlCdWZmZXJDb25zdHJ1Y3RvcihiaW5hcnlUeXBlKSlcbiAgICAgICAgICAgIHJldHVybiAnYXJyYXlidWZmZXInO1xuICAgICAgICBpZiAoQmluYXJ5LmlzQnVmZmVyQ29uc3RydWN0b3IoYmluYXJ5VHlwZSkpXG4gICAgICAgICAgICByZXR1cm4gJ25vZGVidWZmZXInO1xuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQmluYXJ5IHR5cGUgJyR7KGJpbmFyeVR5cGUgYXMgYW55KS5uYW1lfScgaXMgbm90IHN1cHBvcnRlZC5gKTtcbiAgICB9O1xufVxuIiwiaW1wb3J0ICogYXMgSlNaaXAgZnJvbSAnanN6aXAnO1xuaW1wb3J0IHsgQ29uc3RydWN0b3IgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBCaW5hcnkgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBKc1ppcEhlbHBlciB9IGZyb20gJy4vanNaaXBIZWxwZXInO1xuXG5leHBvcnQgY2xhc3MgWmlwT2JqZWN0IHtcblxuICAgIHB1YmxpYyBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy56aXBPYmplY3QubmFtZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IG5hbWUodmFsdWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLnppcE9iamVjdC5uYW1lID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBpc0RpcmVjdG9yeSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuemlwT2JqZWN0LmRpcjtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHppcE9iamVjdDogSlNaaXAuSlNaaXBPYmplY3QpIHsgfVxuXG4gICAgcHVibGljIGdldENvbnRlbnRUZXh0KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIHJldHVybiB0aGlzLnppcE9iamVjdC5hc3luYygndGV4dCcpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDb250ZW50QmFzZTY0KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIHJldHVybiB0aGlzLnppcE9iamVjdC5hc3luYygnYmluYXJ5c3RyaW5nJyk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldENvbnRlbnRCaW5hcnk8VCBleHRlbmRzIEJpbmFyeT4ob3V0cHV0VHlwZTogQ29uc3RydWN0b3I8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICAgICAgY29uc3QgemlwT3V0cHV0VHlwZTogSlNaaXAuT3V0cHV0VHlwZSA9IEpzWmlwSGVscGVyLnRvSnNaaXBPdXRwdXRUeXBlKG91dHB1dFR5cGUpO1xuICAgICAgICByZXR1cm4gdGhpcy56aXBPYmplY3QuYXN5bmMoemlwT3V0cHV0VHlwZSkgYXMgYW55O1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIEpTWmlwIGZyb20gJ2pzemlwJztcbmltcG9ydCB7IENvbnN0cnVjdG9yIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgQmluYXJ5IH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgSnNaaXBIZWxwZXIgfSBmcm9tICcuL2pzWmlwSGVscGVyJztcbmltcG9ydCB7IFppcE9iamVjdCB9IGZyb20gJy4vemlwT2JqZWN0JztcblxuZXhwb3J0IGNsYXNzIFppcCB7XG5cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGxvYWQoZmlsZTogQmluYXJ5KTogUHJvbWlzZTxaaXA+IHtcbiAgICAgICAgY29uc3QgemlwID0gYXdhaXQgSlNaaXAubG9hZEFzeW5jKGZpbGUpO1xuICAgICAgICByZXR1cm4gbmV3IFppcCh6aXApO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSB6aXA6IEpTWmlwKSB7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEZpbGUocGF0aDogc3RyaW5nKTogWmlwT2JqZWN0IHtcbiAgICAgICAgY29uc3QgaW50ZXJuYWxaaXBPYmplY3QgPSB0aGlzLnppcC5maWxlc1twYXRoXTtcbiAgICAgICAgaWYgKCFpbnRlcm5hbFppcE9iamVjdClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gbmV3IFppcE9iamVjdChpbnRlcm5hbFppcE9iamVjdCk7XG4gICAgfVxuXG4gICAgcHVibGljIHNldEZpbGUocGF0aDogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcgfCBCaW5hcnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy56aXAuZmlsZShwYXRoLCBjb250ZW50KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNGaWxlRXhpc3QocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuemlwLmZpbGVzW3BhdGhdO1xuICAgIH1cblxuICAgIHB1YmxpYyBsaXN0RmlsZXMoKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy56aXAuZmlsZXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBleHBvcnQ8VCBleHRlbmRzIEJpbmFyeT4ob3V0cHV0VHlwZTogQ29uc3RydWN0b3I8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICAgICAgY29uc3QgemlwT3V0cHV0VHlwZTogSlNaaXAuT3V0cHV0VHlwZSA9IEpzWmlwSGVscGVyLnRvSnNaaXBPdXRwdXRUeXBlKG91dHB1dFR5cGUpO1xuICAgICAgICBjb25zdCBvdXRwdXQgPSBhd2FpdCB0aGlzLnppcC5nZW5lcmF0ZUFzeW5jKHtcbiAgICAgICAgICAgIHR5cGU6IHppcE91dHB1dFR5cGUsXG4gICAgICAgICAgICBjb21wcmVzc2lvbjogXCJERUZMQVRFXCIsXG4gICAgICAgICAgICBjb21wcmVzc2lvbk9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBsZXZlbDogNiAvLyBiZXR3ZWVuIDEgKGJlc3Qgc3BlZWQpIGFuZCA5IChiZXN0IGNvbXByZXNzaW9uKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG91dHB1dCBhcyBUO1xuICAgIH1cbn1cbiIsIlxuZXhwb3J0IGNsYXNzIERlbGltaXRlcnMge1xuXG4gICAgcHVibGljIHRhZ1N0YXJ0ID0gXCJ7XCI7XG4gICAgcHVibGljIHRhZ0VuZCA9IFwifVwiO1xuICAgIHB1YmxpYyBjb250YWluZXJUYWdPcGVuID0gXCIjXCI7XG4gICAgcHVibGljIGNvbnRhaW5lclRhZ0Nsb3NlID0gXCIvXCI7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbml0aWFsPzogUGFydGlhbDxEZWxpbWl0ZXJzPikge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIGluaXRpYWwpO1xuXG4gICAgICAgIHRoaXMuZW5jb2RlQW5kVmFsaWRhdGUoKTtcblxuICAgICAgICBpZiAodGhpcy5jb250YWluZXJUYWdPcGVuID09PSB0aGlzLmNvbnRhaW5lclRhZ0Nsb3NlKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke25hbWVvZih0aGlzLmNvbnRhaW5lclRhZ09wZW4pfSBjYW4gbm90IGJlIGVxdWFsIHRvICR7bmFtZW9mKHRoaXMuY29udGFpbmVyVGFnQ2xvc2UpfWApO1xuICAgIH1cblxuICAgIHByaXZhdGUgZW5jb2RlQW5kVmFsaWRhdGUoKSB7XG4gICAgICAgIGNvbnN0IGtleXM6IChrZXlvZiBEZWxpbWl0ZXJzKVtdID0gWyd0YWdTdGFydCcsICd0YWdFbmQnLCAnY29udGFpbmVyVGFnT3BlbicsICdjb250YWluZXJUYWdDbG9zZSddO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpc1trZXldO1xuICAgICAgICAgICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7a2V5fSBjYW4gbm90IGJlIGVtcHR5LmApO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHZhbHVlLnRyaW0oKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7a2V5fSBjYW4gbm90IGNvbnRhaW4gbGVhZGluZyBvciB0cmFpbGluZyB3aGl0ZXNwYWNlLmApO1xuICAgICAgICB9XG4gICAgfVxufSIsImltcG9ydCB7IERlbGltaXRlcnMgfSBmcm9tICcuL2RlbGltaXRlcnMnO1xuaW1wb3J0IHsgY3JlYXRlRGVmYXVsdFBsdWdpbnMsIExPT1BfQ09OVEVOVF9UWVBFLCBUZW1wbGF0ZVBsdWdpbiwgVEVYVF9DT05URU5UX1RZUEUgfSBmcm9tICcuL3BsdWdpbnMnO1xuaW1wb3J0IHsgRXh0ZW5zaW9uT3B0aW9ucyB9IGZyb20gJy4vZXh0ZW5zaW9ucyc7XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZUhhbmRsZXJPcHRpb25zIHtcblxuICAgIHB1YmxpYyBwbHVnaW5zPzogVGVtcGxhdGVQbHVnaW5bXSA9IGNyZWF0ZURlZmF1bHRQbHVnaW5zKCk7XG5cbiAgICBwdWJsaWMgZGVmYXVsdENvbnRlbnRUeXBlPz0gVEVYVF9DT05URU5UX1RZUEU7XG5cbiAgICBwdWJsaWMgY29udGFpbmVyQ29udGVudFR5cGU/PSBMT09QX0NPTlRFTlRfVFlQRTtcblxuICAgIHB1YmxpYyBkZWxpbWl0ZXJzPzogUGFydGlhbDxEZWxpbWl0ZXJzPiA9IG5ldyBEZWxpbWl0ZXJzKCk7XG5cbiAgICBwdWJsaWMgbWF4WG1sRGVwdGg/PSAyMDtcblxuICAgIHB1YmxpYyBleHRlbnNpb25zPzogRXh0ZW5zaW9uT3B0aW9ucyA9IHt9O1xuXG4gICAgY29uc3RydWN0b3IoaW5pdGlhbD86IFBhcnRpYWw8VGVtcGxhdGVIYW5kbGVyT3B0aW9ucz4pIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBpbml0aWFsKTtcblxuICAgICAgICBpZiAoaW5pdGlhbCkge1xuICAgICAgICAgICAgdGhpcy5kZWxpbWl0ZXJzID0gbmV3IERlbGltaXRlcnMoaW5pdGlhbC5kZWxpbWl0ZXJzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5wbHVnaW5zLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbHVnaW5zIGxpc3QgY2FuIG5vdCBiZSBlbXB0eScpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRGVsaW1pdGVyU2VhcmNoZXIsIFNjb3BlRGF0YSwgVGFnLCBUYWdQYXJzZXIsIFRlbXBsYXRlQ29tcGlsZXIsIFRlbXBsYXRlQ29udGV4dCB9IGZyb20gJy4vY29tcGlsYXRpb24nO1xuaW1wb3J0IHsgRGVsaW1pdGVycyB9IGZyb20gJy4vZGVsaW1pdGVycyc7XG5pbXBvcnQgeyBNYWxmb3JtZWRGaWxlRXJyb3IgfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgeyBUZW1wbGF0ZUV4dGVuc2lvbiB9IGZyb20gJy4vZXh0ZW5zaW9ucyc7XG5pbXBvcnQgeyBDb250ZW50UGFydFR5cGUsIERvY3gsIERvY3hQYXJzZXIgfSBmcm9tICcuL29mZmljZSc7XG5pbXBvcnQgeyBUZW1wbGF0ZURhdGEgfSBmcm9tICcuL3RlbXBsYXRlRGF0YSc7XG5pbXBvcnQgeyBUZW1wbGF0ZUhhbmRsZXJPcHRpb25zIH0gZnJvbSAnLi90ZW1wbGF0ZUhhbmRsZXJPcHRpb25zJztcbmltcG9ydCB7IENvbnN0cnVjdG9yIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBCaW5hcnkgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IFhtbE5vZGUsIFhtbFBhcnNlciB9IGZyb20gJy4veG1sJztcbmltcG9ydCB7IFppcCB9IGZyb20gJy4vemlwJztcblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlSGFuZGxlciB7XG5cbiAgICAvKipcbiAgICAgKiBWZXJzaW9uIG51bWJlciBvZiB0aGUgYGVhc3ktdGVtcGxhdGUteGAgbGlicmFyeS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZG9ubHkgdmVyc2lvbiA9ICh0eXBlb2YgRUFTWV9WRVJTSU9OICE9PSAndW5kZWZpbmVkJyA/IEVBU1lfVkVSU0lPTiA6ICdudWxsJyk7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHhtbFBhcnNlciA9IG5ldyBYbWxQYXJzZXIoKTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRvY3hQYXJzZXI6IERvY3hQYXJzZXI7XG4gICAgcHJpdmF0ZSByZWFkb25seSBjb21waWxlcjogVGVtcGxhdGVDb21waWxlcjtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgb3B0aW9uczogVGVtcGxhdGVIYW5kbGVyT3B0aW9ucztcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBUZW1wbGF0ZUhhbmRsZXJPcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG5ldyBUZW1wbGF0ZUhhbmRsZXJPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIHRoaXMgaXMgdGhlIGxpYnJhcnkncyBjb21wb3NpdGlvbiByb290XG4gICAgICAgIC8vXG5cbiAgICAgICAgdGhpcy5kb2N4UGFyc2VyID0gbmV3IERvY3hQYXJzZXIodGhpcy54bWxQYXJzZXIpO1xuXG4gICAgICAgIGNvbnN0IGRlbGltaXRlclNlYXJjaGVyID0gbmV3IERlbGltaXRlclNlYXJjaGVyKHRoaXMuZG9jeFBhcnNlcik7XG4gICAgICAgIGRlbGltaXRlclNlYXJjaGVyLnN0YXJ0RGVsaW1pdGVyID0gdGhpcy5vcHRpb25zLmRlbGltaXRlcnMudGFnU3RhcnQ7XG4gICAgICAgIGRlbGltaXRlclNlYXJjaGVyLmVuZERlbGltaXRlciA9IHRoaXMub3B0aW9ucy5kZWxpbWl0ZXJzLnRhZ0VuZDtcbiAgICAgICAgZGVsaW1pdGVyU2VhcmNoZXIubWF4WG1sRGVwdGggPSB0aGlzLm9wdGlvbnMubWF4WG1sRGVwdGg7XG5cbiAgICAgICAgY29uc3QgdGFnUGFyc2VyID0gbmV3IFRhZ1BhcnNlcih0aGlzLmRvY3hQYXJzZXIsIHRoaXMub3B0aW9ucy5kZWxpbWl0ZXJzIGFzIERlbGltaXRlcnMpO1xuXG4gICAgICAgIHRoaXMuY29tcGlsZXIgPSBuZXcgVGVtcGxhdGVDb21waWxlcihcbiAgICAgICAgICAgIGRlbGltaXRlclNlYXJjaGVyLFxuICAgICAgICAgICAgdGFnUGFyc2VyLFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnBsdWdpbnMsXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZGVmYXVsdENvbnRlbnRUeXBlLFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmNvbnRhaW5lckNvbnRlbnRUeXBlXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zLnBsdWdpbnMuZm9yRWFjaChwbHVnaW4gPT4ge1xuICAgICAgICAgICAgcGx1Z2luLnNldFV0aWxpdGllcyh7XG4gICAgICAgICAgICAgICAgeG1sUGFyc2VyOiB0aGlzLnhtbFBhcnNlcixcbiAgICAgICAgICAgICAgICBkb2N4UGFyc2VyOiB0aGlzLmRvY3hQYXJzZXIsXG4gICAgICAgICAgICAgICAgY29tcGlsZXI6IHRoaXMuY29tcGlsZXJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBleHRlbnNpb25VdGlsaXRpZXMgPSB7XG4gICAgICAgICAgICB4bWxQYXJzZXI6IHRoaXMueG1sUGFyc2VyLFxuICAgICAgICAgICAgZG9jeFBhcnNlcjogdGhpcy5kb2N4UGFyc2VyLFxuICAgICAgICAgICAgdGFnUGFyc2VyLFxuICAgICAgICAgICAgY29tcGlsZXI6IHRoaXMuY29tcGlsZXJcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucz8uYmVmb3JlQ29tcGlsYXRpb24/LmZvckVhY2goZXh0ZW5zaW9uID0+IHtcbiAgICAgICAgICAgIGV4dGVuc2lvbi5zZXRVdGlsaXRpZXMoZXh0ZW5zaW9uVXRpbGl0aWVzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnM/LmFmdGVyQ29tcGlsYXRpb24/LmZvckVhY2goZXh0ZW5zaW9uID0+IHtcbiAgICAgICAgICAgIGV4dGVuc2lvbi5zZXRVdGlsaXRpZXMoZXh0ZW5zaW9uVXRpbGl0aWVzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyBwdWJsaWMgbWV0aG9kc1xuICAgIC8vXG5cbiAgICBwdWJsaWMgYXN5bmMgcHJvY2VzczxUIGV4dGVuZHMgQmluYXJ5Pih0ZW1wbGF0ZUZpbGU6IFQsIGRhdGE6IFRlbXBsYXRlRGF0YSk6IFByb21pc2U8VD4ge1xuXG4gICAgICAgIC8vIGxvYWQgdGhlIGRvY3ggZmlsZVxuICAgICAgICBjb25zdCBkb2N4ID0gYXdhaXQgdGhpcy5sb2FkRG9jeCh0ZW1wbGF0ZUZpbGUpO1xuXG4gICAgICAgIC8vIHByZXBhcmUgY29udGV4dFxuICAgICAgICBjb25zdCBzY29wZURhdGEgPSBuZXcgU2NvcGVEYXRhKGRhdGEpO1xuICAgICAgICBjb25zdCBjb250ZXh0OiBUZW1wbGF0ZUNvbnRleHQgPSB7XG4gICAgICAgICAgICBkb2N4LFxuICAgICAgICAgICAgY3VycmVudFBhcnQ6IG51bGxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBjb250ZW50UGFydHMgPSBhd2FpdCBkb2N4LmdldENvbnRlbnRQYXJ0cygpO1xuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgY29udGVudFBhcnRzKSB7XG5cbiAgICAgICAgICAgIGNvbnRleHQuY3VycmVudFBhcnQgPSBwYXJ0O1xuXG4gICAgICAgICAgICAvLyBleHRlbnNpb25zIC0gYmVmb3JlIGNvbXBpbGF0aW9uXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNhbGxFeHRlbnNpb25zKHRoaXMub3B0aW9ucy5leHRlbnNpb25zPy5iZWZvcmVDb21waWxhdGlvbiwgc2NvcGVEYXRhLCBjb250ZXh0KTtcblxuICAgICAgICAgICAgLy8gY29tcGlsYXRpb24gKGRvIHJlcGxhY2VtZW50cylcbiAgICAgICAgICAgIGNvbnN0IHhtbFJvb3QgPSBhd2FpdCBwYXJ0LnhtbFJvb3QoKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY29tcGlsZXIuY29tcGlsZSh4bWxSb290LCBzY29wZURhdGEsIGNvbnRleHQpO1xuXG4gICAgICAgICAgICAvLyBleHRlbnNpb25zIC0gYWZ0ZXIgY29tcGlsYXRpb25cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY2FsbEV4dGVuc2lvbnModGhpcy5vcHRpb25zLmV4dGVuc2lvbnM/LmFmdGVyQ29tcGlsYXRpb24sIHNjb3BlRGF0YSwgY29udGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBleHBvcnQgdGhlIHJlc3VsdFxuICAgICAgICByZXR1cm4gZG9jeC5leHBvcnQodGVtcGxhdGVGaWxlLmNvbnN0cnVjdG9yIGFzIENvbnN0cnVjdG9yPFQ+KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHRleHQgY29udGVudCBvZiBhIHNpbmdsZSBwYXJ0IG9mIHRoZSBkb2N1bWVudC5cbiAgICAgKiBJZiB0aGUgcGFydCBkb2VzIG5vdCBleGlzdHMgcmV0dXJucyBudWxsLlxuICAgICAqXG4gICAgICogQHBhcmFtIGNvbnRlbnRQYXJ0XG4gICAgICogVGhlIGNvbnRlbnQgcGFydCBvZiB3aGljaCB0byBnZXQgaXQncyB0ZXh0IGNvbnRlbnQuXG4gICAgICogRGVmYXVsdHMgdG8gYENvbnRlbnRQYXJ0VHlwZS5NYWluRG9jdW1lbnRgLlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBwYXJzZVRhZ3ModGVtcGxhdGVGaWxlOiBCaW5hcnksIGNvbnRlbnRQYXJ0ID0gQ29udGVudFBhcnRUeXBlLk1haW5Eb2N1bWVudCk6IFByb21pc2U8VGFnW10+IHtcbiAgICAgICAgY29uc3QgZG9jeCA9IGF3YWl0IHRoaXMubG9hZERvY3godGVtcGxhdGVGaWxlKTtcbiAgICAgICAgY29uc3QgcGFydCA9IGF3YWl0IGRvY3guZ2V0Q29udGVudFBhcnQoY29udGVudFBhcnQpO1xuICAgICAgICBjb25zdCB4bWxSb290ID0gYXdhaXQgcGFydC54bWxSb290KCk7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBpbGVyLnBhcnNlVGFncyh4bWxSb290KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHRleHQgY29udGVudCBvZiBhIHNpbmdsZSBwYXJ0IG9mIHRoZSBkb2N1bWVudC5cbiAgICAgKiBJZiB0aGUgcGFydCBkb2VzIG5vdCBleGlzdHMgcmV0dXJucyBudWxsLlxuICAgICAqXG4gICAgICogQHBhcmFtIGNvbnRlbnRQYXJ0XG4gICAgICogVGhlIGNvbnRlbnQgcGFydCBvZiB3aGljaCB0byBnZXQgaXQncyB0ZXh0IGNvbnRlbnQuXG4gICAgICogRGVmYXVsdHMgdG8gYENvbnRlbnRQYXJ0VHlwZS5NYWluRG9jdW1lbnRgLlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBnZXRUZXh0KGRvY3hGaWxlOiBCaW5hcnksIGNvbnRlbnRQYXJ0ID0gQ29udGVudFBhcnRUeXBlLk1haW5Eb2N1bWVudCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IGRvY3ggPSBhd2FpdCB0aGlzLmxvYWREb2N4KGRvY3hGaWxlKTtcbiAgICAgICAgY29uc3QgcGFydCA9IGF3YWl0IGRvY3guZ2V0Q29udGVudFBhcnQoY29udGVudFBhcnQpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcGFydC5nZXRUZXh0KCk7XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgeG1sIHJvb3Qgb2YgYSBzaW5nbGUgcGFydCBvZiB0aGUgZG9jdW1lbnQuXG4gICAgICogSWYgdGhlIHBhcnQgZG9lcyBub3QgZXhpc3RzIHJldHVybnMgbnVsbC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjb250ZW50UGFydFxuICAgICAqIFRoZSBjb250ZW50IHBhcnQgb2Ygd2hpY2ggdG8gZ2V0IGl0J3MgdGV4dCBjb250ZW50LlxuICAgICAqIERlZmF1bHRzIHRvIGBDb250ZW50UGFydFR5cGUuTWFpbkRvY3VtZW50YC5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgZ2V0WG1sKGRvY3hGaWxlOiBCaW5hcnksIGNvbnRlbnRQYXJ0ID0gQ29udGVudFBhcnRUeXBlLk1haW5Eb2N1bWVudCk6IFByb21pc2U8WG1sTm9kZT4ge1xuICAgICAgICBjb25zdCBkb2N4ID0gYXdhaXQgdGhpcy5sb2FkRG9jeChkb2N4RmlsZSk7XG4gICAgICAgIGNvbnN0IHBhcnQgPSBhd2FpdCBkb2N4LmdldENvbnRlbnRQYXJ0KGNvbnRlbnRQYXJ0KTtcbiAgICAgICAgY29uc3QgeG1sUm9vdCA9IGF3YWl0IHBhcnQueG1sUm9vdCgpO1xuICAgICAgICByZXR1cm4geG1sUm9vdDtcbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIHByaXZhdGUgbWV0aG9kc1xuICAgIC8vXG5cbiAgICBwcml2YXRlIGFzeW5jIGNhbGxFeHRlbnNpb25zKGV4dGVuc2lvbnM6IFRlbXBsYXRlRXh0ZW5zaW9uW10sIHNjb3BlRGF0YTogU2NvcGVEYXRhLCBjb250ZXh0OiBUZW1wbGF0ZUNvbnRleHQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKCFleHRlbnNpb25zKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGZvciAoY29uc3QgZXh0ZW5zaW9uIG9mIGV4dGVuc2lvbnMpIHtcbiAgICAgICAgICAgIGF3YWl0IGV4dGVuc2lvbi5leGVjdXRlKHNjb3BlRGF0YSwgY29udGV4dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGxvYWREb2N4KGZpbGU6IEJpbmFyeSk6IFByb21pc2U8RG9jeD4ge1xuXG4gICAgICAgIC8vIGxvYWQgdGhlIHppcCBmaWxlXG4gICAgICAgIGxldCB6aXA6IFppcDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHppcCA9IGF3YWl0IFppcC5sb2FkKGZpbGUpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNYWxmb3JtZWRGaWxlRXJyb3IoJ2RvY3gnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGxvYWQgdGhlIGRvY3ggZmlsZVxuICAgICAgICBjb25zdCBkb2N4ID0gYXdhaXQgdGhpcy5kb2N4UGFyc2VyLmxvYWQoemlwKTtcbiAgICAgICAgcmV0dXJuIGRvY3g7XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbIk1hbGZvcm1lZEZpbGVFcnJvciIsIkVycm9yIiwiY29uc3RydWN0b3IiLCJleHBlY3RlZEZpbGVUeXBlIiwiT2JqZWN0Iiwic2V0UHJvdG90eXBlT2YiLCJwcm90b3R5cGUiLCJNYXhYbWxEZXB0aEVycm9yIiwibWF4RGVwdGgiLCJNaXNzaW5nQXJndW1lbnRFcnJvciIsImFyZ05hbWUiLCJNaXNzaW5nQ2xvc2VEZWxpbWl0ZXJFcnJvciIsIm9wZW5EZWxpbWl0ZXJUZXh0IiwiTWlzc2luZ1N0YXJ0RGVsaW1pdGVyRXJyb3IiLCJjbG9zZURlbGltaXRlclRleHQiLCJVbmNsb3NlZFRhZ0Vycm9yIiwidGFnTmFtZSIsIlVuaWRlbnRpZmllZEZpbGVUeXBlRXJyb3IiLCJVbmtub3duQ29udGVudFR5cGVFcnJvciIsImNvbnRlbnRUeXBlIiwidGFnUmF3VGV4dCIsInBhdGgiLCJVbm9wZW5lZFRhZ0Vycm9yIiwiVW5zdXBwb3J0ZWRGaWxlVHlwZUVycm9yIiwiZmlsZVR5cGUiLCJwdXNoTWFueSIsImRlc3RBcnJheSIsIml0ZW1zIiwiQXJyYXkiLCJwdXNoIiwiYXBwbHkiLCJmaXJzdCIsImFycmF5IiwibGVuZ3RoIiwidW5kZWZpbmVkIiwibGFzdCIsInRvRGljdGlvbmFyeSIsImtleVNlbGVjdG9yIiwidmFsdWVTZWxlY3RvciIsInJlcyIsImZvckVhY2giLCJpdGVtIiwiaW5kZXgiLCJrZXkiLCJ2YWx1ZSIsIkJhc2U2NCIsImVuY29kZSIsInN0ciIsImJ0b2EiLCJCdWZmZXIiLCJ0b1N0cmluZyIsImluaGVyaXRzRnJvbSIsImRlcml2ZWQiLCJiYXNlIiwiaXNQcm9taXNlTGlrZSIsImNhbmRpZGF0ZSIsInRoZW4iLCJCaW5hcnkiLCJpc0Jsb2IiLCJiaW5hcnkiLCJpc0Jsb2JDb25zdHJ1Y3RvciIsImlzQXJyYXlCdWZmZXIiLCJpc0FycmF5QnVmZmVyQ29uc3RydWN0b3IiLCJpc0J1ZmZlciIsImlzQnVmZmVyQ29uc3RydWN0b3IiLCJiaW5hcnlUeXBlIiwiQmxvYiIsIkFycmF5QnVmZmVyIiwidG9CYXNlNjQiLCJQcm9taXNlIiwicmVzb2x2ZSIsImZpbGVSZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkIiwiYmFzZTY0IiwicmVzdWx0IiwicmVhZEFzQmluYXJ5U3RyaW5nIiwiYmluYXJ5U3RyIiwiVWludDhBcnJheSIsInJlZHVjZSIsImJ5dGUiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJuYW1lIiwiUGF0aCIsImdldEZpbGVuYW1lIiwibGFzdFNsYXNoSW5kZXgiLCJsYXN0SW5kZXhPZiIsInN1YnN0ciIsImdldERpcmVjdG9yeSIsInN1YnN0cmluZyIsImNvbWJpbmUiLCJwYXJ0cyIsImZpbHRlciIsInBhcnQiLCJ0cmltIiwiam9pbiIsIlJlZ2V4IiwiZXNjYXBlIiwicmVwbGFjZSIsInNoYTEiLCJtc2ciLCJ1dGY4RW5jb2RlIiwibXNnTGVuZ3RoIiwiaSIsImoiLCJ3b3JkQXJyYXkiLCJjaGFyQ29kZUF0IiwidyIsIkgwIiwiSDEiLCJIMiIsIkgzIiwiSDQiLCJBIiwiQiIsIkMiLCJEIiwiRSIsInRlbXAiLCJibG9ja1N0YXJ0Iiwicm90YXRlTGVmdCIsImN2dEhleCIsInRvTG93ZXJDYXNlIiwibiIsInMiLCJ0NCIsInZhbCIsInYiLCJ1dGZTdHIiLCJjIiwiWG1sRGVwdGhUcmFja2VyIiwiaW5jcmVtZW50IiwiZGVwdGgiLCJkZWNyZW1lbnQiLCJYbWxOb2RlVHlwZSIsIlRFWFRfTk9ERV9OQU1FIiwiWG1sTm9kZSIsImNyZWF0ZVRleHROb2RlIiwidGV4dCIsIm5vZGVUeXBlIiwiVGV4dCIsIm5vZGVOYW1lIiwidGV4dENvbnRlbnQiLCJjcmVhdGVHZW5lcmFsTm9kZSIsIkdlbmVyYWwiLCJlbmNvZGVWYWx1ZSIsIlR5cGVFcnJvciIsInNlcmlhbGl6ZSIsIm5vZGUiLCJpc1RleHROb2RlIiwiYXR0cmlidXRlcyIsImF0dHJpYnV0ZU5hbWVzIiwia2V5cyIsIm1hcCIsImhhc0NoaWxkcmVuIiwiY2hpbGROb2RlcyIsInN1ZmZpeCIsIm9wZW5UYWciLCJ4bWwiLCJjaGlsZHJlblhtbCIsImNoaWxkIiwiY2xvc2VUYWciLCJmcm9tRG9tTm9kZSIsImRvbU5vZGUiLCJ4bWxOb2RlIiwiVEVYVF9OT0RFIiwiRUxFTUVOVF9OT0RFIiwiY3VyQXR0cmlidXRlIiwicHJldkNoaWxkIiwiZG9tQ2hpbGQiLCJjdXJDaGlsZCIsInBhcmVudE5vZGUiLCJuZXh0U2libGluZyIsImNsb25lTm9kZSIsImRlZXAiLCJjbG9uZSIsImFzc2lnbiIsImNsb25lTm9kZURlZXAiLCJpbnNlcnRCZWZvcmUiLCJuZXdOb2RlIiwicmVmZXJlbmNlTm9kZSIsImJlZm9yZU5vZGVJbmRleCIsImluZGV4T2YiLCJpbnNlcnRDaGlsZCIsImluc2VydEFmdGVyIiwicmVmZXJlbmNlTm9kZUluZGV4IiwicGFyZW50IiwiY2hpbGRJbmRleCIsImFwcGVuZENoaWxkIiwiUmFuZ2VFcnJvciIsImNoaWxkQWZ0ZXIiLCJjaGlsZEJlZm9yZSIsInNwbGljZSIsImN1cnJlbnRMYXN0Q2hpbGQiLCJyZW1vdmUiLCJyZW1vdmVDaGlsZCIsImxhc3RUZXh0Q2hpbGQiLCJhbGxUZXh0Tm9kZXMiLCJsYXN0VGV4dE5vZGUiLCJuZXdUZXh0Tm9kZSIsInJlbW92ZVNpYmxpbmdzIiwiZnJvbSIsInRvIiwicmVtb3ZlZCIsImxhc3RSZW1vdmVkIiwicmVtb3ZlTWUiLCJzcGxpdEJ5Q2hpbGQiLCJsZWZ0IiwicmlnaHQiLCJmaW5kUGFyZW50IiwicHJlZGljYXRlIiwiZmluZFBhcmVudEJ5TmFtZSIsImZpbmRDaGlsZEJ5TmFtZSIsImNoaWxkTmFtZSIsImZpbmQiLCJzaWJsaW5nc0luUmFuZ2UiLCJmaXJzdE5vZGUiLCJsYXN0Tm9kZSIsInJhbmdlIiwiY3VyTm9kZSIsInJlbW92ZUVtcHR5VGV4dE5vZGVzIiwicmVjdXJzaXZlUmVtb3ZlRW1wdHlUZXh0Tm9kZXMiLCJjaGlsZE9ySW5kZXgiLCJiZWZvcmVDaGlsZCIsIm9yaWdpbmFsIiwicHJldkNoaWxkQ2xvbmUiLCJjaGlsZENsb25lIiwib2xkQ2hpbGRyZW4iLCJtYXRjaCIsInN0cmlwcGVkQ2hpbGQiLCJYbWxQYXJzZXIiLCJwYXJzZSIsImRvYyIsImRvbVBhcnNlIiwiZG9jdW1lbnRFbGVtZW50IiwicGFyc2VyIiwicGFyc2VGcm9tU3RyaW5nIiwieG1sSGVhZGVyIiwieG1sZG9tIiwiTWF0Y2hTdGF0ZSIsInJlc2V0IiwiZGVsaW1pdGVySW5kZXgiLCJvcGVuTm9kZXMiLCJmaXJzdE1hdGNoSW5kZXgiLCJEZWxpbWl0ZXJTZWFyY2hlciIsImRvY3hQYXJzZXIiLCJmaW5kRGVsaW1pdGVycyIsImRlbGltaXRlcnMiLCJtYXhYbWxEZXB0aCIsImxvb2tGb3JPcGVuRGVsaW1pdGVyIiwiaXNQYXJhZ3JhcGhOb2RlIiwic2hvdWxkU2VhcmNoTm9kZSIsImZpbmROZXh0Tm9kZSIsInRleHRJbmRleCIsImRlbGltaXRlclBhdHRlcm4iLCJzdGFydERlbGltaXRlciIsImVuZERlbGltaXRlciIsImNoYXIiLCJqb2luVGV4dE5vZGVzUmFuZ2UiLCJkZWxpbWl0ZXJNYXJrIiwiY3JlYXRlRGVsaW1pdGVyTWFyayIsImlzT3BlbkRlbGltaXRlciIsImlzT3BlbiIsInhtbFRleHROb2RlIiwiZ2V0UHJvcCIsInJlcXVpcmUiLCJUT0tFTl9JVEVNX09GX0FSUkFZIiwiVE9LRU5fSU5ERVhfT0ZfQVJSQVkiLCJUT0tFTl9DT1VOVF9PRl9BUlJBWSIsIlNjb3BlRGF0YSIsImRhdGEiLCJhbGxEYXRhIiwiZ2V0U2NvcGVEYXRhIiwibGFzdEtleSIsImN1clBhdGgiLCJzbGljZSIsImN1clNjb3BlUGF0aCIsImNvbmNhdCIsIlRhZ0Rpc3Bvc2l0aW9uIiwiVGFnUGFyc2VyIiwiZG9jUGFyc2VyIiwidGFnUmVnZXgiLCJSZWdFeHAiLCJ0YWdTdGFydCIsInRhZ0VuZCIsInRhZ3MiLCJvcGVuZWRUYWciLCJvcGVuZWREZWxpbWl0ZXIiLCJkZWxpbWl0ZXIiLCJjbG9zZVRhZ1RleHQiLCJvcGVuVGFnVGV4dCIsIm5vcm1hbGl6ZVRhZ05vZGVzIiwicHJvY2Vzc1RhZyIsIm9wZW5EZWxpbWl0ZXIiLCJjbG9zZURlbGltaXRlciIsImNsb3NlRGVsaW1pdGVySW5kZXgiLCJhbGxEZWxpbWl0ZXJzIiwic3RhcnRUZXh0Tm9kZSIsImVuZFRleHROb2RlIiwic2FtZU5vZGUiLCJzcGxpdFRleHROb2RlIiwidXBkYXRlZCIsImN1ckRlbGltaXRlciIsInRhZyIsInJhd1RleHQiLCJ0YWdQYXJ0cyIsImV4ZWMiLCJ0YWdDb250ZW50IiwiZGlzcG9zaXRpb24iLCJTZWxmQ2xvc2VkIiwic3RhcnRzV2l0aCIsImNvbnRhaW5lclRhZ09wZW4iLCJPcGVuIiwiY29udGFpbmVyVGFnQ2xvc2UiLCJDbG9zZSIsIk1pbWVUeXBlIiwiTWltZVR5cGVIZWxwZXIiLCJnZXREZWZhdWx0RXh0ZW5zaW9uIiwibWltZSIsIlBuZyIsIkpwZWciLCJHaWYiLCJCbXAiLCJTdmciLCJnZXRPZmZpY2VSZWxUeXBlIiwiVGVtcGxhdGVQbHVnaW4iLCJzZXRVdGlsaXRpZXMiLCJ1dGlsaXRpZXMiLCJzaW1wbGVUYWdSZXBsYWNlbWVudHMiLCJjb250ZXh0IiwiY29udGFpbmVyVGFnUmVwbGFjZW1lbnRzIiwibmV4dEltYWdlSWQiLCJJbWFnZVBsdWdpbiIsIndvcmRUZXh0Tm9kZSIsImNvbnRhaW5pbmdUZXh0Tm9kZSIsImNvbnRlbnQiLCJzb3VyY2UiLCJtZWRpYUZpbGVQYXRoIiwiZG9jeCIsIm1lZGlhRmlsZXMiLCJhZGQiLCJmb3JtYXQiLCJyZWxUeXBlIiwicmVsSWQiLCJjdXJyZW50UGFydCIsInJlbHMiLCJjb250ZW50VHlwZXMiLCJlbnN1cmVDb250ZW50VHlwZSIsImltYWdlSWQiLCJpbWFnZVhtbCIsImNyZWF0ZU1hcmt1cCIsIndpZHRoIiwiaGVpZ2h0IiwibWFya3VwVGV4dCIsInBpeGVsc1RvRW11IiwicGljdHVyZU1hcmt1cCIsIm1hcmt1cFhtbCIsInhtbFBhcnNlciIsInBpeGVscyIsIk1hdGgiLCJyb3VuZCIsIkNvbnRlbnRQYXJ0VHlwZSIsIkNvbnRlbnRUeXBlc0ZpbGUiLCJ6aXAiLCJwYXJzZUNvbnRlbnRUeXBlc0ZpbGUiLCJleHRlbnNpb24iLCJ0eXBlTm9kZSIsInJvb3QiLCJhZGRlZE5ldyIsImNvdW50Iiwic2F2ZSIsInhtbENvbnRlbnQiLCJzZXRGaWxlIiwiY29udGVudFR5cGVzRmlsZVBhdGgiLCJjb250ZW50VHlwZXNYbWwiLCJnZXRGaWxlIiwiZ2V0Q29udGVudFRleHQiLCJnZW5Ob2RlIiwiY29udGVudFR5cGVBdHRyaWJ1dGUiLCJNZWRpYUZpbGVzIiwiTWFwIiwibWVkaWFGaWxlIiwiZmlsZXMiLCJoYXMiLCJnZXQiLCJoYXNoTWVkaWFGaWxlcyIsImhhc2giLCJoYXNoZXMiLCJwIiwibmV4dEZpbGVJZCIsIm1lZGlhRGlyIiwic2V0IiwibGlzdEZpbGVzIiwiZmlsZW5hbWUiLCJmaWxlRGF0YSIsImdldENvbnRlbnRCYXNlNjQiLCJmaWxlSGFzaCIsIlJlbGF0aW9uc2hpcCIsImZyb21YbWwiLCJpZCIsInR5cGUiLCJ0YXJnZXQiLCJ0YXJnZXRNb2RlIiwiaW5pdGlhbCIsInRvWG1sIiwicHJvcEtleSIsImF0dHJOYW1lIiwidG9VcHBlckNhc2UiLCJSZWxzIiwicGFydFBhdGgiLCJwYXJ0RGlyIiwicGFydEZpbGVuYW1lIiwicmVsc0ZpbGVQYXRoIiwicmVsVGFyZ2V0IiwicmVsVGFyZ2V0TW9kZSIsInBhcnNlUmVsc0ZpbGUiLCJyZWxUYXJnZXRLZXkiLCJnZXRSZWxUYXJnZXRLZXkiLCJyZWxUYXJnZXRzIiwiZ2V0TmV4dFJlbElkIiwicmVsIiwibGlzdCIsInZhbHVlcyIsImNyZWF0ZVJvb3ROb2RlIiwibmV4dFJlbElkIiwicmVsc0ZpbGUiLCJyZWxOb2RlIiwiaWRBdHRyIiwidHlwZUF0dHIiLCJ0YXJnZXRBdHRyIiwiWG1sUGFydCIsInhtbFJvb3QiLCJnZXRUZXh0IiwieG1sRG9jdW1lbnQiLCJkb21Eb2N1bWVudCIsInNhdmVDaGFuZ2VzIiwiRG9jeCIsIm9wZW4iLCJtYWluRG9jdW1lbnRQYXRoIiwiZ2V0TWFpbkRvY3VtZW50UGF0aCIsInJvb3RQYXJ0Iiwicm9vdFJlbHMiLCJyZWxhdGlvbnMiLCJtYWluRG9jdW1lbnRSZWxUeXBlIiwicmF3WmlwRmlsZSIsIm1haW5Eb2N1bWVudCIsImdldENvbnRlbnRQYXJ0IiwiTWFpbkRvY3VtZW50IiwiZ2V0SGVhZGVyT3JGb290ZXIiLCJnZXRDb250ZW50UGFydHMiLCJwYXJ0VHlwZXMiLCJEZWZhdWx0SGVhZGVyIiwiRmlyc3RIZWFkZXIiLCJFdmVuUGFnZXNIZWFkZXIiLCJEZWZhdWx0Rm9vdGVyIiwiRmlyc3RGb290ZXIiLCJFdmVuUGFnZXNGb290ZXIiLCJhbGwiLCJleHBvcnQiLCJvdXRwdXRUeXBlIiwiaGVhZGVyRm9vdGVyTm9kZU5hbWUiLCJub2RlVHlwZUF0dHJpYnV0ZSIsImhlYWRlckZvb3RlclR5cGUiLCJkb2NSb290IiwiYm9keSIsInNlY3Rpb25Qcm9wcyIsInJlZmVyZW5jZSIsInIiLCJfcGFydHMiLCJjb250ZW50UGFydFR5cGUiLCJEb2N4UGFyc2VyIiwibG9hZCIsInRleHROb2RlIiwic3BsaXRJbmRleCIsImFkZEJlZm9yZSIsImZpcnN0WG1sVGV4dE5vZGUiLCJzZWNvbmRYbWxUZXh0Tm9kZSIsIm5ld1dvcmRUZXh0Tm9kZSIsInNldFNwYWNlUHJlc2VydmVBdHRyaWJ1dGUiLCJjdXJJbmRleCIsImZpcnN0VGV4dCIsInNlY29uZFRleHQiLCJzcGxpdFBhcmFncmFwaEJ5VGV4dE5vZGUiLCJwYXJhZ3JhcGgiLCJyZW1vdmVUZXh0Tm9kZSIsImNvbnRhaW5pbmdQYXJhZ3JhcGgiLCJjb250YWluaW5nUGFyYWdyYXBoTm9kZSIsInJ1bk5vZGUiLCJjb250YWluaW5nUnVuTm9kZSIsImxlZnRSdW4iLCJyaWdodFJ1biIsInJ1blByb3BzIiwiUlVOX1BST1BFUlRJRVNfTk9ERSIsImxlZnRSdW5Qcm9wcyIsImZpcnN0UnVuQ2hpbGRJbmRleCIsImxlZnRQYXJhIiwicmlnaHRQYXJhIiwicGFyYWdyYXBoUHJvcHMiLCJQQVJBR1JBUEhfUFJPUEVSVElFU19OT0RFIiwibGVmdFBhcmFncmFwaFByb3BzIiwiZmlyc3RQYXJhQ2hpbGRJbmRleCIsImlzRW1wdHlSdW4iLCJmaXJzdFJ1bk5vZGUiLCJzZWNvbmRSdW5Ob2RlIiwicGFyYWdyYXBoTm9kZSIsImZpcnN0V29yZFRleHROb2RlIiwic2Vjb25kV29yZFRleHROb2RlIiwidG90YWxUZXh0IiwiY3VyUnVuTm9kZSIsImN1cldvcmRUZXh0Tm9kZSIsImZpcnN0VGV4dE5vZGVDaGlsZCIsImN1clhtbFRleHROb2RlIiwidGV4dFRvUmVtb3ZlIiwicnVuVG9SZW1vdmUiLCJqb2luUGFyYWdyYXBocyIsInNlY29uZCIsIlJVTl9OT0RFIiwiaXNSdW5Ob2RlIiwiaXNSdW5Qcm9wZXJ0aWVzTm9kZSIsImlzVGFibGVDZWxsTm9kZSIsIlRBQkxFX0NFTExfTk9ERSIsIlBBUkFHUkFQSF9OT0RFIiwiaXNMaXN0UGFyYWdyYXBoIiwicGFyYWdyYXBoUHJvcGVydGllcyIsInBhcmFncmFwaFByb3BlcnRpZXNOb2RlIiwibGlzdE51bWJlclByb3BlcnRpZXMiLCJOVU1CRVJfUFJPUEVSVElFU19OT0RFIiwiY29udGFpbmluZ1RhYmxlUm93Tm9kZSIsIlRBQkxFX1JPV19OT0RFIiwiaXNFbXB0eVRleHROb2RlIiwiTGlua1BsdWdpbiIsImxpbmtSZWxUeXBlIiwid29yZFJ1bk5vZGUiLCJsaW5rTWFya3VwIiwiZ2VuZXJhdGVNYXJrdXAiLCJpbnNlcnRIeXBlcmxpbmtOb2RlIiwibGlua1J1blByb3BzIiwidW5zaGlmdCIsInRhZ1J1bk5vZGUiLCJ0YWdUZXh0Tm9kZSIsInRleHROb2Rlc0luUnVuIiwicnVuQmVmb3JlVGFnIiwiTG9vcExpc3RTdHJhdGVneSIsImlzQXBwbGljYWJsZSIsInNwbGl0QmVmb3JlIiwiZmlyc3RQYXJhZ3JhcGgiLCJsYXN0UGFyYWdyYXBoIiwicGFyYWdyYXBoc1RvUmVwZWF0Iiwibm9kZXNUb1JlcGVhdCIsIm1lcmdlQmFjayIsInBhcmFncmFwaEdyb3VwcyIsImxhc3RQYXJhZ3JhcGhzIiwiY3VyUGFyYWdyYXBoc0dyb3VwIiwiTG9vcFBhcmFncmFwaFN0cmF0ZWd5IiwiYXJlU2FtZSIsInNwbGl0UmVzdWx0IiwiYWZ0ZXJGaXJzdFBhcmFncmFwaCIsImJlZm9yZUxhc3RQYXJhZ3JhcGgiLCJtaWRkbGVQYXJhZ3JhcGhzIiwiaW5CZXR3ZWVuIiwibWVyZ2VUbyIsIkxvb3BUYWJsZVN0cmF0ZWd5IiwiZmlyc3RSb3ciLCJsYXN0Um93Iiwicm93c1RvUmVwZWF0Iiwicm93R3JvdXBzIiwiY3VyUm93c0dyb3VwIiwicm93IiwiTE9PUF9DT05URU5UX1RZUEUiLCJMb29wUGx1Z2luIiwibG9vcFN0cmF0ZWdpZXMiLCJzdHJhdGVneSIsImlzQXJyYXkiLCJsb29wU3RyYXRlZ3kiLCJyZXBlYXRlZE5vZGVzIiwicmVwZWF0IiwiY29tcGlsZWROb2RlcyIsImNvbXBpbGUiLCJub2RlcyIsInRpbWVzIiwiYWxsUmVzdWx0cyIsImN1clJlc3VsdCIsIm5vZGVHcm91cHMiLCJjb21waWxlZE5vZGVHcm91cHMiLCJjdXJOb2RlcyIsImR1bW15Um9vdE5vZGUiLCJjb21waWxlciIsInBvcCIsIlJhd1htbFBsdWdpbiIsInJlcGxhY2VOb2RlIiwicmVwbGFjZVBhcmFncmFwaCIsIlRFWFRfQ09OVEVOVF9UWVBFIiwiVGV4dFBsdWdpbiIsInN0cmluZ1ZhbHVlIiwibGluZXMiLCJzcGxpdCIsInJlcGxhY2VTaW5nbGVMaW5lIiwicmVwbGFjZU11bHRpTGluZSIsImxpbmVCcmVhayIsImdldExpbmVCcmVhayIsImxpbmVOb2RlIiwiY3JlYXRlV29yZFRleHROb2RlIiwiY3JlYXRlRGVmYXVsdFBsdWdpbnMiLCJQbHVnaW5Db250ZW50IiwiaXNQbHVnaW5Db250ZW50IiwiX3R5cGUiLCJUZW1wbGF0ZUNvbXBpbGVyIiwiZGVsaW1pdGVyU2VhcmNoZXIiLCJ0YWdQYXJzZXIiLCJwbHVnaW5zIiwiZGVmYXVsdENvbnRlbnRUeXBlIiwiY29udGFpbmVyQ29udGVudFR5cGUiLCJwbHVnaW5zTG9va3VwIiwicGFyc2VUYWdzIiwiZG9UYWdSZXBsYWNlbWVudHMiLCJ0YWdJbmRleCIsImRldGVjdENvbnRlbnRUeXBlIiwicGx1Z2luIiwiam9iIiwiY2xvc2luZ1RhZ0luZGV4IiwiZmluZENsb3NlVGFnSW5kZXgiLCJzY29wZVRhZ3MiLCJzY29wZURhdGEiLCJmcm9tSW5kZXgiLCJUZW1wbGF0ZUV4dGVuc2lvbiIsIkpzWmlwSGVscGVyIiwidG9Kc1ppcE91dHB1dFR5cGUiLCJiaW5hcnlPclR5cGUiLCJaaXBPYmplY3QiLCJ6aXBPYmplY3QiLCJpc0RpcmVjdG9yeSIsImRpciIsImFzeW5jIiwiZ2V0Q29udGVudEJpbmFyeSIsInppcE91dHB1dFR5cGUiLCJaaXAiLCJmaWxlIiwiSlNaaXAiLCJpbnRlcm5hbFppcE9iamVjdCIsImlzRmlsZUV4aXN0Iiwib3V0cHV0IiwiZ2VuZXJhdGVBc3luYyIsImNvbXByZXNzaW9uIiwiY29tcHJlc3Npb25PcHRpb25zIiwibGV2ZWwiLCJEZWxpbWl0ZXJzIiwiZW5jb2RlQW5kVmFsaWRhdGUiLCJUZW1wbGF0ZUhhbmRsZXJPcHRpb25zIiwiVGVtcGxhdGVIYW5kbGVyIiwib3B0aW9ucyIsImV4dGVuc2lvblV0aWxpdGllcyIsImV4dGVuc2lvbnMiLCJiZWZvcmVDb21waWxhdGlvbiIsImFmdGVyQ29tcGlsYXRpb24iLCJwcm9jZXNzIiwidGVtcGxhdGVGaWxlIiwibG9hZERvY3giLCJjb250ZW50UGFydHMiLCJjYWxsRXh0ZW5zaW9ucyIsImNvbnRlbnRQYXJ0IiwiZG9j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
