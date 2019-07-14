"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _uniqid = require("uniqid");

var _uniqid2 = _interopRequireDefault(_uniqid);

var _menuItem = require("./menu-item");

var _menuItem2 = _interopRequireDefault(_menuItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Menu = function (_Component) {
    _inherits(Menu, _Component);

    function Menu(props) {
        _classCallCheck(this, Menu);

        var _this = _possibleConstructorReturn(this, (Menu.__proto__ || Object.getPrototypeOf(Menu)).call(this, props));

        _this.toggleItem = function (item) {
            _this.props.updateMenu(item);
            _this.props.resetSearch();
        };

        _this.state = {
            menu: [{
                name: 'Featured',
                icon: 'star'
            }, {
                name: 'Movies',
                icon: 'filmstrip'
            }, {
                name: 'TV Shows',
                icon: 'youtube-tv',
                beta: true
            }, {
                name: 'Collection',
                icon: 'library'
            }, {
                name: _this.props.user ? 'Sign Out' : 'Sign In',
                icon: 'account-circle',
                action: _this.props.user ? _this.props.signOut : _this.props.openAccount
            }]
        };
        return _this;
    }

    _createClass(Menu, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            if (nextProps.user !== this.props.user) {
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var menuItems = this.state.menu.map(function (item, index) {
                var active = _this2.props.active == item.name ? true : false;

                return _react2.default.createElement(_menuItem2.default, {
                    item: item,
                    active: active,
                    toggleItem: _this2.toggleItem,
                    key: (0, _uniqid2.default)() });
            });

            return _react2.default.createElement(
                "div",
                { className: "app-menu" },
                menuItems
            );
        }
    }]);

    return Menu;
}(_react.Component);

exports.default = Menu;