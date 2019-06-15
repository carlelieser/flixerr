"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _uniqid = require("uniqid");

var _uniqid2 = _interopRequireDefault(_uniqid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BackupTorrents = function (_React$Component) {
    _inherits(BackupTorrents, _React$Component);

    function BackupTorrents(props) {
        _classCallCheck(this, BackupTorrents);

        var _this = _possibleConstructorReturn(this, (BackupTorrents.__proto__ || Object.getPrototypeOf(BackupTorrents)).call(this, props));

        _this.handleReload = function () {
            var movie = _this.props.movie;
            movie.magnet = false;
            _this.props.resetClient(true);
            _this.props.searchTorrent(movie);
            _this.props.closeBackup();
        };

        return _this;
    }

    _createClass(BackupTorrents, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            if (nextProps.torrents !== this.props.torrents) {
                return true;
            }

            return false;
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var torrents = this.props.torrents ? this.props.torrents.map(function (torrent) {
                return React.createElement(
                    "div",
                    {
                        key: (0, _uniqid2.default)(),
                        className: "torrent",
                        onClick: function onClick() {
                            _this2.props.handleTorrentClick(torrent);
                        } },
                    torrent.title.replace(/\./g, ' ').replace(/[^a-zA-Z0-9 ]/g, '')
                );
            }) : '';
            return React.createElement(
                "div",
                { className: "backup-container" },
                React.createElement(
                    "div",
                    { className: "title" },
                    "Torrents"
                ),
                React.createElement(
                    "div",
                    { className: "subtitle" },
                    this.props.torrents ? "Here are some alternative torrents for " + this.props.movie.title + ". Have fun :) " : "We couldn't find any alternative torrents. Please wait or try again."
                ),
                this.props.torrents ? React.createElement(
                    "div",
                    { className: "torrent-container" },
                    torrents
                ) : React.createElement(
                    "div",
                    { className: "reload-btn", onClick: this.handleReload },
                    React.createElement(
                        "span",
                        null,
                        "Reload"
                    )
                )
            );
        }
    }]);

    return BackupTorrents;
}(React.Component);