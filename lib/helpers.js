/*
==============================
@param Activejs

Author: Tarek Salem
helper module
==============================
 */
// dependencies
import {
    Active
} from "./Active.js";
const ActiveHelpers = {};
ActiveHelpers.component = {};

// function to inherent elements to the class
ActiveHelpers.component.inherentElements = (self, componentElement) => {
        var allElements = self.self.querySelectorAll('*');
        var elem = componentElement.querySelectorAll(`[expName]`);
        allElements.forEach(function(el, i) {
            // component[el.getAttribute("expName")] = el;
            if (el.getAttribute('expName')) {
                if (el.getAttribute('expName') === el.getAttribute('expName')) {
                    var arr = [];
                    elem.forEach(function(it, x) {
                        if (
                            it.getAttribute('expName') === el.getAttribute('expName')
                        ) {
                            var attr = el.getAttribute('expName');
                            arr.push(it);
                            if (arr.length === 1) {
                                self[attr] = arr[0];
                            } else if (arr.length > 1) {
                                self[attr] = arr;
                            }
                        }
                    });
                }
            }
        });
    }
    // fade in the component
ActiveHelpers.component.fadeIn = (self, componentElement) => {
    if (self.props.fadeIn) {
        if (!self.props.fadeIn.cb) {
            componentElement.fadeIn(self.props.fadeIn.duration);
        } else if (self.props.fadeIn.cb) {
            componentElement.fadeIn(self.props.fadeIn.duration, self.props.fadeIn.cb());
        }
    }
}

// animate the component
ActiveHelpers.component.animating = (self, componentElement) => {
    if (self.props.animate) {
        componentElement.animating(
            self.props.animate.animations,
            self.props.animate.props,
            self.props.animate.callback ? self.props.animate.callback : null
        );
    }
}

// slide down the component
ActiveHelpers.component.slideDown = (self, componentElement) => {
    if (self.props.slideDown) {
        if (!self.props.slideDown.cb) {
            componentElement.slideDown(self.props.slideDown.duration);
        } else if (self.props.slideDown.cb) {
            componentElement.slideDown(
                self.props.slideDown.duration,
                self.props.slideDown.cb()
            );
        }
    }
}

// add the style to the component
ActiveHelpers.component.style = (self, componentElement) => {
    if (self.props.style) {
        var style = self.props.style;
        Object.keys(style).forEach(function(el) {
            if (el == 'component') {
                var cssElement = componentElement;
                Object.keys(style[el]).forEach(function(objStyle) {
                    self.componentElement.style[objStyle] = style[el][objStyle];
                });
            } else if (el == 'parent') {
                let cssElement = self.parent;
                Object.keys(style[el]).forEach(function(objStyle) {
                    cssElement.style[objStyle] = style[el][objStyle];
                });
            } else {
                let matchElements = componentElement.querySelectorAll(el)
                let cssElements = [];
                Array.from(matchElements).map((element) => {
                    let matchedElement = self.elementHistory.find(obj => obj.updated == element);
                    if (matchedElement) {
                        cssElements.push(matchedElement);
                    }
                })
                cssElements.forEach(function(cssElement) {
                    Object.keys(style[el]).forEach(function(objStyle) {
                        cssElement.original.style[objStyle] = style[el][objStyle];
                        cssElement.shadowElement.style[objStyle] = style[el][objStyle];
                        cssElement.updated.style[objStyle] = style[el][objStyle];
                    });
                });
            }
        });
    }
}

// generateRandomName
ActiveHelpers.generateRandomName = () => {
    var NumberOfWords = 28;

    var words = new BuildArray(NumberOfWords);

    // Use the following variables to
    // define your random words:
    words[1] = 'escapology';
    words[2] = 'brightwork';
    words[3] = 'verkrampte';
    words[4] = 'protectrix';
    words[5] = 'nudibranch';
    words[6] = 'grandchild';
    words[7] = 'newfangled';
    words[8] = 'flugelhorn';
    words[9] = 'mythologer';
    words[10] = 'pluperfect';
    words[11] = 'jellygraph';
    words[12] = 'quickthorn';
    words[13] = 'rottweiler';
    words[14] = 'technician';
    words[15] = 'cowpuncher';
    words[16] = 'middlebrow';
    words[17] = 'jackhammer';
    words[18] = 'triphthong';
    words[19] = 'wunderkind';
    words[20] = 'dazzlement';
    words[21] = 'jabberwock';
    words[22] = 'witchcraft';
    words[23] = 'pawnbroker';
    words[24] = 'thumbprint';
    words[25] = 'motorcycle';
    words[26] = 'cryptogram';
    words[27] = 'torchlight';
    words[28] = 'bankruptcy';

    function BuildArray(size) {
        this.length = size;
        for (var i = 1; i <= size; i++) {
            this[i] = null;
        }
        return this;
    }
    // Generate a random number between 1 and NumberOfWords
    var rnd = Math.ceil(Math.random() * NumberOfWords);
    return words[rnd];
}

