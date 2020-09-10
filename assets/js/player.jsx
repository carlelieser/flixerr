import React, { Component } from 'react'

import { CSSTransitionGroup } from 'react-transition-group'
import Fade from 'react-reveal/Fade'

import SubtitlesContainer from './subtitles/subtitles-container'
import BackupTorrents from './backup-torrent-container'
import CastContainer from './cast/cast-container'
import CastScreen from './cast/cast-screen'
import CastScreenModal from './cast/cast-screen-modal'
import MovieChat from './movie-chat'

class Player extends Component {
    constructor(props) {
        super(props)

        this.videoElement = React.createRef()
        this.mouseTimeout = false
        this.movieChatObserver = false
        this.movieAudienceObserver = false

        this.handleUpdate.bind(this)
        this.changeTime.bind(this)

        this.state = {
            fullScreen: false,
            showOverlay: true,
            showSubtitles: false,
            showCastContainer: false,
            showMovieChat: false,
            activeCastingDevice: false,
            videoUrl: false,
            videoBuffering: false,
            activeSubtitle: false,
            bottomBarActions: [
                {
                    icon: 'cast',
                    onClick: this.toggleCastContainer,
                },
                {
                    hideWhenPipView: true,
                    icon: 'subtitles-outline',
                    special: true,
                    onClick: this.toggleSubtitleMenu,
                },
                {
                    className: 'pip-btn',
                    icon: 'picture-in-picture-bottom-right',
                    onClick: this.togglePipView,
                },
                {
                    className: 'fullscreen-btn',
                    hideWhenPipView: true,
                    icon: 'fullscreen',
                    special: true,
                    onClick: this.toggleFullscreen,
                },
            ],
        }
    }

    toggleShowMovieChat = () => {
        this.setState((prevState) => {
            let showMovieChat = prevState.showMovieChat
            return {
                showMovieChat: !showMovieChat,
            }
        })
    }

    setActiveCastingDevice = (activeCastingDevice) => {
        this.setState({ activeCastingDevice }, () => {
            console.log(
                'Set active casting device to:',
                this.state.activeCastingDevice
            )
        })
    }

    setActiveSubtitle = (activeSubtitle) => {
        this.setState({ activeSubtitle })
    }

    toggleSubtitleMenu = () => {
        this.setState((prevState) => {
            return {
                showSubtitles: !prevState.showSubtitles,
            }
        })
    }

    toggleCastContainer = () => {
        this.setState((prevState) => {
            return {
                showCastContainer: !prevState.showCastContainer,
            }
        })
    }

    toggleOverlay = (show) => {
        this.setState({ showOverlay: show })
    }

    mouseStopped = () => {
        if (!this.props.openBackup && !this.state.showSubtitles) {
            this.toggleOverlay()
        }
    }

    mouseMove = () => {
        if (!this.props.openBackup && !this.state.showSubtitles) {
            this.toggleOverlay(true)
            clearTimeout(this.mouseTimeout)
            this.mouseTimeout = setTimeout(this.mouseStopped, 5000)
        }
    }

    toggleFullscreen = () => {
        this.setState(
            (prevState) => {
                return {
                    fullScreen: !prevState.fullScreen,
                }
            },
            () => {
                this.props.setFullScreen(this.state.fullScreen)
            }
        )
    }

    togglePipView = () => {
        this.setState((prevState) => {
            return {
                pipView: !prevState.pipView,
                showSubtitles: false,
            }
        })
    }

    handleVideoPlayback = (toggle, play) => {
        if (this.videoElement.current) {
            if (toggle) {
                if (this.videoElement.current.paused == true) {
                    this.playVideoElement()
                } else {
                    this.pauseVideoElement()
                }
            } else if (play) {
                this.playVideoElement()
            } else {
                this.pauseVideoElement()
            }

            this.toggleOverlay(this.videoElement.current.paused)
        }
    }

    playVideo = () => {
        this.handleVideoPlayback(false, true)
    }

    pauseVideo = () => {
        this.handleVideoPlayback()
    }

    playVideoElement = () => {
        if (this.state.activeCastingDevice)
            this.state.activeCastingDevice.play()
        this.videoElement.current.play()
    }

