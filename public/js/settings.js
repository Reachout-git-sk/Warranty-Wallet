// ===== SETTINGS MODULE =====

const SettingsModule = (() => {

  function init() {
    loadCurrentEmail();
    bindEvents();
  }

  function bindEvents() {
    document
      .getElementById("settings-btn")
      .addEventListener("click", openModal);

    document
      .getElementById("settings-modal-close")
      .addEventListener("click", closeModal);

    document
      .getElementById("settings-modal-overlay")
      .addEventListener("click", (e) => {
        if (e.target.id === "settings-modal-overlay") closeModal();
      });

    document
      .getElementById("settings-form")
      .addEventListener("submit", saveEmail);

    document
      .getElementById("btn-test-email")
      .addEventListener("click", sendTestEmail);
  }

  async function loadCurrentEmail() {
    try {
      const res = await fetch("/api/email");
      const data = await res.json();
      const display = document.getElementById("current-email-display");
      if (data.email) {
        display.innerHTML = `Reminders sending to: <span>${data.email}</span>`;
        document.getElementById("settings-email-input").value = data.email;
      } else {
        display.innerHTML = `No email set yet.`;
      }
    } catch (err) {
      console.error("Failed to load email settings:", err);
    }
  }

  function openModal() {
    loadCurrentEmail();
    document.getElementById("settings-modal-overlay").classList.add("active");
    clearStatus();
  }

  function closeModal() {
    document.getElementById("settings-modal-overlay").classList.remove("active");
    clearStatus();
  }

  function clearStatus() {
    const status = document.getElementById("email-status");
    status.className = "email-status";
    status.textContent = "";
  }

  function showStatus(message, type) {
    const status = document.getElementById("email-status");
    status.className = `email-status ${type}`;
    status.textContent = message;
  }

  async function saveEmail(e) {
    e.preventDefault();
    const email = document.getElementById("settings-email-input").value.trim();
    if (!email) return showStatus("Please enter an email address.", "error");

    const btn = document.getElementById("btn-save-email");
    btn.textContent = "Saving...";
    btn.disabled = true;

    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showStatus(`Email saved! Reminders will be sent to ${email}`, "success");
      loadCurrentEmail();
    } catch (err) {
      showStatus("Failed to save: " + err.message, "error");
    } finally {
      btn.textContent = "Save Email";
      btn.disabled = false;
    }
  }

  async function sendTestEmail() {
    const btn = document.getElementById("btn-test-email");
    btn.textContent = "Sending...";
    btn.disabled = true;

    try {
      const res = await fetch("/api/email/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showStatus("Test email sent! Check your inbox.", "success");
    } catch (err) {
      showStatus("Failed to send: " + err.message, "error");
    } finally {
      btn.textContent = "Send Test Email";
      btn.disabled = false;
    }
  }

  return { init };
})();