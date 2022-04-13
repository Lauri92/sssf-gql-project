import {gql} from 'apollo-server-express';

export default gql`

extend type Mutation {
    addInfoLink(
    url: String!
    userId: ID!
    group: ID!
    ): Link
  }

type Link {
    id: ID
    userId: ID
    url: String
    group: ID
  }
  
input LinkInput {
    id: ID
    userId: ID
    url: String
  }
`;