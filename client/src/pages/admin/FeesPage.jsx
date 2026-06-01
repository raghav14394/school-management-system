import { useState, useEffect } from 'react';
import API from '../../api';
import { X, Pencil, Check, Eye, ArrowLeft, Plus, IndianRupee } from 'lucide-react';

export default function FeesPage() {
  const [report, setReport] = useState(null);
  const [classes, setClasses] = useState([]);
  const [filter, setFilter] = useState({ classId: '', status: '', month: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', feeType: '', dueDate: '', month: '', status: '', paidAmount: '' });

  useEffect(() => { fetchReport(); fetchClasses(); }, [filter]);

  const fetchReport = async () => {
    const params = new URLSearchParams();
    if (filter.classId) params.append('classId', filter.classId);
    if (filter.status) params.append('status', filter.status);
    if (filter.month) params.append('month', filter.month);
    const { data } = await API.get(`/fees/report?${params}`);
    setReport(data);
  };

  const fetchClasses = async () => { const { data } = await API.get('/admin/classes'); setClasses(data); };

  const markPaid = async (feeId) => {
    await API.put(`/fees/${feeId}/pay`, {});
    fetchReport();
    // Refresh detail view if open
    if (selectedStudent) {
      const params = new URLSearchParams();
      if (filter.classId) params.append('classId', filter.classId);
      if (filter.status) params.append('status', filter.status);
      if (filter.month) params.append('month', filter.month);
      const { data } = await API.get(`/fees/report?${params}`);
      setReport(data);
      const updated = data.studentSummaries.find(s => s.studentId === selectedStudent.studentId || s.studentId?._id === selectedStudent.studentId?._id || String(s.studentId) === String(selectedStudent.studentId));
      if (updated) setSelectedStudent(updated);
    }
  };

  const openEditModal = (fee) => {
    setEditingFee(fee);
    setEditForm({
      amount: fee.amount,
      feeType: fee.feeType,
      dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '',
      month: fee.month,
      status: fee.status,
      paidAmount: fee.paidAmount || 0,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await API.put(`/fees/${editingFee._id}`, editForm);
    setShowEditModal(false);
    setEditingFee(null);
    fetchReport();
    if (selectedStudent) {
      const params = new URLSearchParams();
      if (filter.classId) params.append('classId', filter.classId);
      if (filter.month) params.append('month', filter.month);
      const { data } = await API.get(`/fees/report?${params}`);
      setReport(data);
      const sid = selectedStudent.studentId;
      const updated = data.studentSummaries.find(s => String(s.studentId) === String(sid));
      if (updated) setSelectedStudent(updated);
    }
  };

  const openStudentDetail = (student) => {
    setSelectedStudent(student);
  };

  const closeStudentDetail = () => {
    setSelectedStudent(null);
  };

  const statusBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      partial: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      unpaid: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    };
    return (
      <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${styles[status] || styles.unpaid}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, m] = monthStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(m, 10) - 1]} ${year}`;
  };

  // ─── Level 2: Student Fee Detail ───
  if (selectedStudent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={closeStudentDetail} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent.studentName}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Class {selectedStudent.className} &middot; Parent: {selectedStudent.parentName}</p>
          </div>
        </div>

        {/* Student Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Fee</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{selectedStudent.totalFee.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">₹{selectedStudent.totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-red-600">₹{selectedStudent.totalPending.toLocaleString()}</p>
          </div>
        </div>

        {/* Fee Breakdown Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fee Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Month</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {(selectedStudent.fees || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No fee records found</td>
                  </tr>
                ) : (selectedStudent.fees || []).map(fee => (
                  <tr key={fee._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-3 text-sm text-gray-900 dark:text-white">{formatMonth(fee.month)}</td>
                    <td className="px-5 py-3 text-sm text-gray-900 dark:text-white">₹{fee.amount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400 capitalize">{fee.feeType}</td>
                    <td className="px-5 py-3">{statusBadge(fee.status)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(fee)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        {fee.status !== 'paid' && (
                          <button onClick={() => markPaid(fee._id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <Check className="w-3 h-3" /> Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Fee Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Fee Record</h2>
                <button onClick={() => { setShowEditModal(false); setEditingFee(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
                  <input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fee Type</label>
                  <select value={editForm.feeType} onChange={e => setEditForm({...editForm, feeType: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="tuition">Tuition</option>
                    <option value="transport">Transport</option>
                    <option value="exam">Exam</option>
                    <option value="library">Library</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
                  <input type="month" value={editForm.month} onChange={e => setEditForm({...editForm, month: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <input type="date" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                {(editForm.status === 'partial' || editForm.status === 'paid') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paid Amount (₹)</label>
                    <input type="number" value={editForm.paidAmount} onChange={e => setEditForm({...editForm, paidAmount: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingFee(null); }} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Level 1: Student Summary ───
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Management</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={filter.classId} onChange={e => setFilter({...filter, classId: e.target.value})} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
        </select>
      </div>

      {/* Summary Cards */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">₹{(report.summary.totalCollected || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Pending</p>
            <p className="text-2xl font-bold text-red-600">₹{(report.summary.totalPending || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Students</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{report.summary.totalStudents}</p>
          </div>
        </div>
      )}

      {/* Student Summary Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Student</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Class</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Parent</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Fee</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Paid</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pending</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {(report?.studentSummaries || []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No students found</td>
                </tr>
              ) : (report?.studentSummaries || []).map(student => (
                <tr key={String(student.studentId)} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer" onClick={() => openStudentDetail(student)}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-semibold">
                        {student.studentName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{student.studentName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{student.className}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{student.parentName}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">₹{student.totalFee.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm font-medium text-green-600">₹{student.totalPaid.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm font-medium text-red-600">₹{student.totalPending.toLocaleString()}</td>
                  <td className="px-5 py-4">{statusBadge(student.status)}</td>
                  <td className="px-5 py-4">
                    <button onClick={(e) => { e.stopPropagation(); openStudentDetail(student); }} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Eye className="w-3 h-3" /> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Fee Modal (also accessible from summary level if needed) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Fee Record</h2>
              <button onClick={() => { setShowEditModal(false); setEditingFee(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
                <input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fee Type</label>
                <select value={editForm.feeType} onChange={e => setEditForm({...editForm, feeType: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="tuition">Tuition</option>
                  <option value="transport">Transport</option>
                  <option value="exam">Exam</option>
                  <option value="library">Library</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
                <input type="month" value={editForm.month} onChange={e => setEditForm({...editForm, month: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                <input type="date" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              {(editForm.status === 'partial' || editForm.status === 'paid') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paid Amount (₹)</label>
                  <input type="number" value={editForm.paidAmount} onChange={e => setEditForm({...editForm, paidAmount: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingFee(null); }} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
