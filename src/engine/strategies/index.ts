// ============================================================
// 策略注册表 — 所有构图策略的中央注册入口
// ============================================================

import type { StrategyKey, StrategyFn } from '../types'
import * as geometric from './geometric'
import * as typographic from './typographic'
import * as abstract_ from './abstract'

/** 策略注册表：key → 实现函数 */
export const STRATEGY_REGISTRY: Record<StrategyKey, StrategyFn> = {
  // 几何类
  circle_wrap: geometric.circle_wrap,
  golden_ratio: geometric.golden_ratio,
  diagonal_mirror: geometric.diagonal_mirror,
  concentric: geometric.concentric,
  overlap_penetrate: geometric.overlap_penetrate,
  grid_dots: geometric.grid_dots,
  radial_burst: geometric.radial_burst,
  // 文字类
  initial_mark: typographic.initial_mark,
  embedded: typographic.embedded,
  top_bottom_split: typographic.top_bottom_split,
  left_right_juxtapose: typographic.left_right_juxtapose,
  letter_marquee: typographic.letter_marquee,
  vertical_stack: typographic.vertical_stack,
  outline_merge: typographic.outline_merge,
  // 抽象类
  negative_space: abstract_.negative_space,
  rhythm_repeat: abstract_.rhythm_repeat,
  deconstruct_offset: abstract_.deconstruct_offset,
  layer_depth: abstract_.layer_depth,
  geometric_animal: abstract_.geometric_animal,
  fold_origami: abstract_.fold_origami,
}

/** 按分类获取策略列表 */
export function getStrategiesByCategory(): Record<string, StrategyKey[]> {
  return {
    geometric: ['circle_wrap', 'golden_ratio', 'diagonal_mirror', 'concentric', 'overlap_penetrate', 'grid_dots', 'radial_burst'],
    typographic: ['initial_mark', 'embedded', 'top_bottom_split', 'left_right_juxtapose', 'letter_marquee', 'vertical_stack', 'outline_merge'],
    abstract: ['negative_space', 'rhythm_repeat', 'deconstruct_offset', 'layer_depth', 'geometric_animal', 'fold_origami'],
  }
}

/** 获取策略类别说明（用于 AI prompt） */
export function getStrategyDescriptions(): string {
  return [
    '几何类：circle_wrap(圆形环绕) golden_ratio(黄金分割) diagonal_mirror(对角镜像) concentric(同心扩展) overlap_penetrate(重叠穿透) grid_dots(网格点阵) radial_burst(放射发散)',
    '文字类：initial_mark(首字母放大) embedded(文字嵌入容器) top_bottom_split(上下分割) left_right_juxtapose(左右并置) letter_marquee(文字弧形排列) vertical_stack(竖排堆叠) outline_merge(描边融合)',
    '抽象类：negative_space(负空间) rhythm_repeat(节奏重复) deconstruct_offset(解构偏移) layer_depth(层次深度) geometric_animal(几何具象) fold_origami(折纸折叠)',
  ].join('\n')
}
