/*
==============================
@param Livenjs

Auther: Tarek Salem
proxy module
==============================
 */
'use strict';
const isPrimitive = value => value === null || (typeof value !== 'object' && typeof value !== 'function');

const concatPath = (path, property) => {
    if (property && property.toString) {
        if (path) {
            path += '.';
        }

        path += property.toString();
    }

    return path;
};

const proxyTarget = Symbol('ProxyTarget');

// method to observe object changes
const onChange = (object, onChange, options = {}) => {
    let inApply = false;
    let changed = false;
    const propCache = new WeakMap();
    const pathCache = new WeakMap();

    const handleChange = (path, property, previous, value) => {
        if (!inApply) {
            onChange.call(proxy, concatPath(path, property), value, previous);
        } else if (!changed) {
            changed = true;
        }
    };

    const getOwnPropertyDescriptor = (target, property) => {
        let props = propCache.get(target);

        if (props) {
            return props;
        }

        props = new Map();
        propCache.set(target, props);

        let prop = props.get(property);
        if (!prop) {
            prop = Reflect.getOwnPropertyDescriptor(target, property);
            props.set(property, prop);
        }

        return prop;
    };

    const invalidateCachedDescriptor = (target, property) => {
        const props = propCache.get(target);

        if (props) {
            props.delete(property);
        }
    };

    const handler = {
        get(target, property, receiver) {
            if (property === proxyTarget) {
                return target;
            }

            const value = Reflect.get(target, property, receiver);
            if (isPrimitive(value) || property === 'constructor' || options.isShallow === true) {
                return value;
            }

            // Preserve invariants
            const descriptor = getOwnPropertyDescriptor(target, property);
            if (descriptor && !descriptor.configurable) {
                if (descriptor.set && !descriptor.get) {
                    return undefined;
                }

                if (descriptor.writable === false) {
                    return value;
                }
            }

            pathCache.set(value, concatPath(pathCache.get(target), property));
            return new Proxy(value, handler);
        },

        set(target, property, value, receiver) {
            if (value && value[proxyTarget] !== undefined) {
                value = value[proxyTarget];
            }

            const previous = Reflect.get(target, property, receiver);
            const result = Reflect.set(target, property, value);

            if (previous !== value) {
                handleChange(pathCache.get(target), property, previous, value);
            }

            return result;
        },

        defineProperty(target, property, descriptor) {
            const result = Reflect.defineProperty(target, property, descriptor);
            invalidateCachedDescriptor(target, property);

            handleChange(pathCache.get(target), property, undefined, descriptor.value);

            return result;
        },

        deleteProperty(target, property) {
            const previous = Reflect.get(target, property);
            const result = Reflect.deleteProperty(target, property);
            invalidateCachedDescriptor(target, property);

            handleChange(pathCache.get(target), property, previous);

            return result;
        },

        apply(target, thisArg, argumentsList) {
            if (!inApply) {
                inApply = true;

                const result = Reflect.apply(target, thisArg, argumentsList);

                if (changed) {
                    onChange();
                }

                inApply = false;
                changed = false;

                return result;
            }

            return Reflect.apply(target, thisArg, argumentsList);
        }
    };

    pathCache.set(object, '');
    const proxy = new Proxy(object, handler);

    return proxy;
};

