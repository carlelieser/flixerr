import Fade from "react-reveal/Fade"

class GenreContainer extends React.Component {
    constructor(props) {
        super(props);

        this.movieListRef = React.createRef();

        this.state = {
            permitted: [
                'Suggested for you', 'Recently Played', 'Favorites'
            ],
            showArrows: false,
            movieScrollLeft: false,
            movieScrollRight: true
        }
    }

    easeInOutQuad = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) 
            return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    scrollTo = (to, duration) => {
        return new Promise((resolve, reject) => {
            let start = this.movieListRef.current.scrollLeft,
                change = to - start,
                currentTime = 0,
                increment = 20;

            let animateScroll = () => {
                currentTime += increment;
                let val = this.easeInOutQuad(currentTime, start, change, duration);
                this.movieListRef.current.scrollLeft = val;
                if (currentTime < duration) {
                    setTimeout(animateScroll, increment);
                } else if (currentTime == duration) {
                    resolve();
                }
            }

            animateScroll();
        });
    }

    scrollMovieGenre = (left) => {
        let n = this.props.movies.length;

        let container = this.movieListRef.current,
            scrollVal = container.scrollLeft;

        let viewportW = container.offsetWidth - 50,
            boxW = 230,
            viewItems = Math.ceil(viewportW / boxW) - 1,
            containerScrollWidth = (boxW * n) - viewportW - 30;

        if (left) {
            scrollVal -= boxW * viewItems;
            scrollVal += 15;
        } else {
            scrollVal += boxW * viewItems;
            scrollVal -= 15;
        }

        if (scrollVal > (containerScrollWidth - 30) && scrollVal < containerScrollWidth) {
            scrollVal = containerScrollWidth;
        }

        this
            .scrollTo(scrollVal, 200)
            .then(() => {
                if (container.scrollLeft + container.offsetWidth >= container.scrollWidth - 20) {
                    this.setState({movieScrollRight: false});
                    this.setState({movieScrollLeft: true});
                } else if (container.scrollLeft === 0) {
                    this.setState({movieScrollRight: true});
                    this.setState({movieScrollLeft: false});
                } else {
                    this.setState({movieScrollRight: true});
                    this.setState({movieScrollLeft: true});
                }
            });
    }

    scrollLeft = () => {
        this.scrollMovieGenre(true);
    }

    scrollRight = () => {
        this.scrollMovieGenre();
    }

    handleResize = () => {
        if (this.movieListRef.current) {
            if (this.props.movies) {
                if (this.props.movies.length * 230 > this.movieListRef.current.offsetWidth) {
                    this.setState({showArrows: true});
                } else {
                    this.setState({showArrows: false});
                }

            }
        }
    }

    handleOpenGenre = () => {
        if (this.props.toggleGenre) {
            this
                .props
                .toggleGenre(true, this.props.name, this.props.genreID);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.movies === nextProps.movies && this.state.showArrows === nextState.showArrows && this.props.name === nextProps.name && this.props.genreID === nextProps.genreID && this.state.movieScrollLeft === nextState.movieScrollLeft && this.state.movieScrollRight === nextState.movieScrollRight) {
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

        return (
            <Fade fraction={0.3} distance="20%" bottom>
                <div className="genre-container">
                    <div
                        className={`movie-genre ${this
                        .state
                        .permitted
                        .indexOf(this.props.name) > -1
                        ? 'movie-blocked'
                        : ''}`}
                        onClick={this.handleOpenGenre}>
                        <span>{this.props.name}</span>
                    </div>
                    {this.state.showArrows
                        ? (
                            <div className="movie-scroll-container">
                                {this.state.movieScrollLeft
                                    ? <div className="movie-scroll movie-scroll-left" onClick={this.scrollLeft}>
                                            <i className="mdi mdi-light mdi-24px mdi-chevron-left"/>
                                        </div>
                                    : ''}
                                {this.state.movieScrollRight
                                    ? <div className="movie-scroll movie-scroll-right" onClick={this.scrollRight}>
                                            <i className="mdi mdi-light mdi-24px mdi-chevron-right"/>
                                        </div>
                                    : ''}
                            </div>
                        )
                        : ("")}
                    {this.props.movies
                        ? this.props.movies.length
                            ? (
                                <div className="movie-list-paginated" ref={this.movieListRef}>
                                    {this.props.movies}
                                </div>
                            )
                            : ("")
                        : ("")}
                </div>
            </Fade>
        )
    }
}
