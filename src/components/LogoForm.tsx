import { useState } from 'react'
import type { LogoRequest, BrandTone } from '../engine/types'
import { BRAND_TONES } from '../engine/types'

interface Props {
  onGenerate: (request: LogoRequest) => void
  loading: boolean
}

interface FormState {
  brandNameCN: string
  brandNameEN: string
  philosophy: string
  industry: string
  products: string
  tone: BrandTone
  structure: 'pure_text' | 'pure_graphic' | 'text_graphic'
  colorRequirement: 'single' | 'dual' | 'triple' | 'quad' | 'custom'
  customColors: string
}

interface FormErrors {
  brandNameCN?: string
  brandNameEN?: string
  industry?: string
  products?: string
}

const STRUCTURES = [
  { value: 'text_graphic', label: '文字+图形' },
  { value: 'pure_text', label: '纯文字' },
  { value: 'pure_graphic', label: '纯图形' },
] as const

const COLOR_OPTIONS = [
  { value: 'single', label: '单色' },
  { value: 'dual', label: '双色' },
  { value: 'triple', label: '三色' },
  { value: 'quad', label: '四色' },
  { value: 'custom', label: '自定义' },
] as const

const INITIAL: FormState = {
  brandNameCN: '',
  brandNameEN: '',
  philosophy: '',
  industry: '',
  products: '',
  tone: '极简克制',
  structure: 'text_graphic',
  colorRequirement: 'dual',
  customColors: '',
}

/** 过滤特殊乱码字符（PRD 2.2：防止畸形文字） */
const sanitizeInput = (value: string) =>
  value.replace(/[@#$%^&*()\-_=+[\]{}|;:'",.<>/?`~！￥…（）—【】、；：""''，。《》？·]/g, '')

export default function LogoForm({ onGenerate, loading }: Props) {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => {
      const k = key as keyof FormErrors
      if (!prev[k]) return prev
      const next = { ...prev }
      delete next[k]
      return next
    })
  }

  const validate = (): FormErrors => {
    const errs: FormErrors = {}
    if (!form.brandNameCN.trim()) errs.brandNameCN = '请输入品牌中文名'
    if (!form.brandNameEN.trim()) errs.brandNameEN = '请输入品牌英文/拼音名'
    if (!form.industry.trim()) errs.industry = '请输入品牌行业'
    if (!form.products.trim()) errs.products = '请输入主营产品/服务'
    return errs
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    onGenerate({
      brandNameCN: sanitizeInput(form.brandNameCN.trim()),
      brandNameEN: sanitizeInput(form.brandNameEN.trim()),
      philosophy: sanitizeInput(form.philosophy.trim() || '打造专属品牌视觉符号'),
      industry: sanitizeInput(form.industry.trim()),
      products: sanitizeInput(form.products.trim()),
      tone: form.tone,
      structure: form.structure,
      colorRequirement: form.colorRequirement,
      customColors: form.colorRequirement === 'custom'
        ? form.customColors.split(',').map(s => s.trim()).filter(s => /^#[0-9a-fA-F]{6}$/.test(s))
        : undefined,
    })
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#2A5CFF] focus:outline-none focus:ring-1 focus:ring-[#2A5CFF] transition-colors'
  const inputErrorClass = `${inputClass} border-red-400 focus:border-red-500 focus:ring-red-500`
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 品牌中文名 */}
      <div>
        <label className={labelClass}>品牌中文名 *</label>
        <input
          className={errors.brandNameCN ? inputErrorClass : inputClass}
          placeholder="例如：墨迹科技"
          maxLength={20}
          value={form.brandNameCN}
          onChange={e => update('brandNameCN', e.target.value)}
        />
        {errors.brandNameCN && (
          <p className="mt-1 text-xs text-red-500">{errors.brandNameCN}</p>
        )}
      </div>

      {/* 品牌英文名 */}
      <div>
        <label className={labelClass}>品牌英文/拼音名 *</label>
        <input
          className={errors.brandNameEN ? inputErrorClass : inputClass}
          placeholder="例如：Moji Tech"
          maxLength={30}
          value={form.brandNameEN}
          onChange={e => update('brandNameEN', e.target.value)}
        />
        {errors.brandNameEN && (
          <p className="mt-1 text-xs text-red-500">{errors.brandNameEN}</p>
        )}
      </div>

      {/* 品牌理念 */}
      <div>
        <label className={labelClass}>品牌理念</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={2}
          maxLength={60}
          placeholder="选填，留空将自动填充：打造专属品牌视觉符号"
          value={form.philosophy}
          onChange={e => update('philosophy', e.target.value)}
        />
        <p className="mt-1 text-xs text-gray-400">{form.philosophy.length}/60</p>
      </div>

      {/* 行业 */}
      <div>
        <label className={labelClass}>行业 *</label>
        <input
          className={errors.industry ? inputErrorClass : inputClass}
          placeholder="例如：互联网、餐饮、教育"
          value={form.industry}
          onChange={e => update('industry', e.target.value)}
        />
        {errors.industry && (
          <p className="mt-1 text-xs text-red-500">{errors.industry}</p>
        )}
      </div>

      {/* 主营产品 */}
      <div>
        <label className={labelClass}>主营产品/服务 *</label>
        <input
          className={errors.products ? inputErrorClass : inputClass}
          placeholder="例如：企业级 SaaS 软件"
          value={form.products}
          onChange={e => update('products', e.target.value)}
        />
        {errors.products && (
          <p className="mt-1 text-xs text-red-500">{errors.products}</p>
        )}
      </div>

      {/* 品牌调性 */}
      <div>
        <label className={labelClass}>品牌调性</label>
        <select
          className={inputClass}
          value={form.tone}
          onChange={e => update('tone', e.target.value as BrandTone)}
        >
          {BRAND_TONES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* 结构偏好 */}
      <div>
        <label className={labelClass}>LOGO 结构</label>
        <div className="flex gap-2">
          {STRUCTURES.map(s => (
            <button
              key={s.value}
              type="button"
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                form.structure === s.value
                  ? 'border-[#2A5CFF] bg-[#2A5CFF] text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
              onClick={() => update('structure', s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 颜色要求 */}
      <div>
        <label className={labelClass}>颜色数量</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map(c => (
            <button
              key={c.value}
              type="button"
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                form.colorRequirement === c.value
                  ? 'border-[#2A5CFF] bg-[#2A5CFF] text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
              onClick={() => update('colorRequirement', c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
        {form.colorRequirement === 'custom' && (
          <input
            className={`${inputClass} mt-2`}
            placeholder="HEX 色值，用逗号分隔，例如：#FF0000,#00FF00"
            value={form.customColors}
            onChange={e => update('customColors', e.target.value)}
          />
        )}
      </div>

      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#1A1A2E] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2a2a4e] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? '生成中...' : '生成 LOGO'}
      </button>
    </form>
  )
}
