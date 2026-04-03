import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../Day.css"; // Updated CSS file

export default function Day1() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);

  // Load completion state from localStorage
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:5000/progress/progress", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) return;

        const data = await res.json();

        if (data.progress && data.progress["1"]) {
          setCompleted(data.progress["1"].completed === true);
        } else {
          setCompleted(false);
        }
      } catch (err) {
        console.error("Failed to fetch progress", err);
      }
    };

    fetchProgress();
  }, []);

  const handleComplete = () => {
    // Dispatch custom event so Training.js & Dashboard update immediately
    window.dispatchEvent(new Event("progressUpdate"));

    navigate("/courses/5g-training/day1/test");
  };

  const handleBackToCourse = () => {
    navigate("/courses/5g-training");
  };

  return (
    <div className="page-container">
      {/* Header / Navbar */}
      <div className="dashboard-header-wrapper">
        <header className="dashboard-header">
          <div className="dashboard-nav-container">
            <nav className="dashboard-nav">
              <div className="logo-wrap">
                {/* Ensure your logo image path is correct, matching Training.js */}
                <img src="/images/Logo.png" alt="RoboHub Logo" />
              </div>
              <div className="dashboard-auth-buttons">
                <button
                  className="button-secondary"
                  onClick={handleBackToCourse}
                >
                  <i className="fas fa-arrow-left"></i> Back To Course
                </button>
              </div>
            </nav>
          </div>
        </header>
      </div>

      <div className="page-header">
        <span className="page-label">Day 1</span>
        <h1>4G to 5G <span>Evolution</span> & <span>Architecture</span> </h1>
        <p className="page-subtitle">
          Learn about the transition from 4G to 5G and core concepts
        </p>
      </div>

      {/* Main Content */}
      <div className="main-container page-content">
        {/* Content Block 1 */}
        <div className="content-card">
          <div className="content-details">
            <h3>Ubuntu & ROS2 Setup</h3>
            <p>
              Mastering ROS2 begins with a solid foundation in Ubuntu Linux, the primary
              operating system for ROS development. Setting up ROS2 involves configuring
              your workspace, sourcing the environment, and understanding the core
              middleware that enables robotic hardware and software to communicate.
            </p>



            <h3>Core ROS2 Concepts</h3>
            <ul>
              <li>
                <strong>Nodes:</strong> Individual executable processes that perform
                specific computing tasks (e.g., reading a sensor, controlling a motor).
              </li>
              <li>
                <strong>Topics:</strong> Named channels or buses over which nodes
                exchange messages and data.
              </li>
              <li>
                <strong>Publisher / Subscriber:</strong> The primary communication
                model where a node broadcasts data (Publisher) to a topic, and other
                nodes listen to receive that data (Subscriber).
              </li>
            </ul>
            <h3>System Architecture</h3>
            <p>
              Unlike a monolithic system, ROS2 uses a distributed architecture. Nodes
              are decoupled and communicate asynchronously via topics, making the
              robotic system highly modular, scalable, and fault-tolerant.
            </p>
          </div>
        </div>

        {/* Content Block 2 */}
        <div className="content-card">
          <div className="content-details">
            <h3>Hands-on with Turtlesim</h3>
            <p>
              Turtlesim is a lightweight 2D simulator built specifically for learning ROS2.
              It provides a visual environment to practice starting nodes, mapping topics,
              and understanding how data flows between different parts of a robotic system
              by controlling a virtual turtle.
            </p>
            <h3>Essential CLI Commands</h3>
            <ul>
              <li>
                <strong>ros2 node list:</strong> Displays all currently running nodes
                in the active ROS2 graph.
              </li>
              <li>
                <strong>ros2 topic list:</strong> Shows all active topics currently
                available for publishing or subscribing.
              </li>
              <li>
                <strong>ros2 topic echo:</strong> Prints the real-time data being
                published to a specific topic straight to your terminal.
              </li>
            </ul>
            <h3>Understanding cmd_vel</h3>
            <p>
              The <code>cmd_vel</code> (command velocity) topic is a standard ROS2 interface
              used across most mobile robots. It uses geometry messages to send linear
              and angular velocity commands, telling the robot exactly how fast and in
              what direction to move.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="button-container">
          <button
            className="button button-primary"
            onClick={handleBackToCourse}
          >
            <i className="fas fa-arrow-left"></i> Back to Course
          </button>
          <button
            className="button button-secondary"
            onClick={() => {
              if (!completed) {
                handleComplete(); // Only allow navigation if not completed
              }
            }}
            disabled={completed} // properly disables the button
          >
            {completed ? "Assessment Completed" : "Take Assessment"}{" "}
            <i className="fas fa-check-circle"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
