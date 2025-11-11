/**
 * Event Service - Business logic layer for events
 *
 * Architecture Pattern: Service Layer
 * - Separates business logic from controllers
 * - Improves code reusability and testability
 * - Centralizes event-related operations
 */

const Event = require("../models/Event");
const EventLog = require("../models/EventLog");
const Profile = require("../models/Profile");
const { localToUTC, isValidTimezone } = require("../utils/tz");
const { buildDiff } = require("../utils/diff");
const {
  validateEventData,
  validateDateRange,
} = require("../utils/validationUtils");
const { sortEventsByDate, arrayContainsAll } = require("../utils/searchUtils");

/**
 * Create a new event with validation and logging
 */
async function createEvent(eventData) {
  // Validate input data
  const validation = validateEventData(eventData);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Validate timezone
  if (!isValidTimezone(eventData.eventTimezone)) {
    throw new Error("Invalid timezone");
  }

  // Convert local times to UTC
  const startAtUTC = localToUTC(eventData.startLocal, eventData.eventTimezone);
  const endAtUTC = localToUTC(eventData.endLocal, eventData.eventTimezone);

  // Validate date range
  const dateValidation = validateDateRange(startAtUTC, endAtUTC);
  if (!dateValidation.valid) {
    throw new Error(dateValidation.error);
  }

  // Verify participants exist (efficient bulk check)
  const participantCount = await Profile.countDocuments({
    _id: { $in: eventData.participants },
  });

  if (participantCount !== eventData.participants.length) {
    throw new Error("One or more participants are invalid");
  }

  // Create event (no title/description fields)
  const event = await Event.create({
    participants: eventData.participants,
    eventTimezone: eventData.eventTimezone.trim(),
    startAtUTC,
    endAtUTC,
    createdBy: eventData.createdBy || null,
    createdAtUTC: new Date(),
    updatedAtUTC: new Date(),
  });

  // Log creation (async, don't block) - created diff contains core fields
  EventLog.create({
    event: event._id,
    updatedBy: eventData.createdBy || null,
    changedAtUTC: new Date(),
    diff: {
      created: {
        participants: eventData.participants,
        eventTimezone: eventData.eventTimezone,
        startAtUTC,
        endAtUTC,
      },
    },
  }).catch((err) => console.error("Error creating event log:", err));

  // Return populated event
  return await Event.findById(event._id)
    .populate("participants", "name")
    .populate("createdBy", "name")
    .lean();
}

/**
 * Get events for a profile with efficient querying
 * Uses database indexes for optimal performance
 */
async function getEventsForProfile(profileId, options = {}) {
  const { from, to, limit = 100 } = options;

  const query = { participants: profileId };

  // Date range filtering using indexed fields
  if (from || to) {
    query.startAtUTC = {};
    if (from) query.startAtUTC.$gte = new Date(from);
    if (to) query.startAtUTC.$lte = new Date(to);
  }

  // Efficient query with indexes
  const events = await Event.find(query)
    .populate("participants", "name")
    .populate("createdBy", "name")
    .sort({ startAtUTC: 1 }) // Uses index
    .limit(Number(limit))
    .lean();

  return events;
}

/**
 * Update event with change tracking
 */
async function updateEvent(eventId, updateData, updatedBy) {
  const oldEvent = await Event.findById(eventId);
  if (!oldEvent) {
    throw new Error("Event not found");
  }

  // Validate timezone if provided
  const eventTimezone = updateData.eventTimezone || oldEvent.eventTimezone;
  if (!isValidTimezone(eventTimezone)) {
    throw new Error("Invalid timezone");
  }

  // Handle date updates
  let startAtUTC = oldEvent.startAtUTC;
  let endAtUTC = oldEvent.endAtUTC;

  if (updateData.startLocal) {
    startAtUTC = localToUTC(updateData.startLocal, eventTimezone);
  }
  if (updateData.endLocal) {
    endAtUTC = localToUTC(updateData.endLocal, eventTimezone);
  }

  // Validate date range
  const dateValidation = validateDateRange(startAtUTC, endAtUTC);
  if (!dateValidation.valid) {
    throw new Error(dateValidation.error);
  }

  // Build update object
  const updated = {
    participants: updateData.participants ?? oldEvent.participants,
    eventTimezone,
    startAtUTC,
    endAtUTC,
    updatedAtUTC: new Date(),
  };

  // Calculate diff for logging
  const diff = buildDiff(oldEvent.toObject(), updated);

  // Update event
  Object.assign(oldEvent, updated);
  await oldEvent.save();

  // Log changes if any
  if (Object.keys(diff).length > 0) {
    // If participants changed, replace ids with profile names for clearer logs
    try {
      if (diff.participants) {
        const fromArr = Array.isArray(diff.participants.from)
          ? diff.participants.from
          : [];
        const toArr = Array.isArray(diff.participants.to)
          ? diff.participants.to
          : [];
        const ids = [
          ...new Set([...(fromArr || []), ...(toArr || [])].map(String)),
        ];
        if (ids.length) {
          const profiles = await Profile.find({ _id: { $in: ids } }).lean();
          const nameById = profiles.reduce((acc, p) => {
            acc[String(p._id)] = p.name;
            return acc;
          }, {});
          diff.participants.from = (fromArr || []).map(
            (i) => nameById[String(i)] || i
          );
          diff.participants.to = (toArr || []).map(
            (i) => nameById[String(i)] || i
          );
        }
      }
    } catch (err) {
      console.error("Error populating participant names for log diff:", err);
    }

    EventLog.create({
      event: eventId,
      updatedBy: updatedBy || null,
      diff,
      changedAtUTC: new Date(),
    }).catch((err) => console.error("Error creating event log:", err));
  }

  // Return populated updated event
  return await Event.findById(eventId)
    .populate("participants", "name")
    .populate("createdBy", "name")
    .lean();
}

module.exports = {
  createEvent,
  getEventsForProfile,
  updateEvent,
  // Delete event by id and create a deletion log
  async deleteEvent(eventId, deletedBy) {
    const Event = require("../models/Event");
    const EventLog = require("../models/EventLog");

    const ev = await Event.findById(eventId);
    if (!ev) {
      throw new Error("Event not found");
    }

    // Create a deletion log before removing
    try {
      await EventLog.create({
        event: ev._id,
        updatedBy: deletedBy || null,
        changedAtUTC: new Date(),
        diff: { deleted: true, before: ev.toObject() },
      });
    } catch (err) {
      console.error("Error creating deletion log:", err);
    }

    await Event.deleteOne({ _id: eventId });
    return { id: eventId };
  },
};
