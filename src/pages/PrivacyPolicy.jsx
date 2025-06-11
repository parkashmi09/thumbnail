import React from 'react';
import Header from '../components/Header/Header';
import { Shield } from 'lucide-react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => (
  <div className="legal-bg">
    <Header />
    <div className="legal-container">
      <section className="legal-section">
        <div className="legal-heading">
          <Shield size={32} />
          Privacy Policy
        </div>
        <ul className="legal-list">
          <li>We value your privacy. Thumbnail Guru only collects essential user data like name, mobile number, email, login history, and download activity.</li>
          <li>We do not store any payment information directly (handled via Razorpay).</li>
          <li>Data is not shared with third parties.</li>
          <li>We use cookies to improve performance.</li>
          <li>You can request deletion of your account at any time.</li>
          <li>For detailed queries, reach out via our Contact Page.</li>
        </ul>
      </section>
      <section className="legal-section">
        <div className="legal-subheading">How We Use Your Data</div>
        <ul className="legal-list">
          <li>To provide and improve our services.</li>
          <li>To communicate important updates and offers.</li>
          <li>To ensure account security and prevent fraud.</li>
        </ul>
      </section>
      <section className="legal-section">
        <div className="legal-subheading">Your Rights</div>
        <ul className="legal-list">
          <li>You can request access to or deletion of your data at any time.</li>
          <li>You may opt out of marketing communications.</li>
          <li>Contact us for any privacy-related concerns.</li>
        </ul>
      </section>
      <div className="legal-footer">
        &copy; {new Date().getFullYear()} Thumbnail Guru. All rights reserved.
      </div>
    </div>
  </div>
);

export default PrivacyPolicy; 