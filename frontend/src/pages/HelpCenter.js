// src/pages/HelpCenter.js
import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Card, Accordion } from "react-bootstrap";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create my first project?",
          a: "Click 'Explore' in the navigation, then select your desired mode (Solo, Collaboration, or Learning). Follow the prompts to set up your project."
        },
        {
          q: "What instruments can I add to my profile?",
          a: "You can add any instrument you play. We have a pre-defined list including piano, guitar, drums, and more. You can also specify custom instruments."
        },
        {
          q: "How do I find collaborators?",
          a: "Navigate to 'Collaborators' in the top menu, then search by instrument, skill level, or other criteria. Send collaboration requests to musicians you'd like to work with."
        }
      ]
    },
    {
      category: "Projects & Collaboration",
      questions: [
        {
          q: "How do I invite someone to collaborate?",
          a: "Find musicians in the Collaborators section, click 'Send Request', fill in project details, and submit. They'll receive a notification to accept or decline."
        },
        {
          q: "Can I work on multiple projects at once?",
          a: "Yes! There's no limit to how many projects you can create or participate in simultaneously."
        },
        {
          q: "What file formats are supported for audio uploads?",
          a: "We support MP3, WAV, and OGG formats. Maximum file size is 50MB per track."
        }
      ]
    },
    {
      category: "Account & Settings",
      questions: [
        {
          q: "How do I change my password?",
          a: "Go to your Profile page, click 'Settings', and select 'Change Password'. You'll need to verify your current password before setting a new one."
        },
        {
          q: "Can I delete my account?",
          a: "Yes, but this action is permanent. Go to Profile > Settings > Delete Account. All your projects and data will be permanently removed."
        },
        {
          q: "How do I update my musician roles?",
          a: "Visit your Profile page and click 'Edit Roles'. Select all roles that describe you and save changes."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          q: "What browsers are supported?",
          a: "TuneTogether works best on the latest versions of Chrome, Firefox, Safari, and Edge."
        },
        {
          q: "Why isn't my audio playing?",
          a: "Make sure your browser allows audio playback. Check your device volume and ensure you're using a supported audio format."
        },
        {
          q: "I'm experiencing lag during collaboration. What should I do?",
          a: "Try closing other browser tabs, check your internet connection, and ensure you're using a wired connection if possible for the best real-time experience."
        }
      ]
    }
  ];

  const filteredFaqs = searchQuery
    ? faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
          item =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqs;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container py-5 flex-grow-1">
        <h1 className="h3 fw-bold mb-4">Help Center</h1>
        <p className="lead text-muted mb-5">
          Find answers to common questions and get support
        </p>

        {/* Search Bar */}
        <div className="mb-5">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick Links */}
        <div className="row g-3 mb-5">
          <div className="col-md-3">
            <Card className="text-center p-3 h-100 border-primary">
              <Card.Body>
                <i className="bi bi-book display-6 text-primary"></i>
                <h6 className="mt-3">Getting Started Guide</h6>
                <p className="small text-muted mb-0">New to TuneTogether?</p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-3">
            <Card className="text-center p-3 h-100 border-success">
              <Card.Body>
                <i className="bi bi-chat-dots display-6 text-success"></i>
                <h6 className="mt-3">Contact Support</h6>
                <p className="small text-muted mb-0">Get personalized help</p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-3">
            <Card className="text-center p-3 h-100 border-info">
              <Card.Body>
                <i className="bi bi-youtube display-6 text-info"></i>
                <h6 className="mt-3">Video Tutorials</h6>
                <p className="small text-muted mb-0">Learn by watching</p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-3">
            <Card className="text-center p-3 h-100 border-warning">
              <Card.Body>
                <i className="bi bi-people display-6 text-warning"></i>
                <h6 className="mt-3">Community Forum</h6>
                <p className="small text-muted mb-0">Connect with others</p>
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* FAQs */}
        <h3 className="h5 fw-bold mb-4">Frequently Asked Questions</h3>
        {filteredFaqs.length === 0 ? (
          <div className="alert alert-info">
            No results found for "{searchQuery}". Try a different search term.
          </div>
        ) : (
          filteredFaqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-4">
              <h4 className="h6 fw-semibold mb-3 text-primary">{category.category}</h4>
              <Accordion>
                {category.questions.map((item, itemIndex) => (
                  <Accordion.Item key={itemIndex} eventKey={`${categoryIndex}-${itemIndex}`}>
                    <Accordion.Header>{item.q}</Accordion.Header>
                    <Accordion.Body>{item.a}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          ))
        )}

        {/* Contact Section */}
        <Card className="mt-5 bg-light">
          <Card.Body className="text-center p-5">
            <h4 className="mb-3">Still need help?</h4>
            <p className="text-muted mb-4">
              Our support team is here to assist you
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button className="btn btn-primary">
                <i className="bi bi-envelope me-2"></i>
                Email Support
              </button>
              <button className="btn btn-outline-primary">
                <i className="bi bi-chat-left-text me-2"></i>
                Live Chat
              </button>
            </div>
          </Card.Body>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default HelpCenter;