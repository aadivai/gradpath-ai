// src/app/(dashboard)/timeline/page.tsx
'use client'
import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { TimelineTask } from '@/types'
import {
  GraduationCap, FileText, Send, Plane, Wallet,
  Check, Plus, Trash2, ChevronDown, ChevronRight,
  Loader2, X,
} from 'lucide-react'

type Task = TimelineTask & { dbId?: string }
type IconType = ComponentType<{ className?: string }>

const DEFAULT_TASKS: Omit<TimelineTask, 'id'>[] = [
  { title: 'Take IELTS / TOEFL exam',        category: 'test_prep',    due_month: 1, is_completed: false },
  { title: 'Prepare SOP first draft',         category: 'documents',    due_month: 2, is_completed: false },
  { title: 'Request recommendation letters',  category: 'documents',    due_month: 2, is_completed: false },
  { title: 'Shortlist 10–15 universities',    category: 'applications', due_month: 2, is_completed: false },
  { title: 'Submit all applications',         category: 'applications', due_month: 3, is_completed: false },
  { title: 'Follow up on application status', category: 'applications', due_month: 4, is_completed: false },
  { title: 'Compare offer letters',           category: 'applications', due_month: 5, is_completed: false },
  { title: 'Start visa application',          category: 'visa',         due_month: 5, is_completed: false },
  { title: 'Arrange accommodation',           category: 'visa',         due_month: 5, is_completed: false },
  { title: 'Apply for education loan',        category: 'finance',      due_month: 4, is_completed: false },
  { title: 'Book flights',                    category: 'finance',      due_month: 6, is_completed: false },
]

const CATEGORY_ORDER = ['test_prep', 'documents', 'applications', 'visa', 'finance'] as const

const CATEGORY_META: Record<string, { label: string; icon: IconType; color: string; bg: string; bar: string }> = {
  test_prep:    { label: 'Test prep',    icon: GraduationCap, color: 'text-blue-600',   bg: 'bg-blue-50',   bar: 'bg-blue-500' },
  documents:    { label: 'Documents',    icon: FileText,      color: 'text-purple-600', bg: 'bg-purple-50', bar: 'bg-purple-500' },
  applications: { label: 'Applications', icon: Send,          color: 'text-indigo-600', bg: 'bg-indigo-50', bar: 'bg-indigo-500' },
  visa:         { label: 'Visa',         icon: Plane,         color: 'text-amber-600',  bg: 'bg-amber-50',  bar: 'bg-amber-500' },
  finance:      { label: 'Finance',      icon: Wallet,        color: 'text-green-600',  bg: 'bg-green-50',  bar: 'bg-green-500' },
}

const DEFAULT_MONTH: Record<string, number> = {
  test_prep: 1, documents: 2, applications: 3, visa: 5, finance: 5,
}

function getMotivation(pct: number, total: number) {
  if (total === 0) return { emoji: '📋', text: 'Your roadmap is being prepared...' }
  if (pct === 100) return { emoji: '🎉', text: "Every step done — you're ready for the next chapter." }
  if (pct === 0)   return { emoji: '🚀', text: 'Every journey starts with one step. Pick a task below.' }
  if (pct < 25)    return { emoji: '✨', text: 'Good start — keep the momentum going.' }
  if (pct < 50)    return { emoji: '💪', text: "Solid progress. You're building real momentum." }
  if (pct < 75)    return { emoji: '🔥', text: 'More than halfway there. Stay consistent.' }
  return              { emoji: '🏁', text: 'Almost there — the finish line is close.' }
}

// --- Progress ring ---
function ProgressRing({ percent }: { percent: number }) {
  const size = 84, stroke = 7
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - percent / 100)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EEF2FF" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#4F46E5" strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 700ms ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-semibold text-gray-900">{percent}%</span>
      </div>
    </div>
  )
}

