"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MovieModal = function (_Component) {
    _inherits(MovieModal, _Component);

    function MovieModal(props) {
        _classCallCheck(this, MovieModal);

        var _this = _possibleConstructorReturn(this, (MovieModal.__proto__ || Object.getPrototypeOf(MovieModal)).call(this, props));

        _this.handlePlayMovie = function () {
            _this.props.playMovie(_this.props.movie);
        };

        _this.handleFavorites = function () {
            if (_this.props.isFavorite(_this.props.movie)) {
                _this.props.removeFromFavorites(_this.props.movie);
            } else {
                _this.props.addToFavorites(_this.props.movie);
            }
        };

        return _this;
    }

    _createClass(MovieModal, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            if (this.props.movie === nextProps.movie && this.props.favorites === nextProps.favorites) {
                return false;
            } else {
                return true;
            }
        }
    }, {
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                "div",
                {
                    className: "movie-modal " + (this.props.movie.averageColor.isLight ? "light-modal" : "dark-modal"),
                    style: {
                        backgroundColor: this.props.movie.averageColor.hex,
                        height: this.props.movie ? 500 + this.props.movie.overview.length / 4 + this.props.movie.title.length / 2 + "px" : "500px"
                    } },
                _react2.default.createElement(
                    "div",
                    { className: "movie-modal-info" },
                    _react2.default.createElement("div", {
                        className: "movie-modal-poster",
                        style: {
                            backgroundImage: "url(" + this.props.movie.flixerr_data.poster_path + ")"
                        } }),
                    _react2.default.createElement(
                        "div",
                        { className: "movie-metadata" },
                        _react2.default.createElement(
                            "div",
                            { className: "movie-modal-vote" },
                            _react2.default.createElement("i", {
                                className: "mdi " + (this.props.movie.averageColor.isLight ? "mdi-dark" : "mdi-light") + " mdi-star-outline" }),
                            _react2.default.createElement(
                                "div",
                                null,
                                this.props.movie.vote_average + " / 10"
                            )
                        ),
                        _react2.default.createElement(
                            "div",
                            { className: "movie-modal-release-date" },
                            this.props.movie.release_date.substring(0, 4)
                        ),
                        _react2.default.createElement("i", {
                            className: "mdi " + (this.props.movie.averageColor.isLight ? "mdi-dark" : "mdi-light") + " " + (this.props.isFavorite(this.props.movie) ? "mdi-heart" : "mdi-heart-outline"),
                            onClick: this.handleFavorites })
                    ),
                    _react2.default.createElement(
                        "div",
                        { className: "movie-modal-title" },
                        this.props.movie.title
                    ),
                    _react2.default.createElement(
                        "div",
                        { className: "movie-modal-desc" },
                        this.props.movie.overview
                    ),
                    _react2.default.createElement(
                        "div",
                        { className: "movie-modal-play", onClick: this.handlePlayMovie },
                        _react2.default.createElement("i", { className: "mdi mdi-play-circle-outline mdi-36px" })
                    )
                ),
                _react2.default.createElement("div", {
                    className: "movie-modal-image",
                    style: {
                        backgroundImage: "url(" + this.props.movie.flixerr_data.blurry_backdrop_path + ")"
                    } }),
                _react2.default.createElement("div", {
                    className: "movie-gradient",
                    style: {
                        background: this.props.movie.averageColor ? "linear-gradient(180deg, rgba(" + this.props.movie.averageColor.value[0] + ", " + this.props.movie.averageColor.value[1] + ", " + this.props.movie.averageColor.value[2] + ", 0.40) 0%, rgba(" + this.props.movie.averageColor.value[0] + ", " + this.props.movie.averageColor.value[1] + ", " + this.props.movie.averageColor.value[2] + ", 0.60) 20%, rgba(" + this.props.movie.averageColor.value[0] + ", " + this.props.movie.averageColor.value[1] + ", " + this.props.movie.averageColor.value[2] + ", 0.80) 50%, " + this.props.movie.averageColor.hex + " 100%)" : ""
                    } })
            );
        }
    }]);

    return MovieModal;
}(_react.Component);

exports.default = MovieModal;