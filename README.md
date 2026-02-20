# 🛡️ WarrantyWallet
### Never Lose a Receipt. Never Miss a Warranty.

WarrantyWallet is a full-stack web application that helps people organize their expensive electronics and appliances. One part acts as a **Digital Receipt Box** to prove ownership, and the other acts as a **Warranty Vault** to store warranty terms, PDF manuals, and support contacts.

![WarrantyWallet Dashboard](docs/images/dashboard.png)

---

## 👥 Team
| Member | Role |
|--------|-------|
| Sanket Kothari | Purchase Wallet Module — Full Stack (Backend + Frontend + DB) |
| Jinam Shah | Warranty Vault Module — Full Stack (Backend + Frontend + DB) |

---

## 🚀 Features

### 🧾 Purchase Wallet
- Add, edit, delete purchases with item name, store, price, date, category
- Upload receipt images (JPG, PNG, PDF) stored on Cloudinary
- Filter purchases by category (Electronics, Home, Appliances, Furniture)
- Search purchases by item name or store name
- Dashboard stats — total spent, item count, spending by category
- Fully independent module — works without Warranty Vault

### 📚 Warranty Vault
- Add, edit, delete warranty documents with product name, brand, support contacts
- Upload PDF manuals stored on Cloudinary
- Real-time warranty countdown showing exact days remaining
- Status badges — Active / Expiring Soon / Expired
- Search warranty docs by brand name
- Store support phone, email, and website per product
- Dashboard stats — total docs, active, expired, expiring soon
- Fully independent module — works without Purchase Wallet

### ⚙️ Email Reminder System
- Set notification email via settings modal in navbar
- Automated daily cron job runs every day at 9:00 AM
- Sends beautifully formatted HTML email alerts
- Covers both expired warranties and warranties expiring within 30 days
- Trigger manual reminder email anytime from settings

---

## 🖼️ Screenshots

### Dashboard — Purchase Wallet
![Purchase Wallet](docs/images/wallet.png)

### Dashboard — Warranty Vault
![Warranty Vault](docs/images/warranty-vault.png)

### Add Purchase Modal
![Add Purchase](docs/images/add-purchase.png)

### Add Warranty Document Modal
![Add Document](docs/images/add-document.png)

### Email Settings
![Email Settings](docs/images/email-settings.png)

### Warranty Reminder Email
![Email Preview](docs/images/email-preview.png)

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
├── server.js                       # Express server entry point
├── .env                            # Environment variables (not committed)
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Local Setup

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

### 4. Start the server
```bash
node server.js
```

### 5. Open in browser
```
http://localhost:3000
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

### Purchases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/purchases | Get all purchases |
| GET | /api/purchases/stats/summary | Get spending stats |
| GET | /api/purchases/:id | Get single purchase |
| POST | /api/purchases | Create purchase |
| PUT | /api/purchases/:id | Update purchase |
| DELETE | /api/purchases/:id | Delete purchase |

### Support Docs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/support | Get all support docs |
| GET | /api/support/stats/summary | Get warranty stats |
| GET | /api/support/search/:brand | Search by brand |
| GET | /api/support/:id | Get single doc |
| POST | /api/support | Create support doc |
| PUT | /api/support/:id | Update support doc |
| DELETE | /api/support/:id | Delete support doc |

### Email
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/email | Get notification email |
| POST | /api/email | Save notification email |
| POST | /api/email/test | Trigger reminder email |

---

## 📧 Gmail App Password Setup
1. Go to `myaccount.google.com`
2. Security → Enable **2-Step Verification**
3. Security → **App Passwords**
4. Select Mail → Generate
5. Copy 16-character password → paste as `EMAIL_PASS` in `.env`

---

## 🌐 Live Demo
[warranty-wallet.onrender.com](https://warranty-wallet.onrender.com) *(add after deployment)*

---

## 📌 User Personas
- **Jason (Tech Owner)** — Needs a safe place to upload receipts in case of theft or returns
- **Sarah (Frustrated User)** — Has a broken blender and needs to find the manual or support number quickly
- **Mike (Busy Parent)** — Wants to know if his TV is still under warranty before calling for repairs