// --- Visual roadmap strip ---
function RoadmapStrip({ tasks, currentMonth }: { tasks: Task[]; currentMonth: number }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5, 6].map((m, i) => {
        const monthTasks = tasks.filter(t => t.due_month === m)
        const done  = monthTasks.filter(t => t.is_completed).length
        const total = monthTasks.length
        const complete = total > 0 && done === total
        const isCurrent = m === currentMonth && !complete
        return (
          <div key={m} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 group relative">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all
                ${complete ? 'bg-green-500 border-green-500 text-white' :
                  isCurrent ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100' :
                  'bg-white border-gray-200 text-gray-400'}`}>
                {complete ? <Check className="w-4 h-4" strokeWidth={3} /> : m}
              </div>
              <span className={`text-[11px] ${isCurrent ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                Month {m}
              </span>
              {total > 0 && (
                <div className="absolute -top-8 px-2 py-1 bg-gray-900 text-white text-[10px] rounded-md
                  opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {done}/{total} done
                </div>
              )}
            </div>
            {i < 5 && (
              <div className="flex-1 h-0.5 mx-1 mb-5 rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${complete ? 'bg-green-400 w-full' : 'w-0'}`} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// --- Task row ---
function TaskRow({ task, onToggle, onDelete }: {
  task: Task
  onToggle: (dbId: string, current: boolean) => void
  onDelete: (dbId: string) => void
}) {
  if (!task.dbId) return null
  return (
    <div className="group flex items-center gap-3 p-3 bg-gray-50 hover:bg-white border border-transparent
      hover:border-gray-200 hover:shadow-sm rounded-lg transition-all">
      <button
        onClick={() => onToggle(task.dbId!, task.is_completed)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all hover:scale-110
          ${task.is_completed ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 hover:border-indigo-400'}`}
      >
        {task.is_completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </button>

      <p className={`flex-1 text-sm transition-colors ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
        {task.title}
      </p>

      <span className="text-[11px] text-gray-400 shrink-0">Month {task.due_month}</span>

      <button
        onClick={() => onDelete(task.dbId!)}
        className="shrink-0 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
        title="Delete task"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// --- Category section ---
function CategorySection({
  category, tasks, collapsed, onToggleCollapse, onToggleTask, onDeleteTask,
  isAdding, onStartAdd, onCancelAdd, newTitle, setNewTitle, newMonth, setNewMonth, onAddTask,
}: {
  category: string
  tasks: Task[]
  collapsed: boolean
  onToggleCollapse: () => void
  onToggleTask: (dbId: string, current: boolean) => void
  onDeleteTask: (dbId: string) => void
  isAdding: boolean
  onStartAdd: () => void
  onCancelAdd: () => void
  newTitle: string
  setNewTitle: (v: string) => void
  newMonth: number
  setNewMonth: (v: number) => void
  onAddTask: () => void
}) {
  const meta  = CATEGORY_META[category]
  const Icon  = meta.icon
  const done  = tasks.filter(t => t.is_completed).length
  const total = tasks.length
  const pct   = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={onToggleCollapse}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${meta.bg}`}>
          <Icon className={`w-4 h-4 ${meta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold text-gray-900">{meta.label}</span>
            <span className="text-xs text-gray-400">{done}/{total}</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden w-full max-w-[140px]">
            <div className={`h-full transition-all duration-500 ${pct === 100 && total > 0 ? 'bg-green-500' : meta.bar}`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>
        {collapsed ? <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-2">
          {total === 0 && !isAdding && (
            <p className="text-xs text-gray-400 py-2 text-center">No tasks yet in this category.</p>
          )}

          {tasks.map(task => (
            <TaskRow key={task.dbId} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} />
          ))}

          {isAdding ? (
            <div className="flex items-center gap-2 p-2 bg-indigo-50/50 border border-indigo-100 rounded-lg">
              <input
                autoFocus
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onAddTask(); if (e.key === 'Escape') onCancelAdd() }}
                placeholder="Task name..."
                className="flex-1 text-sm bg-white border border-gray-200 rounded-md px-2.5 py-1.5
                  focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <select value={newMonth} onChange={e => setNewMonth(parseInt(e.target.value))}
                className="text-xs border border-gray-200 rounded-md px-1.5 py-1.5 bg-white text-gray-600">
                {[1, 2, 3, 4, 5, 6].map(m => <option key={m} value={m}>Month {m}</option>)}
              </select>
              <button onClick={onAddTask}
                className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors shrink-0">
                Add
              </button>
              <button onClick={onCancelAdd} className="text-gray-400 hover:text-gray-600 p-1 shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={onStartAdd}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400
                hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors
                border border-dashed border-gray-200 hover:border-indigo-200">
              <Plus className="w-3.5 h-3.5" /> Add task
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// --- Main page ---
export default function TimelinePage() {
  const { user } = useUser()
  const [tasks, setTasks]           = useState<Task[]>([])
  const [profileId, setProfileId]   = useState<string | null>(null)
  const [createdAt, setCreatedAt]   = useState<string | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [collapsed, setCollapsed]   = useState<Set<string>>(new Set())
  const [addingTo, setAddingTo]     = useState<string | null>(null)
  const [newTitle, setNewTitle]     = useState('')
  const [newMonth, setNewMonth]     = useState(1)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('id, created_at')
          .eq('clerk_user_id', user.id)
          .single()

        if (pErr || !profile) { setLoading(false); return }
        setProfileId(profile.id)
        setCreatedAt(profile.created_at)

        const { data, error: tErr } = await supabase
          .from('timeline_tasks').select('*').eq('profile_id', profile.id)

        if (tErr) throw tErr

        if (data && data.length > 0) {
          setTasks(data.map((t) => ({ ...t, dbId: t.id })))
        } else {
          const toInsert = DEFAULT_TASKS.map(t => ({ ...t, profile_id: profile.id }))
          const { data: inserted, error: iErr } = await supabase
            .from('timeline_tasks').insert(toInsert).select()
          if (iErr) throw iErr
          setTasks((inserted ?? []).map((t) => ({ ...t, dbId: t.id })))
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load timeline')
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  const currentMonth = useMemo(() => {
    if (!createdAt) return 1
    const created = new Date(createdAt)
    const now = new Date()
    const diff = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth())
    return Math.min(Math.max(diff + 1, 1), 6)
  }, [createdAt])

  const groups = useMemo(() => {
    const g: Record<string, Task[]> = { test_prep: [], documents: [], applications: [], visa: [], finance: [] }
    for (const t of tasks) g[t.category]?.push(t)
    Object.values(g).forEach(arr => arr.sort((a, b) => a.due_month - b.due_month))
    return g
  }, [tasks])

  const done  = tasks.filter(t => t.is_completed).length
  const total = tasks.length
  const pct   = total ? Math.round((done / total) * 100) : 0
  const motivation = getMotivation(pct, total)

  function flashSaved() {
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 1400)
  }

  async function toggleTask(dbId: string, current: boolean) {
    setTasks(prev => prev.map(t => t.dbId === dbId ? { ...t, is_completed: !current } : t))
    setSaveStatus('saving')
    const { error } = await supabase.from('timeline_tasks').update({ is_completed: !current }).eq('id', dbId)
    if (error) {
      setTasks(prev => prev.map(t => t.dbId === dbId ? { ...t, is_completed: current } : t))
      setSaveStatus('idle')
      return
    }
    flashSaved()
  }

  async function deleteTask(dbId: string) {
    setTasks(prev => prev.filter(t => t.dbId !== dbId))
    setSaveStatus('saving')
    await supabase.from('timeline_tasks').delete().eq('id', dbId)
    flashSaved()
  }

  async function addTask() {
    const title = newTitle.trim()
    if (!title || !addingTo || !profileId) return
    setSaveStatus('saving')
    const { data, error } = await supabase
      .from('timeline_tasks')
      .insert({ profile_id: profileId, title, category: addingTo, due_month: newMonth, is_completed: false })
      .select()
      .single()
    if (!error && data) {
      setTasks(prev => [...prev, { ...data, dbId: data.id }])
      flashSaved()
    } else {
      setSaveStatus('idle')
    }
    setAddingTo(null)
    setNewTitle('')
  }

  function startAdd(category: string) {
    setAddingTo(category)
    setNewTitle('')
    setNewMonth(DEFAULT_MONTH[category] ?? 1)
  }

  function toggleCategory(category: string) {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  async function resetToDefaults() {
    if (!profileId) return
    if (!confirm('Reset to the default 6-month roadmap? This removes all current and custom tasks.')) return
    setSaveStatus('saving')
    await supabase.from('timeline_tasks').delete().eq('profile_id', profileId)
    const toInsert = DEFAULT_TASKS.map(t => ({ ...t, profile_id: profileId }))
    const { data } = await supabase.from('timeline_tasks').insert(toInsert).select()
    setTasks((data ?? []).map((t) => ({ ...t, dbId: t.id })))
    flashSaved()
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-48" />
        <div className="h-24 bg-gray-100 rounded-xl" />
        <div className="h-28 bg-gray-100 rounded-xl" />
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
      </div>
    )
  }

  if (!profileId) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-sm font-medium text-gray-700 mb-1">Complete your profile first</p>
          <p className="text-xs text-gray-400 mb-4">
            We&apos;ll set up a personalized 6-month roadmap once your profile is ready.
          </p>
          <Link href="/profile"
            className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
            Complete profile →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Application timeline</h1>
          <p className="text-sm text-gray-500 mt-1">Track every step of your study abroad journey.</p>
        </div>
        <div className="shrink-0 mt-1">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-xs text-green-600">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          {saveStatus === 'idle' && <span className="text-xs text-gray-300">Auto-saves</span>}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
      )}

      {/* Hero progress */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6 flex items-center gap-5">
        <ProgressRing percent={pct} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
            <span>{motivation.emoji}</span> {motivation.text}
          </p>
          <p className="text-xs text-gray-400 mt-1">{done} of {total} tasks completed</p>
        </div>
      </div>

      {/* Roadmap */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 pt-6 mb-6">
        <p className="text-xs font-medium text-gray-500 mb-5">Your 6-month roadmap</p>
        <RoadmapStrip tasks={tasks} currentMonth={currentMonth} />
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {CATEGORY_ORDER.map(cat => (
          <CategorySection
            key={cat}
            category={cat}
            tasks={groups[cat]}
            collapsed={collapsed.has(cat)}
            onToggleCollapse={() => toggleCategory(cat)}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            isAdding={addingTo === cat}
            onStartAdd={() => startAdd(cat)}
            onCancelAdd={() => { setAddingTo(null); setNewTitle('') }}
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            newMonth={newMonth}
            setNewMonth={setNewMonth}
            onAddTask={addTask}
          />
        ))}
      </div>

      {/* Tip */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
        <p className="font-semibold mb-1">💡 Timeline tip</p>
        <p>Start 6–9 months before your target intake. IELTS should be done by Month 2, and visa applications should begin by Month 5.</p>
      </div>

      <button onClick={resetToDefaults}
        className="w-full mt-4 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
        Reset to default roadmap
      </button>
    </div>
  )
}