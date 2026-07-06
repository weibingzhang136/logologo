import { test, expect } from '@playwright/test'
import { MOCK_DEEPSEEK_RESPONSE } from './mock-ai-response'

/**
 * 端到端测试：Logologo AI Logo 生成工具
 *
 * 测试覆盖：
 * 1. 页面加载 —— 表单元素和空状态
 * 2. 表单验证 —— 空字段提交错误提示
 * 3. 成功生成 —— 填写表单 → 调用 AI → 展示 3 个方案
 * 4. 加载状态 —— 骨架屏加载动画
 * 5. 错误处理 —— API 错误展示 + 重试
 * 6. 灯箱 —— 预览大图打开/关闭
 * 7. 下载 —— 下载按钮触发
 */

test.describe('页面基础加载', () => {
  test('页面标题和品牌标识正确', async ({ page }) => {
    await page.goto('/')

    // 标题
    await expect(page.locator('h1')).toHaveText('Logologo')
    await expect(page.getByText('标逻 · AI Logo 生成')).toBeVisible()

    // 表单标题
    await expect(page.getByText('品牌信息')).toBeVisible()
    await expect(page.getByText('生成结果')).toBeVisible()
  })

  test('空状态提示可见', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('填写左侧表单，点击"生成 LOGO"')).toBeVisible()
    await expect(
      page.getByText('AI 将为您设计 3 个差异化的品牌 LOGO 方案'),
    ).toBeVisible()
  })

  test('表单元素完整', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByPlaceholder('例如：墨迹科技')).toBeVisible()
    await expect(page.getByPlaceholder('例如：Moji Tech')).toBeVisible()
    await expect(page.getByPlaceholder('例如：互联网、餐饮、教育')).toBeVisible()
    await expect(page.getByPlaceholder('例如：企业级 SaaS 软件')).toBeVisible()

    // 结构按钮
    await expect(page.getByRole('button', { name: '文字+图形' })).toBeVisible()
    await expect(page.getByRole('button', { name: '纯文字' })).toBeVisible()
    await expect(page.getByRole('button', { name: '纯图形' })).toBeVisible()

    // 颜色按钮
    await expect(page.getByRole('button', { name: '单色' })).toBeVisible()
    await expect(page.getByRole('button', { name: '双色' })).toBeVisible()
    await expect(page.getByRole('button', { name: '三色' })).toBeVisible()
    await expect(page.getByRole('button', { name: '四色' })).toBeVisible()

    // 生成按钮
    await expect(page.getByRole('button', { name: '生成 LOGO' })).toBeVisible()
  })
})

test.describe('表单验证', () => {
  test('空表单提交显示 4 个必填错误', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: '生成 LOGO' }).click()

    await expect(page.getByText('请输入品牌中文名')).toBeVisible()
    await expect(page.getByText('请输入品牌英文/拼音名')).toBeVisible()
    await expect(page.getByText('请输入品牌行业')).toBeVisible()
    await expect(page.getByText('请输入主营产品/服务')).toBeVisible()
  })

  test('填写后错误自动消失', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: '生成 LOGO' }).click()
    await expect(page.getByText('请输入品牌中文名')).toBeVisible()

    // 填写中文名后对应错误消失
    await page.getByPlaceholder('例如：墨迹科技').fill('测试品牌')
    await expect(page.getByText('请输入品牌中文名')).not.toBeVisible()
  })
})

