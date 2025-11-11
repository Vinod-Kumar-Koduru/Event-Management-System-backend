const mongoose = require("mongoose");

const EventLogSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event reference is required"],
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: [true, "Updated by is required"],
      index: true,
    },
    changedAtUTC: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
    diff: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Change diff is required"],
    },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

EventLogSchema.index({ event: 1, changedAtUTC: -1 });
EventLogSchema.index({ updatedBy: 1, changedAtUTC: -1 });

module.exports = mongoose.model("EventLog", EventLogSchema);
