/* ============================================================
   Saran personalisasi CV (DUMMY).
   Sekarang dihitung di browser dari CV user + hasil analisis job.
   Nanti diganti: POST /api/personalize/{jobId}/suggestions
   yang dikerjakan AI di backend.
   ============================================================ */
window.PersonalizeData = (function () {
  "use strict";

  const SESSION_KEY = "cvg.personalize";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function same(a, b) {
    return String(a).toLowerCase() === String(b).toLowerCase();
  }

  function isRelevant(skill, relevantList) {
    return relevantList.some(function (r) {
      const x = String(skill).toLowerCase();
      const y = String(r).toLowerCase();
      return x.indexOf(y) !== -1 || y.indexOf(x) !== -1;
    });
  }

  /* ---------- Menyusun teks summary usulan ---------- */
  function buildSummary(cv, job, matched) {
    const current = (cv.personal && cv.personal.summary) || "";
    const top = matched.slice(0, 3);

    const suggested = [
      (cv.personal && cv.personal.headline) || "Professional",
      "with hands-on experience in " + (top.length ? top.join(", ") : job.title) + ".",
      "Focused on " + job.title.toLowerCase() + " work and user centered research.",
    ].join(" ");

    return { current: current, suggested: suggested };
  }

  /* ---------- Daftar saran yang bisa dicentang ---------- */
  function buildOptions(cv, matched, missing) {
    const options = [
      {
        id: "useSummary",
        group: "summary",
        label: "Use the suggested professional summary",
        checked: true,
      },
      {
        id: "highlightProjects",
        group: "experience",
        label: "Highlight " + (matched[0] || "relevant") + " projects",
        checked: true,
      },
      {
        id: "reorderExperience",
        group: "experience",
        label: "More relevant experience higher",
        checked: false,
      },
    ];

    // Satu opsi per skill yang kurang, menurut hasil analisis
    missing.forEach(function (skill) {
      options.push({
        id: "addSkill:" + skill,
        group: "experience",
        label: "Add " + skill,
        checked: false,
      });
    });

    return options;
  }

  /* ---------- Before / After skills ---------- */
  function buildSkills(cv, relevant) {
    const before = (cv.skills || []).slice();
    const keep = before.filter(function (s) { return isRelevant(s, relevant); });
    const drop = before.filter(function (s) { return !isRelevant(s, relevant); });

    return {
      before: before,
      after: keep
        .map(function (s) { return { name: s, keep: true }; })
        .concat(drop.map(function (s) { return { name: s, keep: false }; })),
    };
  }

  /* ---------- Insights ---------- */
  function completeness(cv) {
    const p = cv.personal || {};
    const checks = [
      p.fullName, p.headline, p.email, p.phone, p.location, p.linkedin, p.summary,
      (cv.education || []).length,
      (cv.experience || []).length,
      (cv.skills || []).length,
      (cv.projects || []).length,
      (cv.certifications || []).length,
    ];
    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  }

  /* ---------- Fungsi utama ---------- */
  async function get(jobId) {
    if (Api.isLive()) return Api.jobs.suggestions(jobId);
    const analysis = await JobsData.analyze(jobId);
    const cv = CvStore.load();

    const matched = analysis.matchedSkills || [];
    const missing = analysis.missingSkills || [];
    const relevant = matched.concat(analysis.job.skills || []);

    return {
      job: analysis.job,
      summary: buildSummary(cv, analysis.job, matched),
      options: buildOptions(cv, matched, missing),
      skills: buildSkills(cv, relevant),
      insights: {
        jobMatch: analysis.overall,
        // TODO: dua angka ini harus dihitung AI di backend
        atsCompatibility: 89,
        completeness: completeness(cv),
      },
    };
  }

  function applyToCv(data, choices) {
    const cv = clone(CvStore.load());
    const picked = choices || [];

    function has(id) {
      return picked.indexOf(id) !== -1;
    }

    if (has("useSummary")) {
      cv.personal = cv.personal || {};
      cv.personal.summary = data.summary.suggested;
    }

    cv.skills = data.skills.after
      .filter(function (s) { return s.keep; })
      .map(function (s) { return s.name; });

    // Opsi "Add <skill>" yang dicentang
    picked.forEach(function (id) {
      if (id.indexOf("addSkill:") !== 0) return;
      const skill = id.slice("addSkill:".length);
      const exists = cv.skills.some(function (s) { return same(s, skill); });
      if (!exists) cv.skills.push(skill);
    });

    const relevant = (data.job.skills || []).concat(
      data.skills.after.filter(function (s) { return s.keep; }).map(function (s) { return s.name; })
    );

    function score(text) {
      const haystack = String(text || "").toLowerCase();
      return relevant.filter(function (r) {
        return haystack.indexOf(String(r).toLowerCase()) !== -1;
      }).length;
    }

    if (has("highlightProjects")) {
      cv.projects = (cv.projects || []).slice().sort(function (a, b) {
        return score([b.name, b.position, b.description].concat(b.tools || []).join(" ")) -
               score([a.name, a.position, a.description].concat(a.tools || []).join(" "));
      });
    }

    if (has("reorderExperience")) {
      cv.experience = (cv.experience || []).slice().sort(function (a, b) {
        return score([b.position, b.company, b.description].join(" ")) -
               score([a.position, a.company, a.description].join(" "));
      });
    }

    return cv;
  }

  /* ============================================================
     Pilihan user disimpan per job di sessionStorage.
     Hilang saat tab ditutup, dan tidak menyentuh CV master.
     ============================================================ */
  function saveChoices(jobId, choices) {
    try {
      sessionStorage.setItem(SESSION_KEY + "." + jobId, JSON.stringify(choices));
    } catch (error) {
      console.warn("Tidak bisa menyimpan pilihan.", error);
    }
  }

  function loadChoices(jobId) {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY + "." + jobId);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  return {
    get: get,
    applyToCv: applyToCv,
    saveChoices: saveChoices,
    loadChoices: loadChoices,
  };
})();
