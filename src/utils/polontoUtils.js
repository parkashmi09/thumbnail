import React from 'react';

export const svgToURL = async (svgText) => {
  return `data:image/svg+xml;base64,${btoa(svgText)}`;
};

// Get image dimensions
export const getImageSize = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error('Failed to load image'));
  });
};

// Custom infinite scroll hook for API calls
export const useInfiniteAPI = ({ getAPI, getSize, defaultQuery = '' }) => {
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [query, setQuery] = React.useState(defaultQuery);
  const [hasMore, setHasMore] = React.useState(true);
  const [error, setError] = React.useState(null);

  const loadData = async (pageNum, queryVal) => {
    setIsLoading(true);
    try {
      const response = await fetch(getAPI({ page: pageNum, query: queryVal }));
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData((prev) => [...prev, result]);
      const totalPages = getSize(result);
      setHasMore(pageNum < totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    setData([]);
    setPage(1);
    loadData(1, query);
  }, [query]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, query);
  };

  return { data, isLoading, loadMore, setQuery, hasMore, error };
};

// Polotno API base URL
export const getAPI = () => {
  return 'https://api.polotno.com';
};

// Polotno API key
export const getKey = () => {
  return 'nFA5H9elEytDyPyvKL7T';
};

// Simple translation function
export const t = (key) => {
  const translations = {
    'sidePanel.searchPlaceholder': 'Search icons...',
    'sidePanel.icons': 'Icons',
  };
  return translations[key] || key;
};
