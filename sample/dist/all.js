(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = applyMiddleware;

var _compose = require('./compose');

var _compose2 = _interopRequireDefault(_compose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
function applyMiddleware() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function (reducer, preloadedState, enhancer) {
      var store = createStore(reducer, preloadedState, enhancer);
      var _dispatch = store.dispatch;
      var chain = [];

      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch(action) {
          return _dispatch(action);
        }
      };
      chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = _compose2['default'].apply(undefined, chain)(store.dispatch);

      return _extends({}, store, {
        dispatch: _dispatch
      });
    };
  };
}
},{"./compose":5}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = bindActionCreators;
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(undefined, arguments));
  };
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass a single function as the first argument,
 * and get a function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
  }

  var keys = Object.keys(actionCreators);
  var boundActionCreators = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}
},{}],4:[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;
exports['default'] = combineReducers;

var _createStore = require('./createStore');

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _warning = require('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }

  if (!(0, _isPlainObject2['default'])(inputState)) {
    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
  }

  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
  });

  unexpectedKeys.forEach(function (key) {
    unexpectedKeyCache[key] = true;
  });

  if (unexpectedKeys.length > 0) {
    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
  }
}

function assertReducerSanity(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });

    if (typeof initialState === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
    if (typeof reducer(undefined, { type: type }) === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
    }
  });
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */
function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];

    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        (0, _warning2['default'])('No reducer provided for key "' + key + '"');
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers);

  if (process.env.NODE_ENV !== 'production') {
    var unexpectedKeyCache = {};
  }

  var sanityError;
  try {
    assertReducerSanity(finalReducers);
  } catch (e) {
    sanityError = e;
  }

  return function combination() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var action = arguments[1];

    if (sanityError) {
      throw sanityError;
    }

    if (process.env.NODE_ENV !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
      if (warningMessage) {
        (0, _warning2['default'])(warningMessage);
      }
    }

    var hasChanged = false;
    var nextState = {};
    for (var i = 0; i < finalReducerKeys.length; i++) {
      var key = finalReducerKeys[i];
      var reducer = finalReducers[key];
      var previousStateForKey = state[key];
      var nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(key, action);
        throw new Error(errorMessage);
      }
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}
}).call(this,require("1YiZ5S"))
},{"./createStore":6,"./utils/warning":8,"1YiZ5S":1,"lodash/isPlainObject":18}],5:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = compose;
/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

function compose() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  var last = funcs[funcs.length - 1];
  var rest = funcs.slice(0, -1);
  return function () {
    return rest.reduceRight(function (composed, f) {
      return f(composed);
    }, last.apply(undefined, arguments));
  };
}
},{}],6:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.ActionTypes = undefined;
exports['default'] = createStore;

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _symbolObservable = require('symbol-observable');

var _symbolObservable2 = _interopRequireDefault(_symbolObservable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var ActionTypes = exports.ActionTypes = {
  INIT: '@@redux/INIT'
};

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} enhancer The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
function createStore(reducer, preloadedState, enhancer) {
  var _ref2;

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var currentReducer = reducer;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */
  function getState() {
    return currentState;
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    var isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!(0, _isPlainObject2['default'])(action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;
    for (var i = 0; i < listeners.length; i++) {
      listeners[i]();
    }

    return action;
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.INIT });
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/zenparsing/es-observable
   */
  function observable() {
    var _ref;

    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe: function subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.');
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return { unsubscribe: unsubscribe };
      }
    }, _ref[_symbolObservable2['default']] = function () {
      return this;
    }, _ref;
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  dispatch({ type: ActionTypes.INIT });

  return _ref2 = {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  }, _ref2[_symbolObservable2['default']] = observable, _ref2;
}
},{"lodash/isPlainObject":18,"symbol-observable":19}],7:[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;
exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;

var _createStore = require('./createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _combineReducers = require('./combineReducers');

var _combineReducers2 = _interopRequireDefault(_combineReducers);

var _bindActionCreators = require('./bindActionCreators');

var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

var _applyMiddleware = require('./applyMiddleware');

var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);

var _compose = require('./compose');

var _compose2 = _interopRequireDefault(_compose);

var _warning = require('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  (0, _warning2['default'])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}

exports.createStore = _createStore2['default'];
exports.combineReducers = _combineReducers2['default'];
exports.bindActionCreators = _bindActionCreators2['default'];
exports.applyMiddleware = _applyMiddleware2['default'];
exports.compose = _compose2['default'];
}).call(this,require("1YiZ5S"))
},{"./applyMiddleware":2,"./bindActionCreators":3,"./combineReducers":4,"./compose":5,"./createStore":6,"./utils/warning":8,"1YiZ5S":1}],8:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = warning;
/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}
},{}],9:[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"./_root":16}],10:[function(require,module,exports){
var Symbol = require('./_Symbol'),
    getRawTag = require('./_getRawTag'),
    objectToString = require('./_objectToString');

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;

},{"./_Symbol":9,"./_getRawTag":13,"./_objectToString":14}],11:[function(require,module,exports){
(function (global){
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
var overArg = require('./_overArg');

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;

},{"./_overArg":15}],13:[function(require,module,exports){
var Symbol = require('./_Symbol');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;

},{"./_Symbol":9}],14:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;

},{}],15:[function(require,module,exports){
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;

},{}],16:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;

},{"./_freeGlobal":11}],17:[function(require,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],18:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    getPrototype = require('./_getPrototype'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;

},{"./_baseGetTag":10,"./_getPrototype":12,"./isObjectLike":17}],19:[function(require,module,exports){
module.exports = require('./lib/index');

},{"./lib/index":20}],20:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ponyfill = require('./ponyfill');

