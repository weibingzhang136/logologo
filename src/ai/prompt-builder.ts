// ============================================================
// AI Prompt 构建器
// 将用户表单数据 + 系统规则，拼接成结构化 prompt
// ============================================================

import type { LogoRequest, BrandTone } from '../engine/types'
import { getPreferredStrategies, getPalettesForTone } from '../engine/tone-mapping'
import { getStrategyDescriptions } from '../engine/strategies/index'
import { AI_OUTPUT_SCHEMA, AI_OUTPUT_EXAMPLE } from './schema'

/** 调性的中文描述映射 */
const TONE_DESCRIPTIONS: Record<BrandTone, string> = {
  '极简克制': '极简风格，强调少即是多，大量留白，克制使用装饰',
  '高级轻奢': '低调奢华，注重质感和细节，使用金色/暖色调',
  '活力元气': '充满能量与活力，色彩鲜明，动感构图',
  '潮流先锋': '潮流前卫，不拘一格，大胆使用不对称和非传统布局',
  '小众个性': '独特个性，不随大流，有艺术感和实验性',
  '未来科幻': '科技感十足，使用几何/点阵/发光感设计',
  '东方雅致': '东方韵味，传统与现代结合，注重意境和留白',
  '赛博酷感': '赛博朋克风格，霓虹色彩，锐利线条',
  '纯净治愈': '柔和温暖，圆润舒适，色彩柔和治愈',
  '梦幻浪漫': '梦幻柔美，曲线流畅，色彩柔和浪漫',
  '灵动童趣': '活泼有趣，色彩丰富，形态俏皮可爱',
  '硬核工业': '硬朗工业风，直线/直角为主，色彩沉稳',
  '温润原木': '温暖自然，木质/大地色调，圆润朴实',
  '大气沉稳': '稳重端庄，结构严谨，色彩沉稳不张扬',
}

/** 构建发给 AI 的完整 prompt */
export function buildPrompt(request: LogoRequest): string {
  const toneDesc = TONE_DESCRIPTIONS[request.tone]
  const preferredStrategies = getPreferredStrategies(request.tone, 5)
  const suggestedPalette = getPalettesForTone(request.tone)

  return [
    `# 任务：为品牌设计 3 个差异化 LOGO 方案（仅输出决策参数，不生成图）`,
    ``,
    `## 品牌信息`,
    `- 中文名：${request.brandNameCN}`,
    `- 英文名：${request.brandNameEN || '（无）'}`,
    `- 品牌理念：${request.philosophy}`,
    `- 行业：${request.industry}`,
    `- 主营产品/服务：${request.products}`,
    `- 品牌调性：${request.tone}（${toneDesc}）`,
    `- LOGO 结构偏好：${request.structure === 'pure_text' ? '纯文字' : request.structure === 'pure_graphic' ? '纯图形' : '文字+图形'}`,
    `- 颜色要求：${request.colorRequirement === 'custom' ? `自定义(${request.customColors?.join(',')})` : request.colorRequirement}`,
    ``,
    `## 设计规则`,
    `1. 3 个方案必须使用不同的构图策略，差异要显著`,
    `2. ${request.tone}调性推荐策略：${preferredStrategies.join('、')}`,
    `3. 每方案可调节 8 个参数（0-1 范围），产生视觉差异`,
    `4. 3 组 offset 应该设计为产生明显视觉区分：`,
    `   - 方案A：最符合调性默认值，稳重`,
    `   - 方案B：更轻量/更动态/更宽松`,
    `   - 方案C：更丰富/更紧凑/更精致`,
    `5. ${suggestedPalette.length > 0 ? `推荐色板：${suggestedPalette[0].join(', ')}` : '根据调性自行配色'}`,
    `6. 禁止使用渐变填充，只使用纯色`,
    `7. 所有颜色使用 HEX 格式`,
    ``,
    `## 可选策略列表`,
    getStrategyDescriptions(),
    ``,
    `## 输出格式`,
    `严格按以下 JSON Schema 输出，不要添加额外字段：`,
    JSON.stringify(AI_OUTPUT_SCHEMA, null, 2),
    ``,
    `## 输出示例`,
    JSON.stringify(AI_OUTPUT_EXAMPLE, null, 2),
  ].join('\n')
}

/** 构建精简版 prompt（用于快速测试/调试） */
export function buildPromptShort(request: LogoRequest): string {
  return [
    `为品牌"${request.brandNameCN}"(${request.industry})设计3个差异化LOGO方案。`,
    `品牌调性：${request.tone}。`,
    `颜色：${request.colorRequirement === 'custom' ? request.customColors?.join(',') : request.colorRequirement}色。`,
    `输出JSON描述3个不同策略的参数配置，确保3个方案使用的策略和参数有明显差异。`,
    `可选策略：circle_wrap golden_ratio diagonal_mirror concentric overlap_penetrate grid_dots radial_burst initial_mark embedded top_bottom_split left_right_juxtapose letter_marquee vertical_stack outline_merge negative_space rhythm_repeat deconstruct_offset layer_depth geometric_animal fold_origami`,
  ].join('')
}
