import React, { Component } from "react";

class CastReceiver extends Component {
    constructor(props) {
        super(props);
    }

    handleClick = () => {
        this.props.toggleCastContainer();
        this.props.handleCast(this.props.device);
    };

    render() {
        let { name } = this.props.device;
        let isActive = this.props.activeCastingDevice
            ? this.props.activeCastingDevice.name == name
            : false;
        let icon = isActive ? "stop" : "television";
        return (
            <div
                className={`cast-device ${
                    isActive ? "cast-device-active" : ""
                }`}
                onClick={this.handleClick}
            >
                <span className={`mdi mdi-light mdi-${icon}`}></span>
                <span className="cast-device-name">{name}</span>
            </div>
        );
    }
}

export default CastReceiver;
