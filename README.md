# Photographer Collaboration Platform

Full-stack platform for photographers with JWT auth, uploads, albums/groups, and real-time chat.

## Stack
- Frontend: Next.js 14 (App Router)
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Realtime: Socket.io
- Uploads: Multer + local cloud-ready storage service

## Project Structure

```txt
backend/
  controllers/
  middleware/
  models/
  routes/
  services/storage/
  sockets/
  uploads/
  server.js
frontend/
  app/
  components/
  src/context/
  src/lib/
```

## Backend Setup

1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill values.
4. `npm start`

Backend runs at `http://localhost:5000`.

## Frontend Setup

1. `cd frontend`
2. `npm install`
3. Copy `.env.local.example` to `.env.local`
4. `npm run dev`

Frontend runs at `http://localhost:3000`.

## Main API Routes

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Photos: `/api/photos/upload`, `/api/photos`, `/api/photos/:id`
- Albums: `/api/albums`
- Groups: `/api/groups`
- Messages: `/api/messages`

## Notes

- Album participant limit is enforced at 3 users max.
- Socket chat supports `private`, `group`, and `album` rooms.
- Local storage can be swapped by extending `backend/services/storage`.
