"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _Fade = require("react-reveal/Fade");

var _Fade2 = _interopRequireDefault(_Fade);

var _uniqid = require("uniqid");

var _uniqid2 = _interopRequireDefault(_uniqid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Episode = function (_Component) {
    _inherits(Episode, _Component);

    function Episode(props) {
        _classCallCheck(this, Episode);

        var _this = _possibleConstructorReturn(this, (Episode.__proto__ || Object.getPrototypeOf(Episode)).call(this, props));

        _this.handleEpisode = function (e) {
            e.stopPropagation();
            _this.props.handleStreamEpisode(_this.props.episode);
        };

        _this.handleEpisode.bind(_this);
        return _this;
    }

    _createClass(Episode, [{
        key: "render",
        value: function render() {
            var episode = this.props.episode;
            return _react2.default.createElement(
                _Fade2.default,
                { key: (0, _uniqid2.default)(), distance: "10%", top: true },
                _react2.default.createElement(
                    "div",
                    { className: "episode", onClick: this.handleEpisode },
                    _react2.default.createElement(
                        "div",
                        { className: "episode-still", style: { backgroundImage: "url(https://image.tmdb.org/t/p/w300" + episode.still_path + ")" } },
                        episode.still_path ? '' : _react2.default.createElement("i", { className: "mdi " + this.props.isLightClass + " mdi-image mdi-36px" }),
                        episode.still_path ? _react2.default.createElement(
                            "div",
                            { className: "still-hover" },
                            _react2.default.createElement("i", { className: "mdi mdi-play" })
                        ) : ''
                    ),
                    _react2.default.createElement(
                        "div",
                        { className: "episode-info" },
                        _react2.default.createElement(
                            "div",
                            { className: "episode-title" },
                            _react2.default.createElement(
                                "div",
                                null,
                                episode.episode_number + "."
                            ),
                            _react2.default.createElement(
                                "div",
                                null,
                                episode.name
                            )
                        ),
                        _react2.default.createElement(
                            "div",
                            { className: "episode-desc" },
                            "" + episode.overview.substring(0, 234) + (episode.overview.length < 234 ? '' : '...')
                        )
                    )
                )
            );
        }
    }]);

    return Episode;
}(_react.Component);

exports.default = Episode;