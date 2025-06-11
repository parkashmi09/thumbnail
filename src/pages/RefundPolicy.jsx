import React from 'react';
import Header from '../components/Header/Header';
import { RefreshCcw } from 'lucide-react';
import './RefundPolicy.css';

const RefundPolicy = () => (
    <div className="legal-bg">
        <Header />
        <div className="legal-container">
            <div className="legal-bg-container">
                <section className="legal-section">
                    <div className="legal-heading">
                        <RefreshCcw size={32} />
                        Refund & Cancellation Policy
                    </div>
                    <ul className="legal-list">
                        <li>All purchases of credit plans are final and non-refundable.</li>
                        <li>We do not offer automatic subscription renewals at this time.</li>
                        <li>If you face a technical issue with a download, contact support within 48 hours.</li>
                        <li>Credits once used cannot be refunded or reversed.</li>
                        <li>Users may cancel usage at any time by not renewing.</li>
                    </ul>
                </section>
                <section className="legal-section">
                    <div className="legal-subheading">Refund Exceptions</div>
                    <ul className="legal-list">
                        <li>Refunds may be considered only in cases of duplicate payment or proven technical error.</li>
                        <li>Requests must be made within 48 hours of purchase.</li>
                    </ul>
                </section>
                <section className="legal-section">
                    <div className="legal-subheading">How to Request Support</div>
                    <p className="legal-contact">If you believe you are eligible for a refund, please contact <a href="mailto:support@thumbnailguru.com">support@thumbnailguru.com</a> with your order details and a description of the issue.</p>
                </section>
                <div className="legal-footer">
                    &copy; {new Date().getFullYear()} Thumbnail Guru. All rights reserved.
                </div>
            </div>
        </div>
    </div>

);

export default RefundPolicy; 