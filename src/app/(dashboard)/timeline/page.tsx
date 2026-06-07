// src/app/(dashboard)/timeline/page.tsx  (replace entirely)
'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { getProfileId } from '@/lib/profile'
import type { TimelineTask } from '@/types'

const DEFAULT_TASKS: Omit<TimelineTask, 'id'>[] = [
  { title: 'Take IELTS / TOEFL exam',          category: 'test_prep',    due_month: 1, is_completed: false },
  { title: 'Prepare SOP first draft',           category: 'documents',    due_month: 2, is_completed: false },
  { title: 'Request recommendation letters',    category: 'documents',    due_month: 2, is_completed: false },
  { title: 'Shortlist 10–15 universities',      category: 'applications', due_month: 2, is_completed: false },
  { title: 'Submit all applications',           category: 'applications', due_month: 3, is_completed: false },
  { title: 'Follow up on application status',   category: 'applications', due_month: 4, is_completed: false },
  { title: 'Compare offer letters',             category: 'applications', due_month: 5, is_completed: false },
  { title: 'Start visa application',            category: 'visa',         due_month: 5, is_completed: false },
  { title: 'Arrange accommodation',             category: 'visa',         due_month: 5, is_completed: false },
  { title: 'Apply for education loan',          category: 'finance',      due_month: 4, is_completed: false },
  { title: 'Book flights',                      category: 'finance',      due_month: 6, is_completed: false },
]

const CAT_COLOR: Record<string, string> = {
  test_prep:    'bg-blue-50   text-blue-700   border-blue-100',
  documents:    'bg-purple-50 text-purple-700 border-purple-100',
  applications: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  visa:         'bg-amber-50  text-amber-700  border-amber-100',
  finance:      'bg-green-50  text-green-700  border-green-100',
}

const CAT_LABEL: Record<string, string> = {
  test_prep: 'Test prep', documents: 'Documents',
  applications: 'Applications', visa: 'Visa', finance: 'Finance',
}

// Fix: custom groupBy instead of Object.groupBy (not in Node < 21)
function groupBy<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const key = fn(item)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export default function TimelinePage() {
  const { user } = useUser()
  const [tasks, setTasks]   = useState<(TimelineTask & { dbId?: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const profileId = await getProfileId(user.id)
      if (!profileId) { setLoading(false); return }

      const { data } = await supabase
        .from('timeline_tasks').select('*').eq('profile_id', profileId)

      if (data && data.length > 0) {
        setTasks(data.map(t => ({ ...t, dbId: t.id })))
      } else {
        // Seed default tasks
        const toInsert = DEFAULT_TASKS.map(t => ({ ...t, profile_id: profileId }))
        const { data: inserted } = await supabase
          .from('timeline_tasks').insert(toInsert).select()
        setTasks((inserted ?? []).map((t: any) => ({ ...t, dbId: t.id })))
      }
      setLoading(false)
    })()
  }, [user])

  async function toggleTask(dbId: string, current: boolean) {
    setTasks(prev => prev.map(t => t.dbId === dbId ? { ...t, is_completed: !current } : t))
    await supabase.from('timeline_tasks')
      .update({ is_completed: !current }).eq('id', dbId)
  }

  const done  = tasks.filter(t => t.is_completed).length
  const pct   = tasks.length ? Math.round((done / tasks.length) * 100) : 0
  const groups = groupBy(tasks, t => t.category)

  if (loading) return <div className="text-center py-16 text-sm text-gray-400">Loading timeline...</div>

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Application timeline</h1>
      <p className="text-sm text-gray-500 mb-6">Track every step of your study abroad journey.</p>

      {/* Progress bar */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall progress</span>
          <span className="text-sm font-semibold text-indigo-600">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">{done} of {tasks.length} tasks completed</p>
      </div>

      {/* Tasks */}
      <div className="space-y-6">
        {Object.entries(groups).map(([category, catTasks]) => (
          <div key={category}>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-block mb-3 ${CAT_COLOR[category]}`}>
              {CAT_LABEL[category]} ({catTasks.length})
            </span>
            <div className="space-y-2">
              {catTasks.map(task => (
                <label key={task.dbId}
                  className="flex items-center gap-3 p-3.5 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 cursor-pointer transition-colors">
                  <input type="checkbox" checked={task.is_completed}
                    onChange={() => task.dbId && toggleTask(task.dbId, task.is_completed)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 cursor-pointer" />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-400">Month {task.due_month}</p>
                  </div>
                  {task.is_completed && <span className="text-green-500 text-sm">✓</span>}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Month breakdown */}
      <div className="mt-10 border-t border-gray-100 pt-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Month-by-month view</h2>
        <div className="space-y-2">
          {[1,2,3,4,5,6].map(m => {
            const mt = tasks.filter(t => t.due_month === m)
            const mc = mt.filter(t => t.is_completed).length
            return (
              <div key={m} className="flex items-center gap-3 text-xs">
                <span className="text-gray-500 w-14 shrink-0">Month {m}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all"
                    style={{ width: mt.length ? `${(mc/mt.length)*100}%` : '0%' }} />
                </div>
                <span className="text-gray-400 w-8 text-right">{mc}/{mt.length}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}