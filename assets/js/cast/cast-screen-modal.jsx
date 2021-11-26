import React, { Component } from "react";
import Fade from "react-reveal/Fade";

class CastScreenModal extends Component {
    constructor(props) {
        super(props);
    }

    handleStopCasting = () => {
        this.props.setActiveCastingDevice(false);
    };

    render() {
        let { show, device } = this.props;
        let name = device ? device.name : "";
        return (
            <Fade
                mountOnEnter
                unmountOnExit
                duration={350}
                when={show}
                distance="10%"
                bottom
            >
                <div className="cast-screen-modal-container">
                    <div className="cast-screen-modal">
                        <i className="mdi mdi-36px mdi-cast"></i>
                        <img src="./assets/img/casting-illustration.svg" />
                        <div className="cast-screen-title">
                            Hey there hot stuff.
                        </div>
                        <div className="cast-screen-desc">
                            Look's like you're streaming to your{" "}
                            <span>{name}</span>.
                        </div>
                        <div className="btn" onClick={this.handleStopCasting}>
                            <i className="mdi mdi-stop-circle"></i>
                            <div>Stop casting</div>
                        </div>
                    </div>
                    <div class="cast-screen-modal-bg"></div>
                </div>
            </Fade>
        );
    }
}

export default CastScreenModal;
