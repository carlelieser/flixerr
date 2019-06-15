import React, {Component} from "react";

import uniqid from "uniqid";
import LazyLoad from "react-lazy-load";
import MovieItem from "./movie-item";

class FeaturedContainer extends Component {
    constructor(props) {
        super(props);
    }

    getFeatured = () => {
        if (this.props.featured.length === 0) {
            this
                .props
                .loadFeatured();
        }
    };

    componentDidUpdate(prevProps, prevState) {
        if (this.props.featured) {
            if (!this.props.featured.length) {
                this.getFeatured();
            }
        }

        if (prevProps.featured !== this.props.featured) {
            this
                .props
                .setHeader(this.props.featured);
        }
    }

    componentDidMount() {
        this.getFeatured();
        this
            .props
            .setHeader(this.props.featured);
    }

    render() {
        let featuredMovies = this
            .props
            .featured
            .map((movie) => (<MovieItem
                movie={movie}
                fallback={true}
                key={uniqid()}
                openBox={this.props.openBox}/>));

        return <div className='featured-container'>{featuredMovies}</div>;
    }
}

export default FeaturedContainer;
