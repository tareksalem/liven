/*
==============================
@param liven

http and ajax module
==============================

 */
// http module and ajax
function HTTP() {
    var xhr = new XMLHttpRequest();
    this.get = function(options, cb) {
        if (options.fetch === true) {
            var resArr = [];
            var err, response = {};
            return fetch(options.url, options)
                .then(function(res) {
                    response.res = res;
                    return res.json();
                })
                .then(function(data) {
                    response.data = data;
                    resArr.push(response);
                    return cb(err, response);
                })
                .catch(function(error) {
                    err = error;
                    resArr.push({
                        err: err
                    });
                    return cb(err, response);
                })
                .then(function(component) {
                    return component;
                });
        } else {
            xhr.open('get', options.url, options.async ? options.async : true);
            if (options.type) {
                this.responseType = options.type;
            }
            if (options.headers) {
                Object.keys(options.headers).forEach(function(index) {
                    xhr.setRequestHeader(index, options.headers[index]);
                });
            }
            xhr.onreadystatechange = function() {
                if (this.readyState === 0) {
                    if (options.beforStart) {
                        options.beforStart();
                    }
                }
                if (this.readyState === 1) {
                    if (options.onStart) {
                        options.onStart(xhr);
                    }
                }
                if (this.readyState === 3) {
                    if (options.onProgress) {
                        options.onProgress(xhr);
                    }
                }
                var err;
                var data;
                if (this.readyState === 4) {
                    if (
                        this.status === 404 ||
                        this.status === 403 ||
                        this.status === 500
                    ) {
                        err = {
                            status: this.status
                        };
                    }
                    if (this.readyState === 4 && this.status === 200) {
                        data = {
                            response: this.response,
                            responseText: this.responseText,
                            responseUrl: this.responseURL,
                            responseXML: this.responseXML,
                            responseType: this.responseType,
                        };
                    }
                    return cb(err, data);
                }
            };
            xhr.send();
        }
    };
    this.post = function(options, cb) {
        if (options.fetch === true) {
            var response = {};
            options.method = options.method !== undefined &&
                options.method.toLowerCase() === 'post' ?
                options.method :
                'post';
            options.body = JSON.stringify(options.data);
            fetch(options.url, options)
                .then(function(res) {
                    response.res = res;
                    return res.json();
                })
                .then(function(data) {
                    response.data = data;
                    return cb(false, response);
                })
                .catch(function(err) {
                    return cb(err, false);
                });
        } else if (options.fetch === false || options.fetch === undefined) {
            if (options.fetch !== undefined) {
                delete options.fetch;
            }
            var err;
            var data;
            var formData = new FormData();
            if (options.url) {
                xhr.open('post', options.url, options.async ? options.async : true);
                if (options.headers) {
                    Object.keys(options.headers).forEach(function(index) {
                        xhr.setRequestHeader(index, options.headers[index]);
                    });
                }
                if (options.fullAjax) {
                    return fullAjax(this);
                }
                if (options.data) {
                    if (options.upload) {
                        var file;
                        file = options.upload.file;
                        Array.from(file).forEach(function(fil) {
                            formData.append(options.upload.fileName, fil);
                        });
                        if (options.upload.onload) {
                            xhr.upload.onload = function(e) {
                                return options.upload.onload(e);
                            };
                        }
                        if (options.upload.onprogress) {
                            xhr.upload.onprogress = function(e) {
                                return options.upload.onprogress(e);
                            };
                        }
                        if (options.upload.onerror) {
                            xhr.upload.onerror = function(e) {
                                return options.upload.onerror(e);
                            };
                        }
                    }
                    if (typeof options.data === 'object') {
                        if (options.headers['content-type'] === 'application/json') {
                            options.data = JSON.stringify(options.data);
                        } else {
                            Object.keys(options.data).forEach(function(item) {
                                formData.append(item, options.data[item]);
                            });
                            options.data = formData;
                        }
                    } else if (typeof options.data === 'string') {
                        xhr.setRequestHeader(
                            'Content-type',
                            'application/x-www-form-urlencoded'
                        );
                    }
                    xhr.setRequestHeader('ajax', 'liven');
                    if (options.onabort) {
                        xhr.onabort = function(e) {
                            return options.onabort(e);
                        };
                    }
                    xhr.onreadystatechange = function() {
                        if (this.readyState === 0) {
                            if (options.beforStart) {
                                options.beforStart();
                            }
                        }
                        if (this.readyState === 1) {
                            if (options.onStart) {
                                options.onStart();
                            }
                        }
                        if (this.readyState === 3) {
                            if (options.onProgress) {
                                options.onProgress();
                            }
                        }

                        if (
                            this.status === 404 ||
                            this.status === 403 ||
                            this.status === 500
                        ) {
                            err = {
                                status: this.status
                            };
                        }
                        if (this.readyState === 4 && this.status === 200) {
                            data = {
                                response: this.response,
                                responseText: this.responseText,
                                responseUrl: this.responseURL,
                                responseXML: this.responseXML,
                                responseType: this.responseType,
                            };
                        }
                        if (cb) {
                            return cb(err, data);
                        }
                    };
                    xhr.send(options.data);
                } else {
                    err = new Error('bad request');
                    return console.error('cannot send empty data');
                }
            } else {
                err = new Error('bad request');
                return console.error('cannot send empty url');
            }
        }
    };
}
export default HTTP