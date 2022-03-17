import AWS from 'aws-sdk';
import { v5 as uuidv5 } from 'uuid';
import crypto from 'crypto';

export const UUID_NAMESPACE = '4342b0d5-045f-4461-b560-6fa9d4c51a0a';

class Users {
  constructor(region, userPoolId, clientId) {
    this.cognito = new AWS.CognitoIdentityServiceProvider({ region: region });
    this.userPoolId = userPoolId;
    this.cliendId = clientId;
  }

  uuid(s) {
    return uuidv5(s, UUID_NAMESPACE);
  }

  async getUser(email) {
    const params = {
      UserPoolId: this.userPoolId,
      Filter: `email ^= "${email}"`,
      Limit: 1,
    }

    console.log("params:", JSON.stringify(params))

    const response = await this.cognito.listUsers(params).promise();

    console.log("$response:", JSON.stringify(response.$response.data));

    if (response.$response.error)
      throw response.$response.error;
    if (!response.Users || !response.Users[0]) return undefined;
    const user = response.Users[0]

    console.log("user:", JSON.stringify(user));

    const o = {};
    user.Attributes.forEach(({ Name, Value }) => {
      switch (Name) {
        case "email":
        case "username":
        case "address":
        case "name":
        case "website":
          o[Name] = Value;
          break;
        case "phone_number":
          o["phoneNumber"] = Value;
          break;
        case "custom:incorporationDate":
          o["incorporationDate"] = Value
          break;
      }
    });
    console.log("o:", JSON.stringify(o));
    return o;
  }

  async createUser(user) {
    const attributes = ["email", ["phoneNumber", "phone_number"], "address", "name", "website"].map(k => {
      let Name;
      let Value;
      if (Array.isArray(k)) {
        Name = k[1];
        Value = user[k[0]];
      }
      else {
        Name = k;
        Value = user[k];
      }
      return { Name, Value }
    });
    const customAttributes = ["incorporationDate"].map(k => ({ Name: `custom:${k}`, Value: user[k] }));

    var params = {
      ClientId: this.cliendId,
      Username: user.email,
      Password: user.password,
      UserAttributes: attributes.concat(customAttributes)
    };

    console.log("params:", JSON.stringify(params))

    const createUserResponse = await this.cognito.signUp(params).promise();
    if (createUserResponse.error) {
      throw createUserResponse.error;
    }

    const confirmUserResponse = await this.cognito.adminConfirmSignUp({
      UserPoolId: this.userPoolId,
      Username: user.email
    }).promise();

    if (confirmUserResponse.error) {
      throw confirmUserResponse;
    }

    return "Ok";
  }

  async signIn(email, password) {
    const username = email;
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.cliendId, /* required */
      AuthParameters: {
        'USERNAME': username,
        'PASSWORD': password
      }
    };

    const { AuthenticationResult } = await this.cognito.initiateAuth(params).promise();

    if (!AuthenticationResult.IdToken || !AuthenticationResult.RefreshToken)
      throw new Error("Couldn't sign in");

    return {
      username,
      idToken: AuthenticationResult.IdToken,
      refreshToken: AuthenticationResult.RefreshToken
    }
  }

  async refreshToken(refreshToken) {
    const params = {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: this.cliendId, /* required */
      AuthParameters: {
        'REFRESH_TOKEN': refreshToken
      }
    };

    const { AuthenticationResult } = await this.cognito.initiateAuth(params).promise();

    if (!AuthenticationResult.IdToken)
      throw new Error("Couldn't auth");

    return AuthenticationResult.IdToken
  }
}

export default new Users(
  process.env.region,
  process.env.COGNITO_USER_POOL_ID,
  process.env.COGNITO_USER_POOL_CLIENT_ID
);