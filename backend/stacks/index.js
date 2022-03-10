import GraphQLStack from "./services/graphql";
import MyStack from "./MyStack";

export default function main(app) {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x"
  });

  new GraphQLStack(app, "graphql-stack");

  // Add more stacks
}
