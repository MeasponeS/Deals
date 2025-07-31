<template>
  <el-config-provider :locale="locale">
    <div id="app-container" :class="themeStore.currentTheme">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useTodoStore } from '@/store/todo';
import { useThemeStore, availableThemes } from '@/store/theme';
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

const themeStore = useThemeStore();
const locale = computed(() => zhCn);

const scheduleWeeklyClear = () => {
  const todoStore = useTodoStore();
  const now = new Date();
  
  // 计算到下一个周日午夜的时间
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
  nextSunday.setHours(23, 59, 59, 999); // 周日午夜

  const delay = nextSunday.getTime() - now.getTime();

  setTimeout(() => {
    console.log('Clearing done todos...');
    todoStore.clearDoneTodos();
    // 清理完后，设置下一次清理
    scheduleWeeklyClear();
  }, delay);
};

const applyThemeStyles = (themeClass: string) => {
  const theme = availableThemes.find(t => t.class === themeClass);
  if (!theme) return;

  const themeColors = theme.colors;

  for (const [key, value] of Object.entries(themeColors)) {
    document.documentElement.style.setProperty(key, value);
  }
};

watch(() => themeStore.currentTheme, (newThemeClass) => {
  applyThemeStyles(newThemeClass);
}, { immediate: true });


onMounted(() => {
  scheduleWeeklyClear();
});
</script>

<style lang="less">
#app {
  height: 100%;
}

#app-container {
  height: 100%;
  width: 100%;
}
</style> 