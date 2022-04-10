import {gql} from 'apollo-server-express';

export default gql`
  
  extend type Mutation {
    addGroup(
      adminId: ID
      members: [UserInput]
      links: [LinkInput]
      name: String
      description: String
    ): Group
  }
  
  type Group {
    id: ID
    adminId: ID
    members: [User]
    links: [Link]
    name: String
    description: String
  }
  
  
  
`;