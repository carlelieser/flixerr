import Fade from "react-reveal/Fade";
class Content extends React.Component {
    constructor(props) {
        super(props);

        this.count = 0;

        this.state = {
            collection : ['Recently Played', 'Favorites']
        }
    }

    shouldComponentUpdate(nextProps){
        if(this.props.content === nextProps.content && this.props.searchContent === nextProps.searchContent && this.props.favorites === nextProps.favorites && this.props.recentlyPlayed === nextProps.recentlyPlayed && this.props.results === nextProps.results){
            return false
        }else{
            return true
        }
    }

    componentDidUpdate(prevProps){
        if(prevProps.results[0] && this.props.results[0]){
            if(prevProps.results[0].backdrop_path != this.props.results[0].backdrop_path || this.count === 0){
                this.props.setHeader(this.props.getHeader(this.props.results));
                this.count++;
            }
        }
    }

    render() {
        this.genreCollection = this.state.collection.map((item) => (
                <GenreContainer scrollMovieGenre={this.props.scrollMovieGenre} openBox={this.props.openBox} strip={this.props.strip} getUnique={this.props.getUnique} name={item} movies={item == 'Favorites' ? this.props.favorites : this.props.recentlyPlayed}/>
            ));

        return (
            <div
                className={
                    "content-container" +
                    (this.props.genre || this.props.isOffline ? " movie-content-container" : "") +
                    (this.props.search ? " search-content" : "")
                }
            >
                {(() => {
                    if(!this.props.isOffline){
                        if(this.props.search){
                            return <Fade bottom><div className="search-title">Search Results</div></Fade>
                        }
                    }
                })()}
                {(() => {
                    if(this.props.isOffline){
                        return <Fade bottom>
                            <div className="offline-container">
                                <div className="offline-error"></div>
                                <span>It looks like you're offline.</span>
                                <span>Please check your internet connection and try again.</span>
                            </div>
                            </Fade>;
                    }else{
                        if(this.props.search){
                            return this.props.searchContent;
                        }else{
                            if(this.props.collectionContainer){
                                return this.genreCollection;
                            }else{
                                if(this.props.content){
                                    return this.props.content;
                                } else{
                                    return <Fade bottom><div className="content-loader"/></Fade>
                                }
                            }
                        }
                    }
                })()
                }
            </div>
        )
    }
}
