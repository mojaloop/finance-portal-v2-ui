const settlementsPage = require('../page-objects/pages/SettlementWindowsPage');
const userData = require('../data/user-data');

fixture.skip `Settlements Feature`.page`${userData.urls.FINANCE_PORTAL_V2.BASE_URL.QA}`; // specify the start page

test.meta({
  ID: '',
  STORY: 'MMD-440',
})(
  `Once I click Settlement tab in Side Menu, the page on the right should come up with 
    Date drop-down defaulted to Today, From and To drop-down defaulted to current date in MM/DD/YYYY HH:MM:SS format
    State should be empty and Clear Filters button`,
  async (t) => {
    //Call Mojaloop Settlement API to get the current window details
    // Check that the latest window ID that displays on the page is the same
  },
);
