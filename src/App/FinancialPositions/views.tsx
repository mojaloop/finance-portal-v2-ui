import React, { FC } from 'react';
import { Heading, Led, MessageBox, Spinner, DataList, Button } from 'components';
import withMount from 'hocs';
import connector, { ConnectorProps } from './connectors';
import { FinancialPosition } from './types';
import * as helpers from './helpers';
import './FinancialPositions.css';
import FinancialPositionUpdate from './FinancialPositionUpdate';

function getLedColorByPerc(perc: number): string {
  if (perc < 1) {
    return 'green';
  }
  if (perc < 30) {
    return 'blue';
  }
  return 'red';
}

interface PercProps {
  perc: number;
}

const Perc: FC<PercProps> = ({ perc }) => (
  <>
    <Led colorName={getLedColorByPerc(perc)} />
    <span>{perc}%</span>
  </>
);

const FinancialPositions: FC<ConnectorProps> = ({
  financialPositions,
  financialPositionsError,
  isFinancialPositionsPending,

  selectedFinancialPosition,
  onSelectFinancialPosition,
}) => {
  const columns = [
    { key: 'dfsp.name', label: 'DFSP' },
    { key: 'balance', label: 'Balance', func: helpers.formatNumber },
    { key: 'positions', label: 'Current Position', func: helpers.formatNumber },
    { key: 'limits', label: 'NDC', func: helpers.formatNumber },
    {
      key: '',
      sortable: false,
      searchable: false,
      label: '% NDC Used',
      func: (_: undefined, item: FinancialPosition) => {
        if (!item.positions || !item.limits) {
          return '-';
        }
        return <Perc perc={helpers.formatPerc(item.positions / item.limits)} />;
      },
    },
    {
      key: 'update',
      label: '',
      sortable: false,
      searchable: false,
      func: (_: unknown, item: FinancialPosition) => {
        return (
          <Button
            id={`btn__update_${item.dfsp.name}`}
            label="Update"
            size="s"
            kind="secondary"
            onClick={() => onSelectFinancialPosition(item)}
          />
        );
      },
    },
  ];

  let content = null;
  if (financialPositionsError) {
    content = (
      <MessageBox id="msg_error__positions" kind="danger">
        {financialPositionsError}
      </MessageBox>
    );
  } else if (isFinancialPositionsPending) {
    content = <Spinner center />;
  } else {
    content = (
      <>
        <DataList columns={columns} list={financialPositions} sortColumn="DFSP" />
        {selectedFinancialPosition && <FinancialPositionUpdate />}
      </>
    );
  }
  return (
    <div className="financial-positions">
      <Heading size="3">DFSP Financial Positions</Heading>
      {content}
    </div>
  );
};

FinancialPositions.displayName = 'FinancialPositions';
export default connector(withMount(FinancialPositions, 'onMount'));
