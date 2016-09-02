/**
 * Name: apiService.js
 * Description: Helper file for get/post/put/patch/delete request on server side
 * author: [Vishal Kumar]
 * Note: You can follow require.js documentation as we are using that lib only
 * with some additional inputs
 *
 * e.g. request.get('/data/v1/listing/12312')
 * request.get(apiConfig.priceTrend({query: {a: 'b'}}))
 * request.post(apiConfig.enquiries(), {req: req, res: res, qs: {a: 'b'}})
 */

'use strict';

const path = require('path'),
    async = require('async');

const API_URLS = [
    {
        regex: new RegExp(/^\/?pixie/),
        type: 'pixie',
        baseUrl: process.env.BASE_URL_PIXIE,
        isMicroServiceUrl: true
    },
    {
        regex: new RegExp(/^\/?compass/),
        type: 'compass',
        baseUrl: process.env.BASE_URL_COMPASS,
        isMicroServiceUrl: true
    },
    {
        regex: new RegExp(/^\/?madelyne/),
        type: 'madelyne',
        baseUrl: process.env.BASE_URL_MADELYNE,
        isMicroServiceUrl: true
    },
    {
        regex: new RegExp(/^\/?madrox/),
        type: 'madrox',
        baseUrl: process.env.BASE_URL_MADROX,
        isMicroServiceUrl: true
    },
    {
        regex: new RegExp(/^\/?zenithar/),
        type: 'zenithar',
        baseUrl: process.env.BASE_URL_ZENITHAR,
        isMicroServiceUrl: true
    },
    {
        regex: new RegExp(/^\/?dawnstar/),
        type: 'dawnstar',
        baseUrl: process.env.BASE_URL_DAWNSTAR,
        isMicroServiceUrl: true
    },
    {
        regex: new RegExp(/^\/?columbus/),
        type: 'columbus',
        baseUrl: process.env.BASE_URL_COLUMBUS,
        isMicroServiceUrl: true
    },
    {
        regex: new RegExp(/^\/?petra/),
        type: 'petra',
        baseUrl: process.env.BASE_URL_PETRA,
        isMicroServiceUrl: true
    },
    {
        regex: new RegExp(/^\/?sapphire/),
        type: 'sapphire',
        baseUrl: process.env.BASE_URL_SAPPHIRE,
        isMicroServiceUrl: true
    },
    {
        regex: new RegExp(/^\/?kira/),
        type: 'kira',
        baseUrl: process.env.BASE_URL_KIRA,
        isMicroServiceUrl: true
    },
    {
        regex: new RegExp(/^\/?xhr/),
        type: 'xhr',
        baseUrl: process.env.BASE_URL_SELLER
    },
    {
        regex: new RegExp(/^\/?blog/),
        type: 'makaan-iq',
        baseUrl: process.env.BASE_URL_MAKAANIQ
    },
    {
        regex: new RegExp(/^\/?api/),
        type: 'chat',
        baseUrl: process.env.BASE_URL_CHAT
    }
];

const request = require('request').defaults({
        timeout: 10000,
        forever: true,
        pool: {
            maxSockets: 1000
        }
    }),
    utilService = require('./utilService'),
    _ = utilService._,
    apiConfig = require('configs/apiConfig'),
    logger = require('./loggerService'),
    IS_DUMMY = process.env.DUMMY_API === "true" ? true : false,
    SKIP_MICRO_SERVICE_URL = process.env.SKIP_MICRO_SERVICE_URL === "false" ? false : true,
    BASE_URL = process.env.BASE_URL;

var apiService = {};

function _createCompositAPI(apis) {
    let s = apiConfig.composite().url;
    for (var i = 0; i < apis.length; i++) {
        s += i ? "&" : "";
        let api;
        if (_.isObject(apis[i]) && apis[i].url) {
            api = apis[i].url;
        } else {
            api = apis[i];
        }
        if (!apis[i].ignoreDomain) {
            api = utilService.updateQueryStringParameter(api, "sourceDomain", 'Makaan');
        }
        s += "api=" + encodeURIComponent(api);
    }
    return s;
}

