import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  CreditCard, Bell, Calendar, MessageSquare, Settings, LogOut,
  Menu, X, Sun, Moon, ChevronDown, User
} from 'lucide-react';

const menuItems = {
  admin: [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/students', icon: GraduationCap, label: 'Students' },
    { path: '/admin/teachers', icon: BookOpen, label: 'Teachers' },
    { path: '/admin/classes', icon: ClipboardList, label: 'Classes' },
    { path: '/admin/attendance', icon: Calendar, label: 'Attendance' },
    { path: '/admin/exams', icon: ClipboardList, label: 'Exams' },
    { path: '/admin/fees', icon: CreditCard, label: 'Fees' },
    { path: '/admin/notices', icon: Bell, label: 'Notices' },
    { path: '/admin/timetable', icon: Calendar, label: 'Timetable' },
    { path: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  ],
  teacher: [
    { path: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/teacher/classes', icon: BookOpen, label: 'My Classes' },
    { path: '/teacher/attendance', icon: Calendar, label: 'Attendance' },
    { path: '/teacher/exams', icon: ClipboardList, label: 'Exams' },
    { path: '/teacher/assignments', icon: ClipboardList, label: 'Assignments' },
    { path: '/teacher/notices', icon: Bell, label: 'Notices' },
  ],
  student: [
    { path: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/student/attendance', icon: Calendar, label: 'Attendance' },
    { path: '/student/results', icon: ClipboardList, label: 'Results' },
    { path: '/student/timetable', icon: Calendar, label: 'Timetable' },
    { path: '/student/assignments', icon: ClipboardList, label: 'Assignments' },
    { path: '/student/fees', icon: CreditCard, label: 'Fees' },
    { path: '/student/notices', icon: Bell, label: 'Notices' },
  ],
  parent: [
    { path: '/parent', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/parent/attendance', icon: Calendar, label: 'Attendance' },
    { path: '/parent/results', icon: ClipboardList, label: 'Results' },
    { path: '/parent/fees', icon: CreditCard, label: 'Fees' },
    { path: '/parent/notices', icon: Bell, label: 'Notices' },
  ]
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const items = menuItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <Link to={`/${user?.role}`} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">EduManage</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="mt-4 px-3 space-y-1">
          {items.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 dark:text-gray-400">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <Link to={`/${user?.role}/profile`} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Settings className="w-4 h-4" /> Profile
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
