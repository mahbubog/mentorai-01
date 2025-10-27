# CourseHub - Course Selling Platform

A comprehensive course selling platform built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Public Features
- Browse courses with advanced filtering (type, difficulty level, search)
- View detailed course information with curriculum and instructor details
- Responsive design for all devices

### User Features
- User registration and authentication
- Personal dashboard with course progress tracking
- Enroll in courses with payment submission
- Access course content with video player (YouTube embeds)
- Track lesson progress and completion
- Payment history management
- Profile management

### Admin Features
- Admin dashboard with statistics
- Course management (view, publish, delete)
- Payment review and approval system
- User management
- Notification system for payment updates

## Database Schema

The application includes the following main tables:
- **profiles** - User profile information
- **admin_users** - Admin access control
- **courses** - Course information
- **course_sections** & **course_lessons** - Course curriculum
- **payments** - Payment transactions
- **enrollments** - User course enrollments
- **lesson_progress** - Lesson completion tracking
- **notifications** - User notifications
- **course_categories** - Course categorization
- **instructors** - Instructor information

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- A Supabase account

### Installation

1. Install dependencies:
```bash
npm install
```

2. The environment variables are already configured in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

3. The database is already set up with:
   - All necessary tables with Row Level Security (RLS)
   - Sample courses and data
   - 6 course categories
   - 1 sample instructor
   - 4 demo courses (3 recorded, 1 live)

### Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Creating an Admin User

After registering a user through the UI, run this SQL query in Supabase to make them an admin:

```sql
INSERT INTO admin_users (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO NOTHING;
```

## Usage Guide

### For Students:

1. **Register/Login**: Create an account or sign in
2. **Browse Courses**: Explore the course catalog
3. **Enroll in a Course**: Click "Enroll Now" and submit payment details
4. **Wait for Approval**: Admin will review your payment within 24 hours
5. **Start Learning**: Once approved, access your course from "My Courses"
6. **Track Progress**: Mark lessons as complete as you progress

### For Admins:

1. **Login**: Use your admin account
2. **Review Payments**: Go to Admin → Payments to approve/reject payments
3. **Manage Courses**: View, publish, or delete courses
4. **View Users**: Monitor user registrations and enrollments
5. **Dashboard**: Monitor key metrics and pending tasks

## Payment Flow

1. User submits payment with transaction details
2. Payment status is set to "pending"
3. Admin reviews payment in admin dashboard
4. Admin approves payment:
   - Payment status updated to "approved"
   - Enrollment is created
   - User receives notification
5. User can now access the course

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Build Tool**: Vite

## Security Features

- Row Level Security (RLS) on all tables
- Authentication required for user actions
- Admin-only access for sensitive operations
- Payment verification workflow
- Secure session management

## Course Types

### Recorded Courses
- Video lessons organized in sections
- Progress tracking
- Downloadable resources
- Mark lessons as complete
- YouTube video embeds

### Live Courses
- Scheduled sessions
- Meeting links
- Session dates and times
- Direct access during session times

## API Structure

All data operations use Supabase client:
- `supabase.from('table_name').select()` - Read data
- `supabase.from('table_name').insert()` - Create data
- `supabase.from('table_name').update()` - Update data
- `supabase.from('table_name').delete()` - Delete data

## Sample Data

The database comes pre-populated with:
- 4 sample courses
- 6 course categories
- 1 instructor profile
- Course sections and lessons
- Site settings

## Future Enhancements

Potential features to add:
- Course reviews and ratings
- Coupon/discount system
- Certificate generation
- Live Q&A system
- Course wishlisting
- Email notifications
- Advanced analytics
- Content management system
- Multiple payment gateways
- Mobile app

## Support

For issues or questions:
1. Check the database logs in Supabase
2. Review browser console for errors
3. Verify RLS policies are correctly set
4. Ensure user has proper permissions

## License

This project is created for educational and commercial use.
