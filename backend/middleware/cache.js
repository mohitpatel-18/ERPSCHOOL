/**
 * Simple in-memory caching middleware
 * For production, consider Redis or Memcached
 */

class Cache {
  constructor() {
    this.cache = new Map();
    this.ttlTimers = new Map();
  }

  /**
   * Set cache with TTL (time to live)
   */
  set(key, value, ttl = 300000) { // Default 5 minutes
    // Clear existing timer if any
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key));
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.ttlTimers.set(key, timer);
  }

  /**
   * Get cached value
   */
  get(key) {
    const cached = this.cache.get(key);
    return cached ? cached.value : null;
  }

  /**
   * Check if key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Delete cached value
   */
  delete(key) {
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key));
      this.ttlTimers.delete(key);
    }
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.ttlTimers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.ttlTimers.clear();
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }

  /**
   * Get all cache keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Invalidate cache by pattern (e.g., "student:*")
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    const keysToDelete = this.keys().filter(key => regex.test(key));
    keysToDelete.forEach(key => this.delete(key));
    return keysToDelete.length;
  }
}

// Create singleton instance
const cacheInstance = new Cache();

/**
 * Cache middleware factory
 */
const cacheMiddleware = (options = {}) => {
  const {
    ttl = 300000, // 5 minutes default
    keyGenerator = (req) => `${req.method}:${req.originalUrl}`,
    condition = () => true // Function to determine if request should be cached
  } = options;

  return (req, res, next) => {
    // Only cache GET requests by default
    if (req.method !== 'GET' || !condition(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const cachedResponse = cacheInstance.get(key);

    if (cachedResponse) {
      console.log(`Cache HIT: ${key}`);
      return res.json(cachedResponse);
    }

    console.log(`Cache MISS: ${key}`);

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheInstance.set(key, data, ttl);
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Predefined cache configurations
 */
const cacheConfigs = {
  // Short cache for frequently changing data (1 minute)
  short: cacheMiddleware({ ttl: 60000 }),
  
  // Medium cache for moderately changing data (5 minutes)
  medium: cacheMiddleware({ ttl: 300000 }),
  
  // Long cache for rarely changing data (30 minutes)
  long: cacheMiddleware({ ttl: 1800000 }),
  
  // Custom cache for specific routes
  custom: (ttl, keyGenerator) => cacheMiddleware({ ttl, keyGenerator })
};

/**
 * Cache invalidation helper
 */
const invalidateCache = (pattern) => {
  return cacheInstance.invalidatePattern(pattern);
};

/**
 * Clear all cache
 */
const clearCache = () => {
  return cacheInstance.clear();
};

module.exports = {
  cache: cacheInstance,
  cacheMiddleware,
  cacheConfigs,
  invalidateCache,
  clearCache
};
