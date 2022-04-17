import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import {login} from '../utils/auth.js';

export default {
  Query: {
    login: async (parent, args, {req}) => {
      req.body = args;
      return await login(req);
    },
  },

  Mutation: {
    registerUser: async (parent, args) => {
      const insertableUser = {
        ...args,
        password: await bcrypt.hash(args.password, 12),
      };

      const checkDuplicate = await User.find({username: args.username});
      if (checkDuplicate.length === 0) {
        return await User.create(insertableUser);
      }
      throw new Error("Error registering")
    },
  },

  Group: {
    admin: async (parent, args) => {
      return User.findById(parent.admin);
    },
    members: async (parent, args) => {
      return User.find({_id: {$in: parent.members}});
    },
  },

  Link: {
    user: async (parent, args) => {
      return User.findById({_id: parent.user});
    },
  },

};