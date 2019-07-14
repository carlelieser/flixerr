'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _episode = require('./episode');

var _episode2 = _interopRequireDefault(_episode);

var _Fade = require('react-reveal/Fade');

var _Fade2 = _interopRequireDefault(_Fade);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Season = function (_Component) {
    _inherits(Season, _Component);

    function Season(props) {
        _classCallCheck(this, Season);

        var _this = _possibleConstructorReturn(this, (Season.__proto__ || Object.getPrototypeOf(Season)).call(this, props));

        _this.handleStreamEpisode = function (episode) {
            _this.props.playMovie(episode, true);
        };

        _this.toggleCollapse = function () {
            _this.setState(function (prevState) {
                return {
                    collapsed: !prevState.collapsed
                };
            });
        };

        _this.state = {
            collapsed: true
        };
        return _this;
    }

    _createClass(Season, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var episodes = this.props.season.episodes.map(function (episode, index) {
                return _react2.default.createElement(_episode2.default, {
                    handleStreamEpisode: _this2.handleStreamEpisode,
                    episode: episode,
                    isLightClass: _this2.props.isLightClass });
            });

            return _react2.default.createElement(
                'div',
                { className: 'season', onClick: this.toggleCollapse },
                _react2.default.createElement(
                    'div',
                    { className: 'season-title' },
                    _react2.default.createElement(
                        'div',
                        null,
                        this.props.season.name
                    ),
                    _react2.default.createElement('i', {
                        className: 'mdi ' + this.props.isLightClass + ' ' + (this.state.collapsed ? 'mdi-menu-down arrow-collapse' : 'mdi-menu-up') })
                ),
                _react2.default.createElement(
                    _Fade2.default,
                    { when: !this.state.collapsed, duration: 450, distance: '1%', top: true },
                    _react2.default.createElement(
                        'div',
                        {
                            className: 'episodes ' + (this.state.collapsed ? 'episodes-collapsed' : '') },
                        episodes
                    )
                )
            );
        }
    }]);

    return Season;
}(_react.Component);

exports.default = Season;