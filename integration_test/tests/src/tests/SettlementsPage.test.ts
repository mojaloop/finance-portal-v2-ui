import { config } from '../config';

fixture.skip `Settlements Feature`.page`${config.financePortalEndpoint}`; // specify the start page

test.meta({
  ID: '',
  STORY: 'MMD-440',
  Scenario: `Once I click Settlement tab in Side Menu, the page on the right should come up with 
  Date drop-down defaulted to Today, From and To drop-down defaulted to current date in MM/DD/YYYY HH:MM:SS format
  State should be empty and Clear Filters button`
  })(
    'Default landing page', async (t) => {
    
  });

test.meta({
  ID: '',
  STORY: 'MMD-440',
  Scenario: `The following options should be available for State column drop-down, Pending Settlement
    Ps Transfers Recorded, Ps Transfers Reserved, Ps Transfers Committed, Settling, Settled, Aborted`
  })(
    'State Column drop-down options', async (t) => {
    
  });

test.meta({
    ID: '',
    STORY: 'MMD-440',
    Scenario: `Close the existing open window, Run a transfer, Close the open window, Settle the open window
    and the settlement details with the correct Settlement ID, State as Settled, Exact total value
    Correct Open Date and Last Action Date. All these details should be compared against the information
    from calling Settlement API.
    `
    })(
      'Able to see Pending Settlements', async (t) => {
      
    });
