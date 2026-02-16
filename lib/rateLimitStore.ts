type Bucket = {
    count: number;
    resetAt: number;
}

export function createRateLimitStore(getTime: () => number = () => Date.now()) {
    const buckets = new Map<string, Bucket>();

    function check(
        key: string,
        max: number,
        windowMs: number
    ): { blocked: false } | { blocked: true, retryAfterSeconds: number } {
        const now = getTime();
        let bucket = buckets.get(key);

        if (!bucket || now >= bucket.resetAt) {
            bucket = { count: 0, resetAt: now + windowMs };
            buckets.set(key, bucket);
        }

        bucket.count += 1;

        if (bucket.count > max) {
            const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
            return { blocked: true, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
    }
    return { blocked: false };
    }
    
    function reset(){
        buckets.clear();
    }

    return { check, reset };
}