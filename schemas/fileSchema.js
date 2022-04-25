import {gql} from 'apollo-server-express';

export default gql`

scalar Upload

type Mutation {
    singleUpload(file: Upload!): File!
  }

type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }
`;