import React, {Component} from "react";

import Fade from "react-reveal/Fade";

class Header extends Component {
    constructor(props) {
        super(props);

        this.searchRef = React.createRef();
        this.searchTimer = false;

        this
            .handleInput
            .bind(this);
        this
            .toggleMenu
            .bind(this);

        this.state = {
            active: false
        }
    }

    activateFocus = () => {
        this.setState({active: true});
    }

    deactivateFocus = () => {
        this.setState({active: false});
    }

    handleQualityControl = () => {
        if (this.props.quality == "HD") {
            this
                .props
                .setQuality("FULL HD");
        } else {
            this
                .props
                .setQuality("HD");
        }
    };

    toggleMenu = (e) => {
        e.stopPropagation();
        this
            .props
            .toggleMenu();
    };

    handleSearch = () => {
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {
            this
                .props
                .searchMovies();
        }, 400);
    };

    handleInput = (e) => {
        let value = e.currentTarget.value;
        this
            .props
            .setInputValue(value);
    };

    handleSearchClose = () => {
        this
            .props
            .closeSearch();
        this
            .searchRef
            .current
            .focus();
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.quality === this.props.quality && nextProps.background === this.props.background && nextProps.inputValue === this.props.inputValue && nextProps.searchContent === this.props.searchContent && nextProps.user === this.props.user && nextProps.subtitle === this.props.subtitle && nextState.active === this.state.active) {
            return false;
        } else {
            return true;
        }
    }

    componentWillUnmount() {
        clearTimeout(this.searchTimer);
    }

    render() {
        let version = require('electron')
            .remote
            .app
            .getVersion();

        return (
            <div className='app-header'>
                <Fade spy={this.props.background} distance='10%' bottom>
                    <div
                        className='app-header-bg-real'
                        style={{
                        backgroundImage: `url(${this.props.background})`
                    }}/>
                </Fade>
                <div className='app-header-bg'>
                    <Fade spy={this.props.user} distance='10%' cascade bottom>
                        <div className='app-header-title'>
                            <div>{`Flixerr v${version} ·`}</div>
                            <div className='user-email'>
                                {this.props.user
                                    ? this.props.user.name || this.props.user.email
                                    : "Guest"}
                            </div>
                        </div>
                    </Fade>
                    <Fade spy={this.props.subtitle} distance='10%' cascade bottom>
                        <div className='app-header-subtitle'>
                            {this.props.subtitle}
                        </div>
                    </Fade>
                    <i
                        className={`app-menu-button mdi mdi-light mdi-${this.props.menuActive
                        ? "keyboard-backspace"
                        : "menu"}`}
                        onClick={this.toggleMenu}
                        style={{
                        transform: `rotate(${this.props.menuActive
                            ? "0"
                            : "360"}deg)`
                    }}/>
                    <div
                        className={`search-bar-container ${this.state.active
                        ? 'search-on'
                        : ''}`}>
                        <i className='mdi mdi-24px mdi-magnify'/>
                        <input
                            ref={this.searchRef}
                            onFocus={this.activateFocus}
                            onBlur={this.deactivateFocus}
                            type='text'
                            placeholder='Search Movies'
                            value={this.props.inputValue}
                            onChange={this.handleInput}
                            onKeyUp={this.handleSearch}/>{" "} {this.props.searchContent
                            ? (<i className='mdi mdi-24px mdi-close' onClick={this.handleSearchClose}/>)
                            : ("")}
                    </div>
                    <div
                        className={`quality ${this.props.quality == "HD"
                        ? "hd-active"
                        : "full-active"}`}>
                        <span>HD</span>
                        <div className='quality-control-container'>
                            <input
                                readOnly
                                checked={this.props.quality == "FULL HD"
                                ? true
                                : false}
                                type='checkbox'
                                name='quality-control'
                                className='quality-control-checkbox'/>
                            <label className='quality-control-label' onClick={this.handleQualityControl}/>
                        </div>
                        <span>FULL HD</span>
                    </div>
                </div>
            </div>
        );
    }
}

export default Header;
