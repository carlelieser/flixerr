'use strict';

var TorrentSearch = function () {
    process.env.UV_THREADPOOL_SIZE = 128;
    var request = require('request');
    var cheerio = require('cheerio');
    var HttpsProxyAgent = require('https-proxy-agent');

    var timeout = 8000;

    var provider = {
        name: 'The Pirate Bay',
        url: 'https://thepiratebay3.org/index.php?q='
    };

    var getProxy = function getProxy() {
        return new Promise(function (resolve, reject) {
            proxyList.listProxies().then(function (proxies) {
                var proxy = proxies[Math.floor(Math.random() * proxies.length)];
                proxy = 'http://' + proxy.ip + ':' + proxy.port;
                resolve(proxy);
            }).catch(function (err) {
                return reject;
            });
        }).catch(function (err) {
            console.log(err);
        });
    };

    var searchProvider = function searchProvider(uri) {
        return new Promise(function (resolve, reject) {
            getProxy().then(function (proxy) {
                var agent = new HttpsProxyAgent(proxy);
                request({
                    uri: uri,
                    agent: agent,
                    timeout: timeout
                }, function (err, response, body) {
                    if (!err) {
                        handleTorrents(body).then(function (torrents) {
                            resolve(torrents);
                        }).catch(function (err) {
                            reject(err);
                        });
                    } else {
                        reject(err);
                    }
                });
            });
        }).catch(function (err) {
            console.log(err);
        });
    };

    var handleTorrents = function handleTorrents(html) {
        return new Promise(function (resolve, reject) {
            var $ = cheerio.load(html);
            var torrents = [];

            $('#searchResult>tbody>tr').each(function () {
                var title = $(this).children('td').eq(1).children('.detName').children('a').text(),
                    seeds = Number($(this).children('td').last().prev().text()),
                    leechers = Number($(this).children('td').last().text()),
                    magnet = $(this).children('td').eq(1).children('a').attr('href');

                var torrent = {
                    title: title,
                    seeds: seeds,
                    leechers: leechers,
                    magnet: magnet
                };

                if (magnet) {
                    torrents.push(torrent);
                }
            });
            if (torrents.length) {
                resolve(torrents);
            } else {
                reject('No torrents found.');
            }
        }).catch(function (err) {
            console.log(err);
        });
    };

    var search = function search(query) {
        var url = '' + provider.url + encodeURI(query);
        return searchProvider(url);
    };

    return { search: search };
}();