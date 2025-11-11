/**
 * Diff Utility - Efficient object comparison for change tracking
 *
 * DSA Strategy:
 * - Selective field comparison (O(k) where k is number of fields)
 * - JSON serialization for deep comparison
 * - Early exit for unchanged fields
 */
function buildDiff(oldObj, newObj) {
  // Fields to track for changes
  const fields = ["startAtUTC", "endAtUTC", "eventTimezone", "participants"];
  const diff = {};

  // Iterate through tracked fields only (optimized field selection)
  for (const field of fields) {
    const oldValue = oldObj[field];
    const newValue = newObj[field];

    // Deep comparison using JSON serialization
    // More efficient than recursive comparison for simple objects
    const oldStr = JSON.stringify(oldValue || null);
    const newStr = JSON.stringify(newValue || null);

    if (oldStr !== newStr) {
      diff[field] = {
        from: JSON.parse(oldStr),
        to: JSON.parse(newStr),
      };
    }
  }

  return diff;
}

/**
 * Check if two objects have changes (optimized)
 * Returns boolean for quick change detection
 */
function hasChanges(oldObj, newObj) {
  const diff = buildDiff(oldObj, newObj);
  return Object.keys(diff).length > 0;
}

module.exports = {
  buildDiff,
  hasChanges,
};
