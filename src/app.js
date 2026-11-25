const { invoke } = window.__TAURI__.core;

// --- Inline SVG icons (offline, no external assets) ---

const svgWrap = (paths) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const ICONS = {
  sun: svgWrap('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  moon: svgWrap('<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/>'),
  shield: svgWrap('<path d="M12 3l7 2.8v5.4c0 4.6-3 7.7-7 9.3-4-1.6-7-4.7-7-9.3V5.8L12 3z"/><path d="m9.2 12 2 2 3.8-4"/>'),
  globe: svgWrap('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.3 3.9 5.2 3.9 8.5s-1.3 6.2-3.9 8.5c-2.6-2.3-3.9-5.2-3.9-8.5s1.3-6.2 3.9-8.5z"/>'),
  cookie: svgWrap('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/><circle cx="9" cy="10" r="0.6" fill="currentColor"/><circle cx="14.5" cy="14.5" r="0.6" fill="currentColor"/><circle cx="9.5" cy="15.5" r="0.6" fill="currentColor"/>'),
  checkCircle: svgWrap('<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.4 2.4 4.6-4.8"/>'),
  xCircle: svgWrap('<circle cx="12" cy="12" r="8.5"/><path d="m9 9 6 6M15 9l-6 6"/>'),
  alert: svgWrap('<path d="M12 4 2.5 20h19L12 4z"/><path d="M12 10v4.5M12 17.3h.01"/>'),
  zap: svgWrap('<path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8z"/>'),
  list: svgWrap('<path d="M8.5 6h12M8.5 12h12M8.5 18h12"/><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>'),
  check: svgWrap('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  copy: svgWrap('<rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
  chevron: svgWrap('<path d="m9 6 6 6-6 6"/>'),
  trash: svgWrap('<path d="M4 7h16M9.5 7V5A1.5 1.5 0 0 1 11 3.5h2A1.5 1.5 0 0 1 14.5 5v2M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12"/><path d="M10 11.5v5M14 11.5v5"/>'),
  inbox: svgWrap('<path d="M3 13.5 5.5 5h13L21 13.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.5z"/><path d="M3 13.5h5.5a3.5 3.5 0 0 0 7 0H21"/>'),
  clock: svgWrap('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  search: svgWrap('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'),
  activity: svgWrap('<path d="M3 12h4l3 8 4-16 3 8h4"/>'),
  code: svgWrap('<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>'),
};

// --- Theme (two-state override synced with <meta name="color-scheme">) ---

const themeMeta = document.querySelector('meta[name="color-scheme"]');
const darkMql = window.matchMedia('(prefers-color-scheme: dark)');

function getStoredTheme() {
  try {
    const val = localStorage.getItem('headerlens-theme') || localStorage.getItem('hsc-theme');
    return val === 'light' || val === 'dark' ? val : null;
  } catch {
    return null;
  }
}

function getSystemTheme() {
  return darkMql.matches ? 'dark' : 'light';
}

function getRenderedTheme() {
  return getStoredTheme() || getSystemTheme();
}

function applyThemeFromStorage() {
  const stored = getStoredTheme();
  if (themeMeta) themeMeta.content = stored || 'light dark';
  if (stored) {
    document.documentElement.setAttribute('data-theme', stored);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  updateThemeIcon(getRenderedTheme());
}

applyThemeFromStorage();

document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = getRenderedTheme() === 'dark' ? 'light' : 'dark';
  try {
    localStorage.removeItem('hsc-theme');
    if (next === getSystemTheme()) {
      localStorage.removeItem('headerlens-theme');
    } else {
      localStorage.setItem('headerlens-theme', next);
    }
  } catch {}
  if (themeMeta) themeMeta.content = next === getSystemTheme() ? 'light dark' : next;
  if (next === getSystemTheme()) {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', next);
  }
  updateThemeIcon(next);
});

window.addEventListener('storage', (e) => {
  if (e.key === 'headerlens-theme' || e.key === 'hsc-theme') applyThemeFromStorage();
});

darkMql.addEventListener('change', () => {
  if (!getStoredTheme()) updateThemeIcon(getRenderedTheme());
});

function updateThemeIcon(theme) {
  document.getElementById('theme-icon').innerHTML = theme === 'dark' ? ICONS.moon : ICONS.sun;
}

let scanResult = null;
let scanDualResult = null;
let batchResults = null;
let fileResult = null;

// --- Tabs (ARIA tablist with roving tabindex + arrow-key navigation) ---

const tabs = Array.from(document.querySelectorAll('.tab'));

tabs.forEach(tab => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', e => {
    const i = tabs.indexOf(tab);
    let next = null;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next !== null) {
      e.preventDefault();
      tabs[next].focus();
      activateTab(tabs[next]);
    }
  });
});

function activateTab(tab) {
  tabs.forEach(t => {
    const active = t === tab;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', active ? 'true' : 'false');
    t.tabIndex = active ? 0 : -1;
  });
  const targetId = `tab-${tab.dataset.tab}`;
  document.querySelectorAll('.tab-content').forEach(tc => {
    const isTarget = tc.id === targetId;
    tc.classList.toggle('active', isTarget);
    tc.hidden = !isTarget;
  });
  tab.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' });
  if (tab.dataset.tab === 'history') loadHistory();
}

document.getElementById('toggle-headers-btn').addEventListener('click', () => {
  document.getElementById('custom-headers-section').classList.toggle('hidden');
});

// --- Single Scan ---

document.getElementById('scan-btn').addEventListener('click', scanSingle);
document.getElementById('url-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') scanSingle();
});

async function scanSingle() {
  const rawInput = document.getElementById('url-input').value.trim();
  if (!rawInput) return;
  const followRedirects = document.getElementById('follow-redirects').checked;
  const headersText = document.getElementById('custom-headers').value.trim();
  const customHeaders = headersText ? headersText.split('\n').filter(h => h.trim()) : [];

  const hasExplicitScheme = /^https?:\/\//i.test(rawInput);
  const loadingTextEl = document.getElementById('scan-loading-text');
  const resultsTitleEl = document.getElementById('scan-results-title');

  if (hasExplicitScheme) {
    scanDualResult = null;
    if (loadingTextEl) loadingTextEl.textContent = 'Scanning…';
    if (resultsTitleEl) resultsTitleEl.textContent = 'Results';
    showLoading('scan');
    try {
      const result = await invoke('scan_url', { url: rawInput, followRedirects, customHeaders });
      scanResult = result;
      if (result.error) {
        showError('scan', result.error);
        return;
      }
      showResults('scan', renderSingleResult(result));
      await invoke('save_to_history', { url: rawInput, result });
    } catch (err) {
      showError('scan', err.toString());
    }
    return;
  }

  // Bare domain / host without http:// or https:// -> scan BOTH HTTP & HTTPS and split side-by-side
  const cleanTarget = rawInput.replace(/^:\/\/+/, '').replace(/^\/+/, '');
  if (!cleanTarget) return;
  const httpUrl = `http://${cleanTarget}`;
  const httpsUrl = `https://${cleanTarget}`;

  scanResult = null;
  if (loadingTextEl) loadingTextEl.textContent = 'Scanning HTTP & HTTPS…';
  if (resultsTitleEl) resultsTitleEl.textContent = 'Results — HTTP vs HTTPS';
  showLoading('scan');

  try {
    const [httpRes, httpsRes] = await Promise.all([
      invoke('scan_url', { url: httpUrl, followRedirects, customHeaders }),
      invoke('scan_url', { url: httpsUrl, followRedirects, customHeaders }),
    ]);

    if (httpRes.error && httpsRes.error) {
      scanDualResult = null;
      showError('scan', `HTTP (${httpUrl}): ${httpRes.error}\nHTTPS (${httpsUrl}): ${httpsRes.error}`);
      return;
    }

    scanDualResult = { target: cleanTarget, httpUrl, httpsUrl, http: httpRes, https: httpsRes };
    showResults('scan', renderDualProtocolComparison(scanDualResult));
    requestAnimationFrame(() => {
      alignPanelElements(document.getElementById('scan-split-http'), document.getElementById('scan-split-https'));
    });

    if (!httpRes.error) {
      try { await invoke('save_to_history', { url: httpUrl, result: httpRes }); } catch {}
    }
    if (!httpsRes.error) {
      try { await invoke('save_to_history', { url: httpsUrl, result: httpsRes }); } catch {}
    }
  } catch (err) {
    scanDualResult = null;
    showError('scan', err.toString());
  }
}

// --- Batch Scan (Target file import + Dual HTTP/HTTPS for bare domains + Block UI) ---

function parseBatchTargets(rawText) {
  if (!rawText) return [];
  const seen = new Set();
  const out = [];
  const lines = rawText.split(/\r?\n/);
  for (let idx = 0; idx < lines.length; idx++) {
    let line = lines[idx].trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;
    // Handle simple CSV lines (e.g., "example.com,prod" or "1,https://example.com")
    if (line.includes(',')) {
      const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      const candidate = cols.find(c => /^https?:\/\//i.test(c) || /^[a-z0-9.-]+\.[a-z]{2,}(:\d+)?(\/.*)?$/i.test(c) || /^localhost(:\d+)?/i.test(c));
      if (candidate) line = candidate;
      else if (idx === 0 && /^(url|domain|host|target|site)s?$/i.test(cols[0])) continue;
      else line = cols[0] || '';
    } else if (idx === 0 && /^(url|domain|host|target|site)s?$/i.test(line)) {
      continue;
    }
    if (!line) continue;
    const normKey = /^https?:\/\//i.test(line) ? line : line.replace(/^:\/\/+/, '').replace(/^\/+/, '').toLowerCase();
    if (!normKey || seen.has(normKey)) continue;
    seen.add(normKey);
    out.push(/^https?:\/\//i.test(line) ? line : line.replace(/^:\/\/+/, '').replace(/^\/+/, ''));
  }
  return out;
}

function updateBatchTargetCount() {
  const ta = document.getElementById('batch-urls');
  const badge = document.getElementById('batch-target-count');
  const clearBtn = document.getElementById('batch-clear-btn');
  if (!ta || !badge) return;
  const targets = parseBatchTargets(ta.value);
  const dualCount = targets.filter(t => !/^https?:\/\//i.test(t)).length;
  badge.textContent = dualCount > 0
    ? `${targets.length} target${targets.length === 1 ? '' : 's'} (${dualCount} HTTP+HTTPS)`
    : `${targets.length} target${targets.length === 1 ? '' : 's'}`;
  if (clearBtn) clearBtn.classList.toggle('hidden', !ta.value.trim());
}

function mergeTargetsIntoBatchInput(fileContent) {
  const ta = document.getElementById('batch-urls');
  const existing = parseBatchTargets(ta.value);
  const incoming = parseBatchTargets(fileContent);
  const merged = parseBatchTargets([...existing, ...incoming].join('\n'));
  ta.value = merged.join('\n');
  updateBatchTargetCount();
}

document.getElementById('batch-urls').addEventListener('input', updateBatchTargetCount);

document.getElementById('batch-toggle-headers-btn').addEventListener('click', () => {
  document.getElementById('batch-custom-headers-section').classList.toggle('hidden');
});

document.getElementById('batch-clear-btn').addEventListener('click', () => {
  document.getElementById('batch-urls').value = '';
  updateBatchTargetCount();
});

document.getElementById('batch-load-file-btn').addEventListener('click', async () => {
  try {
    const selected = await window.__TAURI__.dialog.open({
      multiple: false,
      filters: [{ name: 'Target Lists', extensions: ['txt', 'csv', 'list', 'domains', 'log', '*'] }],
    });
    if (selected) {
      const content = await invoke('read_file', { path: selected });
      mergeTargetsIntoBatchInput(content);
    }
  } catch (err) { console.error(err); }
});

function makeBatchFallbackError(url, err) {
  return {
    url,
    error: err.toString(),
    final_url: '',
    status_code: 0,
    http_version: '',
    transport_security: [],
    cors: [],
    cookie_warnings: [],
    present_headers: [],
    missing_headers: [],
    warnings: [],
    all_headers: {},
  };
}

document.getElementById('batch-scan-btn').addEventListener('click', async () => {
  const targets = parseBatchTargets(document.getElementById('batch-urls').value);
  if (!targets.length) return;
  const followRedirects = document.getElementById('batch-follow-redirects').checked;
  const headersText = document.getElementById('batch-custom-headers').value.trim();
  const customHeaders = headersText ? headersText.split('\n').filter(h => h.trim()) : [];

  showLoading('batch');
  const progressText = document.getElementById('batch-progress-text');
  const progressBar = document.getElementById('batch-progress-bar');
  const progressFill = progressBar.querySelector('.progress-fill');
  progressBar.classList.remove('hidden');
  progressFill.style.width = '0%';

  const entries = [];
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const hasScheme = /^https?:\/\//i.test(target);
    progressText.textContent = hasScheme
      ? `Scanning ${i + 1} / ${targets.length} — ${target}…`
      : `Scanning ${i + 1} / ${targets.length} — ${target} (HTTP & HTTPS)…`;
    progressFill.style.width = `${(i / targets.length) * 100}%`;

    if (hasScheme) {
      try {
        const result = await invoke('scan_url', { url: target, followRedirects, customHeaders });
        entries.push({ kind: 'single', target, result });
        if (!result.error) {
          try { await invoke('save_to_history', { url: target, result }); } catch {}
        }
      } catch (err) {
        entries.push({ kind: 'single', target, result: makeBatchFallbackError(target, err) });
      }
    } else {
      const httpUrl = `http://${target}`;
      const httpsUrl = `https://${target}`;
      const [httpRes, httpsRes] = await Promise.all([
        invoke('scan_url', { url: httpUrl, followRedirects, customHeaders }).catch(e => makeBatchFallbackError(httpUrl, e)),
        invoke('scan_url', { url: httpsUrl, followRedirects, customHeaders }).catch(e => makeBatchFallbackError(httpsUrl, e)),
      ]);
      entries.push({ kind: 'dual', target, httpUrl, httpsUrl, http: httpRes, https: httpsRes });
      if (!httpRes.error) {
        try { await invoke('save_to_history', { url: httpUrl, result: httpRes }); } catch {}
      }
      if (!httpsRes.error) {
        try { await invoke('save_to_history', { url: httpsUrl, result: httpsRes }); } catch {}
      }
    }
  }
  progressFill.style.width = '100%';
  batchResults = entries;
  showResults('batch', renderBatchHTML(entries));
});

document.getElementById('export-batch-json-btn').addEventListener('click', async () => {
  if (!batchResults) return;
  downloadText(JSON.stringify(batchResults, null, 2), 'headerlens-batch-report.json', 'application/json');
});

document.getElementById('export-batch-md-btn').addEventListener('click', async () => {
  if (!batchResults) return;
  let md = '# HeaderLens — Batch Security Headers Report\n\n';
  for (const item of batchResults) {
    if (item.kind === 'dual') {
      md += `## ${item.target} (HTTP vs HTTPS)\n\n`;
      md += `### HTTP (${item.httpUrl})\n\n`;
      if (item.http.error) {
        md += `Error: ${item.http.error}\n\n`;
      } else {
        try { md += (await invoke('export_report', { result: item.http, format: 'markdown' })) + '\n\n'; } catch {}
      }
      md += `### HTTPS (${item.httpsUrl})\n\n`;
      if (item.https.error) {
        md += `Error: ${item.https.error}\n\n`;
      } else {
        try { md += (await invoke('export_report', { result: item.https, format: 'markdown' })) + '\n\n'; } catch {}
      }
      md += '---\n\n';
    } else {
      const result = item.result || item;
      if (result.error) {
        md += `## ${result.url || item.target}\n\nError: ${result.error}\n\n---\n\n`;
      } else {
        try {
          const report = await invoke('export_report', { result, format: 'markdown' });
          md += report + '\n---\n\n';
        } catch {}
      }
    }
  }
  downloadText(md, 'headerlens-batch-report.md', 'text/markdown');
});

// --- File Import ---

document.getElementById('browse-file-btn').addEventListener('click', async () => {
  try {
    const selected = await window.__TAURI__.dialog.open({
      multiple: false,
      filters: [{ name: 'Text Files', extensions: ['txt', 'headers', 'http', 'log', '*'] }],
    });
    if (selected) {
      const content = await invoke('read_file', { path: selected });
      document.getElementById('file-content').value = content;
    }
  } catch (err) { console.error(err); }
});

document.getElementById('file-scan-btn').addEventListener('click', async () => {
  const content = document.getElementById('file-content').value.trim();
  if (!content) return;
  showLoading('file');
  try {
    const result = await invoke('scan_file', { content });
    const label = document.getElementById('file-label').value.trim();
    if (label) {
      result.url = label;
      result.final_url = label;
    }
    fileResult = result;
    if (result.error) {
      showError('file', result.error);
      return;
    }
    showResults('file', renderSingleResult(result));
    const historyUrl = label || `file: ${content.split('\n')[0].substring(0, 80)}`;
    await invoke('save_to_history', { url: historyUrl, result });
  } catch (err) {
    showError('file', err.toString());
  }
});

// --- File drag & drop (HTML5 + Tauri native drag-drop events) ---

function fileTabActive() {
  return document.getElementById('tab-file').classList.contains('active');
}

function batchTabActive() {
  return document.getElementById('tab-batch').classList.contains('active');
}

function loadDroppedFileName(name, content) {
  document.getElementById('file-content').value = content;
  const labelInput = document.getElementById('file-label');
  if (!labelInput.value.trim() && name) labelInput.value = name;
}

(function initFileDrop() {
  const dz = document.getElementById('file-drop-zone');
  const bdz = document.getElementById('batch-drop-zone');

  ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => {
    e.preventDefault();
    e.stopPropagation();
    if (fileTabActive()) dz.classList.add('drag-over');
  }));
  dz.addEventListener('dragleave', e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.relatedTarget && dz.contains(e.relatedTarget)) return;
    dz.classList.remove('drag-over');
  });
  dz.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();
    dz.classList.remove('drag-over');
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file || !fileTabActive()) return;
    const reader = new FileReader();
    reader.onload = () => loadDroppedFileName(file.name, String(reader.result || ''));
    reader.readAsText(file);
  });

  if (bdz) {
    ['dragenter', 'dragover'].forEach(ev => bdz.addEventListener(ev, e => {
      e.preventDefault();
      e.stopPropagation();
      if (batchTabActive()) bdz.classList.add('drag-over');
    }));
    bdz.addEventListener('dragleave', e => {
      e.preventDefault();
      e.stopPropagation();
      if (e.relatedTarget && bdz.contains(e.relatedTarget)) return;
      bdz.classList.remove('drag-over');
    });
    bdz.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      bdz.classList.remove('drag-over');
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!file || !batchTabActive()) return;
      const reader = new FileReader();
      reader.onload = () => mergeTargetsIntoBatchInput(String(reader.result || ''));
      reader.readAsText(file);
    });
  }

  // Tauri delivers OS-level file drops as events when dragDropEnabled is on (default).
  try {
    const tauriEvent = window.__TAURI__ && window.__TAURI__.event;
    if (tauriEvent && tauriEvent.listen) {
      tauriEvent.listen('tauri://drag-enter', () => {
        if (fileTabActive()) dz.classList.add('drag-over');
        if (bdz && batchTabActive()) bdz.classList.add('drag-over');
      });
      tauriEvent.listen('tauri://drag-over', () => {
        if (fileTabActive()) dz.classList.add('drag-over');
        if (bdz && batchTabActive()) bdz.classList.add('drag-over');
      });
      tauriEvent.listen('tauri://drag-leave', () => {
        dz.classList.remove('drag-over');
        if (bdz) bdz.classList.remove('drag-over');
      });
      tauriEvent.listen('tauri://drag-drop', async e => {
        dz.classList.remove('drag-over');
        if (bdz) bdz.classList.remove('drag-over');
        const paths = e.payload && e.payload.paths;
        if (!paths || !paths.length) return;
        if (fileTabActive()) {
          try {
            const content = await invoke('read_file', { path: paths[0] });
            loadDroppedFileName(paths[0].split(/[\\/]/).pop(), content);
          } catch (err) { console.error(err); }
        } else if (batchTabActive()) {
          try {
            const chunks = await Promise.all(paths.map(p => invoke('read_file', { path: p })));
            mergeTargetsIntoBatchInput(chunks.join('\n'));
          } catch (err) { console.error(err); }
        }
      });
    }
  } catch (err) { console.error(err); }
})();

