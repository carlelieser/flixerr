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

var Content = function (_React$Component) {
    _inherits(Content, _React$Component);

    function Content(props) {
        _classCallCheck(this, Content);

        var _this = _possibleConstructorReturn(this, (Content.__proto__ || Object.getPrototypeOf(Content)).call(this, props));

        _this.count = 0;

        _this.state = {
            collection: ['Recently Played', 'Favorites']
        };
        return _this;
    }

    _createClass(Content, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps) {
            if (this.props.content == nextProps.content && this.props.searchContent == nextProps.searchContent && this.props.favorites == nextProps.favorites && this.props.recentlyPlayed == nextProps.recentlyPlayed && this.props.results == nextProps.results && this.props.isOffline == nextProps.isOffline) {
                return false;
            } else {
                return true;
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps) {
            if (prevProps.results[0] && this.props.results[0]) {
                if (prevProps.results[0].backdrop_path != this.props.results[0].backdrop_path || this.count === 0) {
                    this.props.setHeader(this.props.getHeader(this.props.results));
                    this.count++;
                }
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            this.genreCollection = this.state.collection.map(function (item) {
                return React.createElement(GenreContainer, { key: (0, _uniqid2.default)(), scrollMovieGenre: _this2.props.scrollMovieGenre, openBox: _this2.props.openBox, strip: _this2.props.strip, name: item, movies: item == 'Favorites' ? _this2.props.favorites : _this2.props.recentlyPlayed });
            });

            return React.createElement(
                "div",
                {
                    className: "content-container" + (this.props.genre || this.props.isOffline ? " movie-content-container" : "") + (this.props.search ? " search-content" : "")
                },
                function () {
                    if (!_this2.props.isOffline) {
                        if (_this2.props.search) {
                            return React.createElement(
                                _Fade2.default,
                                { distance: "10%", bottom: true },
                                React.createElement(
                                    "div",
                                    { className: "search-title" },
                                    "Search Results"
                                )
                            );
                        }
                    }
                }(),
                function () {
                    if (_this2.props.isOffline) {
                        return React.createElement(
                            _Fade2.default,
                            { distance: "10%", bottom: true },
                            React.createElement(
                                "div",
                                { className: "offline-container" },
                                React.createElement("div", { className: "offline-error" }),
                                React.createElement(
                                    "span",
                                    null,
                                    "It looks like you're offline."
                                ),
                                React.createElement(
                                    "span",
                                    null,
                                    "Please check your internet connection and try again."
                                )
                            )
                        );
                    } else {
                        if (_this2.props.search) {
                            return _this2.props.searchContent;
                        } else {
                            if (_this2.props.collectionContainer) {
                                return _this2.genreCollection;
                            } else {
                                if (_this2.props.content) {
                                    return _this2.props.content;
                                } else {
                                    return React.createElement(
                                        _Fade2.default,
                                        { bottom: true },
                                        React.createElement("div", { className: "content-loader" })
                                    );
                                }
                            }
                        }
                    }
                }()
            );
        }
    }]);

    return Content;
}(React.Component);