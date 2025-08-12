<template>
  <div class="dashboard-card todo-section">
    <div class="card-header">
      <h3><span class="icon">📝</span>我的待办清单</h3>
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
        v-model="newTodo.title" 
        placeholder="例如：晚上8点和朋友一起跑步~" 
        :rows="1" 
        resize="none" 
        @keydown.enter.prevent="handleSaveTodo"
      />
      <div class="todo-input-actions">
        <div class="todo-options">
          <el-date-picker v-model="newTodo.dueAt" type="datetime" placeholder="选择时间" />
          <el-select v-model="newTodo.urgency" placeholder="优先级" class="priority-select">
            <el-option label="🍭 普通" value="LOW" />
            <el-option label="⭐ 重要" value="MEDIUM" />
            <el-option label="🔥 紧急" value="HIGH" />
          </el-select>
          <el-select
            v-model="reminderOffsetMs"
            placeholder="提醒提前"
            :disabled="!newTodo.dueAt"
            class="reminder-select"
          >
            <el-option label="不提醒" :value="NO_REMINDER" />
            <el-option label="提前5分钟" :value="5 * 60 * 1000" />
            <el-option label="提前15分钟" :value="15 * 60 * 1000" />
            <el-option label="提前1小时" :value="60 * 60 * 1000" />
            <el-option label="提前1天" :value="24 * 60 * 60 * 1000" />
            <el-option v-if="isEditing" label="保留原提醒时间" :value="CUSTOM_PRESERVE" />
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
import type { Todo, TodoRequest } from '@/utils/api';
import type { ElInput } from 'element-plus';

const todoStore = useTodoStore();
const uiStore = useUiStore();

const activeView = ref('pending');

const getInitialNewTodo = (): TodoRequest => ({
  title: '',
  content: '',
  dueAt: null,
  urgency: 'LOW',
  reminderAt: null,
});

const newTodo = reactive(getInitialNewTodo());
const editingId = ref<number | null>(null);
const isEditing = computed(() => editingId.value !== null);
const taskInputRef = ref<InstanceType<typeof ElInput> | null>(null);

// Reminder options
const NO_REMINDER = -1;
const CUSTOM_PRESERVE = -2;
const reminderOffsetMs = ref<number>(NO_REMINDER);


const handleSaveTodo = async () => {
  // Compute final ISO strings
  const dueAtIso = newTodo.dueAt ? new Date(newTodo.dueAt).toISOString() : null;
  let reminderAtIso: string | null = null;
  if (newTodo.dueAt) {
    if (reminderOffsetMs.value === CUSTOM_PRESERVE && isEditing.value) {
      reminderAtIso = newTodo.reminderAt ? new Date(newTodo.reminderAt).toISOString() : null;
    } else if (reminderOffsetMs.value !== NO_REMINDER) {
      const base = new Date(newTodo.dueAt).getTime();
      reminderAtIso = new Date(base - reminderOffsetMs.value).toISOString();
    }
  }

  if (isEditing.value && editingId.value) {
    await todoStore.updateTodo(editingId.value, {
        title: newTodo.title,
        content: newTodo.content || newTodo.title,
        dueAt: dueAtIso,
        urgency: newTodo.urgency,
        reminderAt: reminderAtIso,
    });
  } else {
    await todoStore.addTodo({
      ...newTodo,
      content: newTodo.content || newTodo.title,
      dueAt: dueAtIso,
      reminderAt: reminderAtIso,
    });
  }
  resetInput();
};

const openForEdit = (todo: Todo) => {
    editingId.value = todo.id!;
    newTodo.title = todo.title;
    newTodo.content = todo.content;
    newTodo.dueAt = todo.dueAt;
    newTodo.urgency = todo.urgency;
    newTodo.reminderAt = todo.reminderAt;
    // Infer reminder offset from existing values
    if (todo.dueAt && todo.reminderAt) {
      const diff = new Date(todo.dueAt).getTime() - new Date(todo.reminderAt).getTime();
      const allowed = [5*60*1000, 15*60*1000, 60*60*1000, 24*60*60*1000];
      if (allowed.includes(diff)) {
        reminderOffsetMs.value = diff;
      } else {
        reminderOffsetMs.value = CUSTOM_PRESERVE; // preserve original reminder time
      }
    } else {
      reminderOffsetMs.value = NO_REMINDER;
    }
};

const resetInput = () => {
    Object.assign(newTodo, getInitialNewTodo());
    editingId.value = null;
    uiStore.clearTaskInput(); // Clear preset when we are done
    reminderOffsetMs.value = NO_REMINDER;
}

watch(() => uiStore.taskInputPreset, (preset) => {
    if (preset) {
        newTodo.title = preset;
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