// methods of the component
ActiveHelpers.component.methods = (self, componentElement) => {
    if (self.methods) {
        var methods = self.methods();
        if (typeof methods == "object") {
            // var element;
            Array.from(Object.keys(methods)).forEach(function(el) {
                if (el == 'component') {
                    var element = componentElement;
                    var methodsEvents = methods[el];
                    try {
                        Array.from(Object.keys(methodsEvents)).forEach(function(
                            event
                        ) {
                            var EventHappen = methodsEvents[event];
                            element[`on${event}`] = (e) => {
                                return EventHappen(e, element);
                            }
                        });
                    } catch (e) {
                        ActiveHelpers.logger({
                            type: "error",
                            error: e
                        })
                        return true;
                    }
                } else {
                    var elements = componentElement.querySelectorAll(el);
                    var matchedElements = [];
                    if (Array.from(elements).length < 1) {
                        let allElements = componentElement.querySelectorAll('[elementName]');
                        if (allElements) {
                            Array.from(allElements).forEach(ele => {
                                if (ele.getAttribute('elementName') === el) {
                                    matchedElements.push(ele);
                                }
                            });
                        } else {}
                    } else {
                        Array.from(elements).map((element) => {
                            matchedElements.push(element);
                        })
                    }
                    var methodsEvents = methods[el];
                    try {
                        Array.from(Object.keys(methodsEvents)).forEach(function(
                            event
                        ) {
                            var EventHappen = methodsEvents[event];
                            Array.from(matchedElements).forEach(function(ele) {
                                ele[`on${event}`] = (e) => {
                                    return EventHappen(e, ele);
                                }
                            });
                        });
                    } catch (e) {
                        ActiveHelpers.logger({
                            type: "error",
                            error: e
                        })
                        return true;
                    }
                }
            });
        }
    }
}
ActiveHelpers.validation = {};
ActiveHelpers.validation.notEmpty = function(element, cb) {
    var elementVal = typeof element == "object" ? element.value : typeof element == "string" ? element : "";
    elementVal = elementVal.trim();
    if (elementVal == "" || elementVal.length < 1) {
        if (!cb) {
            return false;
        }
        if (cb) {
            var empty = false;
            return cb(empty)
        }
    } else {
        if (cb) {
            var empty = elementVal;
            return cb(empty);
        } else {
            return elementVal;
        }
    }
}
ActiveHelpers.validation.strip_html_tags = function(str) {
    if ((str === null) || (str === ''))
        return false;
    else
        str = str.toString();
    return str.replace(/<[^>]*>/g, '');
}
ActiveHelpers.validation.checkEmail = function(element, cb) {
        var elementVal = typeof element == "object" ? element.value : typeof element == "string" ? element : "";
        var regEx = new RegExp("@", "gi");
        if (elementVal !== "") {
            if (cb) {
                var test = regEx.test(elementVal);
                return cb(test);
            } else {
                return regEx.test(elementVal);
            }
        }
    }
    // function to check if it is number
ActiveHelpers.validation.checkIsNumber = function(element, cb) {
    var elementVal = typeof element == "object" ? element.value : typeof element == "string" ? element : "";
    if (elementVal !== "") {
        var testNumber = Number.isInteger(Number(elementVal));
        if (cb) {
            return cb(testNumber);
        } else {
            return testNumber;
        }
    }
}

// function to check if contains a number
ActiveHelpers.validation.checkContainsNumber = function(element, count, cb) {
    var elementVal = typeof element == "object" ? element.value : typeof element == "string" ? element : "";
    if (typeof count == "function" && !cb) {
        cb = count;
    }
    count = typeof count == "number" ? count : 1;
    var numArr = [];
    if (elementVal !== "") {
        Array.from(elementVal).forEach(function(letter) {
            if (Number.isInteger(Number(letter))) {
                numArr.push(letter);
            }
        });
        if (numArr.length === count) {
            let result = true;
            if (cb) {
                return cb(result);
            } else {
                return result;
            }
        } else {
            let result = false;
            if (cb) {
                return cb(result);
            } else {
                return result;
            }
        }
    }
}

