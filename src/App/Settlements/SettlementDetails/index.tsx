import { strict as assert } from 'assert';
import React, { FC } from 'react';
import { Led, Column, DataLabel, DataList, Modal, Row } from 'components';
import { DFSP } from 'App/DFSPs/types';
import connector, { ConnectorProps } from './connectors';
import * as helpers from '../helpers';
import { SettlementParticipant } from '../types';
import './SettlementDetails.css';

const SettlementDetails: FC<ConnectorProps> = ({ dfsps, selectedSettlement, onModalCloseClick }) => {
  const detailsColumns = [
    { label: 'DFSP', key: 'dfsp' },
    { label: 'State', key: 'state' },
    { label: 'Currency', key: 'currency' },
    {
      label: 'Debit',
      key: 'debit',
      className: 'settlement-details__list__debit',
    },
    {
      label: 'Credit',
      key: 'credit',
      className: 'settlement-details__list__credit',
    },
  ];
  assert(selectedSettlement !== null);
  const rows = selectedSettlement.participants.flatMap((p: SettlementParticipant) =>
    p.accounts.map((acc) => ({
      dfsp: dfsps.find((dfsp: DFSP) => dfsp.id === p.id)?.name,
      credit: acc.netSettlementAmount.amount > 0 ? acc.netSettlementAmount.amount : '-',
      debit: acc.netSettlementAmount.amount < 0 ? acc.netSettlementAmount.amount : '-',
      currency: acc.netSettlementAmount.currency,
      accountId: acc.id,
      state: acc.state,
    })),
  );

  const { color, label } = helpers.getStatusProperties(selectedSettlement.state);
  return (
    <Modal title="Settlement Details" width="1200px" onClose={onModalCloseClick} flex>
      <Row align="flex-start flex-start">
        <Column>
          <Row align="flex-start flex-start">
            <Column grow="0" className="settlement-details__details-block">
              <DataLabel size="s" light>
                Settlement ID
              </DataLabel>
              <DataLabel size="m">{selectedSettlement.id}</DataLabel>
            </Column>
            <Column grow="0" className="settlement-details__details-block">
              <DataLabel size="s" light>
                Status
              </DataLabel>
              <DataLabel size="m">
                <Led colorName={color} />
                {label}
              </DataLabel>
            </Column>
            <Column grow="0" className="settlement-details__details-block">
              <DataLabel size="s" light>
                Total Value
              </DataLabel>
              <DataLabel size="m">{helpers.formatNumber(selectedSettlement.totalValue)}</DataLabel>
            </Column>
          </Row>
        </Column>
        <Column grow="0">
          <div className="settlement-details__dates-block">
            <DataLabel size="s" light>
              Created Date
            </DataLabel>
            <DataLabel size="m">{helpers.formatDate(selectedSettlement.createdDate)}</DataLabel>
          </div>
          <div className="settlement-details__dates-block">
            <DataLabel size="s" light>
              Last Action Date
            </DataLabel>
            <DataLabel size="m">{helpers.formatDate(selectedSettlement.changedDate)}</DataLabel>
          </div>
        </Column>
      </Row>
      <DataList flex columns={detailsColumns} list={rows} />
    </Modal>
  );
};

export default connector(SettlementDetails);
