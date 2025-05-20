import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const AccordionItem = ({ title, icon, children, isOpen, onToggle }) => {
  return (
    <div className="accordion-item">
      <button className="accordion-header" onClick={onToggle}>
        <div className="accordion-title">
          {icon && <span className="accordion-icon">{icon}</span>}
          <span>{title}</span>
        </div>
        {children && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
      </button>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
};

export default React.memo(AccordionItem);