ActiveHelpers.component.activeDom = (self) => {
        var elements = {
            element: self.self
        }
        var controllerElements = elements.element.querySelectorAll('[event]');
        if (controllerElements.length > 0) {
            controllerElements.forEach(function(controller) {
                var eventType = controller.getAttribute('eventType');
                var eventType2 = controller.getAttribute('eventType2');
                var thisEventType = controller.getAttribute('thisEventType');
                var thisEventType2 = controller.getAttribute('thisEventType2');
                var thisEvent = controller.getAttribute('thisEvent');
                var notElement = elements.element.querySelector(
                    controller.getAttribute('notElement')
                );
                let compArr = [];
                let clicked = 0;
                controller.getAttribute('targetElement') === 'component' ?
                    compArr.push(elements.element) :
                    (compArr = []);
                var targetElements = controller.getAttribute('targetElement') ===
                    'component' ?
                    compArr :
                    elements.element.querySelectorAll(
                        controller.getAttribute('targetElement')
                    );

                function responseTwo(targetElement) {
                    var responseType2 = targetElement.getAttribute('responseType2');
                    if (responseType2) {
                        if (responseType2 === 'animating') {
                            var animationFrom2 = targetElement.getAttribute(
                                'animationFrom2'
                            );
                            var animationTo2 = targetElement.getAttribute(
                                'animationTo2'
                            );
                            var animationOptions2 = targetElement.getAttribute(
                                'animationOptions2'
                            );
                            var ObjOptions2 = {};
                            var animationOptionsArr2 = animationOptions2.split(',');
                            animationOptionsArr2.forEach(function(option) {
                                var splitedOption2 = option.split(':');
                                ObjOptions2[splitedOption2[0]] = splitedOption2[1];
                            });
                            if (ObjOptions2.duration) {
                                ObjOptions2.duration = Number.parseInt(
                                    ObjOptions2.duration
                                );
                            }
                            var fromArray2 = animationFrom2.split(',');
                            var toArray2 = animationTo2.split(',');
                            var ObjectFrom2 = {};
                            var ObjectTo2 = {};
                            fromArray2.forEach(function(fromAn, i) {
                                var splitedFrom2 = fromAn.split(':');
                                var splitedTo2 = toArray2[i].split(':');
                                ObjectFrom2[splitedFrom2[0]] = splitedFrom2[1];
                                ObjectTo2[splitedTo2[0]] = splitedTo2[1];
                            });
                            targetElement.animating(
                                [ObjectFrom2, ObjectTo2],
                                ObjOptions2
                            );
                        } else if (responseType2 === 'display') {
                            var display2 = targetElement.getAttribute('display2');
                            targetElement.style.display = display2;
                        } else if (responseType2 === 'slideUp') {
                            let slideUpDuration = Number.parseInt(
                                targetElement.getAttribute('slideUpDuration')
                            );
                            targetElement.slidingUp(slideUpDuration);
                        } else if (responseType2 === 'slideDown') {
                            let duration = Number.parseInt(
                                targetElement.getAttribute('slideDuration')
                            );
                            let slideDisplay = targetElement.getAttribute(
                                'slideDisplay'
                            );
                            targetElement.slideDown(duration, slideDisplay);
                        } else if (responseType2 === 'fadingIn') {
                            let fadeDuration = Number.parseInt(
                                targetElement.getAttribute('fadeDuration')
                            );
                            let fadeDisplay = targetElement.getAttribute('fadeDisplay');
                            fadeDisplay = fadeDisplay !== undefined ?
                                fadeDisplay :
                                'block';
                            targetElement.fadingIn(fadeDuration, fadeDisplay);
                        } else if (responseType2 === 'fadingOut') {
                            let fadeDuration = Number.parseInt(
                                targetElement.getAttribute('fadeDuration')
                            );
                            targetElement.fadingIn(fadeDuration);
                        } else {
                            var responseDuration2 = targetElement.getAttribute(
                                'duration'
                            );
                            targetElement[responseType2](
                                Number.parseInt(responseDuration2)
                            );
                        }
                    }
                }

                function responseOne(targetElement) {
                    var responseType = targetElement.getAttribute('responseType');
                    if (responseType === 'animating') {
                        var animationFrom = targetElement.getAttribute(
                            'animationFrom'
                        );
                        var animationTo = targetElement.getAttribute('animationTo');
                        var animationOptions = targetElement.getAttribute(
                            'animationOptions'
                        );
                        var ObjOptions = {};
                        var animationOptionsArr = animationOptions.split(',');
                        animationOptionsArr.forEach(function(option) {
                            var splitedOption = option.split(':');
                            ObjOptions[splitedOption[0]] = splitedOption[1];
                        });
                        if (ObjOptions.duration) {
                            ObjOptions.duration = Number.parseInt(ObjOptions.duration);
                        }
                        var fromArray = animationFrom.split(',');
                        var toArray = animationTo.split(',');
                        var ObjectFrom = {};
                        var ObjectTo = {};
                        fromArray.forEach(function(fromAn, i) {
                            var splitedFrom = fromAn.split(':');
                            var splitedTo = toArray[i].split(':');
                            ObjectFrom[splitedFrom[0]] = splitedFrom[1];
                            ObjectTo[splitedTo[0]] = splitedTo[1];
                        });

                        targetElement.animating([ObjectFrom, ObjectTo], ObjOptions);
                    } else if (responseType === 'display') {
                        var display1 = targetElement.getAttribute('display1');
                        targetElement.style.display = display1;
                    } else if (responseType === 'cssStyle') {
                        var css = targetElement.getAttribute('css');
                        targetElement.style.cssText += css;
                    } else if (responseType === 'slideDown') {
                        let duration = Number.parseInt(
                            targetElement.getAttribute('slideDuration')
                        );
                        let slideDisplay = targetElement.getAttribute('slideDisplay');
                        targetElement.slideDown(duration, slideDisplay);
                    } else if (responseType === 'slideUp') {
                        let slideUpDuration = Number.parseInt(
                            targetElement.getAttribute('slideUpDuration')
                        );
                        targetElement.slidingUp(slideUpDuration);
                    } else if (responseType === 'fadingIn') {
                        let fadeDuration = Number.parseInt(
                            targetElement.getAttribute('fadeDuration')
                        );
                        let fadeDisplay = targetElement.getAttribute('fadeDisplay');
                        fadeDisplay = fadeDisplay !== undefined ? fadeDisplay : 'block';
                        targetElement.fadingIn(fadeDuration, fadeDisplay);
                    } else if (responseType === 'fadingOut') {
                        let fadeDuration = Number.parseInt(
                            targetElement.getAttribute('fadeDuration')
                        );
                        targetElement.fadingIn(fadeDuration);
                    }
                }

                // function to make response one function to this element
                function responseThisOne(targetElement) {
                    var thisResponseType = targetElement.getAttribute(
                        'thisResponseType'
                    );
                    if (thisResponseType === 'animating') {
                        var thisAnimationFrom = targetElement.getAttribute(
                            'thisAnimationFrom'
                        );
                        var thisAnimationTo = targetElement.getAttribute(
                            'thisAnimationTo'
                        );
                        var thisAnimationOptions = targetElement.getAttribute(
                            'thisAnimationOptions'
                        );
                        var ObjOptions = {};
                        var animationOptionsArr = thisAnimationOptions.split(',');
                        animationOptionsArr.forEach(function(option) {
                            var splitedOption = option.split(':');
                            ObjOptions[splitedOption[0]] = splitedOption[1];
                        });
                        if (ObjOptions.duration) {
                            ObjOptions.duration = Number.parseInt(ObjOptions.duration);
                        }
                        var fromArray = thisAnimationFrom.split(',');
                        var toArray = thisAnimationTo.split(',');
                        var ObjectFrom = {};
                        var ObjectTo = {};
                        fromArray.forEach(function(fromAn, i) {
                            var splitedFrom = fromAn.split(':');
                            var splitedTo = toArray[i].split(':');
                            ObjectFrom[splitedFrom[0]] = splitedFrom[1];
                            ObjectTo[splitedTo[0]] = splitedTo[1];
                        });

                        targetElement.animating([ObjectFrom, ObjectTo], ObjOptions);
                    } else if (thisResponseType === 'display') {
                        var thisDisplay1 = targetElement.getAttribute('thisDisplay1');
                        targetElement.style.display = thisDisplay1;
                    } else if (thisResponseType === 'cssStyle') {
                        var css = targetElement.getAttribute('thisCss');
                        targetElement.style.cssText += css;
                    } else if (thisResponseType === 'slideUp') {
                        let slideUpDuration = Number.parseInt(
                            targetElement.getAttribute('slideUpDuration')
                        );
                        targetElement.slidingUp(slideUpDuration);
                    } else if (thisResponseType === 'slideDown') {
                        let duration = Number.parseInt(
                            targetElement.getAttribute('slideDuration')
                        );
                        let slideDisplay = targetElement.getAttribute('slideDisplay');
                        targetElement.slideDown(duration, slideDisplay);
                    } else if (thisResponseType === 'fadingIn') {
                        let fadeDuration = Number.parseInt(
                            targetElement.getAttribute('fadeDuration')
                        );
                        let fadeDisplay = targetElement.getAttribute('fadeDisplay');
                        fadeDisplay = fadeDisplay !== undefined ? fadeDisplay : 'block';
                        targetElement.fadingIn(fadeDuration, fadeDisplay);
                    } else if (thisResponseType === 'fadingOut') {
                        let fadeDuration = Number.parseInt(
                            targetElement.getAttribute('fadeDuration')
                        );
                        targetElement.fadingIn(fadeDuration);
                    }
                }
                // this response2 function
                function responseThisTwo(targetElement) {
                    var thisResponseType2 = targetElement.getAttribute(
                        'thisResponseType2'
                    );
                    if (thisResponseType2 === 'animating') {
                        var thisAnimationFrom2 = targetElement.getAttribute(
                            'thisAnimationFrom2'
                        );
                        var thisAnimationTo2 = targetElement.getAttribute(
                            'thisAnimationTo2'
                        );
                        var thisAnimationOptions2 = targetElement.getAttribute(
                            'thisAnimationOptions2'
                        );
                        var ObjOptions = {};
                        var animationOptionsArr = animationOptions2.split(',');
                        animationOptionsArr.forEach(function(option) {
                            var splitedOption = option.split(':');
                            ObjOptions[splitedOption[0]] = splitedOption[1];
                        });
                        if (ObjOptions.duration) {
                            ObjOptions.duration = Number.parseInt(ObjOptions.duration);
                        }
                        var fromArray = animationFrom2.split(',');
                        var toArray = animationTo2.split(',');
                        var ObjectFrom = {};
                        var ObjectTo = {};
                        fromArray.forEach(function(fromAn, i) {
                            var splitedFrom = fromAn.split(':');
                            var splitedTo = toArray[i].split(':');
                            ObjectFrom[splitedFrom[0]] = splitedFrom[1];
                            ObjectTo[splitedTo[0]] = splitedTo[1];
                        });

                        targetElement.animating([ObjectFrom, ObjectTo], ObjOptions);
                    } else if (thisResponseType2 === 'display') {
                        var thisDisplay12 = targetElement.getAttribute('thisDisplay2');
                        targetElement.style.display = thisDisplay2;
                    } else if (thisResponseType2 === 'cssStyle') {
                        var css2 = targetElement.getAttribute('thisCss2');
                        targetElement.style.cssText += css2;
                    } else if (thisResponseType2 === 'slideUp') {
                        let slideUpDuration = Number.parseInt(
                            targetElement.getAttribute('slideUpDuration')
                        );
                        targetElement.slidingUp(slideUpDuration);
                    } else if (thisResponseType2 === 'slideDown') {
                        let duration = Number.parseInt(
                            targetElement.getAttribute('slideDuration')
                        );
                        let slideDisplay = targetElement.getAttribute('slideDisplay');
                        targetElement.slideDown(duration, slideDisplay);
                    } else if (thisResponseType2 === 'fadingIn') {
                        let fadeDuration = Number.parseInt(
                            targetElement.getAttribute('fadeDuration')
                        );
                        let fadeDisplay = targetElement.getAttribute('fadeDisplay');
                        fadeDisplay = fadeDisplay !== undefined ? fadeDisplay : 'block';
                        targetElement.fadingIn(fadeDuration, fadeDisplay);
                    } else if (thisResponseType2 === 'fadingOut') {
                        let fadeDuration = Number.parseInt(
                            targetElement.getAttribute('fadeDuration')
                        );
                        targetElement.fadingIn(fadeDuration);
                    }
                }
                // listen for
                // make event listener for this event
                if (thisEvent === 'true') {
                    let events = 0;
                    if (thisEventType === 'click' && thisEventType2 === 'click') {
                        controller.addEvent(`${thisEventType}`, function(e) {
                            events++;
                            if (events === 1) {
                                responseThisOne(e.target);
                            }
                            if (events === 2) {
                                responseThisTwo(e.target);
                                events = 0;
                            }
                        });
                    } else {
                        controller.addEvent(`${thisEventType}`, function(e) {
                            responseThisOne(e.target);
                            controller.addEvent(`${thisEventType2}`, function(e) {
                                responseThisTwo(e.target);
                            });
                        });
                    }
                }
                //  check if the event type is click
                if (eventType === 'click' && eventType2 === 'click') {
                    controller.addEvent(`${eventType}`, function(e) {
                        clicked++;
                        targetElements.forEach(function(targetElement) {
                            if (clicked === 1) {
                                return responseOne(targetElement);
                            }
                        });
                    });
                    targetElements.forEach(function(targetElement, i) {
                        let clickClose = targetElement.getAttribute('clickClose');
                        if (clickClose === 'true') {
                            document.addEventListener('click', function(e) {
                                if (clicked === 1) {
                                    if (e.target === controller) {
                                        return null;
                                    } else if (e.target === targetElement) {
                                        return null;
                                    } else if (
                                        e.target.parents(targetElement) !== undefined
                                    ) {
                                        return null;
                                    } else {
                                        controller.click();
                                        clicked = 0;
                                    }
                                }
                            });
                        }
                    });
                    if (eventType2 !== undefined) {
                        controller.addEvent(`${eventType2}`, function(e) {
                            responseThisOne(e.target);
                            if (clicked === 2) {
                                targetElements.forEach(function(targetElement) {
                                    responseTwo(targetElement);
                                    clicked = 0;
                                });
                            }
                        });
                    }
                } else {
                    controller.addEvent(`${eventType}`, function(e) {
                        clicked++;
                        targetElements.forEach(function(targetElement) {
                            responseOne(targetElement);
                        });
                        if (eventType2 !== undefined) {
                            if (eventType2 !== 'mouseleave' || 'mouseout') {
                                document.body.addEvent('mousemove', function(bEvent) {
                                    if (clicked === 0) {
                                        return null;
                                    } else {
                                        if (notElement) {
                                            if (
                                                bEvent.target === controller ||
                                                bEvent.target === notElement ||
                                                bEvent.target.parents(notElement) !== undefined
                                            ) {
                                                return null;
                                            } else {
                                                targetElements.forEach(function(targetElement) {
                                                    responseTwo(targetElement);
                                                    clicked = 0;
                                                });
                                            }
                                        } else {
                                            if (bEvent.target !== controller) {
                                                targetElements.forEach(function(targetElement) {
                                                    responseTwo(targetElement);
                                                    clicked = 0;
                                                });
                                            }
                                        }
                                    }
                                });
                            } else {
                                controller.addEvent(`${eventType2}`, function(e) {
                                    targetElements.forEach(function(targetElement) {
                                        responseTwo(targetElement);
                                        clicked = 0;
                                    });
                                });
                            }
                        }
                    });
                }
            });
        }
    }
    // file upload method
