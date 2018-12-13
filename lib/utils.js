const deasync = require('deasync');
const deepmerge = require('deepmerge');
const request = require('request');
const url = require('url');

var _apiCallSync = deasync(function (options, cb) {
    request(options, function (error, response, body) {
        var data = {
            body: body,
            statusCode: response.statusCode,
            statusMessage: response.statusMessage
        };
        if (error) {
            cb(error, null);
        }
        else {
            cb(null, data);
        }
    });
});

function _apiCall(options) {
    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            var parseError = false;
            if (error) {
                reject(error);
            }
            else {

                var res = {};
                res.body = body;
                res.statusCode = response.statusCode;
                res.statusMessage = response.statusMessage;


                var bodyObject;
                if (typeof body === 'string') {
                    try {
                        bodyObject = JSON.parse(body);
                    }
                    catch (err) {
                        reject(new Error("Unable to parse API Call response"));
                        parseError = true;
                    }
                }
                else {
                    bodyObject = body;
                }
                if (!parseError) {
                    res.body = bodyObject;
                    resolve(res);
                }
            }
        });
    });
}

/***
 * Construct a _Utils instance. It has query, headers and body as property. They will be deep merged with options for calling API
 * @private
 */
function _Utils() {
    this.headers = {};
    this.body = {};
    this.qs = {};
    this.endPoint = null;
}

/***
 * Call API in sync manner
 * @param url: URL without query parameters
 * @param options: query: {}, headers: {}, body: {}, url:String, method:String e.g."GET"
 */
_Utils.prototype.callAPISync = function (options) {
    return _apiCallSync(options);
};

var methods = ["get", "put", "delete", "post", "patch", "head", "options"];
methods.forEach(function (method) {
    _Utils.prototype[method] = function (options) {
        var url = (this.endPoint) ? this.endPoint + '/' + options.path : options.path;
        url = url.replace(/\/\//, "/");
        return _apiCall({
            method: method.toUpperCase(),
            url: url,
            qs: (options.qs) ? deepmerge(options.qs, this.qs) : this.qs,
            headers: (options.headers) ? deepmerge(options.headers, this.headers) : this.headers,
            body: (options.body) ? deepmerge(options.body, this.body) : this.body,
            json: true
        });
    };
    _Utils.prototype[`${method}Sync`] = function (options) {
        this.endPoint = (this.endPoint)? this.endPoint.replace(/\/+$/, "") : "";
        options.path = (options.path) ? options.path.replace(/^\/+/, "") : options.path;
        var url = (this.endPoint) ? this.endPoint + '/' + options.path : options.path;
        return _apiCallSync({
            method: method.toUpperCase(),
            url: url,
            qs: (options.qs) ? deepmerge(options.qs, this.qs) : this.qs,
            headers: (options.headers) ? deepmerge(options.headers, this.headers) : this.headers,
            body: (options.body) ? deepmerge(options.body, this.body) : this.body,
            json: true
        });
    };
});

module.exports = _Utils;