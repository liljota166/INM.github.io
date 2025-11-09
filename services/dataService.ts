
import { Role, User, Subject, Task, Submission, Message, ForumPost, Conversation, PrivateMessage } from '../types';

const DB_KEY = 'inmodosa_db';
const LOGGED_IN_USER_KEY = 'inmodosa_user';

interface Database {
  users: User[];
  subjects: Subject[];
  tasks: Task[];
  submissions: Submission[];
  messages: Message[];
  posts: ForumPost[];
  conversations: Conversation[];
  privateMessages: PrivateMessage[];
}

const getMockData = (): Database => {
    const director: User = { id: 'user_0', name: 'Director Smith', role: Role.Director };
    const teacher1: User = { id: 'user_1', name: 'Mr. Garcia', role: Role.Teacher };
    const teacher2: User = { id: 'user_2', name: 'Ms. Jones', role: Role.Teacher };
    const students: User[] = [
        { id: 'user_3', name: 'Alice', role: Role.Student, grade: 11, attendance: 95, enrollmentStatus: { status: 'Activa', enrollmentDate: '2024-02-01' } },
        { id: 'user_4', name: 'Bob', role: Role.Student, grade: 11, attendance: 98, enrollmentStatus: { status: 'Activa', enrollmentDate: '2024-02-01' } },
        { id: 'user_5', name: 'Charlie', role: Role.Student, grade: 10, attendance: 92, enrollmentStatus: { status: 'Activa', enrollmentDate: '2024-02-02' } },
        { id: 'user_6', name: 'Diana', role: Role.Student, grade: 10, attendance: 100, enrollmentStatus: { status: 'Activa', enrollmentDate: '2024-02-02' } },
    ];

    const subjects: Subject[] = [
        { id: 'subj_1', name: 'Mathematics', teacherId: teacher1.id, grades: [10, 11] },
        { id: 'subj_2', name: 'History', teacherId: teacher2.id, grades: [10, 11] },
        { id: 'subj_3', name: 'Physics', teacherId: teacher1.id, grades: [11] },
    ];

    const tasks: Task[] = [
        { id: 'task_1', subjectId: 'subj_1', title: 'Algebra Homework', description: 'Complete exercises 1-10 on page 50.', dueDate: '2024-10-26', grade: 11 },
        { id: 'task_2', subjectId: 'subj_2', title: 'WWII Essay', description: 'Write a 500-word essay on the main causes.', dueDate: '2024-10-28', grade: 11 },
    ];
    
    const submissions: Submission[] = [
      { id: 'sub_1', taskId: 'task_1', studentId: 'user_3', submittedAt: '2024-10-25', file: { name: 'alice_algebra.pdf' }, grade: 4.5 },
    ];

    const messages: Message[] = [
        { id: 'msg_1', authorId: director.id, content: 'Welcome to the new school year!', timestamp: new Date().toISOString(), audience: 'global' },
    ];
    
    const posts: ForumPost[] = [
      { id: 'post_3', authorId: director.id, subjectId: 'global', title: '¡Convenio Estratégico con el SENA!', content: 'Nos complace anunciar una nueva alianza con el SENA para ofrecer programas técnicos a nuestros estudiantes de 10° y 11°. ¡Una gran oportunidad para su futuro profesional!', timestamp: new Date(Date.now() - 86400000).toISOString() }, // 1 day ago
      { id: 'post_1', authorId: director.id, subjectId: 'global', title: 'Aniversario del Colegio', content: '¡Celebraremos nuestro 50 aniversario el próximo mes! Prepárense para una semana llena de actividades.', timestamp: new Date(Date.now() - 172800000).toISOString() }, // 2 days ago
      { id: 'post_2', authorId: teacher1.id, subjectId: 'subj_1', title: 'Preparación para el Examen', content: 'Por favor, repasen los capítulos 3 y 4 para el próximo examen.', timestamp: new Date(Date.now() - 259200000).toISOString() }, // 3 days ago
    ];

    const conversations: Conversation[] = [
      { id: 'convo_1', participantIds: ['user_1', 'user_3'], updatedAt: new Date(Date.now() - 3600000).toISOString() }
    ];

    const privateMessages: PrivateMessage[] = [
      { id: 'pmsg_1', conversationId: 'convo_1', senderId: 'user_1', content: 'Alice, tu última tarea fue excelente. ¡Sigue así!', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 'pmsg_2', conversationId: 'convo_1', senderId: 'user_3', content: '¡Gracias, Mr. Garcia! Aprecio sus comentarios.', timestamp: new Date().toISOString() },
    ];

    return {
        users: [director, teacher1, teacher2, ...students],
        subjects,
        tasks,
        submissions,
        messages,
        posts,
        conversations,
        privateMessages,
    };
};

const getDB = (): Database => {
  try {
    const dbString = localStorage.getItem(DB_KEY);
    if (dbString) {
      const db = JSON.parse(dbString);
      // Sort posts on load to ensure consistent order
      db.posts.sort((a: ForumPost, b: ForumPost) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return db;
    } else {
      const mockData = getMockData();
      localStorage.setItem(DB_KEY, JSON.stringify(mockData));
      return mockData;
    }
  } catch (error) {
    console.error("Failed to read from localStorage", error);
    const mockData = getMockData();
    localStorage.setItem(DB_KEY, JSON.stringify(mockData));
    return mockData;
  }
};

const saveDB = (db: Database) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (error) {
    console.error("Failed to save to localStorage", error);
  }
};

