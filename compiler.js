/*
==============================
@param Activejs

Auther: Tarek Salem
Compiler module
==============================
 */
// dependencies
import ActiveHelpers from "./helpers.js";
import Observer from "./observer.js";
import componentObject from "./component.js";
// define compiler object
const Compiler = {};

//  add element-id attribute to component elements
Compiler.addElementId = (componentElements) => {
    if (componentElements) {
        Array.from(componentElements.querySelectorAll("*")).forEach((elem) => {
            let elementId = ActiveHelpers.generateId();
            elem.setAttribute("element-id", elementId);
        })
    }
}
// method to parse pre compiled html
Compiler.preCompiling = (self) => {
    let preCompiledElement = document.createElement("div");
    preCompiledElement.innerHTML = self.preCompiledString;
    self.preCompiledElement = preCompiledElement.firstElementChild;
    var containerElem = document.createElement("div");
    containerElem.innerHTML = self.stringDom;
    var componentElement = containerElem.firstElementChild;
    return componentElement;
}

// method to instantiate looped components
Compiler.instantiateLoopComponents = (component) => {
    // return promise
    return new Promise((resolve, reject) => {
        // check if the component has child loop components
        if (component.props.loopedComponents) {
            let componentsParents = Array.from(component.elementHistory).filter((obj) =>
                obj.shadowElement.getAttribute("type") == "component"
            );
            if (componentsParents.length > 0) {
                componentsParents.forEach((parentElement) => {
                    if (!parentElement.shadowElement.getAttribute("rendered")) {
                        let componentName = parentElement.shadowElement.getAttribute("componentName");
                        if (componentName) {
                            // find the component
                            let childComponent = component.props.loopedComponents.find(obj => obj.name == componentName);
                            if (childComponent) {
                                childComponent.renderedComponents = childComponent.renderedComponents || [];
                                let attributes = ActiveHelpers.elementAttributes(parentElement.shadowElement);
                                let options = childComponent.options || {};
                                let props = {
                                    ...attributes,
                                    ...options,
                                    parent: parentElement.updated,
                                    uniqueId: parentElement.shadowElement.getAttribute("element-id")
                                };
                                let newComponent = new childComponent.Component(props);
                                newComponent.init();
                                childComponent.renderedComponents.push(newComponent);
                                parentElement.shadowElement.setAttribute("rendered", true);
                                return resolve()
                            }
                        }
                    } else {
                        return resolve()

                    }
                })
            } else {
                console.log("s")
            }
        }

    })
}
// prepare DOM method
Compiler.prepareDom = async (self) => {
    // return promise
    return new Promise(async (resolve, reject) => {
        self._rendered = true;
        self.elementHistory = [];
        self.shadowElementHistory = [];
        self.stringDom = self.html;
        // parse the string and convert it to real html elements
        let componentElements = new DOMParser().parseFromString(self.stringDom, "text/html").documentElement.querySelector("body").firstElementChild;
        // add elements ids
        Compiler.addElementId(componentElements);
        let preCompiledObject = [];
        let compiledObject = [];
        componentElements = componentElements || document.createElement("div");
        self.stringDom = componentElements.outerHTML;
        self.preCompiledString = componentElements.outerHTML;
        let template = window.Handlebars.compile(self.stringDom, {
            strict: false,
            noEscape: false
        });
        let targ = self.$store;
        self.stringDom = template({
            self: self,
            ...targ
        });
        let allElements = [];
        // method to prepare virtual pre compiled component
        let componentElement = Compiler.preCompiling(self);
        Array.from(self.preCompiledElement.querySelectorAll("*")).map(element => preCompiledObject.push({
            elem: element
        }));
        Array.from(componentElement.querySelectorAll("*")).map((element) => {
            compiledObject.push({
                elem: element
            });
        })
        compiledObject.forEach((compiledElement) => {
            let preCompiledElement = preCompiledObject.find(obj => obj.elem.getAttribute("element-id") == compiledElement.elem.getAttribute("element-id"));
            if (preCompiledElement) {
                allElements.push({
                    original: preCompiledElement.elem,
                    updated: compiledElement.elem
                })
            }
        })
        allElements.forEach((obj, i) => {
            let secondElement = allElements.filter(object => object.updated.getAttribute("element-id") == obj.updated.getAttribute("element-id"));
            if (secondElement.length > 1) {
                let newId = ActiveHelpers.generateId(i);
                obj.updated.setAttribute("element-id", newId);
                obj.original.setAttribute("element-id", newId);
            }
        })

        try {
            allElements.map((elem, i) => {
                let textContent = elem.updated.textContent;
                let splitedTextContent = textContent.split(" ");
                elem.updated.textNodes = splitedTextContent;
                let textContentSecond = elem.original.textContent;
                let splitedTextContentSecond = textContentSecond.split(" ");
                elem.original.textNodes = splitedTextContentSecond;
                let shadowElement = elem.updated.cloneNode(true);
                ActiveHelpers.removeAttributes(elem.updated);
                self.elementHistory.push({
                    original: elem.original,
                    shadowElement: shadowElement,
                    updated: elem.updated
                });

            })
        } catch (e) {
            ActiveHelpers.logger({
                type: "error",
                error: e
            });
        }
        // append the child components if there are
        ActiveHelpers.resolveElementId(self)
        self.elementHistory.forEach((elementHisotry) => {
            if ((elementHisotry.shadowElement.getAttribute("A-if")) || (elementHisotry.shadowElement.getAttribute("A-not"))) {
                try {
                    ActiveHelpers.ifStatmentResolver(elementHisotry.updated, elementHisotry.shadowElement, self);
                } catch (e) {
                    ActiveHelpers.logger({
                        type: "error",
                        error: e
                    });
                }
            }
        })
        if (self.childComponents) {
            self.childs = {};
            self.childComponents.forEach((childComp) => {
                let parent = componentElement.querySelector(childComp.parentString);
                childComp.props.parent = parent;
                childComp.parent = parent;
                childComp.init();
            });
        }
        // get the parent of component
        self.parent = typeof self.props == "object" ? typeof self.props.parent == "string" ? document.querySelector(self.props.parent) : typeof self.props.parent == 'object' ? self.props.parent : undefined : undefined;
        self.self = componentElement;
        if (self.style) {
            ActiveHelpers.component.style(self, componentElement);
        }
        if (self.props) {
            //   helpers component
            ActiveHelpers.component.style(self, componentElement);
            ActiveHelpers.component.slideDown(self, componentElement);
            ActiveHelpers.component.fadeIn(self, componentElement);
            ActiveHelpers.component.animating(self, componentElement);
        }
        if (self.methods) {
            ActiveHelpers.component.methods(self, componentElement);
        }
        // append the component to its parent
        if (self.parent) {
            self.parent.appendChild(componentElement);
        }
        ActiveHelpers.component.activeDom(self);
        await self.getDom();
        if (self.props && self.props.onload) {
            await self.getDom();
            self.props.onload(self.parent);
        }
        componentObject.active.DOM.components[self.uniqueName] = self;
        if (self.type == "parent") {
            componentObject.active.DOM.tree[self.uniqueName] = self;
        } else if (self.type == "child") {
            let parentName = typeof self.parentName ? self.parentName : "";
            let component = componentObject.active.DOM.getComponentByUniqueName(parentName);
            if (component) {
                component.childsObj[self.uniqueName] = self;
                self.parentComponent = component;
                componentObject.active.DOM.components[component.uniqueName] = component;
                componentObject.active.DOM.tree[component.uniqueName] = component;
            }
        }
        self._proxy = new Observer(self.$store, self);
        self.$store = self._proxy.target;
        componentObject.active.DOM.tree
        if (self.load) {
            self.getDom()
            let loadInterval = setInterval(() => {
                if (document.body.contains(self.self)) {
                    self.load();
                    clearInterval(loadInterval);
                    return resolve();
                }
            }, 10)
        }
    })
}
//  export compiler

export default Compiler;