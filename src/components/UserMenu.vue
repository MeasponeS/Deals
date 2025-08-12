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
            <span class="icon">🎨</span> 主题设置
          </el-dropdown-item>
          <el-dropdown-item command="change-password">
            <span class="icon">🔑</span> 修改密码
          </el-dropdown-item>
          <el-dropdown-item command="logout" divided>
            <span class="icon">🚪</span> 退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- Settings Modal -->
    <SettingsModal v-model="showSettingsModal" />

    <!-- Change Password Dialog -->
    <el-dialog v-model="showChangePasswordDialog" title="修改密码" width="400px">
      <el-form ref="changePasswordFormRef" :model="changePasswordForm" :rules="changePasswordRules" label-width="80px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="changePasswordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="changePasswordForm.newPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChangePasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user';
import { ref, reactive } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import SettingsModal from './SettingsModal.vue'; // Import the SettingsModal component

const userStore = useUserStore();
const showChangePasswordDialog = ref(false);
const showSettingsModal = ref(false); // Add a ref to control the settings modal

// Change Password Form
const changePasswordFormRef = ref<FormInstance>();
const changePasswordForm = reactive({
  oldPassword: '',
  newPassword: '',
});
const changePasswordRules = reactive<FormRules>({
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 15, message: '密码长度应为6-15个字符', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,15}$/,
      message: '密码必须包含英文和数字',
      trigger: 'blur',
    },
  ],
});

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout();
  } else if (command === 'change-password') {
    showChangePasswordDialog.value = true;
    changePasswordFormRef.value?.resetFields();
  } else if (command === 'settings') { // Add a case for settings
    showSettingsModal.value = true;
  }
};

const handleChangePassword = async () => {
  if (!changePasswordFormRef.value) return;
  await changePasswordFormRef.value.validate(async (valid) => {
    if (valid) {
      const success = await userStore.changePassword(changePasswordForm);
      if (success) {
        showChangePasswordDialog.value = false;
        ElMessage.success('密码修改成功，请重新登录。');
        userStore.logout();
      }
    }
  });
};
</script>

<style lang="less" scoped>
.user-menu-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: var(--bg-input);
    border: 1px solid var(--border);
    padding: 8px 15px;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all 0.2s ease-in-out;

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
