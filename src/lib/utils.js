var path = require('path'),
  _ = require('lodash'),
  nodeUtils = require('util');

/**
 * Custom utils library, basically a modified version of [lodash](http://lodash.com/docs) +
 * [node.utils](http://nodejs.org/api/util.html#util_util) that doesn't use mixins to prevent
 * confusion when requiring lodash itself.
 *
 * @class utils
 * @static
 */
var utils = _.extend({}, _, nodeUtils);
_ = utils;

utils.inspect = function (thing, opts) {
  return nodeUtils.inspect(thing, _.defaults(opts || {}, {
    showHidden: true,
    depth: null,
    color: true
  }));
};


/**
 * Link to [path.join](http://nodejs.org/api/path.html#path_path_join_path1_path2)
 *
 * @method utils.joinPath
 * @type {function}
 */
utils.joinPath = path.join;

/**
 * Recursively re-key an object, applying "transform" to each key
 * @param  {Object} obj - The object to re-key
 * @param  {Function} transform - The transformation function to apply to each key
 * @param  {Boolean} [recursive=true] - Should this act recursively?
 * @param  {Object} out - used primarily for recursion, allows you to specify the object which new keys will be written to
 * @return {Object}
 */
utils.reKey = function (obj, transform, recursive) {
  // defaults
  if (recursive === void 0) { recursive = true; }
  if (typeof transform !== 'function') { throw new TypeError('invalid transform function'); }

  var out = {};

  _.each(obj, function (prop, name) {
    if (recursive && typeof prop === 'object') {
      out[transform(name)] = utils.reKey(prop, transform, recursive);
    } else {
      out[transform(name)] = prop;
    }
  });

  return out;
};

/**
 * Recursively merge two objects, walking into each object and concating arrays. If both to and from have a value at a
 * key, but the values' types don't match to's value is left unmodified. Only Array and Object values are merged - that
 * it to say values with a typeof "object"
 *
 * @param  {Object} to - Object to merge into (no cloning, the original object
 *   is modified)
 * @param  {Object} from - Object to pull changed from
 * @return {Object} - returns the modified to value
 */
utils.deepMerge = function (to, from) {
  Object.keys(from).forEach(function (key) {
    switch (typeof to[key]) {
    case 'undefined':
      to[key] = from[key];
      break;
    case 'object':
      if (_.isArray(to[key]) && _.isArray(from[key])) {
        to[key] = to[key].concat(from[key]);
      }
      else if (_.isPlainObject(to[key]) && _.isPlainObject(from[key])) {
        utils.deepMerge(to[key], from[key]);
      }
    }
  });
  return to;
};

/**
 * Test if a value is an array and it's contents are of a specific type
 *
 * @method isArrayOf<Strings|Object|Array|Finite|Function|RegExp>s
 * @param  {Array} arr - An array to check
 * @return {Boolean}
 */
'String Object PlainObject Array Finite Function RegExp'.split(' ').forEach(function (type) {
  var check = _.bindKey(_, 'is' + type);

  utils['isArrayOf' + type + 's'] = function (arr) {
    // quick shallow check of arrays
    return _.isArray(arr) && _.every(arr.slice(0, 10), check);
  };
});


/**
 * Capitalize the first letter of a word
 *
 * @todo Tests
 * @method  ucfirst
 * @param  {string} word - The word to transform
 * @return {string}
 */
utils.ucfirst = function (word) {
  return word[0].toUpperCase() + word.substring(1).toLowerCase();
};

/**
 * Base algo for studlyCase and camelCase
 * @param  {boolean} firstWordCap - Should the first character of the first word be capitalized
 * @return {Function}
 */
