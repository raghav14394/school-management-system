const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const db = { users: [], students: [], teachers: [], classes: [], attendance: [], exams: [], results: [], fees: [], notices: [], timetables: [], assignments: [], messages: [] };
let idCounter = 100;
const genId = () => String(idCounter++);
const now = () => new Date().toISOString();
const hashPwd = (p) => crypto.createHash('sha256').update(p).digest('hex');
const cmpPwd = (p, h) => hashPwd(p) === h;
const SECRET = 'school_management_secret_key_2024';
const genToken = (id) => { const p = Buffer.from(JSON.stringify({ id, exp: Date.now() + 7*24*60*60*1000 })).toString('base64'); return p + '.' + crypto.createHmac('sha256', SECRET).update(p).digest('hex').slice(0, 16); };
const verifyToken = (t) => { try { const [p, s] = t.split('.'); if (s !== crypto.createHmac('sha256', SECRET).update(p).digest('hex').slice(0, 16)) return null; const d = JSON.parse(Buffer.from(p, 'base64').toString()); return d.exp > Date.now() ? d : null; } catch { return null; } };

const auth = (req, res, next) => { const t = req.headers.authorization?.split(' ')[1]; if (!t) return res.status(401).json({ message: 'No token' }); const d = verifyToken(t); if (!d) return res.status(401).json({ message: 'Invalid token' }); req.userId = d.id; req.user = db.users.find(u => u._id === d.id); if (!req.user) return res.status(401).json({ message: 'User not found' }); next(); };
const authorize = (...roles) => (req, res, next) => { if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Not authorized' }); next(); };
const noPwd = (u) => { const { password, ...rest } = u; return rest; };

// AUTH
app.post('/api/auth/login', (req, res) => { const { email, password } = req.body; const u = db.users.find(x => x.email === email); if (!u || !cmpPwd(password, u.password)) return res.status(401).json({ message: 'Invalid credentials' }); if (!u.isActive) return res.status(401).json({ message: 'Deactivated' }); res.json({ ...noPwd(u), token: genToken(u._id) }); });
app.post('/api/auth/register', (req, res) => { const { name, email, password, role, phone } = req.body; if (db.users.find(u => u.email === email)) return res.status(400).json({ message: 'Email exists' }); const u = { _id: genId(), name, email, password: hashPwd(password), role, phone: phone || '', address: '', isActive: true, createdAt: now() }; db.users.push(u); res.status(201).json({ ...noPwd(u), token: genToken(u._id) }); });
app.get('/api/auth/me', auth, (req, res) => { let p = noPwd(req.user); if (req.user.role === 'student') p.studentProfile = db.students.find(s => s.userId === req.user._id); if (req.user.role === 'teacher') p.teacherProfile = db.teachers.find(t => t.userId === req.user._id); res.json(p); });
app.put('/api/auth/profile', auth, (req, res) => { const { name, phone, address } = req.body; Object.assign(req.user, { name: name || req.user.name, phone: phone || req.user.phone, address: address || req.user.address }); res.json(noPwd(req.user)); });

// ADMIN
app.get('/api/admin/dashboard', auth, authorize('admin'), (req, res) => { const byRole = {}; db.users.forEach(u => byRole[u.role] = (byRole[u.role] || 0) + 1); res.json({ totalStudents: db.students.length, totalTeachers: db.teachers.length, totalClasses: db.classes.length, totalUsers: db.users.length, usersByRole: Object.entries(byRole).map(([_id, count]) => ({ _id, count })) }); });
app.get('/api/admin/users', auth, authorize('admin'), (req, res) => { const { role, search, page = 1, limit = 20 } = req.query; let f = db.users; if (role) f = f.filter(u => u.role === role); if (search) f = f.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())); const total = f.length; res.json({ users: f.slice((page-1)*limit, page*limit).map(u => { const r = noPwd(u); if (u.role === 'student') r.studentProfile = db.students.find(s => s.userId === u._id); if (u.role === 'teacher') r.teacherProfile = db.teachers.find(t => t.userId === u._id); return r; }), total, page: +page, pages: Math.ceil(total / limit) }); });
app.get('/api/admin/users/:id', auth, authorize('admin'), (req, res) => { const u = db.users.find(x => x._id === req.params.id); if (!u) return res.status(404).json({ message: 'Not found' }); res.json(noPwd(u)); });
app.post('/api/admin/users', auth, authorize('admin'), (req, res) => { const { name, email, password, role, phone, address, subject, qualification, classId, rollNumber, parentId, gender } = req.body; if (db.users.find(u => u.email === email)) return res.status(400).json({ message: 'Email exists' }); const u = { _id: genId(), name, email, password: hashPwd(password || '123456'), role, phone: phone || '', address: address || '', isActive: true, createdAt: now() }; db.users.push(u); if (role === 'student') db.students.push({ _id: genId(), userId: u._id, classId: classId || '', parentId: parentId || '', rollNumber: rollNumber || '', gender: gender || '' }); if (role === 'teacher') db.teachers.push({ _id: genId(), userId: u._id, subject: subject || '', qualification: qualification || '' }); res.status(201).json({ message: 'Created', user: noPwd(u) }); });
app.put('/api/admin/users/:id', auth, authorize('admin'), (req, res) => { const i = db.users.findIndex(u => u._id === req.params.id); if (i < 0) return res.status(404).json({ message: 'Not found' }); Object.assign(db.users[i], req.body); res.json({ message: 'Updated', user: noPwd(db.users[i]) }); });
app.delete('/api/admin/users/:id', auth, authorize('admin'), (req, res) => { const i = db.users.findIndex(u => u._id === req.params.id); if (i < 0) return res.status(404).json({ message: 'Not found' }); db.users.splice(i, 1); res.json({ message: 'Deleted' }); });

