"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _Fade = require("react-reveal/Fade");

var _Fade2 = _interopRequireDefault(_Fade);

var _movieContainer = require("./movie-container");

var _movieContainer2 = _interopRequireDefault(_movieContainer);

var _collectionContainer = require("./collection-container");

var _collectionContainer2 = _interopRequireDefault(_collectionContainer);

var _featuredContainer = require("./featured-container");

var _featuredContainer2 = _interopRequireDefault(_featuredContainer);

var _searchContainer = require("./search-container");

var _searchContainer2 = _interopRequireDefault(_searchContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Content = function (_Component) {
    _inherits(Content, _Component);

    function Content(props) {
        _classCallCheck(this, Content);

        var _this = _possibleConstructorReturn(this, (Content.__proto__ || Object.getPrototypeOf(Content)).call(this, props));

        _this.getActiveContainer = function () {
            switch (_this.props.active) {
                case "Featured":
                    return _react2.default.createElement(_featuredContainer2.default, {
                        offline: _this.props.offline,
                        featured: _this.props.featured,
                        loadFeatured: _this.props.loadFeatured,
                        openBox: _this.props.openBox,
                        setHeader: _this.props.setHeaderBackground });
                case "Movies":
                    return _react2.default.createElement(_movieContainer2.default, {
                        offline: _this.props.offline,
                        movies: _this.props.movies,
                        toggleGenre: _this.props.toggleGenre,
                        openBox: _this.props.openBox,
                        loadMovieCategories: _this.props.loadMovieCategories,
                        setHeader: _this.props.setHeaderBackground });
                case "Collection":
                    return _react2.default.createElement(_collectionContainer2.default, {
                        suggested: _this.props.suggested,
                        favorites: _this.props.favorites,
                        recentlyPlayed: _this.props.recentlyPlayed,
                        updateSuggested: _this.props.updateSuggested,
                        openBox: _this.props.openBox,
                        setHeader: _this.props.setHeaderBackground,
                        toggleGenre: _this.props.toggleGenre });
            }
        };

        _this.getOfflineContainer = function () {
            return _react2.default.createElement(
                _Fade2.default,
                { distance: "10%", bottom: true },
                _react2.default.createElement(
                    "div",
                    { className: "offline-container" },
                    _react2.default.createElement("div", { className: "offline-error" }),
                    _react2.default.createElement(
                        "span",
                        null,
                        "It looks like you're offline."
                    ),
                    _react2.default.createElement(
                        "span",
                        null,
                        "Please check your internet connection and try again."
                    )
                )
            );
        };

        _this.getSearchContainer = function () {
            var search = _react2.default.createElement(_searchContainer2.default, {
                setHeader: _this.props.setHeaderBackground,
                searchContent: _this.props.searchContent,
                openBox: _this.props.openBox });
            return search;
        };

        return _this;
    }

    _createClass(Content, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            if (nextProps.active === "Featured") {
                if (nextProps.featured === this.props.featured && nextProps.active === this.props.active && nextProps.offline === this.props.offline && nextProps.searchContent === this.props.searchContent) {
                    return false;
                } else {
                    return true;
                }
            } else if (nextProps.active === "Movies") {
                if (nextProps.movies === this.props.movies && nextProps.active === this.props.active && nextProps.offline === this.props.offline && nextProps.searchContent === this.props.searchContent) {
                    return false;
                } else {
                    return true;
                }
            } else if (nextProps.active === "Collection") {
                if (nextProps.suggested === this.props.suggested && nextProps.favorites === this.props.favorites && nextProps.recentlyPlayed === this.props.recentlyPlayed && nextProps.active === this.props.active && nextProps.offline === this.props.offline && nextProps.searchContent === this.props.searchContent) {
                    return false;
                } else {
                    return true;
                }
            }
        }
    }, {
        key: "render",
        value: function render() {
            var activeContainer = this.getActiveContainer(),
                offlineContainer = this.getOfflineContainer(),
                searchContainer = this.getSearchContainer();

            return _react2.default.createElement(
                "div",
                {
                    className: "content-container",
                    style: {
                        display: this.props.active == "Featured" ? "flex" : "block",
                        padding: this.props.active === "Featured" ? "40px 40px" : "40px 60px",
                        backgroundImage: this.props.loadingContent ? "url(./assets/imgs/loading.apng)" : ""
                    } },
                this.props.loadingContent ? "" : this.props.offline ? offlineContainer : this.props.searchContent ? searchContainer : activeContainer
            );
        }
    }]);

    return Content;
}(_react.Component);

exports.default = Content;