import type { RuleMatch } from './ruleEngine.js'

const STAGE_NAMES: Record<string, string> = {
  concept: '概念与立项', design: '设计开发', register: '递交注册',
  launch: '产品上市', growth: '销售成长期', mature: '销售成熟期',
  decline: '衰退期', retire: '正式退市',
}

export interface TemplateNotification {
  match: RuleMatch
  title: string
  message: string
  suggestion: string
}

function generateTitle(match: RuleMatch): string {
  const priorityEmoji = match.priority === 'high' ? '🔴' : match.priority === 'medium' ? '🟡' : '🟢'
  return `${priorityEmoji} ${match.ruleName}`
}

function generateMessage(match: RuleMatch): string {
  const productName = match.productName
  const stageName = match.details.stage
    ? STAGE_NAMES[match.details.stage as string] ?? match.details.stage
    : '未知阶段'

  switch (match.action) {
    case 'alert':
      return `产品「${productName}」触发预警：${match.description}`
    case 'recommend_new_product':
      return `产品「${productName}」当前处于「${stageName}」阶段，建议启动下一代产品立项。${match.description}`
    case 'recommend_retire':
      return `产品「${productName}」即将进入退市阶段，请准备退市方案。${match.description}`
    default:
      return `产品「${productName}」触发规则「${match.ruleName}」。${match.description}`
  }
}

function generateSuggestion(match: RuleMatch): string {
  switch (match.action) {
    case 'alert':
      return '请审阅详情并确认是否需要采取行动。'
    case 'recommend_new_product':
      return '建议在时间线模拟中创建替代产品，提前规划研发和注册资源。'
    case 'recommend_retire':
      return '建议制定退市计划，包括：通知客户、确保售后支持、归档文档。'
    default:
      return '请评估影响并制定应对方案。'
  }
}

export function generateNotification(match: RuleMatch): TemplateNotification {
  return {
    match,
    title: generateTitle(match),
    message: generateMessage(match),
    suggestion: generateSuggestion(match),
  }
}

export function generateAllNotifications(matches: RuleMatch[]): TemplateNotification[] {
  return matches
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    .map(generateNotification)
}
