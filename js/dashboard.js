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
  .getFullList({ filter: "type='enquiry'" })
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
  .getFullList({ filter: "type='audit'" })
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
