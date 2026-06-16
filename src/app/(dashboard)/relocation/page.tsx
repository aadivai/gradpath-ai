'use client'
import { useState, useEffect } from 'react'
import { 
  CheckSquare, 
  Square, 
  Home, 
  Wallet, 
  Phone, 
  Luggage, 
  Info,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

type Task = { id: string; label: string; category: string }

const DEFAULT_TASKS: Task[] = [
  { id: '1', label: 'Set up blocked account / GIC deposit', category: 'finance' },
  { id: '2', label: 'Submit student visa application to embassy', category: 'visa' },
  { id: '3', label: 'Register for student dormitory waiting list', category: 'housing' },
  { id: '4', label: 'Book student health insurance policy', category: 'finance' },
  { id: '5', label: 'Buy international flight tickets', category: 'travel' },
  { id: '6', label: 'Print hard copies of offer letter & enrolment receipt', category: 'docs' },
  { id: '7', label: 'Exchange baseline cash currency (EUR/CAD/USD)', category: 'finance' },
  { id: '8', label: 'Pack medical prescription list & medicines', category: 'travel' },
  { id: '9', label: 'Finalize packing list (clothing, laptops, chargers)', category: 'travel' },
  { id: '10', label: 'Rent temporary airbnb / hostel for first 10 days', category: 'housing' }
]

export default function RelocationPage() {
  const [activeTab, setActiveTab] = useState<'housing' | 'bank' | 'sim' | 'packing' | 'airport'>('housing')
  const [checkedIds, setCheckedIds] = useState<string[]>([])

  // Load checklist state on mount
  useEffect(() => {
    const saved = localStorage.getItem('gradpath_relocation_checklist')
    if (saved) {
      try {
        setCheckedIds(JSON.parse(saved))
      } catch (e) {}
    }
  }, [])

  // Toggle tasks
  const toggleTask = (id: string) => {
    let next: string[]
    if (checkedIds.includes(id)) {
      next = checkedIds.filter(x => x !== id)
    } else {
      next = [...checkedIds, id]
    }
    setCheckedIds(next)
    localStorage.setItem('gradpath_relocation_checklist', JSON.stringify(next))
  }

  const progress = Math.round((checkedIds.length / DEFAULT_TASKS.length) * 100)

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      
      {/* Header */}
      <PageHeader
        icon={Luggage}
        title="Relocation Assistant"
        subtitle="Post-admission logistics hub. Organize housing deposits, bank accounts, local SIMs, and manage your relocation checklist."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Pane: Tabbed Relocation Guides (col-span-7) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col min-h-[460px]">
          
          {/* Tabs Selector list */}
          <div className="flex bg-muted/60 border border-border p-1 rounded-xl text-xs mb-5 overflow-x-auto select-none scrollbar-none">
            {[
              { id: 'housing', label: 'Accommodation', icon: Home },
              { id: 'bank', label: 'Blocked Account / Bank', icon: Wallet },
              { id: 'sim', label: 'Local SIM Card', icon: Phone },
              { id: 'packing', label: 'Packing Checklist', icon: Luggage },
              { id: 'airport', label: 'Airport & Customs', icon: Info },
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-card text-foreground shadow-xs' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Guide contents rendering */}
          <div className="flex-1 text-xs leading-relaxed space-y-4 pr-1">
            
            {/* 1. ACCOMMODATION TAB */}
            {activeTab === 'housing' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Securing Student Housing</h3>
                  <p className="text-muted-foreground mt-1 font-medium">Finding housing from abroad is competitive. Follow this chronological approach.</p>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-muted/50 rounded-lg border border-border/60">
                    <p className="font-semibold text-foreground">Option A: University Studentenwerk / Dorms (Recommended)</p>
                    <p className="text-muted-foreground mt-1 leading-normal">
                      Public dorms are heavily subsidized (€250 - €450/month). Apply as soon as you receive your admissions offer — even before receiving your visa. Waiting times can range from 3 to 12 months.
                    </p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg border border-border/60">
                    <p className="font-semibold text-foreground">Option B: Private Shared Housing (WG / Homestays)</p>
                    <p className="text-muted-foreground mt-1 leading-normal">
                      For Germany, utilize platforms like WG-Gesucht. For Canada/USA, browse Kijiji, Craigslist, or PadMapper. Watch out for rental scams: never transfer deposits before signing a lease or verifying landlord credentials.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-lg p-3.5 text-amber-800 dark:text-amber-300">
                  <p className="font-semibold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400">Important Alert</p>
                  <p className="mt-1 leading-normal">
                    Always confirm if a private landlord provides a "Wohnungsgeberbestätigung" (Landlord Confirmation Letter) or city registry lease. You need this registration ("Anmeldung") to open permanent bank accounts or get tax IDs.
                  </p>
                </div>
              </div>
            )}

            {/* 2. BANK ACCOUNTS TAB */}
            {activeTab === 'bank' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Setting up Blocked Accounts & Local Banking</h3>
                  <p className="text-muted-foreground mt-1 font-medium">Demonstrating financial capability is required for global visa issuance.</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 border border-border rounded-lg bg-card space-y-1.5">
                    <p className="font-semibold text-foreground">Germany: Blocked Account ("Sperrkonto")</p>
                    <p className="text-muted-foreground leading-normal">
                      You must deposit €11,208 to a certified blocked account provider (Expatrio, Fintiba, or Coracle). The bank automatically payouts €934/month once you register in Germany.
                    </p>
                  </div>

                  <div className="p-3.5 border border-border rounded-lg bg-card space-y-1.5">
                    <p className="font-semibold text-foreground">Canada: GIC (Guaranteed Investment Certificate)</p>
                    <p className="text-muted-foreground leading-normal">
                      Under the SDS visa stream, you must deposit $20,635 CAD into a GIC (via Simplii Financial, Scotiabank, or CIBC). Upon arrival, you receive a portion and monthly payments thereafter.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg border border-border/60">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-indigo-650" /> Permanent Local Accounts
                  </p>
                  <p className="text-muted-foreground mt-1 leading-normal">
                    Once you land and complete city registration, open a free mobile checking account (e.g., N26, Sparkasse in Europe, or Simplii, RBC in Canada) to handle debit transactions and receive part-time job salaries.
                  </p>
                </div>
              </div>
            )}

            {/* 3. SIM CARD TAB */}
            {activeTab === 'sim' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Acquiring a Local Mobile Connection</h3>
                  <p className="text-muted-foreground mt-1 font-medium">A local cell number is required to sign up for transport apps, banking, and rental communications.</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-muted/50 rounded-lg border border-border/60 space-y-1">
                    <p className="font-semibold text-foreground">Prepaid SIM Cards (Highly Recommended First Step)</p>
                    <p className="text-muted-foreground leading-normal">
                      Prepaid plans require no contracts and can be activated immediately at supermarket counters. Popular options include Aldi Talk, Lebara, or Lidl Connect (Germany), and Chatr or Lucky Mobile (Canada).
                    </p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg border border-border/60 space-y-1">
                    <p className="font-semibold text-foreground">Contract Postpaid SIMs (24 Months)</p>
                    <p className="text-muted-foreground leading-normal">
                      Contracts offer cheaper high-speed data margins but lock you in for a long duration. Avoid these until you have a stable permanent residence and clear credit history.
                    </p>
                  </div>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 flex items-start gap-2 text-indigo-800 dark:text-indigo-300">
                  <Info className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="font-medium">
                    EU Roaming Rule: SIM cards purchased in Germany or other European Union countries allow zero-fee roaming, data usage, and calling across all 27 EU member states.
                  </p>
                </div>
              </div>
            )}

            {/* 4. PACKING CHECKLIST TAB */}
            {activeTab === 'packing' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Packing Matrix</h3>
                  <p className="text-muted-foreground mt-1 font-medium">Core essentials for student relocations.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                  <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-border/60">
                    <p className="font-semibold text-foreground border-b border-border/50 pb-1 uppercase tracking-wider text-[9px] text-indigo-600 dark:text-indigo-400">Hand Luggage (Must-haves)</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Original Passport & Student Visa</li>
                      <li>• University Enrolment Letter</li>
                      <li>• Blocked account / GIC confirmation</li>
                      <li>• Cash Currency (€300 - €500)</li>
                      <li>• Laptop, Phone & Adapters</li>
                    </ul>
                  </div>

                  <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-border/60">
                    <p className="font-semibold text-foreground border-b border-border/50 pb-1 uppercase tracking-wider text-[9px] text-indigo-600 dark:text-indigo-400">Checked Baggage</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Winter clothing (layered)</li>
                      <li>• Formal clothing (1-2 sets)</li>
                      <li>• Standard medications (with prescription)</li>
                      <li>• Regional adapter plugs</li>
                      <li>• Baseline kitchen spices / essentials</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 5. AIRPORT & CUSTOMS TAB */}
            {activeTab === 'airport' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Airport Arrival & Border Control Procedures</h3>
                  <p className="text-muted-foreground mt-1 font-medium">What to expect when landing in your target destination country.</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-muted/50 rounded-lg border border-border/60">
                    <p className="font-semibold text-foreground">1. Border Control Interview</p>
                    <p className="text-muted-foreground mt-1 leading-normal">
                      The border control officer will review your passport and student visa. Keep a printed folder containing your University Enrollment Letter, block account/funding confirmation, and accommodation address details in your hand luggage.
                    </p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg border border-border/60">
                    <p className="font-semibold text-foreground">2. Study Permit Issuance (Canada/USA)</p>
                    <p className="text-muted-foreground mt-1 leading-normal">
                      If landing in Canada, do not leave border control without picking up your physical "Study Permit" sheet from immigration officers. If landing in the USA, check that your I-20 has been stamped.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Pane: Relocation Checklist Tracker (col-span-5) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-xl p-5 shadow-xs space-y-5 flex flex-col justify-between">
          
          <div className="space-y-3">
            <div className="border-b border-border/40 pb-3 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Milestones Tracker</span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{progress}% Done</span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium">
                <span>{checkedIds.length} of {DEFAULT_TASKS.length} tasks completed</span>
                <span>{progress}%</span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2 pt-3 max-h-72 overflow-y-auto pr-1">
              {DEFAULT_TASKS.map(task => {
                const checked = checkedIds.includes(task.id)
                return (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="w-full text-left flex items-start gap-2.5 px-3 py-2.5 bg-card hover:bg-muted/50 rounded-lg border border-border hover:border-indigo-500/20 text-xs font-medium transition-all group cursor-pointer"
                  >
                    <span className="shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {checked ? (
                        <CheckSquare className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-500" />
                      ) : (
                        <Square className="w-4.5 h-4.5 text-muted-foreground/50 group-hover:text-indigo-500" />
                      )}
                    </span>
                    <span className={checked ? 'line-through text-muted-foreground' : 'text-foreground'}>
                      {task.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Differentiator relocation info */}
          <div className="bg-amber-500/5 dark:bg-amber-500/10 rounded-lg p-4 border border-border text-amber-800 dark:text-amber-300 space-y-2 mt-4">
            <h4 className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <HelpCircle className="w-4.5 h-4.5 text-amber-600 dark:text-amber-500" />
              Need Help Landlord Registration?
            </h4>
            <p className="text-[11px] leading-relaxed text-amber-700/95 dark:text-amber-300/80">
              German cities require you to register your residential address within 14 days of moving in ("Anmeldung"). Once registered, you will receive a tax ID ("Steueridentifikationsnummer") via post which is mandatory for working part-time.
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}
