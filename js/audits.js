import PocketBase from "https://esm.sh/pocketbase";
const pb = new PocketBase("https://paperfree.bigbeetle.net/");
pb.autoCancellation(false);

// Admin session check (same as dashboard.js)
const savedToken = localStorage.getItem("pb_token") || sessionStorage.getItem("pb_token");
const savedModel = localStorage.getItem("pb_model") || sessionStorage.getItem("pb_model");
if (savedToken && savedModel) {
  pb.authStore.save(savedToken, JSON.parse(savedModel));
} else {
  window.location.href = "login.html";
}
if (!pb.authStore.isValid) {
  window.location.href = "login.html";
}

document.getElementById('logoutBtn').addEventListener('click', function (e) {
  e.preventDefault();
  pb.authStore.clear();
  localStorage.removeItem('pb_auth');
  window.location.href = 'login.html';
});

// Tab switching
const tabButtons = document.querySelectorAll('.tab-button[data-tab]');
const tabContents = document.querySelectorAll('.tab-content');
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Modal logic
const auditModal = document.getElementById('auditModal');
const addAuditBtn = document.getElementById('addAuditBtn');
const closeAuditModal = document.getElementById('closeAuditModal');
const auditForm = document.getElementById('auditForm');
const saveDraftBtn = document.getElementById('saveDraftBtn');

function openModal() {
  auditForm.reset();
  auditModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  auditModal.style.display = 'none';
  document.body.style.overflow = '';
}
addAuditBtn.addEventListener('click', openModal);
closeAuditModal.addEventListener('click', closeModal);
window.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});
auditModal.addEventListener('click', function (e) {
  if (e.target === auditModal) closeModal();
});

// Render tables
async function renderAudits() {
  const draftsTbody = document.getElementById('draftsTableBody');
  const liveTbody = document.getElementById('liveTableBody');
  draftsTbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
  liveTbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
  try {
    const audits = await pb.collection('audits').getFullList({ sort: '-created' });
    if (!audits || audits.length === 0) {
      const empty = '<tr><td colspan="5"><div class="table-empty-state">No audits available at the moment. Please add new to see the audits.</div></td></tr>';
      draftsTbody.innerHTML = empty;
      liveTbody.innerHTML = empty;
      return;
    }
    const now = new Date();
    const draftRows = [];
    const liveRows = [];
    for (const audit of audits) {
      const row = `<tr>
        <td>${audit.name}</td>
        <td>${audit.description}</td>
        <td>${formatDateTime(audit.auditDateTime)}</td>
        <td>${formatDate(audit.lastDate)}</td>
        <td><button class="tab-button" data-delete="${audit.id}">Delete</button></td>
      </tr>`;
      if (audit.status === 'draft') draftRows.push(row);
      if (audit.status === 'live' && new Date(audit.lastDate) >= now) liveRows.push(row);
    }
    draftsTbody.innerHTML = draftRows.length ? draftRows.join('') : '<tr><td colspan="5">No drafts.</td></tr>';
    liveTbody.innerHTML = liveRows.length ? liveRows.join('') : '<tr><td colspan="5">No live audits.</td></tr>';
    // Attach delete logic
    document.querySelectorAll('button[data-delete]').forEach(btn => {
      btn.addEventListener('click', async function() {
        if (confirm('Delete this audit?')) {
          await pb.collection('audits').delete(btn.dataset.delete);
          renderAudits();
        }
      });
    });
  } catch (err) {
    const empty = '<tr><td colspan="5"><div class="table-empty-state">No audits available at the moment. Please add new to see the audits.</div></td></tr>';
    draftsTbody.innerHTML = empty;
    liveTbody.innerHTML = empty;
  }
}
function formatDateTime(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function formatDate(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

// Add audit (draft or live)
auditForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  await saveAudit('live');
});
saveDraftBtn.addEventListener('click', async function(e) {
  e.preventDefault();
  await saveAudit('draft');
});
async function saveAudit(status) {
  const name = auditForm.auditName.value.trim();
  const description = auditForm.auditDescription.value.trim();
  const auditDateTimeRaw = auditForm.auditDateTime.value; // e.g. 2025-08-12T14:30
  const lastDate = auditForm.lastDate.value; // e.g. 2025-08-15
  // Normalize datetime to ISO for backend robustness
  const auditDateTime = auditDateTimeRaw ? new Date(auditDateTimeRaw).toISOString() : '';
  if (!name || !description || !auditDateTime || !lastDate) {
    alert('Please fill all fields.');
    return;
  }
  try {
    await pb.collection('audits').create({
      name,
      description,
      auditDateTime,
      lastDate,
      status
    });
    closeModal();
    renderAudits();
  } catch (err) {
    alert('Error saving audit.');
  }
}

// Initial render
renderAudits(); 