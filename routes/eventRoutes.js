const express = require("express");
const router = express.Router();
const {
  createEvent,
  getEvents,
  updateEvent,
} = require("../controllers/eventController");

// ✅ Create Event
router.post("/", createEvent);

// ✅ Get all Events
router.get("/", getEvents);

// ✅ Update Event
router.put("/:id", updateEvent);

module.exports = router;
