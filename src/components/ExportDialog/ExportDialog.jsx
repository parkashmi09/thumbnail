import React, { useState } from "react";
import {
  Button,
  Dialog,
  InputGroup,
  Menu,
  MenuItem,
  Popover,
  Position,
} from "@blueprintjs/core";

const ExportDialog = ({ isOpen, onClose, store }) => {
  const [fileName, setFileName] = useState(getDefaultFileName(store));
  const [fileFormat, setFileFormat] = useState("Normal JPG");
  const [exportSize, setExportSize] = useState("1280 x 720 px");
  const [exportScale, setExportScale] = useState("1x");

  const FileFormatMenu = (
    <Menu>
      <MenuItem text="Normal JPG" onClick={() => setFileFormat("Normal JPG")} />
      <MenuItem text="Normal PNG" onClick={() => setFileFormat("Normal PNG")} />
      <MenuItem text="PDF" onClick={() => setFileFormat("PDF")} />
    </Menu>
  );

  const ExportScaleMenu = (
    <Menu>
      <MenuItem text="1x" onClick={() => setExportScale("1x")} />
      <MenuItem text="2x" onClick={() => setExportScale("2x")} />
      <MenuItem text="3x" onClick={() => setExportScale("3x")} />
    </Menu>
  );

  const handleExport = async () => {
    try {
      await store.waitLoading();
      if (fileFormat === "PDF") {
        await store.saveAsPDF({
          fileName: fileName,
          pixelRatio: parseInt(exportScale) || 1,
        });
      } else {
        await store.saveAsImage({
          fileName: fileName,
          mimeType: fileFormat === "Normal JPG" ? "image/jpeg" : "image/png",
          pixelRatio: parseInt(exportScale) || 1,
        });
      }
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title=""
      style={{ width: "400px" }}
    >
      <div style={{ padding: "20px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              marginBottom: "5px",
              display: "block",
            }}
          >
            File Name
          </label>
          <InputGroup
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter file name"
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              marginBottom: "5px",
              display: "block",
            }}
          >
            File Format
          </label>
          <Popover content={FileFormatMenu} position={Position.BOTTOM}>
            <Button
              text={fileFormat}
              rightIcon="caret-down"
              style={{ width: "100%", textAlign: "left" }}
            />
          </Popover>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              marginBottom: "5px",
              display: "block",
            }}
          >
            Export Size
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <InputGroup
              value={exportSize}
              onChange={(e) => setExportSize(e.target.value)}
              style={{ flex: 1 }}
            />
            <Popover content={ExportScaleMenu} position={Position.BOTTOM}>
              <Button text={exportScale} rightIcon="caret-down" />
            </Popover>
          </div>
        </div>

        <button
          intent="primary"
          fill
          style={{
            padding: "5px 15px",
            borderRadius: "5px",
            background: "linear-gradient(90deg, #00291b 0%, #00a67e 100%)",
            color: "#fff",
            marginTop: "10px",
            width: "100%",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onClick={handleExport}
        >
          Download
        </button>
      </div>
    </Dialog>
  );
};

// Helper function to get default file name
function getDefaultFileName(store) {
  const firstPage = store.pages[0];
  if (firstPage && firstPage.children.length > 0) {
    const textElements = firstPage.children.filter(
      (child) => child.type === "text"
    );
    if (textElements.length > 0) {
      return (
        textElements[0].text.split("\n")[0].replace(/[^a-zA-Z0-9]/g, "_") ||
        "design_export"
      );
    }
  }
  return "design_export";
}

export default ExportDialog;
