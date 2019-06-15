"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactTransitionGroup = require("react-transition-group");

var _Fade = require("react-reveal/Fade");

var _Fade2 = _interopRequireDefault(_Fade);

var _electronJsonStorage = require("electron-json-storage");

var _electronJsonStorage2 = _interopRequireDefault(_electronJsonStorage);

var _app = require("firebase/app");

var _app2 = _interopRequireDefault(_app);

require("firebase/auth");

require("firebase/database");

var _accountContainer = require("./account-container");

var _accountContainer2 = _interopRequireDefault(_accountContainer);

var _menu = require("./menu");

var _menu2 = _interopRequireDefault(_menu);

var _movieModal = require("./movie-modal");

var _movieModal2 = _interopRequireDefault(_movieModal);

var _player = require("./player");

var _player2 = _interopRequireDefault(_player);

var _genre = require("./genre");

var _genre2 = _interopRequireDefault(_genre);

var _header = require("./header");

var _header2 = _interopRequireDefault(_header);

var _content = require("./content");

var _content2 = _interopRequireDefault(_content);

var _torrentSearch = require("./torrent-search");

var _torrentSearch2 = _interopRequireDefault(_torrentSearch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var parseTorrent = require("parse-torrent-name");
var request = require("axios");

var App = function (_Component) {
    _inherits(App, _Component);

    function App(props) {
        _classCallCheck(this, App);

        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

        _this.setFileLoaded = function (fileLoaded) {
            _this.setState({ fileLoaded: fileLoaded });
        };

        _this.setReady = function (readyToClose) {
            _this.setState({ readyToClose: readyToClose });
        };

        _this.setWillClose = function (willClose) {
            _this.setState({ willClose: willClose });
        };

        _this.toggleIntro = function (showIntro) {
            _this.setState({
                showIntro: showIntro
            }, function () {
                if (!showIntro) {
                    _this.setVideoIndex(_this.fileIndex);
                }
            });
        };

        _this.setQuality = function (quality) {
            _this.setState({
                quality: quality
            }, function () {
                clearTimeout(_this.qualityTimeout);
                _this.qualityTimeout = setTimeout(function () {
                    _this.setStorage();
                }, 250);
            });
        };

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

        _this.toggleGenre = function (showGenre, genreInfo) {
            _this.setState({ showGenre: showGenre, genreInfo: genreInfo });
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
            _electronJsonStorage2.default.get("userCredentials", function (error, data) {
                if (error) {
                    console.log("Not able to retrieve user credentials.");
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
                    if ((typeof object === "undefined" ? "undefined" : _typeof(object)) === "object") {
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
                if (obj[key] && _typeof(obj[key]) === "object") _this.removeEmpty(obj[key]);else if (obj[key] === undefined) delete obj[key];
            });
            return obj;
        };

        _this.createDataBase = function () {
            if (_this.state.user) {
                var db = _app2.default.database();
                _this.databaseRef = db.ref("users/" + _this.state.user.uid);
            }
        };

        _this.setBucket = function () {
            if (_this.state.user.email) {
                var data = {
                    recentlyPlayed: _this.cleanMovieArrays(_this.state.recentlyPlayed),
                    movieTimeArray: _this.cleanMovieArrays(_this.state.movieTimeArray),
                    favorites: _this.cleanMovieArrays(_this.state.favorites),
                    suggested: _this.cleanMovieArrays(_this.state.suggested),
                    quality: _this.state.quality ? _this.state.quality : "HD"
                };

                _this.databaseRef.set(data, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        _this.setCloseReady();
                        console.log("Data set!");
                    }
                });
            }
        };

        _this.isEqualToObject = function (object1, object2) {
            for (propName in object1) {
                if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
                    return false;
                } else if (_typeof(object1[propName]) != _typeof(object2[propName])) {
                    return false;
                }
            }
            for (propName in object2) {
                if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
                    return false;
                } else if (_typeof(object1[propName]) != _typeof(object2[propName])) {
                    return false;
                }
                if (!object1.hasOwnProperty(propName)) continue;

                if (object1[propName] instanceof Array && object2[propName] instanceof Array) {
                    if (!_this.isEqualToObject(object1[propName], object2[propName])) return false;
                } else if (object1[propName] instanceof Object && object2[propName] instanceof Object) {
                    if (!_this.isEqualToObject(object1[propName], object2[propName])) return false;
                } else if (object1[propName] != object2[propName]) {
                    return false;
                }
            }
            return true;
        };

        _this.isEqualToArray = function (array1, array2) {
            if (!array2) return false;

            if (array1.length != array2.length) return false;

            for (var i = 0, l = array1.length; i < l; i++) {
                if (array1[i] instanceof Array && array2[i] instanceof Array) {
                    if (!_this.isEqualToArray(array1[i], array2[i])) return false;
                } else if (array1[i] instanceof Object && array2[i] instanceof Object) {
                    if (!_this.isEqualToArray(array1[i], array2[i])) return false;
                } else if (array1[i] != array2[i]) {
                    return false;
                }
            }
            return true;
        };

        _this.setDiff = function (data) {
            var change = ["favorites", "recentlyPlayed", "movieTimeArray", "quality"];
            return new Promise(function (resolve, reject) {
                var newState = {};
                for (var i = 0; i < change.length; i++) {
                    var key = change[i],
                        subject = data[key],
                        comparator = _this.state[key];
                    if (_this.setEverything) {
                        newState[key] = subject;
                    } else {
                        if ((typeof subject === "undefined" ? "undefined" : _typeof(subject)) === "object") {
                            if (!_this.isEqualToArray(subject, comparator)) {
                                newState[key] = subject;
                            }
                        } else {
                            if (subject !== comparator) {
                                newState[key] = subject;
                            }
                        }
                    }
                }

                if (!newState.suggested && _this.setEverything) {
                    _this.getSuggested(data).then(function (suggested) {
                        newState.suggested = suggested;
                        _this.setState(newState, function () {
                            resolve();
                        });
                    }).catch(function (err) {
                        return console.log(err);
                    });
                } else {
                    _this.setState(newState, function () {
                        resolve();
                    });
                }
            });
        };

        _this.setBucketData = function (snapshot) {
            return new Promise(function (resolve, reject) {
                var data = snapshot.val();
                if (data) {
                    _this.setDiff(data).then(function () {
                        return resolve();
                    });
                } else {
                    reject();
                }
            });
        };

        _this.listenToBucket = function () {
            if (_this.databaseRef) {
                _this.databaseRef.on("value", _this.setBucketData);
            }
        };

        _this.getBucket = function () {
            if (_this.databaseRef) {
                _this.databaseRef.once("value", function (snapshot) {
                    if (snapshot) {
                        _this.setBucketData(snapshot).catch(function (err) {
                            _this.resetData();
                        });
                    }
                });
            }
        };

        _this.setCloseReady = function () {
            if (_this.state.willClose) {
                setTimeout(function () {
                    _this.setPlayerStatus('Data saved succesfully!').then(function () {
                        _this.setReady(true);
                    });
                }, 600);
            }
        };

        _this.setStorage = function () {
            _electronJsonStorage2.default.set("collection", {
                favorites: _this.state.favorites,
                recentlyPlayed: _this.state.recentlyPlayed,
                movieTimeArray: _this.state.movieTimeArray,
                quality: _this.state.quality
            }, function (error) {
                if (error) {
                    throw error;
                }
                if (_app2.default.auth().currentUser) {
                    _this.setEverything = false;
                    _this.setBucket();
                } else {
                    _this.setCloseReady();
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
                            quality: data ? data.quality ? data.quality : "HD" : "HD"
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
                hours = "0" + hours;
            }
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            return "" + (hours ? hours + ":" : "") + (minutes ? minutes + ":" : "") + seconds;
        };

        _this.getPreferredTorrents = function (torrents) {
            return new Promise(function (resolve, reject) {
                var preferredTorrents = torrents.filter(function (item, index) {
                    if (item) {
                        if (item.download || item.magnet) {
                            var parsed = parseTorrent(item.title);
                            var title = item.title.toUpperCase();

                            if (item.download) {
                                item.magnet = item.download;
                                delete item.download;
                            }

                            if (item.hasOwnProperty("seeds") || item.hasOwnProperty("peers")) {
                                item.seeders = item.seeds;
                                item.leechers = item.peers;
                                delete item.seeds;
                                delete item.peers;
                            }

                            item.title = parsed.title + " (" + parsed.year + ") " + (parsed.group ? parsed.group.match(/^\[.*?\]$/g) ? "" + parsed.group : "(" + parsed.group + ")" : "");
                            item.quality = parsed.quality;
                            item.resolution = parsed.resolution;

                            item.health = Math.round(item.leechers > 0 ? item.seeders / item.leechers : item.seeders);

                            return title.match(/^(?=.*(1080|720|HD|YIFY))(?!.*(3D|HDTS|HDTC|HD\.TS|HD\.TC|HD\-TS|HD\-TC|CAM))/g) || item.magnet.toUpperCase().match(/^(?=.*(DVDRIP))/g);
                        }
                    }
                });

                preferredTorrents.sort(function (a, b) {
                    return b.health - a.health;
                });

                resolve(preferredTorrents);
            });
        };

        _this.togglePause = function (paused) {
            if (!paused) {
                if (_this.state.client.torrents[0]) {
                    _this.state.client.torrents[0].resume();
                }
            }
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

                var file = _this.state.client.torrents[0].files[_this.state.videoIndex],
                    loaded = file.downloaded / file.length * 100;

                _this.setColorStop(colorStop);
                _this.setFileLoaded(loaded);

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
            _this.setPlayerStatus('Saving data before closing', true);
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

            _this.setDownloadPercent();
            _this.setDownloadSpeed();
            _this.setFileLoaded(0);

            if (!type) {
                message = "Ooops, we dropped the ball. Please try a different torrent.";
            } else if (type == 1) {
                message = "We can't find Kevin";
            } else if (type == 2) {
                message = "Stop littering";
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
            var WebTorrent = require("webtorrent");
            _this.setState({
                client: new WebTorrent({ maxConn: 150 })
            }, function () {
                _this.state.client.on("error", function (err) {
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
                    return resolve("Torrents removed.");
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
            clearTimeout(_this.streamTimeout);
            _this.setPlayerLoading(false);
            _this.setPlayerStatus("We've found a reason for your meaningless existence").then(function () {
                _this.setPlayerStatus(false);
            });
        };

        _this.setDownloadPercent = function (downloadPercent) {
            _this.setState({ downloadPercent: downloadPercent });
        };

        _this.setDownloadSpeed = function (downloadSpeed) {
            _this.setState({ downloadSpeed: downloadSpeed });
        };

        _this.fetchFirstPieces = function (torrent, file) {
            return new Promise(function (resolve, reject) {
                _this.setStreamTimeout(20000);

                var torrentLength = torrent.length,
                    fileOffset = file.offset,
                    fileSize = file.length;

                var startPiece = torrentLength / fileOffset,
                    endPiece = file._endPiece,
                    lengthToDownload = 1000 * 5000,
                    lastPieceToDownload = endPiece * (lengthToDownload / fileSize);

                torrent.critical(startPiece, lastPieceToDownload);

                _this.fileStart = setInterval(function () {
                    var percent = Math.floor(file.downloaded / lengthToDownload * 100);
                    var speed = Math.floor(_this.state.client.downloadSpeed / 1000);
                    var loaded = file.downloaded / file.length * 100;
                    if (percent > 100) {
                        _this.setDownloadSpeed(0);
                        _this.setDownloadPercent();
                        clearTimeout(_this.streamTimeout);
                        clearInterval(_this.fileStart);
                        resolve();
                    } else {
                        _this.setDownloadSpeed(speed);
                        _this.setDownloadPercent(percent);
                        _this.setFileLoaded(loaded);
                    }
                }, 100);
            });
        };

        _this.setStreamTimeout = function (ms) {
            clearTimeout(_this.streamTimeout);
            _this.streamTimeout = setTimeout(function () {
                if (_this.state.time == "00:00:00" && (_this.state.downloadPercent < 35 || !_this.state.downloadPercent)) {
                    _this.applyTimeout();
                }
            }, ms ? ms : 15000);
        };

        _this.streamTorrent = function (movie) {
            var magnet = movie.magnet;
            _this.setStreaming();
            _this.setStreamTimeout(20000);
            _this.setPlayerStatus("Sending the lost boys to neverland", true);

            _this.setDownloadSpeed();
            _this.setDownloadPercent();
            _this.setFileLoaded(0);

            _this.resetVideo();
            _this.changeCurrentMagnet(magnet);

            clearInterval(_this.fileStart);

            _this.setStreamTimeout();

            if (_this.state.playMovie) {
                var torrent = _this.state.client.add(magnet);

                torrent.on("metadata", function () {
                    _this.setStreamTimeout(25000);
                    _this.setPlayerStatus("Configuring the DeLorean", true);
                });

                torrent.on("ready", function () {
                    _this.setPlayerStatus("Retrieving from the owl postal service", true);
                    torrent.deselect(0, torrent.pieces.length - 1, false);

                    for (var i = 0; i < torrent.files.length; i++) {
                        var fileToDeselect = torrent.files[i];
                        fileToDeselect.deselect();
                    }

                    var videoFormats = ["avi", "mp4", "m4v", "m4a", "mkv", "wmv", "mov"];

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
                        _this.server.listen("8888");

                        _this.fetchFirstPieces(torrent, file).then(function () {
                            _this.setStreamTimeout(35000);
                            _this.toggleIntro(true);
                            _this.setPlayerStatus("Logging into the OASIS", true);
                            _this.setMovieTime(_this.state.playMovie);
                            _this.fileIndex = fileIndex;
                        });
                    }
                });
            } else {
                _this.destroyClient();
            }
        };

        _this.resetSearch = function () {
            _this.setInputValue("");
        };

        _this.closeSearch = function () {
            _this.setSearch();
            _this.resetSearch();
        };

        _this.sortQuery = function (results) {
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

                return movie.backdrop_path !== null && year <= currentDate.year && (year == currentDate.year ? month < currentDate.month - 1 : true) && movie.popularity > 2 && movie.vote_average > 4;
            });

            return results;
        };

        _this.searchEmpty = function (query) {
            var emptyContent = _react2.default.createElement(
                _Fade2.default,
                { bottom: true },
                _react2.default.createElement(
                    "div",
                    { className: "search-empty" },
                    "No Results for \"" + (query.length > 20 ? query.substring(0, 20) + "..." : query) + "\""
                )
            );

            _this.setSearch(emptyContent);
        };

        _this.setSearch = function (searchContent) {
            _this.setState({ searchContent: searchContent });
        };

        _this.setOffline = function (isOffline) {
            _this.setLoadingContent();
            _this.setState({ isOffline: isOffline });
        };

        _this.setLoadingContent = function (loadingContent) {
            _this.setState({ loadingContent: loadingContent });
        };

        _this.fetchContent = function (url) {
            return new Promise(function (resolve, reject) {
                _this.setLoadingContent(true);
                request.get(url).then(function (response) {
                    _this.setOffline();
                    resolve(response.data);
                }).catch(function (err) {
                    _this.setLoadingContent(false);
                    reject(err);
                });
            });
        };

        _this.searchMovies = function () {
            var query = _this.state.inputValue;

            if (query === "") {
                _this.closeSearch();
            } else {
                var searchResults = [];

                var _loop = function _loop(u) {
                    var url = "https://api.themoviedb.org/3/search/movie?api_key=" + _this.state.apiKey + "&region=US&language=en-US&query=" + query + "&page=" + u + "&include_adult=false&primary_release_date.lte=" + _this.getURLDate(1, true);

                    var promise = new Promise(function (resolve, reject) {
                        _this.fetchContent(url).then(function (response) {
                            resolve(response.results);
                        }).catch(function (err) {
                            return reject(err);
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
                        results = _this.sortQuery(results);

                        if (results.length === 0) {
                            _this.searchEmpty(query);
                        } else {
                            _this.setSearch(results);
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
            return title.replace(/[^a-zA-Z0-9\s\-]/g, "").replace(/\-/g, " ").toLowerCase();
        };

        _this.checkMagnet = function (movie) {
            return new Promise(function (resolve, reject) {
                var magnet = movie.magnet.toUpperCase();
                if (magnet.match(/^(?!.*(HDTS|HDTC|HD\.TS|HD\.TC|HD\-TS|HD\-TC|CAM))/g)) {
                    resolve(movie);
                } else {
                    movie.magnet = false;
                    console.log("Previous magnet link was of low quality.");
                    reject(movie);
                }
            });
        };

        _this.promiseTimeout = function (ms, promise) {
            var timeout = new Promise(function (resolve, reject) {
                var id = setTimeout(function () {
                    clearTimeout(id);
                    reject("Timed out in " + ms + "ms.");
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

        _this.getMovieDate = function (movie) {
            return movie.release_date.substring(0, 4);
        };

        _this.getQualityTorrent = function (torrents) {
            var clone = _this.getClone(torrents);
            var quality = _this.state.quality == "HD" ? "720p" : "1080p";

            var torrent = clone.find(function (item) {
                if (item.resolution || item.quality) {
                    if (item.resolution == quality || item.quality == quality) {
                        if (item.title.indexOf('YIFY') > -1) {
                            return item;
                        }
                    }
                }
            });

            torrent = torrent ? torrent : clone.find(function (item) {
                if (item.resolution || item.quality) {
                    if (item.resolution == quality || item.quality == quality) {
                        return item;
                    }
                }
            });

            return torrent ? torrent : clone[0];
        };

        _this.searchTorrent = function (movie, excludeDate) {
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
                var title = _this.prepareMovieTitle(movie.title),
                    date = _this.getMovieDate(movie),
                    query = title + " " + (excludeDate ? "" : date);

                _this.setPlayerStatus("Searching the entire universe for \"" + movie.title + "\"", true);

                var publicSearch = _this.publicSearch.search(["1337x", "Rarbg"], query, "Movies", 20);

                var proprietarySearch = _this.torrentSearch.searchTorrents(query);

                Promise.all([publicSearch, proprietarySearch]).then(function (data) {
                    data = [].concat.apply([], data);

                    if (data[0].message || typeof data[0] === "string") {
                        _this.searchTorrent(movie, true);
                    } else {
                        var magnetPromises = [];
                        for (var n = 0; n < data.length; n++) {
                            var magnetTorrent = data[n];
                            if (magnetTorrent) {
                                if (magnetTorrent.desc) {
                                    var promise = _this.torrentSearch.getMagnetFromLink(magnetTorrent);
                                    magnetPromises.push(promise);
                                }
                            }
                        }

                        Promise.all(magnetPromises).then(function (results) {
                            results = [].concat(_toConsumableArray(results), _toConsumableArray(data));

                            var cleanResults = results.filter(function (torrent) {
                                if (torrent) {
                                    return torrent.magnet;
                                }
                            });

                            if (cleanResults.length) {
                                _this.getPreferredTorrents(cleanResults).then(function (torrents) {
                                    var torrent = _this.getQualityTorrent(torrents);
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
                                        _this.applyTimeout(1);
                                    }
                                });
                            } else {
                                _this.applyTimeout();
                            }
                        }).catch(function (err) {
                            return console.log(err);
                        });
                    }
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
                clearTimeout(_this.streamTimeout);
                clearInterval(_this.fileStart);

                if (_this.state.client) {
                    var playMovie = backUp ? _this.getObjectClone(_this.state.playMovie) : false;
                    _this.setState({
                        playMovie: playMovie,
                        startTime: backUp ? _this.state.startTime : false,
                        videoIndex: false,
                        videoElement: false,
                        downloadPercent: false,
                        isStreaming: false,
                        paused: true,
                        playerLoading: backUp ? true : false
                    }, function () {
                        _this.closeServer();

                        setTimeout(function () {
                            if (backUp) {
                                _this.removeTorrents().then(function () {
                                    resolve();
                                });
                            } else {
                                resolve();
                            }
                        }, 250);
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
            var clone = _this.getClone(_this.state.movieTimeArray);
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
            var movieTimeArray = _this.getClone(_this.state.movieTimeArray);
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
            if (src) {
                for (var prop in src) {
                    if (src.hasOwnProperty(prop)) {
                        target[prop] = src[prop];
                    }
                }
            }
            return target;
        };

        _this.updateMovieTime = function (time) {
            if (_this.state.playMovie) {
                if (time) {
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

        _this.getURLDate = function (n, justYear) {
            var date = new Date(),
                year = date.getFullYear(),
                month = date.getMonth().toString().length < 2 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1,
                day = date.getDate().toString().length < 2 ? "0" + date.getDate() : date.getDate();

            if (justYear) {
                return year - n;
            }

            return year - n + "-" + month + "-" + day;
        };

        _this.setFeatured = function (featured) {
            _this.setState({ featured: featured });
        };

        _this.getFeatured = function () {
            var url = "https://api.themoviedb.org/3/discover/movie?api_key=" + _this.state.apiKey + "&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&primary_release_date.gte=" + _this.getURLDate(10, true) + "&primary_release_date.lte=" + _this.getURLDate(1, true);
            return new Promise(function (resolve, reject) {
                _this.fetchContent(url).then(function (response) {
                    resolve(response);
                }).catch(function (err) {
                    return reject(err);
                });
            });
        };

        _this.loadFeatured = function () {
            _this.getFeatured().then(function (results) {
                _this.setFeatured(results.results);
            }).catch(function (err) {
                return _this.setOffline(true);
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
            var url = "https://api.themoviedb.org/3/discover/movie?api_key=" + _this.state.apiKey + "&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=" + (Math.floor(Math.random() * _this.state.genrePages) + 1) + "&primary_release_date.lte=" + _this.getURLDate(1) + "&with_genres=" + genreID;

            return new Promise(function (resolve, reject) {
                _this.fetchContent(url).then(function (response) {
                    var genreComplete = {
                        name: genre,
                        genreID: genreID,
                        movies: _this.shuffleArray(response.results)
                    };
                    resolve(genreComplete);
                }).catch(function (err) {
                    return reject(err);
                });
            }).catch(function (err) {
                return console.log(err);
            });
        };

        _this.isRecent = function (movie) {
            var recentlyPlayed = _this.getClone(_this.state.recentlyPlayed);
            return recentlyPlayed.find(function (item) {
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

            if (array) {
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
            }

            return results;
        };

        _this.getRecommended = function (url) {
            return new Promise(function (resolve, reject) {
                _this.fetchContent(url).then(function (response) {
                    resolve(response.results.slice(0, 5));
                }).catch(function (err) {
                    return reject(err);
                });
            });
        };

        _this.getSuggested = function (data) {
            return new Promise(function (resolve, reject) {
                var favorites = _this.chooseRandom(data ? data.favorites : _this.state.favorites, 5),
                    recents = _this.chooseRandom(data ? data.recentlyPlayed : _this.state.recentlyPlayed, 5),
                    collection = favorites.concat(recents);

                var promises = [];
                var pages = [1, 2, 3];
                if (collection) {
                    if (collection.length) {
                        for (var j = 0; j <= collection.length; j++) {
                            var movie = collection[j],
                                page = _this.chooseRandom(pages, 1);
                            if (movie) {
                                var _url = "https://api.themoviedb.org/3/movie/" + movie.id + "/recommendations?api_key=" + _this.state.apiKey + "&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=" + page + "&primary_release_date.lte=" + _this.getURLDate(1);
                                var promise = _this.getRecommended(_url);
                                promises.push(promise);
                            }
                        }

                        Promise.all(promises).then(function (suggested) {
                            var finalSuggested = [].concat.apply([], suggested);

                            var clean = _this.stripDuplicateMovies(finalSuggested);
                            if (clean.length > 20) {
                                clean = clean.slice(0, 20);
                            }

                            clean = _this.shuffleArray(clean);
                            resolve(clean);
                        }).catch(function (err) {
                            return reject(err);
                        });
                    }
                }
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
            _this.getSuggested().then(function (suggested) {
                _this.setState({
                    suggested: suggested
                }, function () {
                    if (_this.databaseRef) {
                        _this.setBucket();
                    }
                });
            }).catch(function (err) {
                return console.log(err);
            });
        };

        _this.getClone = function (array) {
            return array ? [].concat(_toConsumableArray(array)) : [];
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

        _this.setMovies = function (movies) {
            _this.setState({ movies: movies });
        };

        _this.loadMovieCategories = function () {
            var genres = [{
                id: 28,
                name: "Action"
            }, {
                id: 12,
                name: "Adventure"
            }, {
                id: 16,
                name: "Animation"
            }, {
                id: 35,
                name: "Comedy"
            }, {
                id: 80,
                name: "Crime"
            }, {
                id: 99,
                name: "Documentary"
            }, {
                id: 18,
                name: "Drama"
            }, {
                id: 10751,
                name: "Family"
            }, {
                id: 14,
                name: "Fantasy"
            }, {
                id: 36,
                name: "History"
            }, {
                id: 27,
                name: "Horror"
            }, {
                id: 10402,
                name: "Music"
            }, {
                id: 9648,
                name: "Mystery"
            }, {
                id: 10749,
                name: "Romance"
            }, {
                id: 878,
                name: "Sci-Fi"
            }, {
                id: 10770,
                name: "TV Movie"
            }, {
                id: 53,
                name: "Thriller"
            }, {
                id: 10752,
                name: "War"
            }, {
                id: 37,
                name: "Western"
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
                _this.setMovies(data);
            }).catch(function () {
                return _this.setOffline(true);
            });
        };

        _this.openMenu = function () {
            _this.setState({ menuActive: true });
        };

        _this.closeMenu = function () {
            _this.setState({ menuActive: false });
        };

        _this.toggleMenu = function () {
            _this.setState(function (prevState) {
                return {
                    menuActive: !prevState.menuActive
                };
            });
        };

        _this.updateMenu = function (active) {
            _this.closeMenu();
            _this.closeSearch();
            if (active != undefined) {
                _this.setState({ active: active });
            }
        };

        _this.handleLogo = function () {
            _this.setState({ logoIsLoaded: true });
        };

        _this.loadLogo = function () {
            var tempImage = new Image();
            tempImage.onload = _this.handleLogo;
            tempImage.src = "assets/imgs/icon.png";
        };

        _this.requireTorrent = function () {
            _this.publicSearch = require("torrent-search-api");
            _this.publicSearch.enablePublicProviders();

            _this.torrentSearch = new _torrentSearch2.default();
        };

        _this.signIn = function () {
            var email = _this.state.inputEmail.length ? _this.state.inputEmail : _this.state.user ? _this.state.user.email : '',
                password = _this.state.inputPass.length ? _this.state.inputPass : _this.state.user ? _this.state.user.password : '';

            _app2.default.auth().signInWithEmailAndPassword(email, password).then(function () {
                _this.closeAccount();
            }).catch(function (error) {
                _this.handleErrorMessage(error);
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
                _this.setState(function (prevState) {
                    if (prevState.user !== user) {
                        return { user: user };
                    }
                }, function () {
                    if (_this.state.user == user) {
                        _this.setEverything = true;
                        _this.createDataBase();
                        _this.getBucket();
                        _this.listenToBucket();
                    }
                    _this.setUserCredentials();
                });
            });

            if (!_this.state.isGuest && _this.state.user) {
                _this.signIn();
            } else if (!_this.state.isGuest && !_this.state.user) {
                _this.openAccount();
            } else if (!_this.state.user) {
                _this.updateSuggested();
            }
        };

        _this.resetData = function () {
            return new Promise(function (resolve, reject) {
                _this.setState({
                    favorites: [],
                    recentlyPlayed: [],
                    suggested: [],
                    movieTimeArray: [],
                    quality: 'HD'
                }, function () {
                    resolve();
                });
            });
        };

        _this.handleErrorMessage = function (error) {
            var errorMessage = error.message;

            if (errorMessage == 'There is no user record corresponding to this identifier. The user may have been' + ' deleted.') {
                errorMessage = "We can't find a user associated with that email. Please try again.";
            }
            _this.setState({ loginError: errorMessage });
        };

        _this.handleAccount = function (create) {
            var email = _this.state.inputEmail,
                password = _this.state.inputPass;

            if (!email.length && !password.length) {
                _this.setState({ loginError: 'Incorrect email or password.' });
            } else {
                if (create) {
                    _app2.default.auth().createUserWithEmailAndPassword(email, password).then(function () {
                        _this.resetData().then(function () {
                            _this.setStorage();
                        });
                        _this.closeAccount();
                    }).catch(function (error) {
                        _this.handleErrorMessage(error);
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
                inputEmail: "",
                inputPass: "",
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
            var _this$setState;

            var value = e.target.value;
            var isEmail = value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g);

            _this.setState((_this$setState = {}, _defineProperty(_this$setState, isEmail ? "inputEmail" : "inputPass", value), _defineProperty(_this$setState, "loginError", false), _this$setState));
        };

        _this.handleAccountSignin = function () {
            _this.handleAccount();
        };

        _this.handleAccountCreation = function () {
            _this.handleAccount(true);
        };

        _this.loadNecessary = function () {
            if (!_this.state.featured.length) {
                _this.loadFeatured();
            }
            if (!_this.state.movies.length) {
                _this.loadMovieCategories();
            }
        };

        _this.handleConnectionChange = function (e) {
            if (e.type == "offline") {
                _this.setOffline(true);
            }
            if (e.type == "online") {
                _this.setOffline();
                _this.updateMenu(_this.state.active);
                _this.resetSearch();
                _this.loadNecessary();
            }
        };

        _this.setHeaderBackground = function (movieArray) {
            var headerBg = movieArray ? movieArray[0] ? movieArray[0].backdrop_path ? movieArray[0].backdrop_path : movieArray[0].movies[0].backdrop_path : false : false;
            _this.setState({ headerBg: headerBg });
        };

        _this.fileIndex = false;
        _this.fileStart = false;
        _this.qualityTimeout = false;
        _this.streamTimeout = false;

        _this.handleInput.bind(_this);

        _this.state = {
            apiKey: "22b4015cb2245d35a9c1ad8cd48e314c",
            willClose: false,
            readyToClose: false,
            loginError: false,
            showIntro: false,
            account: true,
            create: false,
            inputEmail: "",
            inputPass: "",
            user: false,
            isGuest: false,
            loadingContent: false,
            downloadPercent: false,
            downloadSpeed: 0,
            fileLoaded: 0,
            active: "Featured",
            suggested: [],
            recentlyPlayed: [],
            favorites: [],
            movieTimeArray: [],
            magnetArray: [],
            featured: [],
            movies: [],
            backupIsOpen: false,
            videoIndex: false,
            genreInfo: {
                showCollection: false,
                activeGenre: false,
                genreID: 0,
                movies: []
            },
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
            quality: "HD",
            time: "00:00:00",
            startTime: 0,
            currentTime: 0,
            videoElement: false,
            inputValue: "",
            seekValue: 0,
            colorStop: 0
        };
        return _this;
    }

    _createClass(App, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            this.loadLogo();
            this.getStorage().then(function () {
                return _this2.getUserCredentials();
            }).catch(function (err) {
                return console.log(err);
            });
            this.loadFeatured();
            this.loadMovieCategories();
            this.startWebTorrent();
            this.requireTorrent();
            window.addEventListener("online", this.handleConnectionChange);
            window.addEventListener("offline", this.handleConnectionChange);
        }
    }, {
        key: "render",
        value: function render() {
            var menu = this.state.menuActive ? _react2.default.createElement(_menu2.default, {
                user: this.state.user,
                openAccount: this.openAccount,
                signOut: this.signOut,
                active: this.state.active,
                updateMenu: this.updateMenu,
                resetSearch: this.resetSearch }) : "";

            var movieBackDrop = this.state.showBox ? _react2.default.createElement("div", { className: "movie-container-bg", onClick: this.closeBackdrop }) : "";

            var movieModal = this.state.showBox ? _react2.default.createElement(_movieModal2.default, {
                movie: this.state.movieCurrent,
                favorites: this.state.favorites,
                playMovie: this.playMovie,
                isFavorite: this.isFavorite,
                addToFavorites: this.addToFavorites,
                removeFromFavorites: this.removeFromFavorites }) : "";

            var playerModal = this.state.playMovie ? _react2.default.createElement(_player2.default, {
                fileLoaded: this.state.fileLoaded,
                setFileLoaded: this.setFileLoaded,
                setWillClose: this.setWillClose,
                readyToClose: this.state.readyToClose,
                showIntro: this.state.showIntro,
                toggleIntro: this.toggleIntro,
                downloadPercent: this.state.downloadPercent,
                downloadSpeed: this.state.downloadSpeed,
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
                seekValue: this.state.seekValue }) : "";

            var fullGenreContainer = this.state.showGenre ? _react2.default.createElement(_genre2.default, {
                genreInfo: this.state.genreInfo,
                favorites: this.state.favorites,
                recentlyPlayed: this.state.recentlyPlayed,
                suggested: this.state.suggested,
                apiKey: this.state.apiKey,
                fetchContent: this.fetchContent,
                openBox: this.openBox,
                setOffline: this.setOffline,
                closeGenre: this.closeGenre }) : "";

            var loadingContainer = this.state.appLoading ? _react2.default.createElement(
                "div",
                { className: "loading-container" },
                _react2.default.createElement(
                    _Fade2.default,
                    { when: this.state.logoIsLoaded, distance: "10%", bottom: true },
                    _react2.default.createElement("div", { className: "logo" })
                )
            ) : "";

            return _react2.default.createElement(
                "div",
                {
                    className: "app-container " + (process.platform === "win32" ? "windows-compensate" : ""),
                    onClick: this.closeMenu },
                process.platform === "darwin" ? _react2.default.createElement("div", {
                    className: "draggable " + (this.state.playMovie ? "invisible" : "") }) : "",
                _react2.default.createElement(
                    _reactTransitionGroup.CSSTransitionGroup,
                    {
                        transitionName: "player-anim",
                        transitionEnterTimeout: 250,
                        transitionLeaveTimeout: 250 },
                    this.state.account || this.state.create ? _react2.default.createElement(_accountContainer2.default, {
                        account: this.state.account,
                        closeAccount: this.closeAccount,
                        handleAccountSignin: this.handleAccountSignin,
                        handleAccountCreation: this.handleAccountCreation,
                        handleInput: this.handleInput,
                        loginError: this.state.loginError,
                        openAccount: this.openAccount,
                        openAccountCreation: this.openAccountCreation }) : ''
                ),
                _react2.default.createElement(
                    _reactTransitionGroup.CSSTransitionGroup,
                    {
                        transitionName: "loading-anim",
                        transitionEnterTimeout: 0,
                        transitionLeaveTimeout: 250 },
                    loadingContainer
                ),
                _react2.default.createElement(
                    _reactTransitionGroup.CSSTransitionGroup,
                    {
                        transitionName: "genreContainer-anim",
                        transitionEnterTimeout: 250,
                        transitionLeaveTimeout: 250 },
                    fullGenreContainer
                ),
                _react2.default.createElement(
                    _reactTransitionGroup.CSSTransitionGroup,
                    {
                        transitionName: "player-anim",
                        transitionEnterTimeout: 250,
                        transitionLeaveTimeout: 250 },
                    playerModal
                ),
                _react2.default.createElement(
                    _reactTransitionGroup.CSSTransitionGroup,
                    {
                        transitionName: "movie-box-anim",
                        transitionEnterTimeout: 250,
                        transitionLeaveTimeout: 250 },
                    movieModal
                ),
                _react2.default.createElement(
                    _reactTransitionGroup.CSSTransitionGroup,
                    {
                        transitionName: "box-anim",
                        transitionEnterTimeout: 250,
                        transitionLeaveTimeout: 250 },
                    movieBackDrop
                ),
                _react2.default.createElement(_header2.default, {
                    quality: this.state.quality,
                    setQuality: this.setQuality,
                    subtitle: this.state.active,
                    menuActive: this.state.menuActive,
                    toggleMenu: this.toggleMenu,
                    background: this.state.headerBg,
                    closeSearch: this.closeSearch,
                    searchContent: this.state.searchContent,
                    searchMovies: this.searchMovies,
                    inputValue: this.state.inputValue,
                    setInputValue: this.setInputValue,
                    user: this.state.user }),
                _react2.default.createElement(
                    _reactTransitionGroup.CSSTransitionGroup,
                    {
                        transitionName: "menu-anim",
                        transitionEnterTimeout: 250,
                        transitionLeaveTimeout: 250 },
                    menu
                ),
                _react2.default.createElement(_content2.default, {
                    active: this.state.active,
                    offline: this.state.isOffline,
                    searchContent: this.state.searchContent,
                    loadingContent: this.state.loadingContent,
                    setHeaderBackground: this.setHeaderBackground,
                    loadMovieCategories: this.loadMovieCategories,
                    loadFeatured: this.loadFeatured,
                    updateSuggested: this.updateSuggested,
                    movies: this.state.movies,
                    suggested: this.state.suggested,
                    favorites: this.state.favorites,
                    recentlyPlayed: this.state.recentlyPlayed,
                    featured: this.state.featured,
                    toggleGenre: this.toggleGenre,
                    openBox: this.openBox })
            );
        }
    }]);

    return App;
}(_react.Component);

exports.default = App;