'use client'
import { useState } from 'react'
import { Plus, Trash2, Printer, Sparkles, Check, FileUser, Layers, ListPlus } from 'lucide-react'

type Education = { school: string; degree: string; gpa: string; year: string }
type Experience = { company: string; role: string; dates: string; bullets: string[] }
type Project = { title: string; tech: string; desc: string }

export default function ResumeBuilderPage() {
  const [style, setStyle] = useState<'harvard' | 'canadian' | 'europass' | 'academic'>('harvard')

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

  // Helper functions
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 print:p-0 print:max-w-full">
      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-stone-200/40 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FileUser className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">AI Resume Builder</h1>
            <p className="text-xs text-stone-500">Compile professional, study-abroad optimized CV sheets side-by-side.</p>
          </div>
        </div>
        <button 
          onClick={triggerPrint}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-indigo-100 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" /> Print / Export PDF
        </button>
      </div>

      {/* Main Workspace grid: left forms, right A4 document preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Form Editor (scrollable) */}
        <div className="lg:col-span-6 space-y-6 lg:max-h-[80vh] lg:overflow-y-auto pr-2 print:hidden">
          
          {/* Format switches style selectors */}
          <div className="glass-card rounded-2xl p-5 border border-stone-200/50 space-y-3">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Target Resume Layout Format
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['harvard', 'canadian', 'europass', 'academic'] as const).map(s => (
                <button 
                  key={s} 
                  onClick={() => setStyle(s)}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer capitalize flex flex-col items-center justify-center gap-1 ${
                    style === s 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-white border-stone-200 text-stone-600 hover:border-indigo-300'
                  }`}
                >
                  <span className="truncate">{s} format</span>
                  <Sparkles className={`w-3.5 h-3.5 ${style === s ? 'text-indigo-200' : 'text-stone-300'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Personal Details */}
          <div className="glass-card rounded-2xl p-6 border border-stone-200/50 space-y-4">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider border-b border-stone-200/30 pb-2">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Full Name</label>
                <input 
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-850 focus:outline-indigo-600 bg-white" 
                  value={personal.name} 
                  onChange={e => setPersonal({ ...personal, name: e.target.value })} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Email Address</label>
                <input 
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-850 focus:outline-indigo-600 bg-white" 
                  value={personal.email} 
                  onChange={e => setPersonal({ ...personal, email: e.target.value })} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Contact Number</label>
                <input 
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-850 focus:outline-indigo-600 bg-white" 
                  value={personal.phone} 
                  onChange={e => setPersonal({ ...personal, phone: e.target.value })} 
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Professional Handles (e.g. Github, Linkedin)</label>
                <input 
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-850 focus:outline-indigo-600 bg-white" 
                  value={personal.links} 
                  onChange={e => setPersonal({ ...personal, links: e.target.value })} 
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Profile Summary</label>
                <textarea 
                  className="w-full h-24 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-850 focus:outline-indigo-600 bg-white resize-none leading-relaxed" 
                  value={personal.summary} 
                  onChange={e => setPersonal({ ...personal, summary: e.target.value })} 
                />
              </div>
            </div>
          </div>

          {/* Education Info */}
          <div className="glass-card rounded-2xl p-6 border border-stone-200/50 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200/30 pb-2">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Education History</h3>
              <button 
                onClick={addEdu} 
                className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5 cursor-pointer uppercase tracking-wider"
              >
                + Add School
              </button>
            </div>
            {education.map((edu, idx) => (
              <div key={idx} className="border border-stone-200/50 rounded-xl p-4 relative space-y-3 bg-stone-50/40">
                {idx > 0 && (
                  <button 
                    onClick={() => removeEdu(idx)} 
                    className="absolute top-3 right-3 text-stone-400 hover:text-rose-600 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">School / University</label>
                    <input 
                      className="w-full border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-stone-850 font-semibold" 
                      value={edu.school} 
                      onChange={e => updateEdu(idx, 'school', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Degree & Major</label>
                    <input 
                      className="w-full border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-stone-850 font-semibold" 
                      value={edu.degree} 
                      onChange={e => updateEdu(idx, 'degree', e.target.value)} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">CGPA / GPA</label>
                      <input 
                        className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-xs bg-white text-stone-850 font-semibold" 
                        value={edu.gpa} 
                        onChange={e => updateEdu(idx, 'gpa', e.target.value)} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Years (e.g. 2022-26)</label>
                      <input 
                        className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-xs bg-white text-stone-850 font-semibold" 
                        value={edu.year} 
                        onChange={e => updateEdu(idx, 'year', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Experience Info */}
          <div className="glass-card rounded-2xl p-6 border border-stone-200/50 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200/30 pb-2">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Professional Appointments</h3>
              <button 
                onClick={addExp} 
                className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5 cursor-pointer uppercase tracking-wider"
              >
                + Add Experience
              </button>
            </div>
            {experience.map((exp, expIdx) => (
              <div key={expIdx} className="border border-stone-200/50 rounded-xl p-4 relative space-y-3 bg-stone-50/40">
                <button 
                  onClick={() => removeExp(expIdx)} 
                  className="absolute top-3 right-3 text-stone-400 hover:text-rose-600 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Company Name</label>
                    <input 
                      className="w-full border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-stone-850 font-semibold" 
                      value={exp.company} 
                      onChange={e => updateExp(expIdx, 'company', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Job Role / Position</label>
                    <input 
                      className="w-full border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-stone-850 font-semibold" 
                      value={exp.role} 
                      onChange={e => updateExp(expIdx, 'role', e.target.value)} 
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Dates & Location</label>
                    <input 
                      className="w-full border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-stone-850 font-semibold" 
                      value={exp.dates} 
                      onChange={e => updateExp(expIdx, 'dates', e.target.value)} 
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Key Accomplishments</label>
                      <button 
                        onClick={() => addBullet(expIdx)} 
                        className="text-[9px] text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer uppercase tracking-wider"
                      >
                        + Add Bullet
                      </button>
                    </div>
                    {exp.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex gap-2 items-center">
                        <input 
                          className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-xs bg-white text-stone-800" 
                          value={bullet} 
                          onChange={e => updateBullet(expIdx, bIdx, e.target.value)} 
                        />
                        {exp.bullets.length > 1 && (
                          <button 
                            onClick={() => removeBullet(expIdx, bIdx)} 
                            className="text-stone-400 hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Projects Info */}
          <div className="glass-card rounded-2xl p-6 border border-stone-200/50 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200/30 pb-2">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Academic & Open Source Projects</h3>
              <button 
                onClick={addProj} 
                className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5 cursor-pointer uppercase tracking-wider"
              >
                + Add Project
              </button>
            </div>
            {projects.map((proj, idx) => (
              <div key={idx} className="border border-stone-200/50 rounded-xl p-4 relative space-y-3 bg-stone-50/40">
                <button 
                  onClick={() => removeProj(idx)} 
                  className="absolute top-3 right-3 text-stone-400 hover:text-rose-600 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Project Title</label>
                    <input 
                      className="w-full border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-stone-850 font-semibold" 
                      value={proj.title} 
                      onChange={e => updateProj(idx, 'title', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Technologies Used</label>
                    <input 
                      className="w-full border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-stone-850 font-semibold" 
                      value={proj.tech} 
                      onChange={e => updateProj(idx, 'tech', e.target.value)} 
                      placeholder="e.g. Next.js, Python, SQL" 
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Brief Scope Description</label>
                    <textarea 
                      className="w-full h-16 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-stone-800 leading-relaxed resize-none font-medium" 
                      value={proj.desc} 
                      onChange={e => updateProj(idx, 'desc', e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skills Info */}
          <div className="glass-card rounded-2xl p-6 border border-stone-200/50 space-y-4">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider border-b border-stone-200/30 pb-2">Technical Skills</h3>
            <div className="space-y-1">
              <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Skills list (comma separated)</label>
              <input 
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-850 focus:outline-indigo-600 bg-white" 
                value={skills} 
                onChange={e => setSkills(e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Right Side: Sticky Live A4 Preview Sheet */}
        <div className="lg:col-span-6 lg:sticky lg:top-6 lg:max-h-[85vh] lg:overflow-y-auto pl-2 flex flex-col items-center">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-2 print:hidden">Live Interactive Document Sheet</p>
          
          <div className="bg-white border border-stone-200 shadow-xl rounded-sm p-10 w-full max-w-[620px] aspect-[1/1.41] overflow-y-auto text-left select-text relative print:border-none print:shadow-none print:p-0 print:m-0 print:overflow-visible">
            
            {/* Style 1: Harvard Format */}
            {style === 'harvard' && (
              <div className="font-serif text-[11px] leading-relaxed text-stone-900">
                <div className="text-center mb-5 border-b border-stone-900/10 pb-3">
                  <h2 className="text-lg font-black uppercase tracking-wide text-stone-900">{personal.name}</h2>
                  <p className="text-[10px] mt-1 text-stone-700">
                    {personal.email} &bull; {personal.phone}
                  </p>
                  <p className="text-[9px] text-stone-500 mt-0.5 tracking-tight">{personal.links}</p>
                </div>

                {personal.summary && (
                  <div className="mb-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider border-b border-stone-900 pb-0.5 mb-1.5 text-stone-900">Profile Statement</h3>
                    <p className="text-stone-700 text-justify leading-relaxed">{personal.summary}</p>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider border-b border-stone-900 pb-0.5 mb-1.5 text-stone-900">Education</h3>
                  {education.map((edu, idx) => (
                    <div key={idx} className="mb-2.5">
                      <div className="flex justify-between font-bold text-stone-850">
                        <span>{edu.school}</span>
                        <span>{edu.year}</span>
                      </div>
                      <div className="flex justify-between text-stone-700 italic text-[10px]">
                        <span>{edu.degree}</span>
                        <span>GPA: {edu.gpa}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider border-b border-stone-900 pb-0.5 mb-1.5 text-stone-900">Professional Experience</h3>
                  {experience.map((exp, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between font-bold text-stone-850">
                        <span>{exp.company}</span>
                        <span>{exp.dates}</span>
                      </div>
                      <p className="italic text-stone-700 font-medium mb-1">{exp.role}</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-stone-650">
                        {exp.bullets.map((b, i) => b ? <li key={i}>{b}</li> : null)}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider border-b border-stone-900 pb-0.5 mb-1.5 text-stone-900">Technical Projects</h3>
                  {projects.map((proj, idx) => (
                    <div key={idx} className="mb-2.5">
                      <div className="flex justify-between font-bold text-stone-850">
                        <span>{proj.title}</span>
                        <span className="text-stone-500 italic font-normal text-[10px]">{proj.tech}</span>
                      </div>
                      <p className="text-stone-650 mt-0.5">{proj.desc}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider border-b border-stone-900 pb-0.5 mb-1.5 text-stone-900">Technical Skills</h3>
                  <p className="text-stone-700">{skills}</p>
                </div>
              </div>
            )}

            {/* Style 2: Canadian Format */}
            {style === 'canadian' && (
              <div className="font-sans text-[11px] leading-relaxed text-stone-850">
                <div className="mb-5 border-l-4 border-indigo-600 pl-3 py-0.5">
                  <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">{personal.name}</h2>
                  <p className="text-[10px] text-indigo-650 font-bold mt-0.5">
                    {personal.email} &bull; {personal.phone}
                  </p>
                  <p className="text-[9px] text-stone-400 mt-0.5 font-mono">{personal.links}</p>
                </div>

                {personal.summary && (
                  <div className="mb-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-0.5 mb-1.5">Summary</h3>
                    <p className="text-stone-750 leading-relaxed">{personal.summary}</p>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-0.5 mb-1.5">Core Strengths</h3>
                  <div className="flex flex-wrap gap-1.5 text-[10px] text-stone-700">
                    {skills.split(',').map((s, i) => (
                      s.trim() ? <span key={i} className="bg-slate-100 px-2 py-0.5 rounded text-stone-750 font-semibold">{s.trim()}</span> : null
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-0.5 mb-1.5">Academic Credentials</h3>
                  {education.map((edu, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>{edu.degree}</span>
                        <span>{edu.year}</span>
                      </div>
                      <p className="text-stone-500 mt-0.5">{edu.school} &bull; GPA: {edu.gpa}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-0.5 mb-1.5">Work History</h3>
                  {experience.map((exp, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>{exp.role} &mdash; {exp.company}</span>
                        <span>{exp.dates}</span>
                      </div>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5 text-stone-650 leading-relaxed">
                        {exp.bullets.map((b, i) => b ? <li key={i}>{b}</li> : null)}
                      </ul>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-0.5 mb-1.5">Featured Development Projects</h3>
                  {projects.map((proj, idx) => (
                    <div key={idx} className="mb-2">
                      <p className="font-bold text-stone-900">{proj.title} <span className="text-stone-400 font-normal">({proj.tech})</span></p>
                      <p className="text-stone-500 mt-0.5">{proj.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Style 3: Europass Format */}
            {style === 'europass' && (
              <div className="font-sans text-[11px] leading-relaxed text-stone-850">
                <div className="grid grid-cols-3 gap-4 border-b border-stone-200 pb-4 mb-4">
                  <div className="col-span-1">
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Europass Curriculum</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <h2 className="text-base font-extrabold text-stone-900">{personal.name}</h2>
                    <p className="text-[10px] text-stone-600 flex flex-col">
                      <span>📧 {personal.email}</span>
                      <span>📞 {personal.phone}</span>
                      <span>🔗 {personal.links}</span>
                    </p>
                  </div>
                </div>

                {personal.summary && (
                  <div className="grid grid-cols-3 gap-4 mb-3.5">
                    <div className="col-span-1 font-bold text-stone-500 uppercase tracking-wide text-[10px]">Scope Summary</div>
                    <div className="col-span-2 text-stone-700 leading-relaxed">{personal.summary}</div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="col-span-1 font-bold text-stone-500 uppercase tracking-wide text-[10px]">Employment History</div>
                  <div className="col-span-2 space-y-3">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <p className="font-bold text-stone-900">{exp.dates}</p>
                        <p className="font-bold text-indigo-755 text-[10px]">{exp.role} at {exp.company}</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-stone-600 mt-0.5">
                          {exp.bullets.map((b, i) => b ? <li key={i}>{b}</li> : null)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="col-span-1 font-bold text-stone-500 uppercase tracking-wide text-[10px]">Education & Training</div>
                  <div className="col-span-2 space-y-3">
                    {education.map((edu, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <p className="font-bold text-stone-900">{edu.year}</p>
                        <p className="font-bold text-stone-850">{edu.degree}</p>
                        <p className="text-stone-500">{edu.school} &bull; GPA: {edu.gpa}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="col-span-1 font-bold text-stone-500 uppercase tracking-wide text-[10px]">Independent Projects</div>
                  <div className="col-span-2 space-y-2.5">
                    {projects.map((proj, idx) => (
                      <div key={idx}>
                        <p className="font-bold text-stone-950 text-[10px]">{proj.title} ({proj.tech})</p>
                        <p className="text-stone-500 mt-0.5">{proj.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 font-bold text-stone-500 uppercase tracking-wide text-[10px]">Skills Inventory</div>
                  <div className="col-span-2 text-stone-700 leading-relaxed font-semibold">
                    {skills}
                  </div>
                </div>
              </div>
            )}

            {/* Style 4: Academic CV */}
            {style === 'academic' && (
              <div className="font-serif text-[11px] leading-relaxed text-stone-900 text-justify">
                <div className="text-center mb-5">
                  <h2 className="text-lg font-black uppercase tracking-wider text-stone-950">{personal.name}</h2>
                  <p className="text-[10px] italic mt-0.5 text-stone-850">
                    {personal.email} &bull; {personal.phone}
                  </p>
                  <p className="text-[9px] text-stone-500 mt-0.5 tracking-tight">{personal.links}</p>
                </div>

                {personal.summary && (
                  <div className="mb-4">
                    <h3 className="text-[10px] font-bold uppercase border-b border-stone-950 pb-0.5 mb-1.5">Research Objectives</h3>
                    <p className="text-stone-700 leading-relaxed">{personal.summary}</p>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-[10px] font-bold uppercase border-b border-stone-950 pb-0.5 mb-1.5">Academic Matrix</h3>
                  {education.map((edu, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>{edu.degree}</span>
                        <span>{edu.year}</span>
                      </div>
                      <p className="text-stone-600 mt-0.5 italic">{edu.school} &mdash; CGPA: {edu.gpa}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-[10px] font-bold uppercase border-b border-stone-950 pb-0.5 mb-1.5">Scientific & Research Experience</h3>
                  {experience.map((exp, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>{exp.role}</span>
                        <span>{exp.dates}</span>
                      </div>
                      <p className="text-stone-500 italic mt-0.5">{exp.company}</p>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5 text-stone-600">
                        {exp.bullets.map((b, i) => b ? <li key={i}>{b}</li> : null)}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-[10px] font-bold uppercase border-b border-stone-950 pb-0.5 mb-1.5">Technical Project Outputs</h3>
                  {projects.map((proj, idx) => (
                    <div key={idx} className="mb-2">
                      <p className="font-bold text-stone-900">{proj.title} &bull; <span className="italic font-normal">({proj.tech})</span></p>
                      <p className="text-stone-600 mt-0.5 leading-relaxed">{proj.desc}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-[10px] font-bold uppercase border-b border-stone-950 pb-0.5 mb-1.5">Expertise Skills</h3>
                  <p className="text-stone-700 leading-relaxed font-semibold italic">{skills}</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
