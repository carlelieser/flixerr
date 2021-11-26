import React, { Component } from "react";

import Episode from "./episode";

import Fade from "react-reveal/Fade";

class Season extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: true,
        };
    }

    handleStreamEpisode = (episode) => {
        this.props.playMovie(episode);
    };

    toggleCollapse = () => {
        this.setState((prevState) => {
            return {
                collapsed: !prevState.collapsed,
            };
        });
    };

    render() {
        let episodes = this.props.season.episodes.map((episode, index) => (
            <Episode
                handleStreamEpisode={this.handleStreamEpisode}
                episode={episode}
                iconClass={this.props.iconClass}
            />
        ));

        return (
            <div className="season" onClick={this.toggleCollapse}>
                <div className="season-title">
                    <div>{this.props.season.name}</div>
                    <i
                        className={`mdi ${this.props.iconClass} ${
                            this.state.collapsed
                                ? "mdi-menu-down arrow-collapse"
                                : "mdi-menu-up"
                        }`}
                    />
                </div>
                <Fade
                    when={!this.state.collapsed}
                    duration={450}
                    distance="1%"
                    top
                >
                    <div
                        className={`episodes ${
                            this.state.collapsed ? "episodes-collapsed" : ""
                        }`}
                    >
                        {episodes}
                    </div>
                </Fade>
            </div>
        );
    }
}

export default Season;
