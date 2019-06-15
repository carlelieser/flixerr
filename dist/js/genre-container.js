"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Fade = require("react-reveal/Fade");

var _Fade2 = _interopRequireDefault(_Fade);

var _uniqid = require("uniqid");

var _uniqid2 = _interopRequireDefault(_uniqid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GenreContainer = function (_React$Component) {
    _inherits(GenreContainer, _React$Component);

    function GenreContainer(props) {
        _classCallCheck(this, GenreContainer);

        var _this = _possibleConstructorReturn(this, (GenreContainer.__proto__ || Object.getPrototypeOf(GenreContainer)).call(this, props));

        _this.handleResize = function () {
            if (document.querySelector('.movie-list-paginated')) {
                if (_this.props.movies.length * 230 > document.querySelector('.movie-list-paginated').offsetWidth) {
                    _this.setState({ showArrows: true });
                } else {
                    _this.setState({ showArrows: false });
                }
            }
        };

        _this.handleOpenGenre = function () {
            _this.props.toggleGenre(true, _this.props.name, _this.props.genreID);
        };

        _this.state = {
            showArrows: false
        };
        return _this;
    }

    _createClass(GenreContainer, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            if (this.props.movies === nextProps.movies && this.state.showArrows === nextState.showArrows && this.props.name === nextProps.name && this.props.genreID === nextProps.genreID) {
                return false;
            } else {
                return true;
            }
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.handleResize();
            window.addEventListener('resize', this.handleResize);
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            window.removeEventListener('resize', this.handleResize);
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var genreID = 'movie-' + this.props.name.toLowerCase().replace(/ /g, '-');

            return React.createElement(
                _Fade2.default,
                { delay: 100, fraction: 0.3, distance: "20%", bottom: true },
                React.createElement(
                    "div",
                    { className: "genre-container" },
                    React.createElement(
                        "div",
                        {
                            className: "movie-genre " + (this.props.name == 'Recently Played' || this.props.name == 'Favorites' ? "movie-blocked" : ""),
                            onClick: this.handleOpenGenre },
                        React.createElement(
                            "span",
                            null,
                            this.props.name
                        )
                    ),
                    this.state.showArrows ? React.createElement(
                        "div",
                        { className: "movie-scroll-container", id: genreID },
                        React.createElement(
                            "div",
                            {
                                className: "movie-scroll movie-scroll-left",
                                onClick: function onClick(e) {
                                    return _this2.props.scrollMovieGenre(true, e, genreID);
                                } },
                            React.createElement("i", { className: "mdi mdi-light mdi-24px mdi-chevron-left" })
                        ),
                        React.createElement(
                            "div",
                            {
                                className: "movie-scroll movie-scroll-right",
                                onClick: function onClick(e) {
                                    return _this2.props.scrollMovieGenre(false, e, genreID);
                                } },
                            React.createElement("i", { className: "mdi mdi-light mdi-24px mdi-chevron-right" })
                        )
                    ) : "",
                    this.props.movies ? this.props.movies.length ? React.createElement(
                        "div",
                        { className: "movie-list-paginated" },
                        this.props.movies.map(function (movie, index) {
                            return React.createElement(MovieItem, {
                                movie: movie,
                                openBox: _this2.props.openBox,
                                strip: _this2.props.strip,
                                key: (0, _uniqid2.default)() });
                        })
                    ) : "" : ""
                )
            );
        }
    }]);

    return GenreContainer;
}(React.Component);