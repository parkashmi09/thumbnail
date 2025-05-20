import React from 'react';
// import './Loader.css';

const Loader = ({ text = "Loading...", size = "default" }) => {
  const loaderClass = size === "small" ? "loader-small" : "the-loader";
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      padding: '20px 0'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className={loaderClass}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        {/* {text && <div className="loader-text">{text}</div>} */}
      </div>
    </div>
  );
};

export default Loader; 