import {
  CSPACE_CONFIGURED,
  LOGIN_FULFILLED,
  LOGOUT_FULFILLED,
} from '../actions';

export default (state = {}, action) => {
  switch (action.type) {
    case CSPACE_CONFIGURED:
      return Object.assign({}, state, {
        username: action.payload.username,
      });
    case LOGIN_FULFILLED:
      return Object.assign({}, state, {
        username: action.meta.username,
      });
    case LOGOUT_FULFILLED:
      return Object.assign({}, state, {
        username: null,
      });
    default:
      return state;
  }
};

export function getUsername(state) {
  return state.username;
}
