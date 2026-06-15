'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { parseProfile } from '@/utils/profileMetadata'
import { getProfileId } from '@/lib/profile'
import { 
  FileText, 
  MapPin, 
  DollarSign, 
  Clock, 
  Check, 
  TrendingUp, 
  Sparkles, 
  Info,
  ShieldCheck,
  Play,
  RotateCcw
} from 'lucide-react'

interface VisaInfo {
  country: string
  visa_type: string | null
  processing_days_min: number | null
  processing_days_max: number | null
  required_docs: string[] | null
  estimated_cost_usd: number | null
  interview_required: boolean
  interview_tips: string | null
  common_rejection_reasons: string[] | null
  financial_requirement_usd: number | null
}

const COUNTRIES = ['Germany', 'Canada', 'United Kingdom', 'Ireland', 'Netherlands', 'USA', 'Australia']

const MOCK_QUESTIONS: Record<string, string[]> = {
  Germany: [
    'Why did you choose Germany instead of studying in India or other English-speaking nations?',
    'What is your course curriculum and how many credit points do you need to graduate?',
    'How will you fund your studies and living cost in Germany?'
  ],
  USA: [
    'Why do you want to study at this specific university, and who is your sponsor?',
    'What are your career plans after completing your degree in the United States?',
    'How can you prove that you intend to return to India after your visa expires?'
  ],
  Canada: [
    'Why did you choose this college/university and how does it fit your academic history?',
    'Do you understand the SDS requirements, and have you paid your full first-year tuition?',
    'Where will you reside in Canada and how much are your estimated living expenses?'
  ],
  'United Kingdom': [
    'Why did you choose the UK for higher education instead of studying in India or other destinations?',
    'Why did you select this specific university in the UK, and how does this course align with your career goals?',
    'How do you plan to fund your tuition fees and living expenses during your stay in the UK?'
  ],
  Australia: [
    'Why did you choose Australia for your studies, and how does it fit into your career plans?',
    'Can you explain the tuition fees of your course and how you will cover your living expenses?',
    'What are your plans after completing your degree in Australia?'
  ],
  Ireland: [
    'Why did you choose Ireland as your study destination, and why did you select this university/college?',
    'How will you fund your education and living expenses in Ireland?',
    'What ties do you have to your home country that will ensure your return after graduation?'
  ],
  Netherlands: [
    'Why did you choose to study in the Netherlands rather than in your home country?',
    'How will you finance your studies and show proof of sufficient financial means?',
    'How does this program align with your previous academic background and career goals?'
  ]
}

