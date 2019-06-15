import uniqid from "uniqid";
class BackupTorrents extends React.Component {
    constructor(props) {
        super(props);
    }

    handleReload = () => {
        let movie = this.props.movie;
        movie.magnet = false;
        this.props.resetClient(true);
        this
            .props
            .searchTorrent(movie);
        this
            .props
            .closeBackup();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.torrents !== this.props.torrents) {
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
                    return (
                        <div
                            key={uniqid()}
                            className="torrent"
                            onClick={() => {
                            this
                                .props
                                .handleTorrentClick(torrent)
                        }}>{torrent
                                .title
                                .replace(/\./g, ' ').replace(/[^a-zA-Z0-9 ]/g, '')}</div>
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