test.describe('LOGO 生成流程', () => {
  test.beforeEach(async ({ page }) => {
    // 拦截 AI API 请求，返回 mock 数据
    await page.route('**/api/deepseek/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DEEPSEEK_RESPONSE),
      })
    })
  })

  test('填写表单并成功生成 3 个方案', async ({ page }) => {
    await page.goto('/')

    // 填写所有必填字段
    await page.getByPlaceholder('例如：墨迹科技').fill('墨迹科技')
    await page.getByPlaceholder('例如：Moji Tech').fill('Moji Tech')
    await page.getByPlaceholder('例如：互联网、餐饮、教育').fill('互联网')
    await page.getByPlaceholder('例如：企业级 SaaS 软件').fill('企业级 SaaS 软件')

    // 点击生成
    await page.getByRole('button', { name: '生成 LOGO' }).click()

    // 等待骨架屏出现（加载状态）
    await expect(page.locator('.animate-pulse').first()).toBeVisible()

    // 等待结果出现
    await expect(page.getByText('已生成 3 个方案')).toBeVisible({ timeout: 15000 })

    // 验证 3 个策略名称显示
    await expect(page.getByText('圆形环绕')).toBeVisible()
    await expect(page.getByText('左右并置')).toBeVisible()
    await expect(page.getByText('网格点阵')).toBeVisible()

    // 验证方案标签
    await expect(page.getByText('方案A', { exact: false })).toBeVisible()
    await expect(page.getByText('方案B', { exact: false })).toBeVisible()
    await expect(page.getByText('方案C', { exact: false })).toBeVisible()
  })

  test('下载全部按钮存在', async ({ page }) => {
    await page.goto('/')

    await page.getByPlaceholder('例如：墨迹科技').fill('墨迹科技')
    await page.getByPlaceholder('例如：Moji Tech').fill('Moji Tech')
    await page.getByPlaceholder('例如：互联网、餐饮、教育').fill('互联网')
    await page.getByPlaceholder('例如：企业级 SaaS 软件').fill('企业级 SaaS 软件')

    await page.getByRole('button', { name: '生成 LOGO' }).click()

    // 等待结果出现
    await expect(page.getByText('已生成 3 个方案')).toBeVisible({ timeout: 15000 })

    // 下载全部按钮
    await expect(page.getByRole('button', { name: '下载全部' })).toBeVisible()
  })

  test('每个方案都有预览和下载按钮', async ({ page }) => {
    await page.goto('/')

    await page.getByPlaceholder('例如：墨迹科技').fill('墨迹科技')
    await page.getByPlaceholder('例如：Moji Tech').fill('Moji Tech')
    await page.getByPlaceholder('例如：互联网、餐饮、教育').fill('互联网')
    await page.getByPlaceholder('例如：企业级 SaaS 软件').fill('企业级 SaaS 软件')

    await page.getByRole('button', { name: '生成 LOGO' }).click()
    await expect(page.getByText('已生成 3 个方案')).toBeVisible({ timeout: 15000 })

    // 每个方案卡片应有预览和下载按钮
    const previewButtons = page.getByRole('button', { name: '预览' })
    const downloadButtons = page.getByRole('button', { name: '下载 SVG' })
    await expect(previewButtons).toHaveCount(3)
    await expect(downloadButtons).toHaveCount(3)
  })

  test('支持标签页切换（纯文字 / 纯图形）', async ({ page }) => {
    await page.goto('/')

    // 点击纯文字
    await page.getByRole('button', { name: '纯文字' }).click()
    await expect(page.getByRole('button', { name: '纯文字' })).toHaveClass(/bg-\[#2A5CFF\]/)

    // 点击纯图形
    await page.getByRole('button', { name: '纯图形' }).click()
    await expect(page.getByRole('button', { name: '纯图形' })).toHaveClass(/bg-\[#2A5CFF\]/)

    // 切回文字+图形
    await page.getByRole('button', { name: '文字+图形' }).click()
    await expect(page.getByRole('button', { name: '文字+图形' })).toHaveClass(/bg-\[#2A5CFF\]/)
  })
})

test.describe('灯箱（Lightbox）', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/deepseek/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DEEPSEEK_RESPONSE),
      })
    })
  })

  test('点击预览打开灯箱，按 Esc 关闭', async ({ page }) => {
    await page.goto('/')

    await page.getByPlaceholder('例如：墨迹科技').fill('墨迹科技')
    await page.getByPlaceholder('例如：Moji Tech').fill('Moji Tech')
    await page.getByPlaceholder('例如：互联网、餐饮、教育').fill('互联网')
    await page.getByPlaceholder('例如：企业级 SaaS 软件').fill('企业级 SaaS 软件')
    await page.getByRole('button', { name: '生成 LOGO' }).click()
    await expect(page.getByText('已生成 3 个方案')).toBeVisible({ timeout: 15000 })

    // 点击第一个方案的预览
    await page.getByRole('button', { name: '预览' }).first().click()

    // 灯箱应打开
    const lightbox = page.locator('.fixed.inset-0.z-50')
    await expect(lightbox).toBeVisible()
    await expect(lightbox.getByRole('button', { name: '下载 SVG' })).toBeVisible()

    // 按 Esc 关闭
    await page.keyboard.press('Escape')
    await expect(lightbox).not.toBeVisible()
  })

  test('点击遮罩层关闭灯箱', async ({ page }) => {
    await page.goto('/')

    await page.getByPlaceholder('例如：墨迹科技').fill('墨迹科技')
    await page.getByPlaceholder('例如：Moji Tech').fill('Moji Tech')
    await page.getByPlaceholder('例如：互联网、餐饮、教育').fill('互联网')
    await page.getByPlaceholder('例如：企业级 SaaS 软件').fill('企业级 SaaS 软件')
    await page.getByRole('button', { name: '生成 LOGO' }).click()
    await expect(page.getByText('已生成 3 个方案')).toBeVisible({ timeout: 15000 })

    // 点击第二个方案的预览打开灯箱
    await page.getByRole('button', { name: '预览' }).nth(1).click()
    const lightbox = page.locator('.fixed.inset-0.z-50')
    await expect(lightbox).toBeVisible()

    // 点击遮罩背景（左上角，一定是 overlay 本身而非内容区）
    await lightbox.click({ position: { x: 10, y: 10 } })

    await expect(lightbox).not.toBeVisible()
  })
})

