/* ============================================================
   Sumber data company (DUMMY).
   Bentuk objek = kontrak JSON yang akan diminta ke backend.
   whyRecommended nanti diisi AI berdasarkan isi CV user.
   ============================================================ */
window.CompaniesData = (function () {
  "use strict";

  const LATENCY = 300;

  const COMPANIES = [
    {
      id: "tokopedia",
      jobId:"tokopedia-uiux-designer",
      name: "Tokopedia",
      logo: "assets/img/tokopedia.jpg",
      brandColor: "#03ac0e",
      sector: "E-commerce",
      industry: "E-commerce",
      location: "Jakarta",
      size: "1000+ employees",
      website: "tokopedia.com",
      profileMatch: 94,
      whyRecommended: [
        "Matches your industry interest",
        "Relevant job opportunities",
        "Skills match your profile",
      ],
      about: [
        "Tokopedia is an Indonesian technology company founded in 2009 with a mission to democratize commerce through technology. Tokopedia connects consumers and merchants across Indonesia through its e-commerce platform, helping businesses of different sizes reach a wider market.",
        "As part of the GoTo ecosystem, Tokopedia provides e-commerce services including marketplace, Official Stores, instant commerce, interactive commerce, and rural commerce.",
      ],
    },
    {
      id: "traveloka",
      jobId:"traveloka-product-designer",
      name: "Traveloka",
      logo: "assets/img/traveloka.jpg",
      brandColor: "#1ba0e2",
      sector: "Technology",
      industry: "Travel",
      location: "Jakarta",
      size: "1000+ employees",
      website: "traveloka.com",
      profileMatch: 91,
      whyRecommended: [
        "Matches your industry interest",
        "Relevant job opportunities",
        "Skills match your profile",
      ],
      about: [
        "Traveloka is a Southeast Asian travel platform that helps people book flights, hotels, and activities in one app.",
        "The company builds products for millions of travelers across the region, with a strong focus on mobile experience and user research.",
      ],
    },
    {
      id: "gojek",
      jobId:"gojek-ui-designer",
      name: "Gojek",
      logo: "assets/img/gojek.jpg",
      brandColor: "#00aa13",
      sector: "Technology",
      industry: "Transportation",
      location: "Jakarta",
      size: "1000+ employees",
      website: "gojek.com",
      profileMatch: 84,
      whyRecommended: [
        "Matches your industry interest",
        "Relevant job opportunities",
        "Skills match your profile",
      ],
      about: [
        "Gojek is an on-demand multi-service platform offering ride-hailing, food delivery, and payment services across Southeast Asia.",
        "Together with Tokopedia, Gojek forms the GoTo Group, the largest technology group in Indonesia.",
      ],
    },
    {
      id: "shopee",
      jobId:"shopee-uiux-designer",
      name: "Shopee",
      logo: "assets/img/shopee.jpg",
      brandColor: "#ee4d2d",
      sector: "E-commerce",
      industry: "Retail",
      location: "Jakarta",
      size: "1000+ employees",
      website: "shopee.co.id",
      profileMatch: 82,
      whyRecommended: [
        "Relevant job opportunities",
        "Skills match your profile",
      ],
      about: [
        "Shopee is an e-commerce platform in Southeast Asia and Taiwan that offers a simple and secure shopping experience.",
      ],
    },
    {
      id: "tiket",
      jobId:"tiket-ux-researcher",
      name: "tiket.com",
      logo: "assets/img/tiket.jpg",
      brandColor: "#0064d2",
      sector: "Technology",
      industry: "Travel",
      location: "Jakarta",
      size: "501-1000 employees",
      website: "tiket.com",
      profileMatch: 78,
      whyRecommended: ["Relevant job opportunities"],
      about: [
        "tiket.com is an Indonesian online travel agent for flights, hotels, trains, and entertainment tickets.",
      ],
    },
  ];

  /* ---------- Helper ---------- */
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
        const error = new Error("Company not found");
        error.status = 404;
        reject(error);
      }, LATENCY);
    });
  }

  function unique(values) {
    return values.filter(function (value, i, all) {
      return value && all.indexOf(value) === i;
    });
  }

  /* Versi ringkas untuk daftar: tanpa teks about yang panjang */
  function summary(company) {
    const item = clone(company);
    delete item.about;
    return item;
  }

  function matchesFilter(company, f) {
    if (f.industry && company.industry !== f.industry) return false;
    if (f.location && company.location !== f.location) return false;
    if (f.size && company.size !== f.size) return false;

    if (f.q) {
      const haystack = [company.name, company.sector, company.industry]
        .join(" ")
        .toLowerCase();
      if (haystack.indexOf(f.q.toLowerCase()) === -1) return false;
    }
    return true;
  }

  /* ---------- Fungsi publik ---------- */
  function filters() {
    if (Api.isLive()) return Api.companies.filters();
    return respond({
      industries: unique(COMPANIES.map(function (c) { return c.industry; })),
      locations: unique(COMPANIES.map(function (c) { return c.location; })),
      sizes: unique(COMPANIES.map(function (c) { return c.size; })),
    });
  }

  function list(params) {
    if (Api.isLive()) return Api.companies.list(params);
    const f = params || {};
    const result = COMPANIES.filter(function (c) { return matchesFilter(c, f); })
      .sort(function (a, b) { return b.profileMatch - a.profileMatch; })
      .map(summary);
    return respond(result);
  }

  function get(id) {
    if (Api.isLive()) return Api.companies.get(id);
    const company = COMPANIES.find(function (c) { return c.id === id; });
    return company ? respond(company) : notFound();
  }

  return { filters: filters, list: list, get: get };
})();
