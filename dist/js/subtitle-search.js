"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var SubtitleSearch = function SubtitleSearch() {
    var axios = require("axios"),
        cheerio = require("cheerio");

    var request = axios.create({ timeout: 8000 });

    var provider = {
        name: 'YIFY-Subtitles',
        baseURL: 'https://www.yifysubtitles.com',
        url: "https://www.yifysubtitles.com/search?q=",
        queryFunction: function queryFunction(query) {
            return encodeURI(query);
        }
    };

    var langs = ['English', 'Spanish', 'Italian', 'German'];

    var getSubsFromElements = function getSubsFromElements(html) {
        var $ = cheerio.load(html);

        var list = $('.other-subs').children('tbody').children();
        var subs = [];

        var _loop = function _loop(i) {
            var lang = langs[i];
            var subList = list.filter(function (index) {
                var element = $(list[index]);
                var subLang = element.find('.sub-lang').text();

                if (subLang == lang) {
                    return true;
                } else {
                    return false;
                }
            });

            var subURL = $(subList[0]).find('.download-cell>a').attr('href');

            var sub = {
                lang: lang,
                url: "" + provider.baseURL + subURL
            };

            if (subURL) {
                subs.push(sub);
            }
        };

        for (var i = 0; i < langs.length; i++) {
            _loop(i);
        }

        return subs;
    };

    var downloadSubtitle = function downloadSubtitle(url) {
        return request.get(url).then(function (response) {
            var download = require('download');

            var body = response.data;
            var $ = cheerio.load(body);

            var subLink = $('.download-subtitle').attr('href');

            return download(subLink).then(function (data) {
                var decompress = require('decompress');

                return decompress(data).then(function (files) {
                    var srt = files.filter(function (file) {
                        return file.path.indexOf('.srt') > -1 && file.path.indexOf('MACOSX') === -1;
                    });

                    return srt;
                });
            });
        });
    };

    var getSubtitlesFromData = function getSubtitlesFromData(html) {
        var subs = getSubsFromElements(html),
            promises = [];

        for (var i = 0; i < subs.length; i++) {
            var _sub = subs[i];
            var promise = downloadSubtitle(_sub.url);
            promises.push(promise);
        }

        return Promise.all(promises).then(function (data) {
            var merged = [].concat.apply([], data);
            return merged;
        });
    };

    var getIMDB = function getIMDB(movieName, movieYear, html) {
        var $ = cheerio.load(html);

        var movie = $('.media-movie-clickable').filter(function (index) {
            var element = $('.media-movie-clickable')[index];
            var name = $(element).find('h3').text();
            var date = $(element).find('small').first().parent().text().replace('year', '');
            if (name == movieName && date == movieYear) {
                return true;
            } else {
                return false;
            }
        });

        var imdb = $(movie[0]).find('a')[0].attribs.href;

        return imdb;
    };

    var searchSubtitles = function searchSubtitles(movieName, movieYear) {
        var url = "" + provider.url + provider.queryFunction(movieName),
            year = movieYear ? movieYear.substring(0, 4) : false;

        return request.get(url).then(function (response) {
            if (!year) {
                return false;
            } else {
                var body = response.data;

                var imdb = getIMDB(movieName, year, body),
                    movieURL = "" + provider.baseURL + imdb;

                return request.get(movieURL).then(function (response) {
                    var data = response.data;
                    var subtitles = getSubtitlesFromData(data);

                    return subtitles;
                });
            }
        });
    };

    return { searchSubtitles: searchSubtitles };
};

exports.default = SubtitleSearch;