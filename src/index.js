import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { query, healthCheck } from './db.js';
import healthRoutes from './routes/health.js';
import notesRoutes from './routes/notes.js';

// Load environment variables/Henkiepenkie
dotenv.config();

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/health', healthRoutes);
app.use('/api/notes', notesRoutes);

/**
 * GET /
 * Home page - list all notes
 */
app.get('/', async (req, res) => {
  try {
    const result = await query('SELECT id, title, content, created_at FROM notes ORDER BY created_at DESC');
    res.render('index', { notes: result.rows });
  } catch (error) {
    console.error('Error rendering home page:', error);
    res.render('index', { notes: [], error: 'Failed to load notes' });
  }
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/**
 * Error handler
 */
app.use((err, req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`dotNOVI listening on port ${PORT}`);

  // Check database health
  try {
    const isHealthy = await healthCheck();
    if (isHealthy) {
      console.log('Database connection: OK');
    } else {
      console.warn('Database connection: FAILED - check DATABASE_URL');
    }
  } catch (error) {
    console.warn('Database health check error:', error.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
