var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "node_modules/safe-buffer/index.js"(exports2, module2) {
    var buffer = require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module2.exports = buffer;
    } else {
      copyProps(buffer, exports2);
      exports2.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    SafeBuffer.prototype = Object.create(Buffer2.prototype);
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node_modules/cookie/index.js
var require_cookie = __commonJS({
  "node_modules/cookie/index.js"(exports2) {
    "use strict";
    exports2.parse = parse;
    exports2.serialize = serialize;
    var __toString = Object.prototype.toString;
    var __hasOwnProperty = Object.prototype.hasOwnProperty;
    var cookieNameRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
    var cookieValueRegExp = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    function parse(str, opt) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var len = str.length;
      if (len < 2) return obj;
      var dec = opt && opt.decode || decode;
      var index = 0;
      var eqIdx = 0;
      var endIdx = 0;
      do {
        eqIdx = str.indexOf("=", index);
        if (eqIdx === -1) break;
        endIdx = str.indexOf(";", index);
        if (endIdx === -1) {
          endIdx = len;
        } else if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        var keyStartIdx = startIndex(str, index, eqIdx);
        var keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        var key = str.slice(keyStartIdx, keyEndIdx);
        if (!__hasOwnProperty.call(obj, key)) {
          var valStartIdx = startIndex(str, eqIdx + 1, endIdx);
          var valEndIdx = endIndex(str, endIdx, valStartIdx);
          if (str.charCodeAt(valStartIdx) === 34 && str.charCodeAt(valEndIdx - 1) === 34) {
            valStartIdx++;
            valEndIdx--;
          }
          var val = str.slice(valStartIdx, valEndIdx);
          obj[key] = tryDecode(val, dec);
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function startIndex(str, index, max) {
      do {
        var code = str.charCodeAt(index);
        if (code !== 32 && code !== 9) return index;
      } while (++index < max);
      return max;
    }
    function endIndex(str, index, min) {
      while (index > min) {
        var code = str.charCodeAt(--index);
        if (code !== 32 && code !== 9) return index + 1;
      }
      return min;
    }
    function serialize(name, val, opt) {
      var enc = opt && opt.encode || encodeURIComponent;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!cookieNameRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (!opt) return str;
      if (null != opt.maxAge) {
        var maxAge = Math.floor(opt.maxAge);
        if (!isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + maxAge;
      }
      if (opt.domain) {
        if (!domainValueRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!pathValueRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        var expires = opt.expires;
        if (!isDate(expires) || isNaN(expires.valueOf())) {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.partitioned) {
        str += "; Partitioned";
      }
      if (opt.priority) {
        var priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError("option priority is invalid");
        }
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function decode(str) {
      return str.indexOf("%") !== -1 ? decodeURIComponent(str) : str;
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e) {
        return str;
      }
    }
  }
});

// node_modules/express-session/node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/express-session/node_modules/ms/index.js"(exports2, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isNaN(val) === false) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      if (ms >= d) {
        return Math.round(ms / d) + "d";
      }
      if (ms >= h) {
        return Math.round(ms / h) + "h";
      }
      if (ms >= m) {
        return Math.round(ms / m) + "m";
      }
      if (ms >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      return plural(ms, d, "day") || plural(ms, h, "hour") || plural(ms, m, "minute") || plural(ms, s, "second") || ms + " ms";
    }
    function plural(ms, n, name) {
      if (ms < n) {
        return;
      }
      if (ms < n * 1.5) {
        return Math.floor(ms / n) + " " + name;
      }
      return Math.ceil(ms / n) + " " + name + "s";
    }
  }
});

// node_modules/express-session/node_modules/debug/src/debug.js
var require_debug = __commonJS({
  "node_modules/express-session/node_modules/debug/src/debug.js"(exports2, module2) {
    exports2 = module2.exports = createDebug.debug = createDebug["default"] = createDebug;
    exports2.coerce = coerce;
    exports2.disable = disable;
    exports2.enable = enable;
    exports2.enabled = enabled;
    exports2.humanize = require_ms();
    exports2.names = [];
    exports2.skips = [];
    exports2.formatters = {};
    var prevTime;
    function selectColor(namespace) {
      var hash = 0, i;
      for (i in namespace) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return exports2.colors[Math.abs(hash) % exports2.colors.length];
    }
    function createDebug(namespace) {
      function debug() {
        if (!debug.enabled) return;
        var self = debug;
        var curr = +/* @__PURE__ */ new Date();
        var ms = curr - (prevTime || curr);
        self.diff = ms;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        args[0] = exports2.coerce(args[0]);
        if ("string" !== typeof args[0]) {
          args.unshift("%O");
        }
        var index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
          if (match === "%%") return match;
          index++;
          var formatter = exports2.formatters[format];
          if ("function" === typeof formatter) {
            var val = args[index];
            match = formatter.call(self, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        exports2.formatArgs.call(self, args);
        var logFn = debug.log || exports2.log || console.log.bind(console);
        logFn.apply(self, args);
      }
      debug.namespace = namespace;
      debug.enabled = exports2.enabled(namespace);
      debug.useColors = exports2.useColors();
      debug.color = selectColor(namespace);
      if ("function" === typeof exports2.init) {
        exports2.init(debug);
      }
      return debug;
    }
    function enable(namespaces) {
      exports2.save(namespaces);
      exports2.names = [];
      exports2.skips = [];
      var split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      var len = split.length;
      for (var i = 0; i < len; i++) {
        if (!split[i]) continue;
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          exports2.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
        } else {
          exports2.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable() {
      exports2.enable("");
    }
    function enabled(name) {
      var i, len;
      for (i = 0, len = exports2.skips.length; i < len; i++) {
        if (exports2.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = exports2.names.length; i < len; i++) {
        if (exports2.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) return val.stack || val.message;
      return val;
    }
  }
});

// node_modules/express-session/node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/express-session/node_modules/debug/src/browser.js"(exports2, module2) {
    exports2 = module2.exports = require_debug();
    exports2.log = log;
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : localstorage();
    exports2.colors = [
      "lightseagreen",
      "forestgreen",
      "goldenrod",
      "dodgerblue",
      "darkorchid",
      "crimson"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
        return true;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    exports2.formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (err) {
        return "[UnexpectedJSONParseError]: " + err.message;
      }
    };
    function formatArgs(args) {
      var useColors2 = this.useColors;
      args[0] = (useColors2 ? "%c" : "") + this.namespace + (useColors2 ? " %c" : " ") + args[0] + (useColors2 ? "%c " : " ") + "+" + exports2.humanize(this.diff);
      if (!useColors2) return;
      var c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if ("%%" === match) return;
        index++;
        if ("%c" === match) {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    function log() {
      return "object" === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
    }
    function save(namespaces) {
      try {
        if (null == namespaces) {
          exports2.storage.removeItem("debug");
        } else {
          exports2.storage.debug = namespaces;
        }
      } catch (e) {
      }
    }
    function load() {
      var r;
      try {
        r = exports2.storage.debug;
      } catch (e) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    exports2.enable(load());
    function localstorage() {
      try {
        return window.localStorage;
      } catch (e) {
      }
    }
  }
});

// node_modules/express-session/node_modules/debug/src/node.js
var require_node = __commonJS({
  "node_modules/express-session/node_modules/debug/src/node.js"(exports2, module2) {
    var tty = require("tty");
    var util = require("util");
    exports2 = module2.exports = require_debug();
    exports2.init = init;
    exports2.log = log;
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.colors = [6, 2, 3, 4, 5, 1];
    exports2.inspectOpts = Object.keys(process.env).filter(function(key) {
      return /^debug_/i.test(key);
    }).reduce(function(obj, key) {
      var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function(_, k) {
        return k.toUpperCase();
      });
      var val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
      else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
      else if (val === "null") val = null;
      else val = Number(val);
      obj[prop] = val;
      return obj;
    }, {});
    var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
    if (1 !== fd && 2 !== fd) {
      util.deprecate(function() {
      }, "except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)")();
    }
    var stream = 1 === fd ? process.stdout : 2 === fd ? process.stderr : createWritableStdioStream(fd);
    function useColors() {
      return "colors" in exports2.inspectOpts ? Boolean(exports2.inspectOpts.colors) : tty.isatty(fd);
    }
    exports2.formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map(function(str) {
        return str.trim();
      }).join(" ");
    };
    exports2.formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
    function formatArgs(args) {
      var name = this.namespace;
      var useColors2 = this.useColors;
      if (useColors2) {
        var c = this.color;
        var prefix = "  \x1B[3" + c + ";1m" + name + " \x1B[0m";
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push("\x1B[3" + c + "m+" + exports2.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = (/* @__PURE__ */ new Date()).toUTCString() + " " + name + " " + args[0];
      }
    }
    function log() {
      return stream.write(util.format.apply(util, arguments) + "\n");
    }
    function save(namespaces) {
      if (null == namespaces) {
        delete process.env.DEBUG;
      } else {
        process.env.DEBUG = namespaces;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function createWritableStdioStream(fd2) {
      var stream2;
      var tty_wrap = process.binding("tty_wrap");
      switch (tty_wrap.guessHandleType(fd2)) {
        case "TTY":
          stream2 = new tty.WriteStream(fd2);
          stream2._type = "tty";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        case "FILE":
          var fs = require("fs");
          stream2 = new fs.SyncWriteStream(fd2, { autoClose: false });
          stream2._type = "fs";
          break;
        case "PIPE":
        case "TCP":
          var net = require("net");
          stream2 = new net.Socket({
            fd: fd2,
            readable: false,
            writable: true
          });
          stream2.readable = false;
          stream2.read = null;
          stream2._type = "pipe";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        default:
          throw new Error("Implement me. Unknown stream file type!");
      }
      stream2.fd = fd2;
      stream2._isStdio = true;
      return stream2;
    }
    function init(debug) {
      debug.inspectOpts = {};
      var keys = Object.keys(exports2.inspectOpts);
      for (var i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports2.inspectOpts[keys[i]];
      }
    }
    exports2.enable(load());
  }
});

// node_modules/express-session/node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/express-session/node_modules/debug/src/index.js"(exports2, module2) {
    if (typeof process !== "undefined" && process.type === "renderer") {
      module2.exports = require_browser();
    } else {
      module2.exports = require_node();
    }
  }
});

// node_modules/depd/index.js
var require_depd = __commonJS({
  "node_modules/depd/index.js"(exports2, module2) {
    var relative = require("path").relative;
    module2.exports = depd;
    var basePath = process.cwd();
    function containsNamespace(str, namespace) {
      var vals = str.split(/[ ,]+/);
      var ns = String(namespace).toLowerCase();
      for (var i = 0; i < vals.length; i++) {
        var val = vals[i];
        if (val && (val === "*" || val.toLowerCase() === ns)) {
          return true;
        }
      }
      return false;
    }
    function convertDataDescriptorToAccessor(obj, prop, message) {
      var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      var value = descriptor.value;
      descriptor.get = function getter() {
        return value;
      };
      if (descriptor.writable) {
        descriptor.set = function setter(val) {
          return value = val;
        };
      }
      delete descriptor.value;
      delete descriptor.writable;
      Object.defineProperty(obj, prop, descriptor);
      return descriptor;
    }
    function createArgumentsString(arity) {
      var str = "";
      for (var i = 0; i < arity; i++) {
        str += ", arg" + i;
      }
      return str.substr(2);
    }
    function createStackString(stack) {
      var str = this.name + ": " + this.namespace;
      if (this.message) {
        str += " deprecated " + this.message;
      }
      for (var i = 0; i < stack.length; i++) {
        str += "\n    at " + stack[i].toString();
      }
      return str;
    }
    function depd(namespace) {
      if (!namespace) {
        throw new TypeError("argument namespace is required");
      }
      var stack = getStack();
      var site = callSiteLocation(stack[1]);
      var file = site[0];
      function deprecate(message) {
        log.call(deprecate, message);
      }
      deprecate._file = file;
      deprecate._ignored = isignored(namespace);
      deprecate._namespace = namespace;
      deprecate._traced = istraced(namespace);
      deprecate._warned = /* @__PURE__ */ Object.create(null);
      deprecate.function = wrapfunction;
      deprecate.property = wrapproperty;
      return deprecate;
    }
    function eehaslisteners(emitter, type) {
      var count = typeof emitter.listenerCount !== "function" ? emitter.listeners(type).length : emitter.listenerCount(type);
      return count > 0;
    }
    function isignored(namespace) {
      if (process.noDeprecation) {
        return true;
      }
      var str = process.env.NO_DEPRECATION || "";
      return containsNamespace(str, namespace);
    }
    function istraced(namespace) {
      if (process.traceDeprecation) {
        return true;
      }
      var str = process.env.TRACE_DEPRECATION || "";
      return containsNamespace(str, namespace);
    }
    function log(message, site) {
      var haslisteners = eehaslisteners(process, "deprecation");
      if (!haslisteners && this._ignored) {
        return;
      }
      var caller;
      var callFile;
      var callSite;
      var depSite;
      var i = 0;
      var seen = false;
      var stack = getStack();
      var file = this._file;
      if (site) {
        depSite = site;
        callSite = callSiteLocation(stack[1]);
        callSite.name = depSite.name;
        file = callSite[0];
      } else {
        i = 2;
        depSite = callSiteLocation(stack[i]);
        callSite = depSite;
      }
      for (; i < stack.length; i++) {
        caller = callSiteLocation(stack[i]);
        callFile = caller[0];
        if (callFile === file) {
          seen = true;
        } else if (callFile === this._file) {
          file = this._file;
        } else if (seen) {
          break;
        }
      }
      var key = caller ? depSite.join(":") + "__" + caller.join(":") : void 0;
      if (key !== void 0 && key in this._warned) {
        return;
      }
      this._warned[key] = true;
      var msg = message;
      if (!msg) {
        msg = callSite === depSite || !callSite.name ? defaultMessage(depSite) : defaultMessage(callSite);
      }
      if (haslisteners) {
        var err = DeprecationError(this._namespace, msg, stack.slice(i));
        process.emit("deprecation", err);
        return;
      }
      var format = process.stderr.isTTY ? formatColor : formatPlain;
      var output = format.call(this, msg, caller, stack.slice(i));
      process.stderr.write(output + "\n", "utf8");
    }
    function callSiteLocation(callSite) {
      var file = callSite.getFileName() || "<anonymous>";
      var line = callSite.getLineNumber();
      var colm = callSite.getColumnNumber();
      if (callSite.isEval()) {
        file = callSite.getEvalOrigin() + ", " + file;
      }
      var site = [file, line, colm];
      site.callSite = callSite;
      site.name = callSite.getFunctionName();
      return site;
    }
    function defaultMessage(site) {
      var callSite = site.callSite;
      var funcName = site.name;
      if (!funcName) {
        funcName = "<anonymous@" + formatLocation(site) + ">";
      }
      var context = callSite.getThis();
      var typeName = context && callSite.getTypeName();
      if (typeName === "Object") {
        typeName = void 0;
      }
      if (typeName === "Function") {
        typeName = context.name || typeName;
      }
      return typeName && callSite.getMethodName() ? typeName + "." + funcName : funcName;
    }
    function formatPlain(msg, caller, stack) {
      var timestamp = (/* @__PURE__ */ new Date()).toUTCString();
      var formatted = timestamp + " " + this._namespace + " deprecated " + msg;
      if (this._traced) {
        for (var i = 0; i < stack.length; i++) {
          formatted += "\n    at " + stack[i].toString();
        }
        return formatted;
      }
      if (caller) {
        formatted += " at " + formatLocation(caller);
      }
      return formatted;
    }
    function formatColor(msg, caller, stack) {
      var formatted = "\x1B[36;1m" + this._namespace + "\x1B[22;39m \x1B[33;1mdeprecated\x1B[22;39m \x1B[0m" + msg + "\x1B[39m";
      if (this._traced) {
        for (var i = 0; i < stack.length; i++) {
          formatted += "\n    \x1B[36mat " + stack[i].toString() + "\x1B[39m";
        }
        return formatted;
      }
      if (caller) {
        formatted += " \x1B[36m" + formatLocation(caller) + "\x1B[39m";
      }
      return formatted;
    }
    function formatLocation(callSite) {
      return relative(basePath, callSite[0]) + ":" + callSite[1] + ":" + callSite[2];
    }
    function getStack() {
      var limit = Error.stackTraceLimit;
      var obj = {};
      var prep = Error.prepareStackTrace;
      Error.prepareStackTrace = prepareObjectStackTrace;
      Error.stackTraceLimit = Math.max(10, limit);
      Error.captureStackTrace(obj);
      var stack = obj.stack.slice(1);
      Error.prepareStackTrace = prep;
      Error.stackTraceLimit = limit;
      return stack;
    }
    function prepareObjectStackTrace(obj, stack) {
      return stack;
    }
    function wrapfunction(fn, message) {
      if (typeof fn !== "function") {
        throw new TypeError("argument fn must be a function");
      }
      var args = createArgumentsString(fn.length);
      var stack = getStack();
      var site = callSiteLocation(stack[1]);
      site.name = fn.name;
      var deprecatedfn = new Function(
        "fn",
        "log",
        "deprecate",
        "message",
        "site",
        '"use strict"\nreturn function (' + args + ") {log.call(deprecate, message, site)\nreturn fn.apply(this, arguments)\n}"
      )(fn, log, this, message, site);
      return deprecatedfn;
    }
    function wrapproperty(obj, prop, message) {
      if (!obj || typeof obj !== "object" && typeof obj !== "function") {
        throw new TypeError("argument obj must be object");
      }
      var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      if (!descriptor) {
        throw new TypeError("must call property on owner object");
      }
      if (!descriptor.configurable) {
        throw new TypeError("property must be configurable");
      }
      var deprecate = this;
      var stack = getStack();
      var site = callSiteLocation(stack[1]);
      site.name = prop;
      if ("value" in descriptor) {
        descriptor = convertDataDescriptorToAccessor(obj, prop, message);
      }
      var get = descriptor.get;
      var set = descriptor.set;
      if (typeof get === "function") {
        descriptor.get = function getter() {
          log.call(deprecate, message, site);
          return get.apply(this, arguments);
        };
      }
      if (typeof set === "function") {
        descriptor.set = function setter() {
          log.call(deprecate, message, site);
          return set.apply(this, arguments);
        };
      }
      Object.defineProperty(obj, prop, descriptor);
    }
    function DeprecationError(namespace, message, stack) {
      var error = new Error();
      var stackString;
      Object.defineProperty(error, "constructor", {
        value: DeprecationError
      });
      Object.defineProperty(error, "message", {
        configurable: true,
        enumerable: false,
        value: message,
        writable: true
      });
      Object.defineProperty(error, "name", {
        enumerable: false,
        configurable: true,
        value: "DeprecationError",
        writable: true
      });
      Object.defineProperty(error, "namespace", {
        configurable: true,
        enumerable: false,
        value: namespace,
        writable: true
      });
      Object.defineProperty(error, "stack", {
        configurable: true,
        enumerable: false,
        get: function() {
          if (stackString !== void 0) {
            return stackString;
          }
          return stackString = createStackString.call(this, stack);
        },
        set: function setter(val) {
          stackString = val;
        }
      });
      return error;
    }
  }
});

// node_modules/on-headers/index.js
var require_on_headers = __commonJS({
  "node_modules/on-headers/index.js"(exports2, module2) {
    "use strict";
    module2.exports = onHeaders;
    var http = require("http");
    var isAppendHeaderSupported = typeof http.ServerResponse.prototype.appendHeader === "function";
    var set1dArray = isAppendHeaderSupported ? set1dArrayWithAppend : set1dArrayWithSet;
    function createWriteHead(prevWriteHead, listener) {
      var fired = false;
      return function writeHead(statusCode) {
        var args = setWriteHeadHeaders.apply(this, arguments);
        if (!fired) {
          fired = true;
          listener.call(this);
          if (typeof args[0] === "number" && this.statusCode !== args[0]) {
            args[0] = this.statusCode;
            args.length = 1;
          }
        }
        return prevWriteHead.apply(this, args);
      };
    }
    function onHeaders(res, listener) {
      if (!res) {
        throw new TypeError("argument res is required");
      }
      if (typeof listener !== "function") {
        throw new TypeError("argument listener must be a function");
      }
      res.writeHead = createWriteHead(res.writeHead, listener);
    }
    function setHeadersFromArray(res, headers) {
      if (headers.length && Array.isArray(headers[0])) {
        set2dArray(res, headers);
      } else {
        if (headers.length % 2 !== 0) {
          throw new TypeError("headers array is malformed");
        }
        set1dArray(res, headers);
      }
    }
    function setHeadersFromObject(res, headers) {
      var keys = Object.keys(headers);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (k) res.setHeader(k, headers[k]);
      }
    }
    function setWriteHeadHeaders(statusCode) {
      var length = arguments.length;
      var headerIndex = length > 1 && typeof arguments[1] === "string" ? 2 : 1;
      var headers = length >= headerIndex + 1 ? arguments[headerIndex] : void 0;
      this.statusCode = statusCode;
      if (Array.isArray(headers)) {
        setHeadersFromArray(this, headers);
      } else if (headers) {
        setHeadersFromObject(this, headers);
      }
      var args = new Array(Math.min(length, headerIndex));
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      return args;
    }
    function set2dArray(res, headers) {
      var key;
      for (var i = 0; i < headers.length; i++) {
        key = headers[i][0];
        if (key) {
          res.setHeader(key, headers[i][1]);
        }
      }
    }
    function set1dArrayWithAppend(res, headers) {
      for (var i = 0; i < headers.length; i += 2) {
        res.removeHeader(headers[i]);
      }
      var key;
      for (var j = 0; j < headers.length; j += 2) {
        key = headers[j];
        if (key) {
          res.appendHeader(key, headers[j + 1]);
        }
      }
    }
    function set1dArrayWithSet(res, headers) {
      var key;
      for (var i = 0; i < headers.length; i += 2) {
        key = headers[i];
        if (key) {
          res.setHeader(key, headers[i + 1]);
        }
      }
    }
  }
});

// node_modules/parseurl/index.js
var require_parseurl = __commonJS({
  "node_modules/parseurl/index.js"(exports2, module2) {
    "use strict";
    var url = require("url");
    var parse = url.parse;
    var Url = url.Url;
    module2.exports = parseurl;
    module2.exports.original = originalurl;
    function parseurl(req) {
      var url2 = req.url;
      if (url2 === void 0) {
        return void 0;
      }
      var parsed = req._parsedUrl;
      if (fresh(url2, parsed)) {
        return parsed;
      }
      parsed = fastparse(url2);
      parsed._raw = url2;
      return req._parsedUrl = parsed;
    }
    function originalurl(req) {
      var url2 = req.originalUrl;
      if (typeof url2 !== "string") {
        return parseurl(req);
      }
      var parsed = req._parsedOriginalUrl;
      if (fresh(url2, parsed)) {
        return parsed;
      }
      parsed = fastparse(url2);
      parsed._raw = url2;
      return req._parsedOriginalUrl = parsed;
    }
    function fastparse(str) {
      if (typeof str !== "string" || str.charCodeAt(0) !== 47) {
        return parse(str);
      }
      var pathname = str;
      var query = null;
      var search = null;
      for (var i = 1; i < str.length; i++) {
        switch (str.charCodeAt(i)) {
          case 63:
            if (search === null) {
              pathname = str.substring(0, i);
              query = str.substring(i + 1);
              search = str.substring(i);
            }
            break;
          case 9:
          case 10:
          case 12:
          case 13:
          case 32:
          case 35:
          case 160:
          case 65279:
            return parse(str);
        }
      }
      var url2 = Url !== void 0 ? new Url() : {};
      url2.path = str;
      url2.href = str;
      url2.pathname = pathname;
      if (search !== null) {
        url2.query = query;
        url2.search = search;
      }
      return url2;
    }
    function fresh(url2, parsedUrl) {
      return typeof parsedUrl === "object" && parsedUrl !== null && (Url === void 0 || parsedUrl instanceof Url) && parsedUrl._raw === url2;
    }
  }
});

// node_modules/express-session/node_modules/cookie-signature/index.js
var require_cookie_signature = __commonJS({
  "node_modules/express-session/node_modules/cookie-signature/index.js"(exports2) {
    var crypto = require("crypto");
    exports2.sign = function(val, secret) {
      if ("string" !== typeof val) throw new TypeError("Cookie value must be provided as a string.");
      if (null == secret) throw new TypeError("Secret key must be provided.");
      return val + "." + crypto.createHmac("sha256", secret).update(val).digest("base64").replace(/\=+$/, "");
    };
    exports2.unsign = function(val, secret) {
      if ("string" !== typeof val) throw new TypeError("Signed cookie string must be provided.");
      if (null == secret) throw new TypeError("Secret key must be provided.");
      var str = val.slice(0, val.lastIndexOf(".")), mac = exports2.sign(str, secret);
      return sha1(mac) == sha1(val) ? str : false;
    };
    function sha1(str) {
      return crypto.createHash("sha1").update(str).digest("hex");
    }
  }
});

// node_modules/random-bytes/index.js
var require_random_bytes = __commonJS({
  "node_modules/random-bytes/index.js"(exports2, module2) {
    "use strict";
    var crypto = require("crypto");
    var generateAttempts = crypto.randomBytes === crypto.pseudoRandomBytes ? 1 : 3;
    module2.exports = randomBytes;
    module2.exports.sync = randomBytesSync;
    function randomBytes(size, callback) {
      if (callback !== void 0 && typeof callback !== "function") {
        throw new TypeError("argument callback must be a function");
      }
      if (!callback && !global.Promise) {
        throw new TypeError("argument callback is required");
      }
      if (callback) {
        return generateRandomBytes(size, generateAttempts, callback);
      }
      return new Promise(function executor(resolve, reject) {
        generateRandomBytes(size, generateAttempts, function onRandomBytes(err, str) {
          if (err) return reject(err);
          resolve(str);
        });
      });
    }
    function randomBytesSync(size) {
      var err = null;
      for (var i = 0; i < generateAttempts; i++) {
        try {
          return crypto.randomBytes(size);
        } catch (e) {
          err = e;
        }
      }
      throw err;
    }
    function generateRandomBytes(size, attempts, callback) {
      crypto.randomBytes(size, function onRandomBytes(err, buf) {
        if (!err) return callback(null, buf);
        if (!--attempts) return callback(err);
        setTimeout(generateRandomBytes.bind(null, size, attempts, callback), 10);
      });
    }
  }
});

// node_modules/uid-safe/index.js
var require_uid_safe = __commonJS({
  "node_modules/uid-safe/index.js"(exports2, module2) {
    "use strict";
    var randomBytes = require_random_bytes();
    var EQUAL_END_REGEXP = /=+$/;
    var PLUS_GLOBAL_REGEXP = /\+/g;
    var SLASH_GLOBAL_REGEXP = /\//g;
    module2.exports = uid;
    module2.exports.sync = uidSync;
    function uid(length, callback) {
      if (callback !== void 0 && typeof callback !== "function") {
        throw new TypeError("argument callback must be a function");
      }
      if (!callback && !global.Promise) {
        throw new TypeError("argument callback is required");
      }
      if (callback) {
        return generateUid(length, callback);
      }
      return new Promise(function executor(resolve, reject) {
        generateUid(length, function onUid(err, str) {
          if (err) return reject(err);
          resolve(str);
        });
      });
    }
    function uidSync(length) {
      return toString(randomBytes.sync(length));
    }
    function generateUid(length, callback) {
      randomBytes(length, function(err, buf) {
        if (err) return callback(err);
        callback(null, toString(buf));
      });
    }
    function toString(buf) {
      return buf.toString("base64").replace(EQUAL_END_REGEXP, "").replace(PLUS_GLOBAL_REGEXP, "-").replace(SLASH_GLOBAL_REGEXP, "_");
    }
  }
});

// node_modules/express-session/session/cookie.js
var require_cookie2 = __commonJS({
  "node_modules/express-session/session/cookie.js"(exports2, module2) {
    "use strict";
    var cookie = require_cookie();
    var deprecate = require_depd()("express-session");
    var Cookie = module2.exports = function Cookie2(options) {
      this.path = "/";
      this.maxAge = null;
      this.httpOnly = true;
      if (options) {
        if (typeof options !== "object") {
          throw new TypeError("argument options must be a object");
        }
        for (var key in options) {
          if (key !== "data") {
            this[key] = options[key];
          }
        }
      }
      if (this.originalMaxAge === void 0 || this.originalMaxAge === null) {
        this.originalMaxAge = this.maxAge;
      }
    };
    Cookie.prototype = {
      /**
       * Set expires `date`.
       *
       * @param {Date} date
       * @api public
       */
      set expires(date) {
        this._expires = date;
        this.originalMaxAge = this.maxAge;
      },
      /**
       * Get expires `date`.
       *
       * @return {Date}
       * @api public
       */
      get expires() {
        return this._expires;
      },
      /**
       * Set expires via max-age in `ms`.
       *
       * @param {Number} ms
       * @api public
       */
      set maxAge(ms) {
        if (ms && typeof ms !== "number" && !(ms instanceof Date)) {
          throw new TypeError("maxAge must be a number or Date");
        }
        if (ms instanceof Date) {
          deprecate("maxAge as Date; pass number of milliseconds instead");
        }
        this.expires = typeof ms === "number" ? new Date(Date.now() + ms) : ms;
      },
      /**
       * Get expires max-age in `ms`.
       *
       * @return {Number}
       * @api public
       */
      get maxAge() {
        return this.expires instanceof Date ? this.expires.valueOf() - Date.now() : this.expires;
      },
      /**
       * Return cookie data object.
       *
       * @return {Object}
       * @api private
       */
      get data() {
        return {
          originalMaxAge: this.originalMaxAge,
          partitioned: this.partitioned,
          priority: this.priority,
          expires: this._expires,
          secure: this.secure,
          httpOnly: this.httpOnly,
          domain: this.domain,
          path: this.path,
          sameSite: this.sameSite
        };
      },
      /**
       * Return a serialized cookie string.
       *
       * @return {String}
       * @api public
       */
      serialize: function(name, val) {
        return cookie.serialize(name, val, this.data);
      },
      /**
       * Return JSON representation of this cookie.
       *
       * @return {Object}
       * @api private
       */
      toJSON: function() {
        return this.data;
      }
    };
  }
});

// node_modules/express-session/session/session.js
var require_session = __commonJS({
  "node_modules/express-session/session/session.js"(exports2, module2) {
    "use strict";
    module2.exports = Session;
    function Session(req, data) {
      Object.defineProperty(this, "req", { value: req });
      Object.defineProperty(this, "id", { value: req.sessionID });
      if (typeof data === "object" && data !== null) {
        for (var prop in data) {
          if (!(prop in this)) {
            this[prop] = data[prop];
          }
        }
      }
    }
    defineMethod(Session.prototype, "touch", function touch() {
      return this.resetMaxAge();
    });
    defineMethod(Session.prototype, "resetMaxAge", function resetMaxAge() {
      this.cookie.maxAge = this.cookie.originalMaxAge;
      return this;
    });
    defineMethod(Session.prototype, "save", function save(fn) {
      this.req.sessionStore.set(this.id, this, fn || function() {
      });
      return this;
    });
    defineMethod(Session.prototype, "reload", function reload(fn) {
      var req = this.req;
      var store = this.req.sessionStore;
      store.get(this.id, function(err, sess) {
        if (err) return fn(err);
        if (!sess) return fn(new Error("failed to load session"));
        store.createSession(req, sess);
        fn();
      });
      return this;
    });
    defineMethod(Session.prototype, "destroy", function destroy(fn) {
      delete this.req.session;
      this.req.sessionStore.destroy(this.id, fn);
      return this;
    });
    defineMethod(Session.prototype, "regenerate", function regenerate(fn) {
      this.req.sessionStore.regenerate(this.req, fn);
      return this;
    });
    function defineMethod(obj, name, fn) {
      Object.defineProperty(obj, name, {
        configurable: true,
        enumerable: false,
        value: fn,
        writable: true
      });
    }
  }
});

// node_modules/express-session/session/store.js
var require_store = __commonJS({
  "node_modules/express-session/session/store.js"(exports2, module2) {
    "use strict";
    var Cookie = require_cookie2();
    var EventEmitter = require("events").EventEmitter;
    var Session = require_session();
    var util = require("util");
    module2.exports = Store;
    function Store() {
      EventEmitter.call(this);
    }
    util.inherits(Store, EventEmitter);
    Store.prototype.regenerate = function(req, fn) {
      var self = this;
      this.destroy(req.sessionID, function(err) {
        self.generate(req);
        fn(err);
      });
    };
    Store.prototype.load = function(sid, fn) {
      var self = this;
      this.get(sid, function(err, sess) {
        if (err) return fn(err);
        if (!sess) return fn();
        var req = { sessionID: sid, sessionStore: self };
        fn(null, self.createSession(req, sess));
      });
    };
    Store.prototype.createSession = function(req, sess) {
      var expires = sess.cookie.expires;
      var originalMaxAge = sess.cookie.originalMaxAge;
      sess.cookie = new Cookie(sess.cookie);
      if (typeof expires === "string") {
        sess.cookie.expires = new Date(expires);
      }
      sess.cookie.originalMaxAge = originalMaxAge;
      req.session = new Session(req, sess);
      return req.session;
    };
  }
});

// node_modules/express-session/session/memory.js
var require_memory = __commonJS({
  "node_modules/express-session/session/memory.js"(exports2, module2) {
    "use strict";
    var Store = require_store();
    var util = require("util");
    var defer = typeof setImmediate === "function" ? setImmediate : function(fn) {
      process.nextTick(fn.bind.apply(fn, arguments));
    };
    module2.exports = MemoryStore;
    function MemoryStore() {
      Store.call(this);
      this.sessions = /* @__PURE__ */ Object.create(null);
    }
    util.inherits(MemoryStore, Store);
    MemoryStore.prototype.all = function all(callback) {
      var sessionIds = Object.keys(this.sessions);
      var sessions = /* @__PURE__ */ Object.create(null);
      for (var i = 0; i < sessionIds.length; i++) {
        var sessionId = sessionIds[i];
        var session2 = getSession.call(this, sessionId);
        if (session2) {
          sessions[sessionId] = session2;
        }
      }
      callback && defer(callback, null, sessions);
    };
    MemoryStore.prototype.clear = function clear(callback) {
      this.sessions = /* @__PURE__ */ Object.create(null);
      callback && defer(callback);
    };
    MemoryStore.prototype.destroy = function destroy(sessionId, callback) {
      delete this.sessions[sessionId];
      callback && defer(callback);
    };
    MemoryStore.prototype.get = function get(sessionId, callback) {
      defer(callback, null, getSession.call(this, sessionId));
    };
    MemoryStore.prototype.set = function set(sessionId, session2, callback) {
      this.sessions[sessionId] = JSON.stringify(session2);
      callback && defer(callback);
    };
    MemoryStore.prototype.length = function length(callback) {
      this.all(function(err, sessions) {
        if (err) return callback(err);
        callback(null, Object.keys(sessions).length);
      });
    };
    MemoryStore.prototype.touch = function touch(sessionId, session2, callback) {
      var currentSession = getSession.call(this, sessionId);
      if (currentSession) {
        currentSession.cookie = session2.cookie;
        this.sessions[sessionId] = JSON.stringify(currentSession);
      }
      callback && defer(callback);
    };
    function getSession(sessionId) {
      var sess = this.sessions[sessionId];
      if (!sess) {
        return;
      }
      sess = JSON.parse(sess);
      if (sess.cookie) {
        var expires = typeof sess.cookie.expires === "string" ? new Date(sess.cookie.expires) : sess.cookie.expires;
        if (expires && expires <= Date.now()) {
          delete this.sessions[sessionId];
          return;
        }
      }
      return sess;
    }
  }
});

// node_modules/express-session/index.js
var require_express_session = __commonJS({
  "node_modules/express-session/index.js"(exports2, module2) {
    "use strict";
    var Buffer2 = require_safe_buffer().Buffer;
    var cookie = require_cookie();
    var crypto = require("crypto");
    var debug = require_src()("express-session");
    var deprecate = require_depd()("express-session");
    var onHeaders = require_on_headers();
    var parseUrl = require_parseurl();
    var signature = require_cookie_signature();
    var uid = require_uid_safe().sync;
    var Cookie = require_cookie2();
    var MemoryStore = require_memory();
    var Session = require_session();
    var Store = require_store();
    var env = process.env.NODE_ENV;
    exports2 = module2.exports = session2;
    exports2.Store = Store;
    exports2.Cookie = Cookie;
    exports2.Session = Session;
    exports2.MemoryStore = MemoryStore;
    var warning = "Warning: connect.session() MemoryStore is not\ndesigned for a production environment, as it will leak\nmemory, and will not scale past a single process.";
    var defer = typeof setImmediate === "function" ? setImmediate : function(fn) {
      process.nextTick(fn.bind.apply(fn, arguments));
    };
    function session2(options) {
      var opts = options || {};
      var cookieOptions = opts.cookie || {};
      var generateId = opts.genid || generateSessionId;
      var name = opts.name || opts.key || "connect.sid";
      var store = opts.store || new MemoryStore();
      var trustProxy = opts.proxy;
      var resaveSession = opts.resave;
      var rollingSessions = Boolean(opts.rolling);
      var saveUninitializedSession = opts.saveUninitialized;
      var secret = opts.secret;
      if (typeof generateId !== "function") {
        throw new TypeError("genid option must be a function");
      }
      if (resaveSession === void 0) {
        deprecate("undefined resave option; provide resave option");
        resaveSession = true;
      }
      if (saveUninitializedSession === void 0) {
        deprecate("undefined saveUninitialized option; provide saveUninitialized option");
        saveUninitializedSession = true;
      }
      if (opts.unset && opts.unset !== "destroy" && opts.unset !== "keep") {
        throw new TypeError('unset option must be "destroy" or "keep"');
      }
      var unsetDestroy = opts.unset === "destroy";
      if (Array.isArray(secret) && secret.length === 0) {
        throw new TypeError("secret option array must contain one or more strings");
      }
      if (secret && !Array.isArray(secret)) {
        secret = [secret];
      }
      if (!secret) {
        deprecate("req.secret; provide secret option");
      }
      if (env === "production" && store instanceof MemoryStore) {
        console.warn(warning);
      }
      store.generate = function(req) {
        req.sessionID = generateId(req);
        req.session = new Session(req);
        req.session.cookie = new Cookie(cookieOptions);
        if (cookieOptions.secure === "auto") {
          req.session.cookie.secure = issecure(req, trustProxy);
        }
      };
      var storeImplementsTouch = typeof store.touch === "function";
      var storeReady = true;
      store.on("disconnect", function ondisconnect() {
        storeReady = false;
      });
      store.on("connect", function onconnect() {
        storeReady = true;
      });
      return function session3(req, res, next) {
        if (req.session) {
          next();
          return;
        }
        if (!storeReady) {
          debug("store is disconnected");
          next();
          return;
        }
        var originalPath = parseUrl.original(req).pathname || "/";
        if (originalPath.indexOf(cookieOptions.path || "/") !== 0) {
          debug("pathname mismatch");
          next();
          return;
        }
        if (!secret && !req.secret) {
          next(new Error("secret option required for sessions"));
          return;
        }
        var secrets = secret || [req.secret];
        var originalHash;
        var originalId;
        var savedHash;
        var touched = false;
        req.sessionStore = store;
        var cookieId = req.sessionID = getcookie(req, name, secrets);
        onHeaders(res, function() {
          if (!req.session) {
            debug("no session");
            return;
          }
          if (!shouldSetCookie(req)) {
            return;
          }
          if (req.session.cookie.secure && !issecure(req, trustProxy)) {
            debug("not secured");
            return;
          }
          if (!touched) {
            req.session.touch();
            touched = true;
          }
          try {
            setcookie(res, name, req.sessionID, secrets[0], req.session.cookie.data);
          } catch (err) {
            defer(next, err);
          }
        });
        var _end = res.end;
        var _write = res.write;
        var ended = false;
        res.end = function end(chunk, encoding) {
          if (ended) {
            return false;
          }
          ended = true;
          var ret;
          var sync = true;
          function writeend() {
            if (sync) {
              ret = _end.call(res, chunk, encoding);
              sync = false;
              return;
            }
            _end.call(res);
          }
          function writetop() {
            if (!sync) {
              return ret;
            }
            if (!res._header) {
              res._implicitHeader();
            }
            if (chunk == null) {
              ret = true;
              return ret;
            }
            var contentLength = Number(res.getHeader("Content-Length"));
            if (!isNaN(contentLength) && contentLength > 0) {
              chunk = !Buffer2.isBuffer(chunk) ? Buffer2.from(chunk, encoding) : chunk;
              encoding = void 0;
              if (chunk.length !== 0) {
                debug("split response");
                ret = _write.call(res, chunk.slice(0, chunk.length - 1));
                chunk = chunk.slice(chunk.length - 1, chunk.length);
                return ret;
              }
            }
            ret = _write.call(res, chunk, encoding);
            sync = false;
            return ret;
          }
          if (shouldDestroy(req)) {
            debug("destroying");
            store.destroy(req.sessionID, function ondestroy(err) {
              if (err) {
                defer(next, err);
              }
              debug("destroyed");
              writeend();
            });
            return writetop();
          }
          if (!req.session) {
            debug("no session");
            return _end.call(res, chunk, encoding);
          }
          if (!touched) {
            req.session.touch();
            touched = true;
          }
          if (shouldSave(req)) {
            req.session.save(function onsave(err) {
              if (err) {
                defer(next, err);
              }
              writeend();
            });
            return writetop();
          } else if (storeImplementsTouch && shouldTouch(req)) {
            debug("touching");
            store.touch(req.sessionID, req.session, function ontouch(err) {
              if (err) {
                defer(next, err);
              }
              debug("touched");
              writeend();
            });
            return writetop();
          }
          return _end.call(res, chunk, encoding);
        };
        function generate() {
          store.generate(req);
          originalId = req.sessionID;
          originalHash = hash(req.session);
          wrapmethods(req.session);
        }
        function inflate(req2, sess) {
          store.createSession(req2, sess);
          originalId = req2.sessionID;
          originalHash = hash(sess);
          if (!resaveSession) {
            savedHash = originalHash;
          }
          wrapmethods(req2.session);
        }
        function rewrapmethods(sess, callback) {
          return function() {
            if (req.session !== sess) {
              wrapmethods(req.session);
            }
            callback.apply(this, arguments);
          };
        }
        function wrapmethods(sess) {
          var _reload = sess.reload;
          var _save = sess.save;
          function reload(callback) {
            debug("reloading %s", this.id);
            _reload.call(this, rewrapmethods(this, callback));
          }
          function save() {
            debug("saving %s", this.id);
            savedHash = hash(this);
            _save.apply(this, arguments);
          }
          Object.defineProperty(sess, "reload", {
            configurable: true,
            enumerable: false,
            value: reload,
            writable: true
          });
          Object.defineProperty(sess, "save", {
            configurable: true,
            enumerable: false,
            value: save,
            writable: true
          });
        }
        function isModified(sess) {
          return originalId !== sess.id || originalHash !== hash(sess);
        }
        function isSaved(sess) {
          return originalId === sess.id && savedHash === hash(sess);
        }
        function shouldDestroy(req2) {
          return req2.sessionID && unsetDestroy && req2.session == null;
        }
        function shouldSave(req2) {
          if (typeof req2.sessionID !== "string") {
            debug("session ignored because of bogus req.sessionID %o", req2.sessionID);
            return false;
          }
          return !saveUninitializedSession && !savedHash && cookieId !== req2.sessionID ? isModified(req2.session) : !isSaved(req2.session);
        }
        function shouldTouch(req2) {
          if (typeof req2.sessionID !== "string") {
            debug("session ignored because of bogus req.sessionID %o", req2.sessionID);
            return false;
          }
          return cookieId === req2.sessionID && !shouldSave(req2);
        }
        function shouldSetCookie(req2) {
          if (typeof req2.sessionID !== "string") {
            return false;
          }
          return cookieId !== req2.sessionID ? saveUninitializedSession || isModified(req2.session) : rollingSessions || req2.session.cookie.expires != null && isModified(req2.session);
        }
        if (!req.sessionID) {
          debug("no SID sent, generating session");
          generate();
          next();
          return;
        }
        debug("fetching %s", req.sessionID);
        store.get(req.sessionID, function(err, sess) {
          if (err && err.code !== "ENOENT") {
            debug("error %j", err);
            next(err);
            return;
          }
          try {
            if (err || !sess) {
              debug("no session found");
              generate();
            } else {
              debug("session found");
              inflate(req, sess);
            }
          } catch (e) {
            next(e);
            return;
          }
          next();
        });
      };
    }
    function generateSessionId(sess) {
      return uid(24);
    }
    function getcookie(req, name, secrets) {
      var header = req.headers.cookie;
      var raw;
      var val;
      if (header) {
        var cookies = cookie.parse(header);
        raw = cookies[name];
        if (raw) {
          if (raw.substr(0, 2) === "s:") {
            val = unsigncookie(raw.slice(2), secrets);
            if (val === false) {
              debug("cookie signature invalid");
              val = void 0;
            }
          } else {
            debug("cookie unsigned");
          }
        }
      }
      if (!val && req.signedCookies) {
        val = req.signedCookies[name];
        if (val) {
          deprecate("cookie should be available in req.headers.cookie");
        }
      }
      if (!val && req.cookies) {
        raw = req.cookies[name];
        if (raw) {
          if (raw.substr(0, 2) === "s:") {
            val = unsigncookie(raw.slice(2), secrets);
            if (val) {
              deprecate("cookie should be available in req.headers.cookie");
            }
            if (val === false) {
              debug("cookie signature invalid");
              val = void 0;
            }
          } else {
            debug("cookie unsigned");
          }
        }
      }
      return val;
    }
    function hash(sess) {
      var str = JSON.stringify(sess, function(key, val) {
        if (this === sess && key === "cookie") {
          return;
        }
        return val;
      });
      return crypto.createHash("sha1").update(str, "utf8").digest("hex");
    }
    function issecure(req, trustProxy) {
      if (req.connection && req.connection.encrypted) {
        return true;
      }
      if (trustProxy === false) {
        return false;
      }
      if (trustProxy !== true) {
        return req.secure === true;
      }
      var header = req.headers["x-forwarded-proto"] || "";
      var index = header.indexOf(",");
      var proto = index !== -1 ? header.substr(0, index).toLowerCase().trim() : header.toLowerCase().trim();
      return proto === "https";
    }
    function setcookie(res, name, val, secret, options) {
      var signed = "s:" + signature.sign(val, secret);
      var data = cookie.serialize(name, signed, options);
      debug("set-cookie %s", data);
      var prev = res.getHeader("Set-Cookie") || [];
      var header = Array.isArray(prev) ? prev.concat(data) : [prev, data];
      res.setHeader("Set-Cookie", header);
    }
    function unsigncookie(val, secrets) {
      for (var i = 0; i < secrets.length; i++) {
        var result = signature.unsign(val, secrets[i]);
        if (result !== false) {
          return result;
        }
      }
      return false;
    }
  }
});

// node_modules/pause/index.js
var require_pause = __commonJS({
  "node_modules/pause/index.js"(exports2, module2) {
    module2.exports = function(obj) {
      var onData, onEnd, events = [];
      obj.on("data", onData = function(data, encoding) {
        events.push(["data", data, encoding]);
      });
      obj.on("end", onEnd = function(data, encoding) {
        events.push(["end", data, encoding]);
      });
      return {
        end: function() {
          obj.removeListener("data", onData);
          obj.removeListener("end", onEnd);
        },
        resume: function() {
          this.end();
          for (var i = 0, len = events.length; i < len; ++i) {
            obj.emit.apply(obj, events[i]);
          }
        }
      };
    };
  }
});

// node_modules/passport-strategy/lib/strategy.js
var require_strategy = __commonJS({
  "node_modules/passport-strategy/lib/strategy.js"(exports2, module2) {
    function Strategy() {
    }
    Strategy.prototype.authenticate = function(req, options) {
      throw new Error("Strategy#authenticate must be overridden by subclass");
    };
    module2.exports = Strategy;
  }
});

// node_modules/passport-strategy/lib/index.js
var require_lib = __commonJS({
  "node_modules/passport-strategy/lib/index.js"(exports2, module2) {
    var Strategy = require_strategy();
    exports2 = module2.exports = Strategy;
    exports2.Strategy = Strategy;
  }
});

// node_modules/passport/lib/strategies/session.js
var require_session2 = __commonJS({
  "node_modules/passport/lib/strategies/session.js"(exports2, module2) {
    var pause = require_pause();
    var util = require("util");
    var Strategy = require_lib();
    function SessionStrategy(options, deserializeUser) {
      if (typeof options == "function") {
        deserializeUser = options;
        options = void 0;
      }
      options = options || {};
      Strategy.call(this);
      this.name = "session";
      this._key = options.key || "passport";
      this._deserializeUser = deserializeUser;
    }
    util.inherits(SessionStrategy, Strategy);
    SessionStrategy.prototype.authenticate = function(req, options) {
      if (!req.session) {
        return this.error(new Error("Login sessions require session support. Did you forget to use `express-session` middleware?"));
      }
      options = options || {};
      var self = this, su;
      if (req.session[this._key]) {
        su = req.session[this._key].user;
      }
      if (su || su === 0) {
        var paused = options.pauseStream ? pause(req) : null;
        this._deserializeUser(su, req, function(err, user) {
          if (err) {
            return self.error(err);
          }
          if (!user) {
            delete req.session[self._key].user;
          } else {
            var property = req._userProperty || "user";
            req[property] = user;
          }
          self.pass();
          if (paused) {
            paused.resume();
          }
        });
      } else {
        self.pass();
      }
    };
    module2.exports = SessionStrategy;
  }
});

// node_modules/utils-merge/index.js
var require_utils_merge = __commonJS({
  "node_modules/utils-merge/index.js"(exports2, module2) {
    exports2 = module2.exports = function(a, b) {
      if (a && b) {
        for (var key in b) {
          a[key] = b[key];
        }
      }
      return a;
    };
  }
});

// node_modules/passport/lib/sessionmanager.js
var require_sessionmanager = __commonJS({
  "node_modules/passport/lib/sessionmanager.js"(exports2, module2) {
    var merge = require_utils_merge();
    function SessionManager(options, serializeUser) {
      if (typeof options == "function") {
        serializeUser = options;
        options = void 0;
      }
      options = options || {};
      this._key = options.key || "passport";
      this._serializeUser = serializeUser;
    }
    SessionManager.prototype.logIn = function(req, user, options, cb) {
      if (typeof options == "function") {
        cb = options;
        options = {};
      }
      options = options || {};
      if (!req.session) {
        return cb(new Error("Login sessions require session support. Did you forget to use `express-session` middleware?"));
      }
      var self = this;
      var prevSession = req.session;
      req.session.regenerate(function(err) {
        if (err) {
          return cb(err);
        }
        self._serializeUser(user, req, function(err2, obj) {
          if (err2) {
            return cb(err2);
          }
          if (options.keepSessionInfo) {
            merge(req.session, prevSession);
          }
          if (!req.session[self._key]) {
            req.session[self._key] = {};
          }
          req.session[self._key].user = obj;
          req.session.save(function(err3) {
            if (err3) {
              return cb(err3);
            }
            cb();
          });
        });
      });
    };
    SessionManager.prototype.logOut = function(req, options, cb) {
      if (typeof options == "function") {
        cb = options;
        options = {};
      }
      options = options || {};
      if (!req.session) {
        return cb(new Error("Login sessions require session support. Did you forget to use `express-session` middleware?"));
      }
      var self = this;
      if (req.session[this._key]) {
        delete req.session[this._key].user;
      }
      var prevSession = req.session;
      req.session.save(function(err) {
        if (err) {
          return cb(err);
        }
        req.session.regenerate(function(err2) {
          if (err2) {
            return cb(err2);
          }
          if (options.keepSessionInfo) {
            merge(req.session, prevSession);
          }
          cb();
        });
      });
    };
    module2.exports = SessionManager;
  }
});

// node_modules/passport/lib/http/request.js
var require_request = __commonJS({
  "node_modules/passport/lib/http/request.js"(exports2, module2) {
    var req = exports2 = module2.exports = {};
    req.login = req.logIn = function(user, options, done) {
      if (typeof options == "function") {
        done = options;
        options = {};
      }
      options = options || {};
      var property = this._userProperty || "user";
      var session2 = options.session === void 0 ? true : options.session;
      this[property] = user;
      if (session2 && this._sessionManager) {
        if (typeof done != "function") {
          throw new Error("req#login requires a callback function");
        }
        var self = this;
        this._sessionManager.logIn(this, user, options, function(err) {
          if (err) {
            self[property] = null;
            return done(err);
          }
          done();
        });
      } else {
        done && done();
      }
    };
    req.logout = req.logOut = function(options, done) {
      if (typeof options == "function") {
        done = options;
        options = {};
      }
      options = options || {};
      var property = this._userProperty || "user";
      this[property] = null;
      if (this._sessionManager) {
        if (typeof done != "function") {
          throw new Error("req#logout requires a callback function");
        }
        this._sessionManager.logOut(this, options, done);
      } else {
        done && done();
      }
    };
    req.isAuthenticated = function() {
      var property = this._userProperty || "user";
      return this[property] ? true : false;
    };
    req.isUnauthenticated = function() {
      return !this.isAuthenticated();
    };
  }
});

// node_modules/passport/lib/middleware/initialize.js
var require_initialize = __commonJS({
  "node_modules/passport/lib/middleware/initialize.js"(exports2, module2) {
    var IncomingMessageExt = require_request();
    module2.exports = function initialize(passport4, options) {
      options = options || {};
      return function initialize2(req, res, next) {
        req.login = req.logIn = req.logIn || IncomingMessageExt.logIn;
        req.logout = req.logOut = req.logOut || IncomingMessageExt.logOut;
        req.isAuthenticated = req.isAuthenticated || IncomingMessageExt.isAuthenticated;
        req.isUnauthenticated = req.isUnauthenticated || IncomingMessageExt.isUnauthenticated;
        req._sessionManager = passport4._sm;
        if (options.userProperty) {
          req._userProperty = options.userProperty;
        }
        var compat = options.compat === void 0 ? true : options.compat;
        if (compat) {
          passport4._userProperty = options.userProperty || "user";
          req._passport = {};
          req._passport.instance = passport4;
        }
        next();
      };
    };
  }
});

// node_modules/passport/lib/errors/authenticationerror.js
var require_authenticationerror = __commonJS({
  "node_modules/passport/lib/errors/authenticationerror.js"(exports2, module2) {
    function AuthenticationError(message, status) {
      Error.call(this);
      Error.captureStackTrace(this, arguments.callee);
      this.name = "AuthenticationError";
      this.message = message;
      this.status = status || 401;
    }
    AuthenticationError.prototype.__proto__ = Error.prototype;
    module2.exports = AuthenticationError;
  }
});

// node_modules/passport/lib/middleware/authenticate.js
var require_authenticate = __commonJS({
  "node_modules/passport/lib/middleware/authenticate.js"(exports2, module2) {
    var http = require("http");
    var IncomingMessageExt = require_request();
    var AuthenticationError = require_authenticationerror();
    module2.exports = function authenticate(passport4, name, options, callback) {
      if (typeof options == "function") {
        callback = options;
        options = {};
      }
      options = options || {};
      var multi = true;
      if (!Array.isArray(name)) {
        name = [name];
        multi = false;
      }
      return function authenticate2(req, res, next) {
        req.login = req.logIn = req.logIn || IncomingMessageExt.logIn;
        req.logout = req.logOut = req.logOut || IncomingMessageExt.logOut;
        req.isAuthenticated = req.isAuthenticated || IncomingMessageExt.isAuthenticated;
        req.isUnauthenticated = req.isUnauthenticated || IncomingMessageExt.isUnauthenticated;
        req._sessionManager = passport4._sm;
        var failures = [];
        function allFailed() {
          if (callback) {
            if (!multi) {
              return callback(null, false, failures[0].challenge, failures[0].status);
            } else {
              var challenges = failures.map(function(f) {
                return f.challenge;
              });
              var statuses = failures.map(function(f) {
                return f.status;
              });
              return callback(null, false, challenges, statuses);
            }
          }
          var failure = failures[0] || {}, challenge = failure.challenge || {}, msg;
          if (options.failureFlash) {
            var flash = options.failureFlash;
            if (typeof flash == "string") {
              flash = { type: "error", message: flash };
            }
            flash.type = flash.type || "error";
            var type = flash.type || challenge.type || "error";
            msg = flash.message || challenge.message || challenge;
            if (typeof msg == "string") {
              req.flash(type, msg);
            }
          }
          if (options.failureMessage) {
            msg = options.failureMessage;
            if (typeof msg == "boolean") {
              msg = challenge.message || challenge;
            }
            if (typeof msg == "string") {
              req.session.messages = req.session.messages || [];
              req.session.messages.push(msg);
            }
          }
          if (options.failureRedirect) {
            return res.redirect(options.failureRedirect);
          }
          var rchallenge = [], rstatus, status;
          for (var j = 0, len = failures.length; j < len; j++) {
            failure = failures[j];
            challenge = failure.challenge;
            status = failure.status;
            rstatus = rstatus || status;
            if (typeof challenge == "string") {
              rchallenge.push(challenge);
            }
          }
          res.statusCode = rstatus || 401;
          if (res.statusCode == 401 && rchallenge.length) {
            res.setHeader("WWW-Authenticate", rchallenge);
          }
          if (options.failWithError) {
            return next(new AuthenticationError(http.STATUS_CODES[res.statusCode], rstatus));
          }
          res.end(http.STATUS_CODES[res.statusCode]);
        }
        (function attempt(i) {
          var layer = name[i];
          if (!layer) {
            return allFailed();
          }
          var strategy, prototype;
          if (typeof layer.authenticate == "function") {
            strategy = layer;
          } else {
            prototype = passport4._strategy(layer);
            if (!prototype) {
              return next(new Error('Unknown authentication strategy "' + layer + '"'));
            }
            strategy = Object.create(prototype);
          }
          strategy.success = function(user, info) {
            if (callback) {
              return callback(null, user, info);
            }
            info = info || {};
            var msg;
            if (options.successFlash) {
              var flash = options.successFlash;
              if (typeof flash == "string") {
                flash = { type: "success", message: flash };
              }
              flash.type = flash.type || "success";
              var type = flash.type || info.type || "success";
              msg = flash.message || info.message || info;
              if (typeof msg == "string") {
                req.flash(type, msg);
              }
            }
            if (options.successMessage) {
              msg = options.successMessage;
              if (typeof msg == "boolean") {
                msg = info.message || info;
              }
              if (typeof msg == "string") {
                req.session.messages = req.session.messages || [];
                req.session.messages.push(msg);
              }
            }
            if (options.assignProperty) {
              req[options.assignProperty] = user;
              if (options.authInfo !== false) {
                passport4.transformAuthInfo(info, req, function(err, tinfo) {
                  if (err) {
                    return next(err);
                  }
                  req.authInfo = tinfo;
                  next();
                });
              } else {
                next();
              }
              return;
            }
            req.logIn(user, options, function(err) {
              if (err) {
                return next(err);
              }
              function complete() {
                if (options.successReturnToOrRedirect) {
                  var url = options.successReturnToOrRedirect;
                  if (req.session && req.session.returnTo) {
                    url = req.session.returnTo;
                    delete req.session.returnTo;
                  }
                  return res.redirect(url);
                }
                if (options.successRedirect) {
                  return res.redirect(options.successRedirect);
                }
                next();
              }
              if (options.authInfo !== false) {
                passport4.transformAuthInfo(info, req, function(err2, tinfo) {
                  if (err2) {
                    return next(err2);
                  }
                  req.authInfo = tinfo;
                  complete();
                });
              } else {
                complete();
              }
            });
          };
          strategy.fail = function(challenge, status) {
            if (typeof challenge == "number") {
              status = challenge;
              challenge = void 0;
            }
            failures.push({ challenge, status });
            attempt(i + 1);
          };
          strategy.redirect = function(url, status) {
            res.statusCode = status || 302;
            res.setHeader("Location", url);
            res.setHeader("Content-Length", "0");
            res.end();
          };
          strategy.pass = function() {
            next();
          };
          strategy.error = function(err) {
            if (callback) {
              return callback(err);
            }
            next(err);
          };
          strategy.authenticate(req, options);
        })(0);
      };
    };
  }
});

// node_modules/passport/lib/framework/connect.js
var require_connect = __commonJS({
  "node_modules/passport/lib/framework/connect.js"(exports2, module2) {
    var initialize = require_initialize();
    var authenticate = require_authenticate();
    exports2 = module2.exports = function() {
      return {
        initialize,
        authenticate
      };
    };
  }
});

// node_modules/passport/lib/authenticator.js
var require_authenticator = __commonJS({
  "node_modules/passport/lib/authenticator.js"(exports2, module2) {
    var SessionStrategy = require_session2();
    var SessionManager = require_sessionmanager();
    function Authenticator() {
      this._key = "passport";
      this._strategies = {};
      this._serializers = [];
      this._deserializers = [];
      this._infoTransformers = [];
      this._framework = null;
      this.init();
    }
    Authenticator.prototype.init = function() {
      this.framework(require_connect()());
      this.use(new SessionStrategy({ key: this._key }, this.deserializeUser.bind(this)));
      this._sm = new SessionManager({ key: this._key }, this.serializeUser.bind(this));
    };
    Authenticator.prototype.use = function(name, strategy) {
      if (!strategy) {
        strategy = name;
        name = strategy.name;
      }
      if (!name) {
        throw new Error("Authentication strategies must have a name");
      }
      this._strategies[name] = strategy;
      return this;
    };
    Authenticator.prototype.unuse = function(name) {
      delete this._strategies[name];
      return this;
    };
    Authenticator.prototype.framework = function(fw) {
      this._framework = fw;
      return this;
    };
    Authenticator.prototype.initialize = function(options) {
      options = options || {};
      return this._framework.initialize(this, options);
    };
    Authenticator.prototype.authenticate = function(strategy, options, callback) {
      return this._framework.authenticate(this, strategy, options, callback);
    };
    Authenticator.prototype.authorize = function(strategy, options, callback) {
      options = options || {};
      options.assignProperty = "account";
      var fn = this._framework.authorize || this._framework.authenticate;
      return fn(this, strategy, options, callback);
    };
    Authenticator.prototype.session = function(options) {
      return this.authenticate("session", options);
    };
    Authenticator.prototype.serializeUser = function(fn, req, done) {
      if (typeof fn === "function") {
        return this._serializers.push(fn);
      }
      var user = fn;
      if (typeof req === "function") {
        done = req;
        req = void 0;
      }
      var stack = this._serializers;
      (function pass(i, err, obj) {
        if ("pass" === err) {
          err = void 0;
        }
        if (err || obj || obj === 0) {
          return done(err, obj);
        }
        var layer = stack[i];
        if (!layer) {
          return done(new Error("Failed to serialize user into session"));
        }
        function serialized(e, o) {
          pass(i + 1, e, o);
        }
        try {
          var arity = layer.length;
          if (arity == 3) {
            layer(req, user, serialized);
          } else {
            layer(user, serialized);
          }
        } catch (e) {
          return done(e);
        }
      })(0);
    };
    Authenticator.prototype.deserializeUser = function(fn, req, done) {
      if (typeof fn === "function") {
        return this._deserializers.push(fn);
      }
      var obj = fn;
      if (typeof req === "function") {
        done = req;
        req = void 0;
      }
      var stack = this._deserializers;
      (function pass(i, err, user) {
        if ("pass" === err) {
          err = void 0;
        }
        if (err || user) {
          return done(err, user);
        }
        if (user === null || user === false) {
          return done(null, false);
        }
        var layer = stack[i];
        if (!layer) {
          return done(new Error("Failed to deserialize user out of session"));
        }
        function deserialized(e, u) {
          pass(i + 1, e, u);
        }
        try {
          var arity = layer.length;
          if (arity == 3) {
            layer(req, obj, deserialized);
          } else {
            layer(obj, deserialized);
          }
        } catch (e) {
          return done(e);
        }
      })(0);
    };
    Authenticator.prototype.transformAuthInfo = function(fn, req, done) {
      if (typeof fn === "function") {
        return this._infoTransformers.push(fn);
      }
      var info = fn;
      if (typeof req === "function") {
        done = req;
        req = void 0;
      }
      var stack = this._infoTransformers;
      (function pass(i, err, tinfo) {
        if ("pass" === err) {
          err = void 0;
        }
        if (err || tinfo) {
          return done(err, tinfo);
        }
        var layer = stack[i];
        if (!layer) {
          return done(null, info);
        }
        function transformed(e, t2) {
          pass(i + 1, e, t2);
        }
        try {
          var arity = layer.length;
          if (arity == 1) {
            var t = layer(info);
            transformed(null, t);
          } else if (arity == 3) {
            layer(req, info, transformed);
          } else {
            layer(info, transformed);
          }
        } catch (e) {
          return done(e);
        }
      })(0);
    };
    Authenticator.prototype._strategy = function(name) {
      return this._strategies[name];
    };
    module2.exports = Authenticator;
  }
});

// node_modules/passport/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/passport/lib/index.js"(exports2, module2) {
    var Passport = require_authenticator();
    var SessionStrategy = require_session2();
    exports2 = module2.exports = new Passport();
    exports2.Passport = exports2.Authenticator = Passport;
    exports2.Strategy = require_lib();
    exports2.strategies = {};
    exports2.strategies.SessionStrategy = SessionStrategy;
  }
});

// node_modules/uid2/index.js
var require_uid2 = __commonJS({
  "node_modules/uid2/index.js"(exports2, module2) {
    var crypto = require("crypto");
    var UIDCHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    function tostr(bytes) {
      var r, i;
      r = [];
      for (i = 0; i < bytes.length; i++) {
        r.push(UIDCHARS[bytes[i] % UIDCHARS.length]);
      }
      return r.join("");
    }
    function uid(length, cb) {
      if (typeof cb === "undefined") {
        return tostr(crypto.pseudoRandomBytes(length));
      } else {
        crypto.pseudoRandomBytes(length, function(err, bytes) {
          if (err) return cb(err);
          cb(null, tostr(bytes));
        });
      }
    }
    module2.exports = uid;
  }
});

// node_modules/base64url/dist/pad-string.js
var require_pad_string = __commonJS({
  "node_modules/base64url/dist/pad-string.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function padString(input) {
      var segmentLength = 4;
      var stringLength = input.length;
      var diff = stringLength % segmentLength;
      if (!diff) {
        return input;
      }
      var position = stringLength;
      var padLength = segmentLength - diff;
      var paddedStringLength = stringLength + padLength;
      var buffer = Buffer.alloc(paddedStringLength);
      buffer.write(input);
      while (padLength--) {
        buffer.write("=", position++);
      }
      return buffer.toString();
    }
    exports2.default = padString;
  }
});

