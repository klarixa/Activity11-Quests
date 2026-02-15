const validApiKeys = new Set([
  'demo_key_12345',
  'test_key_67890',
  'student_key_abcde',
  'dev_key_quickstart'
]);

function authenticateApiKey(req, res, next) {
  // BEST PRACTICE: Public vs Protected Endpoints
  // Some endpoints should be public (docs, health) for operational reasons
  // Consider: API versioning, endpoint deprecation strategies
  // Research: OpenAPI specification for API documentation

  // Skip authentication for documentation and root endpoints
  if (req.path === '/' || req.path === '/health' || req.path === '/api/docs') {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey) {
    // PRODUCTION THINKING: Error Response Design
    // Good error messages help developers integrate successfully
    // But: Don't reveal too much about your system internals
    // Research: API error response standards, security vs usability
    return res.status(401).json({
      error: 'Authentication required',
      message: 'API key missing. Include X-API-Key header or api_key query parameter',
      documentation: '/api/docs',
      hint: 'Use demo_key_12345 for testing'
    });
  }

  if (!validApiKeys.has(apiKey)) {
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid',
      hint: 'Use demo_key_12345 for testing'
    });
  }

  // Add API key info and user info to request
  req.apiKey = apiKey;

  // Attach user information to req.user for downstream handlers
  const userMap = {
    'demo_key_12345': { id: 1, name: 'Demo User', role: 'demo' },
    'test_key_67890': { id: 2, name: 'Test User', role: 'tester' },
    'student_key_abcde': { id: 3, name: 'Student User', role: 'student' },
    'dev_key_quickstart': { id: 4, name: 'Developer', role: 'developer' }
  };
  req.user = userMap[apiKey] || { id: 0, name: 'Unknown', role: 'unknown' };

  next();
}

module.exports = authenticateApiKey;
