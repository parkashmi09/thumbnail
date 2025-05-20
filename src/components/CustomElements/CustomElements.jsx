import React, { useState } from 'react';
import { Tabs, Tab } from '@blueprintjs/core';
import { SectionTab } from 'polotno/side-panel';
import { Shapes } from 'lucide-react'; // Import Shapes icon from React Lucide

// SVG data URLs for shapes
const SHAPES = {
  basic: {
    circle: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%239ACD32"/></svg>`,
    triangle: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%238A2BE2" d="M12 2L2 22h20L12 2z"/></svg>`,
    star: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23FFD700" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
  },
  decorative: {
    heart: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23FF6347" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    spiral: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path stroke="%234682B4" stroke-width="2" fill="none" d="M50 50 C55 50, 60 55, 60 60 C60 65, 55 70, 50 70 C45 70, 40 65, 40 60 C40 55, 45 50, 50 50 C60 50, 70 60, 70 70 C70 80, 60 90, 50 90 C40 90, 30 80, 30 70 C30 60, 40 50, 50 50"/></svg>`,
    arrow: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23FF4500" d="M5 13H16.17L11.29 17.88L12.71 19.29L19.71 12.29L12.71 5.29L11.29 6.71L16.17 11.59H5V13Z"/></svg>`,
    moon: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23C0C0C0" d="M12 3a9 9 0 0 0 9 9 9 9 0 0 0-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9m0-2a11 11 0 0 0-11 11 11 11 0 0 0 11 11 11 11 0 0 0 11-11 11 11 0 0 0-11-11z"/></svg>`,
    flower: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23FF69B4" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6c0-1.1-.9-2-2-2h-2v-2h2c1.1 0 2-.9 2-2s-.9-2-2-2h-2V6h2c1.1 0 2-.9 2-2s-.9-2-2-2h-2c-1.1 0-2 .9-2 2v2H8V4c0-1.1-.9-2-2-2s-2 .9-2 2v2H4c-1.1 0-2 .9-2 2s.9 2 2 2h2v2H4c-1.1 0-2 .9-2 2s.9 2 2 2h2v2H4c-1.1 0-2 .9-2 2s.9 2 2 2h2v2c0 1.1.9 2 2 2s2-.9 2-2v-2h4v2c0 1.1.9 2 2 2z"/></svg>`,
  },
};

const ShapeButton = ({ src, alt, onClick }) => (
  <div
    onClick={onClick}
    style={{
      width: '80px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    }}
  >
    <img
      src={src}
      alt={alt}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
    />
  </div>
);

const ShapeGrid = ({ shapes, onAddShape }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' }}>
    {Object.entries(shapes).map(([name, svg]) => (
      <ShapeButton
        key={name}
        src={svg}
        alt={name}
        onClick={() => onAddShape(svg)}
      />
    ))}
  </div>
);

const CustomElements = {
  name: 'custom-elements',
  Tab: (props) => (
    <SectionTab name="Elements" {...props}>
      <Shapes size={20} /> {/* Using React Lucide Shapes icon */}
    </SectionTab>
  ),
  Panel: ({ store }) => {
    const [selectedTab, setSelectedTab] = useState('basic-shapes');

    const addShape = (shapeSvg) => {
      const page = store.activePage || store.addPage();
      try {
        page.addElement({
          type: 'svg',
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          src: shapeSvg,
        });
      } catch (error) {
        console.error('Failed to add shape:', error);
      }
    };

    return (
      <div style={{ padding: '10px', height: '100%', overflowY: 'auto' }}>
        <h3>Custom Elements</h3>
        <Tabs
          id="element-tabs"
          selectedTabId={selectedTab}
          onChange={(newTabId) => setSelectedTab(newTabId)}
          renderActiveTabPanelOnly
        >
          <Tab
            id="basic-shapes"
            title="Basic Shapes"
            panel={<ShapeGrid shapes={SHAPES.basic} onAddShape={addShape} />}
          />
          <Tab
            id="decorative"
            title="Decorative"
            panel={<ShapeGrid shapes={SHAPES.decorative} onAddShape={addShape} />}
          />
        </Tabs>
      </div>
    );
  },
};

export default CustomElements;