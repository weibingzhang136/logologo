import { describe, it, expect } from 'vitest'
import type { StrategyInput, Primitive } from '../types'
import { DEFAULT_PARAMS, STRATEGY_KEYS } from '../types'
import { STRATEGY_REGISTRY } from '../strategies/index'
import { validateOutput } from '../validator'
import { renderToSVG } from '../renderer'

const TEST_INPUT: StrategyInput = {
  brandNameCN: '标逻',
  brandNameEN: 'Logologo',
  params: { ...DEFAULT_PARAMS },
  colors: ['#1A1A2E', '#2A5CFF'],
  seed: 42,
}

/** 极端参数边界情况，用于测试所有策略在极限值下不会崩溃 */
const EXTREME_INPUTS: StrategyInput[] = [
  {
    ...TEST_INPUT,
    brandNameCN: '一',
    brandNameEN: '',
    params: { complexity: 0, curvature: 0, spacing: 0, weight: 0, asymmetry: 0, ornament: 0, density: 0, rotation: 0 },
  },
  {
    ...TEST_INPUT,
    brandNameCN: '极长品牌名测试用',
    brandNameEN: 'Very Long English Brand Name',
    params: { complexity: 1, curvature: 1, spacing: 1, weight: 1, asymmetry: 1, ornament: 1, density: 1, rotation: 1 },
  },
  {
    ...TEST_INPUT,
    brandNameCN: '中',
    brandNameEN: 'A',
    colors: ['#333333'],
    params: { complexity: 0.5, curvature: 0.5, spacing: 0.5, weight: 0.5, asymmetry: 0.5, ornament: 0.5, density: 0.5, rotation: 0.5 },
  },
]

describe.each(STRATEGY_KEYS)('策略: %s', (key) => {
  const fn = STRATEGY_REGISTRY[key]

  it('注册表中存在', () => {
    expect(fn).toBeDefined()
  })

  it('返回 StrategyOutput', () => {
    const result = fn(TEST_INPUT)
    expect(result).toBeDefined()
    expect(result).toHaveProperty('primitives')
    expect(Array.isArray(result.primitives)).toBe(true)
  })

  it('返回的图元列表不为空', () => {
    const result = fn(TEST_INPUT)
    expect(result.primitives.length).toBeGreaterThan(0)
  })

  it('包含至少一个文字元素（品牌名）', () => {
    const result = fn(TEST_INPUT)
    const texts = result.primitives.filter((p): p is Primitive & { type: 'text' } => p.type === 'text')
    expect(texts.length).toBeGreaterThanOrEqual(1)

    // 某些策略会拆分字符（initial_mark 取首字、letter_marquee 逐字排列等）
    // 所以用 includes 而非全等判断
    const hasCnChar = texts.some(t => t.content.includes('标') || t.content.includes('逻'))
    expect(hasCnChar).toBe(true)
  })

  it('所有图元包含有效类型', () => {
    const result = fn(TEST_INPUT)
    const validTypes = ['circle', 'arc', 'rect', 'line', 'polygon', 'path', 'text']
    for (const p of result.primitives) {
      expect(validTypes).toContain(p.type)
    }
  })

  it('通过 validator 质量校验', () => {
    const result = fn(TEST_INPUT)
    const validation = validateOutput(result.primitives)
    expect(validation.valid).toBe(true)
  })

  it('可渲染为有效 SVG', () => {
    const result = fn(TEST_INPUT)
    const svg = renderToSVG(result.primitives)
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
  })

  it('对极端参数不崩溃', () => {
    for (const input of EXTREME_INPUTS) {
      expect(() => fn(input)).not.toThrow()
    }
  })

  it('给定相同输入产生相同输出（确定性）', () => {
    const a = fn(TEST_INPUT)
    const b = fn(TEST_INPUT)
    expect(a.primitives.length).toBe(b.primitives.length)
    for (let i = 0; i < a.primitives.length; i++) {
      expect(JSON.stringify(a.primitives[i])).toBe(JSON.stringify(b.primitives[i]))
    }
  })

  it('所有坐标在合理范围内', () => {
    const result = fn(TEST_INPUT)
    for (const p of result.primitives) {
      switch (p.type) {
        case 'circle':
          expect(p.cx).toBeGreaterThan(-50)
          expect(p.cx).toBeLessThan(550)
          expect(p.cy).toBeGreaterThan(-50)
          expect(p.cy).toBeLessThan(550)
          expect(p.r).toBeGreaterThan(0)
          break
        case 'rect':
          expect(p.x).toBeGreaterThan(-100)
          expect(p.x).toBeLessThan(600)
          expect(p.y).toBeGreaterThan(-100)
          expect(p.y).toBeLessThan(600)
          break
        case 'line':
          expect(p.x1).toBeGreaterThan(-100)
          expect(p.x1).toBeLessThan(600)
          expect(p.y1).toBeGreaterThan(-100)
          expect(p.y1).toBeLessThan(600)
          break
      }
    }
  })

  it('不使用禁止的渐变填充', () => {
    const result = fn(TEST_INPUT)
    for (const p of result.primitives) {
      if ('fill' in p && typeof p.fill === 'string') {
        expect(p.fill.startsWith('url(')).toBe(false)
      }
      if ('stroke' in p && typeof p.stroke === 'string') {
        expect(p.stroke.startsWith('url(')).toBe(false)
      }
    }
  })
})

