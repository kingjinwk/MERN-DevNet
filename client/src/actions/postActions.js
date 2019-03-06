import axios from 'axios';

import { ADD_POST, GET_ERRORS, GET_POSTS, POST_LOADING } from './types';

//Add Post
export const addPost = postData => dispatch => {
  axios
    .post('/api/posts', postData)
    .then(res =>
      dispatch({
        type: ADD_POST,
        payload: res.data
      })
    )
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.res.data
      })
    );
};

//Get Post
export const getPosts = () => dispatch => {
  dispatch(setPostLoading());
  axios
    .get('/api/posts')
    .then(res =>
      //once post is fetched
      dispatch({
        type: GET_POSTS,
        payload: res.data
      })
    )
    //for errors
    .catch(err =>
      dispatch({
        type: GET_POSTS,
        payload: null
      })
    );
};

// Set loading state for getPost
export const setPostLoading = () => {
  return {
    type: POST_LOADING
  };
};
