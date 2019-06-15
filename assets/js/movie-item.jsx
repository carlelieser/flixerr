import React, {Component} from "react";

import Fade from "react-reveal/Fade";
import FastAverageColor from "fast-average-color";
import uniqid from "uniqid";

class MovieItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            averageColor: {
                hex: "#000",
                value: [0, 0, 0]
            },
            backdrop: false,
            fontSize: 1,
            stars: 1
        };
    }

    strip = (string, chars) => {
        return string.substring(0, chars);
    };

    loadImage = () => {
        this.setState({
            backdrop: `${this.props.fallback
                ? this.backdropImageURL
                : this.imageURL}`
        });
    };

    handleImage = () => {
        this.image = new Image();
        this.imageURL = this.props.movie.poster_path
            ? `https://image.tmdb.org/t/p/w780${this.props.movie.poster_path}`
            : `https://image.tmdb.org/t/p/w780${
        this.props.movie.backdrop_path}`;
        this.image.src = this.imageURL;

        let image = new Image();
        image.src = `https://image.tmdb.org/t/p/w300${
        this.props.movie.backdrop_path}`;

        let fac = new FastAverageColor();

        fac
            .getColorAsync(image, {algorithm: "sqrt"})
            .then((color) => {
                if (!this.unMounting) {
                    this.setState({averageColor: color});
                }
            })
            .catch((err) => console.log(err));

        if (this.props.fallback) {
            this.backdropImage = new Image();
            this.backdropImageURL = `https://image.tmdb.org/t/p/original${
            this.props.movie.backdrop_path}`;
            this.backdropImage.src = this.backdropImageURL;
            this.backdropImage.onload = this.loadImage;
        } else {
            this.image.onload = this.loadImage;
        }
    };

    handleMovieClick = () => {
        let movie = this.props.movie;
        movie.averageColor = this.state.averageColor;
        this
            .props
            .openBox(movie);
    };

    getMovieRating = (className) => {
        return (
            <div key={uniqid()} className='movie-item-star'>
                <i className={`mdi mdi-light ${className}`}/>
            </div>
        );
    };

    loopStars = (starArray, limit, className) => {
        for (let i = 0; i < limit; i++) {
            starArray.push(this.getMovieRating(className));
        }
    };

    getStars = () => {
        let amountOfStars = (this.props.movie.vote_average / 10) * 5,
            nearestHalf = Math.round(amountOfStars * 2) / 2,
            floored = Math.floor(nearestHalf),
            difference = Math.floor(5 - nearestHalf),
            stars = [];

        this.loopStars(stars, floored, "mdi-star");
        if (nearestHalf - floored !== 0) {
            stars.push(this.getMovieRating("mdi-star-half"));
        }
        this.loopStars(stars, difference, "mdi-star-outline");

        return stars;
    };

    componentDidMount() {
        this.setState({
            fontSize: -0.0195 * this.props.movie.title.length + 1.6,
            stars: this.getStars()
        });
    }

    componentWillUnmount() {
        this.unMounting = true;
        if (this.props.fallback) {
            if (this.backdropImage) {
                this.backdropImage.onload = false;
            }
        } else {
            if (this.image) {
                this.image.onload = false;
            }
        }
    }

    render() {
        return (
            <Fade distance='10%' bottom>
                <div className='movie-item' onClick={this.handleMovieClick}>
                    <div
                        className='movie-item-desc'
                        style={{
                        backgroundColor: this.state.averageColor
                            ? `rgba(${this.state.averageColor.value[0]}, ${this.state.averageColor.value[1]}, ${this.state.averageColor.value[2]}, 0.4)`
                            : 'rgba(0,0,0,0.1)'
                    }}>
                        <div
                            className='movie-item-title'
                            style={{
                            fontSize: `${this.state.fontSize}em`
                        }}>
                            {this.props.movie.title}
                        </div>
                        <div className='movie-item-summary'>
                            {this.strip(this.props.movie.overview, 80) + "..."}
                        </div>
                        <div className='movie-item-stars'>
                            {this.state.stars}
                        </div>
                    </div>
                    <div className='movie-item-bg'/>
                    <img
                        className='movie-item-blurred'
                        src={`https://image.tmdb.org/t/p/${this.props.fallback
                        ? "w300"
                        : "w92"}${this.props.fallback
                            ? this.props.movie.backdrop_path
                            : this.props.movie.poster_path}`}
                        onLoad={this.handleImage}/> {this.state.backdrop
                        ? (<img
                            className={"movie-backdrop" + (this.state.backdrop
                            ? " movie-backdrop-show"
                            : "")}
                            src={this.state.backdrop}/>)
                        : ("")}
                </div>
            </Fade>
        );
    }
}

export default MovieItem;
