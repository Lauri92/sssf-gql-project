'use strict';

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const groupImageSchema = new Schema({
  group: {type: Schema.Types.ObjectId, ref: 'Group', required: true},
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  urlStorageReference: {type: String, required: true},
  title: {type: String, required: false},
}, {
  timestamps: true,
});

export default mongoose.model('GroupImage', groupImageSchema);