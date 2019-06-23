"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _movieItem = require("./movie-item");

var _movieItem2 = _interopRequireDefault(_movieItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Genre = function (_Component) {
    _inherits(Genre, _Component);

    function Genre(props) {
        _classCallCheck(this, Genre);

        var _this = _possibleConstructorReturn(this, (Genre.__proto__ || Object.getPrototypeOf(Genre)).call(this, props));

        _this.loadPage = function () {
            if (!_this.props.genreInfo.showCollection && _this.props.genreInfo.genreID !== 21) {
                var url = "https://api.themoviedb.org/3/discover/movie?api_key=" + _this.props.apiKey + "&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=" + _this.state.page + "&release_date.gte=" + (new Date().getFullYear() - 5) + "&release_date.lte=" + (new Date().getFullYear() - 1) + "&with_genres=" + _this.props.genreInfo.genreID;

                _this.props.fetchContent(url).then(function (response) {
                    _this.props.setOffline();
                    var movies = _this.props.extractMovies(response, false, false);;
                    _this.setState(function (prevState) {
                        return {
                            movies: prevState.movies.concat(movies),
                            processing: false
                        };
                    });
                }).catch(function (err) {
                    return _this.props.setOffline(true);
                });
            } else {
                _this.setCollection();
            }
        };

        _this.handleScroll = function () {
            var scrollTop = _this.genreElem.current.scrollTop,
                scrollHeight = _this.genreElem.current.scrollHeight,
                limit = 30;

            if (!_this.props.genreInfo.showCollection) {
                if (scrollTop >= scrollHeight - 1200) {
                    if (_this.state.processing) {
                        return;
                    } else {
                        _this.setState(function (prevState) {
                            return {
                                processing: true,
                                page: prevState.page + 1
                            };
                        }, function () {
                            _this.loadPage(_this.state.page);
                        });
                    }
                }
            }

            if (scrollTop > limit) {
                _this.setState({ changeNav: true });
            }

            if (scrollTop < limit) {
                _this.setState({ changeNav: false });
            }
        };

        _this.getEmptyState = function () {
            return _react2.default.createElement(
                "div",
                { className: "empty-state-container" },
                _react2.default.createElement("div", { className: "empty-state-bg" }),
                _react2.default.createElement(
                    "div",
                    { className: "empty-state-info" },
                    _react2.default.createElement(
                        "div",
                        { className: "title" },
                        "Look's like we're empty!"
                    ),
                    _react2.default.createElement(
                        "div",
                        { className: "desc" },
                        "We couldn't find any movies in \"" + _this.props.genreInfo.activeGenre + "\". To watch a movie, click the play button in the movie dialog box."
                    )
                )
            );
        };

        _this.setCollection = function () {
            var collection = _this.props[_this.props.genreInfo.target];
            _this.setState({ movies: _this.props.genreInfo.genreID == 21 ? _this.props.genreInfo.movies : collection ? collection : [], processing: false });
        };

        _this.genreElem = _react2.default.createRef();

        _this.state = {
            page: 1,
            processing: true,
            changeNav: false,
            movies: []
        };
        return _this;
    }

    _createClass(Genre, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            if (nextState.changeNav === this.state.changeNav && nextProps.genreInfo === this.props.genreInfo && nextState.page === this.state.page && nextState.processing === this.state.processing && nextState.movies === this.state.movies && nextProps.favorites === this.props.favorites && nextProps.recentlyPlayed === this.props.recentlyPlayed && nextProps.suggested === this.props.suggested) {
                return false;
            } else {
                return true;
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps, prevState) {
            if (this.props.genreInfo.showCollection) {
                if (prevProps.favorites !== this.props.favorites || prevProps.recentlyPlayed !== this.props.recentlyPlayed || prevProps.suggested !== this.props.suggested) {
                    this.setCollection();
                }
            }
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.loadPage();
            this.genreElem.current.addEventListener("scroll", this.handleScroll);
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            this.genreElem.current.removeEventListener("scroll", this.handleScroll);
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var movies = this.state.movies.map(function (movie, index) {
                return _react2.default.createElement(_movieItem2.default, {
                    key: movie.title + index,
                    movie: movie,
                    openBox: _this2.props.openBox });
            });

            return _react2.default.createElement(
                "div",
                { className: "paginated-genre-results", ref: this.genreElem },
                _react2.default.createElement("div", {
                    className: "genre-bar " + (this.state.changeNav ? "genre-bar-on" : "") }),
                _react2.default.createElement(
                    "div",
                    {
                        className: "close-genre " + (this.state.changeNav ? "close-genre-on" : ""),
                        onClick: this.props.closeGenre },
                    _react2.default.createElement("i", { className: "mdi mdi-keyboard-backspace" })
                ),
                _react2.default.createElement(
                    "div",
                    {
                        className: "genre-name " + (this.state.changeNav ? "genre-name-on" : "") },
                    this.props.genreInfo.activeGenre
                ),
                _react2.default.createElement(
                    "div",
                    {
                        className: "genre-movie-list",
                        style: {
                            marginLeft: this.state.movies.length ? "-20px" : "",
                            backgroundSize: !this.state.processing && !this.state.movies.length ? "40%" : "5%",
                            backgroundImage: this.state.processing && this.state.movies.length ? "" : this.state.processing && !this.state.movies.length ? "url(./assets/imgs/loading.apng)" : !this.state.processing && !this.state.movies.length ? "" : ""
                        } },
                    !this.state.processing && !this.state.movies.length ? this.getEmptyState() : movies
                )
            );
        }
    }]);

    return Genre;
}(_react.Component);

exports.default = Genre;