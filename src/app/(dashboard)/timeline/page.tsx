'use client'
import { useEffect, useMemo, useState } from 'react'
import { useUser } from '@/components/providers/SupabaseAuthProvider'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { TimelineTask } from '@/types'
import { PageHeader } from '@/components/ui/page-header'
import {
  GraduationCap,
  FileText,
  Send,
  Plane,
  Wallet,
  Check,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Columns,
  ListChecks,
  Filter,
  ClipboardList,
  CheckCircle2,
  Clock
} from 'lucide-react'

type Task = TimelineTask & { dbId?: string }

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

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'border-t-zinc-400 dark:border-t-zinc-600 bg-muted/15 text-foreground' },
  { id: 'in_progress', label: 'In Progress', color: 'border-t-indigo-500 bg-indigo-500/5 text-foreground' },
  { id: 'submitted', label: 'Submitted', color: 'border-t-amber-500 bg-amber-500/5 text-foreground' },
  { id: 'completed', label: 'Completed', color: 'border-t-emerald-500 bg-emerald-500/5 text-foreground' }
] as const

const CATEGORY_MAP = {
  test_prep: { label: 'Test Prep', icon: GraduationCap, color: 'text-indigo-650 dark:text-indigo-400 bg-indigo-500/5 border-indigo-500/10' },
  documents: { label: 'Documents', icon: FileText, color: 'text-sky-650 dark:text-sky-400 bg-sky-500/5 border-sky-500/10' },
  applications: { label: 'Applications', icon: Send, color: 'text-amber-650 dark:text-amber-400 bg-amber-500/5 border-amber-500/10' },
  visa: { label: 'Visa', icon: Plane, color: 'text-emerald-650 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/10' },
  finance: { label: 'Finance', icon: Wallet, color: 'text-rose-650 dark:text-rose-450 bg-rose-500/5 border-rose-500/10' }
} as const

const COLUMN_EMPTY_STATES = {
  todo: {
    icon: ClipboardList,
    text: 'All caught up! Add a new custom task or click reset.'
  },
  in_progress: {
    icon: Clock,
    text: 'Move tasks here that you are actively working on.'
  },
  submitted: {
    icon: Send,
    text: 'Track submitted applications and visa requests here.'
  },
  completed: {
    icon: CheckCircle2,
    text: 'No tasks completed yet. Keep pushing!'
  }
}

const MONTH_LABELS = {
  1: 'Month 1: Early Prep & Testing',
  2: 'Month 2: Documents & Shortlisting',
  3: 'Month 3: Submission & Tracking',
  4: 'Month 4: Loans & Financial Setup',
  5: 'Month 5: Offers & Visa Process',
  6: 'Month 6: Housing & Pre-Departure'
}

type KanbanStatus = typeof COLUMNS[number]['id']

function parseStatus(t: Task): KanbanStatus {
  if (t.is_completed) return 'completed'
  const desc = t.description ?? ''
  if (desc.startsWith('[STATUS:in_progress]')) return 'in_progress'
  if (desc.startsWith('[STATUS:submitted]')) return 'submitted'
  return 'todo'
}

function cleanDescription(desc: string | null | undefined): string {
  if (!desc) return ''
  return desc.replace(/^\[STATUS:[a-z_]+\]\s*/i, '')
}

function serializeStatus(status: KanbanStatus, desc: string): string {
  if (status === 'completed' || status === 'todo') return desc
  return `[STATUS:${status}] ${desc}`
}

