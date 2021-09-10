import React, { FC } from 'react';
import { Modal, Tabs, Tab, TabList, TabPanels, TabPanel, FormInput, ScrollBox, Spinner } from 'components';
import { connect } from 'react-redux';
import { State, Dispatch } from 'store/types';
import { TransferDetail, QuoteRequest, QuoteResponse, TransferPrepare } from '../types';
import * as actions from '../actions';
import * as selectors from '../selectors';

const stateProps = (state: State) => ({
  transferDetails: selectors.getSelectedTransfer(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onModalCloseClick: () => dispatch(actions.transferDetailsModalClose()),
});

interface ConnectorProps {
  transferDetails: TransferDetail | undefined;
  onModalCloseClick: () => void;
}

const TransferDetails: FC<ConnectorProps> = ({ transferDetails, onModalCloseClick }) => {
  const objectToFormInputs = (outerKey: string | number, o: any) => {
    return (
      <>
        {Object.keys(o).map((k) => (
          <FormInput key={`${outerKey}-${k}`} disabled={true} label={k} type="text" value={o[k] || ''} />
        ))}
      </>
    );
  };

  let content = null;

  content = (
    <div className="transfers__transfers__loader">
      <Spinner size={20} />
    </div>
  );

  if (transferDetails) {
    const TransferPartiesTab = (
      <TabPanel>
        <Tabs>
          <TabList>
            {transferDetails.quoteParties.map((qp: any) => (
              <Tab key={`${qp.quoteId}-${qp.transferParticipantRoleType}`}>{qp.transferParticipantRoleType}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {transferDetails.quoteParties.map((qp: any) => (
              <TabPanel key={`${qp.quoteId}-${qp.transferParticipantRoleType}`}>
                <ScrollBox>{objectToFormInputs(qp.quoteId, qp)}</ScrollBox>
              </TabPanel>
            ))}
          </TabPanels>
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
                      <ScrollBox>{objectToFormInputs(qr.quoteId, qr)}</ScrollBox>
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

    const QuoteResponsesTab = (
      <TabPanel>
        <Tabs>
          <TabList>
            {transferDetails.quoteResponses.map((qr: QuoteResponse) => (
              <Tab key={qr.quoteResponseId}>{qr.quoteResponseId}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {transferDetails.quoteResponses.map((qr: QuoteResponse) => (
              <TabPanel key={qr.quoteResponseId}>
                <ScrollBox>{objectToFormInputs(qr.quoteResponseId, qr)}</ScrollBox>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </TabPanel>
    );

    const TransferPreparesTab = (
      <TabPanel>
        <Tabs>
          <TabList>
            {transferDetails.transferPrepares.map((p: TransferPrepare) => (
              <Tab key={p.transferId}>{p.transferId}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {transferDetails.transferPrepares.map((p: TransferPrepare) => (
              <TabPanel key={p.transferId}>
                <ScrollBox>{objectToFormInputs(p.transferId, p)}</ScrollBox>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </TabPanel>
    );

    content = (
      <div>
        <Tabs>
          <TabList>
            <Tab>Quote Requests</Tab>
            <Tab>Quote Responses</Tab>
            <Tab>Transfer Prepares</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>{QuoteRequestsTab}</TabPanel>
            <TabPanel>{QuoteResponsesTab}</TabPanel>
            <TabPanel>{TransferPreparesTab}</TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    );
  }

  return (
    <Modal
      title={`Transfer Details: ${transferDetails ? transferDetails.transferId : ''}`}
      width="1200px"
      onClose={onModalCloseClick}
    >
      {content}
    </Modal>
  );
};

export default connect(stateProps, dispatchProps)(TransferDetails);
