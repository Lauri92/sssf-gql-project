import InfoLink from '../models/infoLinkModel.js';
import User from '../models/userModel.js';
import Group from '../models/groupModel.js';

export default {
  Mutation: {
    addInfoLink: async (parent, args) => {
      const link = await InfoLink.create(args);
      await Group.findOneAndUpdate(
          {_id: args.group},
          {$push: {links: link._id}}, {new: true},
      );
      return link;
    },
  },

  Group: {
    links: async (parent, args) => {
      return InfoLink.find(
          {_id: {$in: parent.links}});
    },
  },
};