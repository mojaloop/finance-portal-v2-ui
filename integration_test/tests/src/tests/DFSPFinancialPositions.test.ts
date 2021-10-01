import { strict as assert } from 'assert';
import { waitForReact } from 'testcafe-react-selectors';
import { Selector } from 'testcafe';
import { config } from '../config';
import { SideMenu } from '../page-objects/components/SideMenu';
import { LoginPage } from '../page-objects/pages/LoginPage';
import {
  FinancialPositionsPage,
  FinancialPositionUpdateConfirmModal,
  PositionUpdateAction,
  FinancialPositionUpdateModal
} from '../page-objects/pages/FinancialPositionsPage';
import { VoodooClient, protocol } from 'mojaloop-voodoo-client';

enum FundsInOutAction {
  FundsIn,
  FundsOut,
}

class PositiveNumber extends Number {
  constructor(value: number) {
    super(value);
    assert(value > 0, 'Cannot construct positive number from negative number');
  }
}

// We're strict here about using positive number and forcing the user to specify funds in/out
// because the sign of numbers in the system can be quite confusing.
async function fundsInOut({
  t,
  amount,
  participantName,
  action,
  updateNDC = true,
  runAssertion = true,
  dismissConfirmationModal = true,
  startingBalance = 0,
}: {
  t: TestController,
  amount: PositiveNumber,
  participantName: string,
  action: FundsInOutAction,
  startingBalance?: number,
  updateNDC?: boolean,
  runAssertion?: boolean,
  dismissConfirmationModal?: boolean,
}) {
  // Find our dfsp in the list and click the update button
  const testRow = await FinancialPositionsPage.getDfspRowMap().then((m) =>
    m.get(participantName)
  );
  assert(testRow, 'Expected to find the participant we created in the list of financial positions');
  await t.click(testRow.updateButton);

  const radioButton = action === FundsInOutAction.FundsIn
    ? FinancialPositionUpdateModal.addFundsRadioButton
    : FinancialPositionUpdateModal.withdrawFundsRadioButton;

  // Select to withdraw funds and submit
  await FinancialPositionUpdateModal.selectAction(PositionUpdateAction.AddWithdrawFunds);
  await t.click(radioButton);
  await t.typeText(FinancialPositionUpdateModal.amountInput, amount.toLocaleString('en'));
  await t.click(FinancialPositionUpdateModal.submitButton);

  // Confirm and update NDC
  const confirmButton = updateNDC
    ? FinancialPositionUpdateConfirmModal.confirmUpdateNdcButton
    : FinancialPositionUpdateConfirmModal.confirmOnlyButton;
  await t.click(confirmButton);

  if (dismissConfirmationModal) {
    // Close update modal
    await t.click(FinancialPositionUpdateModal.cancelButton);
  }

  if (runAssertion) {
    // Assert the position is changed as we expect
    const changedRow = await FinancialPositionsPage.getDfspRowMap().then((m) =>
      m.get(t.fixtureCtx.participants[0].name)
    );
    assert(changedRow, 'Expected to find the participant we created in the list of financial positions');
    const testAmount = action === FundsInOutAction.FundsOut
      ? startingBalance + amount.valueOf()
      : startingBalance - amount.valueOf();
    await t.expect(changedRow.balance.innerText).eql(testAmount.toLocaleString('en'));
  }
}

fixture`DFSPFinancialPositions`
  .page`${config.financePortalEndpoint}`
  .before(async (ctx) => {
    const cli = new VoodooClient('ws://localhost:3030/voodoo', { defaultTimeout: config.voodooTimeoutMs });
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
    await fundsInOut({
      t,
      amount: new PositiveNumber(5555),
      participantName: t.fixtureCtx.participants[0].name,
      action: FundsInOutAction.FundsIn,
    });
  }
)

test(
  'Enable/disable account works correctly',
  async (t) => {
    const dfspRows = await FinancialPositionsPage.getDfspRowMap();
    const testRow = dfspRows.get(t.fixtureCtx.participants[0].name);
    assert(testRow, 'Expected to find the participant we created in the list of financial positions');

    await t
      .expect(testRow.enableDisableButton.innerText)
      .eql('Disable', 'Expected new test participant to have enabled account');
    await t.click(testRow.enableDisableButton);

    await t
      .expect(testRow.enableDisableButton.innerText)
      .eql('Enable', 'Expected test participant to have disabled account after disable selected');
    await t.click(testRow.enableDisableButton);

    await t
      .expect(testRow.enableDisableButton.innerText)
      .eql('Disable', 'Expected test participant to have disabled account after enable selected');
  }
)

test.skip.meta({
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
  description: 'Withdraw funds amount field should allow "positive" number to withdraw and position should be updated.'
})(
  'Withdraw funds - positive',
  async (t) => {
    // First, process funds in so we have available funds for the withdrawal
    // TODO: processing funds in through the UI is quite slow. If our helper is able to process
    // funds in for us, we should leverage this.
    await fundsInOut({
      t,
      amount: new PositiveNumber(1000),
      participantName: t.fixtureCtx.participants[0].name,
      action: FundsInOutAction.FundsIn,
    });

    // Now, withdraw
    await fundsInOut({
      t,
      amount: new PositiveNumber(999),
      participantName: t.fixtureCtx.participants[0].name,
      action: FundsInOutAction.FundsOut,
      startingBalance: -1000,
    });
  },
);

test(
  'Withdraw funds exceeding available fails',
  async (t) => {
    await fundsInOut({
      t,
      amount: new PositiveNumber(999),
      participantName: t.fixtureCtx.participants[0].name,
      action: FundsInOutAction.FundsOut,
      dismissConfirmationModal: false,
      runAssertion: false,
    });
    await t.expect(FinancialPositionsPage.balanceInsufficientError).ok();
  },
);
