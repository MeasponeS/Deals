<template>
  <div class="app-container" id="app-container">
    <el-container>
      <el-header class="app-header">
        <h1 class="app-title">智能提醒系统 ✨</h1>
        <UserMenu />
      </el-header>
      <el-main class="dashboard-container">
        <div class="dashboard-main">
          <TodoSection />
          <MemoSection />
        </div>
        <aside class="dashboard-sidebar">
          <AiAssistant />
          <CalendarSection />
        </aside>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import TodoSection from '@/components/TodoSection.vue';
import UserMenu from '@/components/UserMenu.vue';
import MemoSection from '@/components/MemoSection.vue';
import CalendarSection from '@/components/CalendarSection.vue';
import AiAssistant from '@/components/AiAssistant.vue';
import { onMounted, onUnmounted } from 'vue';
import { useNotifications } from '@/utils/notifications';

const notifications = useNotifications();

onMounted(() => {
  notifications.start();
});

onUnmounted(() => {
  notifications.stop();
});
</script>

<style lang="less" scoped>
// @import "@/styles/dashboard.less";
.app-container, .el-container {
  height: 100vh;
}
.app-header {
  flex-shrink: 0;
}
.el-main.dashboard-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5vw;
  padding: 0 0 1.5vw 0; /* Adjust padding */
  overflow: hidden;
}

.dashboard-main,
.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5vw;
  overflow: hidden;
}

// Deep selector to style child components from the parent
:deep(.dashboard-card) {
    background-color: var(--el-bg-color-overlay);
    border-radius: 16px;
    padding: 25px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    
    // Allow flex-grow to work by setting a base height
    flex-basis: 0;
}

// Assign flex-grow ratios
:deep(.todo-section) {
  flex-grow: 3;
}
:deep(.memo-section) {
  flex-grow: 2;
}
:deep(.ai-assistant) {
  flex-grow: 3;
}
:deep(.calendar-section) {
  flex-grow: 2;
}

// Responsive adjustments for smaller screens
@media (max-width: 1200px) {
  .el-main.dashboard-container {
    grid-template-columns: 1fr;
    overflow-y: auto; // Allow vertical scroll for the whole main area on small screens
  }
  .dashboard-sidebar {
     flex-direction: row; // Make sidebar items side-by-side
  }
  :deep(.calendar-section) {
    flex-grow: 1;
  }
  :deep(.ai-assistant) {
    flex-grow: 2;
  }
}
@media (max-width: 768px) {
    .dashboard-sidebar {
        flex-direction: column; // Stack them again on very small screens
    }
}
</style> 