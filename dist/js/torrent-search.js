"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _proxyList = require("./proxy-list");

var _proxyList2 = _interopRequireDefault(_proxyList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TorrentSearch = function TorrentSearch() {
    var axios = require("axios"),
        cheerio = require("cheerio"),
        parseTorrent = require("parse-torrent"),
        webtorrentHealth = require("webtorrent-health");

    var request = axios.create({ timeout: 8000 });

    var providers = [{
        name: "The Pirate Bay",
        url: "https://thepiratebay3.org/index.php?video=on&category=0&page=0&orderby=99&q=",
        queryFunction: function queryFunction(query) {
            return encodeURI(query);
        }
    }, {
        name: "YTS",
        url: "https://yts.lt/movie/",
        queryFunction: function queryFunction(query) {
            return query.replace(/[^A-Za-z0-9]/g, '-');
        }
    }];

    var getProxy = function getProxy() {
        var proxyList = new _proxyList2.default();
        return new Promise(function (resolve, reject) {
            proxyList.listProxies().then(function (proxies) {
                if (proxies) {
                    var proxy = proxies[Math.floor(Math.random() * proxies.length)];
                    resolve(proxy);
                } else {
                    reject("Error: No proxies found.");
                }
            });
        });
    };

    var searchProvider = function searchProvider(url) {
        return new Promise(function (resolve, reject) {
            getProxy().then(function (proxy) {
                request.get(url, { proxy: proxy }).then(function (response) {
                    var body = response.data;
                    handleTorrents(body).then(function (torrents) {
                        resolve(torrents);
                    });
                }).catch(function (err) {
                    return resolve(err);
                });
            }).catch(function (err) {
                return resolve(err);
            });
        }).catch(function (err) {
            return console.log(err);
        });
    };

    var getMagnetData = function getMagnetData(magnet) {
        return new Promise(function (resolve, reject) {
            webtorrentHealth(magnet).then(function (data) {
                var parsed = parseTorrent(magnet);
                var torrent = {
                    title: parsed.name,
                    magnet: magnet,
                    seeders: data.seeds,
                    leechers: data.peers
                };
                resolve(torrent);
            }).catch(function (err) {
                resolve(err);
            });
        });
    };

    var handleTorrents = function handleTorrents(html) {
        return new Promise(function (resolve, reject) {
            var magnetPromises = [];

            var magnetLinks = getMagnetLinks(html);

            if (magnetLinks.length) {
                for (var i = 0; i < magnetLinks.length; i++) {
                    var magnet = magnetLinks[i].attribs.href;
                    var promise = getMagnetData(magnet);
                    magnetPromises.push(promise);
                }
                Promise.all(magnetPromises).then(function (torrents) {
                    resolve(torrents);
                }).catch(function (err) {
                    return resolve(err);
                });
            } else {
                resolve("No torrents found.");
            }
        });
    };

    var searchTorrents = function searchTorrents(query) {
        return new Promise(function (resolve, reject) {
            var searchPromises = [];
            for (var j = 0; j < providers.length; j++) {
                var provider = providers[j];
                var url = "" + provider.url + provider.queryFunction(query);
                var promise = searchProvider(url);
                searchPromises.push(promise);
            }

            Promise.all(searchPromises).then(function (results) {
                results = [].concat.apply([], results);
                resolve(results);
            });
        });
    };

    var getObjectClone = function getObjectClone(src) {
        var target = {};
        for (var prop in src) {
            if (src.hasOwnProperty(prop)) {
                target[prop] = src[prop];
            }
        }
        return target;
    };

    var getMagnetLinks = function getMagnetLinks(html) {
        var $ = cheerio.load(html);
        var magnetLinks = $("a").filter(function (index, element) {
            return $(element).attr("href").indexOf("magnet:?xt=urn:") > -1;
        });

        return magnetLinks;
    };

    var getMagnetFromLink = function getMagnetFromLink(torrent) {
        var torrentCopy = getObjectClone(torrent);
        var url = torrentCopy.desc || torrentCopy.url || torrentCopy.uri;
        return new Promise(function (resolve, reject) {
            request.get(url).then(function (response) {
                var body = response.data;
                var magnetLinks = getMagnetLinks(body);

                if (magnetLinks.length) {
                    var magnet = magnetLinks[0].attribs.href;
                    getMagnetData(magnet).then(function (torrent) {
                        resolve(torrent);
                    });
                } else {
                    resolve("No magnet found.");
                }
            }).catch(function (err) {
                return resolve(err);
            });
        });
    };

    return { searchTorrents: searchTorrents, getMagnetFromLink: getMagnetFromLink };
};

exports.default = TorrentSearch;