export default function TimelinePage() {
  const { user } = useUser()
  const [tasks, setTasks]                 = useState<Task[]>([])
  const [profileId, setProfileId]         = useState<string | null>(null)
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [saveStatus, setSaveStatus]       = useState<'idle' | 'saving' | 'saved'>('idle')
  const [activeView, setActiveView]       = useState<'kanban' | 'timeline'>('kanban')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const [showAddModal, setShowAddModal]   = useState(false)
  const [newTitle, setNewTitle]           = useState('')
  const [newCategory, setNewCategory]     = useState<'test_prep' | 'documents' | 'applications' | 'visa' | 'finance'>('test_prep')
  const [newMonth, setNewMonth]           = useState(1)

  useEffect(() => {
    if (!user) {
      const fallbackProfileId = 'adaa7e82-da12-4473-b787-a765e5c4afb4'
      setProfileId(fallbackProfileId)
      setTasks(DEFAULT_TASKS.map((t, idx) => ({ ...t, id: `mock_${idx}`, dbId: `mock_${idx}`, profile_id: fallbackProfileId })))
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('clerk_user_id', user.id)
          .single()

        if (pErr || !profile) {
          const fallbackProfileId = 'adaa7e82-da12-4473-b787-a765e5c4afb4'
          setProfileId(fallbackProfileId)
          setTasks(DEFAULT_TASKS.map((t, idx) => ({ ...t, id: `mock_${idx}`, dbId: `mock_${idx}`, profile_id: fallbackProfileId })))
          setLoading(false)
          return
        }
        setProfileId(profile.id)

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
  }, [user?.id])

  const done  = tasks.filter(t => t.is_completed).length
  const total = tasks.length
  const pct   = total ? Math.round((done / total) * 100) : 0

  function flashSaved() {
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 1400)
  }

  // Move task status via direct status change
  async function handleStatusChange(dbId: string, nextStatus: KanbanStatus) {
    const task = tasks.find(t => t.dbId === dbId)
    if (!task) return

    const isCompleted = nextStatus === 'completed'
    const cleanDesc = cleanDescription(task.description)
    const newDesc = serializeStatus(nextStatus, cleanDesc)

    setTasks(prev => prev.map(t => t.dbId === dbId ? { ...t, is_completed: isCompleted, description: newDesc } : t))
    if (dbId.startsWith('mock_')) {
      flashSaved()
      return
    }

    setSaveStatus('saving')
    const { error } = await supabase
      .from('timeline_tasks')
      .update({ is_completed: isCompleted, description: newDesc })
      .eq('id', dbId)

    if (error) {
      setSaveStatus('idle')
      return
    }
    flashSaved()
  }

  // Toggle complete checkbox
  async function toggleTaskComplete(dbId: string, isCompleted: boolean) {
    const task = tasks.find(t => t.dbId === dbId)
    if (!task) return

    const nextCompleted = !isCompleted
    const nextStatus: KanbanStatus = nextCompleted ? 'completed' : 'todo'
    const cleanDesc = cleanDescription(task.description)
    const newDesc = serializeStatus(nextStatus, cleanDesc)

    setTasks(prev => prev.map(t => t.dbId === dbId ? { ...t, is_completed: nextCompleted, description: newDesc } : t))
    if (dbId.startsWith('mock_')) {
      flashSaved()
      return
    }

    setSaveStatus('saving')
    const { error } = await supabase
      .from('timeline_tasks')
      .update({ is_completed: nextCompleted, description: newDesc })
      .eq('id', dbId)

    if (error) {
      setSaveStatus('idle')
      return
    }
    flashSaved()
  }

  // Move task status via left/right arrows
  async function moveTask(dbId: string, direction: 'left' | 'right') {
    const task = tasks.find(t => t.dbId === dbId)
    if (!task) return

    const currentStatus = parseStatus(task)
    let nextStatus: KanbanStatus = 'todo'

    if (direction === 'right') {
      if (currentStatus === 'todo') nextStatus = 'in_progress'
      else if (currentStatus === 'in_progress') nextStatus = 'submitted'
      else if (currentStatus === 'submitted') nextStatus = 'completed'
    } else {
      if (currentStatus === 'completed') nextStatus = 'submitted'
      else if (currentStatus === 'submitted') nextStatus = 'in_progress'
      else if (currentStatus === 'in_progress') nextStatus = 'todo'
    }

    await handleStatusChange(dbId, nextStatus)
  }

  async function deleteTask(dbId: string) {
    setTasks(prev => prev.filter(t => t.dbId !== dbId))
    if (dbId.startsWith('mock_')) {
      flashSaved()
      return
    }

    setSaveStatus('saving')
    await supabase.from('timeline_tasks').delete().eq('id', dbId)
    flashSaved()
  }

  async function handleAddTask() {
    const title = newTitle.trim()
    if (!title || !profileId) return

    if (tasks.some(t => t.dbId?.startsWith('mock_'))) {
      const newMockId = `mock_${Date.now()}`
      setTasks(prev => [...prev, {
        dbId: newMockId,
        id: newMockId,
        profile_id: profileId,
        title,
        category: newCategory,
        due_month: newMonth,
        is_completed: false,
        description: '[STATUS:todo]'
      }])
      flashSaved()
      setShowAddModal(false)
      setNewTitle('')
      return
    }

    setSaveStatus('saving')
    const { data, error } = await supabase
      .from('timeline_tasks')
      .insert({ 
        profile_id: profileId, 
        title, 
        category: newCategory, 
        due_month: newMonth, 
        is_completed: false,
        description: '[STATUS:todo]'
      })
      .select()
      .single()
    
    if (!error && data) {
      setTasks(prev => [...prev, { ...data, dbId: data.id }])
      flashSaved()
    } else {
      setSaveStatus('idle')
    }
    setShowAddModal(false)
    setNewTitle('')
  }

  async function resetToDefaults() {
    if (!profileId) return
    if (!confirm('Reset to the default 6-month roadmap? This removes all current and custom tasks.')) return

    if (tasks.some(t => t.dbId?.startsWith('mock_'))) {
      const fallbackProfileId = 'adaa7e82-da12-4473-b787-a765e5c4afb4'
      setTasks(DEFAULT_TASKS.map((t, idx) => ({ ...t, id: `mock_${idx}`, dbId: `mock_${idx}`, profile_id: fallbackProfileId })))
      flashSaved()
      return
    }

    setSaveStatus('saving')
    await supabase.from('timeline_tasks').delete().eq('profile_id', profileId)
    const toInsert = DEFAULT_TASKS.map(t => ({ ...t, profile_id: profileId }))
    const { data } = await supabase.from('timeline_tasks').insert(toInsert).select()
    setTasks((data ?? []).map((t) => ({ ...t, dbId: t.id })))
    flashSaved()
  }

  // Group tasks by Kanban column status, taking category filtering into account
  const kanbanColumns = useMemo(() => {
    const cols: Record<KanbanStatus, Task[]> = { todo: [], in_progress: [], submitted: [], completed: [] }
    const filteredTasks = selectedCategory === 'all' 
      ? tasks 
      : tasks.filter(t => t.category === selectedCategory)

    for (const t of filteredTasks) {
      const status = parseStatus(t)
      cols[status].push(t)
    }
    return cols
  }, [tasks, selectedCategory])

  // Group tasks by month for Chronological view
  const tasksByMonth = useMemo(() => {
    const months: Record<number, Task[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
    for (const t of tasks) {
      if (months[t.due_month]) {
        months[t.due_month].push(t)
      } else {
        months[t.due_month] = [t]
      }
    }
    return months
  }, [tasks])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-48" />
        <div className="h-24 bg-muted rounded-xl" />
        <div className="grid grid-cols-4 gap-4 h-96">
          {[1,2,3,4].map(i => <div key={i} className="bg-muted rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!profileId) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-center py-16 bg-card border border-border rounded-xl shadow-sm">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-sm font-bold text-foreground mb-1">Complete your profile first</p>
          <p className="text-xs text-muted-foreground mb-4">
            We will set up your personalized study abroad roadmap once your profile is completed.
          </p>
          <Link href="/profile"
            className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            Complete Profile →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <PageHeader
        title="Application Timeline"
        subtitle="Manage tasks across your Kanban board stages or view your chronological roadmap."
        actions={
          <div className="flex items-center gap-3">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>
        }
      />

      {/* Progress Card */}
      <div className="bg-card border border-border rounded-xl p-5 my-6 flex items-center justify-between shadow-xs">
        <div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Overall Milestone Progress</p>
          <h3 className="text-lg font-bold text-foreground mt-1">{pct}% Complete ({done} / {total} Tasks)</h3>
        </div>
        <div className="w-44 bg-muted h-2.5 rounded-full overflow-hidden shrink-0">
          <div className="h-full bg-indigo-650 dark:bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Filters and View Switcher Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/15 border border-border/80 rounded-xl p-4 my-6">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3 text-muted-foreground/60" /> Filter:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-foreground text-background border-foreground dark:bg-white dark:text-black'
                : 'bg-card text-muted-foreground border-border/80 hover:text-foreground hover:border-muted-foreground/30'
            }`}
          >
            All ({tasks.length})
          </button>
          {Object.entries(CATEGORY_MAP).map(([catKey, cat]) => {
            const count = tasks.filter(t => t.category === catKey).length
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                  selectedCategory === catKey
                    ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                    : 'bg-card text-muted-foreground border-border/80 hover:text-foreground hover:border-muted-foreground/30'
                }`}
              >
                <cat.icon className="w-3 h-3" />
                {cat.label} ({count})
              </button>
            )
          })}
        </div>

        {/* View Switcher Segmented Control */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50 shrink-0">
          <button
            onClick={() => setActiveView('kanban')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'kanban'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            Kanban
          </button>
          <button
            onClick={() => setActiveView('timeline')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'timeline'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            Roadmap
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs leading-relaxed flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Kanban Board View */}
      {activeView === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start select-none">
          {COLUMNS.map(col => {
            const colTasks = kanbanColumns[col.id]
            return (
              <div key={col.id} className={`rounded-xl border-t-2 border border-border/50 shadow-xs p-4 flex flex-col h-[600px] ${col.color}`}>
                {/* Column Title */}
                <div className="flex justify-between items-center mb-4 border-b border-border/20 pb-2 shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider">{col.label}</span>
                  <span className="text-[10px] font-bold bg-card border border-border/50 px-2 py-0.5 rounded-md text-foreground">{colTasks.length}</span>
                </div>

                {/* Cards List - Contained with scrollbar */}
                <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/15 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
                  {colTasks.length === 0 && (() => {
                    const state = COLUMN_EMPTY_STATES[col.id]
                    const EmptyIcon = state.icon
                    return (
                      <div className="flex flex-col items-center justify-center border border-dashed border-border/60 rounded-xl p-5 text-center min-h-[140px] mt-2 bg-muted/5 dark:bg-muted/2">
                        <EmptyIcon className="w-5 h-5 text-muted-foreground/30 mb-1.5 stroke-[1.5]" />
                        <p className="text-[10px] text-muted-foreground leading-normal font-medium max-w-[120px]">
                          {state.text}
                        </p>
                      </div>
                    )
                  })()}
                  
                  {colTasks.map(task => (
                    <div key={task.dbId} className="bg-card border border-border rounded-xl p-3 shadow-xs hover:border-muted-foreground/30 hover:shadow-sm transition-all duration-200 group relative">
                      <p className="text-xs font-bold text-foreground leading-relaxed pr-6">{task.title}</p>
                      
                      <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[9px] uppercase bg-muted/60 border border-border/50 text-foreground px-1.5 py-0.5 rounded-md">
                            M{task.due_month}
                          </span>
                          {task.category && CATEGORY_MAP[task.category as keyof typeof CATEGORY_MAP] && (() => {
                            const cat = CATEGORY_MAP[task.category as keyof typeof CATEGORY_MAP];
                            const CatIcon = cat.icon;
                            return (
                              <span className={`inline-flex items-center gap-1 font-bold text-[9px] px-1.5 py-0.5 rounded-md border ${cat.color}`}>
                                <CatIcon className="w-2.5 h-2.5" />
                                {cat.label}
                              </span>
                            );
                          })()}
                        </div>
                        
                        {/* Left/Right controls */}
                        <div className="flex gap-1 items-center">
                          {col.id !== 'todo' && (
                            <button 
                              onClick={() => moveTask(task.dbId!, 'left')} 
                              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-indigo-650 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                              title="Move back"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {col.id !== 'completed' && (
                            <button 
                              onClick={() => moveTask(task.dbId!, 'right')} 
                              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-indigo-650 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                              title="Move forward"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteTask(task.dbId!)} 
                            className="p-1 hover:bg-red-500/10 rounded text-muted-foreground/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer animate-in fade-in"
                            title="Delete task"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 2. Chronological Roadmap View */}
      {activeView === 'timeline' && (
        <div className="relative border-l border-border/80 pl-6 ml-4 space-y-8 select-none">
          {([1, 2, 3, 4, 5, 6] as const).map(month => {
            const monthTasks = tasksByMonth[month] || []
            const filteredMonthTasks = selectedCategory === 'all' 
              ? monthTasks 
              : monthTasks.filter(t => t.category === selectedCategory)
            
            if (filteredMonthTasks.length === 0 && selectedCategory !== 'all') return null;

            return (
              <div key={month} className="relative animate-in fade-in duration-300">
                {/* Timeline node */}
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border border-border bg-card flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-655 dark:bg-indigo-400 animate-pulse" />
                </div>

                {/* Month header */}
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    {MONTH_LABELS[month]}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    {filteredMonthTasks.length} task{filteredMonthTasks.length !== 1 ? 's' : ''} active
                  </p>
                </div>

                {/* Tasks List */}
                {filteredMonthTasks.length === 0 ? (
                  <div className="p-4 bg-muted/5 border border-dashed border-border rounded-xl text-center">
                    <p className="text-xs text-muted-foreground italic font-medium">No tasks found for this month under this filter.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredMonthTasks.map(task => {
                      const status = parseStatus(task)
                      return (
                        <div key={task.dbId} className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-muted-foreground/30 hover:shadow-sm transition-all duration-200 group relative">
                          <div className="flex items-start gap-2.5">
                            {/* Interactive complete checkbox */}
                            <button
                              onClick={() => toggleTaskComplete(task.dbId!, task.is_completed)}
                              className={`mt-0.5 w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                                task.is_completed 
                                  ? 'bg-emerald-500 border-emerald-500 text-white dark:bg-emerald-600 dark:border-emerald-600' 
                                  : 'border-border hover:border-indigo-500 bg-background'
                              }`}
                              title={task.is_completed ? 'Mark incomplete' : 'Mark complete'}
                            >
                              {task.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>
                            
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-bold leading-relaxed text-foreground ${task.is_completed ? 'line-through text-muted-foreground/75 font-normal' : ''}`}>
                                {task.title}
                              </p>
                            </div>
                          </div>

                          {/* Controls row */}
                          <div className="flex items-center justify-between mt-4 border-t border-border/40 pt-3">
                            <div className="flex items-center gap-1.5">
                              {task.category && CATEGORY_MAP[task.category as keyof typeof CATEGORY_MAP] && (() => {
                                const cat = CATEGORY_MAP[task.category as keyof typeof CATEGORY_MAP];
                                const CatIcon = cat.icon;
                                return (
                                  <span className={`inline-flex items-center gap-1 font-bold text-[9px] px-1.5 py-0.5 rounded-md border ${cat.color}`}>
                                    <CatIcon className="w-2.5 h-2.5" />
                                    {cat.label}
                                  </span>
                                );
                              })()}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Direct Status Selector */}
                              <select
                                value={status}
                                onChange={(e) => handleStatusChange(task.dbId!, e.target.value as KanbanStatus)}
                                className={`text-[9px] font-bold uppercase rounded-md border px-1.5 py-0.5 bg-background cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                  status === 'completed' ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
                                  status === 'submitted' ? 'text-amber-600 dark:text-amber-400 border-amber-500/20 bg-amber-500/5' :
                                  status === 'in_progress' ? 'text-indigo-650 dark:text-indigo-400 border-indigo-500/20 bg-indigo-500/5' :
                                  'text-muted-foreground border-border/60'
                                }`}
                              >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="submitted">Submitted</option>
                                <option value="completed">Completed</option>
                              </select>

                              {/* Delete task */}
                              <button 
                                onClick={() => deleteTask(task.dbId!)} 
                                className="p-1 hover:bg-red-500/10 rounded text-muted-foreground/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-lg space-y-4 animate-in zoom-in duration-200">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Create Custom Task</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">Task Title</label>
                <input 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 dark:focus-visible:ring-indigo-500 focus-visible:border-indigo-600 dark:focus-visible:border-indigo-500 transition-shadow" 
                  placeholder="e.g. Schedule biometric visa appointment" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">Category</label>
                  <select 
                    value={newCategory} 
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full bg-background border border-border rounded-xl px-2 py-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 dark:focus-visible:ring-indigo-500 focus-visible:border-indigo-600 dark:focus-visible:border-indigo-500 transition-shadow"
                  >
                    <option value="test_prep">Test Prep</option>
                    <option value="documents">Documents</option>
                    <option value="applications">Applications</option>
                    <option value="visa">Visa</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">Due Month</label>
                  <select 
                    value={newMonth} 
                    onChange={e => setNewMonth(parseInt(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-2 py-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 dark:focus-visible:ring-indigo-500 focus-visible:border-indigo-600 dark:focus-visible:border-indigo-500 transition-shadow"
                  >
                    {[1, 2, 3, 4, 5, 6].map(m => <option key={m} value={m}>Month {m}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => setShowAddModal(false)} 
                className="px-3.5 py-2 border border-border text-muted-foreground hover:text-foreground text-xs font-semibold rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddTask} 
                disabled={!newTitle.trim()} 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 cursor-pointer transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset options */}
      <div className="mt-8 text-center flex items-center justify-between border-t border-border pt-6">
        <button onClick={resetToDefaults}
          className="text-xs text-muted-foreground hover:text-red-500 font-semibold transition-colors cursor-pointer">
          Reset Timeline Board
        </button>
        <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold italic flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          Click Checkbox, status dropdowns, or chevron controls on task cards to transition their status.
        </p>
      </div>
    </div>
  )
}