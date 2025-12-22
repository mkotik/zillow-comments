const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      required: false,
      default: null,
      index: true,
    },
    userAgent: {
      type: String,
      required: false,
    },
    ip: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

module.exports = RefreshToken;


