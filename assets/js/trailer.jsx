import React, { Component } from 'react'

import Fade from 'react-reveal/Fade'

class Trailer extends Component {
    constructor(props) {
        super(props)

        this.handleVideoClick.bind(this)

        this.state = {
            url: false,
        }
    }

    getYouTubeEmbed = () => {
        let url = this.props.url
        if (url) {
            if (typeof url === 'string') {
                let id = url.match(/[^v=]*$/g)[0]
                let embed = `https://www.youtube.com/embed/${id}`

                this.setState({ url: embed })
            }
        }
    }

    closeTrailer = () => {
        this.props.setTrailer(false)
    }

    handleVideoClick = (e) => {
        e.stopPropagation()
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.url !== this.props.url) {
            this.getYouTubeEmbed()
        }
    }

    componentDidMount() {
        this.getYouTubeEmbed()
    }

    render() {
        let { url } = this.props

        return (
            <Fade
                when={url}
                distance="5%"
                mountOnEnter
                unmountOnExit
                bottom
                duration={250}
            >
                <div
                    className={`trailer-container ${
                        url ? '' : 'pointer-events'
                    }`}
                    onClick={this.closeTrailer}
                >
                    <div
                        className="iframe-container"
                        onClick={this.handleVideoClick}
                    >
                        <iframe src={this.state.url}></iframe>
                    </div>
                </div>
            </Fade>
        )
    }
}

export default Trailer
