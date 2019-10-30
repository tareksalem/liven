/*
==============================
@param Livenjs

Auther: Tarek Salem
Component module
==============================
 */
// dependencies
// import "./handlebars.js"
import Compiler from "./compiler.js";
import LivenHelpers from "./helpers.js";
import Observer from "./observer.js";

let componentObject = {};
class Component {
    constructor(props) {
            this._beforeOut = this.beforeOut || props.beforeOut || {};
            this._beforeOutFunction = async() => {
                return new Promise(async(resolved, rejected) => {
                    let beforeOut = this._beforeOut;
                    if (beforeOut.slideUp) {
                        if (this.self) {
                            await this.self.slideUp(beforeOut.slideUp.duration, beforeOut.slideUp.callback);
                            return resolved(this);
                        }
                    } else if (beforeOut.fadeOut) {
                        if (this.self) {
                            await this.self.fadeOut(beforeOut.fadeOut.duration, beforeOut.fadeOut.callback);
                            return resolved(this);
                        }
                    } else if (beforeOut.animate) {
                        if (this.self) {
                            let animation = await this.self.animate([beforeOut.animate.from, beforeOut.animate.to], beforeOut.animate.options);
                            if (beforeOut.animate.callback) {
                                animation.onfinish = beforeOut.animate.callback;
                            }
                            return resolved(this);
                        }
                    }
                })
            }
            this._rendered = false;
            this.autoRuns = [];
            this.componentPath = props.componentPath;
            this.childComponents = typeof props == "object" && Array.isArray(props.childComponents) ? props.childComponents : undefined;
            this.$store = {};
            this.childsObj = {};
            if (this.childComponents) {
                this.childComponents.forEach((comp) => {
                    this.childsObj[comp.uniqueName] = comp;
                })
            }
            this.data = {};
            this.props = props;
            if (props.type == "child") {
                this.parent = this.props.parent;
                this.parentString = props.parent;
            } else {
                this.parent = typeof this.props == "object" ? typeof this.props.parent == "string" ? document.querySelector(this.props.parent) : typeof this.props.parent == 'object' ? this.props.parent : undefined : undefined;
            }
            if (this.parent !== null || this.parent !== undefined) {
                try {
                    if (this.parent.hasAttribute('data')) {
                        try {
                            this.data = JSON.parse(this.parent.getAttribute("data"));
                            this.parent.removeAttribute("data");
                        } catch (e) {
                            LivenHelpers.logger({
                                type: "error",
                                error: e
                            });
                        }
                    }
                } catch (e) {
                    LivenHelpers.logger({
                        type: "error",
                        error: e
                    });
                }
            }
            if (this.props) {
                if (this.props.whileLoading) {
                    this.props.whileLoading(this.parent);
                } else if (this.whileLoading) {
                    this.whileLoading(this.parent);
                }
            }
            this.name = this.props && this.props.name ?
                this.props.name :
                LivenHelpers.generateRandomName();
            this.id = LivenHelpers.generateId();
            this.uniqueName = this.props && this.props.uniqueName ? this.props.uniqueName : LivenHelpers.generateRandomName();
            componentObject.liven.components.push(this);
        }
        // method to reset the component to the initial state
    reset() {
        if (this._originalClass) {
            // loop all properties of the class
            for (let prop in this) {
                if (prop) {
                    if ((prop !== "_originalClass")) {
                        delete this[prop];
                    }
                    if (this._originalClass.hasOwnProperty(prop)) {
                        this[prop] = this._originalClass[prop];
                    }
                }
            }
            this.$store = JSON.parse(this._originalClass._shadow$store);
        } else {
            this._originalClass = Object.assign({}, this);
        }
    }
    out() {
            // init before out callback
            if (typeof this.onOut == "function") {
                this.beforeOut();
            }
            if (typeof this.props.onOut == "function") {
                this.props.onOut();
            }
            // check if the there is animation before hiding the component
            if (this._beforeOut.animate || this._beforeOut.fadeOut || this._beforeOut.slideUp) {
                return new Promise(async(resolve, reject) => {
                    if (this.self) {
                        await this._beforeOutFunction().then(() => {
                            this.self.remove();
                        });
                        // init after out callback
                        if (typeof this.afterOut == "function") {
                            this.afterOut();
                        }
                        if (typeof this.props.afterOut == "function") {
                            this.props.afterOut();
                        }
                        return resolve(this);
                    } else {
                        return resolve(this);
                    }
                })

            } else {
                return new Promise(async(resolve, reject) => {
                    if (this.self) {
                        this.self.remove();
                        // this.reset();
                        // init after out callback
                        if (typeof this.afterOut == "function") {
                            this.afterOut();
                        }
                        if (typeof this.props.afterOut == "function") {
                            this.props.afterOut();
                        }
                        return resolve(this);
                    } else {
                        // init after out callback
                        if (typeof this.afterOut == "function") {
                            this.afterOut();
                        }
                        if (typeof this.props.afterOut == "function") {
                            this.props.afterOut();
                        }
                        // this.reset();
                        return resolve(this);
                    }
                })
            }
        }
        // 
    updateArr(path, type, val) {
            const resolvePath = (object, path, newVal) => path.split(/[\.\[\]\'\"]/).filter(p => p).reduce((o, p) => o[p] = newVal, object);
        }
        // o ? o[p] : defaultValue
    getDom() {
        let self = this;
        return new Promise((resolve, reject) => {
            if (this.self) {
                let elements = this.elementHistory.filter((obj) => {
                    return obj.shadowElement.getAttribute("elementName")
                });
                try {
                    elements.forEach(function(el, i) {
                        if (el.shadowElement.getAttribute('elementName')) {
                            if (el.shadowElement.getAttribute('elementName') === el.shadowElement.getAttribute('elementName')) {
                                var arr = [];
                                self.elementHistory.map(obj => {
                                    if (obj.shadowElement.getAttribute("elementName") == el.shadowElement.getAttribute("elementName")) {
                                        arr.push(obj.updated);
                                    }
                                })
                                if (arr.length == 1) {
                                    self[el.shadowElement.getAttribute("elementName")] = arr[0];
                                    return resolve();
                                } else if (arr.length > 1) {
                                    self[el.shadowElement.getAttribute("elementName")] = arr;
                                    return resolve();
                                } else {
                                    return resolve();
                                }
                            } else {
                                return resolve();
                            }
                        } else {
                            return resolve();
                        }
                    });
                } catch (e) {
                    return reject();
                }
                return resolve()
            } else {
                var interval = setInterval(() => {
                    var self = this;
                    if (this.self !== undefined) {
                        clearInterval(interval);
                        let elements = this.elementHistory.filter((obj) => {
                            return obj.shadowElement.getAttribute("elementName")
                        });
                        try {
                            elements.forEach(function(el, i) {
                                if (el.shadowElement.getAttribute('elementName')) {
                                    if (el.shadowElement.getAttribute('elementName') === el.shadowElement.getAttribute('elementName')) {
                                        var arr = [];
                                        self.elementHistory.map(obj => {
                                            if (obj.shadowElement.getAttribute("elementName") == el.shadowElement.getAttribute("elementName")) {
                                                arr.push(obj.updated);
                                            }
                                        })
                                        if (arr.length == 1) {
                                            self[el.shadowElement.getAttribute("elementName")] = arr[0];
                                            return resolve();
                                        } else if (arr.length > 1) {
                                            self[el.shadowElement.getAttribute("elementName")] = arr;
                                            return resolve();
                                        } else {
                                            return resolve();
                                        }
                                    } else {
                                        return resolve();
                                    }
                                } else {
                                    return resolve();
                                }
                            });
                        } catch (e) {
                            console.log(e)
                            return reject();
                        }
                        return resolve()
                    }
                }, 10);
            }
        });
    }

    async init(cb) {
        await this.out();
        this._shadow$store = JSON.stringify(this.$store);
        this.reset();
        // init on init function
        if (this.onInit) {
            this.onInit();
        }
        if (this.props.onInit) {
            this.props.onInit;
        }
        if (this.componentPath) {
            let response = await fetch(this.componentPath);
            let html = await response.text();
            this.html = html;
        } else if (typeof this.render == "function") {
            this.html = this.render()
        }
        // }
        var chComponent;
        var self = this;
        let methodsArr = [];
        this.autoRuns.map(fun => {
            fun = fun.bind(this);
            methodsArr.push(fun())
        });

        if (methodsArr.length > 0) {
            this.parent = typeof this.props == "object" ? typeof this.props.parent == "string" ? document.querySelector(this.props.parent) : typeof this.props.parent == 'object' ? this.props.parent : undefined : undefined;
            // wait all methods until done and then render html code
            Promise.all(methodsArr).then(() => {
                Compiler.prepareDom(this).then(() => {
                    Compiler.instantiateLoopComponents(this).then(() => {
                        if (this.onChildsAppended) {
                            return this.onChildsAppended()
                        } else if (this.props.onChildsAppended) {
                            return this.props.onChildsAppended()
                        }
                    });
                });
                LivenHelpers.inlineDomEvents.bind(this)()
            }).catch((e) => {
                LivenHelpers.logger({
                    type: "error",
                    error: e
                });
                if (this.errorLoading) {
                    return this.errorLoading(err);
                }
            });
        } else {
            Compiler.prepareDom(this).then(() => {
                Compiler.instantiateLoopComponents(this).then(() => {
                    if (this.onChildsAppended) {
                        return this.onChildsAppended()
                    } else if (this.props.onChildsAppended) {
                        return this.props.onChildsAppended()
                    }
                });
            });
            LivenHelpers.inlineDomEvents.bind(this)()
        }
        // }
    }
}
componentObject.Component = Component;
export default componentObject;