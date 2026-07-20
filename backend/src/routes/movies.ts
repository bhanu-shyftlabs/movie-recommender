import { Router, Request, Response } from 'express';

const router = Router();

const PARAM_ALLOWLIST = new Set([
  'genre_ids',
  'sort_by',
  'vote_average.gte',
  'with_keywords',
]);

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

interface TMDBResponse {
  results: TMDBMovie[];
  status_message?: string;
}

router.get('/', async (req: Request, res: Response) => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'TMDB_API_KEY not configured' });
    return;
  }

  const params = new URLSearchParams({ api_key: apiKey });
  for (const [key, value] of Object.entries(req.query)) {
    if (PARAM_ALLOWLIST.has(key) && typeof value === 'string') {
      params.set(key, value);
    }
  }

  let fetchRes: Awaited<ReturnType<typeof fetch>>;
  try {
    fetchRes = await fetch(
      `https://api.themoviedb.org/3/discover/movie?${params.toString()}`
    );
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach TMDB' });
    return;
  }

  if (!fetchRes.ok) {
    const body = (await fetchRes.json().catch(() => ({}))) as TMDBResponse;
    res.status(fetchRes.status).json({ error: body.status_message ?? 'TMDB error' });
    return;
  }

  const data = (await fetchRes.json()) as TMDBResponse;
  const movies = (data.results ?? []).map((m: TMDBMovie) => ({
    id: m.id,
    title: m.title,
    poster_path: m.poster_path,
    vote_average: m.vote_average,
    overview: m.overview,
    genre_ids: m.genre_ids,
  }));

  res.json(movies);
});

interface TMDBVideo {
  key: string;
  site: string;
  type: string;
}

interface TMDBVideosResponse {
  results: TMDBVideo[];
  status_message?: string;
}

router.get('/:id/trailer', async (req: Request, res: Response) => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'TMDB_API_KEY not configured' });
    return;
  }

  const { id } = req.params;
  const params = new URLSearchParams({ api_key: apiKey });

  let fetchRes: Awaited<ReturnType<typeof fetch>>;
  try {
    fetchRes = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/videos?${params.toString()}`
    );
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach TMDB' });
    return;
  }

  if (!fetchRes.ok) {
    const body = (await fetchRes.json().catch(() => ({}))) as TMDBVideosResponse;
    res.status(fetchRes.status).json({ error: body.status_message ?? 'TMDB error' });
    return;
  }

  const data = (await fetchRes.json()) as TMDBVideosResponse;
  const trailer = (data.results ?? []).find(
    (v: TMDBVideo) => v.type === 'Trailer' && v.site === 'YouTube'
  );

  if (!trailer) {
    res.status(404).json({ error: 'No trailer found' });
    return;
  }

  res.json({ key: trailer.key });
});

export default router;
