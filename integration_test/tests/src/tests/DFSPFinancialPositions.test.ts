import { strict as assert } from 'assert';
import { waitForReact } from 'testcafe-react-selectors';
import { Selector } from 'testcafe';
import { config } from '../config';
import { SideMenu } from '../page-objects/components/SideMenu';
import { LoginPage } from '../page-objects/pages/LoginPage';
import {
  FinancialPositionsPage,
  FinancialPositionsRow,
  FinancialPositionUpdateConfirmModal,
  PositionUpdateAction,
  FinancialPositionUpdateModal
} from '../page-objects/pages/FinancialPositionsPage';
import { VoodooClient, protocol } from 'mojaloop-voodoo-client';

fixture`DFSPFinancialPositions`
  .page`${config.financePortalEndpoint}`
  .before(async (ctx) => {
    const cli = new VoodooClient('ws://localhost:3030/voodoo', { defaultTimeout: 15000 });
    await cli.connected();

    const hubAccounts: protocol.HubAccount[] = [
      {
        type: "HUB_MULTILATERAL_SETTLEMENT",
        currency: "MMK",
      },
      {
        type: "HUB_RECONCILIATION",
        currency: "MMK",
      },
    ];
    await cli.createHubAccounts(hubAccounts);
    ctx.cli = cli;
  })
  .beforeEach(async (t) => {
    const accounts: protocol.AccountInitialization[] = [
      { currency: 'MMK', initial_position: '0', ndc: 10000 },
    ];
    const participants = await t.fixtureCtx.cli.createParticipants(accounts);

    t.fixtureCtx.participants = participants;

    await waitForReact();

    await t
      .typeText(LoginPage.userName, config.credentials.admin.username)
      .typeText(LoginPage.password, config.credentials.admin.password)
      .click(LoginPage.submitButton)
      .click(SideMenu.dfspFinancialPositionsButton);
  });

test.meta({
  description: 'Add funds and update NDC should update the displayed DFSP financial position',
})(
  'Financial position updates after add funds',
  async (t) => {
    const testAmount = '5,555';

    // Find our dfsp in the list and click the update button
    const testRow = await FinancialPositionsPage.getDfspRowMap().then((m) =>
      m.get(t.fixtureCtx.participants[0].name)
    );
    assert(testRow, 'Expected to find the participant we created in the list of financial positions');
    await t.click(testRow.updateButton);

    // Select to add funds and submit
    await FinancialPositionUpdateModal.selectAction(PositionUpdateAction.AddWithdrawFunds);
    await t.click(FinancialPositionUpdateModal.addFundsRadioButton);
    await t.typeText(FinancialPositionUpdateModal.amountInput, testAmount);
    await t.click(FinancialPositionUpdateModal.submitButton);

    // Confirm and update NDC; close update modal
    await t.click(FinancialPositionUpdateConfirmModal.confirmUpdateNdcButton);
    await t.click(FinancialPositionUpdateModal.cancelButton);

    // confirm the position is changed as we expect
    const changedRow = await FinancialPositionsPage.getDfspRowMap().then((m) =>
      m.get(t.fixtureCtx.participants[0].name)
    );
    assert(changedRow, 'Expected to find the participant we created in the list of financial positions');
    await t.expect(changedRow.balance.innerText).eql(`-${testAmount}`);
  }
)

test.skip.meta({
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

test.skip.meta({
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

test.skip.meta({
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

test.skip.meta({
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

test.skip.meta({
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

test.skip.meta({
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
