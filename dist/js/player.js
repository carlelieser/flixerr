"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactAddonsCssTransitionGroup = require("react-addons-css-transition-group");

var _reactAddonsCssTransitionGroup2 = _interopRequireDefault(_reactAddonsCssTransitionGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Player = function (_React$Component) {
    _inherits(Player, _React$Component);

    function Player(props) {
        _classCallCheck(this, Player);

        var _this = _possibleConstructorReturn(this, (Player.__proto__ || Object.getPrototypeOf(Player)).call(this, props));

        _this.toggleOverlay = function (show) {
            _this.setState({ showOverlay: show });
        };

        _this.mouseStopped = function () {
            if (!_this.props.openBackup) {
                _this.toggleOverlay(false);
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

        _this.playOrPause = function () {
            if (_this.state.video.paused == true) {
                _this.state.video.play();
            } else {
                _this.state.video.pause();
            }
            _this.toggleOverlay(_this.state.video.paused);
        };

        _this.handleKeyPress = function (e) {
            if (e.keyCode == 32) {
                _this.playOrPause();
            } else if (e.keyCode == 27) {
                if (_this.state.fullScreen) {
                    _this.fullScreen();
                } else {
                    _this.closeClient();
                }
            }

            if (e.keyCode == 37) {
                var time = document.querySelector("video").currentTime;
                document.querySelector("video").currentTime = time - 10;
            }

            if (e.keyCode == 39) {
                var _time = document.querySelector("video").currentTime;
                document.querySelector("video").currentTime = _time + 30;
            }
        };

        _this.changeTime = function () {
            var seekBar = document.querySelector(".seek-bar");
            var time = document.querySelector("video").duration * (_this.props.getElementValue(seekBar) / 100);

            _this.props.setElementValue(document.querySelector("video"), "currentTime", time);
        };

        _this.closeClient = function () {
            var currentTime = document.querySelector("video").currentTime;
            _this.props.removeClient(currentTime);
        };

        _this.handleClose = function (e) {
            _this.windowTimeout = setTimeout(function () {
                window.removeEventListener("beforeunload", _this.handleClose);
                window.close();
            }, 600);
            e.preventDefault();
            _this.playOrPause();
            _this.props.handleVideoClose(_this.state.video);
            e.returnValue = false;
        };

        _this.handleTorrentClick = function (torrent) {
            var currentTime = document.querySelector("video").currentTime;

            _this.props.setPlayerLoading(true);

            _this.props.updateMovieTime(currentTime);
            _this.props.resetClient(true).then(function (result) {
                console.log(result);
                _this.props.streamTorrent(torrent);
            });
            _this.props.closeBackup();
        };

        _this.handleOpenBackup = function () {
            if (_this.props.index !== false) {
                _this.state.video.pause();
            }
            _this.props.showBackup(true);
        };

        _this.handleBg = function () {
            if (_this.props.index !== false) {
                _this.state.video.play();
            }
            _this.props.closeBackup();
        };

        _this.state = {
            video: false,
            fullScreen: false,
            timer: false,
            showOverlay: true
        };
        return _this;
    }

    _createClass(Player, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            if (nextProps.openBackup === this.props.openBackup && nextProps.movie === this.props.movie && nextProps.backupTorrents === this.props.backupTorrents && nextState.showOverlay === this.state.showOverlay && nextProps.paused === this.props.paused && nextProps.index === this.props.index && nextProps.time === this.props.time && nextProps.loading === this.props.loading) {
                return false;
            } else {
                return true;
            }
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.props.setElementValue(document.querySelector(".seek-bar"), "value", 0);
            this.setState({
                video: document.querySelector("video")
            });

            window.addEventListener("keydown", this.handleKeyPress);
            window.addEventListener("beforeunload", this.handleClose);
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            clearTimeout(this.state.timer);
            clearTimeout(this.windowTimeout);
            this.props.handleVideoClose(this.state.video);
            window.removeEventListener("keydown", this.handleKeyPress);
            window.removeEventListener("beforeunload", this.handleClose);
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var backupContainer = this.props.openBackup ? React.createElement(BackupTorrents, {
                movie: this.props.movie,
                torrents: this.props.backupTorrents || this.props.movie.preferredTorrents,
                getCurrentMagnet: this.props.getCurrentMagnet,
                handleTorrentClick: this.handleTorrentClick,
                resetClient: this.props.resetClient,
                streamTorrent: this.props.streamTorrent,
                searchTorrent: this.props.searchTorrent,
                closeBackup: this.props.closeBackup,
                setPlayerLoading: this.props.setPlayerLoading }) : "";
            var backupContainerBg = this.props.openBackup ? React.createElement("div", { className: "backup-bg", onClick: this.handleBg }) : "";
            return React.createElement(
                "div",
                {
                    className: "movie-player " + (this.state.showOverlay ? "" : this.props.openBackup ? "" : "movie-hide"),
                    style: {
                        backgroundImage: "" + (this.props.loading ? this.props.error ? "none" : "url(assets/imgs/loading.apng)" : "none")
                    },
                    onMouseMove: this.mouseMove },
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: "movie-box-anim",
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    backupContainer
                ),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: "box-anim",
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    backupContainerBg
                ),
                React.createElement(
                    "div",
                    {
                        className: "top-bar-container " + (this.state.showOverlay ? "" : "top-bar-hide") },
                    React.createElement(
                        "div",
                        { className: "top-bar" },
                        React.createElement("i", {
                            className: "mdi mdi-light mdi-chevron-left mdi-36px",
                            onClick: this.closeClient }),
                        React.createElement(
                            "div",
                            null,
                            this.props.movie.title
                        ),
                        React.createElement("i", {
                            className: "open-backup mdi mdi-light mdi-sort-variant",
                            onClick: this.handleOpenBackup })
                    )
                ),
                React.createElement(
                    "div",
                    {
                        className: "bottom-bar-container " + (this.state.showOverlay ? "" : "bottom-bar-hide") },
                    React.createElement(
                        "div",
                        { className: "bottom-bar" },
                        React.createElement("i", {
                            className: "mdi mdi-light mdi-36px play-button " + (this.props.paused ? "mdi-play" : "mdi-pause"),
                            onClick: this.playOrPause }),
                        React.createElement("input", {
                            className: "seek-bar",
                            type: "range",
                            onChange: function onChange() {
                                return _this2.changeTime();
                            },
                            onMouseDown: function onMouseDown() {
                                return document.querySelector("video").pause();
                            },
                            onMouseUp: function onMouseUp() {
                                return document.querySelector("video").play();
                            } }),
                        React.createElement(
                            "span",
                            null,
                            this.props.time
                        ),
                        React.createElement("i", {
                            className: "mdi mdi-light mdi-fullscreen mdi-36px fullscreen-button",
                            onClick: this.fullScreen })
                    )
                ),
                React.createElement("video", {
                    autoPlay: true,
                    onTimeUpdate: this.props.handleVideo,
                    type: "video/mp4",
                    src: Number.isInteger(this.props.index) ? "http://localhost:8888/" + this.props.index : '' })
            );
        }
    }]);

    return Player;
}(React.Component);