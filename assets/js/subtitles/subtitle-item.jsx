import React, { Component } from 'react'

class SubtitleItem extends Component {
    constructor(props) {
        super(props)
    }

    handleSubtitle = () => {
        this.props.setActiveSubtitle(this.props.subtitle)
    }

    shouldComponentUpdate(nextProps) {
        if (
            nextProps.active === this.props.active &&
            nextProps.subtitle === this.props.subtitle
        ) {
            return false
        } else {
            return true
        }
    }

    render() {
        return (
            <div
                className={`subtitle-subtitle ${
                    this.props.active ? 'active-subtitle' : ''
                }`}
                onClick={this.handleSubtitle}
            >
                <div className="subtitle-language">
                    {this.props.subtitle.lang}
                </div>
                {this.props.active ? (
                    <i className="mdi mdi-checkbox-blank-circle mdi-light" />
                ) : (
                    ''
                )}
            </div>
        )
    }
}

export default SubtitleItem
