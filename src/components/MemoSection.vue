<template>
  <div class="dashboard-card memo-section">
    <div class="card-header">
      <h3><span class="icon">💡</span>灵感胶囊</h3>
      <div class="header-actions">
        <el-input
          :model-value="memoStore.searchTerm"
          @update:model-value="memoStore.setSearchTerm($event)"
          placeholder="搜索备忘..."
          class="card-search-input"
          clearable
        />
      </div>
    </div>

    <div class="memo-list">
      <div v-if="memoStore.filteredMemos.length > 0" class="memo-grid">
         <div v-for="memo in memoStore.filteredMemos" :key="memo.id" class="memo-card" @click="openMemoModal(memo)">
            <h3>{{ memo.title }}</h3>
            <p>{{ memo.content.substring(0, 100) }}{{ memo.content.length > 100 ? '...' : '' }}</p>
            <div class="memo-tags">
                <el-tag v-for="tag in memo.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
            </div>
        </div>
      </div>
      <el-empty v-else description="这里空空如也~ 快来捕捉一闪而过的灵感吧！" />
    </div>

    <el-button class="fab" type="primary" circle @click="openMemoModal(null)">
      <el-icon :size="24"><Plus /></el-icon>
    </el-button>

    <MemoModal v-model="isModalVisible" :memo="selectedMemo" @saved="isModalVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMemoStore } from '@/store/memo';
import type { Memo } from '@/db';
import MemoModal from './MemoModal.vue';
import { Plus } from '@element-plus/icons-vue';

const memoStore = useMemoStore();

const isModalVisible = ref(false);
const selectedMemo = ref<Memo | null>(null);

const openMemoModal = (memo: Memo | null) => {
  selectedMemo.value = memo;
  isModalVisible.value = true;
};

onMounted(() => {
  memoStore.fetchMemos();
});
</script>

<style lang="less" scoped>
.dashboard-card {
    background-color: var(--bg-card);
    border-radius: @border-radius-lg;
    box-shadow: @shadow-main;
    padding: 25px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
}
.memo-section {
  flex-grow: 2;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
   h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.4em;
    font-weight: bold;
  }
}
.memo-list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 5px;
  margin: -5px;
}
.memo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
    align-content: start;
}

.memo-card {
    background-color: color-mix(in srgb, var(--accent) 15%, transparent);
    border-radius: @border-radius-md;
    padding: 20px;
    cursor: pointer;
    transition: all @transition-fast;
    border: 1px solid var(--el-border-color-lighter);
    display: flex;
    flex-direction: column;
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: @shadow-light;
        border-color: var(--el-color-primary);
    }

    h3 {
        font-size: 1.1em;
        margin: 0 0 12px 0;
        color: var(--el-text-color-primary);
        font-weight: 600;
    }

    p {
        font-size: 0.95em;
        color: var(--el-text-color-regular);
        margin: 0 0 15px 0;
        flex-grow: 1;
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-all;
    }

    .memo-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
}
.fab {
    position: absolute;
    bottom: 25px;
    right: 25px;
    width: 56px;
    height: 56px;
    box-shadow: @shadow-strong;
    transition: all @transition-fast;

    &:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: @shadow-main;
    }
     &:active {
        transform: translateY(-1px) scale(1);
    }
}
</style> 