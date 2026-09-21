const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(plain, stored) {
  return bcrypt.compare(plain, stored);
}

module.exports = {
  hashPassword,
  comparePassword,
};
