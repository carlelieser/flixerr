import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import Fade from 'react-reveal/Fade'
import getJSON from 'get-json'
import storage from 'electron-json-storage'
import uniqid from 'uniqid'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

const parseTorrent = require('parse-torrent-name');

class App extends React.Component {
    constructor(props) {
        super(props);

        this.handleInput.bind(this);

        this.state = {
            apiKey: "22b4015cb2245d35a9c1ad8cd48e314c",
            loginError: false,
            account: true,
            create: false,
            inputEmail: '',
            inputPass: '',
            user: false,
            isGuest: false,
            menu: [
                "Featured", "Movies", "Collection", "Sign In"
            ],
            active: "Featured",
            suggested: [],
            recentlyPlayed: [],
            favorites: [],
            movieTimeArray: [],
            magnetArray: [],
            results: [],
            backupIsOpen: false,
            videoIndex: false,
            activeGenre: false,
            genreID: 0,
            showGenre: false,
            collectionContainer: false,
            menuActive: false,
            headerBg: false,
            content: false,
            showBox: false,
            movieCurrent: false,
            playMovie: false,
            playerLoading: true,
            playerStatus: false,
            isStreaming: false,
            paused: true,
            genreContainer: false,
            genrePages: 7,
            search: false,
            searchContent: false,
            isOffline: false,
            logoIsLoaded: false,
            error: false,
            appLoading: true,
            time: "00:00:00",
            startTime: 0,
            currentTime: 0,
            videoElement: false,
            inputValue: '',
            seekValue: 0,
            colorStop: 0
        }
    }

    setStartTime = (startTime) => {
        this.setState({startTime});
    }

    setVideoElement = (videoElement) => {
        this.setState({videoElement})
    }

    setCurrentTime = (currentTime) => {
        this.setState({currentTime});
    }
    setSeekValue = (seekValue) => {
        this.setState({seekValue});
    }

    setColorStop = (colorStop) => {
        this.setState({colorStop});
    }

    setInputValue = (inputValue) => {
        this.setState({inputValue});
    }

    setStreaming = (isStreaming) => {
        this.setState({isStreaming});
    }

    setPlayerStatus = (status, loading) => {
        return new Promise((resolve, reject) => {
            this.setState({
                playerStatus: status
                    ? {
                        status,
                        loading
                    }
                    : false
            }, () => {
                clearTimeout(this.playerTimeout);
                this.playerTimeout = setTimeout(() => resolve(), 2500);
            });
        });
    }

    toggleGenre = (showGenre, activeGenre, genreID) => {
        this.setState({showGenre, activeGenre, genreID});
    }

    closeGenre = () => {
        this.toggleGenre()
    }

    setUserCredentials = () => {
        storage.set("userCredentials", {
            user: this.state.user,
            create: this.state.create,
            account: this.state.account,
            isGuest: this.state.isGuest
        }, error => {
            if (error) {
                throw error;
            }
        });
    }

    getUserCredentials = () => {
        storage.get('userCredentials', (error, data) => {
            if (error) {
                console.log('Not able to retrieve user credentials.');
            } else {
                this.setState({
                    user: data.user
                        ? data.user.uid
                            ? data.user
                            : false : false,
                    create: data.create,
                    account: data.account,
                    isGuest: data.isGuest
                }, () => {
                    this.startFireBase();
                });
            }
        });
    }

    cleanMovieArrays = (array) => {
        if (array) {
            let clean = array.slice();
            for (let j = 0; j < array.length; j++) {
                let object = array[j];
                if (typeof object === 'object') {
                    this.removeEmpty(object);
                }
            }

            return clean;
        } else {
            return [];
        }
    }

    removeEmpty = (obj) => {
        Object
            .keys(obj)
            .forEach(key => {
                if (obj[key] && typeof obj[key] === 'object') 
                    this.removeEmpty(obj[key]);
                else if (obj[key] === undefined) 
                    delete obj[key];
                }
            );
        return obj;
    }

    createDataBase = () => {
        let db = firebase.database();
        this.databaseRef = db.ref(`users/${this.state.user.uid}`);
    }

