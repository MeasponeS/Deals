<template>
  <el-dialog v-model="visible" title="已办历史" width="900px" @close="$emit('close')">
    <div class="history-filters">
      <el-select v-model="filters.time" placeholder="时间范围">
        <el-option label="所有时间" value="all" />
        <el-option label="近一周" value="7" />
        <el-option label="近一月" value="30" />
        <el-option label="近半年" value="180" />
      </el-select>
      <el-select v-model="filters.priority" placeholder="优先级">
        <el-option label="所有优先级" value="all" />
        <el-option label="🍭 普通" value="normal" />
        <el-option label="⭐ 重要" value="important" />
        <el-option label="🔥 紧急" value="urgent" />
      </el-select>
      <el-date-picker
        v-model="filters.date"
        type="date"
        placeholder="按具体日期筛选"
        clearable
      />
    </div>
    <div class="task-list-container" style="height: 50vh;">
       <TodoList :todos="historyTodos" empty-text="历史记录是空的哦~" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue';
import { useTodoStore } from '@/store/todo';
import type { Todo } from '@/utils/api';
import TodoList from './TodoList.vue';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue', 'close']);
const visible = ref(props.modelValue);

watch(() => props.modelValue, async (isVisible) => {
  if (isVisible) {
    if (!todoStore.todos.length) {
      await todoStore.fetchTodos();
    }
    allHistory.value = todoStore.doneTodos;
  }
});
watch(visible, val => emit('update:modelValue', val));

const filters = reactive({
  time: 'all',
  priority: 'all',
  date: null as Date | null,
});

const allHistory = ref<Todo[]>([]);

const fetchHistory = async () => {
  allHistory.value = await db.todos.where('done').equals(1).reverse().sortBy('completedAt');
};

const historyTodos = computed(() => {
  let result = allHistory.value;

  // Time filter
  if (filters.time !== 'all') {
    const days = parseInt(filters.time);
    const d = new Date();
    d.setDate(d.getDate() - days);
    result = result.filter(t => t.completedAt && new Date(t.completedAt) > d);
  }

  // Priority filter
  if (filters.priority !== 'all') {
    result = result.filter(t => t.priority === filters.priority);
  }

  // Date filter
  if (filters.date) {
    const targetDate = filters.date.toDateString();
    result = result.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === targetDate);
  }

  return result;
});

watch(filters, fetchHistory, { deep: true });

</script>

<style lang="less" scoped>
.history-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
}
</style> 