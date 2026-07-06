// ============================================================
// AI 响应解析器
// 解析 AI API 返回的原始文本，提取结构化决策数据
// ============================================================

import type { AIDecision, StrategyKey, StrategyParams } from '../engine/types'

/** 解析 AI 返回的 JSON 字符串 */
export function parseAIResponse(raw: string): AIDecision {
  // 尝试从文本中提取 JSON 块
  const jsonMatch = raw.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ?? raw.match(/\{[\s\S]*"variants"[\s\S]*\}/)

  if (!jsonMatch) {
    throw new Error('AI 响应中未找到有效的 JSON 数据')
  }

  let parsed: any
  try {
    parsed = JSON.parse(jsonMatch[1] ?? jsonMatch[0])
  } catch {
    throw new Error('AI 返回的 JSON 格式无法解析')
  }

  // 校验结构
  if (!parsed.variants || !Array.isArray(parsed.variants) || parsed.variants.length !== 3) {
    throw new Error('AI 返回必须包含 3 个 variant')
  }

  // 规范化每个 variant
  const variants = parsed.variants.map((v: any, i: number) => {
    if (!v.strategy) {
      throw new Error(`Variant ${i} 缺少 strategy`)
    }

    return {
      strategy: v.strategy as StrategyKey,
      params: normalizeParams(v.params ?? {}),
      offset: normalizeOffset(v.offset ?? {}),
      colors: Array.isArray(v.colors) ? v.colors.filter((c: string) => /^#[0-9a-fA-F]{6}$/.test(c)) : [],
    }
  })

  return { variants }
}

function normalizeParams(p: any): Partial<StrategyParams> {
  const valid: (keyof StrategyParams)[] = [
    'complexity', 'curvature', 'spacing', 'weight',
    'asymmetry', 'ornament', 'density', 'rotation',
  ]

  const result: Partial<StrategyParams> = {}
  for (const k of valid) {
    if (typeof p[k] === 'number') {
      result[k] = Math.max(0, Math.min(1, p[k]))
    }
  }
  return result
}

function normalizeOffset(p: any): Partial<StrategyParams> {
  const valid: (keyof StrategyParams)[] = [
    'complexity', 'curvature', 'spacing', 'weight',
    'asymmetry', 'ornament', 'density', 'rotation',
  ]

  const result: Partial<StrategyParams> = {}
  for (const k of valid) {
    if (typeof p[k] === 'number') {
      result[k] = Math.max(-0.3, Math.min(0.3, p[k]))
    }
  }
  return result
}
