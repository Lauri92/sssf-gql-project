'use strict';

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const groupSchema = new Schema({
  admin: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
  members: [
    {
      type: Schema.Types.ObjectId,
      'default': [],
      ref: 'User',
    }],
  links: [
    {
      type: Schema.Types.ObjectId,
      'default': [],
      ref: 'Link',
    }],
  groupImages: [
    {
      type: Schema.Types.ObjectId,
      'default': [],
      ref: 'GroupImage',
    }],
  name: {type: String, required: true},
  description: {type: String, required: true},
  groupAvatarUrl: {type: String, required: false},
});

export default mongoose.model('Group', groupSchema);