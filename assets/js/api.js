/* ============================================================
   Satu-satunya tempat yang berbicara dengan backend.
   Ubah CONFIG.mode jadi "live" setelah backend siap.
   ============================================================ */
window.Api = (function () {
  "use strict";

  const CONFIG = {
    mode: "mock", // "mock" = data dummy di browser, "live" = backend asli
    baseUrl: "http://localhost:8000/api",
  };

  const TOKEN_KEY = "cvg.token";

  function isLive() {
    return CONFIG.mode === "live";
  }

  /* ---------- Token ---------- */
  function getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || "";
    } catch (error) {
      return "";
    }
  }

  function setToken(value) {
    try {
      if (value) localStorage.setItem(TOKEN_KEY, value);
      else localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      // localStorage bisa ditolak di mode privat
    }
  }

  /* ---------- Error ---------- */
  function ApiError(message, status, errors) {
    const error = new Error(message);
    error.name = "ApiError";
    error.status = status;
    error.errors = errors || null;
    return error;
  }

  /* ---------- Query string ---------- */
  function query(params) {
    const search = new URLSearchParams();
    Object.keys(params || {}).forEach(function (key) {
      const value = params[key];
      if (value !== "" && value !== null && value !== undefined) {
        search.set(key, value);
      }
    });
    const text = search.toString();
    return text ? "?" + text : "";
  }

  /* ---------- Inti: satu fungsi untuk semua request ---------- */
  async function request(path, options) {
    const opt = options || {};
    const headers = { Accept: "application/json" };
    let body;

    if (opt.body instanceof FormData) {
      // Content-Type diisi otomatis oleh browser beserta boundary-nya
      body = opt.body;
    } else if (opt.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(opt.body);
    }

    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;

    let response;
    try {
      response = await fetch(CONFIG.baseUrl + path, {
        method: opt.method || "GET",
        headers: headers,
        body: body,
      });
    } catch (error) {
      // Gagal sebelum server menjawab: offline, CORS, atau server mati
      throw ApiError("Tidak bisa menghubungi server.", 0, null);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (error) {
        throw ApiError("Respons server bukan JSON.", response.status, null);
      }
    }

    if (!response.ok) {
      if (response.status === 401) setToken("");
      throw ApiError(
        (data && data.message) || "Permintaan gagal (" + response.status + ").",
        response.status,
        data && data.errors
      );
    }

    // Laravel API Resource membungkus hasil di dalam { "data": ... }
    if (data && typeof data === "object" && "data" in data && !Array.isArray(data)) {
      return data.data;
    }
    return data;
  }

  /* ============================================================
     Daftar endpoint
     ============================================================ */
  const auth = {
    async register(payload) {
      const result = await request("/auth/register", {
        method: "POST",
        body: {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          password_confirmation: payload.passwordConfirm,
        },
      });
      if (result && result.token) setToken(result.token);
      return result;
    },

    async login(payload) {
      const result = await request("/auth/login", {
        method: "POST",
        body: { email: payload.email, password: payload.password },
      });
      if (result && result.token) setToken(result.token);
      return result;
    },

    async logout() {
      try {
        await request("/auth/logout", { method: "POST" });
      } finally {
        setToken("");
      }
    },

    me() {
      return request("/auth/me");
    },

    isLoggedIn() {
      return Boolean(getToken());
    },
  };

  const cv = {
    get() {
      return request("/cv");
    },
    save(data) {
      return request("/cv", { method: "PUT", body: data });
    },
  };

  const dashboard = {
    get() {
      return request("/dashboard");
    },
  };

  const jobs = {
    filters() {
      return request("/jobs/filters");
    },
    list(params) {
      const f = params || {};
      return request("/jobs" + query({
        location: f.location,
        experience: f.experience,
        job_type: f.jobType,
        q: f.q,
      }));
    },
    get(id) {
      return request("/jobs/" + encodeURIComponent(id));
    },
    analyze(id) {
      return request("/jobs/" + encodeURIComponent(id) + "/analyze", { method: "POST" });
    },
    suggestions(id) {
      return request("/jobs/" + encodeURIComponent(id) + "/suggestions", { method: "POST" });
    },
  };

  const companies = {
    filters() {
      return request("/companies/filters");
    },
    list(params) {
      const f = params || {};
      return request("/companies" + query({
        industry: f.industry,
        location: f.location,
        size: f.size,
        q: f.q,
      }));
    },
    get(id) {
      return request("/companies/" + encodeURIComponent(id));
    },
  };

  const settings = {
    get() {
      return request("/settings");
    },
    save(payload) {
      return request("/settings", { method: "PUT", body: payload });
    },
    uploadPhoto(file) {
      const form = new FormData();
      form.append("photo", file);
      return request("/settings/photo", { method: "POST", body: form });
    },
  };

  return {
    isLive: isLive,
    request: request,
    getToken: getToken,
    setToken: setToken,
    auth: auth,
    cv: cv,
    dashboard: dashboard,
    jobs: jobs,
    companies: companies,
    settings: settings,
    CONFIG: CONFIG,
  };
})();
