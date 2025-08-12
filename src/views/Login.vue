<template>
  <div class="login-container">
    <div class="login-box">
      <h2>智能提醒系统 ✨</h2>
      <el-tabs v-model="activeTab" class="login-tabs">
        <!-- Login Form -->
        <el-tab-pane label="登录" name="login">
          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" @submit.prevent="handleLogin">
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" placeholder="用户名" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="loginForm.password" type="password" placeholder="密码" show-password />
            </el-form-item>
            <el-button type="primary" native-type="submit" style="width: 100%">登录</el-button>
          </el-form>
        </el-tab-pane>

        <!-- Registration Form -->
        <el-tab-pane label="注册" name="register">
          <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" @submit.prevent="handleRegister">
            <el-form-item prop="username">
              <el-input v-model="registerForm.username" placeholder="用户名 (不超过10位)" maxlength="10" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="registerForm.password" type="password" placeholder="密码 (6-15位, 含数字、英文)" show-password />
            </el-form-item>
            <el-form-item prop="securityQuestion">
              <el-input v-model="registerForm.securityQuestion" placeholder="密保问题" />
            </el-form-item>
            <el-form-item prop="securityAnswer">
              <el-input v-model="registerForm.securityAnswer" placeholder="密保答案" />
            </el-form-item>
            <el-button type="primary" native-type="submit" style="width: 100%">注册</el-button>
          </el-form>
        </el-tab-pane>

        <!-- Forgot Password Form -->
        <el-tab-pane label="忘记密码" name="forgot">
          <el-form ref="forgotFormRef" :model="forgotForm" :rules="forgotRules" @submit.prevent="handleForgotPassword">
            <el-form-item prop="username">
              <el-input v-model="forgotForm.username" placeholder="用户名" />
            </el-form-item>
            <el-form-item prop="securityQuestion">
              <el-input v-model="forgotForm.securityQuestion" placeholder="密保问题" />
            </el-form-item>
            <el-form-item prop="securityAnswer">
              <el-input v-model="forgotForm.securityAnswer" placeholder="密保答案" />
            </el-form-item>
            <el-form-item prop="newPassword">
              <el-input v-model="forgotForm.newPassword" type="password" placeholder="新密码" show-password />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input v-model="forgotForm.confirmPassword" type="password" placeholder="确认新密码" show-password />
            </el-form-item>
            <el-button type="primary" native-type="submit" style="width: 100%">确认修改</el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { ElMessage, FormInstance, FormRules } from 'element-plus';

const activeTab = ref('login');
const router = useRouter();
const userStore = useUserStore();

// Form Refs
const loginFormRef = ref<FormInstance>();
const registerFormRef = ref<FormInstance>();
const forgotFormRef = ref<FormInstance>();

// Login Form
const loginForm = reactive({
  username: '',
  password: '',
});
const loginRules = reactive<FormRules>({
  username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { max: 10, message: '用户名长度不能超过10个字符', trigger: 'blur' },
  ],
  password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 15, message: '密码长度应为6-15个字符', trigger: 'blur' },
  ],
});

// Registration Form
const registerForm = reactive({
  username: '',
  password: '',
  securityQuestion: '',
  securityAnswer: '',
});
const registerRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { max: 10, message: '用户名长度不能超过10个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 15, message: '密码长度应为6-15个字符', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,15}$/,
      message: '密码必须包含英文和数字',
      trigger: 'blur',
    },
  ],
  securityQuestion: [{ required: true, message: '请输入密保问题', trigger: 'blur' }],
  securityAnswer: [{ required: true, message: '请输入密保答案', trigger: 'blur' }],
});

// Forgot Password Form
const forgotForm = reactive({
  username: '',
  securityQuestion: '',
  securityAnswer: '',
  newPassword: '',
  confirmPassword: '',
});

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== forgotForm.newPassword) {
    callback(new Error("两次输入的密码不一致!"));
  } else {
    callback();
  }
};

const forgotRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  securityQuestion: [{ required: true, message: '请输入密保问题', trigger: 'blur' }],
  securityAnswer: [{ required: true, message: '请输入密保答案', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 15, message: '密码长度应为6-15个字符', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,15}$/,
      message: '密码必须包含英文和数字',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
});


const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      const success = await userStore.login(loginForm);
      if (success) {
        router.push({ name: 'Dashboard' });
      }
    }
  });
};

const handleRegister = async () => {
  if (!registerFormRef.value) return;
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      const success = await userStore.register(registerForm);
      if (success) {
        activeTab.value = 'login'; // Switch to login tab after successful registration
        registerFormRef.value?.resetFields();
      }
    }
  });
};

const handleForgotPassword = async () => {
  if (!forgotFormRef.value) return;
  await forgotFormRef.value.validate(async (valid) => {
    if (valid) {
      const success = await userStore.forgotPassword(forgotForm);
      if (success) {
        activeTab.value = 'login'; // Switch to login tab after successful password reset
        forgotFormRef.value?.resetFields();
      }
    }
  });
};

</script>

<style lang="less" scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg-main);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.login-box {
  background-color: var(--bg-card);
  padding: 40px 50px;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-strong);
  text-align: center;
  width: 100%;
  max-width: 420px;

  h2 {
    color: var(--primary);
    margin-bottom: 20px;
  }
}

.login-tabs {
  .el-tab-pane {
    padding-top: 20px;
  }
  .el-form-item {
    margin-bottom: 25px;
  }
}
</style>
