import React, {Component} from "react";

import uniqid from "uniqid";

import GenreContainer from "./genre-container";

class Collection extends Component {
    constructor(props) {
        super(props);

        this.state = {
            collection: [
                {
                    name: "Suggestions",
                    target: "suggested"
                }, {
                    name: "Recents",
                    target: "recentlyPlayed"
                }, {
                    name: "Favorites",
                    target: "favorites"
                }
            ]
        };
    }

    checkSuggested = () => {
        if (this.props.suggested) {
            if (!this.props.suggested.length) {
                this
                    .props
                    .updateSuggested();
            }
        } else {
            this
                .props
                .updateSuggested();
        }
    }

    setHeader = () => {
        if (this.props.suggested) {
            if (this.props.suggested.length) {
                this
                    .props
                    .setHeader(this.props.suggested[0].flixerr_data.backdrop_path);
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.suggested === this.props.suggested && nextProps.favorites === this.props.favorites && nextProps.recentlyPlayed === this.props.recentlyPlayed) {
            return false;
        } else {
            return true;
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.suggested !== this.props.suggested) {
            this.setHeader();
        }
        this.checkSuggested();
    }

    componentDidMount() {
        this.checkSuggested();
        this.setHeader();
    }

    render() {
        let genreCollection = this
            .state
            .collection
            .map((item) => {

                let genreInfo = {
                    showCollection: true,
                    activeGenre: item.name,
                    target: item.target,
                    movies: this.props[item.target]
                        ? this.props[item.target]
                        : []
                }

                return (<GenreContainer
                    key={uniqid()}
                    genreInfo={genreInfo}
                    toggleGenre={this.props.toggleGenre}
                    openBox={this.props.openBox}/>);
            });

        return <div className='collection-container'>{genreCollection}</div>;
    }
}

export default Collection;
