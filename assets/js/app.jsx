import React, {Component} from "react";

import {CSSTransitionGroup} from "react-transition-group";
import Fade from "react-reveal/Fade";
import storage from "electron-json-storage";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

import AccountContainer from "./account-container";
import Menu from "./menu";
import MovieModal from "./movie-modal";
import Player from "./player";
import Genre from "./genre";
import Header from "./header";
import Content from "./content";

import TorrentSearch from "./torrent-search";
import {default as request} from "axios";

class App extends Component {
    constructor(props) {
        super(props);

        this.fileIndex = false;
        this.fileStart = false;
        this.qualityTimeout = false;
        this.streamTimeout = false;
        this.fileLoadedTimeout = false;

        this.state = {
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
            shows: [],
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
            subtitleOptions: [],
            inputValue: "",
            seekValue: 0,
            colorStop: 0
        };
    }

    setSubtitleOptions = (subtitleOptions) => {
        this.setState({subtitleOptions});
    };

    setFileLoaded = (fileLoaded) => {
        this.setState({fileLoaded});
    };

    setReady = (readyToClose) => {
        this.setState({readyToClose});
    };

    setWillClose = (willClose) => {
        this.setState({willClose});
    };

    toggleIntro = (showIntro) => {
        this.setState({
            showIntro
        }, () => {
            if (!showIntro) {
                this.setVideoIndex(this.fileIndex);
            }
        });
    };

    setQuality = (quality) => {
        this.setState({
            quality
        }, () => {
            clearTimeout(this.qualityTimeout);
            this.qualityTimeout = setTimeout(() => {
                this.setStorage();
            }, 250);
        });
    };

    setStartTime = (startTime) => {
        this.setState({startTime});
    };

    setVideoElement = (videoElement) => {
        this.setState({videoElement});
    };

    setCurrentTime = (currentTime) => {
        this.setState({currentTime});
    };
    setSeekValue = (seekValue) => {
        this.setState({seekValue});
    };

    setColorStop = (colorStop) => {
        this.setState({colorStop});
    };

    setInputValue = (inputValue) => {
        this.setState({inputValue});
    };

