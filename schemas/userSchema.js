import {gql} from 'apollo-server-express';

export default gql(`

  extend type Query {
    login(username: String!, password: String!): User
    getActiveUser: User
    searchUsers(searchInput: String!): [User]
  }

  extend type Mutation {
    registerUser(
    username: String!,
    password: String!,
    nickname: String
    ): User
  }
  
  type User {
    id: ID
    username: String
    nickname: String
    token : String
    profileImageUrl: String
  }
  
  input UserInput {
    id: ID
    username: String
    nickname: String
  }
  
`);