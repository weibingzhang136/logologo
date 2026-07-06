// ============================================================
// 输出质量校验器
// 验证生成的图元/ SVG 是否符合 PRD 要求
// ============================================================

import type { Primitive, Text } from './types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/** 校验生成的图元列表质量 */
export function validateOutput(primitives: Primitive[]): ValidationResult {
  const errors: string[] = []

  if (primitives.length === 0) {
    errors.push('输出为空：没有生成任何图元')
    return { valid: false, errors }
  }

  if (primitives.length > 200) {
    errors.push(`输出图元过多(${primitives.length})，可能过于复杂`)
  }

  // 检查是否有有效文字
  const texts = primitives.filter((p): p is Text => p.type === 'text')
  if (texts.length === 0) {
    errors.push('输出缺少文字元素')
  }

  // 检查 fontSize 是否合理
  for (const t of texts) {
    if (t.fontSize > 200) {
      errors.push(`文字字号过大(${t.fontSize})`)
    }
    if (t.fontSize < 6) {
      errors.push(`文字字号过小(${t.fontSize})`)
    }
  }

  // 检查坐标系是否合理（坐标超出画布过多）
  const outlierCount = primitives.filter(p => {
    if (p.type === 'circle') return p.cx < -50 || p.cx > 550 || p.cy < -50 || p.cy > 550 || p.r < 0
    if (p.type === 'rect') return p.x < -100 || p.x > 600 || p.y < -100 || p.y > 600
    return false
  }).length

  if (outlierCount > primitives.length * 0.5) {
    errors.push('超过半数的元素坐标异常')
  }

  // 颜色合规性检查
  const allColors = new Set<string>()
  primitives.forEach(p => {
    if ('fill' in p && p.fill) allColors.add(p.fill)
    if ('stroke' in p && p.stroke) allColors.add(p.stroke)
  })

  // 检查是否有渐变（PRD 禁止渐变）
  const hasGradient = primitives.some(p => {
    if ('fill' in p && typeof p.fill === 'string' && p.fill.startsWith('url(')) return true
    if ('stroke' in p && typeof p.stroke === 'string' && p.stroke.startsWith('url(')) return true
    return false
  })
  if (hasGradient) {
    errors.push('包含渐变填充（PRD 禁止）')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/** 校验 SVG 字符串（基础安全检查） */
export function validateSVGSyntax(svg: string): ValidationResult {
  const errors: string[] = []

  if (!svg.trim()) {
    errors.push('SVG 字符串为空')
    return { valid: false, errors }
  }

  if (!svg.includes('<svg') || !svg.includes('</svg>')) {
    errors.push('缺少 SVG 根元素标签')
  }

  if (svg.includes('<script') || svg.includes('onload=') || svg.includes('onclick=')) {
    errors.push('检测到危险的 JS 内容')
  }

  // 检查是否包含外部图片引用
  if (svg.includes('<image') || svg.includes('<foreignObject')) {
    errors.push('包含禁止的元素(image/foreignObject)')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
