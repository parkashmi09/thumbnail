// src/MyProjectsSection.js
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { useProject } from './project';
import { Button } from '@blueprintjs/core';
import { MdFolder } from 'react-icons/md';

export const MyProjectsSection = {
  name: 'my-projects',
  Tab: (props) => (
    <SectionTab name="My Projects" {...props}>
      <MdFolder />
    </SectionTab>
  ),
  Panel: observer(({ store }) => {
    const project = useProject();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchProjects = async () => {
        setLoading(true);
        const recentProjects = await project.getRecentProjects();
        setProjects(recentProjects);
        setLoading(false);
      };
      fetchProjects();
    }, [project]);

    const handleLoadProject = async (id) => {
      await project.loadById(id);
    };

    const handleNewDesign = async () => {
      await project.createNewDesign();
    };

    return (
      <div style={{ padding: '10px', maxHeight: '100%', overflow: 'auto' }}>
        <h3>My Projects</h3>
        <Button
          onClick={handleNewDesign}
          style={{
            width: '100%',
            marginBottom: '20px',
            padding: '8px',
            background: 'linear-gradient(90deg, #00291b 0%, #00a67e 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Create New Design
        </Button>
        <h4>Recent Projects</h4>
        {loading ? (
          <p>Loading...</p>
        ) : projects.length === 0 ? (
          <p>No recent projects found.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {projects.map((project) => (
              <div
                key={project.id}
                style={{
                  cursor: 'pointer',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  overflow: 'hidden',
                }}
                onClick={() => handleLoadProject(project.id)}
              >
                <img
                  src={project.preview}
                  alt={project.name}
                  style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                />
                <div style={{ padding: '5px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '14px' }}>{project.name}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                    {new Date(project.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }),
};