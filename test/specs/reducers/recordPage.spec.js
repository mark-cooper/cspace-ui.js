import Immutable from 'immutable';
import chaiImmutable from 'chai-immutable';

import {
  SET_RECORD_PAGE_PRIMARY_CSID,
} from '../../../src/actions/recordPage';

import reducer, {
  getPrimaryCsid,
} from '../../../src/reducers/recordPage';

chai.use(chaiImmutable);
chai.should();

describe('record page reducer', function suite() {
  it('should have an empty immutable initial state', function test() {
    reducer(undefined, {}).should.equal(Immutable.Map());
  });

  it('should handle SET_RECORD_PAGE_PRIMARY_CSID', function test() {
    const csid = '1234';

    const state = reducer(Immutable.Map(), {
      type: SET_RECORD_PAGE_PRIMARY_CSID,
      payload: csid,
    });

    state.should.deep.equal(Immutable.fromJS({
      primaryCsid: csid,
    }));

    getPrimaryCsid(state).should.equal(csid);
  });
});
