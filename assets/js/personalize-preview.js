(function () {
  "use strict";

  const ui = JobsUi;
  const root = document.getElementById("root");
  const backLink = document.getElementById("backLink");
  const id = ui.param("id");

  const RADIUS = 26;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  function ringHtml(value, color) {
    const full = CIRCUMFERENCE.toFixed(2);
    const target = (CIRCUMFERENCE * (1 - value / 100)).toFixed(2);

    return `
      <div class="ring ring--sm">
        <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
          <circle cx="32" cy="32" r="${RADIUS}" fill="none" stroke="#e5e7eb" stroke-width="7" />
          <circle class="ring__value" cx="32" cy="32" r="${RADIUS}" fill="none"
            stroke="${color}" stroke-width="7" stroke-linecap="round"
            transform="rotate(-90 32 32)"
            stroke-dasharray="${full}" stroke-dashoffset="${full}"
            data-offset="${target}" />
        </svg>
        <p class="ring__num">${value}%</p>
      </div>`;
  }

  function insightHtml(label, value, color) {
    return `
      <div class="insight">
        ${ringHtml(value, color)}
        <div>
          <p class="insight__label">${ui.esc(label)}</p>
          <p class="insight__value">${value}%</p>
        </div>
      </div>`;
  }

  function animate() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.querySelectorAll("[data-offset]").forEach(function (el) {
          el.style.strokeDashoffset = el.dataset.offset;
        });
      });
    });
  }

  function render(tailored, insights) {
    root.innerHTML = `
      <div class="finalGrid">
        <section class="previewPane">
          <div class="previewPane__paper">${CvRender.render(tailored, "modern")}</div>
        </section>

        <aside class="card insights">
          <h2 class="insights__title">CV Insights</h2>
          ${insightHtml("Job Match", insights.jobMatch, "#16a34a")}
          ${insightHtml("ATS Compatibility", insights.atsCompatibility, "#1f2fa0")}
          ${insightHtml("Completeness", insights.completeness, "#1f2fa0")}

          <div class="insights__actions">
            <button class="btn btn--primary btn--block" type="button" id="downloadBtn">
              Download PDF
            </button>
            <a class="btn btn--outline btn--block" href="jobs.html">
              Apply to Another Job
            </a>
          </div>
        </aside>
      </div>`;

    document.getElementById("downloadBtn").addEventListener("click", function () {
      window.print();
    });

    animate();

    // Dibuka dari tombol Download PDF di halaman sebelumnya
    if (ui.param("print") === "1") {
      setTimeout(function () { window.print(); }, 700);
    }
  }

  function showError() {
    root.innerHTML = `<div class="card">${ui.messageHtml(
      "CV personalisasi belum dibuat",
      "Pilih saran perbaikan dulu di halaman Personalized CV.",
      "jobs.html",
      "Ke daftar job"
    )}</div>`;
  }

  (async function init() {
    try {
      if (!id) throw null;

      backLink.href = "personalize-result.html?id=" + encodeURIComponent(id);

      const data = await PersonalizeData.get(id);
      const choices = PersonalizeData.loadChoices(id);

      if (!choices) {
        window.location.replace("personalize.html?id=" + encodeURIComponent(id));
        return;
      }

      render(PersonalizeData.applyToCv(data, choices), data.insights);
    } catch (error) {
      showError();
    } finally {
      root.removeAttribute("aria-busy");
    }
  })();
})();
