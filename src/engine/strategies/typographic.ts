// ============================================================
// 文字类构图策略 — 7 种
// 以文字排版为核心视觉元素
// ============================================================

import type { StrategyFn, Primitive } from '../types'

const CX = 250, CY = 220
const CN_FONT = '"Noto Sans SC","Noto Sans CJK SC","Source Han Sans CN",sans-serif'

// ──── 8. 首字母放大 ────
// 品牌名首字符作为超大图形元素，其余文字并排
export const initial_mark: StrategyFn = ({ brandNameCN, brandNameEN, params, colors }) => {
  const p: Primitive[] = []

  const firstChar = brandNameCN[0] ?? ''
  const rest = brandNameCN.slice(1)

  const markSize = 60 + params.weight * 30 + params.density * 20
  const useShape = params.curvature > 0.3

  // 首字符背景容器
  if (useShape) {
    p.push({
      type: 'circle', cx: 140, cy: 210,
      r: markSize * 0.7 + params.ornament * 10,
      fill: colors[0], opacity: 0.08,
    })
  } else {
    p.push({
      type: 'rect', x: 140 - markSize * 0.7, y: 210 - markSize * 0.7,
      w: markSize * 1.4, h: markSize * 1.4,
      rx: markSize * 0.1,
      fill: colors[0], opacity: 0.08,
    })
  }

  // 首字符
  p.push({
    type: 'text', content: firstChar, x: 140, y: 245,
    fontSize: markSize, fontFamily: CN_FONT, fill: colors[0],
    fontWeight: '700', textAnchor: 'middle',
    opacity: 0.9,
  })

  // 剩余文字
  if (rest) {
    const restSize = 28 + (1 - params.spacing) * 12
    p.push({
      type: 'text', content: rest, x: 210, y: 225,
      fontSize: restSize, fontFamily: CN_FONT, fill: colors[0],
      fontWeight: params.weight > 0.5 ? '700' : '400',
      letterSpacing: 0.05,
    })
  }

  // 英文名
  if (brandNameEN) {
    p.push({
      type: 'text', content: brandNameEN, x: 210, y: 255 + (rest ? 8 : 0),
      fontSize: 12 + params.spacing * 4, fill: colors.length > 1 ? colors[1] : colors[0],
      fontWeight: '300', letterSpacing: 0.1,
      fontFamily: '"Inter","Helvetica Neue",Arial,sans-serif',
    })
  }

  // 装饰线
  if (params.ornament > 0.2) {
    p.push({
      type: 'line', x1: 120, y1: 170, x2: 350, y2: 170,
      stroke: colors.length > 1 ? colors[1] : colors[0],
      strokeWidth: 0.5 + params.ornament,
      opacity: 0.2,
    })
  }

  return { primitives: p }
}

// ──── 9. 文字嵌入 ────
// 品牌名放置在一个几何容器内（盾形/圆形/圆角矩形）
export const embedded: StrategyFn = ({ brandNameCN, brandNameEN, params, colors }) => {
  const p: Primitive[] = []

  const containerW = 300 + params.density * 80
  const containerH = 160 + params.density * 40
  const isRounded = params.curvature > 0.3

  // 主容器
  if (isRounded) {
    const rx = isRounded ? params.curvature * containerW * 0.4 : 8
    p.push({
      type: 'rect', x: CX - containerW / 2, y: CY - containerH / 2,
      w: containerW, h: containerH, rx,
      fill: colors[0], opacity: 0.06,
      stroke: colors[0], strokeWidth: 1 + params.weight * 2,
    })
  }

  // 内部装饰边框
  if (params.ornament > 0.3) {
    p.push({
      type: 'rect', x: CX - containerW / 2 + 12, y: CY - containerH / 2 + 12,
      w: containerW - 24, h: containerH - 24,
      rx: isRounded ? 8 : 4,
      stroke: colors.length > 1 ? colors[1] : colors[0],
      strokeWidth: 0.5, fill: undefined, opacity: 0.15,
    })
  }

  // 品牌名
  const fontSize = 28 + (1 - params.spacing) * 16
  p.push({
    type: 'text', content: brandNameCN,
    x: CX, y: CY + fontSize * 0.3,
    fontSize, fontFamily: CN_FONT, fill: colors[0],
    fontWeight: params.weight > 0.5 ? '700' : '500',
    textAnchor: 'middle', letterSpacing: 0.04 + params.spacing * 0.08,
  })

  if (brandNameEN) {
    p.push({
      type: 'text', content: brandNameEN,
      x: CX, y: CY + fontSize * 0.85,
      fontSize: Math.max(10, fontSize * 0.35), fill: colors.length > 1 ? colors[1] : colors[0],
      fontWeight: '300', textAnchor: 'middle', letterSpacing: 0.1,
      fontFamily: '"Inter","Helvetica Neue",Arial,sans-serif',
    })
  }

  return { primitives: p }
}

