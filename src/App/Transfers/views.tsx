import React, { FC } from 'react';
import { Heading, Button, MessageBox, Spinner, DataList, DatePicker, Link, TextField, Select } from 'components';
import { connect } from 'react-redux';
import withMount from 'hocs';
import { State, Dispatch } from 'store/types';
import { TransfersFilter, FilterChangeValue, Transfer } from './types';
import * as actions from './actions';
import * as selectors from './selectors';
import './Transfers.css';

const transfersColumns = [
  {
    label: 'Transfer ID',
    key: 'id',
    func: (value: string, item: Transfer) => (
      /* eslint-disable */
      <Link>
        <span style={{ textDecoration: 'underline' }}>{item.id}</span>
      </Link>
      /* eslint-enable */
    ),
  },
  {
    label: 'Type',
    key: 'type',
  },
  {
    label: 'Timestamp',
    key: 'id',
    func: (value: string, item: Transfer) => `${item.transferTimestamp || item.quoteTimestamp}`,
  },
  {
    label: 'Payer FSPID',
    key: 'payerFspid',
  },
  {
    label: 'Payee FSPID',
    key: 'payeeFspid',
  },
  {
    label: 'Amount',
    key: 'amount',
    func: (value: string, item: Transfer) => `${item.amount}`,
  },
  {
    label: 'Currency',
    key: 'currency',
    func: (value: string, item: Transfer) => `${item.currency}`,
  },
  {
    label: 'Status',
    key: 'status',
  },
  {
    label: 'Payer Acct ID',
    key: 'id',
    func: (value: string, item: Transfer) => `${item.payerParty.idType} ${item.payerParty.idValue}`,
  },
  {
    label: 'Payee Acct ID',
    key: 'id',
    func: (value: string, item: Transfer) => `${item.payeeParty.idType} ${item.payeeParty.idValue}`,
  },
];

const IDTypes = [
  {
    label: 'MSISDN',
    value: 'MSISDN',
  },
  {
    label: 'EMAIL',
    value: 'EMAIL',
  },
  {
    label: 'PERSONAL_ID',
    value: 'PERSONAL_ID',
  },
  {
    label: 'BUSINESS',
    value: 'BUSINESS',
  },
  {
    label: 'DEVICE',
    value: 'DEVICE',
  },
  {
    label: 'ACCOUNT_ID',
    value: 'ACCOUNT_ID',
  },
  {
    label: 'IBAN',
    value: 'IBAN',
  },
  {
    label: 'ALIAS',
    value: 'ALIAS',
  },
];

