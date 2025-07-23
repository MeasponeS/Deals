import { defineStore } from 'pinia';
import { db, type Todo } from '@/db';
import { ElMessage, ElNotification } from 'element-plus';
import confetti from 'canvas-confetti';

interface TodoState {
  todos: Todo[];
  searchTerm: string;
}

const priorityOrder = { urgent: 3, important: 2, normal: 1 };

export const useTodoStore = defineStore('todo', {
  state: (): TodoState => ({
    todos: [],
    searchTerm: '',
  }),

  getters: {
    // 5. 【进行中】列表我希望按照紧急程度-截止时间排序
    pendingTodos(state) {
      const now = new Date();
      const filtered = state.todos.filter(todo =>
        !todo.done &&
        (!todo.dueDate || new Date(todo.dueDate) >= now) &&
        todo.text.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
      return filtered.sort((a, b) => {
        const priorityDiff = (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
        if (priorityDiff !== 0) return priorityDiff;
        if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        return 0;
      });
    },

    // 4. 【已完成】列表我希望按照完成时间排序
    doneTodos(state) {
       return state.todos.filter(todo =>
        todo.done && todo.text.toLowerCase().includes(state.searchTerm.toLowerCase())
      ).sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
    },

    // 2. 我希望添加一个【已过期】的tab
    overdueTodos(state) {
      const now = new Date();
      return state.todos.filter(todo =>
        !todo.done &&
        todo.dueDate &&
        new Date(todo.dueDate) < now &&
        todo.text.toLowerCase().includes(state.searchTerm.toLowerCase())
      ).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    },
    
    // 1. 已完成的待办不需要出现在日历中
    todosForDate(state) {
      return (date: Date) => {
        const d = date.toISOString().slice(0, 10);
        return state.todos.filter(todo => 
          !todo.done && todo.dueDate && todo.dueDate.startsWith(d)
        );
      }
    }
  },

  actions: {
    async fetchTodos() {
      this.todos = await db.todos.toArray();
    },

    async addTodo(todoData: Omit<Todo, 'id' | 'done' | 'createdAt' | 'completedAt'>) {
        if (!todoData.text.trim()) {
            ElMessage.error('内容不能为空');
            return;
        }
        try {
            const newTodo: Omit<Todo, 'id'> = {
                ...todoData,
                done: 0,
                createdAt: new Date().toISOString(),
                completedAt: null,
                reminderSent: false,
            };
            const newId = await db.todos.add(newTodo as Todo);
            const newlyAddedTodo = await db.todos.get(newId);
            if (newlyAddedTodo) {
                this.todos.unshift(newlyAddedTodo); // 直接更新 state
            }
            ElMessage.success('已添加待办！');
        } catch (error) {
            console.error("Failed to add todo:", error);
            ElMessage.error('添加失败');
        }
    },

    async updateTodo(id: number, todoData: Partial<Todo>) {
        try {
            await db.todos.update(id, todoData);
            await this.fetchTodos();
            ElMessage.success('待办已更新！');
        } catch (error) {
            console.error("Failed to update todo:", error);
            ElMessage.error('更新失败');
        }
    },
    
    async toggleTodoStatus(id: number) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            const isDone = !todo.done;
            await db.todos.update(id, { 
                done: isDone ? 1 : 0, 
                completedAt: isDone ? new Date().toISOString() : null 
            });
            await this.fetchTodos();
            if(isDone) {
                ElMessage.success('太棒了！又完成一项！');
                if (todo.priority === 'urgent' || todo.priority === 'important') {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                }
            } else {
                ElMessage.info('已移回待办。'); 
            }
        }
    },

    async deleteTodo(id: number) {
        // We can add a confirmation dialog in the component later
        try {
            await db.transaction('rw', db.todos, db.attachments, async () => {
                await db.attachments.where({ parentId: id, parentType: 'todo' }).delete();
                await db.todos.delete(id);
            });
            await this.fetchTodos();
            ElMessage.success('已删除待办。');
        } catch (error) {
            console.error("Failed to delete todo:", error);
            ElMessage.error('删除失败');
        }
    },
    
    async clearDoneTodos() {
        try {
            await db.todos.where('done').equals(1).delete();
            await this.fetchTodos();
            ElMessage.info('已清空所有已完成的待办事项。');
        } catch (error) {
            console.error("Failed to clear done todos:", error);
            ElMessage.error('清空失败');
        }
    },

    setSearchTerm(term: string) {
        this.searchTerm = term;
    }
  },
}); 