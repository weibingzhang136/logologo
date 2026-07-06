// ============================================================
// 几何类构图策略 — 7 种
// 使用基础几何形状构建 LOGO 视觉主体
// ============================================================

import type { StrategyFn, Primitive } from '../types'

const CX = 250, CY = 220
const MID = 250
const CN_FONT = '"Noto Sans SC","Noto Sans CJK SC","Source Han Sans CN",sans-serif'

// ──── 1. 圆形环绕 ────
// 中心放置品牌名，周围沿圆环分布装饰元素
export const circle_wrap: StrategyFn = ({ brandNameCN, brandNameEN, params, colors, seed }) => {
  const p: Primitive[] = []
  const rng = rngFn(seed)

  const count = Math.round(6 + params.complexity * 8)
  const ringR = 55 + params.density * 45
  const elemSize = 3 + params.weight * 12

  // 圆环元素
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + params.rotation * Math.PI * 2
    const x = CX + Math.cos(angle) * ringR
    const y = CY + Math.sin(angle) * ringR

    if (params.curvature > 0.6 && i % 2 === 0) {
      // 弧形元素
      const span = 0.3 + rng() * 0.4
      p.push({
        type: 'arc', cx: x, cy: y, r: elemSize * 0.8,
        startAngle: 0, endAngle: Math.PI * span,
        stroke: colors[i % colors.length],
        strokeWidth: 1.5 + params.weight * 2,
        fill: undefined,
        opacity: 0.5 + rng() * 0.4,
      })
    } else {
      p.push({
        type: 'circle', cx: x, cy: y,
        r: elemSize * (0.4 + rng() * 0.6),
        fill: colors[i % colors.length],
        opacity: 0.4 + rng() * 0.5,
      })
    }
  }

  // 外环描边（低复杂性时不要）
  if (params.complexity > 0.3 && params.ornament > 0.2) {
    p.push({
      type: 'circle', cx: CX, cy: CY,
      r: ringR + elemSize + 5,
      stroke: colors[colors.length > 1 ? 1 : 0],
      strokeWidth: 0.5 + params.weight * 1.5,
      fill: undefined,
      opacity: 0.2,
    })
  }

  // 中心装饰（高复杂性时）
  if (params.complexity > 0.5) {
    p.push({
      type: 'circle', cx: CX, cy: CY,
      r: 6 + params.ornament * 10,
      fill: colors[0],
      opacity: 0.3,
    })
  }

  addText(p, brandNameCN, brandNameEN, colors, params)
  return { primitives: p }
}

// ──── 2. 黄金分割 ────
// 按黄金比例分割画布，图形占据较大区域，文字在较小区域
export const golden_ratio: StrategyFn = ({ brandNameCN, brandNameEN, params, colors, seed }) => {
  const p: Primitive[] = []
  const rng = rngFn(seed)
  const isVertical = params.asymmetry < 0.5
  const ratio = 0.618

  if (isVertical) {
    // 上图形下文字
    const splitY = 500 * ratio
    const graphicH = splitY - 40
    const graphicW = 500 - 80

    // 主图形
    const cx = 250, cy = splitY / 2
    const size = Math.min(graphicW, graphicH) * 0.35

    if (params.curvature > 0.5) {
      p.push({ type: 'circle', cx, cy, r: size, fill: colors[0], opacity: 0.08 })
      p.push({ type: 'circle', cx, cy, r: size * 0.7, stroke: colors[0], strokeWidth: 2 + params.weight * 2, fill: undefined })
      p.push({ type: 'circle', cx, cy, r: size * 0.3, fill: colors[colors.length > 1 ? 1 : 0], opacity: 0.6 })
    } else {
      const halfW = size * 1.2
      const halfH = size * 0.8
      p.push({ type: 'rect', x: cx - halfW, y: cy - halfH, w: halfW * 2, h: halfH * 2, rx: size * 0.1 + params.curvature * size * 0.3, fill: colors[0], opacity: 0.08 })
      p.push({ type: 'rect', x: cx - halfW * 0.6, y: cy - halfH * 0.6, w: halfW * 1.2, h: halfH * 1.2, rx: size * 0.05 + params.curvature * size * 0.2, stroke: colors[0], strokeWidth: 2 + params.weight * 2, fill: undefined })
    }

    // 装饰点
    if (params.ornament > 0.3) {
      for (let i = 0; i < 3 + rng() * 3; i++) {
        p.push({
          type: 'circle', cx: 80 + rng() * 340, cy: 20 + rng() * (splitY - 60),
          r: 2 + rng() * 4,
          fill: colors[rng() > 0.5 ? 1 : 0],
          opacity: 0.15 + rng() * 0.2,
        })
      }
    }

    // 文字在下方
    addTextCentered(p, brandNameCN, brandNameEN, colors, params, 250, splitY + 60)
  } else {
    // 左图形右文字
    const splitX = 500 * ratio
    const cx = splitX / 2, cy = 250
    const size = Math.min(splitX - 60, 400) * 0.35

    if (params.curvature > 0.5) {
      p.push({ type: 'circle', cx, cy, r: size, fill: colors[0], opacity: 0.08 })
      p.push({ type: 'circle', cx, cy, r: size * 0.7, stroke: colors[0], strokeWidth: 2 + params.weight * 2, fill: undefined })
    } else {
      p.push({ type: 'rect', x: cx - size * 1.2, y: cy - size * 0.8, w: size * 2.4, h: size * 1.6, rx: size * 0.15, fill: colors[0], opacity: 0.08 })
      p.push({ type: 'rect', x: cx - size * 0.7, y: cy - size * 0.5, w: size * 1.4, h: size, rx: size * 0.1, stroke: colors[0], strokeWidth: 2 + params.weight * 2, fill: undefined })
    }

    if (params.ornament > 0.3) {
      const dotColor = colors.length > 2 ? colors[2] : (colors.length > 1 ? colors[1] : colors[0])
      p.push({ type: 'circle', cx: cx - size * 0.8, cy: cy + size * 0.8, r: 4, fill: dotColor, opacity: 0.4 })
      p.push({ type: 'circle', cx: cx + size * 0.8, cy: cy - size * 0.8, r: 3, fill: dotColor, opacity: 0.3 })
    }

    addText(p, brandNameCN, brandNameEN, colors, params, splitX + 50)
  }

  return { primitives: p }
}