// --- Export & copy (scan + file + headers table) ---

document.addEventListener('click', async (e) => {
  const jsonBtn = e.target.closest('.export-json-btn');
  if (jsonBtn) {
    const inScanTab = Boolean(jsonBtn.closest('#tab-scan'));
    if (inScanTab && scanDualResult) {
      const payload = {
        target: scanDualResult.target,
        http: scanDualResult.http,
        https: scanDualResult.https,
      };
      downloadText(JSON.stringify(payload, null, 2), 'headerlens-http-vs-https.json', 'application/json');
      return;
    }
    const result = inScanTab ? scanResult : fileResult;
    if (!result) return;
    try {
      const report = await invoke('export_report', { result, format: 'json' });
      downloadText(report, 'headerlens-report.json', 'application/json');
    } catch (err) { console.error(err); }
    return;
  }

  const mdBtn = e.target.closest('.export-md-btn, .file-export-md-btn');
  if (mdBtn) {
    const inScanTab = Boolean(mdBtn.closest('#tab-scan'));
    if (inScanTab && scanDualResult) {
      try {
        let md = `# HeaderLens — HTTP vs HTTPS Comparison (${scanDualResult.target})\n\n`;
        md += `## HTTP (${scanDualResult.httpUrl})\n\n`;
        if (scanDualResult.http.error) {
          md += `Error: ${scanDualResult.http.error}\n\n`;
        } else {
          md += (await invoke('export_report', { result: scanDualResult.http, format: 'markdown' })) + '\n\n';
        }
        md += `---\n\n## HTTPS (${scanDualResult.httpsUrl})\n\n`;
        if (scanDualResult.https.error) {
          md += `Error: ${scanDualResult.https.error}\n\n`;
        } else {
          md += (await invoke('export_report', { result: scanDualResult.https, format: 'markdown' })) + '\n';
        }
        downloadText(md, 'headerlens-http-vs-https.md', 'text/markdown');
      } catch (err) { console.error(err); }
      return;
    }
    const result = inScanTab ? scanResult : fileResult;
    if (!result) return;
    try {
      const report = await invoke('export_report', { result, format: 'markdown' });
      downloadText(report, 'headerlens-report.md', 'text/markdown');
    } catch (err) { console.error(err); }
    return;
  }

  const fileJsonBtn = e.target.closest('.file-export-json-btn');
  if (fileJsonBtn) {
    if (!fileResult) return;
    try {
      const report = await invoke('export_report', { result: fileResult, format: 'json' });
      downloadText(report, 'headerlens-report.json', 'application/json');
    } catch (err) { console.error(err); }
    return;
  }

  const toggleRawBtn = e.target.closest('.toggle-raw-headers-btn');
  if (toggleRawBtn) {
    const section = toggleRawBtn.closest('.result-section');
    if (!section) return;
    const tableBox = section.querySelector('.table-scroll');
    const rawBox = section.querySelector('.raw-http-scroll');
    if (!tableBox || !rawBox) return;
    const showRaw = rawBox.classList.contains('hidden');
    tableBox.classList.toggle('hidden', showRaw);
    rawBox.classList.toggle('hidden', !showRaw);
    toggleRawBtn.classList.toggle('active', showRaw);
    toggleRawBtn.setAttribute('aria-pressed', showRaw ? 'true' : 'false');

    const grid = section.closest('.compare-grid');
    if (grid) {
      const panels = grid.querySelectorAll('.compare-panel');
      if (panels.length === 2) {
        requestAnimationFrame(() => alignPanelElements(panels[0], panels[1]));
      }
    }
    return;
  }

  const copyBtn = e.target.closest('.copy-headers-btn');
  if (copyBtn) {
    const section = copyBtn.closest('.result-section');
    const rawBox = section ? section.querySelector('.raw-http-scroll') : null;
    let text = '';
    if (rawBox && !rawBox.classList.contains('hidden') && rawBox.dataset.rawHttp) {
      text = rawBox.dataset.rawHttp;
    } else {
      const rows = section ? section.querySelectorAll('.headers-table tbody tr') : [];
      if (!rows.length) return;
      text = Array.from(rows).map(r => {
        const cells = r.querySelectorAll('td');
        if (cells.length < 2) return '';
        const rawVal = cells[1].dataset.rawValue !== undefined ? cells[1].dataset.rawValue : cells[1].textContent.trim();
        return `${cells[0].textContent.trim()}: ${rawVal}`;
      }).filter(Boolean).join('\n');
    }
    if (!text) return;
    await copyText(text);
    const label = copyBtn.querySelector('.copy-label');
    if (label) {
      label.textContent = 'Copied';
      copyBtn.classList.add('copied');
      setTimeout(() => { label.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 1400);
    }
    return;
  }

  const cspTrigger = e.target.closest('.csp-clickable-row');
  if (cspTrigger) {
    openInspectorFromEl(cspTrigger);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    const cspTrigger = e.target.closest && e.target.closest('.csp-clickable-row');
    if (cspTrigger && e.target === cspTrigger) {
      e.preventDefault();
      openInspectorFromEl(cspTrigger);
    }
  }
});

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch {}
    ta.remove();
  }
}

// --- Compare ---

document.querySelectorAll('.compare-headers-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.target).classList.toggle('hidden');
  });
});

document.getElementById('compare-file-toggle-headers-btn').addEventListener('click', () => {
  document.getElementById('compare-file-custom-headers-section').classList.toggle('hidden');
});

document.querySelectorAll('.compare-mode').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.compare-mode').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.compare-mode-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`compare-mode-${btn.dataset.mode}`).classList.add('active');
    document.getElementById('compare-results').classList.add('hidden');
    if (btn.dataset.mode === 'history') loadCompareHistoryPicker();
    if (btn.dataset.mode === 'hist-vs-hist') loadHistVsHistPickers();
  });
});

// --- Compare History Pickers (URL vs History + History vs History) ---

let compareHistoryCache = [];
let selectedHistoryEntry = null;
let selectedHvhEntryA = null;
let selectedHvhEntryB = null;

function renderHistoryPickerItems(listEl, searchInputEl, entries, getSelected, onSelect) {
  const query = ((searchInputEl && searchInputEl.value) || '').toLowerCase();
  const filtered = query ? entries.filter(e => e.url.toLowerCase().includes(query)) : entries;
  if (!filtered.length) {
    listEl.innerHTML = emptyState('inbox', 'No history entries', query ? 'No entries match your search.' : 'Run a scan first to build history.', true);
    return;
  }
  const currentSel = getSelected();
  listEl.innerHTML = filtered.map(e => {
    const score = e.result.error ? 0 : calculateScore(e.result);
    const chipCls = scoreToChipClass(score, Boolean(e.result.error));
    const sel = currentSel && currentSel.id === e.id ? ' selected' : '';
    const isFile = e.url.startsWith('file:');
    const isHttps = /^https:\/\//i.test(e.url);
    const protoBadge = isFile
      ? '<span class="proto-badge">FILE</span>'
      : `<span class="proto-badge ${isHttps ? 'proto-https' : 'proto-http'}">${isHttps ? 'HTTPS' : 'HTTP'}</span>`;
    return `<div class="compare-hist-item${sel}" data-hist-id="${esc(e.id)}">
      <div class="hist-item-url">${protoBadge} ${esc(e.url)}</div>
      <div class="hist-item-meta">
        <span class="csp-mini-chip ${chipCls}">Score ${score} · ${scoreGrade(score)}</span>
        <span class="csp-mini-chip">${esc(formatDate(e.timestamp))}</span>
      </div>
    </div>`;
  }).join('');

  listEl.querySelectorAll('.compare-hist-item').forEach(el => {
    el.addEventListener('click', () => {
      const chosen = compareHistoryCache.find(e => e.id === el.dataset.histId) || null;
      onSelect(chosen);
      listEl.querySelectorAll('.compare-hist-item').forEach(i => i.classList.remove('selected'));
      el.classList.add('selected');
    });
  });
}

async function loadCompareHistoryPicker() {
  try {
    compareHistoryCache = await invoke('get_history');
    renderCompareHistPicker(compareHistoryCache);
  } catch (err) { console.error(err); }
}

function renderCompareHistPicker(entries) {
  renderHistoryPickerItems(
    document.getElementById('compare-hist-list'),
    document.getElementById('compare-hist-search'),
    entries,
    () => selectedHistoryEntry,
    chosen => { selectedHistoryEntry = chosen; }
  );
}

async function loadHistVsHistPickers() {
  try {
    compareHistoryCache = await invoke('get_history');
    renderHvhPickerA();
    renderHvhPickerB();
  } catch (err) { console.error(err); }
}

function renderHvhPickerA() {
  renderHistoryPickerItems(
    document.getElementById('compare-hvh-list-a'),
    document.getElementById('compare-hvh-search-a'),
    compareHistoryCache,
    () => selectedHvhEntryA,
    chosen => { selectedHvhEntryA = chosen; }
  );
}

function renderHvhPickerB() {
  renderHistoryPickerItems(
    document.getElementById('compare-hvh-list-b'),
    document.getElementById('compare-hvh-search-b'),
    compareHistoryCache,
    () => selectedHvhEntryB,
    chosen => { selectedHvhEntryB = chosen; }
  );
}

document.getElementById('compare-hist-search').addEventListener('input', () => {
  renderCompareHistPicker(compareHistoryCache);
});
document.getElementById('compare-hvh-search-a').addEventListener('input', renderHvhPickerA);
document.getElementById('compare-hvh-search-b').addEventListener('input', renderHvhPickerB);

async function scanCompareUrlSide(rawInput, followRedirects, customHeaders) {
  const hasExplicitScheme = /^https?:\/\//i.test(rawInput);
  if (hasExplicitScheme) {
    const result = await invoke('scan_url', { url: rawInput, followRedirects, customHeaders });
    return {
      isDual: false,
      label: result.final_url || rawInput,
      result,
    };
  }
  const cleanTarget = rawInput.replace(/^:\/\/+/, '').replace(/^\/+/, '');
  const httpUrl = `http://${cleanTarget}`;
  const httpsUrl = `https://${cleanTarget}`;
  const [httpRes, httpsRes] = await Promise.all([
    invoke('scan_url', { url: httpUrl, followRedirects, customHeaders }),
    invoke('scan_url', { url: httpsUrl, followRedirects, customHeaders }),
  ]);
  const defaultProto = httpsRes.error && !httpRes.error ? 'http' : 'https';
  return {
    isDual: true,
    target: cleanTarget,
    activeProto: defaultProto,
    http: { label: httpRes.final_url || httpUrl, result: httpRes },
    https: { label: httpsRes.final_url || httpsUrl, result: httpsRes },
  };
}

function makeSingleCompareSide(result, label) {
  return { isDual: false, label, result };
}

function resolveCompareSide(side) {
  if (!side.isDual) return { label: side.label, result: side.result };
  return side.activeProto === 'http' ? side.http : side.https;
}

let currentCompareState = null;

function buildCompareProtoTabsHTML(sideKey, side) {
  if (!side.isDual) return '';
  const httpRes = side.http.result;
  const httpsRes = side.https.result;
  const sHttp = httpRes.error ? 'ERR' : calculateScore(httpRes);
  const sHttps = httpsRes.error ? 'ERR' : calculateScore(httpsRes);
  return `
    <div class="compare-proto-tabs" role="tablist" aria-label="Protocol selector">
      <button type="button" role="tab" class="compare-proto-tab" data-compare-side="${sideKey}" data-proto="http" aria-selected="${side.activeProto === 'http' ? 'true' : 'false'}">
        HTTP <span class="proto-tab-score">${sHttp}</span>
      </button>
      <button type="button" role="tab" class="compare-proto-tab" data-compare-side="${sideKey}" data-proto="https" aria-selected="${side.activeProto === 'https' ? 'true' : 'false'}">
        HTTPS <span class="proto-tab-score">${sHttps}</span>
      </button>
    </div>`;
}

