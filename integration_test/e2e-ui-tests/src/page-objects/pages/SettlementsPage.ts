import { ReactSelector } from 'testcafe-react-selectors';
import { Temporal } from '@js-temporal/polyfill';
import { t } from 'testcafe';

// TODO: get this data from the application? Instead of using this data, use the actual text
// displayed to the user, as the user would?
export enum SettlementStatus {
  PendingSettlement    = 'PENDING_SETTLEMENT',
  PsTransfersRecorded  = 'PS_TRANSFERS_RECORDED',
  PsTransfersReserved  = 'PS_TRANSFERS_RESERVED',
  PsTransfersCommitted = 'PS_TRANSFERS_COMMITTED',
  Settling             = 'SETTLING',
  Settled              = 'SETTLED',
  Aborted              = 'ABORTED',
}

export type SettlementRow = {
  id: Selector,
  state: Selector,
  finalizeButton: Selector,
}

const datePickerSelectDate = async (
  t: TestController,
  datePicker: Selector,
  newDate: Temporal.PlainDate,
) => {
  // TODO: the following code hangs for some reason. We should probably not make assumptions
  // about the default month displayed, instead we should call getReact() on the Month component
  // and use its props .months property to determine how many times we need to press the
  // back/forward button. As a user would do.
  //   const { month } = await datePicker.findReact('Month').getReact().props;
  //
  // Assuming the current date is preselected as the default, calculate the number of times we
  // need to click the back button
  const today = Temporal.Now.plainDateISO();
  const numberOfPresses = newDate.month - today.month + 12 * (newDate.year - today.year);
  const button = datePicker.find(
    numberOfPresses > 0
      ? '.daypicker-navbutton--next'
      : '.daypicker-navbutton--prev'
  );
  for (let i = 0; i < Math.abs(numberOfPresses); i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await t.click(button);
  }
  const dayKey = `${newDate.year}${newDate.month - 1}${newDate.day}`;
  await t.click(datePicker.findReact('Day').withKey(dayKey));
};

type Filters =
  | { fromDate: Temporal.PlainDate; toDate?: Temporal.PlainDate; state?: SettlementStatus }
  | { toDate: Temporal.PlainDate; fromDate?: Temporal.PlainDate; state?: SettlementStatus }
  | { state: SettlementStatus, toDate?: Temporal.PlainDate; fromDate?: Temporal.PlainDate };

export type WindowRow = {
  id: Selector,
  dfsp: Selector,
  debit: Selector,
  credit: Selector,
  viewNetPositionsButton: Selector,
};

const settlementFinalizingModalRootReactSelector = 'SettlementFinalizingModal Modal ModalPortal ModalBackground';
export const SettlementFinalizingModal = {
  closeButton: ReactSelector(`${settlementFinalizingModalRootReactSelector} ModalFooter Button`).withText('Close'),
  processButton: ReactSelector(`${settlementFinalizingModalRootReactSelector} ModalContent Button`).withText('Process'),
  validateButton: ReactSelector(`${settlementFinalizingModalRootReactSelector} ModalContent Button`).withText('Validate'),
  fileInput: ReactSelector(`${settlementFinalizingModalRootReactSelector} ModalContent`).findReact('input').withProps({ type: 'file' }),
  setLiquidityAccountBalanceCheckbox: ReactSelector(`${settlementFinalizingModalRootReactSelector} ModalContent`).find('label').withText('Set liquidity account balance').find('input'),
  increaseNdcCheckbox: ReactSelector(`${settlementFinalizingModalRootReactSelector} ModalContent`).find('label').withText('Increase net debit caps').find('input'),
  decreaseNdcCheckbox: ReactSelector(`${settlementFinalizingModalRootReactSelector} ModalContent`).find('label').withText('Decrease net debit caps').find('input'),
};

const settlementFinalizationWarningModalRoot = ReactSelector(`${settlementFinalizingModalRootReactSelector} ModalContent Modal`);
export const SettlementFinalizationWarningModal = {
  closeButton: settlementFinalizationWarningModalRoot.findReact('Button'),
};

