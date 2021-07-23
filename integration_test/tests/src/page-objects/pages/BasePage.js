import NavBar from '../components/NavBar';
import SideMenu from '../components/SideMenu';
class BasePage {
    constructor() {
        this._navBar = new NavBar();
        this._sideMenu = new SideMenu();
    };

    getNavBarLink() {
        return this._navBar._navBarLink.textContent;
    }
}

module.exports = BasePage;

