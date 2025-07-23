<template>
  <div class="dashboard-card todo-section">
    <div class="card-header">
      <h3><span class="icon">��</span>我的待办清单</h3>
      <div class="header-actions">
        <el-input 
          :model-value="todoStore.searchTerm"
          @update:modelValue="todoStore.setSearchTerm($event)"
          placeholder="搜索待办..." 
          class="card-search-input" 
          clearable 
        />
      </div>
    </div>
    <div class="todo-input-container">
      <el-input 
        ref="taskInputRef"
        type="textarea" 
        v-model="newTodo.text" 
        placeholder="例如：晚上8点和朋友一起跑步~" 
        :rows="1" 
        resize="none" 
        @keydown.enter.prevent="handleSaveTodo"
      />
      <div class="todo-input-actions">
        <div class="todo-options">
          <el-date-picker v-model="newTodo.dueDate" type="datetime" placeholder="选择时间" />
          <el-select v-model="newTodo.priority" placeholder="优先级" class="priority-select">
            <el-option label="🍭 普通" value="normal" />
            <el-option label="⭐ 重要" value="important" />
            <el-option label="🔥 紧急" value="urgent" />
          </el-select>
          <el-select v-model="newTodo.reminder" placeholder="提醒" class="reminder-select">
            <el-option label="🔔 不提醒" value="none" />
            <el-option label="提前5分钟" value="5" />
            <el-option label="提前15分钟" value="15" />
            <el-option label="提前30分钟" value="30" />
            <el-option label="提前1小时" value="60" />
            <el-option label="提前1天" value="1440" />
          </el-select>
        </div>
        <el-button type="primary" @click="handleSaveTodo">{{ isEditing ? '更 新' : '添 加' }}</el-button>
      </div>
    </div>
    <el-tabs v-model="activeView" class="todo-tabs">
      <el-tab-pane label="进行中" name="pending">
        <TodoList :todos="todoStore.pendingTodos" listType="pending" @edit="openForEdit" />
      </el-tab-pane>
      <el-tab-pane name="overdue">
        <template #label>
          <el-badge :value="todoStore.overdueTodos.length" :hidden="!todoStore.overdueTodos.length">
            <span>已过期</span>
          </el-badge>
        </template>
        <TodoList :todos="todoStore.overdueTodos" listType="overdue" @edit="openForEdit" />
      </el-tab-pane>
      <el-tab-pane label="已完成" name="done">
        <TodoList :todos="todoStore.doneTodos" listType="done" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useTodoStore } from '@/store/todo';
import { useUiStore } from '@/store/ui';
import TodoList from './TodoList.vue';
import type { Todo } from '@/db';
import type { ElInput } from 'element-plus';

const todoStore = useTodoStore();
const uiStore = useUiStore();

const activeView = ref('pending');

const getInitialNewTodo = (): Omit<Todo, 'id' | 'done' | 'createdAt' | 'completedAt'> => ({
  text: '',
  dueDate: null,
  priority: 'normal',
  reminder: 'none',
});

const newTodo = reactive(getInitialNewTodo());
const editingId = ref<number | null>(null);
const isEditing = computed(() => editingId.value !== null);
const taskInputRef = ref<InstanceType<typeof ElInput> | null>(null);


const handleSaveTodo = async () => {
  if (isEditing.value && editingId.value) {
    await todoStore.updateTodo(editingId.value, {
        text: newTodo.text,
        dueDate: newTodo.dueDate ? new Date(newTodo.dueDate).toISOString() : null,
        priority: newTodo.priority,
        reminder: newTodo.reminder
    });
  } else {
    await todoStore.addTodo({
      ...newTodo,
      dueDate: newTodo.dueDate ? new Date(newTodo.dueDate).toISOString() : null,
    });
  }
  resetInput();
};

const openForEdit = (todo: Todo) => {
    editingId.value = todo.id!;
    newTodo.text = todo.text;
    newTodo.dueDate = todo.dueDate;
    newTodo.priority = todo.priority;
    newTodo.reminder = todo.reminder || 'none';
};

const resetInput = () => {
    Object.assign(newTodo, getInitialNewTodo());
    editingId.value = null;
    uiStore.clearTaskInput(); // Clear preset when we are done
}

watch(() => uiStore.taskInputPreset, (preset) => {
    if (preset) {
        newTodo.text = preset;
        taskInputRef.value?.focus();
    }
});

onMounted(() => {
  todoStore.fetchTodos();
});
</script>

<style lang="less" scoped>
.dashboard-card {
    background-color: var(--bg-card);
    border-radius: @border-radius-lg;
    box-shadow: @shadow-main;
    padding: 25px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.todo-section {
  flex-grow: 3;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
   h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.4em;
    font-weight: bold;
  }
}
.todo-input-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}
.todo-input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.todo-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.todo-tabs {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; // 确保子元素不会溢出父容器
}

.task-list-container {
  flex-grow: 1;
  overflow-y: auto;
}

:deep(.el-tabs__content) {
  height: 100%;
  overflow-y: auto; // 允许内容区域垂直滚动
  padding-right: 10px; // 增加一点内边距，避免滚动条紧贴内容
}
</style> 