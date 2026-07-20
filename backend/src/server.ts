import express from 'express';
import path from 'path';
import genresRouter from './routes/genres';
import moviesRouter from './routes/movies';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const apiRouter = express.Router();
apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
apiRouter.use('/genres', genresRouter);
apiRouter.use('/movies', moviesRouter);
app.use('/api', apiRouter);

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
