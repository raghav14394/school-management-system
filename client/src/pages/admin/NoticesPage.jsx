import { useState, useEffect } from 'react';
import API from '../../api';
import { Plus, Edit, Trash2, X, Bell, Pin } from 'lucide-react';

export default function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editNotice, setEditNotice] = useState(null);
  const [form, setForm] = useState({ title: '', message: '', category: 'general', targetRoles: ['student', 'parent', 'teacher'], isPinned: false });

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => { const { data } = await API.get('/notices'); setNotices(data); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editNotice) { await API.put(`/notices/${editNotice._id}`, form); }
    else { await API.post('/notices', form); }
    setShowModal(false); setEditNotice(null); setForm({ title: '', message: '', category: 'general', targetRoles: ['student', 'parent', 'teacher'], isPinned: false }); fetchNotices();
  };

  const handleDelete = async (id) => { if (window.confirm('Delete this notice?')) { await API.delete(`/notices/${id}`); fetchNotices(); } };

  const categoryColor = (c) => {
    const colors = { general: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', exam: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', holiday: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', event: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' };
    return colors[c] || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notices</h1>
        <button onClick={() => { setEditNotice(null); setForm({ title: '', message: '', category: 'general', targetRoles: ['student', 'parent', 'teacher'], isPinned: false }); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Notice</button>
      </div>
      <div className="space-y-4">
        {notices.map(notice => (
          <div key={notice._id} className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 ${notice.isPinned ? 'ring-2 ring-indigo-200 dark:ring-indigo-800' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {notice.isPinned && <Pin className="w-4 h-4 text-indigo-600" />}
                  <h3 className="font-semibold text-gray-900 dark:text-white">{notice.title}</h3>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${categoryColor(notice.category)}`}>{notice.category}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{notice.message}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-500">
                  <span>By: {notice.postedBy?.name}</span>
                  <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                  <span>For: {notice.targetRoles?.join(', ')}</span>
                </div>
              </div>
              <div className="flex gap-1 ml-4">
                <button onClick={() => { setEditNotice(notice); setForm({ title: notice.title, message: notice.message, category: notice.category, targetRoles: notice.targetRoles, isPinned: notice.isPinned }); setShowModal(true); }} className="p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(notice._id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {notices.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">No notices found</p>}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editNotice ? 'Edit Notice' : 'Add Notice'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label><textarea required rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option value="general">General</option><option value="exam">Exam</option><option value="holiday">Holiday</option><option value="event">Event</option><option value="urgent">Urgent</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pin Notice</label><select value={form.isPinned} onChange={e => setForm({...form, isPinned: e.target.value === 'true'})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option value="false">No</option><option value="true">Yes</option></select></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{editNotice ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
