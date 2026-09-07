import React, { Component, useEffect, useMemo, useState } from "react";
import "./App.css";

const NOTES_KEY = "studytools-notes";
const PLANNER_KEY = "studytools-planner";
const THEME_KEY = "studytools-theme";

const APP_VERSION = "1.1.0";

const tools = [
  {
    id: "calculator",
    icon: "🧮",
    name: "Calculator",
    description: "Quick calculations",
  },
  {
    id: "percentage",
    icon: "📊",
    name: "Percentage",
    description: "Calculate percentages",
  },
  {
    id: "gpa",
    icon: "🎓",
    name: "GPA Calculator",
    description: "Calculate your GPA",
  },
  {
    id: "converter",
    icon: "🔄",
    name: "Converter",
    description: "Convert units",
  },
  {
    id: "timer",
    icon: "⏱️",
    name: "Study Timer",
    description: "Focus with a timer",
  },
  {
    id: "notes",
    icon: "📝",
    name: "Notes",
    description: "Save study notes",
  },
  {
    id: "planner",
    icon: "📅",
    name: "Planner",
    description: "Plan your study",
  },
];

const gradePoints = {
  A: 4,
  "A-": 3.7,
  "B+": 3.3,
  B: 3,
  "B-": 2.7,
  "C+": 2.3,
  C: 2,
  "C-": 1.7,
  D: 1,
  F: 0,
};

/* =========================================================
   SAFE STORAGE HELPERS
   ========================================================= */

function safeReadArray(key) {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return [];
    }

    const value = JSON.parse(raw);

    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.warn(`StudyTools: Could not read ${key}.`, error);

    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage cleanup errors.
    }

    return [];
  }
}

function safeReadTheme() {
  try {
    const theme = localStorage.getItem(THEME_KEY);

    return theme === "dark";
  } catch (error) {
    console.warn("StudyTools: Could not read theme.", error);
    return false;
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`StudyTools: Could not save ${key}.`, error);
    return false;
  }
}

function safeWriteString(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`StudyTools: Could not save ${key}.`, error);
    return false;
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`StudyTools: Could not remove ${key}.`, error);
    return false;
  }
}

/* =========================================================
   ERROR BOUNDARY
   ========================================================= */

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "Something unexpected happened.",
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("StudyTools Error Boundary:", error);
    console.error("Component information:", errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      safeRemove(NOTES_KEY);
      safeRemove(PLANNER_KEY);
      safeRemove(THEME_KEY);
    } catch {
      // Ignore reset errors.
    }

    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="loading-screen">
          <div className="loading-logo">⚠️</div>

          <h1>StudyTools</h1>

          <p>Something went wrong, but your app can recover.</p>

          <div
            style={{
              maxWidth: "420px",
              width: "90%",
              marginTop: "20px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                opacity: 0.7,
                wordBreak: "break-word",
              }}
            >
              {this.state.errorMessage}
            </p>

            <button
              className="primary-button"
              onClick={this.handleReload}
              style={{
                width: "100%",
                marginTop: "12px",
              }}
            >
              🔄 Reload StudyTools
            </button>

            <button
              className="secondary-button"
              onClick={this.handleReset}
              style={{
                width: "100%",
                marginTop: "10px",
              }}
            >
              🧹 Reset Saved Data
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* =========================================================
   LOADING SCREEN
   ========================================================= */

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">📚</div>
      <h1>StudyTools</h1>
      <p>Your student toolkit</p>
      <div className="loading-spinner" />
    </div>
  );
}

/* =========================================================
   TOOL PAGE
   ========================================================= */

function ToolPage({ title, icon, onBack, children }) {
  return (
    <div className="page tool-page">
      <div className="page-header">
        <button className="icon-button" onClick={onBack} aria-label="Go back">
          ←
        </button>

        <div className="page-title">
          <span>{icon}</span>
          <h2>{title}</h2>
        </div>
      </div>

      {children}
    </div>
  );
}

/* =========================================================
   CALCULATOR
   ========================================================= */

