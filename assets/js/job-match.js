(function () {
  "use strict";

  const ui = JobsUi;
  const root = document.getElementById("matchRoot");
  const backLink = document.getElementById("backLink");
  const id = ui.param("id");

  const RADIUS = 52;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const RING_COLORS = {
    great: ["#15803d", "#4ade80"],
    good: ["#b45309", "#fbbf24"],
    fair: ["#b91c1c", "#f87171"],
  };

  const BREAKDOWN = [
    ["skills", "Skills"],
    ["experience", "Experience"],
    ["education", "Education"],
  ];

  const ICON_CHECK =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#16a34a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ICON_CIRCLE =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#e11d2b" stroke-width="2.2" aria-hidden="true"><circle cx="12" cy="12" r="7.5"/></svg>';
  const ICON_SHIELD =
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z" fill="#e11d2b"/><path d="M12 7v6M12 16v.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';

  function clamp(n) {
    return Math.max(0, Math.min(100, Number(n) || 0));
  }

  function ringHtml(score, tone) {
    const colors = RING_COLORS[tone.key];
    const full = CIRCUMFERENCE.toFixed(2);
    const target = (CIRCUMFERENCE * (1 - score / 100)).toFixed(2);

    return `
      <div class="ring">
        <svg viewBox="0 0 120 120" width="150" height="150" aria-hidden="true">
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="${colors[0]}" />
              <stop offset="1" stop-color="${colors[1]}" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="${RADIUS}" fill="none" stroke="#e5e7eb" stroke-width="10" />
          <circle class="ring__value" cx="60" cy="60" r="${RADIUS}" fill="none"
            stroke="url(#ringGrad)" stroke-width="10" stroke-linecap="round"
            transform="rotate(-90 60 60)"
            stroke-dasharray="${full}" stroke-dashoffset="${full}"
            data-offset="${target}" />
        </svg>
        <p class="ring__num">${score}%</p>
      </div>`;
  }

  function metersHtml(breakdown) {
    const data = breakdown || {};
    return BREAKDOWN.map(function (entry) {
      const value = clamp(data[entry[0]]);
      return `
        <div class="meter">
          <div class="meter__row">
            <span>${entry[1]}</span>
            <span class="meter__pct">${value}%</span>
          </div>
          <div class="meter__track" aria-hidden="true">
            <div class="meter__bar" data-width="${value}"></div>
          </div>
        </div>`;
    }).join("");
  }

  function skillListHtml(skills, icon, emptyText) {
    if (!skills || skills.length === 0) {
      return `<p class="skillCard__empty">${ui.esc(emptyText)}</p>`;
    }
    return `<ul>${skills
      .map(function (s) { return `<li class="skillItem">${icon}<span>${ui.esc(s)}</span></li>`; })
      .join("")}</ul>`;
  }

  function animate() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.querySelectorAll("[data-offset]").forEach(function (el) {
          el.style.strokeDashoffset = el.dataset.offset;
        });
        root.querySelectorAll("[data-width]").forEach(function (el) {
          el.style.width = el.dataset.width + "%";
        });
      });
    });
  }

  function render(result) {
    const job = result.job;
    const score = clamp(result.overall);
    const tone = ui.scoreTone(score);

    backLink.href = "job-detail.html?id=" + encodeURIComponent(job.id);
    document.title = "CV Match - " + job.title + " | CVG";

    root.innerHTML = `
      <section class="card jobSummary">
        ${ui.logoHtml(job.company)}
        <div>
          <p class="jobCard__title">${ui.esc(job.title)}</p>
          <p class="jobCard__company">${ui.esc(job.company.name)}</p>
          <p class="jobCard__place">${ui.esc(ui.placeText(job))}</p>
        </div>
      </section>

      <div class="matchGrid">
        <section class="card scoreCard" aria-label="Skor kecocokan ${score} persen">
          ${ringHtml(score, tone)}
          <p class="scoreCard__label tone--${tone.key}">${tone.label}</p>
        </section>

        <section class="card breakdown">
          <h2 class="breakdown__title">Match Breakdown</h2>
          ${metersHtml(result.breakdown)}
        </section>
      </div>

      <div class="skillGrid">
        <section class="card skillCard">
          <h2 class="skillCard__title skillCard__title--ok">Matched Skills</h2>
          ${skillListHtml(result.matchedSkills, ICON_CHECK, "Belum ada skill yang cocok.")}
        </section>

        <section class="card skillCard">
          <h2 class="skillCard__title skillCard__title--miss">${ICON_SHIELD} Missing / Recommended</h2>
          ${skillListHtml(result.missingSkills, ICON_CIRCLE, "Semua skill yang dibutuhkan sudah kamu punya.")}
        </section>
      </div>

      <a class="btn btn--primary btn--block matchCta"
        href="personalize.html?id=${encodeURIComponent(job.id)}">
        Show Improve Suggestion →
      </a>`;

    animate();
  }

  function showError(error) {
    const missing = !error || error.status === 404;
    root.innerHTML = `<div class="card">${ui.messageHtml(
      missing ? "Job tidak ditemukan" : "Analisis gagal",
      missing ? "Pilih job dari daftar rekomendasi terlebih dulu." : "Coba muat ulang halaman.",
      "jobs.html",
      "Kembali ke daftar job"
    )}</div>`;
  }

  (async function init() {
    try {
      if (!id) throw null;
      render(await JobsData.analyze(id));
    } catch (error) {
      showError(error);
    } finally {
      root.removeAttribute("aria-busy");
    }
  })();
})();
