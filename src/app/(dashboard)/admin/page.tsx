'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@/components/providers/SupabaseAuthProvider'
import {
  Shield,
  Users,
  BarChart3,
  Database,
  Award,
  ArrowRight,
  Settings,
  Search,
  UserCheck,
  UserX,
  Trash2,
  Upload,
  Plus,
  RefreshCw,
  Play,
  FileText,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

// Tab definitions
type TabType = 'overview' | 'users' | 'universities' | 'scholarships' | 'prompts' | 'logs'

export default function AdminPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // State for Directory List
  const [usersList, setUsersList] = useState<any[]>([])
  const [userQuery, setUserQuery] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('')

  // State for Universities CRUD & Import
  const [unisList, setUnisList] = useState<any[]>([])
  const [uniSearch, setUniSearch] = useState('')
  const [showUniModal, setShowUniModal] = useState(false)
  const [selectedUni, setSelectedUni] = useState<any | null>(null)
  const [csvFileContent, setCsvFileContent] = useState<string>('')
  const [parsedCsvData, setParsedCsvData] = useState<any[]>([])

  // State for Scholarships CRUD
  const [scholarshipsList, setScholarshipsList] = useState<any[]>([])
  const [schSearch, setSchSearch] = useState('')
  const [showSchModal, setShowSchModal] = useState(false)
  const [selectedSch, setSelectedSch] = useState<any | null>(null)

  // State for AI Prompt Manager & Sandbox
  const [activePrompt, setActivePrompt] = useState('')
  const [promptHistory, setPromptHistory] = useState<any[]>([])
  const [sandboxPrompt, setSandboxPrompt] = useState('')
  const [sandboxQuery, setSandboxQuery] = useState('')
  const [sandboxResult, setSandboxResult] = useState('')
  const [testingSandbox, setTestingSandbox] = useState(false)

  // State for Audit Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  // Load all initial admin panel data
  async function loadAdminData() {
    setLoading(true)
    setError('')
    try {
      const [usersRes, unisRes, schsRes, promptsRes, logsRes] = await Promise.all([
        fetch('/api/admin/users').then(r => r.json()),
        fetch('/api/admin/universities').then(r => r.json()),
        fetch('/api/admin/scholarships').then(r => r.json()),
        fetch('/api/admin/prompts').then(r => r.json()),
        fetch('/api/admin/logs').then(r => r.json())
      ])

      if (usersRes.error) throw new Error(usersRes.error)
      if (unisRes.error) throw new Error(unisRes.error)
      if (schsRes.error) throw new Error(schsRes.error)
      if (promptsRes.error) throw new Error(promptsRes.error)
      if (logsRes.error) throw new Error(logsRes.error)

      setUsersList(usersRes.users ?? [])
      setUnisList(unisRes.universities ?? [])
      setScholarshipsList(schsRes.scholarships ?? [])
      setActivePrompt(promptsRes.activePrompt ?? '')
      setSandboxPrompt(promptsRes.activePrompt ?? '')
      setPromptHistory(promptsRes.history ?? [])
      setAuditLogs(logsRes.logs ?? [])
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  // Trigger flash success message
  function triggerSuccess(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 4000)
  }

  // --- USER ROLES & ACTIONS ---
  async function handleRoleChange(targetUserId: string, newRole: string) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-role', targetUserId, role: newRole })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      triggerSuccess(data.message)
      loadAdminData()
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleToggleDeactivate(targetUserId: string, isDeactivated: boolean) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-deactivate', targetUserId, isDeactivated })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      triggerSuccess(data.message)
      loadAdminData()
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleDeleteUser(targetUserId: string) {
    if (!confirm('Are you sure you want to delete this user profile? This action is irreversible.')) return
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', targetUserId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      triggerSuccess(data.message)
      loadAdminData()
    } catch (e: any) {
      setError(e.message)
    }
  }

  // --- UNIVERSITY ACTIONS ---
  async function handleSaveUniversity(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUni) return
    try {
      const action = selectedUni.id ? 'edit' : 'create'
      const payload = {
        action,
        id: selectedUni.id,
        universityData: {
          name: selectedUni.name,
          country: selectedUni.country,
          city: selectedUni.city || null,
          qs_ranking: selectedUni.qs_ranking ? parseInt(selectedUni.qs_ranking) : null,
          acceptance_rate: selectedUni.acceptance_rate ? parseFloat(selectedUni.acceptance_rate) : null,
          min_cgpa: selectedUni.min_cgpa ? parseFloat(selectedUni.min_cgpa) : null,
          min_ielts: selectedUni.min_ielts ? parseFloat(selectedUni.min_ielts) : null,
          min_gre: selectedUni.min_gre ? parseInt(selectedUni.min_gre) : null,
          annual_fee_usd: selectedUni.annual_fee_usd ? parseInt(selectedUni.annual_fee_usd) : null,
          living_cost_usd: selectedUni.living_cost_usd ? parseInt(selectedUni.living_cost_usd) : null,
          programs: typeof selectedUni.programs === 'string' ? selectedUni.programs.split(',').map((p: string) => p.trim()) : selectedUni.programs || [],
          website_url: selectedUni.website_url || null,
          tier: selectedUni.tier || 'moderate'
        }
      }

      const res = await fetch('/api/admin/universities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      triggerSuccess(`University ${action === 'create' ? 'created' : 'updated'} successfully!`)
      setShowUniModal(false)
      loadAdminData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleDeleteUniversity(id: string) {
    if (!confirm('Delete this university?')) return
    try {
      const res = await fetch('/api/admin/universities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      triggerSuccess('University deleted.')
      loadAdminData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Handle CSV file upload & parsing
  function handleCsvFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      setCsvFileContent(text)

      // Simple CSV line parser
      const lines = text.split('\n').filter(l => l.trim())
      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''))
      
      const parsedRows = lines.slice(1).map(line => {
        // Handle comma splitting inside quotes
        const values: string[] = []
        let currentVal = ''
        let inQuotes = false
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            values.push(currentVal.trim())
            currentVal = ''
          } else {
            currentVal += char
          }
        }
        values.push(currentVal.trim())

        const obj: any = {}
        headers.forEach((header, index) => {
          let val = values[index]?.replace(/^["']|["']$/g, '') || ''
          obj[header] = val
        })
        return obj
      })

      // Map parsed strings to proper schema types
      const validatedData = parsedRows.map(r => ({
        name: r.name || 'Unnamed University',
        country: r.country || 'Unknown',
        city: r.city || null,
        qs_ranking: r.qs_ranking ? parseInt(r.qs_ranking) : null,
        acceptance_rate: r.acceptance_rate ? parseFloat(r.acceptance_rate) : null,
        min_cgpa: r.min_cgpa ? parseFloat(r.min_cgpa) : null,
        min_ielts: r.min_ielts ? parseFloat(r.min_ielts) : null,
        min_gre: r.min_gre ? parseInt(r.min_gre) : null,
        annual_fee_usd: r.annual_fee_usd ? parseInt(r.annual_fee_usd) : null,
        living_cost_usd: r.living_cost_usd ? parseInt(r.living_cost_usd) : null,
        programs: r.programs ? r.programs.split(';').map((p: string) => p.trim()) : [],
        website_url: r.website_url || null,
        tier: r.tier || 'moderate'
      }))

      setParsedCsvData(validatedData)
    }
    reader.readAsText(file)
  }

  async function handleImportParsedCsv() {
    if (parsedCsvData.length === 0) return
    try {
      const res = await fetch('/api/admin/universities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-upload', bulkData: parsedCsvData })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      triggerSuccess(`Successfully bulk uploaded ${data.insertedCount} universities!`)
      setParsedCsvData([])
      setCsvFileContent('')
      loadAdminData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  // --- SCHOLARSHIP ACTIONS ---
  async function handleSaveScholarship(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSch) return
    try {
      const action = selectedSch.id ? 'edit' : 'create'
      const payload = {
        action,
        id: selectedSch.id,
        scholarshipData: {
          name: selectedSch.name,
          country: selectedSch.country || null,
          amount_usd: selectedSch.amount_usd ? parseInt(selectedSch.amount_usd) : null,
          is_fully_funded: !!selectedSch.is_fully_funded,
          type: selectedSch.type || 'merit',
          eligible_degrees: typeof selectedSch.eligible_degrees === 'string' ? selectedSch.eligible_degrees.split(',').map((d: string) => d.trim()) : selectedSch.eligible_degrees || [],
          min_cgpa: selectedSch.min_cgpa ? parseFloat(selectedSch.min_cgpa) : null,
          deadline: selectedSch.deadline || null,
          link: selectedSch.link || null,
          description: selectedSch.description || null
        }
      }

      const res = await fetch('/api/admin/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      triggerSuccess(`Scholarship ${action === 'create' ? 'created' : 'updated'} successfully!`)
      setShowSchModal(false)
      loadAdminData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleDeleteScholarship(id: string) {
    if (!confirm('Delete this scholarship?')) return
    try {
      const res = await fetch('/api/admin/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      triggerSuccess('Scholarship deleted.')
      loadAdminData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  // --- AI PROMPT MANAGER ACTIONS ---
  async function handleSaveActivePrompt() {
    if (!activePrompt.trim()) return
    try {
      const res = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', promptText: activePrompt })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      triggerSuccess('AI Counselor instruction set updated!')
      setPromptHistory(data.history)
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleRollbackPrompt(versionId: string) {
    try {
      const res = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rollback', versionId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      triggerSuccess('AI Prompt rolled back successfully!')
      setActivePrompt(data.activePrompt)
      setPromptHistory(data.history)
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleRunSandboxTest() {
    if (!sandboxPrompt.trim() || !sandboxQuery.trim()) return
    setTestingSandbox(true)
    setSandboxResult('')
    try {
      const res = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test-sandbox',
          sandboxPrompt,
          sandboxQuery
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSandboxResult(data.response)
    } catch (err: any) {
      setSandboxResult(`Error running sandbox test: ${err.message}`)
    } finally {
      setTestingSandbox(false)
    }
  }

  // --- FILTERED DATA SETS ---
  const filteredUsers = usersList.filter(u => {
    const q = userQuery.toLowerCase()
    const matchSearch =
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.branch?.toLowerCase().includes(q)

    const matchRole = userRoleFilter ? u.role === userRoleFilter : true
    return matchSearch && matchRole
  })

  const filteredUnis = unisList.filter(u => {
    const q = uniSearch.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.country.toLowerCase().includes(q)
  })

  const filteredScholarships = scholarshipsList.filter(s => {
    const q = schSearch.toLowerCase()
    return s.name.toLowerCase().includes(q) || (s.country || '').toLowerCase().includes(q)
  })

  // KPI calculations
  const totalStudents = usersList.filter(u => u.clerk_user_id !== 'system_config' && u.clerk_user_id !== 'system_audit_logs').length
  const avgCgpa = (() => {
    const gpas = usersList.map(u => u.cgpa).filter(Boolean) as number[]
    return gpas.length ? (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2) : '—'
  })()
  const avgIelts = (() => {
    const bands = usersList.map(u => u.ielts_score).filter(Boolean) as number[]
    return bands.length ? (bands.reduce((a, b) => a + b, 0) / bands.length).toFixed(2) : '—'
  })()

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-6">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-muted rounded-xl" />
          <div className="space-y-2">
            <div className="h-6 bg-muted w-48 rounded" />
            <div className="h-4 bg-muted/65 w-72 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-24 bg-muted/65 border border-border rounded-xl animate-pulse" />
          <div className="h-24 bg-muted/65 border border-border rounded-xl animate-pulse" />
          <div className="h-24 bg-muted/65 border border-border rounded-xl animate-pulse" />
          <div className="h-24 bg-muted/65 border border-border rounded-xl animate-pulse" />
        </div>
        <div className="h-96 bg-muted/65 rounded-xl border border-border animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header Banner */}
      <PageHeader
        icon={Shield}
        title="Admin Operations Studio"
        subtitle="Control system instruction prompts, student directories, audit logs, and global catalog databases"
        actions={
          <button 
            onClick={loadAdminData} 
            className="px-3 py-2 border border-border hover:bg-muted bg-card rounded-lg text-muted-foreground hover:text-foreground transition shadow-xs flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        }
      />

      {/* Global Success / Error Banners */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-600 dark:text-rose-400 flex items-start gap-2.5 animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Execution Error: </span> {error}
          </div>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-750 text-xs font-mono font-bold">×</button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <div>{success}</div>
        </div>
      )}

      {/* Dynamic Tab Navigation Row */}
      <div className="flex border-b border-border/40 gap-1 overflow-x-auto pb-px">
        {[
          { id: 'overview',     label: 'Overview',      icon: BarChart3 },
          { id: 'users',        label: 'Users Directory',icon: Users },
          { id: 'universities', label: 'Universities',   icon: Database },
          { id: 'scholarships', label: 'Scholarships',   icon: Award },
          { id: 'prompts',      label: 'AI Sandbox',    icon: Settings },
          { id: 'logs',         label: 'Audit Logs',    icon: FileText },
        ].map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as TabType); setError(''); }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                active
                  ? 'border-indigo-600 text-indigo-600 font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* TAB CONTENT MODULES */}
      <div className="space-y-6">

        {/* --- Tab 1: Overview & Analytics --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total Students</p>
                  <p className="text-xl font-semibold text-foreground mt-0.5">{totalStudents}</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Avg CGPA</p>
                  <p className="text-xl font-semibold text-foreground mt-0.5">{avgCgpa} / 10</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Avg IELTS Band</p>
                  <p className="text-xl font-semibold text-foreground mt-0.5">{avgIelts}</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Catalog Universities</p>
                  <p className="text-xl font-semibold text-foreground mt-0.5">{unisList.length}</p>
                </div>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Audit feed snapshot */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">Recent System Events</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {auditLogs.slice(0, 5).map((log, idx) => (
                    <div key={idx} className="text-xs flex items-start gap-2.5 border-b border-border/30 pb-2 last:border-0 last:pb-0">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-foreground/80 leading-normal">{log.detail}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{new Date(log.timestamp).toLocaleString()} • {log.actor}</p>
                      </div>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <div className="text-center text-muted-foreground py-6">No audit log records found.</div>
                  )}
                </div>
              </div>

              {/* Popular countries breakdown */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">Popular Country Preferences</h3>
                <div className="space-y-3">
                  {(() => {
                    const countries: Record<string, number> = {}
                    usersList.forEach(u => {
                      (u.preferred_countries ?? []).forEach((c: string) => {
                        countries[c] = (countries[c] || 0) + 1
                      })
                    })
                    const sorted = Object.entries(countries).sort((a,b) => b[1] - a[1]).slice(0, 5)
                    const total = sorted.reduce((sum, item) => sum + item[1], 0) || 1
                    
                    return sorted.map(([country, count]) => {
                      const pct = Math.round((count / total) * 100)
                      return (
                        <div key={country} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-foreground/80">
                            <span>{country}</span>
                            <span>{count} votes ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })
                  })()}
                  {usersList.length === 0 && <div className="text-center text-muted-foreground py-6">No student data compiled.</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab 2: Users Directory & Role Management --- */}
        {activeTab === 'users' && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
            {/* Filter Tools */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                <input
                  value={userQuery}
                  onChange={e => setUserQuery(e.target.value)}
                  placeholder="Search students by name, email, or branch..."
                  className="w-full bg-muted/30 border border-border pl-9 pr-3 py-2 rounded-lg text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                />
              </div>
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="bg-card border border-border px-3 py-2 rounded-lg text-xs text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500 cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="mentor">Mentor</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto border border-border/40 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted text-muted-foreground border-b border-border/40">
                    <th className="p-3 font-semibold uppercase">Student Profile</th>
                    <th className="p-3 font-semibold uppercase">Status</th>
                    <th className="p-3 font-semibold uppercase">Grades</th>
                    <th className="p-3 font-semibold uppercase">Role Assignment</th>
                    <th className="p-3 font-semibold uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-foreground/80">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-muted/10">
                      <td className="p-3">
                        <p className="font-semibold text-foreground">{u.full_name || 'Anonymous User'}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{u.email || '—'}</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{u.branch || 'No branch listed'}</p>
                      </td>
                      <td className="p-3">
                        {u.is_deactivated ? (
                          <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded border border-rose-500/20 text-[10px] font-semibold">Deactivated</span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px] font-semibold">Active</span>
                        )}
                      </td>
                      <td className="p-3">
                        <p className="font-medium">GPA: {u.cgpa ?? '—'}/10</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">IELTS: {u.ielts_score ?? '—'} Band</p>
                      </td>
                      <td className="p-3">
                        <select
                           value={u.role || 'student'}
                           onChange={e => handleRoleChange(u.clerk_user_id, e.target.value)}
                           className="bg-card border border-border rounded-lg px-2 py-1 text-[11px] text-foreground font-semibold focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500 cursor-pointer"
                        >
                          <option value="student">Student</option>
                          <option value="mentor">Mentor</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleToggleDeactivate(u.clerk_user_id, !u.is_deactivated)}
                          className={`p-1.5 rounded-lg border transition ${
                            u.is_deactivated
                              ? 'border-emerald-650/30 hover:border-emerald-600/50 text-emerald-600 hover:bg-emerald-500/10'
                              : 'border-amber-600/30 hover:border-amber-600/50 text-amber-600 hover:bg-amber-500/10'
                          } cursor-pointer`}
                          title={u.is_deactivated ? 'Activate User' : 'Deactivate User'}
                        >
                          {u.is_deactivated ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.clerk_user_id)}
                          className="p-1.5 border border-rose-600/30 hover:border-rose-600/50 text-rose-500 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted-foreground py-10 font-medium">No registered students found matching criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Tab 3: Universities Directory & CSV Bulk Imports --- */}
        {activeTab === 'universities' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CRUD Table Column */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">University Catalog</h2>
                <button
                  onClick={() => {
                    setSelectedUni({
                      name: '', country: 'USA', city: '', qs_ranking: '', acceptance_rate: '',
                      min_cgpa: '', min_ielts: '', min_gre: '', annual_fee_usd: '', living_cost_usd: '',
                      programs: '', website_url: '', tier: 'moderate'
                    })
                    setShowUniModal(true)
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add University
                </button>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                <input
                  value={uniSearch}
                  onChange={e => setUniSearch(e.target.value)}
                  placeholder="Search university catalog by name or country..."
                  className="w-full bg-muted/30 border border-border pl-9 pr-3 py-2 rounded-lg text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                />
              </div>

              {/* Catalog list */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredUnis.map(uni => (
                  <div key={uni.id} className="bg-card border border-border rounded-lg p-3.5 flex justify-between items-start hover:border-indigo-500/20 transition-all duration-300">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground text-sm">{uni.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{uni.city ? `${uni.city}, ` : ''}{uni.country} • Tier: <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase text-[9px]">{uni.tier}</span></p>
                      <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mt-1">
                        GPA &ge; {uni.min_cgpa ?? '—'} • IELTS &ge; {uni.min_ielts ?? '—'} • Fee: ${uni.annual_fee_usd?.toLocaleString() || '—'}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedUni({
                            ...uni,
                            programs: uni.programs?.join(', ') || ''
                          })
                          setShowUniModal(true)
                        }}
                        className="px-2.5 py-1.5 border border-border hover:bg-muted text-foreground bg-card rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUniversity(uni.id)}
                        className="p-1.5 border border-rose-600/30 hover:border-rose-600/50 text-rose-500 bg-card rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredUnis.length === 0 && (
                  <div className="text-center text-muted-foreground py-10">No universities found matching filter.</div>
                )}
              </div>
            </div>

            {/* CSV Import Column */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider border-b border-border/40 pb-2 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                CSV Bulk Import
              </h2>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Import multiple universities simultaneously using a formatted CSV file. Header structure should match catalog schema keys:
              </p>
              
              <div className="bg-muted border border-border p-2.5 rounded-lg text-[9px] font-mono text-muted-foreground whitespace-pre-wrap select-all">
                name,country,city,qs_ranking,acceptance_rate,min_cgpa,min_ielts,min_gre,annual_fee_usd,living_cost_usd,programs,website_url,tier
              </div>

              {/* Upload field */}
              <div className="border border-dashed border-border hover:border-indigo-600 dark:hover:border-indigo-500 transition rounded-xl p-6 text-center cursor-pointer relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs font-semibold text-foreground/80">Select University CSV File</p>
                <p className="text-[10px] text-muted-foreground mt-1">Accepts UTF-8 .csv files</p>
              </div>

              {/* Parse preview */}
              {parsedCsvData.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{parsedCsvData.length} records parsed</span>
                    <button
                      onClick={() => setParsedCsvData([])}
                      className="text-[10px] text-rose-500 font-semibold hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto border border-border rounded-lg p-2 bg-muted space-y-1.5 text-[10px]">
                    {parsedCsvData.map((uni, idx) => (
                      <div key={idx} className="border-b border-border/40 pb-1.5 last:border-0 last:pb-0 font-medium">
                        <p className="text-foreground truncate font-semibold">{uni.name}</p>
                        <p className="text-muted-foreground">{uni.country} • CGPA &ge; {uni.min_cgpa} • Fee: ${uni.annual_fee_usd}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleImportParsedCsv}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    Confirm Import ({parsedCsvData.length} Rows)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Tab 4: Scholarships Directory --- */}
        {activeTab === 'scholarships' && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Scholarships Directory</h2>
              <button
                onClick={() => {
                  setSelectedSch({
                    name: '', country: '', amount_usd: '', is_fully_funded: false,
                    type: 'merit', eligible_degrees: '', min_cgpa: '', deadline: '',
                    link: '', description: ''
                  })
                  setShowSchModal(true)
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Scholarship
              </button>
            </div>

            {/* Search and Filters */}
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                value={schSearch}
                onChange={e => setSchSearch(e.target.value)}
                placeholder="Search scholarships by name or country..."
                className="w-full bg-muted/30 border border-border pl-9 pr-3 py-2 rounded-lg text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
              />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredScholarships.map(sch => (
                <div key={sch.id} className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between space-y-3 hover:border-indigo-500/20 shadow-xs transition-all">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-foreground text-xs leading-normal">{sch.name}</h3>
                      {sch.is_fully_funded && (
                        <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider shrink-0">Fully Funded</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-semibold">{sch.country || 'Global'} • Type: {sch.type}</p>
                    <p className="text-xs text-foreground/80 leading-normal line-clamp-2">{sch.description || 'No description listed.'}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border/40">
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">Amt: ${sch.amount_usd?.toLocaleString() || 'Variable'}</span>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedSch({
                            ...sch,
                            eligible_degrees: sch.eligible_degrees?.join(', ') || ''
                          })
                          setShowSchModal(true)
                        }}
                        className="px-2 py-1.5 border border-border hover:bg-muted bg-card rounded-lg text-[10px] font-semibold text-foreground cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteScholarship(sch.id)}
                        className="p-1.5 border border-rose-600/30 hover:border-rose-600/50 text-rose-500 bg-card rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredScholarships.length === 0 && (
                <div className="col-span-2 text-center text-muted-foreground py-10">No scholarships found.</div>
              )}
            </div>
          </div>
        )}

        {/* --- Tab 5: AI Prompt Manager & Play Sandbox --- */}
        {activeTab === 'prompts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Instructions Prompt Editor */}
            <div className="lg:col-span-7 bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider border-b border-border/40 pb-2 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Active Counselor System instructions
              </h2>
              
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">System Instructions Prompt</label>
                <textarea
                  value={activePrompt}
                  onChange={e => setActivePrompt(e.target.value)}
                  className="w-full h-40 border border-border rounded-lg p-3 text-xs text-foreground bg-muted/30 font-mono leading-relaxed resize-none focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold italic">
                  * Triggers real-time systeminstruction updates for chatbot responses.
                </p>
                <button
                  onClick={handleSaveActivePrompt}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  Save Active Prompt
                </button>
              </div>

              {/* Version History Rollbacks */}
              <div className="pt-4 border-t border-border/40 space-y-3">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Prompt Revision History</h3>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {promptHistory.map((h, idx) => (
                    <div key={h.id || idx} className="bg-card border border-border rounded-lg p-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-foreground/80 leading-normal truncate max-w-[300px]">{h.prompt}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Revision: {new Date(h.updatedAt).toLocaleString()} • {h.author}</p>
                      </div>
                      <button
                        onClick={() => handleRollbackPrompt(h.id)}
                        className="px-2.5 py-1.5 border border-indigo-500/20 hover:border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-lg font-semibold cursor-pointer shrink-0 text-[10px]"
                      >
                        Rollback
                      </button>
                    </div>
                  ))}
                  {promptHistory.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No revisions logged yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sandbox Playground Column */}
            <div className="lg:col-span-5 bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider border-b border-border/40 pb-2 flex items-center gap-1.5">
                <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Prompt Sandbox Playground
              </h2>
              
              <p className="text-xs text-muted-foreground leading-relaxed">
                Test custom prompt configurations in real-time before saving them live to the system.
              </p>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Test System instructions</label>
                  <textarea
                    value={sandboxPrompt}
                    onChange={e => setSandboxPrompt(e.target.value)}
                    className="w-full h-24 border border-border rounded-lg p-2.5 text-xs text-foreground bg-muted/30 font-mono leading-normal resize-none focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                    placeholder="Enter system instruction..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">User Query input</label>
                  <input
                    value={sandboxQuery}
                    onChange={e => setSandboxQuery(e.target.value)}
                    placeholder="e.g. Which universities accept 6.5 IELTS?"
                    className="w-full border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500 text-foreground bg-muted/30"
                  />
                </div>

                <button
                  onClick={handleRunSandboxTest}
                  disabled={testingSandbox || !sandboxPrompt.trim() || !sandboxQuery.trim()}
                  className="w-full py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer bg-emerald-600"
                >
                  {testingSandbox ? 'Executing Test...' : 'Run Sandbox Query'}
                </button>
              </div>

              {/* Test Output box */}
              {sandboxResult && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Gemini Model Output</label>
                  <div className="border border-border rounded-lg p-3 bg-zinc-950 dark:bg-black font-mono text-[10px] text-emerald-400 whitespace-pre-wrap max-h-[220px] overflow-y-auto leading-relaxed">
                    {sandboxResult}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Tab 6: Audit Logs --- */}
        {activeTab === 'logs' && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">Audit Event logs</h2>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="text-xs border border-border bg-card hover:bg-muted/30 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-200">
                  <div className="space-y-1">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground">{log.action}</span>
                    <p className="text-foreground/80 leading-normal font-medium mt-1.5">{log.detail}</p>
                  </div>
                  <div className="text-right text-[10px] text-muted-foreground shrink-0 font-medium font-mono">
                    <p>{new Date(log.timestamp).toLocaleString()}</p>
                    <p className="mt-0.5 font-sans">User: {log.actor}</p>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center text-muted-foreground py-10 font-medium">No system log records currently captured.</div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* --- UNIVERSITY MODAL DIALOG --- */}
      {showUniModal && selectedUni && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-foreground text-sm border-b border-border/40 pb-2">
              {selectedUni.id ? 'Edit University details' : 'Add New University'}
            </h3>
            
            <form onSubmit={handleSaveUniversity} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-muted-foreground font-semibold">University name</label>
                  <input
                    value={selectedUni.name}
                    onChange={e => setSelectedUni({ ...selectedUni, name: e.target.value })}
                    required
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Country</label>
                  <input
                    value={selectedUni.country}
                    onChange={e => setSelectedUni({ ...selectedUni, country: e.target.value })}
                    required
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">City</label>
                  <input
                    value={selectedUni.city || ''}
                    onChange={e => setSelectedUni({ ...selectedUni, city: e.target.value })}
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">QS Rank</label>
                  <input
                    type="number"
                    value={selectedUni.qs_ranking || ''}
                    onChange={e => setSelectedUni({ ...selectedUni, qs_ranking: e.target.value })}
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Acceptance Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedUni.acceptance_rate || ''}
                    onChange={e => setSelectedUni({ ...selectedUni, acceptance_rate: e.target.value })}
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedUni.min_cgpa || ''}
                    onChange={e => setSelectedUni({ ...selectedUni, min_cgpa: e.target.value })}
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Min IELTS Band</label>
                  <input
                    type="number"
                    step="0.5"
                    value={selectedUni.min_ielts || ''}
                    onChange={e => setSelectedUni({ ...selectedUni, min_ielts: e.target.value })}
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Annual Fee (USD)</label>
                  <input
                    type="number"
                    value={selectedUni.annual_fee_usd || ''}
                    onChange={e => setSelectedUni({ ...selectedUni, annual_fee_usd: e.target.value })}
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Living Cost (USD)</label>
                  <input
                    type="number"
                    value={selectedUni.living_cost_usd || ''}
                    onChange={e => setSelectedUni({ ...selectedUni, living_cost_usd: e.target.value })}
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-muted-foreground font-semibold">Programs Offered (comma-separated)</label>
                  <input
                    value={selectedUni.programs || ''}
                    onChange={e => setSelectedUni({ ...selectedUni, programs: e.target.value })}
                    placeholder="Computer Science, Data Science, Cyber Security"
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Matching Tier</label>
                  <select
                    value={selectedUni.tier}
                    onChange={e => setSelectedUni({ ...selectedUni, tier: e.target.value })}
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500 cursor-pointer"
                  >
                    <option value="safe">Safe</option>
                    <option value="moderate">Moderate</option>
                    <option value="ambitious">Ambitious</option>
                    <option value="dream">Dream</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Website URL</label>
                  <input
                    value={selectedUni.website_url || ''}
                    onChange={e => setSelectedUni({ ...selectedUni, website_url: e.target.value })}
                    placeholder="https://example.edu"
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setShowUniModal(false)}
                  className="px-3.5 py-2 border border-border text-muted-foreground hover:bg-muted bg-card rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SCHOLARSHIP MODAL DIALOG --- */}
      {showSchModal && selectedSch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-foreground text-sm border-b border-border/40 pb-2">
              {selectedSch.id ? 'Edit Scholarship details' : 'Add New Scholarship'}
            </h3>

            <form onSubmit={handleSaveScholarship} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-muted-foreground font-semibold">Scholarship name</label>
                  <input
                    value={selectedSch.name}
                    onChange={e => setSelectedSch({ ...selectedSch, name: e.target.value })}
                    required
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Country Assignment</label>
                  <input
                    value={selectedSch.country || ''}
                    onChange={e => setSelectedSch({ ...selectedSch, country: e.target.value })}
                    placeholder="e.g. USA or Global"
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Amount (USD)</label>
                  <input
                    type="number"
                    value={selectedSch.amount_usd || ''}
                    onChange={e => setSelectedSch({ ...selectedSch, amount_usd: e.target.value })}
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Funding Type</label>
                  <select
                    value={selectedSch.type}
                    onChange={e => setSelectedSch({ ...selectedSch, type: e.target.value })}
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500 cursor-pointer"
                  >
                    <option value="merit">Merit-based</option>
                    <option value="need">Need-based</option>
                    <option value="government">Government</option>
                    <option value="university">University</option>
                  </select>
                </div>
                <div className="space-y-1 flex items-center pt-5 gap-2">
                  <input
                    type="checkbox"
                    checked={!!selectedSch.is_fully_funded}
                    onChange={e => setSelectedSch({ ...selectedSch, is_fully_funded: e.target.checked })}
                    id="is_fully_funded"
                    className="w-4 h-4 rounded border-border text-indigo-600 focus:ring-indigo-500 bg-muted/30 cursor-pointer"
                  />
                  <label htmlFor="is_fully_funded" className="text-foreground/90 font-semibold cursor-pointer">Fully Funded Scholarship</label>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Min CGPA Required</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedSch.min_cgpa || ''}
                    onChange={e => setSelectedSch({ ...selectedSch, min_cgpa: e.target.value })}
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Application Deadline</label>
                  <input
                    value={selectedSch.deadline || ''}
                    onChange={e => setSelectedSch({ ...selectedSch, deadline: e.target.value })}
                    placeholder="e.g. Sep 15"
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-muted-foreground font-semibold">Eligible Degrees (comma-separated)</label>
                  <input
                    value={selectedSch.eligible_degrees || ''}
                    onChange={e => setSelectedSch({ ...selectedSch, eligible_degrees: e.target.value })}
                    placeholder="Masters, PhD, Bachelors"
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-muted-foreground font-semibold">Website / Apply Link</label>
                  <input
                    value={selectedSch.link || ''}
                    onChange={e => setSelectedSch({ ...selectedSch, link: e.target.value })}
                    placeholder="https://example.com/scholarship"
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-muted-foreground font-semibold">Description</label>
                  <textarea
                    value={selectedSch.description || ''}
                    onChange={e => setSelectedSch({ ...selectedSch, description: e.target.value })}
                    className="w-full h-20 border border-border rounded-lg px-2.5 py-1.5 text-foreground bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setShowSchModal(false)}
                  className="px-3.5 py-2 border border-border text-muted-foreground hover:bg-muted bg-card rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
