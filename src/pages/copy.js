import React, { useState, useEffect, useCallback, useRef } from "react";
import "@blueprintjs/core/lib/css/blueprint.css";
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from "polotno";
import { Workspace } from "polotno/canvas/workspace";
import { SidePanel } from "polotno/side-panel";
import { Toolbar } from "polotno/toolbar/toolbar";
import { PagesTimeline } from "polotno/pages-timeline";
import { ZoomButtons } from "polotno/toolbar/zoom-buttons";
import { createStore } from "polotno/model/store";
import { DEFAULT_SECTIONS } from "polotno/side-panel";
import { TemplatesSection } from "./TemplateSection";
import { useParams } from "react-router-dom";
import { IP } from "../../../utils/Constent";
import ActionControls from "./ActionControls";
import { FontsTab } from "./FontsSection";
import CustomElements from "./ElementsPanel";
import { UploadSection } from "./UploadSection";

// Create store instance
const store = createStore({
  key: "nFA5H9elEytDyPyvKL7T",
  showCredit: true,
});

// Template cache
const templateCache = new Map();

const sections = [
  TemplatesSection,
  CustomElements,
  UploadSection,
  FontsTab,
  ...DEFAULT_SECTIONS.filter(
    (section) => section.name !== "templates" && section.name !== "upload"
  ),
];

function Editor() {
  const { id } = useParams();
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const lastSavedJSON = useRef(null);
  const hasChanges = useRef(false);

  // Optimized template loader
  const loadTemplate = useCallback(async (templateId) => {
    if (!templateId) return;

    setIsLoading(true);

    try {
      // Check cache first
      if (templateCache.has(templateId)) {
        const cached = templateCache.get(templateId);
        store.loadJSON(cached);
        lastSavedJSON.current = cached;
        setIsLoading(false);
        return;
      }

      // Parallel fetch requests
      const [jsonRes] = await Promise.all([
        fetch(
          `${IP}/api/v1/templates/${templateId}/json?timestamp=${Date.now()}`
        ),
      ]);

      if (!jsonRes.ok) throw new Error("Failed to fetch template");

      const json = await jsonRes.json();

      // Optimize image loading
      if (json.objects) {
        json.objects = json.objects.map((obj) => {
          if (obj.type === "image") {
            return {
              ...obj,
              crossOrigin: "anonymous",
              // Add placeholder if needed
              // placeholder: "data:image/svg+xml,..."
            };
          }
          return obj;
        });
      }

      // Clear store efficiently
      store.clear();

      // Load new template
      store.loadJSON(json);

      // Cache the template
      templateCache.set(templateId, json);
      lastSavedJSON.current = json;
      hasChanges.current = false;
    } catch (err) {
      console.error("Error loading template:", err);
      setSaveStatus(`Error loading: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save template to server
  const saveTemplate = useCallback(async () => {
    if (!id || isSaving || !hasChanges.current) return;

    setIsSaving(true);
    setSaveStatus("Saving...");

    try {
      const json = store.toJSON();

      if (JSON.stringify(json) === JSON.stringify(lastSavedJSON.current)) {
        setSaveStatus("No changes to save");
        setTimeout(() => setSaveStatus(""), 2000);
        return;
      }

      const response = await fetch(`${IP}/api/v1/templates/${id}/json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      // Update cache and last saved state
      templateCache.set(id, json);
      lastSavedJSON.current = json;
      hasChanges.current = false;

      setSaveStatus("Saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (err) {
      console.error("Error saving template:", err);
      setSaveStatus(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [id, isSaving]);

  // Load template when ID changes
  useEffect(() => {
    if (id) {
      loadTemplate(id);
    }
  }, [id, loadTemplate]);

  // Set up change listeners
  useEffect(() => {
    if (!id) return;

    const onChangeDisposer = store.on("change", () => {
      hasChanges.current = true;
      debounce(saveTemplate, 2000)();
    });

    return () => onChangeDisposer();
  }, [id, saveTemplate]);

  // Simple debounce function
  const debounce = (func, delay) => {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, arguments), delay);
    };
  };

  const handleTemplateUpdate = () => {
    // Clear cache for this template to force reload
    if (id) templateCache.delete(id);
    setLastUpdated(Date.now());
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-xl">Loading template...</div>
        </div>
      )}

      <main className="flex-1 relative">
        <div className="w-full h-[calc(100vh-60px)] absolute top-0 left-0">
          <PolotnoContainer>
            <SidePanelWrap>
              <SidePanel store={store} sections={sections} />
            </SidePanelWrap>
            <WorkspaceWrap>
              <Toolbar
                store={store}
                components={{
                  ActionControls: () => (
                    <>
                      <ActionControls
                        store={store}
                        templateId={id}
                        onUpdate={handleTemplateUpdate}
                      />
                      
                    </>
                  ),
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
  );
}

export default Editor;