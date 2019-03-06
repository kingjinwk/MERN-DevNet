import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// import classnames from 'classnames';
import { Link } from 'react-router-dom';

class PostItem extends Component {
  onDeleteClick(id) {
    console.log(id);
  }

  render() {
    //pull post and auth out of props
    const { post, auth } = this.props;

    return (
      <div className="card card-body mb-3">
        <div className="row">
          <div className="col-md-2">
            <a href="profile.html">
              <img
                className="rounded-circle d-none d-md-block"
                // Changed this post {post.avatar} for dyanmic user profile picture grabbing
                src={post.avatar}
                alt=""
              />
            </a>
            <br />
            {/* So the name shows dynamically */}
            <p className="text-center">{post.name}</p>
          </div>
          <div className="col-md-10">
            <p className="lead">
              {/* For dynamic text grabbing */}
              {post.text}
            </p>
            <button type="button" className="btn btn-light mr-1">
              <i className="text-info fas fa-thumbs-up" />
              {/* For number of likes */}
              <span className="badge badge-light">{post.likes.length}</span>
            </button>
            <button type="button" className="btn btn-light mr-1">
              <i className="text-secondary fas fa-thumbs-down" />
            </button>
            {/* This allows us to get post by id, but we need to create a route */}
            <Link to={`/post/${post._id}`} className="btn btn-info mr-1">
              Comments
            </Link>
            {/* This is so the authorized user can delete the post */}
            {post.user === auth.user.id ? (
              <button
                //   We need to create the onDeleteClick function
                onClick={this.onDeleteClick.bind(this, post._id)}
                type="button"
                className="btn btn-danger mr-1"
              >
                <i className="fas fa-times" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

PostItem.propTypes = {
  post: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(PostItem);
