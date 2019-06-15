import ReactCSSTransitionGroup from "react-addons-css-transition-group";

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
        if(!this.props.openBackup){
            this.toggleOverlay(false);
        }
    }

    mouseMove = () => {
        if(!this.props.openBackup){
            this.toggleOverlay(true);
            clearTimeout(this.state.timer);
            this.setState({
                timer: setTimeout(this.mouseStopped, 5000)
            });
        }
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

    handleClose = (e) => {
        this.windowTimeout = setTimeout(() => {
            window.removeEventListener("beforeunload", this.handleClose);
            window.close();
        }, 600);
        e.preventDefault();
        this.playOrPause();
        this
            .props
            .handleVideoClose(this.state.video);
        e.returnValue = false;
    }

    handleTorrentClick = (torrent) => {
        this.props.changeCurrentMagnet(torrent.magnet);
        this.props.updateMovieTimeArray();
        this.props.resetClient(true);
        this
            .props
            .closeBackup();
        this
            .props
            .streamTorrent(torrent);
    }

    handleOpenBackup = () =>{
        if(this.props.index !== false){
            this.state.video.pause();
        }
        this.props.showBackup(true);
    }

    handleBg = () => {
        if(this.props.index !== false){
            this.state.video.play();
        }
        this.props.closeBackup();
    }

    shouldComponentUpdate(nextProps, nextState){
        if(nextProps.openBackup === this.props.openBackup && nextProps.movie === this.props.movie && nextProps.backupTorrents === this.props.backupTorrents && nextState.showOverlay === this.state.showOverlay && nextProps.paused === this.props.paused && nextProps.index === this.props.index && nextProps.time === this.props.time){
            return false;
        } else{
            return true;
        }
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

        let backupContainer = this.props.openBackup
            ? <BackupTorrents
                    movie={this.props.movie}
                    torrents={this.props.backupTorrents || this.props.movie.preferredTorrents}
                    handleTorrentClick={this.handleTorrentClick}
                    resetClient={this.props.resetClient}
                    searchTorrent={this.props.searchTorrent}
                    closeBackup={this.props.closeBackup}/>
            : "";
        let backupContainerBg = this.props.openBackup
            ? <div className="backup-bg" onClick={this.handleBg}></div>
            : "";
        return (
            <div
                className={"movie-player " + (this.state.showOverlay
                ? ""
                : this.props.openBackup
                    ? ""
                    : "movie-hide")}
                style={{
                backgroundImage: `${this.props.loading
                    ? this.props.error
                        ? "none"
                        : "url(assets/imgs/loading.apng)" : "none"}`
            }}
                onMouseMove={this.mouseMove}>
                <ReactCSSTransitionGroup
                    transitionName="movie-box-anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {backupContainer}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup
                    transitionName="box-anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {backupContainerBg}
                </ReactCSSTransitionGroup>
                <div
                    className={"top-bar-container " + (this.state.showOverlay
                    ? ""
                    : "top-bar-hide")}>
                    <div className="top-bar">
                        <i
                            className="mdi mdi-light mdi-chevron-left mdi-36px"
                            onClick={this.closeClient}/>
                        <div>{this.props.movie.title}</div>
                        <i
                            className="open-backup mdi mdi-light mdi-sort-variant"
                            onClick={this.handleOpenBackup} />
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
