class Player extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            video: false,
            fullScreen: false,
            timer: false,
            showOverlay: true
        }
    }

    toggleOverlay = (show) => {
        this.setState({showOverlay: show});
    }

    mouseStopped = () => {
        this.toggleOverlay(false);
    }

    mouseMove = () => {
        this.toggleOverlay(true);

        clearTimeout(this.state.timer);
        this.setState({
            timer: setTimeout(this.mouseStopped, 5000)
        });
    }

    fullScreen = () => {
        this.setState({
            fullScreen: !this.state.fullScreen
        }, () => {
            this
                .props
                .setFullScreen(this.state.fullScreen);
        });
    }

    playOrPause = () => {
        if (this.state.video.paused == true) {
            this
                .state
                .video
                .play();
        } else {
            this
                .state
                .video
                .pause();
        }
    }

    handleKeyPress = (e) => {
        if (e.keyCode == 32) {
            this.playOrPause();
        } else if (e.keyCode == 27) {
            if (this.state.fullScreen) {
                this.fullScreen();
            } else {
                this.closeClient();
            }
        }

        if (e.keyCode == 37) {
            let time = document
                .querySelector("video")
                .currentTime;
            document
                .querySelector("video")
                .currentTime = time - 10;
        }

        if (e.keyCode == 39) {
            let time = document
                .querySelector("video")
                .currentTime;
            document
                .querySelector("video")
                .currentTime = time + 30;
        }
    }

    changeTime = () => {
        let seekBar = document.querySelector(".seek-bar");
        let time = document
            .querySelector("video")
            .duration * (this.props.getElementValue(seekBar) / 100);

        this
            .props
            .setElementValue(document.querySelector("video"), "currentTime", time);
    }

    closeClient = () => {
        let currentTime = document
            .querySelector("video")
            .currentTime;
        this
            .props
            .removeClient(currentTime);
    }

    handleClose =(e)=>{
        this.windowTimeout = setTimeout(() => {
            window.removeEventListener("beforeunload", this.handleClose);
            window.close();
        }, 600);
        e.preventDefault();
        this.playOrPause();
        this.props.handleVideoClose(this.state.video);
        e.returnValue = false;
    }

    componentDidMount() {
        this
            .props
            .setElementValue(document.querySelector(".seek-bar"), "value", 0);
        this.setState({
            video: document.querySelector("video")
        });

        window.addEventListener("keydown", this.handleKeyPress);
        window.addEventListener("beforeunload", this.handleClose);
    }

    componentWillUnmount() {
        clearTimeout(this.state.timer);
        clearTimeout(this.windowTimeout);
        this
            .props
            .handleVideoClose(this.state.video);
        window.removeEventListener("keydown", this.handleKeyPress);
        window.removeEventListener("beforeunload", this.handleClose);

    }

    render() {
        return (
            <div
                className={"movie-player " + (this.state.showOverlay
                ? ""
                : "movie-hide")}
                style={{
                backgroundImage: `${this.props.loading
                    ? this.props.error
                        ? "url(assets/imgs/error.png)"
                        : "url(assets/imgs/loading.apng)" : ""}`
            }}
                onMouseMove={this.mouseMove}>
                <div
                    className={"top-bar-container " + (this.state.showOverlay
                    ? ""
                    : "top-bar-hide")}>
                    <div className="top-bar">
                        <i
                            className="mdi mdi-light mdi-chevron-left mdi-36px"
                            onClick={this.closeClient}/>
                        <div>{this.props.movie.title}</div>
                    </div>
                </div>
                <div
                    className={"bottom-bar-container " + (this.state.showOverlay
                    ? ""
                    : "bottom-bar-hide")}>
                    <div className="bottom-bar">
                        <i
                            className={"mdi mdi-light mdi-36px play-button " + (this.props.paused
                            ? "mdi-play"
                            : "mdi-pause")}
                            onClick={this.playOrPause}/>
                        <input
                            className="seek-bar"
                            type="range"
                            onChange={() => this.changeTime()}
                            onMouseDown={() => document.querySelector("video").pause()}
                            onMouseUp={() => document.querySelector("video").play()}/>
                        <span>{this.props.time}</span>
                        <i
                            className="mdi mdi-light mdi-fullscreen mdi-36px fullscreen-button"
                            onClick={this.fullScreen}/>
                    </div>
                </div>
                <video
                    autoPlay
                    onTimeUpdate={this.props.handleVideo}
                    type="video/mp4"
                    src={this.props.index === false
                    ? ''
                    : `http://localhost:8888/${this.props.index}`}/>
            </div>
        )
    }
}
