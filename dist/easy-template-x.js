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

/***/ "./node_modules/buffer/index.js":
/*!**************************************!*\
  !*** ./node_modules/buffer/index.js ***!
  \**************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(/*! base64-js */ "base64-js")
var ieee754 = __webpack_require__(/*! ieee754 */ "ieee754")
var isArray = __webpack_require__(/*! isarray */ "isarray")

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./src/errors/index.ts":
/*!*****************************************!*\
  !*** ./src/errors/index.ts + 9 modules ***!
  \*****************************************/
/*! exports provided: MaxXmlDepthError, MissingArgumentError, MissingCloseDelimiterError, MissingStartDelimiterError, UnclosedTagError, UnidentifiedFileTypeError, UnknownPrefixError, UnopenedTagError, UnsupportedFileTypeError */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

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
    function MissingCloseDelimiterError(openDelimiterText) {
        var _this = _super.call(this, "Close delimiter is missing from '" + openDelimiterText + "'.") || this;
        _this.openDelimiterText = openDelimiterText;
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
    function MissingStartDelimiterError(closeDelimiterText) {
        var _this = _super.call(this, "Open delimiter is missing from '" + closeDelimiterText + "'.") || this;
        _this.closeDelimiterText = closeDelimiterText;
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
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "MaxXmlDepthError", function() { return MaxXmlDepthError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "MissingArgumentError", function() { return MissingArgumentError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "MissingCloseDelimiterError", function() { return MissingCloseDelimiterError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "MissingStartDelimiterError", function() { return MissingStartDelimiterError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "UnclosedTagError", function() { return UnclosedTagError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "UnidentifiedFileTypeError", function() { return UnidentifiedFileTypeError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "UnknownPrefixError", function() { return UnknownPrefixError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "UnopenedTagError", function() { return UnopenedTagError; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "UnsupportedFileTypeError", function() { return UnsupportedFileTypeError; });











/***/ }),

/***/ "./src/index.ts":
/*!***********************************!*\
  !*** ./src/index.ts + 22 modules ***!
  \***********************************/
/*! exports provided: Delimiters, DocxParser, TemplateHandler, TemplateHandlerOptions, Binary, XmlNodeType, TEXT_NODE_NAME_VALUE, XmlNode, XmlParser, DelimiterMark, DelimiterSearcher, ScopeData, TagDisposition, Tag, TagParser, TemplateCompiler, MaxXmlDepthError, MissingArgumentError, MissingCloseDelimiterError, MissingStartDelimiterError, UnclosedTagError, UnidentifiedFileTypeError, UnknownPrefixError, UnopenedTagError, UnsupportedFileTypeError, createDefaultPlugins, LoopPlugin, RawXmlPlugin, TemplatePlugin, TextPlugin */
/*! ModuleConcatenation bailout: Cannot concat with ./src/errors/index.ts because of ./src/utils/binary.ts */
/*! ModuleConcatenation bailout: Cannot concat with ./src/utils/binary.ts (<- Module uses injected variables (Buffer)) */
/*! ModuleConcatenation bailout: Cannot concat with external "jszip" (<- Module is not an ECMAScript module) */
/*! ModuleConcatenation bailout: Cannot concat with external "xmldom" (<- Module is not an ECMAScript module) */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// CONCATENATED MODULE: ./src/compilation/delimiterMark.ts
var DelimiterMark = (function () {
    function DelimiterMark(initial) {
        Object.assign(this, initial);
    }
    return DelimiterMark;
}());


// EXTERNAL MODULE: ./src/errors/index.ts + 9 modules
var errors = __webpack_require__("./src/errors/index.ts");

// CONCATENATED MODULE: ./src/utils/array.ts
function pushMany(destArray, items) {
    Array.prototype.push.apply(destArray, items);
}
function last(array) {
    if (!array.length)
        return undefined;
    return array[array.length - 1];
}

// EXTERNAL MODULE: ./src/utils/binary.ts
var binary = __webpack_require__("./src/utils/binary.ts");

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
            throw new errors["MissingArgumentError"]("str");
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
            return encodeValue(node.textContent || '');
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
            throw new errors["MissingArgumentError"](nameof(node));
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
            throw new errors["MissingArgumentError"](nameof(newNode));
        if (!referenceNode)
            throw new errors["MissingArgumentError"](nameof(referenceNode));
        if (!referenceNode.parentNode)
            throw new Error("'" + nameof(referenceNode) + "' has no parent");
        var childNodes = referenceNode.parentNode.childNodes;
        var beforeNodeIndex = childNodes.indexOf(referenceNode);
        XmlNode.insertChild(referenceNode.parentNode, newNode, beforeNodeIndex);
    }
    XmlNode.insertBefore = insertBefore;
    function insertAfter(newNode, referenceNode) {
        if (!newNode)
            throw new errors["MissingArgumentError"](nameof(newNode));
        if (!referenceNode)
            throw new errors["MissingArgumentError"](nameof(referenceNode));
        if (!referenceNode.parentNode)
            throw new Error("'" + nameof(referenceNode) + "' has no parent");
        var childNodes = referenceNode.parentNode.childNodes;
        var referenceNodeIndex = childNodes.indexOf(referenceNode);
        XmlNode.insertChild(referenceNode.parentNode, newNode, referenceNodeIndex + 1);
    }
    XmlNode.insertAfter = insertAfter;
    function insertChild(parent, child, childIndex) {
        if (!parent)
            throw new errors["MissingArgumentError"](nameof(parent));
        if (isTextNode(parent))
            throw new Error('Appending children to text nodes is forbidden');
        if (!child)
            throw new errors["MissingArgumentError"](nameof(child));
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
            throw new errors["MissingArgumentError"](nameof(parent));
        if (isTextNode(parent))
            throw new Error('Appending children to text nodes is forbidden');
        if (!child)
            throw new errors["MissingArgumentError"](nameof(child));
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
            throw new errors["MissingArgumentError"](nameof(node));
        if (!node.parentNode)
            throw new Error('Node has no parent');
        removeChild(node.parentNode, node);
    }
    XmlNode.remove = remove;
    function removeChild(parent, childOrIndex) {
        if (!parent)
            throw new errors["MissingArgumentError"](nameof(parent));
        if (childOrIndex === null || childOrIndex === undefined)
            throw new errors["MissingArgumentError"](nameof(childOrIndex));
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
            throw new errors["MaxXmlDepthError"](this.maxXmlDepth);
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
            throw new errors["MissingArgumentError"]("tagPrefixes");
        if (!docParser)
            throw new errors["MissingArgumentError"]("docParser");
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
                var closeTagText = delimiter.xmlTextNode.textContent;
                throw new errors["MissingStartDelimiterError"](closeTagText);
            }
            if (openedTag && delimiter.isOpen) {
                var openTagText = openedDelimiter.xmlTextNode.textContent;
                throw new errors["MissingCloseDelimiterError"](openTagText);
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
            throw new errors["UnknownPrefixError"](tag.rawText);
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
        var tags = this.parseTags(node);
        this.doTagReplacements(tags, data, context);
    };
    TemplateCompiler.prototype.parseTags = function (node) {
        var delimiters = this.delimiterSearcher.findDelimiters(node);
        var tags = this.tagParser.parse(delimiters);
        return tags;
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
            throw new errors["UnclosedTagError"](openTag.name);
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




var loopPlugin_LoopPlugin = (function (_super) {
    __extends(LoopPlugin, _super);
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
        var coreFiles = [
            "word/document.xml",
            "word/document2.xml"
        ];
        return coreFiles;
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
        var wordTextNode = this.utilities.docxParser.containingTextNode(textNode);
        if (!wordTextNode.attributes) {
            wordTextNode.attributes = [];
        }
        if (!wordTextNode.attributes.find(function (attr) { return attr.name === 'xml:space'; })) {
            wordTextNode.attributes.push(this.getSpacePreserveAttribute());
        }
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
    TextPlugin.prototype.getSpacePreserveAttribute = function () {
        return {
            name: 'xml:space',
            value: 'preserve'
        };
    };
    TextPlugin.prototype.getLineBreak = function () {
        return {
            nodeType: XmlNodeType.General,
            nodeName: 'w:br'
        };
    };
    TextPlugin.prototype.createWordTextNode = function (text) {
        var wordTextNode = xmlNode_XmlNode.createGeneralNode(docxParser_DocxParser.TEXT_NODE);
        wordTextNode.attributes = [this.getSpacePreserveAttribute()];
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
        throw new errors["UnidentifiedFileTypeError"]();
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


// EXTERNAL MODULE: external "xmldom"
var external_xmldom_ = __webpack_require__("xmldom");

// CONCATENATED MODULE: ./src/xmlParser.ts



var xmlParser_XmlParser = (function () {
    function XmlParser() {
    }
    XmlParser.prototype.parse = function (str) {
        var doc = this.domParse(str);
        return xmlNode_XmlNode.fromDomNode(doc.documentElement);
    };
    XmlParser.prototype.domParse = function (str) {
        if (str === null || str === undefined)
            throw new errors["MissingArgumentError"]("str");
        return XmlParser.parser.parseFromString(str, "text/xml");
    };
    XmlParser.prototype.serialize = function (xmlNode) {
        return XmlParser.xmlHeader + xmlNode_XmlNode.serialize(xmlNode);
    };
    XmlParser.xmlHeader = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    XmlParser.parser = new external_xmldom_["DOMParser"]();
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
                        outputType = binary["Binary"].toJsZipOutputType(templateFile);
                        return [2, docFile.generateAsync({ type: outputType })];
                }
            });
        });
    };
    TemplateHandler.prototype.parseTags = function (templateFile) {
        return __awaiter(this, void 0, void 0, function () {
            var docFile, contentDocuments, tags, _i, _a, file, docTags;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, this.loadDocx(templateFile)];
                    case 1:
                        docFile = _b.sent();
                        return [4, this.parseContentDocuments(docFile)];
                    case 2:
                        contentDocuments = _b.sent();
                        tags = [];
                        for (_i = 0, _a = Object.keys(contentDocuments); _i < _a.length; _i++) {
                            file = _a[_i];
                            docTags = this.compiler.parseTags(contentDocuments[file]);
                            pushMany(tags, docTags);
                        }
                        return [2, tags];
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
                            throw new errors["UnsupportedFileTypeError"](fileType);
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
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "MaxXmlDepthError", function() { return errors["MaxXmlDepthError"]; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "MissingArgumentError", function() { return errors["MissingArgumentError"]; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "MissingCloseDelimiterError", function() { return errors["MissingCloseDelimiterError"]; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "MissingStartDelimiterError", function() { return errors["MissingStartDelimiterError"]; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "UnclosedTagError", function() { return errors["UnclosedTagError"]; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "UnidentifiedFileTypeError", function() { return errors["UnidentifiedFileTypeError"]; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "UnknownPrefixError", function() { return errors["UnknownPrefixError"]; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "UnopenedTagError", function() { return errors["UnopenedTagError"]; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "UnsupportedFileTypeError", function() { return errors["UnsupportedFileTypeError"]; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "createDefaultPlugins", function() { return createDefaultPlugins; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "LoopPlugin", function() { return loopPlugin_LoopPlugin; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "RawXmlPlugin", function() { return rawXmlPlugin_RawXmlPlugin; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "TemplatePlugin", function() { return TemplatePlugin; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "TextPlugin", function() { return textPlugin_TextPlugin; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Delimiters", function() { return delimiters_Delimiters; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "DocxParser", function() { return docxParser_DocxParser; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "TemplateHandler", function() { return templateHandler_TemplateHandler; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "TemplateHandlerOptions", function() { return templateHandlerOptions_TemplateHandlerOptions; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Binary", function() { return binary["Binary"]; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "XmlNodeType", function() { return XmlNodeType; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "TEXT_NODE_NAME_VALUE", function() { return TEXT_NODE_NAME_VALUE; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "XmlNode", function() { return xmlNode_XmlNode; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "XmlParser", function() { return xmlParser_XmlParser; });












/***/ }),

/***/ "./src/utils/binary.ts":
/*!*****************************!*\
  !*** ./src/utils/binary.ts ***!
  \*****************************/
/*! exports provided: Binary */
/*! ModuleConcatenation bailout: Module uses injected variables (Buffer) */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(Buffer) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Binary", function() { return Binary; });
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../errors */ "./src/errors/index.ts");

var Binary;
(function (Binary) {
    function toJsZipOutputType(binary) {
        if (!binary)
            throw new _errors__WEBPACK_IMPORTED_MODULE_0__["MissingArgumentError"]("binary");
        if (typeof Blob !== 'undefined' && binary instanceof Blob)
            return 'blob';
        if (typeof ArrayBuffer !== 'undefined' && binary instanceof ArrayBuffer)
            return 'arraybuffer';
        if (typeof Buffer !== 'undefined' && binary instanceof Buffer)
            return 'nodebuffer';
        throw new Error("Binary type '" + binary.constructor.name + "' is not supported.");
    }
    Binary.toJsZipOutputType = toJsZipOutputType;
})(Binary || (Binary = {}));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/buffer/index.js */ "./node_modules/buffer/index.js").Buffer))

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

/***/ "base64-js":
/*!****************************!*\
  !*** external "base64-js" ***!
  \****************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

module.exports = require("base64-js");

/***/ }),

/***/ "ieee754":
/*!**************************!*\
  !*** external "ieee754" ***!
  \**************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

module.exports = require("ieee754");

/***/ }),

/***/ "isarray":
/*!**************************!*\
  !*** external "isarray" ***!
  \**************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

module.exports = require("isarray");

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