import React, { Component } from "react";

import Fade from "react-reveal/Fade";
import LazyLoad from "react-lazy-load";

import MovieItem from "./movie-item";

class GenreContainer extends Component {
	constructor(props) {
		super(props);

		this.movieListRef = React.createRef();

		this.state = {
			showArrows: false,
			movieScrollLeft: false,
			movieScrollRight: true
		};
	}

	easingFunction = (t, b, c, d) => {
		t /= d / 2;
		if (t < 1) return (c / 2) * t * t * t * t + b;
		t--;
		return (-c / 2) * (t * (t - 2) - 1) + b;
	};

	scrollTo = (to, duration) => {
		return new Promise((resolve, reject) => {
			let start = this.movieListRef.current.scrollLeft,
				change = to - start,
				currentTime = 0,
				increment = 20;

			let animateScroll = () => {
				currentTime += increment;
				let val = this.easingFunction(
					currentTime,
					start,
					change,
					duration
				);
				this.movieListRef.current.scrollLeft = val;
				if (currentTime < duration) {
					setTimeout(animateScroll, increment);
				} else if (currentTime >= duration) {
					resolve();
				}
			};

			animateScroll();
		});
	};

	scrollMovieGenre = (left) => {
		let n = this.props.genreInfo.movies.length;

		let container = this.movieListRef.current,
			scrollVal = container.scrollLeft;

		let viewportW = container.offsetWidth - 50,
			boxW = 230,
			viewItems = Math.ceil(viewportW / boxW) - 1,
			containerScrollWidth = boxW * n - viewportW - 30;

		if (left) {
			scrollVal -= boxW * viewItems;
			scrollVal += 15;
		} else {
			scrollVal += boxW * viewItems;
			scrollVal -= 15;
		}

		if (
			scrollVal > containerScrollWidth - 30 &&
			scrollVal < containerScrollWidth
		) {
			scrollVal = containerScrollWidth;
		}

		this.scrollTo(scrollVal, 450).then(() => {
			if (
				container.scrollLeft + container.offsetWidth >=
				container.scrollWidth - 10
			) {
				this.setState({ movieScrollRight: false });
				this.setState({ movieScrollLeft: true });
			} else if (container.scrollLeft === 0) {
				this.setState({ movieScrollRight: true });
				this.setState({ movieScrollLeft: false });
			} else {
				this.setState({ movieScrollRight: true });
				this.setState({ movieScrollLeft: true });
			}
		});
	};

	scrollLeft = () => {
		this.scrollMovieGenre(true);
	};

	scrollRight = () => {
		this.scrollMovieGenre();
	};

	handleResize = () => {
		if (this.movieListRef.current) {
			if (this.props.genreInfo.movies) {
				if (
					this.props.genreInfo.movies.length * 220 >
					this.movieListRef.current.offsetWidth
				) {
					this.setState({ showArrows: true });

					if (
						this.movieListRef.current.scrollLeft +
							this.movieListRef.current.offsetWidth <
						this.movieListRef.current.scrollWidth - 10
					) {
						this.setState({ movieScrollRight: true });
					} else {
						this.setState({ movieScrollRight: false });
					}
				} else {
					this.setState({ showArrows: false });
				}
			}
		}
	};

	handleOpenGenre = () => {
		this.props.toggleGenre(true, this.props.genreInfo);
	};

	shouldComponentUpdate(nextProps, nextState) {
		if (
			this.state.showArrows === nextState.showArrows &&
			this.props.genreInfo === this.props.genreInfo &&
			this.state.movieScrollLeft === nextState.movieScrollLeft &&
			this.state.movieScrollRight === nextState.movieScrollRight
		) {
			return false;
		} else {
			return true;
		}
	}

	componentDidMount() {
		this.handleResize();
		window.addEventListener("resize", this.handleResize);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.handleResize);
	}

	render() {
		let movies = this.props.genreInfo.movies.map((movie, index) => (
			<MovieItem
				movie={movie}
				openBox={this.props.openBox}
				key={movie.title + index + 'genre'}
			/>
		));
		let n = this.props.genreInfo.movies.length ? 470 : 100;

		return (
			<LazyLoad
				height={n}
				offsetVertical={n}
				debounce={false}
				onContentVisible={this.handleResize}>
				<Fade distance='20%' bottom>
					<div className='genre-container'>
						<div
							className="movie-genre"
							onClick={this.handleOpenGenre}>
							<span>{this.props.genreInfo.activeGenre}</span>
						</div>
						{this.state.showArrows ? (
							<div className='movie-scroll-container'>
								{this.state.movieScrollLeft ? (
									<div
										className='movie-scroll movie-scroll-left'
										onClick={this.scrollLeft}>
										<i className='mdi mdi-light mdi-24px mdi-chevron-left' />
									</div>
								) : (
									""
								)}
								{this.state.movieScrollRight ? (
									<div
										className='movie-scroll movie-scroll-right'
										onClick={this.scrollRight}>
										<i className='mdi mdi-light mdi-24px mdi-chevron-right' />
									</div>
								) : (
									""
								)}
							</div>
						) : (
							""
						)}
						{this.props.genreInfo.movies ? (
							this.props.genreInfo.movies.length ? (
								<div
									className='movie-list-paginated'
									ref={this.movieListRef}>
									{movies}
								</div>
							) : (
								""
							)
						) : (
							""
						)}
					</div>
				</Fade>
			</LazyLoad>
		);
	}
}

export default GenreContainer;