// ──── 10. 上下分割 ────
// 上半部图形，下半部文字
export const top_bottom_split: StrategyFn = ({ brandNameCN, brandNameEN, params, colors, seed }) => {
  const p: Primitive[] = []
  const rng = rngFn(seed)
  const splitY = 240
  const graphicCX = 250, graphicCY = splitY / 2 + 10

  // 上半部图形—抽象几何组合
  const size = 40 + params.density * 40
  const useCircle = params.curvature > 0.4

  if (useCircle) {
    p.push({ type: 'circle', cx: graphicCX, cy: graphicCY, r: size * 1.1, stroke: colors[0], strokeWidth: 1.5 + params.weight * 2, fill: undefined, opacity: 0.5 })
    // 内部小圆
    const innerR = size * (0.2 + params.complexity * 0.4)
    p.push({ type: 'circle', cx: graphicCX, cy: graphicCY, r: innerR, fill: colors.length > 1 ? colors[1] : colors[0], opacity: 0.5 })
    // 连接线
    if (params.ornament > 0.3) {
      p.push({ type: 'line', x1: graphicCX - size * 0.8, y1: graphicCY, x2: graphicCX + size * 0.8, y2: graphicCY, stroke: colors[0], strokeWidth: 0.5, opacity: 0.15 })
      p.push({ type: 'line', x1: graphicCX, y1: graphicCY - size * 0.8, x2: graphicCX, y2: graphicCY + size * 0.8, stroke: colors[0], strokeWidth: 0.5, opacity: 0.15 })
    }
  } else {
    const halfW = size * 1.3, halfH = size * 0.8
    p.push({ type: 'rect', x: graphicCX - halfW, y: graphicCY - halfH, w: halfW * 2, h: halfH * 2, rx: size * 0.12, stroke: colors[0], strokeWidth: 2 + params.weight * 2, fill: undefined, opacity: 0.5 })
    if (params.complexity > 0.4) {
      p.push({ type: 'rect', x: graphicCX - halfW * 0.5, y: graphicCY - halfH * 0.5, w: halfW, h: halfH, rx: size * 0.08, fill: colors.length > 1 ? colors[1] : colors[0], opacity: 0.3 })
    }
  }

  // 装饰点
  if (params.ornament > 0.4) {
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI * 2 / 4) * i + rng() * 0.2
      const dist = size * 1.5 + rng() * 10
      p.push({ type: 'circle', cx: graphicCX + Math.cos(a) * dist, cy: graphicCY + Math.sin(a) * dist, r: 2 + rng() * 3, fill: colors[i % colors.length], opacity: 0.2 })
    }
  }

  // 分割线
  p.push({ type: 'line', x1: 100, y1: splitY + 5, x2: 400, y2: splitY + 5, stroke: colors.length > 1 ? colors[1] : colors[0], strokeWidth: 0.5, opacity: 0.15 })

  // 文字
  addText(p, brandNameCN, brandNameEN, colors, params, 250, splitY + 60)

  return { primitives: p }
}

