'use strict';
import Group from '../models/groupModel.js';
import Link from '../models/infoLinkModel.js';
import User from '../models/userModel.js';

export default {

  Query: {
    getGroup: async (parent, args) => {
      console.log(args);
      return Group.findById(args.id);
    },
  },

  Mutation: {
    addGroup: async (parent, args) => {
      return await Group.create(args);
    },
  },
};