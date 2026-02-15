# Quest Tracker API - Activity 11 - Discovery Challenge

Welcome to your advanced Express.js API project! This template helps you build a production-ready REST API for a gamified quest management system with authentication, rate limiting, and comprehensive error handling.

## 🎯 Learning Objectives

By completing this activity, you will:
- Build a complete REST API with Express.js
- Implement API key authentication and security middleware
- Design RESTful endpoints with proper HTTP methods and status codes
- Handle complex data filtering and query parameters
- Implement rate limiting to prevent API abuse
- Structure modular routes for scalable backend architecture
- Create comprehensive error handling patterns

## 🚀 Getting Started

### ⚡ Quick Start (See Results in 30 Seconds!)

**IMPORTANT: This template includes WORKING API ENDPOINTS! Test them immediately:**

1. **Navigate to this folder** in your terminal/command prompt
2. **Install dependencies** (REQUIRED - one-time setup):
   ```bash
   npm install
   ```
3. **Start the Express server**:
   ```bash
   npm start
   ```
   Server runs on: http://localhost:3000
4. **Open test.html** in your browser to interact with the API
5. **Try the working endpoints** - they return real data immediately!
   - Get all quests (with filtering)
   - Get player profiles and leaderboards
   - Browse quest categories
   - Complete quests and earn XP

### 🎯 What's Already Working

**70% of the API is implemented for you:**
- ✅ Quest listing with filters (status, priority, category - fully working)
- ✅ Quest details with enriched data (deadline calculations - fully working)
- ✅ Player profiles with statistics (fully working)
- ✅ Player leaderboard with rankings (fully working)
- ✅ Category browsing with statistics (fully working)
- ⚠️ Quest completion with XP rewards (TODO for you)
- ⚠️ Quest creation endpoint (TODO for you)
- ⚠️ Custom authentication middleware (TODO for you)
- ⚠️ Advanced filtering features (TODO for you)

### 📝 Your Learning Tasks

1. **First, test the working endpoints** using test.html or curl commands
2. **Study the existing route patterns** in routes/quests.js, routes/players.js
3. **Complete the TODO sections** following Express.js best practices
4. **Add your own creative API features**

## 📁 Project Structure

```
activity-11-quest-api/
├── server.js              # Main Express server (middleware setup)
├── routes/
│   ├── quests.js          # Quest CRUD endpoints
│   ├── players.js         # Player profiles and leaderboards
│   └── categories.js      # Quest categories
├── middleware/            # Authentication & logging (TODO section)
├── test.html             # Interactive API testing interface
├── package.json          # Dependencies and npm scripts
└── README.md            # This file
```

## 📋 Tasks to Complete

### TODO 1: Quest Completion Endpoint (Medium)
Complete the `POST /api/quests/:id/complete` endpoint to mark quests as completed and calculate XP rewards.

**API Endpoint:** `POST /api/quests/:id/complete`

**Success Criteria:**
- Updates quest status to "completed"
- Calculates base XP + bonus XP for early completion
- Records completion timestamp
- Returns updated quest data with XP earned
- Handles invalid quest IDs gracefully

**Hint:** Look at the enrichQuestData() function in routes/quests.js for the XP calculation pattern.

### TODO 2: Quest Creation Endpoint (Medium)
Implement the `POST /api/quests` endpoint to create new quests with validation.

**API Endpoint:** `POST /api/quests`

**Required Fields:**
- `title` (string, required)
- `description` (string, optional)
- `category` (string, required - work/health/personal/learning/creative)
- `priority` (string, required - low/medium/high/critical)
- `deadline` (ISO date string, optional)

**Success Criteria:**
- Validates all required fields
- Generates unique quest ID
- Sets default values (status: "pending", xp_reward based on priority)
- Returns created quest with 201 status code
- Returns 400 with helpful errors for invalid data

### TODO 3: Custom Authentication Middleware (Challenge)
Create custom authentication middleware in the `middleware/` folder to verify API keys.

**File to create:** `middleware/auth.js`

**Requirements:**
- Extract API key from `X-API-Key` header or `api_key` query parameter
- Verify key against valid API keys (see server.js for examples)
- Return 401 with clear error message if invalid
- Attach user information to `req.user` for valid keys
- Apply to all `/api/*` routes

**Success Criteria:**
- All `/api/*` endpoints require valid API key
- Invalid keys return 401 with helpful error message
- Valid keys allow request to proceed
- Test with both header and query parameter methods

### TODO 4: Advanced Quest Filtering (Challenge)
Enhance the `GET /api/quests` endpoint with advanced filtering capabilities.

**Features to implement:**
- Filter by multiple tags (comma-separated)
- Filter by difficulty level (easy/medium/hard)
- Date range filtering (created_after, deadline_before)
- Combine multiple filters (AND logic)
- Sort by multiple fields

