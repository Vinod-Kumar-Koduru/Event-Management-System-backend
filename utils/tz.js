const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

function localToUTC(localStr, tz) {
  // localStr: ISO-like '2025-11-10T14:30' or full ISO
  return dayjs.tz(localStr, tz).utc().toDate();
}

// Common legacy aliases mapping -> canonical IANA name
const TZ_ALIASES = {
  // India legacy name
  "Asia/Calcutta": "Asia/Kolkata",
  Calcutta: "Asia/Kolkata",
  // Add other common legacy aliases as needed
};

const _getZoneNames = () => {
  try {
    if (dayjs && dayjs.tz && typeof dayjs.tz.names === "function") {
      return dayjs.tz.names();
    }
  } catch (e) {
    // fall through
  }
  return [
    "UTC",
    "Asia/Kolkata",
    "America/New_York",
    "Europe/London",
    "Europe/Paris",
    "America/Los_Angeles",
  ];
};

function isValidTimezone(tz) {
  try {
    if (!tz) return false;
    const names = _getZoneNames();
    // debug
    // console.log('isValidTimezone check', { tz, namesSample: names.slice(0,5) });
    if (names.includes(tz)) return true;
    if (TZ_ALIASES[tz]) return true;
    // Try replacing space with underscore (e.g., 'America New_York' -> 'America/New_York')
    const alt = tz.replace(/\s+/g, "_");
    if (names.includes(alt)) return true;
    return false;
  } catch (e) {
    return false;
  }
}

function normalizeTimezone(tz) {
  if (!tz) return tz;
  const trimmed = tz.trim();
  const names = _getZoneNames();
  if (names.includes(trimmed)) {
    // console.log('normalizeTimezone: exact match', trimmed);
    return trimmed;
  }
  if (TZ_ALIASES[trimmed]) {
    // console.log('normalizeTimezone: alias mapped', { trimmed, mapped: TZ_ALIASES[trimmed] });
    return TZ_ALIASES[trimmed];
  }
  const alt = trimmed.replace(/\s+/g, "_");
  if (names.includes(alt)) {
    // console.log('normalizeTimezone: underscore match', alt);
    return alt;
  }
  // Fallback to original trimmed value (validation should have prevented invalids)
  // console.log('normalizeTimezone: fallback to trimmed', trimmed);
  return trimmed;
}

module.exports = { localToUTC, isValidTimezone, normalizeTimezone };
