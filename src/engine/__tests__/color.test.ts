import { describe, it, expect } from 'vitest'
import { resolveColors, isValidHex, enhanceForLogo, generatePalette } from '../color'

describe('isValidHex', () => {
  it('接受有效 6 位 HEX', () => {
    expect(isValidHex('#1A1A2E')).toBe(true)
    expect(isValidHex('#FFFFFF')).toBe(true)
    expect(isValidHex('#000000')).toBe(true)
    expect(isValidHex('#aabbcc')).toBe(true)
  })

  it('拒绝无效 HEX', () => {
    expect(isValidHex('#FFF')).toBe(false)
    expect(isValidHex('#GGGGGG')).toBe(false)
    expect(isValidHex('1A1A2E')).toBe(false)
    expect(isValidHex('#1A1A2')).toBe(false)
    expect(isValidHex('')).toBe(false)
  })
})

describe('resolveColors', () => {
  it('single 返回 1 色', () => {
    const colors = resolveColors('single')
    expect(colors).toHaveLength(1)
    expect(colors[0]).toMatch(/^#[0-9a-fA-F]{6}$/)
  })

  it('dual 返回 2 色', () => {
    const colors = resolveColors('dual')
    expect(colors).toHaveLength(2)
  })

  it('triple 返回 3 色', () => {
    const colors = resolveColors('triple')
    expect(colors).toHaveLength(3)
  })

  it('quad 返回 4 色', () => {
    const colors = resolveColors('quad')
    expect(colors).toHaveLength(4)
  })

  it('custom 返回传入的有效色值', () => {
    const colors = resolveColors('custom', ['#FF0000', '#00FF00'])
    expect(colors).toEqual(['#FF0000', '#00FF00'])
  })

  it('custom 过滤无效色值', () => {
    const colors = resolveColors('custom', ['#FF0000', 'invalid', '#GGGGGG'])
    expect(colors).toEqual(['#FF0000'])
  })

  it('custom 空列表回退到兜底', () => {
    const colors = resolveColors('custom', [])
    expect(colors).toHaveLength(2)
  })

  it('custom 传入无效色值，回退到兜底', () => {
    const colors = resolveColors('custom', ['invalid'])
    expect(colors).toHaveLength(2)
  })
})

describe('enhanceForLogo', () => {
  it('主色不变', () => {
    const result = enhanceForLogo(['#1A1A2E', '#F5F5F5'])
    expect(result[0]).toBe('#1A1A2E')
  })

  it('辅助色饱和度提高', () => {
    const result = enhanceForLogo(['#1A1A2E', '#999999'])
    expect(result[0]).toBe('#1A1A2E')
    expect(result[1]).not.toBe('#999999')
    // 饱和度应该更高
  })

  it('单色输入不变', () => {
    const result = enhanceForLogo(['#1A1A2E'])
    expect(result).toEqual(['#1A1A2E'])
  })

  it('返回数组长度与输入一致', () => {
    const result = enhanceForLogo(['#FF0000', '#00FF00', '#0000FF'])
    expect(result).toHaveLength(3)
  })
})

describe('generatePalette', () => {
  it('mono 生成正确数量', () => {
    const palette = generatePalette('#1A1A2E', 'mono', 3)
    expect(palette).toHaveLength(3)
    for (const c of palette) {
      expect(isValidHex(c)).toBe(true)
    }
  })

  it('complementary 生成正确数量', () => {
    const palette = generatePalette('#FF0000', 'complementary', 4)
    expect(palette).toHaveLength(4)
  })

  it('analogous 生成正确数量', () => {
    const palette = generatePalette('#1A1A2E', 'analogous', 3)
    expect(palette).toHaveLength(3)
  })

  it('triadic 生成正确数量', () => {
    const palette = generatePalette('#1A1A2E', 'triadic', 3)
    expect(palette).toHaveLength(3)
  })

  it('unknown scheme 回退到 mono', () => {
    const palette = generatePalette('#1A1A2E', 'custom' as any, 3)
    expect(palette).toHaveLength(3)
  })

  it('所有输出是有效 HEX', () => {
    const schemes = ['mono', 'complementary', 'analogous', 'triadic'] as const
    for (const scheme of schemes) {
      const palette = generatePalette('#3366CC', scheme, 4)
      for (const c of palette) {
        expect(isValidHex(c)).toBe(true)
      }
    }
  })
})
