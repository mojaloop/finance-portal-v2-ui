import { Selector } from 'testcafe';
const BasePage = require('./BasePage');

class SettlementWindowsPage extends BasePage {
    constructor() {
        super();
        this._date = Selector('settlement-windows__filters__filter-row.el-tooltip el-tooltip--custom');
        this._fromDate = Selector('#filter_date_from');
        this._toDate = Selector('#filter_date_to');
        this._state = Selector('el-tooltip el-tooltip--custom');
        //this._clearFiltersButton('');
    }


}

module.exports = new SettlementWindowsPage();
