import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import getJSON from "get-json";
import Fade from "react-reveal/Fade";
import storage from "electron-json-storage";
import uniqid from "uniqid";

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            apiKey: "22b4015cb2245d35a9c1ad8cd48e314c",
            simperiumId: "petition-locomotive-460",
            simperiumKey: "d456aece029d44449569864ca68e0054",
            loginError: false,
            account: true,
            create: false,
            user: false,
            menu: [
                "Featured", "Movies", "Collection", "Sign In"
            ],
            active: "Featured",
            recentlyPlayed: [],
            favorites: [],
            movieTimeArray: [],
            magnetArray: [],
            results: [],
            videoIndex: false,
            activeGenre: false,
            genreID: 0,
            showGenre: false,
            collectionContainer: false,
            menuActive: false,
            headerBg: false,
            content: false,
            showBox: false,
            movieCurrent: false,
            playMovie: false,
            playerLoading: true,
            paused: true,
            genreContainer: false,
            genrePages: 7,
            search: false,
            searchContent: false,
            isOffline: false,
            logoIsLoaded: false,
            error: false,
            appLoading: true,
            time: "00:00:00"
        }
    }

    toggleGenre = (showGenre, activeGenre, genreID) => {
        this.setState({showGenre, activeGenre, genreID});
    }

    closeGenre = () => {
        this.toggleGenre()
    }

    getUnique = (prefix) => {
        return prefix + uniqid();
    }

    setUserCredentials = () => {
        storage.set("userCredentials", {
            user: this.state.user,
            create: this.state.create,
            account: this.state.account
        }, error => {
            if (error) {
                throw error;
            }
        });
    }

    getUserCredentials = () => {
        storage.get("userCredentials", (error, data) => {
            this.setState({
                user: data.user,
                create: data.create,
                account: data.account
            }, () => {
                this.startSimperium();
            });
        });
    }

    updateBucket = () => {
        if(this.state.user){
            this
            .bucket
            .update('favorites');
        this
            .bucket
            .update('recentlyPlayed');
        this
            .bucket
            .update('movieTimeArray');
        }
    }

    setStorage = () => {
        storage.set("collection", {
            favorites: this.state.favorites,
            recentlyPlayed: this.state.recentlyPlayed,
            movieTimeArray: this.state.movieTimeArray
        }, error => {
            if (error) {
                throw error;
            }

            this.updateBucket();  
        });
    }

    getStorage = () => {
        storage.get("collection", (error, data) => {

            this.setState({
                favorites: data
                    ? data.favorites
                        ? data.favorites
                        : []: [],
                recentlyPlayed: data
                    ? data.recentlyPlayed
                        ? data.recentlyPlayed
                        : []: [],
                movieTimeArray: data
                    ? data.movieTimeArray
                        ? data.movieTimeArray
                        : []: []
            }, (error) => {
                setTimeout(() => {
                    this.setState({appLoading: false});
                }, 5000);
            });
        });
    }

    formatTime = (secondString) => {
        let sec_num = parseInt(secondString, 10);
        let hours = Math.floor(sec_num / 3600);
        let minutes = Math.floor((sec_num - hours * 3600) / 60);
        let seconds = sec_num - hours * 3600 - minutes * 60;

        if (hours < 10) {
            hours = `0${hours}`;
        }
        if (minutes < 10) {
            minutes = `0${minutes}`;
        }
        if (seconds < 10) {
            seconds = `0${seconds}`;
        }
        return `${hours
            ? hours + ":"
            : ""}${
        minutes
            ? minutes + ":"
            : ""}${seconds}`;
    }

    cleanArray = (array, deleteValue) => {
        for (var i = 0; i < array.length; i++) {
            if (array[i] == deleteValue) {
                array.splice(i, 1);
                i--;
            }
        }
        return array;
    }

    getPreferredTorrent = (torrents, n) => {
        torrents = this.cleanArray(torrents);
        let preferredTorrents = torrents.filter((item, index) => {
            if (item) {
                let title = item
                    .title
                    .toUpperCase();
                return ((item.magnet.indexOf('magnet:?xt=urn:') > -1) && (title.indexOf("720") > -1 || title.indexOf("1080") > -1 || title.indexOf("HD") > -1 || title.indexOf("YIFY") > -1 || index === 0) && (title.indexOf("FRENCH") === -1 && title.indexOf("ITALIAN") === -1));
            }
        });

        return preferredTorrents[0];
    }

    togglePause = (paused) => {
        this.setState({paused});
    }

    setPlayerTime = (time) => {
        this.setState({time});
    }

    handleVideo = () => {
        let video = document.querySelector("video");
        let seekBar = document.querySelector(".seek-bar");

        if (seekBar !== null) {
            if (video.duration) {
                let value = 100 / video.duration * video.currentTime;
                let time = this.formatTime(video.duration - video.currentTime);
                let colorStop = this.getElementValue(seekBar) / 100;

                this.setPlayerTime(time);
                this.setElementValue(seekBar, "value", value);

                this.setElementStyle(seekBar, "backgroundImage", "-webkit-gradient(linear, left top, right top, color-stop(" + colorStop + ", rgb(255, 0, 0)), color-stop(" + colorStop + ", rgba(255, 255, 255, 0.158)))");

                this.togglePause(video.paused);
            }
        }
    }

    handleVideoClose = (video) => {
        if(video.src){
            this.updateMovieTime(video.currentTime);
        }
    }

    setMovieTime = (movie) => {
        let video = document.querySelector("video");
        let movieMatch = this
            .state
            .movieTimeArray
            .find(item => {
                return movie.id == item.id;
            });

        if (movieMatch) {
            video.currentTime = movieMatch.currentTime;
            this.setState({recentlyPlayed: this.state.recentlyPlayed});
        }
    }

    streamTorrent = (instance, torrent) => {
        const WebTorrent = require('webtorrent');

        instance.magnet(torrent, (magnet) => {
            this.setState({
                client: new WebTorrent()
            }, () => {
                if (this.state.playMovie) {
                    this
                        .state
                        .client
                        .add(magnet, torrent => {
                            let videoFormats = ["avi", "mp4", "mkv"];
                            var file = torrent
                                .files
                                .findIndex(function (file) {
                                    if (videoFormats.indexOf(file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length)) > -1 && file.length > 99999999) {
                                        return file;
                                    }
                                });
                            if (file !== -1) {
                                this.server = torrent.createServer();
                                this
                                    .server
                                    .listen('8888');

                                this.timeOut = setTimeout(() => {
                                    if(this.state.time == "00:00:00"){
                                        this.setState({ error: true });
                                    }
                                }, 60000);

                                this.setState({
                                    videoIndex: file
                                }, () => {
                                    this.setMovieTime(this.state.playMovie);
                                });
                            } else {
                                this.setState({error: true});
                            }
                        });
                } else {
                    this.destroyClient();
                }
            });
        });
    }

    getSearch = () => {
        return document.querySelector(".search-bar-container input");
    }

    setElementValue = (elem, property, value) => {
        elem[property] = value;
    }

    setElementStyle = (elem, property, value) => {
        elem.style[property] = value;
    }

    getElementValue = (elem) => {
        return elem.value;
    }

    resetSearch = () => {
        this.setElementValue(this.getSearch(), "value", "");
        this.toggleSearch();
    }

    toggleContainerSettings = (genreContainer, collectionContainer) => {
        this.setState({genreContainer, collectionContainer});
    }

    toggleSearch = (open, content) => {
        this.setState({search: open, searchContent: content});
    }

    closeSearch = () => {
        this.resetSearch();
        this
            .getSearch()
            .focus();

        if (this.state.active != "Featured") {
            this.toggleContainerSettings(true, this.state.collectionContainer);
        }
    }

    sortQuery = (results, query) => {
        results.sort((a, b) => {
            return a.popularity + b.popularity;
        });

        results = results.filter(movie => {
            let releaseDate = movie.release_date;
            let year = Number(releaseDate.substring(0, 4));
            let month = Number(releaseDate.substring(6, 7));

            let currentDate = new Date();
            currentDate = {
                year: currentDate.getFullYear(),
                month: currentDate.getMonth() + 1
            }

            return (movie.backdrop_path !== null && (year <= currentDate.year) && (year == currentDate.year
                ? (month < currentDate.month - 1)
                : true) && (movie.popularity > 2) && (movie.vote_average > 4) && (movie.original_language == "en"));
        });

        return results;
    }

    searchEmpty = (query) => {
        this.setState({searchContent: (
                <Fade bottom>
                    <div className="search-empty">
                        No Results for "{query.length > 20
                            ? query.substring(0, 20) + "..."
                            : query}"
                    </div>
                </Fade>
            )});
    }

    setOffline = (isOffline) => {
        this.setState({isOffline});
    }

    fetchContent = (url, callback, err) => {
        getJSON(url, (error, response) => {
            if (!error) {
                this.setOffline();
                if (callback) {
                    callback(response);
                }
            } else {
                if (err) {
                    err(error);
                }
            }
        });
    }

    searchMovies = () => {
        this.toggleSearch(true, this.state.searchContent);
        this.toggleContainerSettings(false, this.state.collectionContainer);

        let query = this.getElementValue(this.getSearch());

        if (query === "") {
            this.closeSearch();
        } else {
            let searchResults = [];
            for (let u = 1; u < 5; u++) {
                let url = `https://api.themoviedb.org/3/search/movie?api_key=${
                this.state.apiKey}&region=US&language=en-US&query=${query}&page=${u}&include_adult=false`;

                let promise = new Promise((resolve, reject) => {
                    this.fetchContent(url, (response) => {
                        let results = response.results;
                        resolve(results);
                    }, (error) => {
                        reject(error);
                    });
                }).catch(err => console.log(err));

                searchResults.push(promise);
            }

            Promise
                .all(searchResults)
                .then(results => {
                    this.setOffline();
                    results = []
                        .concat
                        .apply([], results);

                    if (!results.every(val => {
                        return !val;
                    })) {
                        results = this.sortQuery(results, query);

                        if (results.length === 0) {
                            this.searchEmpty(query);
                        } else {
                            this.toggleSearch(true, this.visualizeResults(results, true, true));
                        }
                    } else {
                        this.searchEmpty(query);
                    }
                })
                .catch(err => this.setOffline(true));
        }
    }

    initMovie = (movie) => {
        this.setState({playerLoading: true, playMovie: movie, time: "00:00:00"});
    }

    prepareMovieTitle = (title) => {
        return title
            .replace(/[^a-zA-Z0-9\s\-]/g, '')
            .replace(/\-/g, ' ')
            .toLowerCase();
    }

    searchTorrent = (movie) => {
        if (movie.magnet) {
            this.streamTorrent(this.torrentSearch, movie);
        } else {
            this
                .torrentSearch
                .search(`${this.prepareMovieTitle(movie.title)} ${movie.release_date.substring(0, 4)}*`, (err, torrents) => {
                    if (err == 2) {
                        this.searchTorrent(movie);
                    } else if (err == 1) {
                        this.setState({error: true});
                    } else {
                        let torrent = this.getPreferredTorrent(torrents);
                        this.currentMagnet = torrent.magnet;
                        this.streamTorrent(this.torrentSearch, torrent);
                    }
                });
        }
    }

    playMovie = (movie) => {
        movie = this.matchMovie(movie);
        this.initMovie(movie);
        this.toggleBox(false, () => {
            this.searchTorrent(movie);
            this.addToRecentlyPlayed(movie);
        });
    }

    destroyClient = () => {
        clearTimeout(this.timeOut);
        if (this.state.client) {
            if (this.server) {
                this
                    .server
                    .close();
            }

            this
                .state
                .client
                .destroy(() => {
                    this.setState({client: false, videoIndex: false, paused: true});
                });
        }
    }

    setFullScreen = (full) => {
        let browserWindow = require("electron")
            .remote
            .getCurrentWindow();
        browserWindow.setFullScreen(full);
    }

    setMovieTimeArray = () => {
        this.setState({
            movieTimeArray: this.state.movieTimeArray
        }, () => {
            this.setStorage();
            this.updateBucket();
        });
    }

    addToMovieTimeArray = (movie) => {
        this
            .state
            .movieTimeArray
            .push(movie);

        this.setMovieTimeArray();
    }

    updateMovieTimeArray = () => {
        let matchingItem = this
            .state
            .movieTimeArray
            .find(movie => {
                return movie.id == this.state.playMovie.id;
            });

        if (matchingItem) {
            matchingItem.currentTime = this.state.playMovie.currentTime;
            matchingItem.magnet = this.currentMagnet;
            this.setMovieTimeArray();
        } else {
            this.addToMovieTimeArray({id: this.state.playMovie.id, currentTime: this.state.playMovie.currentTime, magnet: this.currentMagnet});
        }

    }

    updateMovieTime = (time) => {
        if (this.state.playMovie) {
            this.state.playMovie.currentTime = time;
            this.updateMovieTimeArray();
        }
    }

    removeClient = (time) => {
        if (time) {
            this.updateMovieTime(time);
        }
        this.setState({playMovie: false, error: false}, () => {
            this.destroyClient();
        });
        this.setFullScreen(false);
    }

    matchMovie = (movie) => {
        let matchingItem = this
            .state
            .movieTimeArray
            .find(item => {
                return item.id == movie.id;
            });

        if (matchingItem) {
            movie.magnet = matchingItem.magnet;
            this.currentMagnet = matchingItem.magnet;
            return movie;
        }

        return movie;
    }

    openBox = (movie) => {
        this.toggleBox(true);
        this.setState({movieCurrent: movie});
    }

    toggleBox = (active, callback) => {
        this.setState({
            showBox: active
        }, () => {
            if (callback) {
                setTimeout(callback, 400);
            }
        });
    }

    getHeader = (results) => {
        return results[0].backdrop_path;
    }

    setHeader = (url) => {
        this.setState({headerBg: url});
    }

    strip = (string, chars) => {
        return string.substring(0, chars);
    }

    setResults = (results) => {
        if(results){
            results = results.slice();
            this.setState({ results });
        }
    }

    visualizeResults = (results, featured, set) => {
        if (set) {
            this.setResults(results);
        }

        let items = results.map((movie, index) => (<MovieItem
            movie={movie}
            openBox={this.openBox}
            strip={this.strip}
            key={this.getUnique(movie.title)}
            featured={featured}/>));

        return items;
    }

    getURLDate = (n, justYear) => {
        let date = new Date(),
            year = date.getFullYear(),
            month = date
                .getMonth()
                .toString()
                .length < 2
                ? '0' + (date.getMonth() + 1)
                : date.getMonth() + 1,
            day = date
                .getDate()
                .toString()
                .length < 2
                ? '0' + date.getDate()
                : date.getDate();

        if (justYear) {
            return (year - n)
        }

        return `${year - n}-${month}-${day}`
    }

    getFeatured = (resolve, reject, page) => {
        let url = `https://api.themoviedb.org/3/discover/movie?api_key=${
        this
            .state
            .apiKey}&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&primary_release_date.gte=${this
            .getURLDate(5, true)}&primary_release_date.lte=${this
            .getURLDate(1, true)}`;
        this.fetchContent(url, (response) => {
            resolve(response);
        }, (error) => {
            reject(error);
        });
    }

    loadFeatured = () => {
        this.toggleContainerSettings();
        let promise = new Promise((resolve, reject) => {
            this.getFeatured(resolve, reject);
        });

        promise.then(result => {
            this.setContent(this.visualizeResults(result.results, true, true));
        }, err => {
            this.setOffline(true);
        });
    }

    shuffleArray = (array) => {
        let currentIndex = array.length;
        let temporaryValue;
        let randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    getMovies = (genre, genreID, resolve, reject) => {
        let url = `https://api.themoviedb.org/3/discover/movie?api_key=${
        this
            .state
            .apiKey}&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${Math
            .floor(Math.random() * this.state.genrePages) + 1}&primary_release_date.lte=${this.getURLDate(1)}&with_genres=${genreID}`;

        this.fetchContent(url, (response) => {
            let genreComplete = {
                name: genre,
                genreID: genreID,
                movies: this.shuffleArray(response.results)
            }
            resolve(genreComplete);
        }, (error) => {
            reject(error);
        });
    }

    isRecent = (movie) => {
        return this
            .state
            .recentlyPlayed
            .find(item => {
                return item.id == movie.id;
            });
    }

    isFavorite = (movie) => {
        if (this.state.favorites) {
            return this
                .state
                .favorites
                .find(item => {
                    return item.id == movie.id;
                });
        } else {
            return false;
        }
    }

    addToFavorites = (movie) => {
        this
            .state
            .favorites
            .push(movie);
        this.setState({
            favorites: this
                .state
                .favorites
                .slice()
        }, () => {
            this.setStorage();
        });
    }

    removeFromFavorites = (movie) => {
        let index = this
            .state
            .favorites
            .findIndex(item => {
                return item.id == movie.id;
            });
        this
            .state
            .favorites
            .splice(index, 1);
        this.setState({
            favorites: this
                .state
                .favorites
                .slice()
        }, () => {
            this.setStorage();
        });
    }

    addToRecentlyPlayed = (movie) => {
        if (!this.isRecent(movie)) {
            if (this.state.recentlyPlayed.length > 9) {
                this
                    .state
                    .recentlyPlayed
                    .splice(-1, 1);
            }

            this
                .state
                .recentlyPlayed
                .unshift(movie);
            this.setState({
                recentlyPlayed: this
                    .state
                    .recentlyPlayed
                    .slice()
            }, () => {
                this.setStorage();
            });
        } else {
            let index = this
                .state
                .recentlyPlayed
                .findIndex(item => {
                    return item.id == movie.id;
                });

            this
                .state
                .recentlyPlayed
                .splice(index, 1);
            this
                .state
                .recentlyPlayed
                .unshift(movie);
            this.setState({
                recentlyPlayed: this
                    .state
                    .recentlyPlayed
                    .slice()
            }, () => {
                this.setStorage();
            });
        }
    }

    easeInOutQuad = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) 
            return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    scrollTo = (id, element, to, duration, callback) => {
        let start = element.scrollLeft,
            change = to - start,
            currentTime = 0,
            increment = 20;

        let animateScroll = () => {
            currentTime += increment;
            let val = this.easeInOutQuad(currentTime, start, change, duration);
            element.scrollLeft = val;
            if (currentTime < duration) {
                setTimeout(animateScroll, increment);
            } else if (currentTime == duration) {
                if (callback) {
                    callback(id, element, to);
                }
            }
        }

        animateScroll();
    }

    scrollMovieGenre = (left, e, id) => {
        let viewportW = document
            .querySelector(".movie-list-paginated")
            .parentElement
            .offsetWidth - 210;
        let boxW = document
            .querySelector(".movie-item")
            .offsetWidth + 10;
        let viewItems = Math.ceil(viewportW / boxW);

        let container = e
            .currentTarget
            .parentElement
            .parentElement
            .querySelector(".movie-list-paginated");

        let scrollVal = container.scrollLeft;

        if (left) {
            scrollVal -= boxW * viewItems;
        } else {
            scrollVal += boxW * viewItems;
        }

        id = "#" + id;

        this.scrollTo(id, container, scrollVal, 200, (id, container, scrollVal) => {
            if (container.scrollLeft + container.offsetWidth >= container.scrollWidth - 20) {
                this.setElementStyle(document.querySelector(id).querySelector(".movie-scroll-right"), "display", "none");
                this.setElementStyle(document.querySelector(id).querySelector(".movie-scroll-left"), "display", "flex");
            } else if (container.scrollLeft === 0) {
                this.setElementStyle(document.querySelector(id).querySelector(".movie-scroll-left"), "display", "none");
                this.setElementStyle(document.querySelector(id).querySelector(".movie-scroll-right"), "display", "flex");
            } else {
                this.setElementStyle(document.querySelector(id).querySelector(".movie-scroll-left"), "display", "flex");
                this.setElementStyle(document.querySelector(id).querySelector(".movie-scroll-right"), "display", "flex");
            }
        });
    }

    visualizeMovieGenres = (movieData) => {
        this.setResults(movieData[0].movies);
        let movieGenres = movieData.map((item, i) => (<GenreContainer
            toggleGenre={this.toggleGenre}
            genreID={item.genreID}
            scrollMovieGenre={this.scrollMovieGenre}
            openBox={this.openBox}
            strip={this.strip}
            getUnique={this.getUnique}
            name={item.name}
            movies={item.movies}
            key={this.getUnique(item.name)}/>));

        return movieGenres;
    }

    loadMovies = () => {
        this.toggleContainerSettings(true, false);

        let genres = [
            {
                "id": 28,
                "name": "Action"
            }, {
                "id": 12,
                "name": "Adventure"
            }, {
                "id": 16,
                "name": "Animation"
            }, {
                "id": 35,
                "name": "Comedy"
            }, {
                "id": 80,
                "name": "Crime"
            }, {
                "id": 99,
                "name": "Documentary"
            }, {
                "id": 18,
                "name": "Drama"
            }, {
                "id": 10751,
                "name": "Family"
            }, {
                "id": 14,
                "name": "Fantasy"
            }, {
                "id": 36,
                "name": "History"
            }, {
                "id": 27,
                "name": "Horror"
            }, {
                "id": 10402,
                "name": "Music"
            }, {
                "id": 9648,
                "name": "Mystery"
            }, {
                "id": 10749,
                "name": "Romance"
            }, {
                "id": 878,
                "name": "Sci-Fi"
            }, {
                "id": 10770,
                "name": "TV Movie"
            }, {
                "id": 53,
                "name": "Thriller"
            }, {
                "id": 10752,
                "name": "War"
            }, {
                "id": 37,
                "name": "Western"
            }
        ];

        let promiseArray = [];

        for (let j = 0; j < genres.length; j++) {
            let promise = new Promise((resolve, reject) => {
                this.getMovies(genres[j].name, genres[j].id, resolve, reject);
            });

            promiseArray.push(promise);
        }

        Promise
            .all(promiseArray)
            .then(data => {
                this.setContent(this.visualizeMovieGenres(data));
            })
            .catch(() => this.setOffline(true))
    }

    loadCollection = () => {
        this.toggleContainerSettings(true, true);
        if (this.state.recentlyPlayed && this.state.favorites) {
            let headerSource = this.state.recentlyPlayed.length
                ? this.state.recentlyPlayed
                : false || this.state.favorites.length
                    ? this.state.favorites
                    : false;
            this.setResults(headerSource);
        }
    }

    setContent = (content) => {
        this.setState({content});
    }

    loadContent = (active) => {
        this.setContent(false);
        switch (active) {
            case "Featured":
                this.loadFeatured();
                break;
            case "Movies":
                this.loadMovies();
                break;
            case "Collection":
                this.loadCollection();
                break;
        }
    }

    handleMenu = () => {
        if (this.state.menuActive) {
            this.setElementStyle(document.querySelector(".app-menu-button"), "transform", `rotate(${this.state.menuActive
                ? "0"
                : "360"}deg)`);
            this.setState({menuActive: false});
        }
    }

    updateMenu = (menuActive, active) => {
        if (menuActive != undefined) {
            this.setState({menuActive});
        }

        if (active != undefined) {
            this.setState({
                active
            }, () => {
                this.loadContent(this.state.active);
            });
        }
    }

    handleLogo = () => {
        this.setState({logoIsLoaded: true});
    }

    loadLogo = () => {
        let tempImage = new Image();
        tempImage.onload = this.handleLogo;
        tempImage.src = 'assets/imgs/icon.png';
    }

    requireTorrent = () => {
        this.torrentSearch = new TorrentSearch();
    }

    startSimperium = () => {
        if (this.state.user) {

            let $ = require('jquery');

            $('body').append('<script type="text/javascript" src="./libs/simperium.min.js"></script>');

            this.simperium = new Simperium(this.state.simperiumId, {token: this.state.user.token});
            this.bucket = this
                .simperium
                .bucket('collection');
            this
                .bucket
                .on('notify', (id, data) => {
                    if (data) {
                        if (data.content) {
                            this.setState({[id]: data.content});
                        }
                    }
                });
            this
                .bucket
                .on('local', (id) => {
                    return {content: this.state[id]}
                });
            this
                .bucket
                .start();
        }else{
            this.openAccount();
        }
    }

    handleAccount = (create, email, password) => {
        if (!email && !password) {
            this.setState({loginError: true});
        } else {
            let id = this.state.simperiumId;
            let key = this.state.simperiumKey;
            let url = `https://auth.simperium.com/1/${id}/${create
                ? 'create'
                : 'authorize'}/`;

            let $ = require('jquery');

            $.ajax({
                url: url,
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify({"username": email, "password": password}),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("X-Simperium-API-Key", key);
                },
                success: (data) => {
                    let user = {
                        email: email,
                        password: password,
                        token: data.access_token
                    }

                    this.closeAccount();
                    this.setState({
                        user: user,
                        loginError: false
                    }, () => {
                        this.setUserCredentials();
                        this.startSimperium();
                    });
                },
                error: (error) => {
                    this.setState({loginError: error.responseText});
                }
            });
        }
    }

    openAccount = () => {
        this.setState({account: true});
    }

    openAccountCreation = () => {
        this.setState({create: true, loginError: false});
    }

    closeAccount = () => {
        this.setState({
            account: false,
            create: false,
            loginError: false
        }, () => {
            this.setUserCredentials();
        });
    }

    signOut = () => {
        this.simperium = false;
        this.bucket = false;

        this.setState({
            user: false
        }, () => {
            this.setUserCredentials();

            let $ = require('jquery');

            $('script[src="./libs/simperium.min.js"]').remove();
        });
    }

    handleInput = (e) => {
        if (e.keyCode == 13) {
            this.handleAccount(false, document.querySelector('input[type="email"]').value, document.querySelector('input[type="password"]').value)
        }
    }

    componentDidMount() {
        this.requireTorrent();
        this.loadLogo();
        this.getUserCredentials();
        this.getStorage();
        this.loadContent(this.state.active);
    }

    render() {
        let menu = this.state.menuActive
            ? (<Menu
                menu={this.state.menu}
                user={this.state.user}
                openAccount={this.openAccount}
                signOut={this.signOut}
                active={this.state.active}
                updateMenu={this.updateMenu}
                resetSearch={this.resetSearch}/>)
            : null;

        let movieBackDrop = this.state.showBox
            ? (<div className="movie-container-bg" onClick={() => this.toggleBox(false)}/>)
            : null;

        let movieModal = this.state.showBox
            ? (<MovieModal
                movie={this.state.movieCurrent}
                playMovie={this.playMovie}
                isFavorite={this.isFavorite}
                addToFavorites={this.addToFavorites}
                removeFromFavorites={this.removeFromFavorites}/>)
            : null;

        let playerModal = this.state.playMovie
            ? (<Player
                time={this.state.time}
                index={this.state.videoIndex}
                paused={this.state.paused}
                removeClient={this.removeClient}
                handleVideoClose={this.handleVideoClose}
                setFullScreen={this.setFullScreen}
                movie={this.state.movieCurrent}
                loading={this.state.playerLoading}
                setElementValue={this.setElementValue}
                getElementValue={this.getElementValue}
                error={this.state.error}
                handleVideo={this.handleVideo}/>)
            : null;

        let fullGenreContainer = this.state.showGenre
            ? (<Genre
                genre={this.state.activeGenre}
                genreID={this.state.genreID}
                apiKey={this.state.apiKey}
                fetchContent={this.fetchContent}
                visualizeResults={this.visualizeResults}
                setOffline={this.setOffline}
                closeGenre={this.closeGenre}/>)
            : null;

        let loadingContainer = this.state.appLoading
            ? <div className="loading-container">
                    <Fade when={this.state.logoIsLoaded} delay={100} distance="10%" bottom>
                        <div className="logo"></div>
                    </Fade>
                </div>
            : null;

        let accountContainer = this.state.account
            ? <div className="account-container">
                    <Fade bottom distance="10%">
                        <div className="account-form">
                            <div className="account-close" onClick={this.closeAccount}>
                                <i className="mdi mdi-close"></i>
                            </div>
                            <div className="account-register">Don't have an account?
                                <span onClick={this.openAccountCreation}>Register here.</span>
                            </div>
                            <div className="account-title">Sign in</div>
                            <div className="account-desc">Flixerr will use your account to synchronize data across all your devices.</div>
                            <input type="email" placeholder="Email" required/>
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                onKeyUp={this.handleInput}/> {this.state.loginError
                                ? <Fade bottom distance="10%">
                                        <div className="login-error">{this.state.loginError}</div>
                                    </Fade>
                                : ''}
                            <div
                                className="account-submit"
                                onClick={() => this.handleAccount(false, document.querySelector('input[type="email"]').value, document.querySelector('input[type="password"]').value)}>Sign In</div>
                        </div>
                    </Fade>
                </div>
            : null;

        let createContainer = this.state.create
            ? <div className="create-container account-container">
                    <div className="account-form">
                        <div className="account-close" onClick={this.closeAccount}>
                            <i className="mdi mdi-close"></i>
                        </div>
                        <div className="account-title">Create an account</div>
                        <div className="account-desc">Register to easily synchronize data across multiple devices.</div>
                        <input type="email" placeholder="Email" required/>
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            onKeyUp={this.handleInput}/> {this.state.loginError
                            ? <Fade bottom distance="10%">
                                    <div className="login-error">{this.state.loginError}</div>
                                </Fade>
                            : ''}
                        <div
                            className="account-submit"
                            onClick={() => this.handleAccount(true, document.querySelector('.create-container').querySelector('input[type="email"]').value, document.querySelector('.create-container').querySelector('input[type="password"]').value)}>Create</div>
                    </div>
                </div>
            : null;

        return (
            <div
                className={`app-container ${process.platform === "win32"
                ? "windows-compensate"
                : ''}`}
                onClick={this.handleMenu}>
                {process.platform === "darwin"
                    ? <div
                            className={'draggable ' + (this.state.playMovie
                            ? "invisible"
                            : "")}></div>
                    : ''}
                <ReactCSSTransitionGroup
                    transitionName="player-anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {createContainer}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup
                    transitionName="player-anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {accountContainer}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup
                    transitionName="loading-anim"
                    transitionEnterTimeout={0}
                    transitionLeaveTimeout={300}>
                    {loadingContainer}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup
                    transitionName="genreContainer-anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {fullGenreContainer}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup
                    transitionName="player-anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {playerModal}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup
                    transitionName="movie-box-anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {movieModal}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup
                    transitionName="box-anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {movieBackDrop}
                </ReactCSSTransitionGroup>
                <Header
                    subtitle={this.state.active}
                    menuActive={this.state.menuActive}
                    updateMenu={this.updateMenu}
                    background={this.state.headerBg}
                    closeSearch={this.closeSearch}
                    searchContent={this.state.searchContent}
                    searchMovies={this.searchMovies}/>
                <ReactCSSTransitionGroup
                    transitionName="menu-anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                    {menu}
                </ReactCSSTransitionGroup>
                <Content
                    isOffline={this.state.isOffline}
                    content={this.state.content}
                    genre={this.state.genreContainer}
                    collectionContainer={this.state.collectionContainer}
                    recentlyPlayed={this.state.recentlyPlayed}
                    favorites={this.state.favorites}
                    search={this.state.search}
                    searchContent={this.state.searchContent}
                    scrollMovieGenre={this.scrollMovieGenre}
                    getHeader={this.getHeader}
                    setHeader={this.setHeader}
                    getUnique={this.getUnique}
                    strip={this.strip}
                    openBox={this.openBox}
                    results={this.state.results}/>
            </div>
        )
    }
}

ReactDOM.render(
    <App/>, document.getElementById("app"));
