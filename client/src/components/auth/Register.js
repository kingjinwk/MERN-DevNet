import React, { Component } from 'react';
import classnames from 'classnames';
//Used for connecting redux to this component
import { connect } from 'react-redux';
import { registerUser } from '../../actions/authActions';
import PropTypes from 'prop-types';
//import the router to be able to redirect users
import { withRouter } from 'react-router-dom';
//importing to turn all form-groups into components
import TextFieldGroup from '../common/TextFieldGroup';

class Register extends Component {
  // Register is a component so we need to make a constructor
  constructor() {
    super();
    this.state = {
      name: '',
      email: '',
      password: '',
      password2: '',
      errors: {
        //Will use with Redux later
      }
    };

    //Binds onChange and onSubmit to the states object
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  //Lifecycle method to just see if we are logged in
  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/dashboard');
    }
  }

  //Added to make components receive propsm, LIBRARY FUNCTION
  //tests for certain properties, namely the errors property
  //and if errors is included, add it to the component state
  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({ errors: nextProps.errors });
    }
  }

  onChange(event) {
    //Whenever user sets this off, we set state variables to whatever the user put in
    this.setState({ [event.target.name]: event.target.value });
  }

  //Whenever this gets set off, store whatever the user typed in as a state object and pass it out
  onSubmit(event) {
    event.preventDefault();

    const newUser = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2
    };

    this.props.registerUser(newUser, this.props.history);
  }

  render() {
    //Errors from classname, using deconstruction
    const { errors } = this.state;

    return (
      <div className="register">
        <div className="container">
          <div className="row">
            <div className="col-md-8 m-auto">
              <h1 className="display-4 text-center">Sign Up</h1>
              {/* Added on Submit  */}
              <form noValidate onSubmit={this.onSubmit}>
                <TextFieldGroup
                  placeholder="Name"
                  name="name"
                  type="text"
                  value={this.state.name}
                  onChange={this.onChange}
                  error={errors.name}
                />
                <TextFieldGroup
                  placeholder="Email Address"
                  name="email"
                  type="email"
                  value={this.state.email}
                  onChange={this.onChange}
                  error={errors.email}
                  info="This site uses Gravatar so if you want a profile image, use a Gravatar email"
                />
                <TextFieldGroup
                  placeholder="Password"
                  name="password"
                  type="password"
                  value={this.state.password}
                  onChange={this.onChange}
                  error={errors.password}
                />
                <TextFieldGroup
                  placeholder="Confirm Password"
                  name="password2"
                  type="password"
                  value={this.state.password2}
                  onChange={this.onChange}
                  error={errors.password2}
                />
                <input type="submit" className="btn btn-info btn-block mt-4" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { registerUser }
)(withRouter(Register));
