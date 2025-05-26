import { makeAutoObservable } from 'mobx';
import { createContext, useContext } from 'react';
import { storage } from './storage';

export const ProjectContext = createContext({});

export const useProject = () => useContext(ProjectContext);

class Project {
  id = '';
  name = 'Untitled Design';
  status = 'saved'; // 'saved', 'has-changes', 'saving', 'loading'
  designsLength = 0;

  constructor({ store }) {
    makeAutoObservable(this);
    this.store = store;

    // Auto-save when store changes
    store.on('change', () => {
      this.requestSave();
    });
  }

  async requestSave() {
    if (this.status === 'saving') return;
    this.status = 'has-changes';
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      this.save();
    }, 2000); // Auto-save after 2 seconds
  }

  async forceSave() {
    // Force immediate save with fresh preview
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    await this.save();
  }

  async save() {
    this.status = 'saving';
    try {
      const storeJSON = this.store.toJSON();
      let previewUrl;
      
      // Generate preview image using the same method as the reference
      try {
        const maxWidth = 200;
        const canvas = this.store.pages.length
          ? await this.store._toCanvas({
              pixelRatio: maxWidth / this.store.activePage?.computedWidth,
              pageId: this.store.activePage?.id,
              quickMode: true,
              _skipTimeout: true,
            })
          : document.createElement('canvas');
          
        if (canvas) {
          const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', 0.9);
          });
          
          if (blob) {
            previewUrl = URL.createObjectURL(blob);
          } else {
            throw new Error('Failed to create blob');
          }
        } else {
          throw new Error('Failed to create canvas');
        }
      } catch (error) {
        console.warn('Error generating preview:', error);
        previewUrl = await this.createFallbackPreview();
      }

      if (!this.id) {
        this.id = `project-${Date.now()}`; // Generate unique ID
      }

      const projectData = {
        id: this.id,
        name: this.name,
        storeJSON,
        preview: previewUrl,
        timestamp: Date.now(),
      };

      // Save project to localforage
      await storage.setItem(`project-${this.id}`, projectData);
      // Update recent projects list
      const recentProjects = (await storage.getItem('recent-projects')) || [];
      const updatedRecent = [
        this.id,
        ...recentProjects.filter((id) => id !== this.id),
      ].slice(0, 10); // Keep only the last 10 recent projects
      await storage.setItem('recent-projects', updatedRecent);
      await storage.setItem('polotno-last-design-id', this.id);
      this.status = 'saved';
    } catch (e) {
      console.error('Error saving project:', e);
      this.status = 'has-changes';
    }
  }

  async loadById(id) {
    this.status = 'loading';
    try {
      const projectData = await storage.getItem(`project-${id}`);
      if (projectData && projectData.storeJSON) {
        this.id = id;
        this.name = projectData.name;
        this.store.loadJSON(projectData.storeJSON);
        await storage.setItem('polotno-last-design-id', id);
        this.status = 'saved';
      } else {
        throw new Error('Project not found');
      }
    } catch (e) {
      console.error('Error loading project:', e);
      this.id = '';
      this.name = 'Untitled Design';
      await storage.removeItem('polotno-last-design-id');
      this.status = 'saved';
    }
  }

  async firstLoad() {
    const lastDesignId = await storage.getItem('polotno-last-design-id');
    if (lastDesignId) {
      await this.loadById(lastDesignId);
    } else {
      // Ensure a blank page exists if no previous project
      if (this.store.pages.length === 0) {
        this.store.addPage();
      }
      // Set a default name for new projects
      if (this.name === 'Untitled Design') {
        this.name = `New Design ${new Date().toLocaleDateString()}`;
      }
      this.status = 'saved';
    }
  }

  async createNewDesign() {
    this.store.clear();
    this.store.addPage();
    this.id = '';
    this.name = `New Design ${new Date().toLocaleDateString()}`;
    await this.save();
  }

  async getRecentProjects() {
    const recentIds = (await storage.getItem('recent-projects')) || [];
    const projects = [];
    for (const id of recentIds) {
      const projectData = await storage.getItem(`project-${id}`);
      if (projectData) {
        projects.push(projectData);
      }
    }
    return projects.sort((a, b) => b.timestamp - a.timestamp); // Sort by most recent
  }

  async deleteProject(id) {
    try {
      await storage.removeItem(`project-${id}`);
      const recentProjects = (await storage.getItem('recent-projects')) || [];
      const updatedRecent = recentProjects.filter((projectId) => projectId !== id);
      await storage.setItem('recent-projects', updatedRecent);
      
      // If deleting current project, create a new one
      if (this.id === id) {
        await this.createNewDesign();
      }
    } catch (e) {
      console.error('Error deleting project:', e);
    }
  }

  setName(newName) {
    this.name = newName;
    this.requestSave();
  }

  async generatePreview() {
    try {
      if (!this.store.pages.length || !this.store.activePage) {
        throw new Error('No active page found');
      }

      const maxWidth = 200;
      const canvas = this.store.pages.length
        ? await this.store._toCanvas({
            pixelRatio: maxWidth / this.store.activePage?.computedWidth,
            pageId: this.store.activePage?.id,
            // two options for faster preview
            quickMode: true,
            _skipTimeout: true,
          })
        : // if there is no page, create a dummy canvas
          document.createElement('canvas');

      if (!canvas) {
        throw new Error('Failed to generate canvas');
      }

      // Convert to blob URL
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            console.log('Preview generated successfully:', url);
            resolve(url);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/jpeg', 0.9);
      });
        
    } catch (error) {
      console.error('Preview generation error:', error);
      throw error;
    }
  }

  async createFallbackPreview() {
    return new Promise((resolve) => {
      // Create a simple colored canvas as fallback
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      // Create a gradient background similar to the app theme
      const gradient = ctx.createLinearGradient(0, 0, 200, 200);
      gradient.addColorStop(0, '#00291b');
      gradient.addColorStop(1, '#00a67e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 200, 200);
      
      // Add a subtle pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 200; i += 20) {
        ctx.fillRect(i, 0, 1, 200);
        ctx.fillRect(0, i, 200, 1);
      }
      
      // Add text content
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('📄', 100, 80);
      
      ctx.font = '14px Arial';
      const projectName = this.name || 'Design';
      const truncatedName = projectName.length > 15 ? projectName.substring(0, 15) + '...' : projectName;
      ctx.fillText(truncatedName, 100, 110);
      
      ctx.font = '12px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Preview Loading...', 100, 130);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          // Ultimate fallback - data URL
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        }
      }, 'image/jpeg', 0.8);
    });
  }

  setTemplateInfo(templateData) {
    if (templateData && templateData.name) {
      this.name = templateData.name;
    } else if (this.name === 'Untitled Design') {
      // Keep the default name if no template info is provided
      this.name = 'Untitled Design';
    }
  }
}

export const createProject = (...args) => new Project(...args);
export default createProject; 