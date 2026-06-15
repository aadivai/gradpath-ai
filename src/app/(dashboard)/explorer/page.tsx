'use client'
import { useState } from 'react'
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Sun, 
  Briefcase, 
  GraduationCap, 
  Compass, 
  ChevronRight, 
  Award,
  AlertCircle,
  Wallet,
  CheckCircle
} from 'lucide-react'

type CountryDetail = {
  name: string
  avgFee: string
  livingCost: string
  visaTime: string
  visaSuccess: string
  salary: string
  popularJobs: string[]
  topUnis: string[]
  scholarships: string[]
  safetyIndex: number
  climate: string
  studentRatio: string
}

const COUNTRY_DATA: Record<string, CountryDetail> = {
  Canada: {
    name: 'Canada',
    avgFee: '$20,000 - $35,000 CAD / yr',
    livingCost: '$15,000 - $20,000 CAD / yr',
    visaTime: '6 - 12 Weeks',
    visaSuccess: '89%',
    salary: '$65,500 CAD / yr',
    popularJobs: ['Software Engineer', 'Data Analyst', 'Cloud Architect', 'Mechanical Engineer'],
    topUnis: ['University of Toronto', 'University of British Columbia', 'McGill University', 'Waterloo'],
    scholarships: ['Lester B. Pearson Scholarship', 'Vanier Graduate Scholarship', 'Ontario Trillium'],
    safetyIndex: 82,
    climate: 'Cold winters, mild summers. Heavy snow in eastern/central regions.',
    studentRatio: '28% International students'
  },
  USA: {
    name: 'United States',
    avgFee: '$30,000 - $55,000 USD / yr',
    livingCost: '$12,000 - $18,000 USD / yr',
    visaTime: '3 - 6 Weeks (F1 Visa)',
    visaSuccess: '85%',
    salary: '$88,000 USD / yr',
    popularJobs: ['AI Researcher', 'Full-stack Developer', 'Investment Banker', 'Hardware Engineer'],
    topUnis: ['MIT', 'Stanford University', 'Harvard University', 'UC Berkeley', 'UT Dallas'],
    scholarships: ['Fulbright Student Program', 'Hubert Humphrey Fellowship', 'Stanford Knight-Hennessy'],
    safetyIndex: 78,
    climate: 'Varies dramatically. Warm in California/Texas, cold in New England.',
    studentRatio: '22% International students'
  },
  Germany: {
    name: 'Germany',
    avgFee: 'Tuition-Free (Public Unis) / Semester fee €150-€350',
    livingCost: '€11,208 / yr (Blocked Account requirement)',
    visaTime: '4 - 8 Weeks',
    visaSuccess: '97%',
    salary: '€52,000 / yr',
    popularJobs: ['Automotive Engineer', 'AI/Robotics Scientist', 'SaaS Developer', 'Bio-technologist'],
    topUnis: ['Technical University of Munich (TUM)', 'RWTH Aachen University', 'Sorbonne Co-op'],
    scholarships: ['DAAD Scholarships', 'Heinrich Böll Scholarships', 'Deutschlandstipendium'],
    safetyIndex: 91,
    climate: 'Moderate temperate. Winters are mild-cold, summers are comfortable.',
    studentRatio: '15% International students'
  },
  'United Kingdom': {
    name: 'United Kingdom',
    avgFee: '£18,000 - £32,000 / yr',
    livingCost: '£12,000 - £15,000 / yr',
    visaTime: '3 - 4 Weeks (Student Route)',
    visaSuccess: '94%',
    salary: '£42,000 / yr',
    popularJobs: ['Fintech Developer', 'Data Scientist', 'Business Consultant', 'UX Architect'],
    topUnis: ['University of Oxford', 'University of Cambridge', 'Imperial College London', 'UCL'],
    scholarships: ['Chevening Scholarships', 'Commonwealth Scholarships', 'GREAT Scholarships'],
    safetyIndex: 84,
    climate: 'Maritime temperate. Frequent rainfall, moderate summers, cool winters.',
    studentRatio: '24% International students'
  },
  Ireland: {
    name: 'Ireland',
    avgFee: '€12,000 - €25,000 / yr',
    livingCost: '€10,000 - €12,000 / yr',
    visaTime: '4 - 8 Weeks',
    visaSuccess: '96%',
    salary: '€48,000 / yr',
    popularJobs: ['Data Engineer', 'Biotech Specialist', 'Software Engineer (Silicon Docks)', 'Cloud Admin'],
    topUnis: ['Trinity College Dublin', 'University College Dublin (UCD)', 'DCU'],
    scholarships: ['Government of Ireland Scholarship', 'TCD Global Excellence Scholarship'],
    safetyIndex: 89,
    climate: 'Mild temperate. Rain is common, comfortable summers, cool winters.',
    studentRatio: '18% International students'
  },
  Netherlands: {
    name: 'Netherlands',
    avgFee: '€9,000 - €20,000 / yr',
    livingCost: '€10,000 - €14,000 / yr',
    visaTime: '2 - 4 Weeks (MVV Fast-track)',
    visaSuccess: '98%',
    salary: '€44,000 / yr',
    popularJobs: ['Embedded Systems Architect', 'UX Designer', 'Renewable Energy Analyst'],
    topUnis: ['TU Delft', 'University of Amsterdam', 'Eindhoven Univ of Technology'],
    scholarships: ['NL Scholarship (Holland Scholarship)', 'Justus & Louise van Effen'],
    safetyIndex: 93,
    climate: 'Temperate maritime. Mild summers, cool windy winters, moderate rain.',
    studentRatio: '23% International students'
  },
  Australia: {
    name: 'Australia',
    avgFee: '$28,500 - $42,000 AUD / yr',
    livingCost: '$21,000 - $25,000 AUD / yr',
    visaTime: '4 - 12 Weeks (Subclass 500)',
    visaSuccess: '91%',
    salary: '$72,000 AUD / yr',
    popularJobs: ['Full-stack Engineer', 'Civil Engineer', 'Cybersecurity Analyst'],
    topUnis: ['University of Melbourne', 'University of Sydney', 'Australian National Uni'],
    scholarships: ['Destination Australia Scholarship', 'Australia Awards Scholarships'],
    safetyIndex: 86,
    climate: 'Primarily warm/subtropical. Moderate in south, hot dry in interior.',
    studentRatio: '31% International students'
  },
  Singapore: {
    name: 'Singapore',
    avgFee: '$22,000 - $40,000 SGD / yr',
    livingCost: '$14,000 - $20,000 SGD / yr',
    visaTime: '2 - 4 Weeks (Student Pass)',
    visaSuccess: '95%',
    salary: '$54,000 SGD / yr',
    popularJobs: ['Quantitative Analyst', 'VLSI Engineer', 'Cybersecurity Specialist'],
    topUnis: ['NUS', 'Nanyang Technological University (NTU)', 'SMU'],
    scholarships: ['Singapore International Graduate Award (SINGA)', 'NUS Research Scholarship'],
    safetyIndex: 98,
    climate: 'Tropical. Hot, humid, and rain showers throughout the year.',
    studentRatio: '20% International students'
  }
}

