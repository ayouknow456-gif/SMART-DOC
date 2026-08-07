// ==========================================================
// SMART DOC — app.js
// ไม่มี dependency ภายนอก ทำงานได้ทันทีบน GitHub Pages
// ==========================================================

const paper = document.getElementById('paper');
const page = document.getElementById('page');
const statusTemplate = document.getElementById('status-template');
const statusSaved = document.getElementById('status-saved');

let activeTemplateId = null;

/* ---------------- Templates ---------------- */
function renderTemplateList() {
  const ul = document.getElementById('template-list');
  ul.innerHTML = '';
  TEMPLATES.forEach(t => {
    const li = document.createElement('li');
    li.dataset.id = t.id;
    li.innerHTML = `${t.name}<span class="tpl-code">${t.code}</span>`;
    li.addEventListener('click', () => loadTemplate(t.id, true));
    ul.appendChild(li);
  });
}

function loadTemplate(id, confirmIfDirty) {
  const tpl = TEMPLATES.find(t => t.id === id);
  if (!tpl) return;

  if (confirmIfDirty && page.innerText.trim().length > 0) {
    const ok = confirm('เปลี่ยนแบบฟอร์มใหม่จะล้างเนื้อหาปัจจุบันในหน้าเอกสาร ต้องการดำเนินการต่อหรือไม่?');
    if (!ok) return;
  }

  page.innerHTML = tpl.html;
  activeTemplateId = tpl.id;
  statusTemplate.textContent = `แบบฟอร์ม: ${tpl.name}`;

  document.querySelectorAll('#template-list li').forEach(li => {
    li.classList.toggle('active', li.dataset.id === id);
  });
}

/* ---------------- Toolbar: text commands ---------------- */
document.querySelectorAll('.toolbar button[data-cmd]').forEach(btn => {
  btn.addEventListener('click', () => {
    page.focus();
    document.execCommand(btn.dataset.cmd, false, null);
    updateToolbarState();
  });
});

document.getElementById('fontFamily').addEventListener('change', e => {
  page.focus();
  document.execCommand('fontName', false, e.target.value);
});

document.getElementById('fontSize').addEventListener('change', e => {
  page.focus();
  document.execCommand('fontSize', false, e.target.value);
});

document.getElementById('lineHeight').addEventListener('change', e => {
  page.style.lineHeight = e.target.value;
});

document.getElementById('btn-indent').addEventListener('click', () => {
  page.focus();
  document.execCommand('indent', false, null);
});
document.getElementById('btn-outdent').addEventListener('click', () => {
  page.focus();
  document.execCommand('outdent', false, null);
});

function updateToolbarState() {
  ['bold', 'italic', 'underline'].forEach(cmd => {
    const btn = document.querySelector(`.toolbar button[data-cmd="${cmd}"]`);
    if (!btn) return;
    btn.classList.toggle('active', document.queryCommandState(cmd));
  });
}
document.addEventListener('selectionchange', () => {
  if (document.activeElement === page) updateToolbarState();
});

/* ---------------- Table insert ---------------- */
const tablePicker = document.getElementById('table-picker');
const gridPicker = document.getElementById('grid-picker');
const gridLabel = document.getElementById('grid-label');
const GRID_ROWS = 6, GRID_COLS = 8;
let savedRange = null;

for (let r = 1; r <= GRID_ROWS; r++) {
  for (let c = 1; c <= GRID_COLS; c++) {
    const cell = document.createElement('div');
    cell.dataset.r = r; cell.dataset.c = c;
    cell.addEventListener('mouseenter', () => highlightGrid(r, c));
    cell.addEventListener('click', () => {
      insertTable(r, c);
      tablePicker.classList.add('hidden');
    });
    gridPicker.appendChild(cell);
  }
}
function highlightGrid(r, c) {
  gridLabel.textContent = `${r} × ${c}`;
  [...gridPicker.children].forEach(cell => {
    const cr = +cell.dataset.r, cc = +cell.dataset.c;
    cell.classList.toggle('hover', cr <= r && cc <= c);
  });
}

document.getElementById('btn-table').addEventListener('click', (e) => {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) savedRange = sel.getRangeAt(0);
  tablePicker.classList.toggle('hidden');
});
document.addEventListener('click', (e) => {
  if (!tablePicker.contains(e.target) && e.target.id !== 'btn-table') {
    tablePicker.classList.add('hidden');
  }
});

function insertTable(rows, cols) {
  page.focus();
  if (savedRange) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }
  let html = '<table>';
  for (let r = 0; r < rows; r++) {
    html += '<tr>';
    for (let c = 0; c < cols; c++) html += '<td>&nbsp;</td>';
    html += '</tr>';
  }
  html += '</table><p><br></p>';
  document.execCommand('insertHTML', false, html);
}

