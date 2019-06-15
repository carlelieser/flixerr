import Fade from 'react-reveal/Fade'

class Genre extends React.Component {
    constructor(props) {
        super(props);

        this.genreElem = false;
        this.listElem = false;
        this.processing = false;
        this.lastScroll = 0;

        this.state = {
            page: 1,
            containerWidth: 'auto',
            containerHeight: '100%',
            changeNav: false,
            movies: []
        }
    }

    setListRef = (e) => {
        this.listElem = e;
    }

    setElementRef = (e) => {
        this.genreElem = e;
    }

    changeContainerHeight = () => {
        this.setState({
            containerHeight: this.listElem.offsetHeight + 40
        });
    }

    loadPage = (page) => {
        let url = `https://api.themoviedb.org/3/discover/movie?api_key=${
        this
            .props
            .apiKey}&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${this
            .state
            .page}&release_date.gte=${new Date()
            .getFullYear() - 5}&release_date.lte=${new Date().getFullYear() - 1}&with_genres=${this.props.genreID}`;;

        this
            .props
            .fetchContent(url, (response) => {
                this
                    .props
                    .setOffline();
                let movies = response.results;

                setTimeout(() => {
                    this.setState({
                        movies: this
                            .state
                            .movies
                            .concat(this.props.visualizeResults(movies))
                    }, () => {
                        this.changeContainerHeight();
                        this.processing = false;
                    });
                }, 400);
            }, () => this.props.setOffline(true));
    }

    handleScroll = () => {
        let scrollTop = this.genreElem.scrollTop,
            scrollHeight = this.genreElem.scrollHeight,
            limit = 20;

        if (scrollTop >= (scrollHeight - 1200)) {
            if (this.processing) {
                return false
            } else {
                this.processing = true;
                this.setState({
                    page: this.state.page + 1
                }, () => {
                    this.loadPage(this.state.page);
                })
            }
        }

        if (scrollTop > limit) {
            this.setState({changeNav: true});
        }

        if (scrollTop < limit) {
            this.setState({changeNav: false});
        }
    }

    handleResize = () => {
        let windowWidth = window.innerWidth - 160;
        let itemWidth = 210 + 40;
        let numberItems = Math.floor(windowWidth / itemWidth);
        let containerWidth = (itemWidth * numberItems) + 'px';

        this.setState({containerWidth});
    }

    componentDidMount() {
        this.loadPage(0);
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
        this
            .genreElem
            .addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        this
            .genreElem
            .removeEventListener('scroll', this.handleScroll)
    }

    render() {
        return (
            <div className="paginated-genre-results" ref={this.setElementRef}>
                <div className={`genre-bar ${this.state.changeNav ? 'genre-bar-on' : ''}`}></div>
                <div className={`close-genre ${this.state.changeNav ? 'close-genre-on' : ''}`} onClick={() => this.props.closeGenre()}>
                    <i className="mdi mdi-keyboard-backspace"></i>
                </div>
                <div className={`genre-name ${this.state.changeNav ? 'genre-name-on' : ''}`}>{this.props.genre}</div>
                <div
                    className="genre-movie-list"
                    ref={this.setListRef}
                    style={{
                    width: this.state.containerWidth,
                    minHeight: 'calc(100% - 300px)',
                    marginLeft: this.state.movies.length
                        ? '-30px'
                        : '',
                    backgroundImage: this.state.movies.length
                        ? ''
                        : 'url(./assets/imgs/loading.apng)',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: '5%'
                }}>
                    {this.state.movies}
                </div>
            </div>
        )
    }
}
