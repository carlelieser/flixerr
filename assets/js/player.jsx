import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

class Player extends React.Component {
    constructor(props) {
        super(props);

        this.videoElement = React.createRef();

        this.state = {
            fullScreen: false,
            timer: false,
            showOverlay: true,
            showSubtitles: false,
            videoBuffering: false
        }
    }

    toggleOverlay = (show) => {
        this.setState({showOverlay: show});
    }

    mouseStopped = () => {
        if (!this.props.openBackup) {
            this.toggleOverlay(false);
        }
    }

    mouseMove = () => {
        if (!this.props.openBackup) {
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

    handleVideoPlayback = (toggle, play) => {
        if (this.videoElement.current) {
            if (toggle) {
                if (this.videoElement.current.paused == true) {
                    this.videoElement.current.play();
                } else {
                    this.videoElement.current.pause();
                }
            } else if (play) {
                this.videoElement.current.play();
            } else {
                this.videoElement.current.pause();
            }

            this.toggleOverlay(this.videoElement.current.paused);
        }
    }

    playVideo = () => {
        this.handleVideoPlayback(false, true);
    }

    pauseVideo = () => {
        this.handleVideoPlayback();
    }

    setVideoTime = (time) => {
        this.videoElement.current.currentTime = time;
    }

    toggleVideoPlayback = () => {
        this.handleVideoPlayback(true, false);
    }

    handleKeyPress = (e) => {
        if (e.keyCode == 32) {
            this.toggleVideoPlayback();
        } else if (e.keyCode == 27) {
            if (this.state.fullScreen) {
                this.fullScreen();
            } else {
                this.closeClient();
            }
        }

        if (e.keyCode == 37) {
            let time = this.props.currentTime - 10;
            this.setVideoTime(time);
        }

        if (e.keyCode == 39) {
            let time = this.props.currentTime + 30;
            this.setVideoTime(time);
        }
    }

    changeTime = (e) => {
        let value = e.currentTarget.value;
        let percent = value / 100;
        let time = this.videoElement.current.duration * percent;
        
        this.setVideoTime(time);
        this.props.setSeekValue(value);
        this.props.setColorStop(percent);
    }

    closeClient = () => {
        this
            .props
            .removeClient(this.props.currentTime);
    }

    handleClose = (e) => {
        this.windowTimeout = setTimeout(() => {
            window.removeEventListener('beforeunload', this.handleClose);
            window.close();
        }, 600);
        e.preventDefault();
        this.pauseVideo();
        this
            .props
            .handleVideoClose(this.state.video);
        e.returnValue = false;
    }

    handleTorrentClick = (torrent) => {
        this
            .props
            .setPlayerLoading(true);
        
        this
            .props
            .updateMovieTime(this.videoElement.current.currentTime);

        this
            .props
            .resetClient(true)
            .then((result) => {
                this
                    .props
                    .streamTorrent(torrent);
            });
        this
            .props
            .closeBackup();
    }

    handleOpenBackup = () => {
        if (this.props.videoIndex !== false) {
            this.pauseVideo();
        }
        this
            .props
            .showBackup(true);
    }

    handleSubtitles = () => {
        this.setState((prevState) => {
            return {
                showSubtitles: !prevState.showSubtitles
            }
        });
    }

    handleBg = () => {
        if (this.props.videoIndex !== false) {
            this.playVideo();
        }
        this
            .props
            .closeBackup();
    }

    handleBuffer = () => {
        this.setState({videoBuffering: true});
    }

    handleUpdate = (e) => {
        this.setState({videoBuffering: false});
        this.props.handleVideo(e);
    }

    handleMouseDown = (e) => {
        this.pauseVideo();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.openBackup === this.props.openBackup && nextProps.movie === this.props.movie && nextState.showOverlay === this.state.showOverlay && nextProps.paused === this.props.paused && nextProps.videoIndex === this.props.videoIndex && nextProps.time === this.props.time && nextProps.loading === this.props.loading && nextProps.playerStatus.status === this.props.playerStatus.status && nextProps.seekValue === this.props.seekValue && nextProps.currentTime === this.props.currentTime && nextState.videoBuffering === this.state.videoBuffering && nextProps.startTime === this.props.startTime) {
            return false;
        } else {
            return true;
        }
    }

    componentDidUpdate(prevProps){
        if(prevProps.startTime != this.props.startTime){
            this.videoElement.current.currentTime = this.props.startTime;
        }
    }

    componentDidMount() {
        this.props.setSeekValue(0);
        this.props.setColorStop(0);
        this.props.setVideoElement(this.videoElement);

        window.addEventListener('keydown', this.handleKeyPress);
        window.addEventListener('beforeunload', this.handleClose);
    }

    componentWillUnmount() {
        clearTimeout(this.state.timer);
        clearTimeout(this.windowTimeout);
        this.props.handleVideoClose(this.videoElement.current);
        window.removeEventListener('keydown', this.handleKeyPress);
        window.removeEventListener('beforeunload', this.handleClose);
    }

    render() {

        let backupContainer = this.props.openBackup
            ? <BackupTorrents
                    movie={this.props.movie}
                    torrents={this.props.movie.preferredTorrents}
                    getCurrentMagnet={this.props.getCurrentMagnet}
                    handleTorrentClick={this.handleTorrentClick}
                    resetClient={this.props.resetClient}
                    streamTorrent={this.props.streamTorrent}
                    searchTorrent={this.props.searchTorrent}
                    closeBackup={this.props.closeBackup}
                    setPlayerLoading={this.props.setPlayerLoading}/>
            : '';
        let backupContainerBg = this.props.openBackup
            ? <div className='backup-bg' onClick={this.handleBg}></div>
            : '';

        let playerStatusContainer = this.props.playerStatus
            ? <div
                    style={{
                    marginBottom: this.state.showOverlay
                        ? '130px'
                        : '60px'
                }}className='player-status-container'>
                    <span>{this.props.playerStatus.status}</span>
                    {this.props.playerStatus.loading
                        ? <span className='dots'></span>
                        : ''}
                </div>
            : '';

        return (
            <div
                className={'movie-player ' + (this.state.showOverlay
                ? ''
                : this.props.openBackup
                    ? ''
                    : 'movie-hide')}
                style={{
                backgroundImage: `${this.props.loading
                    ? this.props.error
                        ? 'none'
                        : 'url(assets/imgs/loading.apng)' : 'none'}`
            }}
                onMouseMove={this.mouseMove}>
                {this.state.videoBuffering ? <div className="video-buffer-container"></div> : ''}
                <ReactCSSTransitionGroup
                    transitionName='movie-box-anim'
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {backupContainer}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup
                    transitionName='box-anim'
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {backupContainerBg}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup
                    transitionName='player-status-anim'
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {playerStatusContainer}
                </ReactCSSTransitionGroup>
                <div
                    className={'top-bar-container ' + (this.state.showOverlay
                    ? ''
                    : 'top-bar-hide')}>
                    <div className='top-bar'>
                        <i
                            className='mdi mdi-light mdi-chevron-left mdi-36px'
                            onClick={this.closeClient}/>
                        <div>{this.props.movie.title}</div>
                        <i
                            className='open-backup mdi mdi-light mdi-sort-variant'
                            onClick={this.handleOpenBackup}/>
                    </div>
                </div>
                <div
                    className={'bottom-bar-container ' + (this.state.showOverlay
                    ? ''
                    : 'bottom-bar-hide')}>
                    <div className='bottom-bar'>
                        <i
                            className={'mdi mdi-light mdi-36px play-button ' + (this.props.paused
                            ? 'mdi-play'
                            : 'mdi-pause')}
                            onClick={this.toggleVideoPlayback}/>
                        <input
                            className='seek-bar'
                            type='range'
                            value={this.props.seekValue}
                            onChange={this
                            .changeTime
                            .bind(this)}
                            onMouseDown={this.handleMouseDown}
                            onMouseUp={this.playVideo}
                            min={0}
                            max={this.state.videoElement ? this.state.videoElement.current.duration : 100}
                            step={0.1}
                            style={{
                            backgroundImage: `-webkit-gradient(linear, left top, right top, color-stop(${this.props.colorStop}, rgb(255, 0, 0)), color-stop(${this.props.colorStop}, rgba(255, 255, 255, 0.158)))`
                        }}/>
                        <span>{this.props.time}</span>
                        <i
                            className='mdi mdi-light mdi-fullscreen mdi-36px fullscreen-btn'
                            onClick={this.fullScreen}/>
                    </div>
                </div>
                <video
                    autoPlay
                    type='video/mp4'
                    onTimeUpdate={this.handleUpdate.bind(this)}
                    onWaiting={this.handleBuffer}
                    src={Number.isInteger(this.props.videoIndex)
                    ? `http://localhost:8888/${this.props.videoIndex}`
                    : ''}
                    ref={this.videoElement}/>
            </div>
        )
    }
}
