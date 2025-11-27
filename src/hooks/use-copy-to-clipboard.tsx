'use client';

import { useState, useCallback, useEffect } from 'react';

export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback((text: string) => {
    if (typeof navigator?.clipboard?.writeText !== 'function') {
      console.warn('Clipboard API not available');
      return;
    }

    navigator.clipboard.writeText(text)
      .then(() => setIsCopied(true))
      .catch((err) => console.error('Failed to copy text: ', err));
  }, []);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000); // Reset after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return { isCopied, copyToClipboard };
}
