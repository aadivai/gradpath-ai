'use client'
import { useEffect, useMemo, useState } from 'react'
import { useUser } from '@/components/providers/SupabaseAuthProvider'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { TimelineTask } from '@/types'
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
  AlertCircle
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
  { id: 'todo', label: 'To Do', color: 'border-t-slate-400 bg-muted/40 text-foreground' },
  { id: 'in_progress', label: 'In Progress', color: 'border-t-indigo-500 bg-indigo-500/5 text-foreground' },
  { id: 'submitted', label: 'Submitted', color: 'border-t-amber-500 bg-amber-500/5 text-foreground' },
  { id: 'completed', label: 'Completed', color: 'border-t-emerald-500 bg-emerald-500/5 text-foreground' }
] as const

type KanbanStatus = typeof COLUMNS[number]['id']

// Serialization helper to encode Kanban status inside the description column
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
  const [tasks, setTasks]           = useState<Task[]>([])
  const [profileId, setProfileId]   = useState<string | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  
  // Custom new task input state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<'test_prep' | 'documents' | 'applications' | 'visa' | 'finance'>('test_prep')
  const [newMonth, setNewMonth] = useState(1)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('clerk_user_id', user.id)
          .single()

        if (pErr || !profile) { setLoading(false); return }
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

  // Move task status
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

    const isCompleted = nextStatus === 'completed'
    const cleanDesc = cleanDescription(task.description)
    const newDesc = serializeStatus(nextStatus, cleanDesc)

    setTasks(prev => prev.map(t => t.dbId === dbId ? { ...t, is_completed: isCompleted, description: newDesc } : t))
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

  async function deleteTask(dbId: string) {
    setTasks(prev => prev.filter(t => t.dbId !== dbId))
    setSaveStatus('saving')
    await supabase.from('timeline_tasks').delete().eq('id', dbId)
    flashSaved()
  }

  async function handleAddTask() {
    const title = newTitle.trim()
    if (!title || !profileId) return
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
    setSaveStatus('saving')
    await supabase.from('timeline_tasks').delete().eq('profile_id', profileId)
    const toInsert = DEFAULT_TASKS.map(t => ({ ...t, profile_id: profileId }))
    const { data } = await supabase.from('timeline_tasks').insert(toInsert).select()
    setTasks((data ?? []).map((t) => ({ ...t, dbId: t.id })))
    flashSaved()
  }

  // Group tasks by Kanban column status
  const kanbanColumns = useMemo(() => {
    const cols: Record<KanbanStatus, Task[]> = { todo: [], in_progress: [], submitted: [], completed: [] }
    for (const t of tasks) {
      const status = parseStatus(t)
      cols[status].push(t)
    }
    return cols
  }, [tasks])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-4 animate-pulse">
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
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Application Timeline</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage tasks across your Kanban board board stages.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
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
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> New Task
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-card border border-border rounded-xl p-5 mb-8 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Overall Milestone Progress</p>
          <h3 className="text-xl font-bold text-foreground mt-1">{pct}% Complete ({done} / {total} Tasks)</h3>
        </div>
        <div className="w-32 bg-muted h-2.5 rounded-full overflow-hidden shrink-0">
          <div className="h-full bg-indigo-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start select-none">
        {COLUMNS.map(col => {
          const colTasks = kanbanColumns[col.id]
          return (
            <div key={col.id} className={`rounded-xl border-t-4 border border-border/50 shadow-sm p-4 flex flex-col min-h-[400px] ${col.color}`}>
              {/* Column Title */}
              <div className="flex justify-between items-center mb-4 border-b border-border/20 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider">{col.label}</span>
                <span className="text-[10px] font-bold bg-card/70 px-2 py-0.5 rounded-md border border-border/10">{colTasks.length}</span>
              </div>

              {/* Cards List */}
              <div className="space-y-2 flex-1 overflow-y-auto">
                {colTasks.length === 0 && (
                  <p className="text-[10px] text-muted-foreground/80 text-center py-6 italic font-medium">Empty column</p>
                )}
                {colTasks.map(task => (
                  <div key={task.dbId} className="bg-card border border-border rounded-xl p-3 shadow-xs hover:border-indigo-500/30 hover:shadow transition-all duration-200 group relative">
                    <p className="text-xs font-bold text-foreground leading-relaxed pr-6">{task.title}</p>
                    
                    <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                      <span className="font-semibold uppercase bg-muted border border-border text-muted-foreground px-1.5 py-0.5 rounded-md">
                        M{task.due_month}
                      </span>
                      
                      {/* Left/Right controls */}
                      <div className="flex gap-1">
                        {col.id !== 'todo' && (
                          <button onClick={() => moveTask(task.dbId!, 'left')} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {col.id !== 'completed' && (
                          <button onClick={() => moveTask(task.dbId!, 'right')} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => deleteTask(task.dbId!)} className="p-1 hover:bg-red-500/10 rounded text-muted-foreground/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
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

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Create Custom Task</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">Task Title</label>
                <input 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  className="w-full border border-border rounded-lg px-3 py-1.5 text-xs text-foreground bg-card" 
                  placeholder="e.g. Schedule biometric visa appointment" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">Category</label>
                  <select 
                    value={newCategory} 
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full border border-border rounded-lg px-2 py-1.5 text-xs text-foreground bg-card"
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
                    className="w-full border border-border rounded-lg px-2 py-1.5 text-xs text-foreground bg-card"
                  >
                    {[1, 2, 3, 4, 5, 6].map(m => <option key={m} value={m}>Month {m}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-3 py-1.5 border border-border text-muted-foreground text-xs font-semibold rounded-lg hover:bg-muted cursor-pointer">
                Cancel
              </button>
              <button onClick={handleAddTask} disabled={!newTitle.trim()} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 cursor-pointer">
                Create
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
        <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold italic flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          Click Chevron controls on task cards to transition their Kanban status.
        </p>
      </div>
    </div>
  )
}