// ──── 3. 对角镜像 ────
// 沿对角线镜像对称，一侧图形一侧文字
export const diagonal_mirror: StrategyFn = ({ brandNameCN, brandNameEN, params, colors, seed }) => {
  const p: Primitive[] = []
  const rng = rngFn(seed)
  const isTopLeft = params.asymmetry < 0.5

  const cx = isTopLeft ? 150 : 350
  const cy = isTopLeft ? 160 : 340
  const size = 40 + params.density * 40

  // 主图形 — 使用多边形制造不对称感
  const sides = params.curvature > 0.5 ? 8 : 3 + Math.round(params.complexity * 3)
  const pts: [number, number][] = []
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2
    const r = size * (0.6 + rng() * 0.4 * params.asymmetry)
    pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r])
  }

  p.push({ type: 'polygon', points: pts, closed: true, fill: colors[0], opacity: 0.1 })
  p.push({ type: 'polygon', points: pts, closed: true, stroke: colors[0], strokeWidth: 2 + params.weight * 2, fill: undefined })

  // 角落装饰线条
  const cornerX = isTopLeft ? 350 : 150
  const cornerY = isTopLeft ? 340 : 160
  const lineLen = 30 + params.ornament * 40
  p.push({
    type: 'line', x1: cornerX, y1: cornerY,
    x2: cornerX + lineLen * 0.7, y2: cornerY - lineLen * 0.7,
    stroke: colors.length > 1 ? colors[1] : colors[0],
    strokeWidth: 1 + params.weight,
    opacity: 0.3,
  })
  if (params.ornament > 0.3) {
    p.push({ type: 'line', x1: cornerX, y1: cornerY, x2: cornerX - lineLen * 0.3, y2: cornerY + lineLen * 0.5, stroke: colors[1 % colors.length], strokeWidth: 1, opacity: 0.2 })
  }

  // 对角线引导线
  if (params.ornament > 0.4) {
    p.push({ type: 'line', x1: 60, y1: 60, x2: 440, y2: 440, stroke: colors[colors.length > 1 ? 1 : 0], strokeWidth: 0.5, opacity: 0.1 })
  }

  addTextCentered(p, brandNameCN, brandNameEN, colors, params, isTopLeft ? 350 : 150, isTopLeft ? 410 : 200)

  return { primitives: p }
}

