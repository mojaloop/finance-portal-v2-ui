import { ReactSelector } from 'testcafe-react-selectors';

export const SideMenu = {
  settlementWindowsButton: ReactSelector('MenuItem').withProps({ label: 'Settlement Windows' }),
  settlementsButton: ReactSelector('MenuItem').withProps({ label: 'Settlements' }),
  dfspFinancialPositionsButton: ReactSelector('MenuItem').withProps({ label: 'DFSP Financial Positions' }),
};