// method to observe arrays changes
function ObservableArray(items) {
    var _self = this,
        _array = [],
        _handlers = {
            itemadded: [],
            itemremoved: [],
            itemset: [],
            arrayset: [],
        };

    function defineIndexProperty(index) {
        if (!(index in _self)) {
            Object.defineProperty(_self, index, {
                configurable: true,
                enumerable: true,
                get: function() {
                    return _array[index];
                },
                set: function(v) {
                    _array[index] = v;
                    raiseEvent({
                        type: "itemset",
                        index: index,
                        item: v
                    });
                }
            });
        }
    }

    function raiseEvent(event) {
        _handlers[event.type].forEach(function(h) {
            h.call(_self, event);
        });
    }

    Object.defineProperty(_self, "addEventListener", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function(eventName, handler) {
            eventName = ("" + eventName).toLowerCase();
            if (!(eventName in _handlers)) throw new Error("Invalid event name.");
            if (typeof handler !== "function") throw new Error("Invalid handler.");
            _handlers[eventName].push(handler);
        }
    });
    Object.defineProperty(_self, "arraySetListener", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function(eventName, handler) {
            eventName = ("" + eventName).toLowerCase();
            if (!(eventName in _handlers)) throw new Error("Invalid event name.");
            if (typeof handler !== "function") throw new Error("Invalid handler.");
            _handlers[eventName].push(handler)
        }
    });
    Object.defineProperty(_self, "removeEventListener", {
        configurable: true,
        enumerable: false,
        writable: false,
        value: function(eventName, handler) {
            eventName = ("" + eventName).toLowerCase();
            if (!(eventName in _handlers)) throw new Error("Invalid event name.");
            if (typeof handler !== "function") throw new Error("Invalid handler.");
            var h = _handlers[eventName];
            var ln = h.length;
            while (--ln >= 0) {
                if (h[ln] === handler) {
                    h.splice(ln, 1);
                }
            }
        }
    });

    Object.defineProperty(_self, "push", {
        configurable: true,
        enumerable: false,
        writable: false,
        value: function() {
            var index;
            for (var i = 0, ln = arguments.length; i < ln; i++) {
                index = _array.length;
                _array.push(arguments[i]);
                defineIndexProperty(index);
                raiseEvent({
                    type: "itemadded",
                    index: index,
                    item: arguments[i]
                });
            }
            return _array.length;
        }
    });

    Object.defineProperty(_self, "pop", {
        configurable: true,
        enumerable: false,
        writable: false,
        value: function() {
            if (_array.length > -1) {
                var index = _array.length - 1,
                    item = _array.pop();
                delete _self[index];
                raiseEvent({
                    type: "itemremoved",
                    index: index,
                    item: item
                });
                return item;
            }
        }
    });

    Object.defineProperty(_self, "unshift", {
        configurable: true,
        enumerable: false,
        writable: false,
        value: function() {
            for (var i = 0, ln = arguments.length; i < ln; i++) {
                _array.splice(i, 0, arguments[i]);
                defineIndexProperty(_array.length - 1);
                raiseEvent({
                    type: "itemadded",
                    index: i,
                    item: arguments[i]
                });
            }
            for (; i < _array.length; i++) {
                raiseEvent({
                    type: "itemset",
                    index: i,
                    item: _array[i]
                });
            }
            return _array.length;
        }
    });

    Object.defineProperty(_self, "shift", {
        configurable: true,
        enumerable: false,
        writable: false,
        value: function() {
            if (_array.length > -1) {
                var item = _array.shift();
                delete _self[_array.length];
                raiseEvent({
                    type: "itemremoved",
                    index: 0,
                    item: item
                });
                return item;
            }
        }
    });

    Object.defineProperty(_self, "splice", {
        configurable: true,
        enumerable: false,
        writable: false,
        value: function(index, howMany /*, element1, element2, ... */ ) {
            var removed = [],
                item,
                pos;
            index = index == null ? 0 : index < 0 ? _array.length + index : index;
            howMany = howMany == null ? _array.length - index : howMany > 0 ? howMany : 0;
            while (howMany--) {
                item = _array.splice(index, 1)[0];
                removed.push(item);
                delete _self[_array.length];
                raiseEvent({
                    type: "itemremoved",
                    index: Number.parseInt(index) + Number.parseInt(removed.length - 1),
                    item: item,
                    array: _array
                });
            }

            for (var i = 2, ln = arguments.length; i < ln; i++) {
                _array.splice(index, 0, arguments[i]);
                defineIndexProperty(_array.length - 1);
                raiseEvent({
                    type: "itemadded",
                    index: index,
                    item: arguments[i]
                });
                index++;
            }
            return removed;
        }
    });
    let valArr = [];
    Object.defineProperty(_self, "length", {
        configurable: true,
        enumerable: true,
        // writable: false,
        get: function() {
            return _array.length;
        },
        set: function(value) {
            if (value > _array.length) {
                return null;
            } else {
                let originalLength = _array.length;
                let originalArray = new Array(..._array);
                let removedIndexes = originalLength - value;
                let childrenCountArray = [];
                let i;
                for (i = 0; i < removedIndexes; i++) {
                    childrenCountArray.push(i);
                }
                try {
                    _array.length = value
                    return raiseEvent({
                        type: "arrayset",
                        index: value,
                        item: _array,
                        originalLength,
                        originalArray,
                        childrenCountArray: childrenCountArray
                    });
                } catch (e) {
                    LivenHelpers.logger({
                        type: "error",
                        error: e
                    });
                }
            }
        }
    });

    Object.getOwnPropertyNames(Array.prototype).forEach(function(name) {
        if (!(name in _self)) {
            Object.defineProperty(_self, name, {
                configurable: true,
                enumerable: false,
                writable: false,
                value: Array.prototype[name]
            });
        }
    });

    if (items instanceof Array) {
        _self.push.apply(_self, items);
    }
}
export {
    onChange,
    ObservableArray
};