function adjustWordCase(firstWordCap, otherWordsCap, sep) {
  return function (string) {
    var inWord = false;
    var i = 0;
    var words = [];
    var word = '';
    var code, c, upper, lower;

    for (; i < string.length; i++) {
      code = string.charCodeAt(i);
      c = string.charAt(i);
      lower = code >= 97 && code <= 122;
      upper = code >= 65 && code <= 90;

      if (upper || !lower) {
        // new word
        if (word.length) {
          words.push(word);
        }
        word = '';
      }

      if (upper || lower) {
        if (lower && word.length) {
          word += c;
        } else {
          if ((!words.length && firstWordCap) || (words.length && otherWordsCap)) {
            word = c.toUpperCase();
          }
          else {
            word = c.toLowerCase();
          }
        }
      }
    }
    if (word.length) {
      words.push(word);
    }
    // add the leading underscore back to strings the had it originally
    if (words.lenth && string.charAt(0) === '_') {
      words[0] = '_' + words[0];
    }
    return words.join(sep);
  };
}

/**
 * Transform a string into StudlyCase
 *
 * @todo Tests
 * @method studlyCase
 * @param  {String} string
 * @return {String}
 */
utils.studlyCase = adjustWordCase(true, true, '');

/**
 * Transform a string into camelCase
 *
 * @todo Tests
 * @method camelCase
 * @param  {String} string
 * @return {String}
 */
utils.camelCase = adjustWordCase(false, true, '');

/**
 * Transform a string into snakeCase
 *
 * @todo Tests
 * @method snakeCase
 * @param  {String} string
 * @return {String}
 */
utils.snakeCase = adjustWordCase(false, false, '_');

/**
 * Lower-case a string, and return an empty string if any is not a string
 *
 * @todo Tests
 * @param any {*} - Something or nothing
 * @returns {string}
 */
utils.toLowerString = function (any) {
  if (any) {
    if (typeof any !== 'string') {
      any = any.toString();
    }
  } else {
    any = '';
  }
  return any.toLowerCase();
};

/**
 * Upper-case the string, return an empty string if any is not a string
 *
 * @todo Tests
 * @param any {*} - Something or nothing
 * @returns {string}
 */
utils.toUpperString = function (any) {
  if (any) {
    if (typeof any !== 'string') {
      any = any.toString();
    }
  } else {
    any = '';
  }
  return any.toUpperCase();
};

/**
 * Test if a value is "numeric" meaning that it can be transformed into something besides NaN
 *
 * @todo Tests
 * @method isNumeric
 * @param  {*} val
 * @return {Boolean}
 */
utils.isNumeric = function (val) {
  return !isNaN(val === null ? NaN : val * 1);
};

// regexp to test for intervals
var intervalRE = /^(\d+(?:\.\d+)?)([Mwdhmsy])$/;

/**
 * Test if a string represents an interval (eg. 1m, 2Y)
 *
 * @todo Test
 * @method isInterval
 * @param {String} val
 * @return {Boolean}
 */
utils.isInterval = function (val) {
  return !!(val.match && val.match(intervalRE));
};

/**
 * Repeat a string n times
 *
 * @todo Test
 * @todo TestPerformance
 * @method repeat
 * @param {String} what - The string to repeat
 * @param {Number} times - Times the string should be repeated
 * @return {String}
 */
utils.repeat = function (what, times) {
  return (new Array(times + 1)).join(what);
};

/**
 * Override node's util.inherits function to also supply a callSuper function on the child class that can be called
 * with the instance and the arguments passed to the child's constructor. This should only be called from within the
 * constructor of the child class and should be removed from the code once the constructor is "done".
 *
 * @param constructor {Function} - the constructor that should subClass superConstructor
 * @param superConstructor {Function} - The parent constructor
 */
utils.inherits = function (constructor, superConstructor) {
  nodeUtils.inherits(constructor, superConstructor);
  constructor.callSuper = function (inst, args) {
    if (args) {
      if (_.isArguments(args)) {
        utils.applyArgs(superConstructor, inst, args);
      } else {
        utils.applyArgs(superConstructor, inst, arguments, 1);
      }
    } else {
      superConstructor.call(inst);
    }
  };
};

/**
 * Remove leading/trailing spaces from a string
 *
 * @param str {String} - Any string
 * @returns {String}
 */
