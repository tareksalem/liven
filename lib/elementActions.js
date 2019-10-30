/*
==============================
@param Livenjs

Auther: Tarek Salem
elements actions and events module
==============================
 */
Object.defineProperty(Object.prototype, "isEmpty", {
    value: function() {
        if (this && typeof this === 'object') {
            if (Array.from(Object.keys(this)).length === 0) {
                return true;
            } else {
                return false;
            }
        }
    }
})
HTMLElement.prototype.removeThis = function() {
    if (this.parentNode) {
        if (this.parentNode.hasChildNodes(this)) {
            this.parentNode.removeChild(this);
        } else {
            return null;
        }
    } else {
        return null;
    }
};
Element.prototype.appendElements = function(content) {
    if (typeof content === 'object') {
        return this.appendChild(content);
    } else if (typeof content === 'string') {
        // var container = document.createElement("div");
        // container.innerHTML = content;
        return this.insertAdjacentHTML('beforeEnd', content);
    }
};
Element.prototype.reset = function() {
    if (this.tagName === 'FORM') {
        Array.from(this.querySelectorAll('input')).forEach(input => {
            if (input.getAttribute('type') !== 'submit') {
                input.value = '';
            }
        });
    } else if (this.tagName === 'INPUT') {
        this.value = '';
    }
};
// get the parents of element
Element.prototype.parents = function(parent) {
    var element = this;
    var els = [];
    while (element) {
        els.unshift(element);
        element = element.parentNode;
    }
    if (parent === undefined) {
        return els;
    } else {
        parent = typeof parent === 'string' ?
            document.querySelectorAll(parent) :
            parent;
        if (parent.length > 0) {
            var par = [];
            parent.forEach(function(paren) {
                els.forEach(function(el) {
                    if (el === paren) {
                        par.push(paren);
                    }
                });
            });
            return par[0];
        } else {
            var par = [];
            els.forEach(function(el) {
                if (el === parent) {
                    par.push(parent);
                }
            });
            return par[0];
        }
    }
};
Element.prototype.insertAfter = function(element) {
    if (typeof element === 'string') {
        this.insertAdjacentHTML('afterend', element);
    } else if (typeof element === 'object') {
        this.parentNode.insertBefore(element, this.nextSibling);
    }
};
document.liveEvent = function(event, target, cb, option) {
    document.addEventListener(
        event,
        function(e) {
            // check if the type of target is string # Means Element
            if (typeof target == 'string') {
                var targetElements = document.querySelectorAll(target);
                var targetElement = Array.from(targetElements).find(el => {
                    return el == e.target;
                });
                if (targetElement) {
                    return cb(e);
                } else {
                    return null;
                }
            }
        },
        option ? option : false
    );
};
//functions of dome events

Element.prototype.getSiblings = function() {
    let elem = this;
    if (Array.isArray(elem)) {
        Array.from(elem).forEach(elm => {
            let siblings = [];
            var sibling = elem.parentNode.firstChild;
            var skipMe = elm;
            for (; sibling; sibling = sibling.nextSibling) {
                if (sibling.nodeType == 1 && sibling != skipMe) {
                    siblings.push(sibling);
                    return siblings;
                }
            }
        });
    } else {
        var siblings = [];
        var sibling = elem.parentNode.firstChild;
        var skipMe = elem;
        for (; sibling; sibling = sibling.nextSibling) {
            if (sibling.nodeType == 1 && sibling != skipMe) {
                siblings.push(sibling);
                return siblings;
            }
        }
    }
};
/*function to make an events of the dom with on event*/
Object.defineProperty(Object.prototype, "addEvent", {
    value: function(event, cb, option) {
        let self = this;
        if (self) {
            if (self.length !== undefined && self.length > 0) {
                try {
                    Array.from(self).forEach(elem => {
                        if (
                            typeof elem == 'object' &&
                            'nodeType' in elem &&
                            elem.nodeType === 1 &&
                            elem.cloneNode
                        ) {
                            try {
                                elem.addEventListener(
                                    event,
                                    e => {
                                        return cb(e, elem);
                                    },
                                    option ? option : true
                                );
                            } catch (e) {
                                return true;
                            }
                        }
                    });
                } catch (e) {
                    return true;
                }
            } else {
                try {
                    self.addEventListener(
                        event,
                        e => {
                            return cb(e, self);
                        },
                        option ? option : true
                    );
                } catch (e) {
                    return true;
                }
            }
        }
    },
    writable: true
})