// node_modules/base64url/dist/base64url.js
var require_base64url = __commonJS({
  "node_modules/base64url/dist/base64url.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var pad_string_1 = require_pad_string();
    function encode(input, encoding) {
      if (encoding === void 0) {
        encoding = "utf8";
      }
      if (Buffer.isBuffer(input)) {
        return fromBase64(input.toString("base64"));
      }
      return fromBase64(Buffer.from(input, encoding).toString("base64"));
    }
    function decode(base64url2, encoding) {
      if (encoding === void 0) {
        encoding = "utf8";
      }
      return Buffer.from(toBase64(base64url2), "base64").toString(encoding);
    }
    function toBase64(base64url2) {
      base64url2 = base64url2.toString();
      return pad_string_1.default(base64url2).replace(/\-/g, "+").replace(/_/g, "/");
    }
    function fromBase64(base64) {
      return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    function toBuffer(base64url2) {
      return Buffer.from(toBase64(base64url2), "base64");
    }
    var base64url = encode;
    base64url.encode = encode;
    base64url.decode = decode;
    base64url.toBase64 = toBase64;
    base64url.fromBase64 = fromBase64;
    base64url.toBuffer = toBuffer;
    exports2.default = base64url;
  }
});

// node_modules/base64url/index.js
var require_base64url2 = __commonJS({
  "node_modules/base64url/index.js"(exports2, module2) {
    module2.exports = require_base64url().default;
    module2.exports.default = module2.exports;
  }
});

