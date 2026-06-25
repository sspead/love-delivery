import {
  format,
  formatDistanceToNow,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  parseISO,
  isToday,
  isYesterday,
  format as formatDate,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function formatRelativeTime(dateStr: string): string {
  const date = parseISO(dateStr)
  const now = new Date()
  const mins = differenceInMinutes(now, date)
  const hours = differenceInHours(now, date)
  const days = differenceInDays(now, date)

  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return format(date, 'MM月dd日', { locale: zhCN })
}

export function formatFullDate(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy年MM月dd日', { locale: zhCN })
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'MM/dd', { locale: zhCN })
}

export function getDaysTogether(startDate: string): number {
  return differenceInDays(new Date(), parseISO(startDate))
}

export function getDaysUntil(targetDate: string): number {
  return differenceInDays(parseISO(targetDate), new Date())
}

export function isAnniversaryToday(targetDate: string): boolean {
  const d = parseISO(targetDate)
  const today = new Date()
  return d.getMonth() === today.getMonth() && d.getDate() === today.getDate()
}

export function getNextAnniversary(targetDateStr: string): Date {
  const target = parseISO(targetDateStr)
  const today = new Date()
  const thisYear = new Date(today.getFullYear(), target.getMonth(), target.getDate())
  if (thisYear > today) return thisYear
  return new Date(today.getFullYear() + 1, target.getMonth(), target.getDate())
}

export function formatCheckDate(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return '今天'
  if (isYesterday(date)) return '昨天'
  return formatDate(date, 'MM/dd')
}

export function getAnniversaryProgress(targetDateStr: string): number {
  const target = parseISO(targetDateStr)
  const today = new Date()
  const lastAnniversary = new Date(today.getFullYear() - 1, target.getMonth(), target.getDate())
  const nextAnniversary = new Date(today.getFullYear(), target.getMonth(), target.getDate())
  if (nextAnniversary <= today) {
    // We've passed this year's anniversary
    const adjustedLast = new Date(today.getFullYear(), target.getMonth(), target.getDate())
    const adjustedNext = new Date(today.getFullYear() + 1, target.getMonth(), target.getDate())
    const total = differenceInDays(adjustedNext, adjustedLast)
    const elapsed = differenceInDays(today, adjustedLast)
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
  }
  const total = differenceInDays(nextAnniversary, lastAnniversary)
  const elapsed = differenceInDays(today, lastAnniversary)
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}
