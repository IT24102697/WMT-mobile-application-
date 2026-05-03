================================================================================
                     URBANPLATE MOBILE APPLICATION
                         README - Project Overview
================================================================================

01). GitHub Repository Link

https://github.com/IT24102697/WMT-mobile-application-.git
 

02).Team Details

Group Number: 
Member 1: IT24102697 – Jayawardhana D D S – WMT
Member 2: IT24100930 – Devmika W P L – WMT
Member 3: IT24100095 – Widanagamage W D S N – WMT
Member 4: IT24101594 – Perera K G H D – WMT
Member 5: IT24101062 – Jayasekara P M S – WMT



03). Deployment Details

Backend URL: wmt-mobile-application-production.up.railway.app 

--------------------------------------------------------------------------------
TECH STACK
--------------------------------------------------------------------------------

  Frontend
  --------
  - React Native 0.81.5  (via Expo ~54.0.33)
  - React Navigation (Stack + Bottom Tabs)
  - Axios (HTTP client)
  - AsyncStorage (local token storage)
  - react-native-qrcode-svg (payment QR codes)
  - react-native-svg

  Backend
  -------
  - Node.js + Express.js 5.x
  - MongoDB Atlas  (via Mongoose 9.x)
  - JSON Web Token  (jsonwebtoken)
  - bcryptjs  (password hashing)
  - Nodemailer  (email verification / password reset)
  - dotenv, cors, multer

--------------------------------------------------------------------------------
PROJECT STRUCTURE
--------------------------------------------------------------------------------

  urbanplate-mobile/
  ├── backend/
  │   ├── controllers/        # Business logic (auth, menu, order, payment…)
  │   ├── models/             # Mongoose schemas (User, MenuItem, Order…)
  │   ├── routes/             # Express routers (authRoutes, menuRoutes…)
  │   ├── middleware/         # authMiddleware (protect, adminOnly, staffOnly)
  │   ├── config/             # DB connection config
  │   ├── .env                # Environment variables (see below)
  │   └── server.js           # App entry point
  │
  └── frontend/
      ├── screens/            # All application screens
      ├── components/         # Reusable UI components
      ├── navigation/         # Navigation configuration
      ├── context/            # CurrencyContext (global state)
      ├── services/           # API service helpers
      └── App.js              # Root navigator

--------------------------------------------------------------------------------
ENVIRONMENT VARIABLES  (backend/.env)
--------------------------------------------------------------------------------

  PORT=5000
  MONGO_URI=<your MongoDB Atlas connection string>
  JWT_SECRET=<your JWT secret key>
  EMAIL_USER=<your Gmail address>
  EMAIL_PASS=<your Gmail app password>
  BACKEND_URL=http://<your-local-ip>:5000

  NOTE: Replace <your-local-ip> with your machine's LAN IP (e.g. 192.168.1.10)
        so that the Expo app on a physical device can reach the backend.

--------------------------------------------------------------------------------
HOW TO RUN
--------------------------------------------------------------------------------

  BACKEND
  -------
  1. Navigate to the backend folder:
       cd urbanplate-mobile/backend

  2. Install dependencies:
       npm install

  3. Create / update the .env file with the values above.

  4. Start the development server:
       npm run dev          (uses nodemon – auto-restart on changes)
     OR
       npm start            (plain node)

  5. The server will run on:  http://localhost:5000

  FRONTEND
  --------
  1. Navigate to the frontend folder:
       cd urbanplate-mobile/frontend

  2. Install dependencies:
       npm install

  3. Update the BACKEND_URL in backend/.env to match your machine's LAN IP.
     Also update any hardcoded API base URL inside frontend/services/.

  4. Start the Expo development server:
       npm start            (or: npx expo start)

  5. Scan the QR code with the Expo Go app on your Android / iOS device,
     or press 'a' to open on an Android emulator.

--------------------------------------------------------------------------------
USER ROLES
--------------------------------------------------------------------------------

  Role           | Access Level
  ---------------|--------------------------------------------------------------
  Customer       | Browse menu, place orders, make payments, request refunds,
                 | view trust score & discounts, view order history
  Staff          | All customer access + manage orders, view inventory,
                 | restock items, process refunds, view analytics
  Admin          | Full access: CRUD on menu & inventory, user management,
                 | discount management, trust score management, staff approval

--------------------------------------------------------------------------------
API ROUTE GROUPS
--------------------------------------------------------------------------------

  /api/auth        Authentication (login, register, email verify, password reset)
  /api/users       User profile management
  /api/menu        Menu item CRUD & availability
  /api/orders      Order placement & status management
  /api/payment     Payment processing, invoices, refunds
  /api/inventory   Ingredient / stock management
  /api/trust       Trust scores & discount codes

  See API_Endpoint_Table.pdf for the full endpoint reference.

--------------------------------------------------------------------------------
MODELS
--------------------------------------------------------------------------------

  User           - name, email, password, role, isActive, trustScore
  MenuItem       - name, description, category, price, isAvailable, image
  Order          - customer, items[], totalAmount, status, timestamps
  Payment        - order, customer, amount, method, status, qrCode
  Refund         - order, customer, reason, status, refundAmount
  Ingredient     - name, quantity, unit, minStock, category
  Discount       - code, discountPercent, minTrustScore, isActive, expiresAt
  TrustHistory   - customer, changeAmount, reason, timestamps

--------------------------------------------------------------------------------
SCREENS
--------------------------------------------------------------------------------

  Auth           : LoginScreen, RegisterScreen, ForgotPasswordScreen
  Customer       : CustomerDashboard, MenuScreen, CartScreen,
                   MyOrdersScreen, PaymentScreen, InvoiceScreen,
                   RefundScreen, TrustScoreScreen, ProfileScreen,
                   CurrencyScreen
  Staff          : StaffDashboard, StaffOrdersScreen, InventoryScreen,
                   StaffApprovalScreen, MenuAnalyticsScreen,
                   StockManagementScreen, AdminRefundScreen
  Admin          : AdminDashboard, AdminMenuScreen, AdminDiscountScreen,
                   AdminRefundScreen, TrustScoreScreen

--------------------------------------------------------------------------------
NOTES
--------------------------------------------------------------------------------

  - JWT tokens are stored in AsyncStorage and sent via Authorization header.
  - Email verification is required before login for customer accounts.
  - Password reset uses a tokenised link sent to the registered email.
  - Trust scores affect discount eligibility for customers.
  - QR code payments are generated client-side using react-native-qrcode-svg.

================================================================================
                         END OF README
================================================================================
