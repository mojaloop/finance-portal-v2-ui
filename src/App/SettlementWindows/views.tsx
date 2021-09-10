import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Column,
  DataLabel,
  Heading,
  Led,
  Button,
  MessageBox,
  Spinner,
  DataList,
  Select,
  DatePicker,
  Modal,
} from 'components';
import withMount from 'hocs';
import connector, { ConnectorProps } from './connectors';
import { DateRanges, SettlementWindow, SettlementWindowStatus, SettlementWindowFilters, FilterValue } from './types';
import { dateRanges, settlementWindowStatuses } from './constants';
import * as helpers from './helpers';
import './SettlementWindows.css';

function renderStatus(state: SettlementWindowStatus) {
  const statusLabels = {
    [SettlementWindowStatus.Open]: { color: 'orange', label: 'Open' },
    [SettlementWindowStatus.Closed]: { color: 'purple', label: 'Closed' },
    [SettlementWindowStatus.Pending]: { color: 'blue', label: 'Pending' },
    [SettlementWindowStatus.Settled]: { color: 'green', label: 'Settled' },
    [SettlementWindowStatus.Aborted]: { color: 'red', label: 'Aborted' },
  };
  const { color, label } = statusLabels[state];
  return (
    <>
      <Led colorName={color} />
      <span>{label}</span>
    </>
  );
}

const SettlementWindows: FC<ConnectorProps> = ({
  settlementWindows,
  settlementWindowsError,
  isSettlementWindowsPending,
  filters,
  checkedSettlementWindows,
  isSettlementWindowModalVisible,
  isCloseSettlementWindowPending,
  isSettleSettlementWindowPending,
  settleSettlementWindowsError,
  settlingWindowsSettlementId,
  onDateRangerFilterSelect,
  onDateFilterClearClick,
  onStartDateRangeFilterSelect,
  onEndDateRangeFilterSelect,
  onStateFilterClearClick,
  onFilterValueChange,
  onClearFiltersClick,
  onSettlementsWindowsCheck,
  onSettleButtonClick,
  onCloseButtonClick,
  onCloseModalClick,
}) => {
  const columns = [
    { key: 'settlementWindowId', label: 'Window ID' },
    { key: 'state', label: 'State', func: renderStatus, sortable: false, searchable: false },
    { key: 'createdDate', label: 'Open Date', func: helpers.formatDate },
    {
      key: 'changedDate',
      label: 'Closed Date',
      func: (changedDate: string, item: SettlementWindow) => {
        if (item.state === SettlementWindowStatus.Open) {
          return '-';
        }
        return helpers.formatDate(changedDate);
      },
    },
    {
      key: 'settlementWindowId',
      label: 'Action',
      sortable: false,
      searchable: false,
      func: (settlementWindowId: string, item: SettlementWindow) => {
        if (item.state === SettlementWindowStatus.Open) {
          return (
            /* eslint-disable-next-line */
            <Button
              kind="secondary"
              noFill
              size="s"
              label="Close Window"
              pending={isCloseSettlementWindowPending}
              onClick={() => onCloseButtonClick(item)}
            />
          );
        }
        return null;
      },
    },
  ];

  let content = null;
  if (settlementWindowsError) {
    content = <MessageBox kind="danger">{settlementWindowsError}</MessageBox>;
  } else if (isSettlementWindowsPending) {
    content = <Spinner center />;
  } else {
    content = (
      <>
        <div className="settlement-windows__controls">
          <Button
            disabled={!checkedSettlementWindows.length}
            label="Settle Selected Windows"
            onClick={() => onSettleButtonClick(checkedSettlementWindows)}
          />
        </div>
        <DataList
          columns={columns}
          list={settlementWindows}
          onCheck={onSettlementsWindowsCheck}
          checked={checkedSettlementWindows}
          sortColumn="Window ID"
          sortAsc={false}
          checkable={(item: SettlementWindow) => item.state === SettlementWindowStatus.Closed}
        />
      </>
    );
  }
  return (
    <div className="settlementWindows">
      <Heading size="3">Settlement Windows</Heading>
      <Filters
        filters={filters}
        onDateRangerFilterSelect={onDateRangerFilterSelect}
        onDateFilterClearClick={onDateFilterClearClick}
        onStartDateRangeFilterSelect={onStartDateRangeFilterSelect}
        onEndDateRangeFilterSelect={onEndDateRangeFilterSelect}
        onStateFilterClearClick={onStateFilterClearClick}
        onFilterValueChange={onFilterValueChange}
        onClearFiltersClick={onClearFiltersClick}
      />
      {content}
      {isSettlementWindowModalVisible && (
        <SettlementWindowModal
          id={settlingWindowsSettlementId}
          onClose={onCloseModalClick}
          isPending={isSettleSettlementWindowPending}
          error={settleSettlementWindowsError}
        />
      )}
    </div>
  );
};