**Success Criteria:**
- `/api/quests?tags=work,urgent&difficulty=hard` returns filtered results
- `/api/quests?deadline_before=2024-01-20&status=pending` works correctly
- Invalid filter values return 400 with helpful error message
- Empty results return appropriate message

### TODO 5: Player Statistics Enhancement (Easy)
Add calculated statistics to the player profile endpoint.

**Endpoint to enhance:** `GET /api/players/:username`

**Statistics to add:**
- Completion rate percentage (completed / total quests)
- Average XP per quest
- Current streak (consecutive days with completed quests)
- Most active category
- Total time spent on quests (sum of estimated_time)

**Success Criteria:**
- All statistics calculate correctly
- Returns 0 or appropriate defaults for players with no quests
- Statistics update dynamically based on quest data
- Include statistics in JSON response under `stats` object

## 🛠️ API Reference

### 🏆 Quest Endpoints

#### GET /api/quests (Working ✅)
Get all quests with filtering and sorting options.

**Query Parameters:**
- `status` - Filter by status (pending, in_progress, completed)
- `priority` - Filter by priority (low, medium, high, critical)
- `category` - Filter by category (work, health, personal, learning, creative)
- `sort_by` - Sort field (created_at, priority, deadline, xp_reward)
- `order` - Sort order (asc, desc)
- `limit` - Maximum results (default: 50)

**Example:**
```bash
curl "http://localhost:3000/api/quests?status=pending&priority=high&api_key=demo_key_12345"
```

#### GET /api/quests/:id (Working ✅)
Get detailed information about a specific quest with enriched data.

**Features included:**
- Days until deadline calculation
- Urgency indicators (overdue, urgent, normal)
- Difficulty information with emoji indicators
- XP reward details

#### POST /api/quests/:id/complete (TODO ⚠️)
Mark a quest as completed and calculate XP rewards.

#### POST /api/quests (TODO ⚠️)
Create a new quest with custom parameters.

### 👤 Player Endpoints

#### GET /api/players/:username (Working ✅)
Get comprehensive player profile and statistics.

**Available Players:**
- `alex` - Level 15, experienced player
- `jordan` - Level 8, intermediate player
- `sam` - Level 22, veteran player
- `demo` - Level 1, new player

**Query Parameters:**
- `include_quests` - Include detailed quest array (true/false)
- `include_stats` - Include calculated statistics (true/false, default: true)

#### GET /api/players (Working ✅)
Get player leaderboard with rankings and activity scores.

**Query Parameters:**
- `sort_by` - Sort field (level, xp, streak, activity)
- `order` - Sort order (asc, desc)
- `limit` - Maximum results (default: 10)

### 📂 Category Endpoints

#### GET /api/categories (Working ✅)
Get all quest categories with optional statistics.

**Available Categories:**
- 💼 Work & Career (1.2x XP multiplier)
- 🏃 Health & Fitness (1.1x XP multiplier)
- 🌟 Personal Life (1.0x XP multiplier)
- 📚 Learning & Skills (1.3x XP multiplier)
- 🎨 Creative Projects (1.1x XP multiplier)

**Query Parameters:**
- `search` - Search by name, description, or tags
- `include_stats` - Include quest statistics (true/false)
- `sort_by` - Sort field (name, popularity, xp_multiplier)

#### GET /api/categories/:id (Working ✅)
Get detailed category information with tips and suggestions.

## 🔐 Authentication

### API Key System
All `/api/*` endpoints require authentication via API key.

**Demo API Keys (use for testing):**
- `demo_key_12345` - Primary demo key
- `test_key_67890` - Secondary test key
- `student_key_abcde` - Student practice key
- `dev_key_quickstart` - Quick development key

**Authentication Methods:**

1. **Header Method (Recommended):**
```bash
curl -H "X-API-Key: demo_key_12345" http://localhost:3000/api/quests
```

2. **Query Parameter Method:**
```bash
curl "http://localhost:3000/api/quests?api_key=demo_key_12345"
```

**Security Features:**
- Rate Limiting: 100 requests per 15 minutes per IP
- Helmet.js: Security headers protection
- CORS: Controlled cross-origin access
- Input Validation: Parameter sanitization

## 🧪 Testing Your API

### Interactive Test Interface (Recommended)
**Open `test.html` in your browser** for a comprehensive testing interface:

- Test all endpoints with visual feedback
- Try different API keys and parameters
- See real-time request/response data
- Test error scenarios (invalid keys, missing data)
- Performance testing with concurrent requests

### Command Line Testing

**Quick test commands:**

