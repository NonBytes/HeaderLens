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
  const url = document.getElementById('url-input').value.trim();
  if (!url) return;
  const followRedirects = document.getElementById('follow-redirects').checked;
  const headersText = document.getElementById('custom-headers').value.trim();
  const customHeaders = headersText ? headersText.split('\n').filter(h => h.trim()) : [];

  showLoading('scan');
  try {
    const result = await invoke('scan_url', { url, followRedirects, customHeaders });
    scanResult = result;
    if (result.error) {
      showError('scan', result.error);
      return;
    }
    showResults('scan', renderSingleResult(result));
    await invoke('save_to_history', { url, result });
  } catch (err) {
    showError('scan', err.toString());
  }
}

// --- Batch Scan ---

document.getElementById('batch-scan-btn').addEventListener('click', async () => {
  const text = document.getElementById('batch-urls').value.trim();
  if (!text) return;
  const urls = text.split('\n').map(u => u.trim()).filter(u => u);
  const followRedirects = document.getElementById('batch-follow-redirects').checked;

  showLoading('batch');
  const progressText = document.getElementById('batch-progress-text');
  const progressBar = document.getElementById('batch-progress-bar');
  const progressFill = progressBar.querySelector('.progress-fill');
  progressBar.classList.remove('hidden');
  progressFill.style.width = '0%';

  const results = [];
  for (let i = 0; i < urls.length; i++) {
    progressText.textContent = `Scanning ${i + 1} / ${urls.length}…`;
    progressFill.style.width = `${((i) / urls.length) * 100}%`;
    try {
      const result = await invoke('scan_url', { url: urls[i], followRedirects, customHeaders: [] });
      results.push(result);
      if (!result.error) {
        try { await invoke('save_to_history', { url: result.url, result }); } catch {}
      }
    } catch (err) {
      results.push({ url: urls[i], error: err.toString(), final_url: '', status_code: 0, http_version: '', transport_security: [], cors: [], cookie_warnings: [], present_headers: [], missing_headers: [], warnings: [], all_headers: {} });
    }
  }
  progressFill.style.width = '100%';
  batchResults = results;
  showResults('batch', renderBatchHTML(results));
});

document.getElementById('export-batch-json-btn').addEventListener('click', async () => {
  if (!batchResults) return;
  downloadText(JSON.stringify(batchResults, null, 2), 'headerlens-batch-report.json', 'application/json');
});