test.describe('错误处理', () => {
  test('API 错误时显示错误信息和重试按钮', async ({ page }) => {
    await page.route('**/api/deepseek/**', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Rate limit' } }),
      })
    })

    await page.goto('/')

    await page.getByPlaceholder('例如：墨迹科技').fill('墨迹科技')
    await page.getByPlaceholder('例如：Moji Tech').fill('Moji Tech')
    await page.getByPlaceholder('例如：互联网、餐饮、教育').fill('互联网')
    await page.getByPlaceholder('例如：企业级 SaaS 软件').fill('企业级 SaaS 软件')

    await page.getByRole('button', { name: '生成 LOGO' }).click()

    // 等待错误信息出现
    await expect(page.getByText('AI 服务忙，请稍后重试')).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('button', { name: '重新生成' })).toBeVisible()
  })

  test('网络错误时显示网络失败提示', async ({ page }) => {
    await page.route('**/api/deepseek/**', async (route) => {
      await route.abort('connectionrefused')
    })

    await page.goto('/')

    await page.getByPlaceholder('例如：墨迹科技').fill('墨迹科技')
    await page.getByPlaceholder('例如：Moji Tech').fill('Moji Tech')
    await page.getByPlaceholder('例如：互联网、餐饮、教育').fill('互联网')
    await page.getByPlaceholder('例如：企业级 SaaS 软件').fill('企业级 SaaS 软件')

    await page.getByRole('button', { name: '生成 LOGO' }).click()

    await expect(page.getByText('网络连接失败，请检查网络后重试')).toBeVisible({ timeout: 15000 })
  })

  test('重试按钮可重新发起生成', async ({ page }) => {
    // 第一次请求失败（用 400 不可重试，让错误透传到 UI）
    let callCount = 0
    await page.route('**/api/deepseek/**', async (route) => {
      callCount++
      if (callCount === 1) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Bad request' } }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_DEEPSEEK_RESPONSE),
        })
      }
    })

    await page.goto('/')

    await page.getByPlaceholder('例如：墨迹科技').fill('墨迹科技')
    await page.getByPlaceholder('例如：Moji Tech').fill('Moji Tech')
    await page.getByPlaceholder('例如：互联网、餐饮、教育').fill('互联网')
    await page.getByPlaceholder('例如：企业级 SaaS 软件').fill('企业级 SaaS 软件')
    await page.getByRole('button', { name: '生成 LOGO' }).click()

    await expect(page.getByText('请求参数有误，请重试')).toBeVisible({ timeout: 15000 })

    // 点击重试
    await page.getByRole('button', { name: '重新生成' }).click()

    // 第二次应该成功
    await expect(page.getByText('已生成 3 个方案')).toBeVisible({ timeout: 15000 })
  })
})
