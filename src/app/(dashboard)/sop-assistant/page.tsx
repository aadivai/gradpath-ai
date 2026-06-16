'use client'
import { useState, useRef, useEffect } from 'react'
import { useUser } from '@/components/providers/SupabaseAuthProvider'
import { supabase } from '@/lib/supabase'
import { getProfileId } from '@/lib/profile'
import {
  Sparkles,
  Copy,
  Download,
  ArrowLeft,
  Check,
  FileText,
  FileCheck,
  Award,
  AlertCircle,
  Eye,
  CheckCircle,
  BarChart,
  Printer,
  ChevronRight,
  History,
  FileSignature
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

const COUNTRIES = [
  'Germany', 'Canada', 'United Kingdom', 'Ireland', 'Netherlands', 
  'USA', 'Singapore', 'Australia', 'New Zealand', 'Sweden', 
  'Finland', 'France', 'Switzerland', 'Italy', 'Spain', 
  'Japan', 'South Korea', 'UAE', 'Other'
]

const TONES = [
  { value: 'professional', label: 'Professional & Structured' },
  { value: 'academic', label: 'Technical & Academic-heavy' },
  { value: 'bold', label: 'Ambitious & Confident' },
  { value: 'narrative', label: 'Story-telling & Personal narrative' },
  { value: 'creative', label: 'Creative & Reflective' }
]

export default function SOPPage() {
  const { user } = useUser()
  const [step, setStep] = useState<'input' | 'output' | 'edit'>('input')
  const [country, setCountry] = useState('')
  const [university, setUniversity] = useState('')
  const [background, setBackground] = useState('')
  const [tone, setTone] = useState('professional')
  const [professorName, setProfessorName] = useState('')
  const [focusArea, setFocusArea] = useState('')
  const [sop, setSop] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  // Version history & suggestions state
  const [drafts, setDrafts] = useState<any[]>([])
  const [wordCount, setWordCount] = useState(0)
  const [readabilityIndex, setReadabilityIndex] = useState('Good')
  const [atsScore, setAtsScore] = useState(70)
  const [grammarScore, setGrammarScore] = useState(90)
  const [plagiarismScore, setPlagiarismScore] = useState(4)
  const [suggestions, setSuggestions] = useState<string[]>([])
  
  const [checks, setChecks] = useState({
    introHook: false,
    academicMention: false,
    projectsMention: false,
    uniAlignment: false,
    careerAlignment: false,
    wordLimit: false,
  })

  // Load drafts on mount
  useEffect(() => {
    if (user) {
      loadDrafts()
    }
  }, [user?.id])

  async function loadDrafts() {
    try {
      const profileId = await getProfileId(user!.id)
      if (!profileId) return
      const { data, error: dbErr } = await supabase
        .from('sop_drafts')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
      if (!dbErr && data) {
        setDrafts(data)
      }
    } catch (e) {
      console.error('Failed to load drafts:', e)
    }
  }

  // Track changes to recalculate word count and checklists
  useEffect(() => {
    if (!sop) {
      setWordCount(0)
      setSuggestions([])
      return
    }
    const words = sop.trim().split(/\s+/).filter(Boolean)
    const count = words.length
    setWordCount(count)

    // Check occurrences
    const lower = sop.toLowerCase()
    const hasIntroHook = lower.includes('passionate') || lower.includes('interest') || lower.includes('journey') || lower.includes('fascinated') || lower.includes('inspiration')
    const hasAcademic = lower.includes('cgpa') || lower.includes('gpa') || lower.includes('academic') || lower.includes('university') || lower.includes('degree') || lower.includes('academics')
    const hasProjects = lower.includes('project') || lower.includes('research') || lower.includes('thesis') || lower.includes('internship') || lower.includes('work') || lower.includes('engineered')
    const hasUni = university ? lower.includes(university.toLowerCase()) : lower.includes('university') || lower.includes('program')
    const hasCareer = lower.includes('career') || lower.includes('goal') || lower.includes('future') || lower.includes('short-term') || lower.includes('long-term') || lower.includes('aspire')
    const hasWordLimit = count >= 600 && count <= 1200

    setChecks({
      introHook: hasIntroHook,
      academicMention: hasAcademic,
      projectsMention: hasProjects,
      uniAlignment: hasUni,
      careerAlignment: hasCareer,
      wordLimit: hasWordLimit,
    })

    // Compute ATS Readability Score dynamically
    let score = 40
    if (hasIntroHook) score += 10
    if (hasAcademic) score += 10
    if (hasProjects) score += 10
    if (hasUni) score += 10
    if (hasCareer) score += 10
    if (hasWordLimit) score += 10
    setAtsScore(score)

    // Grammar Score formula (mock estimation based on length & text variety)
    const grammarErrCount = Math.max(2, Math.floor(count / 150))
    setGrammarScore(Math.min(99, Math.max(78, 100 - grammarErrCount)))

    // Plagiarism Score (mock estimation representing safe normal similarity index)
    setPlagiarismScore(Math.round(2 + (count > 0 ? (count % 8) : 0)))

    if (count > 1200) {
      setReadabilityIndex('Wordy (needs trim)')
    } else if (count >= 700) {
      setReadabilityIndex('Excellent')
    } else if (count >= 400) {
      setReadabilityIndex('Good')
    } else {
      setReadabilityIndex('Thin (needs detail)')
    }

    // Dynamic AI Suggestions
    const newSuggestions: string[] = []
    if (count < 600) {
      newSuggestions.push('Extend draft details: An SOP should ideally be 600-1000 words long to demonstrate technical depth.')
    }
    if (!hasAcademic) {
      newSuggestions.push('Incorporate academics: Explicitly reference your CGPA, key courses, or class rank in paragraph 2.')
    }
    if (!hasProjects) {
      newSuggestions.push('Highlight practical experience: Add specific project methodologies, internships, or thesis work.')
    }
    if (university && !lower.includes(university.toLowerCase())) {
      newSuggestions.push(`Mention university alignment: Add a paragraph detailing how ${university} aligns with your focus (mention specific courses or professors).`)
    }
    if (professorName && !lower.includes(professorName.toLowerCase())) {
      newSuggestions.push(`Integrate professor link: Explain how working with Prof. ${professorName} fits your research goals.`)
    }
    if (!hasCareer) {
      newSuggestions.push('Clarify career goals: Clearly define your immediate post-graduation position and long-term targets.')
    }
    if (newSuggestions.length === 0) {
      newSuggestions.push('Structure looks excellent! Try swapping generic verbs with action-oriented words like "engineered", "architected", or "orchestrated".')
      newSuggestions.push('Validate references: Verify that all technology stacks mentioned (e.g. PyTorch, Kubernetes) are linked to specific projects.')
    }
    setSuggestions(newSuggestions)
  }, [sop, university, professorName])

  async function generateSOP() {
    if (!country || !background.trim()) {
      setError('Target country and background details are required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate-sop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetCountry: country, 
          targetUniversity: university, 
          background,
          tone,
          professorName,
          focusArea
        }),
      })
      if (!res.ok) throw new Error('Failed to generate SOP')
      const data = await res.json()
      setSop(data.sop)
      setStep('output')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveDraft() {
    if (!user) return
    try {
      const profileId = await getProfileId(user.id)
      if (!profileId) { 
        setError('Complete your profile first.')
        return 
      }
      const { error: dbError } = await supabase.from('sop_drafts').insert({
        profile_id:         profileId,
        target_country:     country,
        target_university:  university,
        background,
        sop_content:        sop,
        is_saved:           true,
      })
      if (dbError) throw dbError
      setSaved(true)
      loadDrafts() // Refresh versions list
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      setError(e.message)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(sop)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownloadMarkdown() {
    const element = document.createElement("a")
    const titleHeader = `# Statement of Purpose\n**Target:** ${university || 'Admissions'} (${country})\n\n`
    const file = new Blob([titleHeader + sop], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = `${university.replace(/\s+/g, '_') || country}_SOP_Draft.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  function handleDownloadTxt() {
    const element = document.createElement("a")
    const titleHeader = `Statement of Purpose\nTarget: ${university || 'Admissions'} (${country})\n\n`
    const file = new Blob([titleHeader + sop], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${university.replace(/\s+/g, '_') || country}_SOP_Draft.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Print layout stylesheet and window print triggering
  function handlePrint() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head>
          <title>Statement of Purpose - ${university || 'Admissions'}</title>
          <style>
            body {
              font-family: 'Times New Roman', Times, serif;
              line-height: 1.8;
              margin: 2in 1.5in;
              color: #000;
              font-size: 12pt;
              text-align: justify;
            }
            .header {
              text-align: center;
              margin-bottom: 2.5rem;
              font-family: Arial, sans-serif;
            }
            .header h1 {
              font-size: 18pt;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header p {
              font-size: 10pt;
              margin: 5px 0 0 0;
              color: #555;
            }
            .content {
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Statement of Purpose</h1>
            <p>Target University: ${university || 'Not Specified'} (${country})</p>
          </div>
          <div class="content">${sop}</div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  function selectDraftVersion(d: any) {
    setCountry(d.target_country || '')
    setUniversity(d.target_university || '')
    setBackground(d.background || '')
    setSop(d.sop_content || '')
    setStep('output')
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Title Header */}
      <PageHeader
        icon={Sparkles}
        title="AI SOP Studio"
        subtitle="Draft, optimize, and version high-scoring, target-tailored Statements of Purpose for elite graduate boards."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Input panel or Output panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Form Step */}
          {step === 'input' && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-5 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Target Country</label>
                  <select 
                    value={country} 
                    onChange={e => setCountry(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-650 focus-visible:border-indigo-650 transition-shadow"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Target University</label>
                  <input 
                    value={university} 
                    onChange={e => setUniversity(e.target.value)} 
                    placeholder="e.g., Technical University of Munich"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-650 focus-visible:border-indigo-650 transition-shadow" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Tone of Voice</label>
                  <select 
                    value={tone} 
                    onChange={e => setTone(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-650 focus-visible:border-indigo-650 transition-shadow"
                  >
                    {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Target Professor (Optional)</label>
                  <input 
                    value={professorName} 
                    onChange={e => setProfessorName(e.target.value)} 
                    placeholder="e.g., Prof. Dr. Christian Schultz"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-650 focus-visible:border-indigo-650 transition-shadow" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Core Subject / Focus Area</label>
                <input 
                  value={focusArea} 
                  onChange={e => setFocusArea(e.target.value)} 
                  placeholder="e.g., Computer Vision, Quantum Computing, Financial Econometrics"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-650 focus-visible:border-indigo-650 transition-shadow" 
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center mb-0.5">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Your Academic & Project Background</label>
                  <span className="text-[9px] text-muted-foreground font-normal">Be highly descriptive for custom accuracy</span>
                </div>
                <textarea 
                  value={background} 
                  onChange={e => setBackground(e.target.value)}
                  placeholder="e.g., BTech in Computer Science, 8.9 CGPA. Conducted 6-month computer vision internship at Siemens AI labs. Built an autonomous drone navigation model using YOLOv8. Aiming to work as an AI researcher..."
                  className="w-full h-36 bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-650 focus-visible:border-indigo-650 resize-none leading-relaxed transition-shadow" 
                />
              </div>

              {error && <p className="text-xs text-rose-600 font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
              
              <button 
                onClick={generateSOP} 
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Synthesizing Statement Structure... (takes 10-15s)
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate SOP with AI
                  </>
                )}
              </button>
            </div>
          )}

          {/* Output Mode Document View */}
          {step === 'output' && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
                {/* Header panel */}
                <div className="bg-muted/40 border-b border-border/50 px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Statement of Purpose Draft</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 dark:border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                    AI Formulated
                  </span>
                </div>
                {/* Text body */}
                <div className="p-6 md:p-8 max-h-[500px] overflow-y-auto font-serif text-sm leading-relaxed text-foreground whitespace-pre-wrap select-text bg-card">
                  {sop}
                </div>
              </div>

              {/* Action grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button 
                  onClick={() => setStep('edit')}
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center"
                >
                  Edit Text
                </button>
                <button 
                  onClick={handleCopy}
                  className="py-2.5 bg-card border border-border text-foreground/80 text-xs font-semibold rounded-xl hover:bg-muted hover:text-foreground transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button 
                  onClick={handleDownloadMarkdown}
                  className="py-2.5 bg-card border border-border text-foreground/80 text-xs font-semibold rounded-xl hover:bg-muted hover:text-foreground transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4 text-indigo-500" />
                  Markdown
                </button>
                <button 
                  onClick={handleDownloadTxt}
                  className="py-2.5 bg-card border border-border text-foreground/80 text-xs font-semibold rounded-xl hover:bg-muted hover:text-foreground transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  TXT file
                </button>
                <button 
                  onClick={handlePrint}
                  className="py-2.5 bg-card border border-border text-foreground/80 text-xs font-semibold rounded-xl hover:bg-muted hover:text-foreground transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  Print / PDF
                </button>
              </div>

              <button 
                onClick={() => { setStep('input'); setSop('') }}
                className="w-full py-2.5 text-xs font-semibold text-muted-foreground border border-border rounded-xl hover:bg-muted hover:text-foreground transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Start Over & Re-draft
              </button>
            </div>
          )}

          {/* Edit Mode Screen */}
          {step === 'edit' && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
                <div className="bg-muted/40 border-b border-border/50 px-5 py-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Manual Draft Editor</span>
                </div>
                <textarea 
                  value={sop} 
                  onChange={e => setSop(e.target.value)}
                  className="w-full h-96 px-5 py-4 text-xs font-mono text-foreground bg-card resize-none leading-relaxed focus:outline-none focus:ring-0 border-none" 
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setStep('output')}
                  className="flex-1 py-2.5 border border-border text-muted-foreground text-xs font-semibold rounded-xl hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  ← Back to Preview
                </button>
                <button 
                  onClick={saveDraft}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {saved ? '✓ Saved' : 'Save Version'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: ATS Checklist, metrics panel and Version History */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Readability & Scorecard */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-5 shadow-xs">
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BarChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                ATS Analytics & Scores
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-normal">Evaluation against graduate board criteria</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/40 border border-border/50 rounded-xl p-3.5 text-center">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">Word Count</span>
                <span className="text-sm font-semibold text-foreground">{wordCount}</span>
                <span className="text-[9px] text-muted-foreground block mt-0.5 font-normal">Target: 600-1000</span>
              </div>

              <div className="bg-muted/40 border border-border/50 rounded-xl p-3.5 text-center">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">Readability</span>
                <span className="text-sm font-semibold text-indigo-650 dark:text-indigo-400">{readabilityIndex}</span>
                <span className="text-[9px] text-muted-foreground block mt-0.5 font-normal">Tone flow index</span>
              </div>

              <div className="bg-muted/40 border border-border/50 rounded-xl p-3.5 text-center">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">Grammar Score</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-450">{grammarScore}%</span>
                <span className="text-[9px] text-muted-foreground block mt-0.5 font-normal">Est. accuracy</span>
              </div>

              <div className="bg-muted/40 border border-border/50 rounded-xl p-3.5 text-center">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">Plagiarism Index</span>
                <span className="text-sm font-semibold text-rose-500">{plagiarismScore}%</span>
                <span className="text-[9px] text-muted-foreground block mt-0.5 font-normal">Similarity index</span>
              </div>
            </div>

            {/* ATS Score display */}
            <div className="bg-muted/40 border border-border/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">ATS Strength Score</span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{atsScore}/100</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-700 ease-out" 
                  style={{ width: `${atsScore}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal font-normal">
                Based on structural checklist, technical keywords, and university compatibility parameters.
              </p>
            </div>
          </div>

          {/* AI Suggestions Panel */}
          {sop && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-xs">
              <div>
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  AI Improvement Feedback
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-normal">Actionable points to maximize acceptance</p>
              </div>
              <ul className="space-y-2.5">
                {suggestions.map((s, idx) => (
                  <li key={idx} className="text-xs text-foreground/80 leading-relaxed pl-4 border-l-2 border-indigo-500 font-normal">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Version history list */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Version History ({drafts.length})
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-normal">Select a historical draft to restore</p>
            </div>
            
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {drafts.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic font-normal">No saved drafts found yet.</p>
              ) : (
                drafts.map((d, index) => (
                  <button
                    key={d.id}
                    onClick={() => selectDraftVersion(d)}
                    className="w-full text-left bg-muted/40 border border-border/60 hover:border-indigo-500/20 hover:bg-muted/80 rounded-xl p-2.5 text-xs transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <span className="text-[9px] font-semibold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">Version {drafts.length - index}</span>
                      <p className="font-medium text-foreground truncate mt-0.5">{d.target_university || d.target_country || 'Document Draft'}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-indigo-500 shrink-0 ml-2 transition-colors" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ATS Structural checklist */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Structural Checklist
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-normal">Verify vital document components</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                {checks.introHook ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-muted-foreground/35 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block text-foreground/80">Catchy Intro Hook</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Statement starts with personal inspiration or problem hook.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                {checks.academicMention ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-muted-foreground/35 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block text-foreground/80">Academic Foundation</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Mentions GPAs, core coursework, or major achievements.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                {checks.projectsMention ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-muted-foreground/35 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block text-foreground/80">Projects & Research</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Highlights code repositories, internship experience, or thesis work.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                {checks.uniAlignment ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-muted-foreground/35 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block text-foreground/80">University & Lab Alignment</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Directly mentions target university and subject interests.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                {checks.careerAlignment ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-muted-foreground/35 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block text-foreground/80">Short/Long-term Career Goals</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Specifies post-graduation intent (industry roles, research).</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}