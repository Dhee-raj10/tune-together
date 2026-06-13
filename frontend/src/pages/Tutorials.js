// src/pages/Tutorials.js
import React from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const Tutorials = () => {
  const tutorialCategories = [
    {
      category: "Getting Started",
      icon: "bi-play-circle",
      tutorials: [
        { title: "Creating Your First Project", duration: "5 min", level: "Beginner" },
        { title: "Setting Up Your Profile", duration: "3 min", level: "Beginner" },
        { title: "Finding Collaborators", duration: "7 min", level: "Beginner" }
      ]
    },
    {
      category: "Collaboration",
      icon: "bi-people",
      tutorials: [
        { title: "Real-Time Collaboration Basics", duration: "10 min", level: "Intermediate" },
        { title: "Managing Collaboration Requests", duration: "5 min", level: "Beginner" },
        { title: "Advanced Collaboration Workflow", duration: "15 min", level: "Advanced" }
      ]
    },
    {
      category: "Music Production",
      icon: "bi-music-note-beamed",
      tutorials: [
        { title: "Uploading and Organizing Tracks", duration: "8 min", level: "Beginner" },
        { title: "Mixing Multiple Tracks", duration: "12 min", level: "Intermediate" },
        { title: "Using AI Music Suggestions", duration: "10 min", level: "Intermediate" }
      ]
    },
    {
      category: "Tips & Tricks",
      icon: "bi-lightbulb",
      tutorials: [
        { title: "Keyboard Shortcuts", duration: "4 min", level: "All Levels" },
        { title: "Optimizing Your Workflow", duration: "8 min", level: "Intermediate" },
        { title: "Best Practices for Remote Collaboration", duration: "10 min", level: "All Levels" }
      ]
    }
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container py-5 flex-grow-1">
        <div className="text-center mb-5">
          <h1 className="h3 fw-bold mb-3">Tutorials</h1>
          <p className="lead text-muted">
            Learn how to make the most of TuneTogether with our step-by-step guides
          </p>
        </div>

        {/* Featured Tutorial */}
        <Card className="mb-5 border-0 shadow-lg">
          <div className="row g-0">
            <div className="col-md-5">
              <div className="bg-primary d-flex align-items-center justify-content-center h-100" style={{ minHeight: '300px' }}>
                <i className="bi bi-play-circle text-white" style={{ fontSize: '5rem' }}></i>
              </div>
            </div>
            <div className="col-md-7">
              <Card.Body className="p-4">
                <span className="badge bg-warning text-dark mb-2">Featured</span>
                <h3 className="h4 fw-bold mb-3">Complete Beginner's Guide to TuneTogether</h3>
                <p className="text-muted mb-4">
                  Everything you need to know to get started with music collaboration on our platform. 
                  Learn how to create projects, find collaborators, and produce your first track together.
                </p>
                <div className="d-flex align-items-center gap-4 mb-3">
                  <span className="text-muted">
                    <i className="bi bi-clock me-2"></i>25 minutes
                  </span>
                  <span className="text-muted">
                    <i className="bi bi-bar-chart me-2"></i>Beginner
                  </span>
                  <span className="text-muted">
                    <i className="bi bi-eye me-2"></i>1.2K views
                  </span>
                </div>
                <Button variant="primary" size="lg">
                  <i className="bi bi-play-fill me-2"></i>
                  Watch Tutorial
                </Button>
              </Card.Body>
            </div>
          </div>
        </Card>

        {/* Tutorial Categories */}
        {tutorialCategories.map((category, index) => (
          <div key={index} className="mb-5">
            <div className="d-flex align-items-center mb-3">
              <i className={`bi ${category.icon} fs-4 text-primary me-2`}></i>
              <h3 className="h5 fw-bold mb-0">{category.category}</h3>
            </div>
            
            <div className="row g-3">
              {category.tutorials.map((tutorial, tutIndex) => (
                <div key={tutIndex} className="col-md-4">
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0">{tutorial.title}</h6>
                        <i className="bi bi-play-circle text-primary fs-4"></i>
                      </div>
                      <div className="d-flex gap-2 mt-3">
                        <span className="badge bg-light text-dark">
                          <i className="bi bi-clock me-1"></i>
                          {tutorial.duration}
                        </span>
                        <span className="badge bg-light text-dark">
                          {tutorial.level}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* CTA Section */}
        <Card className="mt-5 bg-dark text-white">
          <Card.Body className="text-center p-5">
            <h4 className="mb-3">Ready to start creating?</h4>
            <p className="mb-4">
              Put your new knowledge to use and create your first project
            </p>
            <Link to="/explore" className="btn btn-light btn-lg">
              <i className="bi bi-plus-circle me-2"></i>
              Create New Project
            </Link>
          </Card.Body>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Tutorials;