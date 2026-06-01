import { useState, useEffect } from 'react';
import API from '../../api';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [form, setForm] = useState({ name: '', section: '', academicYear: '2024-2025' });
  const [teachers, setTeachers] = useState([]);

  useEffect(() => { fetchClasses(); fetchTeachers(); }, []);

  const fetchClasses = async () => { const { data } = await API.get('/admin/classes'); setClasses(data); };
  const fetchTeachers = async () => { const { data } = await API.get('/admin/users?role=teacher&limit=50'); setTeachers(data.users); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editClass) { await API.put(`/admin/classes/${editClass._id}`, form); }
    else { await API.post('/admin/classes', form); }
    setShowModal(false); setEditClass(null); setForm({ name: '', section: '', academicYear: '2024-2025' }); fetchClasses();
  };

  const handleDelete = async (id) => { if (window.confirm('Delete this class?')) { await API.delete(`/admin/classes/${id}`); fetchClasses(); } };

  const handleAssignTeacher = async (classId, teacherId) => {
    await API.put(`/admin/classes/${classId}/assign-teacher`, { teacherId });
    fetchClasses();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Classes</h1>
        <button onClick={() => { setEditClass(null); setForm({ name: '', section: '', academicYear: '2024-2025' }); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Class</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(cls => (
          <div key={cls._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{cls.name} - {cls.section}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{cls.academicYear}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditClass(cls); setForm({ name: cls.name, section: cls.section, academicYear: cls.academicYear }); setShowModal(true); }} className="p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(cls._id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-gray-500 dark:text-gray-400">Class Teacher</label>
              <select value={cls.teacherId?._id || ''} onChange={e => handleAssignTeacher(cls._id, e.target.value)} className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Assign Teacher</option>
                {teachers.map(t => <option key={t._id} value={t.teacherProfile?._id || t._id}>{t.name}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editClass ? 'Edit Class' : 'Add Class'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class Name</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label><input required value={form.section} onChange={e => setForm({...form, section: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Academic Year</label><input value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{editClass ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
