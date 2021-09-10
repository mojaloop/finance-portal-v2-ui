import { ReactSelector } from 'testcafe-react-selectors';
import { Temporal } from '@js-temporal/polyfill';
import { t } from 'testcafe';

export type TransferRow = {
  id: Selector,
}

export const FindTransfersPage = {
  transferId: ReactSelector('Select').withProps({ placeholder: 'Transfer ID' }),
  clearFiltersButton: ReactSelector('Button').withProps({ label: 'Clear Filters' }),
  findTransfersButton: ReactSelector('Button').withProps({ label: 'Find Transfers' }),

  async getResultRows(): Promise<TransferRow[]> {
    const rows = ReactSelector('DataList Rows').findReact('RowItem');
    // This `expect` forces TestCafe to take a snapshot of the DOM. If we don't make this call,
    // rows.count always returns zero, and this function fails.
    await t.expect(rows.exists).ok('Couldnt find any transfers page rows');
    const length = await rows.count;
    return Array
      .from({ length })
      .map((_, i) => ({
        id: rows.nth(i).findReact('ItemCell').nth(0),
      }));
  },
};
