<template>
  <div class="user-menu">
    <el-dropdown trigger="click" @command="handleCommand">
      <div class="user-menu-btn">
        <el-avatar :size="28" class="user-avatar">{{ userStore.userInitial }}</el-avatar>
        <span id="username-display">{{ userStore.username }}</span>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="history">
            <span class="icon">📜</span> 查看历史
          </el-dropdown-item>
          <el-dropdown-item command="settings">
            <span class="icon">🎨</span> 主题设置
          </el-dropdown-item>
          <el-dropdown-item command="logout" divided>
            <span class="icon">🚪</span> 退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <SettingsModal v-model="showTheme" />
    <HistoryModal v-model="showHistory" />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import SettingsModal from './SettingsModal.vue';
import HistoryModal from './HistoryModal.vue';

const userStore = useUserStore();
const router = useRouter();
const showTheme = ref(false);
const showHistory = ref(false);

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout();
    // 使用 window.location.reload() 来确保所有状态都被清除
    window.location.reload();
  } else if (command === 'settings') {
    showTheme.value = true;
  } else if (command === 'history') {
    showHistory.value = true;
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