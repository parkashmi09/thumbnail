import React from 'react';
import { Shield, FileText, RefreshCcw } from 'lucide-react';

const sectionStyle = {
  background: '#fff',
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  padding: '2rem',
  marginBottom: '2rem',
  maxWidth: '800px',
  marginLeft: 'auto',
  marginRight: 'auto',
};

const headingStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#00291b',
  marginBottom: '1rem',
};

const Legal = () => (
  <div style={{ background: '#f6f8fa', minHeight: '100vh', padding: '3rem 1rem' }}>
    <h1 style={{ textAlign: 'center', fontWeight: 800, fontSize: '2.5rem', color: '#00a67e', marginBottom: '2rem' }}>
      Legal & Policies
    </h1>

    {/* Terms & Conditions */}
    <section style={sectionStyle}>
      <div style={headingStyle}>
        <FileText size={28} />
        Terms & Conditions
      </div>
      <ul style={{ lineHeight: 1.7, fontSize: '1.1rem', paddingLeft: '1.2rem' }}>
        <li>Templates are for personal or commercial use only.</li>
        <li>Reselling, redistribution, or duplication is prohibited.</li>
        <li>Users must maintain the confidentiality of their login credentials.</li>
        <li>Credits are non-transferable and expire after 1 month.</li>
        <li>We reserve the right to modify or remove templates.</li>
        <li>For full terms, please contact us.</li>
      </ul>
    </section>

    {/* Privacy Policy */}
    <section style={sectionStyle}>
      <div style={headingStyle}>
        <Shield size={28} />
        Privacy Policy
      </div>
      <ul style={{ lineHeight: 1.7, fontSize: '1.1rem', paddingLeft: '1.2rem' }}>
        <li>We value your privacy. Thumbnail Guru only collects essential user data like name, mobile number, email, login history, and download activity.</li>
        <li>We do not store any payment information directly (handled via Razorpay).</li>
        <li>Data is not shared with third parties.</li>
        <li>We use cookies to improve performance.</li>
        <li>You can request deletion of your account at any time.</li>
        <li>For detailed queries, reach out via our Contact Page.</li>
      </ul>
    </section>

    {/* Refund & Cancellation Policy */}
    <section style={sectionStyle}>
      <div style={headingStyle}>
        <RefreshCcw size={28} />
        Refund & Cancellation Policy
      </div>
      <ul style={{ lineHeight: 1.7, fontSize: '1.1rem', paddingLeft: '1.2rem' }}>
        <li>All purchases of credit plans are final and non-refundable.</li>
        <li>We do not offer automatic subscription renewals at this time.</li>
        <li>If you face a technical issue with a download, contact support within 48 hours.</li>
        <li>Credits once used cannot be refunded or reversed.</li>
        <li>Users may cancel usage at any time by not renewing.</li>
      </ul>
    </section>

    <div style={{ textAlign: 'center', color: '#888', fontSize: '1rem', marginTop: '2rem' }}>
      &copy; {new Date().getFullYear()} Thumbnail Guru. All rights reserved.
    </div>
  </div>
);

export default Legal; 