import {gql} from 'apollo-server-express';

export default gql`

  extend type Query {
    getGroup(id: ID!): Group
    getGroupsByUserId: [Group]
  }
  
  extend type Mutation {
    addGroup(
      members: [UserInput]
      links: [LinkInput]
      name: String!
      description: String!
    ): Group
    
    addUserToGroup(
      groupId: ID!
      userId: ID!
    ): Group
    
    updateGroup(
      groupId: ID!
      name: String!
      description: String!
    ): Group
    
    deleteGroup(
      groupId: ID!
    ): String
    
  }
  
  type Group {
    id: ID
    admin: User
    members: [User]
    links: [Link]
    name: String
    description: String
  }
`;