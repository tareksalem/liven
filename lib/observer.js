/*
=========================================================
@param Livenjs

Auther: Tarek Salem
Observer Module for data Model changes tracking
=========================================================
 */

// depenedencies
import Handlebars from 'handlebars';
import Compiler from './compiler.js';
import LivenHelpers from './helpers.js';
import {onChange, ObservableArray} from './onchange';
const deep_value = LivenHelpers.deep_value;
const deep_set = LivenHelpers.deep_set;

// observer class to handle arrays and object changes
class Observer {
  getWatchArrays () {
    this.watcherArrays = [];
    Array.from (this.component.elementHistory).map (obj => {
      if (obj.shadowElement.hasAttribute ('loop-name')) {
        this.watcherArrays.push (obj.shadowElement.getAttribute ('loop-name'));
      }
    });
  }
  constructor (object, component) {
    this.target = object;
    this.component = component;
    this.getWatchArrays ();
    const self = this;
    this.originalObject = JSON.stringify (this.target);
    this.observeArray ();
    this.target = onChange (this.target, (path, newVal, oldVal) => {
      if (path) {
        this.updatingEvents ({
          bforeUpdate: {
            object: JSON.parse (this.originalObject),
            event: {
              type: 'itemset',
              item: {
                newVal: newVal,
                oldVal: oldVal,
              },
            },
            newObject: this.target,
            path: path,
            target: deep_value (JSON.parse (this.originalObject), path),
          },
          afterUpdate: {
            event: {
              type: 'itemset',
              item: {
                newVal: newVal,
                oldVal: oldVal,
              },
            },
            object: this.target,
            path: path,
            target: deep_value (this.target, path),
            oldObject: JSON.parse (this.originalObject),
          },
        });
        let indexesNum = path.match (/\d+/g) !== null
          ? path.match (/\d+/g).map (Number)
          : [];
        let indexNum = indexesNum.reverse ()[0];
        let pathIndex = path.split ('.').reverse ().indexOf (`${indexNum}`);
        if (pathIndex !== -1) {
          let originalPath = path.split ('.').reverse ();
          originalPath.splice (0, pathIndex);
          originalPath = originalPath.reverse ().join ('.');
          let elems = this.component.elementHistory.filter (
            obj => obj.shadowElement.getAttribute ('key-loop') == originalPath
          );
          this.updateDeepElements (elems, originalPath, indexNum);
        }
        this.renderArray(this.target, path);
        this.update (this.target, path, newVal, oldVal);
        this.updateIfStatments (path, this.component);
      }
    });
  }
  // method to render array
  renderArray(target, path) {
    let arr = deep_value(target, path);
    // find the elements
    let parentElements = this.component.elementHistory.filter((obj) => obj.shadowElement.getAttribute("loop-name") == path);
    parentElements.forEach((parentElement) => {
          let data = {
      [path]: arr,
      // ...this.component.$store,
      self: this.component,
    };
    let temp = Handlebars.compile (parentElement.original.outerHTML, {
      strict: false,
      compat: true,
    });
    let element = new DOMParser ()
      .parseFromString (temp (data), 'text/html')
      .documentElement.querySelector ('body').firstElementChild;
    let shadowElement = element.cloneNode (true);
    LivenHelpers.removeAttributes (element);
    parentElement.updated.replaceWith (element);
    parentElement.shadowElement.replaceWith (shadowElement);
    parentElement.shadowElement = shadowElement;
    parentElement.updated = element;
    if (this.component.methods) {
      LivenHelpers.component.methods (
        this.component,
        this.component.self
      );
    }

    })
  }
  async updateIfStatments (path, component) {
    try {
      let elements = component.elementHistory.filter (
        obj => {
          
        return obj.shadowElement.getAttribute ('key-condition') == path
        });
      elements.forEach (element => {
        element.original.setAttribute("element-id", element.shadowElement.getAttribute("element-id"));
        let data = {
          self: this.component,
          ...this.target,
        };
        let temp = Handlebars.compile (element.original.outerHTML, {
          strict: false,
          compat: true
        });
        let compiledElement = new DOMParser ()
          .parseFromString (temp (data), 'text/html')
          .documentElement.querySelector ('body').firstElementChild;
          let shadowElement = compiledElement.cloneNode (true);
          element.shadowElement.replaceWith(shadowElement);
          element.shadowElement = shadowElement;
          let updatedElem = LivenHelpers.removeAttributes(compiledElement);
          element.updated.replaceWith(updatedElem);
          element.updated = updatedElem;
        LivenHelpers.ifStatmentResolver (
          element.updated,
          element.shadowElement,
          component
        );
      });
      // if (this.component.methods) {
      //   LivenHelpers.component.methods (this.component, this.component.self);
      // }
      // // console.log(sefl.component)
      // LivenHelpers.inlineDomEvents.bind (this.component) ();
      await this.component.getDom ();
    } catch (e) {
      // console.log(e)
      LivenHelpers.logger ({
        type: 'error',
        error: e,
      });
    }
  }
  async updateDeepElements (elements, path, indexNum) {
    const self = this;
    let target = deep_value (this.target, path);
    elements.forEach (element => {
      let originalElement = element.original;
      let shadowElement = element.shadowElement;
      let updated = element.updated;
      // let elementKeyName = shadowElement.getAttribute ('key-name');
      // let elementIndex = shadowElement.getAttribute ('key-index');
      let keyName = originalElement.getAttribute ('key-name');
      let keyIndex = originalElement.getAttribute ('key-index');
      keyIndex = keyIndex.replace (/[{}]/g, '');
      keyIndex.replace (/@/gi, '');
      let keyLoop = originalElement.getAttribute ('key-loop');
      // console.log([keyLoop], [keyIndex], [keyName])
      let data = {
        self: this.component,
        [keyName]: target,
        [keyIndex]: indexNum,
        [keyLoop]: keyLoop,
      }
      // if (elementKeyName) {
      //   let data = {
      //     self: this.component,
      //     [elementKeyName]: target,
      //     [elementIndex]: indexNum,
      //     ...this.target,
      //   };
        let temp = Handlebars.compile (originalElement.outerHTML, {
          strict: false,
        });
        let compiledElement = new DOMParser ()
          .parseFromString (temp (data), 'text/html')
          .documentElement.querySelector ('body').firstElementChild;
      //     console.log(compiledElement)
      //   compiledElement.setAttribute (
      //     'key-loop',
      //     shadowElement.getAttribute ('key-loop')
      //   );
      //   compiledElement.setAttribute (
      //     'key-index',
      //     shadowElement.getAttribute ('key-index')
      //   );
      //   compiledElement.setAttribute (
      //     'key-name',
      //     shadowElement.getAttribute ('key-name')
      //   );
        element.shadowElement = compiledElement.cloneNode (true);
        element.updated.replaceWith (compiledElement);
        element.updated = compiledElement;
        LivenHelpers.removeAttributes (element.updated);
      // }
    });
    if (this.component.methods) {
      LivenHelpers.component.methods (this.component, this.component.self);
    }
    LivenHelpers.inlineDomEvents.bind (self.component) ();
    await this.component.getDom ();
  }
  async update (target, propName, newVal, oldVal) {
    const self = this;
    let  templatedPropName = `{{${propName}}}`
    // console.log(templatedPropName)
    let xpaths = [
      `//*[contains(text(),'{{${propName}}}')]`,
      `//*[contains(text(),'{{@root.${propName}}}')]`,
      `//*[@*[contains(., '{{${propName}}}')]]`,
      `//*[@*[contains(., '{{@root.${propName}}}')]]`,
      `//*[@${propName}="${propName}"]`
    ];
    let compiledElement = new DOMParser ()
      .parseFromString (self.component.stringDom, 'text/html')
      .documentElement.querySelector ('body').firstElementChild;
    let xpathElements = LivenHelpers.getElementsByXPath (
      xpaths,
      self.component.preCompiledElement
    ).length > 0
      ? LivenHelpers.getElementsByXPath (
          xpaths,
          self.component.preCompiledElement
        )
      : LivenHelpers.getElementsByXPath (xpaths, compiledElement);
    if (xpathElements) {
      Array.from (self.component.elementHistory).map ((obj, i) => {
        let matched = xpathElements.find (el => {
          if (obj.original == el || obj.shadowElement == el) {
            return el;
          }
        });
        if (matched) {
          let data;
          let keyName;
          let keyIndex;
          let index;
          if (obj.shadowElement.hasAttribute ('key-loop')) {
            let keyLoop = obj.shadowElement.getAttribute ('key-loop');
            data = deep_value (this.target, keyLoop);
            data = {
              ...data,
            };
            keyName = obj.shadowElement.getAttribute ('key-name');
            keyIndex = obj.shadowElement.getAttribute ('key-index');
            index = obj.shadowElement.getAttribute ('index');
          }
          let temp = Handlebars.compile (obj.original.outerHTML, {
            strict: false,
          });
          let element = new DOMParser ()
            .parseFromString (
              temp ({
                self: this.component,
                ...target,
                [keyName]: data,
                [keyIndex]: index,
              }),
              'text/html'
            )
            .documentElement.querySelector ('body').firstElementChild;
          obj.updated.replaceWith (element);
          obj.shadowElement = element.cloneNode (true);
          obj.updated = element;
          LivenHelpers.removeAttributes (obj.updated);
          if (this.component.methods) {
            LivenHelpers.component.methods (this.component, this.component.self);
          }
          LivenHelpers.inlineDomEvents.bind (self.component) ();
        }
      });
      Compiler.instantiateLoopComponents (this.component).then (() => {
        if (this.component.onChildsAppended) {
          return this.component.onChildsAppended ();
        } else if (this.component.props.onChildsAppended) {
          return this.component.props.onChildsAppended ();
        }
      });
      if (this.component.methods) {
        LivenHelpers.component.methods (this.component, this.component.self);
      }
      await this.component.getDom ();
    }
  }
  async updatingEvents (props) {
    // console.log(props);
    this.getWatchArrays ();
    let afterUpdate = props.afterUpdate;
    let beforeUpdate = props.beforeUpdate;
    let component = this.component;
    if (component.beforeUpdate) {
      component.beforeUpdate (beforeUpdate);
    }
    if (component.props.beforeUpdate) {
      component.props.beforeUpdate (beforeUpdate);
    }
    if (component.afterUpdate) {
      component.afterUpdate (afterUpdate);
    }
    if (component.props.afterUpdate) {
      component.props.afterUpdate (afterUpdate);
    }
    this.originalObject = JSON.stringify (this.target);
    await this.component.getDom ();
  }
  async observeArray () {
    const self = this;
    this.watcherArrays.forEach (async path => {
      let array = deep_value (this.target, path);
      let observedArr = new ObservableArray (deep_value (this.target, path));
      deep_set (this.target, path, observedArr);
      observedArr.addEventListener ('itemadded', async e => {
        this.updatingEvents ({
          bforeUpdate: {
            object: JSON.parse (this.originalObject),
            event: e,
            newObject: this.target,
            path: path,
            target: deep_value (JSON.parse (this.originalObject), path),
          },
          afterUpdate: {
            event: e,
            object: this.target,
            path: path,
            target: deep_value (this.target, path),
            oldObject: JSON.parse (this.originalObject),
          },
        });
        let array = deep_value (this.target, path);
        this.updateIfStatments (path, this.component);
        let xpaths = [
          `//*[contains(text(),'${path}')]`,
          `//*[@*[contains(., '${path}')]]`,
        ];
        let elements = LivenHelpers.getElementsByXPath (
          xpaths,
          self.component.preCompiledElement
        );
        let parentElements = elements.filter (
          element => element.getAttribute ('loop-name') != null
        );
        parentElements = parentElements.filter (
          (element, i) => parentElements.indexOf (element) == i
        );
        parentElements.forEach (parentElem => {
          let matchedElement = self.component.elementHistory.find (
            obj => obj.original == parentElem
          );
          if (matchedElement) {
            let childElements = matchedElement.original.querySelectorAll (
              `[key-loop]`
            );
            try {
              Array.from (childElements).forEach (async childElement => {
                childElement.setAttribute (
                  'element-id',
                  LivenHelpers.generateId ()
                );
                let keyName = childElement.getAttribute ('key-name');
                let keyIndex = childElement.getAttribute ('key-index');
                keyIndex = keyIndex.replace (/[{}]/g, '');
                keyIndex.replace (/@/gi, '');
                let keyLoop = childElement.getAttribute ('key-loop');
                let data = {
                  self: this.component,
                  [keyName]: e.item,
                  [keyIndex]: e.index,
                  [keyLoop]: `${parentElem.getAttribute ('loop-name')}.${e.index}`,
                  // "key-name": e.item,
                  // "key-index": e.index,
                  // "key-loop": `${parentElem.getAttribute("loop-name")}.${e.index}`,
                  ...this.target,
                };
                // console.log(data)
                let temp = Handlebars.compile (childElement.outerHTML, {
                  strict: false,
                  compat: true,
                });
                let element = new DOMParser ()
                  .parseFromString (temp (data), 'text/html')
                  .documentElement.querySelector ('body').firstElementChild;
                let shadowElement = element.cloneNode (true);
                LivenHelpers.removeAttributes (element);
                matchedElement.updated.appendChild (element);
                matchedElement.shadowElement.appendChild (shadowElement);
                let elementHistory = {
                  original: childElement,
                  updated: element,
                  shadowElement: shadowElement,
                };
                self.component.elementHistory.push (elementHistory);
                Array.from (
                  elementHistory.shadowElement.querySelectorAll ('*')
                ).forEach (element => {
                  let matchedElement = Array.from (
                    elementHistory.original.querySelectorAll ('*')
                  ).find (
                    elem =>
                      elem.getAttribute ('element-id') ==
                      element.getAttribute ('element-id')
                  );
                  if (matchedElement) {
                    let matched = Array.from (
                      elementHistory.updated.querySelectorAll ('*')
                    ).find (
                      elem =>
                        elem.getAttribute ('element-id') ==
                        matchedElement.getAttribute ('element-id')
                    );
                    if (matched) {
                      let elementObject = {
                        original: matchedElement,
                        shadowElement: element,
                        updated: matched,
                      };
                      let newId = LivenHelpers.generateId ();
                      elementObject.original.setAttribute ('element-id', newId);
                      elementObject.shadowElement.setAttribute (
                        'element-id',
                        newId
                      );
                      elementObject.updated.setAttribute ('element-id', newId);
                      LivenHelpers.removeAttributes (elementObject.updated);
                      self.component.elementHistory.push (elementObject);
                    }
                  }
                });
              });
            } catch (e) {
              LivenHelpers.logger ({
                type: 'error',
                error: e,
              });
            }
          }
        });
        if (this.component.methods) {
          LivenHelpers.component.methods (this.component, this.component.self);
        }
        await self.component.getDom.bind (this.component) ();
        Compiler.instantiateLoopComponents (this.component).then (() => {
          if (this.component.onChildsAppended) {
            return this.component.onChildsAppended ();
          } else if (this.component.props.onChildsAppended) {
            return this.component.props.onChildsAppended ();
          }
        });
      });
      observedArr.addEventListener ('itemset', async e => {
        // console.log(e);
        this.updatingEvents ({
          bforeUpdate: {
            object: JSON.parse (this.originalObject),
            event: e,
            newObject: this.target,
            path: path,
            target: deep_value (JSON.parse (this.originalObject), path),
          },
          afterUpdate: {
            event: e,
            object: this.target,
            path: path,
            target: deep_value (this.target, path),
            oldObject: JSON.parse (this.originalObject),
          },
        });
        this.updateIfStatments (path, this.component);
        let xpaths = [
          `//*[contains(text(),'${path}')]`,
          `//*[@*[contains(., '${path}')]]`,
        ];
        let elements = LivenHelpers.getElementsByXPath (
          xpaths,
          self.component.preCompiledElement
        );
        let parentElements = elements.filter (
          element => element.getAttribute ('loop-name') != null
        );
        parentElements = parentElements.filter (
          (element, i) => parentElements.indexOf (element) == i
        );
        parentElements.forEach (parentElement => {
          let parentElementId = parentElement.getAttribute ('element-id');
          let historyParentElement = self.component.elementHistory.find (
            obj => obj.original.getAttribute ('element-id') == parentElementId
          );
          if (historyParentElement) {
            let childElements = historyParentElement.shadowElement.querySelectorAll (
              `[key-index=${e.index}]`
            );
            if (childElements) {
              Array.from (childElements).forEach (childElement => {
                let childElementHistory = self.component.elementHistory.find (
                  obj => obj.shadowElement == childElement
                );
                if (childElementHistory) {
                  let keyName = childElementHistory.original.getAttribute (
                    'key-name'
                  );
                  let keyIndex = childElementHistory.original.getAttribute (
                    'key-index'
                  );
                  keyLoop = childElementHistory.original.getAttribute (
                    'key-loop'
                  );
                  let temp = Handlebars.compile (
                    childElementHistory.original.outerHTML,
                    {
                      strict: false,
                    }
                  );
                  let data = {
                    self: this.component,
                    [keyName]: e.item,
                    [keyIndex]: e.index,
                    [keyLoop]: `${historyParentElement.shadowElement.getAttribute ('loop-name')}.${e.index}`,
                    ...this.target,
                  };
                  let element = new DOMParser ()
                    .parseFromString (temp (data), 'text/html')
                    .documentElement.querySelector ('body').firstElementChild;
                  LivenHelpers.removeAttributes (element);
                  childElementHistory.updated.replaceWith (element);
                  childElementHistory.updated = element;
                }
              });
            }
          }
        });
        await this.component.getDom ();
        Compiler.instantiateLoopComponents (this.component).then (() => {
          if (this.component.onChildsAppended) {
            return this.component.onChildsAppended ();
          } else if (this.component.props.onChildsAppended) {
            return this.component.props.onChildsAppended ();
          }
        });
      });
      observedArr.arraySetListener ('arrayset', async e => {
        console.log(e);
        this.updatingEvents ({
          bforeUpdate: {
            object: JSON.parse (this.originalObject),
            event: e,
            newObject: this.target,
            path: path,
            target: deep_value (JSON.parse (this.originalObject), path),
          },
          afterUpdate: {
            event: e,
            object: this.target,
            path: path,
            target: deep_value (this.target, path),
            oldObject: JSON.parse (this.originalObject),
          },
        });
        if (e.childrenCountArray.length == e.originalArray.length) {
          let array = deep_value (this.target, path);
          for (let i = e.childrenCountArray.length - 1; i >= 0; i--) {
            this.updateIfStatments (path, this.component);
            let xpaths = [
              `//*[contains(text(),'${path}')]`,
              `//*[@*[contains(., '${path}')]]`,
            ];
            let elements = LivenHelpers.getElementsByXPath (
              xpaths,
              self.component.preCompiledElement
            );
            let parentElements = elements.filter (
              element => element.getAttribute ('loop-name') != null
            );
            parentElements = parentElements.filter (
              (element, i) => parentElements.indexOf (element) == i
            );
            parentElements.forEach (parentElement => {
              let parentElementId = parentElement.getAttribute ('element-id');
              let historyParentElement = self.component.elementHistory.find (
                obj =>
                  obj.original.getAttribute ('element-id') == parentElementId
              );
              if (historyParentElement) {
                let childElements = historyParentElement.shadowElement.querySelectorAll (
                  `[key-loop]`
                );
                childElements = Array.from (childElements).filter (element => {
                  return element.getAttribute ('key-loop') == `${path}.${i}`;
                });
                Array.from (childElements).forEach (childElement => {
                  if (childElement) {
                    let childElementHistory = self.component.elementHistory.find (
                      obj =>
                        obj.shadowElement.getAttribute ('element-id') ==
                        childElement.getAttribute ('element-id')
                    );
                    if (childElementHistory) {
                      let elementHistoryIndex = self.component.elementHistory.findIndex (
                        obj => obj == childElementHistory
                      );
                      childElementHistory.updated.remove ();
                      if (elementHistoryIndex > -1) {
                        self.component.elementHistory.splice (
                          elementHistoryIndex,
                          1
                        );
                      }
                    }
                  }
                });
              }
            });
          }
          await this.component.getDom ();
          Compiler.instantiateLoopComponents (this.component).then (() => {
            if (this.component.onChildsAppended) {
              return this.component.onChildsAppended ();
            } else if (this.component.props.onChildsAppended) {
              return this.component.props.onChildsAppended ();
            }
          });
        } else {
          let array = deep_value (this.target, path);
          for (let i = array.length; i >= e.index; i--) {
            this.updateIfStatments (path, this.component);
            let xpaths = [
              `//*[contains(text(),'${path}')]`,
              `//*[@*[contains(., '${path}')]]`,
            ];
            let elements = LivenHelpers.getElementsByXPath (
              xpaths,
              self.component.preCompiledElement
            );
            let parentElements = elements.filter (
              element => element.getAttribute ('loop-name') != null
            );
            parentElements = parentElements.filter (
              (element, i) => parentElements.indexOf (element) == i
            );
            parentElements.forEach (parentElement => {
              let parentElementId = parentElement.getAttribute ('element-id');
              let historyParentElement = self.component.elementHistory.find (
                obj =>
                  obj.original.getAttribute ('element-id') == parentElementId
              );
              if (historyParentElement) {
                let childElements = historyParentElement.shadowElement.querySelectorAll (
                  `[key-loop]`
                );
                childElements = Array.from (childElements).filter (element => {
                  return element.getAttribute ('key-loop') == `${path}.${i}`;
                });
                Array.from (childElements).forEach (childElement => {
                  if (childElement) {
                    let childElementHistory = self.component.elementHistory.find (
                      obj =>
                        obj.shadowElement.getAttribute ('element-id') ==
                        childElement.getAttribute ('element-id')
                    );
                    if (childElementHistory) {
                      let elementHistoryIndex = self.component.elementHistory.findIndex (
                        obj => obj == childElementHistory
                      );
                      childElementHistory.updated.remove ();
                      if (elementHistoryIndex > -1) {
                        self.component.elementHistory.splice (
                          elementHistoryIndex,
                          1
                        );
                      }
                    }
                  }
                });
              }
            });
          }
          await this.component.getDom ();
          Compiler.instantiateLoopComponents (this.component).then (() => {
            if (this.component.onChildsAppended) {
              return this.component.onChildsAppended ();
            } else if (this.component.props.onChildsAppended) {
              return this.component.props.onChildsAppended ();
            }
          });
        }
      });
      observedArr.addEventListener ('itemremoved', async e => {
        this.updatingEvents ({
          bforeUpdate: {
            object: JSON.parse (this.originalObject),
            event: e,
            newObject: this.target,
            path: path,
            target: deep_value (JSON.parse (this.originalObject), path),
          },
          afterUpdate: {
            event: e,
            object: this.target,
            path: path,
            target: deep_value (this.target, path),
            oldObject: JSON.parse (this.originalObject),
          },
        });
        this.updateIfStatments (path, this.component);
        // let xpaths = [`//*[contains(text(),'${path}')]`, `//*[@*[contains(., '${path}')]]`]
        let parentElements = this.component.elementHistory.filter (
          obj => obj.original.getAttribute ('loop-name') == path
        );
        parentElements.forEach (parentElement => {
          let parentElementId = parentElement.shadowElement.getAttribute (
            'element-id'
          );
          let historyParentElement = self.component.elementHistory.find (
            obj => obj.original.getAttribute ('element-id') == parentElementId
          );
          if (historyParentElement) {
            let childElements = historyParentElement.shadowElement.querySelectorAll (
              `[key-loop]`
            );
            childElements = Array.from (childElements).filter (element => {
              return element.getAttribute ('key-loop') == `${path}.${e.index}`;
            });
            Array.from (childElements).forEach ((childElement, i) => {
              if (childElement) {
                let childElementHistory = self.component.elementHistory.find (
                  obj =>
                    obj.shadowElement.getAttribute ('element-id') ==
                    childElement.getAttribute ('element-id')
                );
                if (childElementHistory) {
                  let elementHistoryIndex = self.component.elementHistory.findIndex (
                    obj => obj == childElementHistory
                  );
                  childElementHistory.updated.remove ();
                  childElement.remove ();
                  if (elementHistoryIndex > -1) {
                    self.component.elementHistory.splice (
                      elementHistoryIndex,
                      1
                    );
                  }
                }
              }
            });
            let arr = deep_value (this.target, path);
            Array.from (arr).map ((index, i) => {
              let sameElements = Array.from (
                historyParentElement.shadowElement.querySelectorAll (
                  '[key-loop]'
                )
              ).filter (
                elem => elem.getAttribute ('key-loop') == `${path}.${i + 1}`
              );
              if (sameElements.length > 0) {
                sameElements.forEach (elem => {
                  elem.setAttribute ('key-loop', `${path}.${i}`);
                  // elem.setAttribute("key-index", i);
                });
              }
            });
            let data = {
              [path]: e.array,
              // ...this.component.$store,
              self: this.component,
            };
            let temp = Handlebars.compile (parentElement.original.outerHTML, {
              strict: false,
              compat: true,
            });
            let element = new DOMParser ()
              .parseFromString (temp (data), 'text/html')
              .documentElement.querySelector ('body').firstElementChild;
            let shadowElement = element.cloneNode (true);
            LivenHelpers.removeAttributes (element);
            let newChildElements = historyParentElement.shadowElement.querySelectorAll (
              `[key-loop]`
            );
            parentElement.updated.replaceWith (element);
            parentElement.shadowElement.replaceWith (shadowElement);
            parentElement.shadowElement = shadowElement;
            parentElement.updated = element;
            if (this.component.methods) {
              LivenHelpers.component.methods (
                this.component,
                this.component.self
              );
            }
          }
        });
        await this.component.getDom ();
        Compiler.instantiateLoopComponents (this.component).then (() => {
          if (this.component.onChildsAppended) {
            return this.component.onChildsAppended ();
          } else if (this.component.props.onChildsAppended) {
            return this.component.props.onChildsAppended ();
          }
        });
      });
    });
  }
}
export default Observer;