HTMLElement.prototype.addEvent = function(event, cb, option) {
    let self = this;
    try {
        return self.addEventListener(
            `${event}`,
            e => {
                return cb(e, self);
            },
            option ? option : true
        )
    } catch (e) {
        return true;
    }
};
Object.defineProperty(Object.prototype, "removeEvent", {
    value: function(event, cb, option) {
        let self = this;
        if (self) {
            if (self.length !== undefined && self.length > 0) {
                try {
                    self.forEach(elem => {
                        if (
                            typeof elem == 'object' &&
                            'nodeType' in elem &&
                            elem.nodeType === 1 &&
                            elem.cloneNode
                        ) {
                            try {
                                elem.removeEventListener(
                                    event,
                                    e => {
                                        return cb(e, elem);
                                    },
                                    option ? option : true
                                );
                            } catch (e) {
                                return true;
                            }
                        }
                    });
                } catch (e) {
                    return true;
                }
            } else {
                try {
                    self.removeEventListener(
                        event,
                        e => {
                            return cb(e, self);
                        },
                        option ? option : true
                    );
                } catch (e) {
                    return true;
                }
            }
        }
    },
    writable: true
})

/*function to make an events of the dom with on event*/
HTMLElement.prototype.removeEvent = (event, cb, option) => {
    var self = this;
    try {
        self.removeEventListener(
            event,
            e => {
                return cb(e, self);
            },
            option ? option : true
        );
    } catch (e) {
        return true;
    }
};
/*function to make toggle click of a specific element, it returns a two callback the first one for the first click and the second callback for the second click*/

Object.defineProperty(Object.prototype, "toggleClick", {
    value: function(cb1, cb2) {
        var trgetElem = this;
        var clicked = 0;
        if (cb1 && cb2) {
            try {
                if (trgetElem.length > 1) {
                    Array.from(trgetElem).forEach(function(el, i) {
                        el.addEventListener('click', function(event) {
                            clicked++;
                            if (clicked === 1) {
                                return cb1(event);
                            } else if (clicked === 2) {
                                cb2(event);
                                return (clicked = 0);
                            }
                        });
                    });
                } else if (trgetElem.length === 1) {
                    trgetElem.addEventListener('click', function(event) {
                        clicked++;
                        if (clicked === 1) {
                            return cb1(event);
                        } else if (clicked === 2) {
                            cb2(event);
                            return (clicked = 0);
                        }
                    });
                }
            } catch (e) {
                return true;
            }
        }
    },
    writable: true
})
HTMLElement.prototype.toggleClick = (cb1, cb2) => {
    let trgetElem = this;
    let clicked = 0;
    trgetElem.addEventListener('click', function(event) {
        clicked++;
        if (clicked === 1) {
            return cb1(event);
        } else if (clicked === 2) {
            cb2(event);
            return (clicked = 0);
        }
    });
};
//end toggle click function

