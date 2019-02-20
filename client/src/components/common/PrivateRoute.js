import React from 'react';
import { Route, Redirect } from 'react-router-dom';
//for redux, in case we need to see if user is authenticated or now
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
const PrivateRoute = ({ component: Component, auth, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      //if we are logged in
      auth.isAuthenticated === true ? (
        //load the component if we are
        <Component {...props} />
      ) : (
        //otherwise redirect to login
        <Redirect to="/login" />
      )
    }
  />
);
PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(PrivateRoute);
