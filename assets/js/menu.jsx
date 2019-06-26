import React, { Component } from "react";

import uniqid from "uniqid";

import MenuItem from "./menu-item";

class Menu extends Component {
	constructor(props) {
		super(props);

		this.state = {
			menu: [
				"Featured",
				"Movies",
				"TV Shows",
				"Collection",
				this.props.user ? "Sign Out" : "Sign In"
			],
			icons: ["star", "filmstrip", "youtube-tv", "library", "account-circle"]
		};
	}

	toggleItem = (item) => {
		this.props.updateMenu(item);
		this.props.resetSearch();
	};

	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.user !== this.props.user) {
			return true;
		} else {
			return false;
		}
	}

	render() {
		let menuItems = this.state.menu.map((item, index) => {
			let active = this.props.active == item ? true : false;

			return (
				<MenuItem
					item={item}
					active={active}
					iconClass={`mdi mdi-${this.state.icons[index]}`}
					signOut={this.props.signOut}
					openAccount={this.props.openAccount}
					toggleItem={this.toggleItem}
					key={uniqid()}
				/>
			);
		});

		return <div className='app-menu'>{menuItems}</div>;
	}
}

export default Menu;
