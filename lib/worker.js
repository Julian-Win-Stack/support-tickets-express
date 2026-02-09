import { claimNextRunnable, markSucceed, markFailed } from './jobsDb.js';
import { getHandler } from './jobHandlers.js';

let workerIntervalId = null;

async function tick() {
    const job = await claimNextRunnable();
    if (!job) return;
    const handler = getHandler(job.type);
    if (!handler) {
        await markFailed(job.id, 'Handler not found');
        return;
    }

    try {
        await handler(JSON.parse(job.payload_json));
    } catch (error) {
        console.error('Worker job failed:', job.id, error.message, error);
        await markFailed(job.id, error.message, { requeue: true });
        return;
    }

    await markSucceed(job.id);
} 


export function startWorker(pollIntervalMs) {
    workerIntervalId = setInterval(()=>{
        tick().catch(error => {
            console.error('Worker error:', error);
        });
    }, pollIntervalMs);
}

export function stopWorker() {
    if (workerIntervalId) {
        clearInterval(workerIntervalId);
        workerIntervalId = null;
    }
}
