window.JobsUi = (function () {
  "use strict";

  function esc(value) {
    if (value === null || value === undefined) return "";
    return String(value).replace(/[&<>"']/g, function (ch) {
      return "&#" + ch.charCodeAt(0) + ";";
    });
  }


  function safeColor(value) {
    return /^#[0-9a-f]{3,8}$/i.test(value || "") ? value : "#6b7280";
  }

  /* Pakai gambar logo kalau ada; kalau belum ada, kotak warna + inisial */
  function logoHtml(company, size) {
    const cls = "jobLogo" + (size === "lg" ? " jobLogo--lg" : "");

    if (company.logo) {
      return `<img class="${cls}" src="${esc(company.logo)}" alt="Logo ${esc(company.name)}" />`;
    }

    const initial = String(company.name || "?").trim().charAt(0).toUpperCase();
    return `<span class="${cls}" style="background:${safeColor(company.brandColor)}"
              aria-hidden="true">${esc(initial)}</span>`;
  }

  function juta(n) {
    return (n / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 });
  }

  function formatSalary(salary) {
    if (!salary || !salary.min) return "";
    if (!salary.max || salary.max === salary.min) {
      return "Rp " + juta(salary.min) + " juta";
    }
    return "Rp " + juta(salary.min) + "-" + juta(salary.max) + " juta";
  }

  function placeText(job) {
    return [job.location, job.workMode].filter(Boolean).join(" / ");
  }

  function scoreTone(score) {
    if (score >= 85) return { key: "great", label: "Great Match" };
    if (score >= 70) return { key: "good", label: "Good Match" };
    return { key: "fair", label: "Fair Match" };
  }

  function param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function messageHtml(title, text, linkHref, linkLabel) {
    const link = linkHref
      ? `<a class="btn btn--outline btn--sm" href="${esc(linkHref)}">${esc(linkLabel)}</a>`
      : "";
    return `<div class="stateBox">
              <p class="stateBox__title">${esc(title)}</p>
              <p class="stateBox__text">${esc(text)}</p>
              ${link}
            </div>`;
  }

  return {
    esc: esc,
    logoHtml: logoHtml,
    formatSalary: formatSalary,
    placeText: placeText,
    scoreTone: scoreTone,
    param: param,
    messageHtml: messageHtml,
  };
})();
