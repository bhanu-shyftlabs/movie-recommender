import { useState } from 'react'
import './App.css'
import Footer from './components/Footer'
import FilterPanel from './components/FilterPanel'

interface Movie {
  id: number
  title: string
  poster_path: string | null
  vote_average: number
  overview: string
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300'

function App() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)

  return (
    <>
      <section className="px-6 pt-10 pb-4 text-left">
        <h1 className="!text-3xl !mb-2">Movie Recommender</h1>
        <p className="text-[var(--text)]">Filter movies by genre, mood, and rating.</p>
      </section>

      <div className="flex flex-col md:flex-row gap-6 px-6 pb-10 flex-1">
        <div className="md:w-72 shrink-0">
          <FilterPanel onResults={setMovies} onLoading={setLoading} />
        </div>

        <main className="flex-1">
          {loading && (
            <p className="text-[var(--text)] text-center mt-8">Loading…</p>
          )}
          {!loading && movies.length === 0 && (
            <p className="text-[var(--text)] text-center mt-8">
              Select filters to discover movies.
            </p>
          )}
          {!loading && movies.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {movies.map((movie) => (
                <article
                  key={movie.id}
                  className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--code-bg)] flex flex-col"
                >
                  {movie.poster_path ? (
                    <img
                      src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full object-cover aspect-[2/3]"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-[var(--border)] flex items-center justify-center text-[var(--text)] text-xs">
                      No image
                    </div>
                  )}
                  <div className="p-3 flex flex-col gap-1 flex-1">
                    <h4 className="text-sm font-semibold text-[var(--text-h)] leading-tight">
                      {movie.title}
                    </h4>
                    <span className="text-xs text-[var(--accent)]">
                      ★ {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      <div className="ticks"></div>
      <Footer />
    </>
  )
}

export default App
