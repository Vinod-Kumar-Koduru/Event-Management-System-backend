const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");

// ✅ Create new profile
router.post("/", async (req, res) => {
  try {
    const { name, timezone } = req.body;
    if (!name || !timezone) {
      return res.status(400).json({ error: "Name and timezone are required" });
    }

    const profile = await Profile.create({ name, timezone });
    res.status(201).json(profile);
  } catch (err) {
    console.error("Profile creation failed:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get all profiles
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
});

module.exports = router;