export const dataService = {
  // --- Auth ---
  login: (name: string, role: Role, grade?: number): User => {
    const db = getDB();
    let user = db.users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.role === role && (role !== Role.Student || u.grade === grade));
    
    if (!user) {
        user = { id: `user_${Date.now()}`, name, role, grade, attendance: 100 };
        if (role === Role.Student) {
            user.enrollmentStatus = { status: 'Activa', enrollmentDate: new Date().toISOString().split('T')[0] };
        }
        db.users.push(user);
        saveDB(db);
    }
    localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(LOGGED_IN_USER_KEY);
  },

  getLoggedInUser: (): User | null => {
    const userString = localStorage.getItem(LOGGED_IN_USER_KEY);
    return userString ? JSON.parse(userString) : null;
  },
  
  getUserById: (id: string): User | undefined => {
    const db = getDB();
    return db.users.find(u => u.id === id);
  },

  // --- Data Getters ---
  getDataForUser: (user: User) => {
    const db = getDB();
    const common = {
        users: db.users,
        getUserById: (id: string) => db.users.find(u => u.id === id),
        getSubjectById: (id: string) => db.subjects.find(s => s.id === id),
        getTaskById: (id: string) => db.tasks.find(t => t.id === id),
        conversations: db.conversations.filter(c => c.participantIds.includes(user.id)),
        privateMessages: db.privateMessages,
    }

    if (user.role === Role.Student) {
        const studentSubjects = db.subjects.filter(s => s.grades.includes(user.grade!));
        const studentTasks = db.tasks.filter(t => t.grade === user.grade);
        const studentSubmissions = db.submissions.filter(s => s.studentId === user.id);
        const studentMessages = db.messages.filter(m => m.audience === 'global' || m.audience === 'students' || m.audience === user.grade);
        const studentPosts = db.posts.filter(p => p.subjectId === 'global' || studentSubjects.some(s => s.id === p.subjectId));
        return { ...common, subjects: studentSubjects, tasks: studentTasks, submissions: studentSubmissions, messages: studentMessages, posts: studentPosts };
    }
    if (user.role === Role.Teacher) {
        const teacherSubjects = db.subjects.filter(s => s.teacherId === user.id);
        const teacherTasks = db.tasks.filter(t => teacherSubjects.some(s => s.id === t.subjectId));
        const teacherSubmissions = db.submissions.filter(s => teacherTasks.some(t => t.id === s.taskId));
        const teacherMessages = db.messages.filter(m => m.audience === 'global' || m.audience === 'teachers');
        const teacherPosts = db.posts.filter(p => p.subjectId === 'global' || teacherSubjects.some(s => s.id === p.subjectId));
        return { ...common, subjects: teacherSubjects, tasks: teacherTasks, submissions: teacherSubmissions, messages: teacherMessages, posts: teacherPosts };
    }
    // Director
    return { ...common, ...db };
  },

  // --- Data Setters ---
  createTask: (task: Omit<Task, 'id'>) => {
    const db = getDB();
    const newTask = { ...task, id: `task_${Date.now()}` };
    db.tasks.push(newTask);
    saveDB(db);
    return newTask;
  },
  
  submitTask: (submission: Omit<Submission, 'id' | 'submittedAt'>) => {
    const db = getDB();
    const newSubmission = { ...submission, id: `sub_${Date.now()}`, submittedAt: new Date().toISOString() };
    db.submissions.push(newSubmission);
    saveDB(db);
    return newSubmission;
  },

  gradeSubmission: (submissionId: string, grade: number) => {
    const db = getDB();
    const submission = db.submissions.find(s => s.id === submissionId);
    if(submission) {
      submission.grade = grade;
      saveDB(db);
    }
    return submission;
  },

  sendMessage: (message: Omit<Message, 'id' | 'timestamp'>) => {
    const db = getDB();
    const newMessage = { ...message, id: `msg_${Date.now()}`, timestamp: new Date().toISOString() };
    db.messages.push(newMessage);
    saveDB(db);
    return newMessage;
  },

  sendPrivateMessage: (senderId: string, receiverId: string, content: string) => {
    const db = getDB();
    let conversation = db.conversations.find(c =>
      c.participantIds.includes(senderId) && c.participantIds.includes(receiverId)
    );

    const now = new Date().toISOString();

    if (!conversation) {
      conversation = {
        id: `convo_${Date.now()}`,
        participantIds: [senderId, receiverId],
        updatedAt: now,
      };
      db.conversations.push(conversation);
    } else {
      conversation.updatedAt = now;
    }

    const newMessage: PrivateMessage = {
      id: `pmsg_${Date.now()}`,
      conversationId: conversation.id,
      senderId: senderId,
      content: content,
      timestamp: now,
    };
    db.privateMessages.push(newMessage);
    saveDB(db);
    return newMessage;
  },

  createPost: (post: Omit<ForumPost, 'id'| 'timestamp'>) => {
    const db = getDB();
    const newPost = { ...post, id: `post_${Date.now()}`, timestamp: new Date().toISOString() };
    db.posts.push(newPost);
    db.posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    saveDB(db);
    return newPost;
  },

  createSubject: (subject: Omit<Subject, 'id'>) => {
    const db = getDB();
    const newSubject = { ...subject, id: `subj_${Date.now()}` };
    db.subjects.push(newSubject);
    saveDB(db);
    return newSubject;
  },

  deleteSubject: (subjectId: string) => {
    let db = getDB();
    db.subjects = db.subjects.filter(s => s.id !== subjectId);
    saveDB(db);
  },
};