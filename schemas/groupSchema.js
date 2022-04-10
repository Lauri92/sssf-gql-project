import {gql} from 'apollo-server-express';

export default gql`
  
  extend type Mutation {
    addGroup(
      admin: ID
      members: [UserInput]
      links: [LinkInput]
      name: String
      description: String
    ): Group
  }
  
  type Group {
    id: ID
    members: [User]
    links: [Link]
    name: String
    description: String
  }
  
  
  
`;