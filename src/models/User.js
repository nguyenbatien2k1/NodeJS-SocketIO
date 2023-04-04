import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const User = new Schema({
  username: {type: String, default: '', maxLength: 255},
  password: String,
}, {
    timestamps: true
});

export default mongoose.model('User', User);