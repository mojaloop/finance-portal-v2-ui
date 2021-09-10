import { ReactSelector } from 'testcafe-react-selectors';
import { Temporal } from '@js-temporal/polyfill';
import { t } from 'testcafe';

// TODO: get this data from the application? Instead of using this data, use the actual text
// displayed to the user, as the user would?
export enum SettlementWindowStatus {
  Open = 'OPEN',
  Closed = 'CLOSED',
  Pending = 'PENDING_SETTLEMENT',
  Settled = 'SETTLED',
  Aborted = 'ABORTED',
}

export type SettlementWindowRow = {
  id: Selector,
  closeButton: Selector,
  checkbox: Selector,
}

const datePickerSelectDate = async (
  t: TestController,
  datePicker: Selector,
  newDate: Temporal.PlainDate,
) => {
  // TODO: the following code hangs for some reason. We should probably not make assumptions
  // about the default month displayed, instead we should all getReact() on the Month component
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
  | { fromDate: Temporal.PlainDate; toDate?: Temporal.PlainDate; state?: SettlementWindowStatus }
  | { toDate: Temporal.PlainDate; fromDate?: Temporal.PlainDate; state?: SettlementWindowStatus }
  | { state: SettlementWindowStatus, toDate?: Temporal.PlainDate; fromDate?: Temporal.PlainDate };

export const SettlementWindowsSettlementModal = {
  viewSubmittedSettlementsButton: ReactSelector('SettlementWindowModal').findReact('Button').withText('View Submitted Settlements'),
  continueViewingWindowsButton: ReactSelector('SettlementWindowModal').findReact('Button').withText('Continue Viewing Windows'),
};

export const SettlementWindowsPage = {
  date: ReactSelector('Select').withProps({ placeholder: 'Date' }),

  fromDate: ReactSelector('DatePicker').withProps({ placeholder: 'From' }),
  fromDatePicker: ReactSelector('DatePicker').withProps({ placeholder: 'From' }).findReact('DayPicker'),

  toDate: ReactSelector('DatePicker').withProps({ placeholder: 'To' }),
  toDatePicker: ReactSelector('DatePicker').withProps({ placeholder: 'To' }).findReact('DayPicker'),

  state: ReactSelector('Select').withProps({ placeholder: 'State' }),
  clearFiltersButton: ReactSelector('Button').withProps({ label: 'Clear Filters' }),

  settleWindowsButton: ReactSelector('Button').withText('Settle Selected Windows'),

  async getResultRows(): Promise<SettlementWindowRow[]> {
    const rows = ReactSelector('DataList Rows').findReact('RowItem');
    // This `expect` forces TestCafe to take a snapshot of the DOM. If we don't make this call,
    // rows.count always returns zero, and this function fails.
    await t.expect(rows.exists).ok('Expected to find settlement window row results');
    const length = await rows.count;
    return Array
      .from({ length })
      .map((_, i) => ({
          closeButton: rows.nth(i).findReact('Button'),
          id: rows.nth(i).findReact('ItemCell').nth(1),
          checkbox: rows.nth(i).findReact('ItemCell').withKey('_checkbox_column'),
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
  },
};
