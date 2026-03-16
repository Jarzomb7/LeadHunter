import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Platform, LeadStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const hours = diff / (1000 * 60 * 60)

  if (hours < 1) return `${Math.floor(diff / 60000)}m ago`
  if (hours < 24) return `${Math.floor(hours)}h ago`
  if (hours < 48) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatFullDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const platformConfig: Record<Platform, { label: string; color: string; bg: string }> = {
  facebook: { label: 'Facebook', color: '#1877f2', bg: '#1877f222' },
  linkedin: { label: 'LinkedIn', color: '#0a66c2', bg: '#0a66c222' },
  useme: { label: 'Useme', color: '#ff6b35', bg: '#ff6b3522' },
  freelancer: { label: 'Freelancer', color: '#29b2fe', bg: '#29b2fe22' },
  upwork: { label: 'Upwork', color: '#14a800', bg: '#14a80022' },
  twitter: { label: 'Twitter/X', color: '#e7e9ea', bg: '#e7e9ea22' },
  reddit: { label: 'Reddit', color: '#ff4500', bg: '#ff450022' },
  other: { label: 'Other', color: '#8892a4', bg: '#8892a422' },
}

export const statusConfig: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: '#5aa2ff', bg: '#5aa2ff22' },
  contacted: { label: 'Contacted', color: '#f59e0b', bg: '#f59e0b22' },
  negotiation: { label: 'Negotiation', color: '#a855f7', bg: '#a855f722' },
  won: { label: 'Won', color: '#22c55e', bg: '#22c55e22' },
  lost: { label: 'Lost', color: '#ef4444', bg: '#ef444422' },
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#5aa2ff'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
