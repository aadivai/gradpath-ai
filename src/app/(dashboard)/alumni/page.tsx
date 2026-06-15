'use client'
import { useState } from 'react'
import { 
  Users, 
  Search, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Link2, 
  MessageSquare,
  Sparkles,
  Calendar,
  ChevronRight,
  Info
} from 'lucide-react'

type Alumni = {
  id: string
  name: string
  undergrad: string
  gradUni: string
  country: string
  program: string
  currentRole: string
  company: string
  linkedInUrl: string
  bio: string
}

const ALUMNI_LIST: Alumni[] = [
  {
    id: '1',
    name: 'Amit Sharma',
    undergrad: 'B.Tech IT (Class of 2022)',
    gradUni: 'Technical University of Munich (TUM)',
    country: 'Germany',
    program: 'M.S. in Informatics',
    currentRole: 'Software Engineer',
    company: 'BMW Group',
    linkedInUrl: 'https://linkedin.com',
    bio: 'Secured public student dormitory housing in Munich and handles blocked account documentation. Ask me about German visas!'
  },
  {
    id: '2',
    name: 'Neha Patel',
    undergrad: 'B.Tech CS (Class of 2021)',
    gradUni: 'Stanford University',
    country: 'USA',
    program: 'M.S. in Computer Science (AI Track)',
    currentRole: 'AI Researcher',
    company: 'Google',
    linkedInUrl: 'https://linkedin.com',
    bio: 'Specializes in NLP pipelines and transformer models. Can guide on USA F-1 visa interview prep and securing graduate assistantships.'
  },
  {
    id: '3',
    name: 'Karan Singh',
    undergrad: 'B.Tech IT (Class of 2023)',
    gradUni: 'University of Toronto',
    country: 'Canada',
    program: 'Master of Science in Applied Computing',
    currentRole: 'Cloud Developer',
    company: 'Amazon Web Services (AWS)',
    linkedInUrl: 'https://linkedin.com',
    bio: 'Relocated under Canada SDS program with CIBC GIC. Happy to share tips on co-op placements in Ontario tech sectors.'
  },
  {
    id: '4',
    name: 'Aditi Rao',
    undergrad: 'B.Tech CS (Class of 2020)',
    gradUni: 'Trinity College Dublin',
    country: 'Ireland',
    program: 'M.S. in Computer Science (Data Science)',
    currentRole: 'Data Analyst',
    company: 'Stripe',
    linkedInUrl: 'https://linkedin.com',
    bio: 'Residing in Dublin Silicon Docks. Ask me about Ireland Critical Skills Employment permits and Dublin student housing search.'
  },
  {
    id: '5',
    name: 'Vikram Malhotra',
    undergrad: 'B.Tech ECE (Class of 2022)',
    gradUni: 'Delft University of Technology (TU Delft)',
    country: 'Netherlands',
    program: 'M.S. in Embedded Systems',
    currentRole: 'Embedded Engineer',
    company: 'ASML',
    linkedInUrl: 'https://linkedin.com',
    bio: 'Expert on TU Delft scholarships and Netherlands MVV student visas. Happy to review SOP drafts and share engineering course reviews.'
  }
]