    pauseVideoElement = () => {
        if (this.state.activeCastingDevice) {
            this.state.activeCastingDevice.pause()
        }
        this.videoElement.current.pause()
    }

    setVideoTime = (time) => {
        this.videoElement.current.currentTime = time
        if (this.state.activeCastingDevice) {
            this.state.activeCastingDevice.seek(time)
        }
    }

    toggleVideoPlayback = () => {
        this.handleVideoPlayback(true, false)
    }

    handleKeyPress = (e) => {
        if (e.keyCode == 32 && e.target.nodeName !== 'TEXTAREA') {
            this.toggleVideoPlayback()
        } else if (e.keyCode == 27) {
            if (this.state.fullScreen) {
                this.toggleFullscreen()
            } else {
                this.closeClient()
            }
        }

        if (e.keyCode == 37) {
            let time = this.props.currentTime - 10
            this.setVideoTime(time)
        }

        if (e.keyCode == 39) {
            let time = this.props.currentTime + 30
            this.setVideoTime(time)
        }
    }

    changeTime = (e) => {
        let value = e.currentTarget.value
        let percent = value / 100
        let time = this.videoElement.current.duration * percent

        this.setVideoTime(time)
        this.props.setSeekValue(value)
        this.props.setColorStop(percent)
    }

    closeClient = () => {
        this.props.removeClient(this.props.currentTime)
    }

    handleTorrentClick = (torrent) => {
        this.props.setPlayerLoading(true)
        this.props.resetClient(true).then(() => {
            this.props.streamTorrent(torrent)
        })
        this.props.closeBackup()
    }

    handleOpenBackup = () => {
        if (this.props.videoIndex !== false) {
            this.pauseVideo()
        }
        this.props.showBackup(true)
    }

    handleBg = () => {
        if (this.props.videoIndex !== false) {
            this.playVideo()
        }
        this.props.closeBackup()
    }

    handleBuffer = () => {
        this.setState({ videoBuffering: true })
    }

    handleUpdate = (e) => {
        this.setState({ videoBuffering: false })
        this.props.handleVideo(e)
    }

    handleMouseDown = (e) => {
        this.pauseVideo()
    }

    stopIntro = () => {
        this.setState({ showIntro: false })
        this.props.toggleIntro()
    }

    createSubtitleTrack = () => {
        let { activeSubtitle } = this.state
        if (activeSubtitle) {
            let { language, src } = activeSubtitle
            let track = document.createElement('track')
            track.kind = 'subtitles'
            track.label = language
            track.src = src
            return track
        }
    }

    addTrackToVideoElement = (track) => {
        let node = this.videoElement.current
        if (node) node.append(track)
    }

    showTrackInVideoElement = (track) => {
        let node = this.videoElement.current
        track.mode = 'showing'
        if (node) node.textTracks[0].mode = 'showing'
    }

    insertSubtitlesIntoVideo = () => {
        let track = this.createSubtitleTrack()
        this.removeSubtitlesFromVideo()
        this.addTrackToVideoElement(track)
        this.showTrackInVideoElement(track)
        this.toggleSubtitleMenu()
    }

    removeSubtitlesFromVideo = () => {
        let node = this.videoElement.current
        if (node) node.innerHTML = ''
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (
            nextProps.showIntro === this.props.showIntro &&
            nextProps.downloadPercent === this.props.downloadPercent &&
            nextProps.downloadSpeed === this.props.downloadSpeed &&
            nextProps.openBackup === this.props.openBackup &&
            nextProps.movie === this.props.movie &&
            nextState.showOverlay === this.state.showOverlay &&
            nextProps.paused === this.props.paused &&
            nextProps.videoIndex === this.props.videoIndex &&
            nextProps.time === this.props.time &&
            nextProps.loading === this.props.loading &&
            nextProps.playerStatus.status === this.props.playerStatus.status &&
            nextProps.seekValue === this.props.seekValue &&
            nextProps.currentTime === this.props.currentTime &&
            nextProps.readyToStream === this.props.readyToStream &&
            nextState.videoBuffering === this.state.videoBuffering &&
            nextProps.startTime === this.props.startTime &&
            nextProps.fileLoaded === this.props.fileLoaded &&
            nextProps.subtitleOptions === this.props.subtitleOptions &&
            nextProps.currentChat === this.props.currentChat &&
            nextProps.currentAudienceCount ===
                this.props.currentAudienceCount &&
            nextProps.user === this.props.user &&
            nextState.activeSubtitle === this.state.activeSubtitle &&
            nextState.showSubtitles === this.state.showSubtitles &&
            nextState.pipView === this.state.pipView &&
            nextState.showCastContainer === this.state.showCastContainer &&
            nextState.activeCastingDevice === this.state.activeCastingDevice &&
            nextState.showMovieChat === this.state.showMovieChat
        ) {
            return false
        } else {
            return true
        }
    }

