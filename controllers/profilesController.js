const Profile = require("../models/Profile");
const { normalizeTimezone } = require("../utils/tz");
exports.createProfile = async (req, res, next) => {
  try {
    console.log("Received profile creation request:", {
      name: req.body.name,
      timezone: req.body.timezone,
    });
    const { name, timezone } = req.body;

    const trimmedName = name ? name.trim() : "";
    const trimmedTimezone = timezone ? timezone.trim() : "";

    if (!trimmedName) {
      console.error("Profile creation failed: Name is empty");
      return res.status(400).json({
        error: "Validation failed",
        message: "Name is required",
        field: "name",
      });
    }

    if (!trimmedTimezone) {
      console.error("Profile creation failed: Timezone is empty");
      return res.status(400).json({
        error: "Validation failed",
        message: "Timezone is required",
        field: "timezone",
      });
    }

    const canonicalTimezone = normalizeTimezone(trimmedTimezone);

    const profile = await Profile.create({
      name: trimmedName,
      timezone: canonicalTimezone,
    });

    res.status(201).json(profile);
  } catch (err) {
    console.error("error creating profile:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        error: "Duplicate entry",
        message: "Profile with this name already exists",
        field: "name",
      });
    }

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({
        error: "Validation failed",
        message: errors[0]?.message || "Validation failed",
        details: errors,
      });
    }
    next(err);
  }
};

exports.listProfiles = async (req, res, next) => {
  try {
    const profiles = await Profile.find({}).sort({ name: 1 }).lean();
    res.json(profiles);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    if (payload.name) payload.name = payload.name.trim();
    if (payload.timezone) payload.timezone = payload.timezone.trim();

    payload.updatedAtUTC = new Date();

    const profile = await Profile.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!profile) {
      return res.status(404).json({
        error: "Profile not found",
        message: `No profile found with ID: ${id}`,
      });
    }

    res.json(profile);
  } catch (err) {
    next(err);
  }
};

exports.deleteProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({
        error: "Profile not found",
        message: `No profile found with ID: ${id}`,
      });
    }

    const Event = require("../models/Event");
    await Event.updateMany(
      { participants: id },
      { $pull: { participants: id }, $set: { updatedAtUTC: new Date() } }
    );

    await Profile.deleteOne({ _id: id });

    console.log("Profile deleted:", { id });
    res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
};
