backend/
├── config/
│   ├── db.js             # MongoDB connection
│   ├── email.js          # Email service configuration
│   └── env.js            # Centralized environment variable management
├── controllers/
│   ├── authController.js # Authentication logic (signup, login, OTP verification)
│   ├── resourceController.js # Handles resource page logic
│   ├── chatController.js # Handles chat-related logic
│   └── stockController.js # LLM-based stock prediction logic
├── middlewares/
│   ├── auth.js           # Authentication middleware (JWT, session handling)
│   ├── error.js          # Error handling middleware (centralized error management)
│   ├── rateLimiter.js    # Prevents brute-force attacks
│   ├── validateRequest.js # Middleware for input validation
├── models/
│   ├── User.js           # User model (name, email, password, OTP, etc.)
│   ├── OTP.js            # OTP model for authentication
│   ├── Resource.js       # Resource model (documents, files, etc.)
│   ├── Chat.js           # Chat model for storing conversation history
│   ├── StockPrediction.js # Model for algorithmic trading predictions
├── routes/
│   ├── authRoutes.js     # Routes for authentication (signup, login, OTP)
│   ├── resourceRoutes.js # Routes for resources (upload, fetch)
│   ├── chatRoutes.js     # Routes for chat system
│   ├── stockRoutes.js    # Routes for stock predictions
├── services/
│   ├── emailService.js   # Handles email functionality (OTP sending)
│   ├── authService.js    # Business logic for authentication
│   ├── stockService.js   # Business logic for stock prediction using LLM
│   ├── chatService.js    # Business logic for chat feature
├── utils/
│   ├── validators.js     # Validation functions (email, password strength, etc.)
│   ├── responseHandler.js # Standardized API responses
│   ├── generateOTP.js    # Utility for OTP generation
├── .env                  # Environment variables (MongoDB URI, JWT Secret, etc.)
├── .gitignore            # Ignore sensitive files
├── package.json          # Dependencies and scripts
├── server.js             # Entry point - initializes app, middleware, and routes
└── README.md             # Documentation on setup and usage
