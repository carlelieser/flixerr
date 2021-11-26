import React, { Component } from "react";

import uniqid from "uniqid";
import LazyLoad from "react-lazy-load";
import MovieItem from "./movie-item";

class FeaturedContainer extends Component {
    constructor(props) {
        super(props);
    }

    getFeatured = () => {
        if (this.props.featured) {
            if (!this.props.featured.length) {
                this.props.loadFeatured();
            }
        } else {
            this.props.loadFeatured();
        }
    };

    setHeader = () => {
        if (this.props.featured) {
            if (this.props.featured.length) {
                this.props.setHeader(
                    this.props.featured[0].flixerr_data.backdrop_path
                );
            }
        }
    };

    componentDidUpdate(prevProps, prevState) {
        this.getFeatured();
        if (prevProps.featured !== this.props.featured) {
            this.setHeader();
        }
    }

    componentDidMount() {
        this.getFeatured();
        this.setHeader();
    }

    render() {
        let featuredMovies = this.props.featured.map((movie) => (
            <MovieItem
                movie={movie}
                fallback={true}
                key={uniqid()}
                openBox={this.props.openBox}
            />
        ));

        return <div className="featured-container">{featuredMovies}</div>;
    }
}

export default FeaturedContainer;
