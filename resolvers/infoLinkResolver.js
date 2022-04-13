import InfoLink from '../models/infoLinkModel.js';
import User from '../models/userModel.js';
import Group from '../models/groupModel.js';

export default {
  Mutation: {
    addInfoLink: async (parent, args) => {
      //console.log(args);
      const link = await InfoLink.create(args);
      console.log('link._id',link._id);
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