import React, { Component } from "react";

import Fade from "react-reveal/Fade";

import FeaturedContainer from "./featured-container";
import MovieContainer from "./movie-container";
import TVShowContainer from "./tv-show-container";
import Collection from "./collection-container";
import SearchContainer from "./search-container";

class Content extends Component {
    constructor(props) {
        super(props);
    }

    getActiveContainer = () => {
        switch (this.props.active) {
            case "Featured":
                return <FeaturedContainer {...this.props} />;
            case "Movies":
                return <MovieContainer {...this.props} />;
            case "TV Shows":
                return <TVShowContainer {...this.props} />;
            case "Collection":
                return <Collection {...this.props} />;
        }
    };

    getOfflineContainer = () => {
        return (
            <Fade distance="10%" bottom>
                <div className="offline-container">
                    <div className="offline-error" />
                    <span>It looks like you're offline.</span>
                    <span>
                        Please check your internet connection and try again.
                    </span>
                </div>
            </Fade>
        );
    };

    getSearchContainer = () => {
        return <SearchContainer {...this.props} />;
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (
            nextProps.active !== this.props.active ||
            nextProps.offline !== this.props.offline ||
            nextProps.searchContent !== this.props.searchContent ||
            nextProps.isLoading !== this.props.isLoading
        ) {
            return true;
        } else {
            if (
                this.props.active === "Featured" &&
                nextProps.featured !== this.props.featured
            ) {
                return true;
            } else if (
                this.props.active === "Movies" &&
                nextProps.movies !== this.props.movies
            ) {
                return true;
            } else if (
                this.props.active === "TV Shows" &&
                nextProps.shows !== this.props.shows
            ) {
                return true;
            } else if (
                this.props.active === "Collection" &&
                (nextProps.suggested !== this.props.suggested ||
                    nextProps.favorites !== this.props.favorites ||
                    nextProps.recentlyPlayed !== this.props.recentlyPlayed)
            ) {
                return true;
            } else {
                return false;
            }
        }
    }

    render() {
        let activeContainer = this.getActiveContainer(),
            offlineContainer = this.getOfflineContainer(),
            searchContainer = this.getSearchContainer();

        return (
            <div
                className="content-container"
                style={{
                    display:
                        this.props.active === "Featured" ? "flex" : "block",
                    backgroundImage: this.props.isLoading
                        ? "url(./assets/img/loading.svg)"
                        : "",
                }}
            >
                {this.props.isLoading
                    ? ""
                    : this.props.offline
                    ? offlineContainer
                    : this.props.searchContent
                    ? searchContainer
                    : activeContainer}
            </div>
        );
    }
}

export default Content;
