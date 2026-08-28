// TODO: Person 2 - replace with bcrypt hashing
async function hashPassword(password) {
  return password;
}

// TODO: Person 2 - replace with bcrypt compare
async function comparePassword(plain, stored) {
  return plain === stored;
}

module.exports = {
  hashPassword,
  comparePassword,
};
