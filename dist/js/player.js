"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactTransitionGroup = require("react-transition-group");

var _Fade = require("react-reveal/Fade");

var _Fade2 = _interopRequireDefault(_Fade);

var _backupTorrentContainer = require("./backup-torrent-container");

var _backupTorrentContainer2 = _interopRequireDefault(_backupTorrentContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Player = function (_Component) {
    _inherits(Player, _Component);

    function Player(props) {
        _classCallCheck(this, Player);

        var _this = _possibleConstructorReturn(this, (Player.__proto__ || Object.getPrototypeOf(Player)).call(this, props));

        _this.toggleOverlay = function (show) {
            _this.setState({ showOverlay: show });
        };

        _this.mouseStopped = function () {
            if (!_this.props.openBackup) {
                _this.toggleOverlay();
            }
        };

        _this.mouseMove = function () {
            if (!_this.props.openBackup) {
                _this.toggleOverlay(true);
                clearTimeout(_this.state.timer);
                _this.setState({
                    timer: setTimeout(_this.mouseStopped, 5000)
                });
            }
        };

        _this.fullScreen = function () {
            _this.setState({
                fullScreen: !_this.state.fullScreen
            }, function () {
                _this.props.setFullScreen(_this.state.fullScreen);
            });
        };

        _this.handleVideoPlayback = function (toggle, play) {
            if (_this.videoElement.current) {
                if (toggle) {
                    if (_this.videoElement.current.paused == true) {
                        _this.videoElement.current.play();
                    } else {
                        _this.videoElement.current.pause();
                    }
                } else if (play) {
                    _this.videoElement.current.play();
                } else {
                    _this.videoElement.current.pause();
                }

                _this.toggleOverlay(_this.videoElement.current.paused);
            }
        };

        _this.playVideo = function () {
            _this.handleVideoPlayback(false, true);
        };

        _this.pauseVideo = function () {
            _this.handleVideoPlayback();
        };

        _this.setVideoTime = function (time) {
            _this.videoElement.current.currentTime = time;
        };

        _this.toggleVideoPlayback = function () {
            _this.handleVideoPlayback(true, false);
        };

        _this.handleKeyPress = function (e) {
            if (e.keyCode == 32) {
                _this.toggleVideoPlayback();
            } else if (e.keyCode == 27) {
                if (_this.state.fullScreen) {
                    _this.fullScreen();
                } else {
                    _this.closeClient();
                }
            }

            if (e.keyCode == 37) {
                var time = _this.props.currentTime - 10;
                _this.setVideoTime(time);
            }

            if (e.keyCode == 39) {
                var _time = _this.props.currentTime + 30;
                _this.setVideoTime(_time);
            }
        };

        _this.changeTime = function (e) {
            var value = e.currentTarget.value;
            var percent = value / 100;
            var time = _this.videoElement.current.duration * percent;

            _this.setVideoTime(time);
            _this.props.setSeekValue(value);
            _this.props.setColorStop(percent);
        };

        _this.closeClient = function () {
            _this.props.removeClient(_this.props.currentTime);
        };

        _this.handleClose = function (e) {
            e.preventDefault();
            _this.pauseVideo();
            _this.props.setWillClose(true);
            _this.props.handleVideoClose(_this.videoElement.current);
            e.returnValue = false;
        };

        _this.handleTorrentClick = function (torrent) {
            _this.props.setPlayerLoading(true);

            _this.props.updateMovieTime(_this.videoElement.current.currentTime);

            _this.props.resetClient(true).then(function (result) {
                _this.props.streamTorrent(torrent);
            });
            _this.props.closeBackup();
        };

        _this.handleOpenBackup = function () {
            if (_this.props.videoIndex !== false) {
                _this.pauseVideo();
            }
            _this.props.showBackup(true);
        };

        _this.handleSubtitles = function () {
            _this.setState(function (prevState) {
                return {
                    showSubtitles: !prevState.showSubtitles
                };
            });
        };

        _this.handleBg = function () {
            if (_this.props.videoIndex !== false) {
                _this.playVideo();
            }
            _this.props.closeBackup();
        };

        _this.handleBuffer = function () {
            _this.setState({ videoBuffering: true });
        };

        _this.handleUpdate = function (e) {
            _this.setState({ videoBuffering: false });
            _this.props.handleVideo(e);
        };

        _this.handleMouseDown = function (e) {
            _this.pauseVideo();
        };

        _this.stopIntro = function () {
            _this.props.toggleIntro();
        };

        _this.videoElement = _react2.default.createRef();

        _this.changeTime.bind(_this);

        _this.state = {
            fullScreen: false,
            timer: false,
            showOverlay: true,
            showSubtitles: false,
            videoBuffering: false
        };
        return _this;
    }

    _createClass(Player, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            if (nextProps.readyToClose === this.props.readyToClose && nextProps.showIntro === this.props.showIntro && nextProps.downloadPercent === this.props.downloadPercent && nextProps.downloadSpeed === this.props.downloadSpeed && nextProps.openBackup === this.props.openBackup && nextProps.movie === this.props.movie && nextState.showOverlay === this.state.showOverlay && nextProps.paused === this.props.paused && nextProps.videoIndex === this.props.videoIndex && nextProps.time === this.props.time && nextProps.loading === this.props.loading && nextProps.playerStatus.status === this.props.playerStatus.status && nextProps.seekValue === this.props.seekValue && nextProps.currentTime === this.props.currentTime && nextState.videoBuffering === this.state.videoBuffering && nextProps.startTime === this.props.startTime && nextProps.fileLoaded === this.props.fileLoaded) {
                return false;
            } else {
                return true;
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps) {
            if (prevProps.startTime !== this.props.startTime) {
                this.videoElement.current.currentTime = this.props.startTime;
            }
            if (this.props.readyToClose === true) {
                window.removeEventListener("beforeunload", this.handleClose);
                window.close();
            }
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.props.setSeekValue(0);
            this.props.setColorStop(0);
            this.props.setFileLoaded(0);
            this.props.setVideoElement(this.videoElement);

            window.addEventListener("keydown", this.handleKeyPress);
            window.addEventListener("beforeunload", this.handleClose);
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            clearTimeout(this.state.timer);
            clearTimeout(this.windowTimeout);
            window.removeEventListener("keydown", this.handleKeyPress);
            window.removeEventListener("beforeunload", this.handleClose);
        }
    }, {
        key: "render",
        value: function render() {
            var backupContainer = this.props.openBackup ? _react2.default.createElement(_backupTorrentContainer2.default, {
                movie: this.props.movie,
                torrents: this.props.movie.preferredTorrents,
                getCurrentMagnet: this.props.getCurrentMagnet,
                handleTorrentClick: this.handleTorrentClick,
                resetClient: this.props.resetClient,
                streamTorrent: this.props.streamTorrent,
                searchTorrent: this.props.searchTorrent,
                closeBackup: this.props.closeBackup,
                setPlayerLoading: this.props.setPlayerLoading }) : "";
            var backupContainerBg = this.props.openBackup ? _react2.default.createElement("div", { className: "backup-bg", onClick: this.handleBg }) : "";

            var playerStatusContainer = this.props.playerStatus ? _react2.default.createElement(
                "div",
                { className: "player-status-container" },
                _react2.default.createElement(
                    "span",
                    null,
                    this.props.playerStatus.status
                ),
                this.props.playerStatus.loading ? _react2.default.createElement("span", { className: "dots" }) : "",
                this.props.downloadPercent ? _react2.default.createElement(
                    "div",
                    { className: "download-info" },
                    _react2.default.createElement(
                        "span",
                        { className: "download-percent" },
                        this.props.downloadPercent,
                        "%"
                    ),
                    _react2.default.createElement(
                        "span",
                        { className: "download-speed" },
                        this.props.downloadSpeed + " Kb/s"
                    )
                ) : "",
                this.props.downloadPercent ? _react2.default.createElement(
                    _Fade2.default,
                    { distance: "10%", bottom: true },
                    _react2.default.createElement("div", {
                        className: "progress-bar",
                        style: {
                            width: this.props.downloadPercent + "%"
                        } }),
                    _react2.default.createElement("div", { className: "progress-bar-shadow" })
                ) : ""
            ) : "";

            return _react2.default.createElement(
                "div",
                {
                    className: "movie-player " + (this.state.showOverlay ? "" : this.props.openBackup ? "" : this.props.playerStatus ? this.props.playerStatus.status ? "" : "movie-hide" : "movie-hide"),
                    style: {
                        backgroundImage: "" + (this.props.loading ? this.props.error ? "none" : "url(assets/imgs/loading.apng)" : "none")
                    },
                    onMouseMove: this.mouseMove },
                this.state.videoBuffering ? _react2.default.createElement("div", { className: "video-buffer-container" }) : "",
                _react2.default.createElement(
                    _reactTransitionGroup.CSSTransitionGroup,
                    {
                        transitionName: "movie-box-anim",
                        transitionEnterTimeout: 250,
                        transitionLeaveTimeout: 250 },
                    backupContainer
                ),
                _react2.default.createElement(
                    _reactTransitionGroup.CSSTransitionGroup,
                    {
                        transitionName: "box-anim",
                        transitionEnterTimeout: 250,
                        transitionLeaveTimeout: 250 },
                    backupContainerBg
                ),
                _react2.default.createElement(
                    _reactTransitionGroup.CSSTransitionGroup,
                    {
                        transitionName: "player-status-anim",
                        transitionEnterTimeout: 250,
                        transitionLeaveTimeout: 250 },
                    playerStatusContainer
                ),
                _react2.default.createElement(
                    "div",
                    { className: "top-bar-container" },
                    _react2.default.createElement(
                        "div",
                        { className: "top-bar" },
                        _react2.default.createElement("i", {
                            className: "mdi mdi-light mdi-chevron-left mdi-36px",
                            onClick: this.closeClient }),
                        _react2.default.createElement(
                            "div",
                            null,
                            this.props.movie.title
                        ),
                        _react2.default.createElement("i", {
                            className: "open-backup mdi mdi-light mdi-sort-variant",
                            onClick: this.handleOpenBackup })
                    )
                ),
                _react2.default.createElement(
                    "div",
                    { className: "bottom-bar-container" },
                    _react2.default.createElement(
                        "div",
                        { className: "bottom-bar" },
                        _react2.default.createElement("i", {
                            className: "mdi mdi-light mdi-36px play-button " + (this.props.paused ? "mdi-play" : "mdi-pause"),
                            onClick: this.toggleVideoPlayback }),
                        _react2.default.createElement(
                            "div",
                            { className: "video-data" },
                            _react2.default.createElement("div", { className: "file-loaded", style: { width: this.props.fileLoaded + "%" } }),
                            _react2.default.createElement("input", {
                                className: "seek-bar",
                                type: "range",
                                value: this.props.seekValue,
                                onChange: this.changeTime,
                                onMouseDown: this.handleMouseDown,
                                onMouseUp: this.playVideo,
                                min: 0,
                                max: this.state.videoElement ? this.state.videoElement.current.duration : 100,
                                step: 0.1,
                                style: {
                                    backgroundImage: "-webkit-gradient(linear, left top, right top, color-stop(" + this.props.colorStop + ", rgb(255, 0, 0)), color-stop(" + this.props.colorStop + ", rgba(255, 255, 255, 0.158)))"
                                } })
                        ),
                        _react2.default.createElement(
                            "span",
                            null,
                            this.props.time
                        ),
                        _react2.default.createElement("i", {
                            className: "mdi mdi-light mdi-fullscreen mdi-36px fullscreen-btn",
                            onClick: this.fullScreen })
                    )
                ),
                this.props.showIntro ? _react2.default.createElement("video", {
                    autoPlay: true,
                    type: "video/mp4",
                    src: "./assets/video/intro.mp4",
                    onEnded: this.stopIntro }) : _react2.default.createElement("div", null),
                _react2.default.createElement("video", {
                    autoPlay: true,
                    type: "video/mp4",
                    onTimeUpdate: this.handleUpdate.bind(this),
                    onWaiting: this.handleBuffer,
                    src: Number.isInteger(this.props.videoIndex) ? "http://localhost:8888/" + this.props.videoIndex : "",
                    ref: this.videoElement })
            );
        }
    }]);

    return Player;
}(_react.Component);

exports.default = Player;