    handleInitCurrentTime = () => {
        console.log('Setting video element current time to start time')
        let node = this.videoElement.current
        if (node && this.props.startTime)
            this.setVideoTime(this.props.startTime)
    }

    closeApp = () => {
        let { remote } = require('electron')
        let { app } = remote
        app.exit(0)
    }

    handleBeforeUnload = (e) => {
        e.preventDefault()
        e.returnValue = false
        this.pauseVideo()
        setTimeout(this.closeApp, 400)
    }

    updateVideoUrl = () => {
        let isPremium = this.props.videoIndex
            ? typeof this.props.videoIndex === 'string'
                ? this.props.videoIndex.startsWith('https://flixerrtv.com/api/')
                : this.props.videoIndex
            : false
        let videoUrl = isPremium
            ? this.props.videoIndex
            : `http://localhost:8000/${
                  this.props.currentVideoStream ? '' : this.props.videoIndex
              }`
        this.setState({ videoUrl })
    }

    setPlayerVolume = (volume) => {
        let node = this.videoElement.current
        if (node) node.volume = volume
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.readyToStream !== this.props.readyToStream) {
            this.handleInitCurrentTime()
            this.props.startAutoSaveInterval()
        }

        if (prevState.pipView !== this.state.pipView) {
            if (this.state.pipView) {
                this.removeSubtitlesFromVideo()
            } else if (this.state.activeSubtitle) {
                this.insertSubtitlesIntoVideo()
            }
        }

        if (prevState.activeSubtitle !== this.state.activeSubtitle) {
            if (this.state.activeSubtitle) {
                this.insertSubtitlesIntoVideo()
            } else {
                this.removeSubtitlesFromVideo()
            }
        }

        if (
            prevProps.currentVideoStream !== this.props.currentVideoStream ||
            prevProps.videoIndex !== this.props.videoIndex
        ) {
            this.updateVideoUrl()
        }

        if (prevState.videoBuffering !== this.state.videoBuffering) {
            if (this.state.videoBuffering) {
                if (this.state.activeCastingDevice)
                    this.state.activeCastingDevice.pause()
            } else {
                if (this.state.activeCastingDevice)
                    this.state.activeCastingDevice.play()
            }
        }

