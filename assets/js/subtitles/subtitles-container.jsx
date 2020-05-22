import React, { Component } from 'react'
import Fade from 'react-reveal/Fade'

import SubtitleItem from './subtitle-item'

class SubtitlesContainer extends Component {
    constructor(props) {
        super(props)
    }

    turnOffSubtitles = () => {
        this.props.setActiveSubtitle()
        this.props.toggleSubtitleMenu()
    }

    render() {
        let { activeSubtitle, subtitleOptions } = this.props
        let subtitles = subtitleOptions.map((subtitle) => {
            let isActive = activeSubtitle
                ? activeSubtitle.name == subtitle.name
                : false
            return (
                <SubtitleItem
                    key={subtitle.name}
                    active={isActive}
                    setActiveSubtitle={this.props.setActiveSubtitle}
                    subtitle={subtitle}
                />
            )
        })
        return (
            <Fade
                mountOnEnter
                unmountOnExit
                duration={350}
                when={this.props.show}
                distance="10%"
                bottom
            >
                <div className="player-dialog-container subtitles-container">
                    {subtitles}
                    <div
                        className={!activeSubtitle ? 'active-subtitle' : ''}
                        onClick={this.turnOffSubtitles}
                    >
                        Off
                    </div>
                </div>
            </Fade>
        )
    }
}

export default SubtitlesContainer
