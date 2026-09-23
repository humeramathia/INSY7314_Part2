const mongoose = require("mongoose");

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    freelancerId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Gig = mongoose.model("Gig", gigSchema);

function toPublic(doc) {
  if (!doc) return null;
  const gig = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: gig._id.toString(),
    title: gig.title,
    description: gig.description,
    category: gig.category,
    price: gig.price,
    freelancerId: gig.freelancerId,
    createdAt: gig.createdAt,
    updatedAt: gig.updatedAt,
  };
}

async function findAll() {
  const gigs = await Gig.find().sort({ createdAt: -1 });
  return gigs.map(toPublic);
}

async function findById(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  return toPublic(await Gig.findById(id));
}

async function findByFreelancerId(freelancerId) {
  const gigs = await Gig.find({ freelancerId }).sort({ createdAt: -1 });
  return gigs.map(toPublic);
}

async function createGig({ title, description, category, price, freelancerId }) {
  const gig = await Gig.create({
    title,
    description,
    category,
    price,
    freelancerId,
  });
  return toPublic(gig);
}

async function updateGig(id, fields) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  const gig = await Gig.findByIdAndUpdate(
    id,
    {
      title: fields.title,
      description: fields.description,
      category: fields.category,
      price: fields.price,
    },
    { new: true, runValidators: true }
  );

  return toPublic(gig);
}

async function deleteGig(id) {
  if (!mongoose.isValidObjectId(id)) {
    return false;
  }

  const result = await Gig.findByIdAndDelete(id);
  return Boolean(result);
}

module.exports = {
  Gig,
  findAll,
  findById,
  findByFreelancerId,
  createGig,
  updateGig,
  deleteGig,
};
