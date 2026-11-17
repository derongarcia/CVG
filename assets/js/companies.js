(function () {
  "use strict";

  const ui = JobsUi;
  const form = document.getElementById("filters");
  const listEl = document.getElementById("companyList");

  const ICON_CHECK =
    '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  let timer = null;
  let lastRequest = 0;

  function metaText(company) {
    const parts = [company.sector, company.industry].filter(Boolean);
    const unique = parts.filter(function (v, i) { return parts.indexOf(v) === i; });
    return unique.join(" · ");
  }

  function whyHtml(reasons) {
    if (!reasons || reasons.length === 0) return "";
    return `
      <div class="companyCard__why">
        <p class="whyTitle">Why recommended:</p>
        <ul class="whyList">
          ${reasons
            .map(function (r) { return `<li>${ICON_CHECK}<span>${ui.esc(r)}</span></li>`; })
            .join("")}
        </ul>
      </div>`;
  }

  function cardHtml(company) {
    const button = company.jobId
      ? `<a class="btn btn--primary btn--sm"
            href="job-detail.html?id=${encodeURIComponent(company.jobId)}"
            aria-label="View company ${ui.esc(company.name)}">View Company →</a>`
      : `<button class="btn btn--primary btn--sm" type="button" disabled
            title="Belum ada lowongan terbuka">View Company →</button>`;

    return `
      <li class="card companyCard">
        ${ui.logoHtml(company)}
        <div>
          <h2 class="companyCard__name">${ui.esc(company.name)}</h2>
          <p class="companyCard__meta">${ui.esc(metaText(company))}</p>
          <p class="companyCard__match">
            <span class="matchPill matchPill--profile">
              ${ICON_CHECK}${ui.esc(company.profileMatch)}% Profile Match
            </span>
          </p>
          <p class="companyCard__cta">${button}</p>
        </div>
        ${whyHtml(company.whyRecommended)}
      </li>`;
  }


  function currentFilters() {
    return {
      industry: form.elements.industry.value,
      location: form.elements.location.value,
      size: form.elements.size.value,
      q: form.elements.q.value.trim(),
    };
  }

  async function load() {
    const requestId = ++lastRequest;
    listEl.setAttribute("aria-busy", "true");

    try {
      const companies = await CompaniesData.list(currentFilters());
      if (requestId !== lastRequest) return;

      listEl.innerHTML = companies.length
        ? companies.map(cardHtml).join("")
        : `<li class="card">${ui.messageHtml(
            "Tidak ada perusahaan yang cocok",
            "Coba ubah filter atau kata kunci pencarian."
          )}</li>`;
    } catch (error) {
      if (requestId !== lastRequest) return;
      listEl.innerHTML = `<li class="card">${ui.messageHtml(
        "Gagal memuat perusahaan",
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
      const options = await CompaniesData.filters();
      fillSelect(form.elements.industry, options.industries);
      fillSelect(form.elements.location, options.locations);
      fillSelect(form.elements.size, options.sizes);
    } catch (error) {
    }
    load();
  })();
})();
