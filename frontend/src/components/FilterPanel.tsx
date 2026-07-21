import { useEffect, useRef, useState } from 'react'

interface Genre {
  id: number
  name: string
}

interface Movie {
  id: number
  title: string
  poster_path: string | null
  vote_average: number
  overview: string
  genre_ids: number[]
}

interface MoodOption {
  label: string
  params: Record<string, string>
}

const MOODS: MoodOption[] = [
  { label: 'Happy', params: { sort_by: 'popularity.desc' } },
  { label: 'Tense', params: { sort_by: 'vote_average.desc', with_keywords: '9717' } },
  { label: 'Sad', params: { sort_by: 'vote_average.desc', with_keywords: '9748' } },
  { label: 'Adventurous', params: { sort_by: 'vote_count.desc', with_keywords: '1365' } },
]

interface Props {
  onResults: (movies: Movie[]) => void
  onLoading: (loading: boolean) => void
}

export default function FilterPanel({ onResults, onLoading }: Props) {
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [selectedMood, setSelectedMood] = useState<string>('')
  const [minRating, setMinRating] = useState<number>(0)
  const fetchRef = useRef<AbortController | null>(null)

  useEffect(() => {
    fetch('/api/genres')
      .then((r) => r.json())
      .then((data: { genres: Genre[] }) => setGenres(data.genres))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (fetchRef.current) fetchRef.current.abort()
      const controller = new AbortController()
      fetchRef.current = controller

      const params = new URLSearchParams()

      if (selectedGenres.length > 0) {
        params.set('genre_ids', selectedGenres.join(','))
      }

      const mood = MOODS.find((m) => m.label === selectedMood)
      if (mood) {
        for (const [k, v] of Object.entries(mood.params)) {
          params.set(k, v)
        }
      }

      if (minRating > 0) {
        params.set('vote_average.gte', String(minRating))
      }

      onLoading(true)
      fetch(`/api/movies?${params.toString()}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((movies: Movie[]) => {
          onResults(movies)
          onLoading(false)
        })
        .catch((err) => {
          if (err.name !== 'AbortError') onLoading(false)
        })
    }, 300)

    return () => clearTimeout(timeout)
  }, [selectedGenres, selectedMood, minRating])

  function toggleGenre(id: number) {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  return (
    <aside className="w-full rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] p-6 text-left flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--text)] mb-3">
          Genres
        </h3>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => toggleGenre(g.id)}
              className={[
                'px-3 py-1 rounded-full text-sm border transition-colors',
                selectedGenres.includes(g.id)
                  ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                  : 'border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]',
              ].join(' ')}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--text)] mb-3">
          Mood
        </h3>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.label}
              type="button"
              onClick={() => setSelectedMood((prev) => (prev === m.label ? '' : m.label))}
              className={[
                'px-3 py-1 rounded-full text-sm border transition-colors',
                selectedMood === m.label
                  ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                  : 'border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]',
              ].join(' ')}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--text)] mb-3">
          Min Rating: <span className="text-[var(--accent)]">{minRating.toFixed(1)}</span>
        </h3>
        <input
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="w-full accent-[var(--accent)]"
        />
        <div className="flex justify-between text-xs text-[var(--text)] mt-1">
          <span>0</span>
          <span>10</span>
        </div>
      </div>
    </aside>
  )
}
