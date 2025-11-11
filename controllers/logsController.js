const EventLog = require("../models/EventLog");
const Event = require("../models/Event");


exports.getLogsForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        error: "Event not found",
        message: `No event found with ID: ${eventId}`,
      });
    }

    const logs = await EventLog.find({ event: eventId })
      .populate("updatedBy", "name")
      .sort({ changedAtUTC: -1 })
      .lean();

    res.json(logs);
  } catch (error) {
    next(error);
  }
};