// check if composite apis array is in required format of not
function _isMockUrlAvailableForComposite(apis) {
    if (Array.isArray(apis) && typeof apis[0] == 'object' && apis[0].mockUrl) {
        return true;
    }
    return false;
}

function _requestAPI(type, params) {
    //ignoreReq for ignoring request object when api call is not started by client
    let ignoreReq = params.ignoreReq || false;
    //Check whether api call is primary or not
    let isPrimary = params.isPrimary || false;
    let reqObject = params.req;
    let urlString = path.join(params.baseUrl + (params.url || params.uri)).replace("http:","http:/");
    urlString = utilService.updateQueryStringParameter(urlString, _.keys(params.qs), _.values(params.qs));
    let apiStartTime = new Date();

    let promise = new Promise((resolve, reject) => {
        let res = params.res;

        logger.profile('API --- ' + urlString);

        //apiMap used for debugging
        if(!reqObject && !ignoreReq){
            logger.warn('Pass req object in all API call', urlString);
        }

        // remove extra parameters which require.js doesn't require
        delete params.req;
        delete params.res;
        delete params.mockUrl;

        params.qsStringifyOptions =  {
            encoding: false
        };

        request[type](params, (error, response, body) => {

            logger.profile('API --- ' + urlString);
            if (error) {
                logger.error('ERROR IN API', error.code, 'for', urlString);
                if (error.code === 'ETIMEDOUT') {
                    error.status = 408;
                } else {
                    error.status = response && response.statusCode;
                }

                return reject(error);
            }

            if (res) {
                _setResponseHeaders(res, response);
            }

            if (response.statusCode !== 200 || (body && typeof body.statusCode !== "undefined" && !(body.statusCode === '2XX' || body.statusCode === 200) )) {
                logger.error('ERROR IN API ---', urlString);
                if (params.body || params.form) {
                    logger.error('API DATA:', JSON.stringify(params.body || params.form));
                }
                let errorMessage = 'ERROR IN API';
                if (body && body.error) {
                    errorMessage = body.error.msg;
                    logger.error(body.error.msg);
                }

                let err = new Error(errorMessage);
                err.status = (response.statusCode === 200 || response.statusCode === 404) ? 500 : response.statusCode;
                err.body = body;
                return reject(err);
            }

            if (params.isComposite && body.data) {
                let CompositeData = {},
                    newKey;
                for (let key in body.data) {
                    newKey = utilService.removeQueryStringParameter(key, 'sourceDomain');
                    CompositeData[newKey] = body.data[key];
                }
                body.data = CompositeData;
            }

            resolve(body);
        });
    });
    if (reqObject && reqObject.apiMap) {
        promise.then((result) => {
            reqObject.apiMap[urlString] = {
                statusCode: typeof result === "object" ? result.statusCode: '2XX',
                time: `${new Date() - apiStartTime} ms`,
                isPrimary: isPrimary
            };
        }, (err) => {
            reqObject.apiMap[urlString] = {
                statusCode: err.status || '5XX',
                time: `${new Date() - apiStartTime} ms`,
                isPrimary: isPrimary
            };
        }).catch(err => {
            console.log(err);
        });
    }

    return promise;
}

function _createMockCompositAPI(apis) {
    var output = {
        statusCode: "2XX",
        version: "A",
        data: {}
    };

    for (var i = 0; i < apis.length; i++) {
        (function(index) {
            try {
                var mockUrl = apis[index].mockUrl,
                    url = apis[index].url;
                logger.info("Calling mock API for composite: " + mockUrl);
                output.data[url] = require(mockUrl);
            } catch (ex) {
                logger.error('composite mock error: ', ex.stack);
            }

        })(i);
    }

    return output;
}

/**
 *  Return a promise
 * @param  {Object} options
 * @return {Object} promise object containing the result
 */