// node_modules/passport-oauth2/lib/utils.js
var require_utils = __commonJS({
  "node_modules/passport-oauth2/lib/utils.js"(exports2) {
    exports2.merge = require_utils_merge();
    exports2.originalURL = function(req, options) {
      options = options || {};
      var app2 = req.app;
      if (app2 && app2.get && app2.get("trust proxy")) {
        options.proxy = true;
      }
      var trustProxy = options.proxy;
      var proto = (req.headers["x-forwarded-proto"] || "").toLowerCase(), tls = req.connection.encrypted || trustProxy && "https" == proto.split(/\s*,\s*/)[0], host = trustProxy && req.headers["x-forwarded-host"] || req.headers.host, protocol = tls ? "https" : "http", path2 = req.url || "";
      return protocol + "://" + host + path2;
    };
  }
});

// node_modules/oauth/lib/sha1.js
var require_sha1 = __commonJS({
  "node_modules/oauth/lib/sha1.js"(exports2) {
    var b64pad = "=";
    function b64_hmac_sha1(k, d) {
      return rstr2b64(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d)));
    }
    function rstr_hmac_sha1(key, data) {
      var bkey = rstr2binb(key);
      if (bkey.length > 16) bkey = binb_sha1(bkey, key.length * 8);
      var ipad = Array(16), opad = Array(16);
      for (var i = 0; i < 16; i++) {
        ipad[i] = bkey[i] ^ 909522486;
        opad[i] = bkey[i] ^ 1549556828;
      }
      var hash = binb_sha1(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
      return binb2rstr(binb_sha1(opad.concat(hash), 512 + 160));
    }
    function rstr2b64(input) {
      try {
        b64pad;
      } catch (e) {
        b64pad = "";
      }
      var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var output = "";
      var len = input.length;
      for (var i = 0; i < len; i += 3) {
        var triplet = input.charCodeAt(i) << 16 | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
        for (var j = 0; j < 4; j++) {
          if (i * 8 + j * 6 > input.length * 8) output += b64pad;
          else output += tab.charAt(triplet >>> 6 * (3 - j) & 63);
        }
      }
      return output;
    }
    function str2rstr_utf8(input) {
      var output = "";
      var i = -1;
      var x, y;
      while (++i < input.length) {
        x = input.charCodeAt(i);
        y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
        if (55296 <= x && x <= 56319 && 56320 <= y && y <= 57343) {
          x = 65536 + ((x & 1023) << 10) + (y & 1023);
          i++;
        }
        if (x <= 127)
          output += String.fromCharCode(x);
        else if (x <= 2047)
          output += String.fromCharCode(
            192 | x >>> 6 & 31,
            128 | x & 63
          );
        else if (x <= 65535)
          output += String.fromCharCode(
            224 | x >>> 12 & 15,
            128 | x >>> 6 & 63,
            128 | x & 63
          );
        else if (x <= 2097151)
          output += String.fromCharCode(
            240 | x >>> 18 & 7,
            128 | x >>> 12 & 63,
            128 | x >>> 6 & 63,
            128 | x & 63
          );
      }
      return output;
    }
    function rstr2binb(input) {
      var output = Array(input.length >> 2);
      for (var i = 0; i < output.length; i++)
        output[i] = 0;
      for (var i = 0; i < input.length * 8; i += 8)
        output[i >> 5] |= (input.charCodeAt(i / 8) & 255) << 24 - i % 32;
      return output;
    }
    function binb2rstr(input) {
      var output = "";
      for (var i = 0; i < input.length * 32; i += 8)
        output += String.fromCharCode(input[i >> 5] >>> 24 - i % 32 & 255);
      return output;
    }
    function binb_sha1(x, len) {
      x[len >> 5] |= 128 << 24 - len % 32;
      x[(len + 64 >> 9 << 4) + 15] = len;
      var w = Array(80);
      var a = 1732584193;
      var b = -271733879;
      var c = -1732584194;
      var d = 271733878;
      var e = -1009589776;
      for (var i = 0; i < x.length; i += 16) {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;
        var olde = e;
        for (var j = 0; j < 80; j++) {
          if (j < 16) w[j] = x[i + j];
          else w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
          var t = safe_add(
            safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
            safe_add(safe_add(e, w[j]), sha1_kt(j))
          );
          e = d;
          d = c;
          c = bit_rol(b, 30);
          b = a;
          a = t;
        }
        a = safe_add(a, olda);
        b = safe_add(b, oldb);
        c = safe_add(c, oldc);
        d = safe_add(d, oldd);
        e = safe_add(e, olde);
      }
      return Array(a, b, c, d, e);
    }
    function sha1_ft(t, b, c, d) {
      if (t < 20) return b & c | ~b & d;
      if (t < 40) return b ^ c ^ d;
      if (t < 60) return b & c | b & d | c & d;
      return b ^ c ^ d;
    }
    function sha1_kt(t) {
      return t < 20 ? 1518500249 : t < 40 ? 1859775393 : t < 60 ? -1894007588 : -899497514;
    }
    function safe_add(x, y) {
      var lsw = (x & 65535) + (y & 65535);
      var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return msw << 16 | lsw & 65535;
    }
    function bit_rol(num, cnt) {
      return num << cnt | num >>> 32 - cnt;
    }
    exports2.HMACSHA1 = function(key, data) {
      return b64_hmac_sha1(key, data);
    };
  }
});

