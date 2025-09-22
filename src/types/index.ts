export interface Task {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  columnId: string;
  position: number;
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
  position: number;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  columns: Column[];
}