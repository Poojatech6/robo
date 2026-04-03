import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Training.css";

export default function Training() {
  const navigate = useNavigate();

  // Initialize the progress state dynamically for 3 days
  const [progress, setProgress] = useState({
    dayCompleted: 0,
    totalDays: 3,
  });

  // Use token stored in sessionStorage (set at login)
  const fetchProgress = useCallback(async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      console.warn("token missing, redirecting to login");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/progress/progress", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        // Unauthorized - send user to login
        navigate("/login");
        return;
      }

      const data = await res.json();

      // Backend returns completedDays; update UI accordingly
      setProgress({
        dayCompleted: data.completedDays || 0,
        totalDays: 3,
      });
    } catch (err) {
      console.error("Failed to load progress", err);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Re-fetch when progress is updated elsewhere in the app
  useEffect(() => {
    const handler = () => fetchProgress();
    window.addEventListener("progressUpdate", handler);
    return () => window.removeEventListener("progressUpdate", handler);
  }, [fetchProgress]);

  // Function to handle day click: only navigate, do NOT mark complete
  const handleDayClick = (day) => {
    if (day <= progress.dayCompleted + 1) {
      navigate(`/courses/5g-training/day${day}`);
    }
  };

  return (
    <div className="training-page">
      {/* Navbar - matches Dashboard style */}
      <div className="dashboard-header-wrapper">
        <header className="dashboard-header">
          <div className="dashboard-nav-container">
            <nav className="dashboard-nav">
              <div className="logo-wrap">
                <img src="/images/Logo.png" alt="RoboHub Logo" />
              </div>
              <div className="dashboard-auth-buttons">
                <button
                  className="button-secondary"
                  onClick={() => navigate("/dashboard/student")}
                >
                  <i className="fas fa-arrow-left"></i> Dashboard
                </button>
              </div>
            </nav>
          </div>
        </header>
      </div>

      {/* Training Module Content */}
      <div className="training-container">
        <h1 className="training-title">ROS 2 <span>Training</span> </h1>
        <p className="training-subtitle">
          Complete each day to unlock the next module
        </p>

        <div className="progress-container">
          <div className="progress-bar-wrapper">
            <div
              className="progress-fill"
              style={{
                width: `${(progress.dayCompleted / progress.totalDays) * 100}%`,
              }}
            ></div>
          </div>
          <span className="progress-text">
            {Math.round((progress.dayCompleted / progress.totalDays) * 100)}%
            Complete
          </span>
        </div>

        {/* Days list */}
        <div className="days-list">
          {/* Day 1 */}
          <div
            className={`day-item ${progress.dayCompleted >= 1 ? "completed" : ""
              } ${progress.dayCompleted === 0 ? "clickable" : "locked"}`}
            onClick={() => handleDayClick(1)}
          >
            <div className="day-icon">
              {progress.dayCompleted >= 1 ? (
                <i className="fas fa-check-circle"></i>
              ) : (
                <div className="circle" />
              )}
            </div>
            <div className="day-info">
              <strong>Day 1: Foundation of ROS2: Core Architecture, Communication, and Basic Control</strong>
              <p>
                {progress.dayCompleted >= 1 ? "Completed" : "Ready to start"}
              </p>
            </div>
            {progress.dayCompleted < 1 && (
              <i className="fas fa-lock lock-icon"></i>
            )}
            {progress.dayCompleted === 0 && (
              <button
                className="start-day-btn"
                onClick={() => handleDayClick(1)}
              >
                Start Day
              </button>
            )}
            {progress.dayCompleted >= 1 && (
              <span className="completed-label"></span>
            )}
          </div>

          {/* Day 2 and 3 - locked or clickable */}
          {[2, 3].map((day) => (
            <div
              key={day}
              className={`day-item ${progress.dayCompleted >= day ? "completed" : ""
                } ${day === progress.dayCompleted + 1 ? "clickable" : "locked"}`}
              onClick={() =>
                day === progress.dayCompleted + 1 ? handleDayClick(day) : null
              }
            >
              <div className="day-icon">
                {progress.dayCompleted >= day ? (
                  <i className="fas fa-check-circle"></i>
                ) : (
                  <div className="circle" />
                )}
              </div>
              <div className="day-info">
                <strong>
                  {`Day ${day}: ${{
                    2: "Virtualizing the Robot: Transform Frames, URDF Modeling, and Simulation",
                    3: "Autonomy in Action: Mapping (SLAM), Navigation, and Remote Deployment"
                  }[day]
                    }`}
                </strong>
                <p>
                  {progress.dayCompleted >= day
                    ? "Completed"
                    : "Locked - Complete previous day first"}
                </p>
              </div>
              {day !== progress.dayCompleted + 1 && (
                <i className="fas fa-lock lock-icon"></i>
              )}
              {day === progress.dayCompleted + 1 && (
                <button
                  className="start-day-btn"
                  onClick={() => handleDayClick(day)}
                >
                  Start Day
                </button>
              )}
            </div>
          ))}

          {/* Course Score Card */}
          <div className="final-assessment">
            <h3>
              <i className="fas fa-trophy"></i>{" "}
              <span className="final-assessment-title">Course Score Card</span>
            </h3>
            <p className="final-assessment-desc">
              Complete all 3 days to unlock your final course score card
            </p>
            <button
              className={progress.dayCompleted === progress.totalDays ? "complete-attempted" : "complete-locked"}
              disabled={progress.dayCompleted < progress.totalDays}
              onClick={() => {
                if (progress.dayCompleted === progress.totalDays) {
                  // Navigate to your score card page or back to dashboard
                  navigate("/dashboard/student"); 
                }
              }}
              style={{
                cursor:
                  progress.dayCompleted === progress.totalDays
                    ? "pointer"
                    : "not-allowed",
                // Overriding the gray style dynamically if unlocked
                background: progress.dayCompleted === progress.totalDays ? "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)" : "",
                opacity: progress.dayCompleted === progress.totalDays ? "1" : "",
                boxShadow: progress.dayCompleted === progress.totalDays ? "0 4px 16px rgba(0, 87, 255, 0.3)" : ""
              }}
            >
              {progress.dayCompleted === progress.totalDays ? (
                <>
                  <i
                    className="fas fa-chart-bar finish-icon"
                    style={{ marginRight: "8px", color: "white" }}
                  ></i>
                  <span style={{ color: "white" }}>View Score Card</span>
                </>
              ) : (
                <>
                  <i
                    className="fas fa-lock finish-icon"
                    style={{ marginRight: "8px" }}
                  ></i>
                  Complete All 3 Days First ({progress.dayCompleted}/
                  {progress.totalDays} completed)
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}