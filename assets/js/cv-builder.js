(function () {
  "use strict";

  const esc = CvRender.esc;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ============================================================
     PILIHAN UNTUK SELECT DAN SARAN SKILL
     ============================================================ */
  const EMPLOYMENT_TYPES = [
    "Full-time", "Part-time", "Internship", "Contract",
    "Freelance", "Seasonal", "Volunteer",
  ];

  const LANGUAGES = [
    "Indonesian", "English", "Japanese", "Mandarin",
    "Korean", "Arabic", "German", "French", "Spanish",
  ];

  const PROFICIENCY = ["Native", "Fluent", "Professional", "Intermediate", "Basic"];

  const SKILL_SUGGESTIONS = [
    "Figma", "UI/UX Design", "Prototyping", "User Research", "Wireframing",
    "HTML", "CSS", "JavaScript", "TypeScript", "React", "Vue", "Laravel",
    "PHP", "Python", "Java", "MySQL", "PostgreSQL", "Git",
    "Data Analysis", "Public Speaking", "Project Management",
  ];

  /* ============================================================
     KONFIGURASI STEP
     - kind "object": satu set field (Personal Information)
     - kind "list":   entri yang bisa ditambah (Education, dst)
     - field berbentuk array = ditampilkan berdampingan 2 kolom
     ============================================================ */
  const LANGUAGE_LIST = {
    key: "languages",
    itemLabel: "Language",
    addLabel: "+ Add Language",
    primary: "language",
    primaryLabel: "Language",
    fields: [
      { name: "language", label: "Language", type: "select", options: LANGUAGES },
      { name: "proficiency", label: "Proficiency Level", type: "select", options: PROFICIENCY },
    ],
  };

  const STEPS = [
    {
      key: "personal",
      kind: "object",
      title: "Personal Information",
      fields: [
        { name: "fullName", label: "Full Name", placeholder: "Alexandra", autocomplete: "name" },
        { name: "headline", label: "Professional Title", placeholder: "UI/UX Designer" },
        { name: "email", label: "Email Address", type: "email", placeholder: "alexandra@gmail.com", autocomplete: "email" },
        { name: "phone", label: "Phone Number", type: "tel", placeholder: "+62 812 3456 7890", autocomplete: "tel" },
        { name: "location", label: "Location", placeholder: "Jakarta, Indonesia" },
        { name: "linkedin", label: "LinkedIn Profile", placeholder: "linkedin.com/in/username" },
        { name: "summary", label: "Professional Summary", type: "textarea", placeholder: "Ceritakan singkat tentang dirimu..." },
      ],
    },
    {
      key: "education",
      kind: "list",
      title: "Education",
      itemLabel: "Education",
      addLabel: "+ Add Education",
      primary: "institution",
      primaryLabel: "Institution",
      fields: [
        { name: "institution", label: "Institution", placeholder: "BINUS University" },
        { name: "degree", label: "Degree", placeholder: "Bachelor's Degree" },
        { name: "field", label: "Field of Study", placeholder: "Computer Science" },
        [
          { name: "startDate", label: "Start Date", type: "month" },
          { name: "endDate", label: "End Date", type: "month" },
        ],
        { name: "gpa", label: "GPA", optional: true, placeholder: "3.85", inputmode: "decimal" },
      ],
    },
    {
      key: "experience",
      kind: "list",
      title: "Experience",
      itemLabel: "Experience",
      addLabel: "+ Add Experience",
      primary: "company",
      primaryLabel: "Company",
      fields: [
        { name: "company", label: "Company", placeholder: "HIMTI" },
        { name: "position", label: "Position", placeholder: "Creative and Design Division" },
        { name: "employmentType", label: "Employment Type", type: "select", options: EMPLOYMENT_TYPES },
        [
          { name: "startDate", label: "Start Date", type: "month" },
          { name: "endDate", label: "End Date", type: "month" },
        ],
        { name: "location", label: "Location", placeholder: "Jakarta, Indonesia" },
        { name: "description", label: "Description", type: "textarea", placeholder: "Apa yang kamu kerjakan dan capai?" },
      ],
    },
    {
      key: "skills",
      kind: "skills",
      title: "Skills",
      subtitle: "Add your skills",
    },
    {
      key: "projects",
      kind: "list",
      title: "Projects",
      itemLabel: "Project",
      addLabel: "+ Add Project",
      primary: "name",
      primaryLabel: "Project Name",
      fields: [
        { name: "name", label: "Project Name", placeholder: "Trip Genie" },
        { name: "position", label: "Position", placeholder: "UI/UX Designer" },
        { name: "description", label: "Description", type: "textarea", placeholder: "Jelaskan proyekmu..." },
        { name: "tools", label: "Tools and Technologies", type: "chips", placeholder: "Search for tools and technologies...", listId: "skillSuggestions" },
        { name: "link", label: "Project Link", type: "url", optional: true, placeholder: "https://..." },
      ],
    },
    {
      key: "certifications",
      kind: "list",
      title: "Certifications",
      itemLabel: "Certification",
      addLabel: "+ Add Certification",
      primary: "name",
      primaryLabel: "Certification Name",
      fields: [
        { name: "name", label: "Certification Name", placeholder: "UI/UX Design Certificate" },
        { name: "organization", label: "Issuing Organization", placeholder: "Google" },
        { name: "issueDate", label: "Issue Date", type: "month" },
        { name: "credential", label: "Credential ID / Link", type: "url", optional: true, placeholder: "https://course.org/certificate/xyz123" },
      ],
    },
    {
      key: "preview",
      kind: "preview",
      title: "Preview",
    },
  ];

  const LIST_DEFS = STEPS.filter(function (s) { return s.kind === "list"; })
    .concat(LANGUAGE_LIST);

  const SEARCH_ICON =
    '<svg class="searchBox__icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';

  /* ============================================================
     ELEMEN DAN STATE
     ============================================================ */
  function $(id) {
    return document.getElementById(id);
  }

  const builderEl = $("builder");
  const stepperEl = $("stepper");
  const formCard = $("formCard");
  const form = $("stepForm");
  const stepTitle = $("stepTitle");
  const stepSubtitle = $("stepSubtitle");
  const stepBody = $("stepBody");
  const backBtn = $("backBtn");
  const previewCard = $("previewCard");
  const finalPreview = $("finalPreview");
  const previewActions = $("previewActions");
  const stepLabel = $("stepLabel");
  const progressBar = $("progressBar");
  const progressPct = $("progressPct");
  const progressTrack = $("progressTrack");

  let state = CvStore.load();
  if (!state.personal) state.personal = {};
  if (!Array.isArray(state.skills)) state.skills = [];

  function clampStep(n) {
    if (!Number.isFinite(n)) return 1;
    return Math.min(Math.max(n, 1), STEPS.length);
  }

  let current = clampStep(
    parseInt(new URLSearchParams(window.location.search).get("step"), 10)
  );

  /* ============================================================
     HELPER DATA
     ============================================================ */
  function flatFields(fields) {
    return fields.reduce(function (all, f) { return all.concat(f); }, []);
  }

  function blank(def) {
    const item = {};
    flatFields(def.fields).forEach(function (f) {
      item[f.name] = f.type === "chips" ? [] : "";
    });
    return item;
  }

  function getList(key) {
    if (!Array.isArray(state[key])) state[key] = [];
    return state[key];
  }

  function findListDef(key) {
    return LIST_DEFS.find(function (d) { return d.key === key; });
  }

  function isEmptyEntry(item) {
    return Object.keys(item).every(function (k) {
      const v = item[k];
      return Array.isArray(v) ? v.length === 0 : !String(v || "").trim();
    });
  }

  /* Tempat menyimpan nilai input: state.personal atau state.education[0], dst */
  function targetOf(section, index) {
    if (index === "" || index === undefined) {
      if (!state[section] || typeof state[section] !== "object") state[section] = {};
      return state[section];
    }
    return getList(section)[Number(index)];
  }

  /* Array chip: state.skills, atau state.projects[i].tools */
  function chipArray(wrap) {
    const section = wrap.dataset.chipSection;
    const index = wrap.dataset.chipIndex;
    const field = wrap.dataset.chipField;

    if (!field) return getList(section);

    const item = getList(section)[Number(index)];
    if (!Array.isArray(item[field])) item[field] = [];
    return item[field];
  }

  function fieldId(ctx, name) {
    return ["f", ctx.section, ctx.index, name]
      .filter(function (x) { return x !== "" && x !== undefined; })
      .join("-");
  }

  /* Buang entri yang benar-benar kosong, lalu simpan */
  function persist() {
    LIST_DEFS.forEach(function (def) {
      state[def.key] = getList(def.key).filter(function (item) {
        return !isEmptyEntry(item);
      });
    });
    CvStore.save(state);
  }

  /* ============================================================
     RENDER FIELD
     ============================================================ */
  function inputHtml(f, value, id, attrs) {
    const v = value === undefined || value === null ? "" : value;
    const ph = esc(f.placeholder || "");

    if (f.type === "textarea") {
      return `<textarea class="formInput formInput--area" id="${id}" rows="4"
                ${attrs} placeholder="${ph}">${esc(v)}</textarea>`;
    }

    if (f.type === "select") {
      const options = f.options
        .map(function (o) {
          return `<option value="${esc(o)}"${o === v ? " selected" : ""}>${esc(o)}</option>`;
        })
        .join("");
      return `<select class="formInput" id="${id}" ${attrs}>
                <option value="">Select...</option>${options}
              </select>`;
    }

    const extra =
      (f.autocomplete ? ` autocomplete="${f.autocomplete}"` : "") +
      (f.inputmode ? ` inputmode="${f.inputmode}"` : "") +
      (f.type === "month" ? ' placeholder="YYYY-MM"' : ` placeholder="${ph}"`);

    return `<input class="formInput" type="${f.type || "text"}" id="${id}"
              ${attrs} value="${esc(v)}"${extra} />`;
  }

  function chipsHtml(values, ctx, f, id) {
    const list = Array.isArray(values) ? values : [];
    const chips = list
      .map(function (text, i) {
        return `<li class="chip chip--removable">${esc(text)}
                  <button class="chip__remove" type="button" data-chip-remove="${i}"
                    aria-label="Hapus ${esc(text)}">×</button>
                </li>`;
      })
      .join("");

    return `
      <div class="chipField" data-chip-section="${ctx.section}"
           data-chip-index="${ctx.index}" data-chip-field="${f.name}">
        <div class="searchBox">
          <input class="formInput" type="text" id="${id}" list="${f.listId}"
            placeholder="${esc(f.placeholder)}" aria-label="${esc(f.placeholder)}"
            autocomplete="off" data-chip-input />
          ${SEARCH_ICON}
        </div>
        <p class="formHint">Ketik lalu tekan Enter untuk menambahkan.</p>
        ${f.chipsLabel && list.length ? `<p class="subLabel">${esc(f.chipsLabel)}</p>` : ""}
        <ul class="chipList chipList--edit">${chips}</ul>
      </div>`;
  }

  function renderField(f, item, ctx) {
    // Array = beberapa field berdampingan
    if (Array.isArray(f)) {
      return `<div class="formGrid2">${f
        .map(function (x) { return renderField(x, item, ctx); })
        .join("")}</div>`;
    }

    const id = fieldId(ctx, f.name);
    const optional = f.optional ? ' <span class="formLabel__opt">(Optional)</span>' : "";
    const label = `<label class="formLabel" for="${id}">${esc(f.label)}${optional}</label>`;

    if (f.type === "chips") {
      return `<div class="formField">${label}${chipsHtml(item[f.name], ctx, f, id)}</div>`;
    }

    const attrs = `data-section="${ctx.section}" data-index="${ctx.index}" data-field="${f.name}"`;

    return `<div class="formField">
              ${label}
              ${inputHtml(f, item[f.name], id, attrs)}
              <p class="formError" id="${id}-error"></p>
            </div>`;
  }

  function renderList(def) {
    const list = getList(def.key);
    if (list.length === 0) list.push(blank(def));

    const entries = list
      .map(function (item, i) {
        const ctx = { section: def.key, index: i };
        const head =
          list.length > 1
            ? `<div class="entry__head">
                 <p class="entry__label">${esc(def.itemLabel)} ${i + 1}</p>
                 <button class="entry__remove" type="button"
                   data-remove-section="${def.key}" data-remove-entry="${i}">Remove</button>
               </div>`
            : "";
        const fields = def.fields
          .map(function (f) { return renderField(f, item, ctx); })
          .join("");
        return `<div class="entry">${head}${fields}</div>`;
      })
      .join("");

    return `${entries}
            <button class="btn btn--outline btn--sm addBtn" type="button"
              data-add="${def.key}">${esc(def.addLabel)}</button>`;
  }

  function renderSkills() {
    const skillsField = {
      name: "",
      placeholder: "Search for skills...",
      listId: "skillSuggestions",
      chipsLabel: "Added Skills",
    };
    return (
      chipsHtml(state.skills, { section: "skills", index: "" }, skillsField, "f-skills") +
      `<div class="subSection">${renderList(LANGUAGE_LIST)}</div>`
    );
  }

  function renderStepBody(step) {
    if (step.kind === "object") {
      const item = targetOf(step.key, "");
      return step.fields
        .map(function (f) { return renderField(f, item, { section: step.key, index: "" }); })
        .join("");
    }
    if (step.kind === "list") return renderList(step);
    if (step.kind === "skills") return renderSkills();
    return "";
  }

  function renderStepper() {
    stepperEl.innerHTML = STEPS.map(function (s, i) {
      const n = i + 1;
      const active = n === current;
      return `<li>
                <button class="stepItem${active ? " stepItem--active" : ""}" type="button"
                  data-goto="${n}"${active ? ' aria-current="step"' : ""}>
                  <span class="stepItem__num">${n}</span>
                  <span class="stepItem__label">${esc(s.title)}</span>
                </button>
              </li>`;
    }).join("");
  }

  /* ============================================================
     RENDER HALAMAN
     ============================================================ */
  function render() {
    const step = STEPS[current - 1];
    const isPreview = step.kind === "preview";
    const pct = Math.round((current / STEPS.length) * 100);

    stepLabel.textContent = "Step " + current + " of " + STEPS.length;
    progressBar.style.width = pct + "%";
    progressPct.textContent = pct + "%";
    progressTrack.setAttribute("aria-valuenow", String(pct));

    builderEl.classList.toggle("builder--preview", isPreview);
    stepperEl.hidden = isPreview;
    formCard.hidden = isPreview;
    previewCard.hidden = !isPreview;
    previewActions.hidden = !isPreview;

    renderStepper();

        if (isPreview) {
      const template = state.template || "creative";
      finalPreview.innerHTML = CvRender.render(state, template);
      finalPreview.classList.toggle("previewPane__paper--flush", template !== "ats");
      return;
    }


    stepTitle.textContent = step.title;
    stepSubtitle.textContent = step.subtitle || "";
    stepSubtitle.hidden = !step.subtitle;
    stepBody.innerHTML = renderStepBody(step);
  }

  /* Render ulang isi form lalu kembalikan fokus ke input tertentu */
  function rerender(focusId) {
    stepBody.innerHTML = renderStepBody(STEPS[current - 1]);
    if (focusId) {
      const el = document.getElementById(focusId);
      if (el) el.focus();
    }
  }

  function goTo(n) {
    current = clampStep(n);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("step", String(current));
      history.replaceState(null, "", url);
    } catch (error) {
      // Beberapa browser menolak replaceState saat file dibuka via file://
    }
    render();
    window.scrollTo(0, 0);
  }

  /* ============================================================
     VALIDASI
     ============================================================ */
  function validateList(def, errors) {
    getList(def.key).forEach(function (item, index) {
      if (isEmptyEntry(item)) return;
      const ctx = { section: def.key, index: index };

      if (!String(item[def.primary] || "").trim()) {
        errors.push({ id: fieldId(ctx, def.primary), message: def.primaryLabel + " wajib diisi." });
      }
      // "YYYY-MM" bisa dibandingkan langsung sebagai string
      if (item.startDate && item.endDate && item.endDate < item.startDate) {
        errors.push({ id: fieldId(ctx, "endDate"), message: "End date tidak boleh sebelum start date." });
      }
    });
  }

  function validate(step) {
    const errors = [];

    if (step.key === "personal") {
      const p = state.personal;
      const email = String(p.email || "").trim();

      if (!String(p.fullName || "").trim()) {
        errors.push({ id: "f-personal-fullName", message: "Nama wajib diisi." });
      }
      if (!email) {
        errors.push({ id: "f-personal-email", message: "Email wajib diisi." });
      } else if (!EMAIL_PATTERN.test(email)) {
        errors.push({ id: "f-personal-email", message: "Format email tidak valid." });
      }
    }

    if (step.kind === "list") validateList(step, errors);
    if (step.kind === "skills") validateList(LANGUAGE_LIST, errors);

    return errors;
  }

  function clearError(input) {
    input.classList.remove("is-invalid");
    const slot = document.getElementById(input.id + "-error");
    if (slot) slot.textContent = "";
  }

  function showErrors(errors) {
    stepBody.querySelectorAll(".is-invalid").forEach(clearError);

    errors.forEach(function (err) {
      const input = document.getElementById(err.id);
      const slot = document.getElementById(err.id + "-error");
      if (input) input.classList.add("is-invalid");
      if (slot) slot.textContent = err.message;
    });

    const first = document.getElementById(errors[0].id);
    if (first) first.focus();
  }

  /* ============================================================
     EVENT
     ============================================================ */

  stepBody.addEventListener("input", function (event) {
    const el = event.target.closest("[data-field]");
    if (!el) return;
    targetOf(el.dataset.section, el.dataset.index)[el.dataset.field] = el.value;
    clearError(el);
  });

  // Enter atau koma di input chip -> tambah chip
  stepBody.addEventListener("keydown", function (event) {
    const input = event.target.closest("[data-chip-input]");
    if (!input || (event.key !== "Enter" && event.key !== ",")) return;

    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    const list = chipArray(input.closest(".chipField"));
    const exists = list.some(function (x) { return x.toLowerCase() === value.toLowerCase(); });
    if (!exists) list.push(value);

    rerender(input.id);
  });

  stepBody.addEventListener("click", function (event) {
    const removeChip = event.target.closest("[data-chip-remove]");
    if (removeChip) {
      const wrap = removeChip.closest(".chipField");
      chipArray(wrap).splice(Number(removeChip.dataset.chipRemove), 1);
      rerender(wrap.querySelector("[data-chip-input]").id);
      return;
    }

    const addBtn = event.target.closest("[data-add]");
    if (addBtn) {
      const def = findListDef(addBtn.dataset.add);
      const list = getList(def.key);
      list.push(blank(def));
      const firstField = flatFields(def.fields)[0].name;
      rerender(fieldId({ section: def.key, index: list.length - 1 }, firstField));
      return;
    }

    const removeEntry = event.target.closest("[data-remove-entry]");
    if (removeEntry) {
      getList(removeEntry.dataset.removeSection).splice(Number(removeEntry.dataset.removeEntry), 1);
      rerender(null);
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const errors = validate(STEPS[current - 1]);
    if (errors.length > 0) {
      showErrors(errors);
      return;
    }
    persist();
    goTo(current + 1);
  });

  backBtn.addEventListener("click", function () {
    persist();
    if (current === 1) {
      window.location.href = "my-cv.html";
    } else {
      goTo(current - 1);
    }
  });

  stepperEl.addEventListener("click", function (event) {
    const btn = event.target.closest("[data-goto]");
    if (!btn) return;
    persist();
    goTo(Number(btn.dataset.goto));
  });

  $("editCvBtn").addEventListener("click", function () {
    goTo(1);
  });

  $("finishBtn").addEventListener("click", function () {
    persist();
    window.location.href = "my-cv.html";
  });

  /* ============================================================
     MULAI
     ============================================================ */
  document.body.insertAdjacentHTML(
    "beforeend",
    '<datalist id="skillSuggestions">' +
      SKILL_SUGGESTIONS.map(function (s) {
        return '<option value="' + esc(s) + '"></option>';
      }).join("") +
      "</datalist>"
  );

  render();
})();