// node_modules/oauth/lib/_utils.js
var require_utils2 = __commonJS({
  "node_modules/oauth/lib/_utils.js"(exports2, module2) {
    module2.exports.isAnEarlyCloseHost = function(hostName) {
      return hostName && hostName.match(".*google(apis)?.com$");
    };
  }
});

// node_modules/oauth/lib/oauth.js
var require_oauth = __commonJS({
  "node_modules/oauth/lib/oauth.js"(exports2) {
    var crypto = require("crypto");
    var sha1 = require_sha1();
    var http = require("http");
    var https = require("https");
    var URL = require("url");
    var querystring = require("querystring");
    var OAuthUtils = require_utils2();
    exports2.OAuth = function(requestUrl, accessUrl, consumerKey, consumerSecret, version, authorize_callback, signatureMethod, nonceSize, customHeaders) {
      this._isEcho = false;
      this._requestUrl = requestUrl;
      this._accessUrl = accessUrl;
      this._consumerKey = consumerKey;
      this._consumerSecret = this._encodeData(consumerSecret);
      if (signatureMethod == "RSA-SHA1") {
        this._privateKey = consumerSecret;
      }
      this._version = version;
      if (authorize_callback === void 0) {
        this._authorize_callback = "oob";
      } else {
        this._authorize_callback = authorize_callback;
      }
      if (signatureMethod != "PLAINTEXT" && signatureMethod != "HMAC-SHA1" && signatureMethod != "HMAC-SHA256" && signatureMethod != "RSA-SHA1")
        throw new Error("Un-supported signature method: " + signatureMethod);
      this._signatureMethod = signatureMethod;
      this._nonceSize = nonceSize || 32;
      this._headers = customHeaders || {
        "Accept": "*/*",
        "Connection": "close",
        "User-Agent": "Node authentication"
      };
      this._clientOptions = this._defaultClientOptions = {
        "requestTokenHttpMethod": "POST",
        "accessTokenHttpMethod": "POST",
        "followRedirects": true
      };
      this._oauthParameterSeperator = ",";
    };
    exports2.OAuthEcho = function(realm, verify_credentials, consumerKey, consumerSecret, version, signatureMethod, nonceSize, customHeaders) {
      this._isEcho = true;
      this._realm = realm;
      this._verifyCredentials = verify_credentials;
      this._consumerKey = consumerKey;
      this._consumerSecret = this._encodeData(consumerSecret);
      if (signatureMethod == "RSA-SHA1") {
        this._privateKey = consumerSecret;
      }
      this._version = version;
      if (signatureMethod != "PLAINTEXT" && signatureMethod != "HMAC-SHA1" && signatureMethod != "HMAC-SHA256" && signatureMethod != "RSA-SHA1")
        throw new Error("Un-supported signature method: " + signatureMethod);
      this._signatureMethod = signatureMethod;
      this._nonceSize = nonceSize || 32;
      this._headers = customHeaders || {
        "Accept": "*/*",
        "Connection": "close",
        "User-Agent": "Node authentication"
      };
      this._oauthParameterSeperator = ",";
    };
    exports2.OAuthEcho.prototype = exports2.OAuth.prototype;
    exports2.OAuth.prototype._getTimestamp = function() {
      return Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3);
    };
    exports2.OAuth.prototype._encodeData = function(toEncode) {
      if (toEncode == null || toEncode == "") return "";
      else {
        var result = encodeURIComponent(toEncode);
        return result.replace(/\!/g, "%21").replace(/\'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
      }
    };
    exports2.OAuth.prototype._decodeData = function(toDecode) {
      if (toDecode != null) {
        toDecode = toDecode.replace(/\+/g, " ");
      }
      return decodeURIComponent(toDecode);
    };
    exports2.OAuth.prototype._getSignature = function(method, url, parameters, tokenSecret) {
      var signatureBase = this._createSignatureBase(method, url, parameters);
      return this._createSignature(signatureBase, tokenSecret);
    };
    exports2.OAuth.prototype._normalizeUrl = function(url) {
      var parsedUrl = URL.parse(url, true);
      var port = "";
      if (parsedUrl.port) {
        if (parsedUrl.protocol == "http:" && parsedUrl.port != "80" || parsedUrl.protocol == "https:" && parsedUrl.port != "443") {
          port = ":" + parsedUrl.port;
        }
      }
      if (!parsedUrl.pathname || parsedUrl.pathname == "") parsedUrl.pathname = "/";
      return parsedUrl.protocol + "//" + parsedUrl.hostname + port + parsedUrl.pathname;
    };
    exports2.OAuth.prototype._isParameterNameAnOAuthParameter = function(parameter) {
      var m = parameter.match("^oauth_");
      if (m && m[0] === "oauth_") {
        return true;
      } else {
        return false;
      }
    };
    exports2.OAuth.prototype._buildAuthorizationHeaders = function(orderedParameters) {
      var authHeader = "OAuth ";
      if (this._isEcho) {
        authHeader += 'realm="' + this._realm + '",';
      }
      for (var i = 0; i < orderedParameters.length; i++) {
        if (this._isParameterNameAnOAuthParameter(orderedParameters[i][0])) {
          authHeader += "" + this._encodeData(orderedParameters[i][0]) + '="' + this._encodeData(orderedParameters[i][1]) + '"' + this._oauthParameterSeperator;
        }
      }
      authHeader = authHeader.substring(0, authHeader.length - this._oauthParameterSeperator.length);
      return authHeader;
    };
    exports2.OAuth.prototype._makeArrayOfArgumentsHash = function(argumentsHash) {
      var argument_pairs = [];
      for (var key in argumentsHash) {
        if (argumentsHash.hasOwnProperty(key)) {
          var value = argumentsHash[key];
          if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
              argument_pairs[argument_pairs.length] = [key, value[i]];
            }
          } else {
            argument_pairs[argument_pairs.length] = [key, value];
          }
        }
      }
      return argument_pairs;
    };
    exports2.OAuth.prototype._sortRequestParams = function(argument_pairs) {
      argument_pairs.sort(function(a, b) {
        if (a[0] == b[0]) {
          return a[1] < b[1] ? -1 : 1;
        } else return a[0] < b[0] ? -1 : 1;
      });
      return argument_pairs;
    };
    exports2.OAuth.prototype._normaliseRequestParams = function(args) {
      var argument_pairs = this._makeArrayOfArgumentsHash(args);
      for (var i = 0; i < argument_pairs.length; i++) {
        argument_pairs[i][0] = this._encodeData(argument_pairs[i][0]);
        argument_pairs[i][1] = this._encodeData(argument_pairs[i][1]);
      }
      argument_pairs = this._sortRequestParams(argument_pairs);
      var args = "";
      for (var i = 0; i < argument_pairs.length; i++) {
        args += argument_pairs[i][0];
        args += "=";
        args += argument_pairs[i][1];
        if (i < argument_pairs.length - 1) args += "&";
      }
      return args;
    };
    exports2.OAuth.prototype._createSignatureBase = function(method, url, parameters) {
      url = this._encodeData(this._normalizeUrl(url));
      parameters = this._encodeData(parameters);
      return method.toUpperCase() + "&" + url + "&" + parameters;
    };
    exports2.OAuth.prototype._createSignature = function(signatureBase, tokenSecret) {
      if (tokenSecret === void 0) var tokenSecret = "";
      else tokenSecret = this._encodeData(tokenSecret);
      var key = this._consumerSecret + "&" + tokenSecret;
      var hash = "";
      if (this._signatureMethod == "PLAINTEXT") {
        hash = key;
      } else if (this._signatureMethod == "RSA-SHA1") {
        key = this._privateKey || "";
        hash = crypto.createSign("RSA-SHA1").update(signatureBase).sign(key, "base64");
      } else if (this._signatureMethod == "HMAC-SHA256") {
        hash = crypto.createHmac("sha256", key).update(signatureBase).digest("base64");
      } else {
        if (crypto.Hmac) {
          hash = crypto.createHmac("sha1", key).update(signatureBase).digest("base64");
        } else {
          hash = sha1.HMACSHA1(key, signatureBase);
        }
      }
      return hash;
    };
    exports2.OAuth.prototype.NONCE_CHARS = [
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9"
    ];
    exports2.OAuth.prototype._getNonce = function(nonceSize) {
      var result = [];
      var chars = this.NONCE_CHARS;
      var char_pos;
      var nonce_chars_length = chars.length;
      for (var i = 0; i < nonceSize; i++) {
        char_pos = Math.floor(Math.random() * nonce_chars_length);
        result[i] = chars[char_pos];
      }
      return result.join("");
    };
    exports2.OAuth.prototype._createClient = function(port, hostname, method, path2, headers, sslEnabled) {
      var options = {
        host: hostname,
        port,
        path: path2,
        method,
        headers
      };
      var httpModel;
      if (sslEnabled) {
        httpModel = https;
      } else {
        httpModel = http;
      }
      return httpModel.request(options);
    };
    exports2.OAuth.prototype._prepareParameters = function(oauth_token, oauth_token_secret, method, url, extra_params) {
      var oauthParameters = {
        "oauth_timestamp": this._getTimestamp(),
        "oauth_nonce": this._getNonce(this._nonceSize),
        "oauth_version": this._version,
        "oauth_signature_method": this._signatureMethod,
        "oauth_consumer_key": this._consumerKey
      };
      if (oauth_token) {
        oauthParameters["oauth_token"] = oauth_token;
      }
      var sig;
      if (this._isEcho) {
        sig = this._getSignature("GET", this._verifyCredentials, this._normaliseRequestParams(oauthParameters), oauth_token_secret);
      } else {
        if (extra_params) {
          for (var key in extra_params) {
            if (extra_params.hasOwnProperty(key)) oauthParameters[key] = extra_params[key];
          }
        }
        var parsedUrl = URL.parse(url, false);
        if (parsedUrl.query) {
          var key2;
          var extraParameters = querystring.parse(parsedUrl.query);
          for (var key in extraParameters) {
            var value = extraParameters[key];
            if (typeof value == "object") {
              for (key2 in value) {
                oauthParameters[key + "[" + key2 + "]"] = value[key2];
              }
            } else {
              oauthParameters[key] = value;
            }
          }
        }
        sig = this._getSignature(method, url, this._normaliseRequestParams(oauthParameters), oauth_token_secret);
      }
      var orderedParameters = this._sortRequestParams(this._makeArrayOfArgumentsHash(oauthParameters));
      orderedParameters[orderedParameters.length] = ["oauth_signature", sig];
      return orderedParameters;
    };
    exports2.OAuth.prototype._performSecureRequest = function(oauth_token, oauth_token_secret, method, url, extra_params, post_body, post_content_type, callback) {
      var orderedParameters = this._prepareParameters(oauth_token, oauth_token_secret, method, url, extra_params);
      if (!post_content_type) {
        post_content_type = "application/x-www-form-urlencoded";
      }
      var parsedUrl = URL.parse(url, false);
      if (parsedUrl.protocol == "http:" && !parsedUrl.port) parsedUrl.port = 80;
      if (parsedUrl.protocol == "https:" && !parsedUrl.port) parsedUrl.port = 443;
      var headers = {};
      var authorization = this._buildAuthorizationHeaders(orderedParameters);
      if (this._isEcho) {
        headers["X-Verify-Credentials-Authorization"] = authorization;
      } else {
        headers["Authorization"] = authorization;
      }
      headers["Host"] = parsedUrl.host;
      for (var key in this._headers) {
        if (this._headers.hasOwnProperty(key)) {
          headers[key] = this._headers[key];
        }
      }
      for (var key in extra_params) {
        if (this._isParameterNameAnOAuthParameter(key)) {
          delete extra_params[key];
        }
      }
      if ((method == "POST" || method == "PUT") && (post_body == null && extra_params != null)) {
        post_body = querystring.stringify(extra_params).replace(/\!/g, "%21").replace(/\'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
      }
      if (post_body) {
        if (Buffer.isBuffer(post_body)) {
          headers["Content-length"] = post_body.length;
        } else {
          headers["Content-length"] = Buffer.byteLength(post_body);
        }
      } else {
        headers["Content-length"] = 0;
      }
      headers["Content-Type"] = post_content_type;
      var path2;
      if (!parsedUrl.pathname || parsedUrl.pathname == "") parsedUrl.pathname = "/";
      if (parsedUrl.query) path2 = parsedUrl.pathname + "?" + parsedUrl.query;
      else path2 = parsedUrl.pathname;
      var request;
      if (parsedUrl.protocol == "https:") {
        request = this._createClient(parsedUrl.port, parsedUrl.hostname, method, path2, headers, true);
      } else {
        request = this._createClient(parsedUrl.port, parsedUrl.hostname, method, path2, headers);
      }
      var clientOptions = this._clientOptions;
      if (callback) {
        var data = "";
        var self = this;
        var allowEarlyClose = OAuthUtils.isAnEarlyCloseHost(parsedUrl.hostname);
        var callbackCalled = false;
        var passBackControl = function(response) {
          if (!callbackCalled) {
            callbackCalled = true;
            if (response.statusCode >= 200 && response.statusCode <= 299) {
              callback(null, data, response);
            } else {
              if ((response.statusCode == 301 || response.statusCode == 302) && clientOptions.followRedirects && response.headers && response.headers.location) {
                self._performSecureRequest(oauth_token, oauth_token_secret, method, response.headers.location, extra_params, post_body, post_content_type, callback);
              } else {
                callback({ statusCode: response.statusCode, data }, data, response);
              }
            }
          }
        };
        request.on("response", function(response) {
          response.setEncoding("utf8");
          response.on("data", function(chunk) {
            data += chunk;
          });
          response.on("end", function() {
            passBackControl(response);
          });
          response.on("close", function() {
            if (allowEarlyClose) {
              passBackControl(response);
            }
          });
        });
        request.on("error", function(err) {
          if (!callbackCalled) {
            callbackCalled = true;
            callback(err);
          }
        });
        if ((method == "POST" || method == "PUT") && post_body != null && post_body != "") {
          request.write(post_body);
        }
        request.end();
      } else {
        if ((method == "POST" || method == "PUT") && post_body != null && post_body != "") {
          request.write(post_body);
        }
        return request;
      }
      return;
    };
    exports2.OAuth.prototype.setClientOptions = function(options) {
      var key, mergedOptions = {}, hasOwnProperty = Object.prototype.hasOwnProperty;
      for (key in this._defaultClientOptions) {
        if (!hasOwnProperty.call(options, key)) {
          mergedOptions[key] = this._defaultClientOptions[key];
        } else {
          mergedOptions[key] = options[key];
        }
      }
      this._clientOptions = mergedOptions;
    };
    exports2.OAuth.prototype.getOAuthAccessToken = function(oauth_token, oauth_token_secret, oauth_verifier, callback) {
      var extraParams = {};
      if (typeof oauth_verifier == "function") {
        callback = oauth_verifier;
      } else {
        extraParams.oauth_verifier = oauth_verifier;
      }
      this._performSecureRequest(oauth_token, oauth_token_secret, this._clientOptions.accessTokenHttpMethod, this._accessUrl, extraParams, null, null, function(error, data, response) {
        if (error) callback(error);
        else {
          var results = querystring.parse(data);
          var oauth_access_token = results["oauth_token"];
          delete results["oauth_token"];
          var oauth_access_token_secret = results["oauth_token_secret"];
          delete results["oauth_token_secret"];
          callback(null, oauth_access_token, oauth_access_token_secret, results);
        }
      });
    };
    exports2.OAuth.prototype.getProtectedResource = function(url, method, oauth_token, oauth_token_secret, callback) {
      this._performSecureRequest(oauth_token, oauth_token_secret, method, url, null, "", null, callback);
    };
    exports2.OAuth.prototype.delete = function(url, oauth_token, oauth_token_secret, callback) {
      return this._performSecureRequest(oauth_token, oauth_token_secret, "DELETE", url, null, "", null, callback);
    };
    exports2.OAuth.prototype.get = function(url, oauth_token, oauth_token_secret, callback) {
      return this._performSecureRequest(oauth_token, oauth_token_secret, "GET", url, null, "", null, callback);
    };
    exports2.OAuth.prototype._putOrPost = function(method, url, oauth_token, oauth_token_secret, post_body, post_content_type, callback) {
      var extra_params = null;
      if (typeof post_content_type == "function") {
        callback = post_content_type;
        post_content_type = null;
      }
      if (typeof post_body != "string" && !Buffer.isBuffer(post_body)) {
        post_content_type = "application/x-www-form-urlencoded";
        extra_params = post_body;
        post_body = null;
      }
      return this._performSecureRequest(oauth_token, oauth_token_secret, method, url, extra_params, post_body, post_content_type, callback);
    };
    exports2.OAuth.prototype.put = function(url, oauth_token, oauth_token_secret, post_body, post_content_type, callback) {
      return this._putOrPost("PUT", url, oauth_token, oauth_token_secret, post_body, post_content_type, callback);
    };
    exports2.OAuth.prototype.post = function(url, oauth_token, oauth_token_secret, post_body, post_content_type, callback) {
      return this._putOrPost("POST", url, oauth_token, oauth_token_secret, post_body, post_content_type, callback);
    };
    exports2.OAuth.prototype.getOAuthRequestToken = function(extraParams, callback) {
      if (typeof extraParams == "function") {
        callback = extraParams;
        extraParams = {};
      }
      if (this._authorize_callback) {
        extraParams["oauth_callback"] = this._authorize_callback;
      }
      this._performSecureRequest(null, null, this._clientOptions.requestTokenHttpMethod, this._requestUrl, extraParams, null, null, function(error, data, response) {
        if (error) callback(error);
        else {
          var results = querystring.parse(data);
          var oauth_token = results["oauth_token"];
          var oauth_token_secret = results["oauth_token_secret"];
          delete results["oauth_token"];
          delete results["oauth_token_secret"];
          callback(null, oauth_token, oauth_token_secret, results);
        }
      });
    };
    exports2.OAuth.prototype.signUrl = function(url, oauth_token, oauth_token_secret, method) {
      if (method === void 0) {
        var method = "GET";
      }
      var orderedParameters = this._prepareParameters(oauth_token, oauth_token_secret, method, url, {});
      var parsedUrl = URL.parse(url, false);
      var query = "";
      for (var i = 0; i < orderedParameters.length; i++) {
        query += orderedParameters[i][0] + "=" + this._encodeData(orderedParameters[i][1]) + "&";
      }
      query = query.substring(0, query.length - 1);
      return parsedUrl.protocol + "//" + parsedUrl.host + parsedUrl.pathname + "?" + query;
    };
    exports2.OAuth.prototype.authHeader = function(url, oauth_token, oauth_token_secret, method) {
      if (method === void 0) {
        var method = "GET";
      }
      var orderedParameters = this._prepareParameters(oauth_token, oauth_token_secret, method, url, {});
      return this._buildAuthorizationHeaders(orderedParameters);
    };
  }
});

