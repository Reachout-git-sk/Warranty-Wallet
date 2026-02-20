// ===== APP.JS — MAIN ROUTER =====

const App = (() => {

  function showSection(section) {
    const walletSection = document.getElementById("wallet-section");
    const supportSection = document.getElementById("support-section");
    const tabWallet = document.getElementById("tab-wallet");
    const tabSupport = document.getElementById("tab-support");

    // Hide both first
    walletSection.classList.add("section-hidden");
    supportSection.classList.add("section-hidden");
    tabWallet.classList.remove("active");
    tabSupport.classList.remove("active");

    // Show selected
    if (section === "wallet") {
      walletSection.classList.remove("section-hidden");
      tabWallet.classList.add("active");
    } else {
      supportSection.classList.remove("section-hidden");
      tabSupport.classList.add("active");
    }

    localStorage.setItem("activeTab", section);
  }

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

  function init() {
  const lastTab = localStorage.getItem("activeTab") || "wallet";
  showSection(lastTab);
  WalletModule.init();
  SupportModule.init();
  SettingsModule.init();
}

  return { init, showSection, showToast };
})();

document.addEventListener("DOMContentLoaded", App.init);