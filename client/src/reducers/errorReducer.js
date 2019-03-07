import { GET_ERRORS, CLEAR_ERRORS } from '../actions/types';

const initialState = {
  isAuthenticated: false,
  user: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_ERRORS:
      //the payload includes the errors object from the server in authActions
      return action.payload;
    //just return an empty object to clear the previous object
    case CLEAR_ERRORS:
      return {};
    default:
      return state;
  }
}
