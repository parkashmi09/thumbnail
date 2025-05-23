import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import './AboutUs.css';
import { ArrowLeft, Heart, Target, Zap, Users, Award, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

const AboutUs = () => {
  const navigate = useNavigate();
  
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60",
      bio: "Former design lead at YouTube with a passion for helping creators stand out."
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=500&auto=format&fit=crop&q=60",
      bio: "Ex-Google engineer focused on building intuitive creative tools."
    },
    {
      name: "Priya Patel",
      role: "Design Director",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60",
      bio: "Award-winning designer with 10+ years experience in digital media."
    },
    {
      name: "James Wilson",
      role: "Marketing Lead",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60",
      bio: "Content creator turned marketer with a deep understanding of the creator economy."
    }
  ];

  return (
    <div className="about-page">
      <Header />
      
     <div className="container">

     <div className="about-container">
        <div className="about-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          
          <h1>About Thumbnail Guru</h1>
          <p className="tagline">Empowering creators to make stunning thumbnails that drive engagement</p>
        </div>
        
        <div className="about-hero">
          <div className="hero-content">
            <h2>Our Story</h2>
            <p>
              Thumbnail Guru was born from a simple observation: even the best content 
              struggles to find an audience without an eye-catching thumbnail. 
              Founded in 2023, we set out to create a tool that makes professional-quality 
              thumbnail creation accessible to everyone, regardless of design experience.
            </p>
            <p>
              What started as a small project has grown into a platform used by thousands 
              of content creators worldwide, from YouTube stars to small business owners 
              and everyone in between.
            </p>
          </div>
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=60" 
              alt="Team working on designs" 
            />
          </div>
        </div>
        
        <div className="mission-section">
          <div className="mission-card">
            <div className="icon-container">
              <Heart size={32} />
            </div>
            <h3>Our Mission</h3>
            <p>
              To democratize thumbnail design by providing intuitive tools that help creators 
              of all skill levels make professional-quality thumbnails that drive engagement.
            </p>
          </div>
          
          <div className="mission-card">
            <div className="icon-container">
              <Target size={32} />
            </div>
            <h3>Our Vision</h3>
            <p>
              A world where every creator can easily express their visual identity and connect 
              with their audience through compelling thumbnail design.
            </p>
          </div>
          
          <div className="mission-card">
            <div className="icon-container">
              <Zap size={32} />
            </div>
            <h3>Our Values</h3>
            <p>
              Creativity, accessibility, innovation, and community guide everything we do 
              at Thumbnail Guru.
            </p>
          </div>
        </div>
        
        <div className="stats-section">
          <div className="stat-item">
            <span className="stat-number">10M+</span>
            <span className="stat-label">Thumbnails Created</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">200K+</span>
            <span className="stat-label">Active Users</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">150+</span>
            <span className="stat-label">Countries</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4.8/5</span>
            <span className="stat-label">User Rating</span>
          </div>
        </div>
        
        <div className="team-section">
          <h2>Meet Our Team</h2>
          <p className="team-intro">
            We're a diverse team of designers, engineers, and content creators 
            passionate about helping creators succeed.
          </p>
          
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div className="team-member" key={index}>
                <div className="member-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <h3>{member.name}</h3>
                <span className="member-role">{member.role}</span>
                <p className="member-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="values-section">
          <h2>Why Choose Thumbnail Guru?</h2>
          
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon">
                <Users size={28} />
              </div>
              <h3>Made By Creators, For Creators</h3>
              <p>
                Our team includes content creators who understand the challenges 
                you face and the tools you need to succeed.
              </p>
            </div>
            
            <div className="value-item">
              <div className="value-icon">
                <Award size={28} />
              </div>
              <h3>Professional Results, No Experience Required</h3>
              <p>
                Our intuitive editor and templates help you create professional-quality 
                thumbnails in minutes, even if you've never designed before.
              </p>
            </div>
            
            <div className="value-item">
              <div className="value-icon">
                <Zap size={28} />
              </div>
              <h3>Constantly Evolving</h3>
              <p>
                We regularly add new features, templates, and design elements based on 
                user feedback and industry trends.
              </p>
            </div>
          </div>
        </div>
        
        <div className="cta-section">
          <h2>Ready to create eye-catching thumbnails?</h2>
          <p>Join thousands of creators who trust Thumbnail Guru for their design needs.</p>
          <button className="cta-button" onClick={() => navigate('/')}>
            Start Creating Now
          </button>
        </div>
        
        <div className="about-footer">
          <div className="social-links">
            <h3>Connect With Us</h3>
            <div className="social-icons">
              <a href="#" className="social-icon">
                <Twitter size={24} />
              </a>
              <a href="#" className="social-icon">
                <Instagram size={24} />
              </a>
              <a href="#" className="social-icon">
                <Linkedin size={24} />
              </a>
              <a href="#" className="social-icon">
                <Github size={24} />
              </a>
            </div>
          </div>
          
          <div className="contact-info">
            <h3>Contact Us</h3>
            <p>hello@thumbnailguru.com</p>
            <p>123 Creative Ave, San Francisco, CA 94103</p>
          </div>
        </div>
      </div>
     </div>
    </div>
  );
};

export default AboutUs; 