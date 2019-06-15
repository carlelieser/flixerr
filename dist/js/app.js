'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactAddonsCssTransitionGroup = require('react-addons-css-transition-group');

var _reactAddonsCssTransitionGroup2 = _interopRequireDefault(_reactAddonsCssTransitionGroup);

var _Fade = require('react-reveal/Fade');

var _Fade2 = _interopRequireDefault(_Fade);

var _getJson = require('get-json');

var _getJson2 = _interopRequireDefault(_getJson);

var _electronJsonStorage = require('electron-json-storage');

var _electronJsonStorage2 = _interopRequireDefault(_electronJsonStorage);

var _uniqid = require('uniqid');

var _uniqid2 = _interopRequireDefault(_uniqid);

var _app = require('firebase/app');

var _app2 = _interopRequireDefault(_app);

require('firebase/auth');

require('firebase/database');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var parseTorrent = require('parse-torrent-name');

var App = function (_React$Component) {
    _inherits(App, _React$Component);

    function App(props) {
        _classCallCheck(this, App);

        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

        _this.setStartTime = function (startTime) {
            _this.setState({ startTime: startTime });
        };

        _this.setVideoElement = function (videoElement) {
            _this.setState({ videoElement: videoElement });
        };

        _this.setCurrentTime = function (currentTime) {
            _this.setState({ currentTime: currentTime });
        };

        _this.setSeekValue = function (seekValue) {
            _this.setState({ seekValue: seekValue });
        };

        _this.setColorStop = function (colorStop) {
            _this.setState({ colorStop: colorStop });
        };

        _this.setInputValue = function (inputValue) {
            _this.setState({ inputValue: inputValue });
        };

        _this.setStreaming = function (isStreaming) {
            _this.setState({ isStreaming: isStreaming });
        };

        _this.setPlayerStatus = function (status, loading) {
            return new Promise(function (resolve, reject) {
                _this.setState({
                    playerStatus: status ? {
                        status: status,
                        loading: loading
                    } : false
                }, function () {
                    clearTimeout(_this.playerTimeout);
                    _this.playerTimeout = setTimeout(function () {
                        return resolve();
                    }, 2500);
                });
            });
        };

        _this.toggleGenre = function (showGenre, activeGenre, genreID) {
            _this.setState({ showGenre: showGenre, activeGenre: activeGenre, genreID: genreID });
        };

        _this.closeGenre = function () {
            _this.toggleGenre();
        };

        _this.setUserCredentials = function () {
            _electronJsonStorage2.default.set("userCredentials", {
                user: _this.state.user,
                create: _this.state.create,
                account: _this.state.account,
                isGuest: _this.state.isGuest
            }, function (error) {
                if (error) {
                    throw error;
                }
            });
        };

        _this.getUserCredentials = function () {
            _electronJsonStorage2.default.get('userCredentials', function (error, data) {
                if (error) {
                    console.log('Not able to retrieve user credentials.');
                } else {
                    _this.setState({
                        user: data.user ? data.user.uid ? data.user : false : false,
                        create: data.create,
                        account: data.account,
                        isGuest: data.isGuest
                    }, function () {
                        _this.startFireBase();
                    });
                }
            });
        };

        _this.cleanMovieArrays = function (array) {
            if (array) {
                var clean = array.slice();
                for (var j = 0; j < array.length; j++) {
                    var object = array[j];
                    if ((typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object') {
                        _this.removeEmpty(object);
                    }
                }

                return clean;
            } else {
                return [];
            }
        };

        _this.removeEmpty = function (obj) {
            Object.keys(obj).forEach(function (key) {
                if (obj[key] && _typeof(obj[key]) === 'object') _this.removeEmpty(obj[key]);else if (obj[key] === undefined) delete obj[key];
            });
            return obj;
        };

        _this.createDataBase = function () {
            var db = _app2.default.database();
            _this.databaseRef = db.ref('users/' + _this.state.user.uid);
        };

        _this.setBucket = function () {
            if (_this.state.user.email) {
                var data = {
                    recentlyPlayed: _this.cleanMovieArrays(_this.state.recentlyPlayed),
                    movieTimeArray: _this.cleanMovieArrays(_this.state.movieTimeArray),
                    favorites: _this.cleanMovieArrays(_this.state.favorites),
                    suggested: _this.cleanMovieArrays(_this.state.suggested)
                };

                _this.databaseRef.set(data, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Data set!');
                    }
                });
            }
        };

        _this.setBucketData = function (snapshot) {
            return new Promise(function (resolve, reject) {
                var data = snapshot.val();
                if (data) {
                    if (data.favorites !== _this.state.favorites && data.recentlyPlayed !== _this.state.recentlyPlayed && data.movieTimeArray !== _this.state.movieTimeArray && data.suggested !== _this.state.suggested) {
                        _this.setState({
                            favorites: data.favorites,
                            recentlyPlayed: data.recentlyPlayed,
                            movieTimeArray: data.movieTimeArray,
                            suggested: data.suggested,
                            results: _this.state.active == 'Collection' ? [data.suggested[0]] : _this.state.results
                        }, function () {
                            return resolve();
                        });
                    }
                } else {
                    reject();
                }
            });
        };

        _this.listenToBucket = function () {
            if (_this.databaseRef) {
                _this.databaseRef.on('value', _this.setBucketData);
            }
        };

        _this.getBucket = function () {
            if (_this.databaseRef) {
                _this.databaseRef.once('value', function (snapshot) {
                    _this.setBucketData(snapshot).then(function () {
                        return _this.updateSuggested();
                    }).catch(function (err) {
                        return console.log(err);
                    });
                });
            }
        };

        _this.setStorage = function () {
            _electronJsonStorage2.default.set("collection", {
                favorites: _this.state.favorites,
                recentlyPlayed: _this.state.recentlyPlayed,
                movieTimeArray: _this.state.movieTimeArray,
                suggested: _this.state.suggested
            }, function (error) {
                if (error) {
                    throw error;
                }
                if (_app2.default.auth().currentUser) {
                    _this.setBucket();
                }
            });
        };

        _this.getStorage = function () {
            return new Promise(function (resolve, reject) {
                _electronJsonStorage2.default.get("collection", function (error, data) {
                    if (error) {
                        reject(error);
                    } else {
                        _this.setState({
                            favorites: data ? data.favorites ? data.favorites : [] : [],
                            recentlyPlayed: data ? data.recentlyPlayed ? data.recentlyPlayed : [] : [],
                            movieTimeArray: data ? data.movieTimeArray ? data.movieTimeArray : [] : [],
                            suggested: data ? data.suggested ? data.suggested : [] : []
                        }, function (error) {
                            setTimeout(function () {
                                _this.setState({ appLoading: false });
                            }, 2500);
                            resolve();
                        });
                    }
                });
            }).catch(function (err) {
                return console.log(err);
            });
        };

        _this.formatTime = function (secondString) {
            var sec_num = parseInt(secondString, 10);
            var hours = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - hours * 3600) / 60);
            var seconds = sec_num - hours * 3600 - minutes * 60;

            if (hours < 10) {
                hours = '0' + hours;
            }
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            return '' + (hours ? hours + ":" : "") + (minutes ? minutes + ":" : "") + seconds;
        };

        _this.getPreferredTorrents = function (torrents) {
            return new Promise(function (resolve, reject) {
                var preferredTorrents = torrents.filter(function (item, index) {
                    if (item) {
                        var parsed = parseTorrent(item.title);
                        var title = item.title.toUpperCase();

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

                        item.title = parsed.title + ' (' + parsed.year + ') ' + (parsed.group ? parsed.group.match(/^\[.*?\]$/g) ? '' + parsed.group : '(' + parsed.group + ')' : '');
                        item.quality = parsed.quality;
                        item.resolution = parsed.resolution;

                        item.health = Math.round(item.leechers > 0 ? item.seeders / item.leechers : item.seeders);

                        return title.match(/^(?=.*(1080|720|HD|YIFY))(?!.*(3D|HDTS|HDTC|HD\.TS|HD\.TC|HD\-TS|HD\-TC|CAM))/g);
                    }
                });

                preferredTorrents.sort(function (a, b) {
                    return b.health - a.health;
                });

                resolve(preferredTorrents);
            });
        };

        _this.togglePause = function (paused) {
            _this.setState({ paused: paused });
        };

        _this.setPlayerTime = function (time) {
            _this.setState({ time: time });
        };

        _this.handleVideo = function (e) {
            var video = e.currentTarget;
            if (video.duration) {
                var value = 100 / video.duration * video.currentTime;
                var time = _this.formatTime(video.duration - video.currentTime);
                var colorStop = _this.state.seekValue / 100;
                _this.setColorStop(colorStop);

                if (!_this.state.isStreaming) {
                    _this.startStreaming();
                }

                _this.setPlayerTime(time);
                _this.setCurrentTime(video.currentTime);
                _this.setSeekValue(value);
            }
            _this.togglePause(video.paused);
        };

        _this.handleVideoClose = function (video) {
            if (video.src) {
                _this.updateMovieTime(video.currentTime);
            }
        };

        _this.setMovieTime = function (movie) {
            var clone = _this.getClone(_this.state.movieTimeArray);
            var movieMatch = clone.find(function (item) {
                return movie.id == item.id;
            });

            if (movieMatch) {
                if (movieMatch.currentTime) {
                    _this.setStartTime(movieMatch.currentTime);
                }

                var recentlyPlayed = _this.getClone(_this.state.recentlyPlayed);
                _this.setState({ recentlyPlayed: recentlyPlayed });
            }
        };

        _this.openBackup = function () {
            _this.setState({ backupIsOpen: true });
        };

        _this.showBackup = function (simple) {
            if (simple) {
                _this.openBackup();
            } else {
                _this.setVideoIndex();
                _this.setVideoError(true);
                _this.openBackup();
            }
        };

        _this.applyTimeout = function (type) {
            var message = void 0;

            if (!type) {
                message = 'Ooops. We dropped the ball';
            } else if (type == 1) {
                message = 'We can\'t find Kevin';
            } else if (type == 2) {
                message = 'Stop littering';
            }

            _this.removeTorrents().then(function () {
                _this.setVideoIndex();
                _this.setPlayerLoading(false);
            });

            _this.closeServer();
            _this.setPlayerStatus(message);
            _this.showBackup();
        };

        _this.startWebTorrent = function () {
            var WebTorrent = require('webtorrent');
            _this.setState({
                client: new WebTorrent({ maxConn: 150 })
            }, function () {
                _this.state.client.on('error', function (err) {
                    _this.applyTimeout();
                });
            });
        };

        _this.removeTorrents = function () {
            return new Promise(function (resolve, reject) {
                var promises = [];

                for (var i = 0; i < _this.state.client.torrents.length; i++) {
                    var torrent = _this.state.client.torrents[i];
                    var promise = _this.state.client.remove(torrent);

                    promises.push(promise);
                }

                Promise.all(promises).then(function () {
                    return resolve('Torrents removed.');
                }).catch(function (err) {
                    return reject(err);
                });
            }).catch(function (err) {
                return console.log(err);
            });
        };

        _this.setVideoError = function (error) {
            _this.setState({ error: error });
        };

        _this.startStreaming = function () {
            _this.setStreaming(true);
            clearTimeout(_this.timeOut);
            _this.setPlayerLoading(false);
            _this.setPlayerStatus('We\'ve found a reason for your meaningless existence').then(function () {
                _this.setPlayerStatus(false);
            });
        };

        _this.streamTorrent = function (movie) {
            var magnet = movie.magnet;
            _this.setStreaming();
            _this.setPlayerStatus('Sending the lost boys to neverland', true);
            _this.resetVideo();
            _this.changeCurrentMagnet(magnet);

            clearTimeout(_this.timeOut);

            _this.timeOut = setTimeout(function () {
                if (_this.state.time == '00:00:00') {
                    _this.applyTimeout();
                }
            }, 50000);

            if (_this.state.playMovie) {
                var torrent = _this.state.client.add(magnet);

                torrent.on('metadata', function () {
                    _this.setPlayerStatus('Configuring the DeLorean', true);
                });

                torrent.on('ready', function () {
                    _this.setPlayerStatus('Retrieving from the owl postal service', true);
                    torrent.deselect(0, torrent.pieces.length - 1, false);

                    for (var i = 0; i < torrent.files.length; i++) {
                        var fileToDeselect = torrent.files[i];
                        fileToDeselect.deselect();
                    }

                    var videoFormats = ['avi', 'mp4', 'm4v', 'm4a', 'mkv', 'wmv', 'mov'];

                    var filtered = torrent.files.filter(function (file) {
                        var extension = file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length);

                        if (videoFormats.indexOf(extension) > -1) {
                            return file;
                        }
                    });

                    filtered.sort(function (a, b) {
                        return b.length - a.length;
                    });

                    var file = filtered[0];
                    var fileIndex = torrent.files.findIndex(function (item) {
                        if (file) {
                            return file.path == item.path;
                        }
                    });

                    if (!file) {
                        _this.applyTimeout(1);
                    } else if (!_this.state.playMovie) {
                        _this.removeTorrents();
                    } else if (file && _this.state.playMovie) {
                        file.select();

                        _this.closeServer();

                        _this.server = torrent.createServer();
                        _this.server.listen('8888');

                        _this.setVideoIndex(fileIndex).then(function () {
                            _this.setPlayerStatus('Logging into the OASIS', true);
                            _this.setMovieTime(_this.state.playMovie);
                        });
                    }
                });

                // torrent.on('warning', (err) => {     console.log(err); });
            } else {
                _this.destroyClient();
            }
        };

        _this.resetSearch = function () {
            _this.setInputValue('');
            _this.toggleSearch();
        };

        _this.toggleContainerSettings = function (genreContainer, collectionContainer) {
            _this.setState({ genreContainer: genreContainer, collectionContainer: collectionContainer });
        };

        _this.toggleSearch = function (open, content) {
            _this.setState({ search: open, searchContent: content });
        };

        _this.closeSearch = function () {
            _this.resetSearch();

            if (_this.state.active != "Featured") {
                _this.toggleContainerSettings(true, _this.state.collectionContainer);
            }
        };

        _this.sortQuery = function (results, query) {
            results.sort(function (a, b) {
                return b.popularity - a.popularity;
            });

            results = results.filter(function (movie) {
                var releaseDate = movie.release_date;
                var year = Number(releaseDate.substring(0, 4));
                var month = Number(releaseDate.substring(6, 7));

                var currentDate = new Date();
                currentDate = {
                    year: currentDate.getFullYear(),
                    month: currentDate.getMonth() + 1
                };

                return movie.backdrop_path !== null && year <= currentDate.year && (year == currentDate.year ? month < currentDate.month - 1 : true) && movie.popularity > 2 && movie.vote_average > 4 && movie.original_language == "en";
            });

            return results;
        };

        _this.searchEmpty = function (query) {
            _this.setState({ searchContent: React.createElement(
                    _Fade2.default,
                    { bottom: true },
                    React.createElement(
                        'div',
                        { className: 'search-empty' },
                        'No Results for "',
                        query.length > 20 ? query.substring(0, 20) + "..." : query,
                        '"'
                    )
                ) });
        };

        _this.setOffline = function (isOffline) {
            _this.setState({ isOffline: isOffline });
        };

        _this.fetchContent = function (url, callback, err) {
            (0, _getJson2.default)(url, function (error, response) {
                if (!error) {
                    _this.setOffline();
                    if (callback) {
                        callback(response);
                    }
                } else {
                    if (err) {
                        err(error);
                    }
                }
            });
        };

        _this.searchMovies = function () {
            _this.toggleSearch(true, _this.state.searchContent);
            _this.toggleContainerSettings(false, _this.state.collectionContainer);

            var query = _this.state.inputValue;

            if (query === "") {
                _this.closeSearch();
            } else {
                var searchResults = [];

                var _loop = function _loop(u) {
                    var url = 'https://api.themoviedb.org/3/search/movie?api_key=' + _this.state.apiKey + '&region=US&language=en-US&query=' + query + '&page=' + u + '&include_adult=false';

                    var promise = new Promise(function (resolve, reject) {
                        _this.fetchContent(url, function (response) {
                            var results = response.results;
                            resolve(results);
                        }, function (error) {
                            reject(error);
                        });
                    }).catch(function (err) {
                        return console.log(err);
                    });

                    searchResults.push(promise);
                };

                for (var u = 1; u < 5; u++) {
                    _loop(u);
                }

                Promise.all(searchResults).then(function (results) {
                    _this.setOffline();
                    results = [].concat.apply([], results);

                    if (!results.every(function (val) {
                        return !val;
                    })) {
                        results = _this.sortQuery(results, query);

                        if (results.length === 0) {
                            _this.searchEmpty(query);
                        } else {
                            _this.toggleSearch(true, _this.visualizeResults(results, true, true));
                        }
                    } else {
                        _this.searchEmpty(query);
                    }
                }).catch(function (err) {
                    return _this.setOffline(true);
                });
            }
        };

        _this.initMovie = function (movie) {
            _this.setState({ playerLoading: true, playMovie: movie, time: "00:00:00", paused: true });
        };

        _this.prepareMovieTitle = function (title) {
            return title.replace(/[^a-zA-Z0-9\s\-]/g, '').replace(/\-/g, ' ').toLowerCase();
        };

        _this.checkMagnet = function (movie) {
            return new Promise(function (resolve, reject) {
                var magnet = movie.magnet.toUpperCase();
                if (magnet.match(/^(?!.*(HDTS|HDTC|HD\.TS|HD\.TC|HD\-TS|HD\-TC|CAM))/g)) {
                    resolve(movie);
                } else {
                    movie.magnet = false;
                    console.log('Previous magnet link was of low quality.');
                    reject(movie);
                }
            });
        };

        _this.promiseTimeout = function (ms, promise) {
            var timeout = new Promise(function (resolve, reject) {
                var id = setTimeout(function () {
                    clearTimeout(id);
                    reject('Timed out in ' + ms + 'ms.');
                }, ms);
            }).catch(function (err) {
                return console.log(err);
            });

            return Promise.race([promise, timeout]);
        };

        _this.setPlayerLoading = function (playerLoading) {
            _this.setState({ playerLoading: playerLoading });
        };

        _this.setVideoIndex = function (videoIndex) {
            return new Promise(function (resolve, reject) {
                _this.setState({
                    videoIndex: videoIndex
                }, function () {
                    resolve();
                });
            });
        };

        _this.resetVideo = function () {
            _this.setPlayerLoading(true);
            _this.setVideoIndex();
            _this.setVideoError();
        };

        _this.closeServer = function () {
            if (_this.server) {
                _this.server.close();
            }
        };

        _this.searchTorrent = function (movie) {
            _this.resetVideo();
            _this.removeTorrents();
            _this.closeServer();

            if (movie.magnet) {
                _this.checkMagnet(movie).then(function (cleanMovie) {
                    _this.streamTorrent(cleanMovie);
                }).catch(function (movie) {
                    return _this.searchTorrent(movie);
                });
            } else {
                var query = _this.prepareMovieTitle(movie.title) + ' ' + movie.release_date.substring(0, 4);

                _this.setPlayerStatus('Searching the entire universe for "' + movie.title + '"', true);

                var publicSearch = _this.publicSearch.search(['1337x', 'Rarbg'], query, 'Movies', 20);

                var proprietarySearch = _this.torrentSearch.search(query);

                publicSearch.then(function (data) {
                    var magnetPromises = [];
                    for (var n = 0; n < data.length; n++) {
                        var magnetTorrent = data[n];
                        if (!magnetTorrent.magnet) {
                            var promise = _this.torrentSearch.getMagnetFromLink(magnetTorrent).catch(function (err) {
                                return console.log(err);
                            });
                            magnetPromises.push(promise);
                        }
                    }

                    Promise.all([proprietarySearch].concat(magnetPromises)).then(function (result) {
                        result = [].concat.apply([], result);
                        if (result.length) {
                            _this.getPreferredTorrents(result).then(function (torrents) {
                                var torrent = torrents[0];
                                if (torrent) {
                                    if (_this.state.playMovie) {
                                        var _movie = Object.assign({}, _this.state.playMovie);
                                        _movie.preferredTorrents = torrents;
                                        var magnet = torrent.magnet;
                                        _this.setState({
                                            playMovie: _movie
                                        }, function () {
                                            _this.changeCurrentMagnet(magnet);
                                            _this.updateMovieTimeArray(_this.getObjectClone(_this.state.playMovie), true);
                                            _this.streamTorrent(torrent);
                                        });
                                    }
                                } else {
                                    _this.applyTimeout();
                                }
                            });
                        } else {
                            _this.applyTimeout();
                        }
                    }).catch(function (err) {
                        return console.log(err);
                    });
                }).catch(function (err) {
                    return console.log(err);
                });
            }
        };

        _this.playMovie = function (movie) {
            movie = _this.matchMovie(movie);
            _this.initMovie(movie);
            _this.toggleBox().then(function () {
                _this.searchTorrent(movie);
                _this.addToRecentlyPlayed(movie);
            });
        };

        _this.destroyClient = function (backUp) {
            return new Promise(function (resolve, reject) {
                clearTimeout(_this.timeOut);
                if (_this.state.client) {
                    var playMovie = backUp ? _this.getObjectClone(_this.state.playMovie) : false;
                    _this.setState({
                        playMovie: playMovie,
                        startTime: backUp ? _this.state.startTime : false,
                        videoIndex: false,
                        videoElement: false,
                        isStreaming: false,
                        paused: true,
                        playerLoading: backUp ? true : false
                    }, function () {
                        _this.closeServer();

                        if (backUp) {
                            _this.removeTorrents().then(function () {
                                resolve();
                            });
                        } else {
                            resolve();
                        }
                    });
                }
            }).catch(function (err) {
                return console.log(err);
            });
        };

        _this.setFullScreen = function (full) {
            var browserWindow = require("electron").remote.getCurrentWindow();

            if (full === undefined) {
                full = false;
            }
            browserWindow.setFullScreen(full);
        };

        _this.setMovieTimeArray = function (newArray) {
            _this.setState(function (prevState) {
                if (prevState.movieTimeArray !== _this.state.movieTimeArray || newArray) {
                    return {
                        movieTimeArray: newArray ? newArray : _this.state.movieTimeArray
                    };
                }
            }, function () {
                _this.setStorage();
            });
        };

        _this.addToMovieTimeArray = function (movie) {
            var clone = [].concat(_toConsumableArray(_this.state.movieTimeArray));
            clone.push(movie);

            _this.setMovieTimeArray(clone);
        };

        _this.changeCurrentMagnet = function (magnet) {
            _this.currentMagnet = magnet;
        };

        _this.getCurrentMagnet = function () {
            return _this.currentMagnet;
        };

        _this.updateMovieTimeArray = function (clone, alt) {
            var movieTimeArray = [].concat(_toConsumableArray(_this.state.movieTimeArray));
            var matchingItem = movieTimeArray.find(function (movie) {
                return movie.id == clone.id;
            });

            if (matchingItem) {
                matchingItem.magnet = _this.currentMagnet;
                if (alt) {
                    matchingItem.preferredTorrents = clone.preferredTorrents;
                } else {
                    matchingItem.currentTime = clone.currentTime;
                }

                _this.setMovieTimeArray(movieTimeArray);
            } else {
                var movieData = {
                    id: clone.id,
                    currentTime: clone.currentTime,
                    preferredTorrents: clone.preferredTorrents,
                    magnet: _this.currentMagnet
                };
                _this.addToMovieTimeArray(movieData);
            }
        };

        _this.getObjectClone = function (src) {
            var target = {};
            for (var prop in src) {
                if (src.hasOwnProperty(prop)) {
                    target[prop] = src[prop];
                }
            }
            return target;
        };

        _this.updateMovieTime = function (time) {
            if (_this.state.playMovie) {
                if (time || time !== 0) {
                    var clone = _this.getObjectClone(_this.state.playMovie);
                    clone.currentTime = time;
                    _this.setState({ playMovie: clone });
                    _this.updateMovieTimeArray(clone);
                }
            }
        };

        _this.removeClient = function (time) {
            if (time) {
                _this.updateMovieTime(time);
            }
            _this.setState({
                error: false,
                playerStatus: false
            }, function () {
                _this.destroyClient().then(function () {
                    _this.removeTorrents().then(function (result) {
                        console.log(result);
                    });
                });
            });
            _this.setFullScreen();
        };

        _this.matchMovie = function (movie) {
            var matchingItem = _this.getClone(_this.state.movieTimeArray).find(function (item) {
                return item.id == movie.id;
            });

            if (matchingItem) {
                movie.magnet = matchingItem.magnet;
                movie.preferredTorrents = matchingItem.preferredTorrents;
                _this.changeCurrentMagnet(matchingItem.magnet);
                return movie;
            }

            return movie;
        };

        _this.openBox = function (movie) {
            _this.toggleBox(true);
            _this.setState({ movieCurrent: movie });
        };

        _this.toggleBox = function (active) {
            return new Promise(function (resolve, reject) {
                _this.setState({
                    showBox: active
                }, function () {
                    setTimeout(resolve, 250);
                });
            });
        };

        _this.closeBackdrop = function () {
            _this.toggleBox();
        };

        _this.getHeader = function (results) {
            return results[0].backdrop_path;
        };

        _this.setHeader = function (url) {
            _this.setState({ headerBg: url });
        };

        _this.strip = function (string, chars) {
            return string.substring(0, chars);
        };

        _this.setResults = function (results) {
            if (results) {
                results = results.slice();
                _this.setState({ results: results });
            }
        };

        _this.visualizeResults = function (results, featured, set) {
            if (set) {
                _this.setResults(results);
            }

            var items = results.map(function (movie, index) {
                return React.createElement(MovieItem, {
                    movie: movie,
                    openBox: _this.openBox,
                    strip: _this.strip,
                    key: (0, _uniqid2.default)(),
                    featured: featured });
            });

            return items;
        };

        _this.getURLDate = function (n, justYear) {
            var date = new Date(),
                year = date.getFullYear(),
                month = date.getMonth().toString().length < 2 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1,
                day = date.getDate().toString().length < 2 ? '0' + date.getDate() : date.getDate();

            if (justYear) {
                return year - n;
            }

            return year - n + '-' + month + '-' + day;
        };

        _this.getFeatured = function (resolve, reject, page) {
            var url = 'https://api.themoviedb.org/3/discover/movie?api_key=' + _this.state.apiKey + '&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&primary_release_date.gte=' + _this.getURLDate(5, true) + '&primary_release_date.lte=' + _this.getURLDate(1, true);
            _this.fetchContent(url, function (response) {
                resolve(response);
            }, function (error) {
                reject(error);
            });
        };

        _this.loadFeatured = function () {
            _this.toggleContainerSettings();
            var promise = new Promise(function (resolve, reject) {
                _this.getFeatured(resolve, reject);
            });

            promise.then(function (result) {
                _this.setContent(_this.visualizeResults(result.results, true, true));
            }, function (err) {
                _this.setOffline(true);
            });
        };

        _this.shuffleArray = function (array) {
            var currentIndex = array.length;
            var temporaryValue = void 0;
            var randomIndex = void 0;

            while (0 !== currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        };

        _this.getMovies = function (genre, genreID) {
            var url = 'https://api.themoviedb.org/3/discover/movie?api_key=' + _this.state.apiKey + '&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=' + (Math.floor(Math.random() * _this.state.genrePages) + 1) + '&primary_release_date.lte=' + _this.getURLDate(1) + '&with_genres=' + genreID;

            return new Promise(function (resolve, reject) {
                _this.fetchContent(url, function (response) {
                    var genreComplete = {
                        name: genre,
                        genreID: genreID,
                        movies: _this.shuffleArray(response.results)
                    };
                    resolve(genreComplete);
                }, function (error) {
                    reject(error);
                });
            }).catch(function (err) {
                return console.log(err);
            });
        };

        _this.isRecent = function (movie) {
            return _this.state.recentlyPlayed.find(function (item) {
                return item.id == movie.id;
            });
        };

        _this.isFavorite = function (movie) {
            if (_this.state.favorites) {
                return _this.state.favorites.find(function (item) {
                    return item.id == movie.id;
                });
            } else {
                return false;
            }
        };

        _this.chooseRandom = function (array, limit) {
            var results = [],
                previousItem = {};

            if (array.length < limit) {
                limit = array.length;
            }

            for (var i = 0; i < limit; i++) {
                var item = array[Math.floor(Math.random() * array.length)];
                if (previousItem.title) {
                    while (previousItem.title == item.title) {
                        item = array[Math.floor(Math.random() * array.length)];
                    }
                }
                previousItem = item;
                results.push(item);
            }

            return results;
        };

        _this.getRecommended = function (url) {
            return new Promise(function (resolve, reject) {
                _this.fetchContent(url, function (response) {
                    resolve(response.results.slice(0, 5));
                }, function (error) {
                    reject(error);
                });
            });
        };

        _this.getSuggested = function (movies) {
            return new Promise(function (resolve, reject) {
                var promises = [];
                var pages = [1, 2, 3];
                for (var j = 0; j < movies.length; j++) {
                    var movie = movies[j],
                        page = _this.chooseRandom(pages, 1);
                    if (movie) {
                        var _url = 'https://api.themoviedb.org/3/movie/' + movie.id + '/recommendations?api_key=' + _this.state.apiKey + '&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=' + page + '&primary_release_date.lte=' + _this.getURLDate(1);
                        var promise = _this.getRecommended(_url);
                        promises.push(promise);
                    }
                }

                Promise.all(promises).then(function (suggested) {
                    var finalSuggested = [].concat.apply([], suggested);
                    resolve(finalSuggested);
                }).catch(function (err) {
                    return reject(err);
                });
            });
        };

        _this.stripDuplicateMovies = function (array) {
            var unique = [],
                uniqueMovies = [];
            for (var k = 0; k < array.length; k++) {
                var movie = array[k];
                if (unique.indexOf(movie.id) === -1) {
                    unique.push(movie.id);
                    uniqueMovies.push(movie);
                }
            }

            return uniqueMovies;
        };

        _this.updateSuggested = function () {
            var favorites = _this.chooseRandom(_this.state.favorites, 5),
                recents = _this.chooseRandom(_this.state.recentlyPlayed, 5),
                collection = favorites.concat(recents);

            _this.getSuggested(collection).then(function (suggested) {
                var clean = _this.stripDuplicateMovies(suggested);
                if (clean.length > 20) {
                    clean = clean.slice(0, 20);
                }

                clean = _this.shuffleArray(clean);
                _this.setState({
                    suggested: clean
                }, function () {
                    if (_this.databaseRef) {
                        _this.setBucket();
                    }
                });
            });
        };

        _this.getClone = function (array) {
            return [].concat(_toConsumableArray(array));
        };

        _this.addToFavorites = function (movie) {
            var clone = _this.getClone(_this.state.favorites);
            clone.push(movie);
            _this.setState({
                favorites: clone
            }, function () {
                _this.setStorage();
            });
        };

        _this.removeFromFavorites = function (movie) {
            var clone = _this.getClone(_this.state.favorites);
            var index = clone.findIndex(function (item) {
                return item.id == movie.id;
            });
            clone.splice(index, 1);
            _this.setState({
                favorites: clone
            }, function () {
                _this.setStorage();
            });
        };

        _this.addToRecentlyPlayed = function (movie) {
            var clone = _this.getClone(_this.state.recentlyPlayed);
            if (!_this.isRecent(movie)) {
                if (clone.length > 20) {
                    clone.splice(-1, 1);
                }

                clone.unshift(movie);
                _this.setState({
                    recentlyPlayed: clone
                }, function () {
                    _this.setStorage();
                });
            } else {
                var index = clone.findIndex(function (item) {
                    return item.id == movie.id;
                });

                clone.splice(index, 1);
                clone.unshift(movie);
                _this.setState({
                    recentlyPlayed: clone
                }, function () {
                    _this.setStorage();
                });
            }
        };

        _this.visualizeMovieGenres = function (movieData) {
            _this.setResults([movieData[0].movies[0]]);

            var movieGenres = movieData.map(function (item, i) {
                var movies = item.movies.map(function (movie, index) {
                    return React.createElement(MovieItem, {
                        movie: movie,
                        openBox: _this.openBox,
                        strip: _this.strip,
                        key: (0, _uniqid2.default)() });
                });

                return React.createElement(GenreContainer, {
                    toggleGenre: _this.toggleGenre,
                    genreID: item.genreID,
                    name: item.name,
                    movies: movies,
                    key: (0, _uniqid2.default)() });
            });

            return movieGenres;
        };

        _this.loadMovies = function () {
            _this.toggleContainerSettings(true, false);

            var genres = [{
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
            }];

            var promiseArray = [];

            var _loop2 = function _loop2(j) {
                var promise = new Promise(function (resolve, reject) {
                    _this.getMovies(genres[j].name, genres[j].id).then(function (genreComplete) {
                        resolve(genreComplete);
                    }).catch(function (err) {
                        return console.log(err);
                    });
                });

                promiseArray.push(promise);
            };

            for (var j = 0; j < genres.length; j++) {
                _loop2(j);
            }

            Promise.all(promiseArray).then(function (data) {
                _this.setContent(_this.visualizeMovieGenres(data));
            }).catch(function () {
                return _this.setOffline(true);
            });
        };

        _this.loadCollection = function () {
            _this.toggleContainerSettings(true, true);
            var headerSource = _this.state.suggested ? _this.state.suggested : _this.state.recentlyPlayed ? _this.state.recentlyPlayed : _this.state.favorites ? _this.state.favorites : false;
            _this.setResults(headerSource);
        };

        _this.setContent = function (content) {
            _this.setState({ content: content });
        };

        _this.loadContent = function (active) {
            _this.setContent(false);
            switch (active) {
                case "Featured":
                    _this.loadFeatured();
                    break;
                case "Movies":
                    _this.loadMovies();
                    break;
                case "Collection":
                    _this.loadCollection();
                    break;
            }
        };

        _this.handleMenu = function () {
            if (_this.state.menuActive) {
                _this.setState({ menuActive: false });
            }
        };

        _this.updateMenu = function (menuActive, active) {
            if (menuActive != undefined) {
                _this.setState({ menuActive: menuActive });
            }

            if (active != undefined) {
                _this.setState({
                    active: active
                }, function () {
                    _this.loadContent(_this.state.active);
                });
            }
        };

        _this.handleLogo = function () {
            _this.setState({ logoIsLoaded: true });
        };

        _this.loadLogo = function () {
            var tempImage = new Image();
            tempImage.onload = _this.handleLogo;
            tempImage.src = 'assets/imgs/icon.png';
        };

        _this.requireTorrent = function () {
            _this.publicSearch = require('torrent-search-api');
            _this.publicSearch.enablePublicProviders();

            _this.torrentSearch = TorrentSearch;
        };

        _this.signIn = function () {
            var email = _this.state.inputEmail.length ? _this.state.inputEmail : _this.state.user.email,
                password = _this.state.inputPass.length ? _this.state.inputPass : _this.state.user.password;

            _app2.default.auth().signInWithEmailAndPassword(email, password).then(function () {
                _this.closeAccount();
            }).catch(function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                _this.setState({ loginError: errorMessage });
            });
        };

        _this.startFireBase = function () {
            var firebaseConfig = {
                apiKey: "AIzaSyAOWT7w9hA8qsLY-KP7F14Qfv9vLjw3YJM",
                authDomain: "flixerr-5aeb8.firebaseapp.com",
                databaseURL: "https://flixerr-5aeb8.firebaseio.com",
                projectId: "flixerr-5aeb8",
                storageBucket: "flixerr-5aeb8.appspot.com",
                messagingSenderId: "58493893285",
                appId: "1:58493893285:web:b02990447eb9f16f"
            };

            _app2.default.initializeApp(firebaseConfig);

            _app2.default.auth().onAuthStateChanged(function (user) {
                _this.setState({ user: user });
                if (user) {
                    _this.createDataBase();
                    _this.getBucket();
                    _this.listenToBucket();
                }
                _this.setUserCredentials();
            });

            if (!_this.state.isGuest && _this.state.user) {
                _this.signIn();
            } else if (!_this.state.isGuest && !_this.state.user) {
                _this.openAccount();
            } else if (!_this.state.user) {
                _this.updateSuggested();
            }
        };

        _this.handleAccount = function () {
            var email = _this.state.inputEmail,
                password = _this.state.inputPass;

            if (!email.length && !password.length) {
                _this.setState({ loginError: true });
            } else {

                if (_this.state.create) {
                    _app2.default.auth().createUserWithEmailAndPassword(email, password).then(function () {
                        _this.closeAccount();
                    }).catch(function (error) {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        _this.setState({ loginError: errorMessage });
                    });
                } else {
                    _this.signIn();
                }
            }
        };

        _this.openAccount = function () {
            _this.setState({ create: false, loginError: false, account: true });
        };

        _this.openAccountCreation = function () {
            _this.setState({ create: true, loginError: false, account: false });
        };

        _this.closeAccount = function () {
            _this.setState({
                inputEmail: '',
                inputPass: '',
                account: false,
                create: false,
                loginError: false,
                isGuest: true
            }, function () {
                _this.setUserCredentials();
            });
        };

        _this.closeBackup = function () {
            _this.setState({ backupIsOpen: false });
        };

        _this.signOut = function () {
            _app2.default.auth().signOut().then(function () {
                _this.databaseRef = false;
                _this.setStorage();
            }).catch(function (error) {
                console.log(error);
            });
        };

        _this.handleInput = function (e) {
            var value = e.target.value;
            var isEmail = value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g);

            _this.setState(_defineProperty({}, isEmail ? 'inputEmail' : 'inputPass', value));
        };

        _this.handleAccountSignin = function () {
            _this.setState({
                create: false
            }, function () {
                _this.handleAccount();
            });
        };

        _this.handleAccountCreation = function () {
            _this.setState({
                create: true
            }, function () {
                _this.handleAccount();
            });
        };

        _this.handleConnectionChange = function (e) {
            if (e.type == "offline") {
                _this.setOffline(true);
            }
            if (e.type == "online") {
                _this.setOffline();
                _this.updateMenu(false, _this.state.active);
                _this.resetSearch();
            }
        };

        _this.handleInput.bind(_this);

        _this.state = {
            apiKey: "22b4015cb2245d35a9c1ad8cd48e314c",
            loginError: false,
            account: true,
            create: false,
            inputEmail: '',
            inputPass: '',
            user: false,
            isGuest: false,
            menu: ["Featured", "Movies", "Collection", "Sign In"],
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
        };
        return _this;
    }

    _createClass(App, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            this.loadLogo();
            this.getStorage().then(function () {
                return _this2.getUserCredentials();
            }).catch(function (err) {
                return console.log(err);
            });
            this.loadContent(this.state.active);
            this.startWebTorrent();
            this.requireTorrent();
            window.addEventListener('online', this.handleConnectionChange);
            window.addEventListener('offline', this.handleConnectionChange);
        }
    }, {
        key: 'render',
        value: function render() {
            var menu = this.state.menuActive ? React.createElement(Menu, {
                menu: this.state.menu,
                user: this.state.user,
                openAccount: this.openAccount,
                signOut: this.signOut,
                active: this.state.active,
                updateMenu: this.updateMenu,
                resetSearch: this.resetSearch }) : null;

            var movieBackDrop = this.state.showBox ? React.createElement('div', { className: 'movie-container-bg', onClick: this.closeBackdrop }) : null;

            var movieModal = this.state.showBox ? React.createElement(MovieModal, {
                movie: this.state.movieCurrent,
                favorites: this.state.favorites,
                playMovie: this.playMovie,
                isFavorite: this.isFavorite,
                addToFavorites: this.addToFavorites,
                removeFromFavorites: this.removeFromFavorites }) : null;

            var playerModal = this.state.playMovie ? React.createElement(Player, {
                startTime: this.state.startTime,
                isStreaming: this.state.isStreaming,
                changeCurrentMagnet: this.changeCurrentMagnet,
                updateMovieTime: this.updateMovieTime,
                resetClient: this.destroyClient,
                togglePause: this.togglePause,
                showBackup: this.showBackup,
                openBackup: this.state.backupIsOpen,
                closeBackup: this.closeBackup,
                streamTorrent: this.streamTorrent,
                searchTorrent: this.searchTorrent,
                time: this.state.time,
                tempTime: this.state.tempTime,
                currentTime: this.state.currentTime,
                setCurrentTime: this.setCurrentTime,
                colorStop: this.state.colorStop,
                setColorStop: this.setColorStop,
                videoIndex: this.state.videoIndex,
                paused: this.state.paused,
                removeClient: this.removeClient,
                handleVideoClose: this.handleVideoClose,
                setFullScreen: this.setFullScreen,
                movie: this.state.playMovie,
                getCurrentMagnet: this.getCurrentMagnet,
                loading: this.state.playerLoading,
                setPlayerLoading: this.setPlayerLoading,
                setVideoElement: this.setVideoElement,
                playerStatus: this.state.playerStatus,
                error: this.state.error,
                handleVideo: this.handleVideo,
                setSeekValue: this.setSeekValue,
                seekValue: this.state.seekValue }) : null;

            var fullGenreContainer = this.state.showGenre ? React.createElement(Genre, {
                genre: this.state.activeGenre,
                genreID: this.state.genreID,
                apiKey: this.state.apiKey,
                fetchContent: this.fetchContent,
                visualizeResults: this.visualizeResults,
                setOffline: this.setOffline,
                closeGenre: this.closeGenre }) : null;

            var loadingContainer = this.state.appLoading ? React.createElement(
                'div',
                { className: 'loading-container' },
                React.createElement(
                    _Fade2.default,
                    { when: this.state.logoIsLoaded, distance: '10%', bottom: true },
                    React.createElement('div', { className: 'logo' })
                )
            ) : null;

            var accountContainer = this.state.account ? React.createElement(
                'div',
                { className: 'account-container' },
                React.createElement(
                    _Fade2.default,
                    { bottom: true, distance: '10%' },
                    React.createElement(
                        'div',
                        { className: 'account-form' },
                        React.createElement(
                            'div',
                            { className: 'account-close', onClick: this.closeAccount },
                            React.createElement('i', { className: 'mdi mdi-close' })
                        ),
                        React.createElement(
                            'div',
                            { className: 'account-title' },
                            'Sign in'
                        ),
                        React.createElement(
                            'div',
                            { className: 'account-desc' },
                            'Flixerr will use your account to synchronize data across all your devices.'
                        ),
                        React.createElement('input', {
                            type: 'email',
                            placeholder: 'Email',
                            autoFocus: true,
                            required: true,
                            onKeyUp: this.handleInput }),
                        React.createElement('span', null),
                        React.createElement('input', {
                            type: 'password',
                            placeholder: 'Password',
                            required: true,
                            onKeyUp: this.handleInput }),
                        React.createElement('span', null),
                        this.state.loginError ? React.createElement(
                            _Fade2.default,
                            { bottom: true, distance: '10%' },
                            React.createElement(
                                'div',
                                { className: 'login-error' },
                                this.state.loginError
                            )
                        ) : '',
                        React.createElement(
                            'div',
                            { className: 'account-submit', onClick: this.handleAccountSignin },
                            'Sign In'
                        ),
                        React.createElement('div', { className: 'divider' }),
                        React.createElement(
                            'div',
                            {
                                className: 'account-submit account-secondary',
                                onClick: this.openAccountCreation },
                            'Sign Up'
                        )
                    )
                )
            ) : null;

            var createContainer = this.state.create ? React.createElement(
                'div',
                { className: 'create-container account-container' },
                React.createElement(
                    'div',
                    { className: 'account-form' },
                    React.createElement(
                        'div',
                        { className: 'account-close', onClick: this.closeAccount },
                        React.createElement('i', { className: 'mdi mdi-close' })
                    ),
                    React.createElement(
                        'div',
                        { className: 'account-title' },
                        'Create an account'
                    ),
                    React.createElement(
                        'div',
                        { className: 'account-desc' },
                        'Register to easily synchronize data across multiple devices.'
                    ),
                    React.createElement('input', {
                        type: 'email',
                        placeholder: 'Email',
                        autoFocus: true,
                        required: true,
                        onKeyUp: this.handleInput }),
                    React.createElement('span', null),
                    React.createElement('input', {
                        type: 'password',
                        placeholder: 'Password',
                        required: true,
                        onKeyUp: this.handleInput }),
                    React.createElement('span', null),
                    this.state.loginError ? React.createElement(
                        _Fade2.default,
                        { bottom: true, distance: '10%' },
                        React.createElement(
                            'div',
                            { className: 'login-error' },
                            this.state.loginError
                        )
                    ) : '',
                    React.createElement(
                        'div',
                        { className: 'account-submit', onClick: this.handleAccountCreation },
                        'Create'
                    ),
                    React.createElement('div', { className: 'divider' }),
                    React.createElement(
                        'div',
                        { className: 'account-submit account-secondary', onClick: this.openAccount },
                        'Sign In'
                    )
                )
            ) : null;

            return React.createElement(
                'div',
                {
                    className: 'app-container ' + (process.platform === "win32" ? "windows-compensate" : ''),
                    onClick: this.handleMenu },
                process.platform === "darwin" ? React.createElement('div', {
                    className: 'draggable ' + (this.state.playMovie ? "invisible" : "") }) : '',
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: 'player-anim',
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    createContainer
                ),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: 'player-anim',
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    accountContainer
                ),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: 'loading-anim',
                        transitionEnterTimeout: 0,
                        transitionLeaveTimeout: 300 },
                    loadingContainer
                ),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: 'genreContainer-anim',
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    fullGenreContainer
                ),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: 'player-anim',
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    playerModal
                ),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: 'movie-box-anim',
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    movieModal
                ),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: 'box-anim',
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    movieBackDrop
                ),
                React.createElement(Header, {
                    subtitle: this.state.active,
                    menuActive: this.state.menuActive,
                    updateMenu: this.updateMenu,
                    background: this.state.headerBg,
                    closeSearch: this.closeSearch,
                    searchContent: this.state.searchContent,
                    searchMovies: this.searchMovies,
                    inputValue: this.state.inputValue,
                    setInputValue: this.setInputValue,
                    user: this.state.user }),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: 'menu-anim',
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    menu
                ),
                React.createElement(Content, {
                    isOffline: this.state.isOffline,
                    content: this.state.content,
                    genre: this.state.genreContainer,
                    collectionContainer: this.state.collectionContainer,
                    suggested: this.state.suggested,
                    recentlyPlayed: this.state.recentlyPlayed,
                    favorites: this.state.favorites,
                    search: this.state.search,
                    searchContent: this.state.searchContent,
                    getHeader: this.getHeader,
                    setHeader: this.setHeader,
                    strip: this.strip,
                    openBox: this.openBox,
                    results: this.state.results })
            );
        }
    }]);

    return App;
}(React.Component);

ReactDOM.render(React.createElement(App, null), document.getElementById("app"));