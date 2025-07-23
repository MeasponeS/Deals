<template>
  <el-dialog v-model="visible" title="设置" width="400px" @close="$emit('close')">
    <div class="settings-content">
      <h3><span class="icon">🎨</span> 主题设置</h3>
      <p>选择一个你喜欢的风格吧！</p>
      <div class="theme-selector">
      <div
        v-for="theme in themeList"
        :key="theme.name"
        class="theme-option"
        :class="{ active: themeStore.currentTheme === theme.name }"
        @click="setTheme(theme.name)"
      >
        <span>{{ theme.label }}</span>
      </div>
      </div>
      <el-divider />
      <h3><span class="icon">🔔</span> 通知测试</h3>
       <el-button @click="notifications.testNotification" class="test-btn">
        测试桌面提醒
      </el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useThemeStore, themeList } from '@/store/theme'
import { useNotifications } from '@/utils/notifications';
import { ref, watch } from 'vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'close'])
const visible = ref(props.modelValue)
const themeStore = useThemeStore()
const notifications = useNotifications();


watch(() => props.modelValue, v => visible.value = v)
watch(visible, v => emit('update:modelValue', v))

function setTheme(theme: string) {
  themeStore.setTheme(theme)
}
</script>

<style lang="less" scoped>
.settings-content h3 {
  margin: 20px 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.theme-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 10px;
}
.theme-option {
  padding: 15px;
  border: 2px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  font-weight: 500;
  font-size: 1.1em;
  transition: all 0.2s;
  background: var(--bg-input);
}
.theme-option.active, .theme-option:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--bg-card);
}
.theme-option span {
  font-size: 1.5em;
  display: block;
  margin-bottom: 8px;
}

.test-btn {
    width: 100%;
    margin-top: 10px;
    background-color: var(--accent);
    color: var(--text-main);
    border: none;
    font-weight: 500;
     &:hover {
      opacity: 0.8;
      background-color: color-mix(in srgb, var(--accent) 80%, black);
    }
}
</style> 