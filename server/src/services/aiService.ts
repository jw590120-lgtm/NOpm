import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY ?? 'sk-placeholder',
  baseURL: process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com',
})

const MODEL = process.env.AI_MODEL ?? 'deepseek-chat'

const SYSTEM_PROMPT: ChatCompletionMessageParam = {
  role: 'system',
  content: `你是产品生命周期管理（PLM）系统的 AI 助手。你帮助产品经理管理医疗器械产品线。

你已经获得了当前系统数据的上下文，请基于真实数据回答问题，不要编造不存在的信息。

你的能力：
- 解释生命周期阶段（概念与立项、设计开发、递交注册、产品上市、销售成长期、销售成熟期、衰退期、正式退市）的含义和典型时长
- 分析产品当前状态，提供行动建议
- 解读通知/预警的含义和影响
- 回答产品线的时间线相关问题
- 用中文回答，简洁专业

约束：
- 不做超出数据范围的推测
- 不带主观偏好评价产品
- 不给出临床或法规的确定性结论（这些需专业团队审核）`,
}

export interface AiChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[]
  context?: string
}

export async function chat(request: AiChatRequest): Promise<string> {
  const messages: ChatCompletionMessageParam[] = [
    SYSTEM_PROMPT,
    ...(request.context
      ? [{ role: 'system' as const, content: `当前上下文数据：\n${request.context}` }]
      : []),
    ...request.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ]

  const response = await client.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 1500,
  })

  return response.choices[0]?.message?.content ?? '抱歉，AI 未生成回复。'
}

export async function analyzeNotification(
  notification: {
    title: string
    message: string
    suggestion: string
    match: {
      productName: string
      ruleName: string
      category: string
      priority: string
    }
  },
  context?: string,
): Promise<string> {
  const prompt = `请分析以下产品管理通知，给出深入解读和额外建议：

产品：${notification.match.productName}
规则：${notification.match.ruleName}
分类：${notification.match.category}
优先级：${notification.match.priority}

原始消息：${notification.message}
已给建议：${notification.suggestion}

请用中文从以下角度分析（不超过 300 字）：
1. 这个通知的业务影响是什么？
2. 是否有可能的连锁反应？
3. 有什么额外建议？`

  return chat({
    messages: [{ role: 'user', content: prompt }],
    context,
  })
}

export async function analyzeProduct(
  product: {
    name: string
    phases: { stageId: string; startYear: number; endYear: number; status: string }[]
  },
  stages: { id: string; name: string }[],
): Promise<string> {
  const stageNames = stages.map((s) => `${s.id}(${s.name})`).join('、')
  const phaseInfo = product.phases
    .map((p) => `  ${p.stageId}: ${p.startYear}-${p.endYear} (${p.status})`)
    .join('\n')

  const prompt = `请分析产品「${product.name}」的当前状态，并给出建议。

生命周期阶段定义：${stageNames}

该产品的时间线：
${phaseInfo}

请用中文回答（不超过 400 字）：
1. 当前产品处于哪个阶段？正常吗？
2. 与典型周期相比，有没有值得关注的时间节点？
3. 未来 2-3 年 PM 需要重点关注什么？`

  return chat({
    messages: [{ role: 'user', content: prompt }],
  })
}

export interface TimelineExplanationResult {
  phaseExplanations: {
    stageId: string
    stageName: string
    explanation: string
    deviation: string
  }[]
}

export async function explainTimeline(
  simulation: {
    productName: string
    referenceProductName: string
    triggerPoint: number
    phases: { stageId: string; startYear: number; endYear: number }[]
  },
  referencePhases: { stageId: string; startYear: number; endYear: number }[],
  stages: { id: string; name: string; subStages: { name: string; durationMonths: [number, number] }[] }[],
): Promise<TimelineExplanationResult> {
  const stagesText = stages
    .map((s) => {
      const subStagesText = s.subStages
        .map((ss) => `${ss.name}(${ss.durationMonths[0]}-${ss.durationMonths[1]}月)`)
        .join('、')
      return `- ${s.id}(${s.name}): ${subStagesText}`
    })
    .join('\n')

  const referenceText = referencePhases
    .sort((a, b) => a.startYear - b.startYear)
    .map((p) => `  ${p.stageId}: ${p.startYear}-${p.endYear}`)
    .join('\n')

  const simulationText = simulation.phases
    .sort((a, b) => a.startYear - b.startYear)
    .map((p) => `  ${p.stageId}: ${p.startYear}-${p.endYear}`)
    .join('\n')

  const prompt = `请为新产品「${simulation.productName}」的时间线每个阶段生成解释。

生命周期阶段定义：
${stagesText}

参考产品「${simulation.referenceProductName}」的阶段：
${referenceText}

新产品「${simulation.productName}」的阶段：
${simulationText}

请返回 JSON 数组，每个元素包含：
- stageId: 阶段ID
- stageName: 阶段中文名
- explanation: 该阶段的解释（含关键工作和时间说明，不超过80字）
- deviation: 与参考产品的偏差说明（如"比N系列晚12年"或"时长一致"）

仅返回 JSON 数组，不要其他文字：
[{"stageId":"concept","stageName":"概念与立项","explanation":"...","deviation":"..."},...]`

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: '你是产品生命周期管理（PLM）系统的 AI 助手。请严格按用户要求返回 JSON 数组，不添加额外说明。',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  })

  const rawContent = response.choices[0]?.message?.content ?? '[]'

  // Extract JSON from possible markdown code block
  let jsonText = rawContent.trim()
  const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1].trim()
  }

  // Try to find JSON array if response has extra text
  const arrayMatch = jsonText.match(/\[[\s\S]*\]/)
  if (arrayMatch) {
    jsonText = arrayMatch[0]
  }

  try {
    const phaseExplanations = JSON.parse(jsonText) as TimelineExplanationResult['phaseExplanations']
    return { phaseExplanations }
  } catch {
    // Fallback: return empty explanations
    return { phaseExplanations: [] }
  }
}
