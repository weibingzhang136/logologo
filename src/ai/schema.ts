// ============================================================
// AI 输出 JSON Schema
// 定义了 AI 调用返回的结构化数据格式
// 此 Schema 直接传递给 AI API 的 structured_output / response_format
// ============================================================

/**
 * AI 输出的完整 JSON 结构。
 * AI 不生成 SVG 代码，只生成设计决策。
 */
export const AI_OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    variants: {
      type: 'array',
      description: '3 组完全不同的 LOGO 设计方案',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        properties: {
          strategy: {
            type: 'string',
            description: '构图策略',
            enum: [
              'circle_wrap', 'golden_ratio', 'diagonal_mirror', 'concentric',
              'overlap_penetrate', 'grid_dots', 'radial_burst',
              'initial_mark', 'embedded', 'top_bottom_split',
              'left_right_juxtapose', 'letter_marquee', 'vertical_stack',
              'outline_merge',
              'negative_space', 'rhythm_repeat', 'deconstruct_offset',
              'layer_depth', 'geometric_animal', 'fold_origami',
            ],
          },
          params: {
            type: 'object',
            description: '核心设计参数（0-1 范围）。不提供的字段使用默认值',
            properties: {
              complexity: { type: 'number', minimum: 0, maximum: 1, description: '元素密度：0=极简，1=丰富' },
              curvature: { type: 'number', minimum: 0, maximum: 1, description: '曲直程度：0=直线，1=曲线' },
              spacing: { type: 'number', minimum: 0, maximum: 1, description: '间距：0=紧凑，1=疏松' },
              weight: { type: 'number', minimum: 0, maximum: 1, description: '线条粗细：0=极细，1=粗重' },
              asymmetry: { type: 'number', minimum: 0, maximum: 1, description: '对称性：0=完全对称，1=完全不对称' },
              ornament: { type: 'number', minimum: 0, maximum: 1, description: '装饰程度：0=裸元素，1=大量' },
              density: { type: 'number', minimum: 0, maximum: 1, description: '填充密度：0=大量留白，1=密集' },
              rotation: { type: 'number', minimum: 0, maximum: 1, description: '动态感：0=静止，1=强烈动感' },
            },
          },
          offset: {
            type: 'object',
            description: '该方案在基础参数之上的偏移量（-0.3~0.3）。3 个方案的 offset 应该不同以保证多样性',
            properties: {
              complexity: { type: 'number', minimum: -0.3, maximum: 0.3 },
              spacing: { type: 'number', minimum: -0.3, maximum: 0.3 },
              weight: { type: 'number', minimum: -0.3, maximum: 0.3 },
              asymmetry: { type: 'number', minimum: -0.3, maximum: 0.3 },
              ornament: { type: 'number', minimum: -0.3, maximum: 0.3 },
              density: { type: 'number', minimum: -0.3, maximum: 0.3 },
              rotation: { type: 'number', minimum: -0.3, maximum: 0.3 },
            },
          },
          colors: {
            type: 'array',
            description: '该方案使用的颜色（HEX 格式）。数量 1-4。如果留空引擎会自动配色',
            items: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
            minItems: 1,
            maxItems: 4,
          },
          rationale: {
            type: 'string',
            description: '简要说明为什么这个方案适合该品牌（用于前端展示）',
            maxLength: 100,
          },
        },
        required: ['strategy', 'params', 'offset'],
      },
    },
  },
  required: ['variants'],
}

/** 示例输出（用于 prompt 的 few-shot） */
export const AI_OUTPUT_EXAMPLE = {
  variants: [
    {
      strategy: 'circle_wrap',
      params: { complexity: 0.3, curvature: 0.7, spacing: 0.6, density: 0.4 },
      offset: {},
      colors: ['#1A1A2E', '#F5F5F5'],
      rationale: '圆形环绕结构，稳重且专业',
    },
    {
      strategy: 'deconstruct_offset',
      params: { complexity: 0.5, curvature: 0.3, spacing: 0.5, density: 0.5, asymmetry: 0.6 },
      offset: { spacing: 0.1, rotation: 0.15 },
      colors: ['#1A1A2E', '#2A5CFF'],
      rationale: '解构错位展现现代感与创造力',
    },
    {
      strategy: 'golden_ratio',
      params: { complexity: 0.4, curvature: 0.5, spacing: 0.5, density: 0.5 },
      offset: { complexity: -0.1, weight: 0.1 },
      colors: ['#1A1A2E', '#E8E8E8'],
      rationale: '黄金分割比例，经典耐看',
    },
  ],
}
