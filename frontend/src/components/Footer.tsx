export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-auto py-6 px-4 text-center text-sm text-[var(--text)]">
      <a
        href="https://www.themoviedb.org"
        target="_blank"
        rel="noreferrer"
        aria-label="The Movie Database"
      >
        <img
          src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb20f684cf86b4e638e9d561ed4a4fbe2.svg"
          alt="TMDB logo"
          width="130"
          height="20"
          className="mx-auto mb-2"
        />
      </a>
      <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
    </footer>
  )
}
