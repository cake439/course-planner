import { useState } from 'react'
import './App.css'

function App() {
  const [university, setUniversity] = useState('')
  const [major, setMajor] = useState('')
  const [step, setStep] = useState(1)
  const [selectedCourses, setSelectedCourses] = useState([])

  // Temporary major lists
  const majors = {
    UCSB: [
      'Computer Science',
      'Statistics and Data Science',
      'Economics',
      'Biology'
    ],
    UCLA: [
      'Computer Science',
      'Data Theory',
      'Economics',
      'Biology'
    ],
    UCI: [
      'Computer Science',
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

  // Temporary course list
  const courses = [
    'MATH 2A',
    'MATH 2B',
    'MATH 4A',
    'MATH 4B',
    'MATH 6A',
    'PSTAT 10',
    'CMPSC 9'
  ]

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
              onClick={() => setStep(4)}
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

              {remainingCourses.length === 0 ? (
                <p>All courses completed!</p>
              ) : (
                remainingCourses.map((course) => (
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