/*function to make toggle hover of a specific element, it returns a two callback the first one for the first hover and the second callback for the second hover*/
Object.defineProperty(Object.prototype, "toggleHover", {
    value: function(cb1, cb2) {
        var trgetElem = this;
        if (cb1 && cb2) {
            try {
                if (trgetElem.length > 1) {
                    Array.from(trgetElem).forEach(function(el, i) {
                        el.addEventListener('mouseenter', function(event) {
                            return cb1(event);
                        });
                        el.addEventListener('mouseleave', function(event) {
                            return cb2(event);
                        });
                    });
                } else if (trgetElem.length === 1) {
                    trgetElem.addEventListener('mouseenter', function(event) {
                        return cb1(event);
                    });
                    trgetElem.addEventListener('mouseleave', function(event) {
                        return cb2(event);
                    });
                }
            } catch (e) {
                return true;
            }
        }
    },
    writable: true
})
HTMLElement.prototype.toggleHover = (cb1, cb2) => {
    let trgetElem = this;
    trgetElem.addEventListener('mouseenter', function(event) {
        return cb1(event);
    });
    trgetElem.addEventListener('mouseleave', function(event) {
        return cb2(event);
    });
};
//end toggle hover function

//end functions of dom events

// animation functions

// slidedown function

HTMLElement.prototype.slideDown = function(time, display) {
    return new Promise((resolve, reject) => {
        try {
            var element = this;
            window.onload = function() {
                makeSliding(element);
            };

            function makeSliding(element) {
                if (element) {
                    var displayStatus =
                        getComputedStyle(element, null).getPropertyValue('display') ||
                        element.style.display;
                    element.style.display = display && typeof display === 'string' ?
                        display :
                        'block';
                    var originalHeight =
                        getComputedStyle(element).getPropertyValue('height') ||
                        element.style.height ||
                        element.offsetHeight;
                    var splitHeight = parseInt(originalHeight);
                    var typeHeight = originalHeight.split(splitHeight)[1];

                    var currentHeight = 0;
                    if (originalHeight.match(/px/gi)) {
                        element.style.height = currentHeight + 'px';
                    } else if (originalHeight.match(/%/gi)) {
                        element.style.height = currentHeight + '%';
                    }
                    var currentTime = splitHeight / (time / 10);
                    var animate = function() {
                        currentHeight += currentTime;
                        if (originalHeight.match(/px/gi)) {
                            element.style.height = currentHeight + 'px';
                        } else if (originalHeight.match(/%/gi)) {
                            element.style.height = currentHeight / 10 + '%';
                        } else if (originalHeight.match(/auto/gi)) {
                            element.style.height = currentHeight + 'auto';
                        }
                        if (element.style.height === originalHeight) {
                            cancelAnimationFrame(animate);
                            element.style.height = originalHeight;
                        } else {
                            requestAnimationFrame && requestAnimationFrame(animate);
                        }
                    };
                    animate();
                    setTimeout(function() {
                        return resolve(element);
                    }, time);
                }
            }
            if (document.readyState === 'complete') {
                makeSliding(element);
            }
        } catch (e) {
            return reject(e);
        }
    })
};

//end slide down function

// slideup function

HTMLElement.prototype.slideUp = function(time) {
    return new Promise((resolve, reject) => {
        try {
            var element = this;
            if (element) {
                var originalHeight =
                    getComputedStyle(element).getPropertyValue('height') ||
                    element.style.height;
                var displayStatus =
                    getComputedStyle(element).getPropertyValue('display') ||
                    element.style.display;
                var splitHeight = parseInt(originalHeight);
                var typeHeight = originalHeight.split(splitHeight)[1];
                var currentHeight = Number.parseInt(originalHeight);
                if (displayStatus !== 'none') {
                    let currentTime = splitHeight / (time / 10);
                    var animate = function() {
                        currentHeight -= currentTime;
                        element.style.height = currentHeight + typeHeight;
                        if (currentHeight <= 0) {
                            cancelAnimationFrame(animate);
                            element.style.display = 'none';
                            element.style.height = originalHeight;
                        } else {
                            requestAnimationFrame(animate);
                        }
                    };
                    requestAnimationFrame(animate);
                }
                setTimeout(function() {
                    return resolve(element);
                }, time);
            }
        } catch (e) {
            return reject(e);
        }
    })
};

//end slide up function

