'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SubtitleItem = function (_Component) {
    _inherits(SubtitleItem, _Component);

    function SubtitleItem(props) {
        _classCallCheck(this, SubtitleItem);

        var _this = _possibleConstructorReturn(this, (SubtitleItem.__proto__ || Object.getPrototypeOf(SubtitleItem)).call(this, props));

        _this.handleSubtitle = function () {
            _this.props.setSubtitleData(_this.props.item);
            _this.props.setActiveSubtitle(_this.props.item);
        };

        return _this;
    }

    _createClass(SubtitleItem, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps) {
            if (nextProps.active === this.props.active && nextProps.item === this.props.item) {
                return false;
            } else {
                return true;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                {
                    className: 'subtitle-item ' + (this.props.active ? 'active-subtitle' : ''),
                    onClick: this.handleSubtitle },
                _react2.default.createElement(
                    'div',
                    { className: 'subtitle-language' },
                    this.props.item.language
                ),
                this.props.active ? _react2.default.createElement('i', { className: 'mdi mdi-checkbox-blank-circle mdi-light' }) : ''
            );
        }
    }]);

    return SubtitleItem;
}(_react.Component);

exports.default = SubtitleItem;