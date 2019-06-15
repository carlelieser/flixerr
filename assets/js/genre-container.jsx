import Fade from "react-reveal/Fade"
import uniqid from "uniqid";

class GenreContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showArrows: false
        }
    }

    handleResize = () => {
        if (document.querySelector('.movie-list-paginated')) {
            if (this.props.movies.length * 230 > document.querySelector('.movie-list-paginated').offsetWidth) {
                this.setState({showArrows: true});
            } else {
                this.setState({showArrows: false});
            }
        }
    }

    handleOpenGenre = () => {
        this
            .props
            .toggleGenre(true, this.props.name, this.props.genreID);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.movies === nextProps.movies && this.state.showArrows === nextState.showArrows && this.props.name === nextProps.name && this.props.genreID === nextProps.genreID) {
            return false
        } else {
            return true
        }
    }

    componentDidMount() {
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    render() {
        let genreID = 'movie-' + this
            .props
            .name
            .toLowerCase()
            .replace(/ /g, '-');

        return (
            <Fade delay={100} fraction={0.3} distance="20%" bottom>
                <div className="genre-container">
                    <div
                        className={"movie-genre " + (this.props.name == 'Recently Played' || this.props.name == 'Favorites'
                        ? "movie-blocked"
                        : "")}
                        onClick={this.handleOpenGenre}>{this.props.name}</div>
                    {this.state.showArrows
                        ? (
                            <div className="movie-scroll-container" id={genreID}>
                                <div
                                    className="movie-scroll-left"
                                    onClick={e => this
                                    .props
                                    .scrollMovieGenre(true, e, genreID)}>
                                    <i className="mdi mdi-light mdi-24px mdi-chevron-left"/>
                                </div>
                                <div
                                    className="movie-scroll-right"
                                    onClick={e => this
                                    .props
                                    .scrollMovieGenre(false, e, genreID)}>
                                    <i className="mdi mdi-light mdi-24px mdi-chevron-right"/>
                                </div>
                            </div>
                        )
                        : ("")}
                    {this.props.movies
                        ? this.props.movies.length
                            ? (
                                <div className="movie-list-paginated">
                                    {this
                                        .props
                                        .movies
                                        .map((movie, index) => (<MovieItem
                                            movie={movie}
                                            openBox={this.props.openBox}
                                            strip={this.props.strip}
                                            key={uniqid()}/>))}
                                </div>
                            )
                            : ("")
                        : ("")}
                </div>
            </Fade>
        )
    }
}
