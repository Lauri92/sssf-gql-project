import {gql} from 'apollo-server-express';

export default gql(`
  extend type Mutation {
    registerUser(
    username: String!,
    password: String!,
    nickname: String
    ): User
  }
  
  type User {
    id: ID
    username: String,
    nickname: String,
  }
  
  input UserInput {
    id: ID
    username: String
    nickname: String
  }
  
`);