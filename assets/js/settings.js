(function () {
  "use strict";

  const ui = JobsUi;
  const root = document.getElementById("root");

  const ICON_BRIEFCASE =
    '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M9 7V5h6v2M2 12h20"/></svg>';
  const ICON_MAIL =
    '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';

  const FIELDS = [
    { name: "fullName", label: "Full Name", placeholder: "Alexandra" },
    { name: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
    { name: "phone", label: "Phone Number", type: "tel", placeholder: "+62 812 3456 7890" },
    { name: "location", label: "Location", placeholder: "Jakarta, Indonesia" },
  ];

  const PREFS = [
    {
      name: "jobRecommendations",
      icon: ICON_BRIEFCASE,
      title: "Job Recommendations",
      desc: "Get personalized job recommendations based on your profile",
    },
    {
      name: "emailNotifications",
      icon: ICON_MAIL,
      title: "Email Notifications",
      desc: "Receive updates about new jobs, companies, and your CV performance",
    },
  ];

  let state = null;

  function fieldHtml(field, value) {
    return `
      <div class="formField">
        <label class="formLabel" for="s-${field.name}">${ui.esc(field.label)}</label>
        <input class="formInput" type="${field.type || "text"}" id="s-${field.name}"
          name="${field.name}" value="${ui.esc(value)}"
          placeholder="${ui.esc(field.placeholder)}" />
        <p class="formError" id="s-${field.name}-error"></p>
      </div>`;
  }

  function prefHtml(pref, checked) {
    return `
      <div class="prefRow">
        <span class="prefRow__icon">${pref.icon}</span>
        <div class="prefRow__text">
          <p class="prefRow__title">${ui.esc(pref.title)}</p>
          <p class="prefRow__desc">${ui.esc(pref.desc)}</p>
        </div>
        <label class="switch">
          <input type="checkbox" name="${pref.name}"${checked ? " checked" : ""}
            aria-label="${ui.esc(pref.title)}" />
          <span class="switch__track"></span>
        </label>
      </div>`;
  }

  function render() {
    const p = state.profile;

    root.innerHTML = `
      <form class="card settingsCard" id="settingsForm" novalidate>
        <h1 class="settingsCard__title">Account Information</h1>
        <p class="settingsCard__sub">Update your personal information and profile details.</p>

        <div class="photoRow">
          <img class="photoRow__img" id="photoPreview" src="${ui.esc(p.photo)}" alt=""
            onerror="this.style.visibility='hidden'" />
          <button class="photoRow__btn" type="button" id="photoBtn">Change Photo</button>
          <input class="photoRow__input" type="file" id="photoInput"
            accept="image/png,image/jpeg,image/webp" />
        </div>

        <div class="formGrid2">
          ${fieldHtml(FIELDS[0], p.fullName)}
          ${fieldHtml(FIELDS[1], p.email)}
        </div>

        <div class="formGrid2">
          ${fieldHtml(FIELDS[2], p.phone)}
          ${fieldHtml(FIELDS[3], p.location)}
        </div>

        <div class="formField">
          <label class="formLabel" for="s-bio">Bio</label>
          <textarea class="formInput formInput--area" id="s-bio" name="bio" rows="4"
            placeholder="Ceritakan singkat tentang dirimu...">${ui.esc(p.bio)}</textarea>
          <p class="formError" id="s-bio-error"></p>
        </div>

        <section class="prefSection">
          <h2 class="settingsCard__title">Preferences</h2>
          <p class="settingsCard__sub">Set your preferences to get a better experience.</p>
          <div>
            ${PREFS.map(function (pref) {
              return prefHtml(pref, state.preferences[pref.name]);
            }).join("")}
          </div>
        </section>

        <div class="settingsFoot">
          <button class="btn btn--primary" type="submit" id="saveBtn">Save Changes</button>
          <p class="saveStatus" id="saveStatus" role="status" aria-live="polite"></p>
        </div>
      </form>`;

    bind();
  }

  function setStatus(message, tone) {
    const el = document.getElementById("saveStatus");
    el.textContent = message;
    el.className = "saveStatus" + (tone ? " saveStatus--" + tone : "");
  }

  function clearErrors(form) {
    form.querySelectorAll(".formError").forEach(function (el) { el.textContent = ""; });
    form.querySelectorAll(".is-invalid").forEach(function (el) {
      el.classList.remove("is-invalid");
    });
  }

  function showErrors(form, errors) {
    Object.keys(errors).forEach(function (name) {
      const input = document.getElementById("s-" + name);
      const slot = document.getElementById("s-" + name + "-error");
      if (input) input.classList.add("is-invalid");
      if (slot) {
        slot.textContent = Array.isArray(errors[name]) ? errors[name][0] : errors[name];
      }
    });

    const first = document.getElementById("s-" + Object.keys(errors)[0]);
    if (first) first.focus();
  }

  function collect(form) {
    return {
      profile: {
        fullName: form.elements.fullName.value.trim(),
        email: form.elements.email.value.trim(),
        phone: form.elements.phone.value.trim(),
        location: form.elements.location.value.trim(),
        bio: form.elements.bio.value.trim(),
        photo: state.profile.photo,
      },
      preferences: {
        jobRecommendations: form.elements.jobRecommendations.checked,
        emailNotifications: form.elements.emailNotifications.checked,
      },
    };
  }

  function bind() {
    const form = document.getElementById("settingsForm");
    const saveBtn = document.getElementById("saveBtn");
    const photoInput = document.getElementById("photoInput");

    document.getElementById("photoBtn").addEventListener("click", function () {
      photoInput.click();
    });

    photoInput.addEventListener("change", async function () {
      const file = photoInput.files[0];
      if (!file) return;

      setStatus("Mengunggah foto...", null);
      try {
        const result = await SettingsData.uploadPhoto(file);
        state.profile.photo = result.photoUrl;

        const img = document.getElementById("photoPreview");
        img.src = result.photoUrl;
        img.style.visibility = "visible";

        setStatus("Foto siap. Klik Save Changes untuk menyimpan.", "ok");
      } catch (error) {
        setStatus(error.message || "Gagal mengunggah foto.", "err");
      } finally {
        photoInput.value = "";
      }
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      clearErrors(form);
      setStatus("", null);

      const payload = collect(form);
      const errors = SettingsData.validate(payload.profile);

      if (Object.keys(errors).length > 0) {
        showErrors(form, errors);
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      try {
        state = await SettingsData.save(payload);
        setStatus("Perubahan tersimpan.", "ok");
      } catch (error) {
        // Error 422 dari Laravel berisi daftar error per field
        if (error.errors) {
          showErrors(form, error.errors);
          setStatus("Periksa kembali isian kamu.", "err");
        } else {
          setStatus(error.message || "Gagal menyimpan.", "err");
        }
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Changes";
      }
    });
  }

  (async function init() {
    try {
      state = await SettingsData.get();
      render();
    } catch (error) {
      root.innerHTML = `<div class="card">${ui.messageHtml(
        "Gagal memuat settings",
        error.message || "Coba muat ulang halaman."
      )}</div>`;
    } finally {
      root.removeAttribute("aria-busy");
    }
  })();
})();
