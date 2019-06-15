'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _uniqid = require('uniqid');

var _uniqid2 = _interopRequireDefault(_uniqid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Menu = function (_React$Component) {
    _inherits(Menu, _React$Component);

    function Menu(props) {
        _classCallCheck(this, Menu);

        var _this = _possibleConstructorReturn(this, (Menu.__proto__ || Object.getPrototypeOf(Menu)).call(this, props));

        _this.toggleItem = function (e, item) {
            e.stopPropagation();
            _this.props.updateMenu(false, item);
            document.querySelector(".app-menu-button").style.transform = "rotate(0deg)";
            _this.props.resetSearch();
        };

        _this.icons = ['star', 'filmstrip', 'library', 'account-circle'];
        return _this;
    }

    _createClass(Menu, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var menuItems = this.props.menu.map(function (item, index) {
                return React.createElement(
                    'div',
                    {
                        className: 'menu-item ' + (_this2.props.active == item ? "menu-active" : ""),
                        key: (0, _uniqid2.default)(),
                        onClick: function onClick(e) {
                            if (index == _this2.props.menu.length - 1) {
                                if (_this2.props.user) {
                                    _this2.props.signOut();
                                } else {
                                    _this2.props.openAccount();
                                }
                            } else {
                                _this2.toggleItem(e, item);
                            }
                        } },
                    React.createElement('i', { className: 'mdi mdi-' + _this2.icons[index] }),
                    React.createElement(
                        'div',
                        null,
                        _this2.props.user ? index == _this2.props.menu.length - 1 ? 'Sign Out' : item : index == _this2.props.menu.length ? 'Sign In' : item
                    )
                );
            });

            return React.createElement(
                'div',
                { className: 'app-menu' },
                menuItems
            );
        }
    }]);

    return Menu;
}(React.Component);