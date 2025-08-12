import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { getMemos, createMemo, updateMemo, deleteMemo, type Memo, type MemoRequest } from '@/utils/api';

interface MemoState {
  memos: Memo[];
  searchTerm: string;
}

export const useMemoStore = defineStore('memo', {
  state: (): MemoState => ({
    memos: [],
    searchTerm: '',
  }),
  getters: {
    filteredMemos(state): Memo[] {
      if (!state.searchTerm) {
        return state.memos;
      }
      return state.memos.filter(memo =>
        memo.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        memo.content.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        memo.tags.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }
  },
  actions: {
    async fetchMemos() {
        try {
            const response = await getMemos({ title: this.searchTerm });
            this.memos = response.data;
        } catch (error) {
            console.error('Failed to fetch memos:', error);
            ElMessage.error('获取备忘录失败');
        }
    },
    async saveMemo(memoData: Memo | MemoRequest) {
      const isUpdate = 'id' in memoData && memoData.id;
      try {
        if (isUpdate) {
            const { id, ...data } = memoData as Memo;
            const response = await updateMemo(id, data);
            const index = this.memos.findIndex(m => m.id === id);
            if (index !== -1) this.memos[index] = response.data;
        } else {
            const response = await createMemo(memoData);
            this.memos.unshift(response.data);
        }
        await this.fetchMemos();
        ElMessage.success(isUpdate ? '备忘录已更新！' : '备忘录已创建！');
      } catch (error) {
        console.error('Failed to save memo:', error);
        ElMessage.error('保存备忘录失败');
      }
    },
    async deleteMemo(id: number) {
      try {
        await deleteMemo(id);
        this.memos = this.memos.filter(m => m.id !== id);
        ElMessage.success('备忘录已删除！');
      } catch (error) {
        console.error('Failed to delete memo:', error);
        ElMessage.error('删除备忘录失败');
      }
    },
    setSearchTerm(term: string) {
      this.searchTerm = term;
      this.fetchMemos();
    }
  }
}); 