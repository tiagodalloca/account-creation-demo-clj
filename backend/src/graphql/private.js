import { gql } from 'apollo-server';
import { ApolloServer } from 'apollo-server-lambda';
import {
  ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core";
import users from '../users';

const typeDefs = gql`
  type User {
    username: String!
    email: String!
    name: String!
    website: String!
    address: String!
    phoneNumber: String!
    incorporationDate: String!
  }

  input UserQueryInput {
    email: String!  
  }

  type Query {
    user(userInput: UserQueryInput): User
  }
`
const resolvers = {
  Query: {
    user: async (_, { userInput }) => await users.getUser(userInput.email)
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs, resolvers, plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground(),
  ]
});

export const handler = server.createHandler();
