const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const envPath = path.join(__dirname, "../.env");
dotenv.config({ path: envPath });

dotenv.config();

mongoose.set("strictQuery", false);

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri || !uri.trim()) {
    throw new Error(
      "MONGO_URI not set in environment variables. Please create a .env file in the server directory with MONGO_URI=mongodb://localhost:27017/your-database-name"
    );
  }
  db.profiles.find().pretty();

  const trimmedUri = uri.trim();
  if (
    !trimmedUri.startsWith("mongodb://") &&
    !trimmedUri.startsWith("mongodb+srv://")
  ) {
    throw new Error(
      `Invalid MongoDB URI format. URI must start with "mongodb://" or "mongodb+srv://". Current value: ${trimmedUri.substring(
        0,
        20
      )}...`
    );
  }

  try {
    await mongoose.connect(trimmedUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
}

module.exports = { connectDB };
