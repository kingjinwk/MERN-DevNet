// import axios from 'axios';
import axios from 'axios';
//bring in types
import { GET_ERRORS, SET_CURRENT_USER } from './types';
//import setAuthToken to bring in functionality
import setAuthToken from '../utils/setAuthToken';
//import jwt-decode to decrypt auth token messages to proliferate user profiles
import jwt_decode from 'jwt-decode';

//Register User
export const registerUser = (userData, history) => dispatch => {
  axios
    //backend hits userdata
    .post('/api/users/register', userData)
    //and if it is successful, redirect to login page
    .then(res => history.push('/login'))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//Login - Get User Login Token
export const loginUser = userData => dispatch => {
  //make axios post request to ...
  axios
    .post('/api/users/login', userData)
    .then(res => {
      //Save to local storage
      const token = res.data.token;
      //Set token to local storage (only stores strings, so make sure to convert; but tokens are already strings)
      localStorage.setItem('jwtToken', token);
      // Set token to Auth header in src/utils/setAuthToken.js
      setAuthToken(token);
      //We want to "set" the user and fill the user object with the token info
      //we need jwt_decode module to do this
      const decoded = jwt_decode(token);
      //Set current user
      dispatch(setCurrentUser(decoded));
    })
    //error catcher
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//Set logged in user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};
