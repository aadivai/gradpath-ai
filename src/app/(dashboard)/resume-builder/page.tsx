'use client'
import { useState } from 'react'
import { Plus, Trash2, Printer, Sparkles, Check, FileUser, Layers, ListPlus, Copy, Download } from 'lucide-react'

type Education = { school: string; degree: string; gpa: string; year: string }
type Experience = { company: string; role: string; dates: string; bullets: string[] }
type Project = { title: string; tech: string; desc: string }

export default function ResumeBuilderPage() {
  const [activeTab, setActiveTab] = useState<'resume' | 'lor'>('resume')
  const [style, setStyle] = useState<'harvard' | 'canadian' | 'europass' | 'academic'>('harvard')

  // Resume states
  const [personal, setPersonal] = useState({
    name: 'Rahul Kumar',
    email: 'rahul.kumar@email.com',
    phone: '+91 98765 43210',
    links: 'github.com/rahulkumar | linkedin.com/in/rahul',
    summary: 'Detail-oriented Computer Science undergraduate with 6+ months of software development internship experience. Proficient in full-stack engineering, machine learning pipelines, and cloud deployment.'
  })

  const [education, setEducation] = useState<Education[]>([
    { school: 'Madan Mohan Malaviya University of Technology', degree: 'B.Tech in Information Technology', gpa: '8.4 / 10.0', year: '2022 - 2026' }
  ])

  const [experience, setExperience] = useState<Experience[]>([
    { company: 'Acme Software Corp', role: 'Software Engineer Intern', dates: 'May 2025 - Nov 2025', bullets: ['Designed and implemented full-stack document search feature using Node.js and React.', 'Built data parsing pipelines reducing ingestion latency by 24%.', 'Participated in agile sprints, code reviews, and database migration tasks.'] }
  ])

  const [projects, setProjects] = useState<Project[]>([
    { title: 'AI Study Assistant (GradPath)', tech: 'Next.js, Supabase, Gemini API', desc: 'An interactive study abroad planner displaying personalized university matches and dynamically drafting SOPs.' }
  ])

  const [skills, setSkills] = useState('React, Next.js, Node.js, Python, TypeScript, PostgreSQL, Git, Docker')

  // LOR states
  const [lorCandidate, setLorCandidate] = useState('Rahul Kumar')
  const [lorProgram, setLorProgram] = useState('M.S. in Computer Science (Artificial Intelligence)')
  const [lorRecommender, setLorRecommender] = useState('Prof. Dr. Christian Schultz')
  const [lorTitle, setLorTitle] = useState('Head of AI Research Lab, Dept of IT')
  const [lorStyle, setLorStyle] = useState<'professor' | 'manager' | 'research'>('professor')
  const [lorAchievements, setLorAchievements] = useState('Rahul secured 1st place in the university hackathon, maintained a top 5% rank in my Advanced Machine Learning class (scoring 9.5/10), and successfully completed an independent study project on transformer architectures under my guidance.')
  const [lorText, setLorText] = useState(`To the Graduate Admissions Committee,

It is a pleasure to recommend Rahul Kumar for admission to your graduate program. I have known Rahul for the past two years in my capacity as Head of the AI Research Lab, during which he attended my Advanced Machine Learning course and worked on independent research under my supervision. 

Academic Excellence:
Rahul stood out in class, maintaining a score of 9.5/10 and finishing in the top 5% of students. He possesses a rare combination of conceptual clarity and practical deployment capability. In the lab, he designed and implemented a project analyzing transformer architectures, demonstrating strong analytical skills and scientific diligence.

Leadership & Projects:
Beyond academics, Rahul led his team to secure first place in the university hackathon. His ability to work under pressure, delegate tasks, and articulate complex solutions is highly impressive. 

Strong Endorsement:
I have no doubt Rahul will be a valuable asset to your institution and rank him among the top candidates I have taught. I endorse his application with the highest rating.

Sincerely,

Prof. Dr. Christian Schultz
Head of AI Research Lab, Dept of IT`)
  
  const [lorLoading, setLorLoading] = useState(false)
  const [lorError, setLorError] = useState('')
  const [lorCopied, setLorCopied] = useState(false)

  // Resume handlers
  const addEdu = () => setEducation([...education, { school: '', degree: '', gpa: '', year: '' }])
  const removeEdu = (i: number) => setEducation(education.filter((_, idx) => idx !== i))
  const updateEdu = (i: number, k: keyof Education, v: string) => {
    const next = [...education]
    next[i][k] = v
    setEducation(next)
  }

  const addExp = () => setExperience([...experience, { company: '', role: '', dates: '', bullets: [''] }])
  const removeExp = (i: number) => setExperience(experience.filter((_, idx) => idx !== i))
  const updateExp = (i: number, k: keyof Experience, v: any) => {
    const next = [...experience]
    next[i] = { ...next[i], [k]: v }
    setExperience(next)
  }
  const addBullet = (expIdx: number) => {
    const next = [...experience]
    next[expIdx].bullets.push('')
    setExperience(next)
  }
  const updateBullet = (expIdx: number, bIdx: number, val: string) => {
    const next = [...experience]
    next[expIdx].bullets[bIdx] = val
    setExperience(next)
  }
  const removeBullet = (expIdx: number, bIdx: number) => {
    const next = [...experience]
    next[expIdx].bullets = next[expIdx].bullets.filter((_, idx) => idx !== bIdx)
    setExperience(next)
  }

  const addProj = () => setProjects([...projects, { title: '', tech: '', desc: '' }])
  const removeProj = (i: number) => setProjects(projects.filter((_, idx) => idx !== i))
  const updateProj = (i: number, k: keyof Project, v: string) => {
    const next = [...projects]
    next[i][k] = v
    setProjects(next)
  }

  const triggerPrint = () => {
    window.print()
  }

  // LOR Handlers
  async function generateLOR() {
    if (!lorCandidate.trim() || !lorRecommender.trim() || !lorAchievements.trim()) {
      setLorError('Candidate Name, Recommender, and Achievements are required.')
      return
    }
    setLorLoading(true)
    setLorError('')
    try {
      const res = await fetch('/api/generate-lor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: lorCandidate,
          targetProgram: lorProgram,
          recommenderName: lorRecommender,
          recommenderTitle: lorTitle,
          achievements: lorAchievements,
          style: lorStyle
        })
      })
      if (!res.ok) throw new Error('Failed to generate Letter of Recommendation')
      const data = await res.json()
      setLorText(data.lor)
    } catch (e: any) {
      setLorError(e.message)
    } finally {
      setLorLoading(false)
    }
  }

  function copyLOR() {
    navigator.clipboard.writeText(lorText)
    setLorCopied(true)
    setTimeout(() => setLorCopied(false), 2000)
  }

  function downloadLOR() {
    const element = document.createElement("a")
    const file = new Blob([lorText], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${lorCandidate.replace(/\s+/g, '_')}_LOR_Draft.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  function printLOR() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head>
          <title>Letter of Recommendation - ${lorCandidate}</title>
          <style>
            body {
              font-family: 'Times New Roman', Times, serif;
              line-height: 1.8;
              margin: 2in 1.5in;
              color: #000;
              font-size: 12pt;
              text-align: justify;
            }
            .content {
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <div class="content">${lorText}</div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 print:p-0 print:max-w-full">
      
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-4 gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FileUser className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Resume & LOR Studio</h1>
            <p className="text-xs text-muted-foreground">Compile elite study-abroad CVs and generate highly endorsed Letters of Recommendation.</p>
          </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-muted/60 p-1 rounded-xl border border-border shrink-0 self-start">
          <button 
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'resume' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Resume Builder
          </button>
          <button 
            onClick={() => setActiveTab('lor')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'lor' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            LOR Studio
          </button>
        </div>
      </div>

      {activeTab === 'resume' ? (
        /* ================== RESUME BUILDER TAB ================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Input Panel */}
          <div className="lg:col-span-5 space-y-6 print:hidden">
            {/* Template select */}
            <div className="glass-card rounded-2xl p-5 border border-border space-y-3">
              <div>
                <span className="text-[9px] font-extrabold uppercase text-indigo-600 tracking-wider">Format Preset</span>
                <h3 className="text-xs font-bold text-foreground">University Standard Templates</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {(['harvard', 'canadian', 'europass', 'academic'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`py-2 px-3 border rounded-xl capitalize transition-all cursor-pointer ${
                      style === s
                        ? 'border-indigo-600 bg-indigo-50/10 text-indigo-600 dark:text-indigo-400'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {s} template
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Details */}
            <div className="glass-card rounded-2xl p-5 border border-border space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Contact & Summary</h3>
              <div className="space-y-3 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={personal.name}
                    onChange={e => setPersonal({ ...personal, name: e.target.value })}
                    placeholder="Full Name"
                    className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                  />
                  <input
                    value={personal.email}
                    onChange={e => setPersonal({ ...personal, email: e.target.value })}
                    placeholder="Email Address"
                    className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                  />
                </div>
                <input
                  value={personal.phone}
                  onChange={e => setPersonal({ ...personal, phone: e.target.value })}
                  placeholder="Phone Number"
                  className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                />
                <input
                  value={personal.links}
                  onChange={e => setPersonal({ ...personal, links: e.target.value })}
                  placeholder="Portfolio / GitHub / LinkedIn Links"
                  className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                />
                <textarea
                  value={personal.summary}
                  onChange={e => setPersonal({ ...personal, summary: e.target.value })}
                  placeholder="Professional summary or research statement..."
                  className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full h-20 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Education */}
            <div className="glass-card rounded-2xl p-5 border border-border space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Education Details</h3>
                <button onClick={addEdu} className="text-xs text-indigo-650 hover:text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              {education.map((edu, idx) => (
                <div key={idx} className="border border-border/50 rounded-xl p-3.5 space-y-3 bg-muted/10">
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-600">Institution #{idx+1}</span>
                    <button onClick={() => removeEdu(idx)} className="text-muted-foreground hover:text-rose-500 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <input
                      value={edu.school}
                      onChange={e => updateEdu(idx, 'school', e.target.value)}
                      placeholder="University Name"
                      className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                    />
                    <input
                      value={edu.degree}
                      onChange={e => updateEdu(idx, 'degree', e.target.value)}
                      placeholder="Degree (e.g., B.Tech CS)"
                      className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <input
                      value={edu.gpa}
                      onChange={e => updateEdu(idx, 'gpa', e.target.value)}
                      placeholder="GPA (e.g., 8.4/10.0)"
                      className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                    />
                    <input
                      value={edu.year}
                      onChange={e => updateEdu(idx, 'year', e.target.value)}
                      placeholder="Duration Years (e.g., 2022 - 2026)"
                      className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Experience */}
            <div className="glass-card rounded-2xl p-5 border border-border space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Experience Matrix</h3>
                <button onClick={addExp} className="text-xs text-indigo-650 hover:text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              {experience.map((exp, idx) => (
                <div key={idx} className="border border-border/50 rounded-xl p-3.5 space-y-3 bg-muted/10">
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-600">Company #{idx+1}</span>
                    <button onClick={() => removeExp(idx)} className="text-muted-foreground hover:text-rose-500 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <input
                      value={exp.company}
                      onChange={e => updateExp(idx, 'company', e.target.value)}
                      placeholder="Company / Institution"
                      className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                    />
                    <input
                      value={exp.role}
                      onChange={e => updateExp(idx, 'role', e.target.value)}
                      placeholder="Role (e.g., Intern)"
                      className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                    />
                  </div>
                  <input
                    value={exp.dates}
                    onChange={e => updateExp(idx, 'dates', e.target.value)}
                    placeholder="Duration dates (e.g., Summer 2025)"
                    className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full text-xs font-semibold"
                  />
                  {/* Bullets */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground">Bullet Achievements</span>
                      <button onClick={() => addBullet(idx)} className="text-[9px] text-indigo-650 font-bold hover:text-indigo-700 cursor-pointer">
                        + Add Bullet
                      </button>
                    </div>
                    {exp.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex gap-2">
                        <input
                          value={bullet}
                          onChange={e => updateBullet(idx, bIdx, e.target.value)}
                          placeholder="Quantifiable task result..."
                          className="border border-border rounded-xl px-3 py-1.5 bg-card text-foreground text-xs font-semibold focus:outline-indigo-500 flex-1"
                        />
                        <button onClick={() => removeBullet(idx, bIdx)} className="text-muted-foreground hover:text-rose-500 cursor-pointer">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Projects & Skills */}
            <div className="glass-card rounded-2xl p-5 border border-border space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Independent Projects</h3>
                <button onClick={addProj} className="text-xs text-indigo-650 hover:text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              {projects.map((proj, idx) => (
                <div key={idx} className="border border-border/50 rounded-xl p-3.5 space-y-3 bg-muted/10">
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-600">Project #{idx+1}</span>
                    <button onClick={() => removeProj(idx)} className="text-muted-foreground hover:text-rose-500 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <input
                      value={proj.title}
                      onChange={e => updateProj(idx, 'title', e.target.value)}
                      placeholder="Project Name"
                      className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                    />
                    <input
                      value={proj.tech}
                      onChange={e => updateProj(idx, 'tech', e.target.value)}
                      placeholder="Tech Stack Used"
                      className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                    />
                  </div>
                  <textarea
                    value={proj.desc}
                    onChange={e => updateProj(idx, 'desc', e.target.value)}
                    placeholder="Short detail of project output..."
                    className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full text-xs font-semibold resize-none h-14"
                  />
                </div>
              ))}

              <div className="space-y-1 pt-2 border-t border-border/40">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Skill Inventory</label>
                <input
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  placeholder="Languages, Frameworks, Devops tools separated by commas"
                  className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full text-xs font-semibold"
                />
              </div>
            </div>

            <button 
              onClick={triggerPrint}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-755 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Export & Print PDF
            </button>
          </div>

          {/* Right: Premium A4 Document Preview Canvas */}
          <div className="lg:col-span-7 bg-card border border-border shadow-md rounded-2xl p-6 md:p-8 min-h-[750px] overflow-y-auto max-h-[850px] font-sans text-xs flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:max-h-none print:overflow-visible relative">
            <div className="absolute top-2.5 right-4 text-[8.5px] uppercase font-bold text-muted-foreground print:hidden">
              Page Workspace Preview
            </div>

            {/* Style 1: Harvard Standard Resume */}
            {style === 'harvard' && (
              <div className="font-serif text-[11px] leading-relaxed text-foreground">
                <div className="text-center mb-5 border-b border-border pb-3">
                  <h2 className="text-lg font-black tracking-tight text-foreground uppercase">{personal.name}</h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                    {personal.email} &bull; {personal.phone} &bull; {personal.links}
                  </p>
                </div>

                {personal.summary && (
                  <div className="mb-4">
                    <h3 className="text-[10.5px] font-bold text-indigo-755 uppercase tracking-wide border-b border-border/70 pb-0.5 mb-1.5">Profile Summary</h3>
                    <p className="text-foreground leading-normal text-justify font-medium">{personal.summary}</p>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-[10.5px] font-bold text-indigo-755 uppercase tracking-wide border-b border-border/70 pb-0.5 mb-1.5">Education Matrix</h3>
                  {education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between items-start mb-2">
                      <div className="min-w-0">
                        <p className="font-bold text-foreground">{edu.school}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 italic">{edu.degree} &mdash; GPA: {edu.gpa}</p>
                      </div>
                      <span className="font-bold text-foreground shrink-0">{edu.year}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-[10.5px] font-bold text-indigo-755 uppercase tracking-wide border-b border-border/70 pb-0.5 mb-1.5">Professional Experience</h3>
                  {experience.map((exp, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-foreground">{exp.company}</p>
                          <p className="text-[10px] text-indigo-700 dark:text-indigo-400 mt-0.5 italic font-bold">{exp.role}</p>
                        </div>
                        <span className="font-bold text-foreground shrink-0">{exp.dates}</span>
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground mt-1.5">
                        {exp.bullets.map((b, i) => b ? <li key={i}>{b}</li> : null)}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-[10.5px] font-bold text-indigo-755 uppercase tracking-wide border-b border-border/70 pb-0.5 mb-1.5">Key Projects</h3>
                  {projects.map((proj, idx) => (
                    <div key={idx} className="mb-2.5">
                      <div className="flex justify-between font-bold text-foreground">
                        <span>{proj.title}</span>
                        <span className="italic font-normal text-muted-foreground">({proj.tech})</span>
                      </div>
                      <p className="text-muted-foreground mt-0.5 leading-normal text-justify">{proj.desc}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-[10.5px] font-bold text-indigo-755 uppercase tracking-wide border-b border-border/70 pb-0.5 mb-1.5">Technical Skills & Credentials</h3>
                  <p className="text-foreground font-semibold leading-relaxed">{skills}</p>
                </div>
              </div>
            )}

            {/* Style 2: Canadian Format */}
            {style === 'canadian' && (
              <div className="font-sans text-[11px] leading-relaxed text-foreground">
                <div className="mb-5">
                  <h2 className="text-xl font-black text-indigo-650 tracking-tight">{personal.name}</h2>
                  <p className="text-muted-foreground font-bold text-[10px] mt-0.5">
                    {personal.email} &bull; {personal.phone} &bull; {personal.links}
                  </p>
                </div>

                {personal.summary && (
                  <div className="mb-4">
                    <h3 className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider mb-1">Highlights of Qualifications</h3>
                    <p className="text-foreground/90 leading-relaxed pl-2 border-l-2 border-indigo-600">{personal.summary}</p>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider mb-2.5">Education History</h3>
                  {education.map((edu, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between font-bold text-foreground">
                        <span>{edu.degree}</span>
                        <span>{edu.year}</span>
                      </div>
                      <p className="text-muted-foreground font-semibold italic">{edu.school} &bull; GPA: {edu.gpa}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider mb-3">Employment History</h3>
                  {experience.map((exp, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between font-bold text-foreground">
                        <span>{exp.role}</span>
                        <span>{exp.dates}</span>
                      </div>
                      <p className="text-indigo-650 font-bold">{exp.company}</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground mt-1">
                        {exp.bullets.map((b, i) => b ? <li key={i}>{b}</li> : null)}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider mb-2.5">Projects Portfolio</h3>
                  {projects.map((proj, idx) => (
                    <div key={idx} className="mb-2">
                      <p className="font-bold text-foreground">{proj.title} <span className="font-normal text-muted-foreground">({proj.tech})</span></p>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">{proj.desc}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider mb-1">Technical Competencies</h3>
                  <p className="text-foreground leading-relaxed font-semibold">{skills}</p>
                </div>
              </div>
            )}

            {/* Style 3: Europass Standard */}
            {style === 'europass' && (
              <div className="font-sans text-[11px] leading-relaxed text-foreground">
                <div className="border-b-2 border-indigo-600 pb-4 mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-indigo-755 uppercase tracking-wide">{personal.name}</h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-bold">Curriculum Vitae</p>
                  </div>
                  <div className="text-right text-[10px] text-muted-foreground font-semibold">
                    <p>{personal.email}</p>
                    <p>{personal.phone}</p>
                    <p>{personal.links}</p>
                  </div>
                </div>

                {personal.summary && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="col-span-1 font-bold text-muted-foreground uppercase tracking-wide text-[10px]">Professional Summary</div>
                    <div className="col-span-2 text-foreground/80 leading-relaxed font-semibold text-justify">
                      {personal.summary}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="col-span-1 font-bold text-muted-foreground uppercase tracking-wide text-[10px]">Work History</div>
                  <div className="col-span-2 space-y-3">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="font-bold text-foreground">{exp.dates}</p>
                        <p className="font-bold text-indigo-755 text-[10px]">{exp.role} at {exp.company}</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground mt-0.5">
                          {exp.bullets.map((b, i) => b ? <li key={i}>{b}</li> : null)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="col-span-1 font-bold text-muted-foreground uppercase tracking-wide text-[10px]">Education & Training</div>
                  <div className="col-span-2 space-y-3">
                    {education.map((edu, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <p className="font-bold text-foreground">{edu.year}</p>
                        <p className="font-bold text-foreground">{edu.degree}</p>
                        <p className="text-muted-foreground">{edu.school} &bull; GPA: {edu.gpa}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="col-span-1 font-bold text-muted-foreground uppercase tracking-wide text-[10px]">Independent Projects</div>
                  <div className="col-span-2 space-y-2.5">
                    {projects.map((proj, idx) => (
                      <div key={idx}>
                        <p className="font-bold text-foreground text-[10px]">{proj.title} ({proj.tech})</p>
                        <p className="text-muted-foreground mt-0.5">{proj.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 font-bold text-muted-foreground uppercase tracking-wide text-[10px]">Skills Inventory</div>
                  <div className="col-span-2 text-foreground/80 leading-relaxed font-semibold">
                    {skills}
                  </div>
                </div>
              </div>
            )}

            {/* Style 4: Academic CV */}
            {style === 'academic' && (
              <div className="font-serif text-[11px] leading-relaxed text-foreground text-justify">
                <div className="text-center mb-5">
                  <h2 className="text-lg font-black uppercase tracking-wider text-foreground">{personal.name}</h2>
                  <p className="text-[10px] italic mt-0.5 text-foreground">
                    {personal.email} &bull; {personal.phone}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 tracking-tight">{personal.links}</p>
                </div>

                {personal.summary && (
                  <div className="mb-4">
                    <h3 className="text-[10px] font-bold uppercase border-b border-foreground pb-0.5 mb-1.5">Research Objectives</h3>
                    <p className="text-foreground/80 leading-relaxed">{personal.summary}</p>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-[10px] font-bold uppercase border-b border-foreground pb-0.5 mb-1.5">Academic Matrix</h3>
                  {education.map((edu, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between font-bold text-foreground">
                        <span>{edu.degree}</span>
                        <span>{edu.year}</span>
                      </div>
                      <p className="text-muted-foreground mt-0.5 italic">{edu.school} &mdash; CGPA: {edu.gpa}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-[10px] font-bold uppercase border-b border-foreground pb-0.5 mb-1.5">Scientific & Research Experience</h3>
                  {experience.map((exp, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between font-bold text-foreground">
                        <span>{exp.role}</span>
                        <span>{exp.dates}</span>
                      </div>
                      <p className="text-muted-foreground italic mt-0.5">{exp.company}</p>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5 text-muted-foreground">
                        {exp.bullets.map((b, i) => b ? <li key={i}>{b}</li> : null)}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-[10px] font-bold uppercase border-b border-foreground pb-0.5 mb-1.5">Technical Project Outputs</h3>
                  {projects.map((proj, idx) => (
                    <div key={idx} className="mb-2">
                      <p className="font-bold text-foreground">{proj.title} &bull; <span className="italic font-normal">({proj.tech})</span></p>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">{proj.desc}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-[10px] font-bold uppercase border-b border-foreground pb-0.5 mb-1.5">Expertise Skills</h3>
                  <p className="text-foreground/80 leading-relaxed font-semibold italic">{skills}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================== LOR STUDIO TAB ================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive LOR Inputs */}
          <div className="lg:col-span-5 space-y-6 print:hidden">
            
            {/* LOR Form Parameters */}
            <div className="glass-card rounded-2xl p-5 border border-border space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-650" />
                Recommendation Parameters
              </h3>
              
              <div className="space-y-3 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Candidate Name</label>
                    <input
                      value={lorCandidate}
                      onChange={e => setLorCandidate(e.target.value)}
                      placeholder="e.g. Rahul Kumar"
                      className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Target Program</label>
                    <input
                      value={lorProgram}
                      onChange={e => setLorProgram(e.target.value)}
                      placeholder="e.g. M.S. in Computer Science"
                      className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Recommender Name</label>
                    <input
                      value={lorRecommender}
                      onChange={e => setLorRecommender(e.target.value)}
                      placeholder="e.g. Dr. Schultz"
                      className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Recommender Title</label>
                    <input
                      value={lorTitle}
                      onChange={e => setLorTitle(e.target.value)}
                      placeholder="e.g. Head of Research Lab"
                      className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full"
                    />
                  </div>
                </div>

                {/* Style of Recommender */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground block mb-0.5">Endorsement Perspective Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['professor', 'manager', 'research'] as const).map(styleId => (
                      <button
                        key={styleId}
                        type="button"
                        onClick={() => setLorStyle(styleId)}
                        className={`py-1.5 px-2 border rounded-lg capitalize text-[10px] font-bold cursor-pointer transition-all ${
                          lorStyle === styleId
                            ? 'border-indigo-600 bg-indigo-50/10 text-indigo-650 dark:text-indigo-400'
                            : 'border-border bg-card text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {styleId} style
                      </button>
                    ))}
                  </div>
                </div>

                {/* Achievements Input Area */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground block">Key Student Accomplishments / Strengths</label>
                  <textarea
                    value={lorAchievements}
                    onChange={e => setLorAchievements(e.target.value)}
                    placeholder="Enter highlights, scores, behavior, projects that recommender witnessed..."
                    className="border border-border rounded-xl px-3 py-2 bg-card text-foreground focus:outline-indigo-500 w-full h-24 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {lorError && <p className="text-xs text-rose-600 font-medium">{lorError}</p>}

              <button
                onClick={generateLOR}
                disabled={lorLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {lorLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Synthesizing Letter...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate LOR with AI
                  </>
                )}
              </button>

            </div>

            {/* Print & Export options */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={copyLOR}
                className="py-2.5 bg-card border border-border text-foreground hover:bg-muted font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                {lorCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {lorCopied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={downloadLOR}
                className="py-2.5 bg-card border border-border text-foreground hover:bg-muted font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                TXT Draft
              </button>
              <button
                onClick={printLOR}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Letter
              </button>
            </div>

          </div>

          {/* Right: Premium Letterhead Preview */}
          <div className="lg:col-span-7 bg-card border border-border shadow-md rounded-2xl p-8 md:p-12 min-h-[750px] overflow-y-auto max-h-[850px] flex flex-col font-serif text-[12.5px] leading-relaxed text-foreground select-text relative">
            <div className="absolute top-2.5 right-4 text-[8.5px] uppercase font-sans font-bold text-muted-foreground print:hidden">
              Official Endorsement letterhead
            </div>

            {/* Letter Content Workspace */}
            <div className="whitespace-pre-wrap font-serif text-justify text-foreground/90 pr-2">
              {lorText}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
