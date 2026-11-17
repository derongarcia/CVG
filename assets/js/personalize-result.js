(function () {
  "use strict";

  const ui = JobsUi;
  const root = document.getElementById("root");
  const backLink = document.getElementById("backLink");
  const id = ui.param("id");

  const ICON_OK =
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ICON_OUT =
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#e11d2b" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function listHtml(items) {
    return items
      .map(function (item) {
        const out = item.keep === false;
        return `<p class="diffItem${out ? " diffItem--out" : ""}">
                  ${out ? ICON_OUT : ICON_OK}<span>${ui.esc(item.name)}</span>
                </p>`;
      })
      .join("");
  }

  function render(data, tailored) {
    const previewHref = "personalize-preview.html?id=" + encodeURIComponent(id);
    const removed = data.skills.after.filter(function (s) { return !s.keep; }).length;

    const added = tailored.skills.filter(function (skill) {
      return !data.skills.before.some(function (b) {
        return String(b).toLowerCase() === String(skill).toLowerCase();
      });
    });

    const afterItems = tailored.skills.map(function (name) {
      return { name: name, keep: true };
    }).concat(
      data.skills.after.filter(function (s) { return !s.keep; })
    );

    root.innerHTML = `
      <div class="resultHead">
        <h1 class="resultHead__title">Your CV is ready!</h1>
        <p class="resultHead__sub">
          We've reorganised your existing information to better highlight your
          relevance for this position.
        </p>
      </div>

      <div class="diffGrid">
        <section class="card diffCard">
          <h2 class="diffCard__title">Before</h2>
          <h3 class="diffCard__section">Skills</h3>
          ${listHtml(data.skills.before.map(function (s) { return { name: s, keep: true }; }))}
        </section>

        <section class="card diffCard">
          <h2 class="diffCard__title diffCard__title--after">After</h2>
          <h3 class="diffCard__section diffCard__section--after">Skills</h3>
          ${listHtml(afterItems)}
        </section>
      </div>

      <div class="diffFoot">
        <a class="btn btn--outline btn--block" href="${ui.esc(previewHref)}">Preview CV</a>
        <button class="btn btn--primary btn--block" type="button" id="downloadBtn">
          Download PDF
        </button>
      </div>

      <p class="diffNote">
        Tanda ✕ berarti skill itu tidak ditampilkan di versi CV untuk posisi ini.
        ${removed} skill disembunyikan${added.length ? ", " + added.length + " skill ditambahkan" : ""}.
        CV aslimu tidak berubah.
      </p>`;

    // Download dari halaman ini perlu CV utuh, jadi user diarahkan ke preview
    document.getElementById("downloadBtn").addEventListener("click", function () {
      window.location.href = previewHref + "&print=1";
    });
  }

  function showError() {
    root.innerHTML = ui.messageHtml(
      "Belum ada saran yang dipilih",
      "Pilih dulu saran perbaikan di halaman Personalized CV.",
      "jobs.html",
      "Ke daftar job"
    );
  }

  (async function init() {
    try {
      if (!id) throw null;

      backLink.href = "personalize.html?id=" + encodeURIComponent(id);

      const data = await PersonalizeData.get(id);
      const choices = PersonalizeData.loadChoices(id);

      if (!choices) {
        window.location.replace("personalize.html?id=" + encodeURIComponent(id));
        return;
      }

      render(data, PersonalizeData.applyToCv(data, choices));
    } catch (error) {
      showError();
    } finally {
      root.removeAttribute("aria-busy");
    }
  })();
})();