const stateProps = (state: State) => ({
  selectedTransfer: selectors.getSelectedTransfer(state),
  transfers: selectors.getTransfers(state),
  transfersError: selectors.getTransfersError(state),
  isTransfersPending: selectors.getIsTransfersPending(state),
  filtersModel: selectors.getTransfersFilter(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onFindTransfersClick: () => dispatch(actions.requestTransfers()),
  onClearFiltersClick: () => dispatch(actions.clearTransferFinderFilters()),
  onTransferSelect: (transfer: Transfer) => dispatch(actions.selectTransfer(transfer)),
  onFilterChange: (field: string, value: FilterChangeValue) =>
    dispatch(actions.setTransferFinderFilter({ field, value })),
});

interface ConnectorProps {
  selectedTransfer: Transfer;
  transfers: Transfer[];
  transfersError: string | null;
  isTransfersPending: boolean;
  filtersModel: TransfersFilter;
  onFindTransfersClick: () => void;
  onClearFiltersClick: () => void;
  onTransferSelect: (transfer: Transfer) => void;
  onFilterChange: (field: string, value: FilterChangeValue) => void;
}

const Transfers: FC<ConnectorProps> = ({
  // selectedTransfer,
  transfers,
  transfersError,
  isTransfersPending,
  filtersModel,
  onFindTransfersClick,
  onClearFiltersClick,
  // onTransferSelect,
  onFilterChange,
}) => {
  let content = null;
  if (transfersError) {
    content = <MessageBox kind="danger">Error fetching transfers: {transfersError}</MessageBox>;
  } else if (isTransfersPending) {
    content = <Spinner center />;
  } else {
    /*
          onSelect={onTransferSelect}
          sortColumn="D"
          sortAsc={false}
        
        //selectedTransfer && <TransferDetails />
*/
    content = (
      <DataList
        columns={transfersColumns}
        list={transfers}
        pageSize={Number(20)}
        paginatorSize={Number(7)}
        flex={true}
      />
    );
  }

  let warning = null;
  if (transfers && transfers.length >= 500) {
    warning = (
      <MessageBox kind="warning">
        Your search returned over 500 results. Only the first 1000 will be displayed. Try narrowing your search with the
        available filters.
      </MessageBox>
    );
  }

  return (
    <div className="transfers">
      <Heading size="3">Find Transfers</Heading>
      <Filters
        model={filtersModel}
        onFilterChange={onFilterChange}
        onClearFiltersClick={onClearFiltersClick}
        onFindTransfersClick={onFindTransfersClick}
      />
      {warning}
      {content}
    </div>
  );
};

interface TransferFiltersProps {
  model: TransfersFilter;
  onFilterChange: (field: string, value: FilterChangeValue) => void;
  onClearFiltersClick: () => void;
  onFindTransfersClick: () => void;
}

const Filters: FC<TransferFiltersProps> = ({ model, onFilterChange, onClearFiltersClick, onFindTransfersClick }) => {
  return (
    <div className="transfers__filters">
      <div className="transfers__filters__filter-row">
        <TextField
          className="transfers__filters__textfield"
          placeholder="Transfer ID"
          size="s"
          onChange={(value: FilterChangeValue) => onFilterChange('transferId', value)}
        />
      </div>
      <div className="transfers__filters__filter-row">
        <TextField
          className="transfers__filters__textfield"
          placeholder="Payer FSPID"
          size="s"
          value={model?.payerFspid}
          onChange={(value: FilterChangeValue) => onFilterChange('payerFspid', value)}
        />
        <Select
          className="transfers__filters__select"
          size="s"
          id="filter_payerIdType"
          placeholder="Payer ID Type"
          options={IDTypes}
          selected={model?.payerIdType}
          onChange={(value: FilterChangeValue) => onFilterChange('payerIdType', value)}
        />
        <TextField
          className="transfers__filters__textfield"
          placeholder="Payer ID Value"
          size="s"
          value={model?.payerIdValue}
          onChange={(value: FilterChangeValue) => onFilterChange('payerIdValue', value)}
        />
      </div>
      <div className="transfers__filters__filter-row">
        <TextField
          className="transfers__filters__textfield"
          placeholder="Payee FSPID"
          size="s"
          value={model?.payeeFspid}
          onChange={(value: FilterChangeValue) => onFilterChange('payeeFspid', value)}
        />
        <Select
          className="transfers__filters__select"
          size="s"
          id="filter_payeeIdType"
          placeholder="Payee ID Type"
          options={IDTypes}
          selected={model?.payeeIdType}
          onChange={(value: FilterChangeValue) => onFilterChange('payeeIdType', value)}
        />
        <TextField
          className="transfers__filters__textfield"
          placeholder="Payee ID Value"
          size="s"
          value={model?.payeeIdValue}
          onChange={(value: FilterChangeValue) => onFilterChange('payeeIdValue', value)}
        />
      </div>
      <div className="transfers__filters__filter-row">
        <DatePicker
          className="transfers__filters__date-filter"
          size="s"
          id="filter_date_from"
          format="YYYY-MM-DDTHH:mm:ss.SSSZZ"
          value={model && model.from ? new Date(model.from) : undefined}
          placeholder="From"
          dateFormat="YYYY-MM-DD HH:mm:ss"
          defaultHour={0}
          defaultMinute={0}
          defaultSecond={0}
          hideIcon
          withTime
          onSelect={(value: FilterChangeValue) => onFilterChange('from', value)}
        />
        <DatePicker
          className="transfers__filters__date-filter"
          size="s"
          id="filter_date_to"
          format="YYYY-MM-DDTHH:mm:ss.SSSZZ"
          value={model && model.to ? new Date(model.to) : undefined}
          placeholder="To"
          dateFormat="YYYY-MM-DD HH:mm:ss"
          defaultHour={23}
          defaultMinute={59}
          defaultSecond={59}
          hideIcon
          withTime
          onSelect={(value: FilterChangeValue) => onFilterChange('to', value)}
        />
      </div>
      <div className="transfers__filters__filter-row">
        <Button
          className="transfers__filters__find"
          size="s"
          kind="primary"
          label="Find Transfers"
          onClick={onFindTransfersClick}
        />
        <Button
          noFill
          className="transfers__filters__date-filter"
          size="s"
          kind="danger"
          label="Clear Filters"
          onClick={onClearFiltersClick}
        />
      </div>
    </div>
  );
};

export default connect(stateProps, dispatchProps)(withMount(Transfers, 'onMount'));
