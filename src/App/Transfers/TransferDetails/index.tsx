import React, { FC } from 'react';
import { Modal, Tabs, Tab, TabList, TabPanels, TabPanel, FormInput, ScrollBox } from 'components';
import { connect } from 'react-redux';
import { State, Dispatch } from 'store/types';
import { TransferDetail, QuoteRequest } from '../types';
import * as actions from '../actions';
import * as selectors from '../selectors';

const stateProps = (state: State) => ({
  transferDetails: selectors.getSelectedTransfer(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onModalCloseClick: () => dispatch(actions.transferDetailsModalClose()),
});

interface ConnectorProps {
  transferDetails: TransferDetail;
  onModalCloseClick: () => void;
}

const TransferDetails: FC<ConnectorProps> = ({ transferDetails, onModalCloseClick }) => {
  const objectToFormInputs = (outerKey: string, o: any) => {
    return (
      <>
        {Object.keys(o).map((k) => (
          <FormInput key={`${outerKey}-${k}`} disabled={true} label={k} type="text" value={o[k] || ''} />
        ))}
      </>
    );
  };

  const TransferPartiesTab = (
    <TabPanel>
      <Tabs>
        <TabList>
          {transferDetails.quoteParties.map((qp: any) => (
            <Tab key={`${qp.quoteId}-${qp.transferParticipantRoleType}`}>{qp.transferParticipantRoleType}</Tab>
          ))}
        </TabList>
      </Tabs>
    </TabPanel>
  );

  const QuoteRequestsTab = (
    <TabPanel>
      <Tabs>
        <TabList>
          {transferDetails.quoteRequests.map((qr: QuoteRequest) => (
            <Tab key={qr.quoteId}>{qr.quoteId}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {transferDetails.quoteRequests.map((qr: QuoteRequest) => (
            <TabPanel key={qr.quoteId}>
              <Tabs>
                <TabList>
                  <Tab>Quote Request</Tab>
                  <Tab>Quote Parties</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <ScrollBox flex>{objectToFormInputs(qr.quoteId, qr)}</ScrollBox>
                  </TabPanel>
                  {TransferPartiesTab}
                </TabPanels>
              </Tabs>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </TabPanel>
  );

  return (
    <Modal title={`Transfer ${transferDetails.transferId} Details`} width="1200px" onClose={onModalCloseClick} flex>
      <div>
        <Tabs>
          <TabList>
            <Tab>Quote Requests</Tab>
            <Tab>Quote Responses</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>{QuoteRequestsTab}</TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </Modal>
  );
};

export default connect(stateProps, dispatchProps)(TransferDetails);
