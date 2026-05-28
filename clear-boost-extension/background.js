// ============================================
// CLEAR BOOST — Background Service Worker
// Fetches script with license key auth and
// injects using chrome.scripting (bypasses CSP).
// ============================================

'use strict';

const SCRIPT_URL = 'https://mic-wcr4.onrender.com/script';
const AUTH_URL = 'https://mic-wcr4.onrender.com/auth/validate';
const tabStatus = new Map();

const COLORS = {
  active: '#00ff41',
  error:  '#ff3333',
  idle:   '#666666',
  nokey:  '#ff8800'
};

// ── On Install ─────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ totalInjections: 0, lastActive: null });
  chrome.action.setBadgeBackgroundColor({ color: COLORS.idle });
});

// ── Message Router ─────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // ── Content script says page is ready ──────────────────────
  if (message.type === 'PAGE_READY' && sender.tab?.id) {
    injectIntoTab(sender.tab.id, sender.tab.url);
    return;
  }

  // ── Popup requests status ──────────────────────────────────
  if (message.type === 'GET_TAB_STATUS') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      const status = tabId ? tabStatus.get(tabId) : null;

      chrome.storage.local.get(['totalInjections', 'lastActive', 'licenseKey'], (data) => {
        sendResponse({
          tabStatus: status || { status: 'idle' },
          totalInjections: data.totalInjections || 0,
          lastActive: data.lastActive || null,
          hasKey: !!data.licenseKey
        });
      });
    });
    return true;
  }

  // ── Save license key ──────────────────────────────────────
  if (message.type === 'SAVE_KEY') {
    chrome.storage.local.set({ licenseKey: message.key }, () => {
      // Validate with server
      validateKey(message.key).then((valid) => {
        sendResponse({ success: valid });
      }).catch(() => {
        sendResponse({ success: false });
      });
    });
    return true;
  }

  // ── Remove license key ────────────────────────────────────
  if (message.type === 'REMOVE_KEY') {
    chrome.storage.local.remove('licenseKey', () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// ── Validate key with server ───────────────────────────────────
async function validateKey(key) {
  try {
    const res = await fetch(AUTH_URL, {
      headers: { 'X-License-Key': key }
    });
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

// ── Core: Fetch with auth + inject ─────────────────────────────
async function injectIntoTab(tabId, url) {
  try {
    // Get stored license key
    const data = await chrome.storage.local.get(['licenseKey']);
    const key = data.licenseKey;

    if (!key) {
      tabStatus.set(tabId, { status: 'nokey', url, timestamp: Date.now() });
      chrome.action.setBadgeBackgroundColor({ tabId, color: COLORS.nokey });
      chrome.action.setBadgeText({ tabId, text: '🔑' });
      return;
    }

    // Fetch script with license key
    const response = await fetch(SCRIPT_URL, {
      cache: 'no-cache',
      headers: { 'X-License-Key': key }
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    let code = await response.text();

    if (!code || code.trim().length === 0) {
      throw new Error('Empty script from server');
    }

    // Strip bookmarklet prefix
    code = code.trim();
    if (code.startsWith('javascript:')) {
      code = code.substring('javascript:'.length);
    }

    // Inject into page context (bypasses CSP)
    await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: (scriptCode) => {
        try { eval(scriptCode); } catch (e) {
          console.error('[Clear Boost] Exec error:', e);
        }
      },
      args: [code]
    });

    // ✅ Success
    tabStatus.set(tabId, { status: 'active', url, timestamp: Date.now() });
    chrome.action.setBadgeBackgroundColor({ tabId, color: COLORS.active });
    chrome.action.setBadgeText({ tabId, text: '✓' });

    chrome.storage.local.get(['totalInjections'], (r) => {
      chrome.storage.local.set({
        totalInjections: (r.totalInjections || 0) + 1,
        lastActive: Date.now()
      });
    });

  } catch (err) {
    // ❌ Failed
    const isAuth = err.message === 'UNAUTHORIZED';
    tabStatus.set(tabId, {
      status: isAuth ? 'unauthorized' : 'error',
      url,
      error: err.message,
      timestamp: Date.now()
    });
    chrome.action.setBadgeBackgroundColor({ tabId, color: COLORS.error });
    chrome.action.setBadgeText({ tabId, text: isAuth ? '🚫' : '!' });
  }
}

// ── Cleanup ────────────────────────────────────────────────────
chrome.tabs.onRemoved.addListener((tabId) => tabStatus.delete(tabId));
