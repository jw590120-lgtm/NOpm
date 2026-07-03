import type { Product, ProductPhase, LifecycleStage, TriggerRule, SimulationRequest, SimulationResult, CheckResult } from '../types'

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `请求失败 (${res.status})`)
  }
  return res.json()
}

// ── Products ──

export function fetchProducts(): Promise<Product[]> {
  return request<Product[]>('/products')
}

export function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  return request<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateProduct(id: string, patch: Partial<Omit<Product, 'id'>>): Promise<Product> {
  return request<Product>(`/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  })
}

export function deleteProduct(id: string): Promise<Product> {
  return request<Product>(`/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

// ── Phases (via product PATCH endpoint) ──

export function addPhase(
  productId: string,
  phase: Omit<ProductPhase, 'id'>,
): Promise<Product> {
  return request<Product>(`/products/${encodeURIComponent(productId)}/phases`, {
    method: 'PATCH',
    body: JSON.stringify({ action: 'add', ...phase }),
  })
}

export function updatePhase(
  productId: string,
  phaseId: string,
  patch: Partial<Omit<ProductPhase, 'id'>>,
): Promise<Product> {
  return request<Product>(`/products/${encodeURIComponent(productId)}/phases`, {
    method: 'PATCH',
    body: JSON.stringify({ action: 'update', phaseId, ...patch }),
  })
}

export function deletePhase(productId: string, phaseId: string): Promise<Product> {
  return request<Product>(`/products/${encodeURIComponent(productId)}/phases`, {
    method: 'PATCH',
    body: JSON.stringify({ action: 'delete', phaseId }),
  })
}

// ── Stages ──

export function fetchStages(): Promise<LifecycleStage[]> {
  return request<LifecycleStage[]>('/stages')
}

// ── Rules ──

export function fetchRules(): Promise<TriggerRule[]> {
  return request<TriggerRule[]>('/rules')
}

export function createRule(data: Omit<TriggerRule, 'id'>): Promise<TriggerRule> {
  return request<TriggerRule>('/rules', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateRule(id: string, patch: Partial<TriggerRule>): Promise<TriggerRule> {
  return request<TriggerRule>(`/rules/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  })
}

export function deleteRule(id: string): Promise<TriggerRule> {
  return request<TriggerRule>(`/rules/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

// ── Simulation ──

export function simulateTimeline(data: SimulationRequest): Promise<SimulationResult> {
  return request<SimulationResult>('/simulate', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ── Rule Check ──

export function runRuleCheck(): Promise<CheckResult> {
  return request<CheckResult>('/check', { method: 'POST' })
}

// ── AI ──

export interface AiChatResult {
  reply: string
  sessionId: string
}

export function aiChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  context?: string,
  sessionId?: string,
): Promise<AiChatResult> {
  return request<AiChatResult>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, context, sessionId }),
  })
}

export interface SessionResumeResult {
  sessionId: string
  messages: { role: 'user' | 'assistant'; content: string; timestamp: number }[]
}

export function resumeSession(sessionId: string): Promise<SessionResumeResult> {
  return request<SessionResumeResult>(`/ai/session/${encodeURIComponent(sessionId)}`)
}

export function aiAnalyzeNotification(notification: Record<string, unknown>): Promise<{ analysis: string }> {
  return request<{ analysis: string }>('/ai/analyze-notification', {
    method: 'POST',
    body: JSON.stringify({ notification }),
  })
}

export function aiAnalyzeProduct(productId: string): Promise<{ analysis: string }> {
  return request<{ analysis: string }>('/ai/analyze-product', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  })
}
