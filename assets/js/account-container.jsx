import React, { Component } from 'react'

import Fade from 'react-reveal/Fade'

class AccountContainer extends Component {
    constructor(props) {
        super(props)

        this.handleInput.bind(this)

        this.state = {
            accountModalInfo: {
                create: {
                    title: 'Create an account',
                    desc:
                        'Register to easily synchronize data across multiple devices.',
                    submit: {
                        text: 'Create',
                        action: this.props.handleAccountCreation,
                    },
                    secondary: {
                        text: 'Login',
                        action: this.props.openAccount,
                    },
                },
                login: {
                    title: 'Login',
                    desc:
                        'Flixerr will use your account to synchronize data across all your devices.',
                    submit: {
                        text: 'Login',
                        action: this.props.handleAccountSignin,
                    },
                    secondary: {
                        text: 'Sign Up',
                        action: this.props.openAccountCreation,
                    },
                },
            },
            showContainer: true,
            active: 'login',
        }
    }

    handleInput = (e) => {
        if (e.keyCode == 13) {
            this.state.accountModalInfo[this.state.active].submit.action()
        } else {
            this.props.handleInput(e)
        }
    }

    initalizeAnimation = () => {
        this.setState(
            {
                showContainer: false,
            },
            () => {
                setTimeout(() => {
                    this.setState({ showContainer: true })
                }, 250)
            }
        )
    }

    setActive = () => {
        let active = this.props.account ? 'login' : 'create'
        this.setState({ active })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.account != this.props.account) {
            this.initalizeAnimation()
            this.setActive()
        }
    }

    componentDidMount() {
        this.setActive()
    }

    render() {
        let accountInfo = this.state.accountModalInfo[this.state.active]
        return (
            <div className="account-container">
                <Fade
                    duration={250}
                    when={this.state.showContainer}
                    distance="5%"
                    left
                    opposite
                >
                    <div className="account-form">
                        <div
                            className="account-close"
                            onClick={this.props.closeAccount}
                        >
                            <i className="mdi mdi-close" />
                        </div>
                        <div className="account-title">{accountInfo.title}</div>
                        <div className="account-desc">{accountInfo.desc}</div>
                        <input
                            type="email"
                            placeholder="Email"
                            autoFocus={true}
                            required
                            onKeyUp={this.handleInput}
                        />
                        <span />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            onKeyUp={this.handleInput}
                        />
                        <span />
                        <Fade
                            mountOnEnter
                            unmountonExit
                            spy={this.props.loginError}
                            when={this.props.loginError}
                            bottom
                            distance="5%"
                        >
                            <div className="login-error">
                                {this.props.loginError}
                            </div>
                        </Fade>
                        <div
                            className="account-submit"
                            onClick={accountInfo.submit.action}
                        >
                            {accountInfo.submit.text}
                        </div>
                        <div className="divider" />
                        <div
                            className="account-submit account-secondary"
                            onClick={accountInfo.secondary.action}
                        >
                            {accountInfo.secondary.text}
                        </div>
                    </div>
                </Fade>
            </div>
        )
    }
}

export default AccountContainer
