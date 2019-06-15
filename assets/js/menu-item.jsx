import React, { Component } from "react";

class MenuItem extends Component {
	constructor(props) {
		super(props);
	}

	handleMenuClick = () => {
		if (this.props.item == "Sign Out") {
			this.props.signOut();
		} else if (this.props.item == "Sign In") {
			this.props.openAccount();
		} else {
			this.props.toggleItem(this.props.item);
		}
	};

	render() {
		return (
			<div
				className={`menu-item ${
					this.props.active ? "menu-active" : ""
				}`}
				onClick={this.handleMenuClick}>
				<i className={this.props.iconClass} />
				<div>{this.props.item}</div>
			</div>
		);
	}
}

export default MenuItem;
