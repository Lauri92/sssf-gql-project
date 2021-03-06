import {gql} from 'apollo-server-express';
import userSchema from './userSchema.js';
import infoLinkSchema from './infoLinkSchema.js';
import groupSchema from './groupSchema.js';
import fileSchema from './fileSchema.js';

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
  groupSchema,
  fileSchema,
];