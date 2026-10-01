import './App.css'
import { useState, useEffect } from 'react'

function App() {
  const [university, setUniversity] = useState('')
  const [major, setMajor] = useState('')
  const [step, setStep] = useState(1)
  const [selectedCourses, setSelectedCourses] = useState([])
  const [missing, setMissing] = useState([])
  const [courses, setCourses] = useState([])

  // Temporary major lists
  const majors = {
    UCSB: [
      'Computer Science',
      'Statistics and Data Science',
      'Economics',
      'Biology'
    ],
    UCLA: [
      'Computer Science B.S',
      'Data Theory',
      'Economics',
      'Biology'
    ],
    UCI: [
      'Computer Science B.S',
      'Data Science',
      'Business Administration',
      'Biology'
    ],
    UCSD: [
      'Computer Science',
      'Data Science',
      'Economics',
      'Biology'
    ]
  }

  const schoolNames = {
  UCI: 'UC Irvine',
  UCLA: 'UCLA',
  UCSB: 'UC Santa Barbara',
  UCSD: 'UC San Diego',
}

useEffect(() => {
  if (major === '') return   // no major picked yet — nothing to fetch

  async function loadCourses() {
    const url = `http://127.0.0.1:8000/courses?school=${encodeURIComponent(schoolNames[university])}&major=${encodeURIComponent(major)}`
    const response = await fetch(url)
    if (!response.ok) {
      setCourses([])   // no data for this major — empty checklist
      return
    }
    const data = await response.json()
    setCourses(data)
    setSelectedCourses([])   // clear old checkboxes when major changes
  }

  loadCourses()
}, [major])

  // Add or remove a course
  function handleCourseChange(course) {
    if (selectedCourses.includes(course)) {
      setSelectedCourses(
        selectedCourses.filter((item) => item !== course)
      )
    } else {
      setSelectedCourses([...selectedCourses, course])
    }
  }

  // Start the planner again
  function startOver() {
    setUniversity('')
    setMajor('')
    setSelectedCourses([])
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
    setMissing(['(Not found — no data for this school/major yet)'])
    setStep(4)
    return
  }

  const data = await response.json()
  setMissing(data)
  setStep(4)
}

  // Find courses that have not been completed
  const remainingCourses = courses.filter(
    (course) => !selectedCourses.includes(course)
  )

  return (
    <div className="app">
      <div className="planner-card">

        <h1>Smart Course Planner</h1>

        <p>
          Plan your courses, track your requirements,
          and find your path to graduation!
        </p>

        {/* STEP 1 */}
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
              <option value="UCSB">UC Santa Barbara</option>
              <option value="UCLA">UCLA</option>
              <option value="UCI">UC Irvine</option>
              <option value="UCSD">UC San Diego</option>
            </select>

            <button
              type="button"
              disabled={university === ''}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h2>Select your major</h2>

            <p className="selection-info">
              {university}
            </p>

            <select
              value={major}
              onChange={(event) => setMajor(event.target.value)}
            >
              <option value="">Choose a major</option>

              {majors[university].map((majorName) => (
                <option
                  key={majorName}
                  value={majorName}
                >
                  {majorName}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={major === ''}
              onClick={() => setStep(3)}
            >
              Continue
            </button>

            <button
              type="button"
              className="back-button"
              onClick={() => setStep(1)}
            >
              Back
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <h2>Which courses have you already taken?</h2>

            <p className="selection-info">
              {university} — {major}
            </p>

            <div className="course-list">

              {courses.map((course) => (
                <label
                  className="course-option"
                  key={course}
                >
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course)}
                    onChange={() => handleCourseChange(course)}
                  />

                  {course}
                </label>
              ))}

            </div>

            <button
              type="button"
              onClick={getPlan}
            >
              See My Course Plan
            </button>

            <button
              type="button"
              className="back-button"
              onClick={() => setStep(2)}
            >
              Back
            </button>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div>
            <h2>Your Course Plan</h2>

            <p className="selection-info">
              {university} — {major}
            </p>

            <div className="results-section">

              <h3>Completed Courses</h3>

              {selectedCourses.length === 0 ? (
                <p>No completed courses selected.</p>
              ) : (
                selectedCourses.map((course) => (
                  <div
                    className="completed-course"
                    key={course}
                  >
                    ✓ {course}
                  </div>
                ))
              )}

            </div>

            <div className="results-section">

              <h3>Courses Still Needed</h3>

              {missing.length === 0 ? (
                <p>All courses completed!</p>
              ) : (
                missing.map((course) => (
                  <div
                    className="remaining-course"
                    key={course}
                  >
                    ○ {course}
                  </div>
                ))
              )}

            </div>

            <button
              type="button"
              className="back-button"
              onClick={() => setStep(3)}
            >
              Back
            </button>

            <button
              type="button"
              onClick={startOver}
            >
              Start Over
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default App