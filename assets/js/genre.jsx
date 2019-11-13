import React, {Component} from "react";

import MovieItem from "./movie-item";

class Genre extends Component {
    constructor(props) {
        super(props);

        this.genreElem = React.createRef();

        this.state = {
            page: 1,
            processing: true,
            changeNav: false,
            movies: []
        };
    }

    loadPage = () => {
        if (!this.props.genreInfo.showCollection && this.props.genreInfo.genreID !== 21) {
            let url = this.props.genreInfo.shows ? `https://api.themoviedb.org/3/discover/tv?api_key=${this.props.apiKey}&region=US&language=en-US&sort_by=popularity.desc&page=${this.state.page}&timezone=America%2FNew_York&include_null_first_air_dates=false&with_genres=${this.props.genreInfo.genreID}&with_original_language=en` : `https://api.themoviedb.org/3/discover/movie?api_key=${
            this.props.apiKey}&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${
            this
                .state
                .page}&release_date.lte=${this.props.getURLDate(1)}&with_genres=${this.props.genreInfo.genreID}`;

            this
                .props
                .fetchContent(url, true)
                .then((response) => {
                    this
                        .props
                        .setOffline();
                    let movies = this.props.extractMovies(response, false, false);;
                    this.setState((prevState) => {
                        return {
                            movies: prevState
                                .movies
                                .concat(movies),
                            processing: false
                        };
                    });
                });
        } else {
            this.setCollection();
        }
    };

    handleScroll = () => {
        let scrollTop = this.genreElem.current.scrollTop,
            scrollHeight = this.genreElem.current.scrollHeight,
            limit = 30;

        if (!this.props.genreInfo.showCollection) {
            if (scrollTop >= scrollHeight - 1200) {
                if (this.state.processing) {
                    return;
                } else {
                    this.setState((prevState) => {
                        return {
                            processing: true,
                            page: prevState.page + 1
                        };
                    }, () => {
                        this.loadPage(this.state.page);
                    });
                }
            }
        }

        if (scrollTop > limit) {
            this.setState({changeNav: true});
        }

        if (scrollTop < limit) {
            this.setState({changeNav: false});
        }
    };

    getEmptyState = () => {
        return (
            <div className="empty-state-container">
                <div className="empty-state-bg"></div>
                <div className="empty-state-info">
                    <div className="title">Look's like we're empty!</div>
					<div className="desc">{`We couldn't find any movies in "${this.props.genreInfo.activeGenre}". To watch a movie, click the play button in the movie dialog box.`}</div>
                </div>
            </div>
        )
    }

    setCollection = () => {
        let collection = this.props[this.props.genreInfo.target];
        this.setState({movies: this.props.genreInfo.genreID == 21 ? this.props.genreInfo.movies : collection ? collection : [], processing: false});
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.changeNav === this.state.changeNav && nextProps.genreInfo === this.props.genreInfo && nextState.page === this.state.page && nextState.processing === this.state.processing && nextState.movies === this.state.movies && nextProps.favorites === this.props.favorites && nextProps.recentlyPlayed === this.props.recentlyPlayed && nextProps.suggested === this.props.suggested) {
            return false;
        } else {
            return true;
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(this.props.genreInfo.showCollection){
            if(prevProps.favorites !== this.props.favorites || prevProps.recentlyPlayed !== this.props.recentlyPlayed || prevProps.suggested !== this.props.suggested){
                this.setCollection();
            }
        }
    }

    componentDidMount() {
        this.loadPage();
        this
            .genreElem
            .current
            .addEventListener("scroll", this.handleScroll);
    }

    componentWillUnmount() {
        this
            .genreElem
            .current
            .removeEventListener("scroll", this.handleScroll);
    }

    render() {
        let movies = this
            .state
            .movies
            .map((movie, index) => (<MovieItem
                key={movie.title + index}
                movie={movie}
                openBox={this.props.openBox}/>));

        return (
            <div className='paginated-genre-results' ref={this.genreElem}>
                <div
                    className={`genre-bar ${this.state.changeNav
                    ? "genre-bar-on"
                    : ""}`}/>
                <div
                    className={`close-genre ${this.state.changeNav
                    ? "close-genre-on"
                    : ""}`}
                    onClick={this.props.closeGenre}>
                    <i className='mdi mdi-keyboard-backspace'/>
                </div>
                <div
                    className={`genre-name ${this.state.changeNav
                    ? "genre-name-on"
                    : ""}`}>
                    {this.props.genreInfo.activeGenre}
                </div>
                <div
                    className='genre-movie-list'
                    style={{
                    marginLeft: this.state.movies.length
                        ? "-20px"
                        : "",
                    backgroundSize: !this.state.processing && !this.state.movies.length
                        ? "40%"
                        : "5%",
                    backgroundImage: this.state.processing && this.state.movies.length
                        ? ""
                        : this.state.processing && !this.state.movies.length
                            ? "url(./assets/imgs/loading.svg)"
                            : !this.state.processing && !this.state.movies.length
                                ? ""
                                : ""
                }}>
                    {!this.state.processing && !this.state.movies.length
                        ? this.getEmptyState()
                        : movies}
                </div>
            </div>
        );
    }
}

export default Genre;
