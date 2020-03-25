import React, { Component } from "react";

class DarkModeToggle extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		let { toggleDarkMode, darkMode } = this.props;
		let darkModeToggleClass = `dark-mode-toggle ${
			darkMode ? "dark-mode-toggle-light" : ""
		}`;
		let iconClass = `mdi mdi-24px ${darkMode ? "mdi-dark" : "mdi-light"} mdi-brightness-${
			darkMode ? "5" : "2"
		}`;
		return (
			<div
				className={darkModeToggleClass}
				onClick={toggleDarkMode}
			>
				<i className={iconClass}></i>
			</div>
		);
	}
}

export default DarkModeToggle;
