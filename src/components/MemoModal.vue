<template>
  <el-dialog
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :title="isEditing ? '编辑灵感' : '捕捉灵感'"
    width="700px"
    @close="resetForm"
  >
    <el-form :model="form" label-position="top" @submit.prevent="handleSave">
      <el-form-item label="标题">
        <el-input v-model="form.title" placeholder="备忘标题..." />
      </el-form-item>
      <el-form-item label="内容">
        <el-input type="textarea" :rows="5" v-model="form.content" placeholder="在这里写下你的想法..." required />
      </el-form-item>
      <el-form-item label="标签">
        <el-input v-model="tagsInput" placeholder="标签, 用逗号分隔..." />
      </el-form-item>
      <!-- Attachment feature can be added later -->
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="isEditing" type="danger" @click="handleDelete">删 除</el-button>
        <div style="flex-grow: 1"></div>
        <el-button @click="$emit('update:modelValue', false)">取 消</el-button>
        <el-button type="primary" @click="handleSave">保 存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, reactive } from 'vue';
import type { PropType } from 'vue';
import type { Memo } from '@/db';
import { useMemoStore } from '@/store/memo';
import { ElMessageBox } from 'element-plus';

const props = defineProps({
  modelValue: Boolean, // for v-model
  memo: {
    type: Object as PropType<Memo | null>,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'saved']);

const memoStore = useMemoStore();

const getInitialForm = () => ({
  id: null as number | null | undefined,
  title: '',
  content: '',
});

const form = reactive(getInitialForm());
const tagsInput = ref('');

const isEditing = computed(() => !!form.id);

watch(() => props.memo, (newMemo) => {
  if (newMemo) {
    form.id = newMemo.id;
    form.title = newMemo.title;
    form.content = newMemo.content;
    tagsInput.value = (newMemo.tags || []).join(', ');
  } else {
    // resetForm();
  }
}, { immediate: true });


const handleSave = async () => {
    const memoData: Partial<Memo> = {
        title: form.title,
        content: form.content,
        tags: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean),
    };
    if (form.id) {
        memoData.id = form.id;
    }
    const success = await memoStore.saveMemo(memoData);
    if(success) {
        emit('saved');
    }
};

const handleDelete = async () => {
    if (!form.id) return;
    try {
        await ElMessageBox.confirm(
            '确定要删除这个备忘吗？',
            '确认删除',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );
        const success = await memoStore.deleteMemo(form.id);
        if (success) {
            emit('saved');
        }
    } catch {
        // User cancelled the action
    }
};

const resetForm = () => {
    Object.assign(form, getInitialForm());
    tagsInput.value = '';
}

</script>

<style lang="less" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}
</style> 