(function () {
  "use strict";

  const ui = JobsUi;
  const form = document.getElementById("filters");
  const listEl = document.getElementById("jobList");

  let timer = null;
  let lastRequest = 0;

  function cardHtml(job) {
    const tone = ui.scoreTone(job.matchScore);
    const tags = (job.skills || [])
      .map(function (s) { return `<li class="tag">${ui.esc(s)}</li>`; })
      .join("");
    const href = "job-detail.html?id=" + encodeURIComponent(job.id);

    return `
      <li class="card jobCard">
        ${ui.logoHtml(job.company)}
        <div class="jobCard__info">
          <h2 class="jobCard__title">${ui.esc(job.title)}</h2>
          <p class="jobCard__company">${ui.esc(job.company.name)}</p>
          <p class="jobCard__place">${ui.esc(ui.placeText(job))}</p>
          <ul class="tagList">${tags}</ul>
        </div>
        <p class="jobCard__salary">${ui.esc(ui.formatSalary(job.salary))}</p>
        <div class="jobCard__side">
          <span class="matchPill matchPill--${tone.key}">${ui.esc(job.matchScore)}% Match</span>
          <a class="btn btn--primary btn--sm" href="${ui.esc(href)}"
            aria-label="View job ${ui.esc(job.title)} at ${ui.esc(job.company.name)}">View Job</a>
        </div>
      </li>`;
  }

  function currentFilters() {
    return {
      location: form.elements.location.value,
      experience: form.elements.experience.value,
      jobType: form.elements.jobType.value,
      q: form.elements.q.value.trim(),
    };
  }

  async function load() {
    const requestId = ++lastRequest;
    listEl.setAttribute("aria-busy", "true");

    try {
      const jobs = await JobsData.list(currentFilters());
      if (requestId !== lastRequest) return;

      listEl.innerHTML = jobs.length
        ? jobs.map(cardHtml).join("")
        : `<li class="card">${ui.messageHtml(
            "Tidak ada job yang cocok",
            "Coba ubah filter atau kata kunci pencarian."
          )}</li>`;
    } catch (error) {
      if (requestId !== lastRequest) return;
      listEl.innerHTML = `<li class="card">${ui.messageHtml(
        "Gagal memuat job",
        "Periksa koneksi lalu muat ulang halaman."
      )}</li>`;
    } finally {
      if (requestId === lastRequest) listEl.removeAttribute("aria-busy");
    }
  }

  function fillSelect(select, values) {
    select.insertAdjacentHTML(
      "beforeend",
      (values || [])
        .map(function (v) {
          return `<option value="${ui.esc(v)}">${ui.esc(v)}</option>`;
        })
        .join("")
    );
  }

  form.addEventListener("input", function (event) {
    const el = event.target;
    if (el.tagName === "SELECT") el.classList.toggle("is-set", el.value !== "");

    clearTimeout(timer);
    timer = setTimeout(load, el.name === "q" ? 250 : 0);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  (async function init() {
    try {
      const options = await JobsData.filters();
      fillSelect(form.elements.location, options.locations);
      fillSelect(form.elements.experience, options.experienceLevels);
      fillSelect(form.elements.jobType, options.employmentTypes);
    } catch (error) {
    }
    load();
  })();
})();
