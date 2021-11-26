import React, { Component } from "react";

import uniqid from "uniqid";

import MovieItem from "./movie-item";

class SearchContainer extends Component {
    constructor(props) {
        super(props);
    }

    setHeader = () => {
        if (this.props.searchContent) {
            if (this.props.searchContent.length) {
                this.props.setHeader(
                    this.props.searchContent[0].flixerr_data.backdrop_path
                );
            }
        }
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.searchContent === this.props.searchContent) {
            return false;
        } else {
            return true;
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.searchContent !== this.props.searchContent) {
            this.setHeader();
        }
    }
    componentDidMount() {
        this.setHeader();
    }

    render() {
        let searchContent = this.props.searchContent.$$typeof
            ? this.props.searchContent
            : this.props.searchContent.map((movie) => (
                  <MovieItem
                      key={uniqid()}
                      movie={movie}
                      fallback={true}
                      openBox={this.props.openBox}
                  />
              ));

        return (
            <div className="search-container">
                {this.props.searchContent.$$typeof ? (
                    ""
                ) : (
                    <div className="search-title">{`Search Results (${this.props.searchContent.length})`}</div>
                )}
                <div className="search-results">{searchContent}</div>
            </div>
        );
    }
}

export default SearchContainer;
