import { useState } from 'react'
import DOMPurify from 'dompurify'
import type { LogoVariant } from '../engine/types'
import Lightbox from './Lightbox'

interface Props {
  variants: LogoVariant[] | null
  loading: boolean
  error: string | null
  brandName: string
  onRetry?: () => void
}

const STRATEGY_NAMES: Record<string, string> = {
  circle_wrap: '圆形环绕',
  golden_ratio: '黄金分割',
  diagonal_mirror: '对角镜像',
  concentric: '同心扩展',
  overlap_penetrate: '重叠穿透',
  grid_dots: '网格点阵',
  radial_burst: '放射爆发',
  initial_mark: '首字强调',
  embedded: '图文嵌入',
  top_bottom_split: '上下分割',
  left_right_juxtapose: '左右并置',
  letter_marquee: '文字灯排',
  vertical_stack: '垂直堆叠',
  outline_merge: '轮廓融合',
  negative_space: '负空间',
  rhythm_repeat: '节奏重复',
  deconstruct_offset: '解构错位',
  layer_depth: '分层纵深',
  geometric_animal: '几何动物',
  fold_origami: '折纸折叠',
}

function downloadSVG(svg: string, filename: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadAll(variants: LogoVariant[], brandName: string) {
  variants.forEach(v => {
    downloadSVG(v.svg, `Logologo_${brandName}_${v.label}.svg`)
  })
}

export default function LogoResult({ variants, loading, error, brandName, onRetry }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // ---- Loading ----
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="flex animate-pulse flex-col rounded-xl border border-gray-200 bg-white"
          >
            <div className="flex items-center justify-center p-4" style={{ minHeight: 240 }}>
              <div className="h-40 w-40 rounded-lg bg-gray-100" />
            </div>
            <div className="border-t border-gray-100 px-4 py-3">
              <div className="mb-2 h-4 w-20 rounded bg-gray-100" />
              <div className="h-8 w-full rounded-lg bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ---- Error ----
  if (error) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-red-200 bg-red-50/50 p-16">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mb-1 text-sm font-semibold text-red-800">生成失败</h3>
          <p className="mb-4 text-sm text-red-600">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重新生成
            </button>
          )}
        </div>
      </div>
    )
  }

  // ---- Empty ----
  if (!variants) {
    return (
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-16">
        <div className="text-center">
          <svg className="mx-auto mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-400">填写左侧表单，点击"生成 LOGO"</p>
          <p className="mt-1 text-xs text-gray-300">AI 将为您设计 3 个差异化的品牌 LOGO 方案</p>
        </div>
      </div>
    )
  }

  // ---- Results ----
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          已生成 <span className="font-semibold text-gray-700">{variants.length}</span> 个方案
        </p>
        <button
          onClick={() => downloadAll(variants, brandName)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          下载全部
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {variants.map((v, i) => (
          <div
            key={i}
            className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {/* SVG 预览 */}
            <button
              className="flex cursor-pointer items-center justify-center p-4 transition-colors hover:bg-gray-50"
              style={{ minHeight: 240 }}
              onClick={() => setLightboxIndex(i)}
              title="点击查看大图"
            >
              <div
                className="h-full w-full"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                }}
              >
                <div
                  className="mx-auto flex items-center justify-center"
                  style={{ maxWidth: 200, maxHeight: 200 }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(v.svg) }}
                />
              </div>
            </button>

            {/* 底部信息 */}
            <div className="border-t border-gray-100 px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">{v.label}</span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-500">
                  {STRATEGY_NAMES[v.strategy] || v.strategy}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setLightboxIndex(i)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50"
                >
                  预览
                </button>
                <button
                  onClick={() => downloadSVG(v.svg, `Logologo_${brandName}_${v.label}.svg`)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50"
                >
                  下载 SVG
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && variants[lightboxIndex] && (
        <Lightbox
          svg={variants[lightboxIndex].svg}
          label={variants[lightboxIndex].label}
          strategyName={STRATEGY_NAMES[variants[lightboxIndex].strategy] || variants[lightboxIndex].strategy}
          onClose={() => setLightboxIndex(null)}
          onDownload={() =>
            downloadSVG(variants[lightboxIndex].svg, `Logologo_${brandName}_${variants[lightboxIndex].label}.svg`)
          }
        />
      )}
    </>
  )
}
