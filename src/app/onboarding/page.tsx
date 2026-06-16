'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { parseProfile } from '@/utils/profileMetadata'
import { useUser } from '@/components/providers/SupabaseAuthProvider'
import { 
  Send, Sparkles, CheckCircle2, ArrowRight, 
  GraduationCap, DollarSign, Globe, BookOpen, 
  MessageSquare, Loader2, Award, User
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoaded, isSignedIn } = useUser()
  const supabase = createClient()

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi there! I'm Aria, your GradPath AI counselor. 🎓 Let's build your study abroad profile! Where are you planning to study, and what is your current GPA/CGPA?",
    },
  ])
  
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [savingProgress, setSavingProgress] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Fetch initial profile
  useEffect(() => {
    if (!user) return

    const userId = user.id
    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', userId)
        .single()
      
      if (data) {
        const parsed = parseProfile(data)
        setProfile(parsed)
        
        // If profile is already complete, mark it complete
        if (
          parsed.cgpa !== null && 
          parsed.preferred_countries && 
          parsed.preferred_countries.length > 0 && 
          parsed.budget_inr !== null && 
          parsed.branch !== null
        ) {
          setOnboardingCompleted(true)
        }
      }
    }
    loadProfile()
  }, [user, supabase])

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    )
  }

  if (!isSignedIn) {
    router.replace('/login')
    return null
  }

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend ?? input
    if (!messageText.trim() || loading) return

    if (!textToSend) {
      setInput('')
    }

    const updatedMessages = [...messages, { role: 'user', content: messageText } as Message]
    setMessages(updatedMessages)
    setLoading(true)

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setMessages((prev) => [...prev, { role: 'assistant', content: data.text }])
      
      // Update dynamic profile preview
      if (data.profileUpdated || data.updatedFields) {
        setSavingProgress(true)
        const userId = user?.id
        if (userId) {
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('clerk_user_id', userId)
            .single()
          
          if (updatedProfile) {
            setProfile(parseProfile(updatedProfile))
          }
        }
        setTimeout(() => setSavingProgress(false), 800)
      }

      if (data.onboardingComplete) {
        setOnboardingCompleted(true)
      }
    } catch (err) {
      console.error('Onboarding response failed:', err)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Oops! Something went wrong. Let me retry.' },
      ])
    } finally {
      loading && setLoading(false)
    }
  }

  // Quick reply options based on missing values
  const getSuggestions = () => {
    if (!profile) return []
    
    if (!profile.preferred_countries || profile.preferred_countries.length === 0) {
      return ['USA', 'Canada', 'United Kingdom', 'Germany', 'Australia']
    }
    if (!profile.branch) {
      return ['Computer Science', 'Data Science', 'Mechanical Engineering', 'Business Analytics']
    }
    if (!profile.budget_inr) {
      return ['20 Lakhs', '35 Lakhs', '50 Lakhs', 'Flexible']
    }
    return []
  }

  const suggestions = getSuggestions()

  // Onboarding completion percentage
  const getProgressPercentage = () => {
    if (!profile) return 0
    let points = 0
    if (profile.preferred_countries && profile.preferred_countries.length > 0) points += 25
    if (profile.cgpa !== null) points += 25
    if (profile.branch !== null) points += 25
    if (profile.budget_inr !== null) points += 25
    return points
  }

  const progress = getProgressPercentage()

  const handleFinish = () => {
    router.replace('/dashboard')
  }

  return (
    <div className="h-screen bg-background text-foreground relative flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Profile Real-time Sync Sidebar */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border bg-card/30 backdrop-blur-md p-6 flex flex-col justify-between shrink-0 relative z-10">
        <div>
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h1 className="text-lg font-bold tracking-tight">
              Grad<span className="text-indigo-600 dark:text-indigo-400">Path</span> AI
            </h1>
          </div>

          <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Your AI Profile
          </h2>

          <div className="space-y-3">
            {/* Country Card */}
            <div className="p-3 rounded-lg border border-border bg-muted/30 relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    Target Countries
                  </div>
                  <div className="text-xs font-semibold mt-0.5 text-foreground">
                    {profile?.preferred_countries?.join(', ') || (
                      <span className="text-muted-foreground italic font-medium">Not set yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* GPA Card */}
            <div className="p-3 rounded-lg border border-border bg-muted/30 relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    Academic CGPA
                  </div>
                  <div className="text-xs font-semibold mt-0.5 text-foreground">
                    {profile?.cgpa !== null ? (
                      `${profile?.cgpa} / 10`
                    ) : (
                      <span className="text-muted-foreground italic font-medium">Not set yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Branch Card */}
            <div className="p-3 rounded-lg border border-border bg-muted/30 relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    Field of Study
                  </div>
                  <div className="text-xs font-semibold mt-0.5 text-foreground truncate max-w-[180px]">
                    {profile?.branch || (
                      <span className="text-muted-foreground italic font-medium">Not set yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Card */}
            <div className="p-3 rounded-lg border border-border bg-muted/30 relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    Maximum Budget
                  </div>
                  <div className="text-xs font-semibold mt-0.5 text-foreground">
                    {profile?.budget_inr ? (
                      `₹ ${(profile.budget_inr / 100000).toFixed(1)} Lakhs`
                    ) : (
                      <span className="text-muted-foreground italic font-medium">Not set yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Indicator */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${savingProgress ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span>{savingProgress ? 'Syncing...' : 'Synced to Supabase'}</span>
          </div>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{progress}% Complete</span>
        </div>
      </div>

      {/* Main Conversational Space */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Onboarding Progress Bar */}
        <div className="h-1 w-full bg-muted overflow-hidden shrink-0">
          <div 
            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Completion View */}
        {onboardingCompleted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">You&apos;re All Set!</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed font-medium">
                Your profile has been created and synced with the operating system database. We are ready to suggest universities and scholarships.
              </p>
            </div>
            
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center gap-2 shadow-xs cursor-pointer w-full justify-center transition-all mt-4"
            >
              Enter Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col min-h-0">
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white border-indigo-700' 
                      : 'bg-muted/40 text-indigo-600 border-border/80 dark:text-indigo-400'
                  }`}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                  </div>
                  
                  <div className={`p-3 rounded-lg text-xs font-semibold leading-relaxed border ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white border-indigo-750 rounded-tr-none' 
                      : 'bg-card text-foreground border-border/80 rounded-tl-none shadow-xs'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 self-start items-center">
                  <div className="w-8 h-8 rounded-full bg-muted/40 text-indigo-600 border border-border/80 flex items-center justify-center animate-spin">
                    <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Aria is thinking...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Options / Suggestions */}
            {suggestions.length > 0 && !loading && (
              <div className="px-6 py-2.5 flex flex-wrap gap-2 shrink-0 border-t border-border/40 bg-card/10">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider self-center mr-1">Quick reply:</span>
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(sug)}
                    className="py-1.5 px-3 bg-muted/40 hover:bg-muted/70 border border-border text-xs font-medium rounded-lg cursor-pointer transition-colors text-foreground"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-6 border-t border-border bg-card/20 shrink-0">
              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tell Aria about your goals, GPA, or budget..."
                  className="w-full pl-4 pr-12 py-3 border border-border rounded-lg text-xs bg-card text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 dark:focus-visible:ring-indigo-500 transition-all disabled:opacity-75"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="absolute right-2.5 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
