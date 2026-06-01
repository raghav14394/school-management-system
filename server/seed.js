const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
const Attendance = require('./models/Attendance');
const Exam = require('./models/Exam');
const Result = require('./models/Result');
const Fee = require('./models/Fee');
const Notice = require('./models/Notice');
const Timetable = require('./models/Timetable');
const Assignment = require('./models/Assignment');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all collections
    await User.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Class.deleteMany({});
    await Attendance.deleteMany({});
    await Exam.deleteMany({});
    await Result.deleteMany({});
    await Fee.deleteMany({});
    await Notice.deleteMany({});
    await Timetable.deleteMany({});
    await Assignment.deleteMany({});
    console.log('Cleared all collections');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@school.com',
      password: 'admin123',
      role: 'admin',
      phone: '9876543210'
    });
    console.log('Admin created');

    // Create Classes
    const class1 = await Class.create({ name: 'Class 1', section: 'A', academicYear: '2024-2025' });
    const class2 = await Class.create({ name: 'Class 2', section: 'A', academicYear: '2024-2025' });
    const class3 = await Class.create({ name: 'Class 3', section: 'A', academicYear: '2024-2025' });
    const class4 = await Class.create({ name: 'Class 4', section: 'B', academicYear: '2024-2025' });
    const class5 = await Class.create({ name: 'Class 5', section: 'A', academicYear: '2024-2025' });
    console.log('Classes created');

    // Create Teachers
    const teacherUsers = [];
    const teachers = [];
    const teacherData = [
      { name: 'John Smith', subject: 'Mathematics', qualification: 'M.Sc Math', experience: 8 },
      { name: 'Sarah Johnson', subject: 'English', qualification: 'M.A English', experience: 5 },
      { name: 'Michael Brown', subject: 'Science', qualification: 'M.Sc Physics', experience: 10 },
      { name: 'Emily Davis', subject: 'History', qualification: 'M.A History', experience: 6 },
      { name: 'David Wilson', subject: 'Computer Science', qualification: 'M.Tech CS', experience: 4 }
    ];

    for (let i = 0; i < teacherData.length; i++) {
      const t = teacherData[i];
      const user = await User.create({
        name: t.name,
        email: t.name.toLowerCase().replace(' ', '.') + '@school.com',
        password: 'teacher123',
        role: 'teacher',
        phone: `98765432${i + 10}`
      });
      const teacher = await Teacher.create({
        userId: user._id,
        subject: t.subject,
        qualification: t.qualification,
        experience: t.experience,
        salary: 40000 + i * 5000
      });
      teacherUsers.push(user);
      teachers.push(teacher);
    }

    // Assign teachers to classes
    await Class.findByIdAndUpdate(class1._id, { teacherId: teachers[0]._id });
    await Class.findByIdAndUpdate(class2._id, { teacherId: teachers[1]._id });
    await Class.findByIdAndUpdate(class3._id, { teacherId: teachers[2]._id });
    await Class.findByIdAndUpdate(class4._id, { teacherId: teachers[3]._id });
    await Class.findByIdAndUpdate(class5._id, { teacherId: teachers[4]._id });
    console.log('Teachers created and assigned');

    // Create Parents
    const parentUsers = [];
    for (let i = 1; i <= 15; i++) {
      const parent = await User.create({
        name: `Parent ${i}`,
        email: `parent${i}@school.com`,
        password: 'parent123',
        role: 'parent',
        phone: `98765000${i.toString().padStart(2, '0')}`
      });
      parentUsers.push(parent);
    }
    console.log('Parents created');

    // Create Students
    const studentUsers = [];
    const students = [];
    const classes = [class1, class1, class2, class2, class2, class3, class3, class3, class4, class4, class5, class5, class5, class1, class2];
    const genders = ['Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male'];

    for (let i = 1; i <= 15; i++) {
      const user = await User.create({
        name: `Student ${i}`,
        email: `student${i}@school.com`,
        password: 'student123',
        role: 'student',
        phone: `98766000${i.toString().padStart(2, '0')}`
      });
      const student = await Student.create({
        userId: user._id,
        classId: classes[i - 1]._id,
        parentId: parentUsers[i - 1]._id,
        rollNumber: `STU${i.toString().padStart(3, '0')}`,
        dateOfBirth: new Date(2010 + Math.floor(i / 5), (i % 12), 15),
        gender: genders[i - 1],
        bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-'][i % 7]
      });
      studentUsers.push(user);
      students.push(student);
    }
    console.log('Students created');

    // Create Attendance (last 30 days for first 10 students)
    const today = new Date();
    for (let day = 0; day < 30; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - day);
      if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends

      for (let s = 0; s < 10; s++) {
        const rand = Math.random();
        let status = 'present';
        if (rand > 0.85) status = 'absent';
        else if (rand > 0.75) status = 'late';

        await Attendance.create({
          studentId: students[s]._id,
          date,
          status,
          markedBy: teacherUsers[0]._id
        });
      }
    }
    console.log('Attendance created');

    // Create Exams
    const exams = [];
    const examData = [
      { name: 'Mid Term', classId: class1._id, subject: 'Mathematics', date: new Date('2024-09-15'), totalMarks: 100, passMarks: 35 },
      { name: 'Mid Term', classId: class1._id, subject: 'English', date: new Date('2024-09-17'), totalMarks: 100, passMarks: 35 },
      { name: 'Mid Term', classId: class2._id, subject: 'Mathematics', date: new Date('2024-09-16'), totalMarks: 100, passMarks: 35 },
      { name: 'Final Term', classId: class1._id, subject: 'Mathematics', date: new Date('2025-03-15'), totalMarks: 100, passMarks: 35 },
      { name: 'Final Term', classId: class2._id, subject: 'English', date: new Date('2025-03-17'), totalMarks: 100, passMarks: 35 }
    ];
    for (const ed of examData) {
      exams.push(await Exam.create(ed));
    }
    console.log('Exams created');

    // Create Results
    for (const exam of exams) {
      const classStudents = students.filter(s => s.classId.toString() === exam.classId.toString());
      for (const student of classStudents) {
        const marks = Math.floor(Math.random() * 60) + 40;
        let grade = 'F';
        if (marks >= 90) grade = 'A+';
        else if (marks >= 80) grade = 'A';
        else if (marks >= 70) grade = 'B';
        else if (marks >= 60) grade = 'C';
        else if (marks >= 50) grade = 'D';
        else if (marks >= 35) grade = 'E';

        await Result.create({ studentId: student._id, examId: exam._id, marks, grade });
      }
    }
    console.log('Results created');

    // Create Fees
    const months = ['2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'];
    for (const student of students) {
      for (let m = 0; m < months.length; m++) {
        const status = m < 6 ? 'paid' : (Math.random() > 0.3 ? 'paid' : 'unpaid');
        await Fee.create({
          studentId: student._id,
          amount: 5000,
          feeType: 'tuition',
          status,
          paidAmount: status === 'paid' ? 5000 : 0,
          dueDate: new Date(`${months[m]}-10`),
          paidDate: status === 'paid' ? new Date(`${months[m]}-05`) : null,
          month: months[m],
          academicYear: '2024-2025'
        });
      }
    }
    console.log('Fees created');

    // Create Notices
    await Notice.create({
      title: 'Welcome to New Academic Year 2024-25',
      message: 'We are excited to welcome all students back for the new academic year. Classes begin on April 1st, 2024.',
      category: 'general',
      targetRoles: ['student', 'parent', 'teacher'],
      postedBy: admin._id,
      isPinned: true
    });
    await Notice.create({
      title: 'Annual Sports Day',
      message: 'Annual Sports Day will be held on March 20th, 2025. All students are encouraged to participate.',
      category: 'event',
      targetRoles: ['student', 'parent'],
      postedBy: admin._id
    });
    await Notice.create({
      title: 'Mid-Term Exam Schedule',
      message: 'Mid-term examinations will be conducted from September 15th to September 25th, 2024.',
      category: 'exam',
      targetRoles: ['student', 'parent', 'teacher'],
      postedBy: admin._id
    });
    await Notice.create({
      title: 'Holiday Notice - Diwali',
      message: 'School will remain closed from November 1st to November 5th for Diwali celebrations.',
      category: 'holiday',
      targetRoles: ['student', 'parent', 'teacher'],
      postedBy: admin._id
    });
    await Notice.create({
      title: 'Parent-Teacher Meeting',
      message: 'PTM is scheduled for October 15th, 2024. All parents are requested to attend.',
      category: 'urgent',
      targetRoles: ['parent', 'teacher'],
      postedBy: admin._id
    });
    console.log('Notices created');

    // Create Timetables
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Computer Science', 'Physical Education'];
    for (const cls of [class1, class2, class3]) {
      for (const day of days) {
        const periods = [];
        const startTime = 8;
        for (let p = 0; p < 6; p++) {
          periods.push({
            subject: subjects[p],
            teacherId: teachers[p]._id,
            startTime: `${startTime + p}:00`,
            endTime: `${startTime + p}:45`,
            room: `Room ${Math.floor(Math.random() * 20) + 100}`
          });
        }
        await Timetable.create({ classId: cls._id, day, periods });
      }
    }
    console.log('Timetables created');

    // Create Assignments
    for (const cls of [class1, class2, class3]) {
      for (let a = 1; a <= 3; a++) {
        await Assignment.create({
          title: `Assignment ${a} - ${subjects[a - 1]}`,
          description: `Complete the exercises from Chapter ${a} of the ${subjects[a - 1]} textbook. Submit your work before the due date.`,
          classId: cls._id,
          subject: subjects[a - 1],
          teacherId: teachers[a - 1]._id,
          dueDate: new Date(Date.now() + (a * 7 * 24 * 60 * 60 * 1000)),
          totalMarks: 50
        });
      }
    }
    console.log('Assignments created');

    console.log('\n=== SEED COMPLETE ===');
    console.log('Login Credentials:');
    console.log('Admin:   admin@school.com / admin123');
    console.log('Teacher: john.smith@school.com / teacher123');
    console.log('Student: student1@school.com / student123');
    console.log('Parent:  parent1@school.com / parent123');
    console.log('=====================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
