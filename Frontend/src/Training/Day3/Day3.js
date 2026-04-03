import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import '../Day.css';

export default function Day3() {
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
        if (data.progress && data.progress["3"]) {
          setCompleted(data.progress["3"].completed === true);
        }
      } catch (err) {
        console.error("Failed to fetch progress", err);
      }
    };

    fetchProgress();
  }, []);

  const handleComplete = () => {
    // Dispatch event to update progress in Dashboard/Training
    window.dispatchEvent(new Event("progressUpdate"));

    navigate("/courses/5g-training/day3/test");
  };

  const handleBackToCourse = () => {
    navigate("/courses/5g-training");
  };

  return (
    <div className="page-container">
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
        <span className="page-label">Day 3</span>
        <h1>SLAM, <span>Navigation</span> & <span>TortoiseBot</span></h1>
        <p className="page-subtitle">
          Master environment mapping, autonomous navigation, and remote robot control
        </p>
      </div>

      {/* Main Content */}
      <div className="main-container page-content">
        {/* Content Block 1 */}
        <div className="content-card">
          <h2>Learning Content</h2>
          <div className="content-details">
            <h3>Simultaneous Localization and Mapping (SLAM)</h3>
            <p>
              SLAM allows a robot to build a map of an unknown environment while simultaneously keeping track of its own location within it.
            </p>



            <ul>
              <li>
                <strong>Mapping + Localization:</strong> Solving the "chicken-and-egg" problem of navigating through unknown spaces.
              </li>
              <li>
                <strong>/map topic:</strong> Publishes the generated Occupancy Grid representing walls, obstacles, and free space.
              </li>
              <li>
                <strong>/scan topic:</strong> Provides the raw LiDAR point cloud data used to calculate distances to the environment.
              </li>
            </ul>

            <h3>Navigation (Nav2)</h3>
            <p>
              Nav2 is the standard navigation framework in ROS2, enabling a robot to autonomously move from a starting position to a target goal safely.
            </p>



            <ul>
              <li>
                <strong>Basic Flow:</strong> Goal → Planner → Controller → <code>cmd_vel</code>
              </li>
              <li>
                <strong>Planner:</strong> Calculates the global, optimal path from start to finish based on the static map.
              </li>
              <li>
                <strong>Controller:</strong> Executes local movements, avoiding dynamic obstacles in real-time to follow the path.
              </li>
              <li>
                <strong>Recovery:</strong> Behaviors triggered when the robot gets stuck (e.g., spinning, backing up, clearing costmaps).
              </li>
            </ul>

            <h3>TortoiseBot, Tools & Remote Access</h3>
            <p>
              Putting it all together involves running the TortoiseBot simulation and using powerful ROS2 tools to debug and control the system.
            </p>



            <ul>
              <li>
                <strong>Simulation & Teleop:</strong> Building the workspace, launching Gazebo via launch files, and controlling the robot manually using keyboard teleoperation.
              </li>
              <li>
                <strong>RViz Visualization:</strong> Viewing the live map, real-time sensor data, and the robot's estimated position.
              </li>
              <li>
                <strong>rqt_graph:</strong> A visual GUI tool that maps out active nodes to show exactly how data is flowing between topics.
              </li>
              <li>
                <strong>SSH Concept:</strong> Using Secure Shell for remotely accessing and commanding the physical robot's onboard computer.
              </li>
            </ul>
          </div>
        </div>

        {/* Buttons */}
        <div className="button-container">
          <button className="button button-primary" onClick={handleBackToCourse}>
            <i className="fas fa-arrow-left"></i> Back to Course
          </button>
          <button
            className="button button-secondary"
            onClick={() => { if (!completed) handleComplete(); }}
            disabled={completed}
          >
            {completed ? "Assessment Completed" : "Take Assessment"} <i className="fas fa-check-circle"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
