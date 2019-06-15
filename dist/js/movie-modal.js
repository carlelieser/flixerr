'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Fade = require('react-reveal/Fade');

var _Fade2 = _interopRequireDefault(_Fade);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MovieModal = function (_React$Component) {
    _inherits(MovieModal, _React$Component);

    function MovieModal(props) {
        _classCallCheck(this, MovieModal);

        var _this = _possibleConstructorReturn(this, (MovieModal.__proto__ || Object.getPrototypeOf(MovieModal)).call(this, props));

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
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            if (this.props.movie === nextProps.movie && this.props.favorites === nextProps.favorites) {
                return false;
            } else {
                return true;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return React.createElement(
                'div',
                {
                    className: 'movie-modal ' + (this.props.movie.averageColor.isLight ? 'light-modal' : 'dark-modal'),
                    style: {
                        backgroundColor: this.props.movie.averageColor.hex,
                        height: this.props.movie ? 500 + this.props.movie.overview.length / 4 + this.props.movie.title.length / 2 + 'px' : '500px'
                    } },
                React.createElement(
                    _Fade2.default,
                    { bottom: true, distance: '20%' },
                    React.createElement(
                        'div',
                        { className: 'movie-modal-info' },
                        React.createElement('div', {
                            className: 'movie-modal-poster',
                            style: {
                                backgroundImage: 'url(https://image.tmdb.org/t/p/w780' + (this.props.movie.poster_path || this.props.movie.backdrop_path) + ')'
                            } }),
                        React.createElement(
                            'div',
                            { className: 'movie-metadata' },
                            React.createElement(
                                'div',
                                { className: 'movie-modal-vote' },
                                React.createElement('i', {
                                    className: 'mdi ' + (this.props.movie.averageColor.isLight ? 'mdi-dark' : 'mdi-light') + ' mdi-star-outline' }),
                                React.createElement(
                                    'div',
                                    null,
                                    this.props.movie.vote_average
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'movie-modal-release-date' },
                                this.props.movie.release_date.substring(0, 4)
                            ),
                            React.createElement('i', {
                                className: 'mdi ' + (this.props.movie.averageColor.isLight ? 'mdi-dark' : 'mdi-light') + ' ' + (this.props.isFavorite(this.props.movie) ? 'mdi-heart' : 'mdi-heart-outline'),
                                onClick: this.handleFavorites })
                        ),
                        React.createElement(
                            'div',
                            { className: 'movie-modal-title' },
                            this.props.movie.title
                        ),
                        React.createElement(
                            'div',
                            { className: 'movie-modal-desc' },
                            this.props.movie.overview
                        ),
                        React.createElement(
                            'div',
                            {
                                className: 'movie-modal-play',
                                onClick: function onClick() {
                                    return _this2.props.playMovie(_this2.props.movie);
                                } },
                            React.createElement('i', { className: 'mdi mdi-play-circle-outline mdi-36px' })
                        )
                    )
                ),
                React.createElement(
                    _Fade2.default,
                    { distance: '10%', top: true },
                    React.createElement('div', {
                        className: 'movie-modal-image',
                        style: {
                            backgroundImage: 'url(https://image.tmdb.org/t/p/w300' + this.props.movie.backdrop_path + ')'
                        } })
                ),
                React.createElement('div', {
                    className: 'movie-gradient',
                    style: {
                        background: this.props.movie.averageColor ? 'linear-gradient(180deg, rgba(' + this.props.movie.averageColor.value[0] + ', ' + this.props.movie.averageColor.value[1] + ', ' + this.props.movie.averageColor.value[2] + ', 0.40) 0%, rgba(' + this.props.movie.averageColor.value[0] + ', ' + this.props.movie.averageColor.value[1] + ', ' + this.props.movie.averageColor.value[2] + ', 0.60) 20%, rgba(' + this.props.movie.averageColor.value[0] + ', ' + this.props.movie.averageColor.value[1] + ', ' + this.props.movie.averageColor.value[2] + ', 0.80) 50%, ' + this.props.movie.averageColor.hex + ' 100%)' : ''
                    } })
            );
        }
    }]);

    return MovieModal;
}(React.Component);