import { describe, it, expect } from 'vitest';
import { app } from '../../app.js';
import { loginAsAdmin, loginAsUserA, loginAsUserB } from '../helpers/authHelpers.js';
import { seed } from '../helpers/seed.js';
import { beforeAll } from 'vitest';
import request from 'supertest';
let ticketId = null;

describe('permissions', () => {
    beforeAll(async () => {
        const ids = await seed();
        ticketId = ids.ticketId;
    });

    it('login succeed and cookie is set', async () => {
        const agent = request.agent(app);
        await loginAsUserA(agent);
        const res = await agent
        .get('/api/auth/me')
        expect(res.body.ok).toBe(true);
});
    it('unauthenticated users should not be able to access', async () => {
        const agent = request.agent(app);
        const res = await agent 
        .get('/api/ticket')
        expect(res.status).toBe(401); 
    });


    it('user should not be able to access tickets of other users', async () => {
        const agent = request.agent(app);
        await loginAsUserB(agent);
        const res = await agent
        .get(`/api/ticket/${ticketId}`)
        expect(res.status).toBe(404);
    });

        it('user should not be able to change status of a ticket', async () => {
            const agent = request.agent(app);
            await loginAsUserA(agent);
            const res = await agent
            .patch(`/api/ticket/${ticketId}`)
            .send({
                status: 'in_progress'
            })
            expect(res.status).toBe(403);
        });

        it('admin should not be able to change title and body of a ticket', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            const res = await agent
            .patch(`/api/ticket/${ticketId}`)
            .send({
                title: 'Ticket 1 changed',
                body: 'Ticket 1 body changed'
            })
            expect(res.status).toBe(403);
        });

        it('admin can change status of a ticket', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            const res = await agent
            .patch(`/api/ticket/${ticketId}`)
            .send({
                status: 'in_progress'
            })
            expect(res.status).toBe(200);
            expect(res.body.ok).toBe(true);
            expect(res.body.data.status).toBe('in_progress');
        });

        it('user should be able to change title and body of their own ticket', async () => {
            const agent = request.agent(app);
            await loginAsUserA(agent);
            const res = await agent
            .patch(`/api/ticket/${ticketId}`)
            .send({
                title: 'Ticket 1 changed changed',
                body: 'Ticket 1 body changed changed'
            })
            expect(res.status).toBe(200);
            expect(res.body.ok).toBe(true);
            expect(res.body.data.title).toBe('Ticket 1 changed changed');
            expect(res.body.data.body).toBe('Ticket 1 body changed changed');
        });

        it('user should not be able to access the notes of a ticket', async () => {
            const agent = request.agent(app);
            await loginAsUserA(agent);
            const res = await agent
            .get(`/api/notes/${ticketId}`)
            expect(res.status).toBe(403);
        });

        it('admin should be able to access the notes of a ticket', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            const res = await agent
            .get(`/api/notes/${ticketId}`)
            expect(res.status).toBe(200);

        });

        it('admin should be able to create a note for a ticket', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            const res = await agent
            .post(`/api/notes`)
            .send({
                body: 'Note 1', 
                ticketId: String(ticketId)
            })
            expect(res.status).toBe(201);

        });

        
});

