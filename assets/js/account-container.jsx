import React, {Component} from 'react'

import Fade from 'react-reveal/Fade'

class AccountContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            accountModalInfo: {
                create: {
                    title: 'Create an account',
                    desc: 'Register to easily synchronize data across multiple devices.',
                    submit: {
                        text: 'Create',
                        action: this.props.handleAccountCreation
                    },
                    secondary: {
                        text: 'Login',
                        action: this.props.openAccount
                    }
                },
                login: {
                    title: 'Login',
                    desc: 'Flixerr will use your account to synchronize data across all your devices.',
                    submit: {
                        text: 'Login',
                        action: this.props.handleAccountSignin
                    },
                    secondary: {
                        text: 'Sign Up',
                        action: this.props.openAccountCreation
                    }
                }
            },
            showContainer: true
        }
    }

    initalizeAnimation = () => {
        this.setState({
            showContainer: false
        }, () => {
            setTimeout(() => {
                this.setState({showContainer: true});
            }, 250);
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.account != this.props.account) {
            this.initalizeAnimation();
        }
    }

    render() {
        let active = this.props.account
            ? this.state.accountModalInfo.login
            : this.state.accountModalInfo.create;

        return (
            <div className='account-container'>
                <Fade
                    duration={250}
                    when={this.state.showContainer}
                    distance="5%"
                    left
                    opposite>
                    <div className='account-form'>
                        <div className='account-close' onClick={this.props.closeAccount}>
                            <i className='mdi mdi-close'/>
                        </div>
                        <div className='account-title'>{active.title}</div>
                        <div className='account-desc'>{active.desc}</div>
                        <input
                            type='email'
                            placeholder='Email'
                            autoFocus={true}
                            required
                            onKeyUp={this.props.handleInput}/>
                        <span/>
                        <input
                            type='password'
                            placeholder='Password'
                            required
                            onKeyUp={this.props.handleInput}/>
                        <span/>
                        <Fade
                            mountOnEnter
                            unmountonExit
                            spy={this.props.loginError}
                            when={this.props.loginError}
                            bottom
                            distance='5%'>
                            <div className='login-error'>
                                {this.props.loginError}
                            </div>
                        </Fade>
                        <div className='account-submit' onClick={active.submit.action}>{active.submit.text}</div>
                        <div className='divider'/>
                        <div
                            className='account-submit account-secondary'
                            onClick={active.secondary.action}>
                            {active.secondary.text}
                        </div>
                    </div>
                </Fade>
            </div>
        )
    }
}

export default AccountContainer