import { connect } from 'react-redux';
import withConfig from '../../enhancers/withConfig';
import RecordPage, { getParams } from '../../components/pages/RecordPage';

import {
  readRecord,
} from '../../actions/record';

import {
  setRecordPagePrimaryCsid,
} from '../../actions/recordPage';

import {
  getRecordData,
  getRecordError,
  getUserPerms,
} from '../../reducers';

const mapStateToProps = (state, ownProps) => {
  const {
    csid,
  } = getParams(ownProps);

  return {
    data: getRecordData(state, csid),
    error: getRecordError(state, csid),
    perms: getUserPerms(state),
  };
};

const mapDispatchToProps = {
  readRecord,
  setRecordPagePrimaryCsid,
};

export const ConnectedRecordPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(RecordPage);

export default withConfig(ConnectedRecordPage);
