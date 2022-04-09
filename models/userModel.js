import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {type: String, unique: true},
  password: {type: String, required: true},
  nickname: {type: String, required: false},
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);