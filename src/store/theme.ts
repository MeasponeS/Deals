import { defineStore } from 'pinia';

interface ThemeColorPalette {
  [key: string]: string;
}

interface Theme {
  id: string;
  name: string;
  class: string;
  icon: string;
  colors: ThemeColorPalette;
}

const commonLightColors = {
  '--el-color-success': '#67c23a',
  '--el-color-warning': '#e6a23c',
  '--el-color-danger': '#f56c6c',
  '--el-color-error': '#f56c6c',
  '--el-color-info': '#909399',
  '--el-color-white': '#ffffff',
  '--el-color-black': '#000000',
  '--el-button-text-color': '#ffffff',
  '--el-button-hover-text-color': '#ffffff',
};

// 定义可用的主题
export const availableThemes: Theme[] = [
  {
    id: 'cupcake',
    name: '奶油蛋糕',
    class: 'theme-cupcake',
    icon: '🍰',
    colors: {
      ...commonLightColors,
      '--el-color-primary': '#ea7a9a',
      '--el-color-primary-light-3': '#f1a1b9',
      '--el-color-primary-light-5': '#f5c0ce',
      '--el-color-primary-light-7': '#f9d9e2',
      '--el-color-primary-light-8': '#fbe9f0',
      '--el-color-primary-light-9': '#fdf2f7',
      '--el-color-primary-dark-2': '#bb627b',
      '--el-button-bg-color': '#ea7a9a',
      '--el-button-border-color': '#ea7a9a',
      '--el-button-hover-bg-color': '#f1a1b9',
      '--el-button-hover-border-color': '#f1a1b9',
      '--el-button-active-bg-color': '#bb627b',
      '--el-button-active-border-color': '#bb627b',
      '--el-bg-color': '#ffffff',
      '--el-bg-color-page': '#fdf6f7',
      '--el-bg-color-overlay': '#ffffff',
      '--el-text-color-primary': '#4a4a4a',
      '--el-text-color-regular': '#4a4a4a',
      '--el-text-color-secondary': '#9b9b9b',
      '--el-text-color-placeholder': '#9b9b9b',
      '--el-border-color': 'rgba(0, 0, 0, 0.08)',
      '--el-fill-color-blank': '#fdf6f7',
      '--accent': '#b3dee5',
      '--el-fill-color-light': '#fceaf0',
    },
  },
  {
    id: 'ocean',
    name: '蔚蓝海洋',
    class: 'theme-ocean',
    icon: '🌊',
    colors: {
      ...commonLightColors,
      '--el-color-primary': '#4a90e2',
      '--el-color-primary-light-3': '#80b3eb',
      '--el-color-primary-light-5': '#a5c9f1',
      '--el-color-primary-light-7': '#c9dff7',
      '--el-color-primary-light-8': '#dce9fa',
      '--el-color-primary-light-9': '#eef4fd',
      '--el-color-primary-dark-2': '#3b73b5',
      '--el-button-bg-color': '#4a90e2',
      '--el-button-border-color': '#4a90e2',
      '--el-button-hover-bg-color': '#80b3eb',
      '--el-button-hover-border-color': '#80b3eb',
      '--el-button-active-bg-color': '#3b73b5',
      '--el-button-active-border-color': '#3b73b5',
      '--el-bg-color': '#ffffff',
      '--el-bg-color-page': '#f0f7fa',
      '--el-bg-color-overlay': '#ffffff',
      '--el-text-color-primary': '#3b4d5a',
      '--el-text-color-regular': '#3b4d5a',
      '--el-text-color-secondary': '#8c9ba5',
      '--el-text-color-placeholder': '#8c9ba5',
      '--el-border-color': 'rgba(0, 0, 0, 0.08)',
      '--el-fill-color-blank': '#f0f7fa',
      '--accent': '#f5a623',
      '--el-fill-color-light': '#e4f0fc',
    }
  },
  {
    id: 'forest',
    name: '幽静森林',
    class: 'theme-forest',
    icon: '🌲',
    colors: {
        ...commonLightColors,
        '--el-color-primary': '#5a8a72',
        '--el-color-primary-light-3': '#8eaea1',
        '--el-color-primary-light-5': '#adc4b9',
        '--el-color-primary-light-7': '#cdd9d2',
        '--el-color-primary-light-8': '#dde4e0',
        '--el-color-primary-light-9': '#eef2f0',
        '--el-color-primary-dark-2': '#486e5b',
        '--el-button-bg-color': '#5a8a72',
        '--el-button-border-color': '#5a8a72',
        '--el-button-hover-bg-color': '#8eaea1',
        '--el-button-hover-border-color': '#8eaea1',
        '--el-button-active-bg-color': '#486e5b',
        '--el-button-active-border-color': '#486e5b',
        '--el-bg-color': '#ffffff',
        '--el-bg-color-page': '#f3f6f4',
        '--el-bg-color-overlay': '#ffffff',
        '--el-text-color-primary': '#3d453f',
        '--el-text-color-regular': '#3d453f',
        '--el-text-color-secondary': '#8a918c',
        '--el-text-color-placeholder': '#8a918c',
        '--el-border-color': 'rgba(0, 0, 0, 0.08)',
        '--el-fill-color-blank': '#f3f6f4',
        '--accent': '#e6c5a6',
        '--el-fill-color-light': '#e7efeb',
    }
  },
  {
    id: 'candy',
    name: '缤纷糖果',
    class: 'theme-candy',
    icon: '🍭',
    colors: {
        ...commonLightColors,
        '--el-color-primary': '#ff85a1',
        '--el-color-primary-light-3': '#ffa9bc',
        '--el-color-primary-light-5': '#ffc4d1',
        '--el-color-primary-light-7': '#ffdce5',
        '--el-color-primary-light-8': '#ffe9f0',
        '--el-color-primary-light-9': '#fff2f7',
        '--el-color-primary-dark-2': '#cc6a81',
        '--el-button-bg-color': '#ff85a1',
        '--el-button-border-color': '#ff85a1',
        '--el-button-hover-bg-color': '#ffa9bc',
        '--el-button-hover-border-color': '#ffa9bc',
        '--el-button-active-bg-color': '#cc6a81',
        '--el-button-active-border-color': '#cc6a81',
        '--el-bg-color': '#ffffff',
        '--el-bg-color-page': '#fdf5f9',
        '--el-bg-color-overlay': '#ffffff',
        '--el-text-color-primary': '#5c4751',
        '--el-text-color-regular': '#5c4751',
        '--el-text-color-secondary': '#a39098',
        '--el-text-color-placeholder': '#a39098',
        '--el-border-color': 'rgba(0, 0, 0, 0.08)',
        '--el-fill-color-blank': '#fdf5f9',
        '--accent': '#ffc2e2',
        '--el-fill-color-light': '#ffe8ed',
    }
  },
  {
    id: 'dark',
    name: '暗夜模式',
    class: 'theme-dark',
    icon: '🌙',
    colors: {
      '--el-color-success': '#98c379',
      '--el-color-warning': '#d19a66',
      '--el-color-danger': '#e06c75',
      '--el-color-error': '#e06c75',
      '--el-color-info': '#56b6c2',
      '--el-color-white': '#ffffff',
      '--el-color-black': '#000000',
      '--el-button-text-color': '#ffffff',
      '--el-button-hover-text-color': '#ffffff',
      '--el-color-primary': '#61afef',
      '--el-color-primary-light-3': '#447ab2',
      '--el-color-primary-light-5': '#315878',
      '--el-color-primary-light-7': '#1d3348',
      '--el-color-primary-light-8': '#13222e',
      '--el-color-primary-light-9': '#091117',
      '--el-color-primary-dark-2': '#7dc0f2',
      '--el-button-bg-color': '#61afef',
      '--el-button-border-color': '#61afef',
      '--el-button-hover-bg-color': '#447ab2',
      '--el-button-hover-border-color': '#447ab2',
      '--el-button-active-bg-color': '#7dc0f2',
      '--el-button-active-border-color': '#7dc0f2',
      '--el-bg-color': '#282c34',
      '--el-bg-color-page': '#1f2229',
      '--el-bg-color-overlay': '#282c34',
      '--el-text-color-primary': '#abb2bf',
      '--el-text-color-regular': '#abb2bf',
      '--el-text-color-secondary': '#848b98',
      '--el-text-color-placeholder': '#848b98',
      '--el-border-color': 'rgba(255, 255, 255, 0.1)',
      '--el-fill-color-blank': '#1f2229',
      '--accent': '#c678dd',
      '--el-fill-color-light': '#384e6c',
    }
  }
];

interface ThemeState {
  currentTheme: string;
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    currentTheme: availableThemes[0].class, // 默认主题
  }),

  actions: {
    // 设置新主题
    setTheme(themeId: string) {
      const theme = availableThemes.find(t => t.id === themeId);
      if (theme) {
        this.currentTheme = theme.class;
        localStorage.setItem('app-theme', theme.id);
      } else {
        console.warn(`Theme with id "${themeId}" not found.`);
      }
    },

    // 从 localStorage 初始化主题
    initTheme() {
      const savedThemeId = localStorage.getItem('app-theme');
      const theme = availableThemes.find(t => t.id === savedThemeId);
      if (theme) {
        this.setTheme(theme.id);
      } else {
        this.setTheme(availableThemes[0].id);
      }
    },
  },
}); 