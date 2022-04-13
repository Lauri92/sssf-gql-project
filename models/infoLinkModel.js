'use strict';

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const infoLinkSchema = new Schema({
  group: {type: Schema.Types.ObjectId, ref: 'Group'},
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  url: {type: String, required: true},
}, {
  timestamps: true,
});

export default mongoose.model('Link', infoLinkSchema);