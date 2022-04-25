import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  nickname: {type: String, required: false},
  profileImageUrl: {type: String, required: false},
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);