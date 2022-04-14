import InfoLink from '../models/infoLinkModel.js';
import User from '../models/userModel.js';
import Group from '../models/groupModel.js';
import {AuthenticationError} from 'apollo-server-express';

export default {
  Mutation: {
    addInfoLink: async (parent, args, context) => {

      if (!context.user) {
        throw new AuthenticationError('You are not authenticated');
      }

      const group = await Group.findById(args.group);
      const groupObj = group.toObject();
      const usersAndAdmin = groupObj.members.map(member => {
        return member.toString();
      });
      usersAndAdmin.push(group.admin.toString());

      if (usersAndAdmin.includes(context.user.id)) {
        const link = await InfoLink.create({
          group: args.group,
          user: context.user.id,
          url: args.url,
        });
        await Group.findOneAndUpdate(
            {_id: args.group},
            {$push: {links: link._id}}, {new: true},
        );
        return link;
      } else {
        throw new AuthenticationError('You are not a part of this group');
      }
    },
  },

  Group: {
    links: async (parent, args) => {
      return InfoLink.find(
          {_id: {$in: parent.links}});
    },
  },
};