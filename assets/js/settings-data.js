/* ============================================================
   Data settings.
   mode "mock" -> localStorage. mode "live" -> API backend.
   Nilai awal diambil dari CV user, supaya form tidak kosong.
   ============================================================ */
window.SettingsData = (function () {
  "use strict";

  const STORAGE_KEY = "cvg.settings";
  const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2 MB

  function defaults() {
    const p = (CvStore.load() || {}).personal || {};
    return {
      profile: {
        fullName: p.fullName || "",
        email: p.email || "",
        phone: p.phone || "",
        location: p.location || "",
        bio: p.summary || "",
        photo: p.photo || "assets/img/avatar.jpg",
      },
      preferences: {
        jobRecommendations: true,
        emailNotifications: true,
      },
    };
  }

  function readLocal() {
    const base = defaults();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      const saved = JSON.parse(raw);
      return {
        profile: Object.assign(base.profile, saved.profile),
        preferences: Object.assign(base.preferences, saved.preferences),
      };
    } catch (error) {
      return base;
    }
  }

  function writeLocal(payload) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(new Error("Gagal membaca file.")); };
      reader.readAsDataURL(file);
    });
  }

  /* ---------- Validasi file foto ---------- */
  function checkPhoto(file) {
    if (!file) return "Pilih file gambar dulu.";
    if (file.type.indexOf("image/") !== 0) return "File harus berupa gambar.";
    if (file.size > MAX_PHOTO_BYTES) return "Ukuran gambar maksimal 2 MB.";
    return null;
  }

  /* ---------- Validasi form ---------- */
  function validate(profile) {
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!String(profile.fullName || "").trim()) {
      errors.fullName = "Nama wajib diisi.";
    }
    if (!String(profile.email || "").trim()) {
      errors.email = "Email wajib diisi.";
    } else if (!emailPattern.test(profile.email)) {
      errors.email = "Format email tidak valid.";
    }
    if (String(profile.bio || "").length > 600) {
      errors.bio = "Bio maksimal 600 karakter.";
    }
    return errors;
  }

  /* ---------- Fungsi publik ---------- */
  async function get() {
    if (Api.isLive()) return Api.settings.get();
    return readLocal();
  }

  async function save(payload) {
    if (Api.isLive()) return Api.settings.save(payload);
    writeLocal(payload);
    return payload;
  }

  async function uploadPhoto(file) {
    const problem = checkPhoto(file);
    if (problem) throw new Error(problem);

    if (Api.isLive()) return Api.settings.uploadPhoto(file);

    return { photoUrl: await fileToDataUrl(file) };
  }

  return { get: get, save: save, uploadPhoto: uploadPhoto, validate: validate };
})();
