'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Fade = require('react-reveal/Fade');

var _Fade2 = _interopRequireDefault(_Fade);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AccountContainer = function (_Component) {
    _inherits(AccountContainer, _Component);

    function AccountContainer(props) {
        _classCallCheck(this, AccountContainer);

        var _this = _possibleConstructorReturn(this, (AccountContainer.__proto__ || Object.getPrototypeOf(AccountContainer)).call(this, props));

        _this.handleInput = function (e) {
            if (e.keyCode == 13) {
                _this.state.accountModalInfo[_this.state.active].submit.action();
            } else {
                _this.props.handleInput(e);
            }
        };

        _this.initalizeAnimation = function () {
            _this.setState({
                showContainer: false
            }, function () {
                setTimeout(function () {
                    _this.setState({ showContainer: true });
                }, 250);
            });
        };

        _this.setActive = function () {
            var active = _this.props.account ? 'login' : 'create';
            _this.setState({ active: active });
        };

        _this.handleInput.bind(_this);

        _this.state = {
            accountModalInfo: {
                create: {
                    title: 'Create an account',
                    desc: 'Register to easily synchronize data across multiple devices.',
                    submit: {
                        text: 'Create',
                        action: _this.props.handleAccountCreation
                    },
                    secondary: {
                        text: 'Login',
                        action: _this.props.openAccount
                    }
                },
                login: {
                    title: 'Login',
                    desc: 'Flixerr will use your account to synchronize data across all your devices.',
                    submit: {
                        text: 'Login',
                        action: _this.props.handleAccountSignin
                    },
                    secondary: {
                        text: 'Sign Up',
                        action: _this.props.openAccountCreation
                    }
                }
            },
            showContainer: true,
            active: 'login'
        };
        return _this;
    }

    _createClass(AccountContainer, [{
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            if (prevProps.account != this.props.account) {
                this.initalizeAnimation();
                this.setActive();
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.setActive();
        }
    }, {
        key: 'render',
        value: function render() {
            var accountInfo = this.state.accountModalInfo[this.state.active];
            return _react2.default.createElement(
                'div',
                { className: 'account-container' },
                _react2.default.createElement(
                    _Fade2.default,
                    {
                        duration: 250,
                        when: this.state.showContainer,
                        distance: '5%',
                        left: true,
                        opposite: true },
                    _react2.default.createElement(
                        'div',
                        { className: 'account-form' },
                        _react2.default.createElement(
                            'div',
                            { className: 'account-close', onClick: this.props.closeAccount },
                            _react2.default.createElement('i', { className: 'mdi mdi-close' })
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'account-title' },
                            accountInfo.title
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'account-desc' },
                            accountInfo.desc
                        ),
                        _react2.default.createElement('input', {
                            type: 'email',
                            placeholder: 'Email',
                            autoFocus: true,
                            required: true,
                            onKeyUp: this.handleInput }),
                        _react2.default.createElement('span', null),
                        _react2.default.createElement('input', {
                            type: 'password',
                            placeholder: 'Password',
                            required: true,
                            onKeyUp: this.handleInput }),
                        _react2.default.createElement('span', null),
                        _react2.default.createElement(
                            _Fade2.default,
                            {
                                mountOnEnter: true,
                                unmountonExit: true,
                                spy: this.props.loginError,
                                when: this.props.loginError,
                                bottom: true,
                                distance: '5%' },
                            _react2.default.createElement(
                                'div',
                                { className: 'login-error' },
                                this.props.loginError
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'account-submit', onClick: accountInfo.submit.action },
                            accountInfo.submit.text
                        ),
                        _react2.default.createElement('div', { className: 'divider' }),
                        _react2.default.createElement(
                            'div',
                            {
                                className: 'account-submit account-secondary',
                                onClick: accountInfo.secondary.action },
                            accountInfo.secondary.text
                        )
                    )
                )
            );
        }
    }]);

    return AccountContainer;
}(_react.Component);

exports.default = AccountContainer;