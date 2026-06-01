import { useState, useEffect } from 'react';
import API from '../../api';
import { Users, BookOpen, ClipboardList, Calendar } from 'lucide-react';

export default function TeacherDashboard() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/teacher/classes').then(res => setClasses(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your classes, attendance, and assignments.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center"><BookOpen className="w-5 h-5 text-white" /></div>
            <div><p className="text-sm text-gray-500 dark:text-gray-400">My Classes</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{classes.length}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-white" /></div>
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Today</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{new Date().toLocaleDateString('en-US', { weekday: 'short' })}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center"><ClipboardList className="w-5 h-5 text-white" /></div>
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Active Tasks</p><p className="text-2xl font-bold text-gray-900 dark:text-white">-</p></div>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">My Classes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => (
            <div key={cls._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white">{cls.name} - {cls.section}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{cls.academicYear}</p>
            </div>
          ))}
          {classes.length === 0 && <p className="text-gray-500 dark:text-gray-400">No classes assigned yet.</p>}
        </div>
      </div>
    </div>
  );
}
