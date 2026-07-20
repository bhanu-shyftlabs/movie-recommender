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

export default router;
