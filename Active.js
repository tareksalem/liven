/*
==============================
@param Activejs

Core module
==============================
 */

// dependencies
import EventEmitter from "./EventEmitter.js";
import componentObject from './component.js';
import "./elementActions.js";
import ActiveHelpers from "./helpers.js";
import HTTP from "./http.js";
import routerObject from "./router.js";
class ActiveJs {
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
        this.DOM.getComponentByUniqueName = (selector) => {
            let component = Object.keys(this.DOM.components).find(uniquename => uniquename == selector);
            return component;
        }
        routerObject.active = this;
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
        this.helpers.checks = ActiveHelpers.checks;
        this.helpers.deep_value = ActiveHelpers.deep_value;
        this.helpers.deep_set = ActiveHelpers.deep_set;
        // file upload method
        this.fileUpload = ActiveHelpers.fileUpload
            // 
        this.filterContent = ActiveHelpers.filterContent;

        // loop elements method
        this.loopElements = ActiveHelpers.loopElements;
        componentObject.active = this;
        this.Component = componentObject.Component;
        // ajax module
        this.HTTP = new HTTP();
    }
    setConfig(config) {
            this.config = config;
            this.errorPage = config.errorPage || function(req, res) {}
            this.mode = config.mode || "development";
            ActiveHelpers.mode = this.mode;

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
}
const Active = new ActiveJs();
const Http = Active.HTTP;
const Validation = ActiveHelpers.validation;
const Component = Active.Component;
const Router = Active.Router;
export {
    Active,
    EventEmitter,
    Http,
    Validation,
    Component,
    Router
};