import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PostItem from './PostItem';

class PostFeed extends Component {
  render() {
    //destructure post out of props
    const { posts } = this.props;
    //map through the post and index them
    return posts.map(post => <PostItem key={post._id} post={post} />);
  }
}

PostFeed.propTypes = {
  posts: PropTypes.array.isRequired
};

export default PostFeed;
