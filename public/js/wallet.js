// ===== WALLET MODULE =====

const WalletModule = (() => {
  const API = "/api/purchases";
  let editingId = null;
  let allPurchases = [];

  function init() {
    loadStats();
    loadPurchases();
    bindEvents();
  }

  function bindEvents() {
    document
      .getElementById("btn-add-wallet")
      .addEventListener("click", () => openModal());
    document
      .getElementById("wallet-modal-close")
      .addEventListener("click", closeModal);
    document
      .getElementById("wallet-form")
      .addEventListener("submit", handleSubmit);
    document
      .getElementById("wallet-search-input")
      .addEventListener("input", handleFilter);
    document
      .getElementById("wallet-category-filter")
      .addEventListener("change", handleFilter);
    document
      .getElementById("wallet-modal-overlay")
      .addEventListener("click", (e) => {
        if (e.target.id === "wallet-modal-overlay") closeModal();
      });
  }

  async function loadStats() {
    try {
      const res = await fetch(`${API}/stats/summary`);
      const data = await res.json();
      document.getElementById("wallet-stat-total").textContent =
        "$" + Number(data.totalSpent || 0).toLocaleString("en-IN");
      document.getElementById("wallet-stat-count").textContent =
        data.count || 0;
      document.getElementById("wallet-stat-electronics").textContent =
        "$" + Number(data.byCategory?.Electronics || 0).toLocaleString("en-IN");
      document.getElementById("wallet-stat-home").textContent =
        "$" + Number(data.byCategory?.Home || 0).toLocaleString("en-IN");
    } catch (err) {
      console.error("Wallet stats error:", err);
    }
  }

  async function loadPurchases() {
    const tbody = document.getElementById("wallet-tbody");
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:#a0a0b0;">Loading...</td></tr>`;
    try {
      const res = await fetch(API);
      allPurchases = await res.json();
      renderTable(allPurchases);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:#e74c3c;">Failed to load purchases.</td></tr>`;
    }
  }

  function handleFilter() {
    const search = document
      .getElementById("wallet-search-input")
      .value.toLowerCase();
    const category = document.getElementById("wallet-category-filter").value;
    const filtered = allPurchases.filter((p) => {
      const matchSearch =
        p.itemName.toLowerCase().includes(search) ||
        p.storeName.toLowerCase().includes(search);
      const matchCategory = category === "All" || p.category === category;
      return matchSearch && matchCategory;
    });
    renderTable(filtered);
  }

  function renderTable(purchases) {
    const tbody = document.getElementById("wallet-tbody");
    tbody.innerHTML = "";

    if (!purchases.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="wallet-empty">
              <div class="empty-icon">🧾</div>
              <p>No purchases found. Add your first receipt!</p>
            </div>
          </td>
        </tr>`;
      return;
    }

    purchases.forEach((p) => {
      const row = document.createElement("tr");
      const date = new Date(p.purchaseDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      row.innerHTML = `
        <td><strong>${escapeHtml(p.itemName)}</strong></td>
        <td>${escapeHtml(p.storeName)}</td>
        <td class="price-text">$${Number(p.price).toLocaleString("en-IN")}</td>
        <td>${date}</td>
        <td><span class="category-badge ${p.category.toLowerCase()}">${escapeHtml(p.category)}</span></td>
        <td>
          ${
            p.receiptFile
              ? `<a href="${p.receiptFile}" target="_blank">
               <img src="${p.receiptFile}" class="receipt-thumb" onerror="this.outerHTML='<span class=\\'no-receipt\\'>📄 View</span>'" />
               </a>`
              : `<span class="no-receipt">No receipt</span>`
          }
        </td>
        <td>
          <button class="tbl-btn-edit" onclick="WalletModule.openEditModal('${p._id}')">✏️ Edit</button>
          <button class="tbl-btn-delete" onclick="WalletModule.deletePurchase('${p._id}')">🗑️</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  function openModal() {
    editingId = null;
    document.getElementById("wallet-modal-title").textContent = "Add Purchase";
    document.getElementById("wallet-form").reset();
    document.getElementById("w-purchaseDate").max = new Date()
      .toISOString()
      .split("T")[0];
    document.getElementById("wallet-modal-overlay").classList.add("active");
  }

  async function openEditModal(id) {
    try {
      const res = await fetch(`${API}/${id}`);
      const p = await res.json();
      editingId = id;

      document.getElementById("wallet-modal-title").textContent =
        "Edit Purchase";
      document.getElementById("w-itemName").value = p.itemName;
      document.getElementById("w-storeName").value = p.storeName;
      document.getElementById("w-price").value = p.price;
      document.getElementById("w-purchaseDate").value = new Date(p.purchaseDate)
        .toISOString()
        .split("T")[0];
      document.getElementById("w-purchaseDate").max = new Date()
        .toISOString()
        .split("T")[0];
      document.getElementById("w-category").value = p.category;
      document.getElementById("w-notes").value = p.notes || "";

      document.getElementById("wallet-modal-overlay").classList.add("active");
    } catch (err) {
      alert("Failed to load purchase for editing.");
    }
  }

  function closeModal() {
    document.getElementById("wallet-modal-overlay").classList.remove("active");
    editingId = null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const itemName = document.getElementById("w-itemName").value.trim();
    const storeName = document.getElementById("w-storeName").value.trim();
    const price = document.getElementById("w-price").value;
    const purchaseDate = document.getElementById("w-purchaseDate").value;
    const category = document.getElementById("w-category").value;
    const notes = document.getElementById("w-notes").value.trim();
    const receiptFile = document.getElementById("w-receipt").files[0];

    if (!itemName || !storeName || !price || !purchaseDate || !category) {
      alert("Please fill all required fields.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (purchaseDate > today) {
      alert("Purchase date cannot be in the future.");
      return;
    }

    const btn = document.getElementById("wallet-submit-btn");
    btn.textContent = "Saving...";
    btn.disabled = true;

    try {
      let res;
      const url = editingId ? `${API}/${editingId}` : API;
      const method = editingId ? "PUT" : "POST";

      if (receiptFile) {
        const formData = new FormData();
        formData.append("itemName", itemName);
        formData.append("storeName", storeName);
        formData.append("price", price);
        formData.append("purchaseDate", purchaseDate);
        formData.append("category", category);
        formData.append("notes", notes);
        formData.append("receipt", receiptFile);
        res = await fetch(url, { method, body: formData });
      } else {
        res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemName,
            storeName,
            price,
            purchaseDate,
            category,
            notes,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      closeModal();
      loadPurchases();
      loadStats();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      btn.textContent = "Save Purchase";
      btn.disabled = false;
    }
  }

  async function deletePurchase(id) {
    if (!confirm("Delete this purchase? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadPurchases();
      loadStats();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  return { init, openEditModal, deletePurchase };
})();
