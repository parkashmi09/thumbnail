import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { useProject } from '../../utils/project';
import { FolderOpen, Plus, Trash2, Clock } from 'lucide-react';
import './MyProjectsSection.css';

export const MyProjectsSection = {
  name: 'my-projects',
  Tab: (props) => (
    <SectionTab name="My Projects" {...props}>
      <FolderOpen size={16} />
    </SectionTab>
  ),
  Panel: observer(({ store }) => {
    const project = useProject();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const recentProjects = await project.getRecentProjects();
        setProjects(recentProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchProjects();
    }, [project]);

    const handleLoadProject = async (id) => {
      try {
        await project.loadById(id);
        // Force save to regenerate preview
        setTimeout(() => {
          project.forceSave();
        }, 1000);
        // Refresh projects list to show updated timestamp
        fetchProjects();
      } catch (error) {
        console.error('Error loading project:', error);
      }
    };

    const handleNewDesign = async () => {
      try {
        await project.createNewDesign();
        fetchProjects();
      } catch (error) {
        console.error('Error creating new design:', error);
      }
    };

    const handleDeleteProject = async (e, projectId) => {
      e.stopPropagation();
      if (window.confirm('Are you sure you want to delete this project?')) {
        try {
          await project.deleteProject(projectId);
          fetchProjects();
        } catch (error) {
          console.error('Error deleting project:', error);
        }
      }
    };

    const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString();
      }
    };

    return (
      <div className="my-projects-panel">
        <div className="my-projects-header">
          <h3>My Projects</h3>
          <button
            className="new-design-btn"
            onClick={handleNewDesign}
            title="Create New Design"
          >
            <Plus size={16} />
            New Design
          </button>
        </div>

        <div className="projects-section">
          <div className="section-title">
            <Clock size={14} />
            <span>Recent Projects</span>
          </div>
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={48} />
              <p>No recent projects found.</p>
              <p>Create your first design to get started!</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((projectItem) => (
                <div
                  key={projectItem.id}
                  className={`project-card ${project.id === projectItem.id ? 'active' : ''}`}
                  onClick={() => handleLoadProject(projectItem.id)}
                  title={projectItem.name}
                >
                  <div className="project-preview">
                    {projectItem.preview ? (
                      <img
                        src={projectItem.preview}
                        alt={projectItem.name}
                        onLoad={(e) => {
                          // Hide any fallback if image loads successfully
                          const parent = e.target.parentElement;
                          const fallback = parent.querySelector('.fallback-preview');
                          if (fallback) {
                            fallback.style.display = 'none';
                          }
                        }}
                        onError={(e) => {
                          // Create a fallback preview
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (!parent.querySelector('.fallback-preview')) {
                            const fallback = document.createElement('div');
                            fallback.className = 'fallback-preview';
                            fallback.innerHTML = `<span>📄</span><div class="fallback-text">${projectItem.name.substring(0, 8)}</div>`;
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div className="fallback-preview">
                        <span>📄</span>
                        <div className="fallback-text">{projectItem.name.substring(0, 8)}</div>
                      </div>
                    )}
                    <div className="project-overlay">
                      <button
                        className="delete-btn"
                        onClick={(e) => handleDeleteProject(e, projectItem.id)}
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="project-info">
                    <p className="project-name">{projectItem.name}</p>
                    <p className="project-date">{formatDate(projectItem.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="project-status">
          <div className="status-indicator">
            <div className={`status-dot ${project.status}`}></div>
            <span>
              {project.status === 'saved' && 'All changes saved'}
              {project.status === 'has-changes' && 'Saving...'}
              {project.status === 'saving' && 'Saving...'}
              {project.status === 'loading' && 'Loading...'}
            </span>
          </div>
        </div>
      </div>
    );
  }),
}; 