"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _Fade = require("react-reveal/Fade");

var _Fade2 = _interopRequireDefault(_Fade);

var _season = require("./season");

var _season2 = _interopRequireDefault(_season);

var _uniqid = require("uniqid");

var _uniqid2 = _interopRequireDefault(_uniqid);

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MovieModal = function (_Component) {
    _inherits(MovieModal, _Component);

    function MovieModal(props) {
        _classCallCheck(this, MovieModal);

        var _this = _possibleConstructorReturn(this, (MovieModal.__proto__ || Object.getPrototypeOf(MovieModal)).call(this, props));

        _this.setLoading = function (loading) {
            _this.setState({ loading: loading });
        };

        _this.setShowSeasons = function (showSeasons) {
            _this.setState({ showSeasons: showSeasons });
        };

        _this.openSeasons = function () {
            _this.setShowSeasons(true);
        };

        _this.closeSeasons = function () {
            _this.setShowSeasons(false);
        };

        _this.setSeasons = function (seasons) {
            _this.setState({ seasons: seasons });
        };

        _this.setTrailer = function (trailer) {
            _this.setState({ trailer: trailer });
        };

        _this.getTrailer = function () {
            var movieTrailer = require('movie-trailer'),
                name = _this.props.movie.title,
                releaseDate = _this.props.movie.release_date.substring(0, 4);

            movieTrailer(name, releaseDate).then(function (url) {
                _this.setTrailer(url);
            }).catch(function (err) {
                _this.setTrailer();
            });
        };

        _this.handleViewTrailer = function () {
            var trailer = _this.state.trailer;


            _this.props.setTrailer(trailer);
        };

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

        _this.formatNumber = function (number) {
            number = number.toString();
            var formatted = number.length === 1 ? "0" + number : number;
            return formatted;
        };

        _this.getEpisodes = function (season) {
            var url = "https://api.themoviedb.org/3/tv/" + _this.props.movie.id + "/season/" + season.season_number + "?api_key=" + _this.props.apiKey + "&language=en-US";
            return _axios2.default.get(url).then(function (response) {
                var episodes = response.data.episodes;
                var flixerrEpisodes = [];
                if (episodes) {
                    for (var i = 0; i < episodes.length; i++) {
                        var episode = episodes[i];
                        var clonedMovie = _extends({}, _this.props.movie);
                        var newEpisode = _extends({}, episode);
                        newEpisode.title = clonedMovie.title + " / " + newEpisode.name;
                        newEpisode.episode_number_formatted = _this.formatNumber(newEpisode.episode_number);
                        newEpisode.query = clonedMovie.title + " S" + season.season_number_formatted + "E" + newEpisode.episode_number_formatted;
                        newEpisode.show = clonedMovie;
                        flixerrEpisodes.push(newEpisode);
                    }

                    return { name: season.name, number: season.season_number, episodes: flixerrEpisodes };
                }
            }).catch(function (err) {
                return console.log(err);
            });
        };

        _this.getSeriesData = function () {
            var url = "https://api.themoviedb.org/3/tv/" + _this.props.movie.id + "?api_key=" + _this.props.apiKey + "&language=en-US";
            return _axios2.default.get(url).then(function (response) {
                return response.data;
            }).catch(function (err) {
                return console.log(err);
            });
        };

        _this.getSeasons = function () {
            if (_this.props.movie.isSeries) {
                _this.setLoading(true);
                return _this.getSeriesData().then(function (data) {
                    var seasons = data.seasons;
                    var seasonData = [];
                    for (var i = 0; i < seasons.length; i++) {
                        var season = seasons[i];
                        season.season_number_formatted = _this.formatNumber(season.season_number);
                        if (season.season_number) {
                            var episodes = _this.getEpisodes(season);
                            seasonData.push(episodes);
                        }
                    }

                    return Promise.all(seasonData).then(function (response) {
                        response.sort(function (a, b) {
                            return b.name - a.name;
                        });
                        _this.setLoading();
                        _this.setSeasons(response);
                    });
                });
            }
        };

        _this.state = {
            trailer: false,
            seasons: [],
            showSeasons: false,
            loading: false
        };
        return _this;
    }

    _createClass(MovieModal, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            if (this.props.movie === nextProps.movie && this.props.favorites === nextProps.favorites && nextState.seasons === this.state.seasons && nextState.showSeasons === this.state.showSeasons && nextState.loading === this.state.loading && this.state.trailer === nextState.trailer) {
                return false;
            } else {
                return true;
            }
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.getTrailer();
            this.getSeasons();
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var movie = this.props.movie,
                releaseDate = movie.release_date.substring(0, 4),
                isLight = movie.averageColor.isLight,
                isLightClass = isLight ? "mdi-dark" : "mdi-light",
                averageColor = movie.averageColor,
                modalHeight = movie ? 500 + movie.overview.length / 4 + movie.title.length / 2 : 500;

            var seasons = this.state.seasons.map(function (season, index) {
                if (season) {
                    if (season.episodes) {
                        return _react2.default.createElement(_season2.default, {
                            key: (0, _uniqid2.default)(),
                            isLightClass: isLightClass,
                            playMovie: _this2.props.playMovie,
                            season: season });
                    }
                }
            });

            var showInfo = !this.state.showSeasons;
            return _react2.default.createElement(
                "div",
                {
                    className: "movie-modal " + (isLight ? "light-modal" : "dark-modal"),
                    style: {
                        backgroundColor: averageColor.hex,
                        height: modalHeight
                    } },
                _react2.default.createElement(
                    _Fade2.default,
                    {
                        mountOnEnter: true,
                        unmountOnExit: true,
                        when: this.state.showSeasons,
                        duration: 450,
                        distance: "5%",
                        bottom: true },
                    _react2.default.createElement(
                        "div",
                        {
                            className: "seasons-container",
                            style: {
                                height: modalHeight
                            } },
                        _react2.default.createElement(
                            "div",
                            {
                                className: "close-seasons " + (isLight ? 'close-dark' : 'close-light'),
                                onClick: this.closeSeasons },
                            _react2.default.createElement("i", { className: "mdi mdi-close " + isLightClass })
                        ),
                        this.state.loading ? _react2.default.createElement("div", { className: "seasons-loading" }) : seasons
                    )
                ),
                _react2.default.createElement(
                    _Fade2.default,
                    {
                        mountOnEnter: true,
                        unmountOnExit: true,
                        when: showInfo,
                        duration: 450,
                        distance: "5%",
                        bottom: true },
                    _react2.default.createElement(
                        "div",
                        { className: "movie-modal-info" },
                        _react2.default.createElement(
                            "div",
                            { className: "movie-modal-poster-info" },
                            _react2.default.createElement("div", {
                                className: "movie-modal-poster",
                                style: {
                                    backgroundImage: "url(" + movie.flixerr_data.poster_path + ")"
                                } })
                        ),
                        _react2.default.createElement(
                            "div",
                            { className: "movie-metadata" },
                            _react2.default.createElement(
                                "div",
                                { className: "movie-modal-vote" },
                                _react2.default.createElement("i", { className: "mdi " + isLightClass + " mdi-star-outline" }),
                                _react2.default.createElement(
                                    "div",
                                    null,
                                    movie.vote_average + " / 10"
                                )
                            ),
                            _react2.default.createElement(
                                "div",
                                { className: "movie-modal-release-date" },
                                releaseDate
                            ),
                            _react2.default.createElement("i", {
                                className: "mdi " + isLightClass + " " + (this.props.isFavorite(movie) ? "mdi-heart" : "mdi-heart-outline"),
                                onClick: this.handleFavorites }),
                            " ",
                            this.state.trailer ? _react2.default.createElement(
                                _Fade2.default,
                                { mountOnEnter: true, unmountOnExit: true, distance: "5%", bottom: true },
                                _react2.default.createElement(
                                    "div",
                                    { className: "movie-modal-view-trailer", onClick: this.handleViewTrailer },
                                    "View Trailer"
                                )
                            ) : ''
                        ),
                        _react2.default.createElement(
                            "div",
                            { className: "movie-modal-title" },
                            movie.title
                        ),
                        _react2.default.createElement(
                            "div",
                            { className: "movie-modal-desc" },
                            movie.overview
                        ),
                        movie.isSeries ? _react2.default.createElement(
                            "div",
                            { className: "open-series", onClick: this.openSeasons },
                            _react2.default.createElement(
                                "div",
                                null,
                                "View Seasons"
                            ),
                            _react2.default.createElement("i", { className: "mdi mdi-arrow-right" })
                        ) : _react2.default.createElement(
                            "div",
                            { className: "movie-modal-play", onClick: this.handlePlayMovie },
                            _react2.default.createElement("i", { className: "mdi mdi-play-circle-outline mdi-36px" })
                        )
                    )
                ),
                _react2.default.createElement(
                    "div",
                    { className: "movie-modal-image-container" },
                    _react2.default.createElement("div", {
                        className: "movie-modal-image",
                        style: {
                            backgroundImage: "url(" + movie.flixerr_data.blurry_backdrop_path + ")"
                        } })
                ),
                _react2.default.createElement("div", {
                    className: "movie-gradient",
                    style: {
                        background: averageColor ? "linear-gradient(180deg, rgba(" + averageColor.value[0] + ", " + averageColor.value[1] + ", " + averageColor.value[2] + ", 0.40) 0%, rgba(" + averageColor.value[0] + ", " + averageColor.value[1] + ", " + averageColor.value[2] + ", 0.60) 20%, rgba(" + averageColor.value[0] + ", " + averageColor.value[1] + ", " + averageColor.value[2] + ", 0.80) 50%, " + averageColor.hex + " 100%)" : ""
                    } })
            );
        }
    }]);

    return MovieModal;
}(_react.Component);

exports.default = MovieModal;