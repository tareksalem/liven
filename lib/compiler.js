/*
==============================
@param Livenjs

Auther: Tarek Salem
Compiler module
==============================
 */
// dependencies
import Handlebars from "handlebars";
import componentObject from "./component.js";
import LivenHelpers from "./helpers.js";
import Observer from "./observer.js";
import Swag from "./swag";
Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
});
Handlebars.registerHelper("L-if", function () {
    // let [v1, operator, v2, options] = arguments;
      let [conditional, options] = arguments;
      let context = this;
        function bootstrapper(conditional, context, key) {
            conditional = conditional.replace(/&amp;/g, '&');
            context = this;
            context = {...context, ...options.data.root};
            let str = ``
            Object.keys(context).map((key) => {
                str += `var ${`${[key]}`.replace(/[.,{}[\[\]\s]/g, "")} = ${LivenHelpers.toJSON(context[key])};\n`;
            })
            if(key) str += `var ${`${[key]}`} = ${LivenHelpers.toJSON(context)}`;
            str += `
                // console.log("eval is", eval(conditional))
                // if(conditional) {
                //     console.log(conditional)
                //     return true;
                // } else {
                //     return false
                // }
                return ${conditional}
            `
            //   console.log(this)
              let result = new Function(str)();
            //   console.log(result);
              if(result) {
                  return options.fn(this);
              } else {
                  return options.inverse(this);
              }
        }
    try {
        return bootstrapper(conditional, context);
    } catch(err) {
        let  key = `${err}`.split(" ")[1];
        return bootstrapper(conditional, context, key)
        // throw err;
    }
})
Handlebars.registerHelper("x", function(expression, options, r) {
  var result;
  // you can change the context, or merge it with options.data, options.hash
  var context = this;
  result = function () {
      try {
          let res = eval(this, expression);
          if(res) {
              return true;
          } else {
              return false;
          }
      } catch(err) {
        console.warn('•Expression: {{x \'' + expression + '\'}}\n•JS-Error: ', err, '\n•Context: ', context);
      }
  };
  return result.call(context)
});

Handlebars.registerHelper("xif", function(expression, options) {
    options = options || {};
  return Handlebars.helpers["x"].apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('url', function(context) {
    context = `${context}`;
    return context || "";
});
// Handlebars.registerHelper()
// Handlebars.registerPartial("partial", Handlebars.templates[])
Handlebars.registerHelper('component', (partial, options) => {
    const template = Handlebars.compile(partial, {strict:  false, compat: true})
    const html = template(options.data.root)
    return new Handlebars.SafeString(html)
  })

  Swag.registerHelpers(Handlebars);
// helpers({handlebars: Handlebars});

// define compiler object
const Compiler = {};

//  add element-id attribute to component elements
Compiler.addElementId = (componentElements) => {
        if (componentElements) {
            Array.from(componentElements.querySelectorAll("*")).forEach((elem) => {
                let elementId = LivenHelpers.generateId();
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
                                    let attributes = LivenHelpers.elementDataAttributes(parentElement.shadowElement);
                                    let options = childComponent.options || {};
                                    let props = {
                                        ...attributes,
                                        ...options,
                                        parent: parentElement.updated,
                                        uniqueId: parentElement.shadowElement.getAttribute("element-id")
                                    };
                                    let data = childComponent.inheritData = true ? component.$store : {};
                                    let newComponent = new childComponent.Component(props);
                                    newComponent.parentComponent = component;
                                    newComponent.init(data);
                                    childComponent.renderedComponents.push(newComponent);
                                    parentElement.shadowElement.setAttribute("rendered", true);
                                    // let cleanElem = LivenHelpers.removeAttributes(parentElement.updated);
                                    // parentElement.updated.replaceWith(cleanElem);
                                    // parentElement.updated =  cleanElem;
                                    return resolve()
                                }
                            }
                        } else {
                            return resolve()

                        }
                    })
                } else {
                    // console.log("s")
                }
            }

        })
    }
    // prepare DOM method
