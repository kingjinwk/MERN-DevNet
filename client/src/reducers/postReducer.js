import { ADD_POST, GET_POSTS, POST_LOADING } from '../actions/types';

const initialState = {
  posts: [],
  post: {},
  loading: false
};

export default function(state = initialState, action) {
  switch (action.type) {
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
