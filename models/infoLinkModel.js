'use strict';

import mongoose from 'mongoose';
import User from './userModel.js';
import Group from './groupModel.js'

const Schema = mongoose.Schema;

const infoLinkSchema = new Schema({
  group: {type: Schema.Types.ObjectId, ref: Group},
  userId: {type: Schema.Types.ObjectId, ref: User},
  url: {type: String, required: true},
}, {
  timestamps: true,
});

export default mongoose.model('Link', infoLinkSchema);