let SubtitleSearch = function () {
    let axios = require("axios"),
        cheerio = require("cheerio");

    let request = axios.create({timeout: 8000});

    let provider = {
        name: 'YIFY-Subtitles',
        baseURL: 'https://www.yifysubtitles.com',
        url: `https://www.yifysubtitles.com/search?q=`,
        queryFunction: (query) => {
            return encodeURI(query);
        }
    }

    let langs = ['English', 'Spanish', 'Italian', 'German'];

    let getSubsFromElements = (html) => {
        let $ = cheerio.load(html);

        let list = $('.other-subs')
            .children('tbody')
            .children();
        let subs = [];

        for (let i = 0; i < langs.length; i++) {
            let lang = langs[i];
            let subList = list.filter((index) => {
                let element = $(list[index]);
                let subLang = element
                    .find('.sub-lang')
                    .text();

                if (subLang == lang) {
                    return true;
                } else {
                    return false;
                }
            });

            let subURL = $(subList[0])
                .find('.download-cell>a')
                .attr('href');

            let sub = {
                lang,
                url: `${provider.baseURL}${subURL}`
            }

            if (subURL) {
                subs.push(sub);
            }
        }

        return subs;
    }

    let downloadSubtitle = (url) => {
        return request
            .get(url)
            .then((response) => {
                let download = require('download');

                let body = response.data;
                let $ = cheerio.load(body);

                let subLink = $('.download-subtitle').attr('href');

                return download(subLink).then((data) => {
                    let decompress = require('decompress');

                    return decompress(data, 'subtitles').then((files) => {
                        let srt = files.filter((file) => {
                            return file
                                .path
                                .indexOf('.srt') > -1 && file
                                .path
                                .indexOf('MACOSX') === -1;
                        });

                        return srt;
                    })
                })
            });
    }

    let getSubtitlesFromData = (html) => {
        let subs = getSubsFromElements(html),
            promises = [];

        for (let i = 0; i < subs.length; i++) {
            let sub = subs[i];
            let promise = downloadSubtitle(sub.url);
            promises.push(promise);
        }

        return Promise
            .all(promises)
            .then((data) => {
                removeSubtitlesFromDir();
                let merged = []
                    .concat
                    .apply([], data);
                return merged;
            });
    }

    let getIMDB = (movieName, movieYear, html) => {
        let $ = cheerio.load(html);

        let movie = $('.media-movie-clickable').filter((index) => {
            let element = $('.media-movie-clickable')[index];
            let name = $(element)
                .find('h3')
                .text();
            let date = $(element)
                .find('small')
                .first()
                .parent()
                .text()
                .replace('year', '');
            if (name == movieName && date == movieYear) {
                return true;
            } else {
                return false;
            }
        });

        let imdb = $(movie[0]).find('a')[0].attribs.href;

        return imdb;
    }

    let removeSubtitlesFromDir = () => {
        let fs = require('fs-extra');

        let app = require('electron').remote.app,
            folder = `${app.getAppPath()}/subtitles`;

        fs
            .remove(folder)
            .then(() => {
                console.log('Removed subtitles');
            })
            .catch((err) => {
                console.log(err);
            })
    }

    let searchSubtitles = (movieName, movieYear) => {
        let url = `${provider
                .url}${provider
                .queryFunction(movieName)}`,
            year = movieYear
                ? movieYear.substring(0, 4)
                : false;

        return request
            .get(url)
            .then((response) => {
                if (!year) {
                    return false;
                } else {
                    let body = response.data;

                    let imdb = getIMDB(movieName, year, body),
                        movieURL = `${provider.baseURL}${imdb}`;

                    return request
                        .get(movieURL)
                        .then((response) => {
                            let data = response.data;
                            let subtitles = getSubtitlesFromData(data);

                            return subtitles;
                        });
                }
            });
    }

    return {searchSubtitles}
};

export default SubtitleSearch;