export default function VisaPage() {
  const { user } = useUser()
  const [visas, setVisas] = useState<Record<string, VisaInfo>>({})
  const [selected, setSelected] = useState('Germany')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any | null>(null)

  // Interview Simulator State
  const [qIndex, setQIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [grading, setGrading] = useState(false)
  const [feedback, setFeedback] = useState<any | null>(null)

  useEffect(() => {
    ;(async () => {
      const [{ data: visaData }, profId] = await Promise.all([
        supabase.from('visa_requirements').select('*'),
        user ? getProfileId(user.id) : null
      ])

      const map = Object.fromEntries(visaData?.map((v: VisaInfo) => [v.country, v]) ?? [])
      setVisas(map)

      if (profId) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', profId).single()
        if (prof) setProfile(parseProfile(prof))
      }
      setLoading(false)
    })()
  }, [user])

  const visa = visas[selected]

  // Calculate Visa Probability
  const calculateProbability = () => {
    if (!profile || !visa) return 75 // baseline default
    let score = 50 // Base

    // Funding check (Max 25 pts)
    const budgetUSD = profile.budget_inr ? Math.round(profile.budget_inr / 83) : 0
    const reqFunds = visa.financial_requirement_usd ?? 12000
    if (budgetUSD >= reqFunds) score += 25
    else if (budgetUSD >= reqFunds * 0.8) score += 15
    else score -= 15

    // Language check (Max 15 pts)
    if (profile.ielts_score && profile.ielts_score >= 6.5) score += 15
    else if (profile.ielts_score && profile.ielts_score >= 6.0) score += 5
    else score -= 10

    // Academic check (Max 10 pts)
    if (profile.cgpa && profile.cgpa >= 8.0) score += 10
    else if (profile.cgpa && profile.cgpa >= 7.0) score += 5
    
    // Backlog penalty
    if (profile.backlogs && profile.backlogs > 0) {
      score -= Math.min(20, profile.backlogs * 5)
    }

    return Math.min(99, Math.max(10, score))
  }

  const prob = calculateProbability()
  const questions = MOCK_QUESTIONS[selected] || MOCK_QUESTIONS['Germany']

  async function handleGrade() {
    if (!answer.trim() || grading) return
    setGrading(true)
    try {
      const res = await fetch('/api/visa-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: selected,
          question: questions[qIndex],
          answer
        })
      })
      if (!res.ok) throw new Error('Grading failed.')
      const data = await res.json()
      setFeedback(data)
    } catch (e) {
      console.error(e)
    } finally {
      setGrading(false)
    }
  }

  const resetInterview = () => {
    setFeedback(null)
    setAnswer('')
  }

  if (loading) return <div className="text-center py-16 text-sm text-muted-foreground">Loading visa database...</div>

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Visa Guidance & Simulator</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">Embassy checksheets, visa probability meters, and AI mock interviews.</p>

      {/* Country Selection */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-4">
        {COUNTRIES.map(c => (
          <button key={c} onClick={() => { setSelected(c); resetInterview(); setQIndex(0) }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer
              ${selected === c
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-card text-muted-foreground border border-border hover:border-indigo-500/30 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
            {c === 'United Kingdom' ? 'UK' : c}
          </button>
        ))}
      </div>

      {visa && (
        <div className="space-y-6">
          {/* Top Panel: Metadata & Probability */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Quick Details Card */}
            <div className="md:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {visa.visa_type}
                </span>
                <h2 className="text-lg font-bold text-foreground mt-2">{selected} Student Visa</h2>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs border-t border-border/50 pt-4">
                <div>
                  <p className="text-muted-foreground font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Processing</p>
                  <p className="font-bold text-foreground mt-0.5">{visa.processing_days_min}-{visa.processing_days_max} days</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Visa Fee</p>
                  <p className="font-bold text-foreground mt-0.5">${visa.estimated_cost_usd}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Finances</p>
                  <p className="font-bold text-foreground mt-0.5">${visa.financial_requirement_usd?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Probability Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-5 text-white flex flex-col justify-between shadow-sm">
              <div>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Visa Success Probability</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold">{prob}%</span>
                  <span className="text-xs text-indigo-200">Confidence</span>
                </div>
              </div>
              <div className="w-full bg-indigo-950 h-2 rounded-full overflow-hidden mt-3">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    prob >= 80 ? 'bg-emerald-400' : prob >= 60 ? 'bg-amber-400' : 'bg-red-400'
                  }`} 
                  style={{ width: `${prob}%` }} 
                />
              </div>
              <p className="text-[10px] text-indigo-200/90 leading-relaxed mt-3">
                Based on GPA, IELTS, and financial budget in your profile.
              </p>
            </div>
          </div>

          {/* Interactive AI Visa Interview Simulator */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/50 pb-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              AI Visa Interview Simulator
            </h3>
            
            {!feedback ? (
              <div className="space-y-4">
                <div className="bg-indigo-500/10 p-4 rounded-lg border border-indigo-500/20">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Officer Question {qIndex + 1} of {questions.length}</span>
                  <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mt-1">{questions[qIndex]}</p>
                </div>
                
                <div>
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Your Response</label>
                  <textarea 
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Type your response to the officer here..."
                    className="w-full h-24 border border-border rounded-lg p-3 text-sm mt-1 focus:outline-indigo-300 text-foreground bg-card leading-relaxed resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  {qIndex > 0 && (
                    <button onClick={() => setQIndex(qIndex - 1)} className="px-4 py-2 border border-border text-muted-foreground text-xs font-semibold rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      Prev Question
                    </button>
                  )}
                  {qIndex < questions.length - 1 && (
                    <button onClick={() => { setQIndex(qIndex + 1); setAnswer('') }} className="px-4 py-2 border border-border text-muted-foreground text-xs font-semibold rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      Skip / Next
                    </button>
                  )}
                  <button 
                    onClick={handleGrade}
                    disabled={grading || !answer.trim()}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {grading ? 'Evaluating...' : <><Play className="w-3.5 h-3.5" /> Grade Answer</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {/* Result header */}
                <div className="flex items-center justify-between p-4 bg-muted border border-border rounded-lg">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Officer Decision</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">{feedback.verdict}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mock Score</span>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{feedback.score} / 10</p>
                  </div>
                </div>

                {/* Critique */}
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Officer Critique</h4>
                  <p className="text-xs text-muted-foreground bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-1 leading-relaxed">
                    {feedback.critique}
                  </p>
                </div>

                {/* Improved answer suggestion */}
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Recommended Answer Guide</h4>
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mt-1 leading-relaxed whitespace-pre-wrap font-medium">
                    {feedback.improvedAnswer}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={resetInterview} className="flex-1 py-2 border border-border text-muted-foreground text-xs font-semibold rounded-lg hover:bg-muted transition-colors cursor-pointer flex items-center justify-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" /> Retry Question
                  </button>
                  {qIndex < questions.length - 1 && (
                    <button onClick={() => { setQIndex(qIndex + 1); resetInterview() }} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer">
                      Next Question
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Required documents Checklist */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 border-b border-border/50 pb-2">Required Checklist Documents</h3>
            <ul className="space-y-2">
              {visa.required_docs?.map((doc, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed font-medium">
                  <Check className="text-emerald-500 font-bold mt-0.5 w-4 h-4 shrink-0" strokeWidth={3} />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interview tips */}
          {visa.interview_required && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-amber-950 dark:text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-500" />
                Visa Credibility Interview Tips
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{visa.interview_tips}</p>
            </div>
          )}

          {/* Rejection reasons */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-red-950 dark:text-red-300 uppercase tracking-wider mb-2">Common Embassy Rejection Reasons</h3>
            <ul className="space-y-1.5">
              {visa.common_rejection_reasons?.map((reason, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-red-800 dark:text-red-300 leading-relaxed">
                  <span className="font-bold shrink-0 mt-0.5">&bull;</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}