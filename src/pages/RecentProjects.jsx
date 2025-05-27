import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, FolderOpen, Plus, Trash2, Edit3, Calendar } from "lucide-react";
import Header from "../components/Header/Header";
import { storage } from "../utils/storage";
import CreateDesignModal from "../components/Home/components/CreateDesignModal";
import "./RecentProjects.css";

const RecentProjects = () => {
  const [projects, setProjects] = useState([]);
  console.log(projects,"hdhd");
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchRecentProjects = async () => {
    setLoading(true);
    try {
      const recentIds = (await storage.getItem("recent-projects")) || [];
      const projectsData = [];

      for (const id of recentIds) {
        const projectData = await storage.getItem(`project-${id}`);
        if (projectData) {
          projectsData.push(projectData);
        }
      }

      // Sort by most recent
      const sortedProjects = projectsData.sort(
        (a, b) => b.timestamp - a.timestamp
      );
      setProjects(sortedProjects);
    } catch (error) {
      console.error("Error fetching recent projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentProjects();
  }, []);

  const handleOpenProject = (project) => {
    // Navigate to editor with the project ID
    navigate(`/editor?projectId=${project.id}`);
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await storage.removeItem(`project-${projectId}`);
        const recentProjects = (await storage.getItem("recent-projects")) || [];
        const updatedRecent = recentProjects.filter((id) => id !== projectId);
        await storage.setItem("recent-projects", updatedRecent);

        // Refresh the projects list
        fetchRecentProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  const handleDeleteAllProjects = async () => {
    if (window.confirm("Are you sure you want to delete all recent projects? This cannot be undone.")) {
      try {
        const recentProjects = (await storage.getItem("recent-projects")) || [];
        
        // Delete each project's data
        for (const projectId of recentProjects) {
          await storage.removeItem(`project-${projectId}`);
        }
        
        // Clear the recent-projects list
        await storage.setItem("recent-projects", []);
        
        // Refresh the projects list
        fetchRecentProjects();
      } catch (error) {
        console.error("Error deleting all projects:", error);
      }
    }
  };

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const getFormattedDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="recent-projects-page">
        <Header />
        <div className="recent-projects-container">
          <div className="loading-container">
            <div className="loading-spinner-large"></div>
            <p>Loading your recent projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-projects-page">
      <Header />

      <div className="recent-projects-container">
        {/* Hero Section */}
        <div className="recent-projects-hero">
          <div className="hero-content">
            <h1>
              <Clock className="hero-icon" />
              Recent Projects
            </h1>
            <p>Continue working on your designs or start something new</p>
            <button className="create-new-btn" onClick={handleCreateNew}>
              <Plus size={20} />
              Create New Design
            </button>
          </div>
        </div>

        {/* Projects Section */}
        <div className="projects-content">
          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-decoration top-left"></div>
              <div className="empty-state-decoration bottom-right"></div>
              
              <div className="empty-state-icon">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="main-icon">
                  <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#00a67e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z" stroke="#00a67e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.67 18.95L7.6 15.64C8.39 15.11 9.53 15.17 10.24 15.78L10.57 16.07C11.35 16.74 12.61 16.74 13.39 16.07L17.55 12.5C18.33 11.83 19.59 11.83 20.37 12.5L22 13.9" stroke="#00a67e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="plus-icon">
                  <path d="M6 12H18" stroke="#00a67e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18V6" stroke="#00a67e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <h2>No Projects Yet</h2>
              <p>Create your first thumbnail design to get started</p>
              <button className="empty-state-btn" onClick={handleCreateNew}>
                <Plus size={18} />
                Create Design
              </button>
            </div>
          ) : (
            <>
              <div className="projects-header">
                <h2>Your Designs ({projects.length})</h2>
                {/* <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <p>Click on any design to continue editing</p>
                  {projects.length > 0 && (
                    <button 
                      onClick={handleDeleteAllProjects}
                      style={{
                        backgroundColor: '#ff4444',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Trash2 size={16} />
                      Delete All
                    </button>
                  )}
                </div> */}
              </div>

              <div className="projects-container">
                <div className="projects-grid">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      x
                      className="project-card"
                      onClick={() => handleOpenProject(project)}
                    >
                      <div className="project-preview">
                        {project.preview ? (
                          <img
                            src={project.preview}
                            alt={project.name}
                            onLoad={(e) => {
                              const parent = e.target.parentElement;
                              const fallback =
                                parent.querySelector(".fallback-preview");
                              if (fallback) {
                                fallback.style.display = "none";
                              }
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                              const parent = e.target.parentElement;
                              if (!parent.querySelector(".fallback-preview")) {
                                const fallback = document.createElement("div");
                                fallback.className = "fallback-preview";
                                fallback.innerHTML = `
                                <div class="fallback-icon">📄</div>
                                <div class="fallback-text">${project.name.substring(
                                  0,
                                  10
                                )}</div>
                              `;
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <div className="fallback-preview">
                            <div className="fallback-icon">📄</div>
                            <div className="fallback-text">
                              {project.name.substring(0, 10)}
                            </div>
                          </div>
                        )}

                        <div className="project-overlay">
                          <div className="overlay-content">
                            <button
                              className="action-btn edit-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenProject(project);
                              }}
                              title="Edit project"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={(e) =>
                                handleDeleteProject(e, project.id)
                              }
                              title="Delete project"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="project-info">
                        <h3 className="project-name" title={project.name}>
                          {project.name}
                        </h3>
                        <div className="project-meta">
                          <span className="project-date">
                            <Calendar size={14} />
                            {formatDate(project.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add CreateDesignModal */}
      <CreateDesignModal 
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
      />
    </div>
  );
};

export default RecentProjects;
