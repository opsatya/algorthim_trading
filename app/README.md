# Algorithmic Trading Platform (MERN Stack)

This project is a **full-stack MERN application** for **algorithmic trading**, featuring **user authentication with OTP verification**, **resource management**, **real-time chat functionalities**, and **LLM-based stock price prediction**. The platform allows **trade execution via chatbot using the 5paisa API** and is **deployable on AWS**.

---

## **Features**

✅ **User Authentication** (Signup, Login, OTP Verification, JWT)  
✅ **Email-based OTP Verification** (via Nodemailer)  
✅ **Secure Password Hashing** (via bcrypt)  
✅ **MongoDB for Data Storage**  
✅ **Resource Page for Trading Information**  
✅ **Real-time Chat System** (via WebSocket.io)  
✅ **Stock Price Analysis & Prediction via Chat**  
✅ **Trade Execution via Chatbot** (5paisa API Integration)  
✅ **Real-time Chat for Stock Prediction Analysis**  
✅ **AWS Deployment Support**  

---

## **Tech Stack**

- **Frontend:** React.js, Context API, TailwindCSS  
- **Backend:** Node.js, Express.js, Socket.io  
- **Database:** MongoDB  
- **Authentication:** JWT, bcrypt, Nodemailer (for OTP)  
- **Stock Trading API:** 5paisa API  
- **Deployment:** AWS (Backend & Frontend)
---

## **Getting Started**

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/your-repo/algorithmic-trading-platform.git
cd algo-trade
```

### **2️⃣ Install Dependencies**
#### Backend
```sh
cd server
npm install
```
#### Frontend
```sh
cd ../client
npm install
```

### **3️⃣ Setup Environment Variables**
Create a `.env` file inside the **backend** folder with the following:
```ini
PORT=5000
MONGO_URI=mongodb+srv://your_mongodb_url
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=your-email@gmail.com
OTP_EXPIRY_MINUTES=3
5PAISA_API_KEY=your_5paisa_api_key
5PAISA_CLIENT_CODE=your_5paisa_client_code
```

### **Backend (Express.js + MongoDB)**
```sh
cd server
npm run dev
```
Your backend should run at: `http://localhost:5000`

### **Frontend (React.js)**
```sh
cd server
npm start
```
Your frontend should run at: `http://localhost:3000`

---

## **API Endpoints**

### **1️⃣ Authentication APIs**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | User registration & OTP send |
| `/api/auth/verify-otp` | POST | Verify OTP & activate account |
| `/api/auth/login` | POST | User login & JWT token generation |

### **2️⃣ Chat APIs**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/send-message` | POST | Send chat message |
| `/api/chat/get-messages` | GET | Fetch chat messages |
| `/api/chat/connect` | WS | Real-time chat connection via WebSocket |

### **3️⃣ Resource APIs**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/resources/add` | POST | Add trading resources |
| `/api/resources/get` | GET | Fetch resources |

### **4️⃣ Trading APIs**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/trading/predict` | GET | Predict stock prices using LLM |
| `/api/trading/place-order` | POST | Execute trade via 5paisa API |

---

## **Authentication Flow**
1. **Signup:** User registers with **name, email, password**.
2. **OTP Verification:** User receives an OTP via email & verifies it.
3. **Login:** User logs in with **email & password**.
4. **JWT Token:** On successful login, a **JWT token** is generated for authentication.
5. **Access Protected Routes:** User accesses the dashboard, chat, and trading resources.

---

## **Deployment**

### **Backend Deployment (AWS EC2)**
1. Push your backend code to GitHub.
2. Deploy to **AWS EC2 **.
3. Set **environment variables** in the deployment platform.

### **Frontend Deployment (AWS S3)**
1. Push your frontend code to GitHub.
2. Deploy to **AWS S3**.
3. Set the **backend API URL** inside `frontend/src/config.js`.

---

## **Troubleshooting**
❌ **MongoDB not connecting?** → Check `MONGO_URI` in `.env`.  
❌ **Emails not sent?** → Verify `EMAIL_USERNAME` & `EMAIL_PASSWORD`.  
❌ **WebSocket connection issue?** → Ensure backend WebSocket server is running.  
❌ **5paisa API not working?** → Verify `5PAISA_API_KEY` & `5PAISA_CLIENT_CODE`.  

---

## **Contributing**
- Feel free to fork and submit pull requests!
- Open issues for bug reports & feature requests.

---

## **License**
MIT License. Use freely! 🚀