// ──── 11. 左右并置 ────
// 左侧图形，右侧文字
export const left_right_juxtapose: StrategyFn = ({ brandNameCN, brandNameEN, params, colors, seed }) => {
  const p: Primitive[] = []
  const rng = rngFn(seed)

  const splitX = 220
  const graphicCX = splitX / 2 + 10

  const size = 30 + params.density * 40
  const rows = Math.round(2 + params.complexity * 3)

  // 左侧图形 — 垂直排列的几何元素
  for (let i = 0; i < rows; i++) {
    const y = 230 + (i - (rows - 1) / 2) * (size * 0.7)
    const r = size * (0.3 + (1 - i / rows) * 0.3 * params.weight)

    if (params.curvature > 0.5) {
      p.push({ type: 'circle', cx: graphicCX, cy: y, r, fill: colors[i % colors.length], opacity: 0.15 + rng() * 0.2 })
      p.push({ type: 'circle', cx: graphicCX, cy: y, r: r * 0.6, stroke: colors[i % colors.length], strokeWidth: 1 + params.weight, fill: undefined, opacity: 0.4 })
    } else {
      p.push({ type: 'rect', x: graphicCX - r, y: y - r, w: r * 2, h: r * 2, rx: r * 0.15, fill: colors[i % colors.length], opacity: 0.15 + rng() * 0.2 })
      p.push({ type: 'rect', x: graphicCX - r * 0.6, y: y - r * 0.6, w: r * 1.2, h: r * 1.2, rx: r * 0.1, stroke: colors[i % colors.length], strokeWidth: 1 + params.weight, fill: undefined, opacity: 0.4 })
    }
  }

  // 右侧文字
  addText(p, brandNameCN, brandNameEN, colors, params, splitX + 40, 225)

  return { primitives: p }
}

// ──── 12. 文字弧形排列 ────
// 品牌名沿弧形排列，中心为图形元素
export const letter_marquee: StrategyFn = ({ brandNameCN, brandNameEN, params, colors, seed }) => {
  const p: Primitive[] = []
  rngFn(seed)

  const arcR = 110 + params.density * 40
  const chars = brandNameCN.split('')
  const charCount = chars.length

  // 弧形排列每个字
  const arcAngle = Math.PI * 0.6 * (0.5 + params.spacing * 0.5)
  const startAngle = -Math.PI / 2 - arcAngle / 2

  for (let i = 0; i < charCount; i++) {
    const t = charCount > 1 ? i / (charCount - 1) : 0.5
    const angle = startAngle + t * arcAngle
    const x = 250 + Math.cos(angle) * arcR
    const y = 210 + Math.sin(angle) * arcR
    p.push({
      type: 'text', content: chars[i], x, y,
      fontSize: 26 + (1 - params.spacing) * 10,
      fontFamily: CN_FONT, fill: colors[0],
      fontWeight: params.weight > 0.5 ? '700' : '500',
      textAnchor: 'middle',
      opacity: 0.9,
    })
  }

  // 中心图形
  const centerSize = 15 + params.complexity * 20
  p.push({
    type: 'circle', cx: 250, cy: 210, r: centerSize,
    stroke: colors[0], strokeWidth: 1.5 + params.weight * 2, fill: undefined, opacity: 0.4,
  })
  p.push({
    type: 'circle', cx: 250, cy: 210,
    r: centerSize * (0.4 + params.ornament * 0.3),
    fill: colors.length > 1 ? colors[1] : colors[0],
    opacity: 0.5,
  })

  // 装饰弧线
  if (params.ornament > 0.3) {
    const subArcAngle = arcAngle * 0.8
    p.push({
      type: 'arc', cx: 250, cy: 210, r: arcR + 15,
      startAngle: startAngle + (arcAngle - subArcAngle) / 2,
      endAngle: startAngle + (arcAngle - subArcAngle) / 2 + subArcAngle,
      stroke: colors.length > 1 ? colors[1] : colors[0],
      strokeWidth: 0.5, fill: undefined, opacity: 0.15,
    })
  }

  // 英文名在底部
  if (brandNameEN) {
    p.push({
      type: 'text', content: brandNameEN, x: 250, y: 400,
      fontSize: 11 + params.spacing * 3, fill: colors.length > 1 ? colors[1] : colors[0],
      fontWeight: '300', textAnchor: 'middle', letterSpacing: 0.1,
      fontFamily: '"Inter","Helvetica Neue",Arial,sans-serif',
    })
  }

  return { primitives: p }
}

