/*
 * PURPOSE: Global toast notification — shows brief messages when items are added to cart.
 *
 * HOW IT WORKS:
 * This component maintains a single global instance. Any file can import showToast
 * and call it with a message. The toast appears with a slide-up animation and auto-
 * hides after 2.5 seconds.
 *
 * WHY useRef for timer: clearTimeout needs the timeout ID. useRef doesn't trigger re-renders
 * when updated (unlike useState), so it's the right choice for timer IDs.
 */
import React, { useState, useRef } from 'react';

// Global registry — one function reference all components can call
let globalShowToast = null;

/**
 * Call this function from anywhere to show a toast notification.
 * @param {string} message - The message to display
 */
export function showToast(message) {
  if (globalShowToast) {
    globalShowToast(message);
  }
}

export default function Toast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  // Register the global show function on mount
  React.useEffect(() => {
    globalShowToast = (msg) => {
      // If already animating, clear the old timer first
      if (timerRef.current) clearTimeout(timerRef.current);

      setMessage(msg);
      setVisible(true);
      timerRef.current = setTimeout(() => setVisible(false), 2500);
    };

    return () => {
      globalShowToast = null;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className={`toast ${visible ? 'show' : 'hidden'}`}>
      {message}
    </div>
  );
}