ActiveHelpers.fileUpload = (fileInput, dataInput) => {
    var file = typeof fileInput == 'string' ?
        document.querySelector(fileInput) :
        fileInput;
    fileInput.addEventListener('click', () => {});
    var fileDataInput = dataInput ?
        typeof dataInput === 'string' ?
        document.querySelector(dataInput) :
        typeof dataInput === 'function' ?
        dataInput :
        typeof dataInput == 'object' ? dataInput : false :
        false;

    function setFileInfo(fileData, filesData, filesDataArray) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileData);
        let nameArr = fileData.name.split('.');
        let extName = nameArr.length - 1;
        extName = '.' + nameArr[extName];
        var fileInfo = {
            fileName: fileData.name,
            size: fileData.size,
            type: fileData.type,
            extName: extName,
        };
        fileReader.addEventListener('load', function() {
            var result = fileReader.result;
            result = result.substring(result.indexOf(',') + 1);
            fileInfo.result = result;
            fileInfo.binary = fileReader.result;
            filesDataArray.push(fileInfo);
            if (filesData.length === filesDataArray.length) {
                filesDataArray = filesDataArray.length === 1 ?
                    filesDataArray[0] :
                    filesDataArray;
                if (fileDataInput && typeof fileDataInput == 'object') {
                    return (fileDataInput.value = JSON.stringify(filesDataArray));
                } else if (typeof dataInput === 'function') {
                    return dataInput(filesDataArray);
                } else if (!dataInput) {
                    return filesDataArray;
                }
            }
        });
    }
    file.addEventListener('change', function(e) {
        var filesDataArray = [];
        var filesData = file.files;
        for (let i = 0; i < filesData.length; i++) {
            return setFileInfo(filesData[i], filesData, filesDataArray);
        }
    });
}

