import {Config, CognitoIdentityCredentials} from "aws-sdk";
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails
} from "amazon-cognito-identity-js";
import React from "react";
import ReactDOM from "react-dom";
import appConfig from "./config";

Config.region = appConfig.region;
Config.credentials = new CognitoIdentityCredentials({
  IdentityPoolId: appConfig.IdentityPoolId
});

const userPool = new CognitoUserPool({
  UserPoolId: appConfig.UserPoolId,
  ClientId: appConfig.ClientId,
});

class SignUpForm extends React.Component {
  constructor(props) {
    
   
    super(props);
    this.state = {
      email: '',
      password: '',
      operationType:''
    };
  }

  handleEmailChange(e) {
    this.setState({email: e.target.value});
  }

  handlePasswordChange(e) {
    this.setState({password: e.target.value});
  }

  handleOperationChange(e) {
    this.setState({operationType: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();
    const email = this.state.email.trim();
    const password = this.state.password.trim();
    const operation = this.state.operationType.trim();

    if(operation === 'register')
    {

      //LOGIC to register a user
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email,
        })
      ];
      userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
          console.log(err);
          alert(err);
          return;
        }
        console.log('user name is ' + result.user.getUsername());
        console.log('Registration result: ' + JSON.stringify(result));
        alert(JSON.stringify(result));
      });

    }
    else if(operation === 'login')
    {
       
      //LOGIC to authenticate a user

       var userData = {
        Username : email,
        Pool : userPool
        };

        var authenticationData = {
            Username : email,
            Password : password,
        };

        var authenticationDetails = new AuthenticationDetails(authenticationData);
        var cognitoUser = new CognitoUser(userData);



        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
              

                //ID token is need to get User Profile Details, so we set it into AWS client side credentials store
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId : '...', // your identity pool id here
                Logins : {
                    // Change the key below according to the specific region your user pool is in.
                    'cognito-idp.us-east-1.amazonaws.com/us-east-1_TLbfiXGV6' : result.getIdToken().getJwtToken()
                }
                });


                //Now we make a call to get the user profile
                cognitoUser.getUserAttributes(function(err, result) {
                    if (err) {
                        alert(err);
                        return;
                    }
                    for (var i = 0; i < result.length; i++) {
                        console.log('attribute ' + result[i].getName() + ' has value ' + result[i].getValue());
                    }
                });


                console.log('Access token: ' + result.getAccessToken().getJwtToken());
                console.log('Id token: ' + result.getIdToken().getJwtToken());
                console.log('Refresh token: ' + result.getRefreshToken().getToken());

               
                //alert(JSON.stringify(result));

            },

            onFailure: function(err) {
                alert(err);
            },

        });
    }

  }

  render() {

    return (
      <div>
      <form onSubmit={this.handleSubmit.bind(this)}>
        <input type="radio" name="operationType" value="register" onClick={this.handleOperationChange.bind(this)}/> Register
        <input type="radio" name="operationType" value="login" onClick={this.handleOperationChange.bind(this)}/> Login
        <br></br>
        <input type="text"
               value={this.state.email}
               placeholder="Email"
               onChange={this.handleEmailChange.bind(this)}/>
        <input type="password"
               value={this.state.password}
               placeholder="Password"
               onChange={this.handlePasswordChange.bind(this)}/>
        <input type="submit"/>
      </form>
      </div>
    );
  }
}

ReactDOM.render(<SignUpForm />, document.getElementById('app'));