```bash
# 1. Get all quests (test basic endpoint)
curl "http://localhost:3000/api/quests?api_key=demo_key_12345"

# 2. Get specific quest (test parameterized route)
curl "http://localhost:3000/api/quests/1?api_key=demo_key_12345"

# 3. Get player profile (test data enrichment)
curl "http://localhost:3000/api/players/alex?api_key=demo_key_12345"

# 4. Filter quests by priority (test query parameters)
curl "http://localhost:3000/api/quests?priority=high&api_key=demo_key_12345"

# 5. Get categories with stats
curl "http://localhost:3000/api/categories?include_stats=true&api_key=demo_key_12345"

# 6. Test authentication (should fail without API key)
curl http://localhost:3000/api/quests
```

### Manual Testing Checklist
- [ ] Server starts without errors on port 3000
- [ ] GET /api/quests returns quest array
- [ ] GET /api/quests/:id returns single quest with enriched data
- [ ] GET /api/players/:username returns player profile
- [ ] GET /api/players returns leaderboard
- [ ] GET /api/categories returns all categories
- [ ] Invalid API key returns 401 error
- [ ] Missing API key returns 401 error
- [ ] test.html loads and displays all endpoints

### Debugging Tips
1. **Check server console** for request logs (Morgan middleware)
2. **Use browser DevTools** Network tab when testing via test.html
3. **Add console.log()** statements in route handlers
4. **Test with curl** to isolate frontend/backend issues
5. **Check /health endpoint** to verify server status

## 🚀 Extension Challenges

Ready to take your API skills further? Try these bonus features:

### Beginner Extensions
- **Quest Update Endpoint**: Add PUT `/api/quests/:id` to update quest details
- **Quest Deletion**: Implement DELETE `/api/quests/:id` with proper error handling
- **Search by Title**: Add search functionality to find quests by title/description
- **Custom Sorting**: Allow sorting by multiple fields simultaneously
- **Response Pagination**: Add pagination with `page` and `per_page` parameters

### Intermediate Extensions
- **Player Registration**: Create POST `/api/players` to register new players
- **Quest Assignment**: Allow assigning quests to specific players
- **Achievement System**: Track achievements with unlock conditions
- **Quest Updates**: Allow players to update quest progress (0-100%)
- **Category Statistics**: Add more detailed category analytics

### Advanced Extensions
- **Database Integration**: Replace in-memory data with MongoDB/PostgreSQL
- **JWT Authentication**: Implement token-based auth instead of API keys
- **Real-time Updates**: Add WebSocket support for live quest updates
- **API Versioning**: Create v1, v2 endpoints with different features
- **File Uploads**: Allow players to upload quest completion proof
- **Email Notifications**: Send reminders for approaching deadlines
- **Leaderboard History**: Track leaderboard changes over time

### Creative Extensions
- **Quest Dependencies**: Link quests in sequences (complete A before B)
- **Team Quests**: Collaborative quests for multiple players
- **Recurring Quests**: Habit tracking with daily/weekly patterns
- **Quest Templates**: Reusable quest blueprints
- **Social Features**: Quest sharing, comments, and likes
- **Analytics Dashboard**: Visual charts for completion trends
- **Mobile API Optimization**: Add endpoints optimized for mobile apps

## 🎓 Learning Resources

### Express.js & REST APIs
- [Express.js Official Documentation](https://expressjs.com/)
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes Reference](https://httpstatuses.com/)
- [MDN HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)

### Authentication & Security
- [API Authentication Guide](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Rate Limiting Strategies](https://www.npmjs.com/package/express-rate-limit)

### Testing & Debugging
- [Testing REST APIs with Postman](https://www.postman.com/)
- [curl Command Guide](https://curl.se/docs/manual.html)
- [Express.js Error Handling](https://expressjs.com/en/guide/error-handling.html)

## 🏆 Success Criteria

Your project is complete when:
- ✅ All 5 TODO tasks are implemented and working
- ✅ Server starts without errors and responds on port 3000
- ✅ All API endpoints return appropriate status codes
- ✅ Authentication middleware validates API keys correctly
- ✅ Error handling provides helpful messages
- ✅ test.html successfully calls all endpoints
- ✅ Code is clean with proper comments and structure
- ✅ API responses follow consistent JSON format

## 🎉 Congratulations!

Once you complete this project, you'll have:
- Built a production-ready REST API with Express.js
- Implemented authentication and security middleware
- Designed RESTful endpoints following industry standards
- Handled complex data filtering and query parameters
- Created comprehensive error handling patterns
- Gained confidence building scalable backend applications

This foundation will serve you well in building real-world APIs, microservices, and full-stack applications!

---

**Need Help?**
- Check server console logs for error messages (Morgan middleware)
- Test endpoints individually using test.html or curl
- Review existing route handlers for implementation patterns
- Add console.log() statements to trace data flow
- Verify API keys are included in all requests
- Check that JSON is properly formatted in POST requests

**Common Issues:**
- **Port 3000 in use**: Change PORT in server.js or kill existing process
- **401 Unauthorized**: Verify API key is included in header or query
- **CORS errors**: Check origin configuration in server.js
- **JSON parse errors**: Ensure Content-Type: application/json header

Happy coding!