import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

function TextArea({ value, onChange, placeholder, rows = 6 }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full bg-white/70 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
    />
  )
}

function Input({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/70 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
    />
  )
}

function TagInput({ tags, setTags, placeholder }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const t = draft.trim()
    if (!t) return
    if (!tags.includes(t)) setTags([...tags, t])
    setDraft('')
  }
  const remove = (t) => setTags(tags.filter((x) => x !== t))
  return (
    <div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-white/70 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
        />
        <button onClick={add} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
          Add
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((t) => (
          <span key={t} className="px-2.5 py-1 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
            {t}
            <button className="ml-2 text-blue-500 hover:text-blue-700" onClick={() => remove(t)} aria-label={`Remove ${t}`}>
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

function App() {
  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])

  // Profile
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [location, setLocation] = useState('')
  const [education, setEducation] = useState('')
  const [experience, setExperience] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [goals, setGoals] = useState([])
  const [skills, setSkills] = useState([])
  const [interests, setInterests] = useState([])
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(null)

  // Chat
  const [chatInput, setChatInput] = useState('')
  const [chatReply, setChatReply] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Resume
  const [resumeText, setResumeText] = useState('')
  const [resumeTips, setResumeTips] = useState([])
  const [resumeLoading, setResumeLoading] = useState(false)

  // Interview
  const [interviewLevel, setInterviewLevel] = useState('mid')
  const [interviewQuestions, setInterviewQuestions] = useState([])
  const [interviewAnswer, setInterviewAnswer] = useState('')
  const [interviewFeedback, setInterviewFeedback] = useState('')
  const [interviewLoading, setInterviewLoading] = useState(false)

  // Roadmap
  const [roadmap, setRoadmap] = useState([])
  const [roadmapLoading, setRoadmapLoading] = useState(false)

  const saveProfile = async () => {
    setSavingProfile(true)
    setProfileSaved(null)
    try {
      const body = {
        name,
        email,
        location,
        education,
        experience,
        target_role: targetRole,
        goals,
        skills,
        interests,
      }
      const r = await fetch(`${baseUrl}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await r.json()
      if (r.ok && data?.ok) {
        setProfileSaved('Profile saved!')
      } else {
        setProfileSaved('Failed to save profile')
      }
    } catch (e) {
      setProfileSaved('Failed to save profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const sendChat = async () => {
    if (!chatInput.trim()) return
    setChatLoading(true)
    setChatReply('')
    try {
      const r = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: email || undefined, message: chatInput }),
      })
      const data = await r.json()
      setChatReply(data?.reply || 'No response')
    } catch (e) {
      setChatReply('Error getting response')
    } finally {
      setChatLoading(false)
    }
  }

  const analyzeResume = async () => {
    if (!resumeText.trim()) return
    setResumeLoading(true)
    setResumeTips([])
    try {
      const r = await fetch(`${baseUrl}/api/resume/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: email || undefined, resume_text: resumeText, target_role: targetRole || undefined }),
      })
      const data = await r.json()
      setResumeTips(data?.tips || [])
    } catch (e) {
      setResumeTips(['Error analyzing resume'])
    } finally {
      setResumeLoading(false)
    }
  }

  const startInterview = async () => {
    setInterviewLoading(true)
    setInterviewQuestions([])
    setInterviewFeedback('')
    try {
      const r = await fetch(`${baseUrl}/api/interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: email || undefined, target_role: targetRole || 'Software Engineer', level: interviewLevel }),
      })
      const data = await r.json()
      setInterviewQuestions(data?.questions || [])
    } catch (e) {
      setInterviewQuestions(['Error starting interview'])
    } finally {
      setInterviewLoading(false)
    }
  }

  const getInterviewFeedback = async () => {
    if (!interviewAnswer.trim()) return
    setInterviewLoading(true)
    try {
      const r = await fetch(`${baseUrl}/api/interview/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: email || undefined, target_role: targetRole || 'Software Engineer', level: interviewLevel, answer: interviewAnswer }),
      })
      const data = await r.json()
      setInterviewFeedback(data?.feedback || 'No feedback')
    } catch (e) {
      setInterviewFeedback('Error getting feedback')
    } finally {
      setInterviewLoading(false)
    }
  }

  const generateRoadmap = async () => {
    setRoadmapLoading(true)
    setRoadmap([])
    try {
      const r = await fetch(`${baseUrl}/api/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: email || undefined, target_role: targetRole || 'Software Engineer', current_skills: skills, interests }),
      })
      const data = await r.json()
      setRoadmap(data?.roadmap || [])
    } catch (e) {
      setRoadmap(['Error generating roadmap'])
    } finally {
      setRoadmapLoading(false)
    }
  }

  useEffect(() => {
    // warm up backend
    fetch(baseUrl).catch(() => {})
  }, [baseUrl])

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Hero with Spline */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <Spline scene="https://prod.spline.design/AeAqaKLmGsS-FPBN/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/20 to-neutral-950" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white to-orange-400 bg-clip-text text-transparent">
              AI Career Coach
            </h1>
            <p className="mt-4 text-neutral-300 max-w-2xl mx-auto">
              Personalized guidance, resume insights, interview practice, and a clear roadmap — all in one friendly assistant.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <a href="#get-started" className="px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition">Get started</a>
              <a href="/test" className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition">Check backend</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div id="get-started" className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-neutral-900">
            <SectionHeader title="Your Profile" subtitle="Tell the coach about your background" />
            <div className="space-y-3">
              <Input value={name} onChange={setName} placeholder="Full name" />
              <Input value={email} onChange={setEmail} placeholder="Email (optional)" />
              <Input value={location} onChange={setLocation} placeholder="Location" />
              <Input value={education} onChange={setEducation} placeholder="Education summary" />
              <Input value={experience} onChange={setExperience} placeholder="Experience summary" />
              <Input value={targetRole} onChange={setTargetRole} placeholder="Target role (e.g., Product Manager)" />
              <div>
                <p className="text-sm text-neutral-700 mb-2">Goals</p>
                <TagInput tags={goals} setTags={setGoals} placeholder="Add a goal and press Enter" />
              </div>
              <div>
                <p className="text-sm text-neutral-700 mb-2">Skills</p>
                <TagInput tags={skills} setTags={setSkills} placeholder="Add a skill and press Enter" />
              </div>
              <div>
                <p className="text-sm text-neutral-700 mb-2">Interests</p>
                <TagInput tags={interests} setTags={setInterests} placeholder="Add an interest and press Enter" />
              </div>
              <button onClick={saveProfile} disabled={savingProfile} className="w-full mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-60">
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
              {profileSaved && <p className="text-sm text-green-600 mt-2">{profileSaved}</p>}
            </div>
          </div>

          {/* Chat & Resume */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-neutral-900">
              <SectionHeader title="AI Chat Assistant" subtitle="Ask anything about your career path" />
              <div className="flex gap-3">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="e.g., What skills do I need for a data analyst role?"
                  className="flex-1 bg-white/70 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
                <button onClick={sendChat} disabled={chatLoading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-60">
                  {chatLoading ? 'Thinking...' : 'Ask'}
                </button>
              </div>
              {chatReply && (
                <div className="mt-4 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg p-4 whitespace-pre-wrap">
                  {chatReply}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-neutral-900">
              <SectionHeader title="Resume Analyzer" subtitle="Paste your resume text for suggestions" />
              <TextArea value={resumeText} onChange={setResumeText} placeholder="Paste your resume text here..." rows={8} />
              <div className="mt-3 flex justify-end">
                <button onClick={analyzeResume} disabled={resumeLoading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-60">
                  {resumeLoading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
              {resumeTips?.length > 0 && (
                <ul className="mt-4 space-y-2 list-disc pl-6">
                  {resumeTips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-neutral-900">
              <SectionHeader title="Interview Practice" subtitle="Start a mock interview and get feedback" />
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={interviewLevel}
                  onChange={(e) => setInterviewLevel(e.target.value)}
                  className="bg-white/70 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="junior">Junior</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                </select>
                <button onClick={startInterview} disabled={interviewLoading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-60">
                  {interviewLoading ? 'Loading...' : 'Start Interview'}
                </button>
              </div>
              {interviewQuestions?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {interviewQuestions.map((q, i) => (
                    <p key={i} className="bg-gray-50 border border-gray-200 rounded p-3">{q}</p>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <TextArea value={interviewAnswer} onChange={setInterviewAnswer} placeholder="Type your answer here..." rows={5} />
                <div className="mt-3 flex justify-end">
                  <button onClick={getInterviewFeedback} disabled={interviewLoading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-60">
                    {interviewLoading ? 'Evaluating...' : 'Get Feedback'}
                  </button>
                </div>
              </div>
              {interviewFeedback && (
                <div className="mt-4 bg-green-50 text-green-900 border border-green-200 rounded-lg p-4 whitespace-pre-wrap">
                  {interviewFeedback}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 text-neutral-900">
              <SectionHeader title="Career Roadmap" subtitle="Get a step-by-step plan based on your goals" />
              <div className="flex justify-end">
                <button onClick={generateRoadmap} disabled={roadmapLoading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-60">
                  {roadmapLoading ? 'Generating...' : 'Generate Roadmap'}
                </button>
              </div>
              {roadmap?.length > 0 && (
                <ol className="mt-4 space-y-2 list-decimal pl-6">
                  {roadmap.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-neutral-400 text-sm">
          <p>
            Tip: Set your backend URL via VITE_BACKEND_URL and your OpenAI key later via OPENAI_API_KEY (backend).
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