// storage helper
ActiveHelpers.storage = {
    setItemAsync: function(key, data, returning = true) {
        return new Promise(function(resolved, rejected) {
            data = typeof data === 'object' ? JSON.stringify(data) : data;
            try {
                localStorage.setItem(key, data);
                var item;
                if (returning === true) {
                    item = localStorage.getItem(key);
                    return resolved(item);
                } else {
                    return resolved();
                }
            } catch (error) {
                ActiveHelpers.logger({
                    type: "error",
                    error: e
                })
                return rejected(error);
            }
        });
    },
    getItemAsync: function(key) {
        return new Promise(function(resolved, rejected) {
            if (localStorage.getItem(key) === null) {
                return rejected(new Error('not found item'));
            } else {
                let item = localStorage.getItem(key);
                return resolved(item);
            }
        });
    },
    setItem: function(key, data) {
        data = typeof data === 'object' ? JSON.stringify(data) : data;
        localStorage.setItem(key, data);
    },
    getItem: function(key) {
        return localStorage.getItem(key);
    }
}

// filter content methodd
ActiveHelpers.filterContent = function(element, options) {

};

// loop elements method
ActiveHelpers.loopElements = function(data, cb) {
    if (typeof data === 'string') {
        data = JSON.parse(data);
    }
    if (Array.isArray(data)) {
        return data
            .map(function(item, i) {
                return cb(item, i);
            })
            .join('');
    } else if (typeof data === 'object') {
        return Object.keys(data)
            .map(function(item, i) {
                return cb(data[item], data[i]);
            })
            .join('');
    } else if (typeof data == "number") {
        let count = data;
        let array = [];
        for (let i = 0; i < count; i++) {
            array.push(i);
        }
        return Array.from(array)
            .map(function(item, i) {
                return cb(item, i);
            })
            .join('');
    }
};

