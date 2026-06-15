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

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          <Compass className="w-6 h-6 text-indigo-600 animate-pulse" />
          Interactive World Explorer
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Explore cost, visa, climate, post-graduate salaries, and top programs by clicking destinations on the world cockpit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left: SVG Map Dashboard (col-span-7) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 flex flex-col justify-between shadow-xs overflow-hidden h-[480px]">
          <div className="flex justify-between items-center mb-4 border-b border-border/40 pb-2">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Destination Map Nodes</span>
            <span className="text-[9.5px] text-indigo-650 dark:text-indigo-400 font-bold">Click circles to inspect country</span>
          </div>

          {/* SVG Map Container */}
          <div className="flex-1 flex items-center justify-center relative bg-muted/10 dark:bg-zinc-950/20 rounded-xl p-2 border border-border/40">
            
            <svg viewBox="0 0 800 400" className="w-full h-full text-stone-300 dark:text-stone-750 fill-current opacity-85 select-none transition-all">
              {/* Simplified world contours backgrounds */}
              {/* North America outline mock */}
              <path d="M 50,50 L 250,50 L 250,150 L 150,220 L 50,150 Z" className="text-stone-200 dark:text-stone-900 fill-current" />
              {/* South America mock */}
              <path d="M 160,220 L 220,220 L 250,300 L 210,380 L 170,300 Z" className="text-stone-100 dark:text-zinc-900/40 fill-current" />
              {/* Eurasia / Africa outline mock */}
              <path d="M 350,50 L 750,50 L 780,220 L 600,280 L 450,220 L 400,250 L 350,180 Z" className="text-stone-200 dark:text-stone-900 fill-current" />
              <path d="M 380,180 L 480,180 L 520,300 L 480,380 L 400,320 Z" className="text-stone-100 dark:text-zinc-900/40 fill-current" />
              {/* Australia mock */}
              <path d="M 680,270 L 780,270 L 780,360 L 680,360 Z" className="text-stone-200 dark:text-stone-900 fill-current" />

              {/* Country Interactive Nodes */}
              {/* 1. Canada */}
              <g 
                className="cursor-pointer"
                onClick={() => setSelectedCountry('Canada')}
              >
                <circle cx="120" cy="80" r="14" className={`transition-all duration-300 ${selectedCountry === 'Canada' ? 'fill-indigo-600 stroke-4 stroke-indigo-100' : 'fill-stone-400 dark:fill-stone-600 hover:fill-indigo-500'}`} />
                <text x="120" y="62" textAnchor="middle" className="text-[10px] font-sans font-bold fill-foreground">Canada</text>
              </g>

              {/* 2. USA */}
              <g 
                className="cursor-pointer"
                onClick={() => setSelectedCountry('USA')}
              >
                <circle cx="150" cy="130" r="14" className={`transition-all duration-300 ${selectedCountry === 'USA' ? 'fill-indigo-600 stroke-4 stroke-indigo-100' : 'fill-stone-400 dark:fill-stone-600 hover:fill-indigo-500'}`} />
                <text x="150" y="112" textAnchor="middle" className="text-[10px] font-sans font-bold fill-foreground">USA</text>
              </g>

              {/* 3. Germany */}
              <g 
                className="cursor-pointer"
                onClick={() => setSelectedCountry('Germany')}
              >
                <circle cx="440" cy="100" r="14" className={`transition-all duration-300 ${selectedCountry === 'Germany' ? 'fill-indigo-600 stroke-4 stroke-indigo-100' : 'fill-stone-400 dark:fill-stone-600 hover:fill-indigo-500'}`} />
                <text x="440" y="82" textAnchor="middle" className="text-[10px] font-sans font-bold fill-foreground">Germany</text>
              </g>

              {/* 4. United Kingdom */}
              <g 
                className="cursor-pointer"
                onClick={() => setSelectedCountry('United Kingdom')}
              >
                <circle cx="400" cy="90" r="14" className={`transition-all duration-300 ${selectedCountry === 'United Kingdom' ? 'fill-indigo-600 stroke-4 stroke-indigo-100' : 'fill-stone-400 dark:fill-stone-600 hover:fill-indigo-500'}`} />
                <text x="400" y="72" textAnchor="middle" className="text-[10px] font-sans font-bold fill-foreground">UK</text>
              </g>

              {/* 5. Ireland */}
              <g 
                className="cursor-pointer"
                onClick={() => setSelectedCountry('Ireland')}
              >
                <circle cx="370" cy="110" r="12" className={`transition-all duration-300 ${selectedCountry === 'Ireland' ? 'fill-indigo-600 stroke-4 stroke-indigo-100' : 'fill-stone-400 dark:fill-stone-600 hover:fill-indigo-500'}`} />
                <text x="370" y="128" textAnchor="middle" className="text-[10px] font-sans font-bold fill-foreground">Ireland</text>
              </g>

              {/* 6. Netherlands */}
              <g 
                className="cursor-pointer"
                onClick={() => setSelectedCountry('Netherlands')}
              >
                <circle cx="460" cy="120" r="12" className={`transition-all duration-300 ${selectedCountry === 'Netherlands' ? 'fill-indigo-600 stroke-4 stroke-indigo-100' : 'fill-stone-400 dark:fill-stone-600 hover:fill-indigo-500'}`} />
                <text x="460" y="138" textAnchor="middle" className="text-[10px] font-sans font-bold fill-foreground">Netherlands</text>
              </g>

              {/* 7. Singapore */}
              <g 
                className="cursor-pointer"
                onClick={() => setSelectedCountry('Singapore')}
              >
                <circle cx="660" cy="200" r="12" className={`transition-all duration-300 ${selectedCountry === 'Singapore' ? 'fill-indigo-600 stroke-4 stroke-indigo-100' : 'fill-stone-400 dark:fill-stone-600 hover:fill-indigo-500'}`} />
                <text x="660" y="218" textAnchor="middle" className="text-[10px] font-sans font-bold fill-foreground">Singapore</text>
              </g>

              {/* 8. Australia */}
              <g 
                className="cursor-pointer"
                onClick={() => setSelectedCountry('Australia')}
              >
                <circle cx="730" cy="300" r="14" className={`transition-all duration-300 ${selectedCountry === 'Australia' ? 'fill-indigo-600 stroke-4 stroke-indigo-100' : 'fill-stone-400 dark:fill-stone-600 hover:fill-indigo-500'}`} />
                <text x="730" y="282" textAnchor="middle" className="text-[10px] font-sans font-bold fill-foreground">Australia</text>
              </g>
            </svg>
            
          </div>
        </div>

        {/* Right: Country Detail Profile (col-span-5) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-5 overflow-y-auto">
          
          <div className="border-b border-border/40 pb-3 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Destination Profile</span>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100 px-2 py-0.5 rounded-full font-bold">
              {data.studentRatio}
            </span>
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-black text-foreground">{data.name}</h2>
              <span className="text-xs text-muted-foreground italic">{data.climate}</span>
            </div>

            {/* Metrics Checklist */}
            <div className="grid grid-cols-2 gap-3.5 text-xs border-t border-b border-border/50 py-4">
              <div className="space-y-1">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Average Tuition
                </span>
                <p className="font-bold text-foreground">{data.avgFee}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> Living Cost
                </span>
                <p className="font-bold text-foreground">{data.livingCost}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Visa Processing
                </span>
                <p className="font-bold text-foreground">{data.visaTime}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Visa Success
                </span>
                <p className="font-bold text-foreground">{data.visaSuccess}</p>
              </div>
            </div>

            {/* Career prospects */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs border-b border-border/40 pb-1">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> Career Outlook
                </span>
                <span className="font-bold text-foreground">Median Salary: {data.salary}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {data.popularJobs.map(job => (
                  <span key={job} className="text-[10px] bg-muted border border-border text-foreground font-semibold px-2 py-0.5 rounded-md">
                    {job}
                  </span>
                ))}
              </div>
            </div>

            {/* Top universities in country */}
            <div className="space-y-2">
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Top Universities
              </span>
              <ul className="space-y-1 text-xs">
                {data.topUnis.map(u => (
                  <li key={u} className="flex items-center gap-1.5 text-foreground/80 font-semibold">
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    {u}
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Government/Uni Scholarships */}
            <div className="space-y-2">
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Major Scholarships
              </span>
              <ul className="space-y-1 text-xs">
                {data.scholarships.map(s => (
                  <li key={s} className="flex items-center gap-1.5 text-foreground/80 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* safety metrics indicator */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center justify-between text-xs mt-3">
            <span className="text-indigo-850 dark:text-indigo-300 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-650" />
              Safety Rating Index:
            </span>
            <span className="font-extrabold text-indigo-700 dark:text-indigo-400">{data.safetyIndex}/100</span>
          </div>

        </div>

      </div>
      
    </div>
  )
}
