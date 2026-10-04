# FitSense AI

An AI-powered personalized fitness recommendation and workout tracking platform backend.

## 1. Project Description
FitSense is a modern REST API that allows users to manage their workout regimens securely and query Google Gemini AI for customized workout plans and deep analytical insights based on their exercise history.

## 2. Features
- **Secure User Authentication**: JWT and bcrypt implementation.
- **Workout Management**: Full CRUD capabilities restricted dynamically to the owning user.
- **Smart Analytics**: AI-Powered Fitness Recommendations utilizing Google Gemini.
- **Smart Insights**: AI-Powered Fitness Insights.
- **Search Capabilities**: Workout Search and Pagination across dynamic dates and categories.

## 3. Architecture
MVC + Service Layer Architecture ensuring isolated logic domains:
```
                   FitSense Client
                         |
                         ▼
                  Express REST API
                         |
                         ▼
                  JWT Middleware
                         |
                         ▼
                    Controllers
                    /                            /                             ▼             ▼
             Services        Mongoose
                |                |
                ▼                ▼
           Gemini AI          MongoDB
                              |
                              ▼
                           fitsense
                           /                              Users      Workouts
```

## 4. Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose
- **Security**: JWT (jsonwebtoken), bcryptjs, Helmet, express-rate-limit
- **AI**: Google Gemini SDK (`@google/genai`)

## 5. MongoDB Setup
You must have a MongoDB instance running locally on the standard port to start this backend.
Run the daemon using Homebrew (macOS) or your native service manager:
```bash
brew services start mongodb-community@8.0
```

## 6. Environment Variables
Create a `.env` file in the `/server` directory using the `.env.example` template:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/fitsense
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_real_gemini_key
CLIENT_URL=http://localhost:3000
```

## 7. Installation Commands
```bash
cd server
npm install
```

## 8. Running Commands
To start the API in development mode with auto-reload (Nodemon):
```bash
npm run dev
```
To run in standard mode:
```bash
npm start
```

## 9. API Documentation
### System
- `GET /api/health` - API health check and MongoDB connection status.

### Authentication (Rate Limited)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)

### Workouts (Protected)
- `POST /api/workouts` - Create a workout
- `GET /api/workouts` - Get all workouts (paginated)
- `GET /api/workouts/search` - Search workouts (query: name, category, date)
- `GET /api/workouts/:id` - Get workout by ID
- `PUT /api/workouts/:id` - Update a workout
- `DELETE /api/workouts/:id` - Delete a workout

### AI (Protected)
- `POST /api/ai/recommendation` - Get personalized workout recommendation
- `POST /api/ai/insights` - Get fitness insights based on workout history

## 10. Postman Testing Instructions
1. Open Postman and import `FitSense.postman_collection.json` located at the root of the repository.
2. The collection uses variables. Execute the `Register` or `Login` routes first.
3. The Postman collection has tests scripted to automatically extract the returned JWT and save it to the collection variable `{{token}}`.
4. All protected routes are pre-configured to use `Authorization: Bearer {{token}}`. You can test any workout/AI route immediately after logging in.

## 11. Gemini API Setup
FitSense relies on `gemini-2.5-flash` for rapid structured JSON generation. 
You must supply a valid API key from Google AI Studio. Place it in `server/.env` under `GEMINI_API_KEY`. 

## 12. Security Features
- **Password Protection**: Passwords mathematically hashed via bcrypt with a salt factor of 10. Never stored or returned in plaintext.
- **Data Isolation**: Strict `user: req.user._id` checks bound natively into every Mongoose query prevent cross-user data spillage (IDOR protection).
- **Rate Limiting**: `express-rate-limit` actively restricts Authentication routes against brute-force payload drops.
- **HTTP Headers**: `helmet` enforces strict transport security headers natively.
- **Validation**: Strict `express-validator` middleware intercepts bad data before touching database operations.

## 13. Future Enhancements
- Nutrition & Macro Tracking
- BMI Calculation & Health logging
- Fitness Analytics Dashboard (Charts)
- Social & Community Features
- Admin Dashboard
