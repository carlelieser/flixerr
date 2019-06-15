'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactAddonsCssTransitionGroup = require('react-addons-css-transition-group');

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
            _this.windowTimeout = setTimeout(function () {
                window.removeEventListener('beforeunload', _this.handleClose);
                window.close();
            }, 600);
            e.preventDefault();
            _this.pauseVideo();
            _this.props.handleVideoClose(_this.state.video);
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

        _this.videoElement = React.createRef();

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
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            if (nextProps.openBackup === this.props.openBackup && nextProps.movie === this.props.movie && nextState.showOverlay === this.state.showOverlay && nextProps.paused === this.props.paused && nextProps.videoIndex === this.props.videoIndex && nextProps.time === this.props.time && nextProps.loading === this.props.loading && nextProps.playerStatus.status === this.props.playerStatus.status && nextProps.seekValue === this.props.seekValue && nextProps.currentTime === this.props.currentTime && nextState.videoBuffering === this.state.videoBuffering && nextProps.startTime === this.props.startTime) {
                return false;
            } else {
                return true;
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            if (prevProps.startTime != this.props.startTime) {
                this.videoElement.current.currentTime = this.props.startTime;
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.props.setSeekValue(0);
            this.props.setColorStop(0);
            this.props.setVideoElement(this.videoElement);

            window.addEventListener('keydown', this.handleKeyPress);
            window.addEventListener('beforeunload', this.handleClose);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            clearTimeout(this.state.timer);
            clearTimeout(this.windowTimeout);
            this.props.handleVideoClose(this.videoElement.current);
            window.removeEventListener('keydown', this.handleKeyPress);
            window.removeEventListener('beforeunload', this.handleClose);
        }
    }, {
        key: 'render',
        value: function render() {

            var backupContainer = this.props.openBackup ? React.createElement(BackupTorrents, {
                movie: this.props.movie,
                torrents: this.props.movie.preferredTorrents,
                getCurrentMagnet: this.props.getCurrentMagnet,
                handleTorrentClick: this.handleTorrentClick,
                resetClient: this.props.resetClient,
                streamTorrent: this.props.streamTorrent,
                searchTorrent: this.props.searchTorrent,
                closeBackup: this.props.closeBackup,
                setPlayerLoading: this.props.setPlayerLoading }) : '';
            var backupContainerBg = this.props.openBackup ? React.createElement('div', { className: 'backup-bg', onClick: this.handleBg }) : '';

            var playerStatusContainer = this.props.playerStatus ? React.createElement(
                'div',
                {
                    style: {
                        marginBottom: this.state.showOverlay ? '130px' : '60px'
                    }, className: 'player-status-container' },
                React.createElement(
                    'span',
                    null,
                    this.props.playerStatus.status
                ),
                this.props.playerStatus.loading ? React.createElement('span', { className: 'dots' }) : ''
            ) : '';

            return React.createElement(
                'div',
                {
                    className: 'movie-player ' + (this.state.showOverlay ? '' : this.props.openBackup ? '' : 'movie-hide'),
                    style: {
                        backgroundImage: '' + (this.props.loading ? this.props.error ? 'none' : 'url(assets/imgs/loading.apng)' : 'none')
                    },
                    onMouseMove: this.mouseMove },
                this.state.videoBuffering ? React.createElement('div', { className: 'video-buffer-container' }) : '',
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: 'movie-box-anim',
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    backupContainer
                ),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: 'box-anim',
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    backupContainerBg
                ),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: 'player-status-anim',
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    playerStatusContainer
                ),
                React.createElement(
                    'div',
                    {
                        className: 'top-bar-container ' + (this.state.showOverlay ? '' : 'top-bar-hide') },
                    React.createElement(
                        'div',
                        { className: 'top-bar' },
                        React.createElement('i', {
                            className: 'mdi mdi-light mdi-chevron-left mdi-36px',
                            onClick: this.closeClient }),
                        React.createElement(
                            'div',
                            null,
                            this.props.movie.title
                        ),
                        React.createElement('i', {
                            className: 'open-backup mdi mdi-light mdi-sort-variant',
                            onClick: this.handleOpenBackup })
                    )
                ),
                React.createElement(
                    'div',
                    {
                        className: 'bottom-bar-container ' + (this.state.showOverlay ? '' : 'bottom-bar-hide') },
                    React.createElement(
                        'div',
                        { className: 'bottom-bar' },
                        React.createElement('i', {
                            className: 'mdi mdi-light mdi-36px play-button ' + (this.props.paused ? 'mdi-play' : 'mdi-pause'),
                            onClick: this.toggleVideoPlayback }),
                        React.createElement('input', {
                            className: 'seek-bar',
                            type: 'range',
                            value: this.props.seekValue,
                            onChange: this.changeTime.bind(this),
                            onMouseDown: this.handleMouseDown,
                            onMouseUp: this.playVideo,
                            min: 0,
                            max: this.state.videoElement ? this.state.videoElement.current.duration : 100,
                            step: 0.1,
                            style: {
                                backgroundImage: '-webkit-gradient(linear, left top, right top, color-stop(' + this.props.colorStop + ', rgb(255, 0, 0)), color-stop(' + this.props.colorStop + ', rgba(255, 255, 255, 0.158)))'
                            } }),
                        React.createElement(
                            'span',
                            null,
                            this.props.time
                        ),
                        React.createElement('i', {
                            className: 'mdi mdi-light mdi-fullscreen mdi-36px fullscreen-btn',
                            onClick: this.fullScreen })
                    )
                ),
                React.createElement('video', {
                    autoPlay: true,
                    type: 'video/mp4',
                    onTimeUpdate: this.handleUpdate.bind(this),
                    onWaiting: this.handleBuffer,
                    src: Number.isInteger(this.props.videoIndex) ? 'http://localhost:8888/' + this.props.videoIndex : '',
                    ref: this.videoElement })
            );
        }
    }]);

    return Player;
}(React.Component);