import React, { FC } from 'react';
import { Modal, Tabs, Tab, TabList, TabPanels, TabPanel, FormInput, ScrollBox, Spinner } from 'components';
import { connect } from 'react-redux';
import { State, Dispatch } from 'store/types';
import { TransferDetail, QuoteRequest, QuoteResponse, TransferPrepare } from '../types';
import * as actions from '../actions';
import * as selectors from '../selectors';
import './TransferDetails.css';

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
    <div className="transfers__transferDetails__loader">
      <Spinner size={20} />
    </div>
  );

  if (transferDetails) {
    const QuotePartiesTab = transferDetails.quoteParties.length ? (
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
    ) : null;

    const QuoteErrorsTab = transferDetails.quoteErrors.length ? (
      <TabPanel>
        <Tabs>
          <TabList>
            {transferDetails.quoteErrors.map((qe: any) => (
              <Tab key={`${qe.quoteId}-${qe.quoteErrorId}`}>{qe.quoteErrorId}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {transferDetails.quoteErrors.map((qe: any) => (
              <TabPanel key={`${qe.quoteId}-${qe.quoteErrorId}`}>
                <ScrollBox>{objectToFormInputs(qe.quoteId, qe)}</ScrollBox>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </TabPanel>
    ) : null;

    const QuoteRequestsTab = transferDetails.quoteRequests.length ? (
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
                    <Tab>Quote Errors</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <ScrollBox>{objectToFormInputs(qr.quoteId, qr)}</ScrollBox>
                    </TabPanel>
                    <TabPanel>{QuotePartiesTab}</TabPanel>
                    <TabPanel>{QuoteErrorsTab}</TabPanel>
                  </TabPanels>
                </Tabs>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </TabPanel>
    ) : null;

    const QuoteResponsesTab = transferDetails.quoteResponses.length ? (
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
    ) : null;

    const TransferPreparesTab = transferDetails.transferPrepares.length ? (
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
    ) : null;

    const TransferParticipantsTab = transferDetails.transferParticipants.length ? (
      <TabPanel>
        <Tabs>
          <TabList>
            {transferDetails.transferParticipants.map((tp: any) => (
              <Tab key={tp.transferParticipantId}>{tp.transferParticipantId}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {transferDetails.transferParticipants.map((tp: any) => (
              <TabPanel key={tp.transferParticipantId}>
                <ScrollBox>{objectToFormInputs(tp.transferParticipantId, tp)}</ScrollBox>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </TabPanel>
    ) : null;

    const TransferFulfilmentsTab = transferDetails.transferFulfilments.length ? (
      <TabPanel>
        <Tabs>
          <TabList>
            {transferDetails.transferFulfilments.map((tf: any) => (
              <Tab key={tf.transferId}>{tf.transferId}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {transferDetails.transferFulfilments.map((tf: any) => (
              <TabPanel key={tf.transferId}>
                <ScrollBox>{objectToFormInputs(tf.transferId, tf)}</ScrollBox>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </TabPanel>
    ) : null;

    const TransferStateChangesTab = transferDetails.transferStateChanges.length ? (
      <TabPanel>
        <Tabs>
          <TabList>
            {transferDetails.transferStateChanges.map((tsc: any) => (
              <Tab key={tsc.transferStateChangeId}>{tsc.transferStateChangeId}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {transferDetails.transferStateChanges.map((tsc: any) => (
              <TabPanel key={tsc.transferStateChangeId}>
                <ScrollBox>{objectToFormInputs(tsc.transferStateChangeId, tsc)}</ScrollBox>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </TabPanel>
    ) : null;

    content = (
      <div>
        <Tabs>
          <TabList>
            <Tab>Quote Requests</Tab>
            <Tab>Quote Responses</Tab>
            <Tab>Transfer Prepares</Tab>
            <Tab>Transfer Participants</Tab>
            <Tab>Transfer Fulfilments</Tab>
            <Tab>Transfer State Changes</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>{QuoteRequestsTab}</TabPanel>
            <TabPanel>{QuoteResponsesTab}</TabPanel>
            <TabPanel>{TransferPreparesTab}</TabPanel>
            <TabPanel>{TransferParticipantsTab}</TabPanel>
            <TabPanel>{TransferFulfilmentsTab}</TabPanel>
            <TabPanel>{TransferStateChangesTab}</TabPanel>
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
