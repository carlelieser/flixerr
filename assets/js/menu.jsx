import React, {Component} from "react";

import uniqid from "uniqid";

import MenuItem from "./menu-item";

class Menu extends Component {
    constructor(props) {
        super(props);

        this.state = {
            menu: [
                {
                    name: 'Featured',
                    icon: 'star'
                }, {
                    name: 'Movies',
                    icon: 'filmstrip'
                }, {
                    name: 'TV Shows',
					icon: 'youtube-tv'
                }, {
                    name: 'Collection',
                    icon: 'library'
                }, {
                    name: this.props.user
                        ? 'Sign Out'
                        : 'Sign In',
					icon: 'account-circle',
					action: this.props.user ? this.props.signOut : this.props.openAccount
                }
            ]
        };
    }

    toggleItem = (item) => {
        this
            .props
            .updateMenu(item);
        this
            .props
            .resetSearch();
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.user !== this.props.user) {
            return true;
        } else {
            return false;
        }
    }

    render() {
        let menuItems = this
            .state
            .menu
            .map((item, index) => {
                let active = this.props.active == item.name
                    ? true
                    : false;

                return (<MenuItem
                    item={item}
					active={active}
					toggleItem={this.toggleItem}
                    key={uniqid()}/>);
            });

        return <div className='app-menu'>{menuItems}</div>;
    }
}

export default Menu;
