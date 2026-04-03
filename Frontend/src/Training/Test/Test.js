import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for making HTTP requests
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Test.css"; // Updated CSS for new features
import { useLocation } from "react-router-dom";

// Custom Components (replacing imports)
const Button = ({ onClick, children, disabled, style }) => (
  <button
    className="btn"
    onClick={!disabled ? onClick : undefined}
    disabled={disabled}
    style={style}
  >
    {children}
  </button>
);

const Textarea = ({ value, onChange }) => (
  <textarea
    className="textarea"
    value={value}
    onChange={onChange}
    placeholder="Write your answer here"
  />
);

// Add at the top of your Test.js
const testLevels = {
  1: [
    {
      key: "beginner",
      icon: "📘",
      title: "Beginner",
      description: "Ubuntu basics, ROS2 setup, and core concepts (Nodes & Topics)",
      mcqs: 15,
    },
    {
      key: "intermediate",
      icon: "📙",
      title: "Intermediate",
      description: "Publisher/Subscriber architecture and essential CLI commands",
      mcqs: 15,
    },
    {
      key: "advanced",
      icon: "🎓",
      title: "Advanced",
      description: "Turtlesim hands-on, topic echoing, and cmd_vel mechanics",
      mcqs: 15,
    },
  ],
  2: [
    {
      key: "beginner",
      icon: "📘",
      title: "Beginner",
      description: "Understanding URDF robot structure, links, joints, and basic TF concepts",
      mcqs: 15,
    },
    {
      key: "intermediate",
      icon: "📙",
      title: "Intermediate",
      description: "Dive into frame hierarchy and data visualization using RViz",
      mcqs: 15,
    },
    {
      key: "advanced",
      icon: "🎓",
      title: "Advanced",
      description: "Gazebo 3D simulation, environment physics, and commanding simulated robots",
      mcqs: 15,
    },
  ],
  3: [
    {
      key: "beginner",
      icon: "📘",
      title: "Beginner",
      description: "Basic SLAM concepts, mapping vs. localization, and core topics (/map, /scan)",
      mcqs: 15,
    },
    {
      key: "intermediate",
      icon: "📙",
      title: "Intermediate",
      description: "Intermediate Nav2 architecture, goal flow, planners, and controllers",
      mcqs: 15,
    },
    {
      key: "advanced",
      icon: "🎓",
      title: "Advanced",
      description:
        "Advanced TortoiseBot simulation, rqt_graph debugging, and remote SSH access",
      mcqs: 15,
      extra: "Advanced Concepts",
    },
  ],
};

const RadioGroup = ({ value, onValueChange, children }) => (
  <div className="radio-group">
    {React.Children.map(children, (child) =>
      React.cloneElement(child, {
        onChange: onValueChange,
        checked: value === child.props.value,
      })
    )}
  </div>
);

const RadioGroupItem = ({ value, onChange, checked, children }) => (
  <label className="radio-group-item">
    <input
      type="radio"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      checked={checked}
    />
    {children}
  </label>
);

