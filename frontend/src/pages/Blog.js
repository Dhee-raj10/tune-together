// src/pages/Blog.js
import React from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Card } from "react-bootstrap";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Getting Started with TuneTogether",
      excerpt: "Learn how to create your first project and collaborate with musicians around the world.",
      date: "December 1, 2025",
      author: "Sarah Johnson",
      image: "https://placehold.co/400x250"
    },
    {
      id: 2,
      title: "5 Tips for Better Music Collaboration",
      excerpt: "Discover best practices for working with other musicians in real-time.",
      date: "November 28, 2025",
      author: "Mike Chen",
      image: "https://placehold.co/400x250"
    },
    {
      id: 3,
      title: "AI-Assisted Music Creation: The Future is Here",
      excerpt: "Explore how AI can enhance your creative process without replacing your artistic vision.",
      date: "November 25, 2025",
      author: "Emily Rodriguez",
      image: "https://placehold.co/400x250"
    },
    {
      id: 4,
      title: "Building Your Musical Network",
      excerpt: "How to find and connect with the right collaborators for your projects.",
      date: "November 20, 2025",
      author: "David Park",
      image: "https://placehold.co/400x250"
    }
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container py-5 flex-grow-1">
        <h1 className="h3 fw-bold mb-4">Blog</h1>
        <p className="lead text-muted mb-5">
          Insights, tips, and stories from the TuneTogether community
        </p>

        <div className="row g-4">
          {blogPosts.map(post => (
            <div key={post.id} className="col-md-6 col-lg-3">
              <Card className="h-100 shadow-sm">
                <Card.Img variant="top" src={post.image} alt={post.title} />
                <Card.Body>
                  <Card.Title className="h6">{post.title}</Card.Title>
                  <Card.Text className="text-muted small">
                    {post.excerpt}
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">{post.date}</small>
                    <button className="btn btn-sm btn-outline-primary">Read More</button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>

        <div className="alert alert-info mt-5">
          <h5 className="alert-heading">Want to contribute?</h5>
          <p className="mb-0">
            We're always looking for guest writers! If you have a story to share about your music journey, 
            contact us at dheerajreddyalugubelli@gmail.com
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;