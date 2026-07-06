/**
 * DeepSeek API 的 mock 响应
 *
 * DeepSeek 返回标准 OpenAI-compatible chat completion 格式，
 * 其中 content 字段包含实际的 AIDecision JSON。
 */

export const MOCK_DEEPSEEK_RESPONSE = {
  id: 'mock-chatcmpl-001',
  object: 'chat.completion',
  created: 1700000000,
  model: 'deepseek-chat',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: JSON.stringify({
          variants: [
            {
              strategy: 'circle_wrap',
              params: {
                complexity: 0.3,
                curvature: 0.7,
                spacing: 0.4,
                weight: 0.5,
                asymmetry: 0.1,
                ornament: 0.2,
                density: 0.4,
                rotation: 0.1,
              },
              offset: {
                complexity: 0,
                spacing: 0,
                weight: 0,
                asymmetry: 0,
                ornament: 0,
                density: 0,
                rotation: 0,
              },
              colors: ['#1A1A2E', '#2A5CFF'],
            },
            {
              strategy: 'left_right_juxtapose',
              params: {
                complexity: 0.5,
                curvature: 0.3,
                spacing: 0.5,
                weight: 0.6,
                asymmetry: 0.2,
                ornament: 0.3,
                density: 0.5,
                rotation: 0.05,
              },
              offset: {
                complexity: 0.05,
                spacing: 0.05,
                weight: -0.05,
                asymmetry: 0.1,
                ornament: 0.05,
                density: 0.05,
                rotation: 0,
              },
              colors: ['#1A1A2E', '#E8E8E8', '#2A5CFF'],
            },
            {
              strategy: 'grid_dots',
              params: {
                complexity: 0.6,
                curvature: 0.5,
                spacing: 0.6,
                weight: 0.4,
                asymmetry: 0.3,
                ornament: 0.4,
                density: 0.6,
                rotation: 0.15,
              },
              offset: {
                complexity: 0.1,
                spacing: -0.1,
                weight: -0.05,
                asymmetry: 0.15,
                ornament: 0.1,
                density: 0.1,
                rotation: 0.05,
              },
              colors: ['#1A1A2E', '#2A5CFF', '#F5F5F5'],
            },
          ],
        }),
      },
      finish_reason: 'stop',
    },
  ],
  usage: {
    prompt_tokens: 500,
    completion_tokens: 400,
    total_tokens: 900,
  },
}

export const MOCK_DEEPSEEK_ERROR_RESPONSE = {
  error: {
    message: 'Rate limit exceeded',
    type: 'rate_limit_error',
    code: 429,
  },
}
