import React from 'react';
import configureMockStore from 'redux-mock-store';
import { createRenderer } from 'react-test-renderer/shallow';
import Immutable from 'immutable';
import chaiImmutable from 'chai-immutable';
import HierarchyInput from '../../../../src/components/record/HierarchyInput';
import HierarchyInputContainer from '../../../../src/containers/record/HierarchyInputContainer';

chai.use(chaiImmutable);
chai.should();

const mockStore = configureMockStore();

describe('HierarchyInputContainer', function suite() {
  it('should set props on HierarchyInput', function test() {
    const csid = '1234';

    const store = mockStore({
      record: Immutable.fromJS({
        [csid]: {
          data: {
            baseline: {
              foo: 'bar',
            },
            current: {
              foo: 'baz',
            },
          },
        },
      }),
    });

    const context = { store };

    const shallowRenderer = createRenderer();

    shallowRenderer.render(
      <HierarchyInputContainer
        csid={csid}
      />, context);

    const result = shallowRenderer.getRenderOutput();

    result.type.should.equal(HierarchyInput);

    result.props.should.have.property('isRecordModified', true);
  });
});
