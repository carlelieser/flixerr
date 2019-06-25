"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _uniqid = require("uniqid");

var _uniqid2 = _interopRequireDefault(_uniqid);

var _genreContainer = require("./genre-container");

var _genreContainer2 = _interopRequireDefault(_genreContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Collection = function (_Component) {
    _inherits(Collection, _Component);

    function Collection(props) {
        _classCallCheck(this, Collection);

        var _this = _possibleConstructorReturn(this, (Collection.__proto__ || Object.getPrototypeOf(Collection)).call(this, props));

        _this.checkSuggested = function () {
            if (_this.props.suggested) {
                if (!_this.props.suggested.length) {
                    _this.props.updateSuggested();
                }
            } else {
                _this.props.updateSuggested();
            }
        };

        _this.setHeader = function () {
            for (var i = 0; i < _this.state.collection.length; i++) {
                var target = _this.state.collection[i].target;
                if (_this.props[target]) {
                    if (_this.props[target].length) {
                        _this.props.setHeader(_this.props[target][0].flixerr_data.backdrop_path);
                        return;
                    }
                }
            }
        };

        _this.state = {
            collection: [{
                name: "Suggestions",
                target: "suggested"
            }, {
                name: "Recents",
                target: "recentlyPlayed"
            }, {
                name: "Favorites",
                target: "favorites"
            }]
        };
        return _this;
    }

    _createClass(Collection, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            if (nextProps.suggested === this.props.suggested && nextProps.favorites === this.props.favorites && nextProps.recentlyPlayed === this.props.recentlyPlayed) {
                return false;
            } else {
                return true;
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps, prevState) {
            if (prevProps.suggested !== this.props.suggested) {
                this.setHeader();
            }
            this.checkSuggested();
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.checkSuggested();
            this.setHeader();
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var genreCollection = this.state.collection.map(function (item) {

                var genreInfo = {
                    showCollection: true,
                    activeGenre: item.name,
                    target: item.target,
                    movies: _this2.props[item.target] ? _this2.props[item.target] : []
                };

                return _react2.default.createElement(_genreContainer2.default, {
                    key: (0, _uniqid2.default)(),
                    genreInfo: genreInfo,
                    toggleGenre: _this2.props.toggleGenre,
                    openBox: _this2.props.openBox });
            });

            return _react2.default.createElement(
                "div",
                { className: "collection-container" },
                genreCollection
            );
        }
    }]);

    return Collection;
}(_react.Component);

exports.default = Collection;