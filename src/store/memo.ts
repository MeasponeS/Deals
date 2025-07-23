import { defineStore } from 'pinia';
import { db, type Memo } from '@/db';
import { ElMessage } from 'element-plus';

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
      const lowerSearchTerm = state.searchTerm.toLowerCase();
      if (!lowerSearchTerm) {
        return state.memos;
      }
      return state.memos.filter(memo =>
        memo.title.toLowerCase().includes(lowerSearchTerm) ||
        memo.content.toLowerCase().includes(lowerSearchTerm) ||
        (memo.tags || []).some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
    },
  },

  actions: {
    async fetchMemos() {
      this.memos = await db.memos.orderBy('createdAt').reverse().toArray();
    },

    async saveMemo(memoData: Partial<Memo>) {
      if (!memoData.content?.trim() && !memoData.title?.trim()) {
        ElMessage.error('标题和内容至少填写一项');
        return null;
      }

      const dataToSave = {
        title: memoData.title || '无标题',
        content: memoData.content || '',
        tags: memoData.tags || [],
      };

      try {
        if (memoData.id) {
          // Update
          await db.memos.update(memoData.id, dataToSave);
          ElMessage.success('备忘已更新！');
        } else {
          // Create
          const newMemo = { ...dataToSave, createdAt: new Date().toISOString() };
          await db.memos.add(newMemo);
          ElMessage.success('备忘已保存！');
        }
        await this.fetchMemos();
        return true;
      } catch (error) {
        console.error("Failed to save memo:", error);
        ElMessage.error('保存失败');
        return null;
      }
    },

    async deleteMemo(id: number) {
       try {
            await db.transaction('rw', db.memos, db.attachments, async () => {
                await db.attachments.where({ parentId: id, parentType: 'memo' }).delete();
                await db.memos.delete(id);
            });
            await this.fetchMemos();
            ElMessage.success('备忘已删除。');
            return true;
        } catch (error) {
            console.error("Failed to delete memo:", error);
            ElMessage.error('删除失败');
            return null;
        }
    },

    setSearchTerm(term: string) {
      this.searchTerm = term;
    },
  },
}); 