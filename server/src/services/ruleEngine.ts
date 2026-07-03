import type { Product, ProductPhase, TriggerRule, RuleCondition } from '../types.js'

export interface RuleMatch {
  ruleId: string
  ruleName: string
  category: TriggerRule['category']
  priority: TriggerRule['priority']
  productId: string
  productName: string
  action: TriggerRule['action']
  description: string
  details: Record<string, unknown>
}

const CURRENT_YEAR = 2026

function evaluateCondition(
  condition: RuleCondition,
  product: Product,
): boolean {
  switch (condition.type) {
    case 'time_since': {
      // Find the product's phase for this stage
      const phase = product.phases.find((p) => p.stageId === condition.stageId)
      if (!phase) return false

      // If the phase hasn't started (startYear > CURRENT_YEAR), not eligible
      if (phase.startYear > CURRENT_YEAR) return false

      const yearsSinceStart = CURRENT_YEAR - phase.startYear
      return yearsSinceStart >= condition.yearsMin && yearsSinceStart <= condition.yearsMax
    }

    case 'stage_match': {
      // Match product ID pattern (or name) and check if product has given stage active/completed
      const pattern = condition.productIdPattern.toLowerCase()
      const idMatches =
        product.id.toLowerCase().includes(pattern) ||
        product.name.toLowerCase().includes(pattern)
      if (!idMatches) return false

      const phase = product.phases.find((p) => p.stageId === condition.stageId)
      if (!phase) return false
      // Match if the phase is active or the current year falls within it
      return phase.status === 'active' || phase.status === 'completed' ||
        (phase.startYear <= CURRENT_YEAR && phase.endYear >= CURRENT_YEAR)
    }

    case 'metric_threshold': {
      // Metrics are not available in Phase 3 — always return false
      // In Phase 4, this will be replaced with real metric data
      return false
    }

    case 'and': {
      return condition.conditions.every((c) => evaluateCondition(c, product))
    }

    case 'or': {
      return condition.conditions.some((c) => evaluateCondition(c, product))
    }

    default:
      return false
  }
}

export function checkProduct(
  rule: TriggerRule,
  product: Product,
): RuleMatch | null {
  if (!rule.enabled) return null

  if (!evaluateCondition(rule.condition, product)) return null

  const phase = product.phases.find(
    (p) =>
      rule.condition.type === 'time_since'
        ? p.stageId === rule.condition.stageId
        : false,
  )

  return {
    ruleId: rule.id,
    ruleName: rule.name,
    category: rule.category,
    priority: rule.priority,
    productId: product.id,
    productName: product.name,
    action: rule.action,
    description: rule.description,
    details: phase
      ? {
          stage: phase.stageId,
          startYear: phase.startYear,
          endYear: phase.endYear,
          currentYear: CURRENT_YEAR,
        }
      : {},
  }
}

export function checkAllRules(
  rules: TriggerRule[],
  products: Product[],
): RuleMatch[] {
  const matches: RuleMatch[] = []

  for (const product of products) {
    for (const rule of rules) {
      const match = checkProduct(rule, product)
      if (match) {
        matches.push(match)
      }
    }
  }

  return matches
}
