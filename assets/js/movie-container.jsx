import React, {Component} from "react";

import uniqid from "uniqid";

import GenreContainer from "./genre-container";

class MovieContainer extends Component {
    constructor(props) {
        super(props);
    }

    getMovies = () => {
        if (this.props.movies.length === 0 || this.props.movies[0] === undefined) {
            this
                .props
                .loadCategories();
        }
    };

    setHeader = () => {
        if (this.props.movies) {
            if (this.props.movies.length) {
                if (this.props.movies[0]){
                    if (this.props.movies[0].movies[0]) {
                        this
                            .props
                            .setHeader(this.props.movies[0].movies[0].flixerr_data.backdrop_path);
                    }
                }
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.movies) {
            if (!this.props.movies.length) {
                this.getMovies();
            }
        }

        if (prevProps.movies !== this.props.movies) {
            this.setHeader();
        }
    }

    componentDidMount() {
        this.getMovies();
        this.setHeader();
    }

    render() {
        let movieGenres = this
            .props
            .movies
            .map((item, i) => {
                if (item) {
                    let genreInfo = {
                        showCollection: false,
                        activeGenre: item.name,
                        genreID: item.genreID,
                        movies: item.movies
                    }

                    return (<GenreContainer
                        toggleGenre={this.props.toggleGenre}
                        openBox={this.props.openBox}
                        genreInfo={genreInfo}
                        key={uniqid()}/>);
                }
            });

        return (
            <div
                className='movie-container'
                style={{
                height: `${ 470 * 12}px'`
            }}>
                {movieGenres}
            </div>
        );
    }
}

export default MovieContainer;
