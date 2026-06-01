import { useState, useEffect } from 'react';
import API from '../../api';
import { Users, GraduationCap, BookOpen, ClipboardList, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [feeStats, setFeeStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, feeRes] = await Promise.all([
          API.get('/admin/dashboard'),
          API.get('/fees/report')
        ]);
        setStats(statsRes.data);
        setFeeStats(feeRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  const roleData = (stats?.usersByRole || []).map(r => ({ name: r._id, value: r.count }));
  const feeData = feeStats ? [
    { name: 'Collected', amount: feeStats.summary.totalCollected },
    { name: 'Pending', amount: feeStats.summary.totalPending }
  ] : [];

  const cards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: GraduationCap, color: 'bg-blue-500', trend: '+' },
    { label: 'Total Teachers', value: stats?.totalTeachers || 0, icon: BookOpen, color: 'bg-green-500', trend: '+' },
    { label: 'Total Classes', value: stats?.totalClasses || 0, icon: ClipboardList, color: 'bg-purple-500', trend: '' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-orange-500', trend: '+' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome back! Here's your school overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Users by Role</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={roleData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fee Collection</h3>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-sm text-green-700 dark:text-green-300">Collected</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">₹{(feeStats?.summary?.totalCollected || 0).toLocaleString()}</p>
            </div>
            <div className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
              <TrendingDown className="w-5 h-5 text-red-600 mx-auto mb-1" />
              <p className="text-sm text-red-700 dark:text-red-300">Pending</p>
              <p className="text-lg font-bold text-red-700 dark:text-red-300">₹{(feeStats?.summary?.totalPending || 0).toLocaleString()}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={feeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
