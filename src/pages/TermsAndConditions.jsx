import React from 'react';
import Header from '../components/Header/Header';
import { FileText } from 'lucide-react';
import './TermsAndConditions.css';

const TermsAndConditions = () => (
  <div className="legal-bg">
    <Header />
    <div className="legal-container">
      <section className="legal-section">
        <div className="legal-heading">
          <FileText size={32} />
          Terms & Conditions
        </div>
        <ul className="legal-list">
          <li>Templates are for personal or commercial use only.</li>
          <li>Reselling, redistribution, or duplication is prohibited.</li>
          <li>Users must maintain the confidentiality of their login credentials.</li>
          <li>Credits are non-transferable and expire after 1 month.</li>
          <li>We reserve the right to modify or remove templates at any time.</li>
          <li>For full terms, please contact us.</li>
        </ul>
      </section>
      <section className="legal-section">
        <div className="legal-subheading">User Responsibilities</div>
        <ul className="legal-list">
          <li>You are responsible for all activity under your account.</li>
          <li>Do not share your login credentials with others.</li>
          <li>Report any unauthorized use of your account immediately.</li>
        </ul>
      </section>
      <section className="legal-section">
        <div className="legal-subheading">Contact Information</div>
        <p className="legal-contact">For questions or concerns, please email <a href="mailto:support@thumbnailguru.com">support@thumbnailguru.com</a> or use our <a href="/help">Contact Page</a>.</p>
      </section>
      <div className="legal-footer">
        &copy; {new Date().getFullYear()} Thumbnail Guru. All rights reserved.
      </div>
    </div>
  </div>
);

export default TermsAndConditions; 