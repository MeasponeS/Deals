import { defineStore } from 'pinia';

interface UiState {
  taskInputPreset: string;
}

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    taskInputPreset: '',
  }),

  actions: {
    setTaskInput(text: string) {
      this.taskInputPreset = text;
    },
    clearTaskInput() {
        this.taskInputPreset = '';
    }
  },
}); 