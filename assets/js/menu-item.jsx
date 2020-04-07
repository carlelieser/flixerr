import React, { Component } from 'react'

class MenuItem extends Component {
    constructor(props) {
        super(props)
    }

    handleMenuClick = () => {
        if (this.props.item.action) {
            this.props.item.action()
        } else {
            this.props.toggleItem(this.props.item.name)
        }
    }

    render() {
        return (
            <div
                className={`menu-item ${
                    this.props.active ? 'menu-active' : ''
                }`}
                onClick={this.handleMenuClick}
            >
                <i className={`mdi mdi-${this.props.item.icon}`} />
                <div>{this.props.item.name}</div>
                {this.props.item.beta ? (
                    <div className="beta-tag">Beta</div>
                ) : (
                    ''
                )}
            </div>
        )
    }
}

export default MenuItem
