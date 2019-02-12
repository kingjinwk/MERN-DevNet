//import axios to prevent us to manually make sure we have the token
import axios from 'axios';

const setAuthToken = token => {
  if (token) {
    //Apply token to every request
    axios.defaults.header.common['Authorization'] = token;
  } else {
    //Delete Auth header if token is not there
    delete axios.defaults.headers.common['Authorization'];
  }
};

export default setAuthToken;
