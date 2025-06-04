import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Workspace } from 'polotno/canvas/workspace';
import { SidePanel, DEFAULT_SECTIONS } from 'polotno/side-panel';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { PagesTimeline } from 'polotno/pages-timeline';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { createStore } from 'polotno/model/store';
import { observer } from 'mobx-react-lite';
import { Button, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { AuthProvider } from '../context/AuthContext';
import { TemplatesSection } from '../TemplateSection';
import Header from '../components/Header/Header';
import CustomElements from '../components/CustomElements/CustomElements';
import Loader from '../components/Loader';
import { MyProjectsSection } from '../components/MyProjectsSection/MyProjectsSection';
import { ProjectContext, createProject, useProject } from '../utils/project';
import { useCreditsContext } from '../context/CreditsContext';
import toast from 'react-hot-toast';
import { IconsSection } from '../components/IconSection';
import ExportDialog from '../components/ExportDialog/ExportDialog';

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

// Custom Layers Panel with Image Previews
const CustomLayersPanel = observer(({ store }) => {
  const activePage = store.activePage;

  console.log('activePage', activePage);

  if (!activePage) return <div>No active page</div>;

  const handleSelectElement = (element) => {
    store.selectElements([element.id]);
  };

  const handleToggleVisibility = (element) => {

    element.set({ visible: !element.visible });
  };

  const handleToggleLock = (element) => {
    element.set({ draggable: !element.draggable });
    // console.log('element before toggle****', element);

    // element.set({
    //   locked: !element.locked,
    //   draggable: !element.locked,
    //   resizable: !element.locked,
    // });
   
  };

  const handleDelete = (elementId) => {
    store.deleteElements([elementId]);
  };

  return (
    <div style={{ padding: '10px', height: '100%', overflowY: 'auto' }}>
      {activePage.children.slice().reverse().map((element) => (
        <div
          key={element.id}
          onClick={() => handleSelectElement(element)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '5px',
            borderBottom: '1px solid #ddd',
            background: store.selectedElements.includes(element) ? '#e6f0fa' : 'transparent',
            cursor: 'pointer',
          }}
        >
          {/* Image Preview for Image Elements */}
          {element.type === 'image' && element.src && (
            <img
              src={element.src}
              alt="Preview"
              style={{
                width: '30px',
                height: '30px',
                objectFit: 'cover',
                marginRight: '10px',
                borderRadius: '3px',
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/30?text=Error'; // Fallback image
              }}
            />
          )}
          {/* Placeholder for Non-Image Elements */}
          {element.type !== 'image' && (
            <div
              style={{
                width: '30px',
                height: '30px',
                marginRight: '10px',
                borderRadius: '3px',
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#888',
              }}
            >
              {element.type.toUpperCase().charAt(0)}
            </div>
          )}
          {/* Element Type and Name */}
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 'bold' }}>{element.type.toUpperCase()}</span>
            <span style={{ marginLeft: '5px' }}>{element.name || element.id}</span>
          </div>
          {/* Visibility Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleVisibility(element);
            }}
            style={{ marginRight: '5px', background: 'none', border: 'none', cursor: 'pointer' }}
            title={element.visible ? 'Hide' : 'Show'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: element.visible ? '#000' : '#888' }}
            >
              {element.visible ? (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <path d="M3 3l18 18" />
                </>
              )}
            </svg>
          </button>
          {/* Lock Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleLock(element);
            }}
            style={{ marginRight: '5px', background: 'none', border: 'none', cursor: 'pointer' }}
            title={element.locked ? 'Unlock' : 'Lock'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: element.locked ? '#000' : '#888' }}
            >
              {!element.draggable ? (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </>
              ) : (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </>
              )}
            </svg>
          </button>
          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(element.id);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            title="Delete"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: '#ff4d4f' }}
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
});

// Custom Layers Section
const CustomLayersSection = {
  name: 'layers',
  Tab: () => null, // Keep the tab hidden as per your current setup
  Panel: CustomLayersPanel,
};

// ActionControls component
const ActionControls = React.memo(({ store, onDownloadClick }) => {
  console.log('ActionControls rendering');
  const handleOpenLayers = () => {
    console.log('Opening Layers panel');
    store.openSidePanel('layers');
  };

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button
        onClick={handleOpenLayers}
        style={{
          padding: '8px 15px',
          borderRadius: '5px',
          background: '#f0f0f0',
          color: '#000',
          cursor: 'pointer',
          minWidth: '100px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          zIndex: 1001,
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#000' }}
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5"></path>
        </svg>
        Layers
      </button>
      <button
        style={{
          background: 'linear-gradient(90deg, #00291b 0%, #00a67e 100%)',
          color: '#fff',
          borderRadius: '5px',
          padding: '5px 15px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
        onClick={onDownloadClick}
      >
        Download
      </button>
    </div>
  );
});

// ImageRemoveBackground
const ImageRemoveBackground = observer(({ store, element }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreditsError, setShowCreditsError] = useState(false);

  const { credits, consumeCredits, hasCredits } = useCreditsContext();

  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    if (isModalOpen) {
      setForceUpdate((prev) => prev + 1);
    }
  }, [isModalOpen, credits]);

  const removeBackground = async () => {
    if (!hasCredits) {
      setShowCreditsError(true);
      setError('Not enough credits. Please upgrade to Pro to get more credits.');
      return;
    }

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

      const consumed = consumeCredits(1);
      if (consumed) {
        toast.success('Background removed successfully! Used 1 credit.');
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
      setForceUpdate((prev) => prev + 1);
    }
  };

  return (
    <button
      onClick={() => setIsModalOpen(true)}
      style={{
        padding: '5px 15px',
        borderRadius: '5px',
        background: 'linear-gradient(90deg, #00291b 0%, #00a67e 100%)',
        color: '#fff',
        cursor: 'pointer',
        marginLeft: '10px',
      }}
      disabled={loading}
    >
      Remove Background
      {isModalOpen && (
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
                <div>
                  <p>Are you sure you want to remove the background of this image?</p>
                  <p style={{ fontWeight: 'bold', marginTop: '10px' }}>
                    This action will use 1 credit. You have {credits} credits remaining.
                  </p>
                </div>
              )}
              {showCreditsError && (
                <div style={{ marginTop: '15px' }}>
                  <Button
                    intent="primary"
                    text="Upgrade to Pro"
                    onClick={() => {
                      setIsModalOpen(false);
                    }}
                  />
                </div>
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
                  disabled={loading || !hasCredits}
                />
              </>
            }
          />
        </Dialog>
      )}
    </button>
  );
});

const Editor = () => {
  const { templateId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [store] = useState(createEditorStore);
  const [project] = useState(() => createProject({ store }));
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

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

  const urlParams = new URLSearchParams(location.search);
  const projectId = urlParams.get('projectId');

  useEffect(() => {
    if (sessionStorage.getItem('templateRoutingData')) {
      sessionStorage.removeItem('templateRoutingData');
    }
  }, []);

  useEffect(() => {
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
        if (fromCreateModal) {
          store.clear();
          store.addPage({ width, height });
          project.setTemplateInfo({
            name: `Custom Design ${Date.now()}`,
            templateId: null,
          });
        } else if (projectId) {
          await project.loadById(projectId);
        } else if (templateId && templateId !== 'new') {
          let url = `https://dolphin-app-oxsn4.ondigitalocean.app/api/v1/templates/${templateId}`;
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
            project.setTemplateInfo({
              name: tpl.name || tpl.title || `Template Design ${Date.now()}`,
              templateId: tpl._id || tpl.id,
            });
          }
        } else {
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

  // Prevent canvas interaction with locked elements
  const handleCanvasSelect = (elements) => {
    const selectedElements = elements.filter((el) => !el.locked);
    if (selectedElements.length !== elements.length) {
      // Some elements were filtered out because they are locked
      store.selectElements(selectedElements.map((el) => el.id));
    }
  };

  // Replace the default layers section with the custom one
  const modifiedSections = DEFAULT_SECTIONS.map((section) => {
    if (section.name === 'layers') {
      return CustomLayersSection;
    }
    return section;
  });

  // Filter out 'templates' and 'elements' from the modified sections
  const remainingDefaultSections = modifiedSections.filter(
    (section) => section.name !== 'templates' && section.name !== 'elements'
  );

  // Arrange sections in the desired order: My Projects, Related Templates, Icons, Elements, then remaining default sections
  const sections = [
    MyProjectsSection,
    {
      ...TemplatesSection,
      templateId,
      Panel: (props) => <TemplatesSection.Panel {...props} routingData={routingData} />,
    },
    IconsSection,
    CustomElements,
    ...remainingDefaultSections,
  ];

  if (loading) return <Loader text="Loading editor..." />;
  if (error && templateId && templateId !== 'new') {
    return <div style={{ padding: 40, color: 'red', textAlign: 'center' }}>Error: {error}</div>;
  }

  return (
    <AuthProvider>
      <ProjectContext.Provider value={project}>
        <div className="app-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="canvas-editor" style={{ flex: 1, display: 'flex' }}>
              <PolotnoContainer style={{ width: '100%', height: '100%' }}>
                <SidePanelWrap>
                  <SidePanel store={store} sections={sections} defaultSection="my-projects" />
                </SidePanelWrap>
                <WorkspaceWrap style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Toolbar
                    store={store}
                    downloadButtonEnabled={false}
                    components={{
                      ImageRemoveBackground: ImageRemoveBackground,
                      ActionControls: (props) => (
                        <ActionControls {...props} onDownloadClick={() => setIsExportDialogOpen(true)} />
                      ),
                    }}
                    style={{
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ccc',
                      padding: '10px',
                      minHeight: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      zIndex: 1000,
                      flexWrap: 'wrap',
                      overflowX: 'auto',
                    }}
                  />
                  <ExportDialog
                    isOpen={isExportDialogOpen}
                    onClose={() => setIsExportDialogOpen(false)}
                    store={store}
                  />
                  <Workspace
                    store={store}
                    style={{ flex: 1 }}
                    onSelect={handleCanvasSelect} // Prevent selecting locked elements on canvas
                  />
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