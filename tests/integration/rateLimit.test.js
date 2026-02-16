import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getDB } from '../../db/db.js';
import { loginAsAdmin, loginAsUserA, loginAsUserB } from '../helpers/authHelpers.js';
import { seed } from '../helpers/seed.js';
import { ADMIN_EMAIL, USERA_EMAIL, USERB_EMAIL } from '../helpers/constants.js';

describe('rateLimit', () => {

        /** @type {number} */
        let ticketId;
        /** @type {number} */
        let adminId;
        /** @type {number} */
        let userAId;
        /** @type {number} */
        let userBId;
    beforeAll(async () => {
        const ids = await seed();
        ticketId = ids.ticketId;
        adminId = ids.adminId;
        userAId = ids.userAId;
        userBId = ids.userBId;
    });

    describe('login', () => {
        it(`Login email - blocks after threshold is reached 
            and on 429, "Retry-After" exists 
            and is a positive number
            and after 11 minutes, the login is not blocked
            `, async () => {
            try {
                const agent = request.agent(app);
                vi.useFakeTimers({ toFake: ['Date'] });
                for (let i = 0; i < 5; i++) {
                    const res = await agent.post('/api/auth/login').send({
                        loginEmail: USERA_EMAIL,
                        loginPassword: 'wrongpassword',
                    });
                    expect(res.status).not.toBe(429);
                }
                const res = await agent.post('/api/auth/login').send({
                    loginEmail: USERA_EMAIL,
                    loginPassword: 'wrongpassword',
                });
                expect(res.status).toBe(429); 
                expect(typeof res.body.retryAfterSeconds).toBe('number');
                expect(Number.isInteger(res.body.retryAfterSeconds)).toBe(true);
                expect(res.body.retryAfterSeconds).toBeGreaterThan(0);
                vi.advanceTimersByTime(11 * 60 * 1000);
                const res2 = await agent.post('/api/auth/login').send({
                    loginEmail: USERA_EMAIL,
                    loginPassword: 'wrongpassword',
                });
                expect(res2.status).not.toBe(429);
            } finally {
                vi.useRealTimers();
            }
        });
    });

    it (`Login IP and isolates buckets - 
        blocks after threshold is reached
        and same IP different emails share IP bucket`, async () => {
        const agent = request.agent(app);
        for (let i = 0; i < 5; i++) {
            const res = await agent.post('/api/auth/login').send({
                loginEmail: USERA_EMAIL,
                loginPassword: 'wrongpassword',
            });
            console.log(i, res.status);
            expect(res.status).not.toBe(429);
        }
        for (let i = 0; i < 5; i++) {
            const res = await agent.post('/api/auth/login').send({
                loginEmail: USERB_EMAIL,
                loginPassword: 'wrongpassword',
            });
            console.log(i, res.status);
            expect(res.status).not.toBe(429);
        }
        const res = await agent.post('/api/auth/login').send({
            loginEmail: ADMIN_EMAIL,
            loginPassword: 'wrongpassword',
        });
        expect(res.status).toBe(429);
    });
    describe('register', () => {
        it('Register IP - blocks after threshold is reached', async () => {
            const agent = request.agent(app);
            for (let i = 0; i < 5; i++) {
                const res = await agent.post('/api/auth/register').send({
                    registerName: 'User C',
                    registerEmail: `userc${i}@example.com`,
                    registerPassword: 'password',
                });
                expect(res.status).not.toBe(429);
            }
            const res = await agent.post('/api/auth/register').send({
                registerName: 'User D',
                registerEmail: 'userd@example.com',
                registerPassword: 'password',
            });
            expect(res.status).toBe(429);
        });
        describe('Ticket create', () => {
            it(`Ticket create –
                 per-user blocks after 10
                 and per-user isolates 
                 ( User A hits limit; User B (different session) can still create tickets)`, async () => {
                const agent = request.agent(app);
                await loginAsUserA(agent);
                for (let i = 0; i < 10; i++) {
                    const res = await agent.post('/api/ticket').send({
                        title: `Ticket ${i}`,
                        body: `Ticket ${i} body`,
                    });
                    expect(res.status).not.toBe(429);
                }
                const res = await agent.post('/api/ticket').send({
                    title: 'Ticket 2',
                    body: 'Ticket 2 body',
                });
                expect(res.status).toBe(429);
                await loginAsUserB(agent);
                const res2 = await agent.post('/api/ticket').send({
                    title: 'Ticket 2',
                    body: 'Ticket 2 body',
                });
                expect(res2.status).not.toBe(429);
            });
            it(`Ticket create –
                unauthenticated uses IP`, async () => {
                const agent = request.agent(app);
                for (let i = 0; i < 30; i++) {
                    const res = await agent.post('/api/ticket').send({
                        title: `Ticket unauthenticated ${i}`,
                        body: `Ticket unauthenticated ${i} body`,
                    });
                    expect(res.status).not.toBe(429);
                }
                const res = await agent.post('/api/ticket').send({
                    title: 'Ticket unauthenticated',
                    body: 'Ticket unauthenticated body',
                });
                expect(res.status).toBe(429);
            });
        });
    });
});