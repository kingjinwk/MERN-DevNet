//bring in types
import { TEST_DISPATCH } from '../actions/types';

const initialState = {
  isAuthenticated: false,
  user: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case TEST_DISPATCH:
      return {
        //We want to take the initialState and add it into the spread operator
        ...state,
        //fills user with the payoad, which is the userData from actions.
        user: action.payload
      };
    default:
      return state;
  }
}
