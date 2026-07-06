// ============================================================
// SVG 渲染器 — 将 Primitive[] 渲染为可用的 SVG 字符串
// ============================================================

import type { Primitive, Circle, Arc, Rect, Line, Polygon, Path, Text } from './types'

export const CN_FONT = '"Noto Sans SC","Noto Sans CJK SC","Source Han Sans CN",sans-serif'
export const EN_FONT = '"Inter","Helvetica Neue",Arial,sans-serif'

/** 渲染完整的 SVG 文档 */
export function renderToSVG(
  primitives: Primitive[],
  width = 500,
  height = 500,
  backgroundColor = '#ffffff',
): string {
  const inner = primitives.map(renderPrimitive).join('\n')

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
    `  <rect width="${width}" height="${height}" fill="${backgroundColor}" />`,
    `  <g id="logo-content">`,
    inner,
    `  </g>`,
    `</svg>`,
  ].join('\n')
}

function renderPrimitive(p: Primitive): string {
  switch (p.type) {
    case 'circle': return renderCircle(p)
    case 'arc':    return renderArc(p)
    case 'rect':   return renderRect(p)
    case 'line':   return renderLine(p)
    case 'polygon': return renderPolygon(p)
    case 'path':   return renderPath(p)
    case 'text':   return renderText(p)
  }
}

function renderCircle(c: Circle): string {
  const parts = [`<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}"`]
  if (c.fill) parts.push(` fill="${c.fill}"`)
  else parts.push(' fill="none"')
  if (c.stroke) parts.push(` stroke="${c.stroke}"`)
  if (c.strokeWidth) parts.push(` stroke-width="${c.strokeWidth}"`)
  if (c.opacity !== undefined) parts.push(` opacity="${c.opacity}"`)
  parts.push(' />')
  return '    ' + parts.join('')
}

function renderArc(a: Arc): string {
  // 角度 → SVG path arc 命令
  const startX = a.cx + a.r * Math.cos(a.startAngle)
  const startY = a.cy + a.r * Math.sin(a.startAngle)
  const endX = a.cx + a.r * Math.cos(a.endAngle)
  const endY = a.cy + a.r * Math.sin(a.endAngle)
  const largeArc = Math.abs(a.endAngle - a.startAngle) > Math.PI ? 1 : 0
  const sweep = a.endAngle > a.startAngle ? 1 : 0

  let d = `M ${startX} ${startY} A ${a.r} ${a.r} 0 ${largeArc} ${sweep} ${endX} ${endY}`
  if (a.fill) {
    // 如果填充，闭合到圆心形成扇形
    d += ` L ${a.cx} ${a.cy} Z`
  }

  const parts = [`<path d="${d}"`]
  if (a.fill) parts.push(` fill="${a.fill}"`)
  else parts.push(' fill="none"')
  if (a.stroke) parts.push(` stroke="${a.stroke}"`)
  if (a.strokeWidth) parts.push(` stroke-width="${a.strokeWidth}"`)
  if (a.opacity !== undefined) parts.push(` opacity="${a.opacity}"`)
  parts.push(' />')
  return '    ' + parts.join('')
}

function renderRect(r: Rect): string {
  const parts = [`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"`]
  if (r.rx) parts.push(` rx="${r.rx}"`)
  if (r.fill) parts.push(` fill="${r.fill}"`)
  else parts.push(' fill="none"')
  if (r.stroke) parts.push(` stroke="${r.stroke}"`)
  if (r.strokeWidth) parts.push(` stroke-width="${r.strokeWidth}"`)
  if (r.opacity !== undefined) parts.push(` opacity="${r.opacity}"`)
  if (r.rotation) {
    const cx = r.x + r.w / 2
    const cy = r.y + r.h / 2
    parts.push(` transform="rotate(${r.rotation} ${cx} ${cy})"`)
  }
  parts.push(' />')
  return '    ' + parts.join('')
}

function renderLine(l: Line): string {
  const parts = [`<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}"`]
  parts.push(` stroke="${l.stroke}" stroke-width="${l.strokeWidth}"`)
  if (l.cap) parts.push(` stroke-linecap="${l.cap}"`)
  if (l.opacity !== undefined) parts.push(` opacity="${l.opacity}"`)
  parts.push(' />')
  return '    ' + parts.join('')
}

function renderPolygon(p: Polygon): string {
  const pts = p.points.map(pt => `${pt[0]},${pt[1]}`).join(' ')
  const parts = [`<polygon points="${pts}"`]
  if (p.fill) parts.push(` fill="${p.fill}"`)
  else parts.push(' fill="none"')
  if (p.stroke) parts.push(` stroke="${p.stroke}"`)
  if (p.strokeWidth) parts.push(` stroke-width="${p.strokeWidth}"`)
  if (p.opacity !== undefined) parts.push(` opacity="${p.opacity}"`)
  if (p.rotation) {
    const avgX = p.points.reduce((s, pt) => s + pt[0], 0) / p.points.length
    const avgY = p.points.reduce((s, pt) => s + pt[1], 0) / p.points.length
    parts.push(` transform="rotate(${p.rotation} ${avgX} ${avgY})"`)
  }
  parts.push(' />')
  return '    ' + parts.join('')
}

function renderPath(p: Path): string {
  const parts = [`<path d="${p.d}"`]
  if (p.fill) parts.push(` fill="${p.fill}"`)
  else parts.push(' fill="none"')
  if (p.stroke) parts.push(` stroke="${p.stroke}"`)
  if (p.strokeWidth) parts.push(` stroke-width="${p.strokeWidth}"`)
  if (p.opacity !== undefined) parts.push(` opacity="${p.opacity}"`)
  parts.push(' />')
  return '    ' + parts.join('')
}

function renderText(t: Text): string {
  const parts = [
    `<text x="${t.x}" y="${t.y}" font-size="${t.fontSize}"`,
  ]
  parts.push(` font-family="${t.fontFamily ?? EN_FONT}"`)
  if (t.fill) parts.push(` fill="${t.fill}"`)
  if (t.stroke) parts.push(` stroke="${t.stroke}"`)
  if (t.strokeWidth) parts.push(` stroke-width="${t.strokeWidth}"`)
  if (t.fontWeight) parts.push(` font-weight="${t.fontWeight}"`)
  if (t.textAnchor) parts.push(` text-anchor="${t.textAnchor}"`)
  if (t.letterSpacing !== undefined) parts.push(` letter-spacing="${t.letterSpacing}em"`)
  if (t.opacity !== undefined) parts.push(` opacity="${t.opacity}"`)
  if (t.rotation) parts.push(` transform="rotate(${t.rotation} ${t.x} ${t.y})"`)
  parts.push(`>${escapeXML(t.content)}</text>`)
  return '    ' + parts.join('')
}

function escapeXML(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