export default function AlumniPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCountry, setFilterCountry] = useState('All')

  const filteredAlumni = ALUMNI_LIST.filter(alumni => {
    const matchesSearch = 
      alumni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumni.gradUni.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumni.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumni.program.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCountry = filterCountry === 'All' || alumni.country === filterCountry

    return matchesSearch && matchesCountry
  })

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600 animate-pulse" />
          Alumni & Mentor Network
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Connect directly with seniors who graduated from your college and landed admissions in your target country. Find their profiles on LinkedIn instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Span: Search & Alumni Directory (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Search and Filters Bar */}
          <div className="glass-card rounded-2xl p-4 border border-border bg-card flex flex-col sm:flex-row gap-3 shadow-xs">
            <div className="flex-1 flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-muted/20">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, university, or current employer..."
                className="w-full text-xs font-semibold bg-transparent text-foreground placeholder-muted-foreground outline-none"
              />
            </div>

            <select
              value={filterCountry}
              onChange={e => setFilterCountry(e.target.value)}
              className="border border-border rounded-xl px-3.5 py-2 text-xs font-bold text-foreground focus:outline-indigo-500 bg-card cursor-pointer shrink-0"
            >
              <option value="All">All Countries</option>
              <option value="Germany">Germany</option>
              <option value="USA">USA</option>
              <option value="Canada">Canada</option>
              <option value="Ireland">Ireland</option>
              <option value="Netherlands">Netherlands</option>
            </select>
          </div>

          {/* Directory Listings */}
          <div className="space-y-4">
            {filteredAlumni.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-2xl">
                <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-bold">No alumni match your active query.</p>
              </div>
            ) : (
              filteredAlumni.map(alumni => (
                <div key={alumni.id} className="bg-card border border-border rounded-2xl p-5 hover:border-indigo-500/30 hover:shadow-xs transition-all flex flex-col sm:flex-row gap-5 items-start justify-between">
                  
                  {/* Left Column Profile info */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div>
                      <h3 className="text-sm font-black text-foreground">{alumni.name}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">{alumni.undergrad}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground/80">
                        <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="truncate">{alumni.gradUni} ({alumni.program})</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-foreground/80">
                        <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span>{alumni.currentRole} at <span className="font-bold text-foreground">{alumni.company}</span></span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed pl-3 border-l-2 border-indigo-500/30 font-medium">
                      {alumni.bio}
                    </p>
                  </div>

                  {/* Right Column Action connects */}
                  <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0" onClick={e => e.stopPropagation()}>
                    <a
                      href={alumni.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none text-center px-4 py-2 bg-[#0077b5] hover:bg-[#00669b] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Link2 className="w-4 h-4" />
                      LinkedIn Profile
                    </a>
                    <button
                      onClick={() => alert(`Mock scheduling interface for booking a session with ${alumni.name}`)}
                      className="flex-1 sm:flex-none text-center px-4 py-2 bg-muted hover:bg-stone-200 dark:hover:bg-stone-850 text-foreground border border-border text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Book Chat
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>

        {/* Right Span: Mentor Community Rooms (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Booking Info Box */}
          <div className="glass-card rounded-2xl p-5 border border-border bg-card space-y-4">
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
                Alumni Mentorship Info
              </h3>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">LinkedIn integration best practices</p>
            </div>
            
            <p className="text-xs leading-relaxed text-muted-foreground font-semibold">
              The easiest way to land admissions and relocation clarity is by reaching out directly to alumni on LinkedIn.
            </p>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-indigo-850 dark:text-indigo-300 text-[10.5px] leading-relaxed font-semibold">
              <span className="font-extrabold uppercase tracking-wide block mb-1">💡 Quick Pro Tip</span>
              When sending a connection request to seniors, always add a personalized 300-character note: 
              <span className="italic block mt-1 bg-card/60 p-2 rounded border border-indigo-500/10">"Hi, I graduated from your undergrad college and recently got admitted to [Target Uni]! I would love to connect and ask a quick question about city housing."</span>
            </div>
          </div>

          {/* Active Country Community Rooms */}
          <div className="glass-card rounded-2xl p-5 border border-border bg-card space-y-4">
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Country Channels</h3>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Join peer channels on Telegram/WhatsApp</p>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Germany Admissions Hub', members: '1,240 members' },
                { name: 'Canada SDS Student Circle', members: '2,890 members' },
                { name: 'United Kingdom Fall Intake', members: '1,450 members' },
                { name: 'Ireland Tech Communities', members: '820 members' }
              ].map((group, idx) => (
                <button
                  key={idx}
                  onClick={() => alert(`Mock joining channel: ${group.name}`)}
                  className="w-full text-left bg-muted/40 hover:bg-muted border border-border/40 hover:border-indigo-500/20 rounded-xl p-3 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-xs text-foreground group-hover:text-indigo-650 transition-colors block">{group.name}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 block">{group.members}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-indigo-500" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
