import React, { Component } from "react";
import Fade from "react-reveal/Fade";

import ChromeCastContainer from "./chrome-cast-container";

class CastContainer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Fade duration={350} when={this.props.show} distance="10%" bottom>
                <div
                    className={`player-dialog-container cast-container p ${
                        this.props.show ? "" : "no-pointer-events"
                    }`}
                >
                    <div className="player-dialog-title">Cast</div>
                    <ChromeCastContainer {...this.props} />
                </div>
            </Fade>
        );
    }
}

export default CastContainer;
