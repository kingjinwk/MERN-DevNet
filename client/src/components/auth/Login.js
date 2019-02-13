import React, { Component } from 'react';
import PropTypes from 'prop-types';
//to connect to redux
import { connect } from 'react-redux';
//login user function
import { loginUser } from '../../actions/authActions';
//classnames for validation
import classnames from 'classnames';

class Login extends Component {
  //Step 1: Create a constructor
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      errors: {}
    };

    //Step 2: Add the bindings for these
    //Binds onChange and onSubmit to the states object
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  //Step 5: Create onChange and onSubmit functions
  onChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  //Lifecycle method to just see if we are logged in
  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/dashboard');
    }
  }

  //For Redux prop/component
  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.isAuthenticated) {
      this.props.history.push('/dashboard');
    }

    if (nextProps.errors) {
      //set state
      this.setState({ errors: nextProps.errors });
    }
  }

  onSubmit(event) {
    event.preventDefault();

    const userData = {
      email: this.state.email,
      password: this.state.password
    };

    this.props.loginUser(userData);
  }

  render() {
    //Create errors object
    const { errors } = this.state;

    return (
      <div className="login">
        <div className="container">
          <div className="row">
            <div className="col-md-8 m-auto">
              <h1 className="display-4 text-center">Log In</h1>
              <p className="lead text-center">
                Sign in to your DevConnector account
              </p>
              {/* Step 4: Add onSubmit */}
              <form onSubmit={this.onSubmit}>
                <div className="form-group">
                  <input
                    type="email"
                    // Modfied this part for Redux
                    className={classnames('form-control form-control-lg', {
                      'is-invalid': errors.email
                    })}
                    placeholder="Email Address"
                    name="email"
                    // Step 3: link this input to that state value
                    value={this.state.email}
                    onChange={this.onChange}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    className={classnames('form-control form-control-lg', {
                      'is-invalid': errors.password
                    })}
                    placeholder="Password"
                    name="password"
                    //Step 3: link this input to that state value
                    value={this.state.password}
                    onChange={this.onChange}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>
                <input type="submit" className="btn btn-info btn-block mt-4" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { loginUser }
)(Login);
