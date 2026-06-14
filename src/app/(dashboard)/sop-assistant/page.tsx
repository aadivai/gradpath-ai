'use client'
import { useState, useRef, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
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
  ChevronRight
} from 'lucide-react'

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
  { value: 'narrative', label: 'Story-telling & Personal narrative' }
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

  // ATS and readability analytics state
  const [wordCount, setWordCount] = useState(0)
  const [readabilityIndex, setReadabilityIndex] = useState('Good')
  const [atsScore, setAtsScore] = useState(70)
  const [checks, setChecks] = useState({
    introHook: false,
    academicMention: false,
    projectsMention: false,
    uniAlignment: false,
    careerAlignment: false,
    wordLimit: false,
  })

  // Track changes to recalculate word count and checklists
  useEffect(() => {
    if (!sop) {
      setWordCount(0)
      return
    }
    const words = sop.trim().split(/\s+/).filter(Boolean)
    const count = words.length
    setWordCount(count)

    // Check occurrences
    const lower = sop.toLowerCase()
    const hasIntroHook = lower.includes('passionate') || lower.includes('interest') || lower.includes('journey') || lower.includes('fascinated')
    const hasAcademic = lower.includes('cgpa') || lower.includes('gpa') || lower.includes('academic') || lower.includes('university') || lower.includes('degree')
    const hasProjects = lower.includes('project') || lower.includes('research') || lower.includes('thesis') || lower.includes('internship') || lower.includes('work')
    const hasUni = university ? lower.includes(university.toLowerCase()) : lower.includes('university') || lower.includes('program')
    const hasCareer = lower.includes('career') || lower.includes('goal') || lower.includes('future') || lower.includes('short-term') || lower.includes('long-term')
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

    if (count > 1200) {
      setReadabilityIndex('Wordy (needs trim)')
    } else if (count >= 700) {
      setReadabilityIndex('Excellent')
    } else if (count >= 400) {
      setReadabilityIndex('Good')
    } else {
      setReadabilityIndex('Thin (needs detail)')
    }
  }, [sop, university])

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

  function handleDownload() {
    const element = document.createElement("a")
    const file = new Blob([sop], { type: 'text/plain' })
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Title Banner */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
          AI SOP Assistant
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Draft, optimize, and export high-scoring, target-tailored Statements of Purpose for elite graduate boards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Input panel or Output panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Form Step */}
          {step === 'input' && (
            <div className="glass-card rounded-2xl p-6 border border-stone-200/50 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Target Country</label>
                  <select 
                    value={country} 
                    onChange={e => setCountry(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-850 focus:outline-indigo-600 bg-white"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Target University</label>
                  <input 
                    value={university} 
                    onChange={e => setUniversity(e.target.value)} 
                    placeholder="e.g., Technical University of Munich"
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-850 focus:outline-indigo-600 bg-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Tone of Voice</label>
                  <select 
                    value={tone} 
                    onChange={e => setTone(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-850 focus:outline-indigo-600 bg-white"
                  >
                    {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Target Professor (Optional)</label>
                  <input 
                    value={professorName} 
                    onChange={e => setProfessorName(e.target.value)} 
                    placeholder="e.g., Prof. Dr. Christian Schultz"
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-850 focus:outline-indigo-600 bg-white" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Core Subject / Focus Area</label>
                <input 
                  value={focusArea} 
                  onChange={e => setFocusArea(e.target.value)} 
                  placeholder="e.g., Computer Vision, Quantum Computing, Financial Econometrics"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-850 focus:outline-indigo-600 bg-white" 
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center mb-0.5">
                  <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Your Academic & Project Background</label>
                  <span className="text-[9px] text-stone-400 font-medium">Be highly descriptive for custom accuracy</span>
                </div>
                <textarea 
                  value={background} 
                  onChange={e => setBackground(e.target.value)}
                  placeholder="e.g., BTech in Computer Science, 8.9 CGPA. Conducted 6-month computer vision internship at Siemens AI labs. Built an autonomous drone navigation model using YOLOv8. Aiming to master advanced machine learning models at your university to work as an AI researcher..."
                  className="w-full h-36 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-850 focus:outline-indigo-600 resize-none bg-white leading-relaxed" 
                />
              </div>

              {error && <p className="text-xs text-rose-600 font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
              
              <button 
                onClick={generateSOP} 
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-indigo-100 hover:shadow-md disabled:opacity-60 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24">
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
              <div className="bg-white border border-stone-200/50 rounded-2xl shadow-sm overflow-hidden">
                {/* Header panel */}
                <div className="bg-stone-50/70 border-b border-stone-200/40 px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4.5 h-4.5 text-indigo-600" />
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">Statement of Purpose Draft</span>
                  </div>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                    AI Formulated
                  </span>
                </div>
                {/* Text body */}
                <div className="p-6 md:p-8 max-h-[500px] overflow-y-auto font-serif text-sm leading-relaxed text-stone-800 whitespace-pre-wrap select-text bg-white">
                  {sop}
                </div>
              </div>

              {/* Action grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button 
                  onClick={() => setStep('edit')}
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  Edit Document
                </button>
                <button 
                  onClick={handleCopy}
                  className="py-2.5 bg-white border border-stone-200 text-stone-700 text-xs font-bold rounded-xl hover:bg-stone-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button 
                  onClick={handleDownload}
                  className="py-2.5 bg-white border border-stone-200 text-stone-700 text-xs font-bold rounded-xl hover:bg-stone-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  TXT Draft
                </button>
                <button 
                  onClick={handlePrint}
                  className="py-2.5 bg-white border border-stone-200 text-stone-700 text-xs font-bold rounded-xl hover:bg-stone-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  Print / PDF
                </button>
              </div>

              <button 
                onClick={() => { setStep('input'); setSop('') }}
                className="w-full py-2.5 text-xs font-bold text-stone-500 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Start Over & Re-draft
              </button>
            </div>
          )}

          {/* Edit Mode Screen */}
          {step === 'edit' && (
            <div className="space-y-4">
              <div className="bg-white border border-stone-200/50 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-stone-50/70 border-b border-stone-200/40 px-5 py-3 flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-indigo-600" />
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">Manual Draft Editor</span>
                </div>
                <textarea 
                  value={sop} 
                  onChange={e => setSop(e.target.value)}
                  className="w-full h-96 px-5 py-4 text-xs font-mono text-stone-800 bg-white resize-none leading-relaxed focus:outline-none focus:ring-0" 
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setStep('output')}
                  className="flex-1 py-2.5 border border-stone-200 text-stone-600 text-xs font-bold rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  ← Back to Preview
                </button>
                <button 
                  onClick={saveDraft}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {saved ? '✓ Saved' : 'Save Version'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: ATS Checklist and metrics panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Readability & Scorecard */}
          <div className="glass-card rounded-2xl p-5 border border-stone-200/50 space-y-5">
            <div>
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart className="w-4 h-4 text-indigo-600" />
                ATS Analytics & Readability
              </h3>
              <p className="text-[10px] text-stone-400 mt-0.5 font-medium">Evaluation against graduate board criteria</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 text-center">
                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Word Count</span>
                <span className="text-sm font-black text-stone-800">{wordCount}</span>
                <span className="text-[8px] text-stone-400 block mt-0.5">Target: 800-1000</span>
              </div>

              <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 text-center">
                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Readability</span>
                <span className="text-sm font-black text-indigo-600">{readabilityIndex}</span>
                <span className="text-[8px] text-stone-400 block mt-0.5">Tone flow index</span>
              </div>
            </div>

            {/* ATS Score display */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">ATS Strength Score</span>
                <span className="text-xs font-bold text-indigo-600">{atsScore}/100</span>
              </div>
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-700 ease-out" 
                  style={{ width: `${atsScore}%` }}
                />
              </div>
              <p className="text-[10px] text-stone-400 leading-normal">
                Based on structure completeness, key vocabulary matching, university alignment, and length optimization.
              </p>
            </div>
          </div>

          {/* ATS Structural checklist */}
          <div className="glass-card rounded-2xl p-5 border border-stone-200/50 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                Structural Checklist
              </h3>
              <p className="text-[10px] text-stone-400 mt-0.5 font-medium">Verify vital document components</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-stone-600">
                {checks.introHook ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block text-stone-700">Catchy Intro Hook</span>
                  <span className="text-[10px] text-stone-400">Statement starts with personal inspiration or problem hook.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-stone-600">
                {checks.academicMention ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block text-stone-700">Academic Foundation</span>
                  <span className="text-[10px] text-stone-400">Mentions GPAs, core coursework, or major achievements.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-stone-600">
                {checks.projectsMention ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block text-stone-700">Projects & Research</span>
                  <span className="text-[10px] text-stone-400">Highlights code repositories, internship experience, or thesis work.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-stone-600">
                {checks.uniAlignment ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block text-stone-700">University & Lab Alignment</span>
                  <span className="text-[10px] text-stone-400">Directly mentions target university and subject interests.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-stone-600">
                {checks.careerAlignment ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block text-stone-700">Short/Long-term Career Goals</span>
                  <span className="text-[10px] text-stone-400">Specifies post-graduation intent (industry roles, research).</span>
                </div>
              </div>
            </div>
          </div>

          {/* Differentiator Advice Box */}
          <div className="glass-card rounded-2xl p-5 border border-stone-200/50 space-y-3 bg-amber-50/40 text-amber-800">
            <h4 className="text-[10px] text-amber-700 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-amber-600" />
              SOP Writing Truth
            </h4>
            <p className="text-xs leading-relaxed text-amber-700/95 font-medium">
              Elite admissions boards detect copy-pasted templates immediately. Study agencies often reuse standard forms, which gets students flagged or dismissed.
            </p>
            <p className="text-xs leading-relaxed text-amber-700/90">
              Use this AI-generated structure to build your layout, then inject 2-3 highly personal details, such as a specific bug you solved or a textbook that changed your mindset.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}