function renderCompareState() {
  if (!currentCompareState) return;
  const { sideA, sideB } = currentCompareState;
  const curA = resolveCompareSide(sideA);
  const curB = resolveCompareSide(sideB);

  const scoreA = curA.result.error ? 0 : calculateScore(curA.result);
  const scoreB = curB.result.error ? 0 : calculateScore(curB.result);
  const clsA = curA.result.error ? 'score-bad' : (scoreA >= 70 ? 'score-good' : scoreA >= 40 ? 'score-ok' : 'score-bad');
  const clsB = curB.result.error ? 'score-bad' : (scoreB >= 70 ? 'score-good' : scoreB >= 40 ? 'score-ok' : 'score-bad');
  const diff = scoreA - scoreB;
  const diffText = curA.result.error && curB.result.error
    ? 'Both Error'
    : curA.result.error
      ? 'B Wins'
      : curB.result.error
        ? 'A Wins'
        : diff > 0
          ? `A +${diff}`
          : diff < 0
            ? `B +${Math.abs(diff)}`
            : 'Equal';
  const diffCls = curA.result.error && !curB.result.error
    ? clsB
    : curB.result.error && !curA.result.error
      ? clsA
      : diff > 0
        ? clsA
        : diff < 0
          ? clsB
          : '';

  document.getElementById('compare-summary').innerHTML = `
    <div class="vs-side">
      ${buildCompareProtoTabsHTML('sideA', sideA)}
      <div class="score-label" title="${esc(curA.label)}">${esc(curA.label)}</div>
      <div class="vs-score-row">
        <span class="score-value ${clsA}">${curA.result.error ? 'ERR' : scoreA}</span>
        ${curA.result.error ? '' : `<span class="grade-badge grade-sm ${clsA}">${scoreGrade(scoreA)}</span>`}
      </div>
    </div>
    <div class="compare-arrow">
      <div class="vs-badge">VS</div>
      <div class="vs-diff ${diffCls}">${diffText}</div>
    </div>
    <div class="vs-side">
      ${buildCompareProtoTabsHTML('sideB', sideB)}
      <div class="score-label" title="${esc(curB.label)}">${esc(curB.label)}</div>
      <div class="vs-score-row">
        <span class="score-value ${clsB}">${curB.result.error ? 'ERR' : scoreB}</span>
        ${curB.result.error ? '' : `<span class="grade-badge grade-sm ${clsB}">${scoreGrade(scoreB)}</span>`}
      </div>
    </div>`;

  const eitherDual = sideA.isDual || sideB.isDual;
  const renderPanel = (sideKey, side, cur) => {
    const protoBar = side.isDual
      ? `<div class="compare-proto-bar">
          <span class="compare-proto-domain" title="${esc(side.target)}">${esc(side.target)}</span>
          ${buildCompareProtoTabsHTML(sideKey, side)}
        </div>`
      : eitherDual
        ? `<div class="compare-proto-bar">
            <span class="compare-proto-domain" title="${esc(cur.label)}">${esc(cur.label)}</span>
            <span class="csp-mini-chip">Fixed Source</span>
          </div>`
        : '';
    const body = cur.result.error
      ? `<div class="error-message">${ICONS.alert}<span>${esc(cur.result.error)}</span></div>`
      : renderSingleResult(cur.result);
    return protoBar + body;
  };

  document.getElementById('compare-panel-a').innerHTML = renderPanel('sideA', sideA, curA);
  document.getElementById('compare-panel-b').innerHTML = renderPanel('sideB', sideB, curB);

  document.getElementById('compare-loading').classList.add('hidden');
  document.getElementById('compare-results').classList.remove('hidden');
  requestAnimationFrame(alignComparePanels);
}

document.getElementById('tab-compare').addEventListener('click', (e) => {
  const protoTab = e.target.closest('.compare-proto-tab');
  if (!protoTab || !currentCompareState) return;
  const sideKey = protoTab.dataset.compareSide;
  const proto = protoTab.dataset.proto;
  if (currentCompareState[sideKey] && currentCompareState[sideKey].isDual && (proto === 'http' || proto === 'https')) {
    if (currentCompareState[sideKey].activeProto !== proto) {
      currentCompareState[sideKey].activeProto = proto;
      renderCompareState();
    }
  }
});

document.getElementById('compare-hist-btn').addEventListener('click', async () => {
  const url = document.getElementById('compare-hist-url').value.trim();
  if (!url) return;
  if (!selectedHistoryEntry) {
    alert('Please select a history entry to compare against.');
    return;
  }
  const followRedirects = document.getElementById('compare-hist-follow-redirects').checked;
  const headersText = document.getElementById('compare-hist-custom-headers').value.trim();
  const customHeaders = headersText ? headersText.split('\n').filter(h => h.trim()) : [];
  const histLabel = `${selectedHistoryEntry.url} (${formatDate(selectedHistoryEntry.timestamp)})`;

  document.getElementById('compare-loading').classList.remove('hidden');
  document.getElementById('compare-results').classList.add('hidden');

  try {
    const sideA = await scanCompareUrlSide(url, followRedirects, customHeaders);
    const sideB = makeSingleCompareSide(selectedHistoryEntry.result, histLabel);
    currentCompareState = { sideA, sideB };
    renderCompareState();
  } catch (err) {
    showCompareError(err.toString());
  }
});

document.getElementById('compare-hvh-btn').addEventListener('click', () => {
  if (!selectedHvhEntryA || !selectedHvhEntryB) {
    alert('Please select both History Entry A and History Entry B to compare.');
    return;
  }
  const labelA = `${selectedHvhEntryA.url} (${formatDate(selectedHvhEntryA.timestamp)})`;
  const labelB = `${selectedHvhEntryB.url} (${formatDate(selectedHvhEntryB.timestamp)})`;
  currentCompareState = {
    sideA: makeSingleCompareSide(selectedHvhEntryA.result, labelA),
    sideB: makeSingleCompareSide(selectedHvhEntryB.result, labelB),
  };
  renderCompareState();
});

document.getElementById('compare-browse-btn').addEventListener('click', async () => {
  try {
    const selected = await window.__TAURI__.dialog.open({
      multiple: false,
      filters: [{ name: 'Text Files', extensions: ['txt', 'headers', 'http', 'log', '*'] }],
    });
    if (selected) {
      const content = await invoke('read_file', { path: selected });
      document.getElementById('compare-file-content').value = content;
    }
  } catch (err) { console.error(err); }
});

function showCompareError(msg) {
  currentCompareState = null;
  document.getElementById('compare-loading').classList.add('hidden');
  document.getElementById('compare-results').classList.remove('hidden');
  document.getElementById('compare-summary').innerHTML = `<div class="error-message">${ICONS.alert}<span>${esc(msg)}</span></div>`;
  document.getElementById('compare-panel-a').innerHTML = '';
  document.getElementById('compare-panel-b').innerHTML = '';
}

function showCompareResults(resultA, resultB, labelA, labelB) {
  currentCompareState = {
    sideA: makeSingleCompareSide(resultA, labelA),
    sideB: makeSingleCompareSide(resultB, labelB),
  };
  renderCompareState();
}

function alignPanelElements(panelA, panelB) {
  if (!panelA || !panelB) return;
  const stacked = window.innerWidth <= 880;
  // Always align top summary blocks (.score-hero and .meta-info)
  ['.score-hero', '.meta-info'].forEach(selector => {
    const listA = panelA.querySelectorAll(selector);
    const listB = panelB.querySelectorAll(selector);
    listA.forEach(el => { el.style.minHeight = ''; });
    listB.forEach(el => { el.style.minHeight = ''; });
    if (stacked) return;
    const count = Math.min(listA.length, listB.length);
    for (let i = 0; i < count; i++) {
      const h = Math.max(listA[i].offsetHeight, listB[i].offsetHeight) + 'px';
      listA[i].style.minHeight = h;
      listB[i].style.minHeight = h;
    }
  });

  // Only align paired .result-section heights when neither creates a large empty void (<= 110px diff)
  const secA = panelA.querySelectorAll('.result-section');
  const secB = panelB.querySelectorAll('.result-section');
  secA.forEach(el => { el.style.minHeight = ''; });
  secB.forEach(el => { el.style.minHeight = ''; });
  if (stacked) return;
  const secCount = Math.min(secA.length, secB.length);
  for (let i = 0; i < secCount; i++) {
    const hA = secA[i].offsetHeight;
    const hB = secB[i].offsetHeight;
    if (Math.abs(hA - hB) <= 110) {
      const h = Math.max(hA, hB) + 'px';
      secA[i].style.minHeight = h;
      secB[i].style.minHeight = h;
    }
  }
}

function alignComparePanels() {
  alignPanelElements(
    document.getElementById('compare-panel-a'),
    document.getElementById('compare-panel-b')
  );
}

window.addEventListener('resize', () => {
  alignComparePanels();
  alignPanelElements(
    document.getElementById('scan-split-http'),
    document.getElementById('scan-split-https')
  );
  document.querySelectorAll('.batch-result-body.open .compare-grid').forEach(grid => {
    const panels = grid.querySelectorAll('.compare-panel');
    if (panels.length === 2) alignPanelElements(panels[0], panels[1]);
  });
});

function renderDualProtocolComparison(dual, idPrefix = 'scan-split') {
  const { httpUrl, httpsUrl, http: resHttp, https: resHttps } = dual;
  const scoreHttp = resHttp.error ? 0 : calculateScore(resHttp);
  const scoreHttps = resHttps.error ? 0 : calculateScore(resHttps);
  const clsHttp = resHttp.error ? 'score-bad' : (scoreHttp >= 70 ? 'score-good' : scoreHttp >= 40 ? 'score-ok' : 'score-bad');
  const clsHttps = resHttps.error ? 'score-bad' : (scoreHttps >= 70 ? 'score-good' : scoreHttps >= 40 ? 'score-ok' : 'score-bad');

  const diff = scoreHttps - scoreHttp;
  const diffText = resHttp.error
    ? 'HTTPS Only'
    : resHttps.error
      ? 'HTTP Only'
      : diff > 0
        ? `HTTPS +${diff}`
        : diff < 0
          ? `HTTP +${Math.abs(diff)}`
          : 'Equal';
  const diffCls = resHttps.error && !resHttp.error
    ? clsHttp
    : diff > 0 || (resHttp.error && !resHttps.error)
      ? clsHttps
      : diff < 0
        ? clsHttp
        : '';

  const labelHttp = resHttp.final_url || httpUrl;
  const labelHttps = resHttps.final_url || httpsUrl;

  return `
    <div class="compare-summary">
      <div class="vs-side">
        <div class="vs-side-proto"><span class="proto-badge proto-http">HTTP</span></div>
        <div class="score-label" title="${esc(labelHttp)}">${esc(labelHttp)}</div>
        <div class="vs-score-row">
          <span class="score-value ${clsHttp}">${resHttp.error ? 'ERR' : scoreHttp}</span>
          ${resHttp.error ? '' : `<span class="grade-badge grade-sm ${clsHttp}">${scoreGrade(scoreHttp)}</span>`}
        </div>
      </div>
      <div class="compare-arrow">
        <div class="vs-badge">VS</div>
        <div class="vs-diff ${diffCls}">${diffText}</div>
      </div>
      <div class="vs-side">
        <div class="vs-side-proto"><span class="proto-badge proto-https">HTTPS</span></div>
        <div class="score-label" title="${esc(labelHttps)}">${esc(labelHttps)}</div>
        <div class="vs-score-row">
          <span class="score-value ${clsHttps}">${resHttps.error ? 'ERR' : scoreHttps}</span>
          ${resHttps.error ? '' : `<span class="grade-badge grade-sm ${clsHttps}">${scoreGrade(scoreHttps)}</span>`}
        </div>
      </div>
    </div>
    <div class="compare-grid">
      <div class="compare-panel" id="${esc(idPrefix)}-http">
        <div class="split-col-banner is-http">
          <span class="proto-badge proto-http">Plain HTTP</span>
          <span class="split-col-url" title="${esc(labelHttp)}">${esc(labelHttp)}</span>
        </div>
        ${resHttp.error
          ? `<div class="error-message">${ICONS.alert}<span>${esc(resHttp.error)}</span></div>`
          : renderSingleResult(resHttp)}
      </div>
      <div class="compare-panel" id="${esc(idPrefix)}-https">
        <div class="split-col-banner is-https">
          <span class="proto-badge proto-https">Encrypted HTTPS</span>
          <span class="split-col-url" title="${esc(labelHttps)}">${esc(labelHttps)}</span>
        </div>
        ${resHttps.error
          ? `<div class="error-message">${ICONS.alert}<span>${esc(resHttps.error)}</span></div>`
          : renderSingleResult(resHttps)}
      </div>
    </div>`;
}

document.getElementById('compare-btn').addEventListener('click', async () => {
  const urlA = document.getElementById('compare-url-a').value.trim();
  const urlB = document.getElementById('compare-url-b').value.trim();
  if (!urlA || !urlB) return;
  const followRedirects = document.getElementById('compare-follow-redirects').checked;
  const parseHeaders = id => (document.getElementById(id).value.trim()).split('\n').filter(h => h.trim());
  const customHeadersA = parseHeaders('compare-custom-headers-a');
  const customHeadersB = parseHeaders('compare-custom-headers-b');

  document.getElementById('compare-loading').classList.remove('hidden');
  document.getElementById('compare-results').classList.add('hidden');

  try {
    const [sideA, sideB] = await Promise.all([
      scanCompareUrlSide(urlA, followRedirects, customHeadersA),
      scanCompareUrlSide(urlB, followRedirects, customHeadersB),
    ]);
    currentCompareState = { sideA, sideB };
    renderCompareState();
  } catch (err) {
    showCompareError(err.toString());
  }
});

document.getElementById('compare-file-btn').addEventListener('click', async () => {
  const url = document.getElementById('compare-file-url').value.trim();
  const content = document.getElementById('compare-file-content').value.trim();
  if (!url || !content) return;
  const followRedirects = document.getElementById('compare-file-follow-redirects').checked;
  const label = document.getElementById('compare-file-label').value.trim() || 'File Headers';
  const fileHeadersText = document.getElementById('compare-file-custom-headers').value.trim();
  const fileCustomHeaders = fileHeadersText ? fileHeadersText.split('\n').filter(h => h.trim()) : [];

  document.getElementById('compare-loading').classList.remove('hidden');
  document.getElementById('compare-results').classList.add('hidden');

  try {
    const [sideA, resultB] = await Promise.all([
      scanCompareUrlSide(url, followRedirects, fileCustomHeaders),
      invoke('scan_file', { content }),
    ]);
    resultB.url = label;
    resultB.final_url = label;
    currentCompareState = {
      sideA,
      sideB: makeSingleCompareSide(resultB, label),
    };
    renderCompareState();
  } catch (err) {
    showCompareError(err.toString());
  }
});

document.getElementById('export-compare-json-btn').addEventListener('click', () => {
  if (!currentCompareState) return;
  const curA = resolveCompareSide(currentCompareState.sideA);
  const curB = resolveCompareSide(currentCompareState.sideB);
  const payload = {
    sideA: { label: curA.label, result: curA.result },
    sideB: { label: curB.label, result: curB.result },
  };
  downloadText(JSON.stringify(payload, null, 2), 'headerlens-compare-report.json', 'application/json');
});

