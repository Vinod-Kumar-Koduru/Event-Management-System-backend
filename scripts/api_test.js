const fetch = global.fetch || require("node-fetch");

async function run() {
  const base = "http://localhost:4000";
  try {
    const h = await fetch(base + "/health");
    const hj = await h.json();
    console.log("HEALTH_OK", JSON.stringify(hj));
  } catch (e) {
    console.error("HEALTH_FAIL", e.message);
    return;
  }

  try {
    const profileRes = await fetch(base + "/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Automated Test User",
        timezone: "Asia/Kolkata",
      }),
    });
    const profile = await profileRes.json();
    if (!profile._id) {
      console.error("PROFILE_FAIL", JSON.stringify(profile));
      return;
    }
    console.log("PROFILE_CREATED", JSON.stringify(profile));

    const start = new Date(Date.now() + 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19);
    const end = new Date(Date.now() + 2 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19);

    const eventRes = await fetch(base + "/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participants: [profile._id],
        eventTimezone: "Asia/Kolkata",
        startLocal: start,
        endLocal: end,
        createdBy: profile._id,
      }),
    });
    const event = await eventRes.json();
    if (!event._id) {
      console.error("EVENT_FAIL", JSON.stringify(event));
      return;
    }
    console.log("EVENT_CREATED", JSON.stringify(event));

    const updRes = await fetch(base + "/api/events/" + event._id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startLocal: new Date(Date.now() + 3 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 19),
        updatedBy: profile._id,
      }),
    });
    const updated = await updRes.json();
    console.log("EVENT_UPDATED", JSON.stringify(updated));

    const logsRes = await fetch(base + "/api/logs/event/" + event._id);
    const logs = await logsRes.json();
    console.log("LOGS", JSON.stringify(logs));
  } catch (err) {
    console.error("TEST_ERROR", err && err.message);
  }
}

run();
