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

    strip = (string, chars) => {
        return string.substring(0, chars);
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.suggested === this.props.suggested && nextProps.favorites === this.props.favorites && nextProps.recentlyPlayed === this.props.recentlyPlayed) {
            return false;
        } else {
            return true;
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.suggested !== this.props.suggested) {
            this
                .props
                .setHeader(this.props.suggested);
        }
    }

    componentDidMount() {
        if (this.props.suggested) {
            if(!this.props.suggested.length){
                this
                    .props
                    .updateSuggested();
            }
        }else{
            this.props.updateSuggested();
        }
        this
            .props
            .setHeader(this.props.suggested);
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