const SettlementDetailModalRoot = ReactSelector('Modal').withProps({ title: 'Settlement Details' });
export const SettlementDetailModal = {
  async getWindowsRows(): Promise<WindowRow[]> {
    // TODO: this selector should be better; may need to have .displayName set on the component
    await t.expect(ReactSelector('Modal').exists).ok('Expected to find settlement detail modal');
    // TODO: this selector should be better; may need to have .displayName set on the component
    await t.expect(SettlementDetailModalRoot.exists).ok('Expected to find settlement detail modal root');
    const rows = SettlementDetailModalRoot.findReact('DataList Rows').findReact('RowItem');
    // This `expect` forces TestCafe to take a snapshot of the DOM. If we don't make this call,
    // rows.count always returns zero, and this function fails.
    await t.expect(rows.exists).ok('Expected to find settlement detail row results');
    const length = await rows.count;
    return Array
      .from({ length })
      .map((_, i) => ({
        dfsp: rows.nth(i).findReact('ItemCell').nth(0),
        id: rows.nth(i).findReact('ItemCell').nth(1),
        debit: rows.nth(i).findReact('ItemCell').nth(2),
        credit: rows.nth(i).findReact('ItemCell').nth(3),
        viewNetPositionsButton: rows.nth(i).findReact('ItemCell').nth(4).findReact('Button'),
      }));
  },
}

export const SettlementsPage = {
  date: ReactSelector('Select').withProps({ placeholder: 'Date' }),

  fromDate: ReactSelector('DatePicker').withProps({ placeholder: 'From' }),
  fromDatePicker: ReactSelector('DatePicker').withProps({ placeholder: 'From' }).findReact('DayPicker'),

  toDate: ReactSelector('DatePicker').withProps({ placeholder: 'To' }),
  toDatePicker: ReactSelector('DatePicker').withProps({ placeholder: 'To' }).findReact('DayPicker'),

  state: ReactSelector('Select').withProps({ placeholder: 'State' }),
  clearFiltersButton: ReactSelector('Button').withProps({ label: 'Clear Filters' }),

  async getResultRows(): Promise<SettlementRow[]> {
    // TODO: this selector should be better; may need to have .displayName set on the component
    const rows = ReactSelector('DataList Rows').findReact('RowItem');
    // This `expect` forces TestCafe to take a snapshot of the DOM. If we don't make this call,
    // rows.count always returns zero, and this function fails.
    await t.expect(rows.exists).ok('Expected to find settlement row results');
    const length = await rows.count;
    return Array
      .from({ length })
      .map((_, i) => ({
        id: rows.nth(i).findReact('ItemCell').nth(0),
        state: rows.nth(i).findReact('ItemCell').nth(1),
        finalizeButton: rows.nth(i).findReact('Button'),
      }));
  },

  async selectFiltersCustomDateRange(t: TestController, filters: Filters) {
    // TODO: how does the actual UI present dates? What happens if we run the tests in a different TZ?
    await t.click(this.clearFiltersButton);
    await t.click(this.date);
    // TODO: get 'Custom Range' from the application?
    await t.click(ReactSelector('Select Option').withProps({ label: 'Custom Range' }));

    if (filters.toDate) {
      await t.click(this.toDate);
      datePickerSelectDate(t, this.toDatePicker, filters.toDate);
    }

    if (filters.fromDate) {
      await t.click(this.fromDate);
      datePickerSelectDate(t, this.fromDatePicker, filters.fromDate);
    }

    if (filters.state) {
      await t.click(this.state);
      await t.click(this.state.findReact('Option').withProps({ value: filters.state }));
    }

    // There's a built-in 500ms delay between selecting a different filter value and the query
    // occurring, so we wait 1000ms here. The author of this comment did not write the filter
    // logic, and is therefore somewhat reluctant to modify it; although future readers might
    // consider what function this 500ms delay performs (i.e. whether it's long enough to debounce
    // filter changes).
    await t.wait(1000);
  },
};
