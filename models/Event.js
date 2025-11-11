const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Profile",
      required: true,
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: "Event must have at least one participant",
      },
    },
    eventTimezone: {
      type: String,
      required: [true, "Timezone is required"],
    },
    startAtUTC: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endAtUTC: {
      type: Date,
      required: [true, "End time is required"],
      validate: {
        validator: function (value) {
          return !this.startAtUTC || value > this.startAtUTC;
        },
        message: "End time must be after start time",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    createdAtUTC: {
      type: Date,
      default: Date.now,
    },
    updatedAtUTC: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

eventSchema.pre("save", function (next) {
  this.updatedAtUTC = new Date();
  next();
});

module.exports = mongoose.model("Event", eventSchema);
