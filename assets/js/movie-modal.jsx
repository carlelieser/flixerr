import React, { Component } from 'react'

import Fade from 'react-reveal/Fade'
import Season from './season'

import uniqid from 'uniqid'
import { default as request } from 'axios'

class MovieModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            trailer: false,
            seasons: [],
            showSeasons: false,
            isLoading: false,
        }
    }

    setLoading = (isLoading) => {
        this.setState({ isLoading })
    }

    setShowSeasons = (showSeasons) => {
        this.setState({ showSeasons })
    }

    openSeasons = () => {
        this.setShowSeasons(true)
    }

    closeSeasons = () => {
        this.setShowSeasons(false)
    }

    setSeasons = (seasons) => {
        this.setState({ seasons })
    }

    setTrailer = (trailer) => {
        this.setState({ trailer })
    }

    getTrailer = () => {
        let movieTrailer = require('movie-trailer'),
            name = this.props.movie.title,
            releaseDate = this.props.movie.release_date.substring(0, 4)

        movieTrailer(name, releaseDate)
            .then((url) => {
                this.setTrailer(url)
            })
            .catch((err) => {
                this.setTrailer()
            })
    }

    handleViewTrailer = () => {
        let { trailer } = this.state

        this.props.setTrailer(trailer)
    }

    handlePlayMovie = () => {
        this.props.playMovie(this.props.movie)
    }

    handleFavorites = () => {
        if (this.props.isFavorite(this.props.movie)) {
            this.props.removeFromFavorites(this.props.movie)
        } else {
            this.props.addToFavorites(this.props.movie)
        }
    }

    formatNumber = (number) => {
        number = number.toString()
        let formatted = number.length === 1 ? `0${number}` : number
        return formatted
    }

    getEpisodes = (season) => {
        let url = `https://api.themoviedb.org/3/tv/${this.props.movie.id}/season/${season.season_number}?api_key=${this.props.apiKey}&language=en-US`
        return request
            .get(url)
            .then((response) => {
                let episodes = response.data.episodes
                let flixerrEpisodes = []
                if (episodes) {
                    for (let i = 0; i < episodes.length; i++) {
                        let episode = episodes[i]
                        let clonedMovie = {
                            ...this.props.movie,
                        }
                        let newEpisode = {
                            ...episode,
                        }
                        newEpisode.title = `${clonedMovie.title} / ${newEpisode.name}`
                        newEpisode.episode_number_formatted = this.formatNumber(
                            newEpisode.episode_number
                        )
                        newEpisode.query = `${clonedMovie.title} S${season.season_number_formatted}E${newEpisode.episode_number_formatted}`
                        newEpisode.show = clonedMovie
                        flixerrEpisodes.push(newEpisode)
                    }

                    return {
                        name: season.name,
                        number: season.season_number,
                        episodes: flixerrEpisodes,
                    }
                }
            })
            .catch((err) => console.log(err))
    }

    getSeriesData = () => {
        let url = `https://api.themoviedb.org/3/tv/${this.props.movie.id}?api_key=${this.props.apiKey}&language=en-US`
        return request
            .get(url)
            .then((response) => {
                return response.data
            })
            .catch((err) => console.log(err))
    }

    getSeasons = () => {
        if (this.props.movie.isSeries) {
            this.setLoading(true)
            return this.getSeriesData().then((data) => {
                let seasons = data.seasons
                let seasonData = []
                for (let i = seasons.length - 1; i >= 0; i--) {
                    let season = seasons[i]
                    season.season_number_formatted = this.formatNumber(
                        season.season_number
                    )
                    if (season.season_number) {
                        let episodes = this.getEpisodes(season)
                        seasonData.push(episodes)
                    }
                }

                return Promise.all(seasonData).then((response) => {
                    this.setLoading()
                    this.setSeasons(response)
                })
            })
        }
    }

    generateRgbCss = (r, g, b, opacity) => {
        return `rgba(${r}, ${g}, ${b}, ${opacity}0)`
    }

    getLinearGradient = () => {
        let { movie } = this.props
        let { averageColor } = movie
        let r = averageColor.value[0],
            g = averageColor.value[1],
            b = averageColor.value[2]

        return `linear-gradient(180deg, ${this.generateRgbCss(
            r,
            g,
            b,
            0.4
        )} 0%, ${this.generateRgbCss(r, g, b, 0.6)} 20%, ${this.generateRgbCss(
            r,
            g,
            b,
            0.8
        )} 50%, ${averageColor.hex} 100%)`
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (
            this.props.movie === nextProps.movie &&
            this.props.favorites === nextProps.favorites &&
            nextState.seasons === this.state.seasons &&
            nextState.showSeasons === this.state.showSeasons &&
            nextState.isLoading === this.state.isLoading &&
            this.state.trailer === nextState.trailer
        ) {
            return false
        } else {
            return true
        }
    }

    componentDidMount() {
        this.getTrailer()
        this.getSeasons()
    }

    render() {
        let { seasons, showSeasons, isLoading } = this.state
        let { movie, playMovie, isFavorite } = this.props
        let {
            release_date,
            averageColor,
            flixerr_data,
            title,
            overview,
            isSeries,
            vote_average,
        } = movie
        let { isLight, hex } = averageColor
        let releaseDate = release_date.substring(0, 4),
            modalClass = isLight ? 'light-modal' : 'dark-modal',
            iconClass = isLight ? 'mdi-dark' : 'mdi-light',
            closeClass = isLight ? 'close-dark' : 'close-light',
            favoriteClass = isFavorite(movie)
                ? 'mdi-heart'
                : 'mdi-heart-outline'

        let seasonData = seasons.map((season, index) => {
            if (season) {
                if (season.episodes) {
                    return (
                        <Season
                            key={uniqid()}
                            iconClass={iconClass}
                            playMovie={playMovie}
                            season={season}
                        />
                    )
                }
            }
        })

        let showInfo = !showSeasons
        let linearGradient = this.getLinearGradient()
        return (
            <div
                className={`movie-modal ${modalClass}`}
                style={{
                    backgroundColor: hex,
                }}
            >
                <Fade
                    mountOnEnter
                    unmountOnExit
                    when={showSeasons}
                    duration={450}
                    distance="5%"
                    bottom
                >
                    <div className="seasons-container">
                        <div
                            className={`close-seasons ${closeClass}`}
                            onClick={this.closeSeasons}
                        >
                            <i className={`mdi mdi-close ${iconClass}`} />
                        </div>
                        {isLoading ? (
                            <div className="seasons-loading"></div>
                        ) : (
                            seasonData
                        )}
                    </div>
                </Fade>

                <Fade
                    mountOnEnter
                    unmountOnExit
                    when={showInfo}
                    duration={450}
                    distance="5%"
                    bottom
                >
                    <div className="movie-modal-info">
                        <div className="movie-modal-poster-info">
                            <div
                                className="movie-modal-poster"
                                style={{
                                    backgroundImage: `url(${flixerr_data.poster_path})`,
                                }}
                            ></div>
                        </div>
                        <div className="movie-metadata">
                            <div className="movie-modal-vote">
                                <i
                                    className={`mdi ${iconClass} mdi-star-outline`}
                                />
                                <div>{`${vote_average} / 10`}</div>
                            </div>
                            <div className="movie-modal-release-date">
                                {releaseDate}
                            </div>
                            <i
                                className={`mdi ${iconClass} ${favoriteClass}`}
                                onClick={this.handleFavorites}
                            />{' '}
                            {this.state.trailer ? (
                                <Fade
                                    mountOnEnter
                                    unmountOnExit
                                    distance="5%"
                                    bottom
                                >
                                    <div
                                        className="movie-modal-view-trailer"
                                        onClick={this.handleViewTrailer}
                                    >
                                        View Trailer
                                    </div>
                                </Fade>
                            ) : (
                                ''
                            )}
                        </div>
                        <div className="movie-modal-title">{title}</div>
                        <div className="movie-modal-desc">{overview}</div>
                        {isSeries ? (
                            <div
                                className="open-series"
                                onClick={this.openSeasons}
                            >
                                <div>View Seasons</div>
                                <i className="mdi mdi-arrow-right" />
                            </div>
                        ) : (
                            <div
                                className="movie-modal-play"
                                onClick={this.handlePlayMovie}
                            >
                                <i className="mdi mdi-play-circle-outline mdi-36px" />
                            </div>
                        )}
                    </div>
                </Fade>
                <div className="movie-modal-image-container">
                    <div
                        className="movie-modal-image"
                        style={{
                            backgroundImage: `url(${flixerr_data.blurry_backdrop_path})`,
                        }}
                    ></div>
                </div>
                <div
                    className="movie-gradient"
                    style={{
                        background: averageColor ? linearGradient : '',
                    }}
                />
            </div>
        )
    }
}

export default MovieModal
