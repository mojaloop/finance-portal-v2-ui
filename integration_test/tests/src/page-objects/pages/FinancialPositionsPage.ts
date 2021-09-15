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
  enableDisableButton: Selector,
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

  amountInput: finPosUpdateRoot.findReact('Row input'),

  cancelButton: finPosUpdateRoot.findReact('Button').withText('Cancel'),
  submitButton: finPosUpdateRoot.findReact('Button').withText('Submit'),

  async selectAction(action: PositionUpdateAction) {
    await t.click(this.actionSelect);
    await t.click(this.actionSelect.findReact('Option').withText(action));
  }
};

export const FinancialPositionsPage = {
  async getDfspRowMap(): Promise<Map<string, FinancialPositionsRow>> {
    const rows = await this.getResultRows();
    return new Map(await Promise.all(
      rows.map((r) => r.dfsp.innerText.then((t): [string, FinancialPositionsRow] => [t, r]))
    ));
  },

  async getResultRows(): Promise<FinancialPositionsRow[]> {
    const rows = ReactSelector('FinancialPositions DataList Rows').findReact('RowItem');
    // This `expect` forces TestCafe to take a snapshot of the DOM. If we don't make this call,
    // rows.count always returns zero, and this function fails.
    await t.expect(rows.exists).ok('Expected to find financial positions result rows');
    const length = await rows.count;
    return Array
      .from({ length })
      .map((_, i) => ({
        dfsp: rows.nth(i).findReact('ItemCell').nth(0),
        currency: rows.nth(i).findReact('ItemCell').nth(1),
        balance: rows.nth(i).findReact('ItemCell').nth(2),
        position: rows.nth(i).findReact('ItemCell').nth(3),
        ndc: rows.nth(i).findReact('ItemCell').nth(4),
        ndcUsed: rows.nth(i).findReact('ItemCell').nth(5),
        updateButton: rows.nth(i).findReact('ItemCell').nth(6).findReact('Button'),
        enableDisableButton: rows.nth(i).findReact('ItemCell').nth(7).findReact('Button'),
      }));
  },
};
