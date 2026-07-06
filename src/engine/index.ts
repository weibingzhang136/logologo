// ============================================================
// LogoDNA 渲染引擎 — 对外统一导出
// ============================================================
//
// 用法：
//   import { composeLogo } from './engine'
//   const result = composeLogo(request, aiDecision)
//   result.variants[0].svg  // 可直接展示/下载的 SVG 字符串
//
// AI 决策生成（服务端）：
//   import { buildPrompt } from '../ai/prompt-builder'
//   const prompt = buildPrompt(request)
//   // 调用 AI API → 得到 AI 决策 → 传给 composeLogo

export { composeLogo } from './composer'
export { renderToSVG } from './renderer'
export { resolveColors, enhanceForLogo, isValidHex, generatePalette } from './color'
export { getParamsForTone, getPreferredStrategies } from './tone-mapping'
export { STRATEGY_REGISTRY, getStrategyDescriptions } from './strategies/index'
export { validateOutput, validateSVGSyntax } from './validator'

export type {
  Primitive, Circle, Arc, Rect, Line, Polygon, Path, Text,
  StrategyParams, StrategyInput, StrategyOutput, StrategyFn,
  StrategyKey, BrandTone, LogoRequest, LogoVariant, LogoResponse,
  AIDecision, ToneMapEntry,
} from './types'

export { STRATEGY_KEYS, BRAND_TONES, DEFAULT_PARAMS } from './types'
