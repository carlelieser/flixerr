let TorrentSearch = (function () {
    process.env.UV_THREADPOOL_SIZE = 128;
    let request = require('request');
    let cheerio = require('cheerio');
    let HttpsProxyAgent = require('https-proxy-agent');

    let timeout = 8000;

    let provider = {
        name: 'The Pirate Bay',
        url: 'https://thepiratebay3.org/index.php?q='
    };

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
                var agent = new HttpsProxyAgent(proxy);
                request({
                    uri,
                    agent,
                    timeout
                }, (err, response, body) => {
                    if (!err) {
                        handleTorrents(body).then(torrents => {
                            resolve(torrents);
                        }).catch(err => {
                            reject(err)
                        });
                    } else {
                        reject(err)
                    }
                });
            })
        }).catch(err => {
            console.log(err);
        });
    }

    let handleTorrents = (html) => {
        return new Promise((resolve, reject) => {
            let $ = cheerio.load(html);
            let torrents = [];

            $('#searchResult>tbody>tr').each(function () {
                let title = $(this)
                        .children('td')
                        .eq(1)
                        .children('.detName')
                        .children('a')
                        .text(),
                    seeds = Number($(this).children('td').last().prev().text()),
                    leechers = Number($(this).children('td').last().text()),
                    magnet = $(this)
                        .children('td')
                        .eq(1)
                        .children('a')
                        .attr('href');

                let torrent = {
                    title,
                    seeds,
                    leechers,
                    magnet
                }

                if (magnet) {
                    torrents.push(torrent);
                }
            });
            if (torrents.length) {
                resolve(torrents);
            } else {
                reject('No torrents found.');
            }
        }).catch(err => {
            console.log(err);
        });
    }

    let search = (query) => {
        let url = `${provider.url}${encodeURI(query)}`;
        return searchProvider(url);
    }

    return {search}
})();
