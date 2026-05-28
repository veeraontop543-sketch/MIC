// ============================================
// CLEAR BOOST — Content Script
// Signals the background worker to fetch and
// inject the audio processing script.
// ============================================

(function () {
  'use strict';

  // ── Guard: prevent double injection ──────────────────────────
  if (window.__CLEAR_BOOST_INJECTED__) return;
  window.__CLEAR_BOOST_INJECTED__ = true;

  // ── Tell background to inject the script into this tab ──────
  chrome.runtime.sendMessage({ type: 'PAGE_READY' });
})();
