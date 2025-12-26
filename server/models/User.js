const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: false,
    },
    googleSub: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      required: false,
      trim: true,
    },
    picture: {
      type: String,
      required: false,
    },
    profilePictureUrl: {
      type: String,
      required: false,
    },
    profilePictureHidden: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;


