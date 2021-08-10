import { Selector } from 'testcafe';
import { config } from '../config';

fixture`DFSPFinancialPositionsFeature`.page`${config.financePortalEndpoint}`.beforeEach(async (t) => {
  `Login and browse to "DFSP Financial Positions" page, and press "Update" button.`;
  await t
    .typeText('#login__input-username', config.credentials.admin.username)
    .typeText('#login__input-password', config.credentials.admin.password)
    .click('#login__btn-submit')
    .click(Selector('#root div').withText('DFSP Financial Positions').nth(6))
    // TODO: dependence on "testfsp2"
    .click('#btn__update_testfsp2')
    .click(Selector('#select__action div').withText('Select Action...'));
});

test.meta({
  ID: 'MMD-T26',
  STORY: 'MMD-376',
  description: 'Allow funds to add on payerfsp so that the transfers will not be blocked due to insufficient liquidity',
})(
  'Add funds on payerfsp account - positive number',
  async (t) => {
    await t
      .click(Selector('#select__action div').withText('Add / Withdraw Funds').nth(6))
      .click(Selector('#select__add_withdraw_funds label').withText('Add Funds'))
      .typeText('#input__amount', '5000')
      .click(Selector('#btn__submit_update_participant span'))
      .click(Selector('#btn__confirm_upd_participant span'))
      .expect(Selector('#btn__update_testfsp2').exists)
      .ok();
  },
);

test.meta({
  ID: 'MMD-T28',
  STORY: 'MMD-376',
})(
  `Add Funds - "0".
  Add "0" funds is not acceptable.`,
  async (t) => {
    await t
      .click(Selector('#select__action div').withText('Add / Withdraw Funds').nth(6))
      .click(Selector('#select__add_withdraw_funds label').withText('Add Funds'))
      .typeText('#input__amount', '0')
      .expect(Selector('#input__amount').value)
      .contains('');
  },
);

test.meta({
  ID: 'MMD-T29',
  STORY: 'MMD-376',
})(
  `Add Funds - Negative number.
  Supplying negative value to add funds input results in negative sign being ignored.`,
  async (t) => {
    await t
      .click(Selector('#select__action div').withText('Add / Withdraw Funds').nth(6))
      .click(Selector('#select__add_withdraw_funds label').withText('Add Funds'))
      .typeText('#input__amount', '-5000')
      .expect(Selector('#input__amount').value)
      .contains('5000');
  },
);

test.meta({
  ID: 'MMD-T27',
  STORY: 'MMD-414',
})(
  `Withdraw funds - Negative number.
  Amount field should not allow "negative" number to withdraw.`,
  async (t) => {
    await t
      .click(Selector('#select__action div').withText('Add / Withdraw Funds').nth(6))
      .click(Selector('#select__add_withdraw_funds span').withText('Withdraw Funds'))
      .typeText('#input__amount', '-5000')
      .expect(Selector('#input__amount').value)
      .contains('5000');
  },
);

test.meta({
  ID: 'MMD-T30',
  STORY: 'MMD-414',
})(
  `Withdraw funds - Positive number.
  Amount field should allow "positive" number to withdraw.`,
  async (t) => {
    await t
      .click(Selector('#select__action div').withText('Add / Withdraw Funds').nth(6))
      .click(Selector('#select__add_withdraw_funds label').withText('Withdraw Funds'))
      .typeText('#input__amount', '5000')
      .click('#btn__submit_update_participant')
      .click(Selector('#btn__confirm_upd_participant span').withText('Confirm Only'))
      .expect(Selector('#btn__update_testfsp2').exists)
      .ok();
  },
);

test.meta({
  ID: 'MMD-T31',
  STORY: 'MMD-414',
})(
  `Withdraw funds - Higher than the available balance.
  System should not allow withdraw of higher amount than the balance.`,
  async (t) => {
    await t
      .click(Selector('#select__action div').withText('Add / Withdraw Funds').nth(6))
      .click(Selector('#select__add_withdraw_funds label').withText('Withdraw Funds'))
      .typeText('#input__amount', '999999999999999999')
      .click(Selector('#btn__submit_update_participant span').withText('Submit'))
      .click(Selector('#btn__confirm_upd_participant span').withText('Confirm Only'))
      .expect(Selector('#msg_error__positions').textContent)
      .contains('Unable to update Financial Position Balance');
  },
);
