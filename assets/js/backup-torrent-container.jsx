import React, { Component } from "react";

import uniqid from "uniqid";

import Torrent from "./torrent";

class BackupTorrents extends Component {
    constructor(props) {
        super(props);
    }

    handleReload = () => {
        this.props.setPlayerLoading(true);
        this.props
            .resetClient(true)
            .then(() => {
                let movie = this.props.movie;
                movie.magnet = false;
                this.props.searchTorrent(movie);
            })
            .catch((err) => console.log(err));
        this.props.closeBackup();
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (
            nextProps.torrents !== this.props.torrents ||
            nextProps.movie.magnet !== this.props.movie.magnet
        ) {
            return true;
        }

        return false;
    }

    render() {
        let torrents = this.props.torrents
            ? this.props.torrents.map((torrent) => {
                  let title = torrent.title;
                  let videoQuality = torrent.resolution || torrent.videoQuality;

                  return (
                      <Torrent
                          key={uniqid()}
                          torrent={torrent}
                          name={`torrent ${
                              this.props.getCurrentMagnet() == torrent.magnet
                                  ? "active"
                                  : ""
                          }`}
                          videoQuality={videoQuality}
                          title={title}
                          handleTorrentClick={this.props.handleTorrentClick}
                      />
                  );
              })
            : "";
        return (
            <div className="backup-container">
                <div className="title">Torrents</div>
                <div className="subtitle">
                    {this.props.torrents
                        ? `Select from one of the alternative torrents for "${this.props.movie.title}" below.`
                        : "We couldn't find any alternative torrents. Please wait or try again."}
                </div>
                {this.props.torrents ? (
                    <div className="torrent-container">{torrents}</div>
                ) : (
                    false
                )}
                <div className="reload-btn" onClick={this.handleReload}>
                    <span>Reload</span>
                </div>
            </div>
        );
    }
}

export default BackupTorrents;
