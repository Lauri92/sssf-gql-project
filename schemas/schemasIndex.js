import {gql} from 'apollo-server-express';
import userSchema from './userSchema.js';
import infoLinkSchema from './infoLinkSchema.js';

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
  infoLinkSchema,
];