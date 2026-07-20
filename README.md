# movie-recommender

Full POC — React/Vite frontend + Express proxy backend in one repo, one Docker image

_Scaffolded by the DevOps Bot from architecture package `arch-20260720124025-b8f26d`. This is a starting structure only — real implementation happens through the normal ticket pipeline._

## Layout contract

This repo is a single-host web app: `backend/` + `frontend/` with one root `Dockerfile` serving both from one process on one port — frontend at `/` (SPA fallback), API under `/api`.

The Dockerfile assumes these entrypoints — keep them stable or update the Dockerfile in the same change:

| Backend | Entrypoint the Dockerfile runs |
|---------|-------------------------------|
| node    | `backend/src/index.js` (`node src/index.js`) |
| python  | `backend/main.py` exposing `app` (`uvicorn main:app`) |
| go      | root go module, `go build ./...` output |
| java    | jar with a `Main-Class` manifest (`build/libs/*.jar` or `target/*.jar`) |
| ruby    | `backend/config.ru` (`bundle exec puma`) |
| dotnet  | first `*.dll` in publish output |

Built frontend assets land in `./public` (`wwwroot/` for .NET) — the backend must serve them statically with an SPA fallback. Backends read the port from `$PORT` where the CMD does not pass it explicitly.

## Deployment (Vercel)

`.github/workflows/vercel-deploy.yml` deploys production on push to `main` and a preview on every pull request. Repo secrets `VERCEL_TOKEN` (and `VERCEL_SCOPE` for team accounts) are set by the DevOps Bot at provision time.

**Environment variables are NOT provisioned automatically.** Add any runtime configuration (e.g. `DATABASE_URL`) in the Vercel project settings or via `vercel env add <NAME>` before the app depends on it — `vercel pull` in the workflow picks them up on the next deploy.