// helper method to parse json data
ActiveHelpers.parseData = function(data, cb) {
    if (typeof data === 'string') {
        data = JSON.parse(data);
    }
    if (Array.isArray(data)) {
        data.map(function(item, i) {
            return cb(item, i);
        });
    }
    if (typeof data === 'object') {
        Object.keys(data).map(function(item, i) {
            return cb(data[item], data[i]);
        });
    }
};
// helper function to get all methods of the class
ActiveHelpers.getAllMethods = function(obj, deep = Infinity) {
    let props = []

    while (
        (obj = Object.getPrototypeOf(obj)) && // walk-up the prototype chain
        Object.getPrototypeOf(obj) && // not the the Object prototype methods (hasOwnProperty, etc...)
        deep !== 0
    ) {
        const l = Object.getOwnPropertyNames(obj)
            .concat(Object.getOwnPropertySymbols(obj).map(s => s.toString()))
            .sort()
            .filter(
                (p, i, arr) =>
                typeof obj[p] === 'function' && // only the methods
                p !== 'constructor' && // not the constructor
                (i == 0 || p !== arr[i - 1]) && // not overriding in this prototype
                props.indexOf(p) === -1 // not overridden in a child
            )
        props = props.concat(l)
        deep--
    }

    return props
}

// find elements by xpath
ActiveHelpers.getElementsByXPath = function(xpaths, parent) {
        let results = [];
        Array.from(xpaths).forEach((xpath) => {
            let query = document.evaluate(xpath, parent || document,
                null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0, length = query.snapshotLength; i < length; ++i) {
                results.push(query.snapshotItem(i));
            }
        })
        return results;
    }
    // helper to generate random id
