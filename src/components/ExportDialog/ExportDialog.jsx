import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  InputGroup,
  Menu,
  MenuItem,
  Popover,
  Position,
} from '@blueprintjs/core';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import './ExportDialog.css';

const ExportDialog = ({ isOpen, onClose, store }) => {
  const [fileName, setFileName] = useState('');
  const [fileFormat, setFileFormat] = useState('Normal JPG');
  const [exportSize, setExportSize] = useState('1280 x 720 px');
  const [exportScale, setExportScale] = useState('1x');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFileName(getDefaultFileName(store));
      setShowConfirmation(false);
      setIsDownloading(false);
    }
  }, [isOpen, store]);

  const FileFormatMenu = (
    <Menu>
      <MenuItem text="Normal JPG" onClick={() => setFileFormat('Normal JPG')} />
      <MenuItem text="Normal PNG" onClick={() => setFileFormat('Normal PNG')} />
      <MenuItem text="PDF" onClick={() => setFileFormat('PDF')} />
    </Menu>
  );

  const ExportScaleMenu = (
    <Menu>
      <MenuItem text="1x" onClick={() => setExportScale('1x')} />
      <MenuItem text="2x" onClick={() => setExportScale('2x')} />
      <MenuItem text="3x" onClick={() => setExportScale('3x')} />
    </Menu>
  );

  const handleProceed = () => {
    setShowConfirmation(true);
  };

  const handleExport = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('User not logged in. Please log in to download.');
        return;
      }

      // Call download-template API
      const downloadResponse = await fetch('https://dolphin-app-oxsn4.ondigitalocean.app/api/v1/download-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (!downloadResponse.ok) {
        throw new Error('Download template API failed');
      }

      // Ensure watermark is included in export
      store.pages.forEach((page) => {
        const watermark = page.children.find((el) => el.name === 'watermark');
        if (watermark) {
          watermark.set({ showInExport: true });
        }
      });

      // Export the design
      await store.waitLoading();
      if (fileFormat === 'PDF') {
        await store.saveAsPDF({
          fileName: fileName,
          pixelRatio: parseInt(exportScale) || 1,
        });
      } else {
        await store.saveAsImage({
          fileName: fileName,
          mimeType: fileFormat === 'Normal JPG' ? 'image/jpeg' : 'image/png',
          pixelRatio: parseInt(exportScale) || 1,
        });
      }

      toast.success('Template downloaded successfully!');
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Main export settings dialog
  if (!showConfirmation) {
    return (
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title="Export Your Design"
        className="custom-export-dialog"
      >
        <div className="export-dialog-content">
          <div className="export-form">
            <div className="form-group">
              <label>File Name</label>
              <InputGroup
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder=""
              />
            </div>

            <div className="form-group">
              <label>File Format</label>
              <Popover content={FileFormatMenu} position={Position.BOTTOM}>
                <Button
                  text={fileFormat}
                  rightIcon="caret-down"
                  className="format-button"
                />
              </Popover>
            </div>

            <div className="form-group">
              <label>Export Size</label>
              <div className="size-row">
                <InputGroup
                  value={exportSize}
                  onChange={(e) => setExportSize(e.target.value)}
                  className="size-input"
                />
                <Popover content={ExportScaleMenu} position={Position.BOTTOM}>
                  <Button text={exportScale} rightIcon="caret-down" />
                </Popover>
              </div>
            </div>
          </div>

          <div className="export-actions">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="proceed-button"
              onClick={handleProceed}
            >
              <Download size={18} />
              Proceed
            </button>
          </div>
        </div>
      </Dialog>
    );
  }

  // Confirmation dialog
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title=""
      className="custom-export-dialog confirmation-dialog"
    >
      <div className="confirmation-content">
        <div className="confirmation-illustration">
          <svg width="150" height="150" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2"
              fill="#e6f7f1"
              stroke="#00a67e"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 16V8M8 12H16"
              stroke="#00a67e"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 19L5 17M17 19L19 17M12 22V20M2 12H4M20 12H22M5 7L7 5M19 7L17 5"
              stroke="#00a67e"
              strokeWidth="1.5"
              opacity="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {isDownloading ? (
          <div className="loader-container">
            <div className="loader"></div>
            <p className="downloading-message">Downloading your template...</p>
          </div>
        ) : (
          <>
            <h2>Confirm Download</h2>
            <p className="confirmation-message">
              The exported file will include a watermark.
            </p>
            <p className="file-info">
              File will be downloaded as: <strong>{fileName}.{fileFormat === 'Normal JPG' ? 'jpg' : fileFormat === 'Normal PNG' ? 'png' : 'pdf'}</strong>
            </p>
            <div className="confirmation-actions">
              <button
                className="back-button"
                onClick={() => setShowConfirmation(false)}
                disabled={isDownloading}
              >
                Go Back
              </button>
              <button
                className="download-button"
                onClick={handleExport}
                disabled={isDownloading}
              >
                <Download size={18} />
                Download Now
              </button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
};

// Helper function to get default file name
function getDefaultFileName(store) {
  const firstPage = store.pages[0];

  if (firstPage?.custom?.templateName) {
    return firstPage.custom.templateName.replace(/[^a-zA-Z0-9]/g, '_');
  }

  if (firstPage && firstPage.children.length > 0) {
    const textElements = firstPage.children.filter(
      (child) => child.type === 'text' && child.text && child.text.trim() !== ''
    );
    if (textElements.length > 0) {
      const firstText = textElements[0].text.split('\n')[0].trim();
      return firstText.replace(/[^a-zA-Z0-9]/g, '_') || 'template_design';
    }
  }

  return `template_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}`;
}

export default ExportDialog;