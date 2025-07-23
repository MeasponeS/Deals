import { defineStore } from 'pinia'

const THEME_KEY = 'smartReminderTheme'

export const themeList = [
  { name: 'theme-cupcake', label: '🧁 杯子蛋糕' },
  { name: 'theme-forest', label: '🌳 森林耳语' },
  { name: 'theme-ocean', label: '🌊 海洋之心' },
  { name: 'theme-candy', label: '🍬 糖果乐园' },
  { name: 'theme-dark', label: '🌙 暗夜模式' },
]

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: localStorage.getItem(THEME_KEY) || 'theme-cupcake',
  }),
  actions: {
    setTheme(themeName: string) {
      this.currentTheme = themeName
      localStorage.setItem(THEME_KEY, themeName)
      
      // 不再需要手动操作DOM，Vue的响应式系统会处理
      // document.body.className = themeName
      // const appContainer = document.getElementById('app-container');
      // if (appContainer) {
      //   appContainer.className = `${themeName} app-container`
      // } 
      
      // 暗色模式的逻辑也需要调整，直接在App.vue或通过body的class处理
      if (themeName.includes('dark')) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    initTheme() {
      this.setTheme(this.currentTheme)
    }
  }
}) 