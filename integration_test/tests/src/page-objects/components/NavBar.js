import { Selector } from "testcafe";

class NavBar {
    constructor () {
        this._navBarLink = Selector(".layout__navbar__home__link").withAttribute("role","button");
        this._userIcon = Selector('#layout__navbar__user__icon');
        this._userNameTooltip = Selector('#layout__navbar__user__name .el-tooltip');
    };
}

module.exports = NavBar;
