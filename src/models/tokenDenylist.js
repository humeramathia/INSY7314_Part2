const mongoose = require("mongoose");

const tokenDenylistSchema = new mongoose.Schema({
  jti: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

tokenDenylistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TokenDenylist = mongoose.model("TokenDenylist", tokenDenylistSchema);

async function denyToken(jti, expiresAt) {
  if (!jti) return;
  await TokenDenylist.updateOne(
    { jti },
    { $set: { jti, expiresAt } },
    { upsert: true }
  );
}

async function isDenied(jti) {
  if (!jti) return false;
  const row = await TokenDenylist.findOne({ jti });
  return Boolean(row);
}

module.exports = {
  TokenDenylist,
  denyToken,
  isDenied,
};
