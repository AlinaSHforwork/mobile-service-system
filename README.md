# Mobile Phone Service Management System

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge\&logo=javascript\&logoColor=%23F7DF1E)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge\&logo=postgresql\&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge\&logo=express\&logoColor=%2361DAFB)
![Next.js](https://img.shields.io/badge/Next-black?style=for-the-badge\&logo=next.js\&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge\&logo=node.js\&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge\&logo=docker\&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge\&logo=JSON%20web%20tokens)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge\&logo=tailwind-css\&logoColor=white)

---

## About the Project

A web application for managing mobile phone repair requests. The system supports two types of users: **clients** (device owners) and **technicians** (repair specialists). It is implemented using a microservices architecture with separate authentication and order processing services.

### Functional Requirements

Each repair request contains:

* Phone model and device type
* Purchase date
* Operating system version
* Detailed issue description
* Technician comment

Available request statuses:

* `new` — newly created
* `in progress` — currently being repaired
* `waiting customer response` — waiting for customer feedback
* `waiting spare parts` — waiting for spare parts
* `failed` — repair failed
* `done` — completed

---

## Architecture

The application is built using a microservices architecture. All services communicate through an API Gateway.

```text
            ┌───────────────────────────────┐
            │      Frontend (Next.js)       │
            │      Port 3000 (Browser)      │
            └──────────────┬────────────────┘
                           │ HTTP / CORS
    ┌──────────────────────▼──────────────────────┐
    │             API Gateway (Express.js)        │
    │                  Port 8000                  │
    │   Proxy routing + CSRF protection           │
    └────┬─────────────────────────────────┬──────┘
         │                                 │
┌────────▼──────────────┐    ┌─────────────▼───────────┐
│    Auth Service       │    │    Order Service         │
│    Port 4001          │    │    Port 4002             │
│                       │    │                          │
│  • Registration       │    │  • Order CRUD            │
│  • Login / Logout     │    │  • Status management     │
│  • JWT tokens         │    │  • Technician assignment │
│  • Refresh tokens     │    │  • Chat between users    │
│  • Rate limiting      │    │  • Search & pagination   │
│  • Account lockout    │    │  • Repair pricing        │
└────────┬──────────────┘    └─────────────┬───────────┘
         │                                 │
         └────────────────┬────────────────┘
                          │
             ┌────────────▼─────────────┐
             │      PostgreSQL 16       │
             │        Port 5432         │
             │                          │
             │  • users table           │
             │  • masters table         │
             │  • orders table          │
             │  • messages table        │
             └──────────────────────────┘
```

---

## Project Structure

```text
mobile-service-system/
├── docker-compose.yml
├── .env.example
├── README.md
│
├── frontend/                        # Next.js Frontend (Port 3000)
│   └── src/
│       ├── app/
│       │   ├── page.js              # Landing page
│       │   ├── layout.js            # Root layout, providers
│       │   ├── login/page.js        # Login / registration page
│       │   ├── client/
│       │   │   ├── page.js          # Client dashboard
│       │   │   ├── create-order/    # Create order form
│       │   │   └── order/[id]/      # Order details + chat
│       │   └── master/
│       │       ├── page.js          # Technician dashboard
│       │       └── order/[id]/      # Edit order + chat
│       ├── components/
│       │   ├── Header.js            # Fixed header with settings
│       │   └── SettingsPanel.js     # Theme and language settings
│       └── lib/
│           ├── api.js               # HTTP client with CSRF and JWT
│           ├── auth.js              # Authentication context
│           ├── i18n.js              # Internationalization (EN / UK)
│           └── theme.js             # Theme context (light / dark)
│
└── services/
    ├── gateway/                     # API Gateway (Port 8000)
    │   └── server.js                # Proxy, CORS, CSRF middleware
    │
    ├── auth-service/                # Authentication Service (Port 4001)
    │   └── src/
    │       ├── index.js
    │       ├── controllers/authController.js
    │       ├── db/
    │       │   ├── pool.js          # PostgreSQL connection pool
    │       │   └── init.js          # Database schema initialization
    │       ├── middleware/auth.js   # JWT verification
    │       ├── models/
    │       │   ├── User.js          # Client model
    │       │   └── Master.js        # Technician model
    │       ├── routes/auth.js
    │       └── utils/jwt.js         # Token generation and verification
    │
    └── order-service/               # Order Service (Port 4002)
        └── src/
            ├── index.js
            ├── controllers/
            │   ├── ordersController.js
            │   └── messagesController.js
            ├── db/
            │   ├── pool.js
            │   └── init.js          # Orders + messages schema
            ├── middleware/auth.js
            ├── models/
            │   ├── Order.js
            │   └── Message.js
            └── routes/orders.js
```

---

## Technology Stack

| Category             | Technology                              |
| -------------------- | --------------------------------------- |
| Frontend             | Next.js 15, React 19, Tailwind CSS 4    |
| Backend              | Express.js 4/5, Node.js 18+             |
| Database             | PostgreSQL 16                           |
| ORM / DB Client      | pg (node-postgres), raw SQL queries     |
| Authentication       | JWT (access + refresh), bcryptjs        |
| Security             | Helmet, CSRF tokens, express-rate-limit |
| Validation           | express-validator                       |
| Containerization     | Docker, Docker Compose                  |
| Proxy                | http-proxy-middleware                   |
| Internationalization | Custom implementation (EN / UK)         |

---

## Database

The PostgreSQL schema is initialized automatically when each service starts.

### `users` Table

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
username TEXT UNIQUE NOT NULL,
password TEXT NOT NULL,
role TEXT CHECK (role IN ('client','master')) DEFAULT 'client',
refresh_tokens TEXT[] DEFAULT '{}',
login_attempts INT DEFAULT 0,
lock_until TIMESTAMPTZ,
last_login TIMESTAMPTZ,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
```

### `masters` Table

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
username TEXT UNIQUE NOT NULL,
password TEXT NOT NULL,
display_name TEXT,
is_active BOOLEAN DEFAULT true,
last_login TIMESTAMPTZ,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
```

### `orders` Table

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
client_id UUID NOT NULL,
device_type TEXT NOT NULL,
device_model TEXT NOT NULL,
os_version TEXT NOT NULL,
date_of_purchase DATE,
issue_description TEXT NOT NULL,
technician_comment TEXT,
status TEXT CHECK (status IN ('new','in progress','waiting customer response',
                              'waiting spare parts','failed','done')) DEFAULT 'new',
assigned_to UUID,
cost DECIMAL(10,2),
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
```

### `messages` Table

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
sender_id UUID NOT NULL,
sender_role TEXT CHECK (sender_role IN ('client','master')),
content TEXT NOT NULL,
created_at TIMESTAMPTZ DEFAULT now()
```

---

## Security

* **JWT Access + Refresh Tokens** — short-lived access token (7 days) with refresh token rotation (30 days)
* **Bcrypt** — password hashing with configurable rounds (default: 12)
* **Account Lockout** — after 5 failed login attempts, the account is locked for 15 minutes
* **Rate Limiting** — 10 login attempts / 15 min, 5 registrations / hour, 500 global requests / 15 min
* **CSRF Protection** — double verification using cookie + `x-csrf-token` header for all mutating requests
* **Helmet** — secure HTTP headers
* **Input Validation** — express-validator on all routes
* **UUID Validation** — ID format validation on both client and server
* **Role-Based Access Control** — clients can only see their own orders, technicians can edit only assigned orders
* **Request Body Size Limit** — limited to 10kb to prevent DoS attacks

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Path        | Description                  | Access |
| ------ | ----------- | ---------------------------- | ------ |
| POST   | `/login`    | Login (client or technician) | Public |
| POST   | `/register` | Register a new client        | Public |
| POST   | `/refresh`  | Refresh access token         | Public |
| POST   | `/logout`   | Logout                       | JWT    |
| GET    | `/me`       | Current authenticated user   | JWT    |
| GET    | `/verify`   | Verify token                 | JWT    |

### Orders (`/api/orders`)

| Method | Path                 | Description                   | Access        |
| ------ | -------------------- | ----------------------------- | ------------- |
| POST   | `/`                  | Create order                  | Client        |
| GET    | `/`                  | List orders (with filters)    | Client/Master |
| GET    | `/my/orders`         | Orders assigned to technician | Technician    |
| GET    | `/:id`               | Order details                 | Client/Master |
| PUT    | `/:id`               | Update status/comment/cost    | Client/Master |
| PUT    | `/:id/assign`        | Accept order for work         | Technician    |
| DELETE | `/:id`               | Delete order (status = new)   | Client/Master |
| POST   | `/:orderId/messages` | Send message                  | Client/Master |
| GET    | `/:orderId/messages` | Get messages                  | Client/Master |

### Query Parameters for GET `/api/orders`

| Parameter | Type   | Description                           |
| --------- | ------ | ------------------------------------- |
| `search`  | string | Search by model, description, comment |
| `status`  | string | Filter by status                      |
| `page`    | number | Page number (default: 1)              |
| `limit`   | number | Items per page (max: 100)             |

---

## Frontend Features

### For Clients

* Registration and login with form validation
* Order statistics (total, in progress, completed)
* Order list with search and pagination
* Color-coded status badges
* Detailed order page with progress line
* Chat with technician (available after assignment)
* Delete orders with `new` status
* View technician comments and repair cost

### For Technicians

* View all orders with filtering
* Tabs: all / available / my orders
* Accept orders into work ("Take" button)
* Update order status
* Add comments and repair cost
* Chat with clients
* Status-based statistics (interactive filter cards)

### Shared Features

* Theme switcher: **light / dark** (stored in localStorage)
* Language switcher: **English / Ukrainian** (stored in localStorage)
* Prevention of incorrect theme flash during loading (inline script)
* Request timeout: 15 seconds
* Automatic access token refresh using refresh token

---

## Running the Project

### Requirements

* Docker and Docker Compose
* Node.js 18+ (for local development without Docker)

### Quick Start with Docker

```bash
git clone https://github.com/ShvyrydAlina/mobile-service-system.git
cd mobile-service-system

cp .env.example .env
```

Fill in `.env`:

```env
POSTGRES_USER=repairuser
POSTGRES_PASSWORD=strongpassword
POSTGRES_DB=repairdb

DATABASE_URL=postgres://repairuser:strongpassword@postgres:5432/repairdb

JWT_SECRET=your_very_long_random_jwt_secret_here
JWT_REFRESH_SECRET=another_very_long_random_secret_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_ROUNDS=12
CSRF_SECRET=yet_another_random_secret

AUTH_SERVICE_URL=http://auth-service:4001
ORDER_SERVICE_URL=http://order-service:4002
NEXT_PUBLIC_API_URL=http://localhost:8000

NODE_ENV=development
AUTH_PORT=4001
ORDER_PORT=4002
GATEWAY_PORT=8000
```

```bash
docker-compose up --build
```

### Application Access

| Service       | URL                                                          |
| ------------- | ------------------------------------------------------------ |
| Frontend      | [http://localhost:3000](http://localhost:3000)               |
| API Gateway   | [http://localhost:8000](http://localhost:8000)               |
| Auth Service  | [http://localhost:4001/health](http://localhost:4001/health) |
| Order Service | [http://localhost:4002/health](http://localhost:4002/health) |
| PostgreSQL    | localhost:5432                                               |

---

## Test Credentials

### Technician Account

Created manually in the database. Password must be hashed with bcrypt.

```text
Username: Master
Password: 12345678
```

Insert technician into the database:

```sql
INSERT INTO masters (username, password, display_name)
VALUES ('Master', '<bcrypt_hash>', 'Lead Technician');
```

### Client Account

Any registration through the form (minimum 3 characters for username, minimum 6 characters for password).

---

## Microservices Description

### API Gateway (Port 8000)

Single entry point for all requests. Responsible for:

* Routing `/api/auth/*` → Auth Service
* Routing `/api/orders/*` → Order Service
* CORS configuration
* CSRF protection (double validation: cookie + header)
* Handling service connection errors (502)

### Auth Service (Port 4001)

Responsible for all user authentication operations:

* Separate tables for clients (`users`) and technicians (`masters`)
* Refresh token rotation (stores the last 5 tokens)
* Account lockout after failed login attempts
* JWT verification with issuer/audience validation

### Order Service (Port 4002)

Manages all orders and messages:

* Automatic PostgreSQL schema initialization
* Dynamic SQL query building with parameters
* Cascading deletion of messages when an order is deleted
* JOIN queries for retrieving client and technician names
