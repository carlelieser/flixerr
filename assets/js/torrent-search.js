let TorrentSearch = function () {
    let axios = require('axios'),
        cheerio = require('cheerio'),
        parseTorrent = require('parse-torrent'),
        webtorrentHealth = require('webtorrent-health')

    let request = axios.create({ timeout: 8000 })
    let puppeteer = require('puppeteer')

    let providers = [
        {
            name: 'The Pirate Bay',
            url: 'https://www.pirate-bay.net/search?q=',
            queryFunction: (query) => {
                return `${encodeURI(query)}`
            },
        },
        {
            name: 'YTS',
            url: 'https://yts.lt/movie/',
            queryFunction: (query) => {
                return query.replace(/[^A-Za-z0-9]/g, '-')
            },
        },
        {
            name: 'EZTV',
            url: 'https://eztv.yt/search/',
            forShows: true,
            queryFunction: (query) => {
                return encodeURI(query)
            },
        },
        {
            name: '1337x',
            url: 'https://www.1377x.to/search/',
            queryFunction: (query) => {
                return `${encodeURI(query)}/1/`
            },
        },
    ]

    let getPuppetContent = async (page) => {
        let frame = page.frames()[1]
        let body = ''
        try {
            body = frame
                ? await frame.content()
                : await page.mainFrame().content()
        } catch (err) {
            console.log(err)
        }

        return body
    }

    let searchProvider = async (url) => {
        let path = puppeteer
            .executablePath()
            .replace('app.asar', 'app.asar.unpacked')
        let browser = await puppeteer.launch({
            executablePath: path,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080',
            ],
            ignoreDefaultArgs: ['--disable-extensions'],
        })
        let page = await browser.newPage()
        await page.goto(url, { waitUntil: 'networkidle2' })
        let body = await getPuppetContent(page)
        let torrents = await handleTorrents(body)
        await browser.close()

        return torrents
    }

    let getMagnetData = (magnet) => {
        return new Promise((resolve, reject) => {
            console.log(magnet)
            webtorrentHealth(magnet)
                .then((data) => {
                    let parsed = parseTorrent(magnet)
                    let torrent = {
                        title: parsed.name,
                        magnet: magnet,
                        seeders: data.seeds,
                        leechers: data.peers,
                    }
                    resolve(torrent)
                })
                .catch((err) => {
                    resolve(err)
                })
        })
    }

    let handleTorrents = (html) => {
        return new Promise((resolve, reject) => {
            let magnetPromises = []
            let magnetLinks = getMagnetLinks(html)

            if (magnetLinks.length) {
                for (let i = 0; i < magnetLinks.length; i++) {
                    let magnet = magnetLinks[i]
                    let promise = getMagnetData(magnet)
                    magnetPromises.push(promise)
                }
                Promise.all(magnetPromises)
                    .then((torrents) => {
                        console.log(torrents)
                        resolve(torrents)
                    })
                    .catch((err) => resolve(err))
            } else {
                resolve('No torrents found.')
            }
        })
    }

    let searchTorrents = (query, show) => {
        return new Promise((resolve, reject) => {
            let searchPromises = []
            for (let j = 0; j < providers.length; j++) {
                let provider = providers[j]
                let url = `${provider.url}${provider.queryFunction(query)}`
                if (
                    (show && provider.forShows) ||
                    (!show && !provider.forShows)
                ) {
                    console.log(url)
                    let promise = searchProvider(url)
                    searchPromises.push(promise)
                }
            }

            Promise.all(searchPromises).then((results) => {
                results = [].concat.apply([], results)
                resolve(results)
            })
        })
    }

    let getObjectClone = (src) => {
        let target = {}
        for (let prop in src) {
            if (src.hasOwnProperty(prop)) {
                target[prop] = src[prop]
            }
        }
        return target
    }

    let isMagnetLink = (link) => {
        return link ? link.indexOf('magnet:?xt=urn:') > -1 : false
    }

    let getMagnetLinks = (html) => {
        let $ = cheerio.load(html)
        let magnetLinks = []
        $('a').each((index, element) => {
            let link = $(element).attr('href')
            let isMagnet = isMagnetLink(link)
            if (isMagnet) {
                magnetLinks.push(link)
            }
        })

        return magnetLinks
    }

    let getMagnetFromLink = (torrent) => {
        let torrentCopy = getObjectClone(torrent)
        let url = torrentCopy.desc || torrentCopy.url || torrentCopy.uri
        return new Promise((resolve, reject) => {
            request
                .get(url)
                .then((response) => {
                    let body = response.data
                    let magnetLinks = getMagnetLinks(body)

                    if (magnetLinks.length) {
                        let magnet = magnetLinks[0]
                        getMagnetData(magnet).then((torrent) => {
                            resolve(torrent)
                        })
                    } else {
                        resolve('No magnet found.')
                    }
                })
                .catch((err) => resolve(err))
        })
    }

    return { searchTorrents, getMagnetFromLink }
}

export default TorrentSearch
