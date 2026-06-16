'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, MessageSquare, ChevronRight, Info } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const FAQ_SHORTCUTS = [
  { text: 'Best AI programs in Germany under $20k?', category: 'Germany' },
  { text: 'Blocked account requirement for Germany?', category: 'Finances' },
  { text: 'Which Canadian universities accept 6.5 IELTS?', category: 'Canada' },
  { text: 'Fully funded government scholarships in Ireland?', category: 'Scholarships' },
  { text: 'How do I secure a graduate assistantship in the USA?', category: 'USA' }
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hi there! I am your GradPath AI counselor. Ask me anything about university match criteria, scholarships, living costs, or visa checklists!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function handleSend(textToSend?: string) {
    const text = (textToSend ?? input).trim()
    if (!text || loading) return

    setInput('')
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory })
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || 'Failed to get counselor response.')
      }

      const data = await res.json()
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text
      }])

      if (data.profileUpdated && data.updatedFields) {
        const updates = Object.entries(data.updatedFields)
          .map(([k, v]) => `${k.replace('_', ' ')} → ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(', ')
        setSyncMessage(`AI Memory Synced: Updated ${updates}`)
        setTimeout(() => setSyncMessage(null), 6000)
      }
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${e.message}. Please try again.`
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <PageHeader
        icon={MessageSquare}
        title="AI Chat Counselor"
        subtitle="Instant answers referenced from target country policies and university databases."
        badge={syncMessage && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-semibold tracking-wider flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-450" />
            {syncMessage}
          </div>
        )}
      />

      {/* Split-screen Chat Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden items-stretch">
        
        {/* Left pane: Messages and chat input (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-card border border-border rounded-xl p-5 shadow-sm overflow-hidden h-full">
          
          {/* Scrollable message container */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
            {messages.map((m) => {
              const isBot = m.role === 'assistant'
              return (
                <div key={m.id} className={`flex gap-3 animate-in fade-in duration-200 ${isBot ? 'justify-start' : 'justify-end'}`}>
                  {isBot && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed transition-all ${
                    isBot 
                      ? 'bg-muted/50 border border-border/80 text-foreground' 
                      : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/5'
                  }`}>
                    <p className="whitespace-pre-wrap font-normal">{m.content}</p>
                  </div>
                  {!isBot && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-600/10">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              )
            })}
            
            {/* Typing Loader Indicator */}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted/50 border border-border/80 rounded-xl px-4 py-3 shadow-xs flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/45 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/45 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/45 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input row */}
          <div className="flex gap-2.5 shrink-0 pt-3 border-t border-border/50">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
              placeholder="Ask about blocked accounts, visa processing time, IELTS waiver policies..."
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-550 focus-visible:border-indigo-550 placeholder:text-muted-foreground/60 transition-shadow"
            />
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right pane: Suggested Shortcuts (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-5 overflow-y-auto">
          
          {/* Shortcuts sidebar */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Suggested Inquiries
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-normal">Click to ask the counselor instantly</p>
            </div>

            <div className="flex flex-col gap-2">
              {FAQ_SHORTCUTS.map(f => (
                <button
                  key={f.text}
                  onClick={() => handleSend(f.text)}
                  className="w-full text-left bg-card hover:bg-muted/40 border border-border hover:border-muted-foreground/20 rounded-xl px-3.5 py-2.5 text-xs font-normal text-foreground/90 flex flex-col gap-1 transition-all duration-200 group cursor-pointer"
                >
                  <span className="text-[9px] font-semibold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                    {f.category}
                  </span>
                  <span className="flex items-center justify-between text-foreground/80 group-hover:text-foreground transition-colors">
                    {f.text}
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/80 shrink-0 ml-1 transition-colors" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Differentiator counselor audit notes */}
          <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 rounded-xl p-5 text-amber-800 dark:text-amber-300 space-y-3">
            <h4 className="text-[10px] text-amber-800 dark:text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
              Counselor Transparency Audit
            </h4>
            <p className="text-xs leading-relaxed text-amber-800/80 dark:text-amber-300/80 font-normal">
              Study abroad agents usually give advice based on the universities that reward them with the highest commissions. They might recommend expensive private colleges in Canada or UK even if your profile is a perfect fit for tuition-free public universities in Germany.
            </p>
            <p className="text-xs leading-relaxed text-amber-800/70 dark:text-amber-300/70">
              Our AI counselor evaluates choices based purely on admissions probability, cost thresholds, and visa success ratios.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
