<template>
  <div class="user-menu">
    <el-dropdown trigger="click" @command="handleCommand">
      <div class="user-menu-btn">
        <el-avatar :size="28" class="user-avatar">{{ userStore.userInitial }}</el-avatar>
        <span id="username-display">{{ userStore.username }}</span>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="settings">
            <span class="icon">⚙️</span> 设置中心
          </el-dropdown-item>
          <el-dropdown-item command="test-notification">
            <span class="icon">🔔</span> 测试提醒
          </el-dropdown-item>
          <el-dropdown-item command="logout" divided>
            <span class="icon">🚪</span> 退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <SettingsModal v-model="showSettings" />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import SettingsModal from './SettingsModal.vue';
import { useNotifications } from '@/utils/notifications';

const userStore = useUserStore();
const router = useRouter();
const showSettings = ref(false);
const notifications = useNotifications();

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout();
    window.location.reload();
  } else if (command === 'settings') {
    showSettings.value = true;
  } else if (command === 'test-notification') {
    notifications.testNotification();
  }
}
</script>

<style lang="less" scoped>
.user-menu-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: var(--bg-input);
    border: 1px solid var(--border);
    padding: 8px 15px;
    border-radius: @border-radius-md;
    cursor: pointer;
    transition: all @transition-fast;

    &:hover {
        background-color: var(--border);
        border-color: var(--primary-light);
    }
}
.user-avatar {
    background-color: var(--primary) !important;
    color: white !important;
    font-weight: bold;
}
#username-display {
    font-weight: bold;
}
.icon {
  margin-right: 8px;
  font-style: normal;
}
</style> 