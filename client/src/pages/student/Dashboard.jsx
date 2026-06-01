import { useState, useEffect } from 'react';
import API from '../../api';
import { Calendar, GraduationCap, CheckCircle, XCircle, CreditCard, TrendingUp } from 'lucide-react';

export default function StudentDashboard() {
  const [attendance, setAttendance] = useState(null);
  const [results, setResults] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const d = new Date();
    Promise.all([
      API.get(`/student/attendance?month=${d.getMonth()+1}&year=${d.getFullYear()}`),
      API.get('/student/results'),
      API.get('/student/fees')
    ]).then(([att, res, fee]) => {
      setAttendance(att.data);
      setResults(res.data);
      setFees(fee.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  const unpaidFees = fees.filter(f => f.status !== 'paid');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome back! Here's your overview.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3"><CheckCircle className="w-8 h-8 text-green-500" /><div><p className="text-sm text-gray-500 dark:text-gray-400">Attendance</p><p className="text-xl font-bold text-gray-900 dark:text-white">{attendance?.summary?.percentage || 0}%</p></div></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3"><GraduationCap className="w-8 h-8 text-blue-500" /><div><p className="text-sm text-gray-500 dark:text-gray-400">Results</p><p className="text-xl font-bold text-gray-900 dark:text-white">{results.length} exams</p></div></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3"><CreditCard className="w-8 h-8 text-orange-500" /><div><p className="text-sm text-gray-500 dark:text-gray-400">Pending Fees</p><p className="text-xl font-bold text-red-600">{unpaidFees.length}</p></div></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3"><Calendar className="w-8 h-8 text-purple-500" /><div><p className="text-sm text-gray-500 dark:text-gray-400">Today</p><p className="text-xl font-bold text-gray-900 dark:text-white">{new Date().toLocaleDateString('en-US', {weekday:'short'})}</p></div></div>
        </div>
      </div>
      {unpaidFees.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-4">
          <h3 className="font-medium text-orange-800 dark:text-orange-300">Pending Fees</h3>
          <p className="text-sm text-orange-600 dark:text-orange-400">You have {unpaidFees.length} unpaid fee(s). Total: ₹{unpaidFees.reduce((s,f)=>s+f.amount,0).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
