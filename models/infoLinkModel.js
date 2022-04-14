'use strict';

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const infoLinkSchema = new Schema({
  group: {type: Schema.Types.ObjectId, ref: 'Group', required: true},
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  url: {type: String, required: true},
}, {
  timestamps: true,
});

export default mongoose.model('Link', infoLinkSchema);