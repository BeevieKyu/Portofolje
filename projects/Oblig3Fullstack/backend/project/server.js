
/**
 * This file is the entry point for the backend.
 * It creates the express app
 * enables middleware, mount all route modules, handeling global errors, connceting to mongoDB
 * and starts the http server.
 */
import express from 'express'
import cors from 'cors';
import connectDB from './config/db.config.js';
import apiRoutes from './routes/api.routes.js';
import activityRoutes from './routes/activity.routes.js';
import gamesRoutes from './routes/games.routes.js';
import tournamentsRoutes from './routes/tournaments.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import commentsRoutes from './routes/comments.routes.js';
import errorHandler from './middleware/error.middleware.js';


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '10mb' }));
app.use(express.urlencoded({ limit: process.env.MAX_REQUEST_SIZE || '10mb', extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/activity', activityRoutes);
app.use('/api/users', apiRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/comments', commentsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use(errorHandler);

const startServer = async () => {
  try {

    await connectDB();

    app.listen(PORT, () => {
      console.log(`\nServer running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database: ${process.env.MONGO_URI || 'mongodb://localhost:27017/spanish_poker'}\n`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
