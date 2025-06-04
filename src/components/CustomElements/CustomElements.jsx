import React, { useState, useEffect, useRef } from 'react';
import { SectionTab } from 'polotno/side-panel';
import { Shapes } from 'lucide-react';
import { Spinner, Button } from '@blueprintjs/core';

const CATEGORIES = [
  'Basic',
  'Arrows',
  'Symbols',
  'Decorations',
  'Flowchart',
  'Callouts',
];

const PAGE_SIZE = 20; // Adjust as needed

const fetchShapes = async (category, page) => {
  const url = category
    ? `https://dolphin-app-oxsn4.ondigitalocean.app/api/v1/admin/shapes?category=${category}&page=${page}&limit=${PAGE_SIZE}`
    : `https://dolphin-app-oxsn4.ondigitalocean.app/api/v1/admin/shapes?page=${page}&limit=${PAGE_SIZE}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch shapes');
  return res.json();
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
      border: '1px solid #eee',
      borderRadius: 8,
      background: '#fafbfc',
      transition: 'box-shadow 0.2s',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      margin: 'auto',
    }}
  >
    <img
      src={src}
      alt={alt}
      style={{
        width: '90%',
        height: '90%',
        objectFit: 'contain',
        pointerEvents: 'none',
      }}
    />
  </div>
);

const ShapeGrid = ({ shapes, onAddShape, onScroll, loading, hasMore }) => {
  const gridRef = useRef();

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (!gridRef.current || !hasMore || loading) return;
      const { scrollTop, scrollHeight, clientHeight } = gridRef.current;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        onScroll();
      }
    };
    const grid = gridRef.current;
    if (grid) grid.addEventListener('scroll', handleScroll);
    return () => {
      if (grid) grid.removeEventListener('scroll', handleScroll);
    };
  }, [onScroll, hasMore, loading]);

  return (
    <div
      ref={gridRef}
      style={{
        height: 400,
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: 16,
        padding: 8,
        background: '#fff',
        borderRadius: 8,
        border: '1px solid #eee',
        marginTop: 16,
        position: 'relative',
      }}
    >
      {Object.entries(shapes).map(([name, svg]) => (
        <ShapeButton
          key={name}
          src={svg}
          alt={name}
          onClick={() => onAddShape(svg)}
        />
      ))}
      {loading && (
        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 16 }}>
          <Spinner size={24} />
        </div>
      )}
    </div>
  );
};

const CustomElements = {
  name: 'custom-elements',
  Tab: (props) => (
    <SectionTab name="Elements" {...props}>
      <Shapes size={20} />
    </SectionTab>
  ),
  Panel: ({ store }) => {
    const [category, setCategory] = useState('Basic');
    const [shapes, setShapes] = useState({});
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch shapes on category or page change
    useEffect(() => {
      let ignore = false;
      const loadShapes = async () => {
        setLoading(true);
        setError('');
        try {
          const data = await fetchShapes(category, page);
          // The API returns { category: { name: svg, ... }, ... }
          const catKey = category.toLowerCase();
          const newShapes = data[catKey] || {};
          setShapes((prev) =>
            page === 1 ? newShapes : { ...prev, ...newShapes }
          );
          setHasMore(Object.keys(newShapes).length === PAGE_SIZE);
        } catch (err) {
          setError('Failed to load shapes');
        } finally {
          if (!ignore) setLoading(false);
        }
      };
      loadShapes();
      return () => {
        ignore = true;
      };
    }, [category, page]);

    // Reset page and shapes when category changes
    useEffect(() => {
      setPage(1);
      setShapes({});
      setHasMore(true);
    }, [category]);

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

    const handleScroll = () => {
      if (!loading && hasMore) {
        setPage((p) => p + 1);
      }
    };

    return (
      <div style={{ padding: 16, height: '100%', background: '#f7f8fa' }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Custom Elements</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
              style={{
                borderRadius: 20,
                fontWeight: 500,
                background: category === cat ? '#00a67e' : '#fff',
                color: category === cat ? '#fff' : '#333',
                border: '1px solid #00a67e',
                boxShadow: category === cat ? '0 2px 8px #00a67e22' : 'none',
                padding: '4px 16px',
              }}
            >
              {cat}
            </Button>
          ))}
        </div>
        {error && (
          <div style={{ color: 'red', margin: '16px 0', textAlign: 'center' }}>
            {error}
          </div>
        )}
        <ShapeGrid
          shapes={shapes}
          onAddShape={addShape}
          onScroll={handleScroll}
          loading={loading}
          hasMore={hasMore}
        />
      </div>
    );
  },
};

export default CustomElements;