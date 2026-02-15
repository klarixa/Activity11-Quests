const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');

// ADVANCED CONCEPT: API Security Layers
// Each middleware serves a specific security purpose
// Research: Defense in depth, OWASP API Security Top 10
// Consider: Input validation, output encoding, authentication flows

// ARCHITECTURE DECISION: Middleware Stack Order
// The order of middleware matters for security and performance
// Question: Why is rate limiting after CORS but before authentication?
// Research: Express middleware execution flow

const app = express();
const PORT = process.env.PORT || 3000;

// PRODUCTION THINKING: Security Headers
// Helmet sets various HTTP headers for security
// Research: CSP, HSTS, X-Frame-Options, referrer policies
// Consider: Are default settings appropriate for APIs vs web apps?

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('combined'));

// BEST PRACTICE: CORS Configuration Strategy
// Wildcard origins (*) are convenient but insecure
// This whitelist approach is better, but how do you handle dynamic origins?
// Research: CORS preflight requests, credential handling

// CORS configuration
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ADVANCED CONCEPT: Rate Limiting Strategies
// Per-IP limiting prevents abuse but can hurt legitimate users
// Consider: Per-user limiting, distributed rate limiting, sliding windows
// Research: Token bucket vs fixed window vs sliding window algorithms

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // PRODUCTION THINKING: Rate Limit Tuning
  // 100 requests per 15 minutes = ~6.7 requests per minute
  // Is this too restrictive? Too lenient? How do you determine optimal rates?
  // Consider: Different limits for different endpoints, user tiers
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    retryAfter: '15 minutes',
    type: 'rate_limit_exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// ARCHITECTURE DECISION: Authentication Strategy
// API keys are simple but have limitations (no expiry, hard to rotate)
// Research: JWT tokens, OAuth 2.0, API key management best practices
// Consider: Key rotation, scoped permissions, audit logging

// API Key Authentication middleware
// API Key Authentication middleware
const authenticateApiKey = require('./middleware/auth');

// Apply authentication to all API routes
app.use('/api/', authenticateApiKey);

// ADVANCED CONCEPT: Observability and Monitoring
// Health checks are essential for production deployment
// Consider: Deep health checks (database, external APIs) vs shallow
// Research: Prometheus metrics, structured logging, distributed tracing

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

let requestCount = 0;
app.use('/api/', (req, res, next) => {
  requestCount++;
  next();
});

app.get('/api/status', (req, res) => {
  res.json({
    api_status: 'operational',
    version: '1.0.0',
    endpoints: {
      quests_list: 'GET /api/quests',
      quest_by_id: 'GET /api/quests/:id',
      complete_quest: 'POST /api/quests/:id/complete',
      player_profile: 'GET /api/players/:username',
      categories: 'GET /api/categories'
    },
    rate_limits: {
      requests_per_15_minutes: 100,
      current_usage: 'Available via /api/stats'
    },
    authentication: {
      type: 'API Key',
      header: 'X-API-Key',
      demo_key: 'demo_key_12345'
    },
    last_updated: new Date().toISOString()
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    total_requests: requestCount,
    requests_per_minute: Math.round(requestCount / (process.uptime() / 60)),
    server_uptime_seconds: Math.round(process.uptime()),
    active_connections: req.socket.server._connections || 0,
    memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
  });
});

