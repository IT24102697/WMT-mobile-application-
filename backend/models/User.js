const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:           { type: String, required: true, unique: true },
  password:           { type: String, required: true },
  email:              { type: String, required: true, unique: true },
  name:               { type: String, required: true },
  mobile:             { type: String },
  role:               { type: String, enum: ['CUSTOMER','STAFF','ADMIN'], required: true },
  verified:           { type: Boolean, default: false },
  enabled:            { type: Boolean, default: true },

  // Customer specific
  trustScore:         { type: Number, default: 10 },
  address:            { type: String },

  // Staff specific
  jobRole:            { type: String },
  department:         { type: String },
  approved:           { type: Boolean, default: false },

  // Tokens
  passwordResetToken:   { type: String },
  passwordResetExpires: { type: Date },
  verificationToken:    { type: String },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);