import * as sst from "@serverless-stack/resources";
import * as apitAuthorizers from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
import * as cognito from "aws-cdk-lib/aws-cognito"
import config from './config';

export default class CoreStack extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create auth provider
    this.auth = new sst.Auth(this, "Auth", {
      // Create a Cognito User Pool to manage user's authentication info.
      cognito: {
        userPool: new cognito.UserPool(this, 'account-user-pool', {
          userPoolName: "dev-account-creation-demo-clj-backend-Auth",
          signInAliases: {
            email: true
          },
          selfSignUpEnabled: true,
          standarAttributes: {
            email: {
              required: true,
              mutable: true
            },
            phoneNumber: {
              required: true,
              mutable: true
            },
            address: {
              required: true,
              mutable: true
            },
            fullname: {
              required: true,
              mutable: true
            },
            website: {
              required: true,
              mutable: true
            },
          },
          customAttributes: {
            "incorporationDate": new cognito.DateTimeAttribute({
              mutable: true
            })
          },
        }),
        userPoolClient: {
          authFlows: {
            userPassword: true
          }
        }
      }
    });

    config.cognito = {
      UserPoolId: this.auth.cognitoUserPool.userPoolId,
      IdentityPoolId: this.auth.cognitoCfnIdentityPool.ref,
      UserPoolClientId: this.auth.cognitoUserPoolClient.userPoolClientId,
    }

    this.addOutputs(config.cognito);
    console.log("config:", JSON.stringify(config));

    // Create a HTTP API
    const graphQLApi = new sst.Api(this, "graphql-api", {
      defaultFunctionProps: {
        environment: {
          COGNITO_USER_POOL_ID: config.cognito.UserPoolId,
          COGNITO_IDENTITY_POOL_ID: config.cognito.IdentityPoolId,
          COGNITO_USER_POOL_CLIENT_ID: config.cognito.UserPoolClientId
        },
      },
      cors: {
        allowHeaders: ["Authorization"],
        allowMethods: ["*"],
      },
      defaultAuthorizationType: sst.ApiAuthorizationType.JWT,
      defaultAuthorizer: new apitAuthorizers.HttpUserPoolAuthorizer(
        "Authorizer", this.auth.cognitoUserPool, {
        userPoolClients: [this.auth.cognitoUserPoolClient],
      }),
      routes: {
        "ANY /private/graphql": {
          function: "src/graphql/private.handler"
        },
        "ANY /public/graphql": {
          function: "src/graphql/public.handler",
          authorizationType: sst.ApiAuthorizationType.NONE,
        },
      }
    });

    graphQLApi.attachPermissions("*");

    // Show the endpoint in the output
    this.addOutputs({
      "graphQLApi": graphQLApi.url,
    });
  }
}

