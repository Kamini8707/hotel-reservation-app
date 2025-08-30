# Hotel Room Reservation System (Full Stack)

A complete solution for the SDE-3 assessment.

## Tech
- Frontend: Vite + React
- Backend: Node + Express (in-memory state)
- CORS enabled. Configure API URL via `VITE_API_URL` in frontend.

## Run locally

### Backend
```bash
cd backend
npm install
npm run dev
# listens on http://localhost:4000
```

### Frontend
```bash
cd frontend
npm install
# Point to backend (optional if using localhost:4000)
# echo VITE_API_URL=http://localhost:4000 > .env
npm run dev
# open the printed URL (default http://localhost:5173)
```

## Deploy (quick)
- **Backend**: Deploy to Render/Fly/Railway. Start command: `node server.js`.
- **Frontend**: Deploy to Netlify/Vercel. Set env `VITE_API_URL` to your backend URL.

## API
- `GET /state` → returns current occupancy and last booking
- `POST /book` body: `{ "count": 1..5 }`
- `POST /reset` → clears all bookings
- `POST /randomize` body: `{ "occupancyRatio": 0..1 }` (default 0.35)

## Allocation Logic (tl;dr)
1. Try to allocate all rooms on **one floor** minimizing horizontal span (`maxPos - minPos`).
2. If not possible, precompute on each floor the best **window** for sizes `1..k`.
3. DFS over floors to choose at most **one window per floor** whose sizes sum to `k`.
4. Travel time for a multi-floor selection is computed between the effective **first** and **last** rooms via the left stair:  
   `min( (p1-1) + 2*|f1-f2| + (p2-1), reverse )`.
5. Tie-breakers: lower travel time, fewer floors used, smaller farthest position, lower min floor.