import axios from 'axios';

import { GET_PROFILE, PROFILE_LOADING, CLEAR_CURRENT_PROFILE } from './types';

// Get current profile
export const getCurrentProfile = () => dispatch => {
  //setprofileloading to set the profile to be loading before the actual request
  dispatch(setProfileLoading());
  //get current user profile
  axios
    .get('/api/profile')
    .then(res =>
      dispatch({
        type: GET_PROFILE,
        payload: res.data
      })
    )
    //If there isn't a profile, just return an empty profile and a button to create one, instead of errors
    .catch(err =>
      dispatch({
        type: GET_PROFILE,
        payload: {}
      })
    );
};

//Clear Profile
export const clearCurrentProfile = () => {
  return {
    type: CLEAR_CURRENT_PROFILE
  };
};

//Profile loading - just lets reducer know this is loading
export const setProfileLoading = () => {
  return {
    type: PROFILE_LOADING
  };
};
