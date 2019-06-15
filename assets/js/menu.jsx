import uniqid from "uniqid";
class Menu extends React.Component {
    constructor(props) {
        super(props);

        this.icons = ['star', 'filmstrip', 'library', 'account-circle'];
    }

    toggleItem = (e, item) => {
        e.stopPropagation();
        this
            .props
            .updateMenu(false, item);
        document
            .querySelector(".app-menu-button")
            .style
            .transform = "rotate(0deg)";
        this
            .props
            .resetSearch();
    }

    shouldComponentUpdate(nextProps, nextState){
        if(nextProps.menu !== this.props.menu){
            return true
        } else{
            return false;
        }
    }

    render() {
        let menuItems = this
            .props
            .menu
            .map((item, index) => (
                <div
                    className={`menu-item ${this.props.active == item
                    ? "menu-active"
                    : ""}`}
                    key={uniqid()}
                    onClick={(e) => {
                        if(index == this.props.menu.length - 1){
                            if (this.props.user){
                                this.props.signOut();
                            } else{
                                this.props.openAccount();
                            }
                        }else{
                            this.toggleItem(e, item)
                        }
                    }}>
                    <i className={`mdi mdi-${this.icons[index]}`}></i>
                    <div>{this.props.user ? index == this.props.menu.length - 1 ? 'Sign Out' : item : index == this.props.menu.length ? 'Sign In' : item }</div>
                </div>
            ));

        return <div className="app-menu">{menuItems}</div>;
    }
}
