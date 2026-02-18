// ===== SUPPORT LIBRARY MODULE =====

const SupportModule = (() => {
  const API = "/api/support";
  let editingId = null;

  // ---- INIT ----
  function init() {
    loadStats();
    loadSupportDocs();
    bindEvents();
  }

  // ---- BIND EVENTS ----
  function bindEvents() {
    document
      .getElementById("btn-add-support")
      .addEventListener("click", () => openModal());

    document
      .getElementById("support-modal-close")
      .addEventListener("click", closeModal);

    document
      .getElementById("support-form")
      .addEventListener("submit", handleSubmit);

    document
      .getElementById("support-search-btn")
      .addEventListener("click", handleSearch);

    document
      .getElementById("support-search-input")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSearch();
      });

    document
      .getElementById("support-search-input")
      .addEventListener("input", (e) => {
        if (e.target.value === "") loadSupportDocs();
      });

    // Close modal on overlay click
    document
      .getElementById("support-modal-overlay")
      .addEventListener("click", (e) => {
        if (e.target.id === "support-modal-overlay") closeModal();
      });
  }

  // ---- LOAD STATS ----
  async function loadStats() {
    try {
      const res = await fetch(`${API}/stats/summary`);
      const data = await res.json();
      document.getElementById("stat-total").textContent = data.total || 0;
      document.getElementById("stat-active").textContent = data.active || 0;
      document.getElementById("stat-expired").textContent = data.expired || 0;
      document.getElementById("stat-soon").textContent = data.expiringSoon || 0;
    } catch (err) {
      console.error("Stats error:", err);
    }
  }

  // ---- LOAD ALL DOCS ----
  async function loadSupportDocs() {
    const grid = document.getElementById("support-grid");
    grid.innerHTML = `<div class="loading-spinner">Loading your support library...</div>`;
    try {
      const res = await fetch(API);
      const docs = await res.json();
      renderCards(docs);
    } catch (err) {
      grid.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load. Check your connection.</p></div>`;
    }
  }

  // ---- SEARCH ----
  async function handleSearch() {
    const query = document.getElementById("support-search-input").value.trim();
    if (!query) return loadSupportDocs();
    const grid = document.getElementById("support-grid");
    grid.innerHTML = `<div class="loading-spinner">Searching...</div>`;
    try {
      const res = await fetch(`${API}/search/${encodeURIComponent(query)}`);
      const docs = await res.json();
      renderCards(docs);
    } catch (err) {
      console.error("Search error:", err);
    }
  }

  // ---- RENDER CARDS ----
  function renderCards(docs) {
    const grid = document.getElementById("support-grid");
    grid.innerHTML = "";

    if (!docs.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <p>No support documents found. Add your first one!</p>
        </div>`;
      return;
    }

    docs.forEach((doc) => {
      const card = createCard(doc);
      grid.appendChild(card);
    });
  }

  // ---- CREATE SINGLE CARD ----
  function createCard(doc) {
    const today = new Date();
    const expiry = new Date(doc.warrantyExpiry);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    let countdownClass = "active";
    let statusClass = "active";
    let statusText = "Active";

    if (daysLeft <= 0) {
      countdownClass = "expired";
      statusClass = "expired";
      statusText = "Expired";
    } else if (daysLeft <= 30) {
      countdownClass = "soon";
      statusClass = "expiring-soon";
      statusText = "Expiring Soon";
    }

    const card = document.createElement("div");
    card.className = "support-card";
    card.dataset.id = doc._id;

    card.innerHTML = `
      <div class="card-top">
        <div>
          <p class="product-name">${escapeHtml(doc.productName)}</p>
          <p class="brand-name">🏷️ ${escapeHtml(doc.brand)}</p>
        </div>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>

      <div class="warranty-countdown ${countdownClass}">
        <span class="days-number">${daysLeft <= 0 ? "0" : daysLeft}</span>
        <span class="days-label">${daysLeft <= 0 ? "Warranty Expired" : "Days Remaining"}</span>
      </div>

      <div class="contact-info">
        ${doc.supportPhone ? `<div class="contact-row"><span class="icon">📞</span> ${escapeHtml(doc.supportPhone)}</div>` : ""}
        ${doc.supportEmail ? `<div class="contact-row"><span class="icon">✉️</span> ${escapeHtml(doc.supportEmail)}</div>` : ""}
        ${doc.supportWebsite ? `<div class="contact-row"><span class="icon">🌐</span> <a href="${escapeHtml(doc.supportWebsite)}" target="_blank">Visit Support Page</a></div>` : ""}
        ${doc.notes ? `<div class="contact-row"><span class="icon">📝</span> ${escapeHtml(doc.notes)}</div>` : ""}
      </div>

      <div class="card-actions">
        ${doc.manualFile
          ? `<a href="/uploads/${doc.manualFile}" target="_blank" class="btn-view-manual">📄 View Manual</a>`
          : `<span class="btn-view-manual" style="opacity:0.4;cursor:default;">No Manual</span>`
        }
        <button class="btn-edit-support" onclick="SupportModule.openEditModal('${doc._id}')">✏️ Edit</button>
        <button class="btn-delete-support" onclick="SupportModule.deleteDoc('${doc._id}')">🗑️</button>
      </div>
    `;

    return card;
  }

  // ---- OPEN MODAL (ADD) ----
  function openModal() {
    editingId = null;
    document.getElementById("support-modal-title").textContent = "Add Support Document";
    document.getElementById("support-form").reset();
    document.getElementById("support-modal-overlay").classList.add("active");
  }

  // ---- OPEN MODAL (EDIT) ----
  async function openEditModal(id) {
    try {
      const res = await fetch(`${API}/${id}`);
      const doc = await res.json();
      editingId = id;

      document.getElementById("support-modal-title").textContent = "Edit Support Document";
      document.getElementById("s-productName").value = doc.productName;
      document.getElementById("s-brand").value = doc.brand;
      document.getElementById("s-supportPhone").value = doc.supportPhone || "";
      document.getElementById("s-supportEmail").value = doc.supportEmail || "";
      document.getElementById("s-supportWebsite").value = doc.supportWebsite || "";
      document.getElementById("s-warrantyExpiry").value = new Date(doc.warrantyExpiry)
        .toISOString()
        .split("T")[0];
      document.getElementById("s-notes").value = doc.notes || "";

      document.getElementById("support-modal-overlay").classList.add("active");
    } catch (err) {
      alert("Failed to load document for editing.");
    }
  }

  // ---- CLOSE MODAL ----
  function closeModal() {
    document.getElementById("support-modal-overlay").classList.remove("active");
    editingId = null;
  }

  // ---- HANDLE FORM SUBMIT ----
  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("productName", document.getElementById("s-productName").value.trim());
    formData.append("brand", document.getElementById("s-brand").value.trim());
    formData.append("supportPhone", document.getElementById("s-supportPhone").value.trim());
    formData.append("supportEmail", document.getElementById("s-supportEmail").value.trim());
    formData.append("supportWebsite", document.getElementById("s-supportWebsite").value.trim());
    formData.append("warrantyExpiry", document.getElementById("s-warrantyExpiry").value);
    formData.append("notes", document.getElementById("s-notes").value.trim());

    const manualFile = document.getElementById("s-manual").files[0];
    if (manualFile) formData.append("manual", manualFile);

    const btn = document.getElementById("support-submit-btn");
    btn.textContent = "Saving...";
    btn.disabled = true;

    try {
      const url = editingId ? `${API}/${editingId}` : API;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      closeModal();
      loadSupportDocs();
      loadStats();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      btn.textContent = "Save Document";
      btn.disabled = false;
    }
  }

  // ---- DELETE ----
  async function deleteDoc(id) {
    if (!confirm("Delete this support document? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadSupportDocs();
      loadStats();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  }

  // ---- HELPER ----
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  return { init, openEditModal, deleteDoc };
})();
