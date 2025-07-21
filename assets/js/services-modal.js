import PocketBase from "https://esm.sh/pocketbase";

const pb = new PocketBase("https://paperfree.bigbeetle.net/");

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("registrationModal");
  const closeModalBtn = document.getElementById("closeModal");
  const registerBtns = document.querySelectorAll(".register-btn[data-service]");
  const modalServiceTitle = document.getElementById("modalServiceTitle");
  const modalServiceName = document.getElementById("modalServiceName");
  const registrationForm = document.getElementById("registrationForm");
  const confirmationMessage = document.getElementById("confirmationMessage");
  const modalDetails = document.getElementById("modalDetails");

  // Open modal
  registerBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const service = btn.getAttribute("data-service");
      const date = btn.getAttribute("data-date");
      const time = btn.getAttribute("data-time");
      let lastdate = btn.getAttribute("data-lastdate");
      // Remove time from last registration date if present
      if (lastdate) {
        lastdate = lastdate.split(",")[0];
      }
      modalServiceTitle.textContent = "Register for " + service;
      modalServiceName.value = service;
      registrationForm.style.display = "";
      confirmationMessage.style.display = "none";
      // Show date/time/lastdate below the form
      if (date && time && lastdate) {
        modalDetails.style.display = "";
        modalDetails.innerHTML =
          '<div style="margin-top:1.5rem">' +
          "<strong>Date:</strong> " +
          date +
          "<br>" +
          "<strong>Time:</strong> " +
          time +
          "<br>" +
          "<strong>Last Registration Date:</strong> " +
          lastdate +
          "</div>";
      } else {
        modalDetails.style.display = "none";
        modalDetails.innerHTML = "";
      }
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        document.getElementById("fullName").focus();
      }, 100);
    });
  });

  // Close modal
  function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
  closeModalBtn.addEventListener("click", closeModal);
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  // Form submission
  registrationForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    // Simple validation
    const name = registrationForm.fullName.value.trim();
    const email = registrationForm.email.value.trim();
    const phone = registrationForm.phone.value.trim();
    if (!name || !email || !phone) {
      alert("Please fill in all fields.");
      return;
    }
    registrationForm.style.display = "none";
    confirmationMessage.style.display = "block";
    const data = {
      name,
      email,
      phone,
      type: "audit",
      meta: {},
    };
    try {
      const record = await pb.collection("domain_forms").create(data);

      setTimeout(closeModal, 2000);
    } catch (error) {
      alert("Audit Enquiry error:", error);
      setTimeout(closeModal, 2000);
    }
  });
});
