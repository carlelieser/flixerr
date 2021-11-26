import React, { Component } from "react";
import CastReceiver from "./cast-device";
import Device from "./device";

let Client = require("castv2").Client;
let mdns = require("mdns");
let accurateInterval = require("accurate-interval");

class ChromeCastContainer extends Component {
    constructor(props) {
        super(props);

        this.client = new Client();

        this.appId = "CC1AD845";
        this.heartbeatInterval = false;
        this.mainConnection = false;
        this.receiverConnection = false;
        this.mediaConnection = false;
        this.browser = false;
        this.protocols = {
            connection: "urn:x-cast:com.google.cast.tp.connection",
            heartbeat: "urn:x-cast:com.google.cast.tp.heartbeat",
            receiver: "urn:x-cast:com.google.cast.receiver",
            media: "urn:x-cast:com.google.cast.media",
        };

        this.network = require("network-address");
        this.state = {
            currentCast: false,
            sessionId: false,
            mediaSessionId: false,
            loading: true,
            devices: [],
        };
    }

    setSessionId = (sessionId) => {
        this.setState({ sessionId });
    };

    setMediaSessionId = (mediaSessionId) => {
        this.setState({ mediaSessionId });
    };

    handleReceiverStatus = (status) => {
        console.log(status);
    };

    getReceiverAddress = (device) => {
        let { addresses } = device;
        let ipRegex = /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/g;
        let ip = addresses.find((address) => address.match(ipRegex));
        return ip;
    };

    getMediaUrl = () => {
        let { videoUrl } = this.props;
        let url = videoUrl.replace("localhost", this.network());
        return url;
    };

    constructMediaObject = () => {
        let url = this.getMediaUrl();
        let media = {
            contentId: url,
            streamType: "BUFFERED",
            contentType: "video/mp4",
        };
        return media;
    };

    createChannel = (receiver, protocol) => {
        let channel = this.client.createChannel(
            "sender-0",
            receiver,
            protocol,
            "JSON"
        );
        return channel;
    };

    createClientChannel = (protocol) => {
        let clientChannel = this.createChannel("receiver-0", protocol);
        return clientChannel;
    };

    sendMessage = (target, data) => {
        try {
            console.log(target, data);
            target.send(data);
        } catch (err) {
            console.log(err);
        }
    };

    startConnection = (connection) => {
        this.sendMessage(connection, { type: "CONNECT" });
    };

    stopConnection = (connection) => {
        this.sendMessage(connection, { type: "CLOSE" });
    };

    launchReceiver = () => {
        this.sendMessage(this.receiverConnection, {
            type: "LAUNCH",
            appId: this.appId,
            requestId: 1,
        });
    };

    stopReceiver = () => {
        this.sendMessage(this.receiverConnection, {
            type: "STOP",
            sessionId: this.state.sessionId,
        });
    };

    castMedia = (mediaConnection) => {
        let mediaInfo = this.constructMediaObject();
        mediaConnection.send({
            type: "LOAD",
            media: mediaInfo,
            requestId: 2,
            currentTime: this.props.currentTime,
        });
    };

    interpretRemotePlayerState = (message) => {
        let { status, requestId, currentTime } = message;
        if (status) {
            let data = status[0];
            let { playerState, mediaSessionId } = data;
            this.setMediaSessionId(mediaSessionId);
            if (requestId === 0) {
                switch (playerState) {
                    case "BUFFERING":
                    case "PAUSED":
                        this.props.pauseVideo();
                        break;
                    case "PLAYING":
                        this.props.playVideo();
                        this.props.setVideoTime(currentTime);
                        break;
                }
            }
        }
    };

    sendMediaMessage = (type, data) => {
        this.sendMessage(this.mediaConnection, {
            mediaSessionId: this.state.mediaSessionId,
            requestId: 1,
            type,
            ...data,
        });
    };

    sendHearbeat = (heartbeat) => {
        this.sendMessage(heartbeat, { type: "PING" });
    };

    playMedia = () => {
        this.sendMediaMessage("PLAY");
    };

    pauseMedia = () => {
        this.sendMediaMessage("PAUSE");
    };

    seekMedia = (ms) => {
        console.log(ms);
        this.sendMediaMessage("SEEK", { currentTime: ms });
    };

    stopMediaConnection = () => {
        this.sendMessage(this.mediaConnection, {
            mediaSessionId: this.state.mediaSessionId,
            requestId: 1,
            type: "STOP",
        });
    };

    setHeartbeatInterval = (heartbeatConnection) => {
        this.clearHearbeatInterval();
        this.heartbeatInterval = accurateInterval(() => {
            this.sendHearbeat(heartbeatConnection);
        }, 5000);
    };

