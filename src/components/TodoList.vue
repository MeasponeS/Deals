<template>
  <div class="task-list-container">
    <ul v-if="todos.length > 0" class="task-list">
      <li v-for="todo in todos" :key="todo.id" class="task-list-item" :class="{ done: todo.status === 'COMPLETED' }">
        <div class="task-checkbox-container">
          <el-checkbox :model-value="todo.status === 'COMPLETED'" @change="() => todoStore.toggleTodoStatus(todo.id!)" />
        </div>
        <div class="task-content">
          <span class="task-text">{{ todo.title }}</span>
          <span v-if="todo.dueAt" class="task-due-date">{{ formatDueDate(todo) }}</span>
        </div>
        <div class="task-actions">
           <el-tag v-if="priorityMap[todo.urgency]" :type="priorityMap[todo.urgency].type" size="small" effect="dark" round>
             {{ priorityMap[todo.urgency].label }}
           </el-tag>
           <el-dropdown trigger="click">
            <el-button :icon="MoreFilled" circle plain />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="listType === 'pending'" @click="$emit('edit', todo)" :icon="Edit">编辑</el-dropdown-item>
                <el-dropdown-item @click="handleDelete(todo.id!)" class="danger-item" :icon="Delete">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </li>
    </ul>
    <el-empty v-else :description="emptyText" />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { Todo } from '@/utils/api';
import { useTodoStore } from '@/store/todo';
import { ElMessageBox } from 'element-plus';
import { MoreFilled, Edit, Delete } from '@element-plus/icons-vue';

const props = defineProps({
  todos: {
    type: Array as PropType<Todo[]>,
    required: true,
  },
  listType: {
    type: String as PropType<'pending' | 'overdue' | 'done'>,
    required: true,
  },
  emptyText: {
    type: String,
    default: '这里什么都没有哦~'
  }
});

defineEmits(['edit']);

const todoStore = useTodoStore();

const priorityMap = {
  HIGH: { label: '紧急', type: 'danger' },
  MEDIUM: { label: '重要', type: 'warning' },
  LOW: {label: '普通', type: 'info'}
};

const formatDueDate = (todo: Todo) => {
  if (todo.status === 'COMPLETED') {
    return `完成于: ${new Date(todo.createdAt).toLocaleString()}`;
  }
  if(todo.dueAt) {
    return `截止于: ${new Date(todo.dueAt).toLocaleString()}`;
  }
  return '';
};

const handleDelete = (id: number) => {
  ElMessageBox.confirm(
    '确定要删除这个待办吗?',
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    todoStore.deleteTodo(id);
  }).catch(() => {
    // cancelled
  });
}
</script>

<style lang="less" scoped>
.task-list-container {
    flex-grow: 1;
    position: relative;
    overflow: hidden;
}

.task-list {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;
    height: 100%;
}

.task-list-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 15px;
    padding: 15px 5px;
    border-bottom: 1px solid var(--border);

    &.done .task-text {
        text-decoration: line-through;
        color: var(--text-light);
    }
}

.task-content {
    display: flex;
    flex-direction: column;
    .task-text {
        font-size: 1.1em;
        font-weight: 500;
    }
    .task-due-date {
        font-size: 0.9em;
        color: var(--text-light);
        margin-top: 4px;
    }
}

.task-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.danger-item {
  color: var(--danger);
  &:hover {
    background-color: var(--danger-hover);
  }
}
</style> 