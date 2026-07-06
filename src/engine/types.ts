// ============================================================
// LogoDNA 渲染引擎 — 核心类型定义
// ============================================================

// ---- 图元类型 (Primitives) ----

export interface Circle {
  type: 'circle'
  cx: number
  cy: number
  r: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
}

export interface Arc {
  type: 'arc'
  cx: number
  cy: number
  r: number
  startAngle: number // 弧度
  endAngle: number   // 弧度
  stroke?: string
  strokeWidth?: number
  fill?: string
  opacity?: number
}

export interface Rect {
  type: 'rect'
  x: number
  y: number
  w: number
  h: number
  rx?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  rotation?: number
  opacity?: number
}

export interface Line {
  type: 'line'
  x1: number
  y1: number
  x2: number
  y2: number
  stroke: string
  strokeWidth: number
  cap?: 'round' | 'square'
  opacity?: number
}

export interface Polygon {
  type: 'polygon'
  points: [number, number][]
  closed: boolean
  fill?: string
  stroke?: string
  strokeWidth?: number
  rotation?: number
  opacity?: number
}

export interface Path {
  type: 'path'
  d: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
}

export interface Text {
  type: 'text'
  content: string
  x: number
  y: number
  fontSize: number
  fontFamily?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  fontWeight?: string
  textAnchor?: 'start' | 'middle' | 'end'
  letterSpacing?: number
  rotation?: number
  opacity?: number
}

export type Primitive = Circle | Arc | Rect | Line | Polygon | Path | Text

// ---- 策略参数系统 ----

/** 8 维度连续参数空间，所有值范围 0-1 */
export interface StrategyParams {
  complexity: number    // 元素密度：0=极简，1=丰富
  curvature: number     // 曲直程度：0=全是直线，1=全是曲线
  spacing: number       // 间距：0=紧凑，1=疏松
  weight: number        // 线条粗细：0=极细，1=粗重
  asymmetry: number     // 对称性：0=完全对称，1=完全不对称
  ornament: number      // 装饰程度：0=裸元素，1=大量装饰
  density: number       // 留白：0=大量留白，1=密集填充
  rotation: number      // 动态感：0=静止，1=强烈动感
}

export const DEFAULT_PARAMS: StrategyParams = {
  complexity: 0.5,
  curvature: 0.5,
  spacing: 0.5,
  weight: 0.5,
  asymmetry: 0.3,
  ornament: 0.3,
  density: 0.4,
  rotation: 0.2,
}

export interface StrategyInput {
  brandNameCN: string
  brandNameEN: string
  params: StrategyParams
  colors: string[]
  seed: number
}

export interface StrategyOutput {
  primitives: Primitive[]
}

export type StrategyFn = (input: StrategyInput) => StrategyOutput

export type StrategyKey =
  // 几何类
  | 'circle_wrap'
  | 'golden_ratio'
  | 'diagonal_mirror'
  | 'concentric'
  | 'overlap_penetrate'
  | 'grid_dots'
  | 'radial_burst'
  // 文字类
  | 'initial_mark'
  | 'embedded'
  | 'top_bottom_split'
  | 'left_right_juxtapose'
  | 'letter_marquee'
  | 'vertical_stack'
  | 'outline_merge'
  // 抽象类
  | 'negative_space'
  | 'rhythm_repeat'
  | 'deconstruct_offset'
  | 'layer_depth'
  | 'geometric_animal'
  | 'fold_origami'

export const STRATEGY_KEYS: StrategyKey[] = [
  'circle_wrap', 'golden_ratio', 'diagonal_mirror', 'concentric',
  'overlap_penetrate', 'grid_dots', 'radial_burst',
  'initial_mark', 'embedded', 'top_bottom_split',
  'left_right_juxtapose', 'letter_marquee', 'vertical_stack',
  'outline_merge',
  'negative_space', 'rhythm_repeat', 'deconstruct_offset',
  'layer_depth', 'geometric_animal', 'fold_origami',
]

// ---- 品牌调性 ----

export type BrandTone =
  | '极简克制' | '高级轻奢' | '活力元气' | '潮流先锋'
  | '小众个性' | '未来科幻' | '东方雅致' | '赛博酷感'
  | '纯净治愈' | '梦幻浪漫' | '灵动童趣' | '硬核工业'
  | '温润原木' | '大气沉稳'

export const BRAND_TONES: BrandTone[] = [
  '极简克制', '高级轻奢', '活力元气', '潮流先锋',
  '小众个性', '未来科幻', '东方雅致', '赛博酷感',
  '纯净治愈', '梦幻浪漫', '灵动童趣', '硬核工业',
  '温润原木', '大气沉稳',
]

export interface ToneMapEntry {
  label: string
  params: Partial<StrategyParams>
  preferredStrategies: StrategyKey[]
  colorPalettes: string[][]
}

// ---- 请求/响应 ----

export interface LogoRequest {
  brandNameCN: string
  brandNameEN: string
  philosophy: string
  industry: string
  products: string
  tone: BrandTone
  structure: 'pure_text' | 'pure_graphic' | 'text_graphic'
  colorRequirement: 'single' | 'dual' | 'triple' | 'quad' | 'custom'
  customColors?: string[]
}

export interface LogoVariant {
  label: '方案A' | '方案B' | '方案C'
  strategy: StrategyKey
  svg: string
}

export interface LogoResponse {
  variants: LogoVariant[]
  generatedAt: string
}

// ---- AI 输出 Schema ----

export interface AIDecision {
  variants: {
    strategy: StrategyKey
    params: Partial<StrategyParams>
    offset: Partial<StrategyParams>
    colors: string[]
  }[]
}