Compiler.prepareDom = async(self) => {
        // return promise
        return new Promise(async(resolve, reject) => {
            self._rendered = true;
            self.elementHistory = [];
            self.shadowElementHistory = [];
            self.stringDom = self.html;
            if(Array.isArray(self.partials)) {
                self.partials.forEach((partial) => {
                    let regex = new RegExp(`{{> ${partial.name}}}`, "gi");
                    regex = new RegExp('\{\{>(?:\\s+)?(' + partial.name + ')(?:\\s+)?\}\}')
                    self.stringDom = self.stringDom.replace(regex, partial.body);
                })
            }
            let allParsedElements = new DOMParser().parseFromString(self.stringDom, "text/html").documentElement.querySelector("body");
            // parse the string and convert it to real html elements
            let componentElements = allParsedElements.firstElementChild;
            let whileLoadings = allParsedElements.querySelectorAll("[while-loading]");
            Array.from(whileLoadings).forEach((whileLoading) => {
                self.parent.appendChild(whileLoading);
            })
            // add elements ids
            Compiler.addElementId(componentElements);
            let preCompiledObject = [];
            let compiledObject = [];
            componentElements = componentElements || document.createElement("div");
            self.stringDom = componentElements.outerHTML;
            self.preCompiledString = componentElements.outerHTML;
            let template = Handlebars.compile(self.stringDom, {
                strict: false,
                // noEscape: true,
                compat: true
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
                    let newId = LivenHelpers.generateId(i);
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
                    LivenHelpers.removeAttributes(elem.updated);
                    self.elementHistory.push({
                        original: elem.original,
                        shadowElement: shadowElement,
                        updated: elem.updated
                    });

                })
            } catch (e) {
                LivenHelpers.logger({
                    type: "error",
                    error: e
                });
            }
            // append the child components if there are
            LivenHelpers.resolveElementId(self)
            self.elementHistory.forEach((elementHisotry) => {
                if ((elementHisotry.shadowElement.getAttribute("A-if")) || (elementHisotry.shadowElement.getAttribute("A-not"))) {
                    try {
                        LivenHelpers.ifStatmentResolver(elementHisotry.updated, elementHisotry.shadowElement, self);
                    } catch (e) {
                        LivenHelpers.logger({
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
                    let data = childComp.inheritData = true ? self.$store : {};
                    childComp.props.parent = parent;
                    childComp.parent = parent;
                    childComp.init(data);
                });
            }
            // get the parent of component
            self.parent = typeof self.props == "object" ? typeof self.props.parent == "string" ? document.querySelector(self.props.parent) : typeof self.props.parent == 'object' ? self.props.parent : undefined : undefined;
            self.self = componentElement;
            if (self.style) {
                LivenHelpers.component.style(self, componentElement);
            }
            if (self.props) {
                //   helpers component
                LivenHelpers.component.style(self, componentElement);
                LivenHelpers.component.slideDown(self, componentElement);
                LivenHelpers.component.fadeIn(self, componentElement);
                LivenHelpers.component.animating(self, componentElement);
            }
            if (self.methods) {
                LivenHelpers.component.methods(self, componentElement);
            }
            // append the component to its parent
            if (self.parent) {
                self.parent.appendChild(componentElement);
            }
            LivenHelpers.component.livenDom(self);
            await self.getDom();
            if(typeof self.onload == "function") {
                await self.getDom();
                self.onload(self.parent);
            }
            else if (self.props && self.props.onload) {
                await self.getDom();
                self.props.onload(self.parent);
            }
            componentObject.liven.DOM.components[self.uniqueName] = self;
            if (self.type == "parent") {
                componentObject.liven.DOM.tree[self.uniqueName] = self;
            } else if (self.type == "child") {
                let parentName = typeof self.parentName ? self.parentName : "";
                let component = componentObject.liven.DOM.getComponentByUniqueName(parentName);
                if (component) {
                    component.childsObj[self.uniqueName] = self;
                    self.parentComponent = component;
                    componentObject.liven.DOM.components[component.uniqueName] = component;
                    componentObject.liven.DOM.tree[component.uniqueName] = component;
                }
            }
            self._proxy = new Observer(self.$store, self);
            self.$store = self._proxy.target;
            componentObject.liven.DOM.tree
            if (self.load) {
                self.getDom()
                let loadInterval = setInterval(() => {
                    if (document.body.contains(self.self)) {
                        let whileLoadings = self.parent.querySelectorAll("[while-loading]");
                        if(whileLoadings) {
                            Array.from(whileLoadings).forEach((whileLoading) => {
                                let timeout = whileLoading.getAttribute("timeout") || 0;
                                setTimeout(() => {
                                    whileLoading.replaceWith("")
                                }, timeout)
                            })
                        }
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