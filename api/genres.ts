export default async function handler(req: any, res: any) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'TMDB_API_KEY not configured' });
    return;
  }

  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`;

  const tmdbRes = await fetch(url);
  if (!tmdbRes.ok) {
    res.status(tmdbRes.status).json({ error: 'Failed to fetch genres from TMDB' });
    return;
  }

  const data = (await tmdbRes.json()) as { genres: { id: number; name: string }[] };

  res.json({
    genres: data.genres.map(({ id, name }) => ({ id, name })),
  });
}