// ──── 13. 竖排堆叠 ────
// 中文从上到下竖排排列（传统风格），英文横排
export const vertical_stack: StrategyFn = ({ brandNameCN, brandNameEN, params, colors }) => {
  const p: Primitive[] = []

  const chars = brandNameCN.split('')
  const charSize = 30 + (1 - params.spacing) * 14
  const lineH = charSize * 1.2
  const totalH = chars.length * lineH
  const startY = 250 - totalH / 2

  // 竖排文字
  for (let i = 0; i < chars.length; i++) {
    p.push({
      type: 'text', content: chars[i], x: 180, y: startY + i * lineH + charSize * 0.8,
      fontSize: charSize, fontFamily: CN_FONT, fill: colors[0],
      fontWeight: params.weight > 0.5 ? '700' : '500',
      textAnchor: 'middle',
    })
  }

  // 右侧装饰线
  p.push({
    type: 'line', x1: 220, y1: startY - 10, x2: 220, y2: startY + totalH + 10,
    stroke: colors.length > 1 ? colors[1] : colors[0],
    strokeWidth: 0.5 + params.weight * 1.5,
    opacity: 0.2,
  })

  // 英文名（竖排右侧）
  if (brandNameEN) {
    p.push({
      type: 'text', content: brandNameEN, x: 260, y: 250 + 4,
      fontSize: 11 + params.spacing * 3, fill: colors.length > 1 ? colors[1] : colors[0],
      fontWeight: '300', textAnchor: 'middle', letterSpacing: 0.12,
      fontFamily: '"Inter","Helvetica Neue",Arial,sans-serif',
    })
  }

  // 装饰元素
  if (params.ornament > 0.2) {
    p.push({
      type: 'circle', cx: 130, cy: startY - 20,
      r: 3 + params.ornament * 4,
      fill: colors[0], opacity: 0.2,
    })
    p.push({
      type: 'circle', cx: 130, cy: startY + totalH + 20,
      r: 2 + params.ornament * 3,
      fill: colors.length > 1 ? colors[1] : colors[0],
      opacity: 0.15,
    })
  }

  return { primitives: p }
}

// ──── 14. 文字描边融合 ────
// 文字使用粗描边，笔画之间的间隙相互连接/融合
export const outline_merge: StrategyFn = ({ brandNameCN, brandNameEN, params, colors }) => {
  const p: Primitive[] = []

  const fontSize = 36 + (1 - params.spacing) * 24
  const strokeW = 3 + params.weight * 6

  // 描边文字（模拟融合效果）
  p.push({
    type: 'text', content: brandNameCN, x: 250, y: 240,
    fontSize, fontFamily: CN_FONT, fill: 'none',
    stroke: colors[0], fontWeight: '700',
    textAnchor: 'middle', letterSpacing: 0.08,
    strokeWidth: strokeW,
  })

  // 填充文字（略小，形成嵌套效果）
  p.push({
    type: 'text', content: brandNameCN, x: 250, y: 240,
    fontSize: fontSize * 0.85, fontFamily: CN_FONT,
    fill: colors.length > 1 ? colors[1] : colors[0],
    fontWeight: '700', textAnchor: 'middle', letterSpacing: 0.08,
  })

  // 英文名（横贯装饰线）
  if (brandNameEN) {
    const enSize = 12 + params.spacing * 4
    p.push({
      type: 'text', content: brandNameEN, x: 250, y: 300 + params.ornament * 10,
      fontSize: enSize, fill: colors.length > 1 ? colors[1] : colors[0],
      fontWeight: '300', textAnchor: 'middle', letterSpacing: 0.15,
      fontFamily: '"Inter","Helvetica Neue",Arial,sans-serif',
    })
  }

  // 装饰横线
  if (params.ornament > 0.2) {
    const lineY = 310 + params.ornament * 10
    const lineLen = 80 + params.ornament * 60
    p.push({
      type: 'line', x1: 250 - lineLen / 2, y1: lineY, x2: 250 + lineLen / 2, y2: lineY,
      stroke: colors.length > 1 ? colors[1] : colors[0],
      strokeWidth: 0.5, opacity: 0.2,
    })
  }

  return { primitives: p }
}

// ──── 辅助 ────

function addText(
  p: Primitive[],
  cn: string,
  en: string,
  colors: string[],
  params: { spacing: number; weight: number },
  textX: number,
  textY = 240,
) {
  const fontSize = 28 + (1 - params.spacing) * 14
  p.push({
    type: 'text', content: cn, x: textX, y: textY,
    fontSize, fontFamily: CN_FONT, fill: colors[0],
    fontWeight: params.weight > 0.5 ? '700' : '500',
    textAnchor: 'start', letterSpacing: 0.03 + params.spacing * 0.08,
  })
  if (en) {
    p.push({
      type: 'text', content: en, x: textX, y: textY + fontSize * 0.75,
      fontSize: Math.max(10, fontSize * 0.35), fill: colors.length > 1 ? colors[1] : colors[0],
      fontWeight: '300', letterSpacing: 0.1,
      fontFamily: '"Inter","Helvetica Neue",Arial,sans-serif',
    })
  }
}

function rngFn(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