document.getElementById('export-compare-md-btn').addEventListener('click', async () => {
  if (!currentCompareState) return;
  const curA = resolveCompareSide(currentCompareState.sideA);
  const curB = resolveCompareSide(currentCompareState.sideB);
  try {
    let md = `# HeaderLens — Side-by-Side Comparison\n\n`;
    md += `## Side A — ${curA.label}\n\n`;
    md += curA.result.error
      ? `Error: ${curA.result.error}\n\n`
      : (await invoke('export_report', { result: curA.result, format: 'markdown' })) + '\n\n';
    md += `---\n\n## Side B — ${curB.label}\n\n`;
    md += curB.result.error
      ? `Error: ${curB.result.error}\n\n`
      : (await invoke('export_report', { result: curB.result, format: 'markdown' })) + '\n';
    downloadText(md, 'headerlens-compare-report.md', 'text/markdown');
  } catch (err) { console.error(err); }
});

// Enter key triggers the relevant compare action.
[['compare-url-a', 'compare-btn'], ['compare-url-b', 'compare-btn'],
 ['compare-file-url', 'compare-file-btn'], ['compare-hist-url', 'compare-hist-btn']]
  .forEach(([inputId, btnId]) => {
    document.getElementById(inputId).addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById(btnId).click();
    });
  });

function downloadText(text, filename, mime) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// --- History ---

document.getElementById('clear-history-btn').addEventListener('click', async () => {
  if (!confirm('Clear all scan history?')) return;
  try { await invoke('clear_history'); loadHistory(); } catch (err) { console.error(err); }
});

let activeHistoryId = null;
let historyCache = [];

document.getElementById('history-search').addEventListener('input', () => {
  renderHistoryList(historyCache);
});

async function loadHistory() {
  try {
    historyCache = await invoke('get_history');
    activeHistoryId = null;
    renderHistoryList(historyCache);
  } catch (err) { console.error(err); }
}

