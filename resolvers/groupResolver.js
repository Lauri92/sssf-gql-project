'use strict';
import Group from '../models/groupModel.js';
import Link from '../models/infoLinkModel.js';
import User from '../models/userModel.js';
import {AuthenticationError, UserInputError} from 'apollo-server-express';

export default {

  Query: {
    getGroup: async (parent, args, context) => {

      if (!context.user) {
        throw new AuthenticationError('You are not authorized');
      }

      const requestedGroup = await Group.findById(args.id);
      const requestedGroupAdmin = requestedGroup.admin.toString();
      const requestedGroupMembers = requestedGroup.members.map(member => {
        return member.toString();
      });

      if (requestedGroupAdmin === context.user.id ||
          requestedGroupMembers.includes(context.user.id)) {
        return requestedGroup;
      }
      throw new AuthenticationError('You are not part of this group!');
    },
    getGroupsByUserId: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You are not authorized');
      }
      return Group.find(
          {
            $or: [
              {admin: context.user.id},
              {
                members: {$in: context.user.id},
              }],
          });
    },
  },

  Mutation: {
    addGroup: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You are not allowed to create groups!');
      }
      return await Group.create({
        admin: context.user.id,
        name: args.name,
        description: args.description,
      });
    },
    addUserToGroup: async (parent, args, context) => {

      if (!context.user) {
        throw new AuthenticationError(
            'You are not allowed to add users to groups!');
      }

      const chosenGroup = await Group.findById(args.groupId);

      if (chosenGroup.admin.toString() === context.user.id) {
        if (!chosenGroup.members.includes(args.userId)) {
          return Group.findOneAndUpdate(
              {_id: args.groupId},
              {$push: {members: args.userId}}, {new: true},
          );
        }
        throw new UserInputError('User already exists in the group');
      } else {
        throw new AuthenticationError('Only Admin can add users');
      }
    },
  },
};