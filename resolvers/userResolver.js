import bcrypt from 'bcrypt';
import User from '../models/userModel.js';

export default {
  Mutation: {
    registerUser: async (parent, args) => {
      const insertableUser = {
        ...args,
        password: await bcrypt.hash(args.password, 12),
      };
      return await User.create(insertableUser);
    },
  },
};