interface FiltersProps {
  filters: SettlementWindowFilters;
  onDateRangerFilterSelect: (payload: DateRanges) => void;
  onDateFilterClearClick: () => void;
  onStartDateRangeFilterSelect: (payload: number) => void;
  onEndDateRangeFilterSelect: (payload: number) => void;
  onStateFilterClearClick: () => void;
  onFilterValueChange: (filter: string, value: FilterValue) => void;
  onClearFiltersClick: () => void;
}

const Filters: FC<FiltersProps> = ({
  filters,
  onDateRangerFilterSelect,
  onDateFilterClearClick,
  onStartDateRangeFilterSelect,
  onEndDateRangeFilterSelect,
  onStateFilterClearClick,
  onFilterValueChange,
  onClearFiltersClick,
}) => (
  <div className="settlement-windows__filters">
    <div className="settlement-windows__filters__filter-row">
      <Select
        className="settlement-windows__filters__date-filter"
        size="s"
        id="filter_date"
        placeholder="Date"
        options={dateRanges}
        selected={filters?.range}
        onChange={onDateRangerFilterSelect}
        onClear={onDateFilterClearClick}
      />

      <DatePicker
        className="settlement-windows__filters__date-filter"
        size="s"
        id="filter_date_from"
        format="x"
        onSelect={onStartDateRangeFilterSelect}
        value={filters?.start}
        placeholder="From"
        dateFormat="MM/DD/YYYY HH:mm:SS"
        defaultHour={0}
        defaultMinute={0}
        defaultSecond={0}
        hideIcon
        withTime
      />

      <DatePicker
        className="settlement-windows__filters__date-filter"
        size="s"
        id="filter_date_to"
        format="x"
        initialMonth={filters?.start}
        onSelect={onEndDateRangeFilterSelect}
        value={filters?.end}
        placeholder="To"
        dateFormat="MM/DD/YYYY HH:mm:SS"
        defaultHour={23}
        defaultMinute={59}
        defaultSecond={59}
        hideIcon
        withTime
      />
    </div>
    <div className="settlement-windows__filters__filter-row">
      <Select
        className="settlement-windows__filters__date-filter"
        size="s"
        placeholder="State"
        selected={filters?.state}
        options={settlementWindowStatuses}
        onChange={(value: string) => onFilterValueChange('state', value)}
        onClear={onStateFilterClearClick}
      />
      <Button
        noFill
        className="settlement-windows__filters__date-filter"
        size="s"
        kind="danger"
        label="Clear Filters"
        onClick={onClearFiltersClick}
      />
    </div>
  </div>
);

interface SettlementWindowModalProps {
  onClose: () => void;
  isPending: boolean;
  error: string | null;
  id: number | null;
}

const SettlementWindowModal: FC<SettlementWindowModalProps> = ({ id, isPending, error, onClose }) => {
  const history = useHistory();
  let content = null;
  let title;
  if (isPending) {
    title = 'Submitting Settlement(s)';
    content = <Spinner center />;
  } else if (error) {
    title = 'Failed Settlement Submit';
    content = <MessageBox kind="danger">There was an error settling the windows</MessageBox>;
  } else {
    title = 'Settlement Submitted';
    content = (
      <>
        <div>
          <Column>
            <DataLabel size="s" light>
              Settlement IDs
            </DataLabel>
            <DataLabel size="m">{id || ''}</DataLabel>
          </Column>
        </div>
        <div className="settlements-windows__modal__row">
          <Button
            noFill
            kind="secondary"
            label="View Submitted Settlements"
            onClick={() => history.push('/settlements')}
          />
        </div>
        <div className="settlements-windows__modal__row">
          <Button noFill kind="secondary" label="Continue Viewing Windows" onClick={onClose} />
        </div>
      </>
    );
  }
  return (
    <Modal title={title} onClose={onClose} noFooter>
      {content}
    </Modal>
  );
};

export default connector(withMount(SettlementWindows, 'onMount'));
