
export enum Role {
  Student = 'Student',
  Teacher = 'Teacher',
  Director = 'Director',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  grade?: number;
  attendance?: number;
  enrollmentStatus?: {
    status: 'Activa' | 'Inactiva';
    enrollmentDate: string;
  };
}

export interface Subject {
  id: string;
  name:string;
  teacherId: string;
  grades: number[];
}

export interface Task {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string;
  fileUrl?: string; // Simulated file name/link
  grade: number;
}

export interface Submission {
  id: string;
  taskId: string;
  studentId: string;
  submittedAt: string;
  file: {
    name: string;
  };
  grade?: number; // Scale 1-5
}

export interface Message {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
  audience: 'global' | 'teachers' | 'students' | number; // number for grade
}

export interface ForumPost {
  id: string;
  authorId: string;
  subjectId: 'global' | string;
  title: string;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participantIds: [string, string];
  updatedAt: string;
}

export interface PrivateMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
}