"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _uniqid = require("uniqid");

var _uniqid2 = _interopRequireDefault(_uniqid);

var _genreContainer = require("./genre-container");

var _genreContainer2 = _interopRequireDefault(_genreContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TVShowContainer = function (_Component) {
    _inherits(TVShowContainer, _Component);

    function TVShowContainer(props) {
        _classCallCheck(this, TVShowContainer);

        var _this = _possibleConstructorReturn(this, (TVShowContainer.__proto__ || Object.getPrototypeOf(TVShowContainer)).call(this, props));

        _this.getTVShows = function () {
            if (_this.props.shows) {
                if (!_this.props.shows.length || _this.props.shows[0] === undefined) {
                    _this.props.loadCategories(true);
                }
            } else {
                _this.props.loadCategories(true);
            }
        };

        _this.setHeader = function () {
            if (_this.props.shows) {
                if (_this.props.shows.length) {
                    if (_this.props.shows[0]) {
                        if (_this.props.shows[0].movies[0]) {
                            _this.props.setHeader(_this.props.shows[0].movies[0].flixerr_data.backdrop_path);
                        }
                    }
                }
            }
        };

        return _this;
    }

    _createClass(TVShowContainer, [{
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps, prevState) {
            this.getTVShows();
            if (prevProps.shows !== this.props.shows) {
                this.setHeader();
            }
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.getTVShows();
            this.setHeader();
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var tvShowGenres = this.props.shows.map(function (item, i) {
                if (item) {
                    var genreInfo = {
                        showCollection: false,
                        activeGenre: item.name,
                        genreID: item.genreID,
                        shows: true,
                        movies: item.movies
                    };

                    return _react2.default.createElement(_genreContainer2.default, {
                        shows: true,
                        toggleGenre: _this2.props.toggleGenre,
                        openBox: _this2.props.openBox,
                        genreInfo: genreInfo,
                        key: (0, _uniqid2.default)() });
                }
            });

            return _react2.default.createElement(
                "div",
                {
                    className: "tv-shows-container",
                    style: {
                        height: 470 * 12 + "px'"
                    } },
                tvShowGenres
            );
        }
    }]);

    return TVShowContainer;
}(_react.Component);

exports.default = TVShowContainer;