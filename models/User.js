const mongoose = require("mongoose");
const uuid = require("short-uuid");
const userSchema = mongoose.Schema({
  userId: { type: String, default: () => uuid.generate(), unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["ops", "client"], required: true },
  verifyToken:{type:String,default:''},
  isVerified: { type: Boolean, required: true, default: false },
});

const userDetails = mongoose.model("User", userSchema);

module.exports = userDetails;
