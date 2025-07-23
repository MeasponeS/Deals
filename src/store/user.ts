import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    username: sessionStorage.getItem('smartReminderUser') || null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.username,
    userInitial: (state) => state.username ? state.username.charAt(0).toUpperCase() : '',
  },
  actions: {
    login(username: string) {
      this.username = username
      sessionStorage.setItem('smartReminderUser', username)
    },
    logout() {
      this.username = null
      sessionStorage.removeItem('smartReminderUser')
    },
  },
}) 