/* ============================================================
   Sumber data job (DUMMY).
   Bentuk objek = kontrak JSON yang akan diminta ke backend.
   Nanti isi fungsi list/get/analyze/filters diganti fetch().
   ============================================================ */
window.JobsData = (function () {
  "use strict";

  const LATENCY = 300;

  const JOBS = [
    {
      id: "tokopedia-uiux-designer",
      title: "UI/UX Designer",
      company: {
        name: "Tokopedia",
        logo: "assets/img/tokopedia.jpg",
        brandColor: "#03ac0e",
        about: [
          "Tokopedia is an Indonesian technology company founded in 2009 with a mission to democratize commerce through technology. Tokopedia connects consumers and merchants across Indonesia through its e-commerce platform, helping businesses of different sizes reach a wider market.",
          "As part of the GoTo ecosystem, Tokopedia provides e-commerce services including marketplace, Official Stores, instant commerce, interactive commerce, and rural commerce.",
        ],
      },
      location: "Jakarta",
      workMode: "Hybrid",
      employmentType: "Full-time",
      experienceLevel: "Entry Level",
      salary: { min: 7000000, max: 9000000 },
      matchScore: 92,
      skills: ["Figma", "UI Design", "User Research"],
      description: [
        "Tokopedia is looking for a creative and user-focused UI/UX Designer to design simple, intuitive, and engaging digital experiences for millions of users. The role involves understanding user needs, creating user flows and wireframes, developing UI designs and prototypes, and collaborating with Product Managers and Engineers to deliver effective product solutions.",
      ],
      requirements: [
        "Strong understanding of UI/UX design principles and user-centered design.",
        "Proficient in Figma and prototyping tools.",
        "Experience creating wireframes, user flows, and high-fidelity interfaces.",
        "Good understanding of usability and visual hierarchy.",
        "Able to conduct or interpret user research and usability testing.",
        "Strong problem-solving and communication skills.",
        "Able to collaborate effectively with cross-functional teams.",
        "Portfolio demonstrating relevant UI/UX projects is preferred.",
      ],
      analysis: {
        breakdown: { skills: 95, experience: 83, education: 90 },
        matchedSkills: ["Figma", "Prototyping", "User Research", "UI Design"],
        missingSkills: ["Design System", "Usability Testing"],
      },
    },
    {
      id: "traveloka-product-designer",
      title: "Product Designer",
      company: {
        name: "Traveloka",
        logo: "assets/img/traveloka.jpg",
        brandColor: "#1ba0e2",
        about: [
          "Traveloka is a Southeast Asian travel platform that helps people book flights, hotels, and activities in one app.",
        ],
      },
      location: "Jakarta",
      workMode: "On-site",
      employmentType: "Full-time",
      experienceLevel: "Mid Level",
      salary: { min: 9000000, max: 11000000 },
      matchScore: 92,
      skills: ["Figma", "UI Design", "User Research"],
      description: [
        "Design end-to-end product experiences for travel booking, from discovery to payment, together with product and engineering teams.",
      ],
      requirements: [
        "Experience designing digital products from research to final UI.",
        "Proficient in Figma and building interactive prototypes.",
        "Comfortable using data and research to make design decisions.",
        "Good communication and presentation skills.",
      ],
      analysis: {
        breakdown: { skills: 94, experience: 80, education: 92 },
        matchedSkills: ["Figma", "Prototyping", "UI Design", "User Research"],
        missingSkills: ["Product Thinking", "A/B Testing"],
      },
    },
    {
      id: "shopee-uiux-designer",
      title: "UI/UX Designer",
      company: {
        name: "Shopee",
        logo: "assets/img/shopee.jpg",
        brandColor: "#ee4d2d",
        about: [
          "Shopee is an e-commerce platform in Southeast Asia and Taiwan that offers a simple and secure shopping experience.",
        ],
      },
      location: "Jakarta",
      workMode: "Hybrid",
      employmentType: "Full-time",
      experienceLevel: "Entry Level",
      salary: { min: 6000000, max: 9000000 },
      matchScore: 88,
      skills: ["Figma", "UI Design", "User Research"],
      description: [
        "Create user-friendly interfaces for Shopee features used by millions of buyers and sellers every day.",
      ],
      requirements: [
        "Understanding of UI/UX principles and mobile design patterns.",
        "Proficient in Figma.",
        "Able to turn feedback into design improvements quickly.",
        "Portfolio of UI/UX projects.",
      ],
      analysis: {
        breakdown: { skills: 90, experience: 78, education: 90 },
        matchedSkills: ["Figma", "UI Design", "Prototyping"],
        missingSkills: ["Motion Design", "Design System"],
      },
    },
    {
      id: "tiket-ux-researcher",
      title: "UX Researcher",
      company: {
        name: "tiket.com",
        logo: "assets/img/tiket.jpg",
        brandColor: "#0064d2",
        about: [
          "tiket.com is an Indonesian online travel agent for flights, hotels, trains, and entertainment tickets.",
        ],
      },
      location: "Jakarta",
      workMode: "On-site",
      employmentType: "Contract",
      experienceLevel: "Junior Level",
      salary: { min: 7000000, max: 9000000 },
      matchScore: 81,
      skills: ["Figma", "UI Design", "User Research"],
      description: [
        "Plan and run user research to help product teams understand traveler needs and pain points.",
      ],
      requirements: [
        "Experience conducting interviews and usability testing.",
        "Able to summarize research findings into clear insights.",
        "Basic understanding of UI design and Figma.",
        "Good written and verbal communication.",
      ],
      analysis: {
        breakdown: { skills: 78, experience: 80, education: 88 },
        matchedSkills: ["User Research", "Figma"],
        missingSkills: ["Usability Testing", "Survey Design", "Data Analysis"],
      },
    },
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function respond(value) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(clone(value));
      }, LATENCY);
    });
  }

  function notFound() {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        const error = new Error("Job not found");
        error.status = 404;
        reject(error);
      }, LATENCY);
    });
  }

  function find(id) {
    return JOBS.find(function (job) {
      return job.id === id;
    });
  }

  function unique(key) {
    return JOBS.map(function (job) { return job[key]; })
      .filter(function (value, i, all) { return value && all.indexOf(value) === i; });
  }

  /* Versi ringkas untuk daftar: tanpa teks panjang */
  function summary(job) {
    return {
      id: job.id,
      title: job.title,
      company: {
        name: job.company.name,
        logo: job.company.logo,
        brandColor: job.company.brandColor,
      },
      location: job.location,
      workMode: job.workMode,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      salary: job.salary,
      matchScore: job.matchScore,
      skills: job.skills,
    };
  }

  function matchesFilter(job, f) {
    if (f.location && job.location !== f.location) return false;
    if (f.experience && job.experienceLevel !== f.experience) return false;
    if (f.jobType && job.employmentType !== f.jobType) return false;

    if (f.q) {
      const haystack = [job.title, job.company.name]
        .concat(job.skills)
        .join(" ")
        .toLowerCase();
      if (haystack.indexOf(f.q.toLowerCase()) === -1) return false;
    }
    return true;
  }

  function filters() {
    return respond({
      locations: unique("location"),
      experienceLevels: unique("experienceLevel"),
      employmentTypes: unique("employmentType"),
    });
  }

  function list(params) {
    const f = params || {};
    const result = JOBS.filter(function (job) { return matchesFilter(job, f); })
      .sort(function (a, b) { return b.matchScore - a.matchScore; })
      .map(summary);
    return respond(result);
  }

  function get(id) {
    const job = find(id);
    if (!job) return notFound();

    const detail = clone(job);
    delete detail.analysis;
    return respond(detail);
  }

  function analyze(id) {
    const job = find(id);
    if (!job) return notFound();

    return respond({
      job: summary(job),
      overall: job.matchScore,
      breakdown: job.analysis.breakdown,
      matchedSkills: job.analysis.matchedSkills,
      missingSkills: job.analysis.missingSkills,
    });
  }

  return { filters: filters, list: list, get: get, analyze: analyze };
})();
