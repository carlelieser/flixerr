"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _uniqid = require("uniqid");

var _uniqid2 = _interopRequireDefault(_uniqid);

var _reactLazyLoad = require("react-lazy-load");

var _reactLazyLoad2 = _interopRequireDefault(_reactLazyLoad);

var _movieItem = require("./movie-item");

var _movieItem2 = _interopRequireDefault(_movieItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FeaturedContainer = function (_Component) {
    _inherits(FeaturedContainer, _Component);

    function FeaturedContainer(props) {
        _classCallCheck(this, FeaturedContainer);

        var _this = _possibleConstructorReturn(this, (FeaturedContainer.__proto__ || Object.getPrototypeOf(FeaturedContainer)).call(this, props));

        _this.getFeatured = function () {
            if (_this.props.featured.length === 0) {
                _this.props.loadFeatured();
            }
        };

        return _this;
    }

    _createClass(FeaturedContainer, [{
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps, prevState) {
            if (this.props.featured) {
                if (!this.props.featured.length) {
                    this.getFeatured();
                }
            }

            if (prevProps.featured !== this.props.featured) {
                this.props.setHeader(this.props.featured);
            }
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.getFeatured();
            this.props.setHeader(this.props.featured);
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var featuredMovies = this.props.featured.map(function (movie) {
                return _react2.default.createElement(_movieItem2.default, {
                    movie: movie,
                    fallback: true,
                    key: (0, _uniqid2.default)(),
                    openBox: _this2.props.openBox });
            });

            return _react2.default.createElement(
                "div",
                { className: "featured-container" },
                featuredMovies
            );
        }
    }]);

    return FeaturedContainer;
}(_react.Component);

exports.default = FeaturedContainer;