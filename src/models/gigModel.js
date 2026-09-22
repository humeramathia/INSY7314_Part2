const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const DATA_PATH = path.join(__dirname, "..", "data", "gigs.json");

async function readGigs() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") {
      await writeGigs([]);
      return [];
    }
    throw err;
  }
}

async function writeGigs(gigs) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(gigs, null, 2), "utf8");
}

async function findAll() {
  return readGigs();
}

async function findById(id) {
  const gigs = await readGigs();
  return gigs.find((gig) => gig.id === id) || null;
}

async function findByFreelancerId(freelancerId) {
  const gigs = await readGigs();
  return gigs.filter((gig) => gig.freelancerId === freelancerId);
}

async function createGig({ title, description, category, price, freelancerId }) {
  const gigs = await readGigs();
  const now = new Date().toISOString();
  const gig = {
    id: randomUUID(),
    title,
    description,
    category,
    price,
    freelancerId,
    createdAt: now,
    updatedAt: now,
  };

  gigs.push(gig);
  await writeGigs(gigs);
  return gig;
}

async function updateGig(id, fields) {
  const gigs = await readGigs();
  const index = gigs.findIndex((gig) => gig.id === id);

  if (index === -1) {
    return null;
  }

  const current = gigs[index];
  gigs[index] = {
    ...current,
    ...fields,
    id: current.id,
    freelancerId: current.freelancerId,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };

  await writeGigs(gigs);
  return gigs[index];
}

async function deleteGig(id) {
  const gigs = await readGigs();
  const nextGigs = gigs.filter((gig) => gig.id !== id);

  if (nextGigs.length === gigs.length) {
    return false;
  }

  await writeGigs(nextGigs);
  return true;
}

module.exports = {
  findAll,
  findById,
  findByFreelancerId,
  createGig,
  updateGig,
  deleteGig,
};