// ──── 4. 同心扩展 ────
// 多层同心形状向外扩展，文字在中心或底部
export const concentric: StrategyFn = ({ brandNameCN, brandNameEN, params, colors, seed }) => {
  const p: Primitive[] = []
  const rng = rngFn(seed)

  const layers = Math.round(3 + params.complexity * 5)
  const useCircle = params.curvature > 0.4

  for (let i = layers; i >= 0; i--) {
    const t = i / layers
    const r = 30 + t * 170
    const color = colors[i % colors.length]
    const opacity = 0.04 + t * 0.08 * (1 - params.ornament * 0.5)

    if (useCircle) {
      p.push({ type: 'circle', cx: 250, cy: 200, r, stroke: color, strokeWidth: 0.5 + t * params.weight * 2, fill: undefined, opacity })
    } else {
      p.push({ type: 'rect', x: 250 - r, y: 200 - r * 0.8, w: r * 2, h: r * 1.6, rx: r * 0.05, stroke: color, strokeWidth: 0.5 + t * params.weight * 2, fill: undefined, opacity })
    }

    // 在环上加点装饰
    if (params.ornament > 0.4 && i % 2 === 0) {
      const dotCount = Math.round(4 + rng() * 4)
      for (let j = 0; j < dotCount; j++) {
        const a = (Math.PI * 2 / dotCount) * j + rng() * 0.3
        p.push({ type: 'circle', cx: 250 + Math.cos(a) * r, cy: 200 + Math.sin(a) * r, r: 1.5 + rng() * 2, fill: color, opacity: 0.3 })
      }
    }
  }

  // 中心圆点
  p.push({ type: 'circle', cx: 250, cy: 200, r: 6 + params.weight * 6, fill: colors[0], opacity: params.density > 0.5 ? 0.6 : 0.3 })

  addTextCentered(p, brandNameCN, brandNameEN, colors, params, 250, 390)

  return { primitives: p }
}

// ──── 5. 重叠穿透 ────
// 2-3 个几何体重叠，交叉点形成视觉焦点
export const overlap_penetrate: StrategyFn = ({ brandNameCN, brandNameEN, params, colors, seed }) => {
  const p: Primitive[] = []
  const rng = rngFn(seed)

  const count = 2 + Math.round(params.complexity * 1)
  const baseSize = 80 + params.density * 40
  const useCircle = params.curvature > 0.4

  const positions = [
    { x: 250 - baseSize * 0.35, y: 200 - baseSize * 0.2 },
    { x: 250 + baseSize * 0.35, y: 200 + baseSize * 0.2 },
    { x: 250, y: 200 - baseSize * 0.5 },
  ]

  for (let i = 0; i < count; i++) {
    const pos = positions[i]
    const size = baseSize * (1 - i * 0.1)
    const color = colors[i % colors.length]
    const opacity = 0.15 + params.ornament * 0.15

    if (useCircle) {
      p.push({ type: 'circle', cx: pos.x, cy: pos.y, r: size, fill: color, opacity })
    } else {
      p.push({ type: 'rect', x: pos.x - size, y: pos.y - size * 0.7, w: size * 2, h: size * 1.4, rx: size * 0.1, fill: color, opacity })
    }
    // 描边
    if (useCircle) {
      p.push({ type: 'circle', cx: pos.x, cy: pos.y, r: size, stroke: color, strokeWidth: 1.5 + params.weight * 2, fill: undefined, opacity: 0.6 })
    } else {
      p.push({ type: 'rect', x: pos.x - size, y: pos.y - size * 0.7, w: size * 2, h: size * 1.4, rx: size * 0.1, stroke: color, strokeWidth: 1.5 + params.weight * 2, fill: undefined, opacity: 0.6 })
    }
  }

  // 重叠区域装饰（交叉点）
  p.push({ type: 'circle', cx: 250, cy: 210, r: 5 + params.ornament * 8, fill: colors[0], opacity: 0.4 })
  if (params.ornament > 0.4) {
    p.push({ type: 'circle', cx: 250 + rng() * 20 - 10, cy: 200 + rng() * 20 - 10, r: 3, fill: colors[colors.length > 1 ? 1 : 0], opacity: 0.5 })
  }

  addTextCentered(p, brandNameCN, brandNameEN, colors, params, 250, 400)

  return { primitives: p }
}

// ──── 6. 网格点阵 ────
// 点阵排列形成图形（类似 QR 码风格）
export const grid_dots: StrategyFn = ({ brandNameCN, brandNameEN, params, colors, seed }) => {
  const p: Primitive[] = []
  const rng = rngFn(seed)

  const cols = Math.round(8 + params.complexity * 8)
  const rows = Math.round(6 + params.complexity * 4)
  const spacing = Math.min(220 / cols, 160 / rows)
  const offsetX = 250 - (cols * spacing) / 2
  const offsetY = 180 - (rows * spacing) / 2
  const dotR = spacing * 0.25 * (0.5 + params.weight * 0.5)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // 使用确定性规则来决定哪些点出现
      const active = (r * 7 + c * 13 + seed) % 5 < (2 + Math.round(params.density * 2))
      if (!active) continue

      const x = offsetX + c * spacing
      const y = offsetY + r * spacing

      if (params.curvature > 0.6 && rng() > 0.7) {
        p.push({
          type: 'rect', x: x - dotR, y: y - dotR, w: dotR * 2, h: dotR * 2, rx: dotR * 0.3,
          fill: colors[(r * cols + c) % colors.length],
          opacity: 0.4 + rng() * 0.4,
        })
      } else {
        p.push({
          type: 'circle', cx: x, cy: y, r: dotR * (0.6 + rng() * 0.4),
          fill: colors[(r * cols + c) % colors.length],
          opacity: 0.4 + rng() * 0.4,
        })
      }
    }
  }

  addTextCentered(p, brandNameCN, brandNameEN, colors, params, 250, 400)

  return { primitives: p }
}

