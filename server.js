import { app } from './app.js';
import { startWorker } from './lib/worker.js';

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

if (process.env.NODE_ENV !== 'test') {
  startWorker(1000);
}
