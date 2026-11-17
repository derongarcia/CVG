window.CvRender = (function () {
  "use strict";

  /* Wajib: data CV berasal dari input user (nanti dari API juga).
     Tanpa escape, isian seperti <script> bisa dieksekusi di preview. */
  function esc(value) {
    if (value === null || value === undefined) return "";
    return String(value).replace(/[&<>"']/g, function (ch) {
      return "&#" + ch.charCodeAt(0) + ";";
    });
  }


  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function formatMonth(value) {
    const match = /^(\d{4})-(\d{2})$/.exec(value || "");
    if (!match) return value || "";
    return MONTHS[Number(match[2]) - 1] + " " + match[1];
  }

  function range(start, end) {
    if (!start && !end) return "";
    return esc(formatMonth(start)) + " - " + (end ? esc(formatMonth(end)) : "Present");
  }


  function isFilled(list) {
    return Array.isArray(list) && list.length > 0;
  }

  /* ---------------- TEMPLATE: CREATIVE ---------------- */
  function creative(data) {
    const p = data.personal || {};

    const contacts = [
      p.location && { icon: "pin", text: p.location },
      p.email && { icon: "mail", text: p.email },
      p.linkedin && { icon: "link", text: p.linkedin },
    ].filter(Boolean);

    const icons = {
      pin: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.1 7-12A7 7 0 0 0 5 10c0 5.9 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
      mail: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
      link: '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M4 4h16v16H4z" fill="none"/><path d="M6.94 8.5a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88zM5.7 19h2.5V9.75H5.7zM10 9.75h2.4v1.26h.03c.33-.62 1.15-1.28 2.37-1.28 2.54 0 3 1.6 3 3.68V19h-2.5v-4.1c0-.98-.02-2.24-1.37-2.24-1.37 0-1.58 1.06-1.58 2.17V19H10z"/></svg>',
    };

    return `
      <article class="cv cv--creative">
        <header class="cvc__head">
          ${
            p.photo
              ? `<img class="cvc__photo" src="${esc(p.photo)}" alt=""
                   onerror="this.style.visibility='hidden'">`
              : '<div class="cvc__photo"></div>'
          }
          <div class="cvc__ident">
            <h2 class="cvc__name">${esc(p.fullName)}</h2>
            <p class="cvc__role">${esc(p.headline)}</p>
            <ul class="cvc__contacts">
              ${contacts
                .map(
                  (c) =>
                    `<li>${icons[c.icon]}<span>${esc(c.text)}</span></li>`
                )
                .join("")}
            </ul>
          </div>
        </header>

        ${
          isFilled(data.experience)
            ? `<section class="cvc__section">
                 <h3 class="cvc__title">Experience</h3>
                 ${data.experience
                   .map(
                     (item) => `
                   <div class="cvc__row">
                     <div>
                       <p class="cvc__primary">${esc(item.position)}</p>
                       <p class="cvc__secondary">${esc(item.company)}</p>
                     </div>
                     <p class="cvc__date">${range(item.startDate, item.endDate)}</p>
                   </div>`
                   )
                   .join("")}
               </section>`
            : ""
        }

        ${
          isFilled(data.education)
            ? `<section class="cvc__section">
                 <h3 class="cvc__title">Education</h3>
                 ${data.education
                   .map(
                     (item) => `
                   <div class="cvc__row">
                     <div>
                       <p class="cvc__primary cvc__primary--link">${esc(item.institution)}</p>
                       <p class="cvc__secondary">${esc(item.degree)}${
                         item.field ? " in " + esc(item.field) : ""
                       }</p>
                     </div>
                     <p class="cvc__date">${range(item.startDate, item.endDate)}</p>
                   </div>`
                   )
                   .join("")}
               </section>`
            : ""
        }

        ${
          isFilled(data.skills)
            ? `<section class="cvc__section">
                 <h3 class="cvc__title">Skills</h3>
                 <ul class="chipList">
                   ${data.skills
                     .map((skill) => `<li class="chip">${esc(skill)}</li>`)
                     .join("")}
                 </ul>
               </section>`
            : ""
        }

        ${
          isFilled(data.projects)
            ? `<section class="cvc__section">
                 <h3 class="cvc__title">Projects</h3>
                 ${data.projects
                   .map(
                     (item) => `
                   <div class="cvc__block">
                     <p class="cvc__primary">${esc(item.name)}</p>
                     <p class="cvc__secondary">${esc(item.position)}</p>
                     <p class="cvc__desc">${esc(item.description)}</p>
                   </div>`
                   )
                   .join("")}
               </section>`
            : ""
        }
      </article>`;
  }

  /* ---------------- TEMPLATE: ATS ---------------- */
  function ats(data) {
    const p = data.personal || {};

    function section(title, body) {
      if (!body) return "";
      return `<section class="cva__section">
                <h3 class="cva__title">${esc(title)}</h3>
                ${body}
              </section>`;
    }

    return `
      <article class="cv cv--ats">
        <header class="cva__head">
          <h2 class="cva__name">${esc(p.fullName)}</h2>
          <p class="cva__role">${esc(p.headline)}</p>
        </header>

        ${section(
          "Professional Summary",
          p.summary ? `<p class="cva__text">${esc(p.summary)}</p>` : ""
        )}

        ${section(
          "Education",
          isFilled(data.education)
            ? data.education
                .map(
                  (item) => `
            <div class="cva__item">
              <div class="cva__row">
                <p class="cva__strong">${esc(item.institution)}</p>
                <p class="cva__date">${range(item.startDate, item.endDate)}</p>
              </div>
              <p class="cva__text">
                ${esc(item.degree)}${item.field ? " in " + esc(item.field) : ""}${
                    item.gpa ? " | GPA " + esc(item.gpa) : ""
                  }
              </p>
            </div>`
                )
                .join("")
            : ""
        )}

        ${section(
          "Experience",
          isFilled(data.experience)
            ? data.experience
                .map(
                  (item) => `
            <div class="cva__item">
              <div class="cva__row">
                <p class="cva__strong">${esc(item.position)}${
                    item.company ? " - " + esc(item.company) : ""
                  }</p>
                <p class="cva__date">${range(item.startDate, item.endDate)}</p>
              </div>
              <p class="cva__text">${esc(item.description)}</p>
            </div>`
                )
                .join("")
            : ""
        )}

        ${section(
          "Projects",
          isFilled(data.projects)
            ? data.projects
                .map(
                  (item) => `
            <div class="cva__item">
              <p class="cva__strong">${esc(item.name)}</p>
              <p class="cva__text">${esc(item.position)}</p>
              <p class="cva__text">${esc(item.description)}</p>
            </div>`
                )
                .join("")
            : ""
        )}

        ${section(
          "Certifications",
          isFilled(data.certifications)
            ? data.certifications
                .map(
                  (item) => `
            <p class="cva__text">
              ${esc(item.name)}${item.organization ? " - " + esc(item.organization) : ""}${
                    item.issueDate ? ", " + esc(formatMonth(item.issueDate)) : ""
                  }
            </p>`
                )
                .join("")
            : ""
        )}
      </article>`;
  }

    /* ---------------- TEMPLATE: MODERN ---------------- */
  function modern(data) {
    const p = data.personal || {};

    const contacts = [p.email, p.linkedin, p.location, p.phone].filter(Boolean);

    function block(title, body) {
      if (!body) return "";
      return `<section class="cvm__section">
                <h3 class="cvm__title">${esc(title)}</h3>
                ${body}
              </section>`;
    }

    function sideBlock(title, items) {
      if (!items || items.length === 0) return "";
      return `<div class="cvm__sideBlock">
                <h3 class="cvm__sideTitle">${esc(title)}</h3>
                <ul>${items.map(function (t) {
                  return `<li>${esc(t)}</li>`;
                }).join("")}</ul>
              </div>`;
    }

    return `
      <article class="cv cv--modern">
        <aside class="cvm__side">
          ${
            p.photo
              ? `<img class="cvm__photo" src="${esc(p.photo)}" alt=""
                   onerror="this.style.visibility='hidden'">`
              : '<div class="cvm__photo"></div>'
          }
          <ul class="cvm__contacts">
            ${contacts.map(function (c) {
              return `<li>${esc(c)}</li>`;
            }).join("")}
          </ul>
          ${sideBlock("Skills", data.skills)}
          ${sideBlock("Languages", (data.languages || []).map(function (l) {
            return l.language;
          }).filter(Boolean))}
        </aside>

        <div class="cvm__body">
          <h2 class="cvm__name">${esc(p.fullName)}</h2>
          <p class="cvm__role">${esc(p.headline)}</p>

          ${block("Professional Summary",
            p.summary ? `<p class="cvm__text">${esc(p.summary)}</p>` : "")}

          ${block("Education", isFilled(data.education)
            ? data.education.map(function (item) {
                return `<div class="cvm__item">
                          <p class="cvm__strong">${esc(item.institution)}</p>
                          <p class="cvm__text">${esc(item.degree)}${
                            item.field ? " in " + esc(item.field) : ""
                          }</p>
                          <p class="cvm__meta">${range(item.startDate, item.endDate)}${
                            item.gpa ? " | GPA " + esc(item.gpa) : ""
                          }</p>
                        </div>`;
              }).join("")
            : "")}

          ${block("Experience", isFilled(data.experience)
            ? data.experience.map(function (item) {
                return `<div class="cvm__item">
                          <p class="cvm__strong">${esc(item.position)}${
                            item.company ? " - " + esc(item.company) : ""
                          }</p>
                          <p class="cvm__meta">${range(item.startDate, item.endDate)}</p>
                          <p class="cvm__text">${esc(item.description)}</p>
                        </div>`;
              }).join("")
            : "")}

          ${block("Projects", isFilled(data.projects)
            ? data.projects.map(function (item) {
                return `<div class="cvm__item">
                          <p class="cvm__strong">${esc(item.name)}</p>
                          <p class="cvm__text">${esc(item.position)}</p>
                          <p class="cvm__text">${esc(item.description)}</p>
                        </div>`;
              }).join("")
            : "")}

          ${block("Certifications", isFilled(data.certifications)
            ? data.certifications.map(function (item) {
                return `<div class="cvm__item">
                          <p class="cvm__text">${esc(item.name)}${
                            item.organization ? " - " + esc(item.organization) : ""
                          }</p>
                          <p class="cvm__meta">${esc(formatMonth(item.issueDate))}</p>
                        </div>`;
              }).join("")
            : "")}
        </div>
      </article>`;
  }



  function render(data, template) {
    if (template === "ats") return ats(data);
    if (template === "modern") return modern(data);
    return creative(data);
  }


  return { render, esc };
})();
