import express from 'express';
import path from 'path';
import rateLimit from 'express-rate-limit';
import genresRouter from './routes/genres';
import moviesRouter from './routes/movies';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const limiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  message: { error: 'Too many requests, slow down.' },
});

// API routes stub
const apiRouter = express.Router();
apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
apiRouter.use('/genres', genresRouter);
app.use('/api', limiter, apiRouter);

// Serve frontend static files
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
