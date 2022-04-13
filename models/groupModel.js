'use strict';

import mongoose from 'mongoose';
import infoLink from './infoLinkModel.js';
import user from './userModel.js';

const Schema = mongoose.Schema;

const groupSchema = new Schema({
  admin: {type: Schema.Types.ObjectId, required: true, ref: user},
  members: [{type: Schema.Types.ObjectId, 'default': [], ref: user}],
  links: [{type: Schema.Types.ObjectId, 'default': [], ref: infoLink}],
  name: {type: String, required: true},
  description: {type: String, required: true},
});

export default mongoose.model('Group', groupSchema);