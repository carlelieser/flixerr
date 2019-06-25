import React, {Component} from "react";

class SubtitleItem extends Component {
    constructor(props) {
        super(props);
    }

    handleSubtitle = () => {
        this
            .props
            .setSubtitleData(this.props.item);
        this
            .props
            .setActiveSubtitle(this.props.item);
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.active === this.props.active && nextProps.item === this.props.item) {
            return false;
        } else {
            return true;
        }
    }

    render() {
        return (
            <div
                className={`subtitle-item ${this.props.active
                ? 'active-subtitle'
                : ''}`}
                onClick={this.handleSubtitle}>
                <div className="subtitle-language">{this.props.item.language}</div>
                {this.props.active
                    ? <i className="mdi mdi-checkbox-blank-circle mdi-light"/>
                    : ''}
            </div>
        )
    }
}

export default SubtitleItem;