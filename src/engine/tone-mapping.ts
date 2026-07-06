// ============================================================
// 品牌调性 → 参数空间映射
// 14 个调性各对应不同的参数偏好区间和推荐策略
// ============================================================

import type { ToneMapEntry, BrandTone } from './types'

/** 调性映射表（参数值范围 0-1） */
export const TONE_MAP: Record<BrandTone, ToneMapEntry> = {
  '极简克制': {
    label: '极简克制',
    params: { complexity: 0.15, curvature: 0.5, spacing: 0.7, weight: 0.5, asymmetry: 0.2, ornament: 0.05, density: 0.2, rotation: 0.1 },
    preferredStrategies: ['circle_wrap', 'golden_ratio', 'negative_space', 'grid_dots', 'left_right_juxtapose'],
    colorPalettes: [['#333333', '#F5F5F5'], ['#1A1A2E', '#E8E8E8'], ['#2C2C2C', '#FFFFFF']],
  },
  '高级轻奢': {
    label: '高级轻奢',
    params: { complexity: 0.4, curvature: 0.7, spacing: 0.6, weight: 0.4, asymmetry: 0.3, ornament: 0.4, density: 0.5, rotation: 0.1 },
    preferredStrategies: ['initial_mark', 'golden_ratio', 'concentric', 'layer_depth', 'fold_origami'],
    colorPalettes: [['#C9A94E', '#1A1A2E'], ['#8B7355', '#F5F0E8'], ['#D4AF37', '#2C2C2C']],
  },
  '活力元气': {
    label: '活力元气',
    params: { complexity: 0.6, curvature: 0.7, spacing: 0.5, weight: 0.6, asymmetry: 0.4, ornament: 0.5, density: 0.6, rotation: 0.5 },
    preferredStrategies: ['radial_burst', 'rhythm_repeat', 'overlap_penetrate', 'deconstruct_offset', 'top_bottom_split'],
    colorPalettes: [['#FF6B35', '#004E89'], ['#FF4B4B', '#FFD93D'], ['#FF7E67', '#6C5B7B']],
  },
  '潮流先锋': {
    label: '潮流先锋',
    params: { complexity: 0.7, curvature: 0.3, spacing: 0.4, weight: 0.7, asymmetry: 0.7, ornament: 0.6, density: 0.7, rotation: 0.6 },
    preferredStrategies: ['deconstruct_offset', 'outline_merge', 'diagonal_mirror', 'fold_origami', 'overlap_penetrate'],
    colorPalettes: [['#000000', '#FF0055'], ['#1A1A2E', '#E94560'], ['#0F3460', '#E94560']],
  },
  '小众个性': {
    label: '小众个性',
    params: { complexity: 0.5, curvature: 0.6, spacing: 0.5, weight: 0.4, asymmetry: 0.6, ornament: 0.5, density: 0.5, rotation: 0.5 },
    preferredStrategies: ['negative_space', 'deconstruct_offset', 'diagonal_mirror', 'letter_marquee', 'geometric_animal'],
    colorPalettes: [['#2D4059', '#EA5455'], ['#3B185F', '#C060A1'], ['#1B1A17', '#E6D5B8']],
  },
  '未来科幻': {
    label: '未来科幻',
    params: { complexity: 0.6, curvature: 0.2, spacing: 0.5, weight: 0.3, asymmetry: 0.5, ornament: 0.4, density: 0.6, rotation: 0.4 },
    preferredStrategies: ['grid_dots', 'radial_burst', 'concentric', 'overlap_penetrate', 'fold_origami'],
    colorPalettes: [['#0A0A2E', '#2A5CFF'], ['#1A1A3E', '#00D4FF'], ['#0D0D0D', '#00FF88']],
  },
  '东方雅致': {
    label: '东方雅致',
    params: { complexity: 0.3, curvature: 0.8, spacing: 0.6, weight: 0.4, asymmetry: 0.3, ornament: 0.25, density: 0.4, rotation: 0.1 },
    preferredStrategies: ['vertical_stack', 'circle_wrap', 'initial_mark', 'golden_ratio', 'negative_space'],
    colorPalettes: [['#8B0000', '#F5F0E8'], ['#2F4F4F', '#D4C5A9'], ['#800020', '#E8D5B7']],
  },
  '赛博酷感': {
    label: '赛博酷感',
    params: { complexity: 0.7, curvature: 0.2, spacing: 0.4, weight: 0.5, asymmetry: 0.6, ornament: 0.5, density: 0.7, rotation: 0.6 },
    preferredStrategies: ['grid_dots', 'outline_merge', 'diagonal_mirror', 'radial_burst', 'deconstruct_offset'],
    colorPalettes: [['#FF006E', '#00F5FF'], ['#8338EC', '#00F5FF'], ['#0A0A2E', '#FF006E', '#00F5FF']],
  },
  '纯净治愈': {
    label: '纯净治愈',
    params: { complexity: 0.2, curvature: 0.8, spacing: 0.8, weight: 0.3, asymmetry: 0.2, ornament: 0.15, density: 0.25, rotation: 0.05 },
    preferredStrategies: ['circle_wrap', 'rhythm_repeat', 'top_bottom_split', 'embedded', 'left_right_juxtapose'],
    colorPalettes: [['#B8E6D0', '#4A90A4'], ['#E8F5E9', '#81C784'], ['#D4E7E5', '#6DB3A8']],
  },
  '梦幻浪漫': {
    label: '梦幻浪漫',
    params: { complexity: 0.5, curvature: 0.9, spacing: 0.6, weight: 0.3, asymmetry: 0.4, ornament: 0.5, density: 0.5, rotation: 0.3 },
    preferredStrategies: ['letter_marquee', 'concentric', 'layer_depth', 'circle_wrap', 'initial_mark'],
    colorPalettes: [['#FFB6C1', '#DDA0DD'], ['#FF69B4', '#BA55D3'], ['#E8A0BF', '#C76F9D']],
  },
  '灵动童趣': {
    label: '灵动童趣',
    params: { complexity: 0.6, curvature: 0.7, spacing: 0.5, weight: 0.6, asymmetry: 0.5, ornament: 0.6, density: 0.5, rotation: 0.6 },
    preferredStrategies: ['geometric_animal', 'overlap_penetrate', 'rhythm_repeat', 'deconstruct_offset', 'radial_burst'],
    colorPalettes: [['#FF6B6B', '#4ECDC4', '#FFE66D'], ['#FF85A1', '#97D9E1', '#FFF5A8'], ['#FF9A76', '#FAD02C', '#7FC8A9']],
  },
  '硬核工业': {
    label: '硬核工业',
    params: { complexity: 0.5, curvature: 0.15, spacing: 0.4, weight: 0.7, asymmetry: 0.4, ornament: 0.2, density: 0.6, rotation: 0.1 },
    preferredStrategies: ['embedded', 'golden_ratio', 'diagonal_mirror', 'fold_origami', 'grid_dots'],
    colorPalettes: [['#2C3E50', '#E74C3C'], ['#34495E', '#ECF0F1'], ['#1A1A1A', '#E0E0E0', '#CC3333']],
  },
  '温润原木': {
    label: '温润原木',
    params: { complexity: 0.3, curvature: 0.7, spacing: 0.6, weight: 0.5, asymmetry: 0.2, ornament: 0.2, density: 0.4, rotation: 0.05 },
    preferredStrategies: ['embedded', 'vertical_stack', 'golden_ratio', 'circle_wrap', 'left_right_juxtapose'],
    colorPalettes: [['#8B6914', '#F5E6C8'], ['#A0522D', '#FAEBD7'], ['#6B4423', '#DEB887', '#F5DEB3']],
  },
  '大气沉稳': {
    label: '大气沉稳',
    params: { complexity: 0.4, curvature: 0.4, spacing: 0.6, weight: 0.6, asymmetry: 0.2, ornament: 0.2, density: 0.5, rotation: 0.1 },
    preferredStrategies: ['golden_ratio', 'embedded', 'concentric', 'initial_mark', 'top_bottom_split'],
    colorPalettes: [['#1C2833', '#5D6D7E', '#F8F9F9'], ['#2C3E50', '#85929E'], ['#0B0B0B', '#6C6C6C', '#D5D5D5']],
  },
}

/** 根据调性获取参数（合并默认值） */
export function getParamsForTone(tone: BrandTone): ToneMapEntry {
  return TONE_MAP[tone]
}

/** 获取某调性的推荐策略列表 */
export function getPreferredStrategies(tone: BrandTone, topN = 5): string[] {
  return TONE_MAP[tone].preferredStrategies.slice(0, topN)
}

/** 获取某调性的推荐色板 */
export function getPalettesForTone(tone: BrandTone): string[][] {
  return TONE_MAP[tone].colorPalettes
}