    setBucket = () => {
        if (this.state.user.email) {
            let data = {
                recentlyPlayed: this.cleanMovieArrays(this.state.recentlyPlayed),
                movieTimeArray: this.cleanMovieArrays(this.state.movieTimeArray),
                favorites: this.cleanMovieArrays(this.state.favorites),
                suggested: this.cleanMovieArrays(this.state.suggested)
            };

            this
                .databaseRef
                .set(data, (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Data set!');
                    }
                });

        }
    }

    setBucketData = (snapshot) => {
        return new Promise((resolve, reject) => {
            let data = snapshot.val();
            if (data) {
                if (data.favorites !== this.state.favorites && data.recentlyPlayed !== this.state.recentlyPlayed && data.movieTimeArray !== this.state.movieTimeArray && data.suggested !== this.state.suggested) {
                    this.setState({
                        favorites: data.favorites,
                        recentlyPlayed: data.recentlyPlayed,
                        movieTimeArray: data.movieTimeArray,
                        suggested: data.suggested,
                        results: this.state.active == 'Collection'
                            ? [data.suggested[0]]
                            : this.state.results
                    }, () => resolve());
                }
            } else {
                reject();
            }
        });
    }

    listenToBucket = () => {
        if (this.databaseRef) {
            this
                .databaseRef
                .on('value', this.setBucketData);
        }
    }

    getBucket = () => {
        if (this.databaseRef) {
            this
                .databaseRef
                .once('value', (snapshot) => {
                    this
                        .setBucketData(snapshot)
                        .then(() => this.updateSuggested())
                        .catch((err) => console.log(err));
                });
        }
    }

    setStorage = () => {
        storage.set("collection", {
            favorites: this.state.favorites,
            recentlyPlayed: this.state.recentlyPlayed,
            movieTimeArray: this.state.movieTimeArray,
            suggested: this.state.suggested
        }, error => {
            if (error) {
                throw error;
            }
            if (firebase.auth().currentUser) {
                this.setBucket();
            }
        });
    }

    getStorage = () => {
        return new Promise((resolve, reject) => {
            storage.get("collection", (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    this.setState({
                        favorites: data
                            ? data.favorites
                                ? data.favorites
                                : []: [],
                        recentlyPlayed: data
                            ? data.recentlyPlayed
                                ? data.recentlyPlayed
                                : []: [],
                        movieTimeArray: data
                            ? data.movieTimeArray
                                ? data.movieTimeArray
                                : []: [],
                        suggested: data
                            ? data.suggested
                                ? data.suggested
                                : []: []
                    }, (error) => {
                        setTimeout(() => {
                            this.setState({appLoading: false});
                        }, 2500);
                        resolve();
                    });
                }
            });
        }).catch(err => console.log(err));
    }

    formatTime = (secondString) => {
        let sec_num = parseInt(secondString, 10);
        let hours = Math.floor(sec_num / 3600);
        let minutes = Math.floor((sec_num - hours * 3600) / 60);
        let seconds = sec_num - hours * 3600 - minutes * 60;

        if (hours < 10) {
            hours = `0${hours}`;
        }
        if (minutes < 10) {
            minutes = `0${minutes}`;
        }
        if (seconds < 10) {
            seconds = `0${seconds}`;
        }
        return `${hours
            ? hours + ":"
            : ""}${
        minutes
            ? minutes + ":"
            : ""}${seconds}`;
    }

    getPreferredTorrents = (torrents) => {
        return new Promise((resolve, reject) => {
            let preferredTorrents = torrents.filter((item, index) => {
                if (item) {
                    let parsed = parseTorrent(item.title);
                    let title = item
                        .title
                        .toUpperCase();

                    if (item.download) {
                        item.magnet = item.download;
                        delete item.download;
                    }

                    if (item.hasOwnProperty('seeds') || item.hasOwnProperty('peers')) {
                        item.seeders = item.seeds;
                        item.leechers = item.peers;
                        delete item.seeds;
                        delete item.peers;
                    }

                    item.title = `${parsed.title} (${parsed.year}) ${parsed.group
                        ? parsed
                            .group
                            .match(/^\[.*?\]$/g)
                            ? `${parsed.group}`
                            : `(${parsed.group})`
                        : ''}`;
                    item.quality = parsed.quality;
                    item.resolution = parsed.resolution;

                    item.health = Math.round(item.leechers > 0
                        ? item.seeders / item.leechers
                        : item.seeders);

                    return title.match(/^(?=.*(1080|720|HD|YIFY))(?!.*(3D|HDTS|HDTC|HD\.TS|HD\.TC|HD\-TS|HD\-TC|CAM))/g);
                }
            });

            preferredTorrents.sort((a, b) => b.health - a.health);

            resolve(preferredTorrents);
        });

    }

    togglePause = (paused) => {
        this.setState({paused});
    }

    setPlayerTime = (time) => {
        this.setState({time});
    }

    handleVideo = (e) => {
        let video = e.currentTarget;
        if (video.duration) {
            let value = 100 / video.duration * video.currentTime;
            let time = this.formatTime(video.duration - video.currentTime);
            let colorStop = this.state.seekValue / 100;
            this.setColorStop(colorStop);

            if (!this.state.isStreaming) {
                this.startStreaming();
            }

            this.setPlayerTime(time);
            this.setCurrentTime(video.currentTime);
            this.setSeekValue(value);
        }
        this.togglePause(video.paused);
    }

    handleVideoClose = (video) => {
        if (video.src) {
            this.updateMovieTime(video.currentTime);
        }
    }

    setMovieTime = (movie) => {
        let clone = this.getClone(this.state.movieTimeArray);
        let movieMatch = clone.find(item => {
            return movie.id == item.id;
        });

        if (movieMatch) {
            if (movieMatch.currentTime) {
                this.setStartTime(movieMatch.currentTime);
            }

            let recentlyPlayed = this.getClone(this.state.recentlyPlayed);
            this.setState({ recentlyPlayed });
        }
    }

    openBackup = () => {
        this.setState({backupIsOpen: true});
    }

    showBackup = (simple) => {
        if (simple) {
            this.openBackup();
        } else {
            this.setVideoIndex();
            this.setVideoError(true);
            this.openBackup();
        }
    }

    applyTimeout = (type) => {
        let message;

        if (!type) {
            message = 'Ooops. We dropped the ball';
        } else if (type == 1) {
            message = `We can't find Kevin`;
        } else if (type == 2) {
            message = 'Stop littering';
        }

        this
            .removeTorrents()
            .then(() => {
                this.setVideoIndex();
                this.setPlayerLoading(false);
            });

        this.closeServer();
        this.setPlayerStatus(message);
        this.showBackup();

    }

    startWebTorrent = () => {
        let WebTorrent = require('webtorrent');
        this.setState({
            client: new WebTorrent({maxConn: 150})
        }, () => {
            this
                .state
                .client
                .on('error', (err) => {
                    this.applyTimeout();
                });
        });
    }

    removeTorrents = () => {
        return new Promise((resolve, reject) => {
            let promises = [];

            for (let i = 0; i < this.state.client.torrents.length; i++) {
                let torrent = this.state.client.torrents[i];
                let promise = this
                    .state
                    .client
                    .remove(torrent);

                promises.push(promise);
            }

            Promise
                .all(promises)
                .then(() => resolve('Torrents removed.'))
                .catch(err => reject(err));
        }).catch(err => console.log(err));
    }

    setVideoError = (error) => {
        this.setState({error});
    }

    startStreaming = () => {
        this.setStreaming(true);
        clearTimeout(this.timeOut);
        this.setPlayerLoading(false);
        this
            .setPlayerStatus(`We've found a reason for your meaningless existence`)
            .then(() => {
                this.setPlayerStatus(false);
            });
    }

    streamTorrent = (movie) => {
        let magnet = movie.magnet;
        this.setStreaming();
        this.setPlayerStatus('Sending the lost boys to neverland', true);
        this.resetVideo();
        this.changeCurrentMagnet(magnet);

        clearTimeout(this.timeOut);

        this.timeOut = setTimeout(() => {
            if (this.state.time == '00:00:00') {
                this.applyTimeout();
            }
        }, 50000);

        if (this.state.playMovie) {
            let torrent = this
                .state
                .client
                .add(magnet);

            torrent.on('metadata', () => {
                this.setPlayerStatus('Configuring the DeLorean', true);
            });

            torrent.on('ready', () => {
                this.setPlayerStatus('Retrieving from the owl postal service', true);
                torrent.deselect(0, torrent.pieces.length - 1, false);

                for (let i = 0; i < torrent.files.length; i++) {
                    let fileToDeselect = torrent.files[i];
                    fileToDeselect.deselect();
                }

                let videoFormats = [
                    'avi',
                    'mp4',
                    'm4v',
                    'm4a',
                    'mkv',
                    'wmv',
                    'mov'
                ];

                let filtered = torrent
                    .files
                    .filter((file) => {
                        let extension = file
                            .name
                            .substring(file.name.lastIndexOf(".") + 1, file.name.length);

                        if (videoFormats.indexOf(extension) > -1) {
                            return file;
                        }
                    });

                filtered.sort((a, b) => {
                    return b.length - a.length;
                });

                let file = filtered[0];
                let fileIndex = torrent
                    .files
                    .findIndex((item) => {
                        if (file) {
                            return file.path == item.path;
                        }
                    });

                if (!file) {
                    this.applyTimeout(1);
                } else if (!this.state.playMovie) {
                    this.removeTorrents();
                } else if (file && this.state.playMovie) {
                    file.select();

                    this.closeServer();

                    this.server = torrent.createServer();
                    this
                        .server
                        .listen('8888');

                    this
                        .setVideoIndex(fileIndex)
                        .then(() => {
                            this.setPlayerStatus('Logging into the OASIS', true);
                            this.setMovieTime(this.state.playMovie);
                        });
                }
            });

            // torrent.on('warning', (err) => {     console.log(err); });

        } else {
            this.destroyClient();
        }
    }

    resetSearch = () => {
        this.setInputValue('');
        this.toggleSearch();
    }

    toggleContainerSettings = (genreContainer, collectionContainer) => {
        this.setState({genreContainer, collectionContainer});
    }

    toggleSearch = (open, content) => {
        this.setState({search: open, searchContent: content});
    }

    closeSearch = () => {
        this.resetSearch();

        if (this.state.active != "Featured") {
            this.toggleContainerSettings(true, this.state.collectionContainer);
        }
    }

    sortQuery = (results, query) => {
        results.sort((a, b) => {
            return b.popularity - a.popularity;
        });

        results = results.filter(movie => {
            let releaseDate = movie.release_date;
            let year = Number(releaseDate.substring(0, 4));
            let month = Number(releaseDate.substring(6, 7));

            let currentDate = new Date();
            currentDate = {
                year: currentDate.getFullYear(),
                month: currentDate.getMonth() + 1
            }

            return (movie.backdrop_path !== null && (year <= currentDate.year) && (year == currentDate.year
                ? (month < currentDate.month - 1)
                : true) && (movie.popularity > 2) && (movie.vote_average > 4) && (movie.original_language == "en"));
        });

        return results;
    }

    searchEmpty = (query) => {
        this.setState({searchContent: (
                <Fade bottom>
                    <div className="search-empty">
                        No Results for "{query.length > 20
                            ? query.substring(0, 20) + "..."
                            : query}"
                    </div>
                </Fade>
            )});
    }

    setOffline = (isOffline) => {
        this.setState({isOffline});
    }

    fetchContent = (url, callback, err) => {
        getJSON(url, (error, response) => {
            if (!error) {
                this.setOffline();
                if (callback) {
                    callback(response);
                }
            } else {
                if (err) {
                    err(error);
                }
            }
        });
    }

    searchMovies = () => {
        this.toggleSearch(true, this.state.searchContent);
        this.toggleContainerSettings(false, this.state.collectionContainer);

        let query = this.state.inputValue;

        if (query === "") {
            this.closeSearch();
        } else {
            let searchResults = [];
            for (let u = 1; u < 5; u++) {
                let url = `https://api.themoviedb.org/3/search/movie?api_key=${
                this.state.apiKey}&region=US&language=en-US&query=${query}&page=${u}&include_adult=false`;

                let promise = new Promise((resolve, reject) => {
                    this.fetchContent(url, (response) => {
                        let results = response.results;
                        resolve(results);
                    }, (error) => {
                        reject(error);
                    });
                }).catch(err => console.log(err));

                searchResults.push(promise);
            }

            Promise
                .all(searchResults)
                .then(results => {
                    this.setOffline();
                    results = []
                        .concat
                        .apply([], results);

                    if (!results.every(val => {
                        return !val;
                    })) {
                        results = this.sortQuery(results, query);

                        if (results.length === 0) {
                            this.searchEmpty(query);
                        } else {
                            this.toggleSearch(true, this.visualizeResults(results, true, true));
                        }
                    } else {
                        this.searchEmpty(query);
                    }
                })
                .catch(err => this.setOffline(true));
        }
    }

    initMovie = (movie) => {
        this.setState({playerLoading: true, playMovie: movie, time: "00:00:00", paused: true});
    }

    prepareMovieTitle = (title) => {
        return title
            .replace(/[^a-zA-Z0-9\s\-]/g, '')
            .replace(/\-/g, ' ')
            .toLowerCase();
    }

    checkMagnet = (movie) => {
        return new Promise((resolve, reject) => {
            let magnet = movie
                .magnet
                .toUpperCase();
            if (magnet.match(/^(?!.*(HDTS|HDTC|HD\.TS|HD\.TC|HD\-TS|HD\-TC|CAM))/g)) {
                resolve(movie);
            } else {
                movie.magnet = false;
                console.log('Previous magnet link was of low quality.');
                reject(movie);
            }
        });
    }

    promiseTimeout = (ms, promise) => {
        let timeout = new Promise((resolve, reject) => {
            let id = setTimeout(() => {
                clearTimeout(id);
                reject('Timed out in ' + ms + 'ms.')
            }, ms)
        }).catch(err => console.log(err));

        return Promise.race([promise, timeout]);
    }

    setPlayerLoading = (playerLoading) => {
        this.setState({playerLoading});
    }

    setVideoIndex = (videoIndex) => {
        return new Promise((resolve, reject) => {
            this.setState({
                videoIndex
            }, () => {
                resolve();
            });
        });
    }

    resetVideo = () => {
        this.setPlayerLoading(true);
        this.setVideoIndex();
        this.setVideoError();
    }

    closeServer = () => {
        if (this.server) {
            this
                .server
                .close();
        }
    }

    searchTorrent = (movie) => {
        this.resetVideo();
        this.removeTorrents();
        this.closeServer();

        if (movie.magnet) {
            this
                .checkMagnet(movie)
                .then(cleanMovie => {
                    this.streamTorrent(cleanMovie);
                })
                .catch(movie => this.searchTorrent(movie));
        } else {
            let query = `${this.prepareMovieTitle(movie.title)} ${movie
                .release_date
                .substring(0, 4)}`

            this.setPlayerStatus(`Searching the entire universe for "${movie.title}"`, true);

            let publicSearch = this
                .publicSearch
                .search([
                    '1337x', 'Rarbg'
                ], query, 'Movies', 20);

            let proprietarySearch = this
                .torrentSearch
                .search(query);

            publicSearch.then((data) => {
                let magnetPromises = [];
                for (let n = 0; n < data.length; n++) {
                    let magnetTorrent = data[n];
                    if (!magnetTorrent.magnet) {
                        let promise = this
                            .torrentSearch
                            .getMagnetFromLink(magnetTorrent)
                            .catch(err => console.log(err));
                        magnetPromises.push(promise);
                    }
                }

                Promise
                    .all([
                    proprietarySearch, ...magnetPromises
                ])
                    .then((result) => {
                        result = []
                            .concat
                            .apply([], result);
                        if (result.length) {
                            this
                                .getPreferredTorrents(result)
                                .then(torrents => {
                                    let torrent = torrents[0];
                                    if (torrent) {
                                        if (this.state.playMovie) {
                                            let movie = Object.assign({}, this.state.playMovie);
                                            movie.preferredTorrents = torrents;
                                            let magnet = torrent.magnet;
                                            this.setState({
                                                playMovie: movie
                                            }, () => {
                                                this.changeCurrentMagnet(magnet);
                                                this.updateMovieTimeArray(this.getObjectClone(this.state.playMovie), true);
                                                this.streamTorrent(torrent);
                                            });
                                        }
                                    } else {
                                        this.applyTimeout();
                                    }
                                });
                        } else {
                            this.applyTimeout();
                        }
                    })
                    .catch(err => console.log(err));

            }).catch(err => console.log(err))
        }
    }

    playMovie = (movie) => {
        movie = this.matchMovie(movie);
        this.initMovie(movie);
        this
            .toggleBox()
            .then(() => {
                this.searchTorrent(movie);
                this.addToRecentlyPlayed(movie);
            });
    }

    destroyClient = (backUp) => {
        return new Promise((resolve, reject) => {
            clearTimeout(this.timeOut);
            if (this.state.client) {
                let playMovie = backUp ? this.getObjectClone(this.state.playMovie) : false;
                this.setState({
                    playMovie: playMovie,
                    startTime: backUp ? this.state.startTime : false,
                    videoIndex: false,
                    videoElement: false,
                    isStreaming: false,
                    paused: true,
                    playerLoading: backUp
                        ? true
                        : false
                }, () => {
                    this.closeServer();

                    if (backUp) {
                        this
                            .removeTorrents()
                            .then(() => {
                                resolve();
                            });
                    } else {
                        resolve();
                    }

                });
            }
        }).catch(err => console.log(err));
    }

    setFullScreen = (full) => {
        let browserWindow = require("electron")
            .remote
            .getCurrentWindow();

        if (full === undefined) {
            full = false;
        }
        browserWindow.setFullScreen(full);
    }

    setMovieTimeArray = (newArray) => {
        this.setState((prevState) => {
            if ((prevState.movieTimeArray !== this.state.movieTimeArray) || newArray) {
                return {
                    movieTimeArray: newArray
                        ? newArray
                        : this.state.movieTimeArray
                }
            }
        }, () => {
            this.setStorage();
        });
    }

    addToMovieTimeArray = (movie) => {
        let clone = [...this.state.movieTimeArray];
        clone.push(movie);

        this.setMovieTimeArray(clone);
    }

    changeCurrentMagnet = (magnet) => {
        this.currentMagnet = magnet;
    }

    getCurrentMagnet = () => {
        return this.currentMagnet;
    }

    updateMovieTimeArray = (clone, alt) => {
        let movieTimeArray = [...this.state.movieTimeArray];
        let matchingItem = movieTimeArray.find(movie => {
            return movie.id == clone.id;
        });

        if (matchingItem) {
            matchingItem.magnet = this.currentMagnet;
            if (alt) {
                matchingItem.preferredTorrents = clone.preferredTorrents;
            } else {
                matchingItem.currentTime = clone.currentTime;
            }

            this.setMovieTimeArray(movieTimeArray);
        } else {
            let movieData = {
                id: clone.id,
                currentTime: clone.currentTime,
                preferredTorrents: clone.preferredTorrents,
                magnet: this.currentMagnet
            }
            this.addToMovieTimeArray(movieData);
        }

    }

    getObjectClone = (src) => {
        let target = {};
        for (let prop in src) {
            if (src.hasOwnProperty(prop)) {
                target[prop] = src[prop];
            }
        }
        return target;
    }

    updateMovieTime = (time) => {
        if (this.state.playMovie) {
            if (time || time !== 0) {
                let clone = this.getObjectClone(this.state.playMovie);
                clone.currentTime = time;
                this.setState({playMovie: clone});
                this.updateMovieTimeArray(clone);
            }
        }
    }

    removeClient = (time) => {
        if (time) {
            this.updateMovieTime(time);
        }
        this.setState({
            error: false,
            playerStatus: false
        }, () => {
            this
                .destroyClient()
                .then(() => {
                    this
                        .removeTorrents()
                        .then((result) => {
                            console.log(result);
                        });
                });
        });
        this.setFullScreen();
    }

    matchMovie = (movie) => {
        let matchingItem = this.getClone(this.state.movieTimeArray).find(item => {
                return item.id == movie.id;
            });

        if (matchingItem) {
            movie.magnet = matchingItem.magnet;
            movie.preferredTorrents = matchingItem.preferredTorrents;
            this.changeCurrentMagnet(matchingItem.magnet);
            return movie;
        }

        return movie;
    }

    openBox = (movie) => {
        this.toggleBox(true);
        this.setState({movieCurrent: movie});
    }

    toggleBox = (active) => {
        return new Promise((resolve, reject) => {
            this.setState({
                showBox: active
            }, () => {
                setTimeout(resolve, 250);
            });
        });
    }

    closeBackdrop = () => {
        this.toggleBox();
    }

    getHeader = (results) => {
        return results[0].backdrop_path;
    }

    setHeader = (url) => {
        this.setState({headerBg: url});
    }

    strip = (string, chars) => {
        return string.substring(0, chars);
    }

    setResults = (results) => {
        if (results) {
            results = results.slice();
            this.setState({results});
        }
    }

    visualizeResults = (results, featured, set) => {
        if (set) {
            this.setResults(results);
        }

        let items = results.map((movie, index) => (<MovieItem
            movie={movie}
            openBox={this.openBox}
            strip={this.strip}
            key={uniqid()}
            featured={featured}/>));

        return items;
    }

    getURLDate = (n, justYear) => {
        let date = new Date(),
            year = date.getFullYear(),
            month = date
                .getMonth()
                .toString()
                .length < 2
                ? '0' + (date.getMonth() + 1)
                : date.getMonth() + 1,
            day = date
                .getDate()
                .toString()
                .length < 2
                ? '0' + date.getDate()
                : date.getDate();

        if (justYear) {
            return (year - n)
        }

        return `${year - n}-${month}-${day}`
    }

    getFeatured = (resolve, reject, page) => {
        let url = `https://api.themoviedb.org/3/discover/movie?api_key=${
        this
            .state
            .apiKey}&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&primary_release_date.gte=${this
            .getURLDate(5, true)}&primary_release_date.lte=${this
            .getURLDate(1, true)}`;
        this.fetchContent(url, (response) => {
            resolve(response);
        }, (error) => {
            reject(error);
        });
    }

    loadFeatured = () => {
        this.toggleContainerSettings();
        let promise = new Promise((resolve, reject) => {
            this.getFeatured(resolve, reject);
        });

        promise.then(result => {
            this.setContent(this.visualizeResults(result.results, true, true));
        }, err => {
            this.setOffline(true);
        });
    }

    shuffleArray = (array) => {
        let currentIndex = array.length;
        let temporaryValue;
        let randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    getMovies = (genre, genreID) => {
        let url = `https://api.themoviedb.org/3/discover/movie?api_key=${
        this
            .state
            .apiKey}&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${Math
            .floor(Math.random() * this.state.genrePages) + 1}&primary_release_date.lte=${this.getURLDate(1)}&with_genres=${genreID}`;

        return new Promise((resolve, reject) => {
            this.fetchContent(url, (response) => {
                let genreComplete = {
                    name: genre,
                    genreID: genreID,
                    movies: this.shuffleArray(response.results)
                }
                resolve(genreComplete);
            }, (error) => {
                reject(error);
            });
        }).catch(err => console.log(err));
    }

    isRecent = (movie) => {
        return this
            .state
            .recentlyPlayed
            .find(item => {
                return item.id == movie.id;
            });
    }

    isFavorite = (movie) => {
        if (this.state.favorites) {
            return this
                .state
                .favorites
                .find(item => {
                    return item.id == movie.id;
                });
        } else {
            return false;
        }
    }

    chooseRandom = (array, limit) => {
        let results = [],
            previousItem = {};

        if (array.length < limit) {
            limit = array.length;
        }

        for (let i = 0; i < limit; i++) {
            let item = array[Math.floor(Math.random() * array.length)];
            if (previousItem.title) {
                while (previousItem.title == item.title) {
                    item = array[Math.floor(Math.random() * array.length)];
                }
            }
            previousItem = item;
            results.push(item);
        }

        return results;
    }

    getRecommended = (url) => {
        return new Promise((resolve, reject) => {
            this.fetchContent(url, (response) => {
                resolve(response.results.slice(0, 5));
            }, (error) => {
                reject(error);
            });
        });
    }

    getSuggested = (movies) => {
        return new Promise((resolve, reject) => {
            let promises = [];
            let pages = [1, 2, 3];
            for (let j = 0; j < movies.length; j++) {
                let movie = movies[j],
                    page = this.chooseRandom(pages, 1);
                if (movie) {
                    let url = `https://api.themoviedb.org/3/movie/${movie.id}/recommendations?api_key=${
                    this
                        .state
                        .apiKey}&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&primary_release_date.lte=${this
                        .getURLDate(1)}`;
                    let promise = this.getRecommended(url);
                    promises.push(promise);
                }
            }

            Promise
                .all(promises)
                .then((suggested) => {
                    let finalSuggested = []
                        .concat
                        .apply([], suggested)
                    resolve(finalSuggested);
                })
                .catch((err) => reject(err));

        });
    }

    stripDuplicateMovies = (array) => {
        let unique = [],
            uniqueMovies = [];
        for (let k = 0; k < array.length; k++) {
            let movie = array[k];
            if (unique.indexOf(movie.id) === -1) {
                unique.push(movie.id);
                uniqueMovies.push(movie);
            }
        }

        return uniqueMovies;
    }

    updateSuggested = () => {
        let favorites = this.chooseRandom(this.state.favorites, 5),
            recents = this.chooseRandom(this.state.recentlyPlayed, 5),
            collection = favorites.concat(recents);

        this
            .getSuggested(collection)
            .then((suggested) => {
                let clean = this.stripDuplicateMovies(suggested);
                if (clean.length > 20) {
                    clean = clean.slice(0, 20);
                }

                clean = this.shuffleArray(clean);
                this.setState({
                    suggested: clean
                }, () => {
                    if (this.databaseRef) {
                        this.setBucket();
                    }
                });
            });
    }

    getClone = (array) => {
        return [...array];
    }

    addToFavorites = (movie) => {
        let clone = this.getClone(this.state.favorites);
        clone.push(movie);
        this.setState({
            favorites: clone
        }, () => {
            this.setStorage();
        });
    }

    removeFromFavorites = (movie) => {
        let clone = this.getClone(this.state.favorites);
        let index = clone.findIndex(item => {
            return item.id == movie.id;
        });
        clone.splice(index, 1);
        this.setState({
            favorites: clone
        }, () => {
            this.setStorage();
        });
    }

    addToRecentlyPlayed = (movie) => {
        let clone = this.getClone(this.state.recentlyPlayed);
        if (!this.isRecent(movie)) {
            if (clone.length > 20) {
                clone.splice(-1, 1);
            }

            clone.unshift(movie);
            this.setState({
                recentlyPlayed: clone
            }, () => {
                this.setStorage();
            });
        } else {
            let index = clone.findIndex(item => {
                return item.id == movie.id;
            });

            clone.splice(index, 1);
            clone.unshift(movie);
            this.setState({
                recentlyPlayed: clone
            }, () => {
                this.setStorage();
            });
        }
    }

    visualizeMovieGenres = (movieData) => {
        this.setResults([movieData[0].movies[0]]);

        let movieGenres = movieData.map((item, i) => {
            let movies = item
                .movies
                .map((movie, index) => (<MovieItem
                    movie={movie}
                    openBox={this.openBox}
                    strip={this.strip}
                    key={uniqid()}/>));

            return (<GenreContainer
                toggleGenre={this.toggleGenre}
                genreID={item.genreID}
                name={item.name}
                movies={movies}
                key={uniqid()}/>)
        });

        return movieGenres;
    }

    loadMovies = () => {
        this.toggleContainerSettings(true, false);

        let genres = [
            {
                "id": 28,
                "name": "Action"
            }, {
                "id": 12,
                "name": "Adventure"
            }, {
                "id": 16,
                "name": "Animation"
            }, {
                "id": 35,
                "name": "Comedy"
            }, {
                "id": 80,
                "name": "Crime"
            }, {
                "id": 99,
                "name": "Documentary"
            }, {
                "id": 18,
                "name": "Drama"
            }, {
                "id": 10751,
                "name": "Family"
            }, {
                "id": 14,
                "name": "Fantasy"
            }, {
                "id": 36,
                "name": "History"
            }, {
                "id": 27,
                "name": "Horror"
            }, {
                "id": 10402,
                "name": "Music"
            }, {
                "id": 9648,
                "name": "Mystery"
            }, {
                "id": 10749,
                "name": "Romance"
            }, {
                "id": 878,
                "name": "Sci-Fi"
            }, {
                "id": 10770,
                "name": "TV Movie"
            }, {
                "id": 53,
                "name": "Thriller"
            }, {
                "id": 10752,
                "name": "War"
            }, {
                "id": 37,
                "name": "Western"
            }
        ];

        let promiseArray = [];

        for (let j = 0; j < genres.length; j++) {
            let promise = new Promise((resolve, reject) => {
                this
                    .getMovies(genres[j].name, genres[j].id)
                    .then(genreComplete => {
                        resolve(genreComplete);
                    })
                    .catch(err => console.log(err));
            });

            promiseArray.push(promise);
        }

        Promise
            .all(promiseArray)
            .then(data => {
                this.setContent(this.visualizeMovieGenres(data));
            })
            .catch(() => this.setOffline(true))
    }

    loadCollection = () => {
        this.toggleContainerSettings(true, true);
        let headerSource = this.state.suggested
            ? this.state.suggested
            : this.state.recentlyPlayed
                ? this.state.recentlyPlayed
                : this.state.favorites
                    ? this.state.favorites
                    : false;
        this.setResults(headerSource);
    }

    setContent = (content) => {
        this.setState({content});
    }

    loadContent = (active) => {
        this.setContent(false);
        switch (active) {
            case "Featured":
                this.loadFeatured();
                break;
            case "Movies":
                this.loadMovies();
                break;
            case "Collection":
                this.loadCollection();
                break;
        }
    }

    handleMenu = () => {
        if (this.state.menuActive) {
            this.setState({menuActive: false});
        }
    }

    updateMenu = (menuActive, active) => {
        if (menuActive != undefined) {
            this.setState({menuActive});
        }

        if (active != undefined) {
            this.setState({
                active
            }, () => {
                this.loadContent(this.state.active);
            });
        }
    }

    handleLogo = () => {
        this.setState({logoIsLoaded: true});
    }

    loadLogo = () => {
        let tempImage = new Image();
        tempImage.onload = this.handleLogo;
        tempImage.src = 'assets/imgs/icon.png';
    }

    requireTorrent = () => {
        this.publicSearch = require('torrent-search-api');
        this
            .publicSearch
            .enablePublicProviders();

        this.torrentSearch = TorrentSearch;
    }

    signIn = () => {
        let email = this.state.inputEmail.length
                ? this.state.inputEmail
                : this.state.user.email,
            password = this.state.inputPass.length
                ? this.state.inputPass
                : this.state.user.password;

        firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then(() => {
                this.closeAccount();
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                this.setState({loginError: errorMessage});
            });
    }

    startFireBase = () => {
        let firebaseConfig = {
            apiKey: "AIzaSyAOWT7w9hA8qsLY-KP7F14Qfv9vLjw3YJM",
            authDomain: "flixerr-5aeb8.firebaseapp.com",
            databaseURL: "https://flixerr-5aeb8.firebaseio.com",
            projectId: "flixerr-5aeb8",
            storageBucket: "flixerr-5aeb8.appspot.com",
            messagingSenderId: "58493893285",
            appId: "1:58493893285:web:b02990447eb9f16f"
        };

        firebase.initializeApp(firebaseConfig);

        firebase
            .auth()
            .onAuthStateChanged((user) => {
                this.setState({user});
                if (user) {
                    this.createDataBase();
                    this.getBucket();
                    this.listenToBucket();
                }
                this.setUserCredentials();
            });

        if (!this.state.isGuest && this.state.user) {
            this.signIn();
        } else if (!this.state.isGuest && !this.state.user) {
            this.openAccount();
        } else if (!this.state.user) {
            this.updateSuggested();
        }

    }

    handleAccount = () => {
        let email = this.state.inputEmail,
            password = this.state.inputPass;

        if (!email.length && !password.length) {
            this.setState({loginError: true});
        } else {

            if (this.state.create) {
                firebase
                    .auth()
                    .createUserWithEmailAndPassword(email, password)
                    .then(() => {
                        this.closeAccount();
                    })
                    .catch((error) => {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        this.setState({loginError: errorMessage});
                    });
            } else {
                this.signIn();
            }
        }
    }

    openAccount = () => {
        this.setState({create: false, loginError: false, account: true});
    }

    openAccountCreation = () => {
        this.setState({create: true, loginError: false, account: false});
    }

    closeAccount = () => {
        this.setState({
            inputEmail: '',
            inputPass: '',
            account: false,
            create: false,
            loginError: false,
            isGuest: true
        }, () => {
            this.setUserCredentials();
        });
    }

    closeBackup = () => {
        this.setState({backupIsOpen: false});
    }

    signOut = () => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                this.databaseRef = false;
                this.setStorage();
            })
            .catch((error) => {
                console.log(error);
            });
    }

    handleInput = (e) => {
        let value = e.target.value;
        let isEmail = value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g);

        this.setState({
            [isEmail
                    ? 'inputEmail'
                    : 'inputPass']: value
        });
    }

    handleAccountSignin = () => {
        this.setState({
            create: false
        }, () => {
            this.handleAccount();
        });
    }

    handleAccountCreation = () => {
        this.setState({
            create: true
        }, () => {
            this.handleAccount();
        });
    }

    handleConnectionChange = (e) => {
        if (e.type == "offline") {
            this.setOffline(true);
        }
        if (e.type == "online") {
            this.setOffline();
            this.updateMenu(false, this.state.active);
            this.resetSearch();
        }
    }

    componentDidMount() {
        this.loadLogo();
        this
            .getStorage()
            .then(() => this.getUserCredentials())
            .catch(err => console.log(err));
        this.loadContent(this.state.active);
        this.startWebTorrent();
        this.requireTorrent();
        window.addEventListener('online', this.handleConnectionChange);
        window.addEventListener('offline', this.handleConnectionChange);
    }

    render() {
        let menu = this.state.menuActive
            ? (<Menu
                menu={this.state.menu}
                user={this.state.user}
                openAccount={this.openAccount}
                signOut={this.signOut}
                active={this.state.active}
                updateMenu={this.updateMenu}
                resetSearch={this.resetSearch}/>)
            : null;

        let movieBackDrop = this.state.showBox
            ? (<div className="movie-container-bg" onClick={this.closeBackdrop}/>)
            : null;

        let movieModal = this.state.showBox
            ? (<MovieModal
                movie={this.state.movieCurrent}
                favorites={this.state.favorites}
                playMovie={this.playMovie}
                isFavorite={this.isFavorite}
                addToFavorites={this.addToFavorites}
                removeFromFavorites={this.removeFromFavorites}/>)
            : null;

        let playerModal = this.state.playMovie
            ? (<Player
                startTime={this.state.startTime}
                isStreaming={this.state.isStreaming}
                changeCurrentMagnet={this.changeCurrentMagnet}
                updateMovieTime={this.updateMovieTime}
                resetClient={this.destroyClient}
                togglePause={this.togglePause}
                showBackup={this.showBackup}
                openBackup={this.state.backupIsOpen}
                closeBackup={this.closeBackup}
                streamTorrent={this.streamTorrent}
                searchTorrent={this.searchTorrent}
                time={this.state.time}
                tempTime={this.state.tempTime}
                currentTime={this.state.currentTime}
                setCurrentTime={this.setCurrentTime}
                colorStop={this.state.colorStop}
                setColorStop={this.setColorStop}
                videoIndex={this.state.videoIndex}
                paused={this.state.paused}
                removeClient={this.removeClient}
                handleVideoClose={this.handleVideoClose}
                setFullScreen={this.setFullScreen}
                movie={this.state.playMovie}
                getCurrentMagnet={this.getCurrentMagnet}
                loading={this.state.playerLoading}
                setPlayerLoading={this.setPlayerLoading}
                setVideoElement={this.setVideoElement}
                playerStatus={this.state.playerStatus}
                error={this.state.error}
                handleVideo={this.handleVideo}
                setSeekValue={this.setSeekValue}
                seekValue={this.state.seekValue}/>)
            : null;

        let fullGenreContainer = this.state.showGenre
            ? (<Genre
                genre={this.state.activeGenre}
                genreID={this.state.genreID}
                apiKey={this.state.apiKey}
                fetchContent={this.fetchContent}
                visualizeResults={this.visualizeResults}
                setOffline={this.setOffline}
                closeGenre={this.closeGenre}/>)
            : null;

        let loadingContainer = this.state.appLoading
            ? <div className="loading-container">
                    <Fade when={this.state.logoIsLoaded} distance="10%" bottom>
                        <div className="logo"></div>
                    </Fade>
                </div>
            : null;

        let accountContainer = this.state.account
            ? <div className="account-container">
                    <Fade bottom distance="10%">
                        <div className="account-form">
                            <div className="account-close" onClick={this.closeAccount}>
                                <i className="mdi mdi-close"></i>
                            </div>
                            <div className="account-title">Sign in</div>
                            <div className="account-desc">Flixerr will use your account to synchronize data across all your devices.</div>
                            <input
                                type="email"
                                placeholder="Email"
                                autoFocus={true}
                                required
                                onKeyUp={this
                                .handleInput}/>
                            <span></span>

                            <input
                                type="password"
                                placeholder="Password"
                                required
                                onKeyUp={this
                                .handleInput}/>
                            <span></span>
                            {this.state.loginError
                                ? <Fade bottom distance="10%">
                                        <div className="login-error">{this.state.loginError}</div>
                                    </Fade>
                                : ''}
                            <div className="account-submit" onClick={this.handleAccountSignin}>Sign In</div>
                            <div className="divider"></div>
                            <div
                                className="account-submit account-secondary"
                                onClick={this.openAccountCreation}>Sign Up</div>
                        </div>
                    </Fade>
                </div>
            : null;

        let createContainer = this.state.create
            ? <div className="create-container account-container">
                    <div className="account-form">
                        <div className="account-close" onClick={this.closeAccount}>
                            <i className="mdi mdi-close"></i>
                        </div>
                        <div className="account-title">Create an account</div>
                        <div className="account-desc">Register to easily synchronize data across multiple devices.</div>
                        <input
                            type="email"
                            placeholder="Email"
                            autoFocus={true}
                            required
                            onKeyUp={this
                            .handleInput}/>
                        <span></span>
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            onKeyUp={this
                            .handleInput}/>
                        <span></span>
                        {this.state.loginError
                            ? <Fade bottom distance="10%">
                                    <div className="login-error">{this.state.loginError}</div>
                                </Fade>
                            : ''}
                        <div className="account-submit" onClick={this.handleAccountCreation}>Create</div>
                        <div className="divider"></div>
                        <div className="account-submit account-secondary" onClick={this.openAccount}>Sign In</div>
                    </div>
                </div>
            : null;

        return (
            <div
                className={`app-container ${process.platform === "win32"
                ? "windows-compensate"
                : ''}`}
                onClick={this.handleMenu}>
                {process.platform === "darwin"
                    ? <div
                            className={'draggable ' + (this.state.playMovie
                            ? "invisible"
                            : "")}></div>
                    : ''}
                <ReactCSSTransitionGroup
                    transitionName="player-anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {createContainer}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup
                    transitionName="player-anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {accountContainer}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup
                    transitionName="loading-anim"
                    transitionEnterTimeout={0}
                    transitionLeaveTimeout={300}>
                    {loadingContainer}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup
                    transitionName="genreContainer-anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {fullGenreContainer}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup
                    transitionName="player-anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {playerModal}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup
                    transitionName="movie-box-anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {movieModal}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup
                    transitionName="box-anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {movieBackDrop}
                </ReactCSSTransitionGroup>
                <Header
                    subtitle={this.state.active}
                    menuActive={this.state.menuActive}
                    updateMenu={this.updateMenu}
                    background={this.state.headerBg}
                    closeSearch={this.closeSearch}
                    searchContent={this.state.searchContent}
                    searchMovies={this.searchMovies}
                    inputValue={this.state.inputValue}
                    setInputValue={this.setInputValue}
                    user={this.state.user}/>
                <ReactCSSTransitionGroup
                    transitionName="menu-anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {menu}
                </ReactCSSTransitionGroup>
                <Content
                    isOffline={this.state.isOffline}
                    content={this.state.content}
                    genre={this.state.genreContainer}
                    collectionContainer={this.state.collectionContainer}
                    suggested={this.state.suggested}
                    recentlyPlayed={this.state.recentlyPlayed}
                    favorites={this.state.favorites}
                    search={this.state.search}
                    searchContent={this.state.searchContent}
                    getHeader={this.getHeader}
                    setHeader={this.setHeader}
                    strip={this.strip}
                    openBox={this.openBox}
                    results={this.state.results}/>
            </div>
        )
    }
}

ReactDOM.render(
    <App/>, document.getElementById("app"));
