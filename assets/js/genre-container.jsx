import React, {Component} from "react";

import Fade from "react-reveal/Fade";
import LazyLoad from "react-lazy-load";
import pluralize from "pluralize";

import MovieItem from "./movie-item";

class GenreContainer extends Component {
    constructor(props) {
        super(props);

        this.movieListRef = React.createRef();

        this.state = {
            exploreName: '',
            hideMovies: false,
            showArrows: false,
            showExplore: false,
            movieScrollLeft: false,
            movieScrollRight: false
        };
    }

    openExplore = () => {
        this.setState({showExplore: true});
    }

    closeExplore = () => {
        this.setState({showExplore: false});
    }

    getExploreName = () => {
        let title = this
            .props
            .genreInfo
            .activeGenre
            .toLowerCase();
        let exempt = [
                "comedy",
                "drama",
                "documentary",
                "thriller",
                "suggestions",
                "recents",
                "favorites"
            ],
            hideMovies = false;

        if (exempt.indexOf(title) > -1) {
            title = pluralize(title);
            hideMovies = true;
        } else if (title.indexOf('movies') > -1) {
            hideMovies = true;
        }
        this.setState({exploreName: title, hideMovies});
    }

    easingFunction = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) 
            return (c / 2) * t * t * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    scrollTo = (to, duration) => {
        return new Promise((resolve, reject) => {
            let start = this.movieListRef.current.scrollLeft,
                change = to - start,
                currentTime = 0,
                increment = 20;

            let animateScroll = () => {
                currentTime += increment;
                let val = this.easingFunction(currentTime, start, change, duration);
                this.movieListRef.current.scrollLeft = val;
                if (currentTime < duration) {
                    setTimeout(animateScroll, increment);
                } else if (currentTime >= duration) {
                    resolve();
                }
            };

            animateScroll();
        });
    };

    scrollMovieGenre = (left) => {
        let n = this.props.genreInfo.movies.length;

        let container = this.movieListRef.current,
            scrollVal = container.scrollLeft;

        let viewportW = container.offsetWidth - 50,
            boxW = 230,
            viewItems = Math.ceil(viewportW / boxW) - 1,
            containerScrollWidth = boxW * n - viewportW - 30;

        if (left) {
            scrollVal -= boxW * viewItems;
            scrollVal += 15;
        } else {
            scrollVal += boxW * viewItems;
            scrollVal -= 15;
        }

        if (scrollVal > containerScrollWidth - 30 && scrollVal < containerScrollWidth) {
            scrollVal = containerScrollWidth;
        }

        this
            .scrollTo(scrollVal, 450)
            .then(() => {
                if (container.scrollLeft + container.offsetWidth >= container.scrollWidth - 10) {
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
    };

    scrollLeft = () => {
        this.scrollMovieGenre(true);
    };

    scrollRight = () => {
        this.scrollMovieGenre();
    };

    handleResize = () => {
        if (this.movieListRef.current) {
            if (this.props.genreInfo.movies) {
                if (this.props.genreInfo.movies.length * 220 > this.movieListRef.current.offsetWidth) {
                    this.setState({showArrows: true});

                    if (this.movieListRef.current.scrollLeft + this.movieListRef.current.offsetWidth < this.movieListRef.current.scrollWidth - 10) {
                        this.setState({movieScrollRight: true});
                    } else {
                        this.setState({movieScrollRight: false});
                    }
                } else {
                    this.setState({showArrows: false});
                }
            }
        }
    };

    handleOpenGenre = () => {
        this
            .props
            .toggleGenre(true, this.props.genreInfo);
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.showArrows === nextState.showArrows && this.props.genreInfo === this.props.genreInfo && this.state.movieScrollLeft === nextState.movieScrollLeft && this.state.movieScrollRight === nextState.movieScrollRight && nextState.showExplore === this.state.showExplore && nextState.exploreName === this.state.exploreName && nextState.hideMovies === this.state.hideMovies) {
            return false;
        } else {
            return true;
        }
    }

    componentDidMount() {
        this.handleResize();
        this.getExploreName();
        window.addEventListener("resize", this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }

    render() {
        let movies = this
            .props
            .genreInfo
            .movies
            .slice(0, 20)
            .map((movie, index) => (<MovieItem
                movie={movie}
                openBox={this.props.openBox}
                key={movie.title + index + 'genre'}/>));
        let n = this.props.genreInfo.movies.length
            ? 470
            : 100;

        return (
            <LazyLoad
                height={n}
                offsetVertical={n}
                debounce={false}
                onContentVisible={this.handleResize}>
                <Fade distance='20%' bottom>
                    <div
                        className='genre-container'
                        style={{
                        width: `calc(100% + ${this.state.movieScrollLeft
                            ? '40px'
                            : '20px'})`
                    }}>
                        <div
                            className="movie-genre"
                            onClick={this.handleOpenGenre}
                            onMouseEnter={this.openExplore}
                            onMouseLeave={this.closeExplore}>
                            <span>{this.props.genreInfo.activeGenre}</span>
                            <Fade
                                mountOnEnter
                                unmountOnExit
                                duration={450}
                                when={this.state.showExplore}
                                distance="5%"
                                left>
                                <div className="genre-explore">
                                    <div>{`Explore all ${this.state.exploreName} ${this.state.hideMovies
                                            ? ''
                                            : 'movies'}`}</div>
                                    <i className="mdi mdi-black mdi-arrow-right"/>
                                </div>
                            </Fade>
                        </div>
                        {this.state.showArrows
                            ? <div className='movie-scroll-container'>
                                    <Fade duration={350} when={this.state.movieScrollLeft} distance="10%" left>
                                        <div className='movie-scroll movie-scroll-left' onClick={this.scrollLeft}>
                                            <i className='mdi mdi-light mdi-24px mdi-chevron-left'/>
                                        </div>
                                    </Fade>
                                    <Fade duration={350} when={this.state.movieScrollRight} distance="10%" right>
                                        <div className='movie-scroll movie-scroll-right' onClick={this.scrollRight}>
                                            <i className='mdi mdi-light mdi-24px mdi-chevron-right'/>
                                        </div>
                                    </Fade>
                                </div>
                            : ''
}
                        {this.props.genreInfo.movies
                            ? (this.props.genreInfo.movies.length
                                ? (
                                    <div className='movie-list-paginated' ref={this.movieListRef}>
                                        {movies}
                                    </div>
                                )
                                : (""))
                            : ("")}
                    </div>
                </Fade>
            </LazyLoad>
        );
    }
}

export default GenreContainer;
