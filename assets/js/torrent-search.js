let TorrentSearch = (function () {
    process.env.UV_THREADPOOL_SIZE = 128;

    let HttpsProxyAgent = require('https-proxy-agent');

    let request = require('request'),
        cheerio = require('cheerio'),
        parseTorrent = require('parse-torrent'),
        webtorrentHealth = require('webtorrent-health'),
        timeout = 8000;

    let providers = [{
        name: 'The Pirate Bay',
        url: 'https://thepiratebay3.org/index.php?video=on&category=0&page=0&orderby=99&q=',
        queryFunction: (query) => {
            return encodeURI(query);
        }
    }];

    let getProxy = () => {
        return new Promise((resolve, reject) => {
            proxyList
                .listProxies()
                .then(proxies => {
                    let proxy = proxies[Math.floor(Math.random() * proxies.length)];
                    proxy = `http://${proxy.ip}:${proxy.port}`;
                    resolve(proxy);
                })
                .catch(err => reject);
        }).catch(err => {
            console.log(err)
        })
    }

    let searchProvider = (uri) => {
        return new Promise((resolve, reject) => {
            getProxy().then(proxy => {
                let agent = new HttpsProxyAgent(proxy);
                let options = {
                    uri,
                    agent,
                    timeout
                }

                request(options, (err, response, body) => {
                    if (!err && response.statusCode == 200) {
                        handleTorrents(body).then(torrents => {
                            resolve(torrents);
                        }).catch(err => {
                            reject(err)
                        });
                    } else {
                        reject(err)
                    }
                });
            }).catch(err => {
                console.log(err);
            });
        }).catch(err => {
            console.log(err);
        });
    }

    let getMagnetData = (magnet) => {
        return new Promise((resolve, reject) => {
            webtorrentHealth(magnet).then((data) => {
                let torrent = {
                    title: parseTorrent(magnet).name,
                    magnet: magnet,
                    seeders: data.seeds,
                    leechers: data.peers,
                }
                resolve(torrent);
            });
        });
    }

    let handleTorrents = (html) => {
        return new Promise((resolve, reject) => {
            let $ = cheerio.load(html);
            let magnetPromises = [];

            let magnetLinks = $('a').filter((index, element) => {
                return $(element).attr('href').indexOf('magnet:?xt=urn:') > -1;
            });
            if(magnetLinks.length){
                for(let i = 0; i < magnetLinks.length;i++){
                    let magnet = magnetLinks[i].attribs.href;
                    let promise = getMagnetData(magnet);
                    magnetPromises.push(promise);
                }
                Promise.all(magnetPromises).then((torrents) => {
                    resolve(torrents);
                });
            }else{
                reject('No torrents found.');
            }
        }).catch(err => {
            console.log(err);
        });
    }

    let search = (query) => {
        return new Promise((resolve, reject) => {
            let searchPromises = [];
            for(let j = 0; j< providers.length;j++){
                let provider = providers[j];
                let url = `${provider.url}${provider.queryFunction(query)}`;
                let promise = searchProvider(url);
                searchPromises.push(promise);
            }

            Promise.all(searchPromises).then((results) => {
                results = []
                    .concat
                    .apply([], results);
                resolve(results);
            }).catch(err=> reject(err));
        });
    }
    
    let getMagnetFromLink = (torrent) => {
        let url = torrent.desc || torrent.url || torrent.uri;
        return new Promise((resolve, reject) => {
            request(url, (err, response, body) => {
                if (!err && response.statusCode == 200) {
                    let $ = cheerio.load(body);
                    let magnetLinks = $('a').filter((index, element) => {
                        return $(element).attr('href').indexOf('magnet:?xt=urn:') > -1;
                    });
                    if (magnetLinks.length) {
                        torrent.magnet = magnetLinks[0].attribs.href;
                        resolve(torrent);
                    } else {
                        reject('No magnet found.')
                    }
                } else {
                    reject(err)
                }
            });
        }).catch((err) => console.log(err));
    }

    return {
        search,
        getMagnetFromLink
    }
})();
