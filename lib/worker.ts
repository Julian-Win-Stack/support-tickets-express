import { claimNextRunnable, markSucceed, markFailed } from './jobsDb.js';
import { getHandler } from './jobHandlers.js';

let workerIntervalId: NodeJS.Timeout | null = null;


export async function tick(): Promise<void> {
    const job = await claimNextRunnable();
    if (!job) return;
    const handler = getHandler(job.type);
    if (!handler) {
        await markFailed(job.id, 'Handler not found');
        return;
    }

    try {
        await handler(JSON.parse(job.payload_json));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Worker job failed:', job.id, message, error);
        await markFailed(job.id, message, { requeue: true });
        return;
    }

    await markSucceed(job.id);
} 


export function startWorker(pollIntervalMs: number): void {
    workerIntervalId = setInterval(async ()=>{
        await tick().catch((error: unknown) => {
            console.error('Worker error:', error);
        });
    }, pollIntervalMs);
}

export function stopWorker(): void {
    if (workerIntervalId) {
        clearInterval(workerIntervalId);
        workerIntervalId = null;
    }
}
