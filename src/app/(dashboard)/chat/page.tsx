'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, MessageSquare, ChevronRight, Info } from 'lucide-react'

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
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 border-b border-border/40 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">AI Chat Counselor</h1>
          <p className="text-xs text-muted-foreground">Instant answers referenced from target country policies and university databases.</p>
        </div>
        {syncMessage && (
          <div className="animate-fade-in px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-600 dark:text-emerald-450" />
            {syncMessage}
          </div>
        )}
      </div>

      {/* Split-screen Chat Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden items-stretch">
        
        {/* Left pane: Messages and chat input (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-card border border-border rounded-2xl p-5 shadow-sm overflow-hidden h-full">
          
          {/* Scrollable message container */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
            {messages.map((m) => {
              const isBot = m.role === 'assistant'
              return (
                <div key={m.id} className={`flex gap-3 animate-fade-in ${isBot ? 'justify-start' : 'justify-end'}`}>
                  {isBot && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed transition-all ${
                    isBot 
                      ? 'bg-muted border border-stone-250/30 text-foreground' 
                      : 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                  }`}>
                    <p className="whitespace-pre-wrap font-medium">{m.content}</p>
                  </div>
                  {!isBot && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                      <User className="w-4.5 h-4.5" />
                    </div>
                  )}
                </div>
              )
            })}
            
            {/* Typing Loader Indicator */}
            {loading && (
              <div className="flex gap-3 justify-start animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Bot className="w-4.5 h-4.5 animate-spin" />
                </div>
                <div className="bg-muted border border-stone-250/30 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input row */}
          <div className="flex gap-2.5 shrink-0 pt-2 border-t border-border/40">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
              placeholder="Ask about blocked accounts, visa processing time, IELTS waiver policies..."
              className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-xs font-semibold text-foreground focus:outline-indigo-500 focus:ring-1 focus:ring-indigo-100"
            />
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm hover:shadow-indigo-100 transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Right pane: Glassmorphic Suggested Shortcuts (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto">
          
          {/* Shortcuts sidebar */}
          <div className="glass-card rounded-2xl p-5 border border-border space-y-4">
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                Suggested Inquiries
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Click to ask the counselor instantly</p>
            </div>

            <div className="flex flex-col gap-2.5">
              {FAQ_SHORTCUTS.map(f => (
                <button
                  key={f.text}
                  onClick={() => handleSend(f.text)}
                  className="w-full text-left bg-card hover:bg-indigo-50/20 border border-border hover:border-indigo-500/30 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground/90 flex flex-col gap-1 shadow-xs transition-all duration-200 group"
                >
                  <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">
                    {f.category}
                  </span>
                  <span className="group-hover:text-indigo-650 transition-colors flex items-center justify-between">
                    {f.text}
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-indigo-500 shrink-0" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Differentiator counselor audit notes */}
          <div className="glass-card rounded-2xl p-5 border border-border bg-amber-50/40 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 space-y-3">
            <h4 className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4.5 h-4.5 text-amber-600 dark:text-amber-500 shrink-0" />
              Counselor Transparency Audit
            </h4>
            <p className="text-xs leading-relaxed text-amber-700/95 dark:text-amber-300/90 font-medium">
              Study abroad agents usually give advice based on the universities that reward them with the highest commissions. They might recommend expensive private colleges in Canada or UK even if your profile is a perfect fit for tuition-free public universities in Germany.
            </p>
            <p className="text-xs leading-relaxed text-amber-700/90 dark:text-amber-300/80">
              Our AI counselor evaluates choices based purely on admissions probability, cost thresholds, and visa success ratios.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
