import { gql } from 'apollo-server';
import { ApolloServer } from 'apollo-server-lambda';
import {
  ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core";
import users from '../users';

const typeDefs = gql`
  type User {
    email: String!
    name: String!
    website: String!
    address: String!
    phoneNumber: String!
    incorporationDate: String!
  }

  type SignInTokens {
    idToken: String!
    refreshToken: String!
  }

  input UserSignUpInput {
    email: String!
    name: String!
    website: String!
    address: String!
    phoneNumber: String!
    incorporationDate: String!
    password: String!
  }

  input UserSignInInput {
    email: String!
    password: String!
  }

  input RefreshInput {    
    refreshToken: String!
  }

  type Mutation {
    signup(userInput: UserSignUpInput!): String
    signin(userInput: UserSignInInput!): SignInTokens!
    refreshToken(userInput: RefreshInput!): String!
  }
  type Query {
    hello: String!
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello World!"
  },
  Mutation: {
    signup: async (_, { userInput }) => {
      const ok = await users.createUser(userInput);
      return ok
    },
    signin: async (_, { userInput }) => {
      const { email, password } = userInput;
      const userToken = await users.signIn(email, password);
      return userToken;
    },
    refreshToken: async (_, { userInput }) => {
      const { refreshToken } = userInput;
      const idToken = await users.refreshToken(refreshToken);
      return idToken;
    }
  }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs, resolvers, plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground(),
  ]
});

export const handler = server.createHandler();