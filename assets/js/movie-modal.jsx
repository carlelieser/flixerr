import React, {Component} from "react";

import Fade from "react-reveal/Fade";
import Season from "./season"

import uniqid from "uniqid";
import {default as request} from "axios";

class MovieModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            seasons: [],
            showSeasons: false
        }
    }

    setShowSeasons = (showSeasons) => {
        this.setState({showSeasons});
    }

    openSeasons = () => {
        this.setShowSeasons(true);
    }

    closeSeasons = () => {
        this.setShowSeasons(false);
    }

    setSeasons = (seasons) => {
        this.setState({seasons});
    }

    handlePlayMovie = () => {
        this
            .props
            .playMovie(this.props.movie);
    }

    handleFavorites = () => {
        if (this.props.isFavorite(this.props.movie)) {
            this
                .props
                .removeFromFavorites(this.props.movie);
        } else {
            this
                .props
                .addToFavorites(this.props.movie);
        }
	};
	
	formatNumber = (number) => {
		number = number.toString();
		let formatted = number.length === 1 ? `0${number}` : number;
		return formatted;
	}

    getEpisodes = (season) => {
        let url = `https://api.themoviedb.org/3/tv/${this.props.movie.id}/season/${season.season_number}?api_key=${this.props.apiKey}&language=en-US`;
        return request
            .get(url)
            .then((response) => {
				let episodes = response.data.episodes;
				let flixerrEpisodes = [];
				if(episodes){
					for(let i = 0; i < episodes.length; i++){
						let episode = episodes[i];
						let newEpisode = {...episode};
						newEpisode.show_title = `${this.props.movie.title}: ${newEpisode.name}`;
						newEpisode.episode_number_formatted = this.formatNumber(newEpisode.episode_number);
						newEpisode.query = `${this.props.movie.title} S${season.season_number_formatted}E${newEpisode.episode_number_formatted}`;
						newEpisode.flixerr_data = this.props.movie.flixerr_data;
						newEpisode.title = this.props.movie.title;
						flixerrEpisodes.push(newEpisode);
					}

					return {
						name: season.name,
						number: season.season_number,
						episodes: flixerrEpisodes
					}
				}
            })
            .catch((err) => console.log(err));
    }

    getSeriesData = () => {
        let url = `https://api.themoviedb.org/3/tv/${this.props.movie.id}?api_key=${this.props.apiKey}&language=en-US`;
        return request
            .get(url)
            .then((response) => {
                return response.data;
            })
            .catch((err) => console.log(err));
    }

    getSeasons = () => {
        if (this.props.movie.first_air_date) {
            return this
                .getSeriesData()
                .then((data) => {
                    let seasons = data.seasons;
                    let seasonData = [];
                    for (let i = 0; i < seasons.length; i++) {
						let season = seasons[i];
							season.season_number_formatted = this.formatNumber(season.season_number);
                        if (season.season_number) {
                            let episodes = this.getEpisodes(season);
                            seasonData.push(episodes);
                        }
                    }

                    return Promise
                        .all(seasonData)
                        .then((response) => {
                            response.sort((a, b) => {
                                return b.name - a.name;
                            })
                            this.setSeasons(response);
                        });
                });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.movie === nextProps.movie && this.props.favorites === nextProps.favorites && nextState.seasons === this.state.seasons && nextState.showSeasons === this.state.showSeasons) {
            return false;
        } else {
            return true;
        }
    }

    componentDidMount() {
        this.getSeasons();
    }

    render() {
        let movie = this.props.movie,
            releaseDate = movie
                .release_date
                .substring(0, 4),
            isLight = movie.averageColor.isLight,
            isLightClass = isLight
                ? "mdi-dark"
                : "mdi-light",
            averageColor = movie.averageColor,
            modalHeight = movie
                ? 500 + movie.overview.length / 4 + movie.title.length / 2
                : 500;

        let seasons = this
            .state
            .seasons
            .map((season, index) => {
                if(season){
					if(season.episodes){
						return (
							<Season
								key={uniqid()}
								isLightClass={isLightClass}
								playMovie={this.props.playMovie}
								season={season}/>)
					}
				}
            });

        let showInfo = !this.state.showSeasons;
        return (
            <div
                className={`movie-modal ${isLight
                ? "light-modal"
                : "dark-modal"}`}
                style={{
                backgroundColor: averageColor.hex,
                height: modalHeight
            }}>

                <Fade
                    mountOnEnter
                    unmountOnExit
					when={this.state.showSeasons}
					duration={450}
                    distance="5%"
                    bottom>
                    <div className="seasons-container" style={{height: modalHeight}}>
                        <div className={`close-seasons ${isLight ? 'close-dark' : 'close-light'}`} onClick={this.closeSeasons}>
                            <i className={`mdi mdi-close ${isLightClass}`}/>
                        </div>
                        {seasons}
                    </div>
                </Fade>

                <Fade mountOnEnter unmountOnExit when={showInfo} duration={450} distance="5%" bottom>
                    <div className='movie-modal-info'>
                        <div className="movie-modal-poster-info">
                            <div
                                className='movie-modal-poster'
                                style={{
                                backgroundImage: `url(${movie.flixerr_data.poster_path})`
                            }}></div>
                        </div>
                        <div className='movie-metadata'>
                            <div className='movie-modal-vote'>
                                <i className={`mdi ${isLightClass} mdi-star-outline`}/>
                                <div>{`${movie.vote_average} / 10`}</div>
                            </div>
                            <div className='movie-modal-release-date'>
                                {releaseDate}
                            </div>
                            <i
                                className={`mdi ${isLightClass} ${this
                                .props
                                .isFavorite(movie)
                                ? "mdi-heart"
                                : "mdi-heart-outline"}`}
                                onClick={this.handleFavorites}/>
                        </div>
                        <div className='movie-modal-title'>
                            {movie.title}
                        </div>
                        <div className='movie-modal-desc'>
                            {movie.overview}
                        </div>
                        {movie.first_air_date
                            ? <div className="open-series" onClick={this.openSeasons}>
                                    <div>View Seasons</div>
                                    <i className="mdi mdi-arrow-right"/></div>
                            : <div className='movie-modal-play' onClick={this.handlePlayMovie}>
                                <i className='mdi mdi-play-circle-outline mdi-36px'/>
                            </div>
}
                    </div>
                </Fade>
                <div
                    className='movie-modal-image'
                    style={{
                    backgroundImage: `url(${movie.flixerr_data.blurry_backdrop_path})`
                }}/>
                <div
                    className='movie-gradient'
                    style={{
                    background: averageColor
                        ? `linear-gradient(180deg, rgba(${averageColor.value[0]}, ${averageColor.value[1]}, ${averageColor.value[2]}, 0.40) 0%, rgba(${averageColor.value[0]}, ${averageColor.value[1]}, ${averageColor.value[2]}, 0.60) 20%, rgba(${averageColor.value[0]}, ${averageColor.value[1]}, ${averageColor.value[2]}, 0.80) 50%, ${averageColor.hex} 100%)`
                        : ""
                }}/>
            </div>
        );
    }
}

export default MovieModal;
