// ============================================================
// 抽象类构图策略 — 6 种
// 负空间、节奏、解构、层次、具象符号、折纸
// ============================================================

import type { StrategyFn, Primitive } from '../types'

const CN_FONT = '"Noto Sans SC","Noto Sans CJK SC","Source Han Sans CN",sans-serif'

// ──── 15. 负空间 ────
// 在图形之间的空隙中形成隐藏形状
export const negative_space: StrategyFn = ({ brandNameCN, brandNameEN, params, colors, seed }) => {
  const p: Primitive[] = []
  rngFn(seed)

  const useCircle = params.curvature > 0.4
  const size = 70 + params.density * 40

  // 主背景形状
  if (useCircle) {
    p.push({ type: 'circle', cx: 250, cy: 200, r: size * 1.2, fill: colors[0], opacity: 0.08 })
  } else {
    p.push({ type: 'rect', x: 250 - size * 1.2, y: 200 - size * 1.2, w: size * 2.4, h: size * 2.4, rx: size * 0.1, fill: colors[0], opacity: 0.08 })
  }

  // 两个重叠的形状，中间留出负空间条
  const overlapR = size * 0.7
  const offset = overlapR * 0.4 * (1 + params.asymmetry * 0.3)

  p.push({ type: 'circle', cx: 250 - offset, cy: 200, r: overlapR, fill: colors[0], opacity: 0.12 })
  p.push({ type: 'circle', cx: 250 + offset, cy: 200, r: overlapR, fill: colors[0], opacity: 0.12 })

  // 负空间区域的强调线
  p.push({
    type: 'line', x1: 250 - offset * 0.5, y1: 200 - overlapR * 0.6,
    x2: 250 + offset * 0.5, y2: 200 - overlapR * 0.6,
    stroke: colors.length > 1 ? colors[1] : colors[0],
    strokeWidth: 1 + params.weight,
    opacity: 0.3,
  })
  p.push({
    type: 'line', x1: 250 - offset * 0.5, y1: 200 + overlapR * 0.6,
    x2: 250 + offset * 0.5, y2: 200 + overlapR * 0.6,
    stroke: colors.length > 1 ? colors[1] : colors[0],
    strokeWidth: 1 + params.weight,
    opacity: 0.3,
  })

  // 底部文字
  addTextCentered(p, brandNameCN, brandNameEN, colors, params, 250, 390)

  return { primitives: p }
}

// ──── 16. 节奏重复 ────
// 单个几何元素重复排列，形成节奏感和渐变
export const rhythm_repeat: StrategyFn = ({ brandNameCN, brandNameEN, params, colors, seed }) => {
  const p: Primitive[] = []
  const rng = rngFn(seed)

  const count = Math.round(4 + params.complexity * 5)
  const useCircle = params.curvature > 0.4
  const baseSize = 12 + params.weight * 12
  const spacing = 30 + (1 - params.density) * 20

  for (let i = 0; i < count; i++) {
    const t = i / Math.max(count - 1, 1)
    const x = 150 + i * spacing + params.asymmetry * 20 * Math.sin(t * Math.PI)
    const y = 200 + params.rotation * 40 * Math.sin(t * Math.PI * 2)
    const s = baseSize * (1 - t * 0.4 * params.ornament) * (0.8 + rng() * 0.4)
    const color = colors[i % colors.length]
    const opacity = 0.5 - t * 0.3

    if (useCircle) {
      p.push({ type: 'circle', cx: x, cy: y, r: s, fill: color, opacity })
    } else {
      const rot = t * 45 * params.rotation
      p.push({ type: 'rect', x: x - s * 0.7, y: y - s * 0.7, w: s * 1.4, h: s * 1.4, rx: s * 0.1, fill: color, opacity, rotation: rot })
    }
  }

  // 连线
  if (params.ornament > 0.2) {
    for (let i = 0; i < count - 1; i++) {
      const x1 = 150 + i * spacing
      const y1 = 200
      const x2 = 150 + (i + 1) * spacing
      const y2 = 200
      p.push({ type: 'line', x1, y1, x2, y2, stroke: colors[0], strokeWidth: 0.5, opacity: 0.08 })
    }
  }

  addTextCentered(p, brandNameCN, brandNameEN, colors, params, 250, 390)

  return { primitives: p }
}

