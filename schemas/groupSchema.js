import {gql} from 'apollo-server-express';

export default gql`

  extend type Query {
    getGroup(id: ID!): Group
  }
  
  extend type Mutation {
    addGroup(
      adminId: ID!
      members: [UserInput]
      links: [LinkInput]
      name: String!
      description: String!
    ): Group
    
    addUserToGroup(
      groupId: ID!
      userId: ID!
    ): Group
  }
  
  type Group {
    id: ID
    admin: User
    members: [User]
    links: [Link]
    name: String
    description: String
  }
  
   type GroupInput {
    id: ID
    adminId: ID
    members: [User]
    links: [Link]
    name: String
    description: String
  }
`;