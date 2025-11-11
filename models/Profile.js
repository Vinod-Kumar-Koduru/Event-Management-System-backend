const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Profile name is required"],
    trim: true,
  },
  timezone: {
    type: String,
    required: [true, "Timezone is required"],
  },
});

module.exports = mongoose.model("Profile", profileSchema);
