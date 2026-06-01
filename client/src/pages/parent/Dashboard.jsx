import { useState, useEffect } from 'react';
import API from '../../api';
import { User, CheckCircle, XCircle, CreditCard, GraduationCap } from 'lucide-react';

export default function ParentDashboard() {
  const [child, setChild] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const d = new Date();
    Promise.all([
      API.get('/parent/child'),
      API.get(`/parent/attendance?month=${d.getMonth()+1}&year=${d.getFullYear()}`),
      API.get('/parent/fees')
    ]).then(([c, a, f]) => {
      setChild(c.data);
      setAttendance(a.data);
      setFees(f.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parent Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Track your child's progress.</p>
      </div>
      {child && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{child.userId?.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Roll: {child.rollNumber} | Class: {child.classId?.name} - {child.classId?.section}</p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3"><CheckCircle className="w-8 h-8 text-green-500" /><div><p className="text-sm text-gray-500 dark:text-gray-400">Attendance</p><p className="text-xl font-bold text-gray-900 dark:text-white">{attendance?.summary?.percentage || 0}%</p></div></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3"><CreditCard className="w-8 h-8 text-green-500" /><div><p className="text-sm text-gray-500 dark:text-gray-400">Fees Paid</p><p className="text-xl font-bold text-green-600">₹{(fees?.summary?.paidFees || 0).toLocaleString()}</p></div></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3"><XCircle className="w-8 h-8 text-red-500" /><div><p className="text-sm text-gray-500 dark:text-gray-400">Fees Pending</p><p className="text-xl font-bold text-red-600">₹{(fees?.summary?.unpaidFees || 0).toLocaleString()}</p></div></div>
        </div>
      </div>
    </div>
  );
}
