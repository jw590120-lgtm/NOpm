import { useEffect, useState } from 'react'
import { fetchDashboardStats } from '../api/client'
import type { DashboardStats } from '../types'

interface StatCard {
  key: keyof DashboardStats
  icon: string
  label: string
  color: string
  bgColor: string
  textColor: string
}

const statCards: StatCard[] = [
  {
    key: 'totalProducts',
    icon: '\u{1F4E6}',
    label: '产品总数',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  {
    key: 'inDevelopment',
    icon: '\u{1F680}',
    label: '在研产品',
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
  },
  {
    key: 'upcomingLaunches',
    icon: '\u{1F3C1}',
    label: '即将上市',
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
  {
    key: 'expiringRegistrations',
    icon: '\u{1F4CB}',
    label: '注册将到期',
    color: 'amber',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
  {
    key: 'productsInDecline',
    icon: '\u26A0\uFE0F',
    label: '衰退期产品',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
]

function SkeletonCard() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 animate-pulse min-w-[100px]">
      <div className="w-4 h-4 rounded bg-slate-200" />
      <div className="flex flex-col gap-1">
        <div className="w-6 h-4 rounded bg-slate-200" />
        <div className="w-10 h-3 rounded bg-slate-200" />
      </div>
    </div>
  )
}

export function DashboardBar() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchDashboardStats()
      .then((data) => {
        if (!cancelled) {
          setStats(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex-shrink-0 h-16 bg-white border-b border-slate-100 flex items-center gap-3 px-6 overflow-x-auto">
      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : stats ? (
        <>
          {statCards.map((card) => (
            <div
              key={card.key}
              className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg ${card.bgColor} cursor-default min-w-[100px] transition-shadow hover:shadow-sm`}
              title={`${card.label}: ${String(stats[card.key])}`}
            >
              <span className="text-base leading-none">{card.icon}</span>
              <div className="flex flex-col">
                <span className={`text-sm font-bold leading-tight ${card.textColor}`}>
                  {String(stats[card.key])}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight whitespace-nowrap">
                  {card.label}
                </span>
              </div>
            </div>
          ))}
        </>
      ) : null}
    </div>
  )
}
