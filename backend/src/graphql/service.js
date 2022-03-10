import { gql } from 'apollo-server';
import { ApolloServer } from 'apollo-server-lambda';
import {
  ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core";

const typeDefs = gql`
  input UserSignUpInput {
    email: String!
    name: String!
    website: String!
    address: String!
    phoneNumber: String!
    incorporationDate: String!
    password: String!
  }

  type User {
    email: String!
    name: String!
    website: String!
    address: String!
    phoneNumber: String!
    incorporationDate: String!
  }

  type UserToken {
    userId: String!
    authToken: String!
  }

  type Query {
    user(userId: String!): User
  }

  type Mutation {
    signup(userInput: UserSignUpInput!): UserToken!
  }
`;

function guidGenerator() {
  var S4 = function() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

const users = { };

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {    
    user: (userId) => users[userId]
  },
  Mutation: {
    signup: (parent, { userInput }, last) => {
      const userId = guidGenerator();
      console.debug("userInput:", userInput);
      console.debug("parent:", parent);
      console.debug("last:", last);
      userInput["password"] = undefined;
      users[userId] = userInput;
      return { userId, authToken: "666" };
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