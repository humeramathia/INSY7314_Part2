const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const DATA_PATH = path.join(__dirname, "..", "data", "users.json");

async function readUsers() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") {
      await writeUsers([]);
      return [];
    }
    throw err;
  }
}

async function writeUsers(users) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(users, null, 2), "utf8");
}

async function findByEmail(email) {
  const users = await readUsers();
  const normalised = String(email).toLowerCase();
  return users.find((user) => user.email === normalised) || null;
}

async function findById(id) {
  const users = await readUsers();
  return users.find((user) => user.id === id) || null;
}

async function emailExists(email) {
  const user = await findByEmail(email);
  return Boolean(user);
}

async function createUser({ name, email, password, role }) {
  const users = await readUsers();
  const user = {
    id: randomUUID(),
    name,
    email: String(email).toLowerCase(),
    password,
    role,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);
  return user;
}

module.exports = {
  findByEmail,
  findById,
  emailExists,
  createUser,
};
