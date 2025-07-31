<template>
  <el-dialog
    v-model="isDialogVisible"
    title="设置中心"
    width="680px"
    @close="emit('update:modelValue', false)"
    class="settings-dialog"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="主题选择" name="theme">
        <div class="theme-selector">
          <div 
            v-for="theme in availableThemes" 
            :key="theme.id"
            class="theme-option"
            :class="{ active: themeStore.currentTheme === theme.class }"
            @click="handleThemeSelect(theme.id)"
          >
            <div class="theme-preview" :style="{ backgroundColor: theme.colors['--el-bg-color-page'] }">
              <div class="preview-header" :style="{ backgroundColor: theme.colors['--el-bg-color-overlay'] }">
                <div class="preview-dot" :style="{ backgroundColor: theme.colors['--el-color-primary'] }"></div>
              </div>
              <div class="preview-body">
                <div class="preview-line" :style="{ backgroundColor: theme.colors['--accent'] }"></div>
                <div class="preview-line short" :style="{ backgroundColor: theme.colors['--el-text-color-secondary'] }"></div>
              </div>
            </div>
            <div class="theme-info">
              <span class="theme-icon">{{ theme.icon }}</span>
              <span class="theme-name">{{ theme.name }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="API 设置" name="api">
        <div class="api-settings">
          <h4>OpenAI API Key</h4>
          <el-input
            v-model="apiKeyInput"
            type="password"
            show-password
            placeholder="请输入你的 OpenAI API Key"
          />
          <h4>Organization ID (可选)</h4>
          <el-input
            v-model="organizationIdInput"
            placeholder="请输入你的 Organization ID"
          />
          <el-button type="primary" @click="saveApiSettings">保存设置</el-button>
          <p class="settings-caption">
            你的 API Key 和 Organization ID 将被安全地存储在你的浏览器本地存储中，不会被上传到任何服务器。
          </p>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useThemeStore, availableThemes } from '@/store/theme';
import { ElMessage } from 'element-plus';
import { aiService } from '@/utils/aiService';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);

const themeStore = useThemeStore();
const activeTab = ref('theme');
const apiKeyInput = ref(aiService.getApiKey() || '');
const organizationIdInput = ref(aiService.getOrganizationId() || '');

const isDialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const handleThemeSelect = (themeId: string) => {
  themeStore.setTheme(themeId);
  ElMessage.success({
    message: '主题切换成功！',
    duration: 1500,
  });
  // No need to close the dialog anymore, user might want to change other settings.
};

const saveApiSettings = () => {
  const apiKey = apiKeyInput.value.trim();
  const orgId = organizationIdInput.value.trim();

  if (apiKey) {
    aiService.setApiKey(apiKey);
    if (orgId) {
      aiService.setOrganizationId(orgId);
    }
    ElMessage.success('API 设置已保存！');
    isDialogVisible.value = false;
  } else {
    ElMessage.warning('请输入有效的 API Key。');
  }
};
</script>

<style lang="less" scoped>
// --- Common Styles ---
.settings-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
}

// --- Theme Selector Styles ---
.theme-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 25px;
  padding: 20px;
}
.theme-option {
  cursor: pointer;
  border-radius: @border-radius-lg;
  overflow: hidden;
  border: 2px solid var(--el-border-color-light);
  transition: all @transition-fast;
  &:hover {
    transform: translateY(-5px);
    box-shadow: @shadow-main;
    border-color: var(--el-color-primary);
  }
  &.active {
    border-color: var(--el-color-primary);
    box-shadow: @shadow-strong;
  }
}
.theme-preview {
  height: 120px;
  padding: 12px;
  border-bottom: 2px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.preview-header {
  height: 25px;
  border-radius: @border-radius-sm;
  display: flex;
  align-items: center;
  padding: 0 8px;
  box-shadow: @shadow-light;
}
.preview-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.preview-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
}
.preview-line {
  height: 10px;
  border-radius: @border-radius-sm;
  width: 80%;
  &.short {
    width: 50%;
  }
}
.theme-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background-color: var(--el-bg-color-overlay);
}
.theme-icon { font-size: 1.8em; }
.theme-name { font-size: 1.1em; font-weight: bold; }

// --- API Settings Styles ---
.api-settings {
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  
  h4 {
    margin: 0;
    font-size: 1.1em;
    font-weight: 600;
  }

  .settings-caption {
    font-size: 0.85em;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }
}
</style>
  