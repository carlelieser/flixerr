'use strict';

var TorrentSearch = function () {
    process.env.UV_THREADPOOL_SIZE = 128;

    var HttpsProxyAgent = require('https-proxy-agent');

    var request = require('request'),
        cheerio = require('cheerio'),
        parseTorrent = require('parse-torrent'),
        webtorrentHealth = require('webtorrent-health'),
        timeout = 8000;

    var providers = [{
        name: 'The Pirate Bay',
        url: 'https://thepiratebay3.org/index.php?video=on&category=0&page=0&orderby=99&q=',
        queryFunction: function queryFunction(query) {
            return encodeURI(query);
        }
    }];

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
                var options = {
                    uri: uri,
                    agent: agent,
                    timeout: timeout
                };

                request(options, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        handleTorrents(body).then(function (torrents) {
                            resolve(torrents);
                        }).catch(function (err) {
                            reject(err);
                        });
                    } else {
                        reject(err);
                    }
                });
            }).catch(function (err) {
                console.log(err);
            });
        }).catch(function (err) {
            console.log(err);
        });
    };

    var getMagnetData = function getMagnetData(magnet) {
        return new Promise(function (resolve, reject) {
            webtorrentHealth(magnet).then(function (data) {
                var torrent = {
                    title: parseTorrent(magnet).name,
                    magnet: magnet,
                    seeders: data.seeds,
                    leechers: data.peers
                };
                resolve(torrent);
            });
        });
    };

    var handleTorrents = function handleTorrents(html) {
        return new Promise(function (resolve, reject) {
            var $ = cheerio.load(html);
            var magnetPromises = [];

            var magnetLinks = $('a').filter(function (index, element) {
                return $(element).attr('href').indexOf('magnet:?xt=urn:') > -1;
            });
            if (magnetLinks.length) {
                for (var i = 0; i < magnetLinks.length; i++) {
                    var magnet = magnetLinks[i].attribs.href;
                    var promise = getMagnetData(magnet);
                    magnetPromises.push(promise);
                }
                Promise.all(magnetPromises).then(function (torrents) {
                    resolve(torrents);
                });
            } else {
                reject('No torrents found.');
            }
        }).catch(function (err) {
            console.log(err);
        });
    };

    var search = function search(query) {
        return new Promise(function (resolve, reject) {
            var searchPromises = [];
            for (var j = 0; j < providers.length; j++) {
                var provider = providers[j];
                var url = '' + provider.url + provider.queryFunction(query);
                var promise = searchProvider(url);
                searchPromises.push(promise);
            }

            Promise.all(searchPromises).then(function (results) {
                results = [].concat.apply([], results);
                resolve(results);
            }).catch(function (err) {
                return reject(err);
            });
        });
    };

    var getMagnetFromLink = function getMagnetFromLink(torrent) {
        var url = torrent.desc || torrent.url || torrent.uri;
        return new Promise(function (resolve, reject) {
            request(url, function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var $ = cheerio.load(body);
                    var magnetLinks = $('a').filter(function (index, element) {
                        return $(element).attr('href').indexOf('magnet:?xt=urn:') > -1;
                    });
                    if (magnetLinks.length) {
                        torrent.magnet = magnetLinks[0].attribs.href;
                        resolve(torrent);
                    } else {
                        reject('No magnet found.');
                    }
                } else {
                    reject(err);
                }
            });
        }).catch(function (err) {
            return console.log(err);
        });
    };

    return {
        search: search,
        getMagnetFromLink: getMagnetFromLink
    };
}();