import React, {Component} from "react";

import Fade from "react-reveal/Fade";

class Torrent extends Component {
    constructor(props) {
        super(props);
    }

    handleTorrent = () => {
        this
            .props
            .handleTorrentClick(this.props.torrent);
    };

    render() {
        return (
            <Fade distance='10%' bottom>
                <div className={this.props.name} onClick={this.handleTorrent}>
                    {this.props.videoQuality
                        ? (
                            <span className='video-quality'>
                                {this.props.videoQuality}
                            </span>
                        )
                        : ("")}
                    <span className='title'>{this.props.title}</span>
                </div>
            </Fade>
        );
    }
}

export default Torrent;
