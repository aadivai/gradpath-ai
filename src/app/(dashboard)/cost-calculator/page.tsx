'use client'
import { useState } from 'react'
import { Wallet, Info, DollarSign, ArrowRight, TrendingUp } from 'lucide-react'

export default function CostCalculatorPage() {
  const [tuition, setTuition] = useState<number>(25000)
  const [living, setLiving] = useState<number>(1200)
  const [insurance, setInsurance] = useState<number>(1000)
  const [visa, setVisa] = useState<number>(500)
  const [flight, setFlight] = useState<number>(1200)
  const [misc, setMisc] = useState<number>(1500)
  const [duration, setDuration] = useState<number>(2)

  // Cost calculations
  const totalTuition = tuition * duration
  const totalLiving = living * 12 * duration
  const totalInsurance = insurance * duration
  const totalMisc = misc * duration
  const oneTimeFees = visa + flight

  const totalUSD = totalTuition + totalLiving + totalInsurance + totalMisc + oneTimeFees
  const totalINR = totalUSD * 83 // Exchange rate ₹83 per USD

  const percentTuition = totalUSD ? Math.round((totalTuition / totalUSD) * 100) : 0
  const percentLiving = totalUSD ? Math.round((totalLiving / totalUSD) * 100) : 0
  const percentInsurance = totalUSD ? Math.round((totalInsurance / totalUSD) * 100) : 0
  const percentMisc = totalUSD ? Math.round((totalMisc / totalUSD) * 100) : 0
  const percentOneTime = totalUSD ? Math.round((oneTimeFees / totalUSD) * 100) : 0

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Wallet className="w-6 h-6 text-indigo-600" />
          Study Cost Estimator
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Adjust cost sliders to calculate realistic degree budgets, living costs, and one-time setup expenses.
        </p>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Sliders & Selectors */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-border space-y-5">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/30 pb-2">
              Cost Variables
            </h2>

            <div className="space-y-4">
              {/* Duration selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Degree Duration</label>
                <select 
                  value={duration} 
                  onChange={e => setDuration(Number(e.target.value))} 
                  className="w-full border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-indigo-500 bg-card"
                >
                  <option value="1">1 Year (Accelerated / Masters)</option>
                  <option value="1.5">1.5 Years (Standard Masters)</option>
                  <option value="2">2 Years (Standard Masters / MBA)</option>
                  <option value="3">3 Years (Bachelors UK/Europe)</option>
                  <option value="4">4 Years (Bachelors US/Canada)</option>
                </select>
              </div>

              {/* Tuition Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-bold">Annual Tuition Fee (USD)</span>
                  <span className="text-indigo-650 font-bold">${tuition.toLocaleString()} / Yr</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="70000"
                  step="1000"
                  value={tuition}
                  onChange={e => setTuition(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
                />
              </div>

              {/* Living Cost Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-bold">Monthly Rent & Living (USD)</span>
                  <span className="text-indigo-650 font-bold">${living.toLocaleString()} / Mo</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="3000"
                  step="50"
                  value={living}
                  onChange={e => setLiving(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
                />
              </div>

              {/* Health Insurance Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-bold">Annual Health Insurance (USD)</span>
                  <span className="text-indigo-650 font-bold">${insurance.toLocaleString()} / Yr</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="4000"
                  step="100"
                  value={insurance}
                  onChange={e => setInsurance(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
                />
              </div>

              {/* Flight Costs Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-bold">One-time Flight Costs (USD)</span>
                  <span className="text-indigo-650 font-bold">${flight.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="3000"
                  step="100"
                  value={flight}
                  onChange={e => setFlight(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
                />
              </div>

              {/* Other inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Visa & SEVIS Fee (USD)</label>
                  <input
                    type="number"
                    value={visa}
                    onChange={e => setVisa(Number(e.target.value) || 0)}
                    className="w-full border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-indigo-500 bg-card"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Annual Miscellaneous (USD)</label>
                  <input
                    type="number"
                    value={misc}
                    onChange={e => setMisc(Number(e.target.value) || 0)}
                    className="w-full border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-indigo-500 bg-card"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Distributions */}
          <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/30 pb-2">
              Budget Distribution Breakdown
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-foreground/80 mb-1.5">
                  <span>Tuition Fees ({percentTuition}%)</span>
                  <span>${totalTuition.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative border border-border/20">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-indigo-600 rounded-full transition-all duration-300" style={{ width: `${percentTuition}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-foreground/80 mb-1.5">
                  <span>Living & Rent ({percentLiving}%)</span>
                  <span>${totalLiving.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative border border-border/20">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300" style={{ width: `${percentLiving}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-foreground/80 mb-1.5">
                  <span>Health Insurance ({percentInsurance}%)</span>
                  <span>${totalInsurance.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative border border-border/20">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${percentInsurance}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-foreground/80 mb-1.5">
                  <span>One-time setup (Flight, Visa) ({percentOneTime}%)</span>
                  <span>${oneTimeFees.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative border border-border/20">
                  <div className="h-full bg-rose-500 rounded-full transition-all duration-300" style={{ width: `${percentOneTime}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-foreground/80 mb-1.5">
                  <span>Other Miscellaneous ({percentMisc}%)</span>
                  <span>${totalMisc.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative border border-border/20">
                  <div className="h-full bg-muted0 rounded-full transition-all duration-300" style={{ width: `${percentMisc}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Sticky Summary Card & Tips */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl space-y-5 border border-indigo-900/50">
            <div>
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Estimated Total Budget</span>
              <h2 className="text-3xl font-extrabold tracking-tight mt-1 text-white">
                ${totalUSD.toLocaleString()} <span className="text-xs text-indigo-300 font-normal">USD</span>
              </h2>
              <p className="text-sm text-amber-300 font-bold mt-1.5 flex items-center gap-1">
                ~ ₹{(Math.round(totalINR / 100000)).toLocaleString()} Lakhs Total
              </p>
            </div>

            <div className="border-t border-indigo-900/80 pt-4 space-y-3 text-xs text-indigo-200">
              <div className="flex justify-between">
                <span>Tuition Cost ({duration} Years)</span>
                <span className="font-bold text-white">${totalTuition.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Living Expenses ({duration} Years)</span>
                <span className="font-bold text-white">${totalLiving.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Insurance ({duration} Years)</span>
                <span className="font-bold text-white">${totalInsurance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>One-time setup fees</span>
                <span className="font-bold text-white">${oneTimeFees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Other misc expenses</span>
                <span className="font-bold text-white">${totalMisc.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Differentiator Cost Reduction Strategies info box */}
          <div className="glass-card rounded-2xl p-5 border border-border bg-amber-50/40 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 space-y-3">
            <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4.5 h-4.5 text-amber-600 dark:text-amber-500 shrink-0" />
              Strategic Cost Minimization
            </h3>
            <ul className="space-y-2.5 text-xs text-amber-700/90 dark:text-amber-300/80 leading-relaxed font-semibold">
              <li className="flex items-start gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Block Accounts / GIC:</strong> Countries like Germany require a blocked account (approx €11,900) and Canada requires a GIC ($20,635 CAD) to cover first-year living costs. This is not an extra fee, but your own money paid back monthly.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <span><strong>TA/RA Waivers:</strong> Graduate assistantships typically cover full tuition and offer stipends. Check if target programs have high assistantship placement ratios before applying.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Off-Campus Accommodation:</strong> Co-sharing flats with other international student cohorts drops monthly living expenses by 30-50% compared to official university dorms.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
