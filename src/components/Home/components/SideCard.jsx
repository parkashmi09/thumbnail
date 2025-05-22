import React, { useState, useEffect } from "react";
import AccordionItem from "./AccordionItem";

const Sidebar = ({ education }) => {
  const [accordionState, setAccordionState] = useState({});
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  // Update window dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setIsMobile(window.innerWidth <= 900);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleAccordion = (key) => {
    setAccordionState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderAccordion = (data, parentKey = "") => {
    if (!data) return null;

    if (Array.isArray(data)) {
      return data.map((item, index) => {
        const key = `${parentKey}-${index}`;
        const hasChildren = item.boards || item.classes || item.subjects;

        return (
          <AccordionItem
            key={key}
            title={item.name}
            icon={item.icon}
            isOpen={accordionState[key] || false}
            onToggle={() => toggleAccordion(key)}
          >
            {hasChildren && (
              <>
                {item.boards && renderAccordion(item.boards, key)}
                {item.classes && renderAccordion(item.classes, key)}
                {item.subjects && renderAccordion(item.subjects, key)}
              </>
            )}
          </AccordionItem>
        );
      });
    }

    return null;
  };

  // Apply dynamic height only for desktop
  const sideCardStyle = isMobile ? {} : { height: `${windowHeight}px` };

  return (
    <div className="side-card" style={sideCardStyle}>
      <div className="side-card-header">THUMBNAIL GURU</div>
      <div className="sidebar-items">
        {education.map((edu, index) => (
          <div key={index}>{renderAccordion(edu.boards, `edu-${index}`)}</div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Sidebar);