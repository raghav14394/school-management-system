import { useState, useEffect } from 'react';
import API from '../../api';
import { Check, X as XIcon } from 'lucide-react';

export default function AttendancePage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { API.get('/teacher/classes').then(res => setClasses(res.data)); }, []);

  useEffect(() => {
    if (selectedClass) {
      API.get(`/admin/classes/${selectedClass}/students`).then(res => setStudents(res.data));
    }
  }, [selectedClass]);

  const handleMark = async () => {
    setSaving(true);
    const records = students.map(s => ({ studentId: s._id, status: attendance[s._id] || 'present' }));
    await API.post('/teacher/attendance', { records, date });
    setSaving(false);
    alert('Attendance marked successfully!');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mark Attendance</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">Select Class</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
      </div>
      {students.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Roll No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.map(s => (
                <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{s.rollNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{s.userId?.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {['present', 'absent', 'late'].map(status => (
                        <button key={status} onClick={() => setAttendance({...attendance, [s._id]: status})} className={`px-3 py-1 text-xs rounded-full font-medium transition ${attendance[s._id] === status ? (status === 'present' ? 'bg-green-600 text-white' : status === 'absent' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white') : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleMark} disabled={saving} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Attendance'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
