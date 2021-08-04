import { ReactSelector } from 'testcafe-react-selectors';

export const SettlementWindowsPage = {
  date: ReactSelector('Select').withProps({ placeholder: 'Date' }),
  fromDate: ReactSelector('DatePicker').withProps({ placeholder: 'From' }),
  toDate: ReactSelector('DatePicker').withProps({ placeholder: 'To' }),
  state: ReactSelector('Select').withProps({ placeholder: 'State' }),
};