// ──── 17. 解构偏移 ────
// 标准形状被拆分并错位，制造动态感和现代感
export const deconstruct_offset: StrategyFn = ({ brandNameCN, brandNameEN, params, colors, seed }) => {
  const p: Primitive[] = []
  const rng = rngFn(seed)

  const size = 60 + params.density * 30
  const pieces = Math.round(3 + params.complexity * 3)
  const offsetRange = params.asymmetry * 30

  // 原始形状（半透明背景）
  p.push({ type: 'circle', cx: 250, cy: 200, r: size, fill: colors[0], opacity: 0.04 })
  p.push({ type: 'rect', x: 250 - size * 0.8, y: 200 - size * 0.8, w: size * 1.6, h: size * 1.6, rx: size * 0.08, fill: colors[0], opacity: 0.04 })

  // 拆分的片段
  for (let i = 0; i < pieces; i++) {
    const angle = (Math.PI * 2 / pieces) * i + params.rotation * Math.PI
    const offsetX = Math.cos(angle) * offsetRange * (0.5 + rng() * 0.5)
    const offsetY = Math.sin(angle) * offsetRange * (0.5 + rng() * 0.5)
    const pieceSize = size * (0.3 + rng() * 0.3 * params.ornament)
    const color = colors[i % colors.length]

    p.push({
      type: 'circle', cx: 250 + offsetX, cy: 200 + offsetY, r: pieceSize,
      fill: color,
      opacity: 0.2 + rng() * 0.2,
    })
    p.push({
      type: 'circle', cx: 250 + offsetX, cy: 200 + offsetY, r: pieceSize,
      stroke: color, strokeWidth: 1 + params.weight,
      fill: undefined,
      opacity: 0.5,
    })
  }

  addTextCentered(p, brandNameCN, brandNameEN, colors, params, 250, 390)

  return { primitives: p }
}

// ──── 18. 层次深度 ────
// 多层形状偏移堆叠，通过颜色和偏移创造深度
export const layer_depth: StrategyFn = ({ brandNameCN, brandNameEN, params, colors, seed }) => {
  const p: Primitive[] = []
  rngFn(seed)

  const layers = Math.round(3 + params.complexity * 3)
  const useCircle = params.curvature > 0.4
  const baseSize = 70 + params.density * 30

  for (let i = layers - 1; i >= 0; i--) {
    const t = i / Math.max(layers - 1, 1)
    const offsetX = (i - (layers - 1) / 2) * (4 + params.asymmetry * 6)
    const offsetY = (i - (layers - 1) / 2) * (3 + params.rotation * 5)
    const s = baseSize * (1 + t * 0.3)
    const color = colors[i % colors.length]
    const opacity = 0.05 + (1 - t) * 0.15

    if (useCircle) {
      p.push({
        type: 'circle', cx: 250 + offsetX, cy: 200 + offsetY, r: s,
        fill: color, opacity,
        stroke: color, strokeWidth: 0.3 + t * params.weight * 1.5,
      })
    } else {
      p.push({
        type: 'rect', x: 250 + offsetX - s, y: 200 + offsetY - s * 0.8,
        w: s * 2, h: s * 1.6, rx: s * 0.12,
        fill: color, opacity,
        stroke: color, strokeWidth: 0.3 + t * params.weight * 1.5,
      })
    }
  }

  // 文字在底层（最上层显示）
  addTextCentered(p, brandNameCN, brandNameEN, colors, params, 250, 390)

  return { primitives: p }
}

