const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
      enum: ["client", "freelancer", "admin"],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

async function findByEmail(email) {
  return User.findOne({
    email: String(email).toLowerCase(),
  });
}

async function findById(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  return User.findById(id);
}

async function emailExists(email) {
  const user = await User.exists({
    email: String(email).toLowerCase(),
  });

  return Boolean(user);
}

async function createUser({ name, email, password, role }) {
  return User.create({
    name,
    email: String(email).toLowerCase(),
    password,
    role,
  });
}

module.exports = {
  User,
  findByEmail,
  findById,
  emailExists,
  createUser,
};