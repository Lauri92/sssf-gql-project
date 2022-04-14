import {gql} from 'apollo-server-express';

export default gql`

extend type Mutation {
    addInfoLink(
    url: String!
    group: ID!
    ): Link
  }

type Link {
    id: ID
    user: User
    url: String
    group: ID
  }
  
input LinkInput {
    id: ID
    user: ID
    url: String
  }
`;