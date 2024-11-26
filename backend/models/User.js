   // backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String }, // This will store the file path
  phoneNumber: { type: String },
  pronouns: { type: String }
});

module.exports = mongoose.model('User', userSchema);