// API Routes
app.use('/api/quests', require('./routes/quests'));
app.use('/api/players', require('./routes/players'));
app.use('/api/categories', require('./routes/categories'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🏆 Quest Tracker API v1.0',
    documentation: '/api/docs',
    health_check: '/health',
    api_status: '/api/status',
    endpoints: {
      quests: '/api/quests',
      players: '/api/players/:username',
      categories: '/api/categories'
    },
    authentication: {
      demo_key: 'demo_key_12345',
      usage: 'Include X-API-Key header or api_key query parameter'
    },
    version: '1.0.0',
    status: 'active',
    server_time: new Date().toISOString()
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Quest Tracker API Documentation',
    version: '1.0.0',
    description: 'A gamified todo/quest management API for learning purposes',
    base_url: `http://localhost:${PORT}/api`,
    authentication: {
      type: 'API Key',
      header: 'X-API-Key',
      demo_keys: ['demo_key_12345', 'test_key_67890'],
      note: 'Include API key in X-API-Key header or api_key query parameter'
    },
    endpoints: [
      {
        method: 'GET',
        path: '/api/quests',
        description: 'Get all quests with optional filtering',
        parameters: {
          status: 'Quest status (optional): pending, in_progress, completed',
          priority: 'Priority level (optional): low, medium, high, critical',
          category: 'Category filter (optional): work, health, personal, learning, creative'
        },
        example: '/api/quests?status=pending&priority=high&api_key=demo_key_12345'
      },
      {
        method: 'GET',
        path: '/api/quests/:id',
        description: 'Get specific quest by ID',
        parameters: {
          id: 'Quest ID (required)'
        },
        example: '/api/quests/1?api_key=demo_key_12345'
      },
      {
        method: 'POST',
        path: '/api/quests/:id/complete',
        description: 'Mark a quest as completed',
        parameters: {
          id: 'Quest ID (required)'
        },
        headers: {
          'X-API-Key': 'demo_key_12345'
        },
        example: 'POST /api/quests/1/complete'
      },
      {
        method: 'GET',
        path: '/api/players/:username',
        description: 'Get player profile and quest statistics',
        parameters: {
          username: 'Player username (required)',
          include_quests: 'Include quest details (optional): true/false'
        },
        example: '/api/players/alex?include_quests=true&api_key=demo_key_12345'
      },
      {
        method: 'GET',
        path: '/api/categories',
        description: 'Get quest categories with optional statistics',
        parameters: {
          search: 'Search categories (optional)',
          include_stats: 'Include statistics (optional): true/false'
        },
        example: '/api/categories?include_stats=true&api_key=demo_key_12345'
      }
    ],
    rate_limits: {
      requests_per_15_minutes: 100,
      burst_limit: 10
    },
    error_codes: {
      401: 'Unauthorized - Invalid or missing API key',
      404: 'Not Found - Resource does not exist',
      429: 'Too Many Requests - Rate limit exceeded',
      500: 'Internal Server Error - Server-side error'
    },
    testing: {
      curl_examples: [
        'curl "http://localhost:3000/api/quests?api_key=demo_key_12345"',
        'curl -H "X-API-Key: demo_key_12345" http://localhost:3000/api/quests/1',
        'curl -X POST -H "X-API-Key: demo_key_12345" http://localhost:3000/api/quests/1/complete'
      ]
    }
  });
});

// TESTING APPROACH: Error Handling Testing
// How do you test error scenarios without breaking things?
// Consider: Chaos engineering, error injection, circuit breaker testing
// Research: Error monitoring and alerting strategies

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on our end',
    timestamp: new Date().toISOString(),
    request_id: req.headers['x-request-id'] || 'unknown'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    available_endpoints: [
      'GET /',
      'GET /health',
      'GET /api/docs',
      'GET /api/quests',
      'GET /api/quests/:id',
      'POST /api/quests/:id/complete',
      'GET /api/players/:username',
      'GET /api/categories'
    ],
    documentation: '/api/docs',
    hint: 'Check the endpoint URL and HTTP method'
  });
});

// PRODUCTION THINKING: Graceful Shutdown Patterns
// Kubernetes and Docker send SIGTERM before killing containers
// Consider: Draining connections, saving state, notifying load balancers
// Research: Health checks during shutdown, circuit breaker patterns

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`⚡ Quest Tracker API server running on port ${PORT}`);
  console.log(`📖 Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🔑 Demo API Key: demo_key_12345`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/quests?api_key=demo_key_12345`);
});

module.exports = app;