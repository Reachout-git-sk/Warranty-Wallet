// ===== APP.JS — MAIN ROUTER =====

const App = (() => {

  // ---- SHOW SECTION ----
  function showSection(section) {
    // Hide all sections
    document.getElementById("wallet-section").classList.add("section-hidden");
    document.getElementById("support-section").classList.add("section-hidden");

    // Remove active from all tabs
    document.getElementById("tab-wallet").classList.remove("active");
    document.getElementById("tab-support").classList.remove("active");

    // Show selected section and mark tab active
    if (section === "wallet") {
      document.getElementById("wallet-section").classList.remove("section-hidden");
      document.getElementById("tab-wallet").classList.add("active");
    } else if (section === "support") {
      document.getElementById("support-section").classList.remove("section-hidden");
      document.getElementById("tab-support").classList.add("active");
    }

    // Save last visited tab
    localStorage.setItem("activeTab", section);
  }

  // ---- TOAST NOTIFICATION ----
  function showToast(message, type = "success") {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ---- INIT ----
  function init() {
    // Load last visited tab or default to wallet
    const lastTab = localStorage.getItem("activeTab") || "wallet";
    showSection(lastTab);

    // Init both modules
    WalletModule.init();
    SupportModule.init();
  }

  return { init, showSection, showToast };
})();

// Boot the app
document.addEventListener("DOMContentLoaded", App.init);