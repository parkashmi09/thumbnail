import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Workspace } from 'polotno/canvas/workspace';
import { SidePanel, SectionTab } from 'polotno/side-panel';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { PagesTimeline } from 'polotno/pages-timeline';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { createStore } from 'polotno/model/store';
import { DEFAULT_SECTIONS } from 'polotno/side-panel';
import { observer } from 'mobx-react-lite';
import { Button, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { AuthProvider } from '../context/AuthContext';
import { TemplatesSection } from '../TemplateSection';
import Header from '../components/Header/Header';
import CustomElements from '../components/CustomElements/CustomElements';
import ActionControls from '../components/ActionControls';
import Loader from '../components/Loader';
import { MyProjectsSection } from '../components/MyProjectsSection/MyProjectsSection';
import { ProjectContext, createProject, useProject } from '../utils/project';

// Create store instance function
const createEditorStore = () => {
  const store = createStore({
    key: 'nFA5H9elEytDyPyvKL7T',
    showCredit: true,
  });
  if (store.pages.length === 0) {
    store.addPage();
  }
  return store;
};

// resizeImage utility
const resizeImage = (blob, maxPixels = 250000) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    img.onload = () => {
      let { width, height } = img;
      const totalPixels = width * height;
      if (totalPixels > maxPixels) {
        const scale = Math.sqrt(maxPixels / totalPixels);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (resizedBlob) => {
          if (resizedBlob) {
            resolve(resizedBlob);
          } else {
            reject(new Error('Failed to resize image'));
          }
        },
        'image/png'
      );
    };
    img.onerror = () => reject(new Error('Failed to load image for resizing'));
  });
};

// ImageRemoveBackground
const ImageRemoveBackground = observer(({ store, element }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const removeBackground = async () => {
    if (!element || !element.src) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      const response = await fetch(element.src);
      const imageBlob = await response.blob();
      const resizedImage = await resizeImage(imageBlob);
      formData.append('image', resizedImage, 'image.png');
      formData.append('test', 'true');
      const username = 'pxymy6dl6t975nh';
      const apiKey = '527sdkif1ootsq72g6gtp99ifc3lrbdogtbq9se8tlr9t04vbqrr';
      const authHeader = `Basic ${btoa(`${username}:${apiKey}`)}`;
      const req = await fetch('https://api.pixian.ai/api/v2/remove-background', {
        method: 'POST',
        headers: { Authorization: authHeader },
        body: formData,
      });
      if (!req.ok) {
        const errorMessage = await req.text();
        throw new Error(errorMessage || 'Error while removing background');
      }
      const responseBlob = await req.blob();
      const resultUrl = URL.createObjectURL(responseBlob);
      element.set({ src: resultUrl });
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Network Error')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError('Failed to remove background. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          padding: '5px 15px',
          borderRadius: '5px',
          background: 'linear-gradient(90deg, #00291b 0%, #00a67e 100%)',
          color: '#fff',
          cursor: 'pointer',
        }}
        disabled={loading}
      >
        Remove Background
      </button>
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Remove Background"
        style={{ width: '400px' }}
      >
        <DialogBody>
          <div style={{ textAlign: 'center' }}>
            <img
              src={element?.src}
              alt="Selected"
              style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', marginBottom: '20px' }}
            />
            {loading && <p>Processing...</p>}
            {error && (
              <div style={{ color: 'red', marginTop: '10px' }}>
                Error: {error}
              </div>
            )}
            {!loading && !error && (
              <p>Are you sure you want to remove the background of this image?</p>
            )}
          </div>
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <Button
                text="Cancel"
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
              />
              <Button
                intent="primary"
                text="Confirm"
                onClick={removeBackground}
                disabled={loading}
              />
            </>
          }
        />
      </Dialog>
    </>
  );
});

