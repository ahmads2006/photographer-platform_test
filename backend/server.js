const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

dotenv.config();

const { connectDatabase } = require('./config/db');
const registerChatSocket = require('./sockets/chatSocket');
const errorHandler = require('./middleware/errorHandler');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in environment variables.');
}

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/albums', require('./routes/albums'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/messages', require('./routes/messages')); // Keep existing messages route
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/interactions', require('./routes/interactions')); // Keep existing interactions route
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/moderation', require('./routes/moderation'));

registerChatSocket(io);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

connectDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MySQL connection failed:', error.message);
    process.exit(1);
  });