// Main Component
export default function Test() {
  const location = useLocation();
  const navigate = useNavigate();
  const [skillLevel, setSkillLevel] = useState(null);
  const [section, setSection] = useState("mcq");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState([]);
  const [theoryAnswers, setTheoryAnswers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [recognition, setRecognition] = useState(null);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [questions, setQuestions] = useState({ mcq: [], theory: [] });
  const [loading, setLoading] = useState(true);

  const [cheatWarnings, setCheatWarnings] = useState(0);
  const MAX_WARNINGS = 3;

  // Extract day number from URL, e.g., "/courses/5g-training/day2/test" => 2
  const dayFromPath = Number(location.pathname.match(/day(\d+)/)[1]) || 1;

  const [day, setDay] = useState(dayFromPath);

  useEffect(() => {
    if (questions.theory.length > 0 && theoryAnswers.length === 0) {
      // Only initialize once, keep user answers on return
      setTheoryAnswers(Array(questions.theory.length).fill(""));
    }
  }, [questions.theory, theoryAnswers.length]);

  // Fetch questions from Flask backend
  useEffect(() => {
    if (!skillLevel) return;
    const fetchQuestions = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/generate-questions",
          {
            day: day,
            level: skillLevel,
          }
        );
        const normalized = normalizeQuestions(response.data);
        setQuestions(normalized);
        setMcqAnswers(Array(normalized.mcq.length).fill(undefined));
        setTheoryAnswers(Array(normalized.theory.length).fill(""));
        setLoading(false); // Set loading to false when data is fetched
      } catch (error) {
        console.error("Error fetching questions:", error);
        setLoading(false); // Also stop loading in case of error
      }
    };

    fetchQuestions(); // Fetch questions when skill level or component mounts
  }, [day, skillLevel]); // Re-fetch when skill level changes

  const currentQuestions = section === "mcq" ? questions.mcq : questions.theory;
  // const totalQuestions = questions.mcq.length + questions.theory.length;

  // CHANGE 1: helper function
  const normalizeQuestions = (data) => {
    const mcq = (data?.mcqs || []).map((q) => ({
      question: q.question,
      options: Object.values(q.options || {}),
      correctAnswer:
        typeof q.correct === "string"
          ? q.correct.charCodeAt(0) - 65
          : q.correct,
    }));

    const theory = (data?.theory || []).map((t) => ({
      question: t.question,
      answer: t.answer || "No answer provided", // <-- store correct answer
      expectedKeywords: t.expectedKeywords || t.keyPoints || [],
    }));

    return { mcq, theory };
  };

  // CHANGE 2: helper function
  const allQuestionsAnswered = () => {
    const mcqComplete =
      mcqAnswers.length === questions.mcq.length &&
      mcqAnswers.every((ans) => ans !== undefined && ans !== null);

    const theoryComplete =
      theoryAnswers.length === questions.theory.length &&
      theoryAnswers.every((ans) => ans && ans.trim().length > 0);

    return mcqComplete && theoryComplete;
  };

  // Handle MCQ answer selection
  const handleMcqAnswer = (answerIndex) => {
    const newAnswers = [...mcqAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setMcqAnswers(newAnswers);
  };

  // Handle Theory answer changes
  const handleTheoryAnswer = useCallback(
    (value) => {
      const newAnswers = [...theoryAnswers];
      newAnswers[currentQuestion] = value;
      setTheoryAnswers(newAnswers);
    },
    [currentQuestion, theoryAnswers]
  );

  // Handle recording toggle for speech-to-text
  const toggleRecording = () => {
    if (!recognition) {
      alert(
        "Voice recognition is only supported in Chrome, Edge, and Safari browsers."
      );
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setShowVoiceHelp(false);
      recognition.start();
      setIsRecording(true);
    }
  };

  // Handle next question or section
  const handleNext = () => {
    if (section === "mcq" && currentQuestion < questions.mcq.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (section === "mcq") {
      setSection("theory");
      setCurrentQuestion(0);
    } else if (
      section === "theory" &&
      currentQuestion < questions.theory.length - 1
    ) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Handle previous question or section
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (section === "theory") {
      setSection("mcq");
      setCurrentQuestion(questions.mcq.length - 1);
    }
  };

  // Handle test submission and scoring
  const submitTestInternal = useCallback(async () => {
    /* ---------- MCQ SCORE (AVERAGED) ---------- */
    const totalMcqs = questions.mcq.length;
    let correctMcqs = 0;

    mcqAnswers.forEach((answer, idx) => {
      if (answer === questions.mcq[idx]?.correctAnswer) {
        correctMcqs++;
      }
    });

    const mcqScore = totalMcqs > 0 ? (correctMcqs / totalMcqs) * 100 : 0;

    /* ---------- THEORY SCORE (AVERAGED) ---------- */
    const totalTheory = questions.theory.length;
    let theoryTotal = 0;

    theoryAnswers.forEach((answer, idx) => {
      const keywords = questions.theory[idx]?.expectedKeywords || [];
      if (!answer || keywords.length === 0) return;

      const matchedKeywords = keywords.filter((kw) =>
        answer.toLowerCase().includes(kw.toLowerCase())
      );

      const questionScore = (matchedKeywords.length / keywords.length) * 100;

      theoryTotal += questionScore;
    });

    const theoryScore = totalTheory > 0 ? theoryTotal / totalTheory : 0;

    /* ---------- FINAL WEIGHTED SCORE ---------- */
    const finalScore = Math.round(mcqScore * 0.6 + theoryScore * 0.4);
    // Send update to backend using JWT token. Include a `questions` payload
    // so the backend can store MCQ metadata and move long theory answers
    // into a separate collection for review.
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Missing auth token");

      // Build questions payload: MCQs + Theory
      const payloadQuestions = [];
      // MCQs
      questions.mcq.forEach((q, idx) => {
        payloadQuestions.push({
          question: q.question,
          type: "mcq",
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          selectedAnswer: mcqAnswers[idx],
          difficulty: q.difficulty || skillLevel || null,
        });
      });

      // Theory
      questions.theory.forEach((t, idx) => {
        payloadQuestions.push({
          question: t.question,
          type: "theory",
          expectedKeywords: t.expectedKeywords || [],
          selectedAnswer: theoryAnswers[idx] || "",
          difficulty: t.difficulty || skillLevel || null,
        });
      });

      const res = await fetch("http://localhost:5000/progress/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          day,
          score: finalScore,
          completed: true,
          level: skillLevel,
          questions: payloadQuestions,
        }),
      });

      const respJson = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("Progress update failed", res.status, respJson);
      } else if (respJson && respJson.success === false) {
        console.error("Progress update response indicated failure", respJson);
      } else {
        // Broadcast update so other parts of the UI can refresh
        window.dispatchEvent(new Event("progressUpdate"));
      }
    } catch (err) {
      console.error("Failed to send progress update", err);
    }

    // Then update local state
    setScore(finalScore);
    setTestCompleted(true);
  }, [questions.mcq, questions.theory, mcqAnswers, theoryAnswers, day, skillLevel]);

  const handleSubmit = () => {
    submitTestInternal();
  };

  const autoSubmitTest = useCallback(() => {
    alert("🚫 Test auto-submitted due to repeated rule violations.");
    submitTestInternal();
  }, [submitTestInternal]);

  // Prevet COPY PASTE
  useEffect(() => {
    const blockContextMenu = (e) => e.preventDefault();
    const blockCopy = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "v", "x", "a"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", blockCopy);
    document.addEventListener("copy", (e) => e.preventDefault());
    document.addEventListener("cut", (e) => e.preventDefault());
    document.addEventListener("paste", (e) => {
      if (e.target.tagName !== "TEXTAREA" && e.target.tagName !== "INPUT") {
        e.preventDefault();
      }
    });

    document.addEventListener("contextmenu", blockContextMenu);

    return () => {
      document.removeEventListener("keydown", blockCopy);
      document.removeEventListener("copy", (e) => e.preventDefault());
      document.removeEventListener("cut", (e) => e.preventDefault());
      document.removeEventListener("paste", (e) => e.preventDefault());
      document.removeEventListener("contextmenu", blockContextMenu);
    };
  }, []);

  const lastWarningTime = useRef(0);
  const WARNING_COOLDOWN_MS = 5000; // 5 seconds cooldown

  const registerCheatAttempt = useCallback(
    (reason) => {
      const now = Date.now();
      if (now - lastWarningTime.current < WARNING_COOLDOWN_MS) {
        // Ignore if last warning was less than cooldown time ago
        return;
      }
      lastWarningTime.current = now;

      setCheatWarnings((prev) => {
        const next = prev + 1;
        alert(
          `⚠️ Warning ${next}/${MAX_WARNINGS}\n\n` +
          `${reason}.\n\n` +
          (next >= MAX_WARNINGS
            ? "Test will be auto-submitted."
            : "Further violations will auto-submit your test.")
        );

        if (next >= MAX_WARNINGS) {
          autoSubmitTest();
        }

        return next;
      });
    },
    [autoSubmitTest]
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        registerCheatAttempt("Tab switch detected");
      }
    };

    const handleBlur = () => {
      registerCheatAttempt("Window lost focus");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [registerCheatAttempt]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        registerCheatAttempt("Tab switch detected");
      }
    };

    const handleBlur = () => {
      registerCheatAttempt("Window lost focus");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [registerCheatAttempt]);

  // Handle Speech Recognition setup and functionality
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = "en-US";

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      // Use functional update to avoid stale closure
      setTheoryAnswers((prevAnswers) => {
        const updated = [...prevAnswers];
        updated[currentQuestion] =
          (updated[currentQuestion] || "") +
          ((updated[currentQuestion] ? " " : "") + transcript);
        return updated;
      });

      setIsRecording(false);
    };

    recognitionInstance.onerror = () => {
      setIsRecording(false);
      setShowVoiceHelp(true);
    };

    recognitionInstance.onend = () => {
      setIsRecording(false);
    };

    setRecognition(recognitionInstance);
  }, [currentQuestion]); // only run once on mount

  // Learning Degree function based on score
  const getLearningDegree = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Improvement";
  };

  // If the test is completed, show results
  if (testCompleted) {
    // Combine MCQ + Theory questions for review

    return (
      <div
        className="test-page-container"
        style={{
          maxWidth: 700,
          margin: "40px auto",
          padding: 40,
          background: "#161616",
          borderRadius: 14,
          boxShadow: "0 0 40px rgba(0, 0, 0, 0.6)",
          textAlign: "center",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 50, color: "#f5a623", marginBottom: 10 }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <h2>Test Completed!</h2>
          <p>You have successfully completed the Day {day} assessment</p>
          <p>Level: {skillLevel}</p>
        </div>

        <div
          style={{
            background: "#1f1f1f",
            padding: 30,
            borderRadius: 12,
            marginBottom: 40,
          }}
        >
          <h1 style={{ fontSize: 48, marginBottom: 10 }}>{score}%</h1>
          <div>Your Score</div>
          <div
            className="progress-bar"
            style={{
              marginTop: 20,
              height: 12,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              className="progress-fill"
              style={{
                width: `${score}%`,
                height: "100%",
                background: "linear-gradient(90deg, #2979ff, #8e2de2)",
                borderRadius: 10,
                transition: "width 0.5s ease",
              }}
            ></div>
          </div>
          <div style={{ marginTop: 10, fontSize: 14, color: "#aaa" }}>
            Learning Degree: {getLearningDegree(score)}
          </div>
        </div>

        <div style={{ textAlign: "left" }}>
          <h3>Answer Review</h3>
          <h4>Multiple Choice Questions</h4>
          {questions.mcq.map((q, idx) => {
            const userAnswer = mcqAnswers[idx];

            // Show options with colors and icons like your screenshot
            return (
              <div
                key={`mcq-${idx}`}
                style={{
                  background: "#1f1f1f",
                  padding: 15,
                  borderRadius: 8,
                  marginBottom: 20,
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: 8 }}>
                  Question {idx + 1}
                </div>
                <div style={{ marginBottom: 10 }}>{q.question}</div>

                {q.options.map((option, oIdx) => {
                  const isUserChoice = oIdx === userAnswer;
                  const isAnswer = oIdx === q.correctAnswer;
                  let bgColor = "#2c2c2c";
                  let icon = null;

                  if (isAnswer) {
                    bgColor = "#0a522f"; // green background
                    icon = <span style={{ marginLeft: 8 }}>✓ Correct</span>;
                  }
                  if (isUserChoice && !isAnswer) {
                    bgColor = "#4a1212"; // red background for wrong choice
                    icon = <span style={{ marginLeft: 8 }}>✗ Wrong</span>;
                  }

                  return (
                    <div
                      key={`option-${oIdx}`}
                      style={{
                        backgroundColor: bgColor,
                        color: "white",
                        padding: "10px 15px",
                        borderRadius: 6,
                        marginBottom: 6,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {option}
                      {icon && (
                        <strong style={{ marginLeft: 8 }}>{icon}</strong>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          <h4>Theory Questions</h4>
          {questions.theory?.map((t, idx) => (
            <div
              key={`theory-${idx}`}
              style={{
                background: "#1f1f1f",
                padding: 15,
                borderRadius: 8,
                marginBottom: 20,
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: 8 }}>
                Question {questions.mcq?.length + idx + 1 || idx + 1}
              </div>
              <div style={{ marginBottom: 10 }}>{t.question}</div>

              {/* User Answer */}
              <div style={{ marginBottom: 6, fontWeight: "bold" }}>
                Your Answer:
              </div>
              <div
                style={{
                  background: "#2c2c2c",
                  borderRadius: 8,
                  padding: 12,
                  whiteSpace: "pre-wrap",
                  color: "white",
                  marginBottom: 10,
                }}
              >
                {theoryAnswers?.[idx] || <i>No answer provided</i>}
              </div>

              {/* Correct Answer */}
              <div
                style={{
                  marginBottom: 6,
                  fontWeight: "bold",
                  color: "#4caf50",
                }}
              >
                Correct Answer:
              </div>
              <div
                style={{
                  background: "#0a522f",
                  borderRadius: 8,
                  padding: 12,
                  whiteSpace: "pre-wrap",
                  color: "white",
                  marginBottom: 10,
                }}
              >
                {t.answer?.trim() || "No answer provided"}
              </div>

              {/* Expected Keywords */}
              <div style={{ fontWeight: "bold", color: "#f5a623" }}>
                Expected Keywords:
              </div>
              <ul style={{ color: "#aaa", marginTop: 4 }}>
                {t.expectedKeywords?.length > 0 ? (
                  t.expectedKeywords.map((kw, kidx) => <li key={kidx}>{kw}</li>)
                ) : (
                  <li>None</li>
                )}
              </ul>
            </div>
          ))}
        </div>
        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            marginTop: 40,
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn"
            onClick={() => {
              setDay(day + 1); // move to next day
              setSkillLevel(null); // reset level selection for new day
              setQuestions({ mcq: [], theory: [] }); // clear previous questions
              navigate("/courses/5g-training");
            }}
            style={{
              background: "linear-gradient(90deg, #2979ff, #8e2de2)",
              color: "white",
              padding: "12px 24px",
              borderRadius: 8,
              fontSize: 16,
            }}
          >
            Continue to Next Day
          </button>

          <button
            className="btn"
            onClick={() => navigate("/dashboard/student")}
            style={{
              background: "#2c2c2c",
              color: "white",
              padding: "12px 24px",
              borderRadius: 8,
              fontSize: 16,
              border: "1px solid #444",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!skillLevel) {
    const levels = testLevels[day]; // day = 1,2,... (passed as prop or from route)
    return (
      <div className="test-page-container no-select">
        <h2 style={{ marginTop: 40 }}>Choose Your Test Level</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            marginTop: 40,
          }}
        >
          {levels.map((lvl) => (
            <div
              key={lvl.key}
              className="test-option"
              onClick={() => {
                sessionStorage.setItem(`day${day}Level`, lvl.key);
                setSkillLevel(lvl.key);
              }}
            >
              <div className="test-icon">{lvl.icon}</div>
              <h2>{lvl.title}</h2>
              <p>{lvl.description}</p>
              <ul>
                <li>{lvl.mcqs} MCQs</li>
                <li>{lvl.extra}</li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <header className="hero-section">
          <div className="container">
            <nav className="nav">
              <div className="logo">LearnFlow</div>
            </nav>
          </div>
        </header>

        <div className="page-header">
          <h1>Loading Questions...</h1>
          <p className="page-subtitle">Please wait while we generate your questions</p>
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <i
            className="fas fa-spinner fa-spin"
            style={{ fontSize: 30, color: "#2979ff" }}
          ></i>
        </div>
      </div>
    );
  }

  if (!questions.mcq.length && !questions.theory.length) {
    return <div>No questions available. Please try again later.</div>;
  }

  return (
    <div className="test-page-container no-select">
      <header className="hero-section">
        <div className="container">
          <nav className="nav">
            <div className="logo">LearnFlow</div>
          </nav>
        </div>
      </header>

      {/* Test Heading & Progress outside container */}
      <div className="test-header">
        <div className="test-progress-section">
          {/* Dynamic section title */}
          <div className="test-progress-labels">
            <span>
              Day {day} Assessment - {skillLevel} Level -{" "}
              {section === "mcq" ? "Multiple Choice" : "Theory"}
            </span>
            <span>
              Questions{" "}
              {section === "mcq" ? currentQuestion + 1 : currentQuestion + 1} of{" "}
              {section === "mcq"
                ? questions.mcq.length
                : questions.theory.length}
            </span>
          </div>

          {/* Overall progress */}
          <div className="test-progress-bar">
            <div
              className="test-progress-fill"
              style={{
                width: `${((section === "mcq"
                  ? currentQuestion
                  : questions.mcq.length + currentQuestion + 1) /
                  15) *
                  100
                  }%`,
              }}
            ></div>
          </div>
          <div className="test-progress-labels">
            <span>
              Overall Progress:{" "}
              {section === "mcq"
                ? currentQuestion + 1
                : questions.mcq.length + currentQuestion + 1}{" "}
              of 15
            </span>
          </div>
        </div>
      </div>

      <div
        className="test-test-container"
        style={{
          maxWidth: 700,
          margin: "40px auto",
          padding: 40,
          background: "#161616",
          borderRadius: 14,
          boxShadow: "0 0 40px rgba(0, 0, 0, 0.6)",
          textAlign: "center",
        }}
      >
        {cheatWarnings > 0 && cheatWarnings < MAX_WARNINGS && (
          <div
            style={{
              background: "#4a1212",
              color: "#fff",
              padding: "10px",
              borderRadius: 6,
              marginBottom: 15,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            ⚠️ Warning {cheatWarnings}/{MAX_WARNINGS}: Do not switch tabs or
            apps.
          </div>
        )}

        <div className="test-question-wrapper">
          {section === "mcq" ? (
            <div style={{ textAlign: "left" }}>
              {currentQuestions[currentQuestion] && (
                <h2 className="test-question-title">
                  {currentQuestions[currentQuestion].question}
                </h2>
              )}
              <RadioGroup
                value={mcqAnswers[currentQuestion]?.toString()}
                onValueChange={(val) => handleMcqAnswer(Number.parseInt(val))}
              >
                {currentQuestions[currentQuestion]?.options?.map(
                  (option, idx) => (
                    <RadioGroupItem key={idx} value={idx.toString()}>
                      {option}
                    </RadioGroupItem>
                  )
                )}
              </RadioGroup>
            </div>
          ) : (
            <div style={{ textAlign: "left" }}>
              {currentQuestions[currentQuestion] && (
                <h2 className="test-question-title">
                  {currentQuestions[currentQuestion].question}
                </h2>
              )}
              <div className="theory-header">
                <span>Your answer:</span>
                {voiceSupported && (
                  <Button onClick={toggleRecording}>
                    {isRecording ? (
                      <>
                        <i
                          className="fas fa-microphone-slash"
                          style={{ color: "red", marginRight: "5px" }}
                        ></i>
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <i
                          className="fas fa-microphone"
                          style={{ marginRight: "5px" }}
                        ></i>
                        Start Recording
                      </>
                    )}
                  </Button>
                )}
              </div>

              <Textarea
                value={theoryAnswers[currentQuestion] || ""} // show existing answer or empty
                onChange={(e) => handleTheoryAnswer(e.target.value)}
              />
              {showVoiceHelp && <p>Please try speaking again.</p>}
            </div>
          )}
        </div>
      </div>
      {/* Navigation Buttons */}
      <div className="test-button">
        <Button onClick={handlePrevious}>
          <i className="fas fa-arrow-left"></i> &nbsp;Previous
        </Button>

        {/* Show Next Question / Next Section dynamically */}
        {section === "theory" &&
          currentQuestion === questions.theory.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered()}
            style={{
              opacity: allQuestionsAnswered() ? 1 : 0.5,
              cursor: allQuestionsAnswered() ? "pointer" : "not-allowed",
            }}
          >
            Submit Test &nbsp; <i className="fas fa-check"></i>
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {section === "mcq" ? "Next Question" : "Next Question"}
            &nbsp; <i className="fas fa-arrow-right"></i>
          </Button>
        )}
      </div>

      {/* Optional warning message */}
      {section === "theory" &&
        currentQuestion === questions.theory.length - 1 &&
        !allQuestionsAnswered() && (
          <p
            style={{
              marginTop: 10,
              textAlign: "center",
              color: "#f5a623",
              fontSize: 14,
            }}
          >
            Please answer all questions before submitting the test.
          </p>
        )}
    </div>
  );
}
