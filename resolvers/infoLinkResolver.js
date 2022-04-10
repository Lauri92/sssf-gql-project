import infoLink from '../models/infoLinkModel.js';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';

export default {
  Mutation: {
    addInfoLink: async (parent, args) => {
      return await infoLink.create(args);
    },
  },
};