app.get('/api/admin/classes', auth, authorize('admin'), (req, res) => res.json(db.classes.map(c => ({ ...c, teacherId: db.teachers.find(t => t._id === c.teacherId) || null }))));
app.post('/api/admin/classes', auth, authorize('admin'), (req, res) => { const c = { _id: genId(), ...req.body, createdAt: now() }; db.classes.push(c); res.status(201).json(c); });
app.put('/api/admin/classes/:id', auth, authorize('admin'), (req, res) => { const i = db.classes.findIndex(c => c._id === req.params.id); if (i < 0) return res.status(404).json({ message: 'Not found' }); Object.assign(db.classes[i], req.body); res.json(db.classes[i]); });
app.delete('/api/admin/classes/:id', auth, authorize('admin'), (req, res) => { const i = db.classes.findIndex(c => c._id === req.params.id); if (i < 0) return res.status(404).json({ message: 'Not found' }); db.classes.splice(i, 1); res.json({ message: 'Deleted' }); });
app.get('/api/admin/classes/:id/students', auth, (req, res) => res.json(db.students.filter(s => s.classId === req.params.id).map(s => ({ ...s, userId: db.users.find(u => u._id === s.userId) }))));
app.put('/api/admin/classes/:id/assign-teacher', auth, authorize('admin'), (req, res) => { const c = db.classes.find(x => x._id === req.params.id); if (!c) return res.status(404).json({ message: 'Not found' }); c.teacherId = req.body.teacherId; res.json(c); });

// TEACHER
app.get('/api/teacher/classes', auth, authorize('teacher'), (req, res) => { const t = db.teachers.find(x => x.userId === req.user._id); if (!t) return res.json([]); res.json(db.classes.filter(c => c.teacherId === t._id)); });
app.post('/api/teacher/attendance', auth, authorize('teacher'), (req, res) => { (req.body.records || []).forEach(r => db.attendance.push({ _id: genId(), studentId: r.studentId, date: req.body.date || now(), status: r.status, markedBy: req.user._id })); res.status(201).json({ message: 'Attendance marked' }); });
app.get('/api/teacher/attendance', auth, authorize('teacher'), (req, res) => { const { classId, date } = req.query; const sids = db.students.filter(s => s.classId === classId).map(s => s._id); res.json({ students: db.students.filter(s => s.classId === classId).map(s => ({ ...s, userId: db.users.find(u => u._id === s.userId) })), attendance: db.attendance.filter(a => sids.includes(a.studentId) && a.date.startsWith(date || '')) }); });
app.get('/api/teacher/attendance/monthly', auth, authorize('teacher', 'admin'), (req, res) => res.json([]));
app.post('/api/teacher/exams', auth, authorize('teacher', 'admin'), (req, res) => { const e = { _id: genId(), ...req.body, createdAt: now() }; db.exams.push(e); res.status(201).json(e); });
app.get('/api/teacher/exams/:classId', auth, (req, res) => res.json(db.exams.filter(e => e.classId === req.params.classId)));
app.post('/api/teacher/results', auth, authorize('teacher', 'admin'), (req, res) => { (req.body.results || []).forEach(r => db.results.push({ _id: genId(), ...r, examId: req.body.examId })); res.status(201).json({ message: 'Results uploaded' }); });
app.get('/api/teacher/results/:examId', auth, (req, res) => res.json(db.results.filter(r => r.examId === req.params.examId)));
app.post('/api/teacher/assignments', auth, authorize('teacher'), (req, res) => { const t = db.teachers.find(x => x.userId === req.user._id); const a = { _id: genId(), ...req.body, teacherId: t?._id, createdAt: now() }; db.assignments.push(a); res.status(201).json(a); });
app.get('/api/teacher/assignments/:classId', auth, (req, res) => res.json(db.assignments.filter(a => a.classId === req.params.classId)));
app.delete('/api/teacher/assignments/:id', auth, authorize('teacher'), (req, res) => { const i = db.assignments.findIndex(a => a._id === req.params.id); if (i >= 0) db.assignments.splice(i, 1); res.json({ message: 'Deleted' }); });
app.post('/api/teacher/notices', auth, authorize('teacher', 'admin'), (req, res) => { const n = { _id: genId(), ...req.body, postedBy: req.user._id, createdAt: now() }; db.notices.push(n); res.status(201).json(n); });

