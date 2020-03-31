import React, { Component } from "react";

import Fade from "react-reveal/Fade";
import uniqid from "uniqid";

class Episode extends Component {
	constructor(props) {
		super(props);

		this.handleEpisode.bind(this);
	}

	handleEpisode = e => {
		e.stopPropagation();
		this.props.handleStreamEpisode(this.props.episode);
	};

	render() {
		let episode = this.props.episode;
		let { still_path, episode_number, name, overview } = episode;

		let desc = `${overview.substring(0, 234)}${
			overview.length < 234 ? "" : "..."
		}`;
		return (
			<Fade key={uniqid()} distance="10%" top>
				<div className="episode" onClick={this.handleEpisode}>
					<div
						className="episode-still"
						style={{
							backgroundImage: `url(https://image.tmdb.org/t/p/w300${still_path})`
						}}
					>
						{still_path ? (
							""
						) : (
							<i
								className={`mdi ${this.props.iconClass} mdi-image mdi-36px`}
							/>
						)}
						{!still_path ? (
							""
						) : (
							<div className="still-hover">
								<i className="mdi mdi-play" />
							</div>
						)}
					</div>
					<div className="episode-info">
						<div className="episode-title">
							<div>{`${episode_number}.`}</div>
							<div>{name}</div>
						</div>
						<div className="episode-desc">{desc}</div>
					</div>
				</div>
			</Fade>
		);
	}
}

export default Episode;
