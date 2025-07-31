<template>
    <div class="dashboard-card calendar-section">
        <VCalendar
            class="custom-calendar"
            :attributes="attributes"
            expanded
            borderless
            @dayclick="onDayClick"
        />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTodoStore } from '@/store/todo';
import { storeToRefs } from 'pinia';
import 'v-calendar/style.css';
import { Calendar as VCalendar } from 'v-calendar';
import { useRouter } from 'vue-router';

const todoStore = useTodoStore();
const { pendingTodos, overdueTodos } = storeToRefs(todoStore);
const router = useRouter();

const onDayClick = (day: any) => {
  const date = day.id;
  router.push({ path: '/todos', query: { date } });
};

const attributes = computed(() => {
  const allTodos = [...pendingTodos.value, ...overdueTodos.value];
  return [
    {
      key: 'today',
      highlight: true, // Simplified highlight, will be styled via CSS
      dates: new Date(),
    },
    ...allTodos
      .filter(todo => todo.dueDate)
      .map(todo => {
        const color = todo.priority === 'urgent' ? 'red' : (todo.priority === 'important' ? 'orange' : 'blue');
        return {
            key: todo.id,
            bar: color,
            popover: {
                label: todo.text,
                visibility: 'hover',
            },
            dates: new Date(todo.dueDate!),
        }
    }),
  ] as any; // Use 'as any' to bypass the complex type issues for now
});
</script>

<style lang="less" scoped>
.calendar-section {
    padding: 0;
    background: transparent;
    border: none;
    box-shadow: none;
    cursor: pointer;
}
.custom-calendar {
  width: 100%;
  border-radius: @border-radius-lg;
  border: 1px solid var(--el-border-color-light);
  background-color: var(--bg-card);

  // Override v-calendar colors with our theme variables
  :deep(.vc-highlight) {
    background-color: var(--el-color-primary) !important;
    color: #ffffff !important;
  }

  :deep(.vc-bars) {
    .vc-bar {
      &[style*="background-color: red;"] {
        background-color: var(--el-color-danger) !important;
      }
      &[style*="background-color: orange;"] {
        background-color: var(--el-color-warning) !important;
      }
      &[style*="background-color: blue;"] {
        background-color: var(--el-color-primary) !important;
      }
    }
  }

  :deep(.vc-header) {
    padding: 20px 20px 10px 20px;
    
    .vc-title {
        color: var(--text-main);
        font-weight: 600;
        font-size: 1.2em;
    }
  }
  :deep(.vc-arrow) {
      color: var(--primary);
      transform: scale(1.2);
      &:hover {
          background-color: var(--el-color-primary-light-9);
      }
  }

  :deep(.vc-weekday) {
    padding-bottom: 15px;
    color: var(--text-light);
    font-size: 1em;
    font-weight: 600;
  }
  
  :deep(.vc-day) {
      min-height: 52px;
      padding: 4px;
  }
  :deep(.vc-day-content) {
      transition: all @transition-fast;
      border-radius: @border-radius-md;
      font-size: 1.05em;
      font-weight: 500;
      &.is-not-in-month {
          color: var(--el-text-color-placeholder);
          opacity: 0.7;
      }
      &:hover:not(.is-disabled) {
          background-color: var(--el-fill-color-light);
      }
  }
  
  :deep(.vc-bar) {
      width: 80%;
      height: 6px;
      border-radius: 3px;
      margin-top: 4px;
      margin-left: auto;
      margin-right: auto;
  }

  :deep(.vc-popover-content-wrapper) {
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: @border-radius-md;
      box-shadow: @shadow-main;
  }
   :deep(.vc-popover-caret) {
    display: none;
   }
}

</style> 