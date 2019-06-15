import React, { Component } from "react";

class MovieModal extends Component {
	constructor(props) {
		super(props);
	}

	handleFavorites = () => {
		if (this.props.isFavorite(this.props.movie)) {
			this.props.removeFromFavorites(this.props.movie);
		} else {
			this.props.addToFavorites(this.props.movie);
		}
	};

	shouldComponentUpdate(nextProps, nextState) {
		if (
			this.props.movie === nextProps.movie &&
			this.props.favorites === nextProps.favorites
		) {
			return false;
		} else {
			return true;
		}
	}

	render() {
		return (
			<div
				className={`movie-modal ${
					this.props.movie.averageColor.isLight
						? "light-modal"
						: "dark-modal"
				}`}
				style={{
					backgroundColor: this.props.movie.averageColor.hex,
					height: this.props.movie
						? `${500 +
								this.props.movie.overview.length / 4 +
								this.props.movie.title.length / 2}px`
						: "500px"
				}}>
					<div className='movie-modal-info'>
						<div
							className='movie-modal-poster'
							style={{
								backgroundImage: `url(https://image.tmdb.org/t/p/w780${this
									.props.movie.poster_path ||
									this.props.movie.backdrop_path})`
							}}
						/>
						<div className='movie-metadata'>
							<div className='movie-modal-vote'>
								<i
									className={`mdi ${
										this.props.movie.averageColor.isLight
											? "mdi-dark"
											: "mdi-light"
									} mdi-star-outline`}
								/>
								<div>{`${this.props.movie.vote_average} / 10`}</div>
							</div>
							<div className='movie-modal-release-date'>
								{this.props.movie.release_date.substring(0, 4)}
							</div>
							<i
								className={`mdi ${
									this.props.movie.averageColor.isLight
										? "mdi-dark"
										: "mdi-light"
								} ${
									this.props.isFavorite(this.props.movie)
										? "mdi-heart"
										: "mdi-heart-outline"
								}`}
								onClick={this.handleFavorites}
							/>
						</div>
						<div className='movie-modal-title'>
							{this.props.movie.title}
						</div>
						<div className='movie-modal-desc'>
							{this.props.movie.overview}
						</div>

						<div
							className='movie-modal-play'
							onClick={() =>
								this.props.playMovie(this.props.movie)
							}>
							<i className='mdi mdi-play-circle-outline mdi-36px' />
						</div>
					</div>
					<div
						className='movie-modal-image'
						style={{
							backgroundImage: `url(https://image.tmdb.org/t/p/w300${
								this.props.movie.backdrop_path
							})`
						}}
					/>
				<div
					className='movie-gradient'
					style={{
						background: this.props.movie.averageColor
							? `linear-gradient(180deg, rgba(${
									this.props.movie.averageColor.value[0]
							  }, ${this.props.movie.averageColor.value[1]}, ${
									this.props.movie.averageColor.value[2]
							  }, 0.40) 0%, rgba(${
									this.props.movie.averageColor.value[0]
							  }, ${this.props.movie.averageColor.value[1]}, ${
									this.props.movie.averageColor.value[2]
							  }, 0.60) 20%, rgba(${
									this.props.movie.averageColor.value[0]
							  }, ${this.props.movie.averageColor.value[1]}, ${
									this.props.movie.averageColor.value[2]
							  }, 0.80) 50%, ${
									this.props.movie.averageColor.hex
							  } 100%)`
							: ""
					}}
				/>
			</div>
		);
	}
}

export default MovieModal;
