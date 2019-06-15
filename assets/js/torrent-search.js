let TorrentSearch = function () {
    let baseURL = 'https://thepiratebay3.org/index.php?category=0&page=0&orderby=99&q=';

    return {
        search: (query, callback) => {
            let request = require('request');
            let url = `${baseURL}${encodeURI(query)}`;

            return new Promise((resolve, reject) => {
                request(url, (err, response, body) => {
                    if (!err) {
                        resolve(body);
                    } else {
                        reject(err);
                    }
                });
            }).then(html => {
                let cheerio = require('cheerio');

                let $ = cheerio.load(html);

                if ($('#resdata-').text() == 'ThePirateBay is currently unavailable. This page will be refreshed after 10 seco' +
                        'nds or you can try later.' || $('#resdata-').text() == 'Database maintenance, please check back in 10 minutes. 12' || html.indexOf('No hits.') > -1 || $('title').text() == '503 Service Unavailable'){
                    callback(2);
                } else {
                    let torrents = [];

                    $('#searchResult>tbody>tr')
                        .not(':last-child')
                        .each(function (item, i) {
                            let target = $(this)
                                    .children('td')
                                    .eq(1),
                                seeds = $(this)
                                    .children('td')
                                    .eq(2)
                                    .text(),
                                leechers = $(this)
                                    .children('td')
                                    .last()
                                    .text();
                            let torrent = {
                                title: target
                                    .find('.detName')
                                    .text(),
                                magnet: target
                                    .children('a')
                                    .first()
                                    .attr('href'),
                                seeds,
                                leechers
                            }

                            torrents.push(torrent);
                        });

                    if (torrents.length) {
                        callback(0, torrents);
                    } else {
                        callback(1);
                    }
                }

            }, (err) => {
                callback(1)
            });
        },
        magnet: (torrent, callback) => {
            callback(torrent.magnet)
        }
    }
}