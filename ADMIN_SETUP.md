# Admin Panel Access Guide

## Quick Start

There are **NO pre-created admin credentials**. You must create your own admin account.

## Step-by-Step Instructions

### Step 1: Register a User Account

1. Start the application:
   ```bash
   npm run dev
   ```

2. Open your browser and go to: `http://localhost:5173`

3. Click the **"Register"** button in the top right

4. Fill in the registration form:
   - Full Name: Your name
   - Email: `admin@example.com` (or any email you prefer)
   - Phone: Your phone number
   - Password: Create a secure password (min 8 characters)
   - Confirm Password: Re-enter your password

5. Click **"Create Account"**

### Step 2: Grant Admin Access

After successfully registering, you need to make your account an admin:

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard: https://ugielpsdrahikufdpybw.supabase.co

2. Click on **"SQL Editor"** in the left sidebar

3. Click **"New query"**

4. Copy and paste this SQL query:

```sql
-- Replace 'admin@example.com' with the email you registered with
INSERT INTO admin_users (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO NOTHING;
```

5. Click **"Run"** to execute the query

6. You should see: "Success. No rows returned"

#### Option B: Make First User Admin (Alternative)

If you want to make the first registered user an admin automatically:

```sql
-- This makes the first user an admin
INSERT INTO admin_users (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;
```

### Step 3: Access Admin Panel

1. **Logout** from your current session (if logged in)

2. **Login** again with your credentials:
   - Email: The email you registered with
   - Password: Your password

3. After logging in, you should now see an **"Admin"** button in the header (purple button)

4. Click the **"Admin"** button to access the admin dashboard

5. Admin panel routes:
   - Dashboard: `/admin`
   - Courses: `/admin/courses`
   - Payments: `/admin/payments`
   - Users: `/admin/users`

## Verify Admin Access

To check if your user has admin access, run this query:

```sql
SELECT
  au.role,
  u.email,
  u.created_at
FROM admin_users au
JOIN auth.users u ON u.id = au.user_id;
```

## Creating Multiple Admins

You can create multiple admin users with different roles:

```sql
-- Super Admin (full access)
INSERT INTO admin_users (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'superadmin@example.com';

-- Regular Admin
INSERT INTO admin_users (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@example.com';

-- Content Manager (limited access)
INSERT INTO admin_users (user_id, role)
SELECT id, 'content_manager'
FROM auth.users
WHERE email = 'manager@example.com';
```

## Troubleshooting

### Can't see Admin button after login?

1. **Clear browser cache and cookies**
2. **Logout and login again**
3. **Verify the SQL query executed successfully**
4. **Check browser console for errors** (Press F12)

### SQL query not working?

Make sure:
- The email in the query matches exactly with your registered email
- The user has been successfully registered in the database
- You're using the correct Supabase project

### Still having issues?

Run this query to see all registered users:

```sql
SELECT
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;
```

Then use the user ID directly:

```sql
INSERT INTO admin_users (user_id, role)
VALUES ('your-user-id-here', 'super_admin')
ON CONFLICT (user_id) DO NOTHING;
```

## Default Demo Credentials (For Testing)

If you want to use standard test credentials:

**Email:** `admin@coursehub.com`
**Password:** `Admin123!`

Just register with these credentials, then run the SQL query to grant admin access.

## Security Notes

⚠️ **Important Security Considerations:**

1. Use strong passwords for admin accounts
2. Change default credentials in production
3. Don't share admin credentials
4. Regularly review admin user list
5. Use different admin accounts for different team members

## Need Help?

If you still can't access the admin panel, check:
1. Database connection is working
2. Supabase environment variables are correct
3. No errors in browser console
4. User is successfully registered in `auth.users` table
5. Admin entry exists in `admin_users` table
