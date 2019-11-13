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

var MovieContainer = function (_Component) {
    _inherits(MovieContainer, _Component);

    function MovieContainer(props) {
        _classCallCheck(this, MovieContainer);

        var _this = _possibleConstructorReturn(this, (MovieContainer.__proto__ || Object.getPrototypeOf(MovieContainer)).call(this, props));

        _this.getMovies = function () {
            if (_this.props.movies) {
                if (_this.props.movies.length === 0 || _this.props.movies[0] === undefined) {
                    _this.props.loadCategories();
                }
            } else {
                _this.props.loadCategories();
            }
        };

        _this.setHeader = function () {
            if (_this.props.movies) {
                if (_this.props.movies.length) {
                    if (_this.props.movies[0]) {
                        if (_this.props.movies[0].movies[0]) {
                            _this.props.setHeader(_this.props.movies[0].movies[0].flixerr_data.backdrop_path);
                        }
                    }
                }
            }
        };

        return _this;
    }

    _createClass(MovieContainer, [{
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps, prevState) {
            if (prevProps.movies !== this.props.movies) {
                this.setHeader();
            }
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.getMovies();
            this.setHeader();
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var movieGenres = this.props.movies.map(function (item, i) {
                if (item) {
                    var genreInfo = {
                        showCollection: false,
                        activeGenre: item.name,
                        genreID: item.genreID,
                        movies: item.movies
                    };

                    return _react2.default.createElement(_genreContainer2.default, {
                        toggleGenre: _this2.props.toggleGenre,
                        openBox: _this2.props.openBox,
                        genreInfo: genreInfo,
                        key: (0, _uniqid2.default)() });
                }
            });

            return _react2.default.createElement(
                "div",
                {
                    className: "movie-container",
                    style: {
                        height: 470 * 12 + "px'"
                    } },
                movieGenres
            );
        }
    }]);

    return MovieContainer;
}(_react.Component);

exports.default = MovieContainer;