// ──── 19. 几何具象 ────
// 用基础几何形状组合成简化的具象图形（根据行业相关的抽象符号）
export const geometric_animal: StrategyFn = ({ brandNameCN, brandNameEN, params, colors, seed }) => {
  const p: Primitive[] = []
  const rng = rngFn(seed)

  // 使用抽象几何组合 — 类似于极简风格的图标
  // 核心：一个大圆 + 几个小圆/线段形成符号感
  const baseR = 45 + params.density * 20
  const useCircle = params.curvature > 0.4

  // 主形状
  if (useCircle) {
    p.push({ type: 'circle', cx: 250, cy: 190, r: baseR, fill: colors[0], opacity: 0.08 })
    p.push({ type: 'circle', cx: 250, cy: 190, r: baseR * 0.75, stroke: colors[0], strokeWidth: 2 + params.weight * 2, fill: undefined, opacity: 0.4 })
  } else {
    const half = baseR * 0.8
    p.push({ type: 'rect', x: 250 - half, y: 190 - half, w: half * 2, h: half * 2, rx: baseR * 0.15, fill: colors[0], opacity: 0.08 })
    p.push({ type: 'rect', x: 250 - half * 0.7, y: 190 - half * 0.7, w: half * 1.4, h: half * 1.4, rx: baseR * 0.1, stroke: colors[0], strokeWidth: 2 + params.weight * 2, fill: undefined, opacity: 0.4 })
  }

  // 内部装饰—小圆/线条组（抽象代表行业特征）
  const innerCount = Math.round(2 + params.complexity * 3)
  for (let i = 0; i < innerCount; i++) {
    const angle = (Math.PI * 2 / innerCount) * i + rng() * 0.3
    const dist = baseR * 0.3 * (0.5 + rng() * 0.5)
    const x = 250 + Math.cos(angle) * dist
    const y = 190 + Math.sin(angle) * dist
    const r = 3 + rng() * 5 * params.weight

    p.push({ type: 'circle', cx: x, cy: y, r, fill: colors[i % colors.length], opacity: 0.4 + rng() * 0.3 })
  }

  // 小装饰：上方/侧方点缀
  if (params.ornament > 0.3) {
    const dotY = 190 - baseR - 10
    p.push({ type: 'circle', cx: 250, cy: dotY, r: 4 + params.ornament * 3, fill: colors[colors.length > 1 ? 1 : 0], opacity: 0.4 })
  }

  addTextCentered(p, brandNameCN, brandNameEN, colors, params, 250, 390)

  return { primitives: p }
}

// ──── 20. 折纸折叠 ────
// 多边形模拟折纸效果，分割面 + 不同颜色
export const fold_origami: StrategyFn = ({ brandNameCN, brandNameEN, params, colors, seed }) => {
  const p: Primitive[] = []
  const rng = rngFn(seed)

  const size = 70 + params.density * 30
  const cx = 250, cy = 200

  // 用 3-5 个多边形构成折纸效果
  const panels = Math.round(3 + params.complexity * 2)
  const angleStep = Math.PI * 2 / panels

  for (let i = 0; i < panels; i++) {
    const startA = angleStep * i + params.rotation * Math.PI * 0.5
    const endA = angleStep * (i + 1) + params.rotation * Math.PI * 0.5

    // 每个面板是一个三角形（中心到两个边点）
    const r1 = size * (0.7 + rng() * 0.3 * params.asymmetry)
    const r2 = size * (0.7 + rng() * 0.3 * params.asymmetry)

    const pts: [number, number][] = [
      [cx, cy],
      [cx + Math.cos(startA) * r1, cy + Math.sin(startA) * r1],
      [cx + Math.cos(endA) * r2, cy + Math.sin(endA) * r2],
    ]

    const color = colors[i % colors.length]
    p.push({
      type: 'polygon', points: pts, closed: true,
      fill: color,
      opacity: 0.15 + (params.ornament * 0.2),
    })
    // 面板描边（折痕线）
    p.push({
      type: 'polygon', points: pts, closed: true,
      stroke: color, strokeWidth: 1 + params.weight * 2,
      fill: undefined,
      opacity: 0.4 + params.ornament * 0.3,
    })
  }

  // 中心点强调
  if (params.ornament > 0.2) {
    p.push({ type: 'circle', cx, cy, r: 3 + params.ornament * 3, fill: colors[0], opacity: 0.4 })
  }

  addTextCentered(p, brandNameCN, brandNameEN, colors, params, 250, 390)

  return { primitives: p }
}

// ──── 辅助 ────

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