        if (prevState.activeCastingDevice !== this.state.activeCastingDevice) {
            let volume = this.state.activeCastingDevice ? 0 : 1
            this.setPlayerVolume(volume)
        }
    }

    async componentDidMount() {
        this.movieChatObserver = this.props.initializeMovieChat(
            this.props.movie
        )
        this.movieAudienceObserver = await this.props.initializeMovieAudience(
            this.props.movie
        )
        this.props.setSeekValue(0)
        this.props.setColorStop(0)
        this.props.setFileLoaded(0)
        this.props.setVideoElement(this.videoElement)

        window.addEventListener('keydown', this.handleKeyPress)
        window.addEventListener('beforeunload', this.handleBeforeUnload)
    }

    componentWillUnmount() {
        clearTimeout(this.mouseTimeout)
        window.removeEventListener('keydown', this.handleKeyPress)
        window.removeEventListener('beforeunload', this.handleBeforeUnload)
        if (this.state.activeCastingDevice)
            this.state.activeCastingDevice.stop()
        if (this.movieChatObserver) this.movieChatObserver()
        if (typeof this.movieAudienceObserver === 'function')
            this.movieAudienceObserver()
        this.props.leaveAudience(this.props.movie)
    }

    render() {
        let bottomBarActions = this.state.bottomBarActions.map((action) => {
            let { hideWhenPipView, className, onClick, icon, special } = action
            let iconClass = `mdi-${icon}`
            let specialClass = special ? 'special-size' : ''
            let isCasting = icon === 'cast'
            let castingClass =
                isCasting && this.state.activeCastingDevice
                    ? 'action-is-casting'
                    : ''
            let component = (
                <i
                    key={icon}
                    className={`mdi mdi-light ${iconClass} ${className} ${specialClass} ${castingClass}`}
                    onClick={onClick}
                />
            )
            return hideWhenPipView
                ? this.state.pipView
                    ? null
                    : component
                : component
        })

        let backupContainer = this.props.openBackup ? (
            <BackupTorrents
                movie={this.props.movie}
                torrents={this.props.movie.preferredTorrents}
                getCurrentMagnet={this.props.getCurrentMagnet}
                handleTorrentClick={this.handleTorrentClick}
                resetClient={this.props.resetClient}
                streamTorrent={this.props.streamTorrent}
                searchTorrent={this.props.searchTorrent}
                closeBackup={this.props.closeBackup}
                setPlayerLoading={this.props.setPlayerLoading}
            />
        ) : (
            ''
        )
        let backupContainerBg = this.props.openBackup ? (
            <div className="backup-bg" onClick={this.handleBg} />
        ) : (
            ''
        )

        let shouldShowOverlay =
            this.state.showOverlay ||
            this.props.openBackup ||
            this.state.showSubtitles ||
            (this.props.playerStatus ? this.props.playerStatus.status : false)

        let playerTitle = this.props.movie.show_title || this.props.movie.title

        return (
            <div>
                <div
                    className={`movie-player ${
                        !shouldShowOverlay ? 'movie-hide' : ''
                    } ${this.state.pipView ? 'movie-pip-view-player' : ''} ${
                        this.state.showMovieChat ? 'movie-chat-view-player' : ''
                    }`}
                    style={{
                        backgroundImage: `${
                            this.props.loading
                                ? this.props.error
                                    ? 'none'
                                    : 'url(assets/imgs/loading.svg)'
                                : 'none'
                        }`,
                    }}
                    onMouseMove={this.mouseMove}
                >
                    {this.state.videoBuffering ? (
                        <div className="video-buffer-container" />
                    ) : (
                        ''
                    )}
                    <CSSTransitionGroup
                        transitionName="movie-box-anim"
                        transitionEnterTimeout={250}
                        transitionLeaveTimeout={250}
                    >
                        {backupContainer}
                    </CSSTransitionGroup>
                    <CSSTransitionGroup
                        transitionName="box-anim"
                        transitionEnterTimeout={250}
                        transitionLeaveTimeout={250}
                    >
                        {backupContainerBg}
                    </CSSTransitionGroup>
                    <Fade
                        mountOnEnter
                        unmountOnExit
                        duration={350}
                        when={this.props.playerStatus}
                        distance="10%"
                        bottom
                    >
                        <div className="player-status-container">
                            <span>{this.props.playerStatus.status}</span>
                            {this.props.playerStatus.loading ? (
                                <span className="dots" />
                            ) : (
                                ''
                            )}
                            {this.props.downloadPercent ? (
                                <div className="download-info">
                                    <span className="download-percent">
                                        {this.props.downloadPercent}%
                                    </span>
                                    <span className="download-speed">
                                        {`${this.props.downloadSpeed} Kb/s`}
                                    </span>
                                </div>
                            ) : (
                                ''
                            )}
                            {this.props.downloadPercent ? (
                                <Fade distance="10%" bottom>
                                    <div
                                        className="progress-bar"
                                        style={{
                                            width: `${this.props.downloadPercent}%`,
                                        }}
                                    />
                                    <div className="progress-bar-shadow" />
                                </Fade>
                            ) : (
                                ''
                            )}
                        </div>
                    </Fade>
                    <div className="top-bar-container">
                        <div className="top-bar">
                            <i
                                className="mdi mdi-light mdi-chevron-left mdi-36px"
                                onClick={this.closeClient}
                            />
                            <div>{playerTitle}</div>
                            {this.state.pipView ? null : (
                                <i
                                    className="open-backup mdi mdi-light mdi-sort-variant"
                                    onClick={this.handleOpenBackup}
                                />
                            )}
                            {this.state.pipView ? null : (
                                <i
                                    className="open-movie-chat mdi mdi-light mdi-message"
                                    onClick={this.toggleShowMovieChat}
                                />
                            )}
                        </div>
                    </div>
                    <div className="bottom-bar-container">
                        <div className="bottom-bar">
                            <i
                                className={
                                    'mdi mdi-light mdi-36px play-button ' +
                                    (this.props.paused
                                        ? 'mdi-play'
                                        : 'mdi-pause')
                                }
                                onClick={this.toggleVideoPlayback}
                            />
                            {this.state.pipView ? (
                                ''
                            ) : (
                                <div className="video-data">
                                    <div
                                        className="file-loaded"
                                        style={{
                                            width: `${this.props.fileLoaded}%`,
                                        }}
                                    ></div>
                                    <input
                                        className="seek-bar"
                                        type="range"
                                        value={this.props.seekValue}
                                        onChange={this.changeTime}
                                        onMouseDown={this.handleMouseDown}
                                        onMouseUp={this.playVideo}
                                        min={0}
                                        max={
                                            this.state.videoElement
                                                ? this.state.videoElement
                                                      .current.duration
                                                : 100
                                        }
                                        step={0.1}
                                        style={{
                                            backgroundImage: `-webkit-gradient(linear, left top, right top, color-stop(${this.props.colorStop}, rgb(255, 0, 0)), color-stop(${this.props.colorStop}, rgba(255, 255, 255, 0.158)))`,
                                        }}
                                    />
                                </div>
                            )}
                            <span>{this.props.time}</span>
                            <CastContainer
                                show={this.state.showCastContainer}
                                videoUrl={this.state.videoUrl}
                                playerTitle={playerTitle}
                                currentTime={this.props.currentTime}
                                activeCastingDevice={
                                    this.state.activeCastingDevice
                                }
                                setActiveCastingDevice={
                                    this.setActiveCastingDevice
                                }
                                toggleCastContainer={this.toggleCastContainer}
                                setVideoTime={this.setVideoTime}
                                playVideo={this.playVideo}
                                pauseVideo={this.pauseVideo}
                            />
                            {this.state.pipView ? null : (
                                <SubtitlesContainer
                                    show={this.state.showSubtitles}
                                    activeSubtitle={this.state.activeSubtitle}
                                    setActiveSubtitle={this.setActiveSubtitle}
                                    subtitleOptions={this.props.subtitleOptions}
                                    toggleSubtitleMenu={this.toggleSubtitleMenu}
                                />
                            )}
                            <div className="bottom-bar-action-container">
                                {bottomBarActions}
                            </div>
                        </div>
                    </div>
                    <CastScreenModal
                        show={this.state.activeCastingDevice}
                        setActiveCastingDevice={this.setActiveCastingDevice}
                        device={this.state.activeCastingDevice}
                    />
                    <CastScreen show={this.state.activeCastingDevice} />
                    {this.props.showIntro ? (
                        <video
                            autoPlay
                            type="video/mp4"
                            src="./assets/video/intro.mp4"
                            onEnded={this.stopIntro}
                        />
                    ) : null}
                    {this.props.readyToStream ? (
                        <video
                            className={
                                this.state.activeCastingDevice
                                    ? 'casting-video'
                                    : ''
                            }
                            autoPlay
                            type="video/mp4"
                            onTimeUpdate={this.handleUpdate}
                            onWaiting={this.handleBuffer}
                            src={this.state.videoUrl}
                            ref={this.videoElement}
                        />
                    ) : null}
                </div>
                <MovieChat
                    messages={this.props.currentChat}
                    currentAudienceCount={this.props.currentAudienceCount}
                    sendMovieMessage={this.props.sendMovieMessage}
                    movie={this.props.movie}
                    email={this.props.user.email}
                />
            </div>
        )
    }
}

export default Player
