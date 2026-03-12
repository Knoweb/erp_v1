# Super Admin Login Guide

## Authentication Flow

The Super Admin Dashboard uses JWT-based authentication with the identity-service.

## How to Login

### Option 1: Use Existing User (Development)
If you already have a user in the identity-service database:

1. **Navigate to the frontend:**
   ```bash
   cd subscription-service/frontend
   npm run dev
   ```

2. **Open browser:** http://localhost:3000

3. **Login with credentials:**
   - Username: Your existing username (e.g., `admin`)
   - Password: Your existing password

### Option 2: Create Super Admin User (Database)

If you don't have a user yet, create one directly in the database:

```sql
-- Connect to identity_db database
USE identity_db;

-- Create a super admin user
-- NOTE: System uses EMAIL for authentication (username field removed)
INSERT INTO users (email, password, org_id, branch_id, is_active, created_at, updated_at)
VALUES (
  'superadmin@erp.com',
  '$2a$10$YourBcryptHashedPasswordHere',  -- See below for password hashing
  NULL,  -- Super admins don't belong to an organization
  NULL,
  true,
  NOW(),
  NOW()
);

-- Get the user ID
SET @user_id = LAST_INSERT_ID();

-- Assign SUPER_ADMIN role (if roles table exists)
INSERT INTO user_roles (user_id, role_id)
SELECT @user_id, id FROM roles WHERE name = 'SUPER_ADMIN';
```

### Generate Bcrypt Password Hash

To hash a password for database insertion:

**Option A: Using Online Tool**
1. Go to: https://bcrypt-generator.com/
2. Enter your desired password (e.g., `Admin@123`)
3. Select rounds: 10
4. Copy the generated hash

**Option B: Using Java/Spring**
```java
// Run this code snippet to generate hash
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHasher {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "Admin@123";
        String hashedPassword = encoder.encode(rawPassword);
        System.out.println("Hashed Password: " + hashedPassword);
    }
}
```

**Option C: Using Node.js**
```javascript
// npm install bcrypt
const bcrypt = require('bcrypt');
const password = 'Admin@123';
const hash = bcrypt.hashSync(password, 10);
console.log('Hashed Password:', hash);
```

### Option 3: Quick Setup Script (MySQL)

Create a file `create-superadmin.sql`:

```sql
USE identity_db;

-- Create super admin user with password: Admin@123
-- Hash generated using BCrypt with 10 rounds
-- NOTE: This system uses EMAIL for authentication (username field removed)
INSERT INTO users (email, password, org_id, branch_id, is_active, created_at, updated_at)
VALUES (
  'superadmin@erp.com',
  '$2a$10$N9qo8uLOickgx2ZrKJaR7.TrZJgKVdDgr1Z6x/XVFfPTnGVUP5dTW',  -- Password: Admin@123
  NULL,
  NULL,
  true,
  NOW(),
  NOW()
);

SELECT 'Super Admin user created successfully!' AS Result;
SELECT id, email FROM users WHERE email = 'superadmin@erp.com';
```

Run the script:
```bash
mysql -u root -p < create-superadmin.sql
```

## Login Process

1. **Enter Credentials:**
   - Username: `superadmin@erp.com` (system uses EMAIL for authentication)
   - Password: `Admin@123` (or your custom password)

2. **JWT Token Generated:**
   - Access Token (short-lived)
   - Refresh Token (long-lived)
   - Stored in browser localStorage

3. **Auto-Login:**
   - Token is automatically added to all API requests
   - Dashboard loads with Company Management and Payment Approvals tabs

## API Endpoint

The login request is sent to:
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "superadmin@erp.com",
  "password": "Admin@123"
}
```

**Note:** The "username" field accepts EMAIL (username column removed from database)

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "user": {
    "id": 1,
    "username": "superadmin",
    "email": "superadmin@erp.com"
  }
}
```

## Troubleshooting
email exists in the `users` table (system uses EMAIL as username)
- Confirm password hash matches (use BCrypt)
- Check if `is_active = true`
- Remember: Enter EMAIL in the username field, not an actual usernamein the `users` table
- Confirm password hash matches (use BCrypt)
- Check if `is_active = true`

### Issue: "Access denied: You do not have super admin privileges"
- Ensure user has SUPER_ADMIN role in `user_roles` table
- Check JWT token claims include admin privileges

### Issue: "Cannot connect to server"
- Verify identity-service is running on port 8080
- Check VITE_API_BASE_URL in `.env` file
- Confirm MySQL database is accessible

### Issue: "Token expired"
- Logout and login again
- Token refresh should happen automatically (if implemented)

## Security Best Practices

1. **Strong Passwords:**
   - Minimum 8 characters
   - Use mix of uppercase, lowercase, numbers, special chars
   - Example: `SuperAdmin@2026!`

2. **Change Default Password:**
   ```sqlemail = 'superadmin@erp.com
   UPDATE users 
   SET password = '$2a$10$NewHashedPasswordHere'
   WHERE username = 'superadmin';
   ```

3. **Limit Super Admin Accounts:**
   - Create only necessary super admin users
   - Use regular admin accounts for day-to-day operations

4. **Enable HTTPS in Production:**
   - Never send credentials over HTTP
   - Use SSL/TLS certificates

5. **Token Management:**
   - Tokens are stored in localStorage
   - Automatically cleared on logout
   - Expire after configured duration

## Testing Login

### Using Browser
1. Open http://localhost:3000
2. Enter credentials
3. Click "Sign In"
4. Should redirect to dashboard

### Using Postman/cURL
```bash
curl -X POST http://localho@erp.comst:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "Admin@123"
  }'
```

Expected: 200 OK with JWT tokens

## Next Steps

After successful login:
1. Navigate to **Company Management** tab to view/block companies
2. Switch to **Payment Approvals** tab to approve pending payments
3. Use **Logout** button to clear session and return to login

## Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Verify all services are running (identity-service, subscription-service)
3. Check database connectivity
4. Review API logs for authentication errors