    clearHearbeatInterval = () => {
        if (this.heartbeatInterval) this.heartbeatInterval.clear();
    };

    stopAllConnections = () => {
        this.stopMediaConnection();
        this.stopReceiver();
        this.stopConnection(this.mainConnection);
        this.props.setActiveCastingDevice(false);
        this.clearHearbeatInterval();
    };

    connectToAddress = (address) => {
        this.client.connect(address, () => {
            this.mainConnection = this.createClientChannel(
                this.protocols.connection
            );
            let heartbeat = this.createClientChannel(this.protocols.heartbeat);
            this.receiverConnection = this.createClientChannel(
                this.protocols.receiver
            );

            this.startConnection(this.mainConnection);
            this.setHeartbeatInterval(heartbeat);
            this.launchReceiver();

            this.receiverConnection.on("message", (data) => {
                if (data.type == "RECEIVER_STATUS") {
                    let app = data.status.applications[0];
                    this.setSessionId(app.sessionId);

                    let appConnection = this.createChannel(
                        app.transportId,
                        this.protocols.connection
                    );

                    this.mediaConnection = this.createChannel(
                        app.transportId,
                        this.protocols.media
                    );

                    this.startConnection(appConnection);
                    this.castMedia(this.mediaConnection);
                    this.mediaConnection.on(
                        "message",
                        this.interpretRemotePlayerState
                    );

                    let { fullname, name } = this.state.currentCast;
                    console.log("Receiver:", this.state.currentCast);
                    let device = new Device(
                        fullname,
                        name,
                        this.playMedia,
                        this.pauseMedia,
                        this.seekMedia,
                        this.stopAllConnections
                    );
                    this.props.setActiveCastingDevice(device);
                }
            });
        });
    };

    handleCast = (device) => {
        let { activeCastingDevice } = this.props;
        let currentCastName = activeCastingDevice
            ? activeCastingDevice.name
            : false;
        let receiverIsNew = currentCastName !== device.name;
        if (receiverIsNew) {
            this.stopAllConnections();
            this.setState({ currentCast: device }, () => {
                let address = this.getReceiverAddress(device);
                this.connectToAddress(address);
            });
        } else {
            this.stopAllConnections();
        }
    };

    setLoading = (loading) => {
        this.setState({ loading });
    };

    setReceivers = (devices) => {
        this.setState({ devices });
    };

    addReceiver = (device) => {
        console.log("Adding device:", device);
        this.setState((prevState) => {
            let devices = [...prevState.devices];
            let exists = devices.find((device) => device.name === device.name);
            if (!exists) devices.push(device);

            return {
                devices,
            };
        });
    };

    removeReceiver = (device) => {
        console.log("Removing device:", device);
        this.setState((prevState) => {
            let devices = [...prevState.devices];
            let index = devices.findIndex((item) => item.name == device.name);
            if (index > -1) {
                devices.splice(index, 1);
            }
            return {
                devices,
            };
        });
    };

    loadReceivers = () => {
        this.browser = mdns.createBrowser(mdns.tcp("googlecast"));
        this.browser.on("serviceUp", this.addReceiver);
        this.browser.on("serviceDown", this.removeReceiver);
        this.browser.start();
    };

    resetReceivers = () => {
        this.setReceivers([]);
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevState.devices !== this.state.devices) {
            this.setLoading();
        }

        if (prevProps.activeCastingDevice !== this.props.activeCastingDevice) {
            if (!this.props.activeCastingDevice) {
                this.stopAllConnections();
            }
        }

        if (prevProps.show !== this.props.show) {
            if (!this.props.show) {
                this.clearHearbeatInterval();
            }
        }
    }

    componentDidMount() {
        this.loadReceivers();
    }

    componentWillUnmount() {
        this.resetReceivers();
        this.clearHearbeatInterval();
    }

    render() {
        let { loading, devices } = this.state;
        let castReceivers = devices.map((device) => (
            <CastReceiver
                key={device.host}
                activeCastingDevice={this.props.activeCastingDevice}
                device={device}
                handleCast={this.handleCast}
                toggleCastContainer={this.props.toggleCastContainer}
            />
        ));
        return (
            <div className="chrome-cast-container">
                <div className="player-dialog-subtitle">Chrome cast</div>
                <div className="player-dialog-text">
                    {devices.length === 0
                        ? "No devices found."
                        : loading
                        ? "Loading devices..."
                        : ""}
                </div>
                {loading ? (
                    <div className="player-dialog-loading-container"></div>
                ) : (
                    castReceivers
                )}
            </div>
        );
    }
}

export default ChromeCastContainer;
