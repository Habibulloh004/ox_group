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

2. Set up your PostgreSQL database and update the `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/nestjs_ox_db"
JWT_SECRET="your-super-secret-jwt-key"
```

3. Run Prisma migrations for PostgreSQL:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. (Optional) Seed the database:
```bash
npx prisma db seed
```

5. Start the application:
```bash
npm run start:dev
```

## Database Setup

### PostgreSQL Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### Database Creation
```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database and user
CREATE DATABASE nestjs_ox_db;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE nestjs_ox_db TO your_username;

-- Exit PostgreSQL
\q
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

## Database Schema

The application uses PostgreSQL with the following key tables:
- `users` - User authentication and profile data
- `companies` - Company information and OX integration
- `user_companies` - Many-to-many relationship for user-company associations
- `otps` - OTP tokens for authentication

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nestjs_ox_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# OX API (if needed)
OX_API_BASE_URL="https://api.ox.com"

# Application
PORT=3000
NODE_ENV="development"
```

## Development

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Database Management
```bash
# Reset database
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio

# Deploy migrations to production
npx prisma migrate deploy
```

## Production Deployment

1. Set up PostgreSQL on your production server
2. Update `DATABASE_URL` with production database credentials
3. Run migrations: `npx prisma migrate deploy`
4. Build the application: `npm run build`
5. Start the application: `npm run start:prod`

## Troubleshooting

### Common PostgreSQL Issues

**Connection refused:**
- Check if PostgreSQL is running: `sudo systemctl status postgresql`
- Verify connection string format and credentials

**Permission denied:**
- Ensure database user has proper permissions
- Check `pg_hba.conf` for authentication settings

**Migration errors:**
- Reset database: `npx prisma migrate reset`
- Check for schema conflicts or manual database changes