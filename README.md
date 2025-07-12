// README.md
# NestJS OX Integration API

A NestJS application that integrates with OX system APIs, providing authentication, company management, and product listing features.

## Features

- **JWT Authentication** with OTP verification
- **Role-based Access Control** (Admin/Manager roles)
- **Company Management** with OX API integration
- **Product Listing** from OX variations endpoint
- **Custom Auth Decorators** (@AdminOnly, @ManagerOnly)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your database and update the `.env` file:
```env
DATABASE_URL="mongodb://username:password@localhost:27017/nestjs_ox_db"
JWT_SECRET="your-super-secret-jwt-key"
```

3. Push the Prisma schema to MongoDB:
```bash
npx prisma db push
npx prisma generate
```

4. Start the application:
```bash
npm run start:dev
```

## API Endpoints

### Authentication
- `POST /auth/login` - Request OTP for email
- `POST /auth/verify` - Verify OTP and get JWT token

### Company Management
- `POST /register-company` - Register/join a company
- `DELETE /company/:id` - Delete company (admin only)

### Products
- `GET /products?page=1&size=10` - Get products list (manager only)

## Usage Example

1. **Login**:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

2. **Verify OTP**:
```bash
curl -X POST http://localhost:3000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otp": "123456"}'
```

3. **Register Company**:
```bash
curl -X POST http://localhost:3000/register-company \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"token": "Bearer xyz", "subdomain": "demo"}'
```

4. **Get Products**:
```bash
curl -X GET "http://localhost:3000/products?page=1&size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Architecture

- **Authentication**: JWT-based with OTP verification
- **Database**: PostgreSQL with Prisma ORM
- **Authorization**: Role-based guards with custom decorators
- **External Integration**: HTTP client for OX API calls
- **Validation**: Class-validator for DTO validation

## Security Features

- JWT token expiration
- OTP expiry (10 minutes)
- Role-based access control
- Input validation and sanitization
- Bearer token validation for external APIs