// STUDENT
app.get('/api/student/attendance', auth, authorize('student'), (req, res) => { const s = db.students.find(x => x.userId === req.user._id); if (!s) return res.json({ attendance: [], summary: { totalDays: 0, present: 0, absent: 0, late: 0, percentage: 0 } }); const a = db.attendance.filter(x => x.studentId === s._id); const p = a.filter(x => x.status === 'present').length, ab = a.filter(x => x.status === 'absent').length, l = a.filter(x => x.status === 'late').length; res.json({ attendance: a, summary: { totalDays: a.length, present: p, absent: ab, late: l, percentage: a.length ? ((p+l)/a.length*100).toFixed(1) : 0 } }); });
app.get('/api/student/results', auth, authorize('student'), (req, res) => { const s = db.students.find(x => x.userId === req.user._id); if (!s) return res.json([]); res.json(db.results.filter(r => r.studentId === s._id).map(r => ({ ...r, examId: db.exams.find(e => e._id === r.examId) }))); });
app.get('/api/student/fees', auth, authorize('student'), (req, res) => { const s = db.students.find(x => x.userId === req.user._id); if (!s) return res.json([]); res.json(db.fees.filter(f => f.studentId === s._id)); });
app.get('/api/student/timetable', auth, authorize('student'), (req, res) => { const s = db.students.find(x => x.userId === req.user._id); if (!s) return res.json([]); res.json(db.timetables.filter(t => t.classId === s.classId)); });
app.get('/api/student/assignments', auth, authorize('student'), (req, res) => { const s = db.students.find(x => x.userId === req.user._id); if (!s) return res.json([]); res.json(db.assignments.filter(a => a.classId === s.classId)); });
app.get('/api/student/notices', auth, authorize('student'), (req, res) => res.json(db.notices.filter(n => (n.targetRoles || []).some(r => ['student', 'all'].includes(r)))));

// PARENT
app.get('/api/parent/child', auth, authorize('parent'), (req, res) => { const s = db.students.find(x => x.parentId === req.user._id); if (!s) return res.status(404).json({ message: 'No child linked' }); res.json({ ...s, userId: db.users.find(u => u._id === s.userId), classId: db.classes.find(c => c._id === s.classId) }); });
app.get('/api/parent/attendance', auth, authorize('parent'), (req, res) => { const s = db.students.find(x => x.parentId === req.user._id); if (!s) return res.json({ attendance: [], summary: { totalDays: 0, present: 0, absent: 0, percentage: 0 } }); const a = db.attendance.filter(x => x.studentId === s._id); const p = a.filter(x => x.status === 'present').length, ab = a.filter(x => x.status === 'absent').length; res.json({ student: s, attendance: a, summary: { totalDays: a.length, present: p, absent: ab, percentage: a.length ? (p/a.length*100).toFixed(1) : 0 } }); });
app.get('/api/parent/results', auth, authorize('parent'), (req, res) => { const s = db.students.find(x => x.parentId === req.user._id); if (!s) return res.json({ results: [] }); res.json({ student: s, results: db.results.filter(r => r.studentId === s._id).map(r => ({ ...r, examId: db.exams.find(e => e._id === r.examId) })) }); });
app.get('/api/parent/fees', auth, authorize('parent'), (req, res) => { const s = db.students.find(x => x.parentId === req.user._id); if (!s) return res.json({ fees: [], summary: { totalFees: 0, paidFees: 0, unpaidFees: 0 } }); const fees = db.fees.filter(f => f.studentId === s._id); const t = fees.reduce((a, f) => a + f.amount, 0), p = fees.filter(f => f.status === 'paid').reduce((a, f) => a + f.amount, 0); res.json({ student: s, fees, summary: { totalFees: t, paidFees: p, unpaidFees: t - p } }); });
app.get('/api/parent/notices', auth, authorize('parent'), (req, res) => res.json(db.notices.filter(n => (n.targetRoles || []).some(r => ['parent', 'all'].includes(r)))));

