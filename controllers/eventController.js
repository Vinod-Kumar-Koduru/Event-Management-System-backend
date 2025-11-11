const Event = require("../models/Event");
const Profile = require("../models/Profile");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      participants,
      eventTimezone,
      startLocal,
      endLocal,
      createdBy,
    } = req.body;

    if (!title || !participants || participants.length === 0) {
      return res
        .status(400)
        .json({ error: "Title and at least one participant required" });
    }

    if (!eventTimezone) {
      return res.status(400).json({ error: "Event timezone required" });
    }

    const startAtUTC = dayjs.tz(startLocal, eventTimezone).utc().toDate();
    const endAtUTC = dayjs.tz(endLocal, eventTimezone).utc().toDate();

    if (endAtUTC <= startAtUTC) {
      return res.status(400).json({ error: "End time must be after start" });
    }

    const count = await Profile.countDocuments({ _id: { $in: participants } });
    if (count !== participants.length) {
      return res
        .status(400)
        .json({ error: "One or more participant IDs are invalid" });
    }

    const event = await Event.create({
      title,
      description,
      participants,
      eventTimezone,
      startAtUTC,
      endAtUTC,
      createdBy,
      createdAtUTC: new Date(),
      updatedAtUTC: new Date(),
    });

    res.status(201).json(event);
  } catch (err) {
    console.error("❌ Error creating event:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("participants", "name timezone")
      .sort({ createdAtUTC: -1 });
    res.json(events);
  } catch (err) {
    console.error("❌ Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) return res.status(400).json({ error: "Event ID required" });

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    Object.assign(event, updates, { updatedAtUTC: new Date() });
    await event.save();

    res.json(event);
  } catch (err) {
    console.error("❌ Error updating event:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
};