ActiveHelpers.generateId = (i) => {
        i = i || "";
        return Math.random().toString(36).substr(2, 9) + i;
    }
    // helper to delete some attributes of elements
ActiveHelpers.removeAttributes = (element) => {
    try {
        element.removeAttribute("key-name");
        element.removeAttribute("key-loop");
        element.removeAttribute("key-index");
        element.removeAttribute("loop-name");
        element.removeAttribute("element-id");
        element.removeAttribute("key-condition");
        element.removeAttribute("A-if");
        element.removeAttribute("A-not");
    } catch (e) {
        ActiveHelpers.logger({
            type: "error",
            error: e
        })
    }
}

// helper to resolve element id
ActiveHelpers.resolveElementId = (component) => {
    let unique = [...new Set(component.elementHistory)];
    component.elementHistory.forEach((item, i) => {
        let similarItem = component.elementHistory[i + 1];
        if (similarItem) {
            similarItem = similarItem.shadowElement.getAttribute("element-id") == item.shadowElement.getAttribute("element-id") ? item : false;
            if (similarItem) {
                let newId = ActiveHelpers.generateId();
                similarItem.original.setAttribute("element-id", newId);
                similarItem.shadowElement.setAttribute("element-id", newId);
            }
        }
        if (item.original.getAttribute("element-id") !== item.shadowElement.getAttribute("element-id")) {
            item.original.setAttribute("element-id", item.shadowElement.getAttribute("element-id"));
        }
    })
}

