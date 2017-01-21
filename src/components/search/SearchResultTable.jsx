import React, { Component, PropTypes } from 'react';
import Immutable from 'immutable';
import { defineMessages, FormattedMessage } from 'react-intl';
import get from 'lodash/get';
import { Table } from 'cspace-layout';
import { getRecordTypeByServiceObjectName } from '../../helpers/configHelpers';
import styles from '../../../styles/cspace-ui/SearchResultTable.css';
import emptyResultStyles from '../../../styles/cspace-ui/SearchResultEmpty.css';

const rowHeight = 22;

const messages = defineMessages({
  searchPending: {
    id: 'searchResultTable.searchPending',
    defaultMessage: '⋯',
  },
});

/**
 * Determines if a column is sortable for a given search. A column is sortable if isSortable is
 * true, and the search is not contrained by a related record, or if it is, the field to sort by is
 * not complex. This is here to deal with CSPACE-5366 (searches with related record constraints are
 * done using CMIS, which can't see into complex fields). If that bug is ever fixed, then it will
 * suffice just to check isSortable.
 */
const isSortable = (column, searchDescriptor) => {
  const { sortBy } = column;

  return (sortBy && (!searchDescriptor.searchQuery.rel || sortBy.indexOf('/0/') === -1));
};

const propTypes = {
  columnSetName: PropTypes.string,
  formatCellData: PropTypes.func,
  formatColumnLabel: PropTypes.func,
  isSearchPending: PropTypes.bool,
  searchDescriptor: PropTypes.object,
  searchError: PropTypes.instanceOf(Immutable.Map),
  searchResult: PropTypes.instanceOf(Immutable.Map),
  renderHeader: PropTypes.func,
  renderFooter: PropTypes.func,
  onSortChange: PropTypes.func,
};

const defaultProps = {
  columnSetName: 'search',
  formatCellData: (column, data) => data,
  formatColumnLabel: column => column.messages.label.defaultMessage,
  renderHeader: () => null,
  renderFooter: () => null,
};

const contextTypes = {
  config: PropTypes.object.isRequired,
  router: PropTypes.object,
};

export default class SearchResultTable extends Component {
  constructor() {
    super();

    this.handleRowClick = this.handleRowClick.bind(this);
    this.renderNoItems = this.renderNoItems.bind(this);
    this.sort = this.sort.bind(this);
  }

  handleRowClick(index) {
    const {
      searchDescriptor,
      searchResult,
    } = this.props;

    const {
      config,
      router,
    } = this.context;

    if (searchResult && router) {
      const items = searchResult.getIn(['ns2:abstract-common-list', 'list-item']);
      const item = Immutable.List.isList(items) ? items.get(index) : items;
      const docType = item.get('docType');

      let recordTypeName;

      if (docType) {
        const recordTypeConfig = getRecordTypeByServiceObjectName(config, docType);

        if (recordTypeConfig) {
          recordTypeName = recordTypeConfig.name;
        }
      }

      if (!recordTypeName) {
        recordTypeName = searchDescriptor.recordType;
      }

      if (recordTypeName) {
        const csid = item.get('csid');

        router.push(`/record/${recordTypeName}/${csid}`);
      }
    }
  }

  sort({ sortBy, sortDirection }) {
    const {
      onSortChange,
    } = this.props;

    if (onSortChange) {
      onSortChange(sortBy + (sortDirection === Table.SORT_DESC ? ' desc' : ''));
    }
  }

  renderNoItems() {
    const {
      isSearchPending,
    } = this.props;

    const message = isSearchPending ? <FormattedMessage {...messages.searchPending} /> : null;

    return <div className={emptyResultStyles.common}>{message}</div>;
  }

  renderTable() {
    const {
      columnSetName,
      formatCellData,
      formatColumnLabel,
      searchDescriptor,
      searchResult,
    } = this.props;

    const {
      config,
    } = this.context;

    if (searchResult) {
      let sortColumnName = null;
      let sortDir = null;

      const sortSpec = searchDescriptor.searchQuery.sort;

      if (sortSpec) {
        [sortColumnName, sortDir] = sortSpec.split(' ');
      }

      const list = searchResult.get('ns2:abstract-common-list');
      const pageSize = parseInt(list.get('pageSize'), 10);
      const totalItems = parseInt(list.get('totalItems'), 10);
      const itemsInPage = parseInt(list.get('itemsInPage'), 10);

      const recordTypeConfig = config.recordTypes[searchDescriptor.recordType];

      let items = list.get('list-item');

      if (!items) {
        items = Immutable.List();
      }

      if (!Immutable.List.isList(items)) {
        // If there's only one result, it won't be returned as a list.
        items = Immutable.List.of(items);
      }

      const columnConfig = get(recordTypeConfig, ['columns', columnSetName]) || [];

      const columns = columnConfig.map(column => ({
        cellDataGetter: ({ dataKey, rowData }) =>
          formatCellData(column, rowData ? rowData.get(dataKey) : null),
        disableSort: !isSortable(column, searchDescriptor),
        label: formatColumnLabel(column),
        dataKey: column.name,
        width: column.width,
      }));

      let heightBasis;

      if (isNaN(totalItems)) {
        // We don't yet know how many items are found by the search. Set the height to one item, so
        // an ellipsis (or other calculating indicator) can be shown.

        heightBasis = 1;
      } else {
        // If all of the search results fit on one page, shrink the table to fit the number of
        // results. Otherwise, size the table to fit the desired page size, even if there aren't
        // that many results on this page. This keeps the pager from jumping up on the last page
        // and while page/sorting changes are in progress.

        heightBasis = (totalItems <= pageSize && !isNaN(itemsInPage)) ? itemsInPage : pageSize;

        if (heightBasis === 0) {
          // If there are no items, set the height to one, because it looks weird when the footer
          // is mashed up against the header. This also leaves room to display a "no records found"
          // message if desired.

          heightBasis = 1;
        }
      }

      const height = (heightBasis * rowHeight) + rowHeight;

      return (
        <div style={{ height }}>
          <Table
            columns={columns}
            rowCount={items.size}
            rowGetter={({ index }) => items.get(index)}
            onRowClick={this.handleRowClick}
            sort={this.sort}
            sortBy={sortColumnName}
            sortDirection={sortDir === 'desc' ? Table.SORT_DESC : Table.SORT_ASC}
            noRowsRenderer={this.renderNoItems}
          />
        </div>
      );
    }

    return null;
  }

  render() {
    const {
      isSearchPending,
      searchError,
      searchResult,
      renderHeader,
      renderFooter,
    } = this.props;

    return (
      <div className={styles.common}>
        {renderHeader({ isSearchPending, searchError, searchResult })}
        {this.renderTable()}
        {renderFooter({ isSearchPending, searchError, searchResult })}
      </div>
    );
  }
}

SearchResultTable.propTypes = propTypes;
SearchResultTable.defaultProps = defaultProps;
SearchResultTable.contextTypes = contextTypes;
