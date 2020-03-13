/*
==============================
@param Livenjs

Auther: Tarek Salem
Router module
==============================
 */
// dependencies
import EventEmitter from "./EventEmitter.js";
import LivenHelpers from "./helpers.js";
import Validator from "./validator";
import {
    onChange
} from "./onchange.js";
import URLPattern from "./url-pattern.js";
var query = {};
window.location.search.substring(1).split('&').forEach(function(pair) {
    pair = pair.split('=');
    if (pair[1] !== undefined) {
        var key = decodeURIComponent(pair[0]),
            val = decodeURIComponent(pair[1]),
            val = val ? val.replace(/\++/g, ' ').trim() : '';
        if (key.length === 0) {
            return;
        }
        if (query[key] === undefined) {
            query[key] = val;
        } else {
            if ("function" !== typeof query[key].push) {
                query[key] = [query[key]];
            }
            query[key].push(val);
        }
    }
});

// define the router class
const routerObject = {
    classesRoutes: {},
    bases: [],
    postBases: [],
    classes: [],
    updateRequest: function(req) {
        req.query = query;
        req.href = window.location.href;
        req.origin = location.origin;
        req.search = location.search;
        req.hostname = location.hostname;
        req.port = location.port;
        req.hash = location.hash;
        req.host = location.host;
        req.url = location.pathname;
    },
    req: {
        pathname: window.location.pathname,
        validation: Validator
    },
    redirect: function(path, title) {
        const self = routerObject;
        title = title || "";
        let href = `${window.location.origin}${path}`;
                let parsedUrl = new URL(href);
                href = parsedUrl.pathname;
                let requests = [];
                history.pushState({
                    url: href,
                    title,
                }, title, href)
                self.req.pathname = window.location.pathname;
                self.req.url = window.location.pathname;
                self._emitter.emit("change", self.req, self.res);
                self.bases.map((base) => {
                    if (href.startsWith(base)) {
                        requests.push(base);
                    }
                })
                let matchedReq = requests[requests.length > 1 ? requests.length - 1 : 0];
                if (matchedReq) {
                    self.updateRequest(self.req);
                    self.req.method = "get";
                    let matchedClass = self.classesRoutes[matchedReq];
                    if (matchedClass) {
                        if (matchedClass.globalMiddleWares) {
                            if (matchedClass.globalMiddleWares.length > 0) {
                                var nexted = 0;
                                matchedClass.req = self.req;
                                matchedClass.res = self.res;
                                matchedClass.globalMiddleWares[0](self.req, self.res, next);

                                function next() {
                                    nexted++;
                                    if (matchedClass.globalMiddleWares.length <= nexted) {
                                        matchedClass.init();
                                    } else {
                                        return matchedClass.globalMiddleWares[nexted](self.req, self.res, next);
                                    }
                                }
                            } else {
                                matchedClass.init();
                            }
                        } else {
                            matchedClass.init();
                        }
                    }
                } else {
                    if (e.target.href.indexOf("#") == -1) {
                        self.res.statusCode = 404;
                        LivenHelpers.logger({
                            type: "route",
                            method: self.req.method,
                            status: self.res.statusCode,
                            url: req.url,
                            time: Date.now()
                        });
                        return self.liven.errorPage(self.req, self.res)
                    }
                }
                return this;
    },
    res: {
        // end method to return content be written in dom directly
        end: function (content, title) {
            title = typeof title == "string" ? title : "";
            content = typeof content == "string" ? content : "";
            document.title = title;
            document.write(content)
            return this;
        },
        write: function (content, title) {
            title = typeof title == "string" ? title : "";
            content = typeof content == "string" ? content : "";
            document.title = title;
            document.write(content)
            return this;
        },
        // render a component
        render: function (component, data, title) {
            if(typeof title == "string") {
                document.title = title;
            }
            component.$store.data = data;
            // init the component
            component.init();
            return this;
        },
        status: function (status) {
            this.statusCode = status;
            return this;
        }
    },
    clickListener: function() {
        const self = this;
        self._emitter = self._emitter || new EventEmitter();
        // event listener
        document.addEventListener("click", (e) => {
            let links = document.querySelectorAll("[href]");
            links = Array.from(links).filter(link => link.getAttribute("router"));
            let link = Array.from(links).find(link => e.target == link);
            if (link) {
                e.preventDefault();
                if (e.detail === 1) {
                    let href = e.target.href || window.location.origin + e.target.getAttribute("href");
                    let parsedUrl = new URL(href);
                    href = parsedUrl.pathname;
                    let requests = [];
                    history.pushState({
                        url: href,
                        title: e.target.getAttribute("title"),
                    }, e.target.title, href)
                    self.req.pathname = window.location.pathname;
                    self.req.url = window.location.pathname;
                    self._emitter.emit("change", self.req, self.res);
                    self.bases.map((base) => {
                        if (href.startsWith(base)) {
                            requests.push(base);
                        }
                    })
                    let matchedReq = requests[requests.length > 1 ? requests.length - 1 : 0];
                    if (matchedReq) {
                        self.updateRequest(self.req);
                        self.req.method = "get";
                        let matchedClass = this.classesRoutes[matchedReq];
                        if (matchedClass) {
                            if (matchedClass.globalMiddleWares) {
                                if (matchedClass.globalMiddleWares.length > 0) {
                                    var nexted = 0;
                                    matchedClass.req = self.req;
                                    matchedClass.res = self.res;
                                    matchedClass.globalMiddleWares[0](self.req, self.res, next);

                                    function next() {
                                        nexted++;
                                        if (matchedClass.globalMiddleWares.length <= nexted) {
                                            matchedClass.init();
                                        } else {
                                            return matchedClass.globalMiddleWares[nexted](self.req, self.res, next);
                                        }
                                    }
                                } else {
                                    matchedClass.init();
                                }
                            } else {
                                matchedClass.init();
                            }
                        }
                    } else {
                        if (e.target.href.indexOf("#") == -1) {
                            self.res.statusCode = 404;
                            LivenHelpers.logger({
                                type: "route",
                                method: self.req.method,
                                status: self.res.statusCode,
                                url: req.url,
                                time: Date.now()
                            });
                            return self.liven.errorPage(self.req, self.res)
                        }
                    }
                }
            }
        })
    },
    Router: class {
        constructor(options) {
            const self = routerObject;
                this._pushGlobalMiddleWares = function(routers, globalMiddleWares, classCors) {
                    routers.forEach(obj => {
                        obj.middleWares = obj.middleWares || [];
                        obj.middleWares.unshift(...globalMiddleWares);
                    })
                }
                this.redirect = self.redirect;
                // method to set base
                this._setBase = () => {
                    this.base = this.options.base || this.base || "";
                    this.base =
                        this.base
                        .replace(/(https?:\/\/)|(\/)+/g, "$1$2")
                        .replace(/^(.+?)\/*?$/, "$1") || "/";
                }
                this._resolveRoutesWithBase = () => {
                    this.getRouters.forEach((obj) => {
                        obj.url = path.join(this.base, obj.url);
                    })
                    this.postRouters.forEach((obj) => {
                        obj.url = path.join(this.base, obj.url);
                    })
                    this.deleteRouters.forEach((obj) => {
                        obj.url = path.join(this.base, obj.url);
                    })
                    this.putRouters.forEach((obj) => {
                        obj.url = path.join(this.base, obj.url);
                    })
                    this.patchRouters.forEach((obj) => {
                        obj.url = path.join(this.base, obj.url);
                    })
                }
                this.errorPage = this.errorPage || self.errorPage;
                this.options = options || {};
                this._setBase();
                this.getRouters = [];
                this.postRouters = [];
                this.deleteRouters = [];
                this.putRouters = [];
                this.patchRouters = [];
                this.childRoutes = [];
                if(LivenHelpers.warnings.router.called == false) {
                    LivenHelpers.warnings.router.called = true;
                }
            }
            build() {
                const self = routerObject;
                this.id = Math.random()
                    .toString(36)
                    .substr(2, 9);
                self.classes.push(this);
                self.bases.push(this.base);
                self.classesRoutes[this.base] = this;
                this.inited = false;
                this.initedposts = false;
                this.initedputs = false;
                this.initedpatches = false;
                this.initeddeletes = false;
                this.errorPage = this.errorPage || self.errorPage;
                this.globalMiddleWares = this.globalMiddleWares || [];
            }
            // method to add new route to this namespace
        addRoute(options = new Object) {
                let handler = options.handler;
                let method = options.method.toLowerCase();
                let url = options.url.trim();
                let middleWares = options.middleWares;
                var setOptions = {
                    handler,
                    method,
                    url,
                    middleWares
                };
                if (method.toLowerCase() == "get") {
                    this.getRouters.push(setOptions);
                } else if (method.toLowerCase() == "post") {
                    this.postRouters.push(setOptions);
                } else if (method.toLowerCase() == "put") {
                    this.putRouters.push(setOptions);
                } else if (method.toLowerCase() == "patch") {
                    this.patchRouters.push(setOptions);
                } else if (method.toLowerCase() == "delete") {
                    this.deleteRouters.push(setOptions);
                }
            }
            // method to initialize the router, this method is called automatically once you instantiate the router class
        init() {
                this.req = routerObject.req;
                this.res = routerObject.res;
                let req = this.req;
                let res = this.res;
                routerObject.updateRequest(req);
                let getRouters = this.getRouters;
                this.finalGetRouters =  this.finalGetRouters || [];
                this.finalPostRoutes =  this.finalPostRoutes || [];
                this.finalPatchRoutes =  this.finalPatchRoutes || [];
                this.finalPutRoutes =  this.finalPutRoutes || [];
                this.finalDeleteRoutes =  this.finalDeleteRoutes || [];
                if (typeof routerObject.req.method == "string" && routerObject.req.method.toLowerCase() == "get") {
                    if (this.inited == false) {
                        this.finalGetRouters = [];
                        this.getRouters.forEach((router) => {
                            router.url = `${this.base}/${router.url}`.replace(/(https?:\/\/)|(\/)+/g, "$1$2").replace(/^(.+?)\/*?$/, "$1");
                            router.method.toLowerCase();
                            let routePattern = new URLPattern(router.url);
                            routePattern.class = this;
                            let values = []
                            routePattern.ast.map((tag) => {
                                values.push(tag.value)
                            });
                            values = values.join("");
                            router.value = values.replace(/(https?:\/\/)|(\/)+/g, "$1$2").replace(/^(.+?)\/*?$/, "$1");
                            this.finalGetRouters.push(routePattern);
                        });
                        this.inited = true;
                    }
                    routerObject.req.pathname = location.pathname;
                    routerObject.req.url = location.pathname;
                    let matchedFinal;
                    let matchedRe = routerObject.req.pathname;
                    this.finalGetRouters.forEach((r) => {
                        matchedFinal = r.match(req.pathname);
                        if (matchedFinal) {
                            let values = [];
                            r.ast.map((tag) => {
                                values.push(tag.value)
                            });
                            values = values.join("");
                            matchedRe = values.replace(/(https?:\/\/)|(\/)+/g, "$1$2").replace(/^(.+?)\/*?$/, "$1");
                            req.params = matchedFinal;
                        }
                    })
                    let matchedURL = getRouters.find((router) => {
                        return router.value == matchedRe
                    });
                    if (matchedURL) {
                        routerObject.updateRequest(req);
                        if (matchedURL.method.toLowerCase() == "get") {
                            routerObject.res.statusCode = 200;
                            if (matchedURL.middleWares && matchedURL.middleWares.length > 0) {
                                var nexted = 0;
                                matchedURL.middleWares[0](routerObject.req, routerObject.res, next);

                                function next() {
                                    nexted++;
                                    if (matchedURL.middleWares.length <= nexted) {
                                        matchedURL.handler(routerObject.req, routerObject.res);
                                    } else {
                                        return matchedURL.middleWares[nexted](routerObject.req, routerObject.res, next);
                                    }
                                }
                            } else {
                                LivenHelpers.logger({
                                    type: "route",
                                    method: routerObject.req.method,
                                    status: routerObject.res.statusCode,
                                    url: req.url,
                                    time: Date.now()
                                });
                                matchedURL.handler(routerObject.req, routerObject.res);
                            }
                        } else {
                            routerObject.res.statusCode = 404;
                            LivenHelpers.logger({
                                type: "route",
                                method: routerObject.req.method,
                                status: routerObject.res.statusCode,
                                url: req.url,
                                time: Date.now()
                            });
                            return this.errorPage ? this.errorPage(routerObject.req, routerObject.res) : routerObject.liven.errorPage(routerObject.req, routerObject.res);
                        }
                    } else {
                        routerObject.res.statusCode = 404;
                        LivenHelpers.logger({
                            type: "route",
                            method: routerObject.req.method,
                            status: routerObject.res.statusCode,
                            url: req.url,
                            time: Date.now()
                        });
                        return this.errorPage ? this.errorPage(routerObject.req, routerObject.res) : routerObject.liven.errorPage(routerObject.req, routerObject.res);
                    }
                } else if (typeof routerObject.req.method == "string" && routerObject.req.method.toLowerCase() == "post") {
                    if (this.initedposts == false) {
                        this.finalPostRoutes = [];
                        this.postRouters.forEach((router) => {
                            router.url = `${this.base}/${router.url}`.replace(/(https?:\/\/)|(\/)+/g, "$1$2").replace(/^(.+?)\/*?$/, "$1");
                            router.method = router.method.toLowerCase();
                            let routePattern = new URLPattern(router.url);
                            routePattern.class = this;
                            let values = [];
                            routePattern.ast.map((tag) => {
                                values.push(tag.value)
                            });
                            values = values.join("");
                            router.value = values.replace(/(https?:\/\/)|(\/)+/g, "$1$2").replace(/^(.+?)\/*?$/, "$1");
                            this.finalPostRoutes.push(routePattern);
                        });
                        this.initedposts = true;
                    }
                    let matchedFinal;
                    routerObject.req.url = routerObject.req.pathname;
                    let matchedRe = routerObject.req.url;
                    this.finalPostRoutes.forEach((r) => {
                        matchedFinal = r.match(routerObject.req.url);
                        if (matchedFinal) {
                            let values = [];
                            r.ast.map((tag) => {
                                values.push(tag.value)
                            });
                            values = values.join("");
                            matchedRe = values.replace(/(https?:\/\/)|(\/)+/g, "$1$2").replace(/^(.+?)\/*?$/, "$1");
                            req.params = matchedFinal;
                        }
                    })
                    let matchedURL = this.postRouters.find((router) => {
                        return router.value == matchedRe
                    });
                    if (matchedURL) {
                        if (matchedURL.method.toLowerCase() == "post") {
                            routerObject.res.statusCode = 200;
                            if (matchedURL.middleWares && matchedURL.middleWares.length > 0) {
                                var nexted = 0;
                                matchedURL.middleWares[0](routerObject.req, routerObject.res, next);

                                function next() {
                                    nexted++;
                                    if (matchedURL.middleWares.length <= nexted) {
                                        matchedURL.handler(routerObject.req, routerObject.res);
                                    } else {
                                        return matchedURL.middleWares[nexted](routerObject.req, routerObject.res, next);
                                    }
                                }
                            } else {
                                LivenHelpers.logger({
                                    type: "route",
                                    method: routerObject.req.method,
                                    status: routerObject.res.statusCode,
                                    url: req.url,
                                    time: Date.now()
                                });
                                matchedURL.handler(routerObject.req, routerObject.res);
                            }
                        } else {
                            routerObject.res.statusCode = 404;
                            LivenHelpers.logger({
                                type: "route",
                                method: routerObject.req.method,
                                status: routerObject.res.statusCode,
                                url: req.url,
                                time: Date.now()
                            });
                            return this.errorPage ? this.errorPage(routerObject.req, routerObject.res) : routerObject.liven.errorPage(routerObject.req, routerObject.res);
                        }
                    } else {
                        routerObject.res.statusCode = 404;
                        LivenHelpers.logger({
                            type: "route",
                            method: routerObject.req.method,
                            status: routerObject.res.statusCode,
                            url: req.url,
                            time: Date.now()
                        });
                        return this.errorPage ? this.errorPage(routerObject.req, routerObject.res) : routerObject.liven.errorPage(routerObject.req, routerObject.res);
                    }


                } else if (typeof routerObject.req.method == "string" && routerObject.req.method.toLowerCase() == "put") {
                    if (this.initedPuts == false) {
                        this.finalPutRoutes = [];
                        this.putRouters.forEach((router) => {
                            router.url = `${this.base}/${router.url}`.replace(/(https?:\/\/)|(\/)+/g, "$1$2").replace(/^(.+?)\/*?$/, "$1");
                            router.method = router.method.toLowerCase();
                            let routePattern = new URLPattern(router.url);
                            routePattern.class = this;
                            let values = [];
                            routePattern.ast.map((tag) => {
                                values.push(tag.value)
                            });
                            values = values.join("");
                            router.value = values.replace(/(https?:\/\/)|(\/)+/g, "$1$2").replace(/^(.+?)\/*?$/, "$1");
                            this.finalPutRoutes.push(routePattern);
                        });
                        this.initedPuts = true;
                    }
                    let matchedFinal;
                    routerObject.req.url = routerObject.req.pathname;
                    let matchedRe = routerObject.req.url;
                    this.finalPutRoutes.forEach((r) => {
                        matchedFinal = r.match(routerObject.req.url);
                        if (matchedFinal) {
                            let values = [];
                            r.ast.map((tag) => {
                                values.push(tag.value)
                            });
                            values = values.join("");
                            matchedRe = values.replace(/(https?:\/\/)|(\/)+/g, "$1$2").replace(/^(.+?)\/*?$/, "$1");
                            req.params = matchedFinal;
                        }
                    })
                    let matchedURL = this.putRouters.find((router) => {
                        return router.value == matchedRe
                    });
                    if (matchedURL) {
                        if (matchedURL.method.toLowerCase() == "put") {
                            routerObject.res.statusCode = 200;
                            if (matchedURL.middleWares && matchedURL.middleWares.length > 0) {
                                var nexted = 0;
                                matchedURL.middleWares[0](routerObject.req, routerObject.res, next);

                                function next() {
                                    nexted++;
                                    if (matchedURL.middleWares.length <= nexted) {
                                        matchedURL.handler(routerObject.req, routerObject.res);
                                    } else {
                                        return matchedURL.middleWares[nexted](routerObject.req, routerObject.res, next);
                                    }
                                }
                            } else {
                                LivenHelpers.logger({
                                    type: "route",
                                    method: routerObject.req.method,
                                    status: routerObject.res.statusCode,
                                    url: req.url,
                                    time: Date.now()
                                });
                                matchedURL.handler(routerObject.req, routerObject.res);
                            }
                        } else {
                            routerObject.res.statusCode = 404;
                            LivenHelpers.logger({
                                type: "route",
                                method: routerObject.req.method,
                                status: routerObject.res.statusCode,
                                url: req.url,
                                time: Date.now()
                            });
                            return this.errorPage ? this.errorPage(routerObject.req, routerObject.res) : routerObject.liven.errorPage(routerObject.req, routerObject.res);
                        }
                    } else {
                        routerObject.res.statusCode = 404;
                        LivenHelpers.logger({
                            type: "route",
                            method: routerObject.req.method,
                            status: routerObject.res.statusCode,
                            url: req.url,
                            time: Date.now()
                        });
                        return this.errorPage ? this.errorPage(routerObject.req, routerObject.res) : routerObject.liven.errorPage(routerObject.req, routerObject.res);
                    }
                } else if (typeof routerObject.req.method == "string" && routerObject.req.method.toLowerCase() == "patch") {
                    if (this.initedPatches == false) {
                        this.finalPatchRoutes = [];
                        this.patchRouters.forEach((router) => {
                            router.url = `${this.base}/${router.url}`.replace(/(https?:\/\/)|(\/)+/g, "$1$2").replace(/^(.+?)\/*?$/, "$1");
                            router.method = router.method.toLowerCase();
                            let routePattern = new URLPattern(router.url);
                            routePattern.class = this;
                            let values = [];
                            routePattern.ast.map((tag) => {
                                values.push(tag.value)
                            });
                            values = values.join("");
                            router.value = values.replace(/(https?:\/\/)|(\/)+/g, "$1$2").replace(/^(.+?)\/*?$/, "$1");
                            this.finalPatchRoutes.push(routePattern);
                        });
                        this.initedPatches = true;
                    }
                    let matchedFinal;
                    routerObject.req.url = routerObject.req.pathname;
                    let matchedRe = routerObject.req.url;
                    this.finalPatchRoutes.forEach((r) => {
                        matchedFinal = r.match(routerObject.req.url);
                        if (matchedFinal) {
                            let values = [];
                            r.ast.map((tag) => {
                                values.push(tag.value)
                            });
                            values = values.join("");
                            matchedRe = values.replace(/(https?:\/\/)|(\/)+/g, "$1$2").replace(/^(.+?)\/*?$/, "$1");
                            req.params = matchedFinal;
                        }
                    })
                    let matchedURL = this.patchRouters.find((router) => {
                        return router.value == matchedRe
                    });
                    if (matchedURL) {
                        if (matchedURL.method.toLowerCase() == "patch") {
                            routerObject.res.statusCode = 200;
                            if (matchedURL.middleWares && matchedURL.middleWares.length > 0) {
                                var nexted = 0;
                                matchedURL.middleWares[0](routerObject.req, routerObject.res, next);

                                function next() {
                                    nexted++;
                                    if (matchedURL.middleWares.length <= nexted) {
                                        matchedURL.handler(routerObject.req, routerObject.res);
                                    } else {
                                        return matchedURL.middleWares[nexted](routerObject.req, routerObject.res, next);
                                    }
                                }
                            } else {
                                LivenHelpers.logger({
                                    type: "route",
                                    method: routerObject.req.method,
                                    status: routerObject.res.statusCode,
                                    url: req.url,
                                    time: Date.now()
                                });
                                matchedURL.handler(routerObject.req, routerObject.res);
                            }
                        } else {
                            routerObject.res.statusCode = 404;
                            LivenHelpers.logger({
                                type: "route",
                                method: routerObject.req.method,
                                status: routerObject.res.statusCode,
                                url: req.url,
                                time: Date.now()
                            });
                            return this.errorPage ? this.errorPage(routerObject.req, routerObject.res) : routerObject.liven.errorPage(routerObject.req, routerObject.res);
                        }
                    } else {
                        routerObject.res.statusCode = 404;
                        LivenHelpers.logger({
                            type: "route",
                            method: routerObject.req.method,
                            status: routerObject.res.statusCode,
                            url: req.url,
                            time: Date.now()
                        });
                        return this.errorPage ? this.errorPage(routerObject.req, routerObject.res) : routerObject.liven.errorPage(routerObject.req, routerObject.res);
                    }
                } else if (typeof routerObject.req.method == "string" && routerObject.req.method.toLowerCase() == "delete") {
                    if (this.initedDeletes == false) {
                        this.finalDeleteRoutes = [];
                        this.deleteRouters.forEach((router) => {
                            router.url = `${this.base}/${router.url}`.replace(/(https?:\/\/)|(\/)+/g, "$1$2").replace(/^(.+?)\/*?$/, "$1");
                            router.method = router.method.toLowerCase();
                            let routePattern = new URLPattern(router.url);
                            routePattern.class = this;
                            let values = [];
                            routePattern.ast.map((tag) => {
                                values.push(tag.value)
                            });
                            values = values.join("");
                            router.value = values.replace(/(https?:\/\/)|(\/)+/g, "$1$2").replace(/^(.+?)\/*?$/, "$1");
                            this.finalDeleteRoutes.push(routePattern);
                        });
                        this.initedDeletes = true;
                    }
                    let matchedFinal;
                    routerObject.req.url = routerObject.req.pathname;
                    let matchedRe = routerObject.req.url;
                    this.finalDeleteRoutes.forEach((r) => {
                        matchedFinal = r.match(routerObject.req.url);
                        if (matchedFinal) {
                            let values = [];
                            r.ast.map((tag) => {
                                values.push(tag.value)
                            });
                            values = values.join("");
                            matchedRe = values.replace(/(https?:\/\/)|(\/)+/g, "$1$2").replace(/^(.+?)\/*?$/, "$1");
                            req.params = matchedFinal;
                        }
                    })
                    let matchedURL = this.deleteRouters.find((router) => {
                        return router.value == matchedRe
                    });
                    if (matchedURL) {
                        if (matchedURL.method.toLowerCase() == "delete") {
                            routerObject.res.statusCode = 200;
                            if (matchedURL.middleWares && matchedURL.middleWares.length > 0) {
                                var nexted = 0;
                                matchedURL.middleWares[0](routerObject.req, routerObject.res, next);

                                function next() {
                                    nexted++;
                                    if (matchedURL.middleWares.length <= nexted) {
                                        matchedURL.handler(routerObject.req, routerObject.res);
                                    } else {
                                        return matchedURL.middleWares[nexted](routerObject.req, routerObject.res, next);
                                    }
                                }
                            } else {
                                LivenHelpers.logger({
                                    type: "route",
                                    method: routerObject.req.method,
                                    status: routerObject.res.statusCode,
                                    url: req.url,
                                    time: Date.now()
                                });
                                matchedURL.handler(routerObject.req, routerObject.res);
                            }
                        } else {
                            routerObject.res.statusCode = 404;
                            LivenHelpers.logger({
                                type: "route",
                                method: routerObject.req.method,
                                status: routerObject.res.statusCode,
                                url: req.url,
                                time: Date.now()
                            });
                            return this.errorPage ? this.errorPage(routerObject.req, routerObject.res) : routerObject.liven.errorPage(routerObject.req, routerObject.res);
                        }
                    } else {
                        routerObject.res.statusCode = 404;
                        LivenHelpers.logger({
                            type: "route",
                            method: routerObject.req.method,
                            status: routerObject.res.statusCode,
                            url: req.url,
                            time: Date.now()
                        });
                        return this.errorPage ? this.errorPage(routerObject.req, routerObject.res) : routerObject.liven.errorPage(routerObject.req, routerObject.res);
                    }
                } else {
                    routerObject.res.statusCode = 404;
                    LivenHelpers.logger({
                        type: "route",
                        method: routerObject.req.method,
                        status: routerObject.res.statusCode,
                        url: req.url,
                        time: Date.now()
                    });
                    return this.errorPage ? this.errorPage(routerObject.req, routerObject.res) : routerObject.liven.errorPage(routerObject.req, routerObject.res);
                }
            }
            // method to listen on the route happens to do something
        onRoute() {
                return new Promise((reslove, reject) => {})
            }
            // method to use another router class inside this router class
        useRouter(RouterClass) {
            const self = routerObject;
            let newClass = new RouterClass({});
            newClass.build();
            newClass.base = newClass.base || this.base;
            newClass._setBase();
            self.classesRoutes[this.base] = this;
            newClass.globalMiddleWares = newClass.globalMiddleWares || [];
            this._pushGlobalMiddleWares(newClass.getRouters, newClass.globalMiddleWares, newClass.cors);
            this._pushGlobalMiddleWares(newClass.postRouters, newClass.globalMiddleWares, newClass.cors);
            this._pushGlobalMiddleWares(newClass.putRouters, newClass.globalMiddleWares, newClass.cors);
            this._pushGlobalMiddleWares(newClass.patchRouters, newClass.globalMiddleWares, newClass.cors);
            this._pushGlobalMiddleWares(newClass.deleteRouters, newClass.globalMiddleWares, newClass.cors);
            if(this.base !== newClass.base) {
                newClass._resolveRoutesWithBase()
            }
            self.classesRoutes[this.base] = this;
            this.getRouters.push(...newClass.getRouters)
            this.postRouters.push(...newClass.postRouters)
            this.putRouters.push(...newClass.putRouters)
            this.patchRouters.push(...newClass.patchRouters)
            this.deleteRouters.push(...newClass.deleteRouters)
        }
        // method to use middleware
        use(middleWare) {
            if(typeof middleWare == "function") {
                this.globalMiddleWares.push(middleWare);
            } else {
                throw "use accepts only functions";
            }
        }
    },
    popState: function() {
        const self = this;
        let req = this.req;
        let res = this.res;
        self.updateRequest(req);
        window.addEventListener("popstate", (e) => {
            this.req.pathname = location.pathname;
            this.req.url = location.pathname;
            if (e.state) {
                let url = e.state.url;
                let requests = [];
                self.bases.map((base) => {
                    if (url.startsWith(base)) {
                        requests.push(base);
                    }
                })
                let matchedReq = requests[requests.length > 1 ? requests.length - 1 : 0];
                if (matchedReq) {
                    self.updateRequest(self.req);
                    self.req.method = "get";
                    let matchedClass = this.classesRoutes[matchedReq];
                    if (matchedClass) {
                        if (matchedClass.globalMiddleWares) {
                            if (matchedClass.globalMiddleWares.length > 0) {
                                var nexted = 0;
                                matchedClass.req = self.req;
                                matchedClass.res = self.res;
                                matchedClass.globalMiddleWares[0](self.req, self.res, next);

                                function next() {
                                    nexted++;
                                    if (matchedClass.globalMiddleWares.length <= nexted) {
                                        matchedClass.init();
                                    } else {
                                        return matchedClass.globalMiddleWares[nexted](self.req, self.res, next);
                                    }
                                }
                            } else {
                                matchedClass.init();
                            }
                        } else {
                            matchedClass.init();
                        }
                    }
                } else {
                    self.res.statusCode = 404;
                    LivenHelpers.logger({
                        type: "route",
                        method: self.req.method,
                        status: self.res.statusCode,
                        url: req.url,
                        time: Date.now()
                    });
                    return self.liven.errorPage(self.req, self.res)
                }
            } else {
                self.res.statusCode = 404;
                LivenHelpers.logger({
                    type: "route",
                    method: self.req.method,
                    status: self.res.statusCode,
                    url: req.url,
                    time: Date.now()
                });
                return self.liven.errorPage(self.req, self.res)
            }
            self._emitter.emit("change", self.req, self.res);
        })
    },
    onload: function() {
        const self = this;
        window.addEventListener("load", () => {
            self.res.redirect =  self.redirect.bind(self.res)
            self.updateRequest(self.req);
            let parsedUrl = new URL(window.location.href);
            let href = parsedUrl.pathname;
            let requests = [];
            history.pushState({
                url: href,
                title: document.title,
            }, document.title, href)
            self.req.pathname = window.location.pathname;
            self.req.url = window.location.pathname;
            self._emitter.emit("change", self.req, self.res);
            self.bases.map((base) => {
                if (href.startsWith(base)) {
                    requests.push(base);
                }
            })
            let matchedReq = requests[requests.length > 1 ? requests.length - 1 : 0];
            if (matchedReq) {
                self.updateRequest(self.req);
                self.req.method = "get";
                let matchedClass = this.classesRoutes[matchedReq];
                if (matchedClass) {
                    if (matchedClass.globalMiddleWares) {
                        if (matchedClass.globalMiddleWares.length > 0) {
                            var nexted = 0;
                            matchedClass.req = self.req;
                            matchedClass.res = self.res;
                            matchedClass.globalMiddleWares[0](self.req, self.res, next);

                            function next() {
                                nexted++;
                                if (matchedClass.globalMiddleWares.length <= nexted) {
                                    matchedClass.init();
                                } else {
                                    return matchedClass.globalMiddleWares[nexted](self.req, self.res, next);
                                }
                            }
                        } else {
                            matchedClass.init();
                        }
                    } else {
                        matchedClass.init();
                    }
                }
            } else {
                self.res.statusCode = 404;
                LivenHelpers.logger({
                    type: "route",
                    method: self.req.method,
                    status: self.res.statusCode,
                    url: self.req.url,
                    time: Date.now()
                });
                return self.liven.errorPage(self.req, self.res)
            }
        })
    },
    // method for submitting forms
    submitForms: function() {
        const self = this;
        document.addEventListener("submit", function(e) {
            // try {
            if (e.target.getAttribute("clientPosting") === "true") {
                var submitionCount = 0;
                e.preventDefault();
                var data = {};
                var elements = {};
                e.target.method = e.target.method.toLowerCase();
                data.form = e.target;
                self.req.action = data.form.action;
                var inputs = data.form.querySelectorAll("input");
                var textarea = data.form.querySelectorAll("textarea");
                var selects = data.form.querySelectorAll("select");
                selects.forEach(function(select, i) {
                    if (select.length > 0) {
                        var name = select.getAttribute("name");
                        data[name] = select.value;
                        elements[name] = select;
                    }
                });
                inputs.forEach(function(input, i) {
                    if (inputs.length > 0) {
                        var name = input.getAttribute("name");
                        data[name] = input.value;
                        elements[name] = input;
                    }
                });
                textarea.forEach((area, i) => {
                    if (textarea.length > 0) {
                        var textareaName = area.getAttribute("name");
                        data[textareaName] = area.value;
                        elements[text()] = area;
                    }
                })
                data.elements = elements;
                var act = new RegExp(location.origin, "gi");
                act = act.exec(self.req.action);
                var action = self.req.action.replace(act, "");
                let requests = [];
                self.bases.map((base) => {
                    if (action.startsWith(base)) {
                        requests.push(base);
                    }
                })
                let matchedReq = requests[requests.length > 1 ? requests.length - 1 : 0];
                if (matchedReq) {
                    self.req.data = data;
                    self.req.method = e.target.getAttribute("method") ? e.target.getAttribute("method").toLowerCase() !== "get" ? e.target.getAttribute("method").toLowerCase() : "post" : "post";
                    routerObject.req.action = action;
                    routerObject.req.url = action;
                    routerObject.req.pathname = action;
                    let matchedClass = self.classesRoutes[matchedReq];
                    if (matchedClass) {
                        if (matchedClass.globalMiddleWares) {
                            if (matchedClass.globalMiddleWares.length > 0) {
                                var nexted = 0;
                                matchedClass.req = self.req;
                                matchedClass.res = self.res;
                                matchedClass.globalMiddleWares[0](self.req, self.res, next);

                                function next() {
                                    nexted++;
                                    if (matchedClass.globalMiddleWares.length <= nexted) {
                                        matchedClass.init();
                                    } else {
                                        return matchedClass.globalMiddleWares[nexted](self.req, self.res, next);
                                    }
                                }
                            } else {
                                matchedClass.init();
                            }
                        } else {
                            matchedClass.init();
                        }
                    }
                } else {
                    self.res.statusCode = 404;
                    LivenHelpers.logger({
                        type: "route",
                        method: self.req.method,
                        status: self.res.statusCode,
                        url: req.url,
                        time: Date.now()
                    });
                    return self.liven.errorPage(self.req, self.res)
                }

            }
        });
    }
}
export default routerObject;