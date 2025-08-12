import { useTodoStore } from '@/store/todo';
import { ElNotification } from 'element-plus';

let intervalId: number | null = null;

const checkReminders = async () => {
  const todoStore = useTodoStore();
  if (!todoStore.todos.length) {
    await todoStore.fetchTodos();
  }
  
  const now = new Date();
  
  todoStore.pendingTodos.forEach(todo => {
    if (todo.reminderAt && !todo.reminderSent) {
      const reminderTime = new Date(todo.reminderAt);
      if (now >= reminderTime) {
        ElNotification({
          title: `待办提醒: ${todo.title}`,
          message: `“${todo.content}”将在 ${new Date(todo.dueAt!).toLocaleString()} 到期`,
          type: 'warning',
          duration: 0, // Keep open until user closes it
        });
        // This should be updated via an API call in a real app
        // For now, we will just simulate it on the frontend.
        // todoStore.updateTodo(todo.id, { ...todo, reminderSent: true });
      }
    }
  });
};

export function useNotifications() {
  const start = () => {
    if (intervalId === null) {
      checkReminders(); // Check immediately on start
      intervalId = window.setInterval(checkReminders, 60000); // Check every minute
    }
  };

  const stop = () => {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  };

  return { start, stop };
} 