function Calculator() {
  const [display, setDisplay] = useState("0");
  const [firstValue, setFirstValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waiting, setWaiting] = useState(false);

  const calculate = (a, b, op) => {
    if (op === "+") return a + b;
    if (op === "-") return a - b;
    if (op === "×") return a * b;
    if (op === "÷") return b === 0 ? "Error" : a / b;

    return b;
  };

  const inputNumber = (num) => {
    if (display === "Error") {
      setDisplay(String(num));
      setWaiting(false);
      return;
    }

    if (waiting) {
      setDisplay(String(num));
      setWaiting(false);
      return;
    }

    setDisplay(display === "0" ? String(num) : display + num);
  };

  const inputDecimal = () => {
    if (display === "Error") {
      setDisplay("0.");
      setWaiting(false);
      return;
    }

    if (waiting) {
      setDisplay("0.");
      setWaiting(false);
      return;
    }

    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const chooseOperator = (nextOperator) => {
    const value = Number(display);

    if (!Number.isFinite(value)) {
      setDisplay("Error");
      return;
    }

    if (firstValue === null) {
      setFirstValue(value);
    } else if (operator) {
      const result = calculate(firstValue, value, operator);

      if (result === "Error" || !Number.isFinite(result)) {
        setDisplay("Error");
        setFirstValue(null);
        setOperator(null);
        setWaiting(false);
        return;
      }

      setDisplay(String(Number(result.toFixed(10))));

      setFirstValue(result);
    }

    setWaiting(true);
    setOperator(nextOperator);
  };

  const equals = () => {
    if (firstValue === null || !operator) {
      return;
    }

    const result = calculate(firstValue, Number(display), operator);

    if (result === "Error" || !Number.isFinite(result)) {
      setDisplay("Error");
    } else {
      setDisplay(String(Number(result.toFixed(10))));
    }

    setFirstValue(null);
    setOperator(null);
    setWaiting(false);
  };

  const clear = () => {
    setDisplay("0");
    setFirstValue(null);
    setOperator(null);
    setWaiting(false);
  };

  const backspace = () => {
    if (waiting || display === "Error") {
      return;
    }

    setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
  };

  const percentage = () => {
    if (display === "Error") {
      return;
    }

    const value = Number(display);

    if (!Number.isFinite(value)) {
      setDisplay("Error");
      return;
    }

    setDisplay(String(value / 100));
  };

  return (
    <div className="calculator-card">
      <div className="calculator-display">{display}</div>

      <div className="calculator-grid">
        <button className="calc-function" onClick={clear}>
          C
        </button>

        <button className="calc-function" onClick={backspace}>
          ⌫
        </button>

        <button className="calc-function" onClick={percentage}>
          %
        </button>

        <button className="calc-operator" onClick={() => chooseOperator("÷")}>
          ÷
        </button>

        {[7, 8, 9].map((n) => (
          <button key={n} onClick={() => inputNumber(n)}>
            {n}
          </button>
        ))}

        <button className="calc-operator" onClick={() => chooseOperator("×")}>
          ×
        </button>

        {[4, 5, 6].map((n) => (
          <button key={n} onClick={() => inputNumber(n)}>
            {n}
          </button>
        ))}

        <button className="calc-operator" onClick={() => chooseOperator("-")}>
          −
        </button>

        {[1, 2, 3].map((n) => (
          <button key={n} onClick={() => inputNumber(n)}>
            {n}
          </button>
        ))}

        <button className="calc-operator" onClick={() => chooseOperator("+")}>
          +
        </button>

        <button className="zero-button" onClick={() => inputNumber(0)}>
          0
        </button>

        <button onClick={inputDecimal}>.</button>

        <button className="equals-button" onClick={equals}>
          =
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PERCENTAGE
   ========================================================= */

function Percentage() {
  const [percent, setPercent] = useState("");
  const [number, setNumber] = useState("");

  const result =
    percent !== "" &&
    number !== "" &&
    Number.isFinite(Number(percent)) &&
    Number.isFinite(Number(number))
      ? (Number(percent) / 100) * Number(number)
      : null;

  return (
    <div className="form-card">
      <div className="input-group">
        <label>Percentage</label>

        <input
          type="number"
          placeholder="e.g. 20"
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>Number</label>

        <input
          type="number"
          placeholder="e.g. 500"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
      </div>

      <div className="result-card">
        <span>Result</span>

        <strong>{result === null ? "—" : Number(result.toFixed(2))}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   GPA
   ========================================================= */

function GPA() {
  const [subjects, setSubjects] = useState([
    {
      id: 1,
      name: "",
      credits: 3,
      grade: "A",
    },
  ]);

  const addSubject = () => {
    setSubjects((current) => [
      ...current,
      {
        id: Date.now() + Math.random(),
        name: "",
        credits: 3,
        grade: "A",
      },
    ]);
  };

  const removeSubject = (id) => {
    setSubjects((current) => current.filter((subject) => subject.id !== id));
  };

  const updateSubject = (id, field, value) => {
    setSubjects((current) =>
      current.map((subject) =>
        subject.id === id
          ? {
              ...subject,
              [field]: value,
            }
          : subject
      )
    );
  };

  const gpa = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;

    subjects.forEach((subject) => {
      const credits = Math.max(0, Number(subject.credits) || 0);

      const points = gradePoints[subject.grade] ?? 0;

      totalPoints += points * credits;
      totalCredits += credits;
    });

    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  }, [subjects]);

  return (
    <div className="gpa-container">
      {subjects.map((subject, index) => (
        <div className="subject-card" key={subject.id}>
          <div className="subject-heading">
            <strong>Subject {index + 1}</strong>

            {subjects.length > 1 && (
              <button
                className="small-danger"
                onClick={() => removeSubject(subject.id)}
              >
                Remove
              </button>
            )}
          </div>

          <input
            placeholder="Subject name"
            value={subject.name}
            onChange={(e) => updateSubject(subject.id, "name", e.target.value)}
          />

          <div className="two-columns">
            <div>
              <label>Credits</label>

              <input
                type="number"
                min="0"
                value={subject.credits}
                onChange={(e) =>
                  updateSubject(subject.id, "credits", e.target.value)
                }
              />
            </div>

            <div>
              <label>Grade</label>

              <select
                value={subject.grade}
                onChange={(e) =>
                  updateSubject(subject.id, "grade", e.target.value)
                }
              >
                {Object.keys(gradePoints).map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}

      <button className="secondary-button full-button" onClick={addSubject}>
        + Add Subject
      </button>

      <div className="gpa-result">
        <span>Your GPA</span>

        <strong>{gpa}</strong>

        <small>Based on entered subjects and credits</small>
      </div>
    </div>
  );
}

/* =========================================================
   CONVERTER
   ========================================================= */

function Converter() {
  const [category, setCategory] = useState("Length");

  const [value, setValue] = useState("");

  const [from, setFrom] = useState("Meters");

  const [to, setTo] = useState("Kilometers");

  const units = {
    Length: ["Meters", "Kilometers", "Centimeters", "Miles", "Feet"],

    Weight: ["Kilograms", "Grams", "Pounds", "Ounces"],

    Volume: ["Liters", "Milliliters", "Gallons"],

    Temperature: ["Celsius", "Fahrenheit", "Kelvin"],
  };

  useEffect(() => {
    setFrom(units[category][0]);
    setTo(units[category][1] || units[category][0]);
    setValue("");
  }, [category]);

  const convert = () => {
    if (value === "") {
      return null;
    }

    const num = Number(value);

    if (!Number.isFinite(num)) {
      return null;
    }

    if (category === "Temperature") {
      let celsius;

      if (from === "Celsius") {
        celsius = num;
      }

      if (from === "Fahrenheit") {
        celsius = (num - 32) * (5 / 9);
      }

      if (from === "Kelvin") {
        celsius = num - 273.15;
      }

      if (to === "Celsius") {
        return celsius;
      }

      if (to === "Fahrenheit") {
        return celsius * (9 / 5) + 32;
      }

      if (to === "Kelvin") {
        return celsius + 273.15;
      }
    }

    const factors = {
      Length: {
        Meters: 1,
        Kilometers: 1000,
        Centimeters: 0.01,
        Miles: 1609.344,
        Feet: 0.3048,
      },

      Weight: {
        Kilograms: 1,
        Grams: 0.001,
        Pounds: 0.45359237,
        Ounces: 0.0283495,
      },

      Volume: {
        Liters: 1,
        Milliliters: 0.001,
        Gallons: 3.785411784,
      },
    };

    const categoryFactors = factors[category];

    if (!categoryFactors) {
      return null;
    }

    const baseValue = num * categoryFactors[from];

    return baseValue / categoryFactors[to];
  };

  const result = convert();

  return (
    <div className="form-card">
      <div className="input-group">
        <label>Category</label>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {Object.keys(units).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label>Value</label>

        <input
          type="number"
          placeholder="Enter value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      <div className="two-columns">
        <div>
          <label>From</label>

          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {units[category].map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>To</label>

          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {units[category].map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="result-card">
        <span>Converted value</span>

        <strong>{result === null ? "—" : Number(result.toFixed(6))}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   STUDY TIMER
   ========================================================= */

function StudyTimer() {
  const [seconds, setSeconds] = useState(25 * 60);

  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) {
      return;
    }

    const interval = setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          setRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = seconds % 60;

  const reset = () => {
    setRunning(false);
    setSeconds(25 * 60);
  };

  const progress = ((25 * 60 - seconds) / (25 * 60)) * 100;

  return (
    <div className="timer-container">
      <div
        className={`timer-circle ${seconds === 0 ? "timer-finished" : ""}`}
        style={{
          "--progress": `${progress}%`,
        }}
      >
        <div className="timer-inner">
          <strong>
            {String(minutes).padStart(2, "0")}:
            {String(remainingSeconds).padStart(2, "0")}
          </strong>

          <span>
            {seconds === 0 ? "Finished!" : running ? "Focus" : "Ready"}
          </span>
        </div>
      </div>

      <div className="timer-buttons">
        <button
          className="primary-button"
          onClick={() => setRunning((value) => !value)}
        >
          {running ? "Pause" : "Start"}
        </button>

        <button className="secondary-button" onClick={reset}>
          Reset
        </button>
      </div>

      <p className="helper-text">
        Focus for 25 minutes, then take a short break.
      </p>
    </div>
  );
}

/* =========================================================
   NOTES
   ========================================================= */

function Notes() {
  const [notes, setNotes] = useState(() => safeReadArray(NOTES_KEY));

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");

  const [search, setSearch] = useState("");

  const [storageWarning, setStorageWarning] = useState(false);

  useEffect(() => {
    const saved = safeWrite(NOTES_KEY, notes);

    setStorageWarning(!saved);
  }, [notes]);

  const addNote = () => {
    if (!title.trim() && !content.trim()) {
      return;
    }

    const newNote = {
      id: Date.now(),
      title: title.trim() || "Untitled Note",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setNotes((current) => [newNote, ...current]);

    setTitle("");
    setContent("");
  };

  const deleteNote = (id) => {
    setNotes((current) => current.filter((note) => note.id !== id));
  };

  const filteredNotes = notes.filter((note) =>
    `${note.title || ""} ${note.content || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="notes-container">
      {storageWarning && (
        <div className="settings-message">
          ⚠️ Your browser could not save the latest notes.
        </div>
      )}

      <div className="form-card">
        <input
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button className="primary-button full-button" onClick={addNote}>
          + Save Note
        </button>
      </div>

      {notes.length > 0 && (
        <input
          className="search-input"
          placeholder="🔎 Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      <div className="notes-list">
        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <span>📝</span>

            <strong>No notes yet</strong>

            <p>Create your first study note above.</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div className="note-card" key={note.id}>
              <div>
                <h3>{note.title || "Untitled Note"}</h3>

                <p>{note.content || "No content"}</p>
              </div>

              <button
                className="delete-button"
                onClick={() => deleteNote(note.id)}
                aria-label="Delete note"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STUDY PLANNER
   ========================================================= */

function StudyPlanner() {
  const [tasks, setTasks] = useState(() => safeReadArray(PLANNER_KEY));

  const [task, setTask] = useState("");

  const [storageWarning, setStorageWarning] = useState(false);

  useEffect(() => {
    const saved = safeWrite(PLANNER_KEY, tasks);

    setStorageWarning(!saved);
  }, [tasks]);

  const addTask = () => {
    if (!task.trim()) {
      return;
    }

    setTasks((current) => [
      ...current,
      {
        id: Date.now(),
        text: task.trim(),
        completed: false,
      },
    ]);

    setTask("");
  };

  const toggleTask = (id) => {
    setTasks((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
            }
          : item
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((current) => current.filter((item) => item.id !== id));
  };

  const completed = tasks.filter((item) => item.completed).length;

  return (
    <div className="planner-container">
      {storageWarning && (
        <div className="settings-message">
          ⚠️ Your browser could not save the latest planner changes.
        </div>
      )}

      <div className="form-card">
        <div className="task-input-row">
          <input
            placeholder="Add a study task..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addTask();
              }
            }}
          />

          <button className="primary-button" onClick={addTask}>
            Add
          </button>
        </div>
      </div>

      <div className="planner-summary">
        <span>{completed} completed</span>

        <span>{tasks.length - completed} remaining</span>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <span>📅</span>

            <strong>Your planner is empty</strong>

            <p>Add tasks to organize your study time.</p>
          </div>
        ) : (
          tasks.map((item) => (
            <div
              className={`task-card ${item.completed ? "completed" : ""}`}
              key={item.id}
            >
              <button
                className="check-button"
                onClick={() => toggleTask(item.id)}
                aria-label="Toggle task"
              >
                {item.completed ? "✓" : ""}
              </button>

              <span>{item.text}</span>

              <button
                className="delete-button"
                onClick={() => deleteTask(item.id)}
                aria-label="Delete task"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STUDY OVERVIEW
   ========================================================= */

function StudyOverview() {
  const notes = safeReadArray(NOTES_KEY);

  const tasks = safeReadArray(PLANNER_KEY);

  const completed = tasks.filter((task) => task.completed).length;

  const remaining = tasks.length - completed;

  const percentage = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  return (
    <section className="overview-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR PROGRESS</span>

          <h2>Study Overview</h2>
        </div>

        <span className="overview-icon">📈</span>
      </div>

      <div className="overview-stats">
        <div>
          <strong>{tasks.length}</strong>

          <span>Total Tasks</span>
        </div>

        <div>
          <strong>{completed}</strong>

          <span>Completed</span>
        </div>

        <div>
          <strong>{notes.length}</strong>

          <span>Notes</span>
        </div>
      </div>

      <div className="progress-heading">
        <span>Task completion</span>

        <strong>{percentage}%</strong>
      </div>

      <div className="overview-progress">
        <div
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="overview-message">
        {tasks.length === 0
          ? "Start by adding your first study task."
          : remaining === 0
          ? "Excellent! All your tasks are complete. 🎉"
          : `${remaining} task${remaining === 1 ? "" : "s"} still remaining.`}
      </p>
    </section>
  );
}

/* =========================================================
   HOME
   ========================================================= */

function Home({ setPage, setActiveTool }) {
  const openTool = (id) => {
    setActiveTool(id);
    setPage("tool");
  };

  return (
    <div className="page home-page">
      <header className="home-header">
        <div>
          <span className="eyebrow">WELCOME BACK</span>

          <h1>StudyTools 📚</h1>

          <p>Everything you need for smarter studying.</p>
        </div>

        <div className="header-badge">✨</div>
      </header>

      <section className="hero-card">
        <div>
          <span>STUDENT TOOLKIT</span>

          <h2>
            Study smarter.
            <br />
            Stay organized.
          </h2>

          <p>Simple tools designed to help you learn, plan and focus.</p>

          <button className="hero-button" onClick={() => setPage("tools")}>
            Explore Tools →
          </button>
        </div>

        <div className="hero-illustration">🎓</div>
      </section>

      <StudyOverview />

      <div className="section-heading">
        <div>
          <span className="eyebrow">QUICK ACCESS</span>

          <h2>Popular Tools</h2>
        </div>

        <button className="text-button" onClick={() => setPage("tools")}>
          View all
        </button>
      </div>

      <div className="tools-grid">
        {tools.slice(0, 4).map((tool) => (
          <button
            className="tool-card"
            key={tool.id}
            onClick={() => openTool(tool.id)}
          >
            <span className="tool-icon">{tool.icon}</span>

            <strong>{tool.name}</strong>

            <small>{tool.description}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   TOOLS PAGE
   ========================================================= */

function ToolsPage({ setPage, setActiveTool }) {
  return (
    <div className="page">
      <div className="page-heading">
        <span className="eyebrow">STUDENT TOOLKIT</span>

        <h1>All Tools</h1>

        <p>Choose a tool to get started.</p>
      </div>

      <div className="tools-list">
        {tools.map((tool) => (
          <button
            className="large-tool-card"
            key={tool.id}
            onClick={() => {
              setActiveTool(tool.id);
              setPage("tool");
            }}
          >
            <span className="tool-icon large">{tool.icon}</span>

            <div>
              <strong>{tool.name}</strong>

              <p>{tool.description}</p>
            </div>

            <span className="arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   SETTINGS
   ========================================================= */

function SettingsPage({ darkMode, setDarkMode }) {
  const [message, setMessage] = useState("");

  const [busy, setBusy] = useState(false);

  const exportData = () => {
    try {
      const data = {
        app: "StudyTools",
        version: APP_VERSION,
        exportedAt: new Date().toISOString(),

        notes: safeReadArray(NOTES_KEY),

        planner: safeReadArray(PLANNER_KEY),

        theme: (() => {
          try {
            return localStorage.getItem(THEME_KEY) || "light";
          } catch {
            return "light";
          }
        })(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");

      anchor.href = url;

      anchor.download = `studytools-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(url);

      setMessage("Backup exported successfully.");
    } catch (error) {
      console.error("Backup export failed:", error);

      setMessage("Could not export the backup.");
    }
  };

  const importData = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Backup file is too large. Maximum size is 5 MB.");

      event.target.value = "";
      return;
    }

    setBusy(true);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!data || typeof data !== "object" || Array.isArray(data)) {
          throw new Error("Invalid backup structure.");
        }

        if (data.app && data.app !== "StudyTools") {
          throw new Error("This is not a StudyTools backup.");
        }

        if (data.notes !== undefined && !Array.isArray(data.notes)) {
          throw new Error("Notes data is invalid.");
        }

        if (data.planner !== undefined && !Array.isArray(data.planner)) {
          throw new Error("Planner data is invalid.");
        }

        if (
          data.theme !== undefined &&
          data.theme !== "dark" &&
          data.theme !== "light"
        ) {
          throw new Error("Theme data is invalid.");
        }

        if (Array.isArray(data.notes)) {
          safeWrite(NOTES_KEY, data.notes);
        }

        if (Array.isArray(data.planner)) {
          safeWrite(PLANNER_KEY, data.planner);
        }

        if (data.theme === "dark" || data.theme === "light") {
          safeWriteString(THEME_KEY, data.theme);
        }

        setMessage("Backup restored successfully. Reloading...");

        setTimeout(() => {
          window.location.reload();
        }, 800);
      } catch (error) {
        console.error("Backup import failed:", error);

        setMessage(
          error?.message === "This is not a StudyTools backup."
            ? error.message
            : "This backup file is not valid."
        );
      } finally {
        setBusy(false);
      }
    };

    reader.onerror = () => {
      setBusy(false);

      setMessage("Could not read the backup file.");
    };

    reader.readAsText(file);

    event.target.value = "";
  };

  const clearNotes = () => {
    if (!window.confirm("Delete all saved notes?")) {
      return;
    }

    safeRemove(NOTES_KEY);

    setMessage("All notes deleted.");

    window.location.reload();
  };

  const clearPlanner = () => {
    if (!window.confirm("Delete all planner tasks?")) {
      return;
    }

    safeRemove(PLANNER_KEY);

    setMessage("Planner cleared.");

    window.location.reload();
  };

  const clearEverything = () => {
    if (!window.confirm("Delete all StudyTools data? This cannot be undone.")) {
      return;
    }

    safeRemove(NOTES_KEY);
    safeRemove(PLANNER_KEY);
    safeRemove(THEME_KEY);

    setMessage("All StudyTools data cleared.");

    window.location.reload();
  };

  const toggleDarkMode = () => {
    const next = !darkMode;

    const saved = safeWriteString(THEME_KEY, next ? "dark" : "light");

    setDarkMode(next);

    if (!saved) {
      setMessage("Dark Mode changed, but the setting could not be saved.");
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <span className="eyebrow">CUSTOMIZE</span>

        <h1>Settings</h1>

        <p>Manage your StudyTools experience.</p>
      </div>

      <div className="settings-section">
        <h3>Appearance</h3>

        <div className="settings-row">
          <div className="settings-icon">🌙</div>

          <div className="settings-info">
            <strong>Dark Mode</strong>

            <span>Use a darker interface at night.</span>
          </div>

          <button
            className={`switch ${darkMode ? "on" : ""}`}
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            <span />
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>Backup & Restore</h3>

        <div className="settings-actions">
          <button
            className="settings-action"
            onClick={exportData}
            disabled={busy}
          >
            <span>📤</span>

            <div>
              <strong>Export Backup</strong>

              <small>Save notes and planner data</small>
            </div>
          </button>

          <label className={`settings-action ${busy ? "disabled" : ""}`}>
            <span>📥</span>

            <div>
              <strong>Import Backup</strong>

              <small>Restore from a JSON backup</small>
            </div>

            <input
              className="file-input"
              type="file"
              accept=".json,application/json"
              onChange={importData}
              disabled={busy}
            />
          </label>
        </div>
      </div>

      <div className="settings-section danger-section">
        <h3>Data Management</h3>

        <button className="danger-button" onClick={clearNotes}>
          🗑️ Clear Notes
        </button>

        <button className="danger-button" onClick={clearPlanner}>
          🗑️ Clear Planner
        </button>

        <button
          className="danger-button strong-danger"
          onClick={clearEverything}
        >
          ⚠️ Clear Everything
        </button>
      </div>

      {message && <div className="settings-message">{message}</div>}

      <div className="app-version">StudyTools · Version {APP_VERSION}</div>
    </div>
  );
}

/* =========================================================
   BOTTOM NAVIGATION
   ========================================================= */

function BottomNav({ page, setPage }) {
  const items = [
    {
      id: "home",
      icon: "⌂",
      label: "Home",
    },
    {
      id: "tools",
      icon: "▦",
      label: "Tools",
    },
    {
      id: "settings",
      icon: "⚙",
      label: "Settings",
    },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${page === item.id ? "active" : ""}`}
          onClick={() => setPage(item.id)}
        >
          <span>{item.icon}</span>

          <small>{item.label}</small>
        </button>
      ))}
    </nav>
  );
}

/* =========================================================
   MAIN APP
   ========================================================= */

function App() {
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState("home");

  const [activeTool, setActiveTool] = useState(null);

  const [darkMode, setDarkMode] = useState(safeReadTheme);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    safeWriteString(THEME_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  if (loading) {
    return <LoadingScreen />;
  }

  const renderTool = () => {
    const tool = tools.find((item) => item.id === activeTool);

    if (!tool) {
      return (
        <ToolPage title="Tools" icon="🧰" onBack={() => setPage("tools")}>
          <div className="empty-state">
            <span>🧰</span>

            <strong>Tool not found</strong>

            <p>Please choose another tool.</p>

            <button className="primary-button" onClick={() => setPage("tools")}>
              Back to Tools
            </button>
          </div>
        </ToolPage>
      );
    }

    let content = null;

    switch (activeTool) {
      case "calculator":
        content = <Calculator />;
        break;

      case "percentage":
        content = <Percentage />;
        break;

      case "gpa":
        content = <GPA />;
        break;

      case "converter":
        content = <Converter />;
        break;

      case "timer":
        content = <StudyTimer />;
        break;

      case "notes":
        content = <Notes />;
        break;

      case "planner":
        content = <StudyPlanner />;
        break;

      default:
        content = null;
    }

    return (
      <ToolPage
        title={tool.name}
        icon={tool.icon}
        onBack={() => setPage("tools")}
      >
        {content}
      </ToolPage>
    );
  };

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <main className="app-content">
        {page === "home" && (
          <Home setPage={setPage} setActiveTool={setActiveTool} />
        )}

        {page === "tools" && (
          <ToolsPage setPage={setPage} setActiveTool={setActiveTool} />
        )}

        {page === "settings" && (
          <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />
        )}

        {page === "tool" && renderTool()}
      </main>

      {page !== "tool" && <BottomNav page={page} setPage={setPage} />}
    </div>
  );
}

/* =========================================================
   EXPORT WITH ERROR PROTECTION
   ========================================================= */

export default function ProtectedApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
