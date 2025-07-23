<template>
  <div class="login-container">
    <div class="login-box">
      <h2>智能提醒系统 ✨</h2>
      <p>登录以继续</p>
      <el-form @submit.prevent="handleLogin" class="login-form">
        <el-form-item>
          <el-input v-model="username" placeholder="用户名" required />
        </el-form-item>
        <el-form-item>
           <el-input v-model="password" type="password" placeholder="密码 (任意)" required />
        </el-form-item>
        <el-button type="primary" native-type="submit" class="login-btn" style="width: 100%">登录</el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { ElMessage } from 'element-plus';

const username = ref('');
const password = ref(''); // While the original says any password, we'll keep the field
const router = useRouter();
const userStore = useUserStore();

const handleLogin = () => {
  if (username.value) {
    userStore.login(username.value);
    router.push({ name: 'Dashboard' });
  } else {
    ElMessage.error('请输入用户名');
  }
};
</script>

<style lang="less" scoped>
// Note: most styles for login are now global in main.less for simplicity
// to ensure they apply correctly.
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
    max-width: 400px;

    h2 {
        color: var(--primary);
        margin-bottom: 10px;
    }

    p {
        color: var(--text-light);
        margin-bottom: 30px;
    }
}

.login-form .el-form-item {
    margin-bottom: 25px;
}
</style> 