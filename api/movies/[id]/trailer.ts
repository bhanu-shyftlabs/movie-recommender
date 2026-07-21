interface TMDBVideo {
  key: string;
  site: string;
  type: string;
}

interface TMDBVideosResponse {
  results: TMDBVideo[];
  status_message?: string;
}

export default async function handler(req: any, res: any) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'TMDB_API_KEY not configured' });
    return;
  }

  const { id } = req.query;
  const params = new URLSearchParams({ api_key: apiKey });

  let fetchRes: Response;
  try {
    fetchRes = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?${params.toString()}`);
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
}