function _getIP(req = {}) {
    var ip;
    if (req.headers && req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else {
        ip = req.ip;
    }

    return ip;
}

function _getHeaders(params, req, extraConfig={}) {
    let headers = req.headers || {};
    let reqHeaders = {};
    if (headers['cookie']) {
        reqHeaders['Cookie'] = headers['cookie'];
    }
    reqHeaders['User-Agent'] = headers['user-agent'];
    reqHeaders['referer'] = headers['referer'];

    if(!extraConfig.noClientIP){
        reqHeaders['Client-IP'] = _getIP(req);
    }
    reqHeaders['Accept-Encoding'] = 0;

    if (headers['content-type']) {
        reqHeaders['Content-Type'] = headers['content-type'];
    }


    return reqHeaders;
}

function _setResponseHeaders(res, apiResponse) {
    if (res && !res.headersSent) { //write cookie and other header values to response
        if (apiResponse['headers']['set-cookie']) {
            res.setHeader('Set-Cookie', apiResponse['headers']['set-cookie']);
        }

        if (apiResponse.headers['content-encoding']) {
            res.setHeader('Content-Encoding', apiResponse.headers['content-encoding']);
        }

        if (apiResponse.headers['content-type']) {
            res.setHeader('Content-Type', apiResponse.headers['content-type']);
        }

    }
}

// organize params for get, patch, post, put, head, del
function _initParams(uri, options) {
    let url = typeof uri === 'string' ? uri : uri.url;
    let baseUrl = getAPIBaseUrl(url);
    let extraConfig = {};

    let params = {
        baseUrl: baseUrl,
        json: true
    };

    if (typeof options === 'object') {
        // handle if options.baseURL is passed instead of options.baseUrl
        if (options.baseURL) {
            options.baseUrl = options.baseURL;
            delete options.baseURL;
        }
        _.extend(params, options);

        //passing req by reference for storing the api map
        if(params.req){
            delete params.req;
        }
        params.req = options.req;
    }

    if (typeof uri === 'string') {
        _.extend(params, {
            url: uri
        });
    } else {
        _.extend(params, uri);
        extraConfig = uri.extra;
    }

    if (params.req) {
        params.headers = _getHeaders(params, params.req, extraConfig);
    }

    if (params.baseUrl === null) {
        throw new Error('No micro service url found for ' + url);
    }

    return params;
}

/**
 * Helper for GET request
 * @param  {String|Object} uri can be a url string or object from apiConfig function or request.get option
 * @param  {[type]} options other options
 * Note: if you want to send/set cookies, pass req and res in options
 * @return {Object} get Promise
 * e.g. request.get('/data/v1/listing/12312')
 * request.get(apiConfig.priceTrend({query: {a: 'b'}}), {req: req})
 */
apiService.get = function(uri, options) {
    let params = _initParams(uri, options);

    // let urlString = path.join(params.baseUrl + (params.url || params.uri));
    if (!params.ignoreDomain) {
        params.qs = params.qs || {};
        params.qs.sourceDomain = 'Makaan';
    }

    // logger.info('calling get api', urlString, 'qs: ' + JSON.stringify(params.qs));

    let mockRes;
    let dummy = typeof params.dummy !== 'undefined' ? params.dummy : IS_DUMMY;

    if (params.isComposite && dummy && _isMockUrlAvailableForComposite(params.url)) {
        mockRes = _createMockCompositAPI(params.url);
        return new Promise(resolve => resolve(mockRes));
    } else if (!params.isComposite && dummy && params.mockUrl && !params.ignoreDummmy) {
        logger.info("Calling mock API: " + params.mockUrl);
        mockRes = require(params.mockUrl);
        return new Promise(resolve => resolve(mockRes));
    }

    return _requestAPI('get', params);
};

// expects array of apis . ie: ['app/v/xyz','app/v/abc']
// options is an object {req:req, res:res} res is optional
apiService.composite = function(apis, options) {

    return apiService.asyncAPIs(apis, options);

    /** Below code is for composite APIs
        Should not be used. */

    var url;

    // logger.info('Composite API Call with apis', JSON.stringify(apis));

    if (IS_DUMMY && _isMockUrlAvailableForComposite(apis)) {
        url = apis;
    } else {
        url = _createCompositAPI(apis);
    }

    let newOptions = _.extend({
        url: url,
        ignoreDomain: true,
        isComposite: true
    }, options);

    return apiService.get(newOptions);
};

apiService.asyncAPIs = function(apis, options) {
    return new Promise((resolve, reject) => {
        async.map(apis,
            function(api, callback) {
                apiService.get(api, options).then((response) => {
                    callback(null, response);
                }, (error) => {
                    logger.error('Error while calling composite APIs: ', JSON.stringify(api), error);
                    callback(error, null);
                });
            },
            function(err, results) {
                if (err) {
                    logger.error('Error while calling composite APIs: ', JSON.stringify(apis), err);
                    reject(err);
                }

                var compositeResponse = {
                        statusCode: "2XX",
                        version: "A",
                        data: {}
                };

                for (var r in results) {
                    if (typeof apis[r] === 'string') {
                        compositeResponse.data[apis[r]] = results[r];
                    } else {
                        compositeResponse.data[apis[r].url] = results[r];
                    }
                }
                resolve(compositeResponse);
            }
        );
    });
};


/**
 * Helper for POST request
 * @param  {String|Object} uri can be a url string or object from apiConfig function or request.post option
 * @param  {[type]} options other options
 * Note: if you want to send/set cookies, pass req and res in options
 * @return {Object} Promise for post request
 * e.g. request.post(apiConfig.enquiries(), {req: req, res: res, qs: {a: 'b'}})
 */
apiService.post = function(uri, options) {
    return _update('post', uri, options);
};

/**
 * Helper for PUT request
 * @param  {String|Object} uri can be a url string or object from apiConfig function or request.put option
 * @param  {[type]} options other options
 * Note: if you want to send/set cookies, pass req and res in options
 * @return {Object} Promise for put request
 */
apiService.put = function(uri, options) {
    return _update('put', uri, options);
};

apiService.patch = function(uri, options) {
    return _update('patch', uri, options);
};

apiService.delete = function(uri, options) {
    return _update('del', uri, options);
};

function _update(type, uri, options) {
    let params = _initParams(uri, options);

    // let urlString = path.join(params.baseUrl + (params.url || params.uri));
    // logger.info(`calling ${type.toUpperCase()} api ${urlString}`, 'qs: ' + JSON.stringify(params.qs));
    // logger.info(`data: ${JSON.stringify(params.body || params.form)}`);

    if (IS_DUMMY && !params.baseURL) {
        logger.info("Calling mock API: " + params.mockUrl);
        var mockRes = require(params.mockUrl);
        return new Promise(resolve => resolve(mockRes));
    }

    return _requestAPI(type, params);
}

apiService.createSelector = function(data) {

    var selector = {},
        i, temp;
    if (data.fields && toString.call(data.fields) == '[object Array]') {
        selector.fields = data.fields;
    } else if (data.fields) {
        selector.fields = [data.fields];
    }
    if (data.filters && toString.call(data.filters) == '[object Array]') {
        selector.filters = {};
        for (i = 0; i < data.filters.length; i++) {
            temp = {};
            if (data.filters[i].type == 'range') {
                temp[data.filters[i].type] = {};
                temp[data.filters[i].type][data.filters[i].key] = {};
                if (data.filters[i].from && !isNaN(data.filters[i].from) && ['undefined','null'].indexOf(data.filters[i].from) == -1) {
                    temp[data.filters[i].type][data.filters[i].key].from = data.filters[i].from;
                }
                if (data.filters[i].to && !isNaN(data.filters[i].to) && ['undefined','null'].indexOf(data.filters[i].to) == -1) {
                    temp[data.filters[i].type][data.filters[i].key].to = data.filters[i].to;
                }
            } else if (data.filters[i].type && data.filters[i].value) {
                temp[data.filters[i].type] = {};
                temp[data.filters[i].type][data.filters[i].key] = data.filters[i].value;
            } else if (data.filters[i].value) {
                temp.equal = {};
                temp['equal'][data.filters[i].key] = data.filters[i].value;
            }
            if (!(temp && Object.keys(temp).length)) {
                continue;
            }

            if (data.filters[i].filter) {
                selector.filters[data.filters[i].filter] = [];
                selector.filters[data.filters[i].filter].push(temp);
            } else {
                selector.filters.and = selector.filters.and ? selector.filters.and : [];
                selector.filters.and.push(temp);
            }

        }
    }
    if (data.paging && toString.call(data.paging) == '[object Object]') {
        selector.paging = {};
        selector.paging.start = data.paging.start || 0;
        selector.paging.rows = data.paging.rows || 5;
    }
    if (data.sort) {
        selector.sort = [];
        temp = {};
        if (toString.call(data.sort) == '[object Array]') {
            for (i = 0; i < data.sort.length; i++) {
                temp.field = data.sort[i].key;
                temp.sortOrder = data.sort[i].order;
                selector.sort.push(temp);
            }
        } else if (toString.call(data.sort) == '[object Object]') {
            temp.field = data.sort.key;
            temp.sortOrder = data.sort.order;
            selector.sort.push(temp);
        }

    }
    if (data.groupBy) {
        selector.groupBy = {};
        selector.groupBy.field = data.groupBy.field;
        selector.groupBy.max = data.groupBy.max;
        selector.groupBy.min = data.groupBy.min;
    }
    if (data.groupSort) {
        selector.groupSort = [];
        temp = {};
        if (toString.call(data.groupSort) == '[object Array]') {
            for (i = 0; i < data.groupSort.length; i++) {
                temp.field = data.groupSort[i].field;
                temp.sortOrder = data.groupSort[i].sortOrder;
                selector.groupSort.push(temp);
            }
        }
    }
    if (data.groupRows) {
        selector.groupRows = data.groupRows;
    }
    return JSON.stringify(selector);
};

function _createFiqlFilter(filters, type = 'and') {
    let filterSeparator = {
            'or': ',',
            'and': ';'
        },
        filterTypes = {
            'equal': '==',
            'notEqual': '!==',
            'ge': '=ge=',
            'le': '=le='
        };
    let finalFilters = '';

    if (filters && toString.call(filters) == '[object Array]') {
        for (let i = 0; i < filters.length; i++) {
            let filter = filters[i],
                filterStr = '';
            type = filter.filter ? filter.filter : type;
            filter.type = filter.type ? filter.type : 'equal';
            if (filter.multiple) {
                filterStr = '(' + _createFiqlFilter(filter.filters, filter.filter) + ')';
            } else {
                if (filterTypes[filter.type]) {
                    filterStr = filter.key + filterTypes[filter.type] + filter.value;
                }
            }
            finalFilters = finalFilters === '' ? filterStr : filterStr + filterSeparator[type] + finalFilters;
        }
    }
    return finalFilters;
}

apiService.createFiqlSelector = function(data) {
    if (!data && _.isEmpty(data)) {
        return;
    }

    let extraKeys = data.extra && Object.keys(data.extra),
        selector = {};
    if (data.fields && toString.call(data.fields) == '[object Array]') {
        selector.fields = data.fields.join(',');
    } else if (data.fields) {
        selector.fields = data.fields;
    }
    if (extraKeys) {
        for (let i = 0; i < extraKeys.length; i++) {
            selector[extraKeys[i]] = data.extra[extraKeys[i]].toString();
        }
    }
    selector.filters = _createFiqlFilter(data.filters);

    return selector;
};

// This function is useful in non-dev mode (qa, beta, prod)
// every API runs in different port that's why need to know which API we
// are calling, which will help in decide base url ultimately
// @param {String} url
function getAPIBaseUrl(url) {
    let filteredAPITypes = API_URLS.filter((apiType) => {
        return url.match(apiType.regex);
    });

    let skipMicroServiceUrl = SKIP_MICRO_SERVICE_URL && filteredAPITypes.length && filteredAPITypes[0].isMicroServiceUrl;

    if (filteredAPITypes.length && (!filteredAPITypes[0].isMicroServiceUrl || !SKIP_MICRO_SERVICE_URL)) {
        return filteredAPITypes[0].baseUrl;
    } else if (SKIP_MICRO_SERVICE_URL) {
        return BASE_URL;
    }

    return null;
}

module.exports = apiService;
