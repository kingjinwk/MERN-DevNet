//to catch the SET_CURRENT_USER state
import { SET_CURRENT_USER } from '../actions/types';
//import is-empty to use it
import isEmpty from '../validation/is-empty';

const initialState = {
  isAuthenticated: false,
  user: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    //case for setting user
    case SET_CURRENT_USER:
      return {
        //current state
        ...state,
        //isauthenticated: check to see if decoded user is not empty
        isAuthenticated: !isEmpty(action.payload),
        //the action payload
        user: action.payload
      };
    default:
      return state;
  }
}
