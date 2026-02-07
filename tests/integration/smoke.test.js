import { describe, it, expect } from 'vitest';
import 'dotenv/config';

describe('setup', () => {
    it('has SESSION_SECRET', () => {
        expect(process.env.NODE_ENV).toBe('test');
        expect(process.env.SESSION_SECRET).toBeDefined();
    });
});



