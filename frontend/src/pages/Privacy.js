// src/pages/Privacy.js
import React from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const Privacy = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container max-w-4xl mx-auto py-5 px-4 flex-grow-1">
        <h1 className="h3 fw-bold mb-4">Privacy Policy</h1>
        
        <div className="prose">
          <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="h4 fw-semibold mt-5 mb-3">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly to us, including your username, email address, and profile information when you create an account on TuneTogether.
          </p>
          
          <h2 className="h4 fw-semibold mt-5 mb-3">2. How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc ps-5 mb-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Process your transactions and send related information</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Connect you with other musicians for collaboration</li>
          </ul>
          
          <h2 className="h4 fw-semibold mt-5 mb-3">3. Information Sharing</h2>
          <p className="mb-4">
            We do not share your personal information with third parties except as described in this policy. We may share information with:
          </p>
          <ul className="list-disc ps-5 mb-4">
            <li>Other users when you choose to collaborate or share your work</li>
            <li>Service providers who assist in our operations</li>
            <li>Law enforcement when required by law</li>
          </ul>
          
          <h2 className="h4 fw-semibold mt-5 mb-3">4. Data Security</h2>
          <p className="mb-4">
            We take reasonable measures to protect your information from unauthorized access, use, or disclosure. However, no internet transmission is completely secure.
          </p>
          
          <h2 className="h4 fw-semibold mt-5 mb-3">5. Your Rights</h2>
          <p className="mb-4">
            You have the right to:
          </p>
          <ul className="list-disc ps-5 mb-4">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
          
          <h2 className="h4 fw-semibold mt-5 mb-3">6. Contact Us</h2>
          <p className="mb-4">
            If you have questions about this Privacy Policy, please contact us at privacy@tunetogether.com
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;