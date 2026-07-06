/** 将 AI API 错误映射为用户友好的中文消息 */
export function toUserFriendlyMessage(error: unknown): string {
  if (error instanceof Error && 'status' in error) {
    const apiErr = error as Error & { status?: number }
    if (apiErr.status === 429) return 'AI 服务忙，请稍后重试'
    if (apiErr.status && apiErr.status >= 500) return 'AI 服务暂时不可用，请稍后重试'
    if (apiErr.status === 401) return 'API Key 无效，请在 .env 中检查 DEEPSEEK_API_KEY'
    if (apiErr.status === 400) return '请求参数有误，请重试'
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return '请求超时，请检查网络后重试'
  }

  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return '网络连接失败，请检查网络后重试'
  }

  return error instanceof Error ? error.message : '生成失败，请稍后重试'
}
