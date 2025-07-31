import { db } from '@/db';
import { ElMessage, ElNotification } from 'element-plus';

const requestPermission = async () => {
    if (!('Notification' in window)) {
        ElMessage.error("此浏览器不支持桌面通知");
        return 'unsupported';
    }
    if (Notification.permission === 'granted') {
        return 'granted';
    }
    if (Notification.permission === 'denied') {
        ElMessage.error("通知权限已被禁用，请在浏览器设置中手动开启。");
        return 'denied';
    }
    // 当权限为 'default' 时
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        ElMessage.success("通知权限已获取！");
    } else {
        ElMessage.warning("你拒绝了本次通知请求。");
    }
    return permission;
};

const checkReminders = async () => {
    const now = new Date();
    const pendingTodos = await db.todos.where({ done: 0 }).toArray();
    for (const todo of pendingTodos) {
        if (todo.reminder && todo.reminder !== 'none' && todo.dueDate && !todo.reminderSent) {
            const dueDate = new Date(todo.dueDate);
            const diffMinutes = (dueDate.getTime() - now.getTime()) / 60000;
            if (diffMinutes > 0 && diffMinutes <= parseInt(todo.reminder, 10)) {
                new Notification('智能提醒', {
                    body: `"${todo.text}" 即将到期！`,
                    icon: '/favicon.ico' // Ensure you have a favicon in the public folder
                });
                await db.todos.update(todo.id!, { reminderSent: true });
            }
        }
    }
};

const testNotification = async () => {
    const perm = await requestPermission();
    if (perm === 'granted') {
        new Notification("测试提醒", {
            body: "如果看到我，说明你的提醒功能正常！🎉",
            icon: '/favicon.ico'
        });
    }
};

let reminderInterval: number | null = null;

export const useNotifications = () => {
    const start = async () => {
        await requestPermission();
        if (reminderInterval) {
            clearInterval(reminderInterval);
        }
        // Check every 30 seconds
        reminderInterval = window.setInterval(checkReminders, 30 * 1000);
    };

    const stop = () => {
        if (reminderInterval) {
            clearInterval(reminderInterval);
            reminderInterval = null;
        }
    };

    return {
        start,
        stop,
        testNotification,
    };
}; 