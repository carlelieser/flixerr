import React, { Component } from 'react';

import Fade from 'react-reveal/Fade';
import LazyLoad from "react-lazy-load";

class Season extends Component {
	constructor(props) {
		super(props);

		this.state = {
			collapsed: true
		}
	}

	render() {
		let episodes = this.props.episodes.map((episode, index) => (
			<Fade key={this.props.name + episode.name + index} distance="10%" cascade top>
				<div className="episode">
					<div className="episode-still" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w300${episode.still_path})` }}>
						{episode.still_path ? '' : <i className={`mdi ${this.props.isLightClass} mdi-image mdi-36px`} />}
					</div>
					<div className="episode-info">
						<div className="episode-title"><div>{`${episode.episode_number}.`}</div><div>{episode.name}</div></div>
						<div className="episode-desc">{`${episode.overview.substring(0, 234)}${episode.overview.length < 234 ? '' : '...'}`}</div>
					</div>
				</div>
			</Fade>
		));

		let n = 20 + 43 + (episodes.length * 205);
		return (
			<LazyLoad
				height={n}
				offsetVertical={n}
				debounce={false}>
				<div className="season">
					<div className="season-title">{this.props.name}</div>
					{episodes}
				</div>
			</LazyLoad>
		)
	}
}

export default Season;