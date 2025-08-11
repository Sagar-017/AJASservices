// dashboard.js
// Handles tab switching, PocketBase data fetching, and audit prospects modal

// PocketBase import (CDN)
import PocketBase from "https://esm.sh/pocketbase";
const pb = new PocketBase("https://paperfree.bigbeetle.net/");
pb.autoCancellation(false);

const tabBtns = document.querySelectorAll(".tab-btn");
const enquiriesTab = document.getElementById("enquiries-tab");

const auditsTab = document.getElementById("audits-tab");
const tabPanels = document.querySelectorAll(".tab-panel");
const prospectsModal = document.getElementById("audit-prospects-modal");
const closeProspectsModal = document.getElementById("close-prospects-modal");
const prospectsList = document.getElementById("prospects-list");

// --- Audits Management Section ---
const auditsSection = document.getElementById('auditsSection');
const addAuditBtn = document.getElementById('addAuditBtn');
const auditModal = document.getElementById('auditModal');
const closeAuditModal = document.getElementById('closeAuditModal');
const auditForm = document.getElementById('auditForm');
const saveDraftBtn = document.getElementById('saveDraftBtn');
const draftsTbody = document.getElementById('draftsTableBody');
const liveTbody = document.getElementById('liveTableBody');

// Tab switching for audits
const auditsTabButtons = auditsSection ? auditsSection.querySelectorAll('.tab-button[data-tab]') : [];
const auditsTabContents = auditsSection ? auditsSection.querySelectorAll('.tab-content') : [];
if (auditsTabButtons.length) {
  auditsTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      auditsTabButtons.forEach(b => b.classList.remove('active'));
      auditsTabContents.forEach(tab => tab.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

function openAuditModal() {
  auditForm.reset();
  auditModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeAuditModalFn() {
  auditModal.style.display = 'none';
  document.body.style.overflow = '';
}
if (addAuditBtn) addAuditBtn.addEventListener('click', openAuditModal);
if (closeAuditModal) closeAuditModal.addEventListener('click', closeAuditModalFn);
window.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && auditModal && auditModal.style.display === 'flex') closeAuditModalFn();
});
auditModal && auditModal.addEventListener('click', function (e) {
  if (e.target === auditModal) closeAuditModalFn();
});

async function renderAudits() {
  if (!draftsTbody || !liveTbody) return;
  draftsTbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
  liveTbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
  try {
    const audits = await pb.collection('audits').getFullList({ sort: '-created' });
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
    auditsSection.querySelectorAll('button[data-delete]').forEach(btn => {
      btn.addEventListener('click', async function() {
        if (confirm('Delete this audit?')) {
          await pb.collection('audits').delete(btn.dataset.delete);
          renderAudits();
        }
      });
    });
  } catch (err) {
    draftsTbody.innerHTML = '<tr><td colspan="5">Error loading audits.</td></tr>';
    liveTbody.innerHTML = '<tr><td colspan="5">Error loading audits.</td></tr>';
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

auditForm && auditForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  await saveAudit('live');
});
saveDraftBtn && saveDraftBtn.addEventListener('click', async function(e) {
  e.preventDefault();
  await saveAudit('draft');
});
async function saveAudit(status) {
  const name = auditForm.auditName.value.trim();
  const description = auditForm.auditDescription.value.trim();
  const auditDateTime = auditForm.auditDateTime.value;
  const lastDate = auditForm.lastDate.value;
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
    closeAuditModalFn();
    renderAudits();
  } catch (err) {
    alert('Error saving audit.');
  }
}

// Initial render for audits section
if (auditsSection) renderAudits();

// Tab switching
for (const btn of tabBtns) {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    tabPanels.forEach((panel) => panel.classList.remove("active"));
    if (btn.dataset.tab === "enquiries") {
      enquiriesTab.classList.add("active");
    } else {
      auditsTab.classList.add("active");
    }
  });
}

// Fetch and display enquiries
// (Inline comment: Fetching enquiries from PocketBase)
pb.collection("domain_forms")
  .getFullList({ filter: "type='enquiry'", sort: "-created" })
  //   .getList(1, 100, {
  //     sort: "-created",
  //     filter: "type='enquiry'",
  //   })
  .then((enquiries) => {
    const tbody = document.querySelector("#enquiries table tbody");
    if (!tbody) return;

    tbody.innerHTML = ""; // clear existing rows

    enquiries.forEach((record) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>${record.name || ""}</td>
                <td>${record.phone || ""}</td>
                <td>${record.email || ""}</td>
                <td>${record.meta?.company || ""}</td>
                <td>${record.meta?.nature || ""}</td>
                <td>${record.meta?.service || ""}</td>
                <td>${record.meta?.message || ""}</td>
            `;

      tbody.appendChild(row);
    });
  })
  .catch((err) => {
    // enquiriesTab.innerHTML = "<p>Error loading enquiries.</p>";
    console.error("Failed to load enquiries:", err);
  });

// Fetch and display audits
// (Inline comment: Fetching audits from PocketBase)
pb.collection("domain_forms")
  .getFullList({ filter: "type='audit'", sort: "-created" })
  .then((audits) => {
    const tbody = document.querySelector("#audits table tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    audits.forEach((record) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>${record.name || ""}</td>
                <td>${record.phone || ""}</td>
                <td>${record.email || ""}</td>
            `;

      tbody.appendChild(row);
    });
  })
  .catch((err) => {
    console.error("Failed to load audits enquiries:", err);
  });

// Show prospects for selected audit
function showProspectsForAudit(auditId) {
  // (Inline comment: Fetching prospects filtered by audit_id from PocketBase)
  pb.collection("prospects")
    .getFullList({
      filter: `audit_id = "${auditId}"`,
    })
    .then((prospects) => {
      prospectsList.innerHTML =
        `<h4>Registered Prospects</h4><ul>` +
        (prospects.length
          ? prospects
              .map((p) => `<li>${p.name} (${p.email}, ${p.phone})</li>`)
              .join("")
          : "<li>No prospects registered.</li>") +
        `</ul>`;
      prospectsModal.style.display = "flex";
    })
    .catch(() => {
      prospectsList.innerHTML = "<p>Error loading prospects.</p>";
      prospectsModal.style.display = "flex";
    });
}

closeProspectsModal.addEventListener("click", () => {
  prospectsModal.style.display = "none";
  prospectsList.innerHTML = "";
});
