import { Selector } from "testcafe";

class SideMenu {
    constructor() {
        this._container = Selector('div.side-menu');
        // this._menuTitle = this.container.find('.el-menu__section-label');
        // this._menuItem = this.container.find('.el-menu__item');
        // this._transfersMenu = this.container.find('div.el-menu__item').nth(1);
    }
}

module.exports = SideMenu;