import type { Product, LifecycleStage } from '../types.js'

export function buildSystemContext(products: Product[], stages: LifecycleStage[]): string {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const lines: string[] = []
  lines.push(`当前系统状态（${currentYear}年${currentMonth}月）：`)
  lines.push(`产品总数：${products.length}`)
  lines.push('')

  for (const product of products) {
    lines.push(`产品详情：`)
    lines.push(`- ${product.name}（${product.productLine}）：`)

    const phasesSorted = [...product.phases].sort((a, b) => a.startYear - b.startYear)

    const phaseDescriptions = phasesSorted.map((p) => {
      return `${p.stageId}(${p.startYear}-${p.endYear}, ${p.status})`
    })
    lines.push(`  阶段时间线：${phaseDescriptions.join(', ')}`)

    const currentPhase = phasesSorted.find(
      (p) => p.status === 'active' && p.startYear <= currentYear && p.endYear >= currentYear,
    ) ?? phasesSorted.find(
      (p) => p.startYear <= currentYear && p.endYear >= currentYear,
    )

    if (currentPhase) {
      lines.push(`  当前所处阶段：${currentPhase.stageId} (${currentPhase.startYear}-${currentPhase.endYear}, ${currentPhase.status})`)
    } else {
      const nextPhase = phasesSorted.find((p) => p.startYear > currentYear)
      if (nextPhase) {
        lines.push(`  当前所处阶段：尚未开始，下一阶段为 ${nextPhase.stageId} (${nextPhase.startYear}-${nextPhase.endYear}, ${nextPhase.status})`)
      } else {
        lines.push(`  当前所处阶段：所有阶段已结束`)
      }
    }

    lines.push('')
  }

  return lines.join('\n').trimEnd()
}
