<template>
    <div class="dashboard-card ai-assistant">
        <div class="card-header">
            <h3><span class="icon">🤖</span>智能助手</h3>
            <el-button id="ai-new-chat-btn" @click="newChat" circle>
                <el-icon><Refresh /></el-icon>
            </el-button>
        </div>
        <div ref="chatWindow" class="chat-window">
            <template v-for="(msg, index) in conversation" :key="index">
                <div v-if="msg.role === 'user' || msg.role === 'assistant'" :class="`${msg.role}-message`">
                    <div class="message-content">
                        <!-- User Message: Render as plain text for security -->
                        <template v-if="msg.role === 'user'">{{ msg.content }}</template>
                        <!-- Assistant Message -->
                        <template v-else>
                            <!-- Show typing indicator if AI message content is empty -->
                            <div v-if="!msg.content && isLoading" class="is-typing">
                                <span></span><span></span><span></span>
                            </div>
                            <!-- Render markdown content when it exists -->
                            <div v-else v-html="marked(msg.content)"></div>
                        </template>
                    </div>
                </div>
            </template>
        </div>
        <div class="chat-input-form">
            <el-input
                v-model="userInput"
                placeholder="尝试说：提醒我明天下午三点开会"
                type="textarea"
                :rows="1"
                autosize
                resize="none"
                @keydown.enter.prevent="handleSend"
                :disabled="isLoading"
            />
            <el-button 
              @click="isLoading ? handleStop() : handleSend()" 
              circle 
              type="primary"
              class="send-stop-btn"
            >
                <el-icon :size="20">
                  <VideoPause v-if="isLoading" />
                  <Promotion v-else />
                </el-icon>
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Promotion, Refresh, VideoPause } from '@element-plus/icons-vue';
import { marked } from 'marked';
import { useTodoStore } from '@/store/todo';
import { aiService, type Message } from '@/utils/aiService';

// --- Interfaces and Type Guards for Tool Calling ---
interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}
interface ToolCallDelta {
  index?: number;
  id?: string;
  type?: 'function';
  function: {
    name?: string;
    arguments?: string;
  };
}
function isToolCallDelta(chunk: any): chunk is { tool_calls: ToolCallDelta[] } {
  return chunk && Array.isArray(chunk.tool_calls);
}

// --- Component State ---
const tools = [
  {
    type: 'function',
    function: {
      name: 'create_todo',
      description: '在用户的待办事项列表中创建一个新的待办事项。',
      parameters: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: '待办事项的具体内容，例如：晚上8点和朋友一起跑步。',
          },
          dueDate: {
            type: 'string',
            description: '待办事项的截止日期和时间，应为ISO 8601格式。例如：2024-07-27T20:00:00',
          },
          priority: {
            type: 'string',
            enum: ['normal', 'important', 'urgent'],
            description: '任务的优先级。默认为 "normal"。',
          },
        },
        required: ['text'],
      },
    },
  },
];
const todoStore = useTodoStore();
const userInput = ref('');
const chatWindow = ref<HTMLDivElement | null>(null);
const isLoading = ref(false);
const activeToolCalls = ref<ToolCall[]>([]); // Buffer for in-progress tool calls

const conversation = ref<Message[]>([
  { role: 'assistant', content: '你好呀！有什么可以帮你的吗？' }
]);

// --- Core Functions ---
const scrollToBottom = () => {
  nextTick(() => {
    if (chatWindow.value) {
      chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
    }
  });
};