utils.trim = function (str) {
  return typeof str === 'string' ? str.replace(/^\s+|\s+$/g, '') : '';
};

utils.collectMatches = function (text, regExp) {
  var matches = [], match;
  while (match = regExp.exec(text)) {
    matches.push(match);
    if (regExp.global !== true) {
      // would loop forever if not true
      break;
    }
  }
  return matches;
};

/**
 * Call a function, applying the arguments object to it in an optimized way, rather than always turning it into an array
 *
 * @param func {Function} - The function to execute
 * @param context {*} - The context the function will be executed with
 * @param args {Arguments} - The arguments to send to func
 * @param [sliceIndex=0] {Integer} - The index that args should be sliced at, before feeding args to func
 * @returns {*} - the return value of func
 */
utils.applyArgs = function (func, context, args, sliceIndex) {
  sliceIndex = sliceIndex || 0;
  switch (args.length - sliceIndex) {
  case 0:
    return func.call(context);
  case 1:
    return func.call(context, args[0 + sliceIndex]);
  case 2:
    return func.call(context, args[0 + sliceIndex], args[1 + sliceIndex]);
  case 3:
    return func.call(context, args[0 + sliceIndex], args[1 + sliceIndex], args[2 + sliceIndex]);
  case 4:
    return func.call(context, args[0 + sliceIndex], args[1 + sliceIndex], args[2 + sliceIndex], args[3 + sliceIndex]);
  case 5:
    return func.call(context, args[0 + sliceIndex], args[1 + sliceIndex],
      args[2 + sliceIndex], args[3 + sliceIndex], args[4 + sliceIndex]);
  default:
    return func.apply(context, Array.prototype.slice.call(args, sliceIndex));
  }
};

/**
 * Schedule a function to be called on the next tick, and supply it with these arguments
 * when it is called.
 * @return {[type]} [description]
 */
_.nextTick = function (cb) {
  // bind the function and schedule it
  process.nextTick(_.bindKey(_, 'applyArgs', cb, null, arguments, 1));
};

/**
 * Marks a method as a handler. Currently this just makes a property on the method
 * flagging it to be bound to the object at object creation when "makeBoundMethods" is called
 *
 * ```
 * ClassName.prototype.methodName = _.handler(function () {
 *   // this will always be bound when called via classInstance.bound.methodName
 *   this === classInstance
 * });
 * ```
 *
 * @alias _.scheduled
 * @param  {Function} func - The method that is being defined
 * @return {Function}
 */
_.handler = function (func) {
  func._provideBound = true;
  return func;
};
_.scheduled = _.handler;

/**
 * Creates an "bound" property on an object, which all or a subset of methods from
 * the object which are bound to the original object.
 *
 * ```
 * var obj = {
 *   onEvent: function () {}
 * };
 *
 * _.makeBoundMethods(obj);
 *
 * obj.bound.onEvent() // is bound to obj, and can safely be used as an event handler.
 * ```
 *
 * @param {Object} obj - The object to bind the methods to
 * @param {Array} [methods] - The methods to bind, false values === bind all flagged with _provideBound
 */
_.makeBoundMethods = function (obj, methods) {
  obj.bound = {};
  if (!methods) {
    methods = [];
    for (var prop in obj) {
      // dearest maintainer, we want to look through the prototype
      if (typeof obj[prop] === 'function' && obj[prop]._provideBound === true) {
        obj.bound[prop] = _.bind(obj[prop], obj);
      }
    }
  } else {
    _.each(methods, function (method) {
      obj.bound[method] = _.bindKey(obj, method);
    });
  }
};

_.noop = function () {};

// _.getStackTrace = function (callee) {
//   var e = {};
//   if (typeof Error.captureStackTrace === 'function') {
//     Error.captureStackTrace(e, callee || _.getStackTrace);
//   } else {
//     e.stack = (new Error()).stack;
//     console.log(e.stack);
//   }
//   return '\n' + e.stack.split('\n').slice(1).join('\n');
// };

module.exports = utils;