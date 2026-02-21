import { SEED_PASSWORD, USERA_EMAIL, USERB_EMAIL, ADMIN_EMAIL, ADMINB_EMAIL } from './constants.js';

export async function loginAsAdmin(agent) {
    await agent.post('/api/auth/login') .send({
        loginEmail: ADMIN_EMAIL,
        loginPassword: SEED_PASSWORD
    });
}

export async function loginAsUserA(agent) {
    await agent.post('/api/auth/login') .send({
        loginEmail: USERA_EMAIL,
        loginPassword: SEED_PASSWORD
    });
}

export async function loginAsUserB(agent) {
    await agent.post('/api/auth/login') .send({
        loginEmail: USERB_EMAIL,
        loginPassword: SEED_PASSWORD
    });
}

export async function loginAsAdminB(agent) {
    await agent.post('/api/auth/login').send({
        loginEmail: ADMINB_EMAIL,
        loginPassword: SEED_PASSWORD
    });
}



