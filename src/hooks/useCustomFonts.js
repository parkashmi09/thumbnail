import { useEffect } from 'react';
import { addGlobalFont } from 'polotno/config';

const useCustomFonts = () => {
  useEffect(() => {
    addGlobalFont(
      {
      fontFamily: 'CustomFont',
      styles: [
        { src: 'url(/fonts/Khand-Regular.ttf)', fontStyle: 'normal', fontWeight: 'normal' },
        { src: 'url(/fonts/Khand-Bold.ttf)', fontStyle: 'normal', fontWeight: 'bold' },
        { src: 'url(/fonts/Khand-Light.ttf)', fontStyle: 'normal', fontWeight: 300 },
        { src: 'url(/fonts/Khand-Medium.ttf)', fontStyle: 'normal', fontWeight: 500 },
        { src: 'url(/fonts/Khand-SemiBold.ttf)', fontStyle: 'normal', fontWeight: 600 },
      ],
    }
  );
  }, []);
};

export default useCustomFonts; 