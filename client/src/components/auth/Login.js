import React, { Component } from 'react';

class Login extends Component {
  //Step 1: Create a constructor
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      errors: {
        //Will use with Redux later
      }
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

  onSubmit(event) {
    event.preventDefault();

    const currUser = {
      email: this.state.email,
      password: this.state.password
    };

    console.log(currUser);
  }

  render() {
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
                    className="form-control form-control-lg"
                    placeholder="Email Address"
                    name="email"
                    //Step 3: link this input to that state value
                    value={this.state.email}
                    onChange={this.onChange}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="Password"
                    name="password"
                    //Step 3: link this input to that state value
                    value={this.state.password}
                    onChange={this.onChange}
                  />
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
export default Login;
