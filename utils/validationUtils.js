function validateEventData(data) {
  if (
    !data.participants ||
    !Array.isArray(data.participants) ||
    data.participants.length === 0
  ) {
    return { valid: false, error: "At least one participant is required" };
  }

  if (!data.eventTimezone || !data.eventTimezone.trim()) {
    return { valid: false, error: "Timezone is required" };
  }

  if (!data.startLocal || !data.endLocal) {
    return { valid: false, error: "Start and end dates are required" };
  }

  return { valid: true, error: null };
}

function validateProfileData(data) {
  if (!data.name || !data.name.trim()) {
    return { valid: false, error: "Name is required" };
  }

  if (data.name.trim().length > 100) {
    return { valid: false, error: "Name cannot exceed 100 characters" };
  }

  if (!data.timezone || !data.timezone.trim()) {
    return { valid: false, error: "Timezone is required" };
  }

  return { valid: true, error: null };
}

function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return { valid: false, error: "Both start and end dates are required" };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: "Invalid date format" };
  }

  if (end <= start) {
    return { valid: false, error: "End date must be after start date" };
  }

  return { valid: true, error: null };
}

function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str.trim().replace(/[<>]/g, "");
}

module.exports = {
  validateEventData,
  validateProfileData,
  validateDateRange,
  sanitizeString,
};