// ──── 7. 放射发散 ────
// 线条从中心点向外放射，文字偏移放置
export const radial_burst: StrategyFn = ({ brandNameCN, brandNameEN, params, colors, seed }) => {
  const p: Primitive[] = []
  const rng = rngFn(seed)

  const cx = 250, cy = 200
  const rays = Math.round(8 + params.complexity * 16)
  const rayLen = 80 + params.density * 80
  const rotation = params.rotation * Math.PI

  for (let i = 0; i < rays; i++) {
    const angle = (Math.PI * 2 / rays) * i + rotation + (params.asymmetry > 0.5 ? rng() * 0.3 : 0)
    const x1 = cx + Math.cos(angle) * (10 + params.ornament * 20)
    const y1 = cy + Math.sin(angle) * (10 + params.ornament * 20)
    // 射线长度带变化
    const len = rayLen * (0.5 + rng() * 0.5 * (1 + params.asymmetry * 0.5))
    const x2 = cx + Math.cos(angle) * len
    const y2 = cy + Math.sin(angle) * len

    p.push({
      type: 'line', x1, y1, x2, y2,
      stroke: colors[i % colors.length],
      strokeWidth: 0.5 + params.weight * 2.5 * rng(),
      opacity: 0.2 + rng() * 0.3,
    })
  }

  // 中心渐变圆
  p.push({ type: 'circle', cx, cy, r: 5 + params.weight * 10, fill: colors[0], opacity: 0.5 })
  p.push({ type: 'circle', cx, cy, r: 3 + params.weight * 6, fill: colors[colors.length > 1 ? 1 : 0], opacity: 0.7 })

  // 外圈（高复杂性时）
  if (params.complexity > 0.6) {
    p.push({ type: 'circle', cx, cy, r: rayLen + 10, stroke: colors[0], strokeWidth: 0.5, fill: undefined, opacity: 0.1 })
  }

  addTextCentered(p, brandNameCN, brandNameEN, colors, params, 250, 410)

  return { primitives: p }
}

// ──── 辅助函数 ────

function addText(
  p: Primitive[],
  cn: string,
  en: string,
  colors: string[],
  params: { spacing: number; weight: number },
  textX = MID,
  textY = 380,
) {
  const fontSize = 24 + (1 - params.spacing) * 16
  p.push({
    type: 'text', content: cn, x: textX, y: textY,
    fontSize, fontFamily: CN_FONT, fill: colors[0],
    fontWeight: params.weight > 0.5 ? '700' : '500',
    textAnchor: 'middle', letterSpacing: 0.03 + params.spacing * 0.08,
  })
  if (en) {
    p.push({
      type: 'text', content: en, x: textX, y: textY + fontSize * 0.8,
      fontSize: Math.max(10, fontSize * 0.38), fill: colors.length > 1 ? colors[1] : colors[0],
      fontWeight: '300', textAnchor: 'middle', letterSpacing: 0.08,
      fontFamily: '"Inter","Helvetica Neue",Arial,sans-serif',
    })
  }
}

function addTextCentered(
  p: Primitive[],
  cn: string,
  en: string,
  colors: string[],
  params: { spacing: number; weight: number },
  cx: number,
  baseY: number,
) {
  const fontSize = 22 + (1 - params.spacing) * 14
  p.push({
    type: 'text', content: cn, x: cx, y: baseY,
    fontSize, fontFamily: CN_FONT, fill: colors[0],
    fontWeight: params.weight > 0.5 ? '700' : '500',
    textAnchor: 'middle', letterSpacing: 0.03 + params.spacing * 0.08,
  })
  if (en) {
    p.push({
      type: 'text', content: en, x: cx, y: baseY + fontSize * 0.8,
      fontSize: Math.max(10, fontSize * 0.38), fill: colors.length > 1 ? colors[1] : colors[0],
      fontWeight: '300', textAnchor: 'middle', letterSpacing: 0.08,
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
