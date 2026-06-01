import { useState, useEffect } from 'react';
import API from '../../api';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/student/results').then(res => setResults(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  const gradeColor = (g) => {
    if (g?.startsWith('A')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (g?.startsWith('B')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    if (g?.startsWith('C')) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    if (g?.startsWith('D') || g?.startsWith('E')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Results</h1>
      <div className="space-y-4">
        {results.map(r => (
          <div key={r._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{r.examId?.name || 'Exam'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{r.examId?.subject} - {new Date(r.examId?.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{r.marks}/{r.examId?.totalMarks || 100}</p>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${gradeColor(r.grade)}`}>Grade: {r.grade}</span>
                </div>
              </div>
            </div>
            {r.remarks && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{r.remarks}</p>}
          </div>
        ))}
        {results.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">No results available yet.</p>}
      </div>
    </div>
  );
}
