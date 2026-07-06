// ============================================================
// 色彩工具 — 调色板生成、颜色操作、兜底色板
// ============================================================

/** 兜底色板 — 当用户色值非法时使用 */
export const FALLBACK_PALETTES: Record<string, string[]> = {
  single: ['#333333'],
  dual: ['#333333', '#F5F5F5'],
  triple: ['#333333', '#F5F5F5', '#999999'],
  quad: ['#333333', '#F5F5F5', '#999999', '#CCCCCC'],
}

/** 品牌主色调深空灰 + 极光蓝 */
export const BRAND_COLORS = ['#1A1A2E', '#2A5CFF']

type ColorScheme = 'mono' | 'complementary' | 'analogous' | 'triadic' | 'custom'

/** 解析颜色要求，返回实际色值数组 */
export function resolveColors(
  count: 'single' | 'dual' | 'triple' | 'quad' | 'custom',
  customColors?: string[],
): string[] {
  if (count === 'custom' && customColors && customColors.length > 0) {
    const valid = customColors.filter(isValidHex)
    if (valid.length > 0) return valid
  }

  const key = count === 'custom' ? 'dual' : count
  return FALLBACK_PALETTES[key] ?? FALLBACK_PALETTES.dual
}

/** 校验 HEX 色值合法性 */
export function isValidHex(color: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(color)
}

/**
 * 从基础色生成配色方案
 * 输入一个主色，输出该方案所需的完整色板
 */
export function generatePalette(base: string, scheme: ColorScheme, count: number): string[] {
  switch (scheme) {
    case 'mono':
      return generateMono(base, count)
    case 'complementary':
      return generateComplementary(base, count)
    case 'analogous':
      return generateAnalogous(base, count)
    case 'triadic':
      return generateTriadic(base, count)
    default:
      return [base, ...generateMono(base, count - 1)]
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255]
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break
      case gn: h = ((bn - rn) / d + 2) / 6; break
      case bn: h = ((rn - gn) / d + 4) / 6; break
    }
  }
  return [h, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return [r * 255, g * 255, b * 255]
}

function generateMono(base: string, count: number): string[] {
  const [r, g, b] = hexToRgb(base)
  const [h, s, l] = rgbToHsl(r, g, b)
  const step = 0.15 / Math.max(count - 1, 1)
  return Array.from({ length: count }, (_, i) => {
    const nl = Math.max(0.1, Math.min(0.9, l + (i - Math.floor((count - 1) / 2)) * step))
    const [nr, ng, nb] = hslToRgb(h, s, nl)
    return rgbToHex(nr, ng, nb)
  })
}

function generateComplementary(base: string, count: number): string[] {
  const [r, g, b] = hexToRgb(base)
  const [h, s, l] = rgbToHsl(r, g, b)
  const compH = (h + 0.5) % 1
  const comp: string[] = []
  for (let i = 0; i < count; i++) {
    const mix = i / (count - 1 || 1)
    const ch = h + (compH - h) * mix
    const cl = l + (i % 2 === 0 ? 0.1 : -0.1)
    const [nr, ng, nb] = hslToRgb(ch, s, Math.max(0.1, Math.min(0.9, cl)))
    comp.push(rgbToHex(nr, ng, nb))
  }
  return comp
}

function generateAnalogous(base: string, count: number): string[] {
  const [r, g, b] = hexToRgb(base)
  const [h, s, l] = rgbToHsl(r, g, b)
  const spread = 0.15
  return Array.from({ length: count }, (_, i) => {
    const offset = (i / (count - 1 || 1) - 0.5) * 2 * spread
    const [nr, ng, nb] = hslToRgb((h + offset + 1) % 1, s, l)
    return rgbToHex(nr, ng, nb)
  })
}

function generateTriadic(base: string, count: number): string[] {
  const [r, g, b] = hexToRgb(base)
  const [h, s, l] = rgbToHsl(r, g, b)
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / Math.max(count - 1, 1)) * (1 / 3)
    const [nr, ng, nb] = hslToRgb((h + angle) % 1, s, l)
    return rgbToHex(nr, ng, nb)
  })
}

/** 在色板基础上生成更适合 LOGO 的配色（提高对比度） */
export function enhanceForLogo(colors: string[]): string[] {
  return colors.map((c, i) => {
    if (i === 0) return c // 主色不变
    const [r, g, b] = hexToRgb(c)
    const [h, s, l] = rgbToHsl(r, g, b)
    // 辅助色提高饱和度
    const ns = Math.min(1, s * 1.3)
    const nl = i === colors.length - 1
      ? Math.min(0.95, l * 1.2) // 最浅色更亮（用于背景/点缀）
      : l
    const [nr, ng, nb] = hslToRgb(h, ns, nl)
    return rgbToHex(nr, ng, nb)
  })
}
