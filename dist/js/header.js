"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Fade = require("react-reveal/Fade");

var _Fade2 = _interopRequireDefault(_Fade);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Header = function (_React$Component) {
    _inherits(Header, _React$Component);

    function Header(props) {
        _classCallCheck(this, Header);

        var _this = _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).call(this, props));

        _this.toggleMenu = function (e) {
            e.stopPropagation();
            _this.props.updateMenu(!_this.props.menuActive);
            e.target.style.transform = "rotate(" + (_this.props.menuActive ? "0" : "360") + "deg)";
        };

        _this.handleSearch = function () {
            clearTimeout(_this.state.timer);
            _this.setState({ timer: setTimeout(function () {
                    _this.props.searchMovies();
                }, 500) });
        };

        _this.state = {
            timer: false
        };
        return _this;
    }

    _createClass(Header, [{
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            clearTimeout(this.state.timer);
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "app-header" },
                React.createElement(
                    _Fade2.default,
                    { delay: 20, distance: "20%", spy: this.props.background, bottom: true },
                    React.createElement("div", {
                        className: "app-header-bg-real",
                        style: {
                            backgroundImage: "" + (this.props.background ? "url(https://image.tmdb.org/t/p/original" + this.props.background : "")
                        } })
                ),
                React.createElement(
                    "div",
                    { className: "app-header-bg" },
                    React.createElement(
                        _Fade2.default,
                        { spy: this.props.user, distance: "10%", bottom: true },
                        React.createElement(
                            "div",
                            { className: "app-header-title" },
                            React.createElement(
                                "div",
                                null,
                                "Flixerr /"
                            ),
                            React.createElement(
                                "div",
                                { className: "user-email" },
                                this.props.user ? this.props.user.name || this.props.user.email : 'Guest'
                            )
                        )
                    ),
                    React.createElement(
                        _Fade2.default,
                        { spy: this.props.subtitle, distance: "10%", bottom: true },
                        React.createElement(
                            "div",
                            { className: "app-header-subtitle" },
                            this.props.subtitle
                        )
                    ),
                    React.createElement("i", {
                        className: "app-menu-button mdi mdi-light mdi-" + (this.props.menuActive ? "keyboard-backspace" : "menu"),
                        onClick: this.toggleMenu }),
                    React.createElement(
                        "div",
                        { className: "search-bar-container" },
                        React.createElement("i", { className: "mdi mdi-24px mdi-magnify" }),
                        React.createElement("input", { type: "text", placeholder: "Search Movies", onKeyUp: this.handleSearch }),
                        " ",
                        " ",
                        this.props.searchContent ? React.createElement("i", { className: "mdi mdi-24px mdi-close", onClick: this.props.closeSearch }) : ""
                    )
                )
            );
        }
    }]);

    return Header;
}(React.Component);