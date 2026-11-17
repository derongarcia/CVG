/* ============================================================
   Sumber data CV.
   Sekarang: localStorage. Nanti: API backend.
   Bentuk objek di bawah ini adalah kontrak JSON yang akan
   kita minta ke tim backend, jadi jangan diubah sembarangan.
   ============================================================ */
window.CvStore = (function () {
  "use strict";

  const STORAGE_KEY = "cvg.cv";

  const sample = {
    template: "creative",
    personal: {
      fullName: "Alexandra",
      headline: "UI/UX Designer",
      email: "alexandra@gmail.com",
      phone: "+62 812 3456 7890",
      location: "Jakarta, Indonesia",
      linkedin: "linkedin.com/alexandra",
      photo: "assets/img/avatar.jpg",
      summary:
        "Undergraduate Student of Computer Science at BINUS University with a strong interest in UI/UX Design. Passionate about creating user centered digital experiences and always love to learn new technologies.",
    },
    education: [
      {
        institution: "BINUS University",
        degree: "Bachelor's Degree",
        field: "Computer Science",
        startDate: "2024-09",
        endDate: "2028-06",
        gpa: "3.85",
      },
    ],
    experience: [
      {
        company: "HIMTI BINUS University",
        position: "Creative and Design Division",
        employmentType: "Seasonal",
        startDate: "2024-09",
        endDate: "2025-06",
        location: "Jakarta, Indonesia",
        description:
          "Contributed to the creative and design team by creating visual content for organizational events and social media. Collaborated with team members to develop designs that aligned with event concepts and HIMTI's visual identity.",
      },
    ],
    skills: [
      "Figma",
      "UI/UX Design",
      "Prototyping",
      "User Research",
      "HTML",
      "CSS",
      "JavaScript",
      "MySQL",
    ],
    languages: [
      { language: "English", proficiency: "Professional" },
      { language: "Indonesian", proficiency: "Native" },
    ],
    projects: [
      {
        name: "Trip Genie",
        position: "UI/UX Designer",
        description:
          "Designed the UI/UX for a travel application that recommends hotels and activities in a chosen area.",
        tools: ["Figma", "User Research", "Prototyping"],
        link: "",
      },
    ],
    certifications: [
      {
        name: "UI/UX Design Certificate",
        organization: "Google",
        issueDate: "2024-03",
        credential: "",
      },
    ],
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(sample);
      // Gabung dengan sample agar field baru tidak bikin error
      return Object.assign(clone(sample), JSON.parse(raw));
    } catch (error) {
      console.warn("Data CV rusak, memakai data contoh.", error);
      return clone(sample);
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function patch(partial) {
    const data = Object.assign(load(), partial);
    save(data);
    return data;
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return { load, save, patch, reset, sample: clone(sample), STORAGE_KEY };
})();
