# Algorithm Trading App

## Overview
This project is an algorithmic trading platform with real-time chat and AI integration.

## Original Problems and Issues
- The codebase had advanced and complex authentication logic including OTP verification and custom JWT token management.
- Authentication was tightly coupled with the backend and socket connections.
- There were no Firebase integrations for third-party authentication.
- Some bulky and unusual code related to Flask WebSocket integration and advanced auth made the codebase harder to maintain.
- No explicit API mismatch errors were found, but there were frequent authentication and token errors logged.

## Changes Made
- Removed all advanced authentication routes and OTP verification from the server.
- Removed JWT authentication middleware from WebSocket connections.
- Simplified client-side authentication by removing custom login/signup/OTP logic.
- Implemented Firebase Authentication for Google and GitHub login.
- Simplified AuthModal to only support Firebase login buttons and logout.
- Cleaned up bulky and unused auth-related code.

## Firebase Authentication Setup
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Google and GitHub authentication providers in the Firebase Console.
3. Replace the Firebase config in `client/src/components/auth/AuthContext.jsx` with your Firebase project config.
4. Run the client app. Users can now login using Google or GitHub via Firebase.

## Running the App
- Start the backend server:
  ```
  npm install
  npm start
  ```
- Start the frontend client:
  ```
  npm install
  npm run dev
  ```

## Notes
- The backend currently does not verify Firebase tokens. You may add middleware to verify Firebase ID tokens if needed.
- Flask WebSocket integration remains unchanged.

## Future Improvements
- Add backend Firebase token verification for enhanced security.
- Remove or refactor Flask WebSocket integration if not needed.
- Add comprehensive error handling and logging.

---

This README summarizes the original problems, the changes made for Firebase authentication, and instructions to set up and run the app.