// NOTICES
app.get('/api/notices', auth, (req, res) => res.json(db.notices.map(n => ({ ...n, postedBy: db.users.find(u => u._id === n.postedBy) }))));
app.post('/api/notices', auth, (req, res) => { const n = { _id: genId(), ...req.body, postedBy: req.user._id, createdAt: now() }; db.notices.push(n); res.status(201).json(n); });
app.put('/api/notices/:id', auth, (req, res) => { const i = db.notices.findIndex(n => n._id === req.params.id); if (i < 0) return res.status(404).json({ message: 'Not found' }); Object.assign(db.notices[i], req.body); res.json(db.notices[i]); });
app.delete('/api/notices/:id', auth, (req, res) => { const i = db.notices.findIndex(n => n._id === req.params.id); if (i < 0) return res.status(404).json({ message: 'Not found' }); db.notices.splice(i, 1); res.json({ message: 'Deleted' }); });

// FEES
app.get('/api/fees/report', auth, authorize('admin'), (req, res) => { const { classId, status } = req.query; let sids = db.students; if (classId) sids = sids.filter(s => s.classId === classId); const ids = sids.map(s => s._id); let fees = db.fees.filter(f => ids.includes(f.studentId)); if (status) fees = fees.filter(f => f.status === status); const tc = fees.filter(f => f.status === 'paid').reduce((a, f) => a + (f.paidAmount || f.amount), 0), tp = fees.filter(f => f.status !== 'paid').reduce((a, f) => a + f.amount, 0); res.json({ fees: fees.map(f => ({ ...f, studentId: { ...db.students.find(s => s._id === f.studentId), userId: db.users.find(u => u._id === db.students.find(s => s._id === f.studentId)?.userId) } })), summary: { totalCollected: tc, totalPending: tp, totalStudents: ids.length } }); });
app.put('/api/fees/:id/pay', auth, authorize('admin'), (req, res) => { const f = db.fees.find(x => x._id === req.params.id); if (!f) return res.status(404).json({ message: 'Not found' }); f.status = 'paid'; f.paidDate = now(); f.paidAmount = f.amount; res.json(f); });

// TIMETABLE & MESSAGES
app.get('/api/timetable/:classId', auth, (req, res) => res.json(db.timetables.filter(t => t.classId === req.params.classId)));
app.post('/api/timetable', auth, authorize('admin', 'teacher'), (req, res) => { const t = { _id: genId(), ...req.body, createdAt: now() }; db.timetables.push(t); res.status(201).json(t); });
app.get('/api/messages/unread/count', auth, (req, res) => res.json({ unreadCount: db.messages.filter(m => m.receiverId === req.user._id && !m.isRead).length }));
app.get('/api/messages/:receiverId', auth, (req, res) => res.json(db.messages.filter(m => (m.senderId === req.user._id && m.receiverId === req.params.receiverId) || (m.senderId === req.params.receiverId && m.receiverId === req.user._id))));
app.post('/api/messages', auth, (req, res) => { const m = { _id: genId(), senderId: req.user._id, ...req.body, isRead: false, createdAt: now() }; db.messages.push(m); res.status(201).json(m); });
app.get('/api/health', (req, res) => res.json({ status: 'OK', mode: 'in-memory' }));

