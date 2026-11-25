# wiland-electrical

Guide for Claude (interactive sessions and the factory workflow).

## Stack
React + Vite + react-bootstrap front end; `server.js` and Python `backend/`; Vercel/Render deploys.

## Before you change things, read
- STRATEGY.md
- render.yaml
- vercel.json

## Commands
```sh
# install
npm ci
# checks (run all before every PR)
npm run lint
npm run build
# run
npm run dev  # Vite, http://localhost:5173
```

## Factory
Issues labelled `factory` run through `.claude/factory/BLUEPRINT.md` (triage -> spec -> implement -> verify -> merge risk -> PR).
Skills: `.claude/skills/factory-triage`, `verify-with-proof`, `merge-risk`. Use them in interactive sessions too.

## Verification gotchas
<!-- Append one line per lesson learned while verifying (ports, env vars, logins, flaky selectors). -->
