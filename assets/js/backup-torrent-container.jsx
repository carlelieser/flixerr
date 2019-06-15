import uniqid from 'uniqid';
import Fade from 'react-reveal/Fade';

class BackupTorrents extends React.Component {
    constructor(props) {
        super(props);
    }

    handleReload = () => {
        this.props.setPlayerLoading(true);
        this
            .props
            .resetClient(true).then((result) => {
                console.log(result);
                let movie = this.props.movie;
                movie.magnet = false;
                this
                    .props
                    .streamTorrent(movie);
            });
        this
            .props
            .closeBackup();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.torrents !== this.props.torrents || nextProps.movie.magnet !== this.props.movie.magnet) {
            return true;
        }

        return false;
    }

    render() {
        let torrents = this.props.torrents
            ? this
                .props
                .torrents
                .map((torrent) => {
                    let videoQuality = torrent
                        .title
                        .match(/(\d*p)/g);
                    let sorted = videoQuality
                        ? videoQuality.filter((item) => {
                            return item != 'p';
                        })
                        : [];
                    videoQuality = sorted.length
                        ? sorted[0]
                        : false;
                    return (
                        <Fade distance="10%" bottom>
                            <div
                                key={uniqid()}
                                className={`torrent ${this
                                .props
                                .getCurrentMagnet() == torrent.magnet
                                ? 'active'
                                : ''}`}
                                onClick={this
                                .props
                                .handleTorrentClick
                                .bind(this, torrent)}>{videoQuality
                                    ? <span className="video-quality">{videoQuality}</span>
                                    : ''}
                                <span className="title">{torrent
                                        .title
                                        .replace(/[^a-zA-Z0-9\.\(\)\- ]/g, '')
                                        .replace(/\./g, ' ')}</span>
                            </div>
                        </Fade>
                    )
                })
            : '';
        return (
            <div className="backup-container">
                <div className="title">Torrents</div>
                <div className="subtitle">{this.props.torrents
                        ? `Here are some alternative torrents for ${this.props.movie.title}. Have fun :) `
                        : "We couldn't find any alternative torrents. Please wait or try again."}</div>
                {this.props.torrents
                    ? <div className="torrent-container">{torrents}</div>
                    : <div className="reload-btn" onClick={this.handleReload}>
                        <span>Reload</span>
                    </div>}
            </div>
        );
    }
}