// function for fade toggle

HTMLElement.prototype.fadeToggle = function(duration, displayTo) {
    return new Promise((resolve, reject) => {
        try {
            var element = this;
            if (!displayTo || typeof displayTo === 'function') {
                displayTo = 'block';
            }
            if (
                getComputedStyle(element).getPropertyValue('display') === '' ||
                getComputedStyle(element).getPropertyValue('display') !== 'none'
            ) {
                element.fadeOut(duration).then(() => {
                    return resolve(element);
                }).catch((e) => {
                    return reject(e);
                });
            }
            if (element.style.opacity < 1) {
                element.fadeIn(duration, displayTo).then(() => {
                    return resolve(element);
                }).catch((e) => {
                    return reject(e);
                });
            } else if (element.style.opacity > 0) {
                element.fadeOut(duration).then(() => {
                    return resolve(element);
                }).catch((e) => {
                    return reject(e);
                });
            }
        } catch (e) {
            return reject(e);
        }
    })
};
// end function for fade toggle

// function for slideToggle

HTMLElement.prototype.slideToggle = function(duration, displayTo) {
    return new Promise((resolve, reject) => {
        try {
            var element = this;
            if (!displayTo || typeof displayTo === 'function') {
                displayTo = 'block';
            }
            if (
                getComputedStyle(element).getPropertyValue('display') === '' ||
                getComputedStyle(element).getPropertyValue('display') !== 'none'
            ) {
                element.slideUp(duration).then(() => {
                    return resolve(element);
                }).catch((err) => {
                    return reject(err);
                });
            }
            if (element.style.opacity < 1) {
                element.slideDown(duration, displayTo).then(() => {
                    return resolve(element);
                }).catch((err) => {
                    return reject(err);
                });
            } else if (element.style.opacity > 0) {
                element.slideUp(duration).then(() => {
                    return resolve(element);
                }).catch((err) => {
                    return reject(err);
                });
            }
        } catch (e) {
            return reject(e);
        }
    })
};
// end function for slideToggle

// fade in function
HTMLElement.prototype.fadeIn = function(duration, display) {
    return new Promise((resolve, reject) => {
        try {
            var element = this;
            element.style.opacity = 0;
            var last = +new Date();
            var animate = function() {
                element.style.opacity = +element.style.opacity + (new Date() - last) / duration;
                last = +new Date();
                element.style.display = display && typeof display === 'string' ?
                    display :
                    'block';
                if (+element.style.opacity < 1) {
                    requestAnimationFrame && requestAnimationFrame(animate);
                } else {
                    window.cancelAnimationFrame(animate);
                    element.style.opacity = 1;
                }
            };
            animate();
            setTimeout(function() {
                return resolve(element);
            }, duration);
        } catch (e) {
            return reject(e);
        }
    })

};

// fade out function
HTMLElement.prototype.fadeOut = function(duration) {
    return new Promise((resolve, rejected) => {
        try {
            var element = this;
            element.style.opacity = 1;
            var last = +new Date();
            var animate = function() {
                element.style.opacity = +element.style.opacity - (new Date() - last) / duration;
                last = +new Date();
                if (+element.style.opacity < 0) {
                    window.cancelAnimationFrame(animate);
                    element.style.display = 'none';
                    element.style.opacity = 0;
                } else {
                    requestAnimationFrame && requestAnimationFrame(animate);
                }
            };
            animate();
            setTimeout(function() {
                return resolve(element);
            }, duration);
        } catch (e) {
            return rejected(e);
        }
    })
};
// end fade out function

// animating function
HTMLElement.prototype.animating = function(
    boxRotationKeyframes,
    boxRotationTiming
) {
    return new Promise((resolve, reject) => {
        try {
            this.animate(
                boxRotationKeyframes,
                boxRotationTiming
            ).onfinish = function() {
                return resolve(this);
            };
        } catch (e) {
            return reject(e);
        }

    })
};