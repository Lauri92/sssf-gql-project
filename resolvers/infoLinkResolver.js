import InfoLink from '../models/infoLinkModel.js';
import User from '../models/userModel.js';

export default {
  Mutation: {
    addInfoLink: async (parent, args) => {
      return await InfoLink.create(args);
    },
  },
};