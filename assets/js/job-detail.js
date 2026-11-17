(function () {
  "use strict";

  const ui = JobsUi;
  const root = document.getElementById("jobDetail");
  const id = ui.param("id");

  function paragraphs(list) {
    return (list || [])
      .map(function (text) { return `<p class="jobDetail__text">${ui.esc(text)}</p>`; })
      .join("");
  }

  function render(job) {
    document.title = job.title + " - " + job.company.name + " | CVG";

    const tags = [job.workMode, job.employmentType]
      .filter(Boolean)
      .map(function (t) { return `<li class="tag tag--outline">${ui.esc(t)}</li>`; })
      .join("");

    const requirements = (job.requirements || [])
      .map(function (r) { return `<li>${ui.esc(r)}</li>`; })
      .join("");

    const matchHref = "job-match.html?id=" + encodeURIComponent(job.id);

    root.innerHTML = `
      <header class="jobDetail__head">
        ${ui.logoHtml(job.company, "lg")}
        <div>
          <h2 class="jobDetail__title">${ui.esc(job.title)}</h2>
          <p class="jobDetail__company">${ui.esc(job.company.name)}</p>
          <p class="jobDetail__place">${ui.esc(ui.placeText(job))}</p>
        </div>
      </header>

      <ul class="tagList jobDetail__tags">${tags}</ul>

      <section class="jobDetail__section">
        <h3 class="jobDetail__h">About the job</h3>
        ${paragraphs(job.description)}
      </section>

      ${
        requirements
          ? `<section class="jobDetail__section">
               <h3 class="jobDetail__h">Key Requirements</h3>
               <ul class="bullets">${requirements}</ul>
             </section>`
          : ""
      }

      <section class="jobDetail__section">
        <h3 class="jobDetail__h">About the company</h3>
        ${paragraphs(job.company.about)}
      </section>

      <div class="jobDetail__foot">
        <a class="btn btn--primary" href="${ui.esc(matchHref)}">Analyze CV</a>
      </div>`;
  }

  function showError(error) {
    const missing = !error || error.status === 404;
    root.innerHTML = ui.messageHtml(
      missing ? "Job tidak ditemukan" : "Gagal memuat job",
      missing ? "Job ini mungkin sudah ditutup atau link-nya salah." : "Coba muat ulang halaman.",
      "jobs.html",
      "Kembali ke daftar job"
    );
  }

  (async function init() {
    try {
      if (!id) throw null;
      render(await JobsData.get(id));
    } catch (error) {
      showError(error);
    } finally {
      root.removeAttribute("aria-busy");
    }
  })();
})();