// node_modules/oauth/lib/oauth2.js
var require_oauth2 = __commonJS({
  "node_modules/oauth/lib/oauth2.js"(exports2) {
    var querystring = require("querystring");
    var crypto = require("crypto");
    var https = require("https");
    var http = require("http");
    var URL = require("url");
    var OAuthUtils = require_utils2();
    exports2.OAuth2 = function(clientId, clientSecret, baseSite, authorizePath, accessTokenPath, customHeaders) {
      this._clientId = clientId;
      this._clientSecret = clientSecret;
      this._baseSite = baseSite;
      this._authorizeUrl = authorizePath || "/oauth/authorize";
      this._accessTokenUrl = accessTokenPath || "/oauth/access_token";
      this._accessTokenName = "access_token";
      this._authMethod = "Bearer";
      this._customHeaders = customHeaders || {};
      this._useAuthorizationHeaderForGET = false;
      this._agent = void 0;
    };
    exports2.OAuth2.prototype.setAgent = function(agent) {
      this._agent = agent;
    };
    exports2.OAuth2.prototype.setAccessTokenName = function(name) {
      this._accessTokenName = name;
    };
    exports2.OAuth2.prototype.setAuthMethod = function(authMethod) {
      this._authMethod = authMethod;
    };
    exports2.OAuth2.prototype.useAuthorizationHeaderforGET = function(useIt) {
      this._useAuthorizationHeaderForGET = useIt;
    };
    exports2.OAuth2.prototype._getAccessTokenUrl = function() {
      return this._baseSite + this._accessTokenUrl;
    };
    exports2.OAuth2.prototype.buildAuthHeader = function(token) {
      return this._authMethod + " " + token;
    };
    exports2.OAuth2.prototype._chooseHttpLibrary = function(parsedUrl) {
      var http_library = https;
      if (parsedUrl.protocol != "https:") {
        http_library = http;
      }
      return http_library;
    };
    exports2.OAuth2.prototype._request = function(method, url, headers, post_body, access_token, callback) {
      var parsedUrl = URL.parse(url, true);
      if (parsedUrl.protocol == "https:" && !parsedUrl.port) {
        parsedUrl.port = 443;
      }
      var http_library = this._chooseHttpLibrary(parsedUrl);
      var realHeaders = {};
      for (var key in this._customHeaders) {
        realHeaders[key] = this._customHeaders[key];
      }
      if (headers) {
        for (var key in headers) {
          realHeaders[key] = headers[key];
        }
      }
      realHeaders["Host"] = parsedUrl.host;
      if (!realHeaders["User-Agent"]) {
        realHeaders["User-Agent"] = "Node-oauth";
      }
      if (post_body) {
        if (Buffer.isBuffer(post_body)) {
          realHeaders["Content-Length"] = post_body.length;
        } else {
          realHeaders["Content-Length"] = Buffer.byteLength(post_body);
        }
      } else {
        realHeaders["Content-length"] = 0;
      }
      if (access_token && !("Authorization" in realHeaders)) {
        if (!parsedUrl.query) parsedUrl.query = {};
        parsedUrl.query[this._accessTokenName] = access_token;
      }
      var queryStr = querystring.stringify(parsedUrl.query);
      if (queryStr) queryStr = "?" + queryStr;
      var options = {
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + queryStr,
        method,
        headers: realHeaders
      };
      this._executeRequest(http_library, options, post_body, callback);
    };
    exports2.OAuth2.prototype._executeRequest = function(http_library, options, post_body, callback) {
      var allowEarlyClose = OAuthUtils.isAnEarlyCloseHost(options.host);
      var callbackCalled = false;
      function passBackControl(response, result2) {
        if (!callbackCalled) {
          callbackCalled = true;
          if (!(response.statusCode >= 200 && response.statusCode <= 299) && response.statusCode != 301 && response.statusCode != 302) {
            callback({ statusCode: response.statusCode, data: result2 });
          } else {
            callback(null, result2, response);
          }
        }
      }
      var result = "";
      if (this._agent) {
        options.agent = this._agent;
      }
      var request = http_library.request(options);
      request.on("response", function(response) {
        response.on("data", function(chunk) {
          result += chunk;
        });
        response.on("close", function(err) {
          if (allowEarlyClose) {
            passBackControl(response, result);
          }
        });
        response.addListener("end", function() {
          passBackControl(response, result);
        });
      });
      request.on("error", function(e) {
        if (!callbackCalled) {
          callbackCalled = true;
          callback(e);
        }
      });
      if ((options.method == "POST" || options.method == "PUT") && post_body) {
        request.write(post_body);
      }
      request.end();
    };
    exports2.OAuth2.prototype.getAuthorizeUrl = function(params) {
      var params = params || {};
      params["client_id"] = this._clientId;
      return this._baseSite + this._authorizeUrl + "?" + querystring.stringify(params);
    };
    exports2.OAuth2.prototype.getOAuthAccessToken = function(code, params, callback) {
      var params = params || {};
      params["client_id"] = this._clientId;
      params["client_secret"] = this._clientSecret;
      var codeParam = params.grant_type === "refresh_token" ? "refresh_token" : "code";
      params[codeParam] = code;
      var post_data = querystring.stringify(params);
      var post_headers = {
        "Content-Type": "application/x-www-form-urlencoded"
      };
      this._request("POST", this._getAccessTokenUrl(), post_headers, post_data, null, function(error, data, response) {
        if (error) callback(error);
        else {
          var results;
          try {
            results = JSON.parse(data);
          } catch (e) {
            results = querystring.parse(data);
          }
          var access_token = results["access_token"];
          var refresh_token = results["refresh_token"];
          delete results["refresh_token"];
          callback(null, access_token, refresh_token, results);
        }
      });
    };
    exports2.OAuth2.prototype.getProtectedResource = function(url, access_token, callback) {
      this._request("GET", url, {}, "", access_token, callback);
    };
    exports2.OAuth2.prototype.get = function(url, access_token, callback) {
      if (this._useAuthorizationHeaderForGET) {
        var headers = { "Authorization": this.buildAuthHeader(access_token) };
        access_token = null;
      } else {
        headers = {};
      }
      this._request("GET", url, headers, "", access_token, callback);
    };
  }
});

