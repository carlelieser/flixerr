import Fade from 'react-reveal/Fade'

class MovieModal extends React.Component {
    constructor(props) {
        super(props);
    }

    handleFavorites = () => {
        if (this.props.isFavorite(this.props.movie)) {
            this.props.removeFromFavorites(
                this.props.movie
            );
        } else {
            this.props.addToFavorites(this.props.movie);
        }
    }

    shouldComponentUpdate(nextProps, nextState){
        if(this.props.movie === nextProps.movie && this.props.favorites === nextProps.favorites){
            return false;
        } else{
            return true;
        }
    }

    render() {
        return (
                <div className="movie-modal">
                    <Fade bottom distance="20%"><div className="movie-modal-info">
                        <div
                            className="movie-modal-poster"
                            style={{
                                backgroundImage: `url(https://image.tmdb.org/t/p/w780${
                                    this.props.movie.poster_path || this.props.movie.backdrop_path
                                })`
                            }}
                        />
                        <div className="movie-metadata">
                            <div className="movie-modal-vote">
                                <i className="mdi mdi-light mdi-star-outline" />
                                <div>{this.props.movie.vote_average}</div>
                            </div>
                            <div className="movie-modal-release-date">
                                {this.props.movie.release_date.substring(0, 4)}
                            </div>
                            <i
                                className={
                                    "mdi mdi-light" +
                                    (this.props.isFavorite(this.props.movie)
                                        ? " mdi-heart"
                                        : " mdi-heart-outline")
                                }
                                onClick={this.handleFavorites}
                            />
                        </div>
                        <div className="movie-modal-title">
                            {this.props.movie.title}
                        </div>
                        <div className="movie-modal-desc">
                            {this.props.movie.overview}
                        </div>

                        <div
                            className="movie-modal-play"
                            onClick={() => this.props.playMovie(this.props.movie)}
                        >
                            <i className="mdi mdi-play-circle-outline mdi-36px" />
                        </div>
                    </div></Fade>
                <Fade distance="10%" top>
                    <div
                        className="movie-modal-image"
                        style={{
                            backgroundImage: `url(https://image.tmdb.org/t/p/w300${
                                this.props.movie.backdrop_path
                            })`
                        }}></div>
                </Fade>
                    <div className="movie-gradient"></div>
                </div>
        );
    }
}
