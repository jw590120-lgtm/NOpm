import type { Product, ProductPhase, LifecycleStage } from '../types'

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
