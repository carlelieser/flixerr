'use strict';

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

var proxyList = function () {
    var request = require('request');
    var cheerio = require('cheerio');
    var url = 'https://proxy.rudnkh.me/txt';

    var getProxies = function getProxies(text) {
        return new Promise(function (resolve, reject) {
            var proxies = text.split('\n');
            for (var i = 0; i < proxies.length; i++) {
                var info = proxies[i].split(':');
                var proxy = {
                    ip: info[0],
                    port: info[1]
                };

                proxies[i] = proxy;
            }

            resolve(proxies);
        }).catch(function (err) {
            console.log(err);
        });
    };

    var listProxies = function listProxies() {
        return new Promise(function (resolve, reject) {
            request(url, function (err, response, text) {
                if (!err) {
                    getProxies(text).then(function (proxies) {
                        resolve(proxies);
                    }).catch(function (err) {
                        return reject;
                    });
                } else {
                    reject(err);
                }
            });
        }).catch(function (err) {
            console.log(err);
        });
    };

    return { listProxies: listProxies };
}();