describe('策略注册表完整性', () => {
  it('注册了全部 20 个策略', () => {
    expect(Object.keys(STRATEGY_REGISTRY).length).toBe(20)
    expect(STRATEGY_KEYS.length).toBe(20)
  })

  it('所有 STRATEGY_KEYS 在注册表中', () => {
    for (const key of STRATEGY_KEYS) {
      expect(STRATEGY_REGISTRY[key]).toBeDefined()
    }
  })

  it('所有注册的策略都在 STRATEGY_KEYS 中', () => {
    for (const key of Object.keys(STRATEGY_REGISTRY)) {
      expect(STRATEGY_KEYS).toContain(key)
    }
  })
})

describe('几何策略 (7种)', () => {
  const geometricKeys = STRATEGY_KEYS.filter(k =>
    ['circle_wrap', 'golden_ratio', 'diagonal_mirror', 'concentric', 'overlap_penetrate', 'grid_dots', 'radial_burst'].includes(k),
  )

  it.each(geometricKeys)('%s 产生至少 2 个几何图元', (key) => {
    const result = STRATEGY_REGISTRY[key](TEST_INPUT)
    const geos = result.primitives.filter(p => ['circle', 'rect', 'polygon', 'arc', 'line'].includes(p.type))
    expect(geos.length).toBeGreaterThanOrEqual(2)
  })
})

describe('文字策略 (7种)', () => {
  const textKeys = STRATEGY_KEYS.filter(k =>
    ['initial_mark', 'embedded', 'top_bottom_split', 'left_right_juxtapose', 'letter_marquee', 'vertical_stack', 'outline_merge'].includes(k),
  )

  it.each(textKeys)('%s 包含品牌名字符', (key) => {
    const result = STRATEGY_REGISTRY[key](TEST_INPUT)
    const texts = result.primitives.filter(p => p.type === 'text' && p.type === 'text')
    const allContent = texts.map(t => (t as Primitive & { type: 'text' }).content).join('')
    expect(allContent).toContain('标')
  })
})

describe('抽象策略 (6种)', () => {
  const abstractKeys = STRATEGY_KEYS.filter(k =>
    ['negative_space', 'rhythm_repeat', 'deconstruct_offset', 'layer_depth', 'geometric_animal', 'fold_origami'].includes(k),
  )

  it.each(abstractKeys)('%s 产生至少 3 个图元', (key) => {
    const result = STRATEGY_REGISTRY[key](TEST_INPUT)
    expect(result.primitives.length).toBeGreaterThanOrEqual(3)
  })
})
