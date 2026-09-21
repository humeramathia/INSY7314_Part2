const express = require("express");
const { listGigs } = require("../controllers/gigController");

const router = express.Router();

router.get("/", listGigs);

module.exports = router;
