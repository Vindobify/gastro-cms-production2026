'use client';

import { useEffect, useRef } from 'react';

interface CanonicalTagProps {
  path: string;
}

export default function CanonicalTag({ path }: CanonicalTagProps) {
  const canonicalRef = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    // Cleanup previous canonical tag if exists
    if (canonicalRef.current && canonicalRef.current.parentNode) {
      canonicalRef.current.parentNode.removeChild(canonicalRef.current);
      canonicalRef.current = null;
    }

    // Create new canonical tag with defensive DOM manipulation
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${path.startsWith('/') ? path : `/${path}`}`;
    
    // Store reference and append safely
    canonicalRef.current = canonical;
    if (document.head) {
      document.head.appendChild(canonical);
    }

    // Cleanup on unmount
    return () => {
      if (canonicalRef.current && canonicalRef.current.parentNode) {
        try {
          canonicalRef.current.parentNode.removeChild(canonicalRef.current);
        } catch (error) {
          // Ignore errors if element was already removed
        }
        canonicalRef.current = null;
      }
    };
  }, [path]);

  return null;
}
