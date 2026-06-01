import { useState, useEffect } from 'react';
import API from '../../api';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', phone: '', address: '', subject: '', qualification: '', classId: '', rollNumber: '', parentId: '', gender: 'Male' });
  const [classes, setClasses] = useState([]);
  const [parents, setParents] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchDropdowns();
  }, [page, search, role]);

  const fetchUsers = async () => {
    const params = new URLSearchParams({ page, limit: 20 });
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    const { data } = await API.get(`/admin/users?${params}`);
    setUsers(data.users);
    setTotal(data.total);
  };

  const fetchDropdowns = async () => {
    const [clsRes, parentRes] = await Promise.all([
      API.get('/admin/classes'),
      API.get('/admin/users?role=parent&limit=100')
    ]);
    setClasses(clsRes.data);
    setParents(parentRes.data.users);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        await API.put(`/admin/users/${editUser._id}`, form);
      } else {
        await API.post('/admin/users', form);
      }
      setShowModal(false);
      setEditUser(null);
      setForm({ name: '', email: '', password: '', role: 'student', phone: '', address: '', subject: '', qualification: '', classId: '', rollNumber: '', parentId: '', gender: 'Male' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving user');
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setForm({
      name: user.name, email: user.email, password: '', role: user.role,
      phone: user.phone || '', address: user.address || '',
      subject: user.teacherProfile?.subject || '', qualification: user.teacherProfile?.qualification || '',
      classId: user.studentProfile?.classId?._id || '', rollNumber: user.studentProfile?.rollNumber || '',
      parentId: user.studentProfile?.parentId || '', gender: user.studentProfile?.gender || 'Male'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
    }
  };

  const openAdd = () => {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', role: 'student', phone: '', address: '', subject: '', qualification: '', classId: '', rollNumber: '', parentId: '', gender: 'Male' });
    setShowModal(true);
  };

  const roleBadge = (r) => {
    const colors = { admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', teacher: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', parent: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' };
    return colors[r] || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${roleBadge(user.role)}`}>{user.role}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{user.phone || '-'}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(user)} className="p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(user._id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">Showing {users.length} of {total}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Previous</button>
            <button onClick={() => setPage(p => p + 1)} disabled={users.length < 20} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Next</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editUser ? 'Edit User' : 'Add User'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              </div>
              {!editUser && <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label><input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label><select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option value="student">Student</option><option value="teacher">Teacher</option><option value="parent">Parent</option><option value="admin">Admin</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              {form.role === 'student' && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label><select value={form.classId} onChange={e => setForm({...form, classId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option value="">Select Class</option>{classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roll Number</label><input value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent</label><select value={form.parentId} onChange={e => setForm({...form, parentId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option value="">Select Parent</option>{parents.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label><select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                </div>
              )}
              {form.role === 'teacher' && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label><input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qualification</label><input value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{editUser ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
