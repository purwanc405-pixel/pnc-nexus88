minimal deploy note
Note: SQLite file DB is fine locally.
Serverless hosts may not persist local DB files; plan managed SQL later.
User must sign in to their host dashboard, import this repo, set AUTH_SECRET and DATABASE_URL, then publish.
Files prepared: vercel.json and .env.example.

Env: set AUTH_SECRET, DATABASE_URL; optional OPS_NOTIFY_EMAIL / OPS_NOTIFY_WA; COOKIE_SECURE=1 only behind HTTPS.
vercel.json framework nextjs is prepared; user must import repo on host dashboard.
