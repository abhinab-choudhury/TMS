// Initialize the global cache object if it doesn't exist
var appwriteCache = appwriteCache || {};

const DEFAULT_CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Stores data in the cache.
 * @param {string} key - The cache key.
 * @param {*} data - The data to store.
 * @param {number} [durationInMs=DEFAULT_CACHE_DURATION_MS] - Cache duration in milliseconds.
 */
function setCache(key, data, durationInMs = DEFAULT_CACHE_DURATION_MS) {
  if (typeof key !== 'string') {
    console.error("Cache key must be a string.");
    return;
  }
  appwriteCache[key] = {
    data: data,
    expiry: Date.now() + durationInMs,
  };
  // console.log(`Cache set for key: ${key}`);
}

/**
 * Retrieves data from the cache.
 * @param {string} key - The cache key.
 * @returns {*} The cached data, or null if not found or expired.
 */
function getCache(key) {
  if (typeof key !== 'string') {
    console.error("Cache key must be a string.");
    return null;
  }
  const item = appwriteCache[key];
  if (item) {
    if (Date.now() < item.expiry) {
      // console.log(`Cache hit for key: ${key}`);
      return item.data;
    } else {
      // console.log(`Cache expired for key: ${key}. Removing.`);
      delete appwriteCache[key]; // Remove expired item
    }
  } else {
    // console.log(`Cache miss for key: ${key}`);
  }
  return null;
}

/**
 * Invalidates a specific cache entry.
 * @param {string} key - The cache key to invalidate.
 */
function invalidateCache(key) {
  if (typeof key !== 'string') {
    console.error("Cache key must be a string.");
    return;
  }
  // console.log(`Cache invalidated for key: ${key}`);
  delete appwriteCache[key];
}

/**
 * Invalidates the entire Appwrite cache.
 */
function invalidateAllAppwriteCache() {
  // console.log("Invalidating all Appwrite cache.");
  appwriteCache = {};
}

// Example Usage (optional, for testing):
/*
console.log("Cache script loaded.");

// Test setCache and getCache
setCache("testUser", { id: 1, name: "John Doe" });
console.log("Get 'testUser':", getCache("testUser")); // Should return user data

setCache("testConfig", { theme: "dark" }, 1000); // Cache for 1 second
console.log("Get 'testConfig' immediately:", getCache("testConfig")); // Should return config

setTimeout(() => {
  console.log("Get 'testUser' after 2s:", getCache("testUser")); // Still valid
  console.log("Get 'testConfig' after 2s:", getCache("testConfig")); // Should be null (expired)

  // Test invalidateCache
  setCache("tempData", { value: 123 });
  console.log("Get 'tempData':", getCache("tempData"));
  invalidateCache("tempData");
  console.log("Get 'tempData' after invalidation:", getCache("tempData")); // Should be null

  // Test invalidateAllAppwriteCache
  setCache("user1", { name: "Alice" });
  setCache("user2", { name: "Bob" });
  console.log("Cache before clearing all:", JSON.stringify(appwriteCache));
  invalidateAllAppwriteCache();
  console.log("Cache after clearing all:", JSON.stringify(appwriteCache));
  console.log("Get 'user1' after clearing all:", getCache("user1")); // Should be null
}, 2000);
*/