// If statments resolver
ActiveHelpers.ifStatmentResolver = (updated, shadowElement, self) => {
        // console.log(updated, shadowElement, self)
        try {
            let $store = self.$store;
            // check if the statment is if
            if (shadowElement.getAttribute("A-if")) {
                // check if the statment is else
                let attributeValue = shadowElement.getAttribute("A-if");
                // console.log(attributeValue)
                console.log(attributeValue);
                let statment = eval(attributeValue);
                let content = shadowElement.cloneNode(true).childNodes;
                updated.innerHTML = "";
                if (statment) {
                    updated.append(...content)
                    Array.from(updated.querySelectorAll("*")).forEach((element) => {
                        ActiveHelpers.removeAttributes(element)
                    });
                } else {
                    return false;
                }
            } else if (shadowElement.getAttribute("A-not")) {
                let attributeValue = shadowElement.getAttribute("A-not");
                let statment = eval(attributeValue);
                let content = shadowElement.cloneNode(true).childNodes;
                updated.innerHTML = "";
                if (statment) {
                    return false;
                } else {
                    updated.append(...content)
                    Array.from(updated.querySelectorAll("*")).forEach((element) => {
                        ActiveHelpers.removeAttributes(element)
                    });
                }
            }
        } catch (e) {
            console.log(e)
        }
    }
    // method to add dom events to elements
ActiveHelpers.inlineDomEvents = function() {
        if (this) {

            let eventsNames = Object.getOwnPropertyNames(document).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(document)))).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(window))).filter(function(i) {
                return !i.indexOf('on') && (document[i] == null || typeof document[i] == 'function');
            }).filter(function(elem, pos, self) {
                return self.indexOf(elem) == pos;
            });
            eventsNames.forEach((eventName) => {
                let elementHasEvents = this.elementHistory.filter((element) => {
                    return element.shadowElement.getAttribute(eventName);
                });
                if (elementHasEvents) {
                    elementHasEvents.forEach((elementHasEvent) => {
                        elementHasEvent.updated.removeAttribute(eventName);
                        let event = elementHasEvent.shadowElement.getAttribute(eventName);
                        let self = this;
                        elementHasEvent.updated[eventName] = eval(event);
                    })

                }
            })
        }
    }
    // method to get the attribute of the element
ActiveHelpers.elementAttributes = (elem) =>
    elem.getAttributeNames().reduce((attrMap, name) => {
        attrMap[name] = elem.getAttribute(name);
        try {
            attrMap[name] = JSON.parse(attrMap[name]);
        } catch (e) {}
        return attrMap;
    }, {});
// method for logging errors and other stuff
ActiveHelpers.logger = (props) => {
        if (Active.mode == "development") {
            console.log(props);
        }
    }
    // method to set deep properties to the object
ActiveHelpers.deep_set = function(o, p, newVal) {
    p.split(".").reduce((a, v) => {
        return a[v] = newVal;
    }, o)
}

//   method to get deep properties to the object
ActiveHelpers.deep_value = function(o, p) {
    let val = p.split('.').reduce((a, v) => a[v], o)
    return val;
};
export default ActiveHelpers;