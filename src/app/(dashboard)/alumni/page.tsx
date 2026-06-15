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
  ChevronRight,
  ThumbsUp,
  Plus,
  Flame,
  Globe,
  Star,
  Check
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

type ForumPost = {
  id: string
  author: string
  role: string
  title: string
  content: string
  category: 'scholarships' | 'visa' | 'housing' | 'academics'
  replies: number
  upvotes: number
  timestamp: string
  userUpvoted?: boolean
}

type StudyGroup = {
  name: string
  category: 'university' | 'country'
  country: string
  members: string
  desc: string
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

const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'p1',
    author: 'Ravi Teja',
    role: 'Aspirant',
    title: 'Does anyone know about the Lazio DiSCo scholarship in Italy?',
    content: 'Pursuing M.S. in CS. Wanted to know if the family income limit of €25,000 applies to Indian salary slips, and what documents are required?',
    category: 'scholarships',
    replies: 4,
    upvotes: 12,
    timestamp: '2 hours ago'
  },
  {
    id: 'p2',
    author: 'Simran Kaur',
    role: 'Admitted Student',
    title: 'Tips for F1 visa interview at Mumbai embassy?',
    content: 'My interview is scheduled for next month. Specifically wanted to know how detailed the sponsor financial explanation should be. Thanks!',
    category: 'visa',
    replies: 7,
    upvotes: 18,
    timestamp: 'Yesterday'
  },
  {
    id: 'p3',
    author: 'Devendra S.',
    role: 'Alumni (TUM)',
    title: 'Munich Student Dorms vs Private WG',
    content: 'Highly recommend applying for Studierendenwerk dorms the day you submit your TUM application. WG rents are reaching €700+ easily now.',
    category: 'housing',
    replies: 9,
    upvotes: 24,
    timestamp: '3 days ago'
  }
]

const STUDY_GROUPS: StudyGroup[] = [
  { name: 'TUM Informatics Cohort', category: 'university', country: 'Germany', members: '480 Admitted', desc: 'Official student group for TUM Master of Informatics aspirants and current students.' },
  { name: 'Stanford CS & AI Club', category: 'university', country: 'USA', members: '210 Members', desc: 'Collaborating on graduate fellowships, visa support groups, and research lab placements.' },
  { name: 'University of Toronto Co-op Forum', category: 'university', country: 'Canada', members: '650 Members', desc: 'Discussing local internships, job postings, and Ontario SDS visa applications.' },
  { name: 'Germany Blocked Account Support Group', category: 'country', country: 'Germany', members: '1,420 Aspirants', desc: 'Step-by-step guidance on setting up Fintiba/Expatrio blocked accounts.' },
  { name: 'USA F1 Visa Preparation Room', category: 'country', country: 'USA', members: '2,980 Members', desc: 'Mock interviews, financial statement guidelines, and embassy date alerts.' },
  { name: 'Canada SDS Application Group', category: 'country', country: 'Canada', members: '1,890 Members', desc: 'Exchanging GIC documentation info and study permit timelines.' }
]

