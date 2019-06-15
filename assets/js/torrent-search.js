import ProxyList from "./proxy-list";

let TorrentSearch = function () {
    let axios = require("axios"),
        cheerio = require("cheerio"),
        parseTorrent = require("parse-torrent"),
        webtorrentHealth = require("webtorrent-health");

    let request = axios.create({timeout: 8000});

    let providers = [
        {
            name: "The Pirate Bay",
            url: "https://thepiratebay3.org/index.php?video=on&category=0&page=0&orderby=99&q=",
            queryFunction: (query) => {
                return encodeURI(query);
            }
        },
        {
            name: "YTS",
            url: "https://yts.lt/movie/",
            queryFunction: (query) => {
                return query.replace(/[^A-Za-z0-9]/g, '-');
            }
        }
    ];

    let getProxy = () => {
        let proxyList = new ProxyList();
        return new Promise((resolve, reject) => {
            proxyList
                .listProxies()
                .then((proxies) => {
                    if (proxies) {
                        let proxy = proxies[Math.floor(Math.random() * proxies.length)];
                        resolve(proxy);
                    } else {
                        reject("Error: No proxies found.");
                    }
                });
        });
    };

    let searchProvider = (url) => {
        return new Promise((resolve, reject) => {
            getProxy().then((proxy) => {
                request
                    .get(url, {proxy})
                    .then((response) => {
                        let body = response.data;
                        handleTorrents(body).then((torrents) => {
                            resolve(torrents);
                        });
                    })
                    .catch((err) => resolve(err));
            }).catch((err) => resolve(err));
        }).catch((err) => console.log(err));
    };

    let getMagnetData = (magnet) => {
        return new Promise((resolve, reject) => {
            webtorrentHealth(magnet).then((data) => {
                let parsed = parseTorrent(magnet);
                let torrent = {
                    title: parsed.name,
                    magnet: magnet,
                    seeders: data.seeds,
                    leechers: data.peers
                };
                resolve(torrent);
            }).catch((err) => {
                resolve(err);
            });
        });
    };

    let handleTorrents = (html) => {
        return new Promise((resolve, reject) => {
            let magnetPromises = [];

            let magnetLinks = getMagnetLinks(html);

            if (magnetLinks.length) {
                for (let i = 0; i < magnetLinks.length; i++) {
                    let magnet = magnetLinks[i].attribs.href;
                    let promise = getMagnetData(magnet);
                    magnetPromises.push(promise);
                }
                Promise
                    .all(magnetPromises)
                    .then((torrents) => {
                        resolve(torrents);
                    })
                    .catch((err) => resolve(err));
            } else {
                resolve("No torrents found.");
            }
        });
    };

    let searchTorrents = (query) => {
        return new Promise((resolve, reject) => {
            let searchPromises = [];
            for (let j = 0; j < providers.length; j++) {
                let provider = providers[j];
                let url = `${provider
                    .url}${provider
                    .queryFunction(query)}`;
                let promise = searchProvider(url);
                searchPromises.push(promise);
            }

            Promise
                .all(searchPromises)
                .then((results) => {
                    results = []
                        .concat
                        .apply([], results);
                    resolve(results);
                });
        });
    };

    let getObjectClone = (src) => {
        let target = {};
        for (let prop in src) {
            if (src.hasOwnProperty(prop)) {
                target[prop] = src[prop];
            }
        }
        return target;
    };

    let getMagnetLinks = (html) => {
        let $ = cheerio.load(html);
        let magnetLinks = $("a").filter((index, element) => {
            return ($(element).attr("href").indexOf("magnet:?xt=urn:") > -1);
        });

        return magnetLinks;
    };

    let getMagnetFromLink = (torrent) => {
        let torrentCopy = getObjectClone(torrent);
        let url = torrentCopy.desc || torrentCopy.url || torrentCopy.uri;
        return new Promise((resolve, reject) => {
            request
                .get(url)
                .then((response) => {
                    let body = response.data;
                    let magnetLinks = getMagnetLinks(body);

                    if (magnetLinks.length) {
                        let magnet = magnetLinks[0].attribs.href;
                        getMagnetData(magnet).then((torrent) => {
                            resolve(torrent);
                        });
                    } else {
                        resolve("No magnet found.");
                    }
                })
                .catch((err) => resolve(err));
        });
    };

    return {searchTorrents, getMagnetFromLink};
};

export default TorrentSearch;
