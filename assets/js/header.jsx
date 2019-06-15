import Fade from "react-reveal/Fade";
class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            timer: false
        }
    }

    toggleMenu = e => {
        e.stopPropagation();
        this
            .props
            .updateMenu(!this.props.menuActive);
        e.target.style.transform = `rotate(${this.props.menuActive
            ? "0"
            : "360"}deg)`;
    }

    handleSearch = () => {
        clearTimeout(this.state.timer);
        this.setState({timer: setTimeout(() => {
                this
                    .props
                    .searchMovies();
            }, 500)});
    }

    componentWillUnmount() {
        clearTimeout(this.state.timer);
    }

    render() {
        return (
            <div className="app-header">
                <Fade delay={20} distance="20%" spy={this.props.background} bottom>
                    <div
                        className="app-header-bg-real"
                        style={{
                        backgroundImage: `${this.props.background
                            ? "url(https://image.tmdb.org/t/p/original" + this.props.background
                            : ""}`
                    }}></div>
                </Fade>
                <div className="app-header-bg">
                    <Fade spy={this.props.user} distance="10%" bottom>
                        <div className="app-header-title">
                            <div>Flixerr /
                            </div>
                            <div className="user-email">{this.props.user
                                    ? this.props.user.name || this.props.user.email
                                    : 'Guest'}</div>
                        </div>
                    </Fade>
                    <Fade spy={this.props.subtitle} distance="10%" bottom>
                        <div className="app-header-subtitle">
                            {this.props.subtitle}
                        </div>
                    </Fade>
                    <i
                        className={`app-menu-button mdi mdi-light mdi-${this.props.menuActive
                        ? "keyboard-backspace"
                        : "menu"}`}
                        onClick={this.toggleMenu}/>
                    <div className="search-bar-container">
                        <i className="mdi mdi-24px mdi-magnify"/>
                        <input type="text" placeholder="Search Movies" onKeyUp={this.handleSearch}/>{" "} {this.props.searchContent
                            ? (<i className="mdi mdi-24px mdi-close" onClick={this.props.closeSearch}/>)
                            : ("")}
                    </div>
                </div>
            </div>
        );
    }
}