    setStreaming = (isStreaming) => {
        this.setState({isStreaming});
    };

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
    };

    toggleGenre = (showGenre, genreInfo) => {
        this.setState({showGenre, genreInfo});
    };

    closeGenre = () => {
        this.toggleGenre();
    };

    setUserCredentials = () => {
        storage.set("userCredentials", {
            user: this.state.user,
            create: this.state.create,
            account: this.state.account,
            isGuest: this.state.isGuest
        }, (error) => {
            if (error) {
                throw error;
            }
        });
    };

    getUserCredentials = () => {
        storage.get("userCredentials", (error, data) => {
            if (error) {
                console.log("Not able to retrieve user credentials.");
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
    };

    cleanMovieArrays = (array) => {
        if (array) {
            let clean = array.slice();
            for (let j = 0; j < array.length; j++) {
                let object = array[j];
                if (typeof object === "object") {
                    this.removeEmpty(object);
                }
            }

            return clean;
        } else {
            return [];
        }
    };

    removeEmpty = (obj) => {
        Object
            .keys(obj)
            .forEach((key) => {
                if (obj[key] && typeof obj[key] === "object") 
                    this.removeEmpty(obj[key]);
                else if (obj[key] === undefined) 
                    delete obj[key];
                }
            );
        return obj;
    };

    createDataBase = () => {
        if (this.state.user) {
            let db = firebase.database();
            this.databaseRef = db.ref(`users/${this.state.user.uid}`);
        }
    };

    setBucket = () => {
        if (this.state.user.email) {
            let data = {
                recentlyPlayed: this.cleanMovieArrays(this.state.recentlyPlayed),
                movieTimeArray: this.cleanMovieArrays(this.state.movieTimeArray),
                favorites: this.cleanMovieArrays(this.state.favorites),
                quality: this.state.quality
                    ? this.state.quality
                    : "HD"
            };

            this
                .databaseRef
                .set(data, (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        this.setCloseReady();
                        console.log("Data set!");
                    }
                });
        }
    };

    isEqualToObject = (object1, object2) => {
        for (propName in object1) {
            if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
                return false;
            } else if (typeof object1[propName] != typeof object2[propName]) {
                return false;
            }
        }
        for (propName in object2) {
            if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
                return false;
            } else if (typeof object1[propName] != typeof object2[propName]) {
                return false;
            }
            if (!object1.hasOwnProperty(propName)) 
                continue;
            
            if (object1[propName]instanceof Array && object2[propName]instanceof Array) {
                if (!this.isEqualToObject(object1[propName], object2[propName])) 
                    return false;
                }
            else if (object1[propName]instanceof Object && object2[propName]instanceof Object) {
                if (!this.isEqualToObject(object1[propName], object2[propName])) 
                    return false;
                }
            else if (object1[propName] != object2[propName]) {
                return false;
            }
        }
        return true;
    };

    isEqualToArray = (array1, array2) => {
        if (!array2) 
            return false;
        
        if (array1.length != array2.length) 
            return false;
        
        for (var i = 0, l = array1.length; i < l; i++) {
            if (array1[i]instanceof Array && array2[i]instanceof Array) {
                if (!this.isEqualToArray(array1[i], array2[i])) 
                    return false;
                }
            else if (array1[i]instanceof Object && array2[i]instanceof Object) {
                if (!this.isEqualToArray(array1[i], array2[i])) 
                    return false;
                }
            else if (array1[i] != array2[i]) {
                return false;
            }
        }
        return true;
    };

    setDiff = (data) => {
        let change = ["favorites", "recentlyPlayed", "movieTimeArray", "quality"];
        return new Promise((resolve, reject) => {
            let newState = {};
            for (let i = 0; i < change.length; i++) {
                let key = change[i],
                    subject = data[key],
                    comparator = this.state[key];
                if (this.setEverything) {
                    if (typeof subject === "object" && key != "movieTimeArray") {
                        if (!subject[0].flixerr_data) {
                            subject = this.extractMovies(false, subject, false);
                        }
                    }
                    newState[key] = subject;
                } else {
                    if (typeof subject === "object") {
                        if (!this.isEqualToArray(subject, comparator)) {
                            newState[key] = subject;
                        }
                    } else {
                        if (subject !== comparator) {
                            newState[key] = subject;
                        }
                    }
                }
            }

            if (this.setEverything) {
                this
                    .getSuggested(data)
                    .then((suggested) => {
                        newState.suggested = suggested;
                        this.setState(newState, () => {
                            resolve();
                        });
                    })
                    .catch((err) => console.log(err));
            } else {
                this.setState(newState, () => {
                    resolve();
                });
            }
        });
    };

    setBucketData = (snapshot) => {
        return new Promise((resolve, reject) => {
            let data = snapshot.val();
            if (data) {
                this
                    .setDiff(data)
                    .then(() => resolve());
            } else {
                reject();
            }
        });
    };

    listenToBucket = () => {
        if (this.databaseRef) {
            this
                .databaseRef
                .on("value", this.setBucketData);
        }
    };

    getBucket = () => {
        if (this.databaseRef) {
            this
                .databaseRef
                .once("value", (snapshot) => {
                    if (snapshot) {
                        this
                            .setBucketData(snapshot)
                            .catch((err) => {
                                this.resetData();
                            });
                    }
                });
        }
    };

    setCloseReady = (message, load) => {
        if (this.state.willClose) {
            setTimeout(() => {
                this
                    .setPlayerStatus(message
                    ? message
                    : "Data saved succesfully!", load
                    ? load
                    : false)
                    .then(() => {
                        this.setReady(true);
                    });
            }, 600);
        }
    };

    setStorage = () => {
        storage.set("collection", {
            favorites: this.state.favorites,
            recentlyPlayed: this.state.recentlyPlayed,
            movieTimeArray: this.state.movieTimeArray,
            quality: this.state.quality
        }, (error) => {
            if (error) {
                throw error;
            }
            if (firebase.auth().currentUser) {
                this.setEverything = false;
                this.setBucket();
            } else {
                this.setCloseReady();
            }
        });
    };

    checkData = (data) => {
        for (let object in data) {
            let item = data[object];
            if (item) {
                if (typeof item === "object") {
                    if (item[0]) {
                        if (!item[0].flixerr_data) {
                            item = this.extractMovies(false, item, false);
                        }
                    }
                }
            }
        }
        return data;
    };

    getStorage = () => {
        return new Promise((resolve, reject) => {
            storage.get("collection", (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    if (data) {
                        data = this.checkData(data);
                        this.setState({
                            favorites: data.favorites
                                ? data.favorites
                                : [],
                            recentlyPlayed: data.recentlyPlayed
                                ? data.recentlyPlayed
                                : [],
                            movieTimeArray: data.movieTimeArray
                                ? data.movieTimeArray
                                : [],
                            quality: data.quality
                                ? data.quality
                                : "HD"
                        }, (error) => {
                            setTimeout(() => {
                                this.setState({appLoading: false});
                            }, 2500);
                            resolve();
                        });
                    }
                }
            });
        }).catch((err) => console.log(err));
    };

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
    };

    getPreferredTorrents = (torrents) => {
        return new Promise((resolve, reject) => {
            let parseTorrent = require("parse-torrent-name");
            let preferredTorrents = torrents.filter((item, index) => {
                if (item) {
                    if (item.download || item.magnet) {
                        let parsed = parseTorrent(item.title);
                        let title = item
                            .title
                            .toUpperCase();

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

                        item.title = `${parsed.title} ${parsed.year
                            ? `(${parsed.year})`
                            : ''} ${
                        parsed.group
                            ? parsed
                                .group
                                .match(/^\[.*?\]$/g)
                                ? `${parsed.group}`
                                : `(${parsed.group})`
                            : ""}`;
                        item.quality = parsed.quality;
                        item.resolution = parsed.resolution;

                        item.health = Math.round(item.leechers > 0
                            ? item.seeders / item.leechers
                            : item.seeders);

                        return (title.match(/^(?=.*(1080|720|HD|YIFY))(?!.*(3D|HDTS|HDTC|HD\.TS|HD\.TC|HD\-TS|HD\-TC|CAM))/g) || item.magnet.toUpperCase().match(/^(?=.*(DVDRIP))/g));
                    }
                }
            });

            preferredTorrents.sort((a, b) => b.health - a.health);

            resolve(preferredTorrents);
        });
    };

    togglePause = (paused) => {
        if (!paused) {
            if (this.state.client.torrents[0]) {
                this
                    .state
                    .client
                    .torrents[0]
                    .resume();
            }
        }
        this.setState({paused});
    };

    setPlayerTime = (time) => {
        this.setState({time});
    };

    handleVideo = (e) => {
        let video = e.currentTarget;
        if (video.duration) {
            let value = (100 / video.duration) * video.currentTime;
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
    };

    handleVideoClose = (video) => {
        if (video.src) {
            this.setPlayerStatus("Saving data before closing", true);
            this.updateMovieTime(video.currentTime, () => {
                this.setCloseReady("Closing", true);
            });
        }
    };

    setMovieTime = () => {
        let clone = this.getClone(this.state.movieTimeArray);
        let movieMatch = this.returnCorrectMovie(clone, this.state.playMovie);

        if (movieMatch) {
            if (movieMatch.currentTime) {
                this.setStartTime(movieMatch.currentTime);
            }

            let recentlyPlayed = this.getClone(this.state.recentlyPlayed);
            this.setState({recentlyPlayed});
        }
    };

    openBackup = () => {
        this.setState({backupIsOpen: true});
    };

    showBackup = (simple) => {
        if (simple) {
            this.openBackup();
        } else {
            this.setVideoIndex();
            this.setVideoError(true);
            this.openBackup();
        }
    };

    applyTimeout = (type) => {
        let message;
        clearInterval(this.fileStart)
        clearInterval(this.fileLoadedTimeout);

        this.setDownloadPercent();
        this.setDownloadSpeed();
        this.setFileLoaded(0);
        this.setSubtitleOptions([]);

        if (!type) {
            message = "Ooops, we dropped the ball. Please try a different torrent.";
        } else if (type == 1) {
            message = `We can't find Kevin`;
        } else if (type == 2) {
            message = "Stop littering";
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
    };

    startWebTorrent = () => {
        let WebTorrent = require("webtorrent");
        this.setState({
            client: new WebTorrent({maxConn: 150})
        }, () => {
            this
                .state
                .client
                .on("error", (err) => {
                    this.applyTimeout();
                });
        });
    };

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
                .then(() => resolve("Torrents removed."))
                .catch((err) => reject(err));
        }).catch((err) => console.log(err));
    };

    setVideoError = (error) => {
        this.setState({error});
    };

    startStreaming = () => {
        this.setStreaming(true);
        clearTimeout(this.streamTimeout);
        this.setPlayerLoading(false);
        this
            .setPlayerStatus(`We've found a reason for your meaningless existence`)
            .then(() => {
                this.setPlayerStatus(false);
            });
    };

    setDownloadPercent = (downloadPercent) => {
        this.setState({downloadPercent});
    };

    setDownloadSpeed = (downloadSpeed) => {
        this.setState({downloadSpeed});
    };

    fetchFirstPieces = (torrent, file) => {
        return new Promise((resolve, reject) => {
            this.setStreamTimeout(20000);

            let torrentLength = torrent.length,
                fileOffset = file.offset,
                fileSize = file.length;

            let startPiece = torrentLength / fileOffset,
                endPiece = file._endPiece,
                lengthToDownload = 1000 * 5000,
                lastPieceToDownload = endPiece * (lengthToDownload / fileSize);

            torrent.critical(startPiece, lastPieceToDownload);

            this.fileStart = setInterval(() => {
                let percent = Math.floor((file.downloaded / lengthToDownload) * 100);
                let speed = Math.floor(this.state.client.downloadSpeed / 1000);

                if (percent > 100) {
                    this.setDownloadSpeed(0);
                    this.setDownloadPercent();
                    clearTimeout(this.streamTimeout);
                    clearInterval(this.fileStart);
                    resolve();
                } else {
                    this.setDownloadSpeed(speed);
                    this.setDownloadPercent(percent);
                }
            }, 100);
        });
    };

    setStreamTimeout = (ms) => {
        clearTimeout(this.streamTimeout);
        this.streamTimeout = setTimeout(() => {
            if (this.state.time == "00:00:00" && (this.state.downloadPercent < 35 || !this.state.downloadPercent)) {
                this.applyTimeout();
            }
        }, ms
            ? ms
            : 15000);
    };

    setFileLoadedTimeout = () => {
        clearInterval(this.fileLoadedTimeout);
        this.fileLoadedTimeout = setInterval(() => {
            let file = this.state.client.torrents[0].files[this.state.videoIndex];

            if (file && file.downloaded !== file.length) {
                let loaded = (file.downloaded / file.length) * 100;
                this.setFileLoaded(loaded);
            }
        }, 100);
    };

    getLanguage = (text) => {
        let franc = require('franc-min');
        let langs = require('langs');

        let language = franc(text);
        let lang = langs
            .where("3", language)
            .name;

        return lang;
    }

    toVTT = (string) => {
        return string
            .replace(/\{\\([ibu])\}/g, '</$1>')
            .replace(/\{\\([ibu])1\}/g, '<$1>')
            .replace(/\{([ibu])\}/g, '<$1>')
            .replace(/\{\/([ibu])\}/g, '</$1>')
            .replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2')
            .replace(/\r\n\{\\an8\}/g, ' line:5%\r\n') + '\r\n\r\n';
    }

    getBufferAsText = (buffer) => {
        let utf8 = new TextDecoder().decode(buffer);
        return utf8;
    }

    getVttURL = (bufferText) => {
        let text = this.toVTT(bufferText);
        let vttString = 'WEBVTT FILE\r\n\r\n';
        let blobText = vttString.concat(text);
        let blob = new Blob([blobText], {type: 'text/vtt'});
        return URL.createObjectURL(blob);
    }

    getBuffer = (file) => {
        return new Promise((resolve) => {
            file.getBuffer((err, buffer) => {
                if (!err) {
                    resolve(buffer);
                } else {
                    resolve(err);
                }
            });
        });
    }

    getFileComplete = (file) => {
        return this
            .getBuffer(file)
            .then((buffer) => {
                if (typeof buffer === 'object') {
                    let text = this.getBufferAsText(buffer);
                    let src = this.getVttURL(text);
                    let language = this.getLanguage(text);
                    let fileClone = {
                        ...file,
                        language,
                        src
                    }

                    return fileClone;
                } else {
                    return false;
                }
            });
    }

    sanitizeSubtitles = (arrayOfSubtitles) => {
        let promises = [];

        for (let i = 0; i < arrayOfSubtitles.length; i++) {
            let fileObject = arrayOfSubtitles[i];
            let promise = this.getFileComplete(fileObject);
            promises.push(promise);
        }

        return Promise
            .all(promises)
            .then((subtitleOptions) => {
                return subtitleOptions;
            });
    }

    streamTorrent = (movie) => {
        let magnet = movie.magnet;

        this.setStreaming();
        this.setStreamTimeout(20000);
        this.setPlayerStatus("Sending the lost boys to neverland", true);

        this.setDownloadSpeed();
        this.setDownloadPercent();
        this.setFileLoaded(0);

        this.resetVideo();
        this.changeCurrentMagnet(magnet);

        clearInterval(this.fileStart);

        this.setStreamTimeout();

        if (this.state.playMovie) {
            let torrent = this
                .state
                .client
                .add(magnet);

            torrent.on("metadata", () => {
                this.setStreamTimeout(25000);
                this.setPlayerStatus("Configuring the DeLorean", true);
            });

            torrent.on("ready", () => {
                this.setFileLoadedTimeout();
                this.setPlayerStatus("Retrieving from the owl postal service", true);
                torrent.deselect(0, torrent.pieces.length - 1, false);

                for (let i = 0; i < torrent.files.length; i++) {
                    let fileToDeselect = torrent.files[i];
                    fileToDeselect.deselect();
                }

                let videoFormats = [
                    "avi",
                    "mp4",
                    "m4v",
                    "m4a",
                    "mkv",
                    "wmv",
                    "mov"
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

                let subtitleFiles = torrent
                    .files
                    .filter((file) => {
                        let extension = file
                            .name
                            .substring(file.name.lastIndexOf(".") + 1, file.name.length);

                        if (extension == "srt") {
                            return file;
                        }
                    });

                this
                    .sanitizeSubtitles(subtitleFiles)
                    .then((subtitleOptions) => {
                        this.setSubtitleOptions(subtitleOptions);
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
                        .listen("8888");

                    this
                        .fetchFirstPieces(torrent, file)
                        .then(() => {
                            this.setStreamTimeout(35000);
                            this.toggleIntro(true);
                            this.setPlayerStatus("Logging into the OASIS", true);
                            this.setMovieTime();
                            this.fileIndex = fileIndex;
                        });
                }
            });
        } else {
            this.destroyClient();
        }
    };

    resetSearch = () => {
        this.setInputValue("");
    };

    closeSearch = () => {
        this.setSearch();
        this.resetSearch();
    };

    sortQuery = (results) => {
        results.sort((a, b) => {
            return b.popularity - a.popularity;
        });

        results = results.filter((movie) => {
            let releaseDate = movie.release_date;
            let year = Number(releaseDate.substring(0, 4));
            let month = Number(releaseDate.substring(6, 7));

            let currentDate = new Date();
            currentDate = {
                year: currentDate.getFullYear(),
                month: currentDate.getMonth() + 1
            };

            return (movie.backdrop_path !== null && year <= currentDate.year && (year == currentDate.year
                ? month < currentDate.month - 1
                : true) && movie.popularity > 2 && movie.vote_average > 4);
        });

        return results;
    };

    searchEmpty = (query) => {
        let emptyContent = (
            <Fade bottom>
                <div className="search-empty">
                    {`No Results for "${
                    query.length > 20
                        ? query.substring(0, 20) + "..."
                        : query}"`}
                </div>
            </Fade>
        );

        this.setSearch(emptyContent);
    };

    setSearch = (searchContent) => {
        this.setState({searchContent});
    };

    setOffline = (isOffline) => {
        this.setLoadingContent();
        this.setState({isOffline});
    };

    setLoadingContent = (loadingContent) => {
        this.setState({loadingContent});
    };

    fetchContent = (url) => {
        return new Promise((resolve, reject) => {
            this.setLoadingContent(true);
            request
                .get(url)
                .then((response) => {
                    this.setOffline();
                    resolve(response.data);
                })
                .catch((err) => {
                    this.setLoadingContent(false);
                    reject(err);
                });
        });
    };

    searchMovies = () => {
        let query = this.state.inputValue;

        if (query === "") {
            this.closeSearch();
        } else {
            let searchResults = [];
            for (let u = 1; u < 5; u++) {
                let url = `https://api.themoviedb.org/3/search/multi?api_key=${
                this.state.apiKey}&region=US&language=en-US&query=${query}&page=${u}&include_adult=false`;

                let promise = new Promise((resolve, reject) => {
                    this
                        .fetchContent(url)
                        .then((response) => {
                            let results = this.extractMovies(response, false, true);
                            resolve(results);
                        })
                        .catch((err) => reject(err));
                }).catch((err) => console.log(err));

                searchResults.push(promise);
            }

            Promise
                .all(searchResults)
                .then((results) => {
                    this.setOffline();
                    results = []
                        .concat
                        .apply([], results);

                    if (!results.every((val) => {
                        return !val;
                    })) {
                        results = this.sortQuery(results);

                        if (results.length === 0) {
                            this.searchEmpty(query);
                        } else {
                            this.setSearch(results);
                        }
                    } else {
                        this.searchEmpty(query);
                    }
                })
                .catch((err) => this.setOffline(true));
        }
    };

    initMovie = (movie) => {
        this.setState({playerLoading: true, playMovie: movie, time: "00:00:00", paused: true});
    };

    prepareMovieTitle = (title) => {
        return title
            .replace(/[^a-zA-Z0-9\s\-]/g, "")
            .replace(/\-/g, " ")
            .toLowerCase();
    };

    checkMagnet = (movie) => {
        return new Promise((resolve, reject) => {
            let magnet = movie
                .magnet
                .toUpperCase();
            if (magnet.match(/^(?!.*(HDTS|HDTC|HD\.TS|HD\.TC|HD\-TS|HD\-TC|CAM))/g)) {
                resolve(movie);
            } else {
                movie.magnet = false;
                console.log("Previous magnet link was of low quality.");
                reject(movie);
            }
        });
    };

    promiseTimeout = (ms, promise) => {
        let timeout = new Promise((resolve, reject) => {
            let id = setTimeout(() => {
                clearTimeout(id);
                reject("Timed out in " + ms + "ms.");
            }, ms);
        }).catch((err) => console.log(err));

        return Promise.race([promise, timeout]);
    };

    setPlayerLoading = (playerLoading) => {
        this.setState({playerLoading});
    };

    setVideoIndex = (videoIndex) => {
        return new Promise((resolve, reject) => {
            this.setState({
                videoIndex
            }, () => {
                resolve();
            });
        });
    };

    resetVideo = () => {
        this.setPlayerLoading(true);
        this.setVideoIndex();
        this.setVideoError();
    };

    closeServer = () => {
        if (this.server) {
            this
                .server
                .close();
        }
    };

    getMovieDate = (movie) => {
        return movie.release_date
            ? movie
                .release_date
                .substring(0, 4)
            : '';
    };

    getQualityTorrent = (torrents) => {
        let clone = this.getClone(torrents);
        let quality = this.state.quality == "HD"
            ? "720p"
            : "1080p";

        let torrent = clone.find((item) => {
            if (item.resolution || item.quality) {
                if (item.resolution == quality || item.quality == quality) {
                    if (item.title.indexOf("YIFY") > -1) {
                        return item;
                    }
                }
            }
        });

        torrent = torrent
            ? torrent
            : clone.find((item) => {
                if (item.resolution || item.quality) {
                    if (item.resolution == quality || item.quality == quality) {
                        return item;
                    }
                }
            });

        return torrent
            ? torrent
            : clone[0];
    };

    searchTorrent = (movie, show, excludeDate) => {
        this.resetVideo();
        this.removeTorrents();
        this.closeServer();

        if (movie.magnet) {
            this
                .checkMagnet(movie)
                .then((cleanMovie) => {
                    this.streamTorrent(cleanMovie);
                })
                .catch((movie) => this.searchTorrent(movie, show));
        } else {
            if (this.state.playMovie) {
                let title = this.prepareMovieTitle(movie.title),
                    date = this.getMovieDate(movie),
                    query = show
                        ? movie.query
                        : `${title} ${excludeDate
                            ? ""
                            : date}`;

                this.setPlayerStatus(`Searching the entire universe for "${movie.show_title || movie.title}"`, true);

                let publicSearch = this
                    .publicSearch
                    .search([
                        "1337x", "Rarbg"
                    ], query, show
                        ? "TV"
                        : "Movies", 20);

                let proprietarySearch = this
                    .torrentSearch
                    .searchTorrents(query, show);

                Promise
                    .all([publicSearch, proprietarySearch])
                    .then((data) => {
                        data = []
                            .concat
                            .apply([], data);

                        if (data[0]) {
                            if ((data[0].message || typeof data[0] === "string") && data.length <= 2) {
                                this.searchTorrent(movie, show, true);
                            } else {
                                let magnetPromises = [];
                                for (let n = 0; n < data.length; n++) {
                                    let magnetTorrent = data[n];
                                    if (magnetTorrent) {
                                        if (magnetTorrent.desc) {
                                            let promise = this
                                                .torrentSearch
                                                .getMagnetFromLink(magnetTorrent);
                                            magnetPromises.push(promise);
                                        }
                                    }
                                }

                                Promise
                                    .all(magnetPromises)
                                    .then((results) => {
                                        results = [
                                            ...results,
                                            ...data
                                        ];

                                        let cleanResults = results.filter((torrent) => {
                                            if (torrent) {
                                                return torrent.magnet;
                                            }
                                        });

                                        if (cleanResults.length) {
                                            this
                                                .getPreferredTorrents(cleanResults)
                                                .then((torrents) => {
                                                    let torrent = this.getQualityTorrent(torrents);
                                                    if (torrent) {
                                                        if (this.state.playMovie) {
                                                            let movie = this.getObjectClone(this.state.playMovie);
                                                            movie.preferredTorrents = torrents;
                                                            this.setState({
                                                                playMovie: movie
                                                            }, () => {
                                                                this.changeCurrentMagnet(torrent.magnet);
                                                                this.updateMovieTimeArray(movie, true);
                                                                this.streamTorrent(torrent);
                                                            });
                                                        }
                                                    } else {
                                                        this.applyTimeout(1);
                                                    }
                                                });
                                        } else {
                                            this.applyTimeout();
                                        }
                                    })
                                    .catch((err) => console.log(err));
                            }
                        } else {
                            this.applyTimeout(1);
                        }

                    })
                    .catch((err) => console.log(err));
            }
        }
    };

    playMovie = (movie, show) => {
        movie = this.matchMovie(movie);
        this.initMovie(movie);
        this
            .toggleBox(show)
            .then(() => {
                this.searchTorrent(movie, show);
                this.addToRecentlyPlayed(movie);
            });
    };

    destroyClient = (backUp) => {
        return new Promise((resolve, reject) => {
            clearTimeout(this.streamTimeout);
            clearInterval(this.fileStart);
            clearInterval(this.fileLoadedTimeout);

            if (this.state.client) {
                let playMovie = backUp
                    ? this.getObjectClone(this.state.playMovie)
                    : false;
                this.setState({
                    playMovie: playMovie,
                    startTime: backUp
                        ? this.state.startTime
                        : false,
                    videoIndex: false,
                    videoElement: false,
                    downloadPercent: false,
                    isStreaming: false,
                    paused: true,
                    playerLoading: backUp
                        ? true
                        : false,
                    subtitleOptions: [],
                    showIntro: false
                }, () => {
                    this.closeServer();

                    setTimeout(() => {
                        if (backUp) {
                            this
                                .removeTorrents()
                                .then(() => {
                                    resolve();
                                });
                        } else {
                            resolve();
                        }
                    }, 250);
                });
            }
        }).catch((err) => console.log(err));
    };

    setFullScreen = (full) => {
        let browserWindow = require("electron")
            .remote
            .getCurrentWindow();

        if (full === undefined) {
            full = false;
        }
        browserWindow.setFullScreen(full);
    };

    setMovieTimeArray = (newArray) => {
        this.setState((prevState) => {
            if (prevState.movieTimeArray !== this.state.movieTimeArray || newArray) {
                return {
                    movieTimeArray: newArray
                        ? newArray
                        : this.state.movieTimeArray
                };
            }
        }, () => {
            this.setStorage();
        });
    };

    addToMovieTimeArray = (movie) => {
        let clone = this.getClone(this.state.movieTimeArray);
        clone.push(movie);

        this.setMovieTimeArray(clone);
    };

    changeCurrentMagnet = (magnet) => {
        this.currentMagnet = magnet;
    };

    getCurrentMagnet = () => {
        return this.currentMagnet;
    };

    updateMovieTimeArray = (clone, alt) => {
        let movieTimeArray = this.getClone(this.state.movieTimeArray);
        let matchingItem = this.returnCorrectMovie(movieTimeArray, clone);

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
                title: clone.title,
                currentTime: clone.currentTime,
                preferredTorrents: clone.preferredTorrents,
                magnet: this.currentMagnet
            };
            this.addToMovieTimeArray(movieData);
        }
    };

    getObjectClone = (src) => {
        let target = {};
        if (src) {
            for (let prop in src) {
                if (src.hasOwnProperty(prop)) {
                    target[prop] = src[prop];
                }
            }
        }
        return target;
    };

    updateMovieTime = (time, fallback) => {
        if (this.state.playMovie) {
            if (time) {
                let clone = this.getObjectClone(this.state.playMovie);
                clone.currentTime = time;
                this.setState({playMovie: clone});
                this.updateMovieTimeArray(clone);
            } else {
                if (fallback) {
                    fallback();
                }
            }
        }
    };

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
    };

    returnCorrectMovie = (array, movie, index) => {
        if (index) {
            return array.findIndex((item) => {
                if (movie.show_title) {
                    if (item.show_title === movie.show_title) {
                        return true;
                    }
                } else {
                    if (movie.id) {
                        if (item.id === movie.id) {
                            return true;
                        }
                    }
                    if (movie.title) {
                        if (item.title === movie.title) {
                            return true;
                        }
                    }
                }
            });
        } else {
            return array.find((item) => {
                if (movie.show_title) {
                    if (item.show_title === movie.show_title) {
                        return true;
                    }
                } else {
                    if (movie.id) {
                        if (item.id === movie.id) {
                            return true;
                        }
                    }

                    if (movie.title) {
                        if (item.title === movie.title) {
                            return true;
                        }
                    }
                }
            });
        }
    };

    matchMovie = (movie) => {
        let clone = this.getClone(this.state.movieTimeArray);
        let matchingItem = this.returnCorrectMovie(clone, movie);

        if (matchingItem) {
            movie.magnet = matchingItem.magnet;
            movie.preferredTorrents = matchingItem.preferredTorrents;
            this.changeCurrentMagnet(matchingItem.magnet);
            return movie;
        }

        return movie;
    };

    openBox = (movie) => {
        this.toggleBox(true);
        this.setState({movieCurrent: movie});
    };

    toggleBox = (active) => {
        return new Promise((resolve, reject) => {
            this.setState({
                showBox: active
            }, () => {
                setTimeout(resolve, 250);
            });
        });
    };

    closeBackdrop = () => {
        this.toggleBox();
    };

    getURLDate = (n, justYear) => {
        let date = new Date(),
            year = date.getFullYear(),
            month = date
                .getMonth()
                .toString()
                .length < 2
                ? "0" + (date.getMonth() + 1)
                : date.getMonth() + 1,
            day = date
                .getDate()
                .toString()
                .length < 2
                ? "0" + date.getDate()
                : date.getDate();

        if (justYear) {
            return year - n;
        }

        return `${year - n}-${month}-${day}`;
    };

    setFeatured = (featured) => {
        this.setState({featured});
    };

    getFeatured = () => {
        let url = `https://api.themoviedb.org/3/discover/movie?api_key=${
        this
            .state
            .apiKey}&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&primary_release_date.gte=${this
            .getURLDate(10, true)}&primary_release_date.lte=${this
            .getURLDate(1, true)}`;
        return new Promise((resolve, reject) => {
            this
                .fetchContent(url)
                .then((response) => {
                    resolve(response);
                })
                .catch((err) => reject(err));
        });
    };

    loadFeatured = () => {
        this
            .getFeatured()
            .then((results) => {
                let featured = this.extractMovies(results, false, true);
                this.setFeatured(featured);
            })
            .catch((err) => this.setOffline(true));
    };

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
    };

    extractNetflixMovies = (response) => {
        let extracted = response.substring(response.indexOf('"entities"'), response.indexOf('"meta"'));
        let netflixData = JSON.parse(`{${extracted.substring(0, extracted.length - 1)}}}`).entities.entries;
        let array = [];

        Object
            .keys(netflixData)
            .map((object, index) => {
                let item = netflixData[object];
                item.vote_average = item.imdb_rating;
                item.release_date = item.released_on;
                item.isNetflix = true;
                item.flixerr_data = {
                    poster_path: `https://img.reelgood.com/content/movie/${item.rg_id}/poster-780.jpg`,
                    backdrop_path: `https://img.reelgood.com/content/movie/${item.rg_id}/backdrop-1280.jpg`,
                    blurry_poster_path: `https://img.reelgood.com/content/movie/${item.rg_id}/poster-92.jpg`,
                    blurry_backdrop_path: `https://img.reelgood.com/content/movie/${item.rg_id}/backdrop-92.jpg`
                };

                array[index] = item;
            });

        array = this.shuffleArray(array);
        return array;
    };

    extractMovies = (response, data, shuffle) => {
        let movies = data
            ? data
            : response.results;

        let sanitized = [];
        for (let i = 0; i < movies.length; i++) {
            let movie = movies[i];
            if (movie.backdrop_path) {
                movie.title = movie.name
                    ? movie.name
                    : movie.title;
                movie.release_date = movie.first_air_date
                    ? movie.first_air_date
                    : movie.release_date;
                movie.isSeries = movie.first_air_date
                    ? true
                    : false;
                movie.isNetflix = false;
                movie.flixerr_data = {
                    poster_path: `https://image.tmdb.org/t/p/w780${movie.poster_path}`,
                    backdrop_path: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
                    show_backdrop_path: `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`,
                    blurry_poster_path: `https://image.tmdb.org/t/p/w92${movie.poster_path}`,
                    blurry_backdrop_path: `https://image.tmdb.org/t/p/w300${movie.backdrop_path}`
                };
                sanitized.push(movie);
            }
        }

        movies = shuffle
            ? this.shuffleArray(sanitized)
            : sanitized;

        return movies;
    };

    getMovies = (genre, genreID, shows) => {
        let page = Math.floor(Math.random() * this.state.genrePages) + 1;
        let url = shows
            ? `https://api.themoviedb.org/3/discover/tv?api_key=${this.state.apiKey}&language=en-US&sort_by=popularity.desc&page=${page}&timezone=America%2FNew_York&with_genres=${genreID}&with_original_language=en`
            : genreID != 21
                ? `https://api.themoviedb.org/3/discover/movie?api_key=${
        this
            .state
            .apiKey}&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&primary_release_date.lte=${this
            .getURLDate(1)}&with_genres=${genreID}` : "https://reelgood.com/movies/source/netflix?filter-sort=1";
        return new Promise((resolve, reject) => {
            this
                .fetchContent(url)
                .then((response) => {
                    let genreComplete = {
                        name: genre,
                        genreID: genreID
                    };

                    if (genreID == 21) {
                        genreComplete.movies = this.extractNetflixMovies(response);
                    } else {
                        genreComplete.movies = this.extractMovies(response, false, true);
                    }
                    resolve(genreComplete);
                })
                .catch((err) => reject(err));
        }).catch((err) => console.log(err));
    };

    isRecent = (movie) => {
        let clone = this.getClone(this.state.recentlyPlayed);
        return this.returnCorrectMovie(clone, movie);
    };

    isFavorite = (movie) => {
        let clone = this.getClone(this.state.favorites);
        return this.returnCorrectMovie(clone, movie);
    };

    chooseRandom = (array, limit) => {
        let results = [],
            clonedArray = this.getClone(array);

        if (array) {
            if (array.length < limit) {
                limit = array.length;
            }

            for (let i = 0; i < limit; i++) {
                let n = Math.floor(Math.random() * clonedArray.length - 1);
                let item = clonedArray.splice(n, 1);
                results.push(item);
            }
        }
        
        return [].concat.apply([], results);
    };

    getRecommended = (url) => {
        return new Promise((resolve, reject) => {
            this
                .fetchContent(url)
                .then((response) => {
                    resolve(response.results.slice(0, 5));
                })
                .catch((err) => reject(err));
        });
    };

    getSuggested = (data) => {
        return new Promise((resolve, reject) => {
            let favorites = this.chooseRandom(data
                    ? data.favorites
                    : this.state.favorites, 5),
                recents = this.chooseRandom(data
                    ? data.recentlyPlayed
                    : this.state.recentlyPlayed, 5),
                collection = favorites.concat(recents);

            let promises = [];
            let pages = [1, 2, 3];
            if (collection) {
                if (collection.length) {
                    for (let j = 0; j <= collection.length; j++) {
                        let movie = collection[j],
                            page = this.chooseRandom(pages, 1),
                            url = '';

                        if (movie) {
                            if (movie.isSeries) {
                                url = `https://api.themoviedb.org/3/tv/${
                                movie.id}/recommendations?api_key=${
                                this
                                    .state
                                    .apiKey}&region=US&language=en-US&sort_by=popularity.desc`;
                            }else if(movie.id){
                                url = `https://api.themoviedb.org/3/movie/${
                                    movie.id}/recommendations?api_key=${
                                    this
                                        .state
                                        .apiKey}&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&primary_release_date.lte=${this
                                            .getURLDate(1)}`;
                            }
                            
                            let promise = this.getRecommended(url);
                            promises.push(promise);
                        }
                    }

                    Promise
                        .all(promises)
                        .then((suggested) => {
                            let finalSuggested = []
                                .concat
                                .apply([], suggested);

                            let clean = this.stripDuplicateMovies(finalSuggested);
                            if (clean.length > 20) {
                                clean = clean.slice(0, 20);
                            }

                            clean = this.extractMovies(false, clean, true);
                            resolve(clean);
                        })
                        .catch((err) => reject(err));
                }
            }
        });
    };

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
    };

    updateSuggested = () => {
        this
            .getSuggested()
            .then((suggested) => {
                this.setState({
                    suggested
                }, () => {
                    if (this.databaseRef) {
                        this.setBucket();
                    }
                });
            })
            .catch((err) => console.log(err));
    };

    getClone = (array) => {
        return array
            ? [...array]
            : [];
    };

    addToFavorites = (movie) => {
        if (movie.show) {
            movie = movie.show;
        }

        let clone = this.getClone(this.state.favorites);
        clone.push(movie);
        this.setState({
            favorites: clone
        }, () => {
            this.setStorage();
        });
    };

    removeFromFavorites = (movie) => {
        if (movie.show) {
            movie = movie.show;
        }

        let clone = this.getClone(this.state.favorites);
        let index = this.returnCorrectMovie(clone, movie, true);

        clone.splice(index, 1);
        this.setState({
            favorites: clone
        }, () => {
            this.setStorage();
        });
    };

    addToRecentlyPlayed = (movie) => {
        let clone = this.getClone(this.state.recentlyPlayed);
        if (movie.show) {
            movie = movie.show;
        }
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
            let index = this.returnCorrectMovie(clone, movie, true);

            clone.splice(index, 1);
            clone.unshift(movie);
            this.setState({
                recentlyPlayed: clone
            }, () => {
                this.setStorage();
            });
        }
    };

    setMovies = (movies) => {
        this.setState({movies});
    };

    setShows = (shows) => {
        this.setState({shows});
    }

    loadCategories = (shows) => {
        let movieGenres = require('./movie-genres');
        movieGenres = shows
            ? movieGenres.getTVCategories()
            : movieGenres.getCategories();

        let promiseArray = [];

        for (let j = 0; j < movieGenres.length; j++) {
            let promise = new Promise((resolve, reject) => {
                this
                    .getMovies(movieGenres[j].name, movieGenres[j].id, shows)
                    .then((genreComplete) => {
                        resolve(genreComplete);
                    })
                    .catch((err) => console.log(err));
            });

            promiseArray.push(promise);
        }

        Promise
            .all(promiseArray)
            .then((data) => {
                if (shows) {
                    this.setShows(data);
                } else {
                    this.setMovies(data);
                }
            })
            .catch(() => this.setOffline(true));
    };

    openMenu = () => {
        this.setState({menuActive: true});
    };

    closeMenu = () => {
        this.setState({menuActive: false});
    };

    toggleMenu = () => {
        this.setState((prevState) => {
            return {
                menuActive: !prevState.menuActive
            };
        });
    };

    updateMenu = (active) => {
        this.closeMenu();
        this.closeSearch();
        this.setOffline();
        if (active != undefined) {
            this.setState({active});
        }
    };

    handleLogo = () => {
        this.setState({logoIsLoaded: true});
    };

    loadLogo = () => {
        let tempImage = new Image();
        tempImage.onload = this.handleLogo;
        tempImage.src = "assets/imgs/icon.png";
    };

    requireTorrent = () => {
        this.publicSearch = require("torrent-search-api");
        this
            .publicSearch
            .enablePublicProviders();

        this.torrentSearch = new TorrentSearch();
    };

    signIn = () => {
        let email = this.state.inputEmail.length
                ? this.state.inputEmail
                : this.state.user
                    ? this.state.user.email
                    : "",
            password = this.state.inputPass.length
                ? this.state.inputPass
                : this.state.user
                    ? this.state.user.password
                    : "";

        firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then(() => {
                this.closeAccount();
            })
            .catch((error) => {
                this.handleErrorMessage(error);
            });
    };

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
                this.setState((prevState) => {
                    if (prevState.user !== user) {
                        return {user};
                    }
                }, () => {
                    if (this.state.user == user) {
                        this.setEverything = true;
                        this.createDataBase();
                        this.getBucket();
                        this.listenToBucket();
                    }
                    this.setUserCredentials();
                });
            });

        if (!this.state.isGuest && this.state.user) {
            this.signIn();
        } else if (!this.state.isGuest && !this.state.user) {
            this.openAccount();
        } else if (!this.state.user) {
            this.updateSuggested();
        }
    };

    resetData = () => {
        return new Promise((resolve, reject) => {
            this.setState({
                favorites: [],
                recentlyPlayed: [],
                suggested: [],
                movieTimeArray: [],
                quality: "HD"
            }, () => {
                resolve();
            });
        });
    };

    handleErrorMessage = (error) => {
        let errorMessage = error.message;

        if (errorMessage == "There is no user record corresponding to this identifier. The user may have been" +
                " deleted.") {
            errorMessage = `We can't find a user associated with that email. Please try again.`;
        }
        this.setState({loginError: errorMessage});
    };

    handleAccount = (create) => {
        let email = this.state.inputEmail,
            password = this.state.inputPass;

        if (!email.length && !password.length) {
            this.setState({loginError: "Incorrect email or password."});
        } else {
            if (create) {
                firebase
                    .auth()
                    .createUserWithEmailAndPassword(email, password)
                    .then(() => {
                        this
                            .resetData()
                            .then(() => {
                                this.setStorage();
                            });
                        this.closeAccount();
                    })
                    .catch((error) => {
                        this.handleErrorMessage(error);
                    });
            } else {
                this.signIn();
            }
        }
    };

    openAccount = () => {
        this.setState({create: false, loginError: false, account: true});
    };

    openAccountCreation = () => {
        this.setState({create: true, loginError: false, account: false});
    };

    closeAccount = () => {
        this.setState({
            inputEmail: "",
            inputPass: "",
            account: false,
            create: false,
            loginError: false,
            isGuest: true
        }, () => {
            this.setUserCredentials();
        });
    };

    closeBackup = () => {
        this.setState({backupIsOpen: false});
    };

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
    };

    handleInput = (e) => {
        let value = e.target.value;
        let isEmail = value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g);

        this.setState({
            [isEmail
                    ? "inputEmail"
                    : "inputPass"]: value,
            loginError: false
        });
    };

    handleAccountSignin = () => {
        this.handleAccount();
    };

    handleAccountCreation = () => {
        this.handleAccount(true);
    };

    loadNecessary = () => {
        if (!this.state.featured.length) {
            this.loadFeatured();
        }
        if (!this.state.movies.length) {
            this.loadCategories();
        }
        if (!this.state.shows.length) {
            this.loadCategories(true);
        }
    };

    handleConnectionChange = (e) => {
        if (e.type == "offline") {
            this.setOffline(true);
        }
        if (e.type == "online") {
            this.setOffline();
            this.updateMenu(this.state.active);
            this.resetSearch();
            this.loadNecessary();
            if (this.state.user && !firebase.auth().currentUser) {
                this.signIn();
            }
        }
    };

    setHeaderBackground = (headerBg) => {
        this.setState({headerBg});
    };

    componentDidMount() {
        this.loadLogo();
        this
            .getStorage()
            .then(() => this.getUserCredentials())
            .catch((err) => console.log(err));
        this.loadFeatured();
        this.loadCategories();
        this.loadCategories(true);
        this.startWebTorrent();
        this.requireTorrent();
        window.addEventListener("online", this.handleConnectionChange);
        window.addEventListener("offline", this.handleConnectionChange);
    }

    render() {
        let menu = this.state.menuActive
            ? (<Menu
                user={this.state.user}
                openAccount={this.openAccount}
                signOut={this.signOut}
                active={this.state.active}
                updateMenu={this.updateMenu}
                resetSearch={this.resetSearch}/>)
            : ("");

        let movieBackDrop = this.state.showBox
            ? (<div className="movie-container-bg" onClick={this.closeBackdrop}/>)
            : ("");

        let movieModal = this.state.showBox
            ? (<MovieModal
                apiKey={this.state.apiKey}
                movie={this.state.movieCurrent}
                favorites={this.state.favorites}
                playMovie={this.playMovie}
                isFavorite={this.isFavorite}
                addToFavorites={this.addToFavorites}
                removeFromFavorites={this.removeFromFavorites}/>)
            : ("");

        let playerModal = this.state.playMovie
            ? (<Player
                subtitleOptions={this.state.subtitleOptions}
                fileLoaded={this.state.fileLoaded}
                setFileLoaded={this.setFileLoaded}
                setWillClose={this.setWillClose}
                readyToClose={this.state.readyToClose}
                showIntro={this.state.showIntro}
                toggleIntro={this.toggleIntro}
                downloadPercent={this.state.downloadPercent}
                downloadSpeed={this.state.downloadSpeed}
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
            : ("");

        let fullGenreContainer = this.state.showGenre
            ? (<Genre
                extractMovies={this.extractMovies}
                genreInfo={this.state.genreInfo}
                favorites={this.state.favorites}
                recentlyPlayed={this.state.recentlyPlayed}
                suggested={this.state.suggested}
                apiKey={this.state.apiKey}
                fetchContent={this.fetchContent}
                openBox={this.openBox}
                setOffline={this.setOffline}
                closeGenre={this.closeGenre}/>)
            : ("");

        let loadingContainer = this.state.appLoading
            ? (
                <div className="loading-container">
                    <Fade when={this.state.logoIsLoaded} distance="10%" bottom>
                        <div className="logo"/>
                    </Fade>
                </div>
            )
            : ("");

        return (
            <div
                className={`app-container ${process.platform === "win32"
                ? "windows-compensate"
                : ""}`}
                onClick={this.closeMenu}>
                {process.platform === "darwin"
                    ? (<div
                        className={"draggable " + (this.state.playMovie
                        ? "invisible"
                        : "")}/>)
                    : ("")}
                <CSSTransitionGroup
                    transitionName="player-anim"
                    transitionEnterTimeout={250}
                    transitionLeaveTimeout={250}>
                    {this.state.account || this.state.create
                        ? (<AccountContainer
                            account={this.state.account}
                            closeAccount={this.closeAccount}
                            handleAccountSignin={this.handleAccountSignin}
                            handleAccountCreation={this.handleAccountCreation}
                            handleInput={this.handleInput}
                            loginError={this.state.loginError}
                            openAccount={this.openAccount}
                            openAccountCreation={this.openAccountCreation}/>)
                        : ("")}
                </CSSTransitionGroup>
                <CSSTransitionGroup
                    transitionName="loading-anim"
                    transitionEnterTimeout={0}
                    transitionLeaveTimeout={250}>
                    {loadingContainer}
                </CSSTransitionGroup>
                <CSSTransitionGroup
                    transitionName="genreContainer-anim"
                    transitionEnterTimeout={250}
                    transitionLeaveTimeout={250}>
                    {fullGenreContainer}
                </CSSTransitionGroup>
                <CSSTransitionGroup
                    transitionName="player-anim"
                    transitionEnterTimeout={250}
                    transitionLeaveTimeout={250}>
                    {playerModal}
                </CSSTransitionGroup>
                <CSSTransitionGroup
                    transitionName="movie-box-anim"
                    transitionEnterTimeout={250}
                    transitionLeaveTimeout={250}>
                    {movieModal}
                </CSSTransitionGroup>
                <CSSTransitionGroup
                    transitionName="box-anim"
                    transitionEnterTimeout={250}
                    transitionLeaveTimeout={250}>
                    {movieBackDrop}
                </CSSTransitionGroup>
                <Header
                    quality={this.state.quality}
                    setQuality={this.setQuality}
                    subtitle={this.state.active}
                    menuActive={this.state.menuActive}
                    toggleMenu={this.toggleMenu}
                    background={this.state.headerBg}
                    closeSearch={this.closeSearch}
                    searchContent={this.state.searchContent}
                    searchMovies={this.searchMovies}
                    inputValue={this.state.inputValue}
                    setInputValue={this.setInputValue}
                    user={this.state.user}/>
                <CSSTransitionGroup
                    transitionName="menu-anim"
                    transitionEnterTimeout={250}
                    transitionLeaveTimeout={250}>
                    {menu}
                </CSSTransitionGroup>
                <Content
                    active={this.state.active}
                    offline={this.state.isOffline}
                    searchContent={this.state.searchContent}
                    loadingContent={this.state.loadingContent}
                    setHeader={this.setHeaderBackground}
                    loadCategories={this.loadCategories}
                    loadFeatured={this.loadFeatured}
                    updateSuggested={this.updateSuggested}
                    movies={this.state.movies}
                    shows={this.state.shows}
                    suggested={this.state.suggested}
                    favorites={this.state.favorites}
                    recentlyPlayed={this.state.recentlyPlayed}
                    featured={this.state.featured}
                    toggleGenre={this.toggleGenre}
                    openBox={this.openBox}/>
            </div>
        );
    }
}

export default App;
