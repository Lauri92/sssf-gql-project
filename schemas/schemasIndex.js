import {gql} from 'apollo-server-express';
import userSchema from './userSchema.js';

const linkSchema = gql`
  type Query {
     _: Boolean
   }
   type Mutation {
     _: Boolean
   }
`;

export default [
  linkSchema,
  userSchema,
];