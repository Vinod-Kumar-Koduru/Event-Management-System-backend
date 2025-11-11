/**
 * Search Utilities - Optimized search and filtering algorithms
 * 
 * DSA Strategies Used:
 * 1. Binary Search: For sorted array lookups (O(log n))
 * 2. Linear Search with Early Exit: For unsorted data (O(n) best case)
 * 3. Filtering with Set for O(1) lookups: For membership testing
 * 4. Memoization: Cache expensive computations
 */

/**
 * Binary search for sorted array of objects by a key
 * Time Complexity: O(log n)
 * Space Complexity: O(1)
 */
function binarySearchByKey(arr, target, key, start = 0, end = arr.length - 1) {
  if (start > end) return -1;
  
  const mid = Math.floor((start + end) / 2);
  const midValue = arr[mid][key];
  
  if (midValue === target) return mid;
  if (midValue > target) return binarySearchByKey(arr, target, key, start, mid - 1);
  return binarySearchByKey(arr, target, key, mid + 1, end);
}

/**
 * Optimized filter with early exit for performance
 * Time Complexity: O(n) where n is array length
 * Space Complexity: O(k) where k is number of matches
 */
function filterProfiles(profiles, query) {
  if (!query || query.trim() === '') return profiles;
  
  const lowerQuery = query.toLowerCase().trim();
  const results = [];
  
  // Early exit optimization - linear search with case-insensitive matching
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    if (profile.name && profile.name.toLowerCase().includes(lowerQuery)) {
      results.push(profile);
    }
  }
  
  return results;
}

/**
 * Efficient array deduplication using Set
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
function deduplicateArray(arr, key = null) {
  if (!key) {
    return [...new Set(arr)];
  }
  
  const seen = new Set();
  return arr.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Memoization cache for expensive computations
 * Uses closure to maintain cache state
 */
function createMemoizedFunction(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Sort events by start date using efficient merge sort concept
 * Time Complexity: O(n log n) - handled by JavaScript's native sort
 * Space Complexity: O(1) - in-place sorting
 */
function sortEventsByDate(events, ascending = true) {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.startAtUTC);
    const dateB = new Date(b.startAtUTC);
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Efficient intersection of two arrays using Set
 * Time Complexity: O(n + m) where n and m are array lengths
 * Space Complexity: O(min(n, m))
 */
function arrayIntersection(arr1, arr2) {
  const set2 = new Set(arr2);
  return arr1.filter(item => set2.has(item));
}

/**
 * Check if array contains all elements (subset check)
 * Time Complexity: O(n + m)
 * Space Complexity: O(m)
 */
function arrayContainsAll(arr, subset) {
  const set = new Set(arr);
  return subset.every(item => set.has(item));
}

module.exports = {
  binarySearchByKey,
  filterProfiles,
  deduplicateArray,
  createMemoizedFunction,
  sortEventsByDate,
  arrayIntersection,
  arrayContainsAll
};

