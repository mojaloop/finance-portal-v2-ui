import { ReactSelector } from 'testcafe-react-selectors';
import { t } from 'testcafe';

export enum PositionUpdateAction {
  AddWithdrawFunds = 'Add / Withdraw Funds',
  ChangeNDC        = 'Change Net Debit Cap',
}

export type FinancialPositionsRow = {
  dfsp: Selector,
  balance: Selector,
  position: Selector,
  ndc: Selector,
  ndcUsed: Selector,
  updateButton: Selector,
}

const finPosUpdateConfirmRoot = ReactSelector('FinancialPositionUpdateConfirm Modal');
export const FinancialPositionUpdateConfirmModal = {
  root: finPosUpdateConfirmRoot,
  cancelButton: finPosUpdateConfirmRoot.findReact('Button').withText('Cancel'),
  confirmOnlyButton: finPosUpdateConfirmRoot.findReact('Button').withText('Confirm Only'),
  confirmUpdateNdcButton: finPosUpdateConfirmRoot.findReact('Button').withText('Confirm and Update NDC'),
};

const finPosUpdateRoot = ReactSelector('FinancialPositionUpdate Modal');
export const FinancialPositionUpdateModal = {
  root: finPosUpdateRoot,

  actionSelect: finPosUpdateRoot.findReact('Select'),

  addFundsRadioButton: finPosUpdateRoot.findReact('Radio').withText('Add Funds'),
  withdrawFundsRadioButton: finPosUpdateRoot.findReact('Radio').withText('Withdraw Funds'),

  amountInput: finPosUpdateRoot.find('input'),

  cancelButton: finPosUpdateRoot.findReact('Button').withText('Cancel'),
  submitButton: finPosUpdateRoot.findReact('Button').withText('Submit'),

  async selectAction(action: PositionUpdateAction) {
    await t.click(this.actionSelect);
    await t.click(this.actionSelect.findReact('Option').withText(action));
  }
};

export const FinancialPositionsPage = {
  async getResultRows(): Promise<FinancialPositionsRow[]> {
    const rows = ReactSelector('FinancialPositions Datalist Rows').findReact('RowItem');
    // This `expect` forces TestCafe to take a snapshot of the DOM. If we don't make this call,
    // rows.count always returns zero, and this function fails.
    await t.expect(rows.exists).ok('Expected to find financial positions result rows');
    const length = await rows.count;
    return Array
      .from({ length })
      .map((_, i) => ({
        dfsp: rows.nth(i).findReact('ItemCell').nth(0),
        balance: rows.nth(i).findReact('ItemCell').nth(1),
        position: rows.nth(i).findReact('ItemCell').nth(1),
        ndc: rows.nth(i).findReact('ItemCell').nth(1),
        ndcUsed: rows.nth(i).findReact('ItemCell').nth(1),
        updateButton: rows.nth(i).findReact('Button'),
      }));
  },
};
