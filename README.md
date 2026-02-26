# 🛡️ WarrantyWallet

### Never Lose a Receipt. Never Miss a Warranty.

WarrantyWallet is a full-stack web application that helps people organize their expensive electronics and appliances. One part acts as a **Digital Receipt Box** to prove ownership, and the other acts as a **Warranty Vault** to store warranty terms, PDF manuals, and support contacts.

---

## 🌐 Live Demo
 [🔗 Open WarrantyWallet Live App](https://warranty-wallet-00hr.onrender.com/)

---

## 🎥 YouTube Demo Video
[📺 Watch Full Project Demo on YouTube](https://youtu.be/3a01h6u5Fxc)

---

## 👤 Authors

| Member | GitHub | Role |
|--------|--------|------|
| Sanket Kothari | [@Reachout-git-sk](https://github.com/Reachout-git-sk) | Purchase Wallet Module — Full Stack (Backend + Frontend + DB) |
| Jinam Shah | [@jinam-shah](https://github.com/jinam-shah) | Warranty Vault Module — Full Stack (Backend + Frontend + DB) |

---

## 🎓 Class

**Course:** CS5610 Web Development

**Class Link:** [Click Here](https://johnguerra.co/classes/webDevelopment_online_spring_2026/) 

---

## 🎯 Project Objective

WarrantyWallet solves the common problem of lost receipts and forgotten warranty deadlines. When electronics break, people discover they have lost the receipt or the warranty expired. Our platform lets users:

- Photograph and store receipts digitally
- Track warranty expiration dates with live countdowns
- Upload product manuals as PDFs
- Store manufacturer support contact information
- Receive automated email alerts before warranties expire

The app is split into two fully independent modules so each team member owns a complete full-stack vertical — from database to API to frontend UI.

---

## 🖼️ Screenshots

### Dashboard — Purchase Wallet
![Purchase Wallet](docs/images/dashboard.png)

### Dashboard — Warranty Vault
![Warranty Vault](docs/images/Warrantyvault_dashboard.png)

### Add Purchase Modal
![Add Purchase](docs/images/Add_purchase.png)

### Add Warranty Document Modal
![Add Document](docs/images/warranty_form.png)

### Email Settings
![Email Settings](docs/images/Email_update.png)

---

## 🚀 Features

### 🧾 Purchase Wallet (Sanket Kothari)
- Add, edit, delete purchases with item name, store, price, date, category
- Upload receipt images (JPG, PNG, PDF) stored on Cloudinary
- Filter purchases by category (Electronics, Home, Appliances, Furniture)
- Search purchases by item name or store name
- Dashboard stats — total spent, item count, spending by category
- Fully independent module — works without Warranty Vault

### 📚 Warranty Vault (Jinam Shah)
- Add, edit, delete warranty documents with product name, brand, support contacts
- Upload PDF manuals stored on Cloudinary
- Real-time warranty countdown showing exact days remaining
- Status badges — Active / Expiring Soon / Expired
- Search warranty docs by brand name
- Store support phone, email, and website per product
- Dashboard stats — total docs, active, expired, expiring soon
- Fully independent module — works without Purchase Wallet

### ⚙️ Email Reminder System (Jinam Shah)
- Set notification email via settings modal in navbar
- Automated daily cron job runs every day at 9:00 AM
- Sends beautifully formatted HTML email alerts
- Covers both expired warranties and warranties expiring within 30 days
- Trigger manual reminder email anytime from settings

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JavaScript ES6, HTML5, CSS3 |
| Backend | Node.js, Express.js |
| Database | MongoDB (Native Driver — no Mongoose) |
| File Storage | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Scheduler | node-cron |
| Architecture | Single Page Application (SPA) |

---

## 📁 Project Structure
```
Warranty-Wallet/
├── public/                         # Frontend
│   ├── css/
│   │   ├── style.css               # Global styles 
│   │   ├── wallet.css              # Wallet styles 
│   │   ├── support.css             # Warranty vault styles
│   │   └── settings.css            # Settings modal 
│   ├── js/
│   │   ├── app.js                  # Main router 
│   │   ├── wallet.js               # Wallet frontend logic
│   │   ├── support.js              # Warranty vault frontend 
│   │   └── settings.js             # Settings frontend 
│   └── index.html                  # Main HTML file
├── routes/
│   ├── walletRoutes.js             # Purchases CRUD API
│   ├── supportRoutes.js            # Support docs CRUD API 
│   └── emailRoutes.js              # Email settings API 
├── services/
│   └── reminderJob.js              # Daily cron job 
├── db/
│   ├── connect.js                  # MongoDB connection
│   └── cloudinary.js               # Cloudinary config
├── docs/
│   └── images/                     # README screenshots
├── scripts/
│   └── seedData.js                 # Database seeding script
├── server.js                       # Express server entry point
├── .env                            # Environment variables (not committed)
├── .gitignore
├── eslint.config.js                # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── LICENSE                         # MIT License
├── package.json
└── README.md
```

---

## ⚙️ Instructions to Build

### Prerequisites
- Node.js v18 or higher
- MongoDB Atlas account (free)
- Cloudinary account (free)
- Gmail account with App Password enabled

### 1. Clone the repository
```bash
git clone https://github.com/Reachout-git-sk/Warranty-Wallet.git
cd Warranty-Wallet
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file in root directory
```
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/warrantyWallet?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
```

### 4. Seed the database with sample data (optional)
```bash
node scripts/seedData.js
```

### 5. Start the server
```bash
node server.js
```

### 6. Open in browser
```
http://localhost:3000
```

### 7. Run linter
```bash
npx eslint routes/ db/ services/ server.js
```

### 8. Format code
```bash
npx prettier --write routes/ db/ services/ server.js public/js/
```

---

## 🗄️ MongoDB Collections

| Collection | Owner | Fields |
|------------|-------|--------|
| purchases | Sanket | itemName, storeName, price, purchaseDate, category, receiptFile, notes |
| support_docs | Jinam | productName, brand, warrantyExpiry, daysLeft, status, supportPhone, supportEmail, supportWebsite, manualFile, notes |
| settings | Shared | key, value (notification email) |

---

## 🔌 API Endpoints

### Purchases (Sanket)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/purchases | Get all purchases |
| GET | /api/purchases/stats/summary | Get spending stats |
| GET | /api/purchases/:id | Get single purchase |
| POST | /api/purchases | Create purchase |
| PUT | /api/purchases/:id | Update purchase |
| DELETE | /api/purchases/:id | Delete purchase |

### Support Docs (Jinam)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/support | Get all support docs |
| GET | /api/support/stats/summary | Get warranty stats |
| GET | /api/support/search/:brand | Search by brand |
| GET | /api/support/:id | Get single doc |
| POST | /api/support | Create support doc |
| PUT | /api/support/:id | Update support doc |
| DELETE | /api/support/:id | Delete support doc |

### Email (Sanket)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/email | Get notification email |
| POST | /api/email | Save notification email |
| POST | /api/email/test | Trigger reminder email |

---

## 🗄️ MongoDB Atlas Setup

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Click **"Create"** → Select the **Free** tier (M0 Sandbox) → Choose any cloud provider → Click **"Create Cluster"**
3. Go to **Database Access** → Click **"Add New Database User"**
   - Set a username and password (letters and numbers only — avoid special characters)
   - Set permission to **"Read and write to any database"**
4. Go to **Network Access** → Click **"Add IP Address"** → Select **"Allow Access from Anywhere"** (`0.0.0.0/0`)
5. Go to **Database** → Click **"Connect"** → Select **"Drivers"** → Copy the connection string
6. Replace `<username>` and `<password>` in the string with your actual credentials, and append the database name:
```
MONGO_URI=mongodb+srv://yourUsername:yourPassword@cluster0.xxxxx.mongodb.net/warrantyWallet?retryWrites=true&w=majority
```

---

## ☁️ Cloudinary Setup

1. Go to [https://cloudinary.com](https://cloudinary.com) and sign up for a free account
2. After logging in, go to your **Dashboard** (home page)
3. You will see all three required values on the dashboard:
   - **Cloud Name** → paste as `CLOUDINARY_CLOUD_NAME` in `.env`
   - **API Key** → paste as `CLOUDINARY_API_KEY` in `.env`
   - **API Secret** (click the eye icon to reveal) → paste as `CLOUDINARY_API_SECRET` in `.env`

---

## 📧 Gmail App Password Setup

1. Go to `myaccount.google.com`
2. Security → Enable **2-Step Verification**
3. Security → **App Passwords**
4. Enter any app name (e.g. `WarrantyWallet`) → Click **"Create"**
5. Copy the 16-character password shown → paste as `EMAIL_PASS` in `.env`
6. Paste your Gmail address as `EMAIL_USER` in `.env`

> **Note:** This is not your regular Gmail password. You must use the generated App Password.

---

## 🌐 Live Demo
[https://warranty-wallet-00hr.onrender.com](https://warranty-wallet-00hr.onrender.com)

---

## 📌 User Personas
- **Jason (Tech Owner)** — Needs a safe place to upload receipts in case of theft or returns
- **Sarah (Frustrated User)** — Has a broken blender and needs to find the manual or support number quickly
- **Mike (Busy Parent)** — Wants to know if his TV is still under warranty before calling for repairs

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).

Copyright (c) 2026 Sanket Kothari and Jinam Shah