var _ponyfill2 = _interopRequireDefault(_ponyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var root; /* global window */


if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (typeof module !== 'undefined') {
  root = module;
} else {
  root = Function('return this')();
}

var result = (0, _ponyfill2['default'])(root);
exports['default'] = result;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ponyfill":21}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports['default'] = symbolObservablePonyfill;
function symbolObservablePonyfill(root) {
	var result;
	var _Symbol = root.Symbol;

	if (typeof _Symbol === 'function') {
		if (_Symbol.observable) {
			result = _Symbol.observable;
		} else {
			result = _Symbol('observable');
			_Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
};
},{}],22:[function(require,module,exports){
/**
 * Created by kalpana on 22/05/17.
 */

"use strict";

/*
 * action types
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addTodo = addTodo;
exports.toggleTodo = toggleTodo;
exports.setVisibilityFilter = setVisibilityFilter;
var ADD_TODO = exports.ADD_TODO = 'ADD_TODO';
var TOGGLE_TODO = exports.TOGGLE_TODO = 'TOGGLE_TODO';
var SET_VISIBILITY_FILTER = exports.SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER';

/*
 * other constants
 */

var VisibilityFilters = exports.VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
};

/*
 * action creators
 */

function addTodo(text) {
  return { type: ADD_TODO, text: text };
}

function toggleTodo(index) {
  return { type: TOGGLE_TODO, index: index };
}

function setVisibilityFilter(filter) {
  return { type: SET_VISIBILITY_FILTER, filter: filter };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFjdGlvbnMuanMiXSwibmFtZXMiOlsiYWRkVG9kbyIsInRvZ2dsZVRvZG8iLCJzZXRWaXNpYmlsaXR5RmlsdGVyIiwiQUREX1RPRE8iLCJUT0dHTEVfVE9ETyIsIlNFVF9WSVNJQklMSVRZX0ZJTFRFUiIsIlZpc2liaWxpdHlGaWx0ZXJzIiwiU0hPV19BTEwiLCJTSE9XX0NPTVBMRVRFRCIsIlNIT1dfQUNUSVZFIiwidGV4dCIsInR5cGUiLCJpbmRleCIsImZpbHRlciJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUFJQTs7QUFFQTs7Ozs7OztRQXNCZ0JBLE8sR0FBQUEsTztRQUlBQyxVLEdBQUFBLFU7UUFJQUMsbUIsR0FBQUEsbUI7QUExQlQsSUFBTUMsOEJBQVcsVUFBakI7QUFDQSxJQUFNQyxvQ0FBYyxhQUFwQjtBQUNBLElBQU1DLHdEQUF3Qix1QkFBOUI7O0FBRVA7Ozs7QUFJTyxJQUFNQyxnREFBb0I7QUFDN0JDLFlBQVUsVUFEbUI7QUFFN0JDLGtCQUFnQixnQkFGYTtBQUc3QkMsZUFBYTtBQUhnQixDQUExQjs7QUFNUDs7OztBQUlPLFNBQVNULE9BQVQsQ0FBaUJVLElBQWpCLEVBQXVCO0FBQzFCLFNBQU8sRUFBRUMsTUFBTVIsUUFBUixFQUFrQk8sVUFBbEIsRUFBUDtBQUNIOztBQUVNLFNBQVNULFVBQVQsQ0FBb0JXLEtBQXBCLEVBQTJCO0FBQzlCLFNBQU8sRUFBRUQsTUFBTVAsV0FBUixFQUFxQlEsWUFBckIsRUFBUDtBQUNIOztBQUVNLFNBQVNWLG1CQUFULENBQTZCVyxNQUE3QixFQUFxQztBQUN4QyxTQUFPLEVBQUVGLE1BQU1OLHFCQUFSLEVBQStCUSxjQUEvQixFQUFQO0FBQ0giLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSBrYWxwYW5hIG9uIDIyLzA1LzE3LlxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKlxuICogYWN0aW9uIHR5cGVzXG4gKi9cblxuZXhwb3J0IGNvbnN0IEFERF9UT0RPID0gJ0FERF9UT0RPJ1xuZXhwb3J0IGNvbnN0IFRPR0dMRV9UT0RPID0gJ1RPR0dMRV9UT0RPJ1xuZXhwb3J0IGNvbnN0IFNFVF9WSVNJQklMSVRZX0ZJTFRFUiA9ICdTRVRfVklTSUJJTElUWV9GSUxURVInXG5cbi8qXG4gKiBvdGhlciBjb25zdGFudHNcbiAqL1xuXG5leHBvcnQgY29uc3QgVmlzaWJpbGl0eUZpbHRlcnMgPSB7XG4gICAgU0hPV19BTEw6ICdTSE9XX0FMTCcsXG4gICAgU0hPV19DT01QTEVURUQ6ICdTSE9XX0NPTVBMRVRFRCcsXG4gICAgU0hPV19BQ1RJVkU6ICdTSE9XX0FDVElWRSdcbn1cblxuLypcbiAqIGFjdGlvbiBjcmVhdG9yc1xuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUb2RvKHRleHQpIHtcbiAgICByZXR1cm4geyB0eXBlOiBBRERfVE9ETywgdGV4dCB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVUb2RvKGluZGV4KSB7XG4gICAgcmV0dXJuIHsgdHlwZTogVE9HR0xFX1RPRE8sIGluZGV4IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFZpc2liaWxpdHlGaWx0ZXIoZmlsdGVyKSB7XG4gICAgcmV0dXJuIHsgdHlwZTogU0VUX1ZJU0lCSUxJVFlfRklMVEVSLCBmaWx0ZXIgfVxufSJdfQ==
},{}],23:[function(require,module,exports){
/**
 * Created by kalpana on 22/05/17.
 */

"use strict";

/*
 * action types
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addTodo = addTodo;
exports.toggleTodo = toggleTodo;
exports.setVisibilityFilter = setVisibilityFilter;
var ADD_TODO = exports.ADD_TODO = 'ADD_TODO';
var TOGGLE_TODO = exports.TOGGLE_TODO = 'TOGGLE_TODO';
var SET_VISIBILITY_FILTER = exports.SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER';

/*
 * other constants
 */

var VisibilityFilters = exports.VisibilityFilters = {
    SHOW_ALL: 'SHOW_ALL',
    SHOW_COMPLETED: 'SHOW_COMPLETED',
    SHOW_ACTIVE: 'SHOW_ACTIVE'
};

/*
 * action creators
 */

function addTodo(text) {
    return { type: ADD_TODO, text: text };
}

function toggleTodo(index) {
    return { type: TOGGLE_TODO, index: index };
}

function setVisibilityFilter(filter) {
    return { type: SET_VISIBILITY_FILTER, filter: filter };
}
/**
 * Created by kalpana on 22/05/17.
 */

"use strict";

var _redux = require('redux');

var _reducers = require('./reducers');

var _reducers2 = _interopRequireDefault(_reducers);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var store = (0, _redux.createStore)(_reducers2.default);

// Log the initial state
console.log(store.getState());

// Every time the state changes, log it
// Note that subscribe() returns a function for unregistering the listener
var unsubscribe = store.subscribe(function () {
    return console.log(store.getState());
});

// Dispatch some actions
store.dispatch(addTodo('Learn about actions'));
store.dispatch(addTodo('Learn about reducers'));
store.dispatch(addTodo('Learn about store'));
store.dispatch(toggleTodo(0));
store.dispatch(toggleTodo(1));
store.dispatch(setVisibilityFilter(VisibilityFilters.SHOW_COMPLETED));

// Stop listening to state updates
unsubscribe();
/**
 * Created by kalpana on 22/05/17.
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _redux = require('redux');

var _actions = require('./actions');

function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }return arr2;
    } else {
        return Array.from(arr);
    }
}

var SHOW_ALL = _actions.VisibilityFilters.SHOW_ALL;

function visibilityFilter() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : SHOW_ALL;
    var action = arguments[1];

    switch (action.type) {
        case _actions.SET_VISIBILITY_FILTER:
            return action.filter;
        default:
            return state;
    }
}

function todos() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var action = arguments[1];

    switch (action.type) {
        case _actions.ADD_TODO:
            return [].concat(_toConsumableArray(state), [{
                text: action.text,
                completed: false
            }]);
        case _actions.TOGGLE_TODO:
            return state.map(function (todo, index) {
                if (index === action.index) {
                    return Object.assign({}, todo, {
                        completed: !todo.completed
                    });
                }
                return todo;
            });
        default:
            return state;
    }
}

var todoApp = (0, _redux.combineReducers)({
    visibilityFilter: visibilityFilter,
    todos: todos
});

exports.default = todoApp;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZha2VfOGJjOTFjZGUuanMiXSwibmFtZXMiOlsiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJleHBvcnRzIiwidmFsdWUiLCJhZGRUb2RvIiwidG9nZ2xlVG9kbyIsInNldFZpc2liaWxpdHlGaWx0ZXIiLCJBRERfVE9ETyIsIlRPR0dMRV9UT0RPIiwiU0VUX1ZJU0lCSUxJVFlfRklMVEVSIiwiVmlzaWJpbGl0eUZpbHRlcnMiLCJTSE9XX0FMTCIsIlNIT1dfQ09NUExFVEVEIiwiU0hPV19BQ1RJVkUiLCJ0ZXh0IiwidHlwZSIsImluZGV4IiwiZmlsdGVyIiwiX3JlZHV4IiwicmVxdWlyZSIsIl9yZWR1Y2VycyIsIl9yZWR1Y2VyczIiLCJfaW50ZXJvcFJlcXVpcmVEZWZhdWx0Iiwib2JqIiwiX19lc01vZHVsZSIsImRlZmF1bHQiLCJzdG9yZSIsImNyZWF0ZVN0b3JlIiwiY29uc29sZSIsImxvZyIsImdldFN0YXRlIiwidW5zdWJzY3JpYmUiLCJzdWJzY3JpYmUiLCJkaXNwYXRjaCIsIl9hY3Rpb25zIiwiX3RvQ29uc3VtYWJsZUFycmF5IiwiYXJyIiwiQXJyYXkiLCJpc0FycmF5IiwiaSIsImFycjIiLCJsZW5ndGgiLCJmcm9tIiwidmlzaWJpbGl0eUZpbHRlciIsInN0YXRlIiwiYXJndW1lbnRzIiwidW5kZWZpbmVkIiwiYWN0aW9uIiwidG9kb3MiLCJjb25jYXQiLCJjb21wbGV0ZWQiLCJtYXAiLCJ0b2RvIiwiYXNzaWduIiwidG9kb0FwcCIsImNvbWJpbmVSZWR1Y2VycyIsIm1vZHVsZSJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUFJQTs7QUFFQTs7OztBQUlBQSxPQUFPQyxjQUFQLENBQXNCQyxPQUF0QixFQUErQixZQUEvQixFQUE2QztBQUMzQ0MsV0FBTztBQURvQyxDQUE3QztBQUdBRCxRQUFRRSxPQUFSLEdBQWtCQSxPQUFsQjtBQUNBRixRQUFRRyxVQUFSLEdBQXFCQSxVQUFyQjtBQUNBSCxRQUFRSSxtQkFBUixHQUE4QkEsbUJBQTlCO0FBQ0EsSUFBSUMsV0FBV0wsUUFBUUssUUFBUixHQUFtQixVQUFsQztBQUNBLElBQUlDLGNBQWNOLFFBQVFNLFdBQVIsR0FBc0IsYUFBeEM7QUFDQSxJQUFJQyx3QkFBd0JQLFFBQVFPLHFCQUFSLEdBQWdDLHVCQUE1RDs7QUFFQTs7OztBQUlBLElBQUlDLG9CQUFvQlIsUUFBUVEsaUJBQVIsR0FBNEI7QUFDbERDLGNBQVUsVUFEd0M7QUFFbERDLG9CQUFnQixnQkFGa0M7QUFHbERDLGlCQUFhO0FBSHFDLENBQXBEOztBQU1BOzs7O0FBSUEsU0FBU1QsT0FBVCxDQUFpQlUsSUFBakIsRUFBdUI7QUFDckIsV0FBTyxFQUFFQyxNQUFNUixRQUFSLEVBQWtCTyxNQUFNQSxJQUF4QixFQUFQO0FBQ0Q7O0FBRUQsU0FBU1QsVUFBVCxDQUFvQlcsS0FBcEIsRUFBMkI7QUFDekIsV0FBTyxFQUFFRCxNQUFNUCxXQUFSLEVBQXFCUSxPQUFPQSxLQUE1QixFQUFQO0FBQ0Q7O0FBRUQsU0FBU1YsbUJBQVQsQ0FBNkJXLE1BQTdCLEVBQXFDO0FBQ25DLFdBQU8sRUFBRUYsTUFBTU4scUJBQVIsRUFBK0JRLFFBQVFBLE1BQXZDLEVBQVA7QUFDRDtBQUNEOzs7O0FBSUE7O0FBRUEsSUFBSUMsU0FBU0MsUUFBUSxPQUFSLENBQWI7O0FBRUEsSUFBSUMsWUFBWUQsUUFBUSxZQUFSLENBQWhCOztBQUVBLElBQUlFLGFBQWFDLHVCQUF1QkYsU0FBdkIsQ0FBakI7O0FBRUEsU0FBU0Usc0JBQVQsQ0FBZ0NDLEdBQWhDLEVBQXFDO0FBQUUsV0FBT0EsT0FBT0EsSUFBSUMsVUFBWCxHQUF3QkQsR0FBeEIsR0FBOEIsRUFBRUUsU0FBU0YsR0FBWCxFQUFyQztBQUF3RDs7QUFFL0YsSUFBSUcsUUFBUSxDQUFDLEdBQUdSLE9BQU9TLFdBQVgsRUFBd0JOLFdBQVdJLE9BQW5DLENBQVo7O0FBRUE7QUFDQUcsUUFBUUMsR0FBUixDQUFZSCxNQUFNSSxRQUFOLEVBQVo7O0FBRUE7QUFDQTtBQUNBLElBQUlDLGNBQWNMLE1BQU1NLFNBQU4sQ0FBZ0IsWUFBWTtBQUM1QyxXQUFPSixRQUFRQyxHQUFSLENBQVlILE1BQU1JLFFBQU4sRUFBWixDQUFQO0FBQ0QsQ0FGaUIsQ0FBbEI7O0FBSUE7QUFDQUosTUFBTU8sUUFBTixDQUFlN0IsUUFBUSxxQkFBUixDQUFmO0FBQ0FzQixNQUFNTyxRQUFOLENBQWU3QixRQUFRLHNCQUFSLENBQWY7QUFDQXNCLE1BQU1PLFFBQU4sQ0FBZTdCLFFBQVEsbUJBQVIsQ0FBZjtBQUNBc0IsTUFBTU8sUUFBTixDQUFlNUIsV0FBVyxDQUFYLENBQWY7QUFDQXFCLE1BQU1PLFFBQU4sQ0FBZTVCLFdBQVcsQ0FBWCxDQUFmO0FBQ0FxQixNQUFNTyxRQUFOLENBQWUzQixvQkFBb0JJLGtCQUFrQkUsY0FBdEMsQ0FBZjs7QUFFQTtBQUNBbUI7QUFDQTs7OztBQUlBOztBQUVBL0IsT0FBT0MsY0FBUCxDQUFzQkMsT0FBdEIsRUFBK0IsWUFBL0IsRUFBNkM7QUFDekNDLFdBQU87QUFEa0MsQ0FBN0M7O0FBSUEsSUFBSWUsU0FBU0MsUUFBUSxPQUFSLENBQWI7O0FBRUEsSUFBSWUsV0FBV2YsUUFBUSxXQUFSLENBQWY7O0FBRUEsU0FBU2dCLGtCQUFULENBQTRCQyxHQUE1QixFQUFpQztBQUFFLFFBQUlDLE1BQU1DLE9BQU4sQ0FBY0YsR0FBZCxDQUFKLEVBQXdCO0FBQUUsYUFBSyxJQUFJRyxJQUFJLENBQVIsRUFBV0MsT0FBT0gsTUFBTUQsSUFBSUssTUFBVixDQUF2QixFQUEwQ0YsSUFBSUgsSUFBSUssTUFBbEQsRUFBMERGLEdBQTFELEVBQStEO0FBQUVDLGlCQUFLRCxDQUFMLElBQVVILElBQUlHLENBQUosQ0FBVjtBQUFtQixTQUFDLE9BQU9DLElBQVA7QUFBYyxLQUE3SCxNQUFtSTtBQUFFLGVBQU9ILE1BQU1LLElBQU4sQ0FBV04sR0FBWCxDQUFQO0FBQXlCO0FBQUU7O0FBRW5NLElBQUl6QixXQUFXdUIsU0FBU3hCLGlCQUFULENBQTJCQyxRQUExQzs7QUFHQSxTQUFTZ0MsZ0JBQVQsR0FBNEI7QUFDeEIsUUFBSUMsUUFBUUMsVUFBVUosTUFBVixHQUFtQixDQUFuQixJQUF3QkksVUFBVSxDQUFWLE1BQWlCQyxTQUF6QyxHQUFxREQsVUFBVSxDQUFWLENBQXJELEdBQW9FbEMsUUFBaEY7QUFDQSxRQUFJb0MsU0FBU0YsVUFBVSxDQUFWLENBQWI7O0FBRUEsWUFBUUUsT0FBT2hDLElBQWY7QUFDSSxhQUFLbUIsU0FBU3pCLHFCQUFkO0FBQ0ksbUJBQU9zQyxPQUFPOUIsTUFBZDtBQUNKO0FBQ0ksbUJBQU8yQixLQUFQO0FBSlI7QUFNSDs7QUFFRCxTQUFTSSxLQUFULEdBQWlCO0FBQ2IsUUFBSUosUUFBUUMsVUFBVUosTUFBVixHQUFtQixDQUFuQixJQUF3QkksVUFBVSxDQUFWLE1BQWlCQyxTQUF6QyxHQUFxREQsVUFBVSxDQUFWLENBQXJELEdBQW9FLEVBQWhGO0FBQ0EsUUFBSUUsU0FBU0YsVUFBVSxDQUFWLENBQWI7O0FBRUEsWUFBUUUsT0FBT2hDLElBQWY7QUFDSSxhQUFLbUIsU0FBUzNCLFFBQWQ7QUFDSSxtQkFBTyxHQUFHMEMsTUFBSCxDQUFVZCxtQkFBbUJTLEtBQW5CLENBQVYsRUFBcUMsQ0FBQztBQUN6QzlCLHNCQUFNaUMsT0FBT2pDLElBRDRCO0FBRXpDb0MsMkJBQVc7QUFGOEIsYUFBRCxDQUFyQyxDQUFQO0FBSUosYUFBS2hCLFNBQVMxQixXQUFkO0FBQ0ksbUJBQU9vQyxNQUFNTyxHQUFOLENBQVUsVUFBVUMsSUFBVixFQUFnQnBDLEtBQWhCLEVBQXVCO0FBQ3BDLG9CQUFJQSxVQUFVK0IsT0FBTy9CLEtBQXJCLEVBQTRCO0FBQ3hCLDJCQUFPaEIsT0FBT3FELE1BQVAsQ0FBYyxFQUFkLEVBQWtCRCxJQUFsQixFQUF3QjtBQUMzQkYsbUNBQVcsQ0FBQ0UsS0FBS0Y7QUFEVSxxQkFBeEIsQ0FBUDtBQUdIO0FBQ0QsdUJBQU9FLElBQVA7QUFDSCxhQVBNLENBQVA7QUFRSjtBQUNJLG1CQUFPUixLQUFQO0FBaEJSO0FBa0JIOztBQUVELElBQUlVLFVBQVUsQ0FBQyxHQUFHcEMsT0FBT3FDLGVBQVgsRUFBNEI7QUFDdENaLHNCQUFrQkEsZ0JBRG9CO0FBRXRDSyxXQUFPQTtBQUYrQixDQUE1QixDQUFkOztBQUtBOUMsUUFBUXVCLE9BQVIsR0FBa0I2QixPQUFsQjtBQUNBRSxPQUFPdEQsT0FBUCxHQUFpQkEsUUFBUSxTQUFSLENBQWpCIiwiZmlsZSI6ImZha2VfOGJjOTFjZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkga2FscGFuYSBvbiAyMi8wNS8xNy5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLypcbiAqIGFjdGlvbiB0eXBlc1xuICovXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmFkZFRvZG8gPSBhZGRUb2RvO1xuZXhwb3J0cy50b2dnbGVUb2RvID0gdG9nZ2xlVG9kbztcbmV4cG9ydHMuc2V0VmlzaWJpbGl0eUZpbHRlciA9IHNldFZpc2liaWxpdHlGaWx0ZXI7XG52YXIgQUREX1RPRE8gPSBleHBvcnRzLkFERF9UT0RPID0gJ0FERF9UT0RPJztcbnZhciBUT0dHTEVfVE9ETyA9IGV4cG9ydHMuVE9HR0xFX1RPRE8gPSAnVE9HR0xFX1RPRE8nO1xudmFyIFNFVF9WSVNJQklMSVRZX0ZJTFRFUiA9IGV4cG9ydHMuU0VUX1ZJU0lCSUxJVFlfRklMVEVSID0gJ1NFVF9WSVNJQklMSVRZX0ZJTFRFUic7XG5cbi8qXG4gKiBvdGhlciBjb25zdGFudHNcbiAqL1xuXG52YXIgVmlzaWJpbGl0eUZpbHRlcnMgPSBleHBvcnRzLlZpc2liaWxpdHlGaWx0ZXJzID0ge1xuICBTSE9XX0FMTDogJ1NIT1dfQUxMJyxcbiAgU0hPV19DT01QTEVURUQ6ICdTSE9XX0NPTVBMRVRFRCcsXG4gIFNIT1dfQUNUSVZFOiAnU0hPV19BQ1RJVkUnXG59O1xuXG4vKlxuICogYWN0aW9uIGNyZWF0b3JzXG4gKi9cblxuZnVuY3Rpb24gYWRkVG9kbyh0ZXh0KSB7XG4gIHJldHVybiB7IHR5cGU6IEFERF9UT0RPLCB0ZXh0OiB0ZXh0IH07XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZVRvZG8oaW5kZXgpIHtcbiAgcmV0dXJuIHsgdHlwZTogVE9HR0xFX1RPRE8sIGluZGV4OiBpbmRleCB9O1xufVxuXG5mdW5jdGlvbiBzZXRWaXNpYmlsaXR5RmlsdGVyKGZpbHRlcikge1xuICByZXR1cm4geyB0eXBlOiBTRVRfVklTSUJJTElUWV9GSUxURVIsIGZpbHRlcjogZmlsdGVyIH07XG59XG4vKipcbiAqIENyZWF0ZWQgYnkga2FscGFuYSBvbiAyMi8wNS8xNy5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIF9yZWR1eCA9IHJlcXVpcmUoJ3JlZHV4Jyk7XG5cbnZhciBfcmVkdWNlcnMgPSByZXF1aXJlKCcuL3JlZHVjZXJzJyk7XG5cbnZhciBfcmVkdWNlcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVkdWNlcnMpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgc3RvcmUgPSAoMCwgX3JlZHV4LmNyZWF0ZVN0b3JlKShfcmVkdWNlcnMyLmRlZmF1bHQpO1xuXG4vLyBMb2cgdGhlIGluaXRpYWwgc3RhdGVcbmNvbnNvbGUubG9nKHN0b3JlLmdldFN0YXRlKCkpO1xuXG4vLyBFdmVyeSB0aW1lIHRoZSBzdGF0ZSBjaGFuZ2VzLCBsb2cgaXRcbi8vIE5vdGUgdGhhdCBzdWJzY3JpYmUoKSByZXR1cm5zIGEgZnVuY3Rpb24gZm9yIHVucmVnaXN0ZXJpbmcgdGhlIGxpc3RlbmVyXG52YXIgdW5zdWJzY3JpYmUgPSBzdG9yZS5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gY29uc29sZS5sb2coc3RvcmUuZ2V0U3RhdGUoKSk7XG59KTtcblxuLy8gRGlzcGF0Y2ggc29tZSBhY3Rpb25zXG5zdG9yZS5kaXNwYXRjaChhZGRUb2RvKCdMZWFybiBhYm91dCBhY3Rpb25zJykpO1xuc3RvcmUuZGlzcGF0Y2goYWRkVG9kbygnTGVhcm4gYWJvdXQgcmVkdWNlcnMnKSk7XG5zdG9yZS5kaXNwYXRjaChhZGRUb2RvKCdMZWFybiBhYm91dCBzdG9yZScpKTtcbnN0b3JlLmRpc3BhdGNoKHRvZ2dsZVRvZG8oMCkpO1xuc3RvcmUuZGlzcGF0Y2godG9nZ2xlVG9kbygxKSk7XG5zdG9yZS5kaXNwYXRjaChzZXRWaXNpYmlsaXR5RmlsdGVyKFZpc2liaWxpdHlGaWx0ZXJzLlNIT1dfQ09NUExFVEVEKSk7XG5cbi8vIFN0b3AgbGlzdGVuaW5nIHRvIHN0YXRlIHVwZGF0ZXNcbnVuc3Vic2NyaWJlKCk7XG4vKipcbiAqIENyZWF0ZWQgYnkga2FscGFuYSBvbiAyMi8wNS8xNy5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3JlZHV4ID0gcmVxdWlyZSgncmVkdXgnKTtcblxudmFyIF9hY3Rpb25zID0gcmVxdWlyZSgnLi9hY3Rpb25zJyk7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG52YXIgU0hPV19BTEwgPSBfYWN0aW9ucy5WaXNpYmlsaXR5RmlsdGVycy5TSE9XX0FMTDtcblxuXG5mdW5jdGlvbiB2aXNpYmlsaXR5RmlsdGVyKCkge1xuICAgIHZhciBzdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogU0hPV19BTEw7XG4gICAgdmFyIGFjdGlvbiA9IGFyZ3VtZW50c1sxXTtcblxuICAgIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICAgICAgY2FzZSBfYWN0aW9ucy5TRVRfVklTSUJJTElUWV9GSUxURVI6XG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uLmZpbHRlcjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRvZG9zKCkge1xuICAgIHZhciBzdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogW107XG4gICAgdmFyIGFjdGlvbiA9IGFyZ3VtZW50c1sxXTtcblxuICAgIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICAgICAgY2FzZSBfYWN0aW9ucy5BRERfVE9ETzpcbiAgICAgICAgICAgIHJldHVybiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHN0YXRlKSwgW3tcbiAgICAgICAgICAgICAgICB0ZXh0OiBhY3Rpb24udGV4dCxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWQ6IGZhbHNlXG4gICAgICAgICAgICB9XSk7XG4gICAgICAgIGNhc2UgX2FjdGlvbnMuVE9HR0xFX1RPRE86XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUubWFwKGZ1bmN0aW9uICh0b2RvLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gYWN0aW9uLmluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB0b2RvLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZWQ6ICF0b2RvLmNvbXBsZXRlZFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvZG87XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG59XG5cbnZhciB0b2RvQXBwID0gKDAsIF9yZWR1eC5jb21iaW5lUmVkdWNlcnMpKHtcbiAgICB2aXNpYmlsaXR5RmlsdGVyOiB2aXNpYmlsaXR5RmlsdGVyLFxuICAgIHRvZG9zOiB0b2Rvc1xufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHRvZG9BcHA7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiXX0=
},{"./actions":22,"./reducers":24,"redux":7}],24:[function(require,module,exports){
/**
 * Created by kalpana on 22/05/17.
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _redux = require('redux');

var _actions = require('./actions');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var SHOW_ALL = _actions.VisibilityFilters.SHOW_ALL;


function visibilityFilter() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : SHOW_ALL;
    var action = arguments[1];

    switch (action.type) {
        case _actions.SET_VISIBILITY_FILTER:
            return action.filter;
        default:
            return state;
    }
}

function todos() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var action = arguments[1];

    switch (action.type) {
        case _actions.ADD_TODO:
            return [].concat(_toConsumableArray(state), [{
                text: action.text,
                completed: false
            }]);
        case _actions.TOGGLE_TODO:
            return state.map(function (todo, index) {
                if (index === action.index) {
                    return Object.assign({}, todo, {
                        completed: !todo.completed
                    });
                }
                return todo;
            });
        default:
            return state;
    }
}

var todoApp = (0, _redux.combineReducers)({
    visibilityFilter: visibilityFilter,
    todos: todos
});

exports.default = todoApp;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlZHVjZXJzLmpzIl0sIm5hbWVzIjpbIlNIT1dfQUxMIiwidmlzaWJpbGl0eUZpbHRlciIsInN0YXRlIiwiYWN0aW9uIiwidHlwZSIsImZpbHRlciIsInRvZG9zIiwidGV4dCIsImNvbXBsZXRlZCIsIm1hcCIsInRvZG8iLCJpbmRleCIsIk9iamVjdCIsImFzc2lnbiIsInRvZG9BcHAiXSwibWFwcGluZ3MiOiJBQUFBOzs7O0FBSUE7Ozs7OztBQUdBOztBQUNBOzs7O0lBQ1FBLFEsOEJBQUFBLFE7OztBQUVSLFNBQVNDLGdCQUFULEdBQW9EO0FBQUEsUUFBMUJDLEtBQTBCLHVFQUFsQkYsUUFBa0I7QUFBQSxRQUFSRyxNQUFROztBQUNoRCxZQUFRQSxPQUFPQyxJQUFmO0FBQ0k7QUFDSSxtQkFBT0QsT0FBT0UsTUFBZDtBQUNKO0FBQ0ksbUJBQU9ILEtBQVA7QUFKUjtBQU1IOztBQUVELFNBQVNJLEtBQVQsR0FBbUM7QUFBQSxRQUFwQkosS0FBb0IsdUVBQVosRUFBWTtBQUFBLFFBQVJDLE1BQVE7O0FBQy9CLFlBQVFBLE9BQU9DLElBQWY7QUFDSTtBQUNJLGdEQUNPRixLQURQLElBRUk7QUFDSUssc0JBQU1KLE9BQU9JLElBRGpCO0FBRUlDLDJCQUFXO0FBRmYsYUFGSjtBQU9KO0FBQ0ksbUJBQU9OLE1BQU1PLEdBQU4sQ0FBVSxVQUFDQyxJQUFELEVBQU9DLEtBQVAsRUFBaUI7QUFDOUIsb0JBQUlBLFVBQVVSLE9BQU9RLEtBQXJCLEVBQTRCO0FBQ3hCLDJCQUFPQyxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQkgsSUFBbEIsRUFBd0I7QUFDM0JGLG1DQUFXLENBQUNFLEtBQUtGO0FBRFUscUJBQXhCLENBQVA7QUFHSDtBQUNELHVCQUFPRSxJQUFQO0FBQ0gsYUFQTSxDQUFQO0FBUUo7QUFDSSxtQkFBT1IsS0FBUDtBQW5CUjtBQXFCSDs7QUFFRCxJQUFNWSxVQUFVLDRCQUFnQjtBQUM1QmIsc0NBRDRCO0FBRTVCSztBQUY0QixDQUFoQixDQUFoQjs7a0JBS2VRLE8iLCJmaWxlIjoicmVkdWNlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkga2FscGFuYSBvbiAyMi8wNS8xNy5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG5pbXBvcnQgeyBjb21iaW5lUmVkdWNlcnMgfSBmcm9tICdyZWR1eCdcbmltcG9ydCB7IEFERF9UT0RPLCBUT0dHTEVfVE9ETywgU0VUX1ZJU0lCSUxJVFlfRklMVEVSLCBWaXNpYmlsaXR5RmlsdGVycyB9IGZyb20gJy4vYWN0aW9ucydcbmNvbnN0IHsgU0hPV19BTEwgfSA9IFZpc2liaWxpdHlGaWx0ZXJzXG5cbmZ1bmN0aW9uIHZpc2liaWxpdHlGaWx0ZXIoc3RhdGUgPSBTSE9XX0FMTCwgYWN0aW9uKSB7XG4gICAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgICAgICBjYXNlIFNFVF9WSVNJQklMSVRZX0ZJTFRFUjpcbiAgICAgICAgICAgIHJldHVybiBhY3Rpb24uZmlsdGVyXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gc3RhdGVcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRvZG9zKHN0YXRlID0gW10sIGFjdGlvbikge1xuICAgIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICAgICAgY2FzZSBBRERfVE9ETzpcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBhY3Rpb24udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkOiBmYWxzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgY2FzZSBUT0dHTEVfVE9ETzpcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZS5tYXAoKHRvZG8sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSBhY3Rpb24uaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHRvZG8sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlZDogIXRvZG8uY29tcGxldGVkXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0b2RvXG4gICAgICAgICAgICB9KVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlXG4gICAgfVxufVxuXG5jb25zdCB0b2RvQXBwID0gY29tYmluZVJlZHVjZXJzKHtcbiAgICB2aXNpYmlsaXR5RmlsdGVyLFxuICAgIHRvZG9zXG59KVxuXG5leHBvcnQgZGVmYXVsdCB0b2RvQXBwIl19
},{"./actions":22,"redux":7}]},{},[23])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9rYWxwYW5hL3Byb2plY3RzL2dpdC9yZWFkdXhUZXN0L3NhbXBsZS9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMva2FscGFuYS9wcm9qZWN0cy9naXQvcmVhZHV4VGVzdC9zYW1wbGUvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL1VzZXJzL2thbHBhbmEvcHJvamVjdHMvZ2l0L3JlYWR1eFRlc3Qvc2FtcGxlL25vZGVfbW9kdWxlcy9yZWR1eC9saWIvYXBwbHlNaWRkbGV3YXJlLmpzIiwiL1VzZXJzL2thbHBhbmEvcHJvamVjdHMvZ2l0L3JlYWR1eFRlc3Qvc2FtcGxlL25vZGVfbW9kdWxlcy9yZWR1eC9saWIvYmluZEFjdGlvbkNyZWF0b3JzLmpzIiwiL1VzZXJzL2thbHBhbmEvcHJvamVjdHMvZ2l0L3JlYWR1eFRlc3Qvc2FtcGxlL25vZGVfbW9kdWxlcy9yZWR1eC9saWIvY29tYmluZVJlZHVjZXJzLmpzIiwiL1VzZXJzL2thbHBhbmEvcHJvamVjdHMvZ2l0L3JlYWR1eFRlc3Qvc2FtcGxlL25vZGVfbW9kdWxlcy9yZWR1eC9saWIvY29tcG9zZS5qcyIsIi9Vc2Vycy9rYWxwYW5hL3Byb2plY3RzL2dpdC9yZWFkdXhUZXN0L3NhbXBsZS9ub2RlX21vZHVsZXMvcmVkdXgvbGliL2NyZWF0ZVN0b3JlLmpzIiwiL1VzZXJzL2thbHBhbmEvcHJvamVjdHMvZ2l0L3JlYWR1eFRlc3Qvc2FtcGxlL25vZGVfbW9kdWxlcy9yZWR1eC9saWIvaW5kZXguanMiLCIvVXNlcnMva2FscGFuYS9wcm9qZWN0cy9naXQvcmVhZHV4VGVzdC9zYW1wbGUvbm9kZV9tb2R1bGVzL3JlZHV4L2xpYi91dGlscy93YXJuaW5nLmpzIiwiL1VzZXJzL2thbHBhbmEvcHJvamVjdHMvZ2l0L3JlYWR1eFRlc3Qvc2FtcGxlL25vZGVfbW9kdWxlcy9yZWR1eC9ub2RlX21vZHVsZXMvbG9kYXNoL19TeW1ib2wuanMiLCIvVXNlcnMva2FscGFuYS9wcm9qZWN0cy9naXQvcmVhZHV4VGVzdC9zYW1wbGUvbm9kZV9tb2R1bGVzL3JlZHV4L25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VHZXRUYWcuanMiLCIvVXNlcnMva2FscGFuYS9wcm9qZWN0cy9naXQvcmVhZHV4VGVzdC9zYW1wbGUvbm9kZV9tb2R1bGVzL3JlZHV4L25vZGVfbW9kdWxlcy9sb2Rhc2gvX2ZyZWVHbG9iYWwuanMiLCIvVXNlcnMva2FscGFuYS9wcm9qZWN0cy9naXQvcmVhZHV4VGVzdC9zYW1wbGUvbm9kZV9tb2R1bGVzL3JlZHV4L25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFByb3RvdHlwZS5qcyIsIi9Vc2Vycy9rYWxwYW5hL3Byb2plY3RzL2dpdC9yZWFkdXhUZXN0L3NhbXBsZS9ub2RlX21vZHVsZXMvcmVkdXgvbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0UmF3VGFnLmpzIiwiL1VzZXJzL2thbHBhbmEvcHJvamVjdHMvZ2l0L3JlYWR1eFRlc3Qvc2FtcGxlL25vZGVfbW9kdWxlcy9yZWR1eC9ub2RlX21vZHVsZXMvbG9kYXNoL19vYmplY3RUb1N0cmluZy5qcyIsIi9Vc2Vycy9rYWxwYW5hL3Byb2plY3RzL2dpdC9yZWFkdXhUZXN0L3NhbXBsZS9ub2RlX21vZHVsZXMvcmVkdXgvbm9kZV9tb2R1bGVzL2xvZGFzaC9fb3ZlckFyZy5qcyIsIi9Vc2Vycy9rYWxwYW5hL3Byb2plY3RzL2dpdC9yZWFkdXhUZXN0L3NhbXBsZS9ub2RlX21vZHVsZXMvcmVkdXgvbm9kZV9tb2R1bGVzL2xvZGFzaC9fcm9vdC5qcyIsIi9Vc2Vycy9rYWxwYW5hL3Byb2plY3RzL2dpdC9yZWFkdXhUZXN0L3NhbXBsZS9ub2RlX21vZHVsZXMvcmVkdXgvbm9kZV9tb2R1bGVzL2xvZGFzaC9pc09iamVjdExpa2UuanMiLCIvVXNlcnMva2FscGFuYS9wcm9qZWN0cy9naXQvcmVhZHV4VGVzdC9zYW1wbGUvbm9kZV9tb2R1bGVzL3JlZHV4L25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNQbGFpbk9iamVjdC5qcyIsIi9Vc2Vycy9rYWxwYW5hL3Byb2plY3RzL2dpdC9yZWFkdXhUZXN0L3NhbXBsZS9ub2RlX21vZHVsZXMvcmVkdXgvbm9kZV9tb2R1bGVzL3N5bWJvbC1vYnNlcnZhYmxlL2luZGV4LmpzIiwiL1VzZXJzL2thbHBhbmEvcHJvamVjdHMvZ2l0L3JlYWR1eFRlc3Qvc2FtcGxlL25vZGVfbW9kdWxlcy9yZWR1eC9ub2RlX21vZHVsZXMvc3ltYm9sLW9ic2VydmFibGUvbGliL2luZGV4LmpzIiwiL1VzZXJzL2thbHBhbmEvcHJvamVjdHMvZ2l0L3JlYWR1eFRlc3Qvc2FtcGxlL25vZGVfbW9kdWxlcy9yZWR1eC9ub2RlX21vZHVsZXMvc3ltYm9sLW9ic2VydmFibGUvbGliL3BvbnlmaWxsLmpzIiwiL1VzZXJzL2thbHBhbmEvcHJvamVjdHMvZ2l0L3JlYWR1eFRlc3Qvc2FtcGxlL3NyYy9hY3Rpb25zLmpzIiwiL1VzZXJzL2thbHBhbmEvcHJvamVjdHMvZ2l0L3JlYWR1eFRlc3Qvc2FtcGxlL3NyYy9mYWtlXzhiYzkxY2RlLmpzIiwiL1VzZXJzL2thbHBhbmEvcHJvamVjdHMvZ2l0L3JlYWR1eFRlc3Qvc2FtcGxlL3NyYy9yZWR1Y2Vycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGFwcGx5TWlkZGxld2FyZTtcblxudmFyIF9jb21wb3NlID0gcmVxdWlyZSgnLi9jb21wb3NlJyk7XG5cbnZhciBfY29tcG9zZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb21wb3NlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG4vKipcbiAqIENyZWF0ZXMgYSBzdG9yZSBlbmhhbmNlciB0aGF0IGFwcGxpZXMgbWlkZGxld2FyZSB0byB0aGUgZGlzcGF0Y2ggbWV0aG9kXG4gKiBvZiB0aGUgUmVkdXggc3RvcmUuIFRoaXMgaXMgaGFuZHkgZm9yIGEgdmFyaWV0eSBvZiB0YXNrcywgc3VjaCBhcyBleHByZXNzaW5nXG4gKiBhc3luY2hyb25vdXMgYWN0aW9ucyBpbiBhIGNvbmNpc2UgbWFubmVyLCBvciBsb2dnaW5nIGV2ZXJ5IGFjdGlvbiBwYXlsb2FkLlxuICpcbiAqIFNlZSBgcmVkdXgtdGh1bmtgIHBhY2thZ2UgYXMgYW4gZXhhbXBsZSBvZiB0aGUgUmVkdXggbWlkZGxld2FyZS5cbiAqXG4gKiBCZWNhdXNlIG1pZGRsZXdhcmUgaXMgcG90ZW50aWFsbHkgYXN5bmNocm9ub3VzLCB0aGlzIHNob3VsZCBiZSB0aGUgZmlyc3RcbiAqIHN0b3JlIGVuaGFuY2VyIGluIHRoZSBjb21wb3NpdGlvbiBjaGFpbi5cbiAqXG4gKiBOb3RlIHRoYXQgZWFjaCBtaWRkbGV3YXJlIHdpbGwgYmUgZ2l2ZW4gdGhlIGBkaXNwYXRjaGAgYW5kIGBnZXRTdGF0ZWAgZnVuY3Rpb25zXG4gKiBhcyBuYW1lZCBhcmd1bWVudHMuXG4gKlxuICogQHBhcmFtIHsuLi5GdW5jdGlvbn0gbWlkZGxld2FyZXMgVGhlIG1pZGRsZXdhcmUgY2hhaW4gdG8gYmUgYXBwbGllZC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBzdG9yZSBlbmhhbmNlciBhcHBseWluZyB0aGUgbWlkZGxld2FyZS5cbiAqL1xuZnVuY3Rpb24gYXBwbHlNaWRkbGV3YXJlKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgbWlkZGxld2FyZXMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBtaWRkbGV3YXJlc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoY3JlYXRlU3RvcmUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHJlZHVjZXIsIHByZWxvYWRlZFN0YXRlLCBlbmhhbmNlcikge1xuICAgICAgdmFyIHN0b3JlID0gY3JlYXRlU3RvcmUocmVkdWNlciwgcHJlbG9hZGVkU3RhdGUsIGVuaGFuY2VyKTtcbiAgICAgIHZhciBfZGlzcGF0Y2ggPSBzdG9yZS5kaXNwYXRjaDtcbiAgICAgIHZhciBjaGFpbiA9IFtdO1xuXG4gICAgICB2YXIgbWlkZGxld2FyZUFQSSA9IHtcbiAgICAgICAgZ2V0U3RhdGU6IHN0b3JlLmdldFN0YXRlLFxuICAgICAgICBkaXNwYXRjaDogZnVuY3Rpb24gZGlzcGF0Y2goYWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIF9kaXNwYXRjaChhY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY2hhaW4gPSBtaWRkbGV3YXJlcy5tYXAoZnVuY3Rpb24gKG1pZGRsZXdhcmUpIHtcbiAgICAgICAgcmV0dXJuIG1pZGRsZXdhcmUobWlkZGxld2FyZUFQSSk7XG4gICAgICB9KTtcbiAgICAgIF9kaXNwYXRjaCA9IF9jb21wb3NlMlsnZGVmYXVsdCddLmFwcGx5KHVuZGVmaW5lZCwgY2hhaW4pKHN0b3JlLmRpc3BhdGNoKTtcblxuICAgICAgcmV0dXJuIF9leHRlbmRzKHt9LCBzdG9yZSwge1xuICAgICAgICBkaXNwYXRjaDogX2Rpc3BhdGNoXG4gICAgICB9KTtcbiAgICB9O1xuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGJpbmRBY3Rpb25DcmVhdG9ycztcbmZ1bmN0aW9uIGJpbmRBY3Rpb25DcmVhdG9yKGFjdGlvbkNyZWF0b3IsIGRpc3BhdGNoKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRpc3BhdGNoKGFjdGlvbkNyZWF0b3IuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBUdXJucyBhbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSBhY3Rpb24gY3JlYXRvcnMsIGludG8gYW4gb2JqZWN0IHdpdGggdGhlXG4gKiBzYW1lIGtleXMsIGJ1dCB3aXRoIGV2ZXJ5IGZ1bmN0aW9uIHdyYXBwZWQgaW50byBhIGBkaXNwYXRjaGAgY2FsbCBzbyB0aGV5XG4gKiBtYXkgYmUgaW52b2tlZCBkaXJlY3RseS4gVGhpcyBpcyBqdXN0IGEgY29udmVuaWVuY2UgbWV0aG9kLCBhcyB5b3UgY2FuIGNhbGxcbiAqIGBzdG9yZS5kaXNwYXRjaChNeUFjdGlvbkNyZWF0b3JzLmRvU29tZXRoaW5nKCkpYCB5b3Vyc2VsZiBqdXN0IGZpbmUuXG4gKlxuICogRm9yIGNvbnZlbmllbmNlLCB5b3UgY2FuIGFsc28gcGFzcyBhIHNpbmdsZSBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQsXG4gKiBhbmQgZ2V0IGEgZnVuY3Rpb24gaW4gcmV0dXJuLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fSBhY3Rpb25DcmVhdG9ycyBBbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSBhY3Rpb25cbiAqIGNyZWF0b3IgZnVuY3Rpb25zLiBPbmUgaGFuZHkgd2F5IHRvIG9idGFpbiBpdCBpcyB0byB1c2UgRVM2IGBpbXBvcnQgKiBhc2BcbiAqIHN5bnRheC4gWW91IG1heSBhbHNvIHBhc3MgYSBzaW5nbGUgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZGlzcGF0Y2ggVGhlIGBkaXNwYXRjaGAgZnVuY3Rpb24gYXZhaWxhYmxlIG9uIHlvdXIgUmVkdXhcbiAqIHN0b3JlLlxuICpcbiAqIEByZXR1cm5zIHtGdW5jdGlvbnxPYmplY3R9IFRoZSBvYmplY3QgbWltaWNraW5nIHRoZSBvcmlnaW5hbCBvYmplY3QsIGJ1dCB3aXRoXG4gKiBldmVyeSBhY3Rpb24gY3JlYXRvciB3cmFwcGVkIGludG8gdGhlIGBkaXNwYXRjaGAgY2FsbC4gSWYgeW91IHBhc3NlZCBhXG4gKiBmdW5jdGlvbiBhcyBgYWN0aW9uQ3JlYXRvcnNgLCB0aGUgcmV0dXJuIHZhbHVlIHdpbGwgYWxzbyBiZSBhIHNpbmdsZVxuICogZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJpbmRBY3Rpb25DcmVhdG9ycyhhY3Rpb25DcmVhdG9ycywgZGlzcGF0Y2gpIHtcbiAgaWYgKHR5cGVvZiBhY3Rpb25DcmVhdG9ycyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb25DcmVhdG9ycywgZGlzcGF0Y2gpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBhY3Rpb25DcmVhdG9ycyAhPT0gJ29iamVjdCcgfHwgYWN0aW9uQ3JlYXRvcnMgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2JpbmRBY3Rpb25DcmVhdG9ycyBleHBlY3RlZCBhbiBvYmplY3Qgb3IgYSBmdW5jdGlvbiwgaW5zdGVhZCByZWNlaXZlZCAnICsgKGFjdGlvbkNyZWF0b3JzID09PSBudWxsID8gJ251bGwnIDogdHlwZW9mIGFjdGlvbkNyZWF0b3JzKSArICcuICcgKyAnRGlkIHlvdSB3cml0ZSBcImltcG9ydCBBY3Rpb25DcmVhdG9ycyBmcm9tXCIgaW5zdGVhZCBvZiBcImltcG9ydCAqIGFzIEFjdGlvbkNyZWF0b3JzIGZyb21cIj8nKTtcbiAgfVxuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWN0aW9uQ3JlYXRvcnMpO1xuICB2YXIgYm91bmRBY3Rpb25DcmVhdG9ycyA9IHt9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICB2YXIgYWN0aW9uQ3JlYXRvciA9IGFjdGlvbkNyZWF0b3JzW2tleV07XG4gICAgaWYgKHR5cGVvZiBhY3Rpb25DcmVhdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBib3VuZEFjdGlvbkNyZWF0b3JzW2tleV0gPSBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb25DcmVhdG9yLCBkaXNwYXRjaCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBib3VuZEFjdGlvbkNyZWF0b3JzO1xufSIsIihmdW5jdGlvbiAocHJvY2Vzcyl7XG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzWydkZWZhdWx0J10gPSBjb21iaW5lUmVkdWNlcnM7XG5cbnZhciBfY3JlYXRlU3RvcmUgPSByZXF1aXJlKCcuL2NyZWF0ZVN0b3JlJyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC9pc1BsYWluT2JqZWN0Jyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc1BsYWluT2JqZWN0KTtcblxudmFyIF93YXJuaW5nID0gcmVxdWlyZSgnLi91dGlscy93YXJuaW5nJyk7XG5cbnZhciBfd2FybmluZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF93YXJuaW5nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBnZXRVbmRlZmluZWRTdGF0ZUVycm9yTWVzc2FnZShrZXksIGFjdGlvbikge1xuICB2YXIgYWN0aW9uVHlwZSA9IGFjdGlvbiAmJiBhY3Rpb24udHlwZTtcbiAgdmFyIGFjdGlvbk5hbWUgPSBhY3Rpb25UeXBlICYmICdcIicgKyBhY3Rpb25UeXBlLnRvU3RyaW5nKCkgKyAnXCInIHx8ICdhbiBhY3Rpb24nO1xuXG4gIHJldHVybiAnR2l2ZW4gYWN0aW9uICcgKyBhY3Rpb25OYW1lICsgJywgcmVkdWNlciBcIicgKyBrZXkgKyAnXCIgcmV0dXJuZWQgdW5kZWZpbmVkLiAnICsgJ1RvIGlnbm9yZSBhbiBhY3Rpb24sIHlvdSBtdXN0IGV4cGxpY2l0bHkgcmV0dXJuIHRoZSBwcmV2aW91cyBzdGF0ZS4nO1xufVxuXG5mdW5jdGlvbiBnZXRVbmV4cGVjdGVkU3RhdGVTaGFwZVdhcm5pbmdNZXNzYWdlKGlucHV0U3RhdGUsIHJlZHVjZXJzLCBhY3Rpb24sIHVuZXhwZWN0ZWRLZXlDYWNoZSkge1xuICB2YXIgcmVkdWNlcktleXMgPSBPYmplY3Qua2V5cyhyZWR1Y2Vycyk7XG4gIHZhciBhcmd1bWVudE5hbWUgPSBhY3Rpb24gJiYgYWN0aW9uLnR5cGUgPT09IF9jcmVhdGVTdG9yZS5BY3Rpb25UeXBlcy5JTklUID8gJ3ByZWxvYWRlZFN0YXRlIGFyZ3VtZW50IHBhc3NlZCB0byBjcmVhdGVTdG9yZScgOiAncHJldmlvdXMgc3RhdGUgcmVjZWl2ZWQgYnkgdGhlIHJlZHVjZXInO1xuXG4gIGlmIChyZWR1Y2VyS2V5cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gJ1N0b3JlIGRvZXMgbm90IGhhdmUgYSB2YWxpZCByZWR1Y2VyLiBNYWtlIHN1cmUgdGhlIGFyZ3VtZW50IHBhc3NlZCAnICsgJ3RvIGNvbWJpbmVSZWR1Y2VycyBpcyBhbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSByZWR1Y2Vycy4nO1xuICB9XG5cbiAgaWYgKCEoMCwgX2lzUGxhaW5PYmplY3QyWydkZWZhdWx0J10pKGlucHV0U3RhdGUpKSB7XG4gICAgcmV0dXJuICdUaGUgJyArIGFyZ3VtZW50TmFtZSArICcgaGFzIHVuZXhwZWN0ZWQgdHlwZSBvZiBcIicgKyB7fS50b1N0cmluZy5jYWxsKGlucHV0U3RhdGUpLm1hdGNoKC9cXHMoW2EtenxBLVpdKykvKVsxXSArICdcIi4gRXhwZWN0ZWQgYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyAnICsgKCdrZXlzOiBcIicgKyByZWR1Y2VyS2V5cy5qb2luKCdcIiwgXCInKSArICdcIicpO1xuICB9XG5cbiAgdmFyIHVuZXhwZWN0ZWRLZXlzID0gT2JqZWN0LmtleXMoaW5wdXRTdGF0ZSkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gIXJlZHVjZXJzLmhhc093blByb3BlcnR5KGtleSkgJiYgIXVuZXhwZWN0ZWRLZXlDYWNoZVtrZXldO1xuICB9KTtcblxuICB1bmV4cGVjdGVkS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB1bmV4cGVjdGVkS2V5Q2FjaGVba2V5XSA9IHRydWU7XG4gIH0pO1xuXG4gIGlmICh1bmV4cGVjdGVkS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuICdVbmV4cGVjdGVkICcgKyAodW5leHBlY3RlZEtleXMubGVuZ3RoID4gMSA/ICdrZXlzJyA6ICdrZXknKSArICcgJyArICgnXCInICsgdW5leHBlY3RlZEtleXMuam9pbignXCIsIFwiJykgKyAnXCIgZm91bmQgaW4gJyArIGFyZ3VtZW50TmFtZSArICcuICcpICsgJ0V4cGVjdGVkIHRvIGZpbmQgb25lIG9mIHRoZSBrbm93biByZWR1Y2VyIGtleXMgaW5zdGVhZDogJyArICgnXCInICsgcmVkdWNlcktleXMuam9pbignXCIsIFwiJykgKyAnXCIuIFVuZXhwZWN0ZWQga2V5cyB3aWxsIGJlIGlnbm9yZWQuJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0UmVkdWNlclNhbml0eShyZWR1Y2Vycykge1xuICBPYmplY3Qua2V5cyhyZWR1Y2VycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHJlZHVjZXIgPSByZWR1Y2Vyc1trZXldO1xuICAgIHZhciBpbml0aWFsU3RhdGUgPSByZWR1Y2VyKHVuZGVmaW5lZCwgeyB0eXBlOiBfY3JlYXRlU3RvcmUuQWN0aW9uVHlwZXMuSU5JVCB9KTtcblxuICAgIGlmICh0eXBlb2YgaW5pdGlhbFN0YXRlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWR1Y2VyIFwiJyArIGtleSArICdcIiByZXR1cm5lZCB1bmRlZmluZWQgZHVyaW5nIGluaXRpYWxpemF0aW9uLiAnICsgJ0lmIHRoZSBzdGF0ZSBwYXNzZWQgdG8gdGhlIHJlZHVjZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCAnICsgJ2V4cGxpY2l0bHkgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLiBUaGUgaW5pdGlhbCBzdGF0ZSBtYXkgJyArICdub3QgYmUgdW5kZWZpbmVkLicpO1xuICAgIH1cblxuICAgIHZhciB0eXBlID0gJ0BAcmVkdXgvUFJPQkVfVU5LTk9XTl9BQ1RJT05fJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZyg3KS5zcGxpdCgnJykuam9pbignLicpO1xuICAgIGlmICh0eXBlb2YgcmVkdWNlcih1bmRlZmluZWQsIHsgdHlwZTogdHlwZSB9KSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVkdWNlciBcIicgKyBrZXkgKyAnXCIgcmV0dXJuZWQgdW5kZWZpbmVkIHdoZW4gcHJvYmVkIHdpdGggYSByYW5kb20gdHlwZS4gJyArICgnRG9uXFwndCB0cnkgdG8gaGFuZGxlICcgKyBfY3JlYXRlU3RvcmUuQWN0aW9uVHlwZXMuSU5JVCArICcgb3Igb3RoZXIgYWN0aW9ucyBpbiBcInJlZHV4LypcIiAnKSArICduYW1lc3BhY2UuIFRoZXkgYXJlIGNvbnNpZGVyZWQgcHJpdmF0ZS4gSW5zdGVhZCwgeW91IG11c3QgcmV0dXJuIHRoZSAnICsgJ2N1cnJlbnQgc3RhdGUgZm9yIGFueSB1bmtub3duIGFjdGlvbnMsIHVubGVzcyBpdCBpcyB1bmRlZmluZWQsICcgKyAnaW4gd2hpY2ggY2FzZSB5b3UgbXVzdCByZXR1cm4gdGhlIGluaXRpYWwgc3RhdGUsIHJlZ2FyZGxlc3Mgb2YgdGhlICcgKyAnYWN0aW9uIHR5cGUuIFRoZSBpbml0aWFsIHN0YXRlIG1heSBub3QgYmUgdW5kZWZpbmVkLicpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVHVybnMgYW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgZGlmZmVyZW50IHJlZHVjZXIgZnVuY3Rpb25zLCBpbnRvIGEgc2luZ2xlXG4gKiByZWR1Y2VyIGZ1bmN0aW9uLiBJdCB3aWxsIGNhbGwgZXZlcnkgY2hpbGQgcmVkdWNlciwgYW5kIGdhdGhlciB0aGVpciByZXN1bHRzXG4gKiBpbnRvIGEgc2luZ2xlIHN0YXRlIG9iamVjdCwgd2hvc2Uga2V5cyBjb3JyZXNwb25kIHRvIHRoZSBrZXlzIG9mIHRoZSBwYXNzZWRcbiAqIHJlZHVjZXIgZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSByZWR1Y2VycyBBbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGNvcnJlc3BvbmQgdG8gZGlmZmVyZW50XG4gKiByZWR1Y2VyIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmUgY29tYmluZWQgaW50byBvbmUuIE9uZSBoYW5keSB3YXkgdG8gb2J0YWluXG4gKiBpdCBpcyB0byB1c2UgRVM2IGBpbXBvcnQgKiBhcyByZWR1Y2Vyc2Agc3ludGF4LiBUaGUgcmVkdWNlcnMgbWF5IG5ldmVyIHJldHVyblxuICogdW5kZWZpbmVkIGZvciBhbnkgYWN0aW9uLiBJbnN0ZWFkLCB0aGV5IHNob3VsZCByZXR1cm4gdGhlaXIgaW5pdGlhbCBzdGF0ZVxuICogaWYgdGhlIHN0YXRlIHBhc3NlZCB0byB0aGVtIHdhcyB1bmRlZmluZWQsIGFuZCB0aGUgY3VycmVudCBzdGF0ZSBmb3IgYW55XG4gKiB1bnJlY29nbml6ZWQgYWN0aW9uLlxuICpcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSByZWR1Y2VyIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBldmVyeSByZWR1Y2VyIGluc2lkZSB0aGVcbiAqIHBhc3NlZCBvYmplY3QsIGFuZCBidWlsZHMgYSBzdGF0ZSBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzaGFwZS5cbiAqL1xuZnVuY3Rpb24gY29tYmluZVJlZHVjZXJzKHJlZHVjZXJzKSB7XG4gIHZhciByZWR1Y2VyS2V5cyA9IE9iamVjdC5rZXlzKHJlZHVjZXJzKTtcbiAgdmFyIGZpbmFsUmVkdWNlcnMgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWR1Y2VyS2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSByZWR1Y2VyS2V5c1tpXTtcblxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBpZiAodHlwZW9mIHJlZHVjZXJzW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICgwLCBfd2FybmluZzJbJ2RlZmF1bHQnXSkoJ05vIHJlZHVjZXIgcHJvdmlkZWQgZm9yIGtleSBcIicgKyBrZXkgKyAnXCInKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHJlZHVjZXJzW2tleV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGZpbmFsUmVkdWNlcnNba2V5XSA9IHJlZHVjZXJzW2tleV07XG4gICAgfVxuICB9XG4gIHZhciBmaW5hbFJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMoZmluYWxSZWR1Y2Vycyk7XG5cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICB2YXIgdW5leHBlY3RlZEtleUNhY2hlID0ge307XG4gIH1cblxuICB2YXIgc2FuaXR5RXJyb3I7XG4gIHRyeSB7XG4gICAgYXNzZXJ0UmVkdWNlclNhbml0eShmaW5hbFJlZHVjZXJzKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHNhbml0eUVycm9yID0gZTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBjb21iaW5hdGlvbigpIHtcbiAgICB2YXIgc3RhdGUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcbiAgICB2YXIgYWN0aW9uID0gYXJndW1lbnRzWzFdO1xuXG4gICAgaWYgKHNhbml0eUVycm9yKSB7XG4gICAgICB0aHJvdyBzYW5pdHlFcnJvcjtcbiAgICB9XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgdmFyIHdhcm5pbmdNZXNzYWdlID0gZ2V0VW5leHBlY3RlZFN0YXRlU2hhcGVXYXJuaW5nTWVzc2FnZShzdGF0ZSwgZmluYWxSZWR1Y2VycywgYWN0aW9uLCB1bmV4cGVjdGVkS2V5Q2FjaGUpO1xuICAgICAgaWYgKHdhcm5pbmdNZXNzYWdlKSB7XG4gICAgICAgICgwLCBfd2FybmluZzJbJ2RlZmF1bHQnXSkod2FybmluZ01lc3NhZ2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBoYXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgdmFyIG5leHRTdGF0ZSA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmluYWxSZWR1Y2VyS2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGZpbmFsUmVkdWNlcktleXNbaV07XG4gICAgICB2YXIgcmVkdWNlciA9IGZpbmFsUmVkdWNlcnNba2V5XTtcbiAgICAgIHZhciBwcmV2aW91c1N0YXRlRm9yS2V5ID0gc3RhdGVba2V5XTtcbiAgICAgIHZhciBuZXh0U3RhdGVGb3JLZXkgPSByZWR1Y2VyKHByZXZpb3VzU3RhdGVGb3JLZXksIGFjdGlvbik7XG4gICAgICBpZiAodHlwZW9mIG5leHRTdGF0ZUZvcktleSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdmFyIGVycm9yTWVzc2FnZSA9IGdldFVuZGVmaW5lZFN0YXRlRXJyb3JNZXNzYWdlKGtleSwgYWN0aW9uKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBuZXh0U3RhdGVba2V5XSA9IG5leHRTdGF0ZUZvcktleTtcbiAgICAgIGhhc0NoYW5nZWQgPSBoYXNDaGFuZ2VkIHx8IG5leHRTdGF0ZUZvcktleSAhPT0gcHJldmlvdXNTdGF0ZUZvcktleTtcbiAgICB9XG4gICAgcmV0dXJuIGhhc0NoYW5nZWQgPyBuZXh0U3RhdGUgOiBzdGF0ZTtcbiAgfTtcbn1cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpKSIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBjb21wb3NlO1xuLyoqXG4gKiBDb21wb3NlcyBzaW5nbGUtYXJndW1lbnQgZnVuY3Rpb25zIGZyb20gcmlnaHQgdG8gbGVmdC4gVGhlIHJpZ2h0bW9zdFxuICogZnVuY3Rpb24gY2FuIHRha2UgbXVsdGlwbGUgYXJndW1lbnRzIGFzIGl0IHByb3ZpZGVzIHRoZSBzaWduYXR1cmUgZm9yXG4gKiB0aGUgcmVzdWx0aW5nIGNvbXBvc2l0ZSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBmdW5jcyBUaGUgZnVuY3Rpb25zIHRvIGNvbXBvc2UuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgZnVuY3Rpb24gb2J0YWluZWQgYnkgY29tcG9zaW5nIHRoZSBhcmd1bWVudCBmdW5jdGlvbnNcbiAqIGZyb20gcmlnaHQgdG8gbGVmdC4gRm9yIGV4YW1wbGUsIGNvbXBvc2UoZiwgZywgaCkgaXMgaWRlbnRpY2FsIHRvIGRvaW5nXG4gKiAoLi4uYXJncykgPT4gZihnKGgoLi4uYXJncykpKS5cbiAqL1xuXG5mdW5jdGlvbiBjb21wb3NlKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgZnVuY3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBmdW5jc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIGlmIChmdW5jcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGFyZykge1xuICAgICAgcmV0dXJuIGFyZztcbiAgICB9O1xuICB9XG5cbiAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBmdW5jc1swXTtcbiAgfVxuXG4gIHZhciBsYXN0ID0gZnVuY3NbZnVuY3MubGVuZ3RoIC0gMV07XG4gIHZhciByZXN0ID0gZnVuY3Muc2xpY2UoMCwgLTEpO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiByZXN0LnJlZHVjZVJpZ2h0KGZ1bmN0aW9uIChjb21wb3NlZCwgZikge1xuICAgICAgcmV0dXJuIGYoY29tcG9zZWQpO1xuICAgIH0sIGxhc3QuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpKTtcbiAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLkFjdGlvblR5cGVzID0gdW5kZWZpbmVkO1xuZXhwb3J0c1snZGVmYXVsdCddID0gY3JlYXRlU3RvcmU7XG5cbnZhciBfaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC9pc1BsYWluT2JqZWN0Jyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc1BsYWluT2JqZWN0KTtcblxudmFyIF9zeW1ib2xPYnNlcnZhYmxlID0gcmVxdWlyZSgnc3ltYm9sLW9ic2VydmFibGUnKTtcblxudmFyIF9zeW1ib2xPYnNlcnZhYmxlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3N5bWJvbE9ic2VydmFibGUpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbi8qKlxuICogVGhlc2UgYXJlIHByaXZhdGUgYWN0aW9uIHR5cGVzIHJlc2VydmVkIGJ5IFJlZHV4LlxuICogRm9yIGFueSB1bmtub3duIGFjdGlvbnMsIHlvdSBtdXN0IHJldHVybiB0aGUgY3VycmVudCBzdGF0ZS5cbiAqIElmIHRoZSBjdXJyZW50IHN0YXRlIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLlxuICogRG8gbm90IHJlZmVyZW5jZSB0aGVzZSBhY3Rpb24gdHlwZXMgZGlyZWN0bHkgaW4geW91ciBjb2RlLlxuICovXG52YXIgQWN0aW9uVHlwZXMgPSBleHBvcnRzLkFjdGlvblR5cGVzID0ge1xuICBJTklUOiAnQEByZWR1eC9JTklUJ1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgUmVkdXggc3RvcmUgdGhhdCBob2xkcyB0aGUgc3RhdGUgdHJlZS5cbiAqIFRoZSBvbmx5IHdheSB0byBjaGFuZ2UgdGhlIGRhdGEgaW4gdGhlIHN0b3JlIGlzIHRvIGNhbGwgYGRpc3BhdGNoKClgIG9uIGl0LlxuICpcbiAqIFRoZXJlIHNob3VsZCBvbmx5IGJlIGEgc2luZ2xlIHN0b3JlIGluIHlvdXIgYXBwLiBUbyBzcGVjaWZ5IGhvdyBkaWZmZXJlbnRcbiAqIHBhcnRzIG9mIHRoZSBzdGF0ZSB0cmVlIHJlc3BvbmQgdG8gYWN0aW9ucywgeW91IG1heSBjb21iaW5lIHNldmVyYWwgcmVkdWNlcnNcbiAqIGludG8gYSBzaW5nbGUgcmVkdWNlciBmdW5jdGlvbiBieSB1c2luZyBgY29tYmluZVJlZHVjZXJzYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWR1Y2VyIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBuZXh0IHN0YXRlIHRyZWUsIGdpdmVuXG4gKiB0aGUgY3VycmVudCBzdGF0ZSB0cmVlIGFuZCB0aGUgYWN0aW9uIHRvIGhhbmRsZS5cbiAqXG4gKiBAcGFyYW0ge2FueX0gW3ByZWxvYWRlZFN0YXRlXSBUaGUgaW5pdGlhbCBzdGF0ZS4gWW91IG1heSBvcHRpb25hbGx5IHNwZWNpZnkgaXRcbiAqIHRvIGh5ZHJhdGUgdGhlIHN0YXRlIGZyb20gdGhlIHNlcnZlciBpbiB1bml2ZXJzYWwgYXBwcywgb3IgdG8gcmVzdG9yZSBhXG4gKiBwcmV2aW91c2x5IHNlcmlhbGl6ZWQgdXNlciBzZXNzaW9uLlxuICogSWYgeW91IHVzZSBgY29tYmluZVJlZHVjZXJzYCB0byBwcm9kdWNlIHRoZSByb290IHJlZHVjZXIgZnVuY3Rpb24sIHRoaXMgbXVzdCBiZVxuICogYW4gb2JqZWN0IHdpdGggdGhlIHNhbWUgc2hhcGUgYXMgYGNvbWJpbmVSZWR1Y2Vyc2Aga2V5cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlbmhhbmNlciBUaGUgc3RvcmUgZW5oYW5jZXIuIFlvdSBtYXkgb3B0aW9uYWxseSBzcGVjaWZ5IGl0XG4gKiB0byBlbmhhbmNlIHRoZSBzdG9yZSB3aXRoIHRoaXJkLXBhcnR5IGNhcGFiaWxpdGllcyBzdWNoIGFzIG1pZGRsZXdhcmUsXG4gKiB0aW1lIHRyYXZlbCwgcGVyc2lzdGVuY2UsIGV0Yy4gVGhlIG9ubHkgc3RvcmUgZW5oYW5jZXIgdGhhdCBzaGlwcyB3aXRoIFJlZHV4XG4gKiBpcyBgYXBwbHlNaWRkbGV3YXJlKClgLlxuICpcbiAqIEByZXR1cm5zIHtTdG9yZX0gQSBSZWR1eCBzdG9yZSB0aGF0IGxldHMgeW91IHJlYWQgdGhlIHN0YXRlLCBkaXNwYXRjaCBhY3Rpb25zXG4gKiBhbmQgc3Vic2NyaWJlIHRvIGNoYW5nZXMuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVN0b3JlKHJlZHVjZXIsIHByZWxvYWRlZFN0YXRlLCBlbmhhbmNlcikge1xuICB2YXIgX3JlZjI7XG5cbiAgaWYgKHR5cGVvZiBwcmVsb2FkZWRTdGF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZW5oYW5jZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgZW5oYW5jZXIgPSBwcmVsb2FkZWRTdGF0ZTtcbiAgICBwcmVsb2FkZWRTdGF0ZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZW5oYW5jZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBlbmhhbmNlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCB0aGUgZW5oYW5jZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW5oYW5jZXIoY3JlYXRlU3RvcmUpKHJlZHVjZXIsIHByZWxvYWRlZFN0YXRlKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcmVkdWNlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdGhlIHJlZHVjZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciBjdXJyZW50UmVkdWNlciA9IHJlZHVjZXI7XG4gIHZhciBjdXJyZW50U3RhdGUgPSBwcmVsb2FkZWRTdGF0ZTtcbiAgdmFyIGN1cnJlbnRMaXN0ZW5lcnMgPSBbXTtcbiAgdmFyIG5leHRMaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzO1xuICB2YXIgaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKSB7XG4gICAgaWYgKG5leHRMaXN0ZW5lcnMgPT09IGN1cnJlbnRMaXN0ZW5lcnMpIHtcbiAgICAgIG5leHRMaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzLnNsaWNlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIHRoZSBzdGF0ZSB0cmVlIG1hbmFnZWQgYnkgdGhlIHN0b3JlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7YW55fSBUaGUgY3VycmVudCBzdGF0ZSB0cmVlIG9mIHlvdXIgYXBwbGljYXRpb24uXG4gICAqL1xuICBmdW5jdGlvbiBnZXRTdGF0ZSgpIHtcbiAgICByZXR1cm4gY3VycmVudFN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBjaGFuZ2UgbGlzdGVuZXIuIEl0IHdpbGwgYmUgY2FsbGVkIGFueSB0aW1lIGFuIGFjdGlvbiBpcyBkaXNwYXRjaGVkLFxuICAgKiBhbmQgc29tZSBwYXJ0IG9mIHRoZSBzdGF0ZSB0cmVlIG1heSBwb3RlbnRpYWxseSBoYXZlIGNoYW5nZWQuIFlvdSBtYXkgdGhlblxuICAgKiBjYWxsIGBnZXRTdGF0ZSgpYCB0byByZWFkIHRoZSBjdXJyZW50IHN0YXRlIHRyZWUgaW5zaWRlIHRoZSBjYWxsYmFjay5cbiAgICpcbiAgICogWW91IG1heSBjYWxsIGBkaXNwYXRjaCgpYCBmcm9tIGEgY2hhbmdlIGxpc3RlbmVyLCB3aXRoIHRoZSBmb2xsb3dpbmdcbiAgICogY2F2ZWF0czpcbiAgICpcbiAgICogMS4gVGhlIHN1YnNjcmlwdGlvbnMgYXJlIHNuYXBzaG90dGVkIGp1c3QgYmVmb3JlIGV2ZXJ5IGBkaXNwYXRjaCgpYCBjYWxsLlxuICAgKiBJZiB5b3Ugc3Vic2NyaWJlIG9yIHVuc3Vic2NyaWJlIHdoaWxlIHRoZSBsaXN0ZW5lcnMgYXJlIGJlaW5nIGludm9rZWQsIHRoaXNcbiAgICogd2lsbCBub3QgaGF2ZSBhbnkgZWZmZWN0IG9uIHRoZSBgZGlzcGF0Y2goKWAgdGhhdCBpcyBjdXJyZW50bHkgaW4gcHJvZ3Jlc3MuXG4gICAqIEhvd2V2ZXIsIHRoZSBuZXh0IGBkaXNwYXRjaCgpYCBjYWxsLCB3aGV0aGVyIG5lc3RlZCBvciBub3QsIHdpbGwgdXNlIGEgbW9yZVxuICAgKiByZWNlbnQgc25hcHNob3Qgb2YgdGhlIHN1YnNjcmlwdGlvbiBsaXN0LlxuICAgKlxuICAgKiAyLiBUaGUgbGlzdGVuZXIgc2hvdWxkIG5vdCBleHBlY3QgdG8gc2VlIGFsbCBzdGF0ZSBjaGFuZ2VzLCBhcyB0aGUgc3RhdGVcbiAgICogbWlnaHQgaGF2ZSBiZWVuIHVwZGF0ZWQgbXVsdGlwbGUgdGltZXMgZHVyaW5nIGEgbmVzdGVkIGBkaXNwYXRjaCgpYCBiZWZvcmVcbiAgICogdGhlIGxpc3RlbmVyIGlzIGNhbGxlZC4gSXQgaXMsIGhvd2V2ZXIsIGd1YXJhbnRlZWQgdGhhdCBhbGwgc3Vic2NyaWJlcnNcbiAgICogcmVnaXN0ZXJlZCBiZWZvcmUgdGhlIGBkaXNwYXRjaCgpYCBzdGFydGVkIHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIGxhdGVzdFxuICAgKiBzdGF0ZSBieSB0aGUgdGltZSBpdCBleGl0cy5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgQSBjYWxsYmFjayB0byBiZSBpbnZva2VkIG9uIGV2ZXJ5IGRpc3BhdGNoLlxuICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgZnVuY3Rpb24gdG8gcmVtb3ZlIHRoaXMgY2hhbmdlIGxpc3RlbmVyLlxuICAgKi9cbiAgZnVuY3Rpb24gc3Vic2NyaWJlKGxpc3RlbmVyKSB7XG4gICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBsaXN0ZW5lciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cblxuICAgIHZhciBpc1N1YnNjcmliZWQgPSB0cnVlO1xuXG4gICAgZW5zdXJlQ2FuTXV0YXRlTmV4dExpc3RlbmVycygpO1xuICAgIG5leHRMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gdW5zdWJzY3JpYmUoKSB7XG4gICAgICBpZiAoIWlzU3Vic2NyaWJlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlzU3Vic2NyaWJlZCA9IGZhbHNlO1xuXG4gICAgICBlbnN1cmVDYW5NdXRhdGVOZXh0TGlzdGVuZXJzKCk7XG4gICAgICB2YXIgaW5kZXggPSBuZXh0TGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpO1xuICAgICAgbmV4dExpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyBhbiBhY3Rpb24uIEl0IGlzIHRoZSBvbmx5IHdheSB0byB0cmlnZ2VyIGEgc3RhdGUgY2hhbmdlLlxuICAgKlxuICAgKiBUaGUgYHJlZHVjZXJgIGZ1bmN0aW9uLCB1c2VkIHRvIGNyZWF0ZSB0aGUgc3RvcmUsIHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlXG4gICAqIGN1cnJlbnQgc3RhdGUgdHJlZSBhbmQgdGhlIGdpdmVuIGBhY3Rpb25gLiBJdHMgcmV0dXJuIHZhbHVlIHdpbGxcbiAgICogYmUgY29uc2lkZXJlZCB0aGUgKipuZXh0Kiogc3RhdGUgb2YgdGhlIHRyZWUsIGFuZCB0aGUgY2hhbmdlIGxpc3RlbmVyc1xuICAgKiB3aWxsIGJlIG5vdGlmaWVkLlxuICAgKlxuICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvbmx5IHN1cHBvcnRzIHBsYWluIG9iamVjdCBhY3Rpb25zLiBJZiB5b3Ugd2FudCB0b1xuICAgKiBkaXNwYXRjaCBhIFByb21pc2UsIGFuIE9ic2VydmFibGUsIGEgdGh1bmssIG9yIHNvbWV0aGluZyBlbHNlLCB5b3UgbmVlZCB0b1xuICAgKiB3cmFwIHlvdXIgc3RvcmUgY3JlYXRpbmcgZnVuY3Rpb24gaW50byB0aGUgY29ycmVzcG9uZGluZyBtaWRkbGV3YXJlLiBGb3JcbiAgICogZXhhbXBsZSwgc2VlIHRoZSBkb2N1bWVudGF0aW9uIGZvciB0aGUgYHJlZHV4LXRodW5rYCBwYWNrYWdlLiBFdmVuIHRoZVxuICAgKiBtaWRkbGV3YXJlIHdpbGwgZXZlbnR1YWxseSBkaXNwYXRjaCBwbGFpbiBvYmplY3QgYWN0aW9ucyB1c2luZyB0aGlzIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGFjdGlvbiBBIHBsYWluIG9iamVjdCByZXByZXNlbnRpbmcg4oCcd2hhdCBjaGFuZ2Vk4oCdLiBJdCBpc1xuICAgKiBhIGdvb2QgaWRlYSB0byBrZWVwIGFjdGlvbnMgc2VyaWFsaXphYmxlIHNvIHlvdSBjYW4gcmVjb3JkIGFuZCByZXBsYXkgdXNlclxuICAgKiBzZXNzaW9ucywgb3IgdXNlIHRoZSB0aW1lIHRyYXZlbGxpbmcgYHJlZHV4LWRldnRvb2xzYC4gQW4gYWN0aW9uIG11c3QgaGF2ZVxuICAgKiBhIGB0eXBlYCBwcm9wZXJ0eSB3aGljaCBtYXkgbm90IGJlIGB1bmRlZmluZWRgLiBJdCBpcyBhIGdvb2QgaWRlYSB0byB1c2VcbiAgICogc3RyaW5nIGNvbnN0YW50cyBmb3IgYWN0aW9uIHR5cGVzLlxuICAgKlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBGb3IgY29udmVuaWVuY2UsIHRoZSBzYW1lIGFjdGlvbiBvYmplY3QgeW91IGRpc3BhdGNoZWQuXG4gICAqXG4gICAqIE5vdGUgdGhhdCwgaWYgeW91IHVzZSBhIGN1c3RvbSBtaWRkbGV3YXJlLCBpdCBtYXkgd3JhcCBgZGlzcGF0Y2goKWAgdG9cbiAgICogcmV0dXJuIHNvbWV0aGluZyBlbHNlIChmb3IgZXhhbXBsZSwgYSBQcm9taXNlIHlvdSBjYW4gYXdhaXQpLlxuICAgKi9cbiAgZnVuY3Rpb24gZGlzcGF0Y2goYWN0aW9uKSB7XG4gICAgaWYgKCEoMCwgX2lzUGxhaW5PYmplY3QyWydkZWZhdWx0J10pKGFjdGlvbikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aW9ucyBtdXN0IGJlIHBsYWluIG9iamVjdHMuICcgKyAnVXNlIGN1c3RvbSBtaWRkbGV3YXJlIGZvciBhc3luYyBhY3Rpb25zLicpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYWN0aW9uLnR5cGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGlvbnMgbWF5IG5vdCBoYXZlIGFuIHVuZGVmaW5lZCBcInR5cGVcIiBwcm9wZXJ0eS4gJyArICdIYXZlIHlvdSBtaXNzcGVsbGVkIGEgY29uc3RhbnQ/Jyk7XG4gICAgfVxuXG4gICAgaWYgKGlzRGlzcGF0Y2hpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVkdWNlcnMgbWF5IG5vdCBkaXNwYXRjaCBhY3Rpb25zLicpO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBpc0Rpc3BhdGNoaW5nID0gdHJ1ZTtcbiAgICAgIGN1cnJlbnRTdGF0ZSA9IGN1cnJlbnRSZWR1Y2VyKGN1cnJlbnRTdGF0ZSwgYWN0aW9uKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBsaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzID0gbmV4dExpc3RlbmVycztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGlzdGVuZXJzW2ldKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlcyB0aGUgcmVkdWNlciBjdXJyZW50bHkgdXNlZCBieSB0aGUgc3RvcmUgdG8gY2FsY3VsYXRlIHRoZSBzdGF0ZS5cbiAgICpcbiAgICogWW91IG1pZ2h0IG5lZWQgdGhpcyBpZiB5b3VyIGFwcCBpbXBsZW1lbnRzIGNvZGUgc3BsaXR0aW5nIGFuZCB5b3Ugd2FudCB0b1xuICAgKiBsb2FkIHNvbWUgb2YgdGhlIHJlZHVjZXJzIGR5bmFtaWNhbGx5LiBZb3UgbWlnaHQgYWxzbyBuZWVkIHRoaXMgaWYgeW91XG4gICAqIGltcGxlbWVudCBhIGhvdCByZWxvYWRpbmcgbWVjaGFuaXNtIGZvciBSZWR1eC5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dFJlZHVjZXIgVGhlIHJlZHVjZXIgZm9yIHRoZSBzdG9yZSB0byB1c2UgaW5zdGVhZC5cbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBmdW5jdGlvbiByZXBsYWNlUmVkdWNlcihuZXh0UmVkdWNlcikge1xuICAgIGlmICh0eXBlb2YgbmV4dFJlZHVjZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdGhlIG5leHRSZWR1Y2VyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgfVxuXG4gICAgY3VycmVudFJlZHVjZXIgPSBuZXh0UmVkdWNlcjtcbiAgICBkaXNwYXRjaCh7IHR5cGU6IEFjdGlvblR5cGVzLklOSVQgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW50ZXJvcGVyYWJpbGl0eSBwb2ludCBmb3Igb2JzZXJ2YWJsZS9yZWFjdGl2ZSBsaWJyYXJpZXMuXG4gICAqIEByZXR1cm5zIHtvYnNlcnZhYmxlfSBBIG1pbmltYWwgb2JzZXJ2YWJsZSBvZiBzdGF0ZSBjaGFuZ2VzLlxuICAgKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiwgc2VlIHRoZSBvYnNlcnZhYmxlIHByb3Bvc2FsOlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vemVucGFyc2luZy9lcy1vYnNlcnZhYmxlXG4gICAqL1xuICBmdW5jdGlvbiBvYnNlcnZhYmxlKCkge1xuICAgIHZhciBfcmVmO1xuXG4gICAgdmFyIG91dGVyU3Vic2NyaWJlID0gc3Vic2NyaWJlO1xuICAgIHJldHVybiBfcmVmID0ge1xuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbWluaW1hbCBvYnNlcnZhYmxlIHN1YnNjcmlwdGlvbiBtZXRob2QuXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JzZXJ2ZXIgQW55IG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIGFzIGFuIG9ic2VydmVyLlxuICAgICAgICogVGhlIG9ic2VydmVyIG9iamVjdCBzaG91bGQgaGF2ZSBhIGBuZXh0YCBtZXRob2QuXG4gICAgICAgKiBAcmV0dXJucyB7c3Vic2NyaXB0aW9ufSBBbiBvYmplY3Qgd2l0aCBhbiBgdW5zdWJzY3JpYmVgIG1ldGhvZCB0aGF0IGNhblxuICAgICAgICogYmUgdXNlZCB0byB1bnN1YnNjcmliZSB0aGUgb2JzZXJ2YWJsZSBmcm9tIHRoZSBzdG9yZSwgYW5kIHByZXZlbnQgZnVydGhlclxuICAgICAgICogZW1pc3Npb24gb2YgdmFsdWVzIGZyb20gdGhlIG9ic2VydmFibGUuXG4gICAgICAgKi9cbiAgICAgIHN1YnNjcmliZTogZnVuY3Rpb24gc3Vic2NyaWJlKG9ic2VydmVyKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb2JzZXJ2ZXIgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgdGhlIG9ic2VydmVyIHRvIGJlIGFuIG9iamVjdC4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG9ic2VydmVTdGF0ZSgpIHtcbiAgICAgICAgICBpZiAob2JzZXJ2ZXIubmV4dCkge1xuICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChnZXRTdGF0ZSgpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBvYnNlcnZlU3RhdGUoKTtcbiAgICAgICAgdmFyIHVuc3Vic2NyaWJlID0gb3V0ZXJTdWJzY3JpYmUob2JzZXJ2ZVN0YXRlKTtcbiAgICAgICAgcmV0dXJuIHsgdW5zdWJzY3JpYmU6IHVuc3Vic2NyaWJlIH07XG4gICAgICB9XG4gICAgfSwgX3JlZltfc3ltYm9sT2JzZXJ2YWJsZTJbJ2RlZmF1bHQnXV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LCBfcmVmO1xuICB9XG5cbiAgLy8gV2hlbiBhIHN0b3JlIGlzIGNyZWF0ZWQsIGFuIFwiSU5JVFwiIGFjdGlvbiBpcyBkaXNwYXRjaGVkIHNvIHRoYXQgZXZlcnlcbiAgLy8gcmVkdWNlciByZXR1cm5zIHRoZWlyIGluaXRpYWwgc3RhdGUuIFRoaXMgZWZmZWN0aXZlbHkgcG9wdWxhdGVzXG4gIC8vIHRoZSBpbml0aWFsIHN0YXRlIHRyZWUuXG4gIGRpc3BhdGNoKHsgdHlwZTogQWN0aW9uVHlwZXMuSU5JVCB9KTtcblxuICByZXR1cm4gX3JlZjIgPSB7XG4gICAgZGlzcGF0Y2g6IGRpc3BhdGNoLFxuICAgIHN1YnNjcmliZTogc3Vic2NyaWJlLFxuICAgIGdldFN0YXRlOiBnZXRTdGF0ZSxcbiAgICByZXBsYWNlUmVkdWNlcjogcmVwbGFjZVJlZHVjZXJcbiAgfSwgX3JlZjJbX3N5bWJvbE9ic2VydmFibGUyWydkZWZhdWx0J11dID0gb2JzZXJ2YWJsZSwgX3JlZjI7XG59IiwiKGZ1bmN0aW9uIChwcm9jZXNzKXtcbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuY29tcG9zZSA9IGV4cG9ydHMuYXBwbHlNaWRkbGV3YXJlID0gZXhwb3J0cy5iaW5kQWN0aW9uQ3JlYXRvcnMgPSBleHBvcnRzLmNvbWJpbmVSZWR1Y2VycyA9IGV4cG9ydHMuY3JlYXRlU3RvcmUgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlU3RvcmUgPSByZXF1aXJlKCcuL2NyZWF0ZVN0b3JlJyk7XG5cbnZhciBfY3JlYXRlU3RvcmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY3JlYXRlU3RvcmUpO1xuXG52YXIgX2NvbWJpbmVSZWR1Y2VycyA9IHJlcXVpcmUoJy4vY29tYmluZVJlZHVjZXJzJyk7XG5cbnZhciBfY29tYmluZVJlZHVjZXJzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbWJpbmVSZWR1Y2Vycyk7XG5cbnZhciBfYmluZEFjdGlvbkNyZWF0b3JzID0gcmVxdWlyZSgnLi9iaW5kQWN0aW9uQ3JlYXRvcnMnKTtcblxudmFyIF9iaW5kQWN0aW9uQ3JlYXRvcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYmluZEFjdGlvbkNyZWF0b3JzKTtcblxudmFyIF9hcHBseU1pZGRsZXdhcmUgPSByZXF1aXJlKCcuL2FwcGx5TWlkZGxld2FyZScpO1xuXG52YXIgX2FwcGx5TWlkZGxld2FyZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hcHBseU1pZGRsZXdhcmUpO1xuXG52YXIgX2NvbXBvc2UgPSByZXF1aXJlKCcuL2NvbXBvc2UnKTtcblxudmFyIF9jb21wb3NlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2UpO1xuXG52YXIgX3dhcm5pbmcgPSByZXF1aXJlKCcuL3V0aWxzL3dhcm5pbmcnKTtcblxudmFyIF93YXJuaW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dhcm5pbmcpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbi8qXG4qIFRoaXMgaXMgYSBkdW1teSBmdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgZnVuY3Rpb24gbmFtZSBoYXMgYmVlbiBhbHRlcmVkIGJ5IG1pbmlmaWNhdGlvbi5cbiogSWYgdGhlIGZ1bmN0aW9uIGhhcyBiZWVuIG1pbmlmaWVkIGFuZCBOT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nLCB3YXJuIHRoZSB1c2VyLlxuKi9cbmZ1bmN0aW9uIGlzQ3J1c2hlZCgpIHt9XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHR5cGVvZiBpc0NydXNoZWQubmFtZSA9PT0gJ3N0cmluZycgJiYgaXNDcnVzaGVkLm5hbWUgIT09ICdpc0NydXNoZWQnKSB7XG4gICgwLCBfd2FybmluZzJbJ2RlZmF1bHQnXSkoJ1lvdSBhcmUgY3VycmVudGx5IHVzaW5nIG1pbmlmaWVkIGNvZGUgb3V0c2lkZSBvZiBOT0RFX0VOViA9PT0gXFwncHJvZHVjdGlvblxcJy4gJyArICdUaGlzIG1lYW5zIHRoYXQgeW91IGFyZSBydW5uaW5nIGEgc2xvd2VyIGRldmVsb3BtZW50IGJ1aWxkIG9mIFJlZHV4LiAnICsgJ1lvdSBjYW4gdXNlIGxvb3NlLWVudmlmeSAoaHR0cHM6Ly9naXRodWIuY29tL3plcnRvc2gvbG9vc2UtZW52aWZ5KSBmb3IgYnJvd3NlcmlmeSAnICsgJ29yIERlZmluZVBsdWdpbiBmb3Igd2VicGFjayAoaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zMDAzMDAzMSkgJyArICd0byBlbnN1cmUgeW91IGhhdmUgdGhlIGNvcnJlY3QgY29kZSBmb3IgeW91ciBwcm9kdWN0aW9uIGJ1aWxkLicpO1xufVxuXG5leHBvcnRzLmNyZWF0ZVN0b3JlID0gX2NyZWF0ZVN0b3JlMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5jb21iaW5lUmVkdWNlcnMgPSBfY29tYmluZVJlZHVjZXJzMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5iaW5kQWN0aW9uQ3JlYXRvcnMgPSBfYmluZEFjdGlvbkNyZWF0b3JzMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5hcHBseU1pZGRsZXdhcmUgPSBfYXBwbHlNaWRkbGV3YXJlMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5jb21wb3NlID0gX2NvbXBvc2UyWydkZWZhdWx0J107XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSkiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzWydkZWZhdWx0J10gPSB3YXJuaW5nO1xuLyoqXG4gKiBQcmludHMgYSB3YXJuaW5nIGluIHRoZSBjb25zb2xlIGlmIGl0IGV4aXN0cy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBUaGUgd2FybmluZyBtZXNzYWdlLlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIHdhcm5pbmcobWVzc2FnZSkge1xuICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuICB9XG4gIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuICB0cnkge1xuICAgIC8vIFRoaXMgZXJyb3Igd2FzIHRocm93biBhcyBhIGNvbnZlbmllbmNlIHNvIHRoYXQgaWYgeW91IGVuYWJsZVxuICAgIC8vIFwiYnJlYWsgb24gYWxsIGV4Y2VwdGlvbnNcIiBpbiB5b3VyIGNvbnNvbGUsXG4gICAgLy8gaXQgd291bGQgcGF1c2UgdGhlIGV4ZWN1dGlvbiBhdCB0aGlzIGxpbmUuXG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWVtcHR5ICovXG4gIH0gY2F0Y2ggKGUpIHt9XG4gIC8qIGVzbGludC1lbmFibGUgbm8tZW1wdHkgKi9cbn0iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgU3ltYm9sID0gcm9vdC5TeW1ib2w7XG5cbm1vZHVsZS5leHBvcnRzID0gU3ltYm9sO1xuIiwidmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpLFxuICAgIGdldFJhd1RhZyA9IHJlcXVpcmUoJy4vX2dldFJhd1RhZycpLFxuICAgIG9iamVjdFRvU3RyaW5nID0gcmVxdWlyZSgnLi9fb2JqZWN0VG9TdHJpbmcnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG51bGxUYWcgPSAnW29iamVjdCBOdWxsXScsXG4gICAgdW5kZWZpbmVkVGFnID0gJ1tvYmplY3QgVW5kZWZpbmVkXSc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRUYWdgIHdpdGhvdXQgZmFsbGJhY2tzIGZvciBidWdneSBlbnZpcm9ubWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldFRhZyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkVGFnIDogbnVsbFRhZztcbiAgfVxuICByZXR1cm4gKHN5bVRvU3RyaW5nVGFnICYmIHN5bVRvU3RyaW5nVGFnIGluIE9iamVjdCh2YWx1ZSkpXG4gICAgPyBnZXRSYXdUYWcodmFsdWUpXG4gICAgOiBvYmplY3RUb1N0cmluZyh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUdldFRhZztcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbm1vZHVsZS5leHBvcnRzID0gZnJlZUdsb2JhbDtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJ2YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgZ2V0UHJvdG90eXBlID0gb3ZlckFyZyhPYmplY3QuZ2V0UHJvdG90eXBlT2YsIE9iamVjdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UHJvdG90eXBlO1xuIiwidmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlR2V0VGFnYCB3aGljaCBpZ25vcmVzIGBTeW1ib2wudG9TdHJpbmdUYWdgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSByYXcgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gZ2V0UmF3VGFnKHZhbHVlKSB7XG4gIHZhciBpc093biA9IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIHN5bVRvU3RyaW5nVGFnKSxcbiAgICAgIHRhZyA9IHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcblxuICB0cnkge1xuICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHVuZGVmaW5lZDtcbiAgICB2YXIgdW5tYXNrZWQgPSB0cnVlO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIHZhciByZXN1bHQgPSBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgaWYgKHVubWFza2VkKSB7XG4gICAgaWYgKGlzT3duKSB7XG4gICAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB0YWc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UmF3VGFnO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0VG9TdHJpbmc7XG4iLCIvKipcbiAqIENyZWF0ZXMgYSB1bmFyeSBmdW5jdGlvbiB0aGF0IGludm9rZXMgYGZ1bmNgIHdpdGggaXRzIGFyZ3VtZW50IHRyYW5zZm9ybWVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB3cmFwLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSBhcmd1bWVudCB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb3ZlckFyZyhmdW5jLCB0cmFuc2Zvcm0pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBmdW5jKHRyYW5zZm9ybShhcmcpKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBvdmVyQXJnO1xuIiwidmFyIGZyZWVHbG9iYWwgPSByZXF1aXJlKCcuL19mcmVlR2xvYmFsJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSByb290O1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3RMaWtlO1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgZ2V0UHJvdG90eXBlID0gcmVxdWlyZSgnLi9fZ2V0UHJvdG90eXBlJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gaW5mZXIgdGhlIGBPYmplY3RgIGNvbnN0cnVjdG9yLiAqL1xudmFyIG9iamVjdEN0b3JTdHJpbmcgPSBmdW5jVG9TdHJpbmcuY2FsbChPYmplY3QpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCB0aGF0IGlzLCBhbiBvYmplY3QgY3JlYXRlZCBieSB0aGVcbiAqIGBPYmplY3RgIGNvbnN0cnVjdG9yIG9yIG9uZSB3aXRoIGEgYFtbUHJvdG90eXBlXV1gIG9mIGBudWxsYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuOC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiB9XG4gKlxuICogXy5pc1BsYWluT2JqZWN0KG5ldyBGb28pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KHsgJ3gnOiAwLCAneSc6IDAgfSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KE9iamVjdC5jcmVhdGUobnVsbCkpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3RMaWtlKHZhbHVlKSB8fCBiYXNlR2V0VGFnKHZhbHVlKSAhPSBvYmplY3RUYWcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHByb3RvID0gZ2V0UHJvdG90eXBlKHZhbHVlKTtcbiAgaWYgKHByb3RvID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdmFyIEN0b3IgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCAnY29uc3RydWN0b3InKSAmJiBwcm90by5jb25zdHJ1Y3RvcjtcbiAgcmV0dXJuIHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3RvciBpbnN0YW5jZW9mIEN0b3IgJiZcbiAgICBmdW5jVG9TdHJpbmcuY2FsbChDdG9yKSA9PSBvYmplY3RDdG9yU3RyaW5nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzUGxhaW5PYmplY3Q7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2luZGV4Jyk7XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcG9ueWZpbGwgPSByZXF1aXJlKCcuL3BvbnlmaWxsJyk7XG5cbnZhciBfcG9ueWZpbGwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcG9ueWZpbGwpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciByb290OyAvKiBnbG9iYWwgd2luZG93ICovXG5cblxuaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xuICByb290ID0gc2VsZjtcbn0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgcm9vdCA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgcm9vdCA9IGdsb2JhbDtcbn0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgcm9vdCA9IG1vZHVsZTtcbn0gZWxzZSB7XG4gIHJvb3QgPSBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xufVxuXG52YXIgcmVzdWx0ID0gKDAsIF9wb255ZmlsbDJbJ2RlZmF1bHQnXSkocm9vdCk7XG5leHBvcnRzWydkZWZhdWx0J10gPSByZXN1bHQ7XG59KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHN5bWJvbE9ic2VydmFibGVQb255ZmlsbDtcbmZ1bmN0aW9uIHN5bWJvbE9ic2VydmFibGVQb255ZmlsbChyb290KSB7XG5cdHZhciByZXN1bHQ7XG5cdHZhciBfU3ltYm9sID0gcm9vdC5TeW1ib2w7XG5cblx0aWYgKHR5cGVvZiBfU3ltYm9sID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0aWYgKF9TeW1ib2wub2JzZXJ2YWJsZSkge1xuXHRcdFx0cmVzdWx0ID0gX1N5bWJvbC5vYnNlcnZhYmxlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHQgPSBfU3ltYm9sKCdvYnNlcnZhYmxlJyk7XG5cdFx0XHRfU3ltYm9sLm9ic2VydmFibGUgPSByZXN1bHQ7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJlc3VsdCA9ICdAQG9ic2VydmFibGUnO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGthbHBhbmEgb24gMjIvMDUvMTcuXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gKiBhY3Rpb24gdHlwZXNcbiAqL1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5hZGRUb2RvID0gYWRkVG9kbztcbmV4cG9ydHMudG9nZ2xlVG9kbyA9IHRvZ2dsZVRvZG87XG5leHBvcnRzLnNldFZpc2liaWxpdHlGaWx0ZXIgPSBzZXRWaXNpYmlsaXR5RmlsdGVyO1xudmFyIEFERF9UT0RPID0gZXhwb3J0cy5BRERfVE9ETyA9ICdBRERfVE9ETyc7XG52YXIgVE9HR0xFX1RPRE8gPSBleHBvcnRzLlRPR0dMRV9UT0RPID0gJ1RPR0dMRV9UT0RPJztcbnZhciBTRVRfVklTSUJJTElUWV9GSUxURVIgPSBleHBvcnRzLlNFVF9WSVNJQklMSVRZX0ZJTFRFUiA9ICdTRVRfVklTSUJJTElUWV9GSUxURVInO1xuXG4vKlxuICogb3RoZXIgY29uc3RhbnRzXG4gKi9cblxudmFyIFZpc2liaWxpdHlGaWx0ZXJzID0gZXhwb3J0cy5WaXNpYmlsaXR5RmlsdGVycyA9IHtcbiAgU0hPV19BTEw6ICdTSE9XX0FMTCcsXG4gIFNIT1dfQ09NUExFVEVEOiAnU0hPV19DT01QTEVURUQnLFxuICBTSE9XX0FDVElWRTogJ1NIT1dfQUNUSVZFJ1xufTtcblxuLypcbiAqIGFjdGlvbiBjcmVhdG9yc1xuICovXG5cbmZ1bmN0aW9uIGFkZFRvZG8odGV4dCkge1xuICByZXR1cm4geyB0eXBlOiBBRERfVE9ETywgdGV4dDogdGV4dCB9O1xufVxuXG5mdW5jdGlvbiB0b2dnbGVUb2RvKGluZGV4KSB7XG4gIHJldHVybiB7IHR5cGU6IFRPR0dMRV9UT0RPLCBpbmRleDogaW5kZXggfTtcbn1cblxuZnVuY3Rpb24gc2V0VmlzaWJpbGl0eUZpbHRlcihmaWx0ZXIpIHtcbiAgcmV0dXJuIHsgdHlwZTogU0VUX1ZJU0lCSUxJVFlfRklMVEVSLCBmaWx0ZXI6IGZpbHRlciB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW1GamRHbHZibk11YW5NaVhTd2libUZ0WlhNaU9sc2lZV1JrVkc5a2J5SXNJblJ2WjJkc1pWUnZaRzhpTENKelpYUldhWE5wWW1sc2FYUjVSbWxzZEdWeUlpd2lRVVJFWDFSUFJFOGlMQ0pVVDBkSFRFVmZWRTlFVHlJc0lsTkZWRjlXU1ZOSlFrbE1TVlJaWDBaSlRGUkZVaUlzSWxacGMybGlhV3hwZEhsR2FXeDBaWEp6SWl3aVUwaFBWMTlCVEV3aUxDSlRTRTlYWDBOUFRWQk1SVlJGUkNJc0lsTklUMWRmUVVOVVNWWkZJaXdpZEdWNGRDSXNJblI1Y0dVaUxDSnBibVJsZUNJc0ltWnBiSFJsY2lKZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFN096czdRVUZKUVRzN1FVRkZRVHM3T3pzN096dFJRWE5DWjBKQkxFOHNSMEZCUVVFc1R6dFJRVWxCUXl4VkxFZEJRVUZCTEZVN1VVRkpRVU1zYlVJc1IwRkJRVUVzYlVJN1FVRXhRbFFzU1VGQlRVTXNPRUpCUVZjc1ZVRkJha0k3UVVGRFFTeEpRVUZOUXl4dlEwRkJZeXhoUVVGd1FqdEJRVU5CTEVsQlFVMURMSGRFUVVGM1FpeDFRa0ZCT1VJN08wRkJSVkE3T3pzN1FVRkpUeXhKUVVGTlF5eG5SRUZCYjBJN1FVRkROMEpETEZsQlFWVXNWVUZFYlVJN1FVRkZOMEpETEd0Q1FVRm5RaXhuUWtGR1lUdEJRVWMzUWtNc1pVRkJZVHRCUVVoblFpeERRVUV4UWpzN1FVRk5VRHM3T3p0QlFVbFBMRk5CUVZOVUxFOUJRVlFzUTBGQmFVSlZMRWxCUVdwQ0xFVkJRWFZDTzBGQlF6RkNMRk5CUVU4c1JVRkJSVU1zVFVGQlRWSXNVVUZCVWl4RlFVRnJRazhzVlVGQmJFSXNSVUZCVUR0QlFVTklPenRCUVVWTkxGTkJRVk5VTEZWQlFWUXNRMEZCYjBKWExFdEJRWEJDTEVWQlFUSkNPMEZCUXpsQ0xGTkJRVThzUlVGQlJVUXNUVUZCVFZBc1YwRkJVaXhGUVVGeFFsRXNXVUZCY2tJc1JVRkJVRHRCUVVOSU96dEJRVVZOTEZOQlFWTldMRzFDUVVGVUxFTkJRVFpDVnl4TlFVRTNRaXhGUVVGeFF6dEJRVU40UXl4VFFVRlBMRVZCUVVWR0xFMUJRVTFPTEhGQ1FVRlNMRVZCUVN0Q1VTeGpRVUV2UWl4RlFVRlFPMEZCUTBnaUxDSm1hV3hsSWpvaVlXTjBhVzl1Y3k1cWN5SXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJJaThxS2x4dUlDb2dRM0psWVhSbFpDQmllU0JyWVd4d1lXNWhJRzl1SURJeUx6QTFMekUzTGx4dUlDb3ZYRzVjYmx3aWRYTmxJSE4wY21samRGd2lPMXh1WEc0dktseHVJQ29nWVdOMGFXOXVJSFI1Y0dWelhHNGdLaTljYmx4dVpYaHdiM0owSUdOdmJuTjBJRUZFUkY5VVQwUlBJRDBnSjBGRVJGOVVUMFJQSjF4dVpYaHdiM0owSUdOdmJuTjBJRlJQUjBkTVJWOVVUMFJQSUQwZ0oxUlBSMGRNUlY5VVQwUlBKMXh1Wlhod2IzSjBJR052Ym5OMElGTkZWRjlXU1ZOSlFrbE1TVlJaWDBaSlRGUkZVaUE5SUNkVFJWUmZWa2xUU1VKSlRFbFVXVjlHU1V4VVJWSW5YRzVjYmk4cVhHNGdLaUJ2ZEdobGNpQmpiMjV6ZEdGdWRITmNiaUFxTDF4dVhHNWxlSEJ2Y25RZ1kyOXVjM1FnVm1semFXSnBiR2wwZVVacGJIUmxjbk1nUFNCN1hHNGdJQ0FnVTBoUFYxOUJURXc2SUNkVFNFOVhYMEZNVENjc1hHNGdJQ0FnVTBoUFYxOURUMDFRVEVWVVJVUTZJQ2RUU0U5WFgwTlBUVkJNUlZSRlJDY3NYRzRnSUNBZ1UwaFBWMTlCUTFSSlZrVTZJQ2RUU0U5WFgwRkRWRWxXUlNkY2JuMWNibHh1THlwY2JpQXFJR0ZqZEdsdmJpQmpjbVZoZEc5eWMxeHVJQ292WEc1Y2JtVjRjRzl5ZENCbWRXNWpkR2x2YmlCaFpHUlViMlJ2S0hSbGVIUXBJSHRjYmlBZ0lDQnlaWFIxY200Z2V5QjBlWEJsT2lCQlJFUmZWRTlFVHl3Z2RHVjRkQ0I5WEc1OVhHNWNibVY0Y0c5eWRDQm1kVzVqZEdsdmJpQjBiMmRuYkdWVWIyUnZLR2x1WkdWNEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUhzZ2RIbHdaVG9nVkU5SFIweEZYMVJQUkU4c0lHbHVaR1Y0SUgxY2JuMWNibHh1Wlhod2IzSjBJR1oxYm1OMGFXOXVJSE5sZEZacGMybGlhV3hwZEhsR2FXeDBaWElvWm1sc2RHVnlLU0I3WEc0Z0lDQWdjbVYwZFhKdUlIc2dkSGx3WlRvZ1UwVlVYMVpKVTBsQ1NVeEpWRmxmUmtsTVZFVlNMQ0JtYVd4MFpYSWdmVnh1ZlNKZGZRPT0iLCIvKipcbiAqIENyZWF0ZWQgYnkga2FscGFuYSBvbiAyMi8wNS8xNy5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLypcbiAqIGFjdGlvbiB0eXBlc1xuICovXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuYWRkVG9kbyA9IGFkZFRvZG87XG5leHBvcnRzLnRvZ2dsZVRvZG8gPSB0b2dnbGVUb2RvO1xuZXhwb3J0cy5zZXRWaXNpYmlsaXR5RmlsdGVyID0gc2V0VmlzaWJpbGl0eUZpbHRlcjtcbnZhciBBRERfVE9ETyA9IGV4cG9ydHMuQUREX1RPRE8gPSAnQUREX1RPRE8nO1xudmFyIFRPR0dMRV9UT0RPID0gZXhwb3J0cy5UT0dHTEVfVE9ETyA9ICdUT0dHTEVfVE9ETyc7XG52YXIgU0VUX1ZJU0lCSUxJVFlfRklMVEVSID0gZXhwb3J0cy5TRVRfVklTSUJJTElUWV9GSUxURVIgPSAnU0VUX1ZJU0lCSUxJVFlfRklMVEVSJztcblxuLypcbiAqIG90aGVyIGNvbnN0YW50c1xuICovXG5cbnZhciBWaXNpYmlsaXR5RmlsdGVycyA9IGV4cG9ydHMuVmlzaWJpbGl0eUZpbHRlcnMgPSB7XG4gICAgU0hPV19BTEw6ICdTSE9XX0FMTCcsXG4gICAgU0hPV19DT01QTEVURUQ6ICdTSE9XX0NPTVBMRVRFRCcsXG4gICAgU0hPV19BQ1RJVkU6ICdTSE9XX0FDVElWRSdcbn07XG5cbi8qXG4gKiBhY3Rpb24gY3JlYXRvcnNcbiAqL1xuXG5mdW5jdGlvbiBhZGRUb2RvKHRleHQpIHtcbiAgICByZXR1cm4geyB0eXBlOiBBRERfVE9ETywgdGV4dDogdGV4dCB9O1xufVxuXG5mdW5jdGlvbiB0b2dnbGVUb2RvKGluZGV4KSB7XG4gICAgcmV0dXJuIHsgdHlwZTogVE9HR0xFX1RPRE8sIGluZGV4OiBpbmRleCB9O1xufVxuXG5mdW5jdGlvbiBzZXRWaXNpYmlsaXR5RmlsdGVyKGZpbHRlcikge1xuICAgIHJldHVybiB7IHR5cGU6IFNFVF9WSVNJQklMSVRZX0ZJTFRFUiwgZmlsdGVyOiBmaWx0ZXIgfTtcbn1cbi8qKlxuICogQ3JlYXRlZCBieSBrYWxwYW5hIG9uIDIyLzA1LzE3LlxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgX3JlZHV4ID0gcmVxdWlyZSgncmVkdXgnKTtcblxudmFyIF9yZWR1Y2VycyA9IHJlcXVpcmUoJy4vcmVkdWNlcnMnKTtcblxudmFyIF9yZWR1Y2VyczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWR1Y2Vycyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gICAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07XG59XG5cbnZhciBzdG9yZSA9ICgwLCBfcmVkdXguY3JlYXRlU3RvcmUpKF9yZWR1Y2VyczIuZGVmYXVsdCk7XG5cbi8vIExvZyB0aGUgaW5pdGlhbCBzdGF0ZVxuY29uc29sZS5sb2coc3RvcmUuZ2V0U3RhdGUoKSk7XG5cbi8vIEV2ZXJ5IHRpbWUgdGhlIHN0YXRlIGNoYW5nZXMsIGxvZyBpdFxuLy8gTm90ZSB0aGF0IHN1YnNjcmliZSgpIHJldHVybnMgYSBmdW5jdGlvbiBmb3IgdW5yZWdpc3RlcmluZyB0aGUgbGlzdGVuZXJcbnZhciB1bnN1YnNjcmliZSA9IHN0b3JlLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGNvbnNvbGUubG9nKHN0b3JlLmdldFN0YXRlKCkpO1xufSk7XG5cbi8vIERpc3BhdGNoIHNvbWUgYWN0aW9uc1xuc3RvcmUuZGlzcGF0Y2goYWRkVG9kbygnTGVhcm4gYWJvdXQgYWN0aW9ucycpKTtcbnN0b3JlLmRpc3BhdGNoKGFkZFRvZG8oJ0xlYXJuIGFib3V0IHJlZHVjZXJzJykpO1xuc3RvcmUuZGlzcGF0Y2goYWRkVG9kbygnTGVhcm4gYWJvdXQgc3RvcmUnKSk7XG5zdG9yZS5kaXNwYXRjaCh0b2dnbGVUb2RvKDApKTtcbnN0b3JlLmRpc3BhdGNoKHRvZ2dsZVRvZG8oMSkpO1xuc3RvcmUuZGlzcGF0Y2goc2V0VmlzaWJpbGl0eUZpbHRlcihWaXNpYmlsaXR5RmlsdGVycy5TSE9XX0NPTVBMRVRFRCkpO1xuXG4vLyBTdG9wIGxpc3RlbmluZyB0byBzdGF0ZSB1cGRhdGVzXG51bnN1YnNjcmliZSgpO1xuLyoqXG4gKiBDcmVhdGVkIGJ5IGthbHBhbmEgb24gMjIvMDUvMTcuXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWR1eCA9IHJlcXVpcmUoJ3JlZHV4Jyk7XG5cbnZhciBfYWN0aW9ucyA9IHJlcXVpcmUoJy4vYWN0aW9ucycpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcnIyW2ldID0gYXJyW2ldO1xuICAgICAgICB9cmV0dXJuIGFycjI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oYXJyKTtcbiAgICB9XG59XG5cbnZhciBTSE9XX0FMTCA9IF9hY3Rpb25zLlZpc2liaWxpdHlGaWx0ZXJzLlNIT1dfQUxMO1xuXG5mdW5jdGlvbiB2aXNpYmlsaXR5RmlsdGVyKCkge1xuICAgIHZhciBzdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogU0hPV19BTEw7XG4gICAgdmFyIGFjdGlvbiA9IGFyZ3VtZW50c1sxXTtcblxuICAgIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICAgICAgY2FzZSBfYWN0aW9ucy5TRVRfVklTSUJJTElUWV9GSUxURVI6XG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uLmZpbHRlcjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRvZG9zKCkge1xuICAgIHZhciBzdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogW107XG4gICAgdmFyIGFjdGlvbiA9IGFyZ3VtZW50c1sxXTtcblxuICAgIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICAgICAgY2FzZSBfYWN0aW9ucy5BRERfVE9ETzpcbiAgICAgICAgICAgIHJldHVybiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHN0YXRlKSwgW3tcbiAgICAgICAgICAgICAgICB0ZXh0OiBhY3Rpb24udGV4dCxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWQ6IGZhbHNlXG4gICAgICAgICAgICB9XSk7XG4gICAgICAgIGNhc2UgX2FjdGlvbnMuVE9HR0xFX1RPRE86XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUubWFwKGZ1bmN0aW9uICh0b2RvLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gYWN0aW9uLmluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCB0b2RvLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZWQ6ICF0b2RvLmNvbXBsZXRlZFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvZG87XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG59XG5cbnZhciB0b2RvQXBwID0gKDAsIF9yZWR1eC5jb21iaW5lUmVkdWNlcnMpKHtcbiAgICB2aXNpYmlsaXR5RmlsdGVyOiB2aXNpYmlsaXR5RmlsdGVyLFxuICAgIHRvZG9zOiB0b2Rvc1xufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHRvZG9BcHA7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkltWmhhMlZmT0dKak9URmpaR1V1YW5NaVhTd2libUZ0WlhNaU9sc2lUMkpxWldOMElpd2laR1ZtYVc1bFVISnZjR1Z5ZEhraUxDSmxlSEJ2Y25Seklpd2lkbUZzZFdVaUxDSmhaR1JVYjJSdklpd2lkRzluWjJ4bFZHOWtieUlzSW5ObGRGWnBjMmxpYVd4cGRIbEdhV3gwWlhJaUxDSkJSRVJmVkU5RVR5SXNJbFJQUjBkTVJWOVVUMFJQSWl3aVUwVlVYMVpKVTBsQ1NVeEpWRmxmUmtsTVZFVlNJaXdpVm1semFXSnBiR2wwZVVacGJIUmxjbk1pTENKVFNFOVhYMEZNVENJc0lsTklUMWRmUTA5TlVFeEZWRVZFSWl3aVUwaFBWMTlCUTFSSlZrVWlMQ0owWlhoMElpd2lkSGx3WlNJc0ltbHVaR1Y0SWl3aVptbHNkR1Z5SWl3aVgzSmxaSFY0SWl3aWNtVnhkV2x5WlNJc0lsOXlaV1IxWTJWeWN5SXNJbDl5WldSMVkyVnljeklpTENKZmFXNTBaWEp2Y0ZKbGNYVnBjbVZFWldaaGRXeDBJaXdpYjJKcUlpd2lYMTlsYzAxdlpIVnNaU0lzSW1SbFptRjFiSFFpTENKemRHOXlaU0lzSW1OeVpXRjBaVk4wYjNKbElpd2lZMjl1YzI5c1pTSXNJbXh2WnlJc0ltZGxkRk4wWVhSbElpd2lkVzV6ZFdKelkzSnBZbVVpTENKemRXSnpZM0pwWW1VaUxDSmthWE53WVhSamFDSXNJbDloWTNScGIyNXpJaXdpWDNSdlEyOXVjM1Z0WVdKc1pVRnljbUY1SWl3aVlYSnlJaXdpUVhKeVlYa2lMQ0pwYzBGeWNtRjVJaXdpYVNJc0ltRnljaklpTENKc1pXNW5kR2dpTENKbWNtOXRJaXdpZG1semFXSnBiR2wwZVVacGJIUmxjaUlzSW5OMFlYUmxJaXdpWVhKbmRXMWxiblJ6SWl3aWRXNWtaV1pwYm1Wa0lpd2lZV04wYVc5dUlpd2lkRzlrYjNNaUxDSmpiMjVqWVhRaUxDSmpiMjF3YkdWMFpXUWlMQ0p0WVhBaUxDSjBiMlJ2SWl3aVlYTnphV2R1SWl3aWRHOWtiMEZ3Y0NJc0ltTnZiV0pwYm1WU1pXUjFZMlZ5Y3lJc0ltMXZaSFZzWlNKZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFN096czdRVUZKUVRzN1FVRkZRVHM3T3p0QlFVbEJRU3hQUVVGUFF5eGpRVUZRTEVOQlFYTkNReXhQUVVGMFFpeEZRVUVyUWl4WlFVRXZRaXhGUVVFMlF6dEJRVU16UTBNc1YwRkJUenRCUVVSdlF5eERRVUUzUXp0QlFVZEJSQ3hSUVVGUlJTeFBRVUZTTEVkQlFXdENRU3hQUVVGc1FqdEJRVU5CUml4UlFVRlJSeXhWUVVGU0xFZEJRWEZDUVN4VlFVRnlRanRCUVVOQlNDeFJRVUZSU1N4dFFrRkJVaXhIUVVFNFFrRXNiVUpCUVRsQ08wRkJRMEVzU1VGQlNVTXNWMEZCVjB3c1VVRkJVVXNzVVVGQlVpeEhRVUZ0UWl4VlFVRnNRenRCUVVOQkxFbEJRVWxETEdOQlFXTk9MRkZCUVZGTkxGZEJRVklzUjBGQmMwSXNZVUZCZUVNN1FVRkRRU3hKUVVGSlF5eDNRa0ZCZDBKUUxGRkJRVkZQTEhGQ1FVRlNMRWRCUVdkRExIVkNRVUUxUkRzN1FVRkZRVHM3T3p0QlFVbEJMRWxCUVVsRExHOUNRVUZ2UWxJc1VVRkJVVkVzYVVKQlFWSXNSMEZCTkVJN1FVRkRiRVJETEdOQlFWVXNWVUZFZDBNN1FVRkZiRVJETEc5Q1FVRm5RaXhuUWtGR2EwTTdRVUZIYkVSRExHbENRVUZoTzBGQlNIRkRMRU5CUVhCRU96dEJRVTFCT3pzN08wRkJTVUVzVTBGQlUxUXNUMEZCVkN4RFFVRnBRbFVzU1VGQmFrSXNSVUZCZFVJN1FVRkRja0lzVjBGQlR5eEZRVUZGUXl4TlFVRk5VaXhSUVVGU0xFVkJRV3RDVHl4TlFVRk5RU3hKUVVGNFFpeEZRVUZRTzBGQlEwUTdPMEZCUlVRc1UwRkJVMVFzVlVGQlZDeERRVUZ2UWxjc1MwRkJjRUlzUlVGQk1rSTdRVUZEZWtJc1YwRkJUeXhGUVVGRlJDeE5RVUZOVUN4WFFVRlNMRVZCUVhGQ1VTeFBRVUZQUVN4TFFVRTFRaXhGUVVGUU8wRkJRMFE3TzBGQlJVUXNVMEZCVTFZc2JVSkJRVlFzUTBGQk5rSlhMRTFCUVRkQ0xFVkJRWEZETzBGQlEyNURMRmRCUVU4c1JVRkJSVVlzVFVGQlRVNHNjVUpCUVZJc1JVRkJLMEpSTEZGQlFWRkJMRTFCUVhaRExFVkJRVkE3UVVGRFJEdEJRVU5FT3pzN08wRkJTVUU3TzBGQlJVRXNTVUZCU1VNc1UwRkJVME1zVVVGQlVTeFBRVUZTTEVOQlFXSTdPMEZCUlVFc1NVRkJTVU1zV1VGQldVUXNVVUZCVVN4WlFVRlNMRU5CUVdoQ096dEJRVVZCTEVsQlFVbEZMR0ZCUVdGRExIVkNRVUYxUWtZc1UwRkJka0lzUTBGQmFrSTdPMEZCUlVFc1UwRkJVMFVzYzBKQlFWUXNRMEZCWjBORExFZEJRV2hETEVWQlFYRkRPMEZCUVVVc1YwRkJUMEVzVDBGQlQwRXNTVUZCU1VNc1ZVRkJXQ3hIUVVGM1FrUXNSMEZCZUVJc1IwRkJPRUlzUlVGQlJVVXNVMEZCVTBZc1IwRkJXQ3hGUVVGeVF6dEJRVUYzUkRzN1FVRkZMMFlzU1VGQlNVY3NVVUZCVVN4RFFVRkRMRWRCUVVkU0xFOUJRVTlUTEZkQlFWZ3NSVUZCZDBKT0xGZEJRVmRKTEU5QlFXNURMRU5CUVZvN08wRkJSVUU3UVVGRFFVY3NVVUZCVVVNc1IwRkJVaXhEUVVGWlNDeE5RVUZOU1N4UlFVRk9MRVZCUVZvN08wRkJSVUU3UVVGRFFUdEJRVU5CTEVsQlFVbERMR05CUVdOTUxFMUJRVTFOTEZOQlFVNHNRMEZCWjBJc1dVRkJXVHRCUVVNMVF5eFhRVUZQU2l4UlFVRlJReXhIUVVGU0xFTkJRVmxJTEUxQlFVMUpMRkZCUVU0c1JVRkJXaXhEUVVGUU8wRkJRMFFzUTBGR2FVSXNRMEZCYkVJN08wRkJTVUU3UVVGRFFVb3NUVUZCVFU4c1VVRkJUaXhEUVVGbE4wSXNVVUZCVVN4eFFrRkJVaXhEUVVGbU8wRkJRMEZ6UWl4TlFVRk5UeXhSUVVGT0xFTkJRV1UzUWl4UlFVRlJMSE5DUVVGU0xFTkJRV1k3UVVGRFFYTkNMRTFCUVUxUExGRkJRVTRzUTBGQlpUZENMRkZCUVZFc2JVSkJRVklzUTBGQlpqdEJRVU5CYzBJc1RVRkJUVThzVVVGQlRpeERRVUZsTlVJc1YwRkJWeXhEUVVGWUxFTkJRV1k3UVVGRFFYRkNMRTFCUVUxUExGRkJRVTRzUTBGQlpUVkNMRmRCUVZjc1EwRkJXQ3hEUVVGbU8wRkJRMEZ4UWl4TlFVRk5UeXhSUVVGT0xFTkJRV1V6UWl4dlFrRkJiMEpKTEd0Q1FVRnJRa1VzWTBGQmRFTXNRMEZCWmpzN1FVRkZRVHRCUVVOQmJVSTdRVUZEUVRzN096dEJRVWxCT3p0QlFVVkJMMElzVDBGQlQwTXNZMEZCVUN4RFFVRnpRa01zVDBGQmRFSXNSVUZCSzBJc1dVRkJMMElzUlVGQk5rTTdRVUZEZWtORExGZEJRVTg3UVVGRWEwTXNRMEZCTjBNN08wRkJTVUVzU1VGQlNXVXNVMEZCVTBNc1VVRkJVU3hQUVVGU0xFTkJRV0k3TzBGQlJVRXNTVUZCU1dVc1YwRkJWMllzVVVGQlVTeFhRVUZTTEVOQlFXWTdPMEZCUlVFc1UwRkJVMmRDTEd0Q1FVRlVMRU5CUVRSQ1F5eEhRVUUxUWl4RlFVRnBRenRCUVVGRkxGRkJRVWxETEUxQlFVMURMRTlCUVU0c1EwRkJZMFlzUjBGQlpDeERRVUZLTEVWQlFYZENPMEZCUVVVc1lVRkJTeXhKUVVGSlJ5eEpRVUZKTEVOQlFWSXNSVUZCVjBNc1QwRkJUMGdzVFVGQlRVUXNTVUZCU1Vzc1RVRkJWaXhEUVVGMlFpeEZRVUV3UTBZc1NVRkJTVWdzU1VGQlNVc3NUVUZCYkVRc1JVRkJNRVJHTEVkQlFURkVMRVZCUVN0RU8wRkJRVVZETEdsQ1FVRkxSQ3hEUVVGTUxFbEJRVlZJTEVsQlFVbEhMRU5CUVVvc1EwRkJWanRCUVVGdFFpeFRRVUZETEU5QlFVOURMRWxCUVZBN1FVRkJZeXhMUVVFM1NDeE5RVUZ0U1R0QlFVRkZMR1ZCUVU5SUxFMUJRVTFMTEVsQlFVNHNRMEZCVjA0c1IwRkJXQ3hEUVVGUU8wRkJRWGxDTzBGQlFVVTdPMEZCUlc1TkxFbEJRVWw2UWl4WFFVRlhkVUlzVTBGQlUzaENMR2xDUVVGVUxFTkJRVEpDUXl4UlFVRXhRenM3UVVGSFFTeFRRVUZUWjBNc1owSkJRVlFzUjBGQk5FSTdRVUZEZUVJc1VVRkJTVU1zVVVGQlVVTXNWVUZCVlVvc1RVRkJWaXhIUVVGdFFpeERRVUZ1UWl4SlFVRjNRa2tzVlVGQlZTeERRVUZXTEUxQlFXbENReXhUUVVGNlF5eEhRVUZ4UkVRc1ZVRkJWU3hEUVVGV0xFTkJRWEpFTEVkQlFXOUZiRU1zVVVGQmFFWTdRVUZEUVN4UlFVRkpiME1zVTBGQlUwWXNWVUZCVlN4RFFVRldMRU5CUVdJN08wRkJSVUVzV1VGQlVVVXNUMEZCVDJoRExFbEJRV1k3UVVGRFNTeGhRVUZMYlVJc1UwRkJVM3BDTEhGQ1FVRmtPMEZCUTBrc2JVSkJRVTl6UXl4UFFVRlBPVUlzVFVGQlpEdEJRVU5LTzBGQlEwa3NiVUpCUVU4eVFpeExRVUZRTzBGQlNsSTdRVUZOU0RzN1FVRkZSQ3hUUVVGVFNTeExRVUZVTEVkQlFXbENPMEZCUTJJc1VVRkJTVW9zVVVGQlVVTXNWVUZCVlVvc1RVRkJWaXhIUVVGdFFpeERRVUZ1UWl4SlFVRjNRa2tzVlVGQlZTeERRVUZXTEUxQlFXbENReXhUUVVGNlF5eEhRVUZ4UkVRc1ZVRkJWU3hEUVVGV0xFTkJRWEpFTEVkQlFXOUZMRVZCUVdoR08wRkJRMEVzVVVGQlNVVXNVMEZCVTBZc1ZVRkJWU3hEUVVGV0xFTkJRV0k3TzBGQlJVRXNXVUZCVVVVc1QwRkJUMmhETEVsQlFXWTdRVUZEU1N4aFFVRkxiVUlzVTBGQlV6TkNMRkZCUVdRN1FVRkRTU3h0UWtGQlR5eEhRVUZITUVNc1RVRkJTQ3hEUVVGVlpDeHRRa0ZCYlVKVExFdEJRVzVDTEVOQlFWWXNSVUZCY1VNc1EwRkJRenRCUVVONlF6bENMSE5DUVVGTmFVTXNUMEZCVDJwRExFbEJSRFJDTzBGQlJYcERiME1zTWtKQlFWYzdRVUZHT0VJc1lVRkJSQ3hEUVVGeVF5eERRVUZRTzBGQlNVb3NZVUZCUzJoQ0xGTkJRVk14UWl4WFFVRmtPMEZCUTBrc2JVSkJRVTl2UXl4TlFVRk5UeXhIUVVGT0xFTkJRVlVzVlVGQlZVTXNTVUZCVml4RlFVRm5RbkJETEV0QlFXaENMRVZCUVhWQ08wRkJRM0JETEc5Q1FVRkpRU3hWUVVGVkswSXNUMEZCVHk5Q0xFdEJRWEpDTEVWQlFUUkNPMEZCUTNoQ0xESkNRVUZQYUVJc1QwRkJUM0ZFTEUxQlFWQXNRMEZCWXl4RlFVRmtMRVZCUVd0Q1JDeEpRVUZzUWl4RlFVRjNRanRCUVVNelFrWXNiVU5CUVZjc1EwRkJRMFVzUzBGQlMwWTdRVUZFVlN4eFFrRkJlRUlzUTBGQlVEdEJRVWRJTzBGQlEwUXNkVUpCUVU5RkxFbEJRVkE3UVVGRFNDeGhRVkJOTEVOQlFWQTdRVUZSU2p0QlFVTkpMRzFDUVVGUFVpeExRVUZRTzBGQmFFSlNPMEZCYTBKSU96dEJRVVZFTEVsQlFVbFZMRlZCUVZVc1EwRkJReXhIUVVGSGNFTXNUMEZCVDNGRExHVkJRVmdzUlVGQk5FSTdRVUZEZEVOYUxITkNRVUZyUWtFc1owSkJSRzlDTzBGQlJYUkRTeXhYUVVGUFFUdEJRVVlyUWl4RFFVRTFRaXhEUVVGa096dEJRVXRCT1VNc1VVRkJVWFZDTEU5QlFWSXNSMEZCYTBJMlFpeFBRVUZzUWp0QlFVTkJSU3hQUVVGUGRFUXNUMEZCVUN4SFFVRnBRa0VzVVVGQlVTeFRRVUZTTEVOQlFXcENJaXdpWm1sc1pTSTZJbVpoYTJWZk9HSmpPVEZqWkdVdWFuTWlMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXeUl2S2lwY2JpQXFJRU55WldGMFpXUWdZbmtnYTJGc2NHRnVZU0J2YmlBeU1pOHdOUzh4Tnk1Y2JpQXFMMXh1WEc1Y0luVnpaU0J6ZEhKcFkzUmNJanRjYmx4dUx5cGNiaUFxSUdGamRHbHZiaUIwZVhCbGMxeHVJQ292WEc1Y2JrOWlhbVZqZEM1a1pXWnBibVZRY205d1pYSjBlU2hsZUhCdmNuUnpMQ0JjSWw5ZlpYTk5iMlIxYkdWY0lpd2dlMXh1SUNCMllXeDFaVG9nZEhKMVpWeHVmU2s3WEc1bGVIQnZjblJ6TG1Ga1pGUnZaRzhnUFNCaFpHUlViMlJ2TzF4dVpYaHdiM0owY3k1MGIyZG5iR1ZVYjJSdklEMGdkRzluWjJ4bFZHOWtienRjYm1WNGNHOXlkSE11YzJWMFZtbHphV0pwYkdsMGVVWnBiSFJsY2lBOUlITmxkRlpwYzJsaWFXeHBkSGxHYVd4MFpYSTdYRzUyWVhJZ1FVUkVYMVJQUkU4Z1BTQmxlSEJ2Y25SekxrRkVSRjlVVDBSUElEMGdKMEZFUkY5VVQwUlBKenRjYm5aaGNpQlVUMGRIVEVWZlZFOUVUeUE5SUdWNGNHOXlkSE11VkU5SFIweEZYMVJQUkU4Z1BTQW5WRTlIUjB4RlgxUlBSRThuTzF4dWRtRnlJRk5GVkY5V1NWTkpRa2xNU1ZSWlgwWkpURlJGVWlBOUlHVjRjRzl5ZEhNdVUwVlVYMVpKVTBsQ1NVeEpWRmxmUmtsTVZFVlNJRDBnSjFORlZGOVdTVk5KUWtsTVNWUlpYMFpKVEZSRlVpYzdYRzVjYmk4cVhHNGdLaUJ2ZEdobGNpQmpiMjV6ZEdGdWRITmNiaUFxTDF4dVhHNTJZWElnVm1semFXSnBiR2wwZVVacGJIUmxjbk1nUFNCbGVIQnZjblJ6TGxacGMybGlhV3hwZEhsR2FXeDBaWEp6SUQwZ2UxeHVJQ0JUU0U5WFgwRk1URG9nSjFOSVQxZGZRVXhNSnl4Y2JpQWdVMGhQVjE5RFQwMVFURVZVUlVRNklDZFRTRTlYWDBOUFRWQk1SVlJGUkNjc1hHNGdJRk5JVDFkZlFVTlVTVlpGT2lBblUwaFBWMTlCUTFSSlZrVW5YRzU5TzF4dVhHNHZLbHh1SUNvZ1lXTjBhVzl1SUdOeVpXRjBiM0p6WEc0Z0tpOWNibHh1Wm5WdVkzUnBiMjRnWVdSa1ZHOWtieWgwWlhoMEtTQjdYRzRnSUhKbGRIVnliaUI3SUhSNWNHVTZJRUZFUkY5VVQwUlBMQ0IwWlhoME9pQjBaWGgwSUgwN1hHNTlYRzVjYm1aMWJtTjBhVzl1SUhSdloyZHNaVlJ2Wkc4b2FXNWtaWGdwSUh0Y2JpQWdjbVYwZFhKdUlIc2dkSGx3WlRvZ1ZFOUhSMHhGWDFSUFJFOHNJR2x1WkdWNE9pQnBibVJsZUNCOU8xeHVmVnh1WEc1bWRXNWpkR2x2YmlCelpYUldhWE5wWW1sc2FYUjVSbWxzZEdWeUtHWnBiSFJsY2lrZ2UxeHVJQ0J5WlhSMWNtNGdleUIwZVhCbE9pQlRSVlJmVmtsVFNVSkpURWxVV1Y5R1NVeFVSVklzSUdacGJIUmxjam9nWm1sc2RHVnlJSDA3WEc1OVhHNHZLaXBjYmlBcUlFTnlaV0YwWldRZ1lua2dhMkZzY0dGdVlTQnZiaUF5TWk4d05TOHhOeTVjYmlBcUwxeHVYRzVjSW5WelpTQnpkSEpwWTNSY0lqdGNibHh1ZG1GeUlGOXlaV1IxZUNBOUlISmxjWFZwY21Vb0ozSmxaSFY0SnlrN1hHNWNiblpoY2lCZmNtVmtkV05sY25NZ1BTQnlaWEYxYVhKbEtDY3VMM0psWkhWalpYSnpKeWs3WEc1Y2JuWmhjaUJmY21Wa2RXTmxjbk15SUQwZ1gybHVkR1Z5YjNCU1pYRjFhWEpsUkdWbVlYVnNkQ2hmY21Wa2RXTmxjbk1wTzF4dVhHNW1kVzVqZEdsdmJpQmZhVzUwWlhKdmNGSmxjWFZwY21WRVpXWmhkV3gwS0c5aWFpa2dleUJ5WlhSMWNtNGdiMkpxSUNZbUlHOWlhaTVmWDJWelRXOWtkV3hsSUQ4Z2IySnFJRG9nZXlCa1pXWmhkV3gwT2lCdlltb2dmVHNnZlZ4dVhHNTJZWElnYzNSdmNtVWdQU0FvTUN3Z1gzSmxaSFY0TG1OeVpXRjBaVk4wYjNKbEtTaGZjbVZrZFdObGNuTXlMbVJsWm1GMWJIUXBPMXh1WEc0dkx5Qk1iMmNnZEdobElHbHVhWFJwWVd3Z2MzUmhkR1ZjYm1OdmJuTnZiR1V1Ykc5bktITjBiM0psTG1kbGRGTjBZWFJsS0NrcE8xeHVYRzR2THlCRmRtVnllU0IwYVcxbElIUm9aU0J6ZEdGMFpTQmphR0Z1WjJWekxDQnNiMmNnYVhSY2JpOHZJRTV2ZEdVZ2RHaGhkQ0J6ZFdKelkzSnBZbVVvS1NCeVpYUjFjbTV6SUdFZ1puVnVZM1JwYjI0Z1ptOXlJSFZ1Y21WbmFYTjBaWEpwYm1jZ2RHaGxJR3hwYzNSbGJtVnlYRzUyWVhJZ2RXNXpkV0p6WTNKcFltVWdQU0J6ZEc5eVpTNXpkV0p6WTNKcFltVW9ablZ1WTNScGIyNGdLQ2tnZTF4dUlDQnlaWFIxY200Z1kyOXVjMjlzWlM1c2IyY29jM1J2Y21VdVoyVjBVM1JoZEdVb0tTazdYRzU5S1R0Y2JseHVMeThnUkdsemNHRjBZMmdnYzI5dFpTQmhZM1JwYjI1elhHNXpkRzl5WlM1a2FYTndZWFJqYUNoaFpHUlViMlJ2S0NkTVpXRnliaUJoWW05MWRDQmhZM1JwYjI1ekp5a3BPMXh1YzNSdmNtVXVaR2x6Y0dGMFkyZ29ZV1JrVkc5a2J5Z25UR1ZoY200Z1lXSnZkWFFnY21Wa2RXTmxjbk1uS1NrN1hHNXpkRzl5WlM1a2FYTndZWFJqYUNoaFpHUlViMlJ2S0NkTVpXRnliaUJoWW05MWRDQnpkRzl5WlNjcEtUdGNibk4wYjNKbExtUnBjM0JoZEdOb0tIUnZaMmRzWlZSdlpHOG9NQ2twTzF4dWMzUnZjbVV1WkdsemNHRjBZMmdvZEc5bloyeGxWRzlrYnlneEtTazdYRzV6ZEc5eVpTNWthWE53WVhSamFDaHpaWFJXYVhOcFltbHNhWFI1Um1sc2RHVnlLRlpwYzJsaWFXeHBkSGxHYVd4MFpYSnpMbE5JVDFkZlEwOU5VRXhGVkVWRUtTazdYRzVjYmk4dklGTjBiM0FnYkdsemRHVnVhVzVuSUhSdklITjBZWFJsSUhWd1pHRjBaWE5jYm5WdWMzVmljMk55YVdKbEtDazdYRzR2S2lwY2JpQXFJRU55WldGMFpXUWdZbmtnYTJGc2NHRnVZU0J2YmlBeU1pOHdOUzh4Tnk1Y2JpQXFMMXh1WEc1Y0luVnpaU0J6ZEhKcFkzUmNJanRjYmx4dVQySnFaV04wTG1SbFptbHVaVkJ5YjNCbGNuUjVLR1Y0Y0c5eWRITXNJRndpWDE5bGMwMXZaSFZzWlZ3aUxDQjdYRzRnSUNBZ2RtRnNkV1U2SUhSeWRXVmNibjBwTzF4dVhHNTJZWElnWDNKbFpIVjRJRDBnY21WeGRXbHlaU2duY21Wa2RYZ25LVHRjYmx4dWRtRnlJRjloWTNScGIyNXpJRDBnY21WeGRXbHlaU2duTGk5aFkzUnBiMjV6SnlrN1hHNWNibVoxYm1OMGFXOXVJRjkwYjBOdmJuTjFiV0ZpYkdWQmNuSmhlU2hoY25JcElIc2dhV1lnS0VGeWNtRjVMbWx6UVhKeVlYa29ZWEp5S1NrZ2V5Qm1iM0lnS0haaGNpQnBJRDBnTUN3Z1lYSnlNaUE5SUVGeWNtRjVLR0Z5Y2k1c1pXNW5kR2dwT3lCcElEd2dZWEp5TG14bGJtZDBhRHNnYVNzcktTQjdJR0Z5Y2pKYmFWMGdQU0JoY25KYmFWMDdJSDBnY21WMGRYSnVJR0Z5Y2pJN0lIMGdaV3h6WlNCN0lISmxkSFZ5YmlCQmNuSmhlUzVtY205dEtHRnljaWs3SUgwZ2ZWeHVYRzUyWVhJZ1UwaFBWMTlCVEV3Z1BTQmZZV04wYVc5dWN5NVdhWE5wWW1sc2FYUjVSbWxzZEdWeWN5NVRTRTlYWDBGTVREdGNibHh1WEc1bWRXNWpkR2x2YmlCMmFYTnBZbWxzYVhSNVJtbHNkR1Z5S0NrZ2UxeHVJQ0FnSUhaaGNpQnpkR0YwWlNBOUlHRnlaM1Z0Wlc1MGN5NXNaVzVuZEdnZ1BpQXdJQ1ltSUdGeVozVnRaVzUwYzFzd1hTQWhQVDBnZFc1a1pXWnBibVZrSUQ4Z1lYSm5kVzFsYm5Seld6QmRJRG9nVTBoUFYxOUJURXc3WEc0Z0lDQWdkbUZ5SUdGamRHbHZiaUE5SUdGeVozVnRaVzUwYzFzeFhUdGNibHh1SUNBZ0lITjNhWFJqYUNBb1lXTjBhVzl1TG5SNWNHVXBJSHRjYmlBZ0lDQWdJQ0FnWTJGelpTQmZZV04wYVc5dWN5NVRSVlJmVmtsVFNVSkpURWxVV1Y5R1NVeFVSVkk2WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z1lXTjBhVzl1TG1acGJIUmxjanRjYmlBZ0lDQWdJQ0FnWkdWbVlYVnNkRHBjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCemRHRjBaVHRjYmlBZ0lDQjlYRzU5WEc1Y2JtWjFibU4wYVc5dUlIUnZaRzl6S0NrZ2UxeHVJQ0FnSUhaaGNpQnpkR0YwWlNBOUlHRnlaM1Z0Wlc1MGN5NXNaVzVuZEdnZ1BpQXdJQ1ltSUdGeVozVnRaVzUwYzFzd1hTQWhQVDBnZFc1a1pXWnBibVZrSUQ4Z1lYSm5kVzFsYm5Seld6QmRJRG9nVzEwN1hHNGdJQ0FnZG1GeUlHRmpkR2x2YmlBOUlHRnlaM1Z0Wlc1MGMxc3hYVHRjYmx4dUlDQWdJSE4zYVhSamFDQW9ZV04wYVc5dUxuUjVjR1VwSUh0Y2JpQWdJQ0FnSUNBZ1kyRnpaU0JmWVdOMGFXOXVjeTVCUkVSZlZFOUVUenBjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCYlhTNWpiMjVqWVhRb1gzUnZRMjl1YzNWdFlXSnNaVUZ5Y21GNUtITjBZWFJsS1N3Z1czdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBaWGgwT2lCaFkzUnBiMjR1ZEdWNGRDeGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpiMjF3YkdWMFpXUTZJR1poYkhObFhHNGdJQ0FnSUNBZ0lDQWdJQ0I5WFNrN1hHNGdJQ0FnSUNBZ0lHTmhjMlVnWDJGamRHbHZibk11VkU5SFIweEZYMVJQUkU4NlhHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdjM1JoZEdVdWJXRndLR1oxYm1OMGFXOXVJQ2gwYjJSdkxDQnBibVJsZUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hwYm1SbGVDQTlQVDBnWVdOMGFXOXVMbWx1WkdWNEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJQWW1wbFkzUXVZWE56YVdkdUtIdDlMQ0IwYjJSdkxDQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpiMjF3YkdWMFpXUTZJQ0YwYjJSdkxtTnZiWEJzWlhSbFpGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUhSdlpHODdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdaR1ZtWVhWc2REcGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJ6ZEdGMFpUdGNiaUFnSUNCOVhHNTlYRzVjYm5aaGNpQjBiMlJ2UVhCd0lEMGdLREFzSUY5eVpXUjFlQzVqYjIxaWFXNWxVbVZrZFdObGNuTXBLSHRjYmlBZ0lDQjJhWE5wWW1sc2FYUjVSbWxzZEdWeU9pQjJhWE5wWW1sc2FYUjVSbWxzZEdWeUxGeHVJQ0FnSUhSdlpHOXpPaUIwYjJSdmMxeHVmU2s3WEc1Y2JtVjRjRzl5ZEhNdVpHVm1ZWFZzZENBOUlIUnZaRzlCY0hBN1hHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHVjRjRzl5ZEhOYkoyUmxabUYxYkhRblhUc2lYWDA9IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGthbHBhbmEgb24gMjIvMDUvMTcuXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9yZWR1eCA9IHJlcXVpcmUoJ3JlZHV4Jyk7XG5cbnZhciBfYWN0aW9ucyA9IHJlcXVpcmUoJy4vYWN0aW9ucycpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxudmFyIFNIT1dfQUxMID0gX2FjdGlvbnMuVmlzaWJpbGl0eUZpbHRlcnMuU0hPV19BTEw7XG5cblxuZnVuY3Rpb24gdmlzaWJpbGl0eUZpbHRlcigpIHtcbiAgICB2YXIgc3RhdGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IFNIT1dfQUxMO1xuICAgIHZhciBhY3Rpb24gPSBhcmd1bWVudHNbMV07XG5cbiAgICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgICAgIGNhc2UgX2FjdGlvbnMuU0VUX1ZJU0lCSUxJVFlfRklMVEVSOlxuICAgICAgICAgICAgcmV0dXJuIGFjdGlvbi5maWx0ZXI7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0b2RvcygpIHtcbiAgICB2YXIgc3RhdGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IFtdO1xuICAgIHZhciBhY3Rpb24gPSBhcmd1bWVudHNbMV07XG5cbiAgICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgICAgIGNhc2UgX2FjdGlvbnMuQUREX1RPRE86XG4gICAgICAgICAgICByZXR1cm4gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShzdGF0ZSksIFt7XG4gICAgICAgICAgICAgICAgdGV4dDogYWN0aW9uLnRleHQsXG4gICAgICAgICAgICAgICAgY29tcGxldGVkOiBmYWxzZVxuICAgICAgICAgICAgfV0pO1xuICAgICAgICBjYXNlIF9hY3Rpb25zLlRPR0dMRV9UT0RPOlxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlLm1hcChmdW5jdGlvbiAodG9kbywgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IGFjdGlvbi5pbmRleCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdG9kbywge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkOiAhdG9kby5jb21wbGV0ZWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0b2RvO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxufVxuXG52YXIgdG9kb0FwcCA9ICgwLCBfcmVkdXguY29tYmluZVJlZHVjZXJzKSh7XG4gICAgdmlzaWJpbGl0eUZpbHRlcjogdmlzaWJpbGl0eUZpbHRlcixcbiAgICB0b2RvczogdG9kb3Ncbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSB0b2RvQXBwO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbkpsWkhWalpYSnpMbXB6SWwwc0ltNWhiV1Z6SWpwYklsTklUMWRmUVV4TUlpd2lkbWx6YVdKcGJHbDBlVVpwYkhSbGNpSXNJbk4wWVhSbElpd2lZV04wYVc5dUlpd2lkSGx3WlNJc0ltWnBiSFJsY2lJc0luUnZaRzl6SWl3aWRHVjRkQ0lzSW1OdmJYQnNaWFJsWkNJc0ltMWhjQ0lzSW5SdlpHOGlMQ0pwYm1SbGVDSXNJazlpYW1WamRDSXNJbUZ6YzJsbmJpSXNJblJ2Wkc5QmNIQWlYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJPenM3TzBGQlNVRTdPenM3T3p0QlFVZEJPenRCUVVOQk96czdPMGxCUTFGQkxGRXNPRUpCUVVGQkxGRTdPenRCUVVWU0xGTkJRVk5ETEdkQ1FVRlVMRWRCUVc5RU8wRkJRVUVzVVVGQk1VSkRMRXRCUVRCQ0xIVkZRVUZzUWtZc1VVRkJhMEk3UVVGQlFTeFJRVUZTUnl4TlFVRlJPenRCUVVOb1JDeFpRVUZSUVN4UFFVRlBReXhKUVVGbU8wRkJRMGs3UVVGRFNTeHRRa0ZCVDBRc1QwRkJUMFVzVFVGQlpEdEJRVU5LTzBGQlEwa3NiVUpCUVU5SUxFdEJRVkE3UVVGS1VqdEJRVTFJT3p0QlFVVkVMRk5CUVZOSkxFdEJRVlFzUjBGQmJVTTdRVUZCUVN4UlFVRndRa29zUzBGQmIwSXNkVVZCUVZvc1JVRkJXVHRCUVVGQkxGRkJRVkpETEUxQlFWRTdPMEZCUXk5Q0xGbEJRVkZCTEU5QlFVOURMRWxCUVdZN1FVRkRTVHRCUVVOSkxHZEVRVU5QUml4TFFVUlFMRWxCUlVrN1FVRkRTVXNzYzBKQlFVMUtMRTlCUVU5SkxFbEJSR3BDTzBGQlJVbERMREpDUVVGWE8wRkJSbVlzWVVGR1NqdEJRVTlLTzBGQlEwa3NiVUpCUVU5T0xFMUJRVTFQTEVkQlFVNHNRMEZCVlN4VlFVRkRReXhKUVVGRUxFVkJRVTlETEV0QlFWQXNSVUZCYVVJN1FVRkRPVUlzYjBKQlFVbEJMRlZCUVZWU0xFOUJRVTlSTEV0QlFYSkNMRVZCUVRSQ08wRkJRM2hDTERKQ1FVRlBReXhQUVVGUFF5eE5RVUZRTEVOQlFXTXNSVUZCWkN4RlFVRnJRa2dzU1VGQmJFSXNSVUZCZDBJN1FVRkRNMEpHTEcxRFFVRlhMRU5CUVVORkxFdEJRVXRHTzBGQlJGVXNjVUpCUVhoQ0xFTkJRVkE3UVVGSFNEdEJRVU5FTEhWQ1FVRlBSU3hKUVVGUU8wRkJRMGdzWVVGUVRTeERRVUZRTzBGQlVVbzdRVUZEU1N4dFFrRkJUMUlzUzBGQlVEdEJRVzVDVWp0QlFYRkNTRHM3UVVGRlJDeEpRVUZOV1N4VlFVRlZMRFJDUVVGblFqdEJRVU0xUW1Jc2MwTkJSRFJDTzBGQlJUVkNTenRCUVVZMFFpeERRVUZvUWl4RFFVRm9RanM3YTBKQlMyVlJMRThpTENKbWFXeGxJam9pY21Wa2RXTmxjbk11YW5NaUxDSnpiM1Z5WTJWelEyOXVkR1Z1ZENJNld5SXZLaXBjYmlBcUlFTnlaV0YwWldRZ1lua2dhMkZzY0dGdVlTQnZiaUF5TWk4d05TOHhOeTVjYmlBcUwxeHVYRzVjSW5WelpTQnpkSEpwWTNSY0lqdGNibHh1WEc1cGJYQnZjblFnZXlCamIyMWlhVzVsVW1Wa2RXTmxjbk1nZlNCbWNtOXRJQ2R5WldSMWVDZGNibWx0Y0c5eWRDQjdJRUZFUkY5VVQwUlBMQ0JVVDBkSFRFVmZWRTlFVHl3Z1UwVlVYMVpKVTBsQ1NVeEpWRmxmUmtsTVZFVlNMQ0JXYVhOcFltbHNhWFI1Um1sc2RHVnljeUI5SUdaeWIyMGdKeTR2WVdOMGFXOXVjeWRjYm1OdmJuTjBJSHNnVTBoUFYxOUJURXdnZlNBOUlGWnBjMmxpYVd4cGRIbEdhV3gwWlhKelhHNWNibVoxYm1OMGFXOXVJSFpwYzJsaWFXeHBkSGxHYVd4MFpYSW9jM1JoZEdVZ1BTQlRTRTlYWDBGTVRDd2dZV04wYVc5dUtTQjdYRzRnSUNBZ2MzZHBkR05vSUNoaFkzUnBiMjR1ZEhsd1pTa2dlMXh1SUNBZ0lDQWdJQ0JqWVhObElGTkZWRjlXU1ZOSlFrbE1TVlJaWDBaSlRGUkZVanBjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCaFkzUnBiMjR1Wm1sc2RHVnlYRzRnSUNBZ0lDQWdJR1JsWm1GMWJIUTZYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnYzNSaGRHVmNiaUFnSUNCOVhHNTlYRzVjYm1aMWJtTjBhVzl1SUhSdlpHOXpLSE4wWVhSbElEMGdXMTBzSUdGamRHbHZiaWtnZTF4dUlDQWdJSE4zYVhSamFDQW9ZV04wYVc5dUxuUjVjR1VwSUh0Y2JpQWdJQ0FnSUNBZ1kyRnpaU0JCUkVSZlZFOUVUenBjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCYlhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0xpNHVjM1JoZEdVc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwWlhoME9pQmhZM1JwYjI0dWRHVjRkQ3hjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyOXRjR3hsZEdWa09pQm1ZV3h6WlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJRjFjYmlBZ0lDQWdJQ0FnWTJGelpTQlVUMGRIVEVWZlZFOUVUenBjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCemRHRjBaUzV0WVhBb0tIUnZaRzhzSUdsdVpHVjRLU0E5UGlCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR2x1WkdWNElEMDlQU0JoWTNScGIyNHVhVzVrWlhncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJRTlpYW1WamRDNWhjM05wWjI0b2UzMHNJSFJ2Wkc4c0lIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTnZiWEJzWlhSbFpEb2dJWFJ2Wkc4dVkyOXRjR3hsZEdWa1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDBwWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUIwYjJSdlhHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1Z4dUlDQWdJQ0FnSUNCa1pXWmhkV3gwT2x4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlITjBZWFJsWEc0Z0lDQWdmVnh1ZlZ4dVhHNWpiMjV6ZENCMGIyUnZRWEJ3SUQwZ1kyOXRZbWx1WlZKbFpIVmpaWEp6S0h0Y2JpQWdJQ0IyYVhOcFltbHNhWFI1Um1sc2RHVnlMRnh1SUNBZ0lIUnZaRzl6WEc1OUtWeHVYRzVsZUhCdmNuUWdaR1ZtWVhWc2RDQjBiMlJ2UVhCd0lsMTkiXX0=

//# sourceMappingURL=all.js.map