document.getElementById('export-batch-md-btn').addEventListener('click', async () => {
  if (!batchResults) return;
  let md = '# HeaderLens — Batch Security Headers Report\n\n';
  for (const result of batchResults) {
    if (result.error) {
      md += `## ${result.url}\n\nError: ${result.error}\n\n`;
    } else {
      try {
        const report = await invoke('export_report', { result, format: 'markdown' });
        md += report + '\n---\n\n';
      } catch {}
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
    fileResult = result;
    if (result.error) {
      showError('file', result.error);
      return;
    }
    showResults('file', renderSingleResult(result));
    const label = document.getElementById('file-label').value.trim();
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

function loadDroppedFileName(name, content) {
  document.getElementById('file-content').value = content;
  const labelInput = document.getElementById('file-label');
  if (!labelInput.value.trim() && name) labelInput.value = name;
}

(function initFileDrop() {
  const dz = document.getElementById('file-drop-zone');

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

  // Tauri delivers OS-level file drops as events when dragDropEnabled is on (default).
  try {
    const tauriEvent = window.__TAURI__ && window.__TAURI__.event;
    if (tauriEvent && tauriEvent.listen) {
      tauriEvent.listen('tauri://drag-enter', () => { if (fileTabActive()) dz.classList.add('drag-over'); });
      tauriEvent.listen('tauri://drag-over', () => { if (fileTabActive()) dz.classList.add('drag-over'); });
      tauriEvent.listen('tauri://drag-leave', () => dz.classList.remove('drag-over'));
      tauriEvent.listen('tauri://drag-drop', async e => {
        dz.classList.remove('drag-over');
        if (!fileTabActive()) return;
        const paths = e.payload && e.payload.paths;
        if (!paths || !paths.length) return;
        try {
          const content = await invoke('read_file', { path: paths[0] });
          loadDroppedFileName(paths[0].split(/[\\/]/).pop(), content);
        } catch (err) { console.error(err); }
      });
    }
  } catch (err) { console.error(err); }
})();

// --- Export & copy (scan + file + headers table) ---

document.addEventListener('click', async (e) => {
  const jsonBtn = e.target.closest('.export-json-btn');
  if (jsonBtn) {
    const result = jsonBtn.closest('#tab-scan') ? scanResult : fileResult;
    if (!result) return;
    try {
      const report = await invoke('export_report', { result, format: 'json' });
      downloadText(report, 'headerlens-report.json', 'application/json');
    } catch (err) { console.error(err); }
    return;
  }

  const mdBtn = e.target.closest('.export-md-btn, .file-export-md-btn');
  if (mdBtn) {
    const result = mdBtn.closest('#tab-scan') ? scanResult : fileResult;
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

  const copyBtn = e.target.closest('.copy-headers-btn');
  if (copyBtn) {
    const section = copyBtn.closest('.result-section');
    const rows = section ? section.querySelectorAll('.headers-table tbody tr') : [];
    if (!rows.length) return;
    const text = Array.from(rows).map(r => {
      const cells = r.querySelectorAll('td');
      return cells.length >= 2 ? `${cells[0].textContent.trim()}: ${cells[1].textContent.trim()}` : '';
    }).filter(Boolean).join('\n');
    await copyText(text);
    const label = copyBtn.querySelector('.copy-label');
    if (label) {
      label.textContent = 'Copied';
      copyBtn.classList.add('copied');
      setTimeout(() => { label.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 1400);
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
  });
});

// --- Compare vs History picker ---

let compareHistoryCache = [];
let selectedHistoryEntry = null;

async function loadCompareHistoryPicker() {
  try {
    compareHistoryCache = await invoke('get_history');
    renderCompareHistPicker(compareHistoryCache);
  } catch (err) { console.error(err); }
}

function renderCompareHistPicker(entries) {
  const query = (document.getElementById('compare-hist-search').value || '').toLowerCase();
  const filtered = query ? entries.filter(e => e.url.toLowerCase().includes(query)) : entries;
  const list = document.getElementById('compare-hist-list');
  if (!filtered.length) {
    list.innerHTML = emptyState('inbox', 'No history entries', query ? 'No entries match your search.' : 'Run a scan first to build history.', true);
    return;
  }
  list.innerHTML = filtered.map(e => {
    const score = e.result.error ? 0 : calculateScore(e.result);
    const cls = score >= 70 ? 'status-secure' : score >= 40 ? 'status-warning' : 'status-insecure';
    const sel = selectedHistoryEntry && selectedHistoryEntry.id === e.id ? ' selected' : '';
    return `<div class="compare-hist-item${sel}" data-hist-id="${esc(e.id)}">
      <div class="hist-item-url">${esc(e.url)}</div>
      <div class="hist-item-meta"><span class="${cls}">Score: ${score}</span><span>${formatDate(e.timestamp)}</span></div>
    </div>`;
  }).join('');

  list.querySelectorAll('.compare-hist-item').forEach(el => {
    el.addEventListener('click', () => {
      selectedHistoryEntry = compareHistoryCache.find(e => e.id === el.dataset.histId) || null;
      list.querySelectorAll('.compare-hist-item').forEach(i => i.classList.remove('selected'));
      el.classList.add('selected');
    });
  });
}

document.getElementById('compare-hist-search').addEventListener('input', () => {
  renderCompareHistPicker(compareHistoryCache);
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
    const liveResult = await invoke('scan_url', { url, followRedirects, customHeaders });
    showCompareResults(liveResult, selectedHistoryEntry.result, liveResult.final_url || url, histLabel);
  } catch (err) {
    showCompareError(err.toString());
  }
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
  document.getElementById('compare-loading').classList.add('hidden');
  document.getElementById('compare-results').classList.remove('hidden');
  document.getElementById('compare-summary').innerHTML = `<div class="error-message">${ICONS.alert}<span>${esc(msg)}</span></div>`;
  document.getElementById('compare-panel-a').innerHTML = '';
  document.getElementById('compare-panel-b').innerHTML = '';
}

function showCompareResults(resultA, resultB, labelA, labelB) {
  const scoreA = resultA.error ? 0 : calculateScore(resultA);
  const scoreB = resultB.error ? 0 : calculateScore(resultB);
  const clsA = scoreA >= 70 ? 'score-good' : scoreA >= 40 ? 'score-ok' : 'score-bad';
  const clsB = scoreB >= 70 ? 'score-good' : scoreB >= 40 ? 'score-ok' : 'score-bad';
  const diff = scoreA - scoreB;
  const diffText = diff > 0 ? `A +${diff}` : diff < 0 ? `B +${Math.abs(diff)}` : 'Equal';
  const diffCls = diff > 0 ? clsA : diff < 0 ? clsB : '';

  document.getElementById('compare-summary').innerHTML = `
    <div class="vs-side">
      <div class="score-label" title="${esc(labelA)}">${esc(labelA)}</div>
      <div class="vs-score-row">
        <span class="score-value ${clsA}">${scoreA}</span>
        <span class="grade-badge grade-sm ${clsA}">${scoreGrade(scoreA)}</span>
      </div>
    </div>
    <div class="compare-arrow">
      <div class="vs-badge">VS</div>
      <div class="vs-diff ${diffCls}">${diffText}</div>
    </div>
    <div class="vs-side">
      <div class="score-label" title="${esc(labelB)}">${esc(labelB)}</div>
      <div class="vs-score-row">
        <span class="score-value ${clsB}">${scoreB}</span>
        <span class="grade-badge grade-sm ${clsB}">${scoreGrade(scoreB)}</span>
      </div>
    </div>`;

  document.getElementById('compare-panel-a').innerHTML = resultA.error
    ? `<div class="error-message">${ICONS.alert}<span>${esc(resultA.error)}</span></div>`
    : renderSingleResult(resultA);
  document.getElementById('compare-panel-b').innerHTML = resultB.error
    ? `<div class="error-message">${ICONS.alert}<span>${esc(resultB.error)}</span></div>`
    : renderSingleResult(resultB);

  document.getElementById('compare-loading').classList.add('hidden');
  document.getElementById('compare-results').classList.remove('hidden');
  requestAnimationFrame(alignComparePanels);
}

function alignComparePanels() {
  const panelA = document.getElementById('compare-panel-a');
  const panelB = document.getElementById('compare-panel-b');
  if (!panelA || !panelB) return;
  const secA = panelA.querySelectorAll('.result-section');
  const secB = panelB.querySelectorAll('.result-section');
  const count = Math.min(secA.length, secB.length);
  for (let i = 0; i < count; i++) {
    secA[i].style.minHeight = '';
    secB[i].style.minHeight = '';
    const h = Math.max(secA[i].offsetHeight, secB[i].offsetHeight) + 'px';
    secA[i].style.minHeight = h;
    secB[i].style.minHeight = h;
  }
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
    const [resultA, resultB] = await Promise.all([
      invoke('scan_url', { url: urlA, followRedirects, customHeaders: customHeadersA }),
      invoke('scan_url', { url: urlB, followRedirects, customHeaders: customHeadersB }),
    ]);
    showCompareResults(resultA, resultB, resultA.final_url || urlA, resultB.final_url || urlB);
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
    const [resultA, resultB] = await Promise.all([
      invoke('scan_url', { url, followRedirects, customHeaders: fileCustomHeaders }),
      invoke('scan_file', { content }),
    ]);
    showCompareResults(resultA, resultB, resultA.final_url || url, label);
  } catch (err) {
    showCompareError(err.toString());
  }
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

  let html = '';
  for (const [url, entries] of groups) {
    const latest = entries[0];
    const score = latest.result.error ? 0 : calculateScore(latest.result);
    const cls = score >= 70 ? 'status-secure' : score >= 40 ? 'status-warning' : 'status-insecure';
    const countBadge = entries.length > 1 ? `<span class="history-count">${entries.length} scans</span>` : '';

    html += `
      <div class="history-group" data-url="${esc(url)}">
        <div class="history-entry" data-id="${esc(latest.id)}">
          <div class="history-entry-main">
            <div class="history-url">${esc(url)} ${countBadge}</div>
            <div class="history-meta">
              <span>Status: ${latest.result.status_code}</span>
              <span class="${cls}">Score: ${score}</span>
              <span>${formatDate(latest.timestamp)}</span>
            </div>
          </div>
          <button class="history-delete" type="button" onclick="event.stopPropagation(); deleteHistoryEntry('${esc(latest.id)}')" title="Delete entry" aria-label="Delete entry">${ICONS.trash}</button>
        </div>
      </div>`;
  }
  container.innerHTML = html;

  container.querySelectorAll('.history-entry').forEach(el => {
    el.addEventListener('click', () => {
      const group = el.closest('.history-group');
      const url = group.dataset.url;
      const entries = groups.get(url);
      const entry = entries.find(h => h.id === el.dataset.id) || entries[0];
      if (!entry) return;

      const existing = container.querySelector('.history-detail-inline');

      if (activeHistoryId === entry.id) {
        if (existing) existing.remove();
        el.classList.remove('selected');
        activeHistoryId = null;
        return;
      }

      if (existing) existing.remove();
      container.querySelectorAll('.history-entry').forEach(e => e.classList.remove('selected'));

      el.classList.add('selected');
      activeHistoryId = entry.id;

      const detail = document.createElement('div');
      detail.className = 'history-detail-inline';

      let detailHTML = '';
      if (entries.length > 1) {
        detailHTML += `<div class="history-versions"><span class="versions-label">Scan history:</span>`;
        entries.forEach((e, i) => {
          const s = e.result.error ? 0 : calculateScore(e.result);
          const c = s >= 70 ? 'status-secure' : s >= 40 ? 'status-warning' : 'status-insecure';
          const active = e.id === entry.id ? ' version-active' : '';
          detailHTML += `<button class="version-btn${active}" type="button" data-version-id="${esc(e.id)}"><span class="${c}">${s}</span> ${formatDate(e.timestamp)}</button>`;
        });
        detailHTML += `</div>`;
      }
      detailHTML += `<div class="history-detail-content">${renderSingleResult(entry.result)}</div>`;
      detail.innerHTML = detailHTML;

      group.insertAdjacentElement('afterend', detail);

      detail.querySelectorAll('.version-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const vEntry = entries.find(e => e.id === btn.dataset.versionId);
          if (!vEntry) return;
          activeHistoryId = vEntry.id;
          detail.querySelectorAll('.version-btn').forEach(b => b.classList.remove('version-active'));
          btn.classList.add('version-active');
          detail.querySelector('.history-detail-content').innerHTML = renderSingleResult(vEntry.result);
        });
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
  const el = document.createElement('div');
  el.textContent = str || '';
  return el.innerHTML;
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

  html += renderSection('blue', 'shield', 'Transport Security', result.transport_security.map(t =>
    `<div class="result-item"><span class="result-label">${esc(t.label)}</span><span class="result-value mono status-${t.status}">${esc(t.value)}</span><span class="pill pill-${t.status}">${STATUS_LABELS[t.status] || 'Info'}</span></div>`
  ));

  html += renderSection('cyan', 'globe', 'CORS Configuration',
    result.cors.length === 0
      ? [`<div class="section-empty">${ICONS.globe}<span>No CORS headers (same-origin default)</span></div>`]
      : result.cors.map(c => `<div class="result-item"><span class="result-label mono">${esc(c.header)}</span><span class="result-value mono">${esc(c.value)}</span></div>`)
  );

  html += renderSection('magenta', 'cookie', 'Cookie Security',
    result.cookie_warnings.length === 0
      ? [`<div class="section-empty ok">${ICONS.checkCircle}<span>No cookie issues</span></div>`]
      : result.cookie_warnings.map(c => `<div class="result-item"><span class="result-label mono header-missing">${esc(c.name)}</span><span class="result-value mono">Missing: ${esc(c.missing_flags)}</span><span class="pill pill-warning">Missing</span></div>`)
  );

  html += renderSection('green', 'checkCircle', `Security Headers Present (${result.present_headers.length})`,
    result.present_headers.length === 0
      ? [`<div class="section-empty">${ICONS.xCircle}<span>None</span></div>`]
      : result.present_headers.map(h => `<div class="result-item"><span class="item-icon ok">${ICONS.check}</span><span class="result-label mono header-present">${esc(h.name)}</span><span class="result-value mono">${esc(h.value)}</span><span class="pill pill-present">Present</span></div>`)
  );

  html += renderSection('red', 'alert', `Missing Security Headers (${result.missing_headers.length})`,
    result.missing_headers.length === 0
      ? [`<div class="section-empty ok">${ICONS.checkCircle}<span>None — excellent!</span></div>`]
      : result.missing_headers.map(h => `<div class="result-item"><span class="item-icon bad">${ICONS.xCircle}</span><span class="result-label mono header-missing">${esc(h.name)}</span><span class="result-value header-desc">${esc(h.description)}</span><span class="pill pill-missing">Missing</span></div>`)
  );

  html += renderSection('yellow', 'zap', `Warnings & Info Leaks (${result.warnings.length})`,
    result.warnings.length === 0
      ? [`<div class="section-empty ok">${ICONS.checkCircle}<span>None — good job!</span></div>`]
      : result.warnings.map(w => `<div class="result-item"><span class="pill pill-${w.severity}">${SEVERITY_LABELS[w.severity] || 'Info'}</span><span class="result-label mono">${esc(w.header)}</span><span class="result-value">${esc(w.message)}</span></div>`)
  );

  const headerEntries = Object.entries(result.all_headers);
  if (headerEntries.length > 0) {
    html += renderSection('blue', 'list', `All Response Headers (${headerEntries.length})`,
      [`<div class="table-scroll"><table class="headers-table"><thead><tr><th>Header</th><th>Value</th></tr></thead><tbody>${headerEntries.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div>`],
      `<button type="button" class="btn-small copy-headers-btn">${ICONS.copy}<span class="copy-label">Copy</span></button>`
    );
  }

  return html;
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

function renderBatchHTML(results) {
  let html = '';
  results.forEach((result, i) => {
    const score = result.error ? 0 : calculateScore(result);
    const cls = score >= 70 ? 'status-secure' : score >= 40 ? 'status-warning' : 'status-insecure';
    html += `
      <div class="batch-result-header" data-batch-idx="${i}">
        <span class="batch-url">${esc(result.url)}</span>
        <span class="batch-head-right">
          ${result.error
            ? '<span class="pill pill-insecure">Error</span>'
            : `<span class="batch-status">Status ${result.status_code}</span>`}
          <span class="batch-score ${cls}">Score ${score}</span>
          <span class="chevron">${ICONS.chevron}</span>
        </span>
      </div>
      <div class="batch-result-body" id="batch-${i}">
        ${result.error
          ? `<div class="error-message">${ICONS.alert}<span>${esc(result.error)}</span></div>`
          : renderSingleResult(result)}
      </div>`;
  });

  setTimeout(() => {
    document.querySelectorAll('.batch-result-header').forEach(el => {
      el.addEventListener('click', () => {
        el.classList.toggle('open');
        el.nextElementSibling.classList.toggle('open');
      });
    });
  }, 0);

  return html;
}
