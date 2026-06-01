import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/Dashboard';
import UsersPage from './pages/admin/UsersPage';
import ClassesPage from './pages/admin/ClassesPage';
import FeesPage from './pages/admin/FeesPage';
import NoticesPage from './pages/admin/NoticesPage';
import TeacherDashboard from './pages/teacher/Dashboard';
import AttendancePage from './pages/teacher/AttendancePage';
import StudentDashboard from './pages/student/Dashboard';
import StudentAttendance from './pages/student/AttendancePage';
import StudentResults from './pages/student/ResultsPage';
import ParentDashboard from './pages/parent/Dashboard';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
      <Route path="/admin/teachers" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
      <Route path="/admin/classes" element={<ProtectedRoute roles={['admin']}><ClassesPage /></ProtectedRoute>} />
      <Route path="/admin/fees" element={<ProtectedRoute roles={['admin']}><FeesPage /></ProtectedRoute>} />
      <Route path="/admin/notices" element={<ProtectedRoute roles={['admin']}><NoticesPage /></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute roles={['admin']}><NoticesPage /></ProtectedRoute>} />
      <Route path="/admin/exams" element={<ProtectedRoute roles={['admin']}><NoticesPage /></ProtectedRoute>} />
      <Route path="/admin/timetable" element={<ProtectedRoute roles={['admin']}><ClassesPage /></ProtectedRoute>} />
      <Route path="/admin/messages" element={<ProtectedRoute roles={['admin']}><NoticesPage /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute roles={['admin']}><NoticesPage /></ProtectedRoute>} />
      {/* Teacher Routes */}
      <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/classes" element={<ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/attendance" element={<ProtectedRoute roles={['teacher']}><AttendancePage /></ProtectedRoute>} />
      <Route path="/teacher/exams" element={<ProtectedRoute roles={['teacher']}><NoticesPage /></ProtectedRoute>} />
      <Route path="/teacher/assignments" element={<ProtectedRoute roles={['teacher']}><NoticesPage /></ProtectedRoute>} />
      <Route path="/teacher/notices" element={<ProtectedRoute roles={['teacher']}><NoticesPage /></ProtectedRoute>} />
      <Route path="/teacher/profile" element={<ProtectedRoute roles={['teacher']}><NoticesPage /></ProtectedRoute>} />
      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute roles={['student']}><StudentAttendance /></ProtectedRoute>} />
      <Route path="/student/results" element={<ProtectedRoute roles={['student']}><StudentResults /></ProtectedRoute>} />
      <Route path="/student/timetable" element={<ProtectedRoute roles={['student']}><ClassesPage /></ProtectedRoute>} />
      <Route path="/student/assignments" element={<ProtectedRoute roles={['student']}><NoticesPage /></ProtectedRoute>} />
      <Route path="/student/fees" element={<ProtectedRoute roles={['student']}><FeesPage /></ProtectedRoute>} />
      <Route path="/student/notices" element={<ProtectedRoute roles={['student']}><NoticesPage /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute roles={['student']}><NoticesPage /></ProtectedRoute>} />
      {/* Parent Routes */}
      <Route path="/parent" element={<ProtectedRoute roles={['parent']}><ParentDashboard /></ProtectedRoute>} />
      <Route path="/parent/attendance" element={<ProtectedRoute roles={['parent']}><StudentAttendance /></ProtectedRoute>} />
      <Route path="/parent/results" element={<ProtectedRoute roles={['parent']}><StudentResults /></ProtectedRoute>} />
      <Route path="/parent/fees" element={<ProtectedRoute roles={['parent']}><FeesPage /></ProtectedRoute>} />
      <Route path="/parent/notices" element={<ProtectedRoute roles={['parent']}><NoticesPage /></ProtectedRoute>} />
      <Route path="/parent/profile" element={<ProtectedRoute roles={['parent']}><NoticesPage /></ProtectedRoute>} />
      {/* Default */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