// SEED
function seed() {
  db.users.push({ _id: '1', name: 'Admin User', email: 'admin@school.com', password: hashPwd('admin123'), role: 'admin', phone: '9876543210', address: '', isActive: true, createdAt: now() });
  const classIds = ['c1','c2','c3','c4','c5'];
  [['Class 1','A'],['Class 2','A'],['Class 3','A'],['Class 4','B'],['Class 5','A']].forEach(([n,s],i) => db.classes.push({ _id: classIds[i], name: n, section: s, teacherId: `t${i+1}`, academicYear: '2024-2025', createdAt: now() }));
  const tData = [{name:'John Smith',sub:'Mathematics',q:'M.Sc'},{name:'Sarah Johnson',sub:'English',q:'M.A'},{name:'Michael Brown',sub:'Science',q:'M.Sc'},{name:'Emily Davis',sub:'History',q:'M.A'},{name:'David Wilson',sub:'CS',q:'M.Tech'}];
  tData.forEach((t,i) => { const uid = `ut${i+1}`; db.users.push({ _id: uid, name: t.name, email: t.name.toLowerCase().replace(' ','.')+'@school.com', password: hashPwd('teacher123'), role: 'teacher', phone: `987${i}0`, isActive: true, createdAt: now() }); db.teachers.push({ _id: `t${i+1}`, userId: uid, subject: t.sub, qualification: t.q }); });
  for (let i = 1; i <= 15; i++) {
    const pid = `up${i}`, sid = `us${i}`;
    db.users.push({ _id: pid, name: `Parent ${i}`, email: `parent${i}@school.com`, password: hashPwd('parent123'), role: 'parent', phone: `98765${String(i).padStart(3,'0')}`, isActive: true, createdAt: now() });
    db.users.push({ _id: sid, name: `Student ${i}`, email: `student${i}@school.com`, password: hashPwd('student123'), role: 'student', phone: `98766${String(i).padStart(3,'0')}`, isActive: true, createdAt: now() });
    const cid = classIds[(i-1) % 5];
    db.students.push({ _id: `s${i}`, userId: sid, classId: cid, parentId: pid, rollNumber: `STU${String(i).padStart(3,'0')}`, gender: i%2?'Male':'Female' });
    // Fees
    const months = ['2024-04','2024-05','2024-06','2024-07','2024-08','2024-09','2024-10','2024-11','2024-12'];
    months.forEach((m,mi) => { const paid = mi < 6 || Math.random() > 0.3; db.fees.push({ _id: genId(), studentId: `s${i}`, amount: 5000, feeType: 'tuition', status: paid?'paid':'unpaid', paidAmount: paid?5000:0, dueDate: `${m}-10`, paidDate: paid?`${m}-05`:null, month: m }); });
  }
  // Attendance (30 days for first 10 students)
  const today = new Date();
  for (let d = 0; d < 30; d++) { const date = new Date(today); date.setDate(date.getDate() - d); if (date.getDay() === 0 || date.getDay() === 6) continue; for (let s = 1; s <= 10; s++) { const r = Math.random(); db.attendance.push({ _id: genId(), studentId: `s${s}`, date: date.toISOString(), status: r > 0.85 ? 'absent' : r > 0.75 ? 'late' : 'present', markedBy: 'ut1' }); } }
  // Exams & Results
  ['Mid Term','Final Term'].forEach(name => { classIds.forEach(cid => { ['Mathematics','English','Science'].forEach(sub => { const eid = genId(); db.exams.push({ _id: eid, name, classId: cid, subject: sub, date: now(), totalMarks: 100, passMarks: 35 }); db.students.filter(s => s.classId === cid).forEach(s => { const marks = Math.floor(Math.random()*60)+40; let g='F'; if(marks>=90)g='A+';else if(marks>=80)g='A';else if(marks>=70)g='B';else if(marks>=60)g='C';else if(marks>=50)g='D';else if(marks>=35)g='E'; db.results.push({ _id: genId(), studentId: s._id, examId: eid, marks, grade: g }); }); }); }); });
  // Notices
  db.notices.push({ _id: genId(), title: 'Welcome to New Academic Year', message: 'Welcome back! Classes begin April 1st.', category: 'general', targetRoles: ['student','parent','teacher'], postedBy: '1', isPinned: true, createdAt: now() });
  db.notices.push({ _id: genId(), title: 'Annual Sports Day', message: 'Annual Sports Day on March 20th.', category: 'event', targetRoles: ['student','parent'], postedBy: '1', isPinned: false, createdAt: now() });
  db.notices.push({ _id: genId(), title: 'Mid-Term Exam Schedule', message: 'Exams from Sep 15-25.', category: 'exam', targetRoles: ['student','parent','teacher'], postedBy: '1', isPinned: false, createdAt: now() });
  db.notices.push({ _id: genId(), title: 'Diwali Holiday', message: 'School closed Nov 1-5.', category: 'holiday', targetRoles: ['student','parent','teacher'], postedBy: '1', isPinned: false, createdAt: now() });
  db.notices.push({ _id: genId(), title: 'Parent-Teacher Meeting', message: 'PTM on Oct 15th.', category: 'urgent', targetRoles: ['parent','teacher'], postedBy: '1', isPinned: false, createdAt: now() });
  // Timetables
  classIds.slice(0,3).forEach(cid => { ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].forEach(day => { db.timetables.push({ _id: genId(), classId: cid, day, periods: ['Mathematics','English','Science','History','CS','PE'].map((sub,p) => ({ subject: sub, startTime: `${8+p}:00`, endTime: `${8+p}:45`, room: `Room ${100+p}` })) }); }); });
  console.log('Database seeded with demo data');
}

seed();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} (in-memory mode)`));
