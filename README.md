# 💡 Mobile servise system

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Next.js](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

---

### 📱 Система заявок на сервісне обслуговування мобільних телефонів.

- Заявка повинна містити: модель телефону, дату придбання, версію операційної системи, опис несправності, коментар майстра;

- Заявка може мати статуси: new, in progress, waiting customer response, waiting spare parts, failed, done;

- Можливість переводити в інший статус і додавати коментар майстра;

- Можливість вивести історію заявок.

---

### 📱 Mobile phone service request system.

- The request must contain: phone model, date of purchase, operating system version, description of the malfunction, technician's comments;

- The request can have the following statuses: new, in progress, waiting for customer response, waiting for spare parts, failed, done;

- Ability to change the status and add a technician's comment;

- Ability to display the request history.

---

When you open the site, you see Mobile phone service description and button log in, with text below to sign in.

If you choose log in you can enter client log in credentials, after that you would be on client page; Or if you enter special credentials (for example: Username: Master, Password: 12345678 ), then you would enter masters log in page, after right credentials you would enter master page.

On Client page you can create order and looking on history with all orders and their all info (status, model and etc.), also here would be search so you can easily find order you need.

On Master page you would have orders, and you can change theirs info, here also would be search.

---

## 🏗️ Architecture

### Microservices Design

The application follows a microservices architecture with independent services communicating through an API Gateway:

```
            ┌───────────────────────────┐
            │     Frontend (Next.js)    │
            │    Port 3000 (Browser)    │
            └────────────────┬──────────┘
                             │ HTTP/CORS
    ┌────────────────────────▼───────────────────────┐
    │            API Gateway (Express.js)            │
    │                 Port 8000                      │
    │ Routes requests to microservices, handles CORS │
    └────┬────────────────────────────────┬──────────┘
         │                                │
┌────────▼─────────────┐    ┌─────────────▼───────────┐
│   Auth Service       │    │   Order Service         │
│   Port 4001          │    │   Port 4002             │
│                      │    │                         │
│ • User registration  │    │ • Order CRUD operations │
│ • Login/Logout       │    │ • Status management     │
│ • Token generation   │    │ • History tracking      │
│ • Token validation   │    │ • Technician comments   │
└────────┬─────────────┘    └─────────────┬───────────┘
         │                                │
         └──────────────┬─────────────────┘
                        │
            ┌───────────▼──────────┐
            │    MongoDB Database  │
            │   Port 27017         │
            │                      │
            │ • Users collection   │
            │ • Orders collection  │
            │ • History logs       │
            └──────────────────────┘
```

---

## 📁 Project Structure

```
mobile-service-system/
├── docker-compose.yml          # Orchestrates all services
├── package.json                # Root dependencies & scripts
├── README.md                   # This file
│
├── frontend/                   # Next.js Frontend (Port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js         # Landing page
│   │   │   ├── login/          # Login & register page
│   │   │   ├── client/         # Client dashboard
│   │   │   │   ├── page.js     # View personal orders
│   │   │   │   └── create-order/ # Create new order
│   │   │   └── master/         # Master/Technician dashboard
│   │   │       └── page.js     # Manage all orders
│   │   ├── lib/
│   │   │   ├── api.js          # API client for backend
│   │   │   └── auth.js         # Authentication context
│   │   └── globals.css         # Tailwind styles
│   └── package.json
│
├── services/                   # Backend Microservices
│   │
│   ├── gateway/                # API Gateway (Port 8000)
│   │   ├── server.js           # Express server, proxy middleware
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── auth-service/           # Authentication Service (Port 4001)
│   │   ├── src/
│   │   │   ├── index.js        # Server setup
│   │   │   ├── controllers/
│   │   │   │   └── authController.js  # Login, register, refresh
│   │   │   ├── models/
│   │   │   │   └── User.js     # User schema & methods
│   │   │   ├── routes/
│   │   │   │   └── auth.js     # Route definitions
│   │   │   ├── middleware/
│   │   │   │   └── auth.js     # JWT verification
│   │   │   └── utils/
│   │   │       └── jwt.js      # Token generation & verification
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── order-service/          # Order Management Service (Port 4002)
│       ├── src/
│       │   ├── index.js        # Server setup
│       │   └── models/
│       │       └── Order.js    # Order schema
│       ├── Dockerfile
│       └── package.json
│
└── .github/
    └── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Docker & Docker Compose** (recommended for easy setup)
- **Node.js 18+** (if running locally without Docker)
- **MongoDB** (if running locally)

### Quick Start with Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/ShvyrydAlina/mobile-service-system.git
   cd mobile-service-system
   ```

2. **Start all services**

   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8000
   - MongoDB: localhost:27017

---

## 🔐 Default Credentials

### Master (Technician) Account
Can be created only by DB owner.

```
Username: Master
Password: 12345678
```

### Create Client Account

- Click "Sign up" on the login page
- Create any username (min 3 characters) and password (min 6 characters)
- Login with created credentials

---

## 📖 Future all functions

### For Clients

1. Login with your credentials
2. Click "Create Order"
3. Fill in device details (model, OS version, description)
4. Submit the order
5. View all your orders in the history section
6. Track repair status in real-time

### For Technicians/Masters

1. Login with Master credentials
2. View all repair orders in the dashboard
3. Update order status as work progresses
4. Add comments about the repair process
5. Mark orders as complete when done

---

## 📊 API Endpoints

### Authentication (`/api/auth`)

- `POST /login` - User login
- `POST /register` - Create new client account
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout user
- `GET /me` - Get current user info (requires token)

### Orders (`/api/orders`)

- `POST /` - Create new order
- `GET /` - Get all orders (master) or user's orders (client)
- `PUT /:id` - Update order status
- `DELETE /:id` - Delete order
