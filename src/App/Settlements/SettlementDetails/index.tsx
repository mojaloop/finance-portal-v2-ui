import React, { FC } from 'react';
import { Led, Button, Column, DataLabel, DataList, ErrorBox, Modal, Row, Spinner } from 'components';
import { DFSP } from 'App/DFSPs/types';
import connector, { ConnectorProps } from './connectors';
import * as helpers from '../helpers';
import { SettlementDetail } from '../types';
import SettlementDetailPositions from '../SettlementDetailPositions';
import './SettlementDetails.css';

const SettlementDetails: FC<ConnectorProps> = ({
  dfsps,
  selectedSettlement,
  settlementDetails,
  settlementDetailsError,
  isSettlementDetailsPending,
  selectedSettlementDetail,
  onSelectSettlementDetail,
  onModalCloseClick,
}) => {
  const detailsColumns = [
    { label: 'DFSP', key: 'dfspId', func: (id: number) => dfsps.find((dfsp: DFSP) => dfsp.id === id)?.name },
    {
      label: 'Debit',
      key: 'debit',
      func: (value: number) => helpers.formatNumber(helpers.zeroToDash(value)),
      className: 'settlement-details__list__debit',
    },
    {
      label: 'Credit',
      key: 'credit',
      func: (value: number) => helpers.formatNumber(helpers.zeroToDash(value)),
      className: 'settlement-details__list__credit',
    },
    {
      label: '',
      key: '',
      func: (_: unknown, item: SettlementDetail) => (
        /* eslint-disable */
        <Button
          label="View Net Positions"
          size="s"
          noFill
          kind="secondary"
          onClick={() => onSelectSettlementDetail(item)}
        />
        /* eslint-enable */
      ),
    },
  ];
  let content = null;
  if (isSettlementDetailsPending) {
    content = (
      <div className="settlement-details__loader">
        <Spinner size={20} />
      </div>
    );
  } else if (settlementDetailsError) {
    content = <ErrorBox>Settlement Detail: Unable to load data</ErrorBox>;
  } else
    content = (
      <>
        <DataList flex columns={detailsColumns} list={settlementDetails} />
      </>
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
      {content}
      {selectedSettlementDetail && <SettlementDetailPositions />}
    </Modal>
  );
};

export default connector(SettlementDetails);
