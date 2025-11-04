import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HomePage } from './pages/public/HomePage';
import { CoursesPage } from './pages/public/CoursesPage';
import { CourseDetailsPage } from './pages/public/CourseDetailsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { UserDashboard } from './pages/user/UserDashboard';
import { MyCoursesPage } from './pages/user/MyCoursesPage';
import { PaymentHistoryPage } from './pages/user/PaymentHistoryPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { CoursePlayerPage } from './pages/user/CoursePlayerPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminRoute } from './components/AdminRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <PrivateRoute>
                <MyCoursesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/payment-history"
            element={
              <PrivateRoute>
                <PaymentHistoryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/learn/:courseId"
            element={
              <PrivateRoute>
                <CoursePlayerPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <AdminRoute>
                <AdminCoursesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <AdminRoute>
                <AdminPaymentsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}