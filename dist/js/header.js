"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _Fade = require("react-reveal/Fade");

var _Fade2 = _interopRequireDefault(_Fade);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Header = function (_Component) {
    _inherits(Header, _Component);

    function Header(props) {
        _classCallCheck(this, Header);

        var _this = _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).call(this, props));

        _this.activateFocus = function () {
            _this.setState({ active: true });
        };

        _this.deactivateFocus = function () {
            _this.setState({ active: false });
        };

        _this.handleQualityControl = function () {
            if (_this.props.quality == "HD") {
                _this.props.setQuality("FULL HD");
            } else {
                _this.props.setQuality("HD");
            }
        };

        _this.toggleMenu = function (e) {
            e.stopPropagation();
            _this.props.toggleMenu();
        };

        _this.handleSearch = function () {
            clearTimeout(_this.searchTimer);
            _this.searchTimer = setTimeout(function () {
                _this.props.searchMovies();
            }, 400);
        };

        _this.handleInput = function (e) {
            var value = e.currentTarget.value;
            _this.props.setInputValue(value);
        };

        _this.handleSearchClose = function () {
            _this.props.closeSearch();
            _this.searchRef.current.focus();
        };

        _this.searchRef = _react2.default.createRef();
        _this.searchTimer = false;

        _this.handleInput.bind(_this);
        _this.toggleMenu.bind(_this);

        _this.state = {
            active: false
        };
        return _this;
    }

    _createClass(Header, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            if (nextProps.quality === this.props.quality && nextProps.background === this.props.background && nextProps.inputValue === this.props.inputValue && nextProps.searchContent === this.props.searchContent && nextProps.user === this.props.user && nextProps.subtitle === this.props.subtitle && nextState.active === this.state.active) {
                return false;
            } else {
                return true;
            }
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            clearTimeout(this.searchTimer);
        }
    }, {
        key: "render",
        value: function render() {
            var imageURL = this.props.background ? "https://image.tmdb.org/t/p/original" + this.props.background : "./assets/imgs/account-bg.png";

            var version = require('electron').remote.app.getVersion();

            return _react2.default.createElement(
                "div",
                { className: "app-header" },
                _react2.default.createElement(
                    _Fade2.default,
                    { spy: imageURL, distance: "10%", bottom: true },
                    _react2.default.createElement("div", {
                        className: "app-header-bg-real",
                        style: {
                            backgroundImage: "url(" + imageURL + ")"
                        } })
                ),
                _react2.default.createElement(
                    "div",
                    { className: "app-header-bg" },
                    _react2.default.createElement(
                        _Fade2.default,
                        { spy: this.props.user, distance: "10%", cascade: true, bottom: true },
                        _react2.default.createElement(
                            "div",
                            { className: "app-header-title" },
                            _react2.default.createElement(
                                "div",
                                null,
                                "Flixerr v" + version + " \xB7"
                            ),
                            _react2.default.createElement(
                                "div",
                                { className: "user-email" },
                                this.props.user ? this.props.user.name || this.props.user.email : "Guest"
                            )
                        )
                    ),
                    _react2.default.createElement(
                        _Fade2.default,
                        { spy: this.props.subtitle, distance: "10%", cascade: true, bottom: true },
                        _react2.default.createElement(
                            "div",
                            { className: "app-header-subtitle" },
                            this.props.subtitle
                        )
                    ),
                    _react2.default.createElement("i", {
                        className: "app-menu-button mdi mdi-light mdi-" + (this.props.menuActive ? "keyboard-backspace" : "menu"),
                        onClick: this.toggleMenu,
                        style: {
                            transform: "rotate(" + (this.props.menuActive ? "0" : "360") + "deg)"
                        } }),
                    _react2.default.createElement(
                        "div",
                        { className: "search-bar-container " + (this.state.active ? 'search-on' : '') },
                        _react2.default.createElement("i", { className: "mdi mdi-24px mdi-magnify" }),
                        _react2.default.createElement("input", {
                            ref: this.searchRef,
                            onFocus: this.activateFocus,
                            onBlur: this.deactivateFocus,
                            type: "text",
                            placeholder: "Search Movies",
                            value: this.props.inputValue,
                            onChange: this.handleInput,
                            onKeyUp: this.handleSearch }),
                        " ",
                        " ",
                        this.props.searchContent ? _react2.default.createElement("i", { className: "mdi mdi-24px mdi-close", onClick: this.handleSearchClose }) : ""
                    ),
                    _react2.default.createElement(
                        "div",
                        {
                            className: "quality " + (this.props.quality == "HD" ? "hd-active" : "full-active") },
                        _react2.default.createElement(
                            "span",
                            null,
                            "HD"
                        ),
                        _react2.default.createElement(
                            "div",
                            { className: "quality-control-container" },
                            _react2.default.createElement("input", {
                                readOnly: true,
                                checked: this.props.quality == "FULL HD" ? true : false,
                                type: "checkbox",
                                name: "quality-control",
                                className: "quality-control-checkbox" }),
                            _react2.default.createElement("label", { className: "quality-control-label", onClick: this.handleQualityControl })
                        ),
                        _react2.default.createElement(
                            "span",
                            null,
                            "FULL HD"
                        )
                    )
                )
            );
        }
    }]);

    return Header;
}(_react.Component);

exports.default = Header;