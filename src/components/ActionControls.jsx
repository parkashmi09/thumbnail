import React, { useState } from 'react';
import { Button, Divider } from '@blueprintjs/core';
import ExportDialog from './ExportDialog/ExportDialog';

const ActionControls = React.memo(({ store }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <button
        intent="primary"
        style={{
          background: 'linear-gradient(90deg, #00291b 0%, #00a67e 100%)',
          color: '#fff',
          borderRadius: '5px',
          padding: '5px 15px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
        onClick={() => setIsDialogOpen(true)}
      >
        Download
      </button>
      <ExportDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        store={store}
      />
    </>
  );
});

export default ActionControls; 