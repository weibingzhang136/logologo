import { describe, it, expect } from 'vitest'
import { validateOutput, validateSVGSyntax } from '../validator'
import type { Primitive } from '../types'

describe('validateOutput', () => {
  it('空图元返回 invalid', () => {
    const result = validateOutput([])
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('输出为空：没有生成任何图元')
  })

  it('缺少文字元素返回 invalid', () => {
    const primitives: Primitive[] = [
      { type: 'circle', cx: 250, cy: 250, r: 50, fill: '#000' },
    ]
    const result = validateOutput(primitives)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('输出缺少文字元素')
  })

  it('正常内容通过校验', () => {
    const primitives: Primitive[] = [
      { type: 'circle', cx: 250, cy: 250, r: 50, fill: '#1A1A2E' },
      { type: 'text', content: '标逻', x: 250, y: 250, fontSize: 36, fill: '#1A1A2E' },
    ]
    const result = validateOutput(primitives)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('字号过大时报错', () => {
    const primitives: Primitive[] = [
      { type: 'text', content: '大', x: 250, y: 250, fontSize: 300, fill: '#000' },
    ]
    const result = validateOutput(primitives)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('字号过大'))).toBe(true)
  })

  it('字号过小时报错', () => {
    const primitives: Primitive[] = [
      { type: 'text', content: '小', x: 250, y: 250, fontSize: 2, fill: '#000' },
    ]
    const result = validateOutput(primitives)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('字号过小'))).toBe(true)
  })

  it('图元过多时报错', () => {
    const primitives: Primitive[] = Array.from({ length: 250 }, () => ({
      type: 'circle' as const,
      cx: 250, cy: 250, r: 10,
      fill: '#000',
      opacity: 0.5,
    }))
    // 加一个 text 避免 "缺少文字" 报错
    primitives.push({ type: 'text', content: '标逻', x: 250, y: 250, fontSize: 36, fill: '#000' })
    const result = validateOutput(primitives)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('过多'))).toBe(true)
  })

  it('渐变填充被检测', () => {
    const primitives: Primitive[] = [
      { type: 'circle', cx: 250, cy: 250, r: 50, fill: 'url(#gradient)' },
      { type: 'text', content: '标逻', x: 250, y: 250, fontSize: 36, fill: '#000' },
    ]
    const result = validateOutput(primitives)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('渐变'))).toBe(true)
  })

  it('坐标异常超过半数时报错', () => {
    const primitives: Primitive[] = [
      { type: 'circle', cx: 9999, cy: 9999, r: 50, fill: '#000', opacity: 0.5 },
      { type: 'circle', cx: 9999, cy: 9999, r: 50, fill: '#000', opacity: 0.5 },
      { type: 'circle', cx: 9999, cy: 9999, r: 50, fill: '#000', opacity: 0.5 },
      { type: 'text', content: '标逻', x: 250, y: 250, fontSize: 36, fill: '#000' },
    ]
    const result = validateOutput(primitives)
    expect(result.valid).toBe(false)
  })

  it('负半径 circle 被检测', () => {
    const primitives: Primitive[] = [
      { type: 'circle', cx: 250, cy: 250, r: -10, fill: '#000', opacity: 0.5 },
      { type: 'circle', cx: 250, cy: 250, r: -10, fill: '#000', opacity: 0.5 },
      { type: 'circle', cx: 250, cy: 250, r: -10, fill: '#000', opacity: 0.5 },
      { type: 'text', content: '标逻', x: 250, y: 250, fontSize: 36, fill: '#000' },
    ]
    const result = validateOutput(primitives)
    expect(result.valid).toBe(false)
  })
})

describe('validateSVGSyntax', () => {
  it('空字符串返回 invalid', () => {
    const result = validateSVGSyntax('')
    expect(result.valid).toBe(false)
  })

  it('空白字符串返回 invalid', () => {
    const result = validateSVGSyntax('   ')
    expect(result.valid).toBe(false)
  })

  it('有效 SVG 通过校验', () => {
    const svg = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/></svg>'
    const result = validateSVGSyntax(svg)
    expect(result.valid).toBe(true)
  })

  it('缺少 svg 标签报错', () => {
    const result = validateSVGSyntax('<div></div>')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('SVG 根元素'))).toBe(true)
  })

  it('检测 script 标签', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
    const result = validateSVGSyntax(svg)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('危险'))).toBe(true)
  })

  it('检测 onload 事件', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><circle cx="50" cy="50" r="40"/></svg>'
    const result = validateSVGSyntax(svg)
    expect(result.valid).toBe(false)
  })

  it('检测 image 元素', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><image href="xss.svg"/></svg>'
    const result = validateSVGSyntax(svg)
    expect(result.valid).toBe(false)
  })

  it('检测 foreignObject', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject></foreignObject></svg>'
    const result = validateSVGSyntax(svg)
    expect(result.valid).toBe(false)
  })
})
