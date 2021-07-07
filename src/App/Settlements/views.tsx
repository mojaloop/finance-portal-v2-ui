import React, { FC } from 'react';
import { Led, Heading, Button, MessageBox, Spinner, DataList, Select, DatePicker } from 'components';
import withMount from 'hocs';
import connector, { ConnectorProps } from './connectors';
import { DateRanges, SettlementStatus, SettlementFilters, FilterValue } from './types';
import * as helpers from './helpers';
import { dateRanges, settlementStatuses } from './constants';

import SettlementDetails from './SettlementDetails';
import './Settlements.css';

function renderStatus(state: SettlementStatus) {
  const { color, label } = helpers.getStatusProperties(state);
  return (
    <>
      <Led colorName={color} /> <span>{label}</span>
    </>
  );
}

const columns = [
  { key: 'id', label: 'Settlement ID' },
  { key: 'state', label: 'State', func: renderStatus, sortable: false, searchable: false },
  { key: 'totalValue', label: 'Total Value', func: helpers.formatNumber },
  { key: 'createdDate', label: 'Open Date', func: helpers.formatDate },
  { key: 'changedDate', label: 'Last Action Date', func: helpers.formatDate },
];

const Settlements: FC<ConnectorProps> = ({
  settlements,
  settlementsError,
  isSettlementsPending,
  selectedSettlement,
  filters,
  onDateRangerFilterSelect,
  onDateFilterClearClick,
  onStateFilterClearClick,
  onStartDateRangeFilterSelect,
  onEndDateRangeFilterSelect,
  onFilterValueChange,
  onClearFiltersClick,
  onSettlementSelect,
}) => {
  let content = null;
  if (settlementsError) {
    content = <MessageBox kind="danger">there was an error with the settlements</MessageBox>;
  } else if (isSettlementsPending) {
    content = <Spinner center />;
  } else {
    content = (
      <>
        <DataList
          columns={columns}
          list={settlements}
          onSelect={onSettlementSelect}
          sortColumn="Settlement ID"
          sortAsc={false}
        />
        {selectedSettlement && <SettlementDetails />}
      </>
    );
  }
  return (
    <div className="settlements">
      <Heading size="3">Settlement Management</Heading>
      <Filters
        onDateRangerFilterSelect={onDateRangerFilterSelect}
        onDateFilterClearClick={onDateFilterClearClick}
        onStateFilterClearClick={onStateFilterClearClick}
        onStartDateRangeFilterSelect={onStartDateRangeFilterSelect}
        onEndDateRangeFilterSelect={onEndDateRangeFilterSelect}
        filters={filters}
        onFilterValueChange={onFilterValueChange}
        onClearFiltersClick={onClearFiltersClick}
      />
      {content}
    </div>
  );
};

interface FiltersProps {
  filters: SettlementFilters;
  onDateRangerFilterSelect: (payload: DateRanges) => void;
  onDateFilterClearClick: () => void;
  onStateFilterClearClick: () => void;
  onStartDateRangeFilterSelect: (payload: number) => void;
  onEndDateRangeFilterSelect: (payload: number) => void;
  onFilterValueChange: (filter: string, value: FilterValue) => void;
  onClearFiltersClick: () => void;
}
const Filters: FC<FiltersProps> = ({
  filters,
  onDateRangerFilterSelect,
  onDateFilterClearClick,
  onStateFilterClearClick,
  onStartDateRangeFilterSelect,
  onEndDateRangeFilterSelect,
  onFilterValueChange,
  onClearFiltersClick,
}) => (
  <div className="settlements__filters">
    <div className="settlements__filters__filter-row">
      <Select
        className="settlements__filters__date-filter"
        size="s"
        id="filter_date"
        placeholder="Date"
        options={dateRanges}
        selected={filters?.range}
        onChange={onDateRangerFilterSelect}
        onClear={onDateFilterClearClick}
      />

      <DatePicker
        className="settlements__filters__date-filter"
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
        className="settlements__filters__date-filter"
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
    <div className="settlements__filters__filter-row">
      <Select
        className="settlements__filters__date-filter"
        size="s"
        placeholder="State"
        selected={filters?.state}
        options={settlementStatuses}
        onChange={(value: string) => onFilterValueChange('state', value)}
        onClear={onStateFilterClearClick}
      />
      <Button
        noFill
        className="settlements__filters__date-filter"
        size="s"
        kind="danger"
        label="Clear Filters"
        onClick={onClearFiltersClick}
      />
    </div>
  </div>
);
export default connector(withMount(Settlements, 'onMount'));
