import { AI_CONFIG } from '@/config';

// 定义消息的类型接口
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// 定义AI服务类
class AiService {
  private apiKey: string;
  private apiEndpoint: string;

  constructor() {
    this.apiKey = AI_CONFIG.API_KEY;
    this.apiEndpoint = AI_CONFIG.API_ENDPOINT;

    if (!this.apiKey) {
      console.error("API key is missing. Please check your config.ts file.");
    }
  }

  /**
   * 以流式方式获取AI模型的回复
   * @param conversation 包含上下文的对话历史
   * @param onFinish 对话完成时调用的回调函数
   */
  async streamCompletion(
    conversation: Message[],
    tools: any[] | null,
    onChunk: (chunk: string | object) => void,
    onFinish: () => void
  ): Promise<void> {
    if (!this.apiKey) {
      return Promise.reject("API key is not configured.");
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          model: "Qwen/Qwen3-30B-A3B",
          messages: conversation,
          tools: tools,
          tool_choice: "auto",
          max_tokens: 1024, // Increased for potentially longer streaming responses
          temperature: 0.7,
          top_p: 0.7,
          stream: true, // 关键参数：开启流式响应
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`API request failed: ${errorBody.error?.message || response.statusText}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let buffer = '';
      let isFinished = false;

      const finishOnce = () => {
        if (!isFinished) {
          isFinished = true;
          onFinish();
        }
      };

      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep the last, possibly incomplete line
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.substring(6);
              if (jsonStr === '[DONE]') {
                finishOnce();
                return; // Exit the async function processing the stream.
              }
              try {
                const parsed = JSON.parse(jsonStr);
                const choice = parsed.choices?.[0];
                
                if (choice?.delta?.tool_calls) {
                  onChunk(choice.delta);
                } else {
                  const content = choice?.delta?.content;
                  if (content) {
                    onChunk(content);
                  }
                }

                if (choice?.finish_reason === 'stop' || choice?.finish_reason === 'tool_calls') {
                   finishOnce();
                }
              } catch (e) {
                console.error('Error parsing stream JSON:', e, jsonStr);
              }
            }
          }
        }
      };
      
      await processStream();
      finishOnce(); // Ensure finish is called if the stream ends without a [DONE] or finish_reason.

    } catch (error) {
      console.error("Error calling AI service:", error);
      onFinish(); // Ensure onFinish is called even on error
      throw error;
    }
  }
}

// 导出一个单例，方便在应用中各处使用
export const aiService = new AiService(); 