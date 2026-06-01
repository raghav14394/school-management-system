import { useState, useEffect } from 'react';
import API from '../../api';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentAttendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    API.get(`/student/attendance?month=${month}&year=${year}`).then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [month, year]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  const chartData = data ? [{ name: 'Present', count: data.summary.present }, { name: 'Absent', count: data.summary.absent }, { name: 'Late', count: data.summary.late }] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Attendance</h1>
      <div className="flex gap-3">
        <select value={month} onChange={e => setMonth(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          {Array.from({length:12},(_,i)=>i+1).map(m=><option key={m} value={m}>{new Date(2024,m-1).toLocaleString('en',{month:'long'})}</option>)}
        </select>
        <select value={year} onChange={e => setYear(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="2024">2024</option><option value="2025">2025</option>
        </select>
      </div>
      {data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Days</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.summary.totalDays}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
              <p className="text-2xl font-bold text-green-600">{data.summary.present}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
              <p className="text-2xl font-bold text-red-600">{data.summary.absent}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Percentage</p>
              <p className="text-2xl font-bold text-indigo-600">{data.summary.percentage}%</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance Chart</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
