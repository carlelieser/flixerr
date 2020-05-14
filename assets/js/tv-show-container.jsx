import React, { Component } from 'react'

import uniqid from 'uniqid'

import GenreContainer from './genre-container'

class TVShowContainer extends Component {
    constructor(props) {
        super(props)
    }

    getTVShows = () => {
        if (this.props.shows) {
            if (!this.props.shows.length || this.props.shows[0] === undefined) {
                this.props.loadCategories(true)
            }
        } else {
            this.props.loadCategories(true)
        }
    }

    setHeader = () => {
        if (this.props.shows) {
            if (this.props.shows.length) {
                if (this.props.shows[0]) {
                    if (this.props.shows[0].movies[0]) {
                        this.props.setHeader(
                            this.props.shows[0].movies[0].flixerr_data
                                .backdrop_path
                        )
                    }
                }
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        this.getTVShows()
        if (prevProps.shows !== this.props.shows) {
            this.setHeader()
        }
    }

    componentDidMount() {
        this.getTVShows()
        this.setHeader()
    }

    render() {
        let tvShowGenres = this.props.shows.map((item, i) => {
            if (item) {
                let genreInfo = {
                    showCollection: false,
                    activeGenre: item.name,
                    genreID: item.genreID,
                    shows: true,
                    movies: item.movies,
                }

                return (
                    <GenreContainer
                        shows={true}
                        toggleGenre={this.props.toggleGenre}
                        openBox={this.props.openBox}
                        genreInfo={genreInfo}
                        key={uniqid()}
                    />
                )
            }
        })

        return (
            <div
                className="tv-shows-container"
                style={{
                    height: `${470 * 12}px'`,
                }}
            >
                {tvShowGenres}
            </div>
        )
    }
}

export default TVShowContainer
