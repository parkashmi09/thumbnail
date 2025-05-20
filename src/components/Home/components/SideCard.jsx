import React, { useState } from "react";
import AccordionItem from "./AccordionItem";

const Sidebar = ({ education }) => {
  const [accordionState, setAccordionState] = useState({});

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

  return (
    <div className="side-card">
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