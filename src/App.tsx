import { useState, useCallback, useRef } from 'react'
import type { LogoRequest, LogoVariant } from './engine/types'
import { toUserFriendlyMessage } from './lib/error-utils'
import LogoForm from './components/LogoForm'
import LogoResult from './components/LogoResult'

type ProgressStep = 'idle' | 'analyzing' | 'designing' | 'rendering'

const PROGRESS_MESSAGES: Record<ProgressStep, string> = {
  idle: '',
  analyzing: '正在分析品牌信息...',
  designing: 'AI 正在构思 3 个设计方案...',
  rendering: '正在渲染 LOGO 图形...',
}

export default function App() {
  const [variants, setVariants] = useState<LogoVariant[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRequest, setLastRequest] = useState<LogoRequest | null>(null)
  const [progress, setProgress] = useState<ProgressStep>('idle')
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startProgress = useCallback(() => {
    setProgress('analyzing')
    progressTimer.current = setTimeout(() => setProgress('designing'), 1000)
  }, [])

  const stopProgress = useCallback(() => {
    if (progressTimer.current) {
      clearTimeout(progressTimer.current)
      progressTimer.current = null
    }
    setProgress('idle')
  }, [])

  const handleGenerate = useCallback(async (request: LogoRequest) => {
    setLoading(true)
    setError(null)
    setLastRequest(request)
    setVariants(null)
    startProgress()

    try {
      // 阶段 1 & 2: AI API 调用
      const [{ composeLogo }, { generateAIDecision }] = await Promise.all([
        import('./engine/composer'),
        import('./ai/api'),
      ])

      setProgress('rendering')
      const decision = await generateAIDecision(request)

      // 阶段 3: 渲染
      const response = composeLogo(request, decision)
      setVariants(response.variants)
    } catch (err) {
      setError(toUserFriendlyMessage(err))
    } finally {
      setLoading(false)
      stopProgress()
    }
  }, [startProgress, stopProgress])

  const handleRetry = useCallback(() => {
    if (lastRequest) {
      handleGenerate(lastRequest)
    }
  }, [lastRequest, handleGenerate])

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A1A2E] text-xs font-bold text-white">
              L
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-gray-900">Logologo</h1>
              <p className="text-[11px] text-gray-400">标逻 · AI Logo 生成</p>
            </div>
          </div>
          {loading && progress !== 'idle' && (
            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2A5CFF]" />
              <span className="text-xs text-gray-400">{PROGRESS_MESSAGES[progress]}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* 左侧表单 */}
          <section>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-sm font-semibold text-gray-800">品牌信息</h2>
              <LogoForm onGenerate={handleGenerate} loading={loading} />
            </div>
          </section>

          {/* 右侧结果 */}
          <section>
            <h2 className="mb-4 text-sm font-semibold text-gray-800">生成结果</h2>
            <LogoResult
              variants={variants}
              loading={loading}
              error={error}
              brandName={lastRequest?.brandNameCN || 'Logologo'}
              onRetry={error ? handleRetry : undefined}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 text-center text-xs text-gray-400">
          Logologo — 用 AI 驱动品牌视觉设计
        </div>
      </footer>
    </div>
  )
}