// node_modules/oauth/index.js
var require_oauth3 = __commonJS({
  "node_modules/oauth/index.js"(exports2) {
    exports2.OAuth = require_oauth().OAuth;
    exports2.OAuthEcho = require_oauth().OAuthEcho;
    exports2.OAuth2 = require_oauth2().OAuth2;
  }
});

// node_modules/passport-oauth2/lib/state/null.js
var require_null = __commonJS({
  "node_modules/passport-oauth2/lib/state/null.js"(exports2, module2) {
    function NullStore(options) {
    }
    NullStore.prototype.store = function(req, cb) {
      cb();
    };
    NullStore.prototype.verify = function(req, providedState, cb) {
      cb(null, true);
    };
    module2.exports = NullStore;
  }
});

// node_modules/passport-oauth2/lib/state/session.js
var require_session3 = __commonJS({
  "node_modules/passport-oauth2/lib/state/session.js"(exports2, module2) {
    var uid = require_uid2();
    function SessionStore(options) {
      if (!options.key) {
        throw new TypeError("Session-based state store requires a session key");
      }
      this._key = options.key;
    }
    SessionStore.prototype.store = function(req, callback) {
      if (!req.session) {
        return callback(new Error("OAuth 2.0 authentication requires session support when using state. Did you forget to use express-session middleware?"));
      }
      var key = this._key;
      var state = uid(24);
      if (!req.session[key]) {
        req.session[key] = {};
      }
      req.session[key].state = state;
      callback(null, state);
    };
    SessionStore.prototype.verify = function(req, providedState, callback) {
      if (!req.session) {
        return callback(new Error("OAuth 2.0 authentication requires session support when using state. Did you forget to use express-session middleware?"));
      }
      var key = this._key;
      if (!req.session[key]) {
        return callback(null, false, { message: "Unable to verify authorization request state." });
      }
      var state = req.session[key].state;
      if (!state) {
        return callback(null, false, { message: "Unable to verify authorization request state." });
      }
      delete req.session[key].state;
      if (Object.keys(req.session[key]).length === 0) {
        delete req.session[key];
      }
      if (state !== providedState) {
        return callback(null, false, { message: "Invalid authorization request state." });
      }
      return callback(null, true);
    };
    module2.exports = SessionStore;
  }
});

// node_modules/passport-oauth2/lib/state/store.js
var require_store2 = __commonJS({
  "node_modules/passport-oauth2/lib/state/store.js"(exports2, module2) {
    var uid = require_uid2();
    function SessionStore(options) {
      if (!options.key) {
        throw new TypeError("Session-based state store requires a session key");
      }
      this._key = options.key;
    }
    SessionStore.prototype.store = function(req, state, meta, callback) {
      if (!req.session) {
        return callback(new Error("OAuth 2.0 authentication requires session support when using state. Did you forget to use express-session middleware?"));
      }
      var key = this._key;
      var sstate = {
        handle: uid(24)
      };
      if (state) {
        sstate.state = state;
      }
      if (!req.session[key]) {
        req.session[key] = {};
      }
      req.session[key].state = sstate;
      callback(null, sstate.handle);
    };
    SessionStore.prototype.verify = function(req, providedState, callback) {
      if (!req.session) {
        return callback(new Error("OAuth 2.0 authentication requires session support when using state. Did you forget to use express-session middleware?"));
      }
      var key = this._key;
      if (!req.session[key]) {
        return callback(null, false, { message: "Unable to verify authorization request state." });
      }
      var state = req.session[key].state;
      if (!state) {
        return callback(null, false, { message: "Unable to verify authorization request state." });
      }
      delete req.session[key].state;
      if (Object.keys(req.session[key]).length === 0) {
        delete req.session[key];
      }
      if (state.handle !== providedState) {
        return callback(null, false, { message: "Invalid authorization request state." });
      }
      return callback(null, true, state.state);
    };
    module2.exports = SessionStore;
  }
});

// node_modules/passport-oauth2/lib/state/pkcesession.js
var require_pkcesession = __commonJS({
  "node_modules/passport-oauth2/lib/state/pkcesession.js"(exports2, module2) {
    var uid = require_uid2();
    function PKCESessionStore(options) {
      if (!options.key) {
        throw new TypeError("Session-based state store requires a session key");
      }
      this._key = options.key;
    }
    PKCESessionStore.prototype.store = function(req, verifier, state, meta, callback) {
      if (!req.session) {
        return callback(new Error("OAuth 2.0 authentication requires session support when using state. Did you forget to use express-session middleware?"));
      }
      var key = this._key;
      var sstate = {
        handle: uid(24),
        code_verifier: verifier
      };
      if (state) {
        sstate.state = state;
      }
      if (!req.session[key]) {
        req.session[key] = {};
      }
      req.session[key].state = sstate;
      callback(null, sstate.handle);
    };
    PKCESessionStore.prototype.verify = function(req, providedState, callback) {
      if (!req.session) {
        return callback(new Error("OAuth 2.0 authentication requires session support when using state. Did you forget to use express-session middleware?"));
      }
      var key = this._key;
      if (!req.session[key]) {
        return callback(null, false, { message: "Unable to verify authorization request state." });
      }
      var state = req.session[key].state;
      if (!state) {
        return callback(null, false, { message: "Unable to verify authorization request state." });
      }
      delete req.session[key].state;
      if (Object.keys(req.session[key]).length === 0) {
        delete req.session[key];
      }
      if (state.handle !== providedState) {
        return callback(null, false, { message: "Invalid authorization request state." });
      }
      return callback(null, state.code_verifier, state.state);
    };
    module2.exports = PKCESessionStore;
  }
});

