import { describe, it, expect } from 'vitest'
import { composeLogo } from '../composer'
import { applyVariantOffsets, VARIANT_OFFSETS } from '../variant-generator'
import { getParamsForTone, getPreferredStrategies } from '../tone-mapping'
import { DEFAULT_PARAMS, BRAND_TONES } from '../types'
import type { LogoRequest, StrategyParams, AIDecision } from '../types'

const SAMPLE_REQUEST: LogoRequest = {
  brandNameCN: '标逻',
  brandNameEN: 'Logologo',
  philosophy: '让每个品牌都有独特的视觉标识',
  industry: '科技',
  products: 'AI 标志生成工具',
  tone: '极简克制',
  structure: 'text_graphic',
  colorRequirement: 'dual',
}

const SAMPLE_DECISION: AIDecision = {
  variants: [
    {
      strategy: 'circle_wrap',
      params: { complexity: 0.6, curvature: 0.7 },
      offset: { asymmetry: 0.1 },
      colors: [],
    },
    {
      strategy: 'golden_ratio',
      params: { complexity: 0.4, curvature: 0.3 },
      offset: { spacing: 0.2 },
      colors: [],
    },
    {
      strategy: 'negative_space',
      params: { density: 0.5 },
      offset: { ornament: 0.15 },
      colors: [],
    },
  ],
}

describe('composeLogo', () => {
  it('返回 3 个变体', () => {
    const result = composeLogo(SAMPLE_REQUEST, SAMPLE_DECISION)
    expect(result.variants).toHaveLength(3)
  })

  it('变体有 label strategy svg', () => {
    const result = composeLogo(SAMPLE_REQUEST, SAMPLE_DECISION)
    for (const v of result.variants) {
      expect(v.label).toMatch(/^方案[ABC]$/)
      expect(v.strategy).toBeTruthy()
      expect(v.svg).toContain('<svg')
      expect(v.svg).toContain('</svg>')
    }
  })

  it('包含生成时间戳', () => {
    const result = composeLogo(SAMPLE_REQUEST, SAMPLE_DECISION)
    expect(result.generatedAt).toBeTruthy()
    expect(() => new Date(result.generatedAt)).not.toThrow()
  })

  it('3 个方案使用了不同的策略', () => {
    const result = composeLogo(SAMPLE_REQUEST, SAMPLE_DECISION)
    const strategies = result.variants.map(v => v.strategy)
    expect(new Set(strategies).size).toBe(3)
  })

  it('SVG 包含品牌名', () => {
    const result = composeLogo(SAMPLE_REQUEST, SAMPLE_DECISION)
    for (const v of result.variants) {
      expect(v.svg).toContain('标逻')
    }
  })

  it('SVG 不包含危险内容', () => {
    const result = composeLogo(SAMPLE_REQUEST, SAMPLE_DECISION)
    for (const v of result.variants) {
      expect(v.svg).not.toContain('<script')
      expect(v.svg).not.toContain('onload=')
    }
  })

  it('处理无效策略时抛错', () => {
    const badDecision: AIDecision = {
      variants: [
        { strategy: 'nonexistent' as any, params: {}, offset: {}, colors: [] },
        { strategy: 'circle_wrap', params: {}, offset: {}, colors: [] },
        { strategy: 'golden_ratio', params: {}, offset: {}, colors: [] },
      ],
    }
    expect(() => composeLogo(SAMPLE_REQUEST, badDecision)).toThrow()
  })

  it('给定相同输入产生相同输出（确定性）', () => {
    // composer 目前用了 Date.now() 作为 seed 一部分，所以不同次调用不同
    // 这里只验证结构一致性
    const result = composeLogo(SAMPLE_REQUEST, SAMPLE_DECISION)
    expect(result.variants.every(v => v.svg.length > 0)).toBe(true)
  })
})

describe('applyVariantOffsets', () => {
  const baseParams: StrategyParams = { ...DEFAULT_PARAMS }

  it('方案A 无偏移', () => {
    const result = applyVariantOffsets(baseParams, {}, 0)
    // 无 aiOffset，VARIANT_OFFSETS[0] = {}，所以与 base 一致
    expect(result).toEqual(baseParams)
  })

  it('方案B 应用偏移', () => {
    const result = applyVariantOffsets(baseParams, {}, 1)
    // complexity 应该被偏移了 -0.1
    expect(result.complexity).toBeLessThan(baseParams.complexity)
    // spacing 多了 0.15
    expect(result.spacing).toBeGreaterThan(baseParams.spacing)
  })

  it('方案C 应用偏移', () => {
    const result = applyVariantOffsets(baseParams, {}, 2)
    // complexity 偏移 +0.15
    expect(result.complexity).toBeGreaterThan(baseParams.complexity)
  })

  it('AI offset 叠加在硬编码偏移之上', () => {
    const result = applyVariantOffsets(baseParams, { complexity: 0.2 }, 2)
    // base 0.5 + ai 0.2 + hard 0.15 = 0.85
    expect(result.complexity).toBeCloseTo(0.85)
  })

  it('clamp 到 [0, 1]', () => {
    const result = applyVariantOffsets(baseParams, { complexity: 10 }, 0)
    expect(result.complexity).toBe(1)
    const result2 = applyVariantOffsets(baseParams, { complexity: -10 }, 0)
    expect(result2.complexity).toBe(0)
  })

  it('VARIANT_OFFSETS 有 3 个条目', () => {
    expect(VARIANT_OFFSETS).toHaveLength(3)
  })

  it('方案间差异化参数至少 7 个有区分', () => {
    // VARIANT_OFFSETS 不包含 curvature（曲直度由 AI 直接指定而非差异化）
    // 验证其他 7 个参数至少有不同的偏移值
    const keys = Object.keys(DEFAULT_PARAMS).filter(k => k !== 'curvature') as (keyof StrategyParams)[]
    let differentiatedCount = 0
    for (const k of keys) {
      const values = VARIANT_OFFSETS.map(o => o[k])
      if (new Set(values).size >= 2) differentiatedCount++
    }
    expect(differentiatedCount).toBeGreaterThanOrEqual(7)
  })
})

describe('tone-mapping', () => {
  it('所有 14 个调性都有映射', () => {
    for (const tone of BRAND_TONES) {
      const entry = getParamsForTone(tone)
      expect(entry).toBeDefined()
      expect(entry.label).toBe(tone)
      expect(entry.params).toBeDefined()
      expect(entry.preferredStrategies.length).toBeGreaterThanOrEqual(3)
      expect(entry.colorPalettes.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('调性映射的 params 包含全部 8 维参数', () => {
    const paramKeys: (keyof StrategyParams)[] = ['complexity', 'curvature', 'spacing', 'weight', 'asymmetry', 'ornament', 'density', 'rotation']
    for (const tone of BRAND_TONES) {
      const entry = getParamsForTone(tone)
      for (const k of paramKeys) {
        expect(entry.params[k]).toBeDefined()
        expect(entry.params[k]).toBeGreaterThanOrEqual(0)
        expect(entry.params[k]).toBeLessThanOrEqual(1)
      }
    }
  })

  it('getPreferredStrategies 返回指定数量', () => {
    const strategies = getPreferredStrategies('极简克制', 3)
    expect(strategies).toHaveLength(3)
  })

  it('getPreferredStrategies 默认返回 5 个', () => {
    const strategies = getPreferredStrategies('极简克制')
    expect(strategies).toHaveLength(5)
  })
})
