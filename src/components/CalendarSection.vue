<template>
    <div class="dashboard-card calendar-section">
        <VCalendar
            class="custom-calendar"
            :attributes="attributes"
            expanded
            borderless
        />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTodoStore } from '@/store/todo';
import { storeToRefs } from 'pinia';
import 'v-calendar/style.css';
import { Calendar as VCalendar } from 'v-calendar';

const todoStore = useTodoStore();
const { pendingTodos, overdueTodos } = storeToRefs(todoStore);

const attributes = computed(() => {
  const allTodos = [...pendingTodos.value, ...overdueTodos.value];
  return [
    {
      key: 'today',
      highlight: {
        color: 'blue', // This color is used by v-calendar logic, we override with CSS
        fillMode: 'solid',
        class: '!bg-primary !text-white', // Use primary color for today
      },
      dates: new Date(),
    },
    ...allTodos.map(todo => {
        const color = todo.priority === 'urgent' ? 'red' : (todo.priority === 'important' ? 'orange' : 'blue');
        return {
            key: todo.id,
            bar: { // Change from dot to bar
                color: color,
                class: 'task-bar'
            },
            popover: {
                label: todo.text,
                visibility: 'hover',
            },
            dates: todo.dueDate ? new Date(todo.dueDate) : null,
        }
    }),
  ]
});
</script>

<style lang="less" scoped>
.calendar-section {
    padding: 10px; // Reduce padding to give calendar more space
    background: transparent;
    border: none;
    box-shadow: none;
}
.custom-calendar {
  width: 100%;
  border-radius: @border-radius-lg; // Larger radius
  border: 1px solid var(--el-border-color-light);
  background-color: var(--bg-card);

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
      transform: scale(1);
      &:hover {
          background-color: var(--el-color-primary-light-9);
      }
  }

  :deep(.vc-weekday) {
    padding-bottom: 15px;
    color: var(--text-light);
    font-size: 0.9em;
  }
  
  :deep(.vc-day) {
      min-height: 48px;
  }
  :deep(.vc-day-content) {
      transition: all @transition-fast;
      border-radius: @border-radius-md;
      &.is-not-in-month {
          opacity: 0.5;
      }
      &:hover:not(.is-disabled) {
          background-color: var(--el-fill-color-light);
      }
  }
  
  :deep(.task-bar) {
      width: 70%;
      height: 5px;
      border-radius: 3px;
      margin-top: 2px;
  }

  :deep(.vc-popover-content-wrapper) {
      background-color: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: @border-radius-md;
      box-shadow: @shadow-main;
  }
   :deep(.vc-popover-caret) {
    display: none; // Hide default caret
   }
}

</style> 