const handleSend = async () => {
  const text = userInput.value.trim();
  if (!text || isLoading.value) return;

  // 1. 保存用户输入并清空输入框
  const userMessageContent = text;
  userInput.value = '';
  
  // 2. 将用户消息添加到对话历史中，并滚动到底部
  conversation.value.push({ role: 'user', content: userMessageContent });
  scrollToBottom();

  // 3. 准备API请求
  isLoading.value = true;
  activeToolCalls.value = [];
  const messagesForApi: Message[] = [
    {
      role: 'system',
      content: `You are a helpful assistant. The current date is ${new Date().toISOString()}. Please use the 'create_todo' tool if the user wants to create a reminder or todo item. Only use the tool, do not provide any other text in your response if you are calling a tool.`
    },
    ...conversation.value // 发送完整的对话历史
  ];

  // 4. 为助手响应创建一个临时的、非响应式的消息对象
  let assistantResponse = '';
  
  // 5. 显示“正在输入”动画
  conversation.value.push({ role: 'assistant', content: '' });
  const assistantMessage = conversation.value[conversation.value.length - 1];
  scrollToBottom();

  try {
    await aiService.streamCompletion(
      messagesForApi,
      tools,
      (chunk) => { // onChunk
        if (typeof chunk === 'string') {
          if (activeToolCalls.value.length === 0) {
            assistantResponse += chunk;
            assistantMessage.content = assistantResponse; // 实时更新UI
          }
        } else if (isToolCallDelta(chunk)) {
          for (const toolDelta of chunk.tool_calls) {
            const index = toolDelta.index ?? 0;
            if (!activeToolCalls.value[index]) {
              activeToolCalls.value[index] = { id: '', type: 'function', function: { name: '', arguments: '' } };
            }
            if (toolDelta.id) activeToolCalls.value[index].id = toolDelta.id;
            if (toolDelta.function.name) activeToolCalls.value[index].function.name += toolDelta.function.name;
            if (toolDelta.function.arguments) activeToolCalls.value[index].function.arguments += toolDelta.function.arguments;
          }
        }
        scrollToBottom();
      },
      () => { // onFinish
        if (activeToolCalls.value.length > 0) {
          const toolToExecute = activeToolCalls.value[0];
          if (toolToExecute.function.name === 'create_todo') {
            try {
              const args = JSON.parse(toolToExecute.function.arguments);
              todoStore.addTodo({
                text: args.text,
                dueDate: args.dueDate || null,
                priority: args.priority || 'normal',
                reminder: 'none',
              });
              assistantResponse = `好的，我已经将待办事项 "${args.text}" 添加到你的列表中了。`;
            } catch (e) {
              console.error("Failed to parse arguments or create todo", e);
              assistantResponse = `抱歉，创建待办时遇到了点麻烦。`;
            }
          }
           // 最终更新助手的消息
          assistantMessage.content = assistantResponse;
        }
        isLoading.value = false;
        scrollToBottom();
      }
    );
  } catch (error) {
    ElMessage.error('糟糕，AI助手开小差了，请稍后再试。');
     // 如果出错，移除等待中的助手消息
    conversation.value.pop();
    isLoading.value = false;
  }
};

const handleStop = () => {
  aiService.stopStream();
  isLoading.value = false;
  ElMessage.info('AI助手已停止。');
};

const newChat = () => {
    conversation.value = [{ role: 'assistant', content: '你好呀！有什么可以帮你的吗？' }];
    isLoading.value = false;
    scrollToBottom();
};

onMounted(() => {
  scrollToBottom();
});
</script>

<style lang="less" scoped>
// Scoped styles from the original style.css for AI Assistant
.dashboard-card {
    background-color: var(--bg-card);
    border-radius: @border-radius-lg;
    box-shadow: @shadow-main;
    padding: 25px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
#ai-section {
    height: 55%;
    min-height: 380px;
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
.chat-window {
    flex-grow: 1;
    overflow-y: auto;
    margin-bottom: 10px;
    padding: 10px;
}

.ai-message, .user-message {
  display: flex;
  margin: 20px 0;
  max-width: 85%;
}

.user-message {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-content {
  padding: 12px 18px;
  border-radius: 18px;
  line-height: 1.6;
  white-space: pre-wrap;
  position: relative;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 85%;
  background: var(--el-fill-color-light);
  border-radius: 18px 18px 18px 4px;
}

.ai-message .message-content {
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  border-radius: 18px 18px 18px 4px;
}

.user-message .message-content {
  background-color: var(--el-color-primary);
  color: white;
  border-radius: 18px 18px 4px 18px;
}

/* Typing indicator */
.is-typing span {
  height: 8px;
  width: 8px;
  background-color: #9E9EA1;
  border-radius: 50%;
  display: inline-block;
  animation: a_b 1.4s infinite ease-in-out both;
  margin: 0 2px;
}
.is-typing span:nth-child(1) { animation-delay: -0.32s; }
.is-typing span:nth-child(2) { animation-delay: -0.16s; }
@keyframes a_b {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}

:deep(pre) {
    white-space: pre-wrap;
}
.chat-input-form {
    flex-shrink: 0;
    display: flex;
    gap: 8px;
    align-items: flex-end;
}
.send-stop-btn {
  transition: all 0.2s ease-in-out;
}
// Deep styles for rendered markdown content
:deep(.message-content) {
  p {
    // margin: 0 0 1rem 0;
    margin: 0;
  }
  p:last-child {
    margin-bottom: 0;
  }
  pre {
    background-color: #282c34; // Dark background for code blocks
    color: #abb2bf;
    padding: 1em;
    border-radius: 8px;
    margin: 1em 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  code {
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
  }
  ul, ol {
    padding-left: 20px;
  }
  blockquote {
    border-left: 4px solid var(--el-border-color);
    padding-left: 1em;
    margin-left: 0;
    color: var(--el-text-color-secondary);
  }
}
</style> 