/* ---------------- Image insert ---------------- */
const fileImage = document.getElementById('file-image');
document.getElementById('btn-image').addEventListener('click', () => fileImage.click());
fileImage.addEventListener('change', () => {
  const file = fileImage.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    page.focus();
    document.execCommand('insertHTML', false,
      `<img src="${reader.result}" style="width:4cm;" contenteditable="false">`);
  };
  reader.readAsDataURL(file);
  fileImage.value = '';
});

/* ---------------- Structure guides ---------------- */
function applyMarginVars() {
  const top = document.getElementById('margin-top').value + 'cm';
  const left = document.getElementById('margin-left').value + 'cm';
  const right = document.getElementById('margin-right').value + 'cm';
  const bottom = document.getElementById('margin-bottom').value + 'cm';
  paper.style.setProperty('--m-top', top);
  paper.style.setProperty('--m-left', left);
  paper.style.setProperty('--m-right', right);
  paper.style.setProperty('--m-bottom', bottom);
}
['margin-top', 'margin-left', 'margin-right', 'margin-bottom'].forEach(id => {
  document.getElementById(id).addEventListener('input', applyMarginVars);
});
applyMarginVars();

document.getElementById('crest-size').addEventListener('input', (e) => {
  paper.style.setProperty('--crest-size', e.target.value + 'cm');
});
paper.style.setProperty('--crest-size', document.getElementById('crest-size').value + 'cm');

document.getElementById('toggle-margins').addEventListener('change', e => {
  paper.classList.toggle('show-margins', e.target.checked);
});
document.getElementById('toggle-baseline').addEventListener('change', e => {
  paper.classList.toggle('show-baseline', e.target.checked);
});
document.getElementById('toggle-crest').addEventListener('change', e => {
  paper.classList.toggle('show-crest', e.target.checked);
  document.getElementById('crest-size-row').style.display = e.target.checked ? '' : 'none';
});
paper.classList.add('show-margins', 'show-crest');

/* ---------------- Print ---------------- */
document.getElementById('btn-print').addEventListener('click', () => window.print());

/* ---------------- Draft save / load (localStorage) ---------------- */
const DRAFT_KEY = 'smartdoc-draft-v1';

document.getElementById('btn-save').addEventListener('click', () => {
  const draft = {
    templateId: activeTemplateId,
    content: page.innerHTML,
    margins: {
      top: document.getElementById('margin-top').value,
      left: document.getElementById('margin-left').value,
      right: document.getElementById('margin-right').value,
      bottom: document.getElementById('margin-bottom').value,
    },
    crestSize: document.getElementById('crest-size').value,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  statusSaved.textContent = `บันทึกฉบับร่างแล้ว (${new Date().toLocaleTimeString('th-TH')})`;
});

document.getElementById('btn-load').addEventListener('click', () => {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) { alert('ยังไม่มีฉบับร่างที่บันทึกไว้'); return; }
  const draft = JSON.parse(raw);
  page.innerHTML = draft.content;
  activeTemplateId = draft.templateId;
  if (draft.margins) {
    document.getElementById('margin-top').value = draft.margins.top;
    document.getElementById('margin-left').value = draft.margins.left;
    document.getElementById('margin-right').value = draft.margins.right;
    document.getElementById('margin-bottom').value = draft.margins.bottom;
    applyMarginVars();
  }
  if (draft.crestSize) {
    document.getElementById('crest-size').value = draft.crestSize;
    paper.style.setProperty('--crest-size', draft.crestSize + 'cm');
  }
  const tpl = TEMPLATES.find(t => t.id === draft.templateId);
  statusTemplate.textContent = tpl ? `แบบฟอร์ม: ${tpl.name}` : 'ฉบับร่างที่กู้คืน';
  statusSaved.textContent = `กู้คืนจากฉบับร่างเมื่อ ${new Date(draft.savedAt).toLocaleString('th-TH')}`;
});

document.getElementById('btn-reset').addEventListener('click', () => {
  const ok = confirm('ล้างเนื้อหาทั้งหมดในหน้าเอกสารหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้');
  if (!ok) return;
  page.innerHTML = '';
  activeTemplateId = null;
  statusTemplate.textContent = 'ยังไม่ได้เลือกแบบฟอร์ม';
  document.querySelectorAll('#template-list li').forEach(li => li.classList.remove('active'));
});

/* ---------------- Init ---------------- */
renderTemplateList();
loadTemplate(TEMPLATES[0].id, false);
