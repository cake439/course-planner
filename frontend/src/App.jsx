import './App.css'
import { useState, useEffect } from 'react'

function App() {
  const [university, setUniversity] = useState('')
  const [major, setMajor] = useState('')
  const [step, setStep] = useState(1)
  const [selectedCourses, setSelectedCourses] = useState([])
  const [results, setResults] = useState([])
  const [courses, setCourses] = useState([])
  const [error, setError] = useState('')

  // frontend code -> exact backend school key
  const schoolNames = {
    UCI: 'UC Irvine',
    UCLA: 'UCLA',
    UCB: 'UC Berkeley',
    UCSD: 'UC San Diego',
    UCD: 'UC Davis',
    UCSB: 'UC Santa Barbara',
    UCSC: 'UC Santa Cruz',
    UCR: 'UC Riverside',
    UCM: 'UC Merced',
  }

  // each school's single CS major (exact backend key)
  const majors = {
    UCI: ['Computer Science B.S'],
    UCLA: ['Computer Science B.S'],
    UCB: ['Computer Science B.A'],
    UCSD: ['Computer Science B.S'],
    UCD: ['Computer Science B.S'],
    UCSB: ['Computer Science B.S'],
    UCSC: ['Computer Science B.S'],
    UCR: ['Computer Science B.S'],
    UCM: ['Computer Science and Engineering B.S'],
  }

  useEffect(() => {
    if (major === '') return

    async function loadCourses() {
      const url = `http://127.0.0.1:8000/courses?school=${encodeURIComponent(schoolNames[university])}&major=${encodeURIComponent(major)}`
      const response = await fetch(url)
      if (!response.ok) {
        setCourses([])
        return
      }
      const data = await response.json()
      setCourses(data)
      setSelectedCourses([])
    }

    loadCourses()
  }, [major])

  function handleCourseChange(course) {
    if (selectedCourses.includes(course)) {
      setSelectedCourses(selectedCourses.filter((item) => item !== course))
    } else {
      setSelectedCourses([...selectedCourses, course])
    }
  }

  function startOver() {
    setUniversity('')
    setMajor('')
    setSelectedCourses([])
    setResults([])
    setError('')
    setStep(1)
  }

  async function getPlan() {
    const response = await fetch('http://127.0.0.1:8000/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        school: schoolNames[university],
        major: major,
        completed: selectedCourses,
      }),
    })

    if (!response.ok) {
      setError('No requirement data for this school/major yet.')
      setResults([])
      setStep(4)
      return
    }

    const data = await response.json()
    setError('')
    setResults(data)
    setStep(4)
  }

  const allDone = results.length > 0 && results.every((rule) => rule.satisfied)

  return (
    <div className="app">
      <div className="planner-card">

        <h1>Smart Course Planner</h1>
        <p>Plan your CS degree, track your requirements, and find your path to graduation!</p>

        {/* STEP 1 — university */}
        {step === 1 && (
          <div>
            <h2>Select your university</h2>
            <select
              value={university}
              onChange={(event) => {
                setUniversity(event.target.value)
                setMajor('')
              }}
            >
              <option value="">Choose a university</option>
              <option value="UCB">UC Berkeley</option>
              <option value="UCD">UC Davis</option>
              <option value="UCI">UC Irvine</option>
              <option value="UCLA">UCLA</option>
              <option value="UCM">UC Merced</option>
              <option value="UCR">UC Riverside</option>
              <option value="UCSB">UC Santa Barbara</option>
              <option value="UCSC">UC Santa Cruz</option>
              <option value="UCSD">UC San Diego</option>
            </select>
            <button type="button" disabled={university === ''} onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        )}

        {/* STEP 2 — major (CS only) */}
        {step === 2 && (
          <div>
            <h2>Select your major</h2>
            <p className="selection-info">{university}</p>
            <select value={major} onChange={(event) => setMajor(event.target.value)}>
              <option value="">Choose a major</option>
              {majors[university].map((majorName) => (
                <option key={majorName} value={majorName}>{majorName}</option>
              ))}
            </select>
            <button type="button" disabled={major === ''} onClick={() => setStep(3)}>
              Continue
            </button>
            <button type="button" className="back-button" onClick={() => setStep(1)}>Back</button>
          </div>
        )}

        {/* STEP 3 — completed courses */}
        {step === 3 && (
          <div>
            <h2>Which courses have you already taken?</h2>
            <p className="selection-info">{university} — {major}</p>
            <div className="course-list">
              {courses.length === 0 ? (
                <p>No course data for this major yet.</p>
              ) : (
                courses.map((course) => (
                  <label className="course-option" key={course}>
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course)}
                      onChange={() => handleCourseChange(course)}
                    />
                    {course}
                  </label>
                ))
              )}
            </div>
            <button type="button" onClick={getPlan}>See My Course Plan</button>
            <button type="button" className="back-button" onClick={() => setStep(2)}>Back</button>
          </div>
        )}

        {/* STEP 4 — results */}
        {step === 4 && (
          <div>
            <h2>Your Course Plan</h2>
            <p className="selection-info">{university} — {major}</p>

            {error && <p className="error">{error}</p>}
            {!error && allDone && <p>🎉 All requirements complete!</p>}

            {!error && results.map((rule) => (
              <div className="requirement-block" key={rule.name}>
                <h3>{rule.satisfied ? '✓' : '○'} {rule.name}</h3>

                {rule.satisfied ? (
                  <p>Complete!</p>
                ) : rule.type === 'all_of' ? (
                  <div>
                    <p>Still need:</p>
                    {rule.missing.map((course) => (
                      <div className="remaining-course" key={course}>○ {course}</div>
                    ))}
                  </div>
                ) : rule.type === 'choose_n' ? (
                  <div>
                    <p>Choose {rule.still_needed} more from:</p>
                    {rule.options.map((course) => (
                      <div className="remaining-course" key={course}>○ {course}</div>
                    ))}
                  </div>
                ) : (
                  <p>Unknown requirement type.</p>
                )}
              </div>
            ))}

            <button type="button" className="back-button" onClick={() => setStep(3)}>Back</button>
            <button type="button" onClick={startOver}>Start Over</button>
          </div>
        )}

      </div>
    </div>
  )
}

export default App