export default function ExplorerPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>('Germany')
  const data = COUNTRY_DATA[selectedCountry]

  // Target coordinates map
  const coords: Record<string, { x: number; y: number }> = {
    Canada: { x: 120, y: 80 },
    USA: { x: 140, y: 125 },
    Germany: { x: 440, y: 100 },
    'United Kingdom': { x: 400, y: 90 },
    Ireland: { x: 375, y: 95 },
    Netherlands: { x: 430, y: 108 },
    Singapore: { x: 660, y: 220 },
    Australia: { x: 730, y: 310 }
  }

  const originX = 580
  const originY = 175
  const activeCoord = coords[selectedCountry]

  // Flight path calculations
  const flightPath = activeCoord ? (() => {
    const midX = (originX + activeCoord.x) / 2
    const midY = Math.min(originY, activeCoord.y) - 60
    return `M ${originX} ${originY} Q ${midX} ${midY} ${activeCoord.x} ${activeCoord.y}`
  })() : null

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 animate-fade-in">
      <style>{`
        @keyframes flight-flow {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes radar-pulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 0.3; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .animate-flight {
          stroke-dasharray: 6, 6;
          animation: flight-flow 1.8s linear infinite;
        }
        .pulse-wave {
          transform-origin: center;
          animation: radar-pulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
      `}</style>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Compass className="w-6.5 h-6.5 text-indigo-600 animate-[spin_12s_linear_infinite]" />
            AI Global Operations Explorer
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Analyze tuition structures, visa throughput statistics, and local relocation metrics across major academic destinations.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 border border-border px-3.5 py-1.5 rounded-full text-[10px] font-bold text-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Active Route: <span className="text-indigo-600 dark:text-indigo-400 font-black">India &rarr; {selectedCountry}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left: SVG Map Dashboard (col-span-7) */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 flex flex-col justify-between border border-border bg-card shadow-lg relative overflow-hidden h-[510px]">
          
          <div className="flex justify-between items-center mb-4 border-b border-border/40 pb-3">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Continental Command Map</span>
            <span className="text-[9.5px] text-indigo-650 dark:text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-650 animate-ping" />
              Interactive Radar Node System
            </span>
          </div>

          {/* SVG Map Container */}
          <div className="flex-1 flex items-center justify-center relative bg-muted/20 dark:bg-zinc-950/40 rounded-2xl p-2 border border-border/40 overflow-hidden">
            
            <svg viewBox="0 0 800 400" className="w-full h-full text-stone-200 dark:text-stone-900 fill-current opacity-90 select-none transition-all">
              
              {/* Background Grid Lines */}
              {[50, 100, 150, 200, 250, 300, 350].map((y) => (
                <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="currentColor" strokeDasharray="2,6" className="text-border/15" />
              ))}
              {[100, 200, 300, 400, 500, 600, 700].map((x) => (
                <line key={x} x1={x} y1="0" x2={x} y2="400" stroke="currentColor" strokeDasharray="2,6" className="text-border/15" />
              ))}

              {/* Realistic World Map Contours */}
              {/* GREENLAND */}
              <path d="M 190,20 C 205,15 220,18 230,22 C 228,35 220,50 205,52 C 195,50 188,40 185,30 Z" className="text-stone-200/50 dark:text-zinc-900/30 fill-current" />
              
              {/* NORTH AMERICA */}
              <path d="M 25,50 C 35,45 50,45 60,50 C 68,38 80,30 100,35 C 110,32 120,40 120,45 C 130,35 145,35 155,42 C 160,55 170,55 175,50 C 178,55 185,55 188,62 C 185,72 172,75 168,80 C 172,82 175,85 185,82 C 192,85 195,95 185,102 C 188,110 198,115 198,122 C 200,135 208,145 208,155 C 202,158 198,150 195,145 C 190,148 185,152 180,145 C 170,148 165,155 158,158 C 152,168 152,180 155,190 C 158,200 162,205 165,210 C 162,212 158,208 155,202 C 152,192 142,175 138,168 C 125,165 110,165 98,155 C 95,148 90,132 90,122 C 95,122 98,128 98,135 C 95,142 85,142 78,132 C 68,128 58,118 68,102 C 60,95 48,92 48,82 C 38,82 30,78 30,68 Z" className="text-stone-300/60 dark:text-zinc-900/60 hover:text-stone-300/80 dark:hover:text-zinc-900/80 transition-colors duration-300 fill-current stroke stroke-border/10" />

              {/* SOUTH AMERICA */}
              <path d="M 165,210 C 175,208 185,212 192,218 C 205,222 220,225 235,232 C 245,245 242,260 235,275 C 225,295 220,315 215,335 C 210,355 202,375 198,382 C 195,385 192,382 192,378 C 195,365 190,350 188,338 C 182,328 178,318 175,308 C 170,295 168,280 168,265 C 162,250 158,235 158,222 Z" className="text-stone-200/50 dark:text-zinc-950/30 fill-current stroke stroke-border/5" />

              {/* EURASIA (Europe & Asia) */}
              <path d="M 330,95 C 340,90 350,85 360,90 C 368,82 375,70 380,62 C 388,58 398,58 402,68 C 405,58 412,48 425,38 C 438,32 445,45 448,58 C 455,55 462,45 470,38 C 475,45 478,55 480,68 C 482,75 488,85 490,95 C 510,95 530,90 550,92 C 570,88 590,88 610,92 C 630,88 650,88 670,92 C 690,85 710,80 730,82 C 745,85 758,95 765,108 C 772,112 778,122 772,135 C 768,142 762,138 755,142 C 748,148 738,155 728,152 C 718,158 708,162 698,158 C 688,165 678,172 668,178 C 658,185 648,192 638,198 C 628,205 618,212 608,208 C 598,202 590,195 580,188 C 572,195 565,202 558,208 C 552,202 548,195 548,188 C 538,185 528,182 518,185 C 512,175 508,165 508,155 C 498,158 488,162 478,158 C 468,165 458,172 448,168 C 438,175 428,172 418,165 C 408,158 398,152 388,155 C 378,148 368,142 358,145 C 348,138 338,132 338,122 C 332,115 328,105 328,95 Z" className="text-stone-300/60 dark:text-zinc-900/60 hover:text-stone-300/80 dark:hover:text-zinc-900/80 transition-colors duration-300 fill-current stroke stroke-border/10" />

              {/* AFRICA */}
              <path d="M 388,155 C 398,158 408,152 418,155 C 428,162 438,158 448,165 C 458,172 468,168 478,175 C 482,185 488,195 490,205 C 488,215 482,225 478,235 C 468,245 458,255 448,265 C 438,275 428,285 418,295 C 408,305 398,315 388,325 C 378,335 368,345 358,355 C 352,352 348,345 348,338 C 338,335 328,332 328,322 C 322,315 318,305 318,295 C 318,282 322,272 328,265 C 338,258 348,252 358,245 C 368,238 378,232 378,222 C 372,215 368,205 368,195 C 368,182 372,172 378,165 C 382,158 388,152 388,155 Z" className="text-stone-200/50 dark:text-zinc-950/30 fill-current stroke stroke-border/5" />

              {/* AUSTRALIA */}
              <path d="M 708,282 C 718,285 728,282 738,285 C 748,292 758,288 768,295 C 772,305 778,315 772,325 C 768,335 762,345 755,352 C 748,358 738,355 728,358 C 718,355 708,352 698,345 C 688,338 678,332 678,322 C 682,315 688,305 698,295 C 702,288 708,282 708,282 Z" className="text-stone-300/60 dark:text-zinc-900/60 fill-current stroke stroke-border/10" />

              {/* MADAGASCAR */}
              <path d="M 498,312 C 505,308 510,312 512,318 C 510,328 505,338 498,342 C 492,338 490,328 490,318 Z" className="text-stone-200/40 dark:text-zinc-900/40 fill-current" />

              {/* Dynamic Flight Arc Path */}
              {flightPath && (
                <>
                  <path
                    d={flightPath}
                    fill="none"
                    stroke="url(#arcGradient)"
                    strokeWidth="2.5"
                    className="stroke-indigo-500/80 animate-flight"
                  />
                  {/* Origin India Indicator */}
                  <g>
                    <circle cx={originX} cy={originY} r="14" className="fill-amber-500/20 pulse-wave" />
                    <circle cx={originX} cy={originY} r="5.5" className="fill-amber-500 stroke-2 stroke-white dark:stroke-zinc-900" />
                  </g>
                </>
              )}

              {/* Interactive Country Nodes */}
              {/* 1. Canada */}
              <g className="cursor-pointer group" onClick={() => setSelectedCountry('Canada')}>
                <circle cx="120" cy="80" r="16" className="fill-indigo-600/15 opacity-0 group-hover:opacity-100 pulse-wave" />
                <circle cx="120" cy="80" r="6" className={`transition-all duration-300 ${selectedCountry === 'Canada' ? 'fill-indigo-600 stroke-4 stroke-indigo-100 dark:stroke-indigo-950 scale-125' : 'fill-stone-400 dark:fill-stone-600 hover:fill-indigo-500'}`} />
                <text x="120" y="64" textAnchor="middle" className="text-[10px] font-extrabold fill-foreground/90 select-none">Canada</text>
              </g>

              {/* 2. USA */}
              <g className="cursor-pointer group" onClick={() => setSelectedCountry('USA')}>
                <circle cx="140" cy="125" r="16" className="fill-indigo-600/15 opacity-0 group-hover:opacity-100 pulse-wave" />
                <circle cx="140" cy="125" r="6" className={`transition-all duration-300 ${selectedCountry === 'USA' ? 'fill-indigo-600 stroke-4 stroke-indigo-100 dark:stroke-indigo-950 scale-125' : 'fill-stone-400 dark:fill-stone-600 hover:fill-indigo-500'}`} />
                <text x="140" y="142" textAnchor="middle" className="text-[10px] font-extrabold fill-foreground/90 select-none">USA</text>
              </g>

              {/* 3. United Kingdom */}
              <g className="cursor-pointer group" onClick={() => setSelectedCountry('United Kingdom')}>
                <circle cx="400" cy="90" r="16" className="fill-indigo-600/15 opacity-0 group-hover:opacity-100 pulse-wave" />
                <circle cx="400" cy="90" r="6" className={`transition-all duration-300 ${selectedCountry === 'United Kingdom' ? 'fill-indigo-600 stroke-4 stroke-indigo-100 dark:stroke-indigo-950 scale-125' : 'fill-stone-400 dark:fill-stone-600 hover:fill-indigo-500'}`} />
                <text x="400" y="74" textAnchor="middle" className="text-[10px] font-extrabold fill-foreground/90 select-none">UK</text>
              </g>

              {/* 4. Germany */}
              <g className="cursor-pointer group" onClick={() => setSelectedCountry('Germany')}>
                <circle cx="440" cy="100" r="16" className="fill-indigo-600/15 opacity-0 group-hover:opacity-100 pulse-wave" />
                <circle cx="440" cy="100" r="6" className={`transition-all duration-300 ${selectedCountry === 'Germany' ? 'fill-indigo-600 stroke-4 stroke-indigo-100 dark:stroke-indigo-950 scale-125' : 'fill-stone-400 dark:fill-stone-600 hover:fill-indigo-500'}`} />
                <text x="440" y="84" textAnchor="middle" className="text-[10px] font-extrabold fill-foreground/90 select-none">Germany</text>
              </g>

              {/* 5. Ireland */}
              <g className="cursor-pointer group" onClick={() => setSelectedCountry('Ireland')}>
                <circle cx="375" cy="95" r="14" className="fill-indigo-600/15 opacity-0 group-hover:opacity-100 pulse-wave" />
                <circle cx="375" cy="95" r="5" className={`transition-all duration-300 ${selectedCountry === 'Ireland' ? 'fill-indigo-600 stroke-4 stroke-indigo-100 dark:stroke-indigo-950 scale-125' : 'fill-stone-400 dark:fill-stone-600 hover:fill-indigo-500'}`} />
                <text x="375" y="112" textAnchor="middle" className="text-[10px] font-extrabold fill-foreground/90 select-none">Ireland</text>
              </g>

              {/* 6. Netherlands */}
              <g className="cursor-pointer group" onClick={() => setSelectedCountry('Netherlands')}>
                <circle cx="430" cy="115" r="14" className="fill-indigo-600/15 opacity-0 group-hover:opacity-100 pulse-wave" />
                <circle cx="430" cy="115" r="5" className={`transition-all duration-300 ${selectedCountry === 'Netherlands' ? 'fill-indigo-600 stroke-4 stroke-indigo-100 dark:stroke-indigo-950 scale-125' : 'fill-stone-400 dark:fill-stone-600 hover:fill-indigo-500'}`} />
                <text x="430" y="132" textAnchor="middle" className="text-[10px] font-extrabold fill-foreground/90 select-none">Netherlands</text>
              </g>

              {/* 7. Singapore */}
              <g className="cursor-pointer group" onClick={() => setSelectedCountry('Singapore')}>
                <circle cx="660" cy="220" r="14" className="fill-indigo-600/15 opacity-0 group-hover:opacity-100 pulse-wave" />
                <circle cx="660" cy="220" r="5" className={`transition-all duration-300 ${selectedCountry === 'Singapore' ? 'fill-indigo-600 stroke-4 stroke-indigo-100 dark:stroke-indigo-950 scale-125' : 'fill-stone-400 dark:fill-stone-600 hover:fill-indigo-500'}`} />
                <text x="660" y="238" textAnchor="middle" className="text-[10px] font-extrabold fill-foreground/90 select-none">Singapore</text>
              </g>

              {/* 8. Australia */}
              <g className="cursor-pointer group" onClick={() => setSelectedCountry('Australia')}>
                <circle cx="730" cy="310" r="16" className="fill-indigo-600/15 opacity-0 group-hover:opacity-100 pulse-wave" />
                <circle cx="730" cy="310" r="6" className={`transition-all duration-300 ${selectedCountry === 'Australia' ? 'fill-indigo-600 stroke-4 stroke-indigo-100 dark:stroke-indigo-950 scale-125' : 'fill-stone-400 dark:fill-stone-600 hover:fill-indigo-500'}`} />
                <text x="730" y="294" textAnchor="middle" className="text-[10px] font-extrabold fill-foreground/90 select-none">Australia</text>
              </g>

              {/* Gradients Definitions */}
              <defs>
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>
            
          </div>
        </div>

        {/* Right: Country Detail Profile (col-span-5) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-3xl p-6 shadow-md flex flex-col justify-between gap-5 relative overflow-hidden">
          {/* Top color band matching country profile style */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600" />
          
          <div className="border-b border-border/40 pb-3.5 flex items-center justify-between mt-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Destination Profile</span>
            <span className="text-[9.5px] bg-indigo-50 text-indigo-750 border border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-500/20 px-2.5 py-0.5 rounded-full font-bold">
              {data.studentRatio}
            </span>
          </div>

          <div className="space-y-5 flex-1">
            <div>
              <h2 className="text-xl font-black text-foreground">{data.name}</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 font-medium italic">
                Climate: {data.climate}
              </p>
            </div>

            {/* Metrics Checklist Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 border border-border/60 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-indigo-500" /> Avg Tuition Fee
                </span>
                <p className="text-xs font-bold text-foreground leading-snug">{data.avgFee}</p>
              </div>

              <div className="bg-muted/30 border border-border/60 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-indigo-500" /> Living Expense
                </span>
                <p className="text-xs font-bold text-foreground leading-snug">{data.livingCost}</p>
              </div>

              <div className="bg-muted/30 border border-border/60 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> Visa Process
                </span>
                <p className="text-xs font-bold text-foreground leading-snug">{data.visaTime}</p>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] text-emerald-600 dark:text-emerald-450 uppercase font-bold tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Visa Success Rate
                </span>
                <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">{data.visaSuccess}</p>
              </div>
            </div>

            {/* Career prospects */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-border/40 pb-1.5">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Career Outlook
                </span>
                <span className="font-extrabold text-foreground">Median Salary: {data.salary}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {data.popularJobs.map(job => (
                  <span key={job} className="text-[10px] bg-muted/70 border border-border text-foreground font-semibold px-2.5 py-1 rounded-md">
                    {job}
                  </span>
                ))}
              </div>
            </div>

            {/* Top universities in country */}
            <div className="space-y-2">
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Top Ranked Institutes
              </span>
              <ul className="grid grid-cols-1 gap-1.5 text-xs font-semibold text-foreground/80">
                {data.topUnis.map(u => (
                  <li key={u} className="flex items-center gap-2 bg-muted/20 border border-border/30 rounded-lg p-2 hover:bg-muted/40 transition-all">
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    {u}
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Government/Uni Scholarships */}
            <div className="space-y-2">
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Major Funding Programs
              </span>
              <ul className="grid grid-cols-1 gap-1.5 text-xs font-semibold text-foreground/80">
                {data.scholarships.map(s => (
                  <li key={s} className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/15 rounded-lg p-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* safety metrics indicator bar */}
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3.5 flex flex-col gap-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-indigo-850 dark:text-indigo-300 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-650" />
                Destination Safety Rating
              </span>
              <span className="font-extrabold text-indigo-700 dark:text-indigo-400">{data.safetyIndex}/100</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${data.safetyIndex}%` }}
              />
            </div>
          </div>

        </div>

      </div>
      
    </div>
  )
}
