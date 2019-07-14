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
        url: "https://thepiratebay3.org/index.php?q=",
        queryFunction: function queryFunction(query) {
            return encodeURI(query) + "&video=on&category=0&page=0&orderby=99";
        }
    }, {
        name: "YTS",
        url: "https://yts.lt/movie/",
        queryFunction: function queryFunction(query) {
            return query.replace(/[^A-Za-z0-9]/g, '-');
        }
    }, {
        name: "EZTV",
        url: "https://eztv.yt/search/",
        forShows: true,
        queryFunction: function queryFunction(query) {
            return encodeURI(query);
        }
    }, {
        name: "1337x",
        url: "https://www.1377x.to/search/",
        queryFunction: function queryFunction(query) {
            return encodeURI(query) + "/1/";
        }
    }];

    var getProxy = function getProxy() {
        var proxyList = new _proxyList2.default();
        return proxyList.listProxies().then(function (proxies) {
            if (proxies) {
                var proxy = proxies[Math.floor(Math.random() * proxies.length)];
                return proxy;
            } else {
                reject();
            }
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

    var searchTorrents = function searchTorrents(query, show) {
        return new Promise(function (resolve, reject) {
            var searchPromises = [];
            for (var j = 0; j < providers.length; j++) {
                var provider = providers[j];
                var url = "" + provider.url + provider.queryFunction(query);
                if (show && provider.forShows || !show && !provider.forShows) {
                    var promise = searchProvider(url);
                    searchPromises.push(promise);
                }
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