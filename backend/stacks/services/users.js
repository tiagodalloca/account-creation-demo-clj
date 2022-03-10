import * as sst from "@serverless-stack/resources";

export default class UsersStack extends sst.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);

        // Create auth provider
        const auth = new sst.Auth(this, "Auth", {
            // Create a Cognito User Pool to manage user's authentication info.
            cognito: {
                userPool: {
                    // Users will login using their email and password
                    signInAliases: { email: true },
                },
            },
        });

        this.addOutputs({
            UserPoolId: auth.cognitoUserPool.userPoolId,
            IdentityPoolId: auth.cognitoCfnIdentityPool.ref,
            UserPoolClientId: auth.cognitoUserPoolClient.userPoolClientId,
        });

    }
}
