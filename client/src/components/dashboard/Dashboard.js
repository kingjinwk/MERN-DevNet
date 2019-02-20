import React, { Component } from 'react';
//connect it to redux
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentProfile } from '../../actions/profileActions';
//Import the spinner
import Spinner from '../common/Spinner';
//Importing for create-profile link
import { Link } from 'react-router-dom';

class Dashboard extends Component {
  //ajax request to call this right away
  componentDidMount() {
    this.props.getCurrentProfile();
  }

  render() {
    //To make sure that profile state is not null
    //get the user from the auth.state
    const { user } = this.props.auth;
    const { profile, loading } = this.props.profile;

    let dashboardContent;
    //if profile is null OR loading is true
    if (profile === null || loading) {
      //we're going to add a spinner here while loading
      dashboardContent = <Spinner />;
    } else {
      //check if the logged in user has profile data
      if (Object.keys(profile).length > 0) {
        //something is in this object, they have a profile and we want to display it
        dashboardContent = <h4> TODO: Display Profile </h4>;
      } else {
        //they do not have a profile, so send them to create-a-profile link
        //Make sure to import Link
        dashboardContent = (
          <div>
            <p className="lead text-muted">Welcome {user.name}</p>
            <p>You have not set up a profile, set one up:</p>
            <Link to="/create-profile" className="btn btn-lg btn-info">
              Create Profile
            </Link>
          </div>
        );
      }
    }

    return (
      <div className="dashboard">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h1 className="display-4">Dashboard</h1>
              {dashboardContent}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Dashboard.propTypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  profile: state.profile,
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { getCurrentProfile }
)(Dashboard);
