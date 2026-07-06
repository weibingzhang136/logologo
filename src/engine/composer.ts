// ============================================================
// 组合器 — 根据 AI 决策和品牌参数，编排完整的 LOGO 生成流程
// ============================================================

import type { StrategyInput, StrategyParams, LogoRequest, LogoVariant, LogoResponse } from './types'
import type { AIDecision } from './types'
import { STRATEGY_REGISTRY } from './strategies/index'
import { renderToSVG } from './renderer'
import { resolveColors, enhanceForLogo } from './color'
import { getParamsForTone } from './tone-mapping'
import { applyVariantOffsets } from './variant-generator'
import { validateOutput } from './validator'

/** 合并参数：基础参数上应用 AI 的调整 */
function mergeParams(base: Partial<StrategyParams>, override?: Partial<StrategyParams>): StrategyParams {
  const merged: StrategyParams = {
    complexity: 0.5,
    curvature: 0.5,
    spacing: 0.5,
    weight: 0.5,
    asymmetry: 0.3,
    ornament: 0.3,
    density: 0.4,
    rotation: 0.2,
  }

  // 先应用基础（来自调性映射）
  for (const k of Object.keys(merged) as (keyof StrategyParams)[]) {
    if (base[k] !== undefined) merged[k] = base[k]
  }

  // 再应用 AI 的调整
  if (override) {
    for (const k of Object.keys(merged) as (keyof StrategyParams)[]) {
      if (override[k] !== undefined) merged[k] = clamp(override[k])
    }
  }

  return merged
}

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v))
}

function hashSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * 执行一次 LOGO 生成
 * @param request  用户提交的品牌信息
 * @param decision AI 返回的 3 方案决策
 */
export function composeLogo(request: LogoRequest, decision: AIDecision): LogoResponse {
  // 解析颜色方案
  const baseColors = resolveColors(request.colorRequirement, request.customColors)
  const colors = enhanceForLogo(baseColors)

  // 获取调性的基础参数
  const toneEntry = getParamsForTone(request.tone)

  const variants: LogoVariant[] = decision.variants.map((v, i) => {
    const strategyFn = STRATEGY_REGISTRY[v.strategy]
    if (!strategyFn) {
      throw new Error(`未知策略: ${v.strategy}`)
    }

    // 合并参数（调性基础 + AI 调整 + 方案偏移）
    const baseParams = toneEntry.params
    const withAI = mergeParams(baseParams, v.params)
    const finalParams = applyVariantOffsets(withAI, v.offset ?? {}, i)

    // 种子（保证同一请求始终确定）
    const seed = hashSeed(`${request.brandNameCN}-${v.strategy}-${i}-${Date.now()}`)

    const input: StrategyInput = {
      brandNameCN: request.brandNameCN,
      brandNameEN: request.brandNameEN,
      params: finalParams,
      colors: v.colors.length > 0 ? v.colors : colors,
      seed,
    }

    const output = strategyFn(input)

    // 校验输出质量
    const validation = validateOutput(output.primitives)
    if (!validation.valid) {
      // 输出不合格时，使用降级方案（纯文字+简单装饰）
      return createFallbackVariant(request, colors, i)
    }

    const svg = renderToSVG(output.primitives)

    return {
      label: ['方案A', '方案B', '方案C'][i] as LogoVariant['label'],
      strategy: v.strategy,
      svg,
    }
  })

  return {
    variants,
    generatedAt: new Date().toISOString(),
  }
}

/** 降级方案：当生成的 LOGO 不合规时使用纯文字排版 */
function createFallbackVariant(request: LogoRequest, colors: string[], index: number): LogoVariant {
  const label = ['方案A', '方案B', '方案C'][index] as LogoVariant['label']
  const fontSize = 36
  const enSize = 14
  const svg = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">`,
    `  <rect width="500" height="500" fill="#ffffff" />`,
    `  <text x="250" y="240" font-size="${fontSize}" font-family="'Noto Sans SC','Noto Sans CJK SC',sans-serif" fill="${colors[0]}" font-weight="700" text-anchor="middle">${request.brandNameCN}</text>`,
    request.brandNameEN ? `  <text x="250" y="${240 + fontSize * 0.8}" font-size="${enSize}" font-family="'Inter','Helvetica Neue',Arial,sans-serif" fill="${colors.length > 1 ? colors[1] : colors[0]}" font-weight="300" text-anchor="middle" letter-spacing="0.1em">${request.brandNameEN}</text>` : '',
    `</svg>`,
  ].join('\n')

  return { label, strategy: 'golden_ratio', svg }
}
