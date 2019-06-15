'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Fade = require('react-reveal/Fade');

var _Fade2 = _interopRequireDefault(_Fade);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GenreContainer = function (_React$Component) {
    _inherits(GenreContainer, _React$Component);

    function GenreContainer(props) {
        _classCallCheck(this, GenreContainer);

        var _this = _possibleConstructorReturn(this, (GenreContainer.__proto__ || Object.getPrototypeOf(GenreContainer)).call(this, props));

        _this.easeInOutQuad = function (t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };

        _this.scrollTo = function (to, duration) {
            return new Promise(function (resolve, reject) {
                var start = _this.movieListRef.current.scrollLeft,
                    change = to - start,
                    currentTime = 0,
                    increment = 20;

                var animateScroll = function animateScroll() {
                    currentTime += increment;
                    var val = _this.easeInOutQuad(currentTime, start, change, duration);
                    _this.movieListRef.current.scrollLeft = val;
                    if (currentTime < duration) {
                        setTimeout(animateScroll, increment);
                    } else if (currentTime == duration) {
                        resolve();
                    }
                };

                animateScroll();
            });
        };

        _this.scrollMovieGenre = function (left) {
            var n = _this.props.movies.length;

            var container = _this.movieListRef.current,
                scrollVal = container.scrollLeft;

            var viewportW = container.offsetWidth - 50,
                boxW = 230,
                viewItems = Math.ceil(viewportW / boxW) - 1,
                containerScrollWidth = boxW * n - viewportW - 30;

            if (left) {
                scrollVal -= boxW * viewItems;
                scrollVal += 15;
            } else {
                scrollVal += boxW * viewItems;
                scrollVal -= 15;
            }

            if (scrollVal > containerScrollWidth - 30 && scrollVal < containerScrollWidth) {
                scrollVal = containerScrollWidth;
            }

            _this.scrollTo(scrollVal, 200).then(function () {
                if (container.scrollLeft + container.offsetWidth >= container.scrollWidth - 20) {
                    _this.setState({ movieScrollRight: false });
                    _this.setState({ movieScrollLeft: true });
                } else if (container.scrollLeft === 0) {
                    _this.setState({ movieScrollRight: true });
                    _this.setState({ movieScrollLeft: false });
                } else {
                    _this.setState({ movieScrollRight: true });
                    _this.setState({ movieScrollLeft: true });
                }
            });
        };

        _this.scrollLeft = function () {
            _this.scrollMovieGenre(true);
        };

        _this.scrollRight = function () {
            _this.scrollMovieGenre();
        };

        _this.handleResize = function () {
            if (_this.movieListRef.current) {
                if (_this.props.movies) {
                    if (_this.props.movies.length * 230 > _this.movieListRef.current.offsetWidth) {
                        _this.setState({ showArrows: true });
                    } else {
                        _this.setState({ showArrows: false });
                    }
                }
            }
        };

        _this.handleOpenGenre = function () {
            if (_this.props.toggleGenre) {
                _this.props.toggleGenre(true, _this.props.name, _this.props.genreID);
            }
        };

        _this.movieListRef = React.createRef();

        _this.state = {
            permitted: ['Suggested for you', 'Recently Played', 'Favorites'],
            showArrows: false,
            movieScrollLeft: false,
            movieScrollRight: true
        };
        return _this;
    }

    _createClass(GenreContainer, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            if (this.props.movies === nextProps.movies && this.state.showArrows === nextState.showArrows && this.props.name === nextProps.name && this.props.genreID === nextProps.genreID && this.state.movieScrollLeft === nextState.movieScrollLeft && this.state.movieScrollRight === nextState.movieScrollRight) {
                return false;
            } else {
                return true;
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.handleResize();
            window.addEventListener('resize', this.handleResize);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener('resize', this.handleResize);
        }
    }, {
        key: 'render',
        value: function render() {

            return React.createElement(
                _Fade2.default,
                { fraction: 0.3, distance: '20%', bottom: true },
                React.createElement(
                    'div',
                    { className: 'genre-container' },
                    React.createElement(
                        'div',
                        {
                            className: 'movie-genre ' + (this.state.permitted.indexOf(this.props.name) > -1 ? 'movie-blocked' : ''),
                            onClick: this.handleOpenGenre },
                        React.createElement(
                            'span',
                            null,
                            this.props.name
                        )
                    ),
                    this.state.showArrows ? React.createElement(
                        'div',
                        { className: 'movie-scroll-container' },
                        this.state.movieScrollLeft ? React.createElement(
                            'div',
                            { className: 'movie-scroll movie-scroll-left', onClick: this.scrollLeft },
                            React.createElement('i', { className: 'mdi mdi-light mdi-24px mdi-chevron-left' })
                        ) : '',
                        this.state.movieScrollRight ? React.createElement(
                            'div',
                            { className: 'movie-scroll movie-scroll-right', onClick: this.scrollRight },
                            React.createElement('i', { className: 'mdi mdi-light mdi-24px mdi-chevron-right' })
                        ) : ''
                    ) : "",
                    this.props.movies ? this.props.movies.length ? React.createElement(
                        'div',
                        { className: 'movie-list-paginated', ref: this.movieListRef },
                        this.props.movies
                    ) : "" : ""
                )
            );
        }
    }]);

    return GenreContainer;
}(React.Component);