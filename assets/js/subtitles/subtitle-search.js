let SubtitleSearch = function () {
    let axios = require('axios'),
        cheerio = require('cheerio')

    let request = axios.create({ timeout: 8000 })

    let provider = {
        name: 'YIFY-Subtitles',
        baseURL: 'https://www.yifysubtitles.org',
        url: `https://www.yifysubtitles.org/search?q=`,
        queryFunction: (query) => {
            return encodeURI(query)
        },
    }

    let langs = ['Arabic', 'English', 'Spanish', 'Italian', 'German']

    let getSubsFromElements = (html) => {
        let $ = cheerio.load(html)

        let list = $('.other-subs').children('tbody').children()
        let subs = []
        for (let i = 0; i < langs.length; i++) {
            let lang = langs[i]
            let primaryLink = list
                .find('a')
                .toArray()
                .find((element) => {
                    let link = $(element)
                    let isSubLink =
                        link.attr('href').startsWith('/subtitles') &&
                        link
                            .attr('href')
                            .toLowerCase()
                            .indexOf(lang.toLowerCase()) > -1
                    return isSubLink
                })
            let subURL = primaryLink ? $(primaryLink).attr('href') : null
            let subDownloadURL = subURL
                ? `${subURL.replace('subtitles', 'subtitle')}.zip`
                : null

            let sub = {
                lang,
                url: `${provider.baseURL}${subDownloadURL}`,
            }
            if (subURL) subs.push(sub)
        }

        return subs
    }

    let downloadSubtitle = (metadata) => {
        let { lang, url } = metadata
        let download = require('download')

        return download(url).then((data) => {
            let decompress = require('decompress')
            let detect = require('charset-detector')

            return decompress(data).then((files) => {
                let encoding = require('encoding')
                let srt = files.find((file) => {
                    return (
                        file.path.indexOf('.srt') > -1 &&
                        file.path.indexOf('MACOSX') === -1
                    )
                })

                if (srt) {
                    let data = srt.data
                    let charset = detect(data)[0].charsetName
                    let converted = encoding.convert(data, 'utf-8', charset)

                    let file = {
                        data: converted,
                        name: `${lang}.srt`,
                        lang,
                    }
                    return file
                }

                return srt
            })
        })
    }

    let getSubtitlesFromData = (html) => {
        let subs = getSubsFromElements(html),
            promises = []

        for (let i = subs.length - 1; i >= 0; i--) {
            let sub = subs[i]
            let promise = downloadSubtitle(sub)
            promises.push(promise)
        }

        return Promise.all(promises).then((data) => {
            return data
        })
    }

    let getIMDB = (movieName, movieYear, html) => {
        let $ = cheerio.load(html)

        let movie = $('.media-movie-clickable').filter((index) => {
            let element = $('.media-movie-clickable')[index]
            let name = $(element).find('h3').text()
            let date = $(element)
                .find('small')
                .first()
                .parent()
                .text()
                .replace('year', '')
            if (name == movieName && date == movieYear) {
                return true
            } else {
                return false
            }
        })

        let imdb = $(movie[0]).find('a')[0].attribs.href

        return imdb
    }

    let search = (movieName, movieYear) => {
        let encodedQuery = provider.queryFunction(movieName)
        let url = `${provider.url}${encodedQuery}`,
            year = movieYear ? movieYear.substring(0, 4) : false

        return request.get(url).then((response) => {
            if (!year) {
                return false
            } else {
                let body = response.data

                let imdb = getIMDB(movieName, year, body),
                    movieURL = `${provider.baseURL}${imdb}`
                return request.get(movieURL).then((response) => {
                    let data = response.data
                    let subtitles = getSubtitlesFromData(data)

                    return subtitles
                })
            }
        })
    }

    return { search }
}

export default SubtitleSearch
