// ============================================
// CLEAR BOOST — Popup Controller
// Handles license key activation + status display
// ============================================

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const statusCard  = document.getElementById('statusCard');
  const statusDot   = document.getElementById('statusDot');
  const statusLabel = document.getElementById('statusLabel');
  const injectionCount = document.getElementById('injectionCount');
  const lastActive  = document.getElementById('lastActive');
  const currentPage = document.getElementById('currentPage');
  const authStatus  = document.getElementById('authStatus');

  // Key elements
  const keyInput    = document.getElementById('keyInput');
  const activateBtn = document.getElementById('activateBtn');
  const removeBtn   = document.getElementById('removeBtn');
  const keyInputRow = document.getElementById('keyInputRow');
  const keyActiveRow = document.getElementById('keyActiveRow');
  const keyDisplay  = document.getElementById('keyDisplay');
  const keyStatus   = document.getElementById('keyStatus');

  // ── Load current state ─────────────────────────────────────
  chrome.storage.local.get(['licenseKey'], (data) => {
    if (data.licenseKey) {
      showActiveKey(data.licenseKey);
    } else {
      showKeyInput();
    }
  });

  // ── Request status from background ─────────────────────────
  chrome.runtime.sendMessage({ type: 'GET_TAB_STATUS' }, (response) => {
    if (chrome.runtime.lastError || !response) {
      setStatus('error', 'CONNECTION ERROR');
      return;
    }

    const { tabStatus, totalInjections, lastActive: lastTs, hasKey } = response;

    if (!hasKey) {
      setStatus('nokey', 'KEY REQUIRED');
      authStatus.textContent = 'No key';
      authStatus.style.color = '#ff8800';
    } else if (tabStatus.status === 'active') {
      setStatus('active', 'EXTENSION ACTIVE');
      authStatus.textContent = 'Authorized ✓';
      authStatus.style.color = '#00ff41';
    } else if (tabStatus.status === 'unauthorized') {
      setStatus('error', 'UNAUTHORIZED');
      authStatus.textContent = 'Invalid key';
      authStatus.style.color = '#ff3333';
    } else if (tabStatus.status === 'error') {
      setStatus('error', 'INJECTION FAILED');
      authStatus.textContent = 'Error';
      authStatus.style.color = '#ff3333';
    } else {
      setStatus('idle', 'STANDBY');
      authStatus.textContent = hasKey ? 'Ready' : 'No key';
      authStatus.style.color = hasKey ? '#666' : '#ff8800';
    }

    injectionCount.textContent = totalInjections.toLocaleString();
    lastActive.textContent = lastTs ? formatTimeAgo(lastTs) : '—';
  });

  // ── Get current tab URL ────────────────────────────────────
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.url) {
      try {
        currentPage.textContent = new URL(tabs[0].url).hostname;
      } catch {
        currentPage.textContent = 'N/A';
      }
    }
  });

  // ── Activate key ───────────────────────────────────────────
  activateBtn.addEventListener('click', () => {
    const key = keyInput.value.trim();
    if (!key) {
      showKeyStatus('Enter a key', '#ff3333');
      return;
    }

    activateBtn.textContent = '...';
    activateBtn.disabled = true;

    chrome.runtime.sendMessage({ type: 'SAVE_KEY', key }, (response) => {
      if (response?.success) {
        showKeyStatus('✓ ACTIVATED', '#00ff41');
        showActiveKey(key);
        setStatus('active', 'EXTENSION ACTIVE');
        authStatus.textContent = 'Authorized ✓';
        authStatus.style.color = '#00ff41';
      } else {
        showKeyStatus('✕ INVALID KEY', '#ff3333');
        activateBtn.textContent = 'ACTIVATE';
        activateBtn.disabled = false;
      }
    });
  });

  // ── Enter key to activate ──────────────────────────────────
  keyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') activateBtn.click();
  });

  // ── Remove key ─────────────────────────────────────────────
  removeBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'REMOVE_KEY' }, () => {
      showKeyInput();
      showKeyStatus('Key removed', '#666');
      setStatus('nokey', 'KEY REQUIRED');
      authStatus.textContent = 'No key';
      authStatus.style.color = '#ff8800';
    });
  });

  // ── UI Helpers ─────────────────────────────────────────────
  function showActiveKey(key) {
    keyInputRow.style.display = 'none';
    keyActiveRow.style.display = 'flex';
    // Mask the key: show first 3 and last 4 chars
    const masked = key.substring(0, 3) + '•'.repeat(Math.max(0, key.length - 7)) + key.substring(key.length - 4);
    keyDisplay.textContent = masked;
  }

  function showKeyInput() {
    keyInputRow.style.display = 'flex';
    keyActiveRow.style.display = 'none';
    keyInput.value = '';
    activateBtn.textContent = 'ACTIVATE';
    activateBtn.disabled = false;
  }

  function showKeyStatus(text, color) {
    keyStatus.textContent = text;
    keyStatus.style.color = color;
    setTimeout(() => { keyStatus.textContent = ''; }, 3000);
  }

  function setStatus(state, text) {
    statusCard.className = `status-card ${state}`;
    statusDot.className = `status-indicator ${state}`;
    statusLabel.className = `status-label ${state}`;
    statusLabel.textContent = text;
  }

  function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
});
