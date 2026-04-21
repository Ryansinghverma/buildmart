# BuildMart Backend

Node.js + Express + MongoDB Atlas backend for the BuildMart B2B construction materials platform.

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — add your MongoDB Atlas URI and a JWT secret

# 3. Start development server (hot reload)
npm run dev

# 4. Start production server
npm start
```

---

## Environment Variables

| Variable     | Description                          |
|--------------|--------------------------------------|
| `MONGO_URI`  | MongoDB Atlas connection string      |
| `JWT_SECRET` | Long random string for JWT signing   |
| `PORT`       | Server port (default: 5000)          |
| `NODE_ENV`   | `development` or `production`        |

---

## Project Structure

```
buildmart-backend/
├── config/
│   └── db.js                  # MongoDB connection
├── models/
│   ├── User.js                # contractor / dealer / admin
│   ├── Product.js             # catalogue items
│   ├── DealerListing.js       # dealer prices & stock per product
│   ├── Order.js               # contractor orders
│   ├── Delivery.js            # delivery assignment & tracking
│   ├── Rating.js              # contractor → dealer ratings
│   ├── CreditLedger.js        # credit purchase records
│   └── Project.js             # contractor site projects
├── controllers/
│   ├── authController.js      # OTP auth flow
│   ├── userController.js
│   ├── productController.js
│   ├── listingController.js
│   ├── orderController.js
│   ├── deliveryController.js
│   ├── projectController.js
│   └── creditController.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── listingRoutes.js
│   ├── orderRoutes.js
│   ├── deliveryRoutes.js
│   ├── dealerRoutes.js        # mirrors frontend dealerAPI shape
│   ├── projectRoutes.js
│   └── creditRoutes.js
├── middlewares/
│   ├── auth.js                # JWT protect + role authorise()
│   └── errorHandler.js        # centralised error handling
├── server.js
├── package.json
└── .env.example
```

---

## API Reference

### Auth  `POST /api/auth/...`
| Method | Endpoint              | Body                        | Description          |
|--------|-----------------------|-----------------------------|----------------------|
| POST   | `/auth/send-otp`      | `{ phone }`                 | Send OTP to phone    |
| POST   | `/auth/verify-otp`    | `{ phone, otp }`            | Verify OTP → token   |
| POST   | `/auth/signup`        | `{ name, phone, role, address }` | Register + send OTP |

### Users  `GET|PUT /api/users/...`
| Method | Endpoint        | Auth        | Description            |
|--------|-----------------|-------------|------------------------|
| POST   | `/users/register` | —         | Quick register (no OTP)|
| GET    | `/users`        | admin       | List all users         |
| GET    | `/users/:id`    | any         | Get user by ID         |
| PUT    | `/users/:id`    | any         | Update name/address    |

### Products  `/api/products/...`
| Method | Endpoint                | Auth  | Description              |
|--------|-------------------------|-------|--------------------------|
| GET    | `/products`             | —     | List products (filter by `?category=`) |
| GET    | `/products/categories`  | —     | Distinct category list   |
| GET    | `/products/:id`         | —     | Product + dealer listings|
| POST   | `/products`             | admin | Create product           |
| PUT    | `/products/:id`         | admin | Update product           |

### Listings  `/api/listings/...`
| Method | Endpoint               | Auth   | Description                  |
|--------|------------------------|--------|------------------------------|
| GET    | `/listings/:productId` | —      | All dealers for a product    |
| POST   | `/listings`            | dealer | Create listing               |
| PUT    | `/listings/upsert`     | dealer | Create or update listing     |
| PUT    | `/listings/:id`        | dealer | Update listing               |

### Orders  `/api/orders/...`
| Method | Endpoint              | Auth            | Description              |
|--------|-----------------------|-----------------|--------------------------|
| POST   | `/orders`             | contractor      | Place order              |
| GET    | `/orders`             | admin           | All orders               |
| GET    | `/orders/:userId`     | any             | Orders by user           |
| PUT    | `/orders/:id/status`  | dealer / admin  | Update status            |

### Dealer  `/api/dealer/...`  *(matches frontend `dealerAPI`)*
| Method | Endpoint                       | Auth   | Description        |
|--------|--------------------------------|--------|--------------------|
| GET    | `/dealer/:dealerId/listings`   | any    | Dealer's listings  |
| PUT    | `/dealer/listing`              | dealer | Upsert listing     |
| GET    | `/dealer/:dealerId/orders`     | dealer | Dealer's orders    |
| PUT    | `/dealer/orders/:id/accept`    | dealer | Accept order       |
| PUT    | `/dealer/orders/:id/reject`    | dealer | Reject order       |

### Delivery  `/api/delivery/...`
| Method | Endpoint                    | Auth  | Description          |
|--------|-----------------------------|-------|----------------------|
| POST   | `/delivery/assign`          | admin | Assign delivery      |
| GET    | `/delivery/:orderId`        | any   | Get delivery details |
| PUT    | `/delivery/:orderId/status` | admin | Update delivery status|

### Projects  `/api/projects/...`
| Method | Endpoint                         | Auth       | Description            |
|--------|----------------------------------|------------|------------------------|
| GET    | `/projects/:userId`              | any        | Get user's projects    |
| POST   | `/projects`                      | contractor | Create project         |
| PUT    | `/projects/:projectId/orders`    | contractor | Assign order to project|
| PUT    | `/projects/:id/status`           | contractor | Update project status  |

### Credit  `/api/credit/...`
| Method | Endpoint                  | Auth  | Description           |
|--------|---------------------------|-------|-----------------------|
| GET    | `/credit/:contractorId`   | any   | Ledger + pending total|
| PUT    | `/credit/:id/pay`         | admin | Mark entry paid       |
| PUT    | `/credit/limit/:userId`   | admin | Set credit limit      |

---

## Order Status Flow

```
pending → accepted → out_for_delivery → delivered
        ↘ cancelled      ↘ cancelled
```

## Auth Flow

```
signup (name, phone, role)
  → OTP sent to phone
  → verify-otp (phone, otp)
  → returns JWT token
  → attach as: Authorization: Bearer <token>
```

---

## Notes

- **OTP delivery**: Currently logged to console. Wire up MSG91 / Twilio in `authController.js`.
- **Credit orders**: Credit limit is checked at order creation. A `CreditLedger` entry is auto-created with a 30-day due date.
- **Stock**: Decremented atomically when an order is placed.
- **Indexes**: All high-traffic query paths are indexed (contractorId, dealerId+productId, status).
