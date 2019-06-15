import React, {Component} from "react";

import Fade from "react-reveal/Fade";

import MovieContainer from "./movie-container";
import Collection from "./collection-container";
import FeaturedContainer from "./featured-container";
import SearchContainer from "./search-container";

class Content extends Component {
    constructor(props) {
        super(props);
    }

    getActiveContainer = () => {
        switch (this.props.active) {
            case "Featured":
                return (<FeaturedContainer
                    offline={this.props.offline}
                    featured={this.props.featured}
                    loadFeatured={this.props.loadFeatured}
                    openBox={this.props.openBox}
                    setHeader={this.props.setHeaderBackground}/>);
            case "Movies":
                return (<MovieContainer
                    offline={this.props.offline}
                    movies={this.props.movies}
                    toggleGenre={this.props.toggleGenre}
                    openBox={this.props.openBox}
                    loadMovieCategories={this.props.loadMovieCategories}
                    setHeader={this.props.setHeaderBackground}/>);
            case "Collection":
                return (<Collection
                    suggested={this.props.suggested}
                    favorites={this.props.favorites}
                    recentlyPlayed={this.props.recentlyPlayed}
                    updateSuggested={this.props.updateSuggested}
                    openBox={this.props.openBox}
                    setHeader={this.props.setHeaderBackground}
                    toggleGenre={this.props.toggleGenre}/>);
        }
    };

    getOfflineContainer = () => {
        return (
            <Fade distance='10%' bottom>
                <div className='offline-container'>
                    <div className='offline-error'/>
                    <span>It looks like you're offline.</span>
                    <span>
                        Please check your internet connection and try again.
                    </span>
                </div>
            </Fade>
        );
    };

    getSearchContainer = () => {
        let search = (<SearchContainer
            setHeader={this.props.setHeaderBackground}
            searchContent={this.props.searchContent}
            openBox={this.props.openBox}/>);
        return search;
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.active === "Featured") {
            if (nextProps.featured === this.props.featured && nextProps.active === this.props.active && nextProps.offline === this.props.offline && nextProps.searchContent === this.props.searchContent) {
                return false;
            } else {
                return true;
            }
        } else if (nextProps.active === "Movies") {
            if (nextProps.movies === this.props.movies && nextProps.active === this.props.active && nextProps.offline === this.props.offline && nextProps.searchContent === this.props.searchContent) {
                return false;
            } else {
                return true;
            }
        } else if (nextProps.active === "Collection") {
            if (nextProps.suggested === this.props.suggested && nextProps.favorites === this.props.favorites && nextProps.recentlyPlayed === this.props.recentlyPlayed && nextProps.active === this.props.active && nextProps.offline === this.props.offline && nextProps.searchContent === this.props.searchContent) {
                return false;
            } else {
                return true;
            }
        }
    }

    render() {
        let activeContainer = this.getActiveContainer(),
            offlineContainer = this.getOfflineContainer(),
            searchContainer = this.getSearchContainer();

        return (
            <div
                className='content-container'
                style={{
                display: this.props.active == "Featured"
                    ? "flex"
                    : "block",
                padding: this.props.active === "Featured"
                    ? "40px 40px"
                    : "40px 60px",
                backgroundImage: this.props.loadingContent
                    ? "url(./assets/imgs/loading.apng)"
                    : ""
            }}>
                {this.props.loadingContent
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
