'use strict';
import Group from '../models/groupModel.js';
import Link from '../models/infoLinkModel.js';
import User from '../models/userModel.js';
import {AuthenticationError, UserInputError} from 'apollo-server-express';

export default {

  Query: {
    getGroup: async (parent, args) => {
      return Group.findById(args.id);
    },
  },

  Mutation: {
    addGroup: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You are not allowed to create groups!');
      }
      return await Group.create(args);
    },
    addUserToGroup: async (parent, args) => {
      const chosenGroup = await Group.findById(args.groupId);

      if (!chosenGroup.members.includes(args.userId)) {
        return Group.findOneAndUpdate(
            {_id: args.groupId},
            {$push: {members: args.userId}}, {new: true},
        );
      }
      throw new UserInputError('User already exists in the group');
    },
  },
};