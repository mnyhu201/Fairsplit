import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoutes.js';
import groupRoutes from './routes/groupRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root route for email confirmation redirects
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Fairsplit Node.js Backend',
    status: 'running',
    timestamp: new Date().toISOString(),
    note: 'If you\'re seeing this from an email confirmation link, please update your Supabase redirect URLs to point to your frontend instead of this backend.',
    frontend_url: process.env.CORS_ORIGIN || 'http://localhost:3000'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    available_routes: [
      'GET /',
      'GET /health',
      'GET /api/users',
      'POST /api/users/register',
      'POST /api/users/login',
      'GET /api/groups',
      'GET /api/groups/:id',
      'POST /api/groups',
      'PUT /api/groups/:id',
      'DELETE /api/groups/:id',
      'POST /api/groups/:groupId/users/:userId',
      'DELETE /api/groups/:groupId/users/:userId'
    ]
  });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 User endpoints: http://localhost:${PORT}/api/users`);
  console.log(`👥 Group endpoints: http://localhost:${PORT}/api/groups`);
});

export default app; 