const Editor = () => {
  const { templateId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [store] = useState(createEditorStore);
  const [project] = useState(() => createProject({ store }));

  const stateData = location.state || {};
  const width = stateData.width || 1280;
  const height = stateData.height || 720;
  const unit = stateData.unit || 'px';
  const dpi = stateData.dpi || 72;
  const fromCreateModal = stateData.fromCreateModal || false;
  const routingData =
    stateData.routingData ||
    (sessionStorage.getItem('templateRoutingData')
      ? JSON.parse(sessionStorage.getItem('templateRoutingData'))
      : null);

  // Get project ID from URL parameters if coming from recent projects
  const urlParams = new URLSearchParams(location.search);
  const projectId = urlParams.get('projectId');

  useEffect(() => {
    if (sessionStorage.getItem('templateRoutingData')) {
      sessionStorage.removeItem('templateRoutingData');
    }
  }, []);

  useEffect(() => {
    // Set canvas size based on provided dimensions
    if (width > 0 && height > 0) {
      if (store.pages.length > 0) {
        store.pages[0].set({ width, height });
      }
      store.setSize(width, height);
      if (unit && ['px', 'mm', 'cm', 'in'].includes(unit)) {
        store.setUnit({ unit, dpi });
      }
    }
  }, [width, height, unit, dpi, store]);

  useEffect(() => {
    const fetchAndLoadTemplate = async () => {
      setLoading(true);
      setError(null);
      try {
        // Case 1: Coming from CreateDesignModal with fromCreateModal flag
        if (fromCreateModal) {
          // Clear any existing pages and elements to ensure a blank canvas
          store.clear();
          store.addPage({ width, height });
          // Set project info for naming
          project.setTemplateInfo({
            name: `Custom Design ${Date.now()}`,
            templateId: null,
          });
        }
        // Case 2: Load specific project if projectId is provided
        else if (projectId) {
          await project.loadById(projectId);
        }
        // Case 3: Load template if templateId is provided
        else if (templateId && templateId !== 'new') {
          let url = `https://thumnail-maker.onrender.com/api/v1/templates/${templateId}`;
          if (routingData) {
            const queryParams = new URLSearchParams();
            if (
              routingData.type === 'subCategories' &&
              routingData.data &&
              routingData.data.length > 0
            ) {
              queryParams.append('subCategoryId', routingData.data[0]._id);
            } else if (routingData.type === 'category' && routingData.data) {
              queryParams.append('categoryId', routingData.data._id);
            }
            if (queryParams.toString()) {
              url += `?${queryParams.toString()}`;
            }
          }
          const res = await fetch(url);
          if (!res.ok) throw new Error('Template not found');
          const tpl = await res.json();
          if (tpl.jsonPath) {
            const jsonRes = await fetch(tpl.jsonPath);
            const json = await jsonRes.json();
            await store.loadJSON(json);
            // Set template information for better project naming
            project.setTemplateInfo({
              name: tpl.name || tpl.title || `Template Design ${Date.now()}`,
              templateId: tpl._id || tpl.id,
            });
          }
        }
        // Case 4: Load last project or create a blank canvas
        else {
          await project.firstLoad();
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAndLoadTemplate();
  }, [templateId, projectId, store, routingData, project, fromCreateModal, width, height]);

  const sections = [
    MyProjectsSection,
    {
      ...TemplatesSection,
      templateId,
      Panel: (props) => <TemplatesSection.Panel {...props} routingData={routingData} />,
    },
    CustomElements,
    ...DEFAULT_SECTIONS.filter(
      (section) => section.name !== 'templates' && section.name !== 'elements'
    ),
  ];

  if (loading) return <Loader text="Loading editor..." />;
  if (error && templateId && templateId !== 'new') {
    return <div style={{ padding: 40, color: 'red', textAlign: 'center' }}>Error: {error}</div>;
  }

  return (
    <AuthProvider>
      <ProjectContext.Provider value={project}>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <div className="canvas-editor">
              <PolotnoContainer>
                <SidePanelWrap>
                  <SidePanel store={store} sections={sections} defaultSection="my-projects" />
                </SidePanelWrap>
                <WorkspaceWrap>
                  <Toolbar
                    store={store}
                    components={{
                      ActionControls,
                      ImageRemoveBackground,
                    }}
                  />
                  <Workspace store={store} />
                  <ZoomButtons store={store} />
                  <PagesTimeline store={store} />
                </WorkspaceWrap>
              </PolotnoContainer>
            </div>
          </main>
        </div>
      </ProjectContext.Provider>
    </AuthProvider>
  );
};

export default Editor;