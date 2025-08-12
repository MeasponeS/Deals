import { defineStore } from 'pinia';
import { ElMessage, ElNotification } from 'element-plus';
import confetti from 'canvas-confetti';
import { getTodos, createTodo, updateTodo, deleteTodo, completeTodo, type Todo, type TodoRequest } from '@/utils/api';

interface TodoState {
  todos: Todo[];
  searchTerm: string;
}

export const useTodoStore = defineStore('todo', {
  state: (): TodoState => ({
    todos: [],
    searchTerm: '',
  }),

  getters: {
    pendingTodos(state): Todo[] {
      const lowerCaseSearchTerm = state.searchTerm.toLowerCase();
      return state.todos
        .filter(todo => todo.status === 'IN_PROGRESS' && todo.title.toLowerCase().includes(lowerCaseSearchTerm))
        .sort((a, b) => {
            const urgencyOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            const urgencyA = urgencyOrder[a.urgency] || 0;
            const urgencyB = urgencyOrder[b.urgency] || 0;
            if (urgencyA !== urgencyB) {
                return urgencyB - urgencyA;
            }
            if (a.dueAt && b.dueAt) {
                return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
            }
            return 0;
        });
    },

    doneTodos(state): Todo[] {
        const lowerCaseSearchTerm = state.searchTerm.toLowerCase();
        return state.todos
            .filter(todo => todo.status === 'COMPLETED' && todo.title.toLowerCase().includes(lowerCaseSearchTerm))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    overdueTodos(state): Todo[] {
        const lowerCaseSearchTerm = state.searchTerm.toLowerCase();
        return state.todos
            .filter(todo => todo.status === 'EXPIRED' && todo.title.toLowerCase().includes(lowerCaseSearchTerm))
            .sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime());
    },
    
    todosForDate(state) {
      return (date: Date) => {
        const d = date.toISOString().slice(0, 10);
        return state.todos.filter(todo => 
            todo.status !== 'COMPLETED' && todo.dueAt && todo.dueAt.startsWith(d)
        );
      }
    }
  },

  actions: {
    async fetchTodos() {
      try {
        const response = await getTodos({ title: this.searchTerm });
        this.todos = response.data;
      } catch (error) {
        console.error("Failed to fetch todos:", error);
        ElMessage.error('获取待办事项失败');
      }
    },

    async addTodo(todoData: TodoRequest) {
        if (!todoData.title.trim()) {
            ElMessage.error('内容不能为空');
            return;
        }
        try {
            const response = await createTodo(todoData);
            this.todos.unshift(response.data);
            ElMessage.success('已添加待办！');
        } catch (error) {
            console.error("Failed to add todo:", error);
            ElMessage.error('添加失败');
        }
    },

    async updateTodo(id: number, todoData: TodoRequest) {
        try {
            const response = await updateTodo(id, todoData);
            const index = this.todos.findIndex(t => t.id === id);
            if (index !== -1) {
                this.todos[index] = response.data;
            }
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
            try {
                const response = await completeTodo(id);
                const index = this.todos.findIndex(t => t.id === id);
                if (index !== -1) {
                    this.todos[index] = response.data;
                }
                ElMessage.success('太棒了！又完成一项！');
                if (response.data.urgency === 'HIGH' || response.data.urgency === 'MEDIUM') {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                }
            } catch (error) {
                console.error("Failed to complete todo:", error);
                ElMessage.error('操作失败');
            }
        }
    },

    async deleteTodo(id: number) {
        try {
            await deleteTodo(id);
            this.todos = this.todos.filter(t => t.id !== id);
            ElMessage.success('已删除待办。');
        } catch (error) {
            console.error("Failed to delete todo:", error);
            ElMessage.error('删除失败');
        }
    },
    
    async clearDoneTodos() {
        // This functionality is not in the new API spec.
        // For now, we'll just remove them from the local state.
        const doneTodos = this.todos.filter(t => t.status === 'COMPLETED');
        const deletePromises = doneTodos.map(t => this.deleteTodo(t.id));
        try {
            await Promise.all(deletePromises);
            ElMessage.info('已清空所有已完成的待办事项。');
        } catch(e) {
            ElMessage.error('清空失败');
        }
    },

    setSearchTerm(term: string) {
        this.searchTerm = term;
        this.fetchTodos();
    }
  },
}); 