// node_modules/passport-oauth2/lib/errors/authorizationerror.js
var require_authorizationerror = __commonJS({
  "node_modules/passport-oauth2/lib/errors/authorizationerror.js"(exports2, module2) {
    function AuthorizationError(message, code, uri, status) {
      if (!status) {
        switch (code) {
          case "access_denied":
            status = 403;
            break;
          case "server_error":
            status = 502;
            break;
          case "temporarily_unavailable":
            status = 503;
            break;
        }
      }
      Error.call(this);
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
      this.message = message;
      this.code = code || "server_error";
      this.uri = uri;
      this.status = status || 500;
    }
    AuthorizationError.prototype.__proto__ = Error.prototype;
    module2.exports = AuthorizationError;
  }
});

// node_modules/passport-oauth2/lib/errors/tokenerror.js
var require_tokenerror = __commonJS({
  "node_modules/passport-oauth2/lib/errors/tokenerror.js"(exports2, module2) {
    function TokenError(message, code, uri, status) {
      Error.call(this);
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
      this.message = message;
      this.code = code || "invalid_request";
      this.uri = uri;
      this.status = status || 500;
    }
    TokenError.prototype.__proto__ = Error.prototype;
    module2.exports = TokenError;
  }
});

// node_modules/passport-oauth2/lib/errors/internaloautherror.js
var require_internaloautherror = __commonJS({
  "node_modules/passport-oauth2/lib/errors/internaloautherror.js"(exports2, module2) {
    function InternalOAuthError(message, err) {
      Error.call(this);
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
      this.message = message;
      this.oauthError = err;
    }
    InternalOAuthError.prototype.__proto__ = Error.prototype;
    InternalOAuthError.prototype.toString = function() {
      var m = this.name;
      if (this.message) {
        m += ": " + this.message;
      }
      if (this.oauthError) {
        if (this.oauthError instanceof Error) {
          m = this.oauthError.toString();
        } else if (this.oauthError.statusCode && this.oauthError.data) {
          m += " (status: " + this.oauthError.statusCode + " data: " + this.oauthError.data + ")";
        }
      }
      return m;
    };
    module2.exports = InternalOAuthError;
  }
});

// node_modules/passport-oauth2/lib/strategy.js
var require_strategy2 = __commonJS({
  "node_modules/passport-oauth2/lib/strategy.js"(exports2, module2) {
    var passport4 = require_lib();
    var url = require("url");
    var uid = require_uid2();
    var crypto = require("crypto");
    var base64url = require_base64url2();
    var util = require("util");
    var utils = require_utils();
    var OAuth2 = require_oauth3().OAuth2;
    var NullStore = require_null();
    var NonceStore = require_session3();
    var StateStore = require_store2();
    var PKCEStateStore = require_pkcesession();
    var AuthorizationError = require_authorizationerror();
    var TokenError = require_tokenerror();
    var InternalOAuthError = require_internaloautherror();
    function OAuth2Strategy(options, verify) {
      if (typeof options == "function") {
        verify = options;
        options = void 0;
      }
      options = options || {};
      if (!verify) {
        throw new TypeError("OAuth2Strategy requires a verify callback");
      }
      if (!options.authorizationURL) {
        throw new TypeError("OAuth2Strategy requires a authorizationURL option");
      }
      if (!options.tokenURL) {
        throw new TypeError("OAuth2Strategy requires a tokenURL option");
      }
      if (!options.clientID) {
        throw new TypeError("OAuth2Strategy requires a clientID option");
      }
      passport4.Strategy.call(this);
      this.name = "oauth2";
      this._verify = verify;
      this._oauth2 = new OAuth2(
        options.clientID,
        options.clientSecret,
        "",
        options.authorizationURL,
        options.tokenURL,
        options.customHeaders
      );
      this._callbackURL = options.callbackURL;
      this._scope = options.scope;
      this._scopeSeparator = options.scopeSeparator || " ";
      this._pkceMethod = options.pkce === true ? "S256" : options.pkce;
      this._key = options.sessionKey || "oauth2:" + url.parse(options.authorizationURL).hostname;
      if (options.store && typeof options.store == "object") {
        this._stateStore = options.store;
      } else if (options.store) {
        this._stateStore = options.pkce ? new PKCEStateStore({ key: this._key }) : new StateStore({ key: this._key });
      } else if (options.state) {
        this._stateStore = options.pkce ? new PKCEStateStore({ key: this._key }) : new NonceStore({ key: this._key });
      } else {
        if (options.pkce) {
          throw new TypeError("OAuth2Strategy requires `state: true` option when PKCE is enabled");
        }
        this._stateStore = new NullStore();
      }
      this._trustProxy = options.proxy;
      this._passReqToCallback = options.passReqToCallback;
      this._skipUserProfile = options.skipUserProfile === void 0 ? false : options.skipUserProfile;
    }
    util.inherits(OAuth2Strategy, passport4.Strategy);
    OAuth2Strategy.prototype.authenticate = function(req, options) {
      options = options || {};
      var self = this;
      if (req.query && req.query.error) {
        if (req.query.error == "access_denied") {
          return this.fail({ message: req.query.error_description });
        } else {
          return this.error(new AuthorizationError(req.query.error_description, req.query.error, req.query.error_uri));
        }
      }
      var callbackURL = options.callbackURL || this._callbackURL;
      if (callbackURL) {
        var parsed = url.parse(callbackURL);
        if (!parsed.protocol) {
          callbackURL = url.resolve(utils.originalURL(req, { proxy: this._trustProxy }), callbackURL);
        }
      }
      var meta = {
        authorizationURL: this._oauth2._authorizeUrl,
        tokenURL: this._oauth2._accessTokenUrl,
        clientID: this._oauth2._clientId,
        callbackURL
      };
      if (req.query && req.query.code || req.body && req.body.code) {
        let loaded2 = function(err, ok, state2) {
          if (err) {
            return self.error(err);
          }
          if (!ok) {
            return self.fail(state2, 403);
          }
          var code = req.query && req.query.code || req.body && req.body.code;
          var params2 = self.tokenParams(options);
          params2.grant_type = "authorization_code";
          if (callbackURL) {
            params2.redirect_uri = callbackURL;
          }
          if (typeof ok == "string") {
            params2.code_verifier = ok;
          }
          self._oauth2.getOAuthAccessToken(
            code,
            params2,
            function(err2, accessToken, refreshToken, params3) {
              if (err2) {
                return self.error(self._createOAuthError("Failed to obtain access token", err2));
              }
              if (!accessToken) {
                return self.error(new Error("Failed to obtain access token"));
              }
              self._loadUserProfile(accessToken, function(err3, profile) {
                if (err3) {
                  return self.error(err3);
                }
                function verified(err4, user, info) {
                  if (err4) {
                    return self.error(err4);
                  }
                  if (!user) {
                    return self.fail(info);
                  }
                  info = info || {};
                  if (state2) {
                    info.state = state2;
                  }
                  self.success(user, info);
                }
                try {
                  if (self._passReqToCallback) {
                    var arity2 = self._verify.length;
                    if (arity2 == 6) {
                      self._verify(req, accessToken, refreshToken, params3, profile, verified);
                    } else {
                      self._verify(req, accessToken, refreshToken, profile, verified);
                    }
                  } else {
                    var arity2 = self._verify.length;
                    if (arity2 == 5) {
                      self._verify(accessToken, refreshToken, params3, profile, verified);
                    } else {
                      self._verify(accessToken, refreshToken, profile, verified);
                    }
                  }
                } catch (ex) {
                  return self.error(ex);
                }
              });
            }
          );
        };
        var loaded = loaded2;
        var state = req.query && req.query.state || req.body && req.body.state;
        try {
          var arity = this._stateStore.verify.length;
          if (arity == 4) {
            this._stateStore.verify(req, state, meta, loaded2);
          } else {
            this._stateStore.verify(req, state, loaded2);
          }
        } catch (ex) {
          return this.error(ex);
        }
      } else {
        var params = this.authorizationParams(options);
        params.response_type = "code";
        if (callbackURL) {
          params.redirect_uri = callbackURL;
        }
        var scope = options.scope || this._scope;
        if (scope) {
          if (Array.isArray(scope)) {
            scope = scope.join(this._scopeSeparator);
          }
          params.scope = scope;
        }
        var verifier, challenge;
        if (this._pkceMethod) {
          verifier = base64url(crypto.pseudoRandomBytes(32));
          switch (this._pkceMethod) {
            case "plain":
              challenge = verifier;
              break;
            case "S256":
              challenge = base64url(crypto.createHash("sha256").update(verifier).digest());
              break;
            default:
              return this.error(new Error("Unsupported code verifier transformation method: " + this._pkceMethod));
          }
          params.code_challenge = challenge;
          params.code_challenge_method = this._pkceMethod;
        }
        var state = options.state;
        if (state && typeof state == "string") {
          params.state = state;
          var parsed = url.parse(this._oauth2._authorizeUrl, true);
          utils.merge(parsed.query, params);
          parsed.query["client_id"] = this._oauth2._clientId;
          delete parsed.search;
          var location = url.format(parsed);
          this.redirect(location);
        } else {
          let stored2 = function(err, state2) {
            if (err) {
              return self.error(err);
            }
            if (state2) {
              params.state = state2;
            }
            var parsed2 = url.parse(self._oauth2._authorizeUrl, true);
            utils.merge(parsed2.query, params);
            parsed2.query["client_id"] = self._oauth2._clientId;
            delete parsed2.search;
            var location2 = url.format(parsed2);
            self.redirect(location2);
          };
          var stored = stored2;
          try {
            var arity = this._stateStore.store.length;
            if (arity == 5) {
              this._stateStore.store(req, verifier, state, meta, stored2);
            } else if (arity == 4) {
              this._stateStore.store(req, state, meta, stored2);
            } else if (arity == 3) {
              this._stateStore.store(req, meta, stored2);
            } else {
              this._stateStore.store(req, stored2);
            }
          } catch (ex) {
            return this.error(ex);
          }
        }
      }
    };
    OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
      return done(null, {});
    };
    OAuth2Strategy.prototype.authorizationParams = function(options) {
      return {};
    };
    OAuth2Strategy.prototype.tokenParams = function(options) {
      return {};
    };
    OAuth2Strategy.prototype.parseErrorResponse = function(body, status) {
      var json = JSON.parse(body);
      if (json.error) {
        return new TokenError(json.error_description, json.error, json.error_uri);
      }
      return null;
    };
    OAuth2Strategy.prototype._loadUserProfile = function(accessToken, done) {
      var self = this;
      function loadIt() {
        return self.userProfile(accessToken, done);
      }
      function skipIt() {
        return done(null);
      }
      if (typeof this._skipUserProfile == "function" && this._skipUserProfile.length > 1) {
        this._skipUserProfile(accessToken, function(err, skip2) {
          if (err) {
            return done(err);
          }
          if (!skip2) {
            return loadIt();
          }
          return skipIt();
        });
      } else {
        var skip = typeof this._skipUserProfile == "function" ? this._skipUserProfile() : this._skipUserProfile;
        if (!skip) {
          return loadIt();
        }
        return skipIt();
      }
    };
    OAuth2Strategy.prototype._createOAuthError = function(message, err) {
      var e;
      if (err.statusCode && err.data) {
        try {
          e = this.parseErrorResponse(err.data, err.statusCode);
        } catch (_) {
        }
      }
      if (!e) {
        e = new InternalOAuthError(message, err);
      }
      return e;
    };
    module2.exports = OAuth2Strategy;
  }
});

// node_modules/passport-oauth2/lib/index.js
var require_lib3 = __commonJS({
  "node_modules/passport-oauth2/lib/index.js"(exports2, module2) {
    var Strategy = require_strategy2();
    var AuthorizationError = require_authorizationerror();
    var TokenError = require_tokenerror();
    var InternalOAuthError = require_internaloautherror();
    exports2 = module2.exports = Strategy;
    exports2.Strategy = Strategy;
    exports2.AuthorizationError = AuthorizationError;
    exports2.TokenError = TokenError;
    exports2.InternalOAuthError = InternalOAuthError;
  }
});

// node_modules/passport-google-oauth20/lib/profile/googleplus.js
var require_googleplus = __commonJS({
  "node_modules/passport-google-oauth20/lib/profile/googleplus.js"(exports2) {
    exports2.parse = function(json) {
      if ("string" == typeof json) {
        json = JSON.parse(json);
      }
      var profile = {}, i, len;
      profile.id = json.id;
      profile.displayName = json.displayName;
      if (json.name) {
        profile.name = {
          familyName: json.name.familyName,
          givenName: json.name.givenName
        };
      }
      if (json.emails) {
        profile.emails = [];
        for (i = 0, len = json.emails.length; i < len; ++i) {
          profile.emails.push({ value: json.emails[i].value, type: json.emails[i].type });
        }
      }
      if (json.image) {
        profile.photos = [{ value: json.image.url }];
      }
      profile.gender = json.gender;
      return profile;
    };
  }
});

// node_modules/passport-google-oauth20/lib/profile/openid.js
var require_openid = __commonJS({
  "node_modules/passport-google-oauth20/lib/profile/openid.js"(exports2) {
    exports2.parse = function(json) {
      if ("string" == typeof json) {
        json = JSON.parse(json);
      }
      var profile = {};
      profile.id = json.sub;
      profile.displayName = json.name;
      if (json.family_name || json.given_name) {
        profile.name = {
          familyName: json.family_name,
          givenName: json.given_name
        };
      }
      if (json.email) {
        profile.emails = [{ value: json.email, verified: json.email_verified }];
      }
      if (json.picture) {
        profile.photos = [{ value: json.picture }];
      }
      return profile;
    };
  }
});

// node_modules/passport-google-oauth20/lib/errors/googleplusapierror.js
var require_googleplusapierror = __commonJS({
  "node_modules/passport-google-oauth20/lib/errors/googleplusapierror.js"(exports2, module2) {
    function GooglePlusAPIError(message, code) {
      Error.call(this);
      Error.captureStackTrace(this, arguments.callee);
      this.name = "GooglePlusAPIError";
      this.message = message;
      this.code = code;
    }
    GooglePlusAPIError.prototype.__proto__ = Error.prototype;
    module2.exports = GooglePlusAPIError;
  }
});

// node_modules/passport-google-oauth20/lib/errors/userinfoerror.js
var require_userinfoerror = __commonJS({
  "node_modules/passport-google-oauth20/lib/errors/userinfoerror.js"(exports2, module2) {
    function UserInfoError(message, code) {
      Error.call(this);
      Error.captureStackTrace(this, arguments.callee);
      this.name = "UserInfoError";
      this.message = message;
      this.code = code;
    }
    UserInfoError.prototype.__proto__ = Error.prototype;
    module2.exports = UserInfoError;
  }
});

// node_modules/passport-google-oauth20/lib/strategy.js
var require_strategy3 = __commonJS({
  "node_modules/passport-google-oauth20/lib/strategy.js"(exports2, module2) {
    var OAuth2Strategy = require_lib3();
    var util = require("util");
    var uri = require("url");
    var GooglePlusProfile = require_googleplus();
    var OpenIDProfile = require_openid();
    var InternalOAuthError = require_lib3().InternalOAuthError;
    var GooglePlusAPIError = require_googleplusapierror();
    var UserInfoError = require_userinfoerror();
    function Strategy(options, verify) {
      options = options || {};
      options.authorizationURL = options.authorizationURL || "https://accounts.google.com/o/oauth2/v2/auth";
      options.tokenURL = options.tokenURL || "https://www.googleapis.com/oauth2/v4/token";
      OAuth2Strategy.call(this, options, verify);
      this.name = "google";
      this._userProfileURL = options.userProfileURL || "https://www.googleapis.com/oauth2/v3/userinfo";
      var url = uri.parse(this._userProfileURL);
      if (url.pathname.indexOf("/userinfo") == url.pathname.length - "/userinfo".length) {
        this._userProfileFormat = "openid";
      } else {
        this._userProfileFormat = "google+";
      }
    }
    util.inherits(Strategy, OAuth2Strategy);
    Strategy.prototype.userProfile = function(accessToken, done) {
      var self = this;
      this._oauth2.get(this._userProfileURL, accessToken, function(err, body, res) {
        var json;
        if (err) {
          if (err.data) {
            try {
              json = JSON.parse(err.data);
            } catch (_) {
            }
          }
          if (json && json.error && json.error.message) {
            return done(new GooglePlusAPIError(json.error.message, json.error.code));
          } else if (json && json.error && json.error_description) {
            return done(new UserInfoError(json.error_description, json.error));
          }
          return done(new InternalOAuthError("Failed to fetch user profile", err));
        }
        try {
          json = JSON.parse(body);
        } catch (ex) {
          return done(new Error("Failed to parse user profile"));
        }
        var profile;
        switch (self._userProfileFormat) {
          case "openid":
            profile = OpenIDProfile.parse(json);
            break;
          default:
            profile = GooglePlusProfile.parse(json);
            break;
        }
        profile.provider = "google";
        profile._raw = body;
        profile._json = json;
        done(null, profile);
      });
    };
    Strategy.prototype.authorizationParams = function(options) {
      var params = {};
      if (options.accessType) {
        params["access_type"] = options.accessType;
      }
      if (options.prompt) {
        params["prompt"] = options.prompt;
      }
      if (options.loginHint) {
        params["login_hint"] = options.loginHint;
      }
      if (options.includeGrantedScopes) {
        params["include_granted_scopes"] = true;
      }
      if (options.display) {
        params["display"] = options.display;
      }
      if (options.hostedDomain || options.hd) {
        params["hd"] = options.hostedDomain || options.hd;
      }
      if (options.requestVisibleActions) {
        params["request_visible_actions"] = options.requestVisibleActions;
      }
      if (options.openIDRealm) {
        params["openid.realm"] = options.openIDRealm;
      }
      if (options.approvalPrompt) {
        params["approval_prompt"] = options.approvalPrompt;
      }
      if (options.userID) {
        params["user_id"] = options.userID;
      }
      return params;
    };
    module2.exports = Strategy;
  }
});

