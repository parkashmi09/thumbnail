import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import './Help.css';
import { ArrowLeft, MessageCircleQuestion, Lightbulb, FileQuestion, Palette, Wand2, Brush, Video } from 'lucide-react';

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className='container'>
        <div className="help-page">
      <Header />
      
      <div className="help-container">
        <div className="help-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1>Help Center</h1>
          <p>Find answers to common questions and learn how to use Thumbnail Guru</p>
        </div>

        <div className="search-container">
          <MessageCircleQuestion size={24} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for help topics..." 
            className="search-input"
          />
        </div>

        <div className="help-sections">
          <div className="help-section">
            <div className="section-icon">
              <Lightbulb size={32} />
            </div>
            <h2>Getting Started</h2>
            <ul>
              <li>How to create your first thumbnail</li>
              <li>Understanding the editor interface</li>
              <li>Saving and exporting your work</li>
              <li>Account setup and management</li>
            </ul>
          </div>

          <div className="help-section">
            <div className="section-icon">
              <FileQuestion size={32} />
            </div>
            <h2>Frequently Asked Questions</h2>
            <div className="faq-item">
              <h3>What file formats can I export?</h3>
              <p>Thumbnail Guru supports exporting in PNG, JPG, and PDF formats with various quality settings.</p>
            </div>
            <div className="faq-item">
              <h3>How do I resize my thumbnail?</h3>
              <p>Use the size presets or enter custom dimensions in the editor's properties panel.</p>
            </div>
            <div className="faq-item">
              <h3>Can I use my own fonts?</h3>
              <p>Pro users can upload custom fonts. Free users have access to our library of 50+ fonts.</p>
            </div>
          </div>

          <div className="help-section">
            <div className="section-icon">
              <Palette size={32} />
            </div>
            <h2>Design Tips</h2>
            <div className="tip-card">
              <img src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60" alt="Thumbnail Example" />
              <div className="tip-content">
                <h3>Use Contrast for Readability</h3>
                <p>Ensure text stands out against backgrounds for maximum impact.</p>
              </div>
            </div>
            <div className="tip-card">
              <img src="https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=60" alt="Color Theory Example" />
              <div className="tip-content">
                <h3>Color Psychology</h3>
                <p>Choose colors that evoke the right emotions for your content.</p>
              </div>
            </div>
          </div>

          <div className="help-section">
            <div className="section-icon">
              <Wand2 size={32} />
            </div>
            <h2>Pro Features</h2>
            <div className="feature-grid">
              <div className="feature-item">
                <Brush size={24} />
                <h3>Advanced Filters</h3>
                <p>Apply professional-grade filters and effects</p>
              </div>
              <div className="feature-item">
                <Video size={24} />
                <h3>Video Thumbnails</h3>
                <p>Create animated GIF thumbnails</p>
              </div>
            </div>
            <button className="upgrade-button" onClick={() => navigate('/pricing')}>
              Upgrade to Pro
            </button>
          </div>
        </div>

        <div className="help-footer">
          <div className="contact-support">
            <h2>Still need help?</h2>
            <p>Our support team is ready to assist you</p>
            <button className="contact-button">
              Contact Support
            </button>
          </div>
          <div className="help-resources">
            <h3>Additional Resources</h3>
            <ul>
              <li><a href="#">Video Tutorials</a></li>
              <li><a href="#">Design Blog</a></li>
              <li><a href="#">Community Forum</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Help; 