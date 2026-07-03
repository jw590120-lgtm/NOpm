import { Router, type Request, type Response } from 'express'
import { seedIfEmpty } from '../storage.js'
import { products as seedProducts, rules as seedRules, stages as seedStages } from '../seed.js'
import { checkAllRules } from '../services/ruleEngine.js'
import { generateAllNotifications } from '../services/notifications.js'
import { chat } from '../services/aiService.js'
import { buildSystemContext } from '../services/contextBuilder.js'

const router = Router()

function isAiConfigured(): boolean {
  const key = process.env.DEEPSEEK_API_KEY
  return !!(key && key !== 'sk-placeholder')
}

function buildReportPrompt(
  totalProducts: number,
  activeRules: number,
  totalMatches: number,
  notifications: ReturnType<typeof generateAllNotifications>,
): string {
  const now = new Date()
  const weekLabel = `${now.getFullYear()}年第${Math.ceil((now.getDate() - now.getDay() + 1) / 7) + Math.ceil(new Date(now.getFullYear(), now.getMonth(), 1).getDay() === 0 ? 1 : 0)}周`

  const notifLines = notifications.map((n) => {
    return [
      `- 产品：${n.match.productName}`,
      `  规则：${n.match.ruleName}`,
      `  分类：${n.match.category}`,
      `  优先级：${n.match.priority}`,
      `  动作：${n.match.action}`,
      `  说明：${n.match.description}`,
      `  建议：${n.suggestion}`,
    ].join('\n')
  })

  const notifSection = notifications.length > 0
    ? `\n触发的规则通知（共${totalMatches}条）：\n\n${notifLines.join('\n\n')}`
    : '\n本周无规则触发，所有产品状态正常。'

  return `请基于以下产品生命周期管理系统的规则检查结果，生成一份结构化的中文周报。

报告时间：${weekLabel}
产品总数：${totalProducts}
活跃规则数：${activeRules}
触发匹配数：${totalMatches}
${notifSection}

请按以下结构输出周报（使用 Markdown 格式，用中文）：

## 本周概况
- 简要总结本周产品线的整体状态
- 数字统计概览

## 需关注事项
- 逐条列出触发的规则匹配
- 每条包含：产品名称、触发规则、优先级、业务影响分析
- 按优先级从高到低排列

## 行动建议
- 针对每个需关注事项给出具体的、可执行的下一步行动
- 标注建议的优先级和负责方

## 下周展望
- 基于当前数据，预测下周可能需要关注的风险点
- 建议 PM 重点关注的产品或领域

要求：
- 语言专业但易懂
- 建议具体可操作，不要泛泛而谈
- 总字数控制在 800 字以内`
}

function buildFallbackReport(
  totalProducts: number,
  activeRules: number,
  totalMatches: number,
  notifications: ReturnType<typeof generateAllNotifications>,
): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })

  const lines: string[] = []
  lines.push(`# AI 健康检查周报`)
  lines.push(`> 生成日期：${dateStr}`)
  lines.push('')
  lines.push('## 本周概况')
  lines.push('')
  lines.push(`- 产品总数：**${totalProducts}**`)
  lines.push(`- 活跃规则数：**${activeRules}**`)
  lines.push(`- 触发匹配数：**${totalMatches}**`)
  lines.push(
    totalMatches === 0
      ? '- 状态：所有产品状态正常 ✓'
      : `- 状态：有 ${totalMatches} 条规则匹配需要关注 ⚠️`,
  )
  lines.push('')

  if (notifications.length > 0) {
    lines.push('## 需关注事项')
    lines.push('')

    for (const n of notifications) {
      const priorityLabel = n.match.priority === 'high' ? '🔴 高' : n.match.priority === 'medium' ? '🟡 中' : '🟢 低'
      lines.push(`### ${n.title}`)
      lines.push(`- **产品**：${n.match.productName}`)
      lines.push(`- **规则**：${n.match.ruleName}`)
      lines.push(`- **分类**：${n.match.category}`)
      lines.push(`- **优先级**：${priorityLabel}`)
      lines.push(`- **影响**：${n.message}`)
      lines.push(`- **建议**：${n.suggestion}`)
      lines.push('')
    }

    lines.push('## 行动建议')
    lines.push('')

    let idx = 1
    for (const n of notifications) {
      lines.push(`${idx}. **${n.match.productName}**：${n.suggestion}`)
      idx++
    }
    lines.push('')
  }

  lines.push('## 下周展望')
  lines.push('')
  lines.push(
    totalMatches > 0
      ? '- 请重点关注以上列出的事项，及时制定应对方案'
      : '- 持续监控产品线状态，确保各产品按计划推进',
  )
  lines.push('- 建议每周执行一次规则检查，保持对产品线健康状态的持续关注')
  lines.push('')

  return lines.join('\n')
}

/** POST /api/report/weekly — 生成 AI 周报 */
router.post('/weekly', async (req: Request, res: Response) => {
  try {
    const products = seedIfEmpty('products', seedProducts)
    const rules = seedIfEmpty('rules', seedRules)
    const stages = seedIfEmpty('stages', seedStages)

    const matches = checkAllRules(rules, products)
    const notifications = generateAllNotifications(matches)

    const totalProducts = products.length
    const activeRules = rules.filter((r) => r.enabled).length
    const totalMatches = matches.length

    // Try AI generation
    if (isAiConfigured()) {
      try {
        const systemContext = buildSystemContext(products, stages)
        const prompt = buildReportPrompt(totalProducts, activeRules, totalMatches, notifications)

        const report = await chat({
          messages: [{ role: 'user', content: prompt }],
          context: systemContext,
        })

        res.json({ report })
        return
      } catch (aiErr) {
        console.error('AI report generation failed, using fallback:', aiErr)
      }
    }

    // Fallback: template-based report
    const fallbackReport = buildFallbackReport(
      totalProducts,
      activeRules,
      totalMatches,
      notifications,
    )

    res.json({ report: fallbackReport })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Report generation failed'
    res.status(500).json({ error: message })
  }
})

export { router as reportRouter }