// node_modules/passport-google-oauth20/lib/index.js
var require_lib4 = __commonJS({
  "node_modules/passport-google-oauth20/lib/index.js"(exports2, module2) {
    var Strategy = require_strategy3();
    exports2 = module2.exports = Strategy;
    exports2.Strategy = Strategy;
  }
});

// server/index.ts
var import_config = require("dotenv/config");
var import_express2 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_express_session = __toESM(require_express_session(), 1);
var import_passport3 = __toESM(require_lib2(), 1);
var import_client3 = require("@prisma/client");

// server/auth/passport.ts
var import_passport = __toESM(require_lib2(), 1);
var import_passport_google_oauth20 = __toESM(require_lib4(), 1);
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();
function setupPassport() {
  import_passport.default.use(
    new import_passport_google_oauth20.Strategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id }
          });
          if (!user) {
            user = await prisma.user.create({
              data: {
                googleId: profile.id,
                email: profile.emails?.[0]?.value || "",
                name: profile.displayName,
                picture: profile.photos?.[0]?.value
              }
            });
          } else {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                name: profile.displayName,
                picture: profile.photos?.[0]?.value
              }
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  import_passport.default.serializeUser((user, done) => {
    done(null, user.id);
  });
  import_passport.default.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

// server/routes/auth.ts
var import_express = __toESM(require("express"), 1);
var import_passport2 = __toESM(require_lib2(), 1);

// server/auth/jwt.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-this";
function generateToken(payload) {
  return import_jsonwebtoken.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
function verifyToken(token) {
  try {
    return import_jsonwebtoken.default.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// server/middleware/auth.ts
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
  req.user = payload;
  next();
}
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}

// server/routes/auth.ts
var router = import_express.default.Router();
router.get(
  "/google",
  import_passport2.default.authenticate("google", {
    scope: ["profile", "email"]
  })
);
router.get(
  "/google/callback",
  import_passport2.default.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name
    });
    res.redirect(`/?token=${token}`);
  }
);
router.get("/me", authenticateJWT, (req, res) => {
  res.json({ user: req.user });
});
router.post("/logout", (req, res) => {
  res.json({ success: true });
});
var auth_default = router;

// server/middleware/audit.ts
var import_client2 = require("@prisma/client");
var prisma2 = new import_client2.PrismaClient();
function attachAuditLog(req, res, next) {
  req.audit = async (info) => {
    if (!req.user) {
      console.warn("Audit log attempted without authenticated user");
      return;
    }
    try {
      await prisma2.auditLog.create({
        data: {
          action: info.action,
          entityType: info.entityType,
          entityId: info.entityId,
          entityTitle: info.entityTitle,
          userId: req.user.userId,
          changes: info.changes ? JSON.stringify(info.changes) : null
        }
      });
    } catch (error) {
      console.error("Failed to create audit log:", error);
    }
  };
  next();
}

// server/index.ts
var import_path = __toESM(require("path"), 1);
var app = (0, import_express2.default)();
var prisma3 = new import_client3.PrismaClient();
var PORT = process.env.PORT || 3001;
setupPassport();
app.use((0, import_cors.default)());
app.use(import_express2.default.json());
app.use(
  (0, import_express_session.default)({
    secret: process.env.SESSION_SECRET || "default-secret",
    resave: false,
    saveUninitialized: false
  })
);
app.use(import_passport3.default.initialize());
app.use(import_passport3.default.session());
app.use("/api/auth", auth_default);
app.use("/api", optionalAuth, attachAuditLog);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await prisma3.category.findMany({
      orderBy: { name: "asc" }
    });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories", details: error });
  }
});
app.post("/api/categories", async (req, res) => {
  try {
    const { name, color } = req.body;
    const category = await prisma3.category.create({
      data: { name, color }
    });
    await req.audit?.({
      action: "CREATE",
      entityType: "Category",
      entityId: category.id,
      entityTitle: category.name
    });
    res.json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category", details: error });
  }
});
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma3.category.findUnique({ where: { id } });
    await prisma3.category.delete({
      where: { id }
    });
    await req.audit?.({
      action: "DELETE",
      entityType: "Category",
      entityId: id,
      entityTitle: category?.name || "Unknown"
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});
app.put("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { color, name } = req.body;
    const updateData = {};
    if (color !== void 0) updateData.color = color;
    if (name !== void 0) updateData.name = name;
    const category = await prisma3.category.update({
      where: { id },
      data: updateData
    });
    await req.audit?.({
      action: "UPDATE",
      entityType: "Category",
      entityId: category.id,
      entityTitle: category.name
    });
    res.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category", details: error });
  }
});
app.get("/api/goals", async (req, res) => {
  try {
    const showCompleted = req.query.showCompleted === "true";
    const goals = await prisma3.goal.findMany({
      where: showCompleted ? {} : { completed: false },
      include: {
        categories: true,
        subGoals: {
          orderBy: { createdAt: "asc" }
        },
        notes: {
          orderBy: { createdAt: "desc" }
        }
      },
      orderBy: { order: "asc" }
    });
    const transformedGoals = goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      owner: goal.owner,
      categories: goal.categories.map((cat) => cat.name),
      progress: goal.progress,
      size: goal.size,
      startDate: goal.startDate,
      dueDate: goal.dueDate,
      statusNote: goal.statusNote,
      order: goal.order,
      completed: goal.completed,
      version: goal.version,
      subGoals: goal.subGoals,
      notes: goal.notes
    }));
    res.json(transformedGoals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});
app.get("/api/goals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await prisma3.goal.findUnique({
      where: { id },
      include: {
        categories: true,
        subGoals: {
          orderBy: { createdAt: "asc" }
        },
        notes: {
          orderBy: { createdAt: "desc" }
        }
      }
    });
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    const transformedGoal = {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      owner: goal.owner,
      categories: goal.categories.map((cat) => cat.name),
      progress: goal.progress,
      size: goal.size,
      startDate: goal.startDate,
      dueDate: goal.dueDate,
      statusNote: goal.statusNote,
      order: goal.order,
      completed: goal.completed,
      version: goal.version,
      subGoals: goal.subGoals,
      notes: goal.notes
    };
    res.json(transformedGoal);
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).json({ error: "Failed to fetch goal" });
  }
});
app.post("/api/goals", async (req, res) => {
  try {
    const { categories, subGoals, notes, ...goalData } = req.body;
    if (!categories || !Array.isArray(categories) || categories.length < 1 || categories.length > 5) {
      return res.status(400).json({ error: "Must provide 1-5 categories" });
    }
    const categoryRecords = await Promise.all(
      categories.map(async (categoryName) => {
        let categoryRecord = await prisma3.category.findUnique({
          where: { name: categoryName }
        });
        if (!categoryRecord) {
          categoryRecord = await prisma3.category.create({
            data: { name: categoryName, color: "#6b7280" }
          });
        }
        return categoryRecord;
      })
    );
    const goal = await prisma3.goal.create({
      data: {
        ...goalData,
        categories: {
          connect: categoryRecords.map((cat) => ({ id: cat.id }))
        },
        subGoals: subGoals ? {
          create: subGoals.map((sg) => ({
            id: sg.id,
            title: sg.title,
            description: sg.description,
            owner: sg.owner,
            progress: sg.progress,
            startDate: sg.startDate,
            dueDate: sg.dueDate,
            statusNote: sg.statusNote
          }))
        } : void 0,
        notes: notes ? {
          create: notes.map((note) => ({
            id: note.id,
            content: note.content,
            isPinned: note.isPinned,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
          }))
        } : void 0
      },
      include: {
        categories: true,
        subGoals: true,
        notes: true
      }
    });
    await req.audit?.({
      action: "CREATE",
      entityType: "Goal",
      entityId: goal.id,
      entityTitle: goal.title
    });
    res.json({
      ...goal,
      categories: goal.categories.map((cat) => cat.name)
    });
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({ error: "Failed to create goal" });
  }
});
app.put("/api/goals/reorder", async (req, res) => {
  try {
    const { goals } = req.body;
    if (!goals || !Array.isArray(goals)) {
      return res.status(400).json({ error: "Invalid request: goals must be an array" });
    }
    await Promise.all(
      goals.map(
        (goal) => prisma3.goal.update({
          where: { id: goal.id },
          data: { order: goal.order }
        })
      )
    );
    await req.audit?.({
      action: "REORDER",
      entityType: "Goal",
      entityId: "bulk",
      entityTitle: `${goals.length} goals reordered`
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error reordering goals:", error);
    res.status(500).json({ error: "Failed to reorder goals", details: error });
  }
});
app.put("/api/goals/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const goal = await prisma3.goal.update({
      where: { id },
      data: {
        completed,
        version: { increment: 1 }
      },
      include: {
        categories: true,
        subGoals: true,
        notes: true
      }
    });
    await req.audit?.({
      action: "UPDATE",
      entityType: "Goal",
      entityId: goal.id,
      entityTitle: goal.title,
      changes: JSON.stringify({ completed })
    });
    res.json({
      ...goal,
      categories: goal.categories.map((cat) => cat.name)
    });
  } catch (error) {
    console.error("Error toggling goal completion:", error);
    res.status(500).json({ error: "Failed to toggle goal completion", details: error });
  }
});
app.put("/api/goals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { categories, subGoals, notes, version, ...goalData } = req.body;
    if (!categories || !Array.isArray(categories) || categories.length < 1 || categories.length > 5) {
      return res.status(400).json({ error: "Must provide 1-5 categories" });
    }
    const currentGoal = await prisma3.goal.findUnique({
      where: { id },
      include: {
        subGoals: true,
        notes: true
      }
    });
    if (!currentGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    if (version !== void 0 && currentGoal.version !== version) {
      return res.status(409).json({
        error: "Conflict",
        message: "\uB2E4\uB978 \uC0AC\uC6A9\uC790\uAC00 \uC774 \uBAA9\uD45C\uB97C \uC218\uC815\uD588\uC2B5\uB2C8\uB2E4. \uC0C8\uB85C\uACE0\uCE68 \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.",
        currentData: currentGoal
      });
    }
    const categoryRecords = await Promise.all(
      categories.map(async (categoryName) => {
        let categoryRecord = await prisma3.category.findUnique({
          where: { name: categoryName }
        });
        if (!categoryRecord) {
          categoryRecord = await prisma3.category.create({
            data: { name: categoryName, color: "#6b7280" }
          });
        }
        return categoryRecord;
      })
    );
    if (subGoals) {
      const incomingSubGoalIds = new Set(subGoals.map((sg) => sg.id).filter(Boolean));
      const existingSubGoalIds = new Set(currentGoal.subGoals.map((sg) => sg.id));
      const subGoalsToDelete = currentGoal.subGoals.filter((sg) => !incomingSubGoalIds.has(sg.id));
      for (const sg of subGoalsToDelete) {
        await prisma3.subGoal.delete({ where: { id: sg.id } });
      }
      for (const sg of subGoals) {
        if (sg.id && existingSubGoalIds.has(sg.id)) {
          await prisma3.subGoal.update({
            where: { id: sg.id },
            data: {
              title: sg.title,
              description: sg.description,
              owner: sg.owner,
              progress: sg.progress,
              startDate: sg.startDate,
              dueDate: sg.dueDate,
              statusNote: sg.statusNote,
              version: { increment: 1 }
            }
          });
        } else {
          await prisma3.subGoal.create({
            data: {
              id: sg.id || void 0,
              title: sg.title,
              description: sg.description,
              owner: sg.owner,
              progress: sg.progress,
              startDate: sg.startDate,
              dueDate: sg.dueDate,
              statusNote: sg.statusNote,
              goalId: id
            }
          });
        }
      }
    }
    if (notes) {
      const incomingNoteIds = new Set(notes.map((note) => note.id).filter(Boolean));
      const existingNoteIds = new Set(currentGoal.notes.map((note) => note.id));
      const notesToDelete = currentGoal.notes.filter((note) => !incomingNoteIds.has(note.id));
      for (const note of notesToDelete) {
        await prisma3.note.delete({ where: { id: note.id } });
      }
      for (const note of notes) {
        if (note.id && existingNoteIds.has(note.id)) {
          await prisma3.note.update({
            where: { id: note.id },
            data: {
              content: note.content,
              isPinned: note.isPinned,
              version: { increment: 1 }
            }
          });
        } else {
          await prisma3.note.create({
            data: {
              id: note.id || void 0,
              content: note.content,
              isPinned: note.isPinned,
              goalId: id,
              createdAt: note.createdAt || /* @__PURE__ */ new Date()
            }
          });
        }
      }
    }
    const goal = await prisma3.goal.update({
      where: { id },
      data: {
        ...goalData,
        categories: {
          set: categoryRecords.map((cat) => ({ id: cat.id }))
        },
        version: { increment: 1 }
      },
      include: {
        categories: true,
        subGoals: {
          orderBy: { createdAt: "asc" }
        },
        notes: {
          orderBy: { createdAt: "desc" }
        }
      }
    });
    await req.audit?.({
      action: "UPDATE",
      entityType: "Goal",
      entityId: goal.id,
      entityTitle: goal.title
    });
    res.json({
      ...goal,
      categories: goal.categories.map((cat) => cat.name)
    });
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({ error: "Failed to update goal" });
  }
});
app.delete("/api/goals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await prisma3.goal.findUnique({ where: { id } });
    await prisma3.goal.delete({
      where: { id }
    });
    await req.audit?.({
      action: "DELETE",
      entityType: "Goal",
      entityId: id,
      entityTitle: goal?.title || "Unknown"
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete goal" });
  }
});
if (process.env.NODE_ENV === "production" || Number(PORT) === 80) {
  const distPath = import_path.default.resolve(process.cwd(), "dist");
  console.log("Serving static files from:", distPath);
  app.use(import_express2.default.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(import_path.default.join(distPath, "index.html"));
  });
}
app.get("/api/settings", async (req, res) => {
  try {
    const settings = await prisma3.setting.findMany();
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    const defaults = {
      dashboardTitle: process.env.DASHBOARD_TITLE || "WEHAGO H \uBAA9\uD45C \uB300\uC2DC\uBCF4\uB4DC",
      dashboardSubtitle: process.env.DASHBOARD_SUBTITLE || "EMR\uAC1C\uBC1C\uBCF8\uBD80 > WEHAGO H \uAC1C\uBC1C\uC13C\uD130"
    };
    res.json({ ...defaults, ...settingsObj });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});
app.put("/api/settings", async (req, res) => {
  try {
    const { dashboardTitle, dashboardSubtitle } = req.body;
    if (dashboardTitle !== void 0) {
      await prisma3.setting.upsert({
        where: { key: "dashboardTitle" },
        update: { value: dashboardTitle },
        create: { key: "dashboardTitle", value: dashboardTitle }
      });
    }
    if (dashboardSubtitle !== void 0) {
      await prisma3.setting.upsert({
        where: { key: "dashboardSubtitle" },
        update: { value: dashboardSubtitle },
        create: { key: "dashboardSubtitle", value: dashboardSubtitle }
      });
    }
    await req.audit?.({
      action: "UPDATE",
      entityType: "Setting",
      entityId: "dashboard",
      entityTitle: "Dashboard Settings",
      changes: JSON.stringify({ dashboardTitle, dashboardSubtitle })
    });
    const settings = await prisma3.setting.findMany();
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    res.json(settingsObj);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Also accessible at http://localhost:${PORT}`);
});
process.on("beforeExit", async () => {
  await prisma3.$disconnect();
});
/*! Bundled license information:

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)

cookie/index.js:
  (*!
   * cookie
   * Copyright(c) 2012-2014 Roman Shtylman
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

depd/index.js:
  (*!
   * depd
   * Copyright(c) 2014-2018 Douglas Christopher Wilson
   * MIT Licensed
   *)

on-headers/index.js:
  (*!
   * on-headers
   * Copyright(c) 2014 Douglas Christopher Wilson
   * MIT Licensed
   *)

parseurl/index.js:
  (*!
   * parseurl
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2014-2017 Douglas Christopher Wilson
   * MIT Licensed
   *)

random-bytes/index.js:
  (*!
   * random-bytes
   * Copyright(c) 2016 Douglas Christopher Wilson
   * MIT Licensed
   *)

uid-safe/index.js:
  (*!
   * uid-safe
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015-2017 Douglas Christopher Wilson
   * MIT Licensed
   *)

express-session/session/cookie.js:
  (*!
   * Connect - session - Cookie
   * Copyright(c) 2010 Sencha Inc.
   * Copyright(c) 2011 TJ Holowaychuk
   * MIT Licensed
   *)
  (*!
   * Prototype.
   *)

express-session/session/session.js:
  (*!
   * Connect - session - Session
   * Copyright(c) 2010 Sencha Inc.
   * Copyright(c) 2011 TJ Holowaychuk
   * MIT Licensed
   *)

express-session/session/store.js:
  (*!
   * Connect - session - Store
   * Copyright(c) 2010 Sencha Inc.
   * Copyright(c) 2011 TJ Holowaychuk
   * MIT Licensed
   *)

express-session/session/memory.js:
  (*!
   * express-session
   * Copyright(c) 2010 Sencha Inc.
   * Copyright(c) 2011 TJ Holowaychuk
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

express-session/index.js:
  (*!
   * express-session
   * Copyright(c) 2010 Sencha Inc.
   * Copyright(c) 2011 TJ Holowaychuk
   * Copyright(c) 2014-2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
