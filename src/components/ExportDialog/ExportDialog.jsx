import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  InputGroup,
  Menu,
  MenuItem,
  Popover,
  Position,
} from "@blueprintjs/core";
import { Coins, Download, AlertTriangle, Check, Star, Crown } from "lucide-react";
import { useCreditsContext } from "../../context/CreditsContext";
import toast from "react-hot-toast";
import "./ExportDialog.css";

// Pricing plans from API
const pricingPlans = [
  {
    "_id": "6835600c0395c41d47d1248e",
    "name": "Basic Plan",
    "price": 399,
    "offerPrice": 299,
    "features": [
      "Limited Templates",
      "WaterMark on exports",
      "No psd Downloads",
      "5 Downloads per day"
    ]
  },
  {
    "_id": "683560710395c41d47d12491",
    "name": "Popular Plan",
    "price": 999,
    "offerPrice": 599,
    "features": [
      "Unlimited Templates",
      "No watermark",
      "PSD exports",
      "Background remover",
      "15 downloads per day"
    ]
  },
  {
    "_id": "683560e50395c41d47d12494",
    "name": "Pro Plan",
    "price": 3599,
    "offerPrice": 2499,
    "features": [
      "Unlimited Templates",
      "No watermark",
      "PSD exports",
      "AI tools",
      "Font Upload",
      "Unlimited Downloads"
    ]
  }
];

const ExportDialog = ({ isOpen, onClose, store }) => {
  const [fileName, setFileName] = useState("");
  const [fileFormat, setFileFormat] = useState("Normal JPG");
  const [exportSize, setExportSize] = useState("1280 x 720 px");
  const [exportScale, setExportScale] = useState("1x");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const { credits, consumeCredits, hasCredits } = useCreditsContext();
  const CREDITS_COST = 5;

  useEffect(() => {
    // Reset states and set default file name when dialog opens
    if (isOpen) {
      setFileName(getDefaultFileName(store));
      setShowConfirmation(false);
      setShowPlans(false);
    }
  }, [isOpen, store]);

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

  const handleProceed = () => {
    if (credits < CREDITS_COST) {
      toast.error("Not enough credits! Please upgrade to Pro for more credits.");
      return;
    }
    setShowConfirmation(true);
  };

  const handleShowPlans = () => {
    setShowPlans(true);
  };

  const handleExport = async () => {
    try {
      // 1. Call the download-template API with userId from localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('User not logged in. Please log in to download.');
        return;
      }

      // 2. Check current credits
      const response = await fetch(`https://dolphin-app-oxsn4.ondigitalocean.app/api/v1/user/credit/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch credits');
      }
      const data = await response.json();
      const currentCredits = data.credit || 0;

      if (currentCredits < CREDITS_COST) {
        toast.error('Not enough credits available. Please upgrade to continue.');
        return;
      }
      
      toast.success(`${CREDITS_COST} credits used for download`);

      // 3. Proceed to export
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
      
      // 4. Trigger credit refresh after successful download
      triggerCreditsUpdate();
      
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.");
    }
  };

  // Pricing plans screen
  if (showPlans) {
    return (
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title="Upgrade to Download More"
        className="custom-export-dialog plans-dialog"
      >
        <div className="plans-content">
          <div className="plans-header">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="plans-icon">
              <path d="M21 9V3H15" stroke="#00a67e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 3L13.5 10.5" stroke="#00a67e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 21H3V16.5" stroke="#00a67e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 21L10.5 13.5" stroke="#00a67e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.5 3.5C16.0888 5.95575 14.0888 8.04425 11.633 9.45501C9.17726 10.8658 6.37173 11.631 3.5 11.684" stroke="#00a67e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.5 21C13.5 21 15.5 17 20.5 15.5" stroke="#00a67e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>Upgrade Your Plan</h2>
            <p>Get more downloads and premium features with our subscription plans</p>
          </div>

          <div className="plans-grid">
            {pricingPlans.map((plan) => (
              <div key={plan._id} className={`plan-card ${plan.name === "Popular Plan" ? "popular" : ""}`}>
                {plan.name === "Popular Plan" && <div className="popular-badge">POPULAR</div>}
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    <span className="original-price">₹{plan.price}</span>
                    <span className="offer-price">₹{plan.offerPrice}</span>
                  </div>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feature, index) => (
                    <li key={index}>
                      <Check size={16} className="feature-icon" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="plan-button">
                  {plan.name === "Pro Plan" ? (
                    <Crown size={16} className="plan-btn-icon" />
                  ) : plan.name === "Popular Plan" ? (
                    <Star size={16} className="plan-btn-icon" />
                  ) : null}
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>

          <div className="plans-footer">
            <button className="back-to-export" onClick={() => setShowPlans(false)}>
              Back to Download
            </button>
          </div>
        </div>
      </Dialog>
    );
  }

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
          <div className="credits-info">
            <div className="credits-icon">
              <Coins size={24} />
            </div>
            <div className="credits-text">
              <p>Available Credits: <span className="credit-count">{credits}</span></p>
              <p>Cost to Download: <span className="credit-cost">{CREDITS_COST} credits</span></p>
            </div>
          </div>

          <div className="export-form">
            <div className="form-group">
              <label>File Name</label>
              <InputGroup
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name"
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
              className={`proceed-button ${credits < CREDITS_COST ? 'disabled' : ''}`}
              onClick={handleProceed}
              disabled={credits < CREDITS_COST}
            >
              <Download size={18} />
              Proceed
            </button>
          </div>
          
          {credits < CREDITS_COST && (
            <div className="not-enough-credits">
              <AlertTriangle size={18} />
              <span>Not enough credits. You need {CREDITS_COST} credits to download.</span>
              <button className="upgrade-btn" onClick={handleShowPlans}>Upgrade</button>
            </div>
          )}
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
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
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
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
            />
          </svg>
          
          <div className="credits-badge">
            <Coins size={16} className="coins-icon" />
            <span>{CREDITS_COST}</span>
          </div>
        </div>
        
        <h2>Confirm Download</h2>
        
        <p className="confirmation-message">
          You're about to use <strong>{CREDITS_COST} credits</strong> to download this template.
          You currently have <strong>{credits} credits</strong> available.
        </p>
        
        <p className="file-info">
          File will be downloaded as: <strong>{fileName}.{fileFormat === "Normal JPG" ? "jpg" : fileFormat === "Normal PNG" ? "png" : "pdf"}</strong>
        </p>
        
        <div className="confirmation-actions">
          <button className="back-button" onClick={() => setShowConfirmation(false)}>
            Go Back
          </button>
          <button className="download-button" onClick={handleExport}>
            <Download size={18} />
            Download Now
          </button>
        </div>
      </div>
    </Dialog>
  );
};

// Helper function to get default file name
function getDefaultFileName(store) {
  const firstPage = store.pages[0];

  // Check if the page has a custom property with a template name
  if (firstPage?.custom?.templateName) {
    return firstPage.custom.templateName.replace(/[^a-zA-Z0-9]/g, "_");
  }

  // Fallback: Look for a text element with meaningful content
  if (firstPage && firstPage.children.length > 0) {
    const textElements = firstPage.children.filter(
      (child) => child.type === "text" && child.text && child.text.trim() !== ""
    );
    if (textElements.length > 0) {
      const firstText = textElements[0].text.split("\n")[0].trim();
      return firstText.replace(/[^a-zA-Z0-9]/g, "_") || "template_design";
    }
  }

  // Fallback to a timestamp-based default name
  return `template_${new Date().toISOString().split("T")[0].replace(/-/g, "_")}`;
}

export default ExportDialog;