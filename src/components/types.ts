export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
} 

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedUsers: string[];
  currentEditor?: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  activeTaskId?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedUsers: string[];
  currentEditor?: string;
}

export interface BoardState {
  tasks: Task[];
  users: User[];
}
