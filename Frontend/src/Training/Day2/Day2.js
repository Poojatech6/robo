import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../Day.css";

export default function Day2() {
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
        if (data.progress && data.progress["2"]) {
          setCompleted(data.progress["2"].completed === true);
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

    navigate("/courses/5g-training/day2/test");
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
        <span className="page-label">Day 2</span>
        <h1>Robot Structure, <span>TF</span> & <span>Simulation</span></h1>
        <p className="page-subtitle">
          Understand frame hierarchy, URDF modeling, and physics simulation
        </p>
      </div>

      {/* Main Content */}
      <div className="main-container page-content">
        {/* Content Block 1 */}
        <div className="content-card">
          <div className="content-details">
            <h3>Robot Structure & Transform Frames (TF)</h3>
            <p>
              Building upon basic ROS2 communication, we now introduce physical and spatial awareness. The TF (Transform) system is a core ROS2 concept used to keep track of multiple coordinate frames over time, calculating where different parts of the robot are relative to each other and the world.
            </p>
            
            

            <h3>Understanding Frame Hierarchy</h3>
            <ul>
              <li>
                <strong>map:</strong> The fixed, global coordinate frame of the environment.
              </li>
              <li>
                <strong>odom (Odometry):</strong> A local coordinate frame representing the robot's starting position, subject to sensor drift over time as the robot moves.
              </li>
              <li>
                <strong>base_link:</strong> The main reference point representing the physical center or chassis of the robot.
              </li>
              <li>
                <strong>sensors:</strong> Frames attached to the <code>base_link</code> representing exactly where hardware (like a LiDAR scanner) is mounted.
              </li>
            </ul>
            <h3>URDF (Unified Robot Description Format)</h3>
            <p>
              URDF is an XML format used to define the physical structure of a robot so it can be simulated and visualized. It consists of:
            </p>
            <ul>
              <li>
                <strong>Links:</strong> The rigid physical parts of the robot (e.g., wheels, chassis, camera mount).
              </li>
              <li>
                <strong>Joints:</strong> The dynamic connections between links that dictate how they move relative to each other (e.g., continuous, revolute, or fixed).
              </li>
            </ul>
          </div>
        </div>

        {/* Content Block 2 */}
        <div className="content-card">
          <div className="content-details">
            <h3>Visualization in RViz</h3>
            <p>
              RViz is a powerful 3D visualization tool for the ROS framework. It does not simulate physics; instead, it visually represents the data streaming over topics to show you exactly what the robot "sees" and "thinks".
            </p>

            

            <ul>
              <li>
                <strong>RobotModel:</strong> Renders the visual and collision geometry of the robot based directly on its URDF file.
              </li>
              <li>
                <strong>LaserScan (/scan):</strong> Visualizes 2D LiDAR data as points or lines, indicating obstacles currently detected by the robot's sensors.
              </li>
            </ul>

            <h3>Introduction to Gazebo Simulation</h3>
            <p>
              Gazebo is a robust 3D physics simulator. Unlike RViz, Gazebo creates a virtual world where gravity, friction, momentum, and collisions act upon your robot model just like they would in reality.
            </p>

            

            <ul>
              <li>
                <strong>Running in Simulation:</strong> The process of spawning your URDF robot model into a Gazebo world and commanding it via topics like <code>cmd_vel</code>.
              </li>
              <li>
                <strong>Environment & Physics:</strong> Understanding how simulated sensors interact with virtual walls, lighting, obstacles, and physical constraints.
              </li>
            </ul>
          </div>
        </div>

        {/* Buttons (Preserved from original code) */}
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
              if (!completed) handleComplete();
            }}
            disabled={completed}
          >
            {completed ? "Assessment Completed" : "Take Assessment"}{" "}
            <i className="fas fa-check-circle"></i>
          </button>
        </div>
      </div>
    </div>
  );
}