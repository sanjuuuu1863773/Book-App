# 📚 Online Book Store System
## Microservices Architecture

A full-stack web application using Node.js, Express, MongoDB, and vanilla JS frontend.

---

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS)
       ↓
   API Gateway :5000
       ↓
┌──────┬──────┬──────┬──────────────┐
│User  │Book  │Order │Notification  │
│:5001 │:5002 │:5003 │:5004         │
└──────┴──────┴──────┴──────────────┘
  MongoDB × 4 separate databases
```

---

## 📦 Services

| Service | Port | Database |
|---------|------|----------|
| API Gateway | 5000 | — |
| User Service | 5001 | bookstore_users |
| Book Service | 5002 | bookstore_books |
| Order Service | 5003 | bookstore_orders |
| Notification Service | 5004 | — |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (running on localhost:27017)

### 1. Install Dependencies

Run in each service folder:
```bash
cd api-gateway       && npm install
cd ../user-service   && npm install
cd ../book-service   && npm install
cd ../order-service  && npm install
cd ../notification-service && npm install
```

### 2. Start All Services

Open **5 separate terminals**:

```bash
# Terminal 1
cd api-gateway && node index.js

# Terminal 2
cd user-service && node index.js

# Terminal 3
cd book-service && node index.js

# Terminal 4
cd order-service && node index.js

# Terminal 5
cd notification-service && node index.js
```

### 3. Seed Sample Books (optional)

```bash
cd book-service && node seed.js
```

### 4. Open Frontend

Open `frontend/index.html` in your browser.

---

## 🔌 API Endpoints (via Gateway at :5000)

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/users/register | Register new user |
| POST | /api/users/login | Login user |
| GET | /api/users/:id | Get user by ID |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/books | List all books |
| POST | /api/books | Add new book |
| GET | /api/books/:id | Get book details |
| PUT | /api/books/:id | Update book |
| DELETE | /api/books/:id | Delete book |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Place order |
| GET | /api/orders | Get all orders |
| GET | /api/orders/:id | Get order by ID |
| GET | /api/orders/user/:userId | Orders by user |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/notifications/welcome | Send welcome email |
| POST | /api/notifications/order | Send order email |

---

## 📧 Email Notifications

Edit `notification-service/.env` with your Gmail credentials:

```env
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

> Without credentials, emails are logged to the console.

---

## 🎨 Frontend Pages

- **Home** — Hero, featured books, architecture overview
- **Books** — Catalog with search, filter, sort
- **Book Details** — Full info + order button
- **Add Book** — Admin form to add books
- **My Orders** — Order history table
- **Login / Register** — Auth with JWT
