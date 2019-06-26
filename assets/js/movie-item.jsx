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
        if (!this.unMounting) {
            this.setState({
                backdrop: `${this.props.fallback
                    ? this.props.movie.flixerr_data.backdrop_path
                    : this.props.movie.flixerr_data.poster_path}`
            });
        }
    };

    createNewImage = (src) => {
        let image = new Image();
        image.src = src;

        return image;
    }

    handleImage = () => {
        let posterImage = this.createNewImage(this.props.movie.flixerr_data.poster_path);
        let colorImage = this.createNewImage(this.props.movie.flixerr_data.blurry_backdrop_path);
        let fac = new FastAverageColor();

        fac
            .getColorAsync(colorImage, {algorithm: "sqrt"})
            .then((color) => {
                if (!this.unMounting) {
                    this.setState({averageColor: color});
                }
            })
            .catch((err) => console.log(err));

        if (this.props.fallback) {
            let backdropImage = this.createNewImage(this.props.movie.flixerr_data.backdrop_path);
            backdropImage.onload = this.loadImage;
        } else {
            posterImage.onload = this.loadImage;
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

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.averageColor === this.state.averageColor && nextState.backdrop === this.state.backdrop && nextState.fontSize === this.state.fontSize && nextState.stars === this.state.stars && nextProps.movie === this.props.movie) {
            return false;
        } else {
            return true;
        }
    }

    componentDidMount() {
        console.log(this.props.movie)
        this.setState({
            fontSize: -0.0195 * this.props.movie.title.length + 1.6,
            stars: this.getStars()
        });
    }

    componentWillUnmount() {
        this.unMounting = true;
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
                        src={this.props.fallback
                        ? this.props.movie.flixerr_data.blurry_backdrop_path
                        : this.props.movie.flixerr_data.blurry_poster_path}
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
