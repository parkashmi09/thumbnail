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
import { useLocation } from "react-router-dom";

// Create store instance
const store = createStore({
  key: "nFA5H9elEytDyPyvKL7T",
  showCredit: true,
});

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
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const lastSavedJSON = useRef(null);
  const hasChanges = useRef(false);
  const saveTimer = useRef(null);
  const location = useLocation();
  const getDraftKey = (templateId) => `draft-${templateId}`;

  // Debounce utility
  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Save to localStorage
  const saveToLocal = useCallback(
    debounce(() => {
      if (!id) return;
      const json = store.toJSON();
      localStorage.setItem(getDraftKey(id), JSON.stringify(json));
      hasChanges.current = true;
    }, 1000),
    [id]
  );

  // Sync to server
  const syncToServer = useCallback(async () => {
    if (!id || !hasChanges.current) return;

    const local = localStorage.getItem(getDraftKey(id));
    if (!local) return;

    try {
      const json = JSON.parse(local);

      if (
        lastSavedJSON.current &&
        JSON.stringify(json) === JSON.stringify(lastSavedJSON.current)
      ) {
        return;
      }

      setSaveStatus("Syncing...");

      const res = await fetch(`${IP}/api/v1/templates/${id}/json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      if (!res.ok) {
        throw new Error("Failed to sync with server");
      }

      lastSavedJSON.current = json;
      hasChanges.current = false;
      localStorage.removeItem(getDraftKey(id));
      setSaveStatus("Synced");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (err) {
      console.error("Server sync failed:", err);
      setSaveStatus("Sync failed");
    }
  }, [id]);

  // Load template
  const loadTemplate = useCallback(async (templateId) => {
    if (!templateId) return;

    setIsLoading(true);

    try {
      const draft = localStorage.getItem(getDraftKey(templateId));
      if (draft) {
        store.loadJSON(JSON.parse(draft));
        setIsLoading(false);
        return;
      }

      if (templateCache.has(templateId)) {
        const cached = templateCache.get(templateId);
        store.loadJSON(cached);
        lastSavedJSON.current = cached;
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${IP}/api/v1/templates/${templateId}/json`);
      if (!res.ok) throw new Error("Fetch failed");

      const json = await res.json();

      json.objects = (json.objects || []).map((obj) =>
        obj.type === "image" ? { ...obj, crossOrigin: "anonymous" } : obj
      );

      store.clear();
      store.loadJSON(json);
      templateCache.set(templateId, json);
      lastSavedJSON.current = json;
    } catch (err) {
      console.error("Template load error:", err);
      setSaveStatus("Load failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle template updates
  useEffect(() => {
    if (id) loadTemplate(id);
  }, [id, loadTemplate]);

  // Track store changes
  useEffect(() => {
    if (!id) return;

    const disposer = store.on("change", () => {
      saveToLocal();
    });

    return () => disposer();
  }, [id, saveToLocal]);

  // Sync to server every 30s
  useEffect(() => {
    if (!id) return;
    saveTimer.current = setInterval(syncToServer, 30000);
    return () => clearInterval(saveTimer.current);
  }, [id, syncToServer]);

  // Sync before unload
  // useEffect(() => {
  //   const handler = () => {
  //     syncToServer();
  //   };
  //   window.addEventListener("beforeunload", handler);
  //   return () => window.removeEventListener("beforeunload", handler);
  // }, [syncToServer]);

  useEffect(() => {
    return () => {
      // This runs on component unmount (route change)
      syncToServer().then(() => {
        if (id) {
          // 1. Clear draft from localStorage
          localStorage.removeItem(getDraftKey(id));
          // 2. Clear cached template
          templateCache.delete(id);
          console.log(`Cleared draft and cache for template ${id}`);
        }
      });
    };
  }, [location]);

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
                    <ActionControls
                      store={store}
                      templateId={id}
                      onUpdate={() => {
                        templateCache.delete(id);
                        loadTemplate(id);
                      }}
                    />
                  ),
                }}
              />
              <Workspace store={store} />
              <ZoomButtons store={store} />
              <PagesTimeline store={store} />
            </WorkspaceWrap>
          </PolotnoContainer>
        </div>

        {saveStatus && (
          <div className="absolute bottom-2 right-2 bg-gray-800 text-white px-4 py-1 rounded text-sm shadow-lg z-50">
            {saveStatus}
          </div>
        )}
      </main>
    </div>
  );
}

export default Editor;