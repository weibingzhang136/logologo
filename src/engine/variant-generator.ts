// ============================================================
// 方案差异化生成器
// 同一参数基础上，为 3 个方案生成差异化偏移，避免雷同
// ============================================================

import type { StrategyParams } from './types'

/** 3 套预设的差异化偏移方向（硬编码保证相同输入产生一致输出） */
export const VARIANT_OFFSETS: Partial<StrategyParams>[] = [
  // 方案A — 默认原型（无偏移）
  {},
  // 方案B — 更轻、更宽松、更多动感
  {
    complexity: -0.1,
    spacing: 0.15,
    weight: -0.1,
    asymmetry: 0.2,
    ornament: 0.1,
    density: 0.15,
    rotation: 0.15,
  },
  // 方案C — 更复杂、更紧凑、更静态
  {
    complexity: 0.15,
    spacing: -0.1,
    weight: 0.15,
    asymmetry: -0.1,
    ornament: -0.1,
    density: -0.1,
    rotation: -0.1,
  },
]

/**
 * 在方案间对参数应用差异化偏移
 * 确保 3 个 LOGO 视觉上有明显区分
 */
export function applyVariantOffsets(
  baseParams: StrategyParams,
  aiOffset: Partial<StrategyParams>,
  variantIndex: number,
): StrategyParams {
  const result: StrategyParams = { ...baseParams }

  // 应用 AI 提供的偏移
  for (const k of Object.keys(result) as (keyof StrategyParams)[]) {
    if (aiOffset[k] !== undefined) {
      result[k] = clamp(result[k] + aiOffset[k])
    }
  }

  // 应用硬编码的方案偏移（确保差异）
  const hardOffset = VARIANT_OFFSETS[variantIndex]
  if (hardOffset) {
    for (const k of Object.keys(result) as (keyof StrategyParams)[]) {
      if (hardOffset[k] !== undefined) {
        result[k] = clamp(result[k] + hardOffset[k])
      }
    }
  }

  return result
}

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v))
}

/** 保证 3 个方案使用不同的策略（策略不做差异化用，策略选择已经不同） */
export function ensureStrategyDiversity(strategies: string[]): string[] {
  // 如果少于 3 个，说明上层已经选了足够不同的策略
  // 这里只做安全兜底
  return strategies
}
