import { AI_CONFIG } from '@/config';
import { marked } from 'marked';
import { ElMessage } from 'element-plus';

// 定义消息的类型接口
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
export interface Tool {
    type: 'function';
    function: object;
}

// 定义AI服务类
class AiService {
  private apiKey: string | null = null;
  private organizationId: string | null = null;
  private abortController: AbortController | null = null;

  constructor() {
    this.apiKey = localStorage.getItem('openai_api_key');
    this.organizationId = localStorage.getItem('openai_organization_id');
  }

  public setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('openai_api_key', key);
  }

  public getApiKey(): string | null {
    return this.apiKey;
  }

  public setOrganizationId(id: string) {
    this.organizationId = id;
    localStorage.setItem('openai_organization_id', id);
  }

  public getOrganizationId(): string | null {
    return this.organizationId;
  }

  public stopStream() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * 以流式方式获取AI模型的回复
   * @param conversation 包含上下文的对话历史
   * @param onFinish 对话完成时调用的回调函数
   */
  async streamCompletion(
    messages: Message[],
    tools: Tool[],
    onChunk: (chunk: any) => void,
    onFinish: () => void
  ): Promise<void> {
    if (!this.apiKey) {
      ElMessage.error('请先在用户设置中输入您的 OpenAI API Key。');
      throw new Error('API key not set.');
    }

    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      };

      if (this.organizationId) {
        headers['OpenAI-Organization'] = this.organizationId;
      }

      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'Qwen/Qwen3-30B-A3B',
          messages,
          tools,
          tool_choice: 'auto',
          stream: true,
          max_tokens: 4096,
          temperature: 0.7,
          top_p: 0.9,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        ElMessage.error(`API 请求失败: ${errorData.error.message}`);
        throw new Error(`API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get stream reader.');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last, possibly incomplete line

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6);
            if (jsonStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices[0]?.delta;
              if (delta?.content) {
                onChunk(delta.content);
              } else if (delta?.tool_calls) {
                onChunk({ tool_calls: delta.tool_calls });
              }
            } catch (e) {
              console.error('Failed to parse stream chunk:', e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream reading aborted.');
      } else {
        console.error('An error occurred during stream processing:', error);
        ElMessage.error('与 AI 服务通信时发生错误。');
      }
    } finally {
      onFinish();
      this.abortController = null; // Reset controller
    }
  }
}

// 导出一个单例，方便在应用中各处使用
export const aiService = new AiService(); 