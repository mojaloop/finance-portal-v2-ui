import React, { FC } from 'react';
import { Column, DataLabel, DataList, ErrorBox, Modal, Row, Spinner } from 'components';
import { DFSP } from 'App/DFSPs/types';
import connector, { ConnectorProps } from './connectors';
import * as helpers from '../helpers';
import './SettlementDetailPositions.css';

const SettlementDetailPositions: FC<ConnectorProps> = ({
  dfsps,
  selectedSettlementDetail,
  settlementDetailPositions,
  settlementDetailPositionsError,
  isSettlementDetailPositionsPending,
  onModalCloseClick,
}) => {
  const detailsColumns = [
    {
      label: 'Debit',
      key: 'debit',
      func: (value: number) => helpers.formatNumber(helpers.zeroToDash(value)),
      className: 'settlement-detail-positions__list__debit',
    },
    {
      label: 'Credit',
      key: 'credit',
      func: (value: number) => helpers.formatNumber(helpers.zeroToDash(value)),
      className: 'settlement-detail-positions__list__credit',
    },
  ];
  let content = null;
  if (isSettlementDetailPositionsPending) {
    content = (
      <div className="settlement-detail-positions__loader">
        <Spinner size={20} />
      </div>
    );
  } else if (settlementDetailPositionsError) {
    content = <ErrorBox>Net Positions: Unable to load data</ErrorBox>;
  } else content = <DataList flex columns={detailsColumns} list={settlementDetailPositions} />;
  return (
    <Modal title="Multilateral Net Settlement Position" width="1200px" onClose={onModalCloseClick} flex>
      <Row align="flex-start flex-start">
        <Column>
          <Row align="flex-start flex-start">
            <Column grow="0" className="settlement-detail-positions__details-block">
              <DataLabel size="s" light>
                DFSP
              </DataLabel>
              <DataLabel size="m">
                {dfsps.find((dfsp: DFSP) => dfsp.id === selectedSettlementDetail.dfspId)?.name}
              </DataLabel>
            </Column>
            <Column grow="0" className="settlement-detail-positions__details-block">
              <DataLabel size="s" light>
                Total Debit
              </DataLabel>
              <DataLabel size="m" className="settlement-detail-positions__details-block__debit">
                {helpers.formatNumber(helpers.zeroToDash(selectedSettlementDetail.debit))}
              </DataLabel>
            </Column>
            <Column grow="0" className="settlement-detail-positions__details-block">
              <DataLabel size="s" light>
                Total Credit
              </DataLabel>
              <DataLabel size="m" className="settlement-detail-positions__details-block__credit">
                {helpers.formatNumber(helpers.zeroToDash(selectedSettlementDetail.credit))}
              </DataLabel>
            </Column>
          </Row>
        </Column>
      </Row>
      {content}
    </Modal>
  );
};

export default connector(SettlementDetailPositions);