export default function AlumniPage() {
  const [activeTab, setActiveTab] = useState<'directory' | 'forum' | 'groups'>('directory')
  
  // Search and Filters for Directory
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCountry, setFilterCountry] = useState('All')

  // Booking Modal
  const [selectedAlumniForChat, setSelectedAlumniForChat] = useState<Alumni | null>(null)
  const [chatDate, setChatDate] = useState('')
  const [chatTime, setChatTime] = useState('')
  const [chatScheduled, setChatScheduled] = useState(false)

  // Discussion Forum state
  const [posts, setPosts] = useState<ForumPost[]>(INITIAL_FORUM_POSTS)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCat, setNewCat] = useState<'scholarships' | 'visa' | 'housing' | 'academics'>('academics')
  const [showNewPostForm, setShowNewPostForm] = useState(false)

  // Directory filter logic
  const filteredAlumni = ALUMNI_LIST.filter(alumni => {
    const matchesSearch = 
      alumni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumni.gradUni.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumni.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumni.program.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCountry = filterCountry === 'All' || alumni.country === filterCountry
    return matchesSearch && matchesCountry
  })

  // Forum upvote handler
  const handleUpvote = (id: string) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        const upvoted = !post.userUpvoted
        return {
          ...post,
          upvotes: upvoted ? post.upvotes + 1 : post.upvotes - 1,
          userUpvoted: upvoted
        }
      }
      return post
    }))
  }

  // Create new post handler
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return
    const newPost: ForumPost = {
      id: `p${Date.now()}`,
      author: 'You',
      role: 'Aspirant',
      title: newTitle,
      content: newContent,
      category: newCat,
      replies: 0,
      upvotes: 1,
      timestamp: 'Just now',
      userUpvoted: true
    }
    setPosts([newPost, ...posts])
    setNewTitle('')
    setNewContent('')
    setShowNewPostForm(false)
  }

  // Handle schedule submit
  const handleScheduleChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatDate || !chatTime) return
    setChatScheduled(true)
    setTimeout(() => {
      setChatScheduled(false)
      setSelectedAlumniForChat(null)
      setChatDate('')
      setChatTime('')
      alert(`Chat scheduled successfully with ${selectedAlumniForChat?.name}! Check your dashboard calendar for details.`)
    }, 1500)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      
      {/* Header Banner */}
      <div className="border-b border-border/40 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-650" />
            Student Community & Mentorship
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">
            Interact with peers on active discussion channels, book direct mock chats with alumni, and find study groups.
          </p>
        </div>

        {/* Operating System Subtabs */}
        <div className="flex bg-muted/60 p-1 rounded-xl border border-border shrink-0 self-start">
          {[
            { id: 'directory', label: 'Alumni Network' },
            { id: 'forum',     label: 'Discussion Forum' },
            { id: 'groups',    label: 'Study Channels' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === t.id ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Switchable tabs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* A. Alumni Network Tab */}
          {activeTab === 'directory' && (
            <div className="space-y-6">
              {/* Search and Filters Bar */}
              <div className="glass-card rounded-2xl p-4 border border-border bg-card flex flex-col sm:flex-row gap-3 shadow-xs">
                <div className="flex-1 flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-muted/20">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search seniors by name, university, or current employer..."
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
                {filteredAlumni.map(alumni => (
                  <div key={alumni.id} className="bg-card border border-border rounded-2xl p-5 hover:border-indigo-500/30 hover:shadow-xs transition-all flex flex-col sm:flex-row gap-5 items-start justify-between">
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

                    {/* Actions Connect */}
                    <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
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
                        onClick={() => setSelectedAlumniForChat(alumni)}
                        className="flex-1 sm:flex-none text-center px-4 py-2 bg-muted hover:bg-stone-200 dark:hover:bg-stone-850 text-foreground border border-border text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Schedule Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* B. Discussion Forum Tab */}
          {activeTab === 'forum' && (
            <div className="space-y-6">
              
              {/* Forum post headers */}
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">Active Peer Conversations</span>
                <button
                  onClick={() => setShowNewPostForm(!showNewPostForm)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create Thread
                </button>
              </div>

              {/* Form to submit new post */}
              {showNewPostForm && (
                <form onSubmit={handleCreatePost} className="glass-card rounded-2xl p-5 border border-border bg-card space-y-4 animate-fade-in">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Start a Community Discussion</h3>
                  
                  <div className="space-y-3 text-xs font-semibold">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <input
                          value={newTitle}
                          onChange={e => setNewTitle(e.target.value)}
                          placeholder="What is your question? Be specific..."
                          required
                          className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                        />
                      </div>
                      <div>
                        <select
                          value={newCat}
                          onChange={e => setNewCat(e.target.value as any)}
                          className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full cursor-pointer"
                        >
                          <option value="scholarships">Scholarships</option>
                          <option value="visa">Visa Prep</option>
                          <option value="housing">Housing</option>
                          <option value="academics">Academics</option>
                        </select>
                      </div>
                    </div>

                    <textarea
                      value={newContent}
                      onChange={e => setNewContent(e.target.value)}
                      placeholder="Add details, background, scores, or constraints to get personalized peer feedback..."
                      required
                      className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full h-24 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowNewPostForm(false)}
                      className="px-4 py-2 border border-border text-muted-foreground hover:bg-muted rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
                    >
                      Publish Thread
                    </button>
                  </div>
                </form>
              )}

              {/* Forum thread listings */}
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="bg-card border border-border rounded-2xl p-5 hover:border-indigo-500/20 transition-all flex gap-4 items-start">
                    {/* Upvote side button */}
                    <button
                      onClick={() => handleUpvote(post.id)}
                      className={`flex flex-col items-center gap-1 py-2 px-2.5 rounded-xl border cursor-pointer transition-colors ${
                        post.userUpvoted 
                          ? 'bg-indigo-600/10 border-indigo-600/30 text-indigo-650 dark:text-indigo-400' 
                          : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5 fill-current" />
                      <span className="text-[10px] font-extrabold">{post.upvotes}</span>
                    </button>

                    {/* Thread details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 px-2 py-0.5 rounded-full dark:text-indigo-300">
                            {post.category}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            Posted by {post.author} ({post.role}) • {post.timestamp}
                          </span>
                        </div>
                        <h3 className="font-black text-foreground text-sm mt-1 leading-snug hover:text-indigo-600 transition-colors">
                          {post.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                        {post.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground pt-1 border-t border-border/30">
                        <span className="flex items-center gap-1 hover:text-indigo-600 cursor-pointer">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {post.replies} Replies
                        </span>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="hover:text-indigo-600 cursor-pointer">Follow thread</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* C. Study Channels Tab */}
          {activeTab === 'groups' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STUDY_GROUPS.map((group, idx) => (
                <div key={idx} className="bg-card border border-border rounded-2xl p-5 hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 dark:text-indigo-300">
                        {group.category}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-0.5">
                        <Globe className="w-3 h-3" /> {group.country}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-foreground leading-snug">{group.name}</h3>
                    <p className="text-[10px] text-emerald-600 font-extrabold uppercase mt-1">{group.members}</p>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-semibold">
                      {group.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => alert(`Redirecting to live chat channel. Token generated: GP_STUDY_${idx + 2481}`)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Join Study Channel &rarr;
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Column: Mentorship Guidance & Community stats */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Peer review and mentorship stats */}
          <div className="glass-card rounded-2xl p-5 border border-border bg-card space-y-4">
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-indigo-650" />
                Community Metrics
              </h3>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Alumni connection insights</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-muted/60 p-3 rounded-xl border border-border/50">
                <span className="text-lg font-black text-indigo-600">89%</span>
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block mt-0.5">Acceptance Rate</span>
              </div>
              <div className="bg-muted/60 p-3 rounded-xl border border-border/50">
                <span className="text-lg font-black text-emerald-600">1.2k+</span>
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block mt-0.5">Admitted Peers</span>
              </div>
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

          {/* Peer reviews list preview */}
          <div className="glass-card rounded-2xl p-5 border border-border bg-card space-y-4">
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Top-Rated Mentors</h3>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Rated by applicants this intake</p>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              {[
                { name: 'Neha Patel', rating: 5, review: 'Helped me review my SOP and suggested amazing pointers.' },
                { name: 'Amit Sharma', rating: 5, review: 'Guided me on German blocked accounts step-by-step.' }
              ].map((m, idx) => (
                <div key={idx} className="p-3 bg-muted/40 border border-border/40 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">{m.name}</span>
                    <div className="flex gap-0.5 text-amber-500">
                      {Array.from({ length: m.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-[10.5px] italic leading-normal font-medium">"{m.review}"</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Booking Mock Chat Modal popup */}
      {selectedAlumniForChat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-lg space-y-4">
            <div>
              <h3 className="font-bold text-foreground text-sm">Schedule Mentorship Chat</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Book a 1:1 video session with {selectedAlumniForChat.name}</p>
            </div>

            <div className="p-3.5 bg-muted rounded-xl flex gap-3 items-center">
              <GraduationCap className="w-8 h-8 text-indigo-650 shrink-0" />
              <div className="text-xs font-semibold text-foreground/80 leading-normal">
                <p className="font-bold text-foreground">{selectedAlumniForChat.gradUni}</p>
                <p className="text-[10.5px] text-muted-foreground mt-0.5">{selectedAlumniForChat.program}</p>
              </div>
            </div>

            <form onSubmit={handleScheduleChat} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 font-semibold">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Select Date</label>
                  <input
                    type="date"
                    required
                    value={chatDate}
                    onChange={e => setChatDate(e.target.value)}
                    className="w-full border border-border rounded-xl px-2.5 py-1.5 text-foreground bg-card focus:outline-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Select Time Slot</label>
                  <select
                    required
                    value={chatTime}
                    onChange={e => setChatTime(e.target.value)}
                    className="w-full border border-border rounded-xl px-2.5 py-1.5 text-foreground bg-card focus:outline-indigo-500 cursor-pointer"
                  >
                    <option value="">Choose slot</option>
                    <option value="17:00">5:00 PM - 5:30 PM</option>
                    <option value="18:00">6:00 PM - 6:30 PM</option>
                    <option value="19:00">7:00 PM - 7:30 PM</option>
                    <option value="20:00">8:00 PM - 8:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setSelectedAlumniForChat(null)}
                  disabled={chatScheduled}
                  className="px-4 py-2 border border-border text-muted-foreground hover:bg-muted rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={chatScheduled}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  {chatScheduled ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    'Confirm Schedule'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
