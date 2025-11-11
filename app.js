const express = require("express");
const cors = require("cors");

const profileRoutes = require("./routes/profileRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/api/profiles", profileRoutes);
app.use("/api/events", eventRoutes);

module.exports = app;
