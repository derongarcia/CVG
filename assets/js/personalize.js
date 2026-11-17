(function () {
  "use strict";

  const ui = JobsUi;
  const root = document.getElementById("root");
  const id = ui.param("id");

  let data = null;

  function miniJobHtml(job) {
    return `
      <section class="card miniJob">
        ${ui.logoHtml(job.company)}
        <div>
          <p class="miniJob__title">${ui.esc(job.title)}</p>
          <p class="miniJob__company">${ui.esc(job.company.name)}</p>
        </div>
      </section>`;
  }

  function optionHtml(option) {
    return `
      <label class="sugOption">
        <input type="checkbox" value="${ui.esc(option.id)}"${option.checked ? " checked" : ""} />
        <span>${ui.esc(option.label)}</span>
      </label>`;
  }

  function shorten(text, max) {
    const value = String(text || "");
    if (!value) return "Belum ada professional summary di CV kamu.";
    return value.length > max ? value.slice(0, max).trim() + " ..." : value;
  }

  function render() {
    const summaryOptions = data.options.filter(function (o) { return o.group === "summary"; });
    const otherOptions = data.options.filter(function (o) { return o.group === "experience"; });

    root.innerHTML = `
      ${miniJobHtml(data.job)}

      <form class="card sugCard" id="sugForm">
        <h2 class="sugCard__title">Suggestion Improvements</h2>

        <fieldset class="sugGroup">
          <legend class="sugGroup__title">Professional Summary</legend>

          <p class="sugLabel">Current</p>
          <p class="sugText">${ui.esc(shorten(data.summary.current, 90))}</p>

          <p class="sugLabel">Suggestion</p>
          <p class="sugText sugText--new">${ui.esc(data.summary.suggested)}</p>

          ${summaryOptions.map(optionHtml).join("")}
        </fieldset>

        <fieldset class="sugGroup">
          <legend class="sugGroup__title">Experience</legend>
          ${otherOptions.map(optionHtml).join("")}
        </fieldset>

        <div class="sugFoot">
          <button class="btn btn--primary btn--block" type="submit">
            Apply Suggestions
          </button>
        </div>
      </form>`;

    document.getElementById("sugForm").addEventListener("submit", function (event) {
      event.preventDefault();

      const chosen = Array.prototype.slice
        .call(event.target.querySelectorAll("input[type=checkbox]:checked"))
        .map(function (input) { return input.value; });

      PersonalizeData.saveChoices(id, chosen);
      window.location.href = "personalize-result.html?id=" + encodeURIComponent(id);
    });
  }

  function showError(error) {
    const missing = !error || error.status === 404;
    root.innerHTML = `<div class="card">${ui.messageHtml(
      missing ? "Job belum dipilih" : "Gagal menyiapkan saran",
      missing
        ? "Buka rekomendasi pekerjaan, pilih satu job, lalu klik Analyze CV."
        : "Coba muat ulang halaman.",
      "jobs.html",
      "Ke daftar job"
    )}</div>`;
  }

  (async function init() {
    try {
      if (!id) throw null;
      data = await PersonalizeData.get(id);
      render();
    } catch (error) {
      showError(error);
    } finally {
      root.removeAttribute("aria-busy");
    }
  })();
})();
