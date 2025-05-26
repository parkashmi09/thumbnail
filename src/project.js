// src/project.js
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
    }, 5000); // Auto-save after 5 seconds
  }

  async save() {
    this.status = 'saving';
    try {
      const storeJSON = this.store.toJSON();
      const maxWidth = 200;
      const canvas = this.store.pages.length
        ? await this.store._toCanvas({
            pixelRatio: maxWidth / this.store.activePage?.computedWidth,
            pageId: this.store.activePage?.id,
            quickMode: true,
            _skipTimeout: true,
          })
        : document.createElement('canvas');
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      });

      if (!this.id) {
        this.id = `project-${Date.now()}`; // Generate unique ID
      }

      const projectData = {
        id: this.id,
        name: this.name,
        storeJSON,
        preview: URL.createObjectURL(blob),
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
      this.store.addPage(); // Ensure a blank page exists
      this.status = 'saved';
    }
  }

  async createNewDesign() {
    this.store.clear();
    this.store.addPage();
    this.id = '';
    this.name = 'Untitled Design';
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
}

export const createProject = (...args) => new Project(...args);
export default createProject;