function renderHistoryList(history) {
  const container = document.getElementById('history-list');
  const query = (document.getElementById('history-search').value || '').toLowerCase();
  const filtered = query ? history.filter(e => e.url.toLowerCase().includes(query)) : history;

  if (!filtered.length) {
    container.innerHTML = query
      ? emptyState('search', 'No matching results', 'Try a different URL filter.')
      : emptyState('clock', 'No scan history yet', 'Scans you run will appear here, grouped by URL with version history.');
    return;
  }

  const groups = new Map();
  for (const entry of filtered) {
    const key = entry.url;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }

  const latestScores = [];
  for (const [, entries] of groups) {
    if (!entries[0].result.error) latestScores.push(calculateScore(entries[0].result));
  }
  const avgScore = latestScores.length
    ? Math.round(latestScores.reduce((a, b) => a + b, 0) / latestScores.length)
    : 0;
  const avgCls = avgScore >= 70 ? 'mp-green' : avgScore >= 40 ? 'mp-yellow' : 'mp-red';

  let html = `
    <div class="batch-summary-bar">
      <div class="batch-summary-pills">
        <span class="metric-pill mp-neutral">${ICONS.globe} ${groups.size} Target${groups.size === 1 ? '' : 's'}</span>
        <span class="metric-pill mp-neutral">${ICONS.clock} ${filtered.length} Saved Scan${filtered.length === 1 ? '' : 's'}</span>
        ${latestScores.length ? `<span class="metric-pill ${avgCls}">${ICONS.activity} Avg Score: ${avgScore}/100</span>` : ''}
      </div>
    </div>`;

  for (const [url, entries] of groups) {
    const latest = entries[0];
    const score = latest.result.error ? 0 : calculateScore(latest.result);
    const chipCls = scoreToChipClass(score, Boolean(latest.result.error));
    const isFile = url.startsWith('file:') || latest.result.final_url === '(file)';
    const isHttps = /^https:\/\//i.test(url);
    const protoBadge = isFile
      ? '<span class="proto-badge">FILE</span>'
      : `<span class="proto-badge ${isHttps ? 'proto-https' : 'proto-http'}">${isHttps ? 'HTTPS' : 'HTTP'}</span>`;
    const countBadge = entries.length > 1 ? `<span class="csp-mini-chip is-more">${entries.length} scans</span>` : '';

    html += `
      <div class="history-group" data-url="${esc(url)}">
        <div class="history-entry" data-id="${esc(latest.id)}">
          <div class="batch-head-top">
            <div class="batch-head-left">
              ${protoBadge}
              <span class="history-url">${esc(url)}</span>
              ${countBadge}
            </div>
            <div class="batch-head-right">
              ${latest.result.error
                ? '<span class="csp-mini-chip is-danger">Error</span>'
                : `<span class="csp-mini-chip">HTTP ${latest.result.status_code}</span>`}
              <span class="csp-mini-chip ${chipCls}">Score ${score} · ${scoreGrade(score)}</span>
              <span class="csp-mini-chip">${esc(formatDate(latest.timestamp))}</span>
              <button class="history-delete" type="button" onclick="event.stopPropagation(); deleteHistoryEntry('${esc(latest.id)}')" title="Delete entry" aria-label="Delete entry">${ICONS.trash}</button>
              <span class="chevron">${ICONS.chevron}</span>
            </div>
          </div>
          <div class="batch-head-chips">${buildResultOverviewChips(latest.result)}</div>
        </div>
      </div>`;
  }
  container.innerHTML = html;

  container.querySelectorAll('.history-entry').forEach(el => {
    el.addEventListener('click', () => {
      const group = el.closest('.history-group');
      const url = group.dataset.url;
      const entries = groups.get(url);
      let currentEntry = entries.find(h => h.id === el.dataset.id) || entries[0];
      if (!currentEntry) return;

      const existing = container.querySelector('.history-detail-inline');

      if (activeHistoryId && entries.some(e => e.id === activeHistoryId) && el.classList.contains('selected')) {
        if (existing) existing.remove();
        el.classList.remove('selected');
        activeHistoryId = null;
        return;
      }

      if (existing) existing.remove();
      container.querySelectorAll('.history-entry').forEach(e => e.classList.remove('selected'));

      el.classList.add('selected');
      activeHistoryId = currentEntry.id;

      const detail = document.createElement('div');
      detail.className = 'history-detail-inline';

      let versionsHTML = '';
      if (entries.length > 1) {
        versionsHTML = `<div class="history-versions"><span class="versions-label">Versions:</span>`;
        entries.forEach(e => {
          const s = e.result.error ? 0 : calculateScore(e.result);
          const c = s >= 70 ? 'status-secure' : s >= 40 ? 'status-warning' : 'status-insecure';
          const active = e.id === currentEntry.id ? ' version-active' : '';
          versionsHTML += `<button class="version-btn${active}" type="button" data-version-id="${esc(e.id)}"><span class="${c}">${s} · ${scoreGrade(s)}</span> · ${esc(formatDate(e.timestamp))}</button>`;
        });
        versionsHTML += `</div>`;
      } else {
        versionsHTML = `<div class="history-versions"><span class="versions-label">Scanned ${esc(formatDate(currentEntry.timestamp))}</span></div>`;
      }

      detail.innerHTML = `
        <div class="history-detail-bar">
          ${versionsHTML}
          <div class="export-btns">
            <button class="btn-small hist-export-json-btn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>Export JSON</button>
            <button class="btn-small hist-export-md-btn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>Export Markdown</button>
          </div>
        </div>
        <div class="history-detail-content">${renderSingleResult(currentEntry.result)}</div>`;

      group.insertAdjacentElement('afterend', detail);

      detail.querySelectorAll('.version-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const vEntry = entries.find(e => e.id === btn.dataset.versionId);
          if (!vEntry) return;
          currentEntry = vEntry;
          activeHistoryId = vEntry.id;
          detail.querySelectorAll('.version-btn').forEach(b => b.classList.remove('version-active'));
          btn.classList.add('version-active');
          detail.querySelector('.history-detail-content').innerHTML = renderSingleResult(vEntry.result);
        });
      });

      detail.querySelector('.hist-export-json-btn').addEventListener('click', async () => {
        try {
          const report = await invoke('export_report', { result: currentEntry.result, format: 'json' });
          downloadText(report, 'headerlens-history-report.json', 'application/json');
        } catch (err) { console.error(err); }
      });

      detail.querySelector('.hist-export-md-btn').addEventListener('click', async () => {
        try {
          const report = await invoke('export_report', { result: currentEntry.result, format: 'markdown' });
          downloadText(report, 'headerlens-history-report.md', 'text/markdown');
        } catch (err) { console.error(err); }
      });

      detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
}

window.deleteHistoryEntry = async function(id) {
  try { await invoke('delete_history_entry', { id }); loadHistory(); } catch (err) { console.error(err); }
};

// --- UI Helpers ---

function showLoading(tab) {
  const empty = document.getElementById(`${tab}-empty`);
  if (empty) empty.classList.add('hidden');
  document.getElementById(`${tab}-loading`).classList.remove('hidden');
  document.getElementById(`${tab}-results`).classList.add('hidden');
}

function showResults(tab, html) {
  document.getElementById(`${tab}-loading`).classList.add('hidden');
  const container = document.getElementById(`${tab}-results`);
  container.classList.remove('hidden');
  container.querySelector('.results-content').innerHTML = html;
}

function showError(tab, msg) {
  document.getElementById(`${tab}-loading`).classList.add('hidden');
  const container = document.getElementById(`${tab}-results`);
  container.classList.remove('hidden');
  container.querySelector('.results-content').innerHTML = `<div class="error-message">${ICONS.alert}<span>${esc(msg)}</span></div>`;
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function calculateScore(result) {
  const total = 11;
  const present = result.present_headers.length;
  const criticals = result.warnings.filter(w => w.severity === 'critical').length;
  return Math.max(0, Math.round((present / total) * 100) - criticals * 15);
}

function scoreGrade(score) {
  return score >= 90 ? 'A' : score >= 70 ? 'B' : score >= 50 ? 'C' : score >= 30 ? 'D' : 'F';
}

function scoreBlurb(score) {
  if (score >= 90) return 'Excellent — headers are well hardened.';
  if (score >= 70) return 'Good — a few improvements available.';
  if (score >= 50) return 'Fair — several security gaps found.';
  if (score >= 30) return 'Poor — significant exposure detected.';
  return 'Critical — site is highly exposed.';
}

function emptyState(iconName, title, sub, compact) {
  return `<div class="empty-state${compact ? ' compact' : ''}">
    <div class="empty-icon">${ICONS[iconName]}</div>
    <p class="empty-title">${title}</p>
    ${sub ? `<p class="empty-sub">${sub}</p>` : ''}
  </div>`;
}

// --- Rendering ---

const STATUS_LABELS = { secure: 'Secure', insecure: 'Insecure', warning: 'Warning', info: 'Info' };
const SEVERITY_LABELS = { critical: 'Critical', warning: 'Warning', info: 'Info' };

function renderScoreHero(result, score, scoreClass) {
  const present = result.present_headers.length;
  const missing = result.missing_headers.length;
  const warningCount = result.warnings.length;
  const criticals = result.warnings.filter(w => w.severity === 'critical').length;
  const circumference = 2 * Math.PI * 52;
  const clamped = Math.min(100, Math.max(0, score));
  const offset = (circumference * (1 - clamped / 100)).toFixed(1);

  return `
  <div class="score-hero ${scoreClass}">
    <div class="score-ring-wrap">
      <svg class="score-ring" viewBox="0 0 120 120" aria-hidden="true">
        <circle class="ring-track" cx="60" cy="60" r="52"></circle>
        <circle class="ring-progress" cx="60" cy="60" r="52" stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${offset}" transform="rotate(-90 60 60)"></circle>
      </svg>
      <div class="score-ring-text"><span class="score-num">${score}</span><span class="score-denom">/100</span></div>
    </div>
    <div class="score-hero-body">
      <div class="score-hero-top">
        <span class="grade-badge ${scoreClass}">${scoreGrade(score)}</span>
        <div>
          <div class="score-hero-title">Security Score</div>
          <div class="score-hero-sub">${scoreBlurb(score)}</div>
        </div>
      </div>
      <div class="metric-pills">
        <span class="metric-pill mp-green">${ICONS.checkCircle} ${present} Present</span>
        <span class="metric-pill mp-red">${ICONS.xCircle} ${missing} Missing</span>
        <span class="metric-pill mp-yellow">${ICONS.zap} ${warningCount} Warnings${criticals ? ` · ${criticals} critical` : ''}</span>
        <span class="metric-pill mp-neutral">${ICONS.activity} ${result.status_code || '—'} · ${esc(result.http_version || 'Unknown')}</span>
      </div>
    </div>
  </div>`;
}

function renderSingleResult(result) {
  const score = calculateScore(result);
  const scoreClass = score >= 70 ? 'score-good' : score >= 40 ? 'score-ok' : 'score-bad';

  let html = renderScoreHero(result, score, scoreClass);

  html += `<div class="meta-info">
    <span class="meta-item"><span class="meta-key">URL</span><span class="meta-val mono">${esc(result.final_url)}</span></span>
    <span class="meta-item"><span class="meta-key">Status</span><span class="meta-val mono">${result.status_code}</span></span>
    <span class="meta-item"><span class="meta-key">HTTP</span><span class="meta-val mono">${esc(result.http_version)}</span></span>
  </div>`;

  const headerEntries = Object.entries(result.all_headers || {});
  if (headerEntries.length > 0) {
    const statusHeaderLine = result.http_version || result.status_code
      ? `${result.http_version || 'HTTP/1.1'} ${result.status_code || ''}`.trim()
      : '';
    const rawPlainText = [
      statusHeaderLine,
      ...headerEntries.map(([k, v]) => `${k}: ${v}`),
    ].filter(Boolean).join('\n');

    html += renderSection('blue', 'list', `All Response Headers (${headerEntries.length})`,
      [
        `<div class="table-scroll"><table class="headers-table"><thead><tr><th>Header</th><th>Value</th></tr></thead><tbody>${headerEntries.map(([k, v]) => {
          const { chipsHTML, count } = buildInlineChipsForHeader(k, v);
          return `<tr class="csp-clickable-row" tabindex="0" role="button" data-inspect-kind="raw" data-inspect-name="${esc(k)}" data-inspect-value="${esc(v)}" title="Click to inspect ${esc(k)}">
            <td>${esc(k)}</td>
            <td data-raw-value="${esc(v)}">
              <div class="raw-cell-wrap">
                <div class="csp-summary-chips">${chipsHTML}</div>
                <span class="csp-inspect-chip">${ICONS.search} Inspect${count > 1 ? ` (${count})` : ''}</span>
              </div>
            </td>
          </tr>`;
        }).join('')}</tbody></table></div>`,
        `<div class="raw-http-scroll hidden" data-raw-http="${esc(rawPlainText)}">${renderRawHttpSyntax(result, headerEntries)}</div>`,
      ],
      `<div class="section-actions">
        <button type="button" class="btn-small toggle-raw-headers-btn" aria-pressed="false">${ICONS.code}<span class="raw-btn-label">Raw Data</span></button>
        <button type="button" class="btn-small copy-headers-btn">${ICONS.copy}<span class="copy-label">Copy</span></button>
      </div>`
    );
  } else {
    html += renderSection('blue', 'list', 'All Response Headers (0)', [
      `<div class="section-empty">${ICONS.list}<span>No response headers captured</span></div>`,
    ]);
  }

  html += renderSection('blue', 'shield', 'Transport Security', result.transport_security.map(t => {
    const chipCls = t.status === 'secure' ? ' is-good' : t.status === 'insecure' ? ' is-danger' : t.status === 'warning' ? ' is-risk' : '';
    return `<div class="result-item csp-clickable-row" tabindex="0" role="button" data-inspect-kind="transport" data-inspect-name="${esc(t.label)}" data-inspect-value="${esc(t.value)}" data-inspect-extra="${esc(t.status)}" title="Click to inspect transport check">
      <div class="item-head">
        <span class="item-title">
          <span class="item-icon ${t.status === 'secure' ? 'ok' : t.status === 'insecure' ? 'bad' : ''}">${t.status === 'secure' ? ICONS.check : t.status === 'insecure' ? ICONS.xCircle : ICONS.shield}</span>
          <span class="result-label">${esc(t.label)}</span>
        </span>
        <span class="csp-inspect-chip">${ICONS.search} Inspect</span>
      </div>
      <div class="result-value csp-summary-chips">
        <span class="csp-mini-chip${chipCls}">${esc(t.value)}</span>
      </div>
    </div>`;
  }));

  html += renderSection('cyan', 'globe', 'CORS Configuration',
    result.cors.length === 0
      ? [`<div class="section-empty">${ICONS.globe}<span>No CORS headers (same-origin default)</span></div>`]
      : result.cors.map(c => {
          const { chipsHTML, count } = buildInlineChipsForHeader(c.header, c.value);
          return `<div class="result-item csp-clickable-row" tabindex="0" role="button" data-inspect-kind="cors" data-inspect-name="${esc(c.header)}" data-inspect-value="${esc(c.value)}" title="Click to inspect CORS header">
            <div class="item-head">
              <span class="result-label mono">${esc(c.header)}</span>
              <span class="csp-inspect-chip">${ICONS.search} Inspect${count > 1 ? ` (${count})` : ''}</span>
            </div>
            <div class="result-value csp-summary-chips">${chipsHTML}</div>
          </div>`;
        })
  );

  html += renderSection('magenta', 'cookie', 'Cookie Security',
    result.cookie_warnings.length === 0
      ? [`<div class="section-empty ok">${ICONS.checkCircle}<span>No cookie issues</span></div>`]
      : result.cookie_warnings.map(c => {
          const flags = c.missing_flags.split(',').map(f => f.trim()).filter(Boolean);
          const chips = flags.map(f => `<span class="csp-mini-chip is-risk">Missing: ${esc(f)}</span>`).join('');
          return `<div class="result-item csp-clickable-row" tabindex="0" role="button" data-inspect-kind="cookie" data-inspect-name="${esc(c.name)}" data-inspect-value="${esc(c.missing_flags)}" title="Click to inspect cookie hardening">
            <div class="item-head">
              <span class="item-title">
                <span class="item-icon bad">${ICONS.cookie}</span>
                <span class="result-label mono header-missing">${esc(c.name)}</span>
              </span>
              <span class="csp-inspect-chip">${ICONS.search} Inspect (${flags.length})</span>
            </div>
            <div class="result-value csp-summary-chips">${chips}</div>
          </div>`;
        })
  );

  html += renderSection('green', 'checkCircle', `Security Headers Present (${result.present_headers.length})`,
    result.present_headers.length === 0
      ? [`<div class="section-empty">${ICONS.xCircle}<span>No security headers present</span></div>`]
      : result.present_headers.map(h => {
          const { chipsHTML, count } = buildInlineChipsForHeader(h.name, h.value);
          return `<div class="result-item csp-clickable-row" tabindex="0" role="button" data-inspect-kind="present" data-inspect-name="${esc(h.name)}" data-inspect-value="${esc(h.value)}" title="Click to inspect ${esc(h.name)}">
            <div class="item-head">
              <span class="item-title">
                <span class="item-icon ok">${ICONS.check}</span>
                <span class="result-label mono header-present">${esc(h.name)}</span>
              </span>
              <span class="csp-inspect-chip">${ICONS.search} Inspect${count > 1 ? ` (${count})` : ''}</span>
            </div>
            <div class="result-value csp-summary-chips">${chipsHTML}</div>
          </div>`;
        })
  );

  html += renderSection('red', 'alert', `Missing Security Headers (${result.missing_headers.length})`,
    result.missing_headers.length === 0
      ? [`<div class="section-empty ok">${ICONS.checkCircle}<span>None — all recommended headers present</span></div>`]
      : result.missing_headers.map(h => {
          const kb = getHeaderDoc(h.name);
          const recPreview = kb.shortRec || kb.recommended || 'Configure header';
          return `<div class="result-item csp-clickable-row" tabindex="0" role="button" data-inspect-kind="missing" data-inspect-name="${esc(h.name)}" data-inspect-value="" data-inspect-extra="${esc(h.description)}" title="Click to view explanation & recommended config">
            <div class="item-head">
              <span class="item-title">
                <span class="item-icon bad">${ICONS.xCircle}</span>
                <span class="result-label mono header-missing">${esc(h.name)}</span>
              </span>
              <span class="csp-inspect-chip">${ICONS.search} Inspect</span>
            </div>
            <div class="result-value csp-summary-chips">
              <span class="csp-mini-chip is-danger">Not Set</span>
              <span class="csp-mini-chip is-rec">Recommended: ${esc(recPreview)}</span>
            </div>
          </div>`;
        })
  );

  html += renderSection('yellow', 'zap', `Warnings & Info Leaks (${result.warnings.length})`,
    result.warnings.length === 0
      ? [`<div class="section-empty ok">${ICONS.checkCircle}<span>No warnings or info leaks detected</span></div>`]
      : result.warnings.map(w => {
          const sevCls = w.severity === 'critical' ? 'is-danger' : w.severity === 'warning' ? 'is-risk' : '';
          const rawVal = result.all_headers && result.all_headers[w.header.toLowerCase()] ? result.all_headers[w.header.toLowerCase()] : '';
          return `<div class="result-item csp-clickable-row" tabindex="0" role="button" data-inspect-kind="warning" data-inspect-name="${esc(w.header)}" data-inspect-value="${esc(w.message)}" data-inspect-extra="${esc(w.severity)}||${esc(rawVal)}" title="Click to inspect warning & fix">
            <div class="item-head">
              <span class="result-label mono status-${w.severity === 'critical' ? 'insecure' : w.severity}">${esc(w.header)}</span>
              <span class="csp-inspect-chip">${ICONS.search} Inspect</span>
            </div>
            <div class="result-value csp-summary-chips">
              <span class="csp-mini-chip ${sevCls}">${SEVERITY_LABELS[w.severity] || 'Info'}</span>
              <span class="csp-mini-chip">${esc(w.message)}</span>
            </div>
          </div>`;
        })
  );

  return html;
}

function highlightHttpValueSyntax(val) {
  const str = String(val ?? '');
  // Single-pass tokenizer so HTML escaping is 100% safe and never re-parses generated tags
  const tokenRe = /(https?:\/\/[^\s;,"']+)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b[a-zA-Z][a-zA-Z0-9_-]*=)|([;,])/g;
  let out = '';
  let last = 0;
  let m;
  while ((m = tokenRe.exec(str)) !== null) {
    if (m.index > last) out += esc(str.slice(last, m.index));
    if (m[1]) out += `<span class="hl-url">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="hl-str">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="hl-param">${esc(m[3])}</span>`;
    else if (m[4]) out += `<span class="hl-punct">${esc(m[4])}</span>`;
    last = tokenRe.lastIndex;
  }
  if (last < str.length) out += esc(str.slice(last));
  return out;
}

function renderRawHttpSyntax(result, headerEntries) {
  const lines = [];
  let ln = 1;
  if (result.http_version || result.status_code) {
    const code = Number(result.status_code) || 0;
    const sCls = code >= 200 && code < 300
      ? 'hl-status-ok'
      : code >= 300 && code < 400
        ? 'hl-status-redir'
        : code >= 400
          ? 'hl-status-err'
          : '';
    lines.push(
      `<div class="raw-http-line is-status"><span class="raw-ln">${ln++}</span><span class="raw-code"><span class="hl-proto">${esc(result.http_version || 'HTTP')}</span>${code ? ` <span class="hl-status ${sCls}">${code}</span>` : ''}</span></div>`
    );
  }
  for (const [k, v] of headerEntries) {
    lines.push(
      `<div class="raw-http-line"><span class="raw-ln">${ln++}</span><span class="raw-code"><span class="hl-key">${esc(k)}</span><span class="hl-colon">: </span><span class="hl-val">${highlightHttpValueSyntax(v)}</span></span></div>`
    );
  }
  return lines.join('');
}

function renderSection(color, iconName, title, items, actions = '') {
  return `<div class="result-section">
    <div class="section-head">
      <h3><span class="section-icon ${color}">${ICONS[iconName]}</span>${title}</h3>
      ${actions}
    </div>
    <div class="section-body">${items.join('')}</div>
  </div>`;
}

function scoreToChipClass(score, hasError) {
  if (hasError) return 'is-danger';
  return score >= 70 ? 'is-good' : score >= 40 ? 'is-risk' : 'is-danger';
}

function buildResultOverviewChips(res) {
  if (res.error) {
    const shortErr = res.error.length > 72 ? res.error.slice(0, 69) + '…' : res.error;
    return `<span class="csp-mini-chip is-danger">${esc(shortErr)}</span>`;
  }
  const chips = [
    `<span class="csp-mini-chip is-good">${res.present_headers.length} Present</span>`,
    `<span class="csp-mini-chip ${res.missing_headers.length ? 'is-danger' : 'is-good'}">${res.missing_headers.length} Missing</span>`,
    `<span class="csp-mini-chip ${res.warnings.length ? 'is-risk' : 'is-good'}">${res.warnings.length} Warning${res.warnings.length === 1 ? '' : 's'}</span>`,
  ];
  const presentNames = res.present_headers.slice(0, 4).map(h => `<span class="csp-mini-chip">${esc(h.name)}</span>`);
  chips.push(...presentNames);
  if (res.present_headers.length > 4) {
    chips.push(`<span class="csp-mini-chip is-more">+${res.present_headers.length - 4} more</span>`);
  }
  return chips.join('');
}

function renderBatchHTML(entries) {
  let dualCount = 0;
  let errorCount = 0;
  const primaryScores = [];

  entries.forEach(item => {
    if (item.kind === 'dual') {
      dualCount++;
      if (item.http.error && item.https.error) errorCount++;
      else if (!item.https.error) primaryScores.push(calculateScore(item.https));
      else primaryScores.push(calculateScore(item.http));
    } else {
      const r = item.result || item;
      if (r.error) errorCount++;
      else primaryScores.push(calculateScore(r));
    }
  });

  const avgScore = primaryScores.length
    ? Math.round(primaryScores.reduce((a, b) => a + b, 0) / primaryScores.length)
    : 0;
  const avgCls = avgScore >= 70 ? 'mp-green' : avgScore >= 40 ? 'mp-yellow' : 'mp-red';

  let html = `
    <div class="batch-summary-bar">
      <div class="batch-summary-pills">
        <span class="metric-pill mp-neutral">${ICONS.globe} ${entries.length} Target${entries.length === 1 ? '' : 's'}</span>
        ${dualCount > 0 ? `<span class="metric-pill mp-neutral">${ICONS.shield} ${dualCount} HTTP vs HTTPS</span>` : ''}
        ${primaryScores.length > 0 ? `<span class="metric-pill ${avgCls}">${ICONS.activity} Avg Score: ${avgScore}/100</span>` : ''}
        ${errorCount > 0 ? `<span class="metric-pill mp-red">${ICONS.xCircle} ${errorCount} Failed</span>` : ''}
      </div>
      <button type="button" class="btn-small" id="batch-expand-all-btn">Expand All</button>
    </div>`;

  entries.forEach((item, i) => {
    if (item.kind === 'dual') {
      const { target, http: resHttp, https: resHttps } = item;
      const sHttp = resHttp.error ? 0 : calculateScore(resHttp);
      const sHttps = resHttps.error ? 0 : calculateScore(resHttps);
      const chipHttp = scoreToChipClass(sHttp, Boolean(resHttp.error));
      const chipHttps = scoreToChipClass(sHttps, Boolean(resHttps.error));
      const diff = sHttps - sHttp;
      const diffLabel = resHttp.error && resHttps.error
        ? 'Both Failed'
        : resHttp.error
          ? 'HTTPS Only'
          : resHttps.error
            ? 'HTTP Only'
            : diff > 0
              ? `HTTPS +${diff}`
              : diff < 0
                ? `HTTP +${Math.abs(diff)}`
                : 'Equal';

      const httpStatusChip = resHttp.error
        ? `<span class="csp-mini-chip is-danger">HTTP: Unreachable</span>`
        : (resHttp.status_code >= 300 && resHttp.status_code < 400)
          ? `<span class="csp-mini-chip is-good">HTTP ${resHttp.status_code} Redirect</span>`
          : `<span class="csp-mini-chip is-risk">HTTP ${resHttp.status_code}</span>`;

      const httpsSummaryChips = resHttps.error
        ? `<span class="csp-mini-chip is-danger">HTTPS: ${esc(resHttps.error.slice(0, 60))}</span>`
        : [
            `<span class="csp-mini-chip is-good">HTTPS ${resHttps.status_code} · ${resHttps.present_headers.length}/11 Present</span>`,
            resHttps.missing_headers.length
              ? `<span class="csp-mini-chip is-danger">${resHttps.missing_headers.length} Missing</span>`
              : `<span class="csp-mini-chip is-good">0 Missing</span>`,
            resHttps.warnings.length
              ? `<span class="csp-mini-chip is-risk">${resHttps.warnings.length} Warning${resHttps.warnings.length === 1 ? '' : 's'}</span>`
              : '',
            ...resHttps.present_headers.slice(0, 3).map(h => `<span class="csp-mini-chip">${esc(h.name)}</span>`),
            resHttps.present_headers.length > 3
              ? `<span class="csp-mini-chip is-more">+${resHttps.present_headers.length - 3} more</span>`
              : '',
          ].filter(Boolean).join('');

      html += `
        <div class="batch-result-header" data-batch-idx="${i}" data-batch-dual="1">
          <div class="batch-head-top">
            <div class="batch-head-left">
              <span class="proto-badge proto-dual">HTTP + HTTPS</span>
              <span class="batch-url">${esc(target)}</span>
            </div>
            <div class="batch-head-right">
              <span class="csp-mini-chip ${chipHttp}">HTTP ${resHttp.error ? 'ERR' : `${sHttp} · ${scoreGrade(sHttp)}`}</span>
              <span class="csp-mini-chip ${chipHttps}">HTTPS ${resHttps.error ? 'ERR' : `${sHttps} · ${scoreGrade(sHttps)}`}</span>
              <span class="csp-mini-chip is-more">${esc(diffLabel)}</span>
              <span class="chevron">${ICONS.chevron}</span>
            </div>
          </div>
          <div class="batch-head-chips">${httpStatusChip}${httpsSummaryChips}</div>
        </div>
        <div class="batch-result-body" id="batch-${i}">
          ${resHttp.error && resHttps.error
            ? `<div class="error-message">${ICONS.alert}<span>HTTP: ${esc(resHttp.error)} | HTTPS: ${esc(resHttps.error)}</span></div>`
            : renderDualProtocolComparison(item, `batch-split-${i}`)}
        </div>`;
    } else {
      const result = item.result || item;
      const urlLabel = item.target || result.url;
      const isHttps = /^https:\/\//i.test(urlLabel);
      const score = result.error ? 0 : calculateScore(result);
      const chipCls = scoreToChipClass(score, Boolean(result.error));

      html += `
        <div class="batch-result-header" data-batch-idx="${i}">
          <div class="batch-head-top">
            <div class="batch-head-left">
              <span class="proto-badge ${isHttps ? 'proto-https' : 'proto-http'}">${isHttps ? 'HTTPS' : 'HTTP'}</span>
              <span class="batch-url">${esc(urlLabel)}</span>
            </div>
            <div class="batch-head-right">
              ${result.error
                ? '<span class="csp-mini-chip is-danger">Error</span>'
                : `<span class="csp-mini-chip">HTTP ${result.status_code}</span>`}
              <span class="csp-mini-chip ${chipCls}">Score ${score} · ${scoreGrade(score)}</span>
              <span class="chevron">${ICONS.chevron}</span>
            </div>
          </div>
          <div class="batch-head-chips">${buildResultOverviewChips(result)}</div>
        </div>
        <div class="batch-result-body" id="batch-${i}">
          ${result.error
            ? `<div class="error-message">${ICONS.alert}<span>${esc(result.error)}</span></div>`
            : renderSingleResult(result)}
        </div>`;
    }
  });

  setTimeout(() => {
    const headers = document.querySelectorAll('#tab-batch .batch-result-header');
    headers.forEach(el => {
      el.addEventListener('click', () => {
        el.classList.toggle('open');
        const body = el.nextElementSibling;
        body.classList.toggle('open');
        if (body.classList.contains('open') && el.dataset.batchDual === '1') {
          const idx = el.dataset.batchIdx;
          requestAnimationFrame(() => {
            alignPanelElements(
              document.getElementById(`batch-split-${idx}-http`),
              document.getElementById(`batch-split-${idx}-https`)
            );
          });
        }
      });
    });

    const expandAllBtn = document.getElementById('batch-expand-all-btn');
    if (expandAllBtn) {
      expandAllBtn.addEventListener('click', () => {
        const anyClosed = Array.from(headers).some(h => !h.classList.contains('open'));
        headers.forEach(h => {
          h.classList.toggle('open', anyClosed);
          h.nextElementSibling.classList.toggle('open', anyClosed);
          if (anyClosed && h.dataset.batchDual === '1') {
            const idx = h.dataset.batchIdx;
            requestAnimationFrame(() => {
              alignPanelElements(
                document.getElementById(`batch-split-${idx}-http`),
                document.getElementById(`batch-split-${idx}-https`)
              );
            });
          }
        });
        expandAllBtn.textContent = anyClosed ? 'Collapse All' : 'Expand All';
      });
    }
  }, 0);

  return html;
}

// --- Universal Header & Check Inspector (Block Chips, Knowledge Base & Native <dialog>) ---

const CSP_DIRECTIVE_DOCS = {
  'default-src': 'Fallback policy for fetch directives (scripts, styles, images, fonts, connections) that do not define their own rule.',
  'script-src': 'Defines allowed sources for JavaScript execution (external scripts, inline blocks, hashes, and nonces).',
  'script-src-elem': 'Defines allowed sources specifically for <script> elements and script requests.',
  'script-src-attr': 'Defines allowed sources for inline JavaScript event handlers (e.g., onclick, onload attributes).',
  'style-src': 'Defines allowed sources for stylesheets (CSS files and inline styles).',
  'style-src-elem': 'Defines allowed sources specifically for <style> elements and <link rel="stylesheet"> requests.',
  'style-src-attr': 'Defines allowed sources for inline style="..." attributes on individual HTML elements.',
  'img-src': 'Defines valid origins and schemes (such as https:, data:, blob:) from which images and favicons can be loaded.',
  'font-src': 'Defines valid sources for web fonts loaded via @font-face rules.',
  'connect-src': 'Restricts URLs that scripts can connect to via fetch(), XMLHttpRequest, WebSocket, and EventSource.',
  'media-src': 'Defines valid sources for loading audio and video media (<audio>, <video>, <track>).',
  'object-src': 'Controls legacy plugin objects (<object>, <embed>, <applet>). Setting to \'none\' is strongly recommended.',
  'frame-src': 'Defines valid URLs that this page is allowed to embed inside <frame> and <iframe> elements.',
  'child-src': 'Defines valid sources for web workers and nested browsing contexts such as frames.',
  'worker-src': 'Restricts valid URLs for Worker, SharedWorker, and ServiceWorker scripts.',
  'manifest-src': 'Specifies valid sources for web application manifest files.',
  'prefetch-src': 'Specifies valid resources that may be prefetched or prerendered.',
  'fenced-frame-src': 'Defines valid sources for nested browsing contexts loaded into <fencedframe> elements.',
  'base-uri': 'Restricts URLs permitted in the document\'s <base> element, preventing base-tag hijacking of relative URLs.',
  'form-action': 'Restricts target URLs to which HTML <form> submissions can be sent.',
  'frame-ancestors': 'Specifies which parent origins may embed this page in <frame>, <iframe>, or <object> (protects against Clickjacking).',
  'navigate-to': 'Restricts the destinations to which the document can initiate navigations.',
  'sandbox': 'Enables an iframe-style sandbox for the document, restricting scripts, forms, or popups unless explicitly allowed.',
  'upgrade-insecure-requests': 'Instructs the browser to automatically upgrade all plain HTTP resource URLs to HTTPS before fetching.',
  'block-all-mixed-content': 'Prevents loading any HTTP subresources when the page is loaded over HTTPS (superseded by upgrade-insecure-requests).',
  'require-trusted-types-for': 'Enforces Trusted Types for DOM XSS sinks (e.g., innerHTML) so raw strings cannot be injected.',
  'trusted-types': 'Restricts which Trusted Types policy names are allowed to be created in JavaScript.',
  'report-uri': 'Legacy directive specifying an endpoint where the browser sends CSP violation reports.',
  'report-to': 'Specifies a Reporting API endpoint group to receive CSP violation telemetry.',
  'plugin-types': 'Legacy directive restricting MIME types of plugins that can be invoked via <object> or <embed>.',
};

const CSP_TOKEN_HINTS = {
  "'none'": { cls: 'tok-strict', note: 'blocks all' },
  "'self'": { cls: 'tok-self', note: 'same origin' },
  "'strict-dynamic'": { cls: 'tok-strict', note: 'trust propagated' },
  "'unsafe-inline'": { cls: 'tok-risk', note: 'allows inline code' },
  "'unsafe-eval'": { cls: 'tok-danger', note: 'allows eval()' },
  "'wasm-unsafe-eval'": { cls: 'tok-risk', note: 'allows Wasm compile' },
  "'unsafe-hashes'": { cls: 'tok-risk', note: 'inline handler hashes' },
  "'report-sample'": { cls: 'tok-self', note: 'include code sample' },
  '*': { cls: 'tok-danger', note: 'wildcard any origin' },
};

const HEADER_DOCS = {
  'strict-transport-security': {
    overview: 'HTTP Strict Transport Security (HSTS) instructs browsers to connect to this domain exclusively over encrypted HTTPS, preventing SSL-stripping and downgrade attacks.',
    shortRec: 'max-age=63072000; includeSubDomains; preload',
    recommended: 'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload',
  },
  'content-security-policy': {
    overview: 'Content Security Policy (CSP) restricts where scripts, styles, frames, images, and network connections can originate, acting as a primary defense against Cross-Site Scripting (XSS) and Clickjacking.',
    shortRec: "default-src 'self'; object-src 'none'; frame-ancestors 'none'",
    recommended: "Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'",
  },
  'content-security-policy-report-only': {
    overview: 'Runs a Content Security Policy in monitoring-only mode: violations are reported without blocking page resources, ideal for testing policy changes safely.',
    shortRec: "default-src 'self'; report-to csp-endpoint",
    recommended: "Content-Security-Policy-Report-Only: default-src 'self'; report-to csp-endpoint",
  },
  'x-frame-options': {
    overview: 'Controls whether browsers are allowed to embed this page inside <frame>, <iframe>, <embed>, or <object>, protecting users from UI-redressing (Clickjacking) attacks.',
    shortRec: 'DENY or SAMEORIGIN',
    recommended: 'X-Frame-Options: DENY',
  },
  'x-content-type-options': {
    overview: 'Prevents browsers from MIME-sniffing a response away from its declared Content-Type, blocking attacks where user-uploaded files are misinterpreted as executable HTML or JavaScript.',
    shortRec: 'nosniff',
    recommended: 'X-Content-Type-Options: nosniff',
  },
  'referrer-policy': {
    overview: 'Controls how much URL path and query-string information is sent in the Referer header when navigating away or fetching subresources, preventing sensitive URL token leaks.',
    shortRec: 'strict-origin-when-cross-origin',
    recommended: 'Referrer-Policy: strict-origin-when-cross-origin',
  },
  'permissions-policy': {
    overview: 'Explicitly enables or disables sensitive browser APIs and hardware sensors (camera, microphone, geolocation, USB, payment) for the document and any embedded iframes.',
    shortRec: 'camera=(), microphone=(), geolocation=()',
    recommended: 'Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  'cache-control': {
    overview: 'Defines how browsers, CDNs, and shared proxies cache the HTTP response. Dynamic or authenticated endpoints should include no-store so private data is never persisted to disk.',
    shortRec: 'no-store, max-age=0',
    recommended: 'Cache-Control: no-store, max-age=0',
  },
  'cross-origin-opener-policy': {
    overview: 'Isolates the top-level browsing context from cross-origin popups and openers, preventing window.opener manipulation and cross-origin XS-Leak / Spectre side-channel attacks.',
    shortRec: 'same-origin',
    recommended: 'Cross-Origin-Opener-Policy: same-origin',
  },
  'cross-origin-embedder-policy': {
    overview: 'Prevents a document from loading cross-origin subresources unless they explicitly grant permission via CORP or CORS, required alongside COOP for crossOriginIsolated.',
    shortRec: 'require-corp',
    recommended: 'Cross-Origin-Embedder-Policy: require-corp',
  },
  'cross-origin-resource-policy': {
    overview: 'Tells browsers which origins are allowed to load this specific resource (images, scripts, JSON), defending against cross-site script inclusion (XSSI) and Spectre.',
    shortRec: 'same-origin',
    recommended: 'Cross-Origin-Resource-Policy: same-origin',
  },
  'x-xss-protection': {
    overview: 'Legacy header for older browser XSS filters. Modern security guidance recommends setting X-XSS-Protection: 0 (to avoid filter-induced side-channel bugs) and relying on CSP instead.',
    shortRec: '0',
    recommended: 'X-XSS-Protection: 0',
  },
  'access-control-allow-origin': {
    overview: 'Specifies which external origin is permitted to read responses in cross-origin fetch/XHR requests. Avoid "*" on authenticated endpoints.',
    shortRec: 'https://trusted.example.com',
    recommended: 'Access-Control-Allow-Origin: https://trusted.example.com',
  },
  'access-control-allow-credentials': {
    overview: 'Indicates whether browsers may expose the response when requests include cookies, Authorization headers, or TLS client certificates.',
  },
  'access-control-allow-methods': {
    overview: 'Lists HTTP methods permitted when accessing the resource in response to a CORS preflight request.',
  },
  'access-control-allow-headers': {
    overview: 'Lists custom HTTP request headers permitted during an actual CORS request following preflight.',
  },
  'access-control-expose-headers': {
    overview: 'Whitelists response headers that JavaScript in cross-origin browsers is allowed to read via response.headers.',
  },
  'access-control-max-age': {
    overview: 'Defines how many seconds the results of a CORS preflight OPTIONS check can be cached by the browser.',
  },
  'vary': {
    overview: 'Instructs caches which request headers affect the response content. Dynamic CORS origins must include Vary: Origin to prevent cache poisoning.',
  },
  'set-cookie': {
    overview: 'Sets HTTP cookies on the client browser. Session and sensitive cookies should always include Secure, HttpOnly, and SameSite=Lax or Strict.',
    recommended: 'Set-Cookie: session=...; Secure; HttpOnly; SameSite=Lax; Path=/',
  },
  'server': {
    overview: 'Identifies the origin web server software. Exposing exact version numbers helps attackers fingerprint known CVEs — strip or genericize server banners.',
    recommended: 'Remove version numbers or omit the Server header where possible.',
  },
  'x-powered-by': {
    overview: 'Non-standard header disclosing the backend runtime or framework (e.g., Express, PHP, ASP.NET). Remove to reduce technology fingerprinting.',
    recommended: 'Disable X-Powered-By in framework settings (e.g., app.disable("x-powered-by")).',
  },
  'x-aspnet-version': { overview: 'Discloses the exact Microsoft ASP.NET runtime version. Disable via <httpRuntime enableVersionHeader="false" />.' },
  'x-generator': { overview: 'Discloses the CMS or static site generator used to build the page.' },
  'x-runtime': { overview: 'Reports server-side request execution duration, potentially aiding timing side-channel attacks.' },
  'via': { overview: 'Added by reverse proxies and gateways, sometimes revealing internal proxy topology or software versions.' },
  'x-cache': { overview: 'Indicates whether the response was served as a HIT or MISS by an upstream CDN or caching proxy.' },
  'cf-ray': { overview: 'Cloudflare request trace identifier indicating the edge datacenter that handled the connection.' },
  'server-timing': { overview: 'Communicates backend performance metrics to browser DevTools; avoid exposing internal service names in production.' },
  'content-type': { overview: 'Declares the media MIME type and character encoding (e.g., charset=utf-8) of the response body.' },
  'location': { overview: 'Target URL used in 3xx HTTP redirects (such as upgrading plain HTTP to HTTPS).' },
  'alt-svc': { overview: 'Advertises alternative network protocols/ports such as HTTP/3 (QUIC, h3=":443") available for this origin.' },
  'etag': { overview: 'Opaque validator token representing a specific version of a resource for conditional cache validation.' },
  'nel': { overview: 'Network Error Logging configuration enabling browsers to report connection/TLS/DNS failures.' },
  'report-to': { overview: 'Configures Reporting API endpoint groups for CSP, NEL, and deprecation telemetry.' },
  'reporting-endpoints': { overview: 'Modern Reporting API v1 header defining named endpoint URLs for security violation reports.' },
  'timing-allow-origin': { overview: 'Specifies origins allowed to view detailed Resource Timing API metrics for cross-origin resources.' },
};

const PERMISSIONS_FEATURE_DOCS = {
  'accelerometer': 'Access to device motion/acceleration sensors.',
  'ambient-light-sensor': 'Access to ambient light level sensors.',
  'autoplay': 'Automatic playback of audio/video media without user interaction.',
  'browsing-topics': 'Google Topics API for interest-based advertising.',
  'camera': 'Access to video input / webcam devices.',
  'display-capture': 'Screen sharing via getDisplayMedia().',
  'encrypted-media': 'Encrypted Media Extensions (EME / DRM) playback.',
  'fullscreen': 'Entering fullscreen mode via requestFullscreen().',
  'geolocation': 'Access to user physical location coordinates.',
  'gyroscope': 'Access to device orientation/gyroscope sensors.',
  'hid': 'WebHID access to human interface hardware devices.',
  'idle-detection': 'Detecting when the user is idle or screen is locked.',
  'interest-cohort': 'Legacy FLoC cohort tracking (set to () to opt out).',
  'local-fonts': 'Enumeration of locally installed system fonts.',
  'magnetometer': 'Access to compass/magnetometer sensors.',
  'microphone': 'Access to audio input / microphone devices.',
  'midi': 'WebMIDI access to musical instrument devices.',
  'bluetooth': 'Web Bluetooth access to nearby BLE peripherals.',
  'payment': 'Payment Request API usage in embedded contexts.',
  'picture-in-picture': 'Floating Picture-in-Picture video mode.',
  'publickey-credentials-get': 'WebAuthn / Passkey authentication assertions.',
  'publickey-credentials-create': 'WebAuthn / Passkey credential registration.',
  'screen-wake-lock': 'Preventing the device screen from dimming or locking.',
  'serial': 'Web Serial API access to serial/COM ports.',
  'sync-xhr': 'Synchronous XMLHttpRequest calls on the main thread.',
  'usb': 'WebUSB direct access to USB peripherals.',
  'web-share': 'Sharing content via native OS share sheet.',
  'xr-spatial-tracking': 'WebXR virtual/augmented reality spatial tracking.',
};

const CACHE_DIRECTIVE_DOCS = {
  'no-store': { desc: 'Prevents browsers and intermediate caches from storing any copy of the response on disk or memory (best for sensitive data).', cls: 'is-good' },
  'no-cache': { desc: 'Allows caching, but forces revalidation with the origin server before reusing the cached response.', cls: '' },
  'private': { desc: 'Response may be stored only by a user\'s private browser cache, never by shared CDN/proxy caches.', cls: 'is-good' },
  'public': { desc: 'Allows any shared proxy or CDN cache along the path to store the response.', cls: 'is-risk' },
  'must-revalidate': { desc: 'Once stale, caches must not use the response without successful validation with the origin server.', cls: '' },
  'proxy-revalidate': { desc: 'Same as must-revalidate, but applies strictly to shared proxy/CDN caches.', cls: '' },
  'immutable': { desc: 'Indicates the response body will never change while fresh, skipping conditional revalidation on reload.', cls: '' },
  'no-transform': { desc: 'Forbids intermediaries/proxies from modifying or recompressing the response payload.', cls: '' },
};

const REFERRER_DOCS = {
  'no-referrer': { desc: 'Omits the Referer header completely on every request (maximum privacy).', cls: 'is-good' },
  'same-origin': { desc: 'Sends full URL on same-origin requests, and omits Referer completely on cross-origin requests.', cls: 'is-good' },
  'strict-origin': { desc: 'Sends only the origin (no path/query) when security level stays equal (HTTPS→HTTPS), omits on downgrade.', cls: 'is-good' },
  'strict-origin-when-cross-origin': { desc: 'Sends full URL on same-origin, only the origin on cross-origin HTTPS→HTTPS, and nothing on HTTPS→HTTP downgrade (modern default & recommended).', cls: 'is-good' },
  'origin': { desc: 'Always sends only the origin (scheme + host) without URL path or query parameters, even on HTTP downgrades.', cls: '' },
  'origin-when-cross-origin': { desc: 'Sends full URL on same-origin and origin-only cross-origin, including over unencrypted HTTP downgrades.', cls: 'is-risk' },
  'no-referrer-when-downgrade': { desc: 'Sends the full URL (including path & query string!) to any HTTPS third party, omitting only on HTTPS→HTTP.', cls: 'is-risk' },
  'unsafe-url': { desc: 'Always leaks the full URL (including sensitive paths & query tokens) to all origins, even plain HTTP.', cls: 'is-danger' },
};

function getHeaderDoc(name) {
  const key = (name || '').toLowerCase().trim();
  return HEADER_DOCS[key] || {
    overview: 'HTTP response header returned by the server or intermediate proxy.',
  };
}

function isCspHeader(name) {
  const n = (name || '').toLowerCase().trim();
  return n === 'content-security-policy' || n === 'content-security-policy-report-only';
}

function parseCspDirectives(raw) {
  if (!raw) return [];
  return raw
    .split(';')
    .map(chunk => chunk.trim())
    .filter(Boolean)
    .map(chunk => {
      const parts = chunk.split(/\s+/);
      const name = parts[0].toLowerCase();
      const values = parts.slice(1);
      return { name, values, raw: chunk };
    });
}

// Split comma-separated lists while keeping commas inside parentheses/quotes intact
function splitTopLevelCommas(str) {
  const out = [];
  let cur = '';
  let depth = 0;
  let inQuote = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '"' && str[i - 1] !== '\\') inQuote = !inQuote;
    else if (!inQuote && ch === '(') depth++;
    else if (!inQuote && ch === ')') depth = Math.max(0, depth - 1);
    if (!inQuote && depth === 0 && ch === ',') {
      if (cur.trim()) out.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function parseHeaderIntoBlocks(name, value) {
  const key = (name || '').toLowerCase().trim();
  const val = String(value ?? '').trim();
  if (!val) return [];

  if (isCspHeader(key)) {
    return parseCspDirectives(val).map(d => {
      const desc = CSP_DIRECTIVE_DOCS[d.name] || 'Custom or browser-specific Content Security Policy directive.';
      const tokens = d.values.map(v => ({ token: v, ...classifyCspToken(v) }));
      const hasDanger = tokens.some(t => t.cls === 'tok-danger');
      const hasRisk = tokens.some(t => t.cls === 'tok-risk');
      const isStrict = d.values.length === 1 && d.values[0].toLowerCase() === "'none'";
      const chipCls = hasDanger ? 'is-danger' : hasRisk ? 'is-risk' : isStrict ? 'is-good' : '';
      return {
        label: d.name,
        chipText: d.name,
        chipCls,
        desc,
        tokens: tokens.length ? tokens : [{ token: '(enabled)', cls: 'tok-self', note: 'boolean directive' }],
        status: hasDanger || hasRisk ? 'warning' : isStrict ? 'secure' : '',
      };
    });
  }

  if (key === 'strict-transport-security') {
    return val.split(';').map(s => s.trim()).filter(Boolean).map(part => {
      const lower = part.toLowerCase();
      if (lower.startsWith('max-age')) {
        const secs = parseInt((part.split('=')[1] || '').trim(), 10);
        const days = Number.isFinite(secs) ? Math.round(secs / 86400) : null;
        const ok = Number.isFinite(secs) && secs >= 31536000;
        const zero = secs === 0;
        return {
          label: part,
          chipText: part,
          chipCls: zero ? 'is-danger' : ok ? 'is-good' : 'is-risk',
          desc: Number.isFinite(secs)
            ? `Enforces HTTPS-only connections for ${secs.toLocaleString()} seconds (~${days} days). Recommended minimum is 31,536,000s (1 year).`
            : 'Specifies how long (in seconds) browsers remember to force HTTPS.',
          tokens: [{ token: part, cls: zero ? 'tok-danger' : ok ? 'tok-strict' : 'tok-risk', note: days !== null ? `${days} days` : '' }],
          status: zero || !ok ? 'warning' : 'secure',
        };
      }
      if (lower === 'includesubdomains') {
        return {
          label: 'includeSubDomains',
          chipText: 'includeSubDomains',
          chipCls: 'is-good',
          desc: 'Extends HSTS protection to every subdomain under this domain.',
          tokens: [{ token: 'includeSubDomains', cls: 'tok-strict', note: 'all subdomains covered' }],
          status: 'secure',
        };
      }
      if (lower === 'preload') {
        return {
          label: 'preload',
          chipText: 'preload',
          chipCls: 'is-good',
          desc: 'Indicates consent to bake this domain into browser HSTS preload lists so even first-time visits never use HTTP.',
          tokens: [{ token: 'preload', cls: 'tok-strict', note: 'preload list eligible' }],
          status: 'secure',
        };
      }
      return { label: part, chipText: part, chipCls: '', desc: 'HSTS directive parameter.', tokens: [{ token: part, cls: '', note: '' }] };
    });
  }

  if (key === 'permissions-policy' || key === 'feature-policy') {
    const sep = val.includes(',') || val.includes('=(') ? splitTopLevelCommas(val) : val.split(';').map(s => s.trim()).filter(Boolean);
    return sep.map(item => {
      const eqIdx = item.indexOf('=');
      const feat = (eqIdx >= 0 ? item.slice(0, eqIdx) : item).trim().toLowerCase();
      const allowRaw = (eqIdx >= 0 ? item.slice(eqIdx + 1) : '').trim();
      const isDisabled = allowRaw === '()' || allowRaw.includes("'none'");
      const isWildcard = allowRaw === '*' || allowRaw === '(*)';
      const inner = allowRaw.startsWith('(') && allowRaw.endsWith(')') ? allowRaw.slice(1, -1).trim() : allowRaw;
      const allowTokens = inner ? inner.split(/\s+/) : ['() — disabled'];
      return {
        label: feat,
        chipText: isDisabled ? `${feat}=()` : item.length <= 28 ? item : `${feat}=(...)`,
        chipCls: isWildcard ? 'is-risk' : isDisabled ? 'is-good' : '',
        desc: PERMISSIONS_FEATURE_DOCS[feat] || `Controls browser access to the "${feat}" feature in this document and nested iframes.`,
        tokens: allowTokens.map(t => ({
          token: t,
          cls: isDisabled ? 'tok-strict' : isWildcard ? 'tok-risk' : 'tok-self',
          note: isDisabled ? 'blocked everywhere' : t === 'self' ? 'same origin only' : isWildcard ? 'all origins' : '',
        })),
        status: isWildcard ? 'warning' : isDisabled ? 'secure' : '',
      };
    });
  }

  if (key === 'cache-control') {
    return splitTopLevelCommas(val).map(part => {
      const [kRaw, vRaw] = part.split('=');
      const dKey = kRaw.trim().toLowerCase();
      const known = CACHE_DIRECTIVE_DOCS[dKey];
      let desc = known ? known.desc : 'HTTP caching directive.';
      let chipCls = known ? known.cls : '';
      if (dKey === 'max-age' || dKey === 's-maxage') {
        const s = parseInt((vRaw || '').trim(), 10);
        desc = dKey === 's-maxage'
          ? `Shared CDN/proxy cache freshness lifetime: ${Number.isFinite(s) ? s.toLocaleString() + 's' : part}.`
          : `Browser cache freshness lifetime: ${Number.isFinite(s) ? s.toLocaleString() + 's' : part}.`;
        if (s === 0) chipCls = 'is-good';
      }
      return {
        label: part,
        chipText: part,
        chipCls,
        desc,
        tokens: [{ token: part, cls: chipCls === 'is-good' ? 'tok-strict' : chipCls === 'is-risk' ? 'tok-risk' : '', note: '' }],
        status: chipCls === 'is-good' ? 'secure' : chipCls === 'is-risk' ? 'warning' : '',
      };
    });
  }

  if (key === 'referrer-policy') {
    return splitTopLevelCommas(val).map(part => {
      const k = part.toLowerCase();
      const info = REFERRER_DOCS[k] || { desc: 'Referrer policy token.', cls: '' };
      return {
        label: part,
        chipText: part,
        chipCls: info.cls,
        desc: info.desc,
        tokens: [{ token: part, cls: info.cls === 'is-good' ? 'tok-strict' : info.cls === 'is-danger' ? 'tok-danger' : info.cls === 'is-risk' ? 'tok-risk' : '', note: '' }],
        status: info.cls === 'is-good' ? 'secure' : info.cls ? 'warning' : '',
      };
    });
  }

  if (key === 'x-frame-options') {
    const upper = val.toUpperCase();
    const ok = upper === 'DENY' || upper === 'SAMEORIGIN';
    const desc = upper === 'DENY'
      ? 'Completely forbids any site (even the same origin) from framing this page.'
      : upper === 'SAMEORIGIN'
        ? 'Allows framing only by pages on the exact same origin; blocks all third-party framing.'
        : 'Non-standard or deprecated X-Frame-Options value. Prefer DENY, SAMEORIGIN, or CSP frame-ancestors.';
    return [{
      label: val,
      chipText: val,
      chipCls: ok ? 'is-good' : 'is-risk',
      desc,
      tokens: [{ token: val, cls: ok ? 'tok-strict' : 'tok-risk', note: ok ? 'anti-clickjacking' : 'invalid/legacy' }],
      status: ok ? 'secure' : 'warning',
    }];
  }

  if (key === 'x-content-type-options') {
    const ok = val.toLowerCase() === 'nosniff';
    return [{
      label: val,
      chipText: val,
      chipCls: ok ? 'is-good' : 'is-risk',
      desc: ok
        ? 'Strictly enforces declared MIME types on scripts and stylesheets, blocking MIME-confusion attacks.'
        : 'Unrecognized value — X-Content-Type-Options only accepts "nosniff".',
      tokens: [{ token: val, cls: ok ? 'tok-strict' : 'tok-risk', note: ok ? 'enforced' : 'expected nosniff' }],
      status: ok ? 'secure' : 'warning',
    }];
  }

  if (key === 'cross-origin-opener-policy' || key === 'cross-origin-embedder-policy' || key === 'cross-origin-resource-policy') {
    return val.split(';').map(s => s.trim()).filter(Boolean).map(part => {
      const lower = part.toLowerCase();
      const good = ['same-origin', 'same-site', 'require-corp', 'credentialless'].includes(lower);
      const risky = ['unsafe-none', 'cross-origin'].includes(lower);
      const descMap = {
        'same-origin': 'Strictly restricts sharing/loading exclusively to the exact same origin.',
        'same-origin-allow-popups': 'Isolates from cross-origin openers while retaining references to popups opened by this page.',
        'same-site': 'Permits loading from subdomains belonging to the same registrable site.',
        'require-corp': 'Requires cross-origin subresources to explicitly opt in via CORP or CORS.',
        'credentialless': 'Loads cross-origin no-cors resources without cookies/credentials to achieve isolation.',
        'unsafe-none': 'Default browser behavior — no cross-origin isolation enforced.',
        'cross-origin': 'Explicitly allows any cross-origin website to embed or fetch this resource.',
      };
      return {
        label: part,
        chipText: part,
        chipCls: good ? 'is-good' : risky ? 'is-risk' : '',
        desc: descMap[lower] || 'Cross-origin isolation parameter.',
        tokens: [{ token: part, cls: good ? 'tok-strict' : risky ? 'tok-risk' : '', note: '' }],
        status: good ? 'secure' : risky ? 'warning' : '',
      };
    });
  }

  if (key === 'x-xss-protection') {
    return val.split(';').map(s => s.trim()).filter(Boolean).map(part => {
      const lower = part.toLowerCase();
      const desc = lower === '0'
        ? 'Disables the legacy browser XSS Auditor (modern OWASP recommendation to prevent auditor side-channel leaks).'
        : lower === '1'
          ? 'Enables legacy browser XSS filtering in older pre-Chromium/IE browsers.'
          : lower === 'mode=block'
            ? 'Instructs legacy XSS filters to block rendering the entire page rather than sanitizing inline scripts.'
            : 'X-XSS-Protection parameter.';
      return {
        label: part,
        chipText: part,
        chipCls: lower === '0' || lower === 'mode=block' ? 'is-good' : '',
        desc,
        tokens: [{ token: part, cls: lower === '0' ? 'tok-strict' : 'tok-self', note: '' }],
      };
    });
  }

  if (key.startsWith('access-control-') || key === 'vary') {
    return splitTopLevelCommas(val).map(part => {
      const lower = part.toLowerCase();
      const danger = part === '*' || lower === 'null';
      let desc = 'Configured header value.';
      if (key === 'access-control-allow-origin') {
        desc = part === '*'
          ? 'Wildcard allows JavaScript on ANY website to read responses (unsafe if sensitive data is returned).'
          : lower === 'null'
            ? 'Allows "null" origin — dangerous because sandboxed iframes can forge null-origin requests.'
            : `Explicitly trusts cross-origin requests from ${part}.`;
      } else if (key === 'access-control-allow-credentials') {
        desc = lower === 'true'
          ? 'Allows cross-origin requests to include cookies and Authorization headers.'
          : 'Credentials disabled for cross-origin requests.';
      }
      return {
        label: part,
        chipText: part,
        chipCls: danger ? 'is-risk' : '',
        desc,
        tokens: [{ token: part, cls: danger ? 'tok-risk' : 'tok-self', note: '' }],
        status: danger ? 'warning' : '',
      };
    });
  }

  // Generic semicolon or comma parameter splitting for other HTTP headers (content-type, set-cookie, alt-svc, etc.)
  const semiParts = val.includes(';') ? val.split(';').map(s => s.trim()).filter(Boolean) : [val];
  if (semiParts.length > 1) {
    return semiParts.map((part, idx) => ({
      label: idx === 0 ? 'Primary Value' : (part.split('=')[0] || `Param ${idx}`),
      chipText: part.length > 48 ? part.slice(0, 45) + '…' : part,
      chipCls: '',
      desc: idx === 0 ? 'Primary header value.' : 'Header attribute / parameter.',
      tokens: [{ token: part, cls: '', note: '' }],
    }));
  }

  return [{
    label: 'Value',
    chipText: val.length > 68 ? val.slice(0, 65) + '…' : val,
    chipCls: '',
    desc: getHeaderDoc(key).overview,
    tokens: [{ token: val, cls: '', note: '' }],
  }];
}

function buildInlineChipsForHeader(name, value) {
  const blocks = parseHeaderIntoBlocks(name, value);
  if (!blocks.length) {
    return { chipsHTML: '<span class="csp-mini-chip">(empty)</span>', count: 0 };
  }
  const maxVisible = 7;
  const shown = blocks.slice(0, maxVisible).map(b =>
    `<span class="csp-mini-chip${b.chipCls ? ' ' + b.chipCls : ''}">${esc(b.chipText)}</span>`
  );
  if (blocks.length > maxVisible) {
    shown.push(`<span class="csp-mini-chip is-more">+${blocks.length - maxVisible} more</span>`);
  }
  return { chipsHTML: shown.join(''), count: blocks.length };
}

function classifyCspToken(token) {
  const lower = token.toLowerCase();
  if (CSP_TOKEN_HINTS[lower]) return CSP_TOKEN_HINTS[lower];
  if (/^'(sha256|sha384|sha512)-/i.test(token)) return { cls: 'tok-hash', note: 'hash' };
  if (/^'nonce-/i.test(token)) return { cls: 'tok-hash', note: 'nonce' };
  if (lower === 'http:' || lower === 'ws:') return { cls: 'tok-danger', note: 'unencrypted scheme' };
  if (/^[a-z][a-z0-9+.-]*:$/i.test(token)) return { cls: 'tok-scheme', note: 'scheme' };
  if (token.includes('*')) return { cls: 'tok-risk', note: 'wildcard host' };
  return { cls: '', note: '' };
}

let currentCopyPayload = '';
let currentCopyLabelDefault = 'Copy Header';

(function initCspDialog() {
  const dialog = document.getElementById('csp-dialog');
  if (!dialog) return;

  const iconSlot = document.getElementById('csp-dialog-icon');
  if (iconSlot) iconSlot.innerHTML = ICONS.shield;

  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const isOutside = (e) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    let pressedOutside = false;
    dialog.addEventListener('pointerdown', (e) => {
      pressedOutside = e.target === dialog && isOutside(e);
    });
    dialog.addEventListener('pointerup', (e) => {
      if (pressedOutside && e.target === dialog && isOutside(e)) dialog.close();
      pressedOutside = false;
    });
  }

  const copyBtn = document.getElementById('csp-copy-formatted-btn');
  if (copyBtn) {
    copyBtn.insertAdjacentHTML('afterbegin', ICONS.copy);
    copyBtn.addEventListener('click', async () => {
      if (!currentCopyPayload) return;
      await copyText(currentCopyPayload);
      const label = copyBtn.querySelector('.copy-label');
      if (label) {
        label.textContent = 'Copied';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          label.textContent = currentCopyLabelDefault;
          copyBtn.classList.remove('copied');
        }, 1400);
      }
    });
  }
})();

function openInspectorFromEl(el) {
  const kind = el.dataset.inspectKind || 'raw';
  const name = el.dataset.inspectName || el.dataset.cspHeader || 'Header';
  const value = el.dataset.inspectValue !== undefined ? el.dataset.inspectValue : (el.dataset.cspValue || '');
  const extra = el.dataset.inspectExtra || '';
  openHeaderModal({ kind, name, value, extra });
}

function setDialogAccent(color, iconName) {
  const iconSlot = document.getElementById('csp-dialog-icon');
  if (!iconSlot) return;
  iconSlot.className = `section-icon ${color}`;
  iconSlot.innerHTML = ICONS[iconName] || ICONS.shield;
}

function renderBreakdownCards(cards) {
  return cards.map((c, idx) => {
    const cardCls = c.status === 'warning' ? ' has-risk' : c.status === 'secure' ? ' has-strict' : '';
    const badge = c.status === 'warning'
      ? `<span class="pill pill-warning">Review</span>`
      : c.status === 'secure'
        ? `<span class="pill pill-secure">Good</span>`
        : c.status === 'critical'
          ? `<span class="pill pill-critical">Critical</span>`
          : '';
    const tokensHTML = (c.tokens || []).map(t =>
      `<span class="csp-token ${t.cls || ''}">${esc(t.token)}${t.note ? `<span class="csp-token-note">· ${esc(t.note)}</span>` : ''}</span>`
    ).join('');
    return `
      <div class="csp-directive-card${cardCls}">
        <div class="csp-dir-top">
          <div class="csp-dir-title">
            <span class="csp-dir-idx">${String(idx + 1).padStart(2, '0')}</span>
            <span class="csp-dir-name">${esc(c.label)}</span>
          </div>
          ${badge}
        </div>
        <div class="csp-dir-desc">${esc(c.desc)}</div>
        ${tokensHTML ? `<div class="csp-tokens">${tokensHTML}</div>` : ''}
      </div>`;
  }).join('');
}

function openHeaderModal({ kind, name, value, extra }) {
  const dialog = document.getElementById('csp-dialog');
  if (!dialog) return;

  const titleEl = document.getElementById('csp-dialog-title');
  const subEl = document.getElementById('csp-dialog-sub');
  const summaryEl = document.getElementById('csp-dialog-summary');
  const bodyEl = document.getElementById('csp-dialog-body');
  const copyLabelEl = document.getElementById('csp-copy-btn-label');

  const doc = getHeaderDoc(name);
  titleEl.textContent = name;

  if (kind === 'missing') {
    setDialogAccent('red', 'alert');
    subEl.textContent = 'Missing Security Header — Risk & Recommended Configuration';
    currentCopyLabelDefault = 'Copy Recommended';
    currentCopyPayload = doc.recommended || `${name}: `;
    if (copyLabelEl) copyLabelEl.textContent = currentCopyLabelDefault;

    summaryEl.innerHTML = `
      <span class="metric-pill mp-red">${ICONS.xCircle} Missing from Response</span>
      <span class="metric-pill mp-neutral">${ICONS.shield} Recommended Hardening</span>`;

    const recValue = (doc.recommended || '').split(':').slice(1).join(':').trim();
    const recBlocks = recValue ? parseHeaderIntoBlocks(name, recValue) : [];

    bodyEl.innerHTML = `
      <div class="inspector-overview">
        <div class="inspector-overview-label">What this header does</div>
        <div class="inspector-overview-text">${esc(doc.overview || extra)}</div>
        ${doc.recommended ? `<div class="inspector-rec-box"><div class="inspector-rec-title">Recommended Header</div>${esc(doc.recommended)}</div>` : ''}
      </div>
      ${recBlocks.length ? renderBreakdownCards(recBlocks) : ''}`;

    if (!dialog.open) dialog.showModal();
    return;
  }

  if (kind === 'cookie') {
    setDialogAccent('magenta', 'cookie');
    titleEl.textContent = `Cookie: ${name}`;
    subEl.textContent = 'Set-Cookie Security Hardening Breakdown';
    currentCopyLabelDefault = 'Copy Example';
    currentCopyPayload = `Set-Cookie: ${name}=<value>; Secure; HttpOnly; SameSite=Lax; Path=/`;
    if (copyLabelEl) copyLabelEl.textContent = currentCopyLabelDefault;

    const missingList = value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const cookieFlags = [
      {
        flag: 'Secure',
        missing: missingList.some(m => m.includes('secure')),
        desc: 'Ensures the browser transmits this cookie exclusively over encrypted HTTPS connections, preventing plaintext interception on public networks.',
      },
      {
        flag: 'HttpOnly',
        missing: missingList.some(m => m.includes('httponly')),
        desc: 'Hides the cookie from client-side JavaScript (document.cookie), preventing session theft if an XSS vulnerability occurs.',
      },
      {
        flag: 'SameSite=Lax / Strict',
        missing: missingList.some(m => m.includes('samesite')),
        desc: 'Controls whether the cookie is sent with cross-site requests, defending authenticated endpoints against Cross-Site Request Forgery (CSRF).',
      },
    ];

    summaryEl.innerHTML = `
      <span class="metric-pill mp-yellow">${ICONS.zap} ${missingList.length} Missing Flag${missingList.length === 1 ? '' : 's'}</span>
      <span class="metric-pill mp-neutral">${ICONS.cookie} Set-Cookie Audit</span>`;

    bodyEl.innerHTML = `
      <div class="inspector-overview">
        <div class="inspector-overview-label">Cookie Security Overview</div>
        <div class="inspector-overview-text">${esc(HEADER_DOCS['set-cookie'].overview)}</div>
        <div class="inspector-rec-box"><div class="inspector-rec-title">Hardened Set-Cookie Template</div>${esc(currentCopyPayload)}</div>
      </div>
      ${renderBreakdownCards(cookieFlags.map(f => ({
        label: f.flag,
        desc: f.desc,
        status: f.missing ? 'warning' : 'secure',
        tokens: [{
          token: f.missing ? `Missing ${f.flag}` : `${f.flag} present`,
          cls: f.missing ? 'tok-danger' : 'tok-strict',
          note: f.missing ? 'add to Set-Cookie' : 'configured',
        }],
      })))}`;

    if (!dialog.open) dialog.showModal();
    return;
  }

  if (kind === 'transport') {
    const status = extra || 'info';
    const color = status === 'secure' ? 'green' : status === 'insecure' ? 'red' : status === 'warning' ? 'yellow' : 'blue';
    setDialogAccent(color, 'shield');
    subEl.textContent = 'Transport & TLS Encryption Check';
    currentCopyLabelDefault = 'Copy Status';
    currentCopyPayload = `${name}: ${value}`;
    if (copyLabelEl) copyLabelEl.textContent = currentCopyLabelDefault;

    const transportDocs = {
      'Connection Status': 'Verifies whether the final HTTP response was delivered over an encrypted TLS/HTTPS channel with a valid certificate.',
      'Plain HTTP Upgrade': 'Tests port 80 (http://) to verify that plain HTTP visitors are immediately redirected (301/308) to HTTPS rather than served unencrypted content.',
      'HTTPS Availability': 'Checks whether the server also listens on HTTPS (port 443) when a plain HTTP URL was scanned.',
      'Redirection': 'Tracks whether an initial plain HTTP request automatically upgraded to an encrypted HTTPS endpoint.',
      'Certificate Error': 'Details TLS certificate validation failures (expired, self-signed, or hostname mismatch).',
      'Source': 'Indicates how response headers were loaded for offline analysis.',
    };

    const pillCls = status === 'secure' ? 'mp-green' : status === 'insecure' ? 'mp-red' : status === 'warning' ? 'mp-yellow' : 'mp-neutral';
    summaryEl.innerHTML = `<span class="metric-pill ${pillCls}">${ICONS.shield} ${esc(STATUS_LABELS[status] || 'Info')}</span>`;
    bodyEl.innerHTML = `
      <div class="inspector-overview">
        <div class="inspector-overview-label">What this check verifies</div>
        <div class="inspector-overview-text">${esc(transportDocs[name] || 'Evaluates transport-layer encryption and redirect posture.')}</div>
      </div>
      ${renderBreakdownCards([{
        label: name,
        desc: 'Observed transport state during scan.',
        status: status === 'secure' ? 'secure' : status === 'insecure' ? 'critical' : status === 'warning' ? 'warning' : '',
        tokens: [{ token: value, cls: status === 'secure' ? 'tok-strict' : status === 'insecure' ? 'tok-danger' : status === 'warning' ? 'tok-risk' : 'tok-self', note: '' }],
      }])}`;

    if (!dialog.open) dialog.showModal();
    return;
  }

  if (kind === 'warning') {
    const [sev = 'warning', rawVal = ''] = extra.split('||');
    setDialogAccent(sev === 'critical' ? 'red' : 'yellow', 'zap');
    subEl.textContent = `${SEVERITY_LABELS[sev] || 'Warning'} — Finding & Remediation`;
    currentCopyLabelDefault = doc.recommended ? 'Copy Fix' : 'Copy Finding';
    currentCopyPayload = doc.recommended || `${name}: ${value}`;
    if (copyLabelEl) copyLabelEl.textContent = currentCopyLabelDefault;

    const pillCls = sev === 'critical' ? 'mp-red' : sev === 'warning' ? 'mp-yellow' : 'mp-neutral';
    summaryEl.innerHTML = `<span class="metric-pill ${pillCls}">${ICONS.zap} ${esc(SEVERITY_LABELS[sev] || 'Info')}</span>`;

    const cards = [{
      label: 'Detected Issue',
      desc: value,
      status: sev === 'critical' ? 'critical' : 'warning',
      tokens: rawVal ? [{ token: `${name}: ${rawVal}`, cls: 'tok-risk', note: 'observed value' }] : [{ token: name, cls: 'tok-risk', note: '' }],
    }];
    if (rawVal) {
      const parsed = parseHeaderIntoBlocks(name, rawVal);
      if (parsed.length > 1) cards.push(...parsed);
    }

    bodyEl.innerHTML = `
      <div class="inspector-overview">
        <div class="inspector-overview-label">Background & Remediation</div>
        <div class="inspector-overview-text">${esc(doc.overview)}</div>
        ${doc.recommended ? `<div class="inspector-rec-box"><div class="inspector-rec-title">Recommended Action</div>${esc(doc.recommended)}</div>` : ''}
      </div>
      ${renderBreakdownCards(cards)}`;

    if (!dialog.open) dialog.showModal();
    return;
  }

  // Present Security Header, CORS Header, or Raw Response Header
  const blocks = parseHeaderIntoBlocks(name, value);
  const isCsp = isCspHeader(name);

  if (isCsp) {
    setDialogAccent('cyan', 'shield');
    const isReportOnly = name.toLowerCase().includes('report-only');
    subEl.textContent = isReportOnly
      ? 'Report-Only CSP — violations are logged without blocking resources'
      : 'Enforced Content Security Policy — directive-by-directive breakdown';
    currentCopyLabelDefault = 'Copy Formatted';
    const directives = parseCspDirectives(value);
    currentCopyPayload = directives.map(d => `${d.name}${d.values.length ? ' ' + d.values.join(' ') : ''};`).join('\n');
  } else {
    setDialogAccent(kind === 'present' ? 'green' : 'cyan', kind === 'cors' ? 'globe' : 'checkCircle');
    subEl.textContent = kind === 'present'
      ? 'Present Security Header — directive & parameter breakdown'
      : kind === 'cors'
        ? 'Cross-Origin Resource Sharing (CORS) Header'
        : 'HTTP Response Header Breakdown';
    currentCopyLabelDefault = 'Copy Header';
    currentCopyPayload = `${name}: ${value}`;
  }
  if (copyLabelEl) copyLabelEl.textContent = currentCopyLabelDefault;

  const riskBlocks = blocks.filter(b => b.status === 'warning' || b.status === 'critical').length;
  let summaryPills = [
    `<span class="metric-pill mp-neutral">${ICONS.list} ${blocks.length} ${blocks.length === 1 ? 'Directive / Value' : 'Directives / Parts'}</span>`,
    riskBlocks > 0
      ? `<span class="metric-pill mp-yellow">${ICONS.zap} ${riskBlocks} Needs Review</span>`
      : `<span class="metric-pill mp-green">${ICONS.checkCircle} Clean Configuration</span>`,
  ];

  if (isCsp) {
    const dirs = parseCspDirectives(value);
    const hasFA = dirs.some(d => d.name === 'frame-ancestors');
    const hasObjNone = dirs.some(d => d.name === 'object-src' && d.values.some(v => v.toLowerCase() === "'none'"));
    summaryPills.push(
      hasFA
        ? `<span class="metric-pill mp-green">${ICONS.checkCircle} frame-ancestors set</span>`
        : `<span class="metric-pill mp-red">${ICONS.xCircle} Missing frame-ancestors</span>`
    );
    if (hasObjNone) {
      summaryPills.push(`<span class="metric-pill mp-green">${ICONS.checkCircle} object-src 'none'</span>`);
    }
  }

  summaryEl.innerHTML = summaryPills.join('');
  bodyEl.innerHTML = `
    <div class="inspector-overview">
      <div class="inspector-overview-label">Header Purpose</div>
      <div class="inspector-overview-text">${esc(doc.overview)}</div>
      ${doc.recommended && riskBlocks > 0 ? `<div class="inspector-rec-box"><div class="inspector-rec-title">Recommended Baseline</div>${esc(doc.recommended)}</div>` : ''}
    </div>
    ${renderBreakdownCards(blocks)}`;

  if (!dialog.open) dialog.showModal();
}
