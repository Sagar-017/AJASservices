import PocketBase from 'https://esm.sh/pocketbase';

const pb = new PocketBase('https://paperfree.bigbeetle.net');
pb.autoCancellation(false);

// Restore auth session
const savedToken = localStorage.getItem('pb_token') || sessionStorage.getItem('pb_token');
const savedModel = localStorage.getItem('pb_model') || sessionStorage.getItem('pb_model');
if (savedToken && savedModel) {
  try { pb.authStore.save(savedToken, JSON.parse(savedModel)); } catch {}
}
if (!pb.authStore.isValid) {
  window.location.href = 'login.html';
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    pb.authStore.clear();
    localStorage.removeItem('pb_auth');
    window.location.href = 'login.html';
  });
}

// Helpers
function safe(val) { return (val ?? '').toString(); }

// Render Enquiries
async function loadEnquiries() {
  const tbody = document.querySelector('#enquiries table tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
  try {
    const records = await pb.collection('domain_forms').getFullList({ filter: "type='enquiry'", sort: '-created' });
    if (!records.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="table-empty-state">No enquiries yet.</div></td></tr>';
      return;
    }
    tbody.innerHTML = records.map((r) => `
      <tr>
        <td>${safe(r.name)}</td>
        <td>${safe(r.phone)}</td>
        <td>${safe(r.email)}</td>
        <td>${safe(r.meta?.company)}</td>
        <td>${safe(r.meta?.nature)}</td>
        <td>${safe(r.meta?.service)}</td>
        <td>${safe(r.meta?.message)}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load enquiries:', err);
    tbody.innerHTML = '<tr><td colspan="7"><div class="table-empty-state">No enquiries yet.</div></td></tr>';
  }
}

// Render Audit Registrations stored in domain_forms (type='audit')
async function loadAuditRegistrations() {
  const tbody = document.querySelector('#audits table tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
  try {
    const records = await pb.collection('domain_forms').getFullList({ filter: "type='audit'", sort: '-created' });
    if (!records.length) {
      tbody.innerHTML = '<tr><td colspan="3"><div class="table-empty-state">No registrations yet.</div></td></tr>';
      return;
    }
    tbody.innerHTML = records.map((r) => `
      <tr>
        <td>${safe(r.name)}</td>
        <td>${safe(r.email)}</td>
        <td>${safe(r.phone)}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load audits enquiries:', err);
    tbody.innerHTML = '<tr><td colspan="3"><div class="table-empty-state">No registrations yet.</div></td></tr>';
  }
}

// Tabs
function initTabs() {
  const buttons = document.querySelectorAll('.tab-button');
  const contents = document.querySelectorAll('.tab-content');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      contents.forEach((c) => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab)?.classList.add('active');
    });
  });
}

// Init
initTabs();
await loadEnquiries();
await loadAuditRegistrations();

