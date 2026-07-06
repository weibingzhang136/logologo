import { describe, it, expect } from 'vitest'
import { renderToSVG } from '../renderer'
import type { Primitive } from '../types'

describe('renderToSVG', () => {
  it('生成完整 SVG 文档结构', () => {
    const primitives: Primitive[] = [
      { type: 'circle', cx: 250, cy: 250, r: 50, fill: '#1A1A2E' },
    ]
    const svg = renderToSVG(primitives)
    expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('viewBox="0 0 500 500"')
    expect(svg).toContain('</svg>')
  })

  it('包含白色背景', () => {
    const svg = renderToSVG([])
    expect(svg).toContain('fill="#ffffff"')
  })

  it('circle 渲染正确', () => {
    const primitives: Primitive[] = [
      { type: 'circle', cx: 100, cy: 200, r: 30, fill: '#FF0000', opacity: 0.5 },
    ]
    const svg = renderToSVG(primitives)
    expect(svg).toContain('cx="100"')
    expect(svg).toContain('cy="200"')
    expect(svg).toContain('r="30"')
    expect(svg).toContain('fill="#FF0000"')
    expect(svg).toContain('opacity="0.5"')
  })

  it('circle 无 fill 时渲染为 fill="none"', () => {
    const primitives: Primitive[] = [
      { type: 'circle', cx: 100, cy: 200, r: 30, stroke: '#000', strokeWidth: 2 },
    ]
    const svg = renderToSVG(primitives)
    expect(svg).toContain('fill="none"')
    expect(svg).toContain('stroke="#000"')
    expect(svg).toContain('stroke-width="2"')
  })

  it('rect 渲染正确', () => {
    const primitives: Primitive[] = [
      { type: 'rect', x: 10, y: 20, w: 100, h: 50, rx: 5, fill: '#00FF00', stroke: '#000', strokeWidth: 1 },
    ]
    const svg = renderToSVG(primitives)
    expect(svg).toContain('x="10"')
    expect(svg).toContain('y="20"')
    expect(svg).toContain('width="100"')
    expect(svg).toContain('height="50"')
    expect(svg).toContain('rx="5"')
  })

  it('rect 带旋转时生成 transform', () => {
    const primitives: Primitive[] = [
      { type: 'rect', x: 0, y: 0, w: 100, h: 100, fill: '#000', rotation: 45 },
    ]
    const svg = renderToSVG(primitives)
    expect(svg).toContain('transform="rotate(45 50 50)"')
  })

  it('line 渲染正确', () => {
    const primitives: Primitive[] = [
      { type: 'line', x1: 0, y1: 0, x2: 100, y2: 100, stroke: '#000', strokeWidth: 2, cap: 'round', opacity: 0.8 },
    ]
    const svg = renderToSVG(primitives)
    expect(svg).toContain('x1="0"')
    expect(svg).toContain('y1="0"')
    expect(svg).toContain('x2="100"')
    expect(svg).toContain('y2="100"')
    expect(svg).toContain('stroke-linecap="round"')
  })

  it('polygon 渲染正确', () => {
    const primitives: Primitive[] = [
      { type: 'polygon', points: [[0, 0], [100, 0], [50, 100]], closed: true, fill: '#0000FF' },
    ]
    const svg = renderToSVG(primitives)
    expect(svg).toContain('points="0,0 100,0 50,100"')
    expect(svg).toContain('fill="#0000FF"')
  })

  it('polygon 带旋转时生成 transform', () => {
    const primitives: Primitive[] = [
      { type: 'polygon', points: [[0, 0], [100, 0], [50, 100]], closed: true, fill: '#000', rotation: 30 },
    ]
    const svg = renderToSVG(primitives)
    expect(svg).toContain('transform="rotate(30 50 33.333333333333336)"')
  })

  it('path 渲染正确', () => {
    const primitives: Primitive[] = [
      { type: 'path', d: 'M10 10 L100 100', stroke: '#000', strokeWidth: 1, fill: 'none' },
    ]
    const svg = renderToSVG(primitives)
    expect(svg).toContain('d="M10 10 L100 100"')
    expect(svg).toContain('fill="none"')
  })

  it('text 渲染正确', () => {
    const primitives: Primitive[] = [
      { type: 'text', content: '标逻', x: 250, y: 250, fontSize: 36, fill: '#1A1A2E', fontWeight: '700', textAnchor: 'middle' },
    ]
    const svg = renderToSVG(primitives)
    expect(svg).toContain('x="250"')
    expect(svg).toContain('y="250"')
    expect(svg).toContain('font-size="36"')
    expect(svg).toContain('font-weight="700"')
    expect(svg).toContain('text-anchor="middle"')
    expect(svg).toContain('>标逻</text>')
  })

  it('text 带有 stroke/strokeWidth 时渲染', () => {
    const primitives: Primitive[] = [
      { type: 'text', content: 'Test', x: 100, y: 100, fontSize: 24, fill: 'none', stroke: '#000', strokeWidth: 3 },
    ]
    const svg = renderToSVG(primitives)
    expect(svg).toContain('stroke="#000"')
    expect(svg).toContain('stroke-width="3"')
  })

  it('text 带旋转时生成 transform', () => {
    const primitives: Primitive[] = [
      { type: 'text', content: 'Rotated', x: 250, y: 250, fontSize: 24, fill: '#000', rotation: 90 },
    ]
    const svg = renderToSVG(primitives)
    expect(svg).toContain('transform="rotate(90 250 250)"')
  })

  it('text 的 XML 特殊字符转义', () => {
    const primitives: Primitive[] = [
      { type: 'text', content: 'A&B<C>D"E\'F', x: 100, y: 100, fontSize: 16, fill: '#000' },
    ]
    const svg = renderToSVG(primitives)
    expect(svg).toContain('&amp;')
    expect(svg).toContain('&lt;')
    expect(svg).toContain('&gt;')
    expect(svg).toContain('&quot;')
    expect(svg).toContain('&apos;')
    expect(svg).not.toContain('>A&B<')
  })

  it('arc 渲染为 path', () => {
    const primitives: Primitive[] = [
      { type: 'arc', cx: 250, cy: 250, r: 100, startAngle: 0, endAngle: Math.PI, stroke: '#000', strokeWidth: 2 },
    ]
    const svg = renderToSVG(primitives)
    expect(svg).toContain('<path d="')
    expect(svg).toContain('fill="none"')
    expect(svg).toContain('stroke="#000"')
    expect(svg).toContain('stroke-width="2"')
  })

  it('arc 填充时闭合到圆心', () => {
    const primitives: Primitive[] = [
      { type: 'arc', cx: 250, cy: 250, r: 100, startAngle: 0, endAngle: Math.PI, fill: '#FF0000', opacity: 0.5 },
    ]
    const svg = renderToSVG(primitives)
    expect(svg).toContain('Z')
    expect(svg).toContain('fill="#FF0000"')
    expect(svg).toContain('opacity="0.5"')
  })

  it('line 的 letterSpacing 渲染为 em 单位', () => {
    const primitives: Primitive[] = [
      { type: 'text', content: 'Test', x: 100, y: 100, fontSize: 24, fill: '#000', letterSpacing: 0.1 },
    ]
    const svg = renderToSVG(primitives)
    expect(svg).toContain('letter-spacing="0.1em"')
  })
})

describe('空/边界情况', () => {
  it('空图元列表生成最小 SVG', () => {
    const svg = renderToSVG([])
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
    expect(svg).toContain('logo-content')
  })

  it('自定义尺寸生效', () => {
    const svg = renderToSVG([], 800, 600)
    expect(svg).toContain('viewBox="0 0 800 600"')
    expect(svg).toContain('width="800"')
    expect(svg).toContain('height="600"')
  })
})
