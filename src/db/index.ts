import Dexie, { Table } from 'dexie';

// 1. Declare interfaces for the data models
export interface Todo {
  id?: number;
  text: string;
  dueDate: string | null;
  priority: 'normal' | 'important' | 'urgent';
  done: 0 | 1;
  createdAt: string;
  completedAt: string | null;
  reminder: string;
  recurring?: { period: string; day: string | null };
  reminderSent?: boolean;
}

export interface Memo {
    id?: number;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
}

export interface Attachment {
    id?: number;
    parentId: number;
    fileName: string;
    file: File;
    parentType: 'todo' | 'memo';
}

// 2. Define the database class
class SmartReminderDB extends Dexie {
  todos!: Table<Todo>;
  memos!: Table<Memo>;
  attachments!: Table<Attachment>;

  constructor() {
    super('smartReminderDB');
    this.version(3).stores({
        todos: '++id, text, dueDate, priority, done, createdAt, completedAt, reminder, recurring, [done+createdAt]',
        memos: '++id, title, content, tags, createdAt',
        attachments: '++id, &[parentId+fileName], file, parentType'
    });
  }
}

// 3. Export a singleton instance
export const db = new SmartReminderDB(); 