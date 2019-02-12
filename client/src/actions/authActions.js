// import axios from 'axios';
import axios from 'axios';
//bring in types
import { GET_ERRORS } from './types';

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
