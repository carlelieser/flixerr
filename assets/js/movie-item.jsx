import Fade from "react-reveal/Fade"
import LazyLoad from "react-lazy-load"

class MovieItem extends React.Component{
	constructor(props){
		super(props);

		this.state = {
			backdrop: false,
			fontSize: 1
		}
	}

	loadImage = () => {
		this.setState({backdrop: `url(${this.props.featured ? this.backdropImageURL : this.imageURL})`});
	}

	handleImage = () => {
		this.image = new Image();
    	this.imageURL = `https://image.tmdb.org/t/p/w780${this.props.movie.poster_path}`;
		this.image.src = this.imageURL;

		this.backdropImage = new Image();
		this.backdropImageURL = `https://image.tmdb.org/t/p/original${this.props.movie.backdrop_path}`;
		this.backdropImage.src = this.backdropImageURL;

		if(this.props.featured){
			this.backdropImage.onload = this.loadImage;
		}else{
			this.image.onload = this.loadImage;
		}
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
		let movie = this.props.movie;

		return(
			<Fade delay={50} distance="10%" bottom>
				<div
	                className="movie-item"
	                onClick={() => this.props.openBox(movie)}
	            >
	                <div className="movie-item-desc">
	                    <div
	                        className="movie-item-title"
	                        style={{
	                            fontSize: `${this.state.fontSize}em`
	                        }}
	                    >
	                        {movie.title}
	                    </div>
	                    <div className="movie-item-summary">
	                        {this.props.strip(movie.overview, 80) + "..."}
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
