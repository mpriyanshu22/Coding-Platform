// An in-memory mock for local development without Docker/Redis
class MockRedisClient {
    constructor() {
        this.store = new Map();   // value store: key -> value
        this.expiry = new Map();  // expiry store: key -> expireAtMs
        this.zsets = new Map();
    }

    // Internal: check if a key is expired and clean it up
    _isExpired(k) {
        if (this.expiry.has(k)) {
            if (Date.now() > this.expiry.get(k)) {
                this.store.delete(k);
                this.expiry.delete(k);
                return true;
            }
        }
        return false;
    }

    async connect() { console.log('Mock Redis connected'); }
    on(event, handler) {}

    async get(k) {
        if (this._isExpired(k)) return null;
        return this.store.get(k) || null;
    }

    async set(k, v, opts) {
        // NX = only set if key does NOT already exist (and is not expired)
        if (opts && opts.NX) {
            this._isExpired(k); // clean up if expired first
            if (this.store.has(k)) return null; // key exists, don't overwrite
        }
        this.store.set(k, v);
        // Handle EX (seconds) expiration
        if (opts && opts.EX) {
            this.expiry.set(k, Date.now() + opts.EX * 1000);
        }
        return "OK";
    }

    async expireAt(k, unixTimestampSeconds) {
        if (this.store.has(k)) {
            this.expiry.set(k, unixTimestampSeconds * 1000);
        }
    }

    async expire(k, seconds) {
        if (this.store.has(k)) {
            this.expiry.set(k, Date.now() + seconds * 1000);
        }
    }

    async zRemRangeByScore(k, min, max) {
        let set = this.zsets.get(k) || [];
        this.zsets.set(k, set.filter(x => x.score < min || x.score > max));
    }
    async zCard(k) {
        return (this.zsets.get(k) || []).length;
    }
    async zAdd(k, items) {
        const set = this.zsets.get(k) || [];
        set.push(...items);
        this.zsets.set(k, set);
    }
}

const redisClient = new MockRedisClient();
console.log("Using integrated mock Redis.");

module.exports = redisClient;