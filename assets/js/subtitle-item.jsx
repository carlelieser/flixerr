import React, {Component} from "react";

import readBlob from 'read-blob';

class SubtitleItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            language: '',
            loading: true
        }
    }

    setLanguage = (language) => {
        this.setState({language});
    }

    setLoading = (loading) => {
        this.setState({loading});
    }

    getLanguage = () => {
        this.setLoading(true);
        return this
            .props
            .item
            .getBuffer((err, buffer) => {
                if (!err) {
                    let text = this.getBufferAsText(buffer)
                    let franc = require('franc-min');
                    let langs = require('langs');

                    let language = franc(text);
                    let lang = langs
                        .where("3", language)
                        .name;

                    this.setLanguage(lang);
                    this.setLoading();
                } else {
                    this.setLoading();
                }
            });
    }

    toVTT = (utf8str) => {
        return utf8str
            .replace(/\{\\([ibu])\}/g, '</$1>')
            .replace(/\{\\([ibu])1\}/g, '<$1>')
            .replace(/\{([ibu])\}/g, '<$1>')
            .replace(/\{\/([ibu])\}/g, '</$1>')
            .replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2')
            .concat('\r\n\r\n');
    }

    getBufferAsText = (buffer) => {
        let utf8 = new TextDecoder().decode(buffer);
        return utf8;
    }

    getVttURL = (buffer) => {
        let text = this.toVTT(this.getBufferAsText(buffer));
        let vttString = 'WEBVTT FILE\r\n\r\n';
        let blobText = vttString.concat(text);
        let blob = new Blob([blobText], {type: 'text/vtt'});
        return URL.createObjectURL(blob);
    }

    handleSubtitle = () => {
        this
            .props
            .item
            .getBuffer((err, buffer) => {
                if (!err) {
                    let src = this.getVttURL(buffer);
                    this
                        .props
                        .setActiveSubtitle(this.props.item);
                    this
                        .props
                        .setSubtitleData({language: this.state.language, src});
                } else {
                    this
                        .props
                        .setSubtitleURL();
                }
            });
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.active === this.props.active && nextState.language === this.state.language && nextState.loading === this.state.loading) {
            return false;
        } else {
            return true;
        }
    }

    componentDidMount = () => {
        this.getLanguage();
    }

    render() {
        return (
            <div
                className={`subtitle-item ${this.state.loading
                ? 'loading-subtitle-item'
                : this.props.active
                    ? 'active-subtitle'
                    : ''}`}
                onClick={this.handleSubtitle}>
                {this.state.loading
                    ? <div className="subtitle-loading"></div>
                    : <div className="subtitle-language">{this.state.language}</div>}
                {this.props.active
                    ? <i className="mdi mdi-checkbox-blank-circle mdi-light"/>
                    : ''}
            </div>
        )
    }
}

export default SubtitleItem;