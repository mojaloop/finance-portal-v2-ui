import React, { FC } from 'react';
import { Heading, Led, MessageBox, Spinner, DataList, Button } from 'components';
import withMount from 'hocs';
import connector, { ConnectorProps } from './connectors';
import { FinancialPosition } from './types';
import './FinancialPositions.css';
import FinancialPositionUpdate from './FinancialPositionUpdate';

function formatNum(num: number | string) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

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

  onToggleCurrencyActive,
}) => {
  const columns = [
    { key: 'dfsp.name', label: 'DFSP' },
    { key: 'currency', label: 'Currency' },
    { key: 'settlementAccount.value', label: 'Balance', func: formatNum, searchable: false },
    { key: 'positionAccount.value', label: 'Position', func: formatNum, searchable: false },
    { key: 'ndc', label: 'NDC', func: (v: number) => (v === undefined ? 'Disabled' : formatNum(v)) },
    {
      key: '',
      sortable: false,
      searchable: false,
      label: '% NDC Used',
      func: (_: undefined, item: FinancialPosition) => {
        if (!item.positionAccount.value || !item.ndc) {
          return '-';
        }
        return <Perc perc={Math.floor(100 * (item.positionAccount.value / item.ndc))} />;
      },
    },
    {
      key: 'update',
      label: '',
      sortable: false,
      searchable: false,
      func: (_: unknown, item: FinancialPosition) => (
        <Button
          pending={item.positionAccount.updateInProgress}
          id={`btn__update_${item.dfsp.name}`}
          label="Update"
          size="s"
          kind="secondary"
          onClick={() => onSelectFinancialPosition(item)}
        />
      ),
    },
    {
      key: 'toggleActive',
      label: '',
      sortable: false,
      searchable: false,
      func: (_: unknown, item: FinancialPosition) => (
        <Button
          pending={item.positionAccount.updateInProgress}
          id={`btn__setActive_${item.dfsp.name}`}
          label={item.positionAccount.isActive ? 'Disable' : 'Enable'}
          size="s"
          kind="secondary"
          onClick={() => onToggleCurrencyActive(item)}
        />
      ),
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
