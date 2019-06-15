'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Fade = require('react-reveal/Fade');

var _Fade2 = _interopRequireDefault(_Fade);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Genre = function (_React$Component) {
    _inherits(Genre, _React$Component);

    function Genre(props) {
        _classCallCheck(this, Genre);

        var _this = _possibleConstructorReturn(this, (Genre.__proto__ || Object.getPrototypeOf(Genre)).call(this, props));

        _this.setListRef = function (e) {
            _this.listElem = e;
        };

        _this.setElementRef = function (e) {
            _this.genreElem = e;
        };

        _this.changeContainerHeight = function () {
            _this.setState({
                containerHeight: _this.listElem.offsetHeight + 40
            });
        };

        _this.loadPage = function (page) {
            var url = 'https://api.themoviedb.org/3/discover/movie?api_key=' + _this.props.apiKey + '&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=' + _this.state.page + '&release_date.gte=' + (new Date().getFullYear() - 5) + '&release_date.lte=' + (new Date().getFullYear() - 1) + '&with_genres=' + _this.props.genreID;;

            _this.props.fetchContent(url, function (response) {
                _this.props.setOffline();
                var movies = response.results;

                setTimeout(function () {
                    _this.setState({
                        movies: _this.state.movies.concat(_this.props.visualizeResults(movies))
                    }, function () {
                        _this.changeContainerHeight();
                        _this.processing = false;
                    });
                }, 400);
            }, function () {
                return _this.props.setOffline(true);
            });
        };

        _this.handleScroll = function () {
            var scrollTop = _this.genreElem.scrollTop,
                scrollHeight = _this.genreElem.scrollHeight,
                limit = 20;

            if (scrollTop >= scrollHeight - 1200) {
                if (_this.processing) {
                    return false;
                } else {
                    _this.processing = true;
                    _this.setState({
                        page: _this.state.page + 1
                    }, function () {
                        _this.loadPage(_this.state.page);
                    });
                }
            }

            if (scrollTop > limit) {
                _this.setState({ changeNav: true });
            }

            if (scrollTop < limit) {
                _this.setState({ changeNav: false });
            }
        };

        _this.handleResize = function () {
            var windowWidth = window.innerWidth - 160;
            var itemWidth = 210 + 40;
            var numberItems = Math.floor(windowWidth / itemWidth);
            var containerWidth = itemWidth * numberItems + 'px';

            _this.setState({ containerWidth: containerWidth });
        };

        _this.genreElem = false;
        _this.listElem = false;
        _this.processing = false;
        _this.lastScroll = 0;

        _this.state = {
            page: 1,
            containerWidth: 'auto',
            containerHeight: '100%',
            changeNav: false,
            movies: []
        };
        return _this;
    }

    _createClass(Genre, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadPage(0);
            this.handleResize();
            window.addEventListener('resize', this.handleResize);
            this.genreElem.addEventListener('scroll', this.handleScroll);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener('resize', this.handleResize);
            this.genreElem.removeEventListener('scroll', this.handleScroll);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return React.createElement(
                'div',
                { className: 'paginated-genre-results', ref: this.setElementRef },
                React.createElement('div', { className: 'genre-bar ' + (this.state.changeNav ? 'genre-bar-on' : '') }),
                React.createElement(
                    'div',
                    { className: 'close-genre ' + (this.state.changeNav ? 'close-genre-on' : ''), onClick: function onClick() {
                            return _this2.props.closeGenre();
                        } },
                    React.createElement('i', { className: 'mdi mdi-keyboard-backspace' })
                ),
                React.createElement(
                    'div',
                    { className: 'genre-name ' + (this.state.changeNav ? 'genre-name-on' : '') },
                    this.props.genre
                ),
                React.createElement(
                    'div',
                    {
                        className: 'genre-movie-list',
                        ref: this.setListRef,
                        style: {
                            width: this.state.containerWidth,
                            minHeight: 'calc(100% - 300px)',
                            marginLeft: this.state.movies.length ? '-30px' : '',
                            backgroundImage: this.state.movies.length ? '' : 'url(./assets/imgs/loading.apng)',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            backgroundSize: '5%'
                        } },
                    this.state.movies
                )
            );
        }
    }]);

    return Genre;
}(React.Component);