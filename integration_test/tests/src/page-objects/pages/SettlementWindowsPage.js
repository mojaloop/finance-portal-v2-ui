const BasePage = require('./BasePage');

module.exports = {
  ...BasePage,
  date: '#filter_date',
  fromDate: '#filter_date_from',
  toDate: '#filter_date_to',
  state: 'el-tooltip el-tooltip--custom',
};
