/*
==============================
@param Liven

Core module
==============================
 */

// dependencies
import EventEmitter from "./EventEmitter.js";
import componentObject from './component.js';
import "./elementActions.js";
import LivenHelpers from "./helpers.js";
import HTTP from "./http.js";
import routerObject from "./router.js";
class LivenJs {
    // define the constructor
    constructor() {

        this.components = [];
        this.DOM = {};
        this.DOM.history = {};
        this.DOM.components = {};
        this.DOM.tree = {};
        this.DOM.getComponentById = (selector) => {
            let component = Object.values(this.DOM.components).find(obj => obj.id == selector);
            return component;
        }
        this.DOM.getComponentsByName = (selector) => {
            let component = Object.values(this.DOM.components).find(obj => obj.name == selector);
            return component;
        }
        this.DOM.getComponentsByIs = (is) => {
            let components = Object.values(this.DOM.components).filter(obj => obj.props.is == is)
            return components;
        }
        this.DOM.getComponentByUniqueName = (selector) => {
            let component = Object.keys(this.DOM.components).find(uniquename => uniquename == selector);
            return component;
        }
        routerObject.liven = this;
        if (!this.errorPage) {
            this.errorPage = function(req, res) {}
        }
        this.Router = routerObject.Router;
        routerObject.clickListener();
        routerObject.popState();
        routerObject.onload();
        routerObject.submitForms();
        // define some helpers
        this.helpers = {};
        // define checks
        this.helpers.checks = LivenHelpers.checks;
        this.helpers.deep_value = LivenHelpers.deep_value;
        this.helpers.deep_set = LivenHelpers.deep_set;
        // file upload method
        this.fileUpload = LivenHelpers.fileUpload
            // 
        this.filterContent = LivenHelpers.filterContent;

        // loop elements method
        this.loopElements = LivenHelpers.loopElements;
        componentObject.liven = this;
        this.Component = componentObject.Component;
        // ajax module
        this.HTTP = new HTTP();
    }
    setConfig(config) {
            this.config = config;
            this.errorPage = config.errorPage || function(req, res) {}
            this.mode = config.mode || "development";
            LivenHelpers.mode = this.mode;

        }
        // ready method when the document is fully loaded
    ready(cb) {
            let loadInterval = setInterval(() => {
                if (document.readyState == 'complete') {
                    clearInterval(loadInterval);
                    return cb();
                }
            }, 100);
        }
        // while loading function
    whileLoading(cb, after) {
            var i = 0;
            let loadInterval = setInterval(() => {
                if (document.readyState == 'complete') {
                    clearInterval(loadInterval);
                    setTimeout(() => {
                        if (after) {
                            return after();
                        } else {
                            return true;
                        }
                    }, 100);
                } else {
                    i++;
                    if (i === 1) {
                        return cb();
                    }
                }
            }, 1);
        }
        // get cookie method
    getCookie(cookieName) {
        let cname = cookieName;
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    // set cookie function
    setCookie(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }
        // function to out multiple components
    manyOut(componentsArray) {
            let outs = [];
            componentsArray.map((component) => outs.push(component.out()));
            return Promise.all(outs);
        }
        // method to filter specific container with its components
    outComponents(is) {
        let components = this.DOM.getComponentsByIs(is);
        return this.manyOut(components);
    }
}
const Liven = new LivenJs();
const Http = Liven.HTTP;
// HTTP = Liven.HTTP;
const Validation = LivenHelpers.validation;
const Component = Liven.Component;
const Router = Liven.Router;

export {
    Liven,
    EventEmitter,
    Http,
    Validation,
    Component,
    Router
};