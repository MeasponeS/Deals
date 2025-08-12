import { defineStore } from 'pinia';
import apiClient from '@/utils/api';
import { ElMessage } from 'element-plus';

export const useUserStore = defineStore('user', {
  state: () => ({
    username: sessionStorage.getItem('smartReminderUser') || null,
    token: sessionStorage.getItem('smartReminderToken'),
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    userInitial: (state) => (state.username ? state.username.charAt(0).toUpperCase() : ''),
  },
  actions: {
    async login(loginData: any) {
      try {
        const response = await apiClient.post('/auth/signin', loginData);
        
        if (response.data && response.data.token) {
          const token = response.data.token;
          if (!token) {
            throw new Error("Invalid token received from server.");
          }
          this.token = token;
          this.username = loginData.username;
          sessionStorage.setItem('smartReminderToken', this.token);
          sessionStorage.setItem('smartReminderUser', this.username as string);
          return true;
        } else {
          ElMessage.error(response.data.message || '登录失败，请检查您的凭据。');
          return false;
        }
      } catch (error: any) {
        // Handle network errors or other exceptions
        const message = error.response?.data?.message || '登录时发生网络错误，请稍后再试。';
        ElMessage.error(message);
        return false;
      }
    },
    logout() {
      this.username = null;
      this.token = null;
      sessionStorage.removeItem('smartReminderUser');
      sessionStorage.removeItem('smartReminderToken');
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    },
    async register(signupData: any) {
        try {
          await apiClient.post('/auth/signup', signupData);
          ElMessage.success('注册成功! 您现在可以登录了。');
          return true;
        } catch (error) {
          ElMessage.error('注册失败，请稍后再试。');
          return false;
        }
      },
  
      async forgotPassword(forgotPasswordData: any) {
        try {
          await apiClient.post('/auth/forgot-password', forgotPasswordData);
          ElMessage.success('密码找回请求成功！');
          return true;
        } catch (error) {
          ElMessage.error('密码找回失败，请检查您的信息。');
          return false;
        }
      },
  
      async changePassword(changePasswordData: any) {
        try {
          await apiClient.post('/auth/change-password', {
            ...changePasswordData,
            username: this.username,
          });
          ElMessage.success('密码修改成功！');
          return true;
        } catch (error) {
          ElMessage.error('密码修改失败，请重试。');
          return false;
        }
      },
  },
});
