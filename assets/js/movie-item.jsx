import Fade from "react-reveal/Fade"
import LazyLoad from "react-lazy-load"
import FastAverageColor from 'fast-average-color'

class MovieItem extends React.Component{
	constructor(props){
		super(props);

		this.state = {
			averageColor: {
				hex: '#000',
				value: [0,0,0]
			},
			backdrop: false,
			fontSize: 1
		}
	}

	loadImage = () => {
		this.setState({backdrop: `url(${this.props.featured ? this.backdropImageURL : this.imageURL})`});
	}

	handleImage = () => {
		this.image = new Image();
		this.imageURL = this.props.movie.poster_path ? `https://image.tmdb.org/t/p/w780${this.props.movie.poster_path}` : `https://image.tmdb.org/t/p/w780${this.props.movie.backdrop_path}`;
		this.image.src = this.imageURL;

		let image = new Image();
		image.src = `https://image.tmdb.org/t/p/w300${this.props.movie.backdrop_path}`;

		let fac = new FastAverageColor();

		fac
			.getColorAsync(image, { algorithm: 'sqrt' })
			.then((color) => {
				this.setState({ averageColor: color});
			})
			.catch((err) => console.log(err));

		if(this.props.featured){
			this.backdropImage = new Image();
			this.backdropImageURL = `https://image.tmdb.org/t/p/original${this.props.movie.backdrop_path}`;
			this.backdropImage.src = this.backdropImageURL;
			this.backdropImage.onload = this.loadImage;
		}else{
			this.image.onload = this.loadImage;
		}
	}

	handleMovieClick = () => {
		let movie = this.props.movie;
		movie.averageColor = this.state.averageColor;
		this.props.openBox(movie);
	}

	componentDidMount(){
		this.setState({fontSize: (-0.0195 * this.props.movie.title.length) + 1.6});
	}

    componentWillUnmount(){
    	if(this.props.featured){
			if(this.backdropImage){
				this.backdropImage.onload = false;
			}
		}else{
			if(this.image){
				this.image.onload = false;
			}
		}
    }

	render() {
		return(
			<Fade delay={50} distance="10%" bottom>
				<div
	                className="movie-item"
	                onClick={this.handleMovieClick}
	            >
	                <div className="movie-item-desc">
	                    <div
	                        className="movie-item-title"
	                        style={{
	                            fontSize: `${this.state.fontSize}em`
	                        }}
	                    >
	                        {this.props.movie.title}
	                    </div>
	                    <div className="movie-item-summary">
	                        {this.props.strip(this.props.movie.overview, 80) + "..."}
	                    </div>
	                </div>
	                <div className="movie-item-bg" />
	                <div className="movie-item-blurred" style={{
	                	backgroundImage: `url(https://image.tmdb.org/t/p/${this.props.featured ? 'w300' : 'w92'}${this.props.featured ? this.props.movie.backdrop_path : this.props.movie.poster_path})`
	                }}></div>
	                <LazyLoad onContentVisible={this.handleImage}>
	                	<div className={"movie-backdrop" + (this.state.backdrop ? " movie-backdrop-show" : "")} style={{
	                    backgroundImage: this.state.backdrop
	                }}></div>
	                </LazyLoad>
	            </div>
            </Fade>
		)
	}
}
