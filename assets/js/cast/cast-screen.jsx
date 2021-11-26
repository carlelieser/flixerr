import React, { Component } from "react";
import Fade from "react-reveal/Fade";

class CastScreen extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Fade
                mountOnEnter
                unmountOnExit
                duration={350}
                when={this.props.show}
                distance="10%"
                bottom
            >
                <div
                    className={`cast-screen ${
                        this.props.show ? "" : "no-pointer-events"
                    }`}
                >
                    <div className="cast-screen-bg"></div>
                </div>
            </Fade>
        );
    }
}

export default CastScreen;
