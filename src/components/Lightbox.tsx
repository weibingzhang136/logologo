import { useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'

interface Props {
  svg: string
  label: string
  strategyName: string
  onClose: () => void
  onDownload: () => void
}

export default function Lightbox({ svg, label, strategyName, onClose, onDownload }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="relative mx-4 max-h-[90vh] max-w-3xl flex-1 rounded-2xl bg-white p-6 shadow-2xl">
        {/* 头部 */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-gray-800">{label}</span>
            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-500">
              {strategyName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white transition-colors hover:bg-gray-700"
            >
              下载 SVG
            </button>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* SVG 展示 */}
        <div
          className="flex items-center justify-center overflow-auto rounded-xl bg-gray-50 p-4"
          style={{ maxHeight: 'calc(90vh - 120px)' }}
        >
          <div
            className="h-full w-full"
            style={{
              maxWidth: 500,
              backgroundImage:
                'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(svg) }}
          />
        </div>
      </div>
    </div>
  )
}
