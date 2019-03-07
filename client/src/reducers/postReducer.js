import {
  GET_POST,
  ADD_POST,
  GET_POSTS,
  POST_LOADING,
  DELETE_POST
} from '../actions/types';

const initialState = {
  posts: [],
  post: {},
  loading: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_POST:
      return {
        ...state,
        post: action.payload,
        loading: false
      };
    //case for deleting post
    case DELETE_POST:
      return {
        ...state,
        posts: state.posts.filter(post => post._id !== action.payload)
      };
    //add a case for POST_LOADING
    case POST_LOADING:
      return {
        ...state,
        loading: true
      };
    //once we get the post
    case GET_POSTS:
      return {
        ...state,
        posts: action.payload,
        loading: false
      };
    case ADD_POST:
      return {
        ...state,
        posts: [action.payload, ...state.posts]
      };

    default:
      return state;
  }
}
