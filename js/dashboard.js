// dashboard.js
// Handles tab switching, PocketBase data fetching, and audit prospects modal

// PocketBase import (CDN)
import PocketBase from 'https://cdn.jsdelivr.net/npm/pocketbase-sdk';
const pb = new PocketBase('http://127.0.0.1:8090');

const tabBtns = document.querySelectorAll('.tab-btn');
const enquiriesTab = document.getElementById('enquiries-tab');
const auditsTab = document.getElementById('audits-tab');
const tabPanels = document.querySelectorAll('.tab-panel');
const prospectsModal = document.getElementById('audit-prospects-modal');
const closeProspectsModal = document.getElementById('close-prospects-modal');
const prospectsList = document.getElementById('prospects-list');

// Tab switching
for (const btn of tabBtns) {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tabPanels.forEach(panel => panel.classList.remove('active'));
        if (btn.dataset.tab === 'enquiries') {
            enquiriesTab.classList.add('active');
        } else {
            auditsTab.classList.add('active');
        }
    });
}

// Fetch and display enquiries
// (Inline comment: Fetching enquiries from PocketBase)
pb.collection('enquiries').getFullList()
    .then(enquiries => {
        enquiriesTab.innerHTML = `<h3>Enquiries List</h3><ul>` +
            enquiries.map(e => `<li><strong>${e.name}</strong> (${e.email}, ${e.phone})<br>${e.business_type} | ${e.request_type}<br>${e.message}<br><small>${new Date(e.timestamp).toLocaleString()}</small></li>`).join('') +
            `</ul>`;
    })
    .catch(() => {
        enquiriesTab.innerHTML = '<p>Error loading enquiries.</p>';
    });

// Fetch and display audits
// (Inline comment: Fetching audits from PocketBase)
pb.collection('audits').getFullList()
    .then(audits => {
        auditsTab.innerHTML = `<h3>Upcoming Audits</h3><ul>` +
            audits.map(audit => `<li><button class="audit-btn" data-id="${audit.id}">${audit.title}</button><br>${audit.description}<br><small>${new Date(audit.date).toLocaleDateString()} | Last Reg: ${new Date(audit.last_registration_date).toLocaleDateString()}</small></li>`).join('') +
            `</ul>`;
        // Add click listeners for audit buttons
        document.querySelectorAll('.audit-btn').forEach(btn => {
            btn.addEventListener('click', () => showProspectsForAudit(btn.dataset.id));
        });
    })
    .catch(() => {
        auditsTab.innerHTML = '<p>Error loading audits.</p>';
    });

// Show prospects for selected audit
function showProspectsForAudit(auditId) {
    // (Inline comment: Fetching prospects filtered by audit_id from PocketBase)
    pb.collection('prospects').getFullList({
        filter: `audit_id = "${auditId}"`
    })
    .then(prospects => {
        prospectsList.innerHTML = `<h4>Registered Prospects</h4><ul>` +
            (prospects.length ? prospects.map(p => `<li>${p.name} (${p.email}, ${p.phone})</li>`).join('') : '<li>No prospects registered.</li>') +
            `</ul>`;
        prospectsModal.style.display = 'flex';
    })
    .catch(() => {
        prospectsList.innerHTML = '<p>Error loading prospects.</p>';
        prospectsModal.style.display = 'flex';
    });
}

closeProspectsModal.addEventListener('click', () => {
    prospectsModal.style.display = 'none';
    prospectsList.innerHTML = '';
}); 