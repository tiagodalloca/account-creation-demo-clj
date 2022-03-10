import * as sst from "@serverless-stack/resources";

export default class GraphQL extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create a HTTP API
    const graphQLApi = new sst.Api(this, "GraphQLApi", {
      routes: {
        "ANY /graphql": "src/graphql/service.handler",
      },
    });

    // Show the endpoint in the output
    this.addOutputs({
      "graphQLApi": graphQLApi.url,
    });
  }
}
