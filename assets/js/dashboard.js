(function () {
  "use strict";

  /* ============================================================
     DATA DUMMY
     Bentuknya sengaja dibuat seperti JSON yang nanti dikirim
     backend, supaya di langkah 4 cukup diganti hasil fetch().
     ============================================================ */
  const dashboardData = {
    user: { name: "Alexandra" },
    stats: {
      jobMatches: { value: 24, change: 6 },
      companyRecommendations: { value: 10, change: 3 },
    },
    cv: {
      title: "UI/UX Designer CV",
      lastEdited: "Today, 10.43 AM",
    },
  };

  function greetingFor(hour) {
    if (hour < 11) return "Good morning";
    if (hour < 15) return "Good afternoon";
    if (hour < 19) return "Good evening";
    return "Good night";
  }

  function renderDelta(element, change) {
    if (typeof change !== "number") {
      element.textContent = "";
      return;
    }
    const up = change >= 0;
    element.textContent = (up ? "↑ " : "↓ ") + Math.abs(change) + "%";
    element.classList.toggle("stat__delta--down", !up);
  }

  function render(data) {
    document.getElementById("greeting").textContent =
      greetingFor(new Date().getHours()) + ", " + data.user.name;

    document.getElementById("statJobValue").textContent =
      data.stats.jobMatches.value;
    renderDelta(
      document.getElementById("statJobDelta"),
      data.stats.jobMatches.change
    );

    document.getElementById("statCompanyValue").textContent =
      data.stats.companyRecommendations.value;
    renderDelta(
      document.getElementById("statCompanyDelta"),
      data.stats.companyRecommendations.change
    );

    const cvTitle = document.getElementById("cvTitle");
    const cvMeta = document.getElementById("cvMeta");

    if (data.cv) {
      cvTitle.textContent = data.cv.title;
      cvMeta.textContent = "Last edited " + data.cv.lastEdited;
    } else {
      cvTitle.textContent = "Belum ada CV";
      cvMeta.textContent = "Mulai buat CV pertamamu";
    }
  }

  const modal = document.getElementById("logoutModal");
  const trigger = document.getElementById("logoutTrigger");
  const confirmBtn = document.getElementById("logoutConfirm");
  let lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    confirmBtn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  trigger.addEventListener("click", openModal);


  modal.querySelectorAll("[data-close-modal]").forEach(function (element) {
    element.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

  confirmBtn.addEventListener("click", function () {
    window.location.href = "login.html";
  });


  render(dashboardData);
})();
