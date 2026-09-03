# Deploying to Vercel — Step-by-Step Guide

This project is structured as **two separate Vercel projects** sharing one GitHub repository:
one for the React/Vite frontend (`client/`) and one for the Express API (`server/`).

> **A note on InfinityFree:** InfinityFree only hosts static files and PHP — it cannot run a
> Node.js/Express server. You could host the built `client/dist` static files there, but the
> `server/` API (and therefore the whole working application) needs a Node-capable host.
> Vercel (free tier) works well for both parts, so that's what this guide covers. Render and
> Railway are solid alternatives for the backend if you'd rather not run it on Vercel.

---

## 1. Create a GitHub repository
1. Go to [github.com/new](https://github.com/new) and create an empty repository (e.g. `campus-food-ordering`).
2. Do **not** initialize it with a README (you already have one).

## 2. Push the project to GitHub
From the project's root folder (works the same whether you built it in Replit or locally):
```bash
git init
git add .
git commit -m "Initial commit: Campus Food Ordering System"
git branch -M main
git remote add origin https://github.com/<your-username>/campus-food-ordering.git
git push -u origin main
```

## 3. Configure the hosted MySQL database (do this before deploying the backend)
Vercel does not host databases, so use an externally hosted MySQL-compatible service. Options that
offer a usable free/low-cost tier: **Railway**, **Aiven**, **Clever Cloud**, or your institution's
own MySQL server if it's reachable from the internet.
1. Create a database instance and note the host, port, username, password, and database name.
2. Run the schema and (optionally) sample data against it:
   ```bash
   mysql -h <host> -P <port> -u <user> -p <database> < database/schema.sql
   mysql -h <host> -P <port> -u <user> -p <database> < database/sample-data.sql
   ```
3. If the provider requires SSL, keep `DB_SSL=true` in the backend's environment variables.

## 4. Create the backend project on Vercel
1. Log in to [vercel.com](https://vercel.com) and click **Add New → Project**.
2. Import your GitHub repository.
3. When asked for the **Root Directory**, set it to `server`.

## 5. Set the backend Root Directory to `server`
This is the same step as above — make sure it says `server`, not the repository root. Vercel will
detect it as a Node.js project.

## 6. Create the frontend project on Vercel
1. From the Vercel dashboard, click **Add New → Project** again.
2. Import the **same** GitHub repository a second time.
3. Set the **Root Directory** to `client`. Vercel will auto-detect the Vite framework preset.

## 7. Set the frontend Root Directory to `client`
Confirm the build command is `npm run build` and the output directory is `dist` (Vercel's Vite
preset sets this automatically).

## 8. Add Environment Variables
On the **backend** project (Settings → Environment Variables), add:
```
NODE_ENV=production
DB_HOST=...
DB_PORT=3306
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
DB_SSL=true          # if your provider requires it
JWT_SECRET=<a long random string>
CLIENT_URL=https://<your-frontend-project>.vercel.app
PAYSTACK_ENABLED=false
PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
```
On the **frontend** project, add:
```
VITE_API_URL=https://<your-backend-project>.vercel.app/api
VITE_PAYSTACK_ENABLED=false
```

## 9. Set `VITE_API_URL`
This must point at your deployed backend's `/api` path (see above). Without the `/api` suffix,
every request from the frontend will 404.

## 10. Set `CLIENT_URL`
This must exactly match your deployed frontend's URL (including `https://`). It's used to
configure CORS on the backend — a mismatch here is the #1 cause of CORS errors after deployment.

## 11. Configure CORS
No code changes are needed — `server/app.js` reads `CLIENT_URL` and only allows that origin
(comma-separate multiple origins if you have a custom domain too, e.g.
`CLIENT_URL=https://app.example.com,https://www.example.com`).

## 12. Redeploy after adding environment variables
Environment variable changes do **not** apply to already-built deployments. After adding or
changing any variable, go to the project's **Deployments** tab and choose **Redeploy** (or push a
new commit) for both the frontend and backend projects.

## 13. Test the deployed application
1. Open the frontend URL and confirm the landing page loads.
2. Log in with a sample account (see the main `README.md`).
3. Place a test order end-to-end: browse → cart → checkout → track order status.
4. Log in as the vendor and admin accounts to confirm their dashboards load real data.

## 14. Troubleshooting database connection errors
- Double-check `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` are exactly right (no
  trailing spaces — a common copy-paste issue).
- If your provider requires SSL and you see a connection error, set `DB_SSL=true`.
- Some providers only allow connections from an IP allow-list — check whether you need to allow
  `0.0.0.0/0` (all IPs) since Vercel's serverless functions don't have a fixed IP.
- Check the backend project's **Logs** tab on Vercel for the exact MySQL error message.

## 15. Troubleshooting CORS errors
- Confirm `CLIENT_URL` on the backend exactly matches the frontend's deployed URL, protocol
  included (`https://`, no trailing slash).
- Remember to **redeploy the backend** after changing `CLIENT_URL` — see step 12.
- Open your browser's dev tools → Network tab → check the failed request's response headers for
  `Access-Control-Allow-Origin` to confirm what the server is actually sending.

## 16. Troubleshooting 404 API errors
- Confirm `VITE_API_URL` includes the `/api` suffix and points at the **backend** project's URL,
  not the frontend's.
- Confirm the frontend was rebuilt after changing `VITE_API_URL` (Vite bakes env vars in at build
  time — a redeploy is required, not just a restart).
- Visit `https://<your-backend>.vercel.app/api/health` directly in the browser — you should see a
  small JSON success message. If that 404s, the backend Root Directory setting (step 5) is
  probably wrong.

---

## Local development recap
```bash
# Terminal 1
cd server && npm install && npm run dev

# Terminal 2
cd client && npm install && npm run dev
```
Visit `http://localhost:5173`. See the main `README.md` for database setup and sample accounts.
