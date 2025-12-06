// src/pages/Terms.js
import React from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const Terms = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container max-w-4xl mx-auto py-5 px-4 flex-grow-1">
        <h1 className="h3 fw-bold mb-4">Terms of Service</h1>
        
        <div className="prose">
          <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="h4 fw-semibold mt-5 mb-3">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using TuneTogether, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
          </p>
          
          <h2 className="h4 fw-semibold mt-5 mb-3">2. User Accounts</h2>
          <p className="mb-4">
            You are responsible for:
          </p>
          <ul className="list-disc ps-5 mb-4">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized access</li>
          </ul>
          
          <h2 className="h4 fw-semibold mt-5 mb-3">3. User Content</h2>
          <p className="mb-4">
            You retain ownership of content you create and upload. By sharing content on TuneTogether, you grant us a license to:
          </p>
          <ul className="list-disc ps-5 mb-4">
            <li>Store and display your content on our platform</li>
            <li>Share it with users you collaborate with</li>
            <li>Create backups for service reliability</li>
          </ul>
          
          <h2 className="h4 fw-semibold mt-5 mb-3">4. Acceptable Use</h2>
          <p className="mb-4">
            You agree not to:
          </p>
          <ul className="list-disc ps-5 mb-4">
            <li>Upload copyrighted material without permission</li>
            <li>Harass or abuse other users</li>
            <li>Attempt to hack or disrupt our services</li>
            <li>Use the platform for illegal activities</li>
            <li>Impersonate others or create fake accounts</li>
          </ul>
          
          <h2 className="h4 fw-semibold mt-5 mb-3">5. Intellectual Property</h2>
          <p className="mb-4">
            TuneTogether and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
          
          <h2 className="h4 fw-semibold mt-5 mb-3">6. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account immediately, without prior notice, for violations of these Terms.
          </p>
          
          <h2 className="h4 fw-semibold mt-5 mb-3">7. Disclaimer</h2>
          <p className="mb-4">
            TuneTogether is provided "as is" without warranties of any kind, either express or implied. We do not guarantee uninterrupted or error-free service.
          </p>
          
          <h2 className="h4 fw-semibold mt-5 mb-3">8. Contact</h2>
          <p className="mb-4">
            For questions about these Terms, contact us at legal@tunetogether.com
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;