import React, { Component } from "react";

import { CSSTransitionGroup } from "react-transition-group";
import Fade from "react-reveal/Fade";
import storage from "electron-json-storage";
import path from "path";
import fs from "fs";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";

import AccountContainer from "./account-container";
import Menu from "./menu";
import MovieModal from "./movie-modal";
import Player from "./player";
import Genre from "./genre";
import Header from "./header";
import Content from "./content";
import Trailer from "./trailer";
import DarkModeToggle from "./dark-mode-toggle";

import TorrentSearch from "./torrent-search";
import SubtitleSearch from "./subtitles/subtitle-search";
import { default as request } from "axios";
import VideoStream from "./video-stream";

import uniqid from "uniqid";

const exec = require("child_process").execFile;
const accurateInterval = require("accurate-interval");

class App extends Component {
    constructor(props) {
        super(props);

        this.fileStart = false;
        this.streamTimeout = false;
        this.fileLoadedTimeout = false;
        this.qualityTimeout = false;
        this.introTimeout = false;
        this.saveLastLeftOffTimeout = false;
        this.autoSaveInterval = false;
        this.firestoreDatabase = false;
        this.movieAudienceId = false;

        this.state = {
            apiKey: "22b4015cb2245d35a9c1ad8cd48e314c",
            bonjourInstalled: true,
            darkMode: false,
            readyToStream: false,
            willClose: false,
            trailer: false,
            loginError: false,
            showIntro: false,
            currentVideoStream: false,
            account: true,
            create: false,
            inputEmail: "",
            inputPass: "",
            user: false,
            isPremiumUser: false,
            isGuest: false,
            isLoading: false,
            downloadPercent: false,
            downloadSpeed: 0,
            fileLoaded: 0,
            active: "Featured",
            currentChat: [],
            currentAudienceCount: 1,
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
                movies: [],
            },
            showGenre: false,
            collectionContainer: false,
            menuActive: false,
            headerBg: false,
            content: false,
            showBox: false,
            movieCurrent: false,
            currentMovie: false,
            playerLoading: true,
            playerStatus: false,
            isStreaming: false,
            paused: true,
            genreContainer: false,
            genrePages: 7,
            searchContent: false,
            isOffline: false,
            logoLoaded: false,
            error: false,
            appLoading: true,
            videoQuality: "HD",
            time: "00:00:00",
            startTime: 0,
            currentTime: 0,
            videoElement: false,
            subtitleOptions: [],
            inputValue: "",
            seekValue: 0,
            colorStop: 0,
        };
    }

    setTrailer = (trailer) => {
        this.setState({ trailer });
    };

    setSubtitleOptions = (subtitleOptions) => {
        this.setState({ subtitleOptions });
    };

    setFileLoaded = (fileLoaded) => {
        this.setState({ fileLoaded });
    };

    toggleIntro = (showIntro) => {
        return new Promise((resolve) => {
            this.setState(
                {
                    showIntro,
                },
                () => {
                    clearTimeout(this.introTimeout);
                    this.introTimeout = setTimeout(resolve, 6000);
                }
            );
        });
    };

    setQuality = (videoQuality) => {
        this.setState(
            {
                videoQuality,
            },
            () => {
                clearTimeout(this.qualityTimeout);
                this.qualityTimeout = setTimeout(() => {
                    this.setStorage("videoQuality");
                }, 250);
            }
        );
    };

    setStartTime = (startTime) => {
        this.setState({ startTime });
    };

    setVideoElement = (videoElement) => {
        this.setState({ videoElement });
    };

    setCurrentTime = (currentTime) => {
        this.setState({ currentTime });
    };
    setSeekValue = (seekValue) => {
        this.setState({ seekValue });
    };

    setColorStop = (colorStop) => {
        this.setState({ colorStop });
    };

    setInputValue = (inputValue) => {
        this.setState({ inputValue });
    };

    setStreaming = (isStreaming) => {
        this.setState({ isStreaming });
    };

    setPlayerStatus = (status, loading) => {
        return new Promise((resolve) => {
            this.setState(
                {
                    playerStatus: status
                        ? {
                              status,
                              loading,
                          }
                        : false,
                },
                () => {
                    clearTimeout(this.playerTimeout);
                    this.playerTimeout = setTimeout(() => resolve(), 2500);
                }
            );
        });
    };

    toggleGenre = (showGenre, genreInfo) => {
        this.setState({ showGenre, genreInfo });
    };

    closeGenre = () => {
        this.toggleGenre();
    };

    setUserCredentials = () => {
        storage.set(
            "userCredentials",
            {
                user: this.state.user,
                create: this.state.create,
                account: this.state.account,
                isGuest: this.state.isGuest,
            },
            (error) => {
                if (error) {
                    throw error;
                }
            }
        );
    };

    getUserCredentials = () => {
        storage.get("userCredentials", (error, data) => {
            if (error) {
                console.log("Not able to retrieve user credentials.");
            } else {
                this.setState(
                    {
                        user: data.user
                            ? data.user.uid
                                ? data.user
                                : false
                            : false,
                        create: data.create,
                        account: data.account,
                        isGuest: data.isGuest,
                    },
                    async () => {
                        this.startFireBase();
                    }
                );
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
        Object.keys(obj).forEach((key) => {
            if (obj[key] && typeof obj[key] === "object")
                this.removeEmpty(obj[key]);
            else if (obj[key] === undefined) delete obj[key];
        });
        return obj;
    };

    createDataBase = () => {
        let db = firebase.database();
        this.firestoreDatabase = firebase.firestore();
        if (this.state.user) {
            this.usersRef = db.ref(`users/${this.state.user.uid}`);
        }
    };

    setBucket = (key) => {
        if (this.state.user.email) {
            let data = {
                recentlyPlayed: this.cleanMovieArrays(
                    this.state.recentlyPlayed
                ),
                movieTimeArray: this.cleanMovieArrays(
                    this.state.movieTimeArray
                ),
                favorites: this.cleanMovieArrays(this.state.favorites),
                videoQuality: this.setPropertyOrDefault(
                    this.state.videoQuality,
                    "HD"
                ),
                darkMode: this.setPropertyOrDefault(this.state.darkMode, false),
            };

            if (key) {
                data = {
                    [key]: data[key],
                };
                console.log(data);
            }

            this.usersRef.update(data, () => {
                console.log("Database updated.");
            });
        }
    };

    isEqualToObject = (object1, object2) => {
        for (const propName in object1) {
            if (
                object1.hasOwnProperty(propName) !==
                object2.hasOwnProperty(propName)
            ) {
                return false;
            } else if (typeof object1[propName] !== typeof object2[propName]) {
                return false;
            }
        }
        for (const propName in object2) {
            if (
                object1.hasOwnProperty(propName) !==
                object2.hasOwnProperty(propName)
            ) {
                return false;
            } else if (typeof object1[propName] !== typeof object2[propName]) {
                return false;
            }
            if (!object1.hasOwnProperty(propName)) continue;

            if (
                object1[propName] instanceof Array &&
                object2[propName] instanceof Array
            ) {
                if (!this.isEqualToObject(object1[propName], object2[propName]))
                    return false;
            } else if (
                object1[propName] instanceof Object &&
                object2[propName] instanceof Object
            ) {
                if (!this.isEqualToObject(object1[propName], object2[propName]))
                    return false;
            } else if (object1[propName] !== object2[propName]) {
                return false;
            }
        }
        return true;
    };

    isEqualToArray = (array1, array2) => {
        if (!array2) return false;

        if (array1.length !== array2.length) return false;

        for (var i = 0, l = array1.length; i < l; i++) {
            if (array1[i] instanceof Array && array2[i] instanceof Array) {
                if (!this.isEqualToArray(array1[i], array2[i])) return false;
            } else if (
                array1[i] instanceof Object &&
                array2[i] instanceof Object
            ) {
                if (!this.isEqualToArray(array1[i], array2[i])) return false;
            } else if (array1[i] !== array2[i]) {
                return false;
            }
        }
        return true;
    };

    setDiff = (data) => {
        let change = [
            "favorites",
            "recentlyPlayed",
            "movieTimeArray",
            "videoQuality",
            "darkMode",
        ];
        return new Promise((resolve) => {
            let newState = {};
            for (let i = 0; i < change.length; i++) {
                let key = change[i],
                    subject = data[key],
                    comparator = this.state[key];
                if (this.setEverything) {
                    if (
                        typeof subject === "object" &&
                        key !== "movieTimeArray"
                    ) {
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
                this.getSuggested(data)
                    .then((suggested) => {
                        newState.suggested = suggested;
                        this.setState(newState, () => {
                            resolve();
                        });
                    })
                    .catch(() => {
                        this.setState(newState, () => {
                            resolve();
                        });
                    });
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
                this.setDiff(data).then(() => resolve());
            } else {
                this.resetData();
                reject();
            }
        });
    };

    listenToBucket = () => {
        if (this.usersRef) {
            this.usersRef.on("value", this.setBucketData);
        }
    };

    setStorage = (key) => {
        console.log("Setting storage", key);
        storage.set(
            "collection",
            {
                favorites: this.state.favorites,
                recentlyPlayed: this.state.recentlyPlayed,
                movieTimeArray: this.state.movieTimeArray,
                videoQuality: this.state.videoQuality,
                darkMode: this.state.darkMode,
            },
            (error) => {
                if (error) throw error;

                if (firebase.auth().currentUser) {
                    this.setEverything = false;
                    this.setBucket(key);
                }
            }
        );
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

    setPropertyOrDefault = (prop, def) => {
        return prop ? prop : def;
    };

    setStateFromStorage = (storage, callback) => {
        this.setState(
            {
                favorites: this.setPropertyOrDefault(storage.favorites, []),
                recentlyPlayed: this.setPropertyOrDefault(
                    storage.recentlyPlayed,
                    []
                ),
                movieTimeArray: this.setPropertyOrDefault(
                    storage.movieTimeArray,
                    []
                ),
                videoQuality: this.setPropertyOrDefault(
                    storage.videoQuality,
                    "HD"
                ),
                darkMode: this.setPropertyOrDefault(storage.darkMode, false),
            },
            () => {
                if (callback) {
                    callback();
                }
            }
        );
    };

    checkBonjourInstallation = (callback) => {
        this.setState(
            {
                bonjourInstalled: fs.existsSync(
                    path.join("C:", "Program Files", "Bonjour")
                ),
            },
            () => {
                console.log("bonjour-installed: ", this.state.bonjourInstalled);
                if (this.state.bonjourInstalled) {
                    if (callback) callback();
                }
            }
        );
    };

    runBonjourInstaller = () => {
        exec(path.join(__dirname, "../", "../", "bonjoursdksetup.exe"));
    };

    getStorage = () => {
        return new Promise((resolve, reject) => {
            storage.get("collection", (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    if (data) {
                        data = this.checkData(data);
                        this.checkBonjourInstallation(() => {
                            this.setStateFromStorage(data, () => {
                                setTimeout(() => {
                                    this.setState({ appLoading: false });
                                }, 1000);
                                resolve();
                            });
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
        return `${hours ? hours + ":" : ""}${
            minutes ? minutes + ":" : ""
        }${seconds}`;
    };

    getPreferredTorrents = (torrents) => {
        return new Promise((resolve) => {
            let parseTorrent = require("parse-torrent-name");
            let preferredTorrents = torrents.filter((item) => {
                if (item) {
                    if (item.download || item.magnet) {
                        let parsed = parseTorrent(item.title);
                        let title = item.title.toUpperCase();

                        if (item.download) {
                            item.magnet = item.download;
                            delete item.download;
                        }

                        if (
                            item.hasOwnProperty("seeds") ||
                            item.hasOwnProperty("peers")
                        ) {
                            item.seeders = item.seeds;
                            item.leechers = item.peers;
                            delete item.seeds;
                            delete item.peers;
                        }

                        item.title = `${parsed.title} ${
                            parsed.year ? `(${parsed.year})` : ""
                        } ${
                            parsed.group
                                ? parsed.group.match(/^\[.*?\]$/g)
                                    ? `${parsed.group}`
                                    : `(${parsed.group})`
                                : ""
                        }`;
                        item.videoQuality = parsed.videoQuality;
                        item.resolution = parsed.resolution;

                        item.health = Math.round(
                            item.leechers > 0
                                ? item.seeders / item.leechers
                                : item.seeders
                        );

                        return (
                            title.match(
                                /^(?=.*(1080|720|HD|YIFY))(?!.*(3D|HDTS|HDTC|HD\.TS|HD\.TC|HD\-TS|HD\-TC|CAM))/g
                            ) ||
                            item.magnet.toUpperCase().match(/^(?=.*(DVDRIP))/g)
                        );
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
                this.state.client.torrents[0].resume();
            }
        }
        this.setState({ paused });
    };

    setPlayerTime = (time) => {
        this.setState({ time });
    };

    saveLastLeftOff = (time) => {
        clearTimeout(this.saveLastLeftOffTimeout);
        this.saveLastLeftOffTimeout = setTimeout(() => {
            this.updateMovieTime(time);
        }, 400);
    };

    updateMovieTimeWithCurrentTime = () => {
        let { currentTime } = this.state;
        this.updateMovieTime(currentTime);
    };

    startAutoSaveInterval = () => {
        console.log("Setting auto-save interval.");
        let ms = 1000 * 30;
        this.autoSaveInterval = accurateInterval(
            this.updateMovieTimeWithCurrentTime,
            ms
        );
    };

    clearAutoSaveInterval = () => {
        console.log("Clearing auto-save interval");
        if (this.autoSaveInterval) this.autoSaveInterval.clear();
        this.autoSaveInterval = false;
    };

    handleVideo = (e) => {
        let video = e.currentTarget;
        let { duration, currentTime, paused } = video;
        if (duration) {
            let value = this.state.live ? 100 : (100 / duration) * currentTime,
                formatted = duration - currentTime;
            let time = this.state.live ? "LIVE" : this.formatTime(formatted);
            let colorStop = this.state.seekValue / 100;

            this.setColorStop(colorStop);

            if (!this.state.isStreaming) this.startStreaming();
            this.setPlayerTime(time);
            this.setCurrentTime(currentTime);
            this.setSeekValue(value);
            this.saveLastLeftOff(currentTime);
        }
        this.togglePause(paused);
    };

    setMovieTime = () => {
        let movie = this.getCurrentMovie();
        let clone = this.getClone(this.state.movieTimeArray);
        let movieMatch = this.returnCorrectMovie(clone, movie);

        if (movieMatch) {
            if (movieMatch.currentTime) {
                console.log("User left off at:", movieMatch.currentTime);
                this.setStartTime(movieMatch.currentTime);
            }

            let recentlyPlayed = this.getClone(this.state.recentlyPlayed);
            this.setState({ recentlyPlayed });
        }
    };

    openBackup = () => {
        this.setState({ backupIsOpen: true });
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
        this.clearAccurateInterval(this.fileStart);
        this.clearAccurateInterval(this.fileLoadedTimeout);

        this.setDownloadPercent();
        this.setDownloadSpeed();
        this.setFileLoaded(0);
        this.setSubtitleOptions([]);

        if (!type) {
            message =
                "Ooops, we dropped the ball. Please try a different torrent.";
        } else if (type === 1) {
            message = `We can't find Kevin`;
        } else if (type === 2) {
            message = "Stop littering";
        }

        this.removeTorrents().then(() => {
            this.setVideoIndex();
            this.setPlayerLoading(false);
        });

        this.closeServer();
        this.setPlayerStatus(message);
        this.showBackup();
    };

    startWebTorrent = () => {
        let WebTorrent = require("webtorrent");
        this.setState(
            {
                client: new WebTorrent({ maxConn: 150 }),
            },
            () => {
                this.state.client.on("error", () => {
                    this.applyTimeout();
                });
            }
        );
    };

    removeTorrents = () => {
        return new Promise((resolve, reject) => {
            let promises = [];

            for (let i = 0; i < this.state.client.torrents.length; i++) {
                let torrent = this.state.client.torrents[i];
                let promise = this.state.client.remove(torrent);

                promises.push(promise);
            }

            Promise.all(promises)
                .then(() => resolve("Torrents removed."))
                .catch((err) => reject(err));
        }).catch((err) => console.log(err));
    };

    setVideoError = (error) => {
        this.setState({ error });
    };

    startStreaming = () => {
        this.setStreaming(true);
        clearTimeout(this.streamTimeout);
        this.setPlayerLoading(false);
        this.setPlayerStatus(
            `We've found a reason for your meaningless existence`
        ).then(() => {
            this.setPlayerStatus(false);
        });
    };

    setDownloadPercent = (downloadPercent) => {
        this.setState({ downloadPercent });
    };

    setDownloadSpeed = (downloadSpeed) => {
        this.setState({ downloadSpeed });
    };

    fetchFirstPieces = (torrent, file) => {
        return new Promise((resolve) => {
            this.setStreamTimeout(60000);

            let torrentLength = torrent.length,
                fileOffset = file.offset,
                fileSize = file.length;

            let startPiece = torrentLength / fileOffset,
                endPiece = file._endPiece,
                lengthToDownload = 1000 * 5000,
                lastPieceToDownload = endPiece * (lengthToDownload / fileSize);

            torrent.critical(startPiece, lastPieceToDownload);

            this.fileStart = accurateInterval(
                () => {
                    let percent = Math.floor(
                        (file.downloaded / lengthToDownload) * 100
                    );
                    let speed = Math.floor(
                        this.state.client.downloadSpeed / 1000
                    );

                    if (percent > 100) {
                        this.setDownloadSpeed(0);
                        this.setDownloadPercent();
                        clearTimeout(this.streamTimeout);
                        this.clearAccurateInterval(this.fileStart);
                        resolve();
                    } else {
                        this.setDownloadSpeed(speed);
                        this.setDownloadPercent(percent);
                    }
                },
                100,
                { aligned: true, immediate: true }
            );
        });
    };

    setStreamTimeout = (ms) => {
        clearTimeout(this.streamTimeout);
        this.streamTimeout = setTimeout(
            () => {
                if (
                    this.state.time === "00:00:00" &&
                    (this.state.downloadPercent < 35 ||
                        !this.state.downloadPercent)
                ) {
                    this.applyTimeout();
                }
            },
            ms ? ms : 15000
        );
    };

    clearAccurateInterval = (interval) => {
        if (interval) {
            interval.clear();
        }
    };

    setFileLoadedTimeout = () => {
        this.clearAccurateInterval(this.fileLoadedTimeout);
        this.fileLoadedTimeout = accurateInterval(
            () => {
                let file =
                    this.state.client.torrents[0].files[this.state.videoIndex];

                if (file && file.downloaded !== file.length) {
                    let loaded = (file.downloaded / file.length) * 100;
                    this.setFileLoaded(loaded);
                }
            },
            100,
            { aligned: true, immediate: true }
        );
    };

    toVTT = (string) => {
        return (
            string
                .replace(/\{\\([ibu])\}/g, "</$1>")
                .replace(/\{\\([ibu])1\}/g, "<$1>")
                .replace(/\{([ibu])\}/g, "<$1>")
                .replace(/\{\/([ibu])\}/g, "</$1>")
                .replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, "$1.$2")
                .replace(/\r\n\{\\an8\}/g, " line:5%\r\n") + "\r\n\r\n"
        );
    };

    getBufferAsText = (buffer) => {
        return buffer.toString();
    };

    getVttURL = (bufferText) => {
        let text = this.toVTT(bufferText);
        let vttString = "WEBVTT FILE\r\n\r\n";
        let blobText = vttString.concat(text);
        let blob = new Blob([blobText], { type: "text/vtt" });
        return URL.createObjectURL(blob);
    };

    getBuffer = (file) => {
        return new Promise((resolve) => {
            if (file.data) {
                resolve(file.data);
            } else {
                file.getBuffer((err, buffer) => {
                    if (!err) {
                        resolve(buffer);
                    } else {
                        resolve(err);
                    }
                });
            }
        });
    };

    getFileComplete = (file) => {
        return this.getBuffer(file).then((buffer) => {
            if (typeof buffer === "object") {
                let text = this.getBufferAsText(buffer);
                let src = this.getVttURL(text);
                let fileClone = this.getObjectClone(file);

                if (fileClone.data) {
                    fileClone.data = false;
                }

                return {
                    ...fileClone,
                    src,
                };
            } else {
                return false;
            }
        });
    };

    sanitizeSubtitles = (arrayOfSubtitles) => {
        let promises = [];

        for (let i = 0; i < arrayOfSubtitles.length; i++) {
            let fileObject = arrayOfSubtitles[i];
            if (fileObject) {
                let promise = this.getFileComplete(fileObject);
                promises.push(promise);
            }
        }

        return Promise.all(promises).then((subtitleOptions) => {
            return subtitleOptions;
        });
    };

    getSubtitles = async () => {
        let movie = this.getCurrentMovie();
        let { title, release_date } = movie;
        let subtitleSearch = new SubtitleSearch();
        let subtitles = await subtitleSearch.search(title, release_date);
        return await this.sanitizeSubtitles(subtitles);
    };

    initSubtitles = async () => {
        let subtitles = await this.getSubtitles();
        this.setSubtitleOptions(subtitles);
    };

    getFileExtension = (file) => {
        let { name } = file;
        return name.substring(name.lastIndexOf(".") + 1, name.length);
    };

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

        this.clearAccurateInterval(this.fileStart);

        this.setStreamTimeout();

        let currentMovie = this.getCurrentMovie();

        if (currentMovie) {
            let torrent = this.state.client.add(magnet);

            torrent.on("metadata", () => {
                this.setStreamTimeout(25000);
                this.setPlayerStatus("Configuring the DeLorean", true);
            });

            torrent.on("ready", () => {
                this.setFileLoadedTimeout();
                this.setPlayerStatus(
                    "Retrieving from the owl postal service",
                    true
                );
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
                    "mov",
                ];

                let filtered = torrent.files.filter((file) => {
                    let extension = this.getFileExtension(file);

                    if (videoFormats.indexOf(extension) > -1) {
                        return file;
                    }
                });

                filtered.sort((a, b) => {
                    return b.length - a.length;
                });

                this.initSubtitles();

                let file = filtered[0];
                let fileIndex = torrent.files.findIndex((item) => {
                    if (file) {
                        return file.path === item.path;
                    }
                });

                if (!file) {
                    this.applyTimeout(1);
                } else if (!currentMovie) {
                    this.removeTorrents();
                } else if (file && currentMovie) {
                    file.select();

                    this.closeServer();
                    this.server = new VideoStream(torrent, file);
                    this.server.setCallback(this.refreshVideoStream);
                    this.setLive(this.server.shouldBeStreamed());

                    this.fetchFirstPieces(torrent, file).then(() => {
                        this.setStreamTimeout(60000);
                        this.setPlayerStatus("Logging into the OASIS", true);
                        this.toggleIntro(true).then(() => {
                            this.setMovieTime();
                            this.setVideoIndex(fileIndex);
                            this.setReadyToStream(true);
                        });
                    });
                }
            });
        } else {
            this.destroyClient();
        }
    };

    setLive = (live) => {
        this.setState({ live });
    };

    setReadyToStream = (readyToStream) => {
        this.setState({ readyToStream });
    };

    refreshVideoStream = () => {
        this.setState({ currentVideoStream: true }, () => {
            this.setState({ currentVideoStream: false }, () => {
                this.setState({ currentVideoStream: true });
            });
        });
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
            if (releaseDate) {
                let year = Number(releaseDate.substring(0, 4));
                let month = Number(releaseDate.substring(6, 7));

                let currentDate = new Date();
                currentDate = {
                    year: currentDate.getFullYear(),
                    month: currentDate.getMonth() + 1,
                };

                return (
                    movie.backdrop_path !== null &&
                    year <= currentDate.year &&
                    (year === currentDate.year
                        ? month < currentDate.month - 1
                        : true) &&
                    movie.popularity > 2 &&
                    movie.vote_average > 4
                );
            }
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
                            : query
                    }"`}
                </div>
            </Fade>
        );

        this.setSearch(emptyContent);
    };

    setSearch = (searchContent) => {
        this.setState({ searchContent });
    };

    setOffline = (isOffline) => {
        this.setLoadingContent(false);
        this.setState({ isOffline });
    };

    setLoadingContent = (isLoading) => {
        this.setState({ isLoading });
    };

    fetchContent = (url, noThrottle, finishLoading, hideLoading) => {
        return new Promise((resolve, reject) => {
            let ms = noThrottle ? 0 : 500;
            if (!hideLoading) {
                this.setLoadingContent(true);
            }

            setTimeout(() => {
                request
                    .get(url)
                    .then((response) => {
                        if (finishLoading) {
                            this.setLoadingContent();
                        }
                        resolve(response.data);
                    })
                    .catch((err) => {
                        if (finishLoading) {
                            this.setLoadingContent();
                        }
                        reject(err);
                    });
            }, ms);
        });
    };

    searchMovies = () => {
        let query = this.state.inputValue;

        if (query === "") {
            this.closeSearch();
        } else {
            let searchResults = [];
            for (let u = 1; u < 5; u++) {
                let url = `https://api.themoviedb.org/3/search/multi?api_key=${this.state.apiKey}&query=${query}&page=${u}&include_adult=false`;

                let promise = new Promise((resolve, reject) => {
                    this.fetchContent(url)
                        .then((response) => {
                            let results = this.extractMovies(
                                response,
                                false,
                                true
                            );
                            resolve(results);
                        })
                        .catch((err) => reject(err));
                }).catch((err) => console.log(err));

                searchResults.push(promise);
            }

            Promise.all(searchResults)
                .then((results) => {
                    this.setOffline();
                    results = this.mergeArrayofArrays(results);

                    if (results) {
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
                .catch(() => this.setOffline(true));
        }
    };

    initMovie = (movie) => {
        this.setState({
            playerLoading: true,
            currentMovie: movie,
            time: "00:00:00",
            paused: true,
        });
    };

    prepareMovieTitle = (title) => {
        return title
            .replace(/[^a-zA-Z0-9\s\-]/g, "")
            .replace(/-/g, " ")
            .toLowerCase();
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
        this.setState({ playerLoading });
    };

    setVideoIndex = (videoIndex) => {
        return new Promise((resolve) => {
            this.setState(
                {
                    videoIndex,
                },
                () => {
                    resolve();
                }
            );
        });
    };

    resetVideo = () => {
        this.setPlayerLoading(true);
        this.setVideoIndex();
        this.setVideoError();
    };

    closeServer = () => {
        if (this.server) {
            this.server.destroy();
        }
    };

    getMovieDate = (movie) => {
        let isSeries = this.isSeries(movie);
        let date = isSeries ? movie.show.release_date : movie.release_date;
        return date.substring(0, 4);
    };

    getQualityinProgressive = () => {
        let selected = this.state.videoQuality;
        return selected === "HD" ? "720p" : "1080p";
    };

    getQualityTorrent = (torrents) => {
        let clone = this.getClone(torrents);
        let videoQuality = this.getQualityinProgressive();

        let torrent = clone.find((item) => {
            if (item.resolution || item.videoQuality) {
                if (
                    item.resolution === videoQuality ||
                    item.videoQuality === videoQuality
                ) {
                    if (
                        item.title.indexOf("YIFY") > -1 ||
                        item.title.indexOf("eztv") > -1
                    ) {
                        return item;
                    }
                }
            }
        });

        torrent = torrent
            ? torrent
            : clone.find((item) => {
                  if (item.resolution || item.videoQuality) {
                      if (
                          item.resolution === videoQuality ||
                          item.videoQuality === videoQuality
                      ) {
                          return item;
                      }
                  }
              });

        return torrent ? torrent : clone[0];
    };

    getMovieTypeData = (movie) => {
        let isSeries = this.isSeries(movie);
        return {
            id: isSeries ? (movie.show ? movie.show.id : movie.id) : movie.id,
            urlParams: {
                type: isSeries ? "tv" : "movie",
                season: isSeries ? movie.season_number : false,
                episode: isSeries ? movie.episode_number : false,
                appendToResponse: isSeries
                    ? "&append_to_response=external_ids"
                    : "",
            },
        };
    };

    extractIDFromData = (movie, data) => {
        let isSeries = this.isSeries(movie);
        return isSeries ? data.external_ids.imdb_id : data.imdb_id;
    };

    getIMDBID = (movie) => {
        let movieData = this.getMovieTypeData(movie);
        console.log(movieData);
        let url = `https://api.themoviedb.org/3/${movieData.urlParams.type}/${movieData.id}?api_key=${this.state.apiKey}${movieData.urlParams.appendToResponse}`;

        console.log("Getting IMDB ID", url);
        return this.fetchContent(url, false, true).then((data) => {
            let id = this.extractIDFromData(movie, data);
            console.log(`IMDB ID is: ${id}`);
            return id;
        });
    };

    findEpisode = (arr, correspondingItem) => {
        let season = correspondingItem.season_number,
            episode = correspondingItem.episode_number;
        console.log(arr);
        console.log(season, episode);
        let found = arr.find((item) => {
            return item.episode === episode && item.season === season;
        });

        console.log("Episode found:", found);
        return found;
    };

    getPopcornSource = (popcornData, movie) => {
        let isSeries = this.isSeries(movie);
        let { episodes } = popcornData;
        return {
            lang: isSeries ? false : "en",
            path: isSeries ? this.findEpisode(episodes, movie) : popcornData,
        };
    };

    fetchFromPopcorn = (id, movie) => {
        let isSeries = this.isSeries(movie),
            type = isSeries ? "show" : "movie",
            url = `https://popcorn-ru.tk/${type}/${id}`;

        return this.fetchContent(url)
            .then((data) => {
                this.setLoadingContent();
                return data;
            })
            .catch(() => {
                this.setLoadingContent();
            });
    };

    getVideoQualities = () => {
        let videoQuality = this.getQualityinProgressive();
        return [videoQuality, "1080p", "720p", "480p", "360p", "240p", "180p"];
    };

    checkPopcornPath = (source, quality) => {
        let { path, lang } = source;
        let url = false;
        if (path) {
            let commonPath = path.torrents;

            try {
                url = lang
                    ? commonPath[lang][quality].url
                    : commonPath[quality].url;
            } catch (err) {
                console.log(err);
            }
        }

        return url;
    };

    getPopcornMagnet = (source) => {
        let qualityArray = this.getVideoQualities();
        for (let i = 0; i < qualityArray.length - 1; i++) {
            let quality = qualityArray[i];
            let url = this.checkPopcornPath(source, quality);
            if (url) {
                return url;
            }
        }

        return false;
    };

    getPopcornTorrent = (id, movie) => {
        return this.fetchFromPopcorn(id, movie).then((popcorn) => {
            let source = this.getPopcornSource(popcorn, movie);
            let magnet = this.getPopcornMagnet(source);
            console.log("Chosen magnet", magnet);
            if (!magnet) return;
            return {
                magnet,
            };
        });
    };

    hasMagnet = (movie) => {
        return movie.magnet;
    };

    getSearchQuery = (movie, excludeDate) => {
        let title = this.prepareMovieTitle(movie.title),
            date = this.getMovieDate(movie),
            isSeries = this.isSeries(movie);

        return isSeries ? movie.query : `${title} ${excludeDate ? "" : date}`;
    };

    getMovieTitle = (movie) => {
        return movie.title;
    };

    mergeArrayofArrays = (arr) => {
        return [].concat.apply([], arr);
    };

    constructUrlWithParams = (baseUrl, params) => {
        let url = baseUrl + "/";
        let count = 0;
        for (let key in params) {
            let item = params[key];
            url += `${count ? "&" : "?"}${key}=${item}`;
            count += 1;
        }
        return url;
    };

    preparePremiumQueryUrl = (movie, quality, endpoint, seriesData) => {
        let date = this.getMovieDate(movie);
        let isSeries = this.isSeries(movie);
        let params = {
            title: `${isSeries ? movie.show.title : movie.title} (${date})`,
            user: this.state.user.email,
            ...seriesData,
        };
        if (quality) params.quality = quality;
        return this.constructUrlWithParams(
            `https://flixerrtv.com/api/${endpoint}`,
            params
        );
    };

    checkUserPremiumAvailability = async () => {
        if (!this.state.user) return null;
        let url = `https://flixerrtv.com/api/user-has-premium/?user=${this.state.user.email}`;
        let isPremiumUser = (await request.get(url)).data;
        console.log(`${this.state.user.email} is premium: ${isPremiumUser}`);
        return isPremiumUser;
    };

    checkMoviePremiumAvailability = async (movie) => {
        let url = this.preparePremiumQueryUrl(movie, false, "content-exists");
        let exists = await request.get(url);
        console.log(`${movie.title} exists in premium:`, exists.data);
        return exists.data;
    };

    streamPremium = async (movie) => {
        let isSeries = this.isSeries(movie);
        let url = this.preparePremiumQueryUrl(
            movie,
            isSeries ? false : "1080",
            "content",
            isSeries
                ? {
                      season: movie.season_number,
                      episode: movie.episode_number_formatted,
                  }
                : null
        );
        this.setStreaming();
        this.setStreamTimeout(20000);
        this.setPlayerStatus("Fetching movie from a magical place", true);

        await this.toggleIntro(true);
        this.setMovieTime();
        this.setVideoIndex(url);
        this.setReadyToStream(true);
    };

    searchTorrent = (movie, excludeDate) => {
        let isSeries = this.isSeries(movie),
            hasMagnet = this.hasMagnet(movie);
        this.resetVideo();

        this.closeServer();
        this.removeTorrents().then(async () => {
            let query = this.getSearchQuery(movie, excludeDate);
            let isPremium = this.state.isPremiumUser
                ? await this.checkMoviePremiumAvailability(movie)
                : false;
            if (isPremium) {
                this.streamPremium(movie);
            } else if (hasMagnet) {
                this.streamTorrent(movie);
            } else {
                let currentMovie = this.getCurrentMovie();
                if (currentMovie) {
                    let title = this.getMovieTitle(movie);

                    this.setPlayerStatus(
                        `Searching the entire universe for "${title}"`,
                        true
                    );

                    this.getIMDBID(movie)
                        .then((id) => {
                            return this.getPopcornTorrent(id, movie);
                        })
                        .then((torrent) => {
                            if (torrent) {
                                this.changeCurrentMagnet(torrent.magnet);
                                this.updateMovieTimeArray(movie, true);
                                this.streamTorrent(torrent);
                            } else {
                                throw new Error(
                                    "Couldn't find a torrent with Popcorn API."
                                );
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            if (err) {
                                let movieData = this.getMovieTypeData(movie);
                                let publicSearch = this.publicSearch
                                    .search(
                                        ["1337x", "Rarbg"],
                                        query,
                                        movieData.urlParams.type,
                                        20
                                    )
                                    .catch((err) => {
                                        console.log(err);
                                    });

                                let proprietarySearch = this.torrentSearch
                                    .searchTorrents(query, isSeries)
                                    .catch((err) => {
                                        console.log(err);
                                    });

                                Promise.all([publicSearch, proprietarySearch])
                                    .then((data) => {
                                        console.log(data);
                                        data = this.mergeArrayofArrays(data);

                                        if (data[0]) {
                                            if (
                                                (data[0].message ||
                                                    typeof data[0] ===
                                                        "string") &&
                                                data.length <= 2
                                            ) {
                                                this.searchTorrent(movie, true);
                                            } else {
                                                let magnetPromises = [];
                                                for (
                                                    let n = 0;
                                                    n < data.length;
                                                    n++
                                                ) {
                                                    let magnetTorrent = data[n];
                                                    if (magnetTorrent) {
                                                        if (
                                                            magnetTorrent.desc
                                                        ) {
                                                            let promise =
                                                                this.torrentSearch.getMagnetFromLink(
                                                                    magnetTorrent
                                                                );
                                                            magnetPromises.push(
                                                                promise
                                                            );
                                                        }
                                                    }
                                                }

                                                Promise.all(magnetPromises)
                                                    .then((results) => {
                                                        results = [
                                                            ...results,
                                                            ...data,
                                                        ];

                                                        let cleanResults =
                                                            results.filter(
                                                                (torrent) => {
                                                                    if (
                                                                        torrent
                                                                    ) {
                                                                        return torrent.magnet;
                                                                    }
                                                                }
                                                            );

                                                        if (
                                                            cleanResults.length
                                                        ) {
                                                            this.getPreferredTorrents(
                                                                cleanResults
                                                            ).then(
                                                                (torrents) => {
                                                                    let torrent =
                                                                        this.getQualityTorrent(
                                                                            torrents
                                                                        );
                                                                    if (
                                                                        torrent
                                                                    ) {
                                                                        if (
                                                                            currentMovie
                                                                        ) {
                                                                            let movie =
                                                                                this.getObjectClone(
                                                                                    currentMovie
                                                                                );
                                                                            movie.preferredTorrents =
                                                                                torrents;
                                                                            this.setCurrentMovie(
                                                                                movie,
                                                                                () => {
                                                                                    this.changeCurrentMagnet(
                                                                                        torrent.magnet
                                                                                    );
                                                                                    this.updateMovieTimeArray(
                                                                                        movie,
                                                                                        true
                                                                                    );
                                                                                    this.streamTorrent(
                                                                                        torrent
                                                                                    );
                                                                                }
                                                                            );
                                                                        }
                                                                    } else {
                                                                        this.applyTimeout(
                                                                            1
                                                                        );
                                                                    }
                                                                }
                                                            );
                                                        } else {
                                                            this.applyTimeout();
                                                        }
                                                    })
                                                    .catch((err) =>
                                                        console.log(err)
                                                    );
                                            }
                                        } else {
                                            this.applyTimeout(1);
                                        }
                                    })
                                    .catch((err) => console.log(err));
                            }
                        });
                }
            }
        });
    };

    isSeries = (movie) => {
        if (movie) {
            let isSeriesOrEpisode = movie.isSeries || movie.show;
            if (isSeriesOrEpisode) {
                return true;
            }
        }

        return false;
    };

    playMovie = (movie) => {
        let updated = this.updateMovieWithStoredInfo(movie);
        let isSeries = this.isSeries(updated);
        this.initMovie(updated);
        this.toggleBox(isSeries).then(() => {
            this.searchTorrent(updated);
            this.addToRecentlyPlayed(updated);
        });
    };

    destroyClient = (backUp) => {
        return new Promise((resolve) => {
            clearTimeout(this.streamTimeout);
            this.clearAccurateInterval(this.fileStart);
            this.clearAccurateInterval(this.fileLoadedTimeout);

            if (this.state.client) {
                let currentMovie = this.getCurrentMovie();
                let movie = backUp ? this.getObjectClone(currentMovie) : false;
                this.setState(
                    {
                        currentMovie: movie,
                        startTime: backUp ? this.state.startTime : false,
                        readyToStream: false,
                        currentVideoStream: false,
                        videoIndex: false,
                        videoElement: false,
                        downloadPercent: false,
                        isStreaming: false,
                        paused: true,
                        playerLoading: !!backUp,
                        subtitleOptions: [],
                        showIntro: false,
                    },
                    () => {
                        this.closeServer();

                        setTimeout(() => {
                            if (backUp) {
                                this.removeTorrents().then(() => {
                                    resolve();
                                });
                            } else {
                                resolve();
                            }
                        }, 250);
                    }
                );
            }
        }).catch((err) => console.log(err));
    };

    setFullScreen = (full) => {
        let browserWindow = require("electron").remote.getCurrentWindow();

        if (full === undefined) {
            full = false;
        }
        browserWindow.setFullScreen(full);
    };

    setMovieTimeArray = (newArray) => {
        this.setState(
            (prevState) => {
                let canSetTime =
                    prevState.movieTimeArray !== this.state.movieTimeArray ||
                    newArray;

                if (canSetTime) {
                    return {
                        movieTimeArray: this.setPropertyOrDefault(
                            newArray,
                            this.state.movieTimeArray
                        ),
                    };
                }
            },
            () => {
                this.setStorage("movieTimeArray");
            }
        );
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
                magnet: this.currentMagnet,
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

    getCurrentMovie = () => {
        return this.state.currentMovie;
    };

    setCurrentMovie = (currentMovie, callback) => {
        this.setState({ currentMovie }, () => {
            if (callback) {
                callback();
            }
        });
    };

    updateMovieTime = (time, callback) => {
        let movie = this.getCurrentMovie();
        if (movie) {
            if (time) {
                console.log("Updating movie time to:", time);
                let clone = this.getObjectClone(movie);
                clone.currentTime = time;
                this.setCurrentMovie(clone);
                this.updateMovieTimeArray(clone);
            } else {
                if (callback) callback();
            }
        }
    };

    removeClient = (time) => {
        if (time) this.updateMovieTime(time);
        this.clearAutoSaveInterval();
        this.setState(
            {
                error: false,
                playerStatus: false,
            },
            () => {
                this.destroyClient()
                    .then(() => {
                        return this.removeTorrents();
                    })
                    .then((result) => {
                        console.log(result);
                    });
            }
        );
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

    updateMovieWithStoredInfo = (movie) => {
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
        this.setState({ movieCurrent: movie });
    };

    toggleBox = (active) => {
        return new Promise((resolve) => {
            this.setState(
                {
                    showBox: active,
                },
                () => {
                    setTimeout(resolve, 250);
                }
            );
        });
    };

    closeBackdrop = () => {
        this.toggleBox();
    };

    getDateForURL = (n, justYear) => {
        let date = new Date(),
            year = date.getFullYear(),
            month =
                date.getMonth() < 9
                    ? "0" + (date.getMonth() + 1)
                    : date.getMonth() + 1,
            day =
                date.getDate().toString().length < 2
                    ? "0" + date.getDate()
                    : date.getDate();

        if (justYear) {
            return year - n;
        }
        return `${year - n}-${month}-${day}`;
    };

    setFeatured = (featured) => {
        this.setState({ featured });
    };

    getFeatured = () => {
        let url = `https://api.themoviedb.org/3/discover/movie?api_key=${
            this.state.apiKey
        }&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&release_date.lte=${this.getDateForURL(
            1
        )}`;
        return new Promise((resolve, reject) => {
            this.fetchContent(url)
                .then((response) => {
                    resolve(response);
                })
                .catch((err) => reject(err));
        });
    };

    loadFeatured = () => {
        this.getFeatured()
            .then((results) => {
                this.setOffline();
                let featured = this.extractMovies(results, false, true);
                this.setFeatured(featured);
            })
            .catch(() => this.setOffline(true));
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

    setMovieItemProperties = (item) => {
        item.title = item.name ? item.name : item.title;
        item.isNetflix = !!item.imdb_rating;
        item.isSeries = !!item.first_air_date;
        item.vote_average = item.imdb_rating
            ? item.imdb_rating
            : item.vote_average;
        item.release_date = item.released_on
            ? item.released_on
            : item.first_air_date
            ? item.first_air_date
            : item.release_date;

        return item;
    };

    getMovieItemProperties = () => {
        return [
            "title",
            "id",
            "rg_id",
            "overview",
            "vote_average",
            "poster_path",
            "backdrop_path",
            "release_date",
            "isNetflix",
            "isSeries",
            "popularity",
        ];
    };

    cleanMovieItem = (item) => {
        let properties = this.getMovieItemProperties(),
            cleaned = {};

        for (let property in item) {
            if (properties.indexOf(property) > -1) {
                cleaned[property] = item[property];
            }
        }

        return cleaned;
    };

    sanitizeMovie = (movie) => {
        let item = this.getObjectClone(movie),
            updated = this.setMovieItemProperties(item);
        return this.cleanMovieItem(updated);
    };

    getNetflixReponse = (response) => {
        return response.substring(
            response.indexOf('"entities"'),
            response.indexOf('"meta"')
        );
    };

    getNetflixJSON = (extracted) => {
        let data = extracted.substring(0, extracted.length - 1);
        return JSON.parse(`{${data}}}`).entities.entries;
    };

    extractNetflixMovies = (response) => {
        let extracted = this.getNetflixReponse(response);
        let netflixData = this.getNetflixJSON(extracted);
        let array = [];

        Object.keys(netflixData).map((object, index) => {
            let item = netflixData[object];
            let movie = this.sanitizeMovie(item);
            let { rg_id } = movie;

            movie.flixerr_data = {
                poster_path: `https://img.reelgood.com/content/movie/${rg_id}/poster-780.jpg`,
                backdrop_path: `https://img.reelgood.com/content/movie/${rg_id}/backdrop-1280.jpg`,
                blurry_poster_path: `https://img.reelgood.com/content/movie/${rg_id}/poster-92.jpg`,
                blurry_backdrop_path: `https://img.reelgood.com/content/movie/${rg_id}/backdrop-92.jpg`,
            };

            array[index] = movie;
        });

        return this.shuffleArray(array);
    };

    extractMovies = (response, data, shuffle) => {
        let movies = data ? data : response.results;

        let sanitized = [];
        for (let i = 0; i < movies.length; i++) {
            let item = movies[i];
            let movie = this.sanitizeMovie(item);
            let { backdrop_path, poster_path } = movie;
            if (movie.backdrop_path) {
                movie.flixerr_data = {
                    poster_path: `https://image.tmdb.org/t/p/w780${poster_path}`,
                    backdrop_path: `https://image.tmdb.org/t/p/original${backdrop_path}`,
                    series_backdrop_path: `https://image.tmdb.org/t/p/w780${backdrop_path}`,
                    blurry_poster_path: `https://image.tmdb.org/t/p/w92${poster_path}`,
                    blurry_backdrop_path: `https://image.tmdb.org/t/p/w300${backdrop_path}`,
                };
                sanitized.push(movie);
            }
        }

        return shuffle ? this.shuffleArray(sanitized) : sanitized;
    };

    createGenreComplete = (genre, genreID, movieData) => {
        let genreComplete = {
            name: genre,
            genreID: genreID,
        };

        return this.setGenreCompleteMovies(genreID, genreComplete, movieData);
    };

    setGenreCompleteMovies = (genreID, genreComplete, movieData) => {
        let isNetflixCategory = genreID === 21;

        genreComplete.movies = isNetflixCategory
            ? this.extractNetflixMovies(movieData)
            : this.extractMovies(movieData, false, true);

        return genreComplete;
    };

    getRandomGenrePageNumber = () => {
        let { genrePages } = this.state;
        return Math.floor(Math.random() * genrePages) + 1;
    };

    getMovieFetchURL = (genreID, isSeries) => {
        let { apiKey } = this.state;
        let page = this.getRandomGenrePageNumber(),
            type = isSeries ? "tv" : "movie",
            isNetflix = genreID === 21,
            primaryRelease = isSeries
                ? ""
                : `&primary_release_date.lte=${this.getDateForURL(1)}`;
        return isNetflix
            ? "https://reelgood.com/movies/source/netflix?filter-sort=1"
            : `https://api.themoviedb.org/3/discover/${type}?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&timezone=America%2FNew_York&with_genres=${genreID}&with_original_language=en${primaryRelease}`;
    };

    getMovies = (genre, genreID, isSeries) => {
        let url = this.getMovieFetchURL(genreID, isSeries);
        return new Promise((resolve, reject) => {
            this.fetchContent(url)
                .then((movieData) => {
                    let genreComplete = this.createGenreComplete(
                        genre,
                        genreID,
                        movieData
                    );
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

        return this.mergeArrayofArrays(results);
    };

    getRecommended = (url) => {
        return new Promise((resolve) => {
            this.fetchContent(url, false, false, true)
                .then((response) => {
                    resolve(response.results.slice(0, 5));
                })
                .catch((err) => resolve(err));
        });
    };

    existsAndHasData = (arr) => {
        if (arr) {
            if (arr.length) {
                return true;
            }
        }
        return false;
    };

    getCollection = (data) => {
        const favorites = this.chooseRandom(
            data ? data.favorites : this.state.favorites,
            5
        );
        const recents = this.chooseRandom(
            data ? data.recentlyPlayed : this.state.recentlyPlayed,
            5
        );
        return favorites.concat(recents);
    };

    getRandom = (min, max) => {
        return Math.random() * (max - min) + min;
    };

    getRecommendedURL = (movie) => {
        let isSeries = this.isSeries(movie),
            movieData = this.getMovieTypeData(movie),
            page = this.getRandom(1, 3);

        let url = `https://api.themoviedb.org/3/${movieData.urlParams.type}/${
            movie.id
        }/recommendations?api_key=${
            this.state.apiKey
        }&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}${
            isSeries ? "" : `&primary_release_date.lte=${this.getDateForURL(1)}`
        }`;

        return movie.id ? url : "";
    };

    getArrayElements = (arr, n) => {
        if (arr) {
            if (arr.length > n) {
                arr = arr.slice(0, n);
                return arr;
            }
        }

        return arr;
    };

    getSuggested = (data) => {
        return new Promise((resolve, reject) => {
            let collection = this.getCollection(data);

            let promises = [];
            if (this.existsAndHasData(collection)) {
                for (let j = 0; j < collection.length - 1; j++) {
                    let movie = collection[j];
                    if (movie) {
                        let url = this.getRecommendedURL(movie);
                        let promise = this.getRecommended(url);

                        promises.push(promise);
                    }
                }

                Promise.all(promises)
                    .then((suggested) => {
                        let merged = this.mergeArrayofArrays(suggested),
                            stripped = this.stripDuplicateMovies(merged),
                            reduced = this.getArrayElements(stripped, 20),
                            clean = this.extractMovies(false, reduced, true);

                        resolve(clean);
                    })
                    .catch((err) => reject(err));
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
        this.getSuggested()
            .then((suggested) => {
                this.setState(
                    {
                        suggested,
                        isLoading: false,
                    },
                    () => {
                        if (this.usersRef) {
                            this.setBucket();
                        }
                    }
                );
            })
            .catch(() => {
                this.setLoadingContent(false);
            });
    };

    getClone = (array) => {
        return array ? [...array] : [];
    };

    addToFavorites = (movie) => {
        if (movie.show) {
            movie = movie.show;
        }

        let clone = this.getClone(this.state.favorites);
        clone.push(movie);
        this.setState(
            {
                favorites: clone,
            },
            () => {
                this.setStorage("favorites");
            }
        );
    };

    removeFromFavorites = (movie) => {
        if (movie.show) {
            movie = movie.show;
        }

        let clone = this.getClone(this.state.favorites);
        let index = this.returnCorrectMovie(clone, movie, true);

        clone.splice(index, 1);
        this.setState(
            {
                favorites: clone,
            },
            () => {
                this.setStorage("favorites");
            }
        );
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
            this.setState(
                {
                    recentlyPlayed: clone,
                },
                () => {
                    this.setStorage("recentlyPlayed");
                }
            );
        } else {
            let index = this.returnCorrectMovie(clone, movie, true);

            clone.splice(index, 1);
            clone.unshift(movie);
            this.setState(
                {
                    recentlyPlayed: clone,
                },
                () => {
                    this.setStorage("recentlyPlayed");
                }
            );
        }
    };

    setMovies = (movies) => {
        this.setState({ movies });
    };

    setShows = (shows) => {
        this.setState({ shows });
    };

    loadCategories = (shows) => {
        let movieGenres = require("./movie-genres");
        movieGenres = shows
            ? movieGenres.getTVCategories()
            : movieGenres.getCategories();

        let promiseArray = [];

        for (let j = 0; j < movieGenres.length; j++) {
            let promise = this.getMovies(
                movieGenres[j].name,
                movieGenres[j].id,
                shows
            );
            promiseArray.push(promise);
        }

        Promise.all(promiseArray)
            .then((data) => {
                this.setOffline();
                if (shows) {
                    this.setShows(data);
                } else {
                    this.setMovies(data);
                }
            })
            .catch(() => this.setOffline(true));
    };

    openMenu = () => {
        this.setState({ menuActive: true });
    };

    closeMenu = () => {
        this.setState({ menuActive: false });
    };

    toggleMenu = () => {
        this.setState((prevState) => {
            return {
                menuActive: !prevState.menuActive,
            };
        });
    };

    updateMenu = (active) => {
        this.closeMenu();
        this.closeSearch();
        this.setOffline();
        if (active !== undefined) {
            this.setState({ active });
        }
    };

    handleLogo = () => {
        this.setState({ logoLoaded: true });
    };

    loadLogo = () => {
        let tempImage = new Image();
        tempImage.onload = this.handleLogo;
        tempImage.src = "assets/img/icon.png";
    };

    requireTorrent = () => {
        this.publicSearch = require("torrent-search-api");
        this.publicSearch.enablePublicProviders();

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

    setCurrentAudienceCount = (currentAudienceCount) => {
        this.setState({ currentAudienceCount });
    };

    leaveAudience = (movie) => {
        let id = (movie.id || movie.rg_id).toString();
        let connection = firebase
            .database()
            .ref(`audiences/${id}/connections/${this.movieAudienceId}`);
        connection.remove();
    };

    initializeMovieAudience = async (movie) => {
        let id = (movie.id || movie.rg_id).toString();
        let connections = firebase
            .database()
            .ref(`audiences/${id}/connections`);
        let userId = this.state.user ? this.state.user.uid : uniqid();
        let userConnection = firebase
            .database()
            .ref(`audiences/${id}/connections/${userId}`);
        userConnection.onDisconnect().remove();
        userConnection.set(true);

        this.movieAudienceId = userId;
        connections.on("value", (snapshot) =>
            this.setCurrentAudienceCount(snapshot.numChildren())
        );
    };

    setCurrentChat = (currentChat) => {
        this.setState({ currentChat });
    };

    sendMovieMessage = async (movieId, message, username, color) => {
        let messageId = uniqid();
        let chatRef = this.firestoreDatabase
            .collection("messages")
            .doc(messageId);
        let time = new Date().getTime();
        let messageData = {
            id: messageId,
            text: message,
            from: this.state.user ? this.state.user.email : null,
            alias: username,
            createdOn: time,
            movieId,
            color,
        };
        if (message.trim().length) await chatRef.set(messageData);
    };

    initializeMovieChat = (movie) => {
        let id = (movie.id || movie.rg_id).toString();
        let query = this.firestoreDatabase
            .collection("messages")
            .where("movieId", "==", id);

        let observer = query.onSnapshot((snapshot) => {
            let chatsForThisMovie = [];
            snapshot.forEach((doc) => {
                chatsForThisMovie.push(doc.data());
            });
            chatsForThisMovie.sort((a, b) => a.createdOn - b.createdOn);
            this.setCurrentChat(chatsForThisMovie);
        });

        return observer;
    };

    startFireBase = () => {
        let firebaseConfig = {
            apiKey: "AIzaSyAOWT7w9hA8qsLY-KP7F14Qfv9vLjw3YJM",
            authDomain: "flixerr-5aeb8.firebaseapp.com",
            databaseURL: "https://flixerr-5aeb8.firebaseio.com",
            projectId: "flixerr-5aeb8",
            storageBucket: "flixerr-5aeb8.appspot.com",
            messagingSenderId: "58493893285",
            appId: "1:58493893285:web:b02990447eb9f16f",
        };

        firebase.initializeApp(firebaseConfig);

        firebase.auth().onAuthStateChanged((user) => {
            this.setState(
                (prevState) => {
                    if (prevState.user !== user) {
                        return { user };
                    }
                },
                async () => {
                    if (this.state.user === user) {
                        this.setEverything = true;
                        this.createDataBase();
                        // this.getBucket();
                        this.listenToBucket();
                    }
                    this.setUserCredentials();
                    let isPremiumUser =
                        await this.checkUserPremiumAvailability();
                    this.setState({ isPremiumUser });
                }
            );
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
        return new Promise((resolve) => {
            this.setState(
                {
                    favorites: [],
                    recentlyPlayed: [],
                    suggested: [],
                    movieTimeArray: [],
                    videoQuality: "HD",
                },
                () => {
                    resolve();
                }
            );
        });
    };

    handleErrorMessage = (error) => {
        let errorMessage = error.message;

        if (
            errorMessage ===
            "There is no user record corresponding to this identifier. The user may have been" +
                " deleted."
        ) {
            errorMessage = `We can't find a user associated with that email. Please try again.`;
        }
        this.setState({ loginError: errorMessage });
    };

    handleAccount = (create) => {
        let email = this.state.inputEmail,
            password = this.state.inputPass;

        if (!email.length && !password.length) {
            this.setState({ loginError: "Incorrect email or password." });
        } else {
            if (create) {
                firebase
                    .auth()
                    .createUserWithEmailAndPassword(email, password)
                    .then(() => {
                        this.resetData().then(() => {
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
        this.setState({ create: false, loginError: false, account: true });
    };

    openAccountCreation = () => {
        this.setState({ create: true, loginError: false, account: false });
    };

    closeAccount = () => {
        this.setState(
            {
                inputEmail: "",
                inputPass: "",
                account: false,
                create: false,
                loginError: false,
                isGuest: true,
            },
            () => {
                this.setUserCredentials();
            }
        );
    };

    closeBackup = () => {
        this.setState({ backupIsOpen: false });
    };

    signOut = () => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                this.usersRef = false;
                this.setStorage();
            })
            .catch((error) => {
                console.log(error);
            });
    };

    handleInput = (e) => {
        let value = e.target.value;
        let isEmail = value.match(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g
        );

        this.setState({
            [isEmail ? "inputEmail" : "inputPass"]: value,
            loginError: false,
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
        if (e.type === "offline") {
            this.setOffline(true);
        }
        if (e.type === "online") {
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
        this.setState({ headerBg });
    };

    showElementBasedOnValue = (value, element) => {
        if (value) return element;
        return "";
    };

    toggleDarkMode = () => {
        this.setState(
            (prevState) => {
                return {
                    darkMode: !prevState.darkMode,
                };
            },
            () => {
                this.setStorage("darkMode");
            }
        );
    };

    getSettings = () => {
        this.getStorage()
            .then(() => this.getUserCredentials())
            .catch((err) => console.log(err));
    };

    componentDidMount() {
        this.loadLogo();
        this.getSettings();
        this.loadFeatured();
        this.startWebTorrent();
        this.requireTorrent();
        window.addEventListener("online", this.handleConnectionChange);
        window.addEventListener("offline", this.handleConnectionChange);
    }

    render() {
        let {
            account,
            active,
            apiKey,
            backupIsOpen,
            colorStop,
            create,
            currentTime,
            darkMode,
            downloadPercent,
            downloadSpeed,
            error,
            favorites,
            featured,
            fileLoaded,
            genreInfo,
            headerBg,
            inputValue,
            isLoading,
            isOffline,
            isPremiumUser,
            isStreaming,
            loginError,
            logoLoaded,
            menuActive,
            movieCurrent,
            movies,
            paused,
            playerLoading,
            playerStatus,
            videoQuality,
            recentlyPlayed,
            searchContent,
            seekValue,
            showBox,
            showGenre,
            showIntro,
            shows,
            startTime,
            subtitleOptions,
            suggested,
            tempTime,
            time,
            trailer,
            user,
            videoIndex,
            appLoading,
        } = this.state;
        let currentMovie = this.getCurrentMovie();
        let menu = this.showElementBasedOnValue(
            menuActive,
            <Menu
                user={user}
                openAccount={this.openAccount}
                signOut={this.signOut}
                active={active}
                updateMenu={this.updateMenu}
                resetSearch={this.resetSearch}
            />
        );

        let movieBackDrop = this.showElementBasedOnValue(
            showBox,
            <div className="movie-container-bg" onClick={this.closeBackdrop} />
        );

        let movieModal = this.showElementBasedOnValue(
            showBox,
            <MovieModal
                apiKey={apiKey}
                movie={movieCurrent}
                favorites={favorites}
                playMovie={this.playMovie}
                isFavorite={this.isFavorite}
                addToFavorites={this.addToFavorites}
                removeFromFavorites={this.removeFromFavorites}
                setTrailer={this.setTrailer}
            />
        );

        let playerModal = this.showElementBasedOnValue(
            currentMovie,
            <Player
                currentChat={this.state.currentChat}
                currentAudienceCount={this.state.currentAudienceCount}
                initializeMovieChat={this.initializeMovieChat}
                initializeMovieAudience={this.initializeMovieAudience}
                leaveAudience={this.leaveAudience}
                sendMovieMessage={this.sendMovieMessage}
                startAutoSaveInterval={this.startAutoSaveInterval}
                subtitleOptions={subtitleOptions}
                fileLoaded={fileLoaded}
                currentVideoStream={this.state.currentVideoStream}
                readyToStream={this.state.readyToStream}
                setFileLoaded={this.setFileLoaded}
                showIntro={showIntro}
                toggleIntro={this.toggleIntro}
                downloadPercent={downloadPercent}
                downloadSpeed={downloadSpeed}
                startTime={startTime}
                isStreaming={isStreaming}
                changeCurrentMagnet={this.changeCurrentMagnet}
                resetClient={this.destroyClient}
                togglePause={this.togglePause}
                showBackup={this.showBackup}
                openBackup={backupIsOpen}
                closeBackup={this.closeBackup}
                streamTorrent={this.streamTorrent}
                searchTorrent={this.searchTorrent}
                time={time}
                tempTime={tempTime}
                currentTime={currentTime}
                setCurrentTime={this.setCurrentTime}
                colorStop={colorStop}
                setColorStop={this.setColorStop}
                videoIndex={videoIndex}
                paused={paused}
                removeClient={this.removeClient}
                setFullScreen={this.setFullScreen}
                movie={currentMovie}
                getCurrentMagnet={this.getCurrentMagnet}
                loading={playerLoading}
                setPlayerLoading={this.setPlayerLoading}
                setVideoElement={this.setVideoElement}
                playerStatus={playerStatus}
                error={error}
                handleVideo={this.handleVideo}
                setSeekValue={this.setSeekValue}
                seekValue={seekValue}
                updateMovieTime={this.updateMovieTime}
                user={this.state.user}
            />
        );

        let fullGenreContainer = this.showElementBasedOnValue(
            showGenre,
            <Genre
                getURLDate={this.getDateForURL}
                extractMovies={this.extractMovies}
                genreInfo={genreInfo}
                favorites={favorites}
                recentlyPlayed={recentlyPlayed}
                suggested={suggested}
                apiKey={apiKey}
                fetchContent={this.fetchContent}
                openBox={this.openBox}
                setOffline={this.setOffline}
                closeGenre={this.closeGenre}
            />
        );

        let loadingContainer = (
            <div
                className={`loading-container ${
                    appLoading ? "" : "pointer-events"
                }`}
            >
                <Fade when={logoLoaded} distance="10%" bottom>
                    <div className="logo" />
                </Fade>
                {this.state.bonjourInstalled ? null : (
                    <div
                        className={"flex items-center justify-center flex-col"}
                    >
                        <div
                            className={"badge"}
                            style={{
                                backgroundColor: "#fd4b4b",
                                color: "#FFF",
                                marginTop: "1em",
                            }}
                        >
                            <i
                                className={
                                    "mdi mdi-24px mdi-alert-circle-outline"
                                }
                                style={{ marginRight: "1em" }}
                            ></i>
                            <div className={"font-sans"}>
                                Bonjour services are required for the player to
                                work properly.
                            </div>
                        </div>
                        <div className={"flex"}>
                            <div
                                className={"btn btn-blue"}
                                style={{
                                    marginRight: "1em",
                                    paddingLeft: "1em",
                                    paddingRight: "1em",
                                }}
                                onClick={this.runBonjourInstaller}
                            >
                                <i className={"mdi mdi-download"}></i>
                                <div>Install Bonjour</div>
                            </div>
                            <div
                                className={"btn"}
                                style={{
                                    paddingLeft: "1em",
                                    paddingRight: "1em",
                                }}
                                onClick={this.getSettings}
                            >
                                <i className={"mdi mdi-check-all"}></i>
                                <div>Verify installation</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );

        let darkElem = this.showElementBasedOnValue(
            darkMode,
            <link
                type="text/css"
                rel="stylesheet"
                href="./assets/css/dark-mode.css"
            />
        );

        return (
            <div className="app-wrapper">
                <Fade distance="5%" bottom opposite when={appLoading}>
                    {loadingContainer}
                </Fade>
                {appLoading ? (
                    ""
                ) : (
                    <div
                        className={`app-container ${
                            process.platform !== "darwin"
                                ? "windows-compensate"
                                : ""
                        }`}
                        onClick={this.closeMenu}
                    >
                        <DarkModeToggle
                            darkMode={darkMode}
                            toggleDarkMode={this.toggleDarkMode}
                        />
                        {process.platform === "darwin" ? (
                            <div
                                className={
                                    "draggable " +
                                    (currentMovie ? "invisible" : "")
                                }
                            />
                        ) : (
                            ""
                        )}
                        <CSSTransitionGroup
                            transitionName="player-anim"
                            transitionEnterTimeout={250}
                            transitionLeaveTimeout={250}
                        >
                            {account || create ? (
                                <AccountContainer
                                    account={account}
                                    closeAccount={this.closeAccount}
                                    handleAccountSignin={
                                        this.handleAccountSignin
                                    }
                                    handleAccountCreation={
                                        this.handleAccountCreation
                                    }
                                    handleInput={this.handleInput}
                                    loginError={loginError}
                                    openAccount={this.openAccount}
                                    openAccountCreation={
                                        this.openAccountCreation
                                    }
                                />
                            ) : (
                                ""
                            )}
                        </CSSTransitionGroup>
                        <Trailer url={trailer} setTrailer={this.setTrailer} />
                        <CSSTransitionGroup
                            transitionName="genreContainer-anim"
                            transitionEnterTimeout={250}
                            transitionLeaveTimeout={250}
                        >
                            {fullGenreContainer}
                        </CSSTransitionGroup>
                        <CSSTransitionGroup
                            transitionName="player-anim"
                            transitionEnterTimeout={250}
                            transitionLeaveTimeout={250}
                        >
                            {playerModal}
                        </CSSTransitionGroup>
                        <CSSTransitionGroup
                            transitionName="movie-box-anim"
                            transitionEnterTimeout={250}
                            transitionLeaveTimeout={250}
                        >
                            {movieModal}
                        </CSSTransitionGroup>
                        <CSSTransitionGroup
                            transitionName="box-anim"
                            transitionEnterTimeout={250}
                            transitionLeaveTimeout={250}
                        >
                            {movieBackDrop}
                        </CSSTransitionGroup>
                        <Header
                            videoQuality={videoQuality}
                            setQuality={this.setQuality}
                            subtitle={active}
                            menuActive={menuActive}
                            toggleMenu={this.toggleMenu}
                            background={headerBg}
                            closeSearch={this.closeSearch}
                            searchContent={searchContent}
                            searchMovies={this.searchMovies}
                            inputValue={inputValue}
                            setInputValue={this.setInputValue}
                            isPremiumUser={isPremiumUser}
                            user={user}
                        />
                        <CSSTransitionGroup
                            transitionName="menu-anim"
                            transitionEnterTimeout={250}
                            transitionLeaveTimeout={250}
                        >
                            {menu}
                        </CSSTransitionGroup>
                        <Content
                            active={active}
                            offline={isOffline}
                            searchContent={searchContent}
                            isLoading={isLoading}
                            setHeader={this.setHeaderBackground}
                            loadCategories={this.loadCategories}
                            loadFeatured={this.loadFeatured}
                            updateSuggested={this.updateSuggested}
                            movies={movies}
                            shows={shows}
                            suggested={suggested}
                            favorites={favorites}
                            recentlyPlayed={recentlyPlayed}
                            featured={featured}
                            toggleGenre={this.toggleGenre}
                            openBox={this.openBox}
                        />
                    </div>
                )}
                {darkElem}
            </div>
        );
    }
}

export default App;
