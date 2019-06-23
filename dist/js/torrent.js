"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _Fade = require("react-reveal/Fade");

var _Fade2 = _interopRequireDefault(_Fade);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Torrent = function (_Component) {
    _inherits(Torrent, _Component);

    function Torrent(props) {
        _classCallCheck(this, Torrent);

        var _this = _possibleConstructorReturn(this, (Torrent.__proto__ || Object.getPrototypeOf(Torrent)).call(this, props));

        _this.handleTorrent = function () {
            _this.props.handleTorrentClick(_this.props.torrent);
        };

        return _this;
    }

    _createClass(Torrent, [{
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                _Fade2.default,
                { distance: "10%", bottom: true },
                _react2.default.createElement(
                    "div",
                    { className: this.props.name, onClick: this.handleTorrent },
                    this.props.videoQuality ? _react2.default.createElement(
                        "span",
                        { className: "video-quality" },
                        this.props.videoQuality
                    ) : "",
                    _react2.default.createElement(
                        "span",
                        { className: "title" },
                        this.props.title
                    )
                )
            );
        }
    }]);

    return Torrent;
}(_react.Component);

exports.default = Torrent;