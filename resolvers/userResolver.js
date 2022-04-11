import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import {login} from '../utils/auth.js';

export default {
  Query: {
    login: async (parent, args, {req}) => {
      console.log('Do something in login');
      req.body = args
      return await login(req);
    },
  },

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