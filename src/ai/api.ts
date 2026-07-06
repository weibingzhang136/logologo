// ============================================================
// DeepSeek API 客户端
// 通过 Vite 代理转发请求，API Key 不暴露到浏览器
// 生产环境需要配套的 server-side proxy
// ============================================================

import type { LogoRequest, AIDecision } from '../engine/types'
import { buildPrompt } from './prompt-builder'
import { parseAIResponse } from './response-parser'

interface DeepSeekChoice {
  index: number
  message: {
    role: string
    content: string
  }
  finish_reason: string
}

interface DeepSeekResponse {
  id: string
  choices: DeepSeekChoice[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

const DEEPSEEK_MODEL = 'deepseek-chat'
const TIMEOUT_MS = 30_000
const MAX_RETRIES = 2

class AIAPIError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly retryable: boolean = false,
  ) {
    super(message)
    this.name = 'AIAPIError'
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    return response
  } finally {
    clearTimeout(timer)
  }
}

/** 调用 DeepSeek API 获取 3 个 LOGO 方案的设计决策 */
export async function generateAIDecision(request: LogoRequest): Promise<AIDecision> {
  const prompt = buildPrompt(request)

  const systemPrompt = [
    '你是一个专业的 LOGO 设计专家。你的任务是根据品牌信息，设计 3 个差异化的 LOGO 方案。',
    '你只输出结构化的 JSON 设计决策参数（不生成 SVG 代码），由渲染引擎转换成 SVG。',
    '务必确保 3 个方案使用不同的构图策略，且参数有明显差异。',
    '严格按照要求的 JSON Schema 输出，只输出纯 JSON，不要包含任何其他文字。',
  ].join('\n')

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(
        '/api/deepseek/v1/chat/completions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: DEEPSEEK_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
            max_tokens: 4096,
          }),
        },
        TIMEOUT_MS,
      )

      if (!response.ok) {
        const errorText = await response.text().catch(() => '未知错误')
        const retryable = response.status >= 500 || response.status === 429
        throw new AIAPIError(errorText, response.status, retryable)
      }

      let data: DeepSeekResponse
      try {
        data = await response.json()
      } catch {
        throw new AIAPIError('AI 返回数据格式异常', undefined, true)
      }

      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new AIAPIError('AI 返回内容为空', undefined, true)
      }

      return parseAIResponse(content)
    } catch (err) {
      if (err instanceof AIAPIError) {
        lastError = err
        if (!err.retryable || attempt >= MAX_RETRIES) throw err
        // 退避：1s, 2s
        await new Promise(r => setTimeout(r, (attempt + 1) * 1000))
        continue
      }

      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new AIAPIError('请求超时', undefined, false)
      }

      throw err
    }
  }

  throw lastError ?? new Error('AI API 调用失败')
}
