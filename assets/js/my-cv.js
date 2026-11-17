(function () {
  "use strict";

  const previewEl = document.getElementById("cvPreview");
  const tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  const downloadBtn = document.getElementById("downloadBtn");

  let data = CvStore.load();
  let template = data.template || "creative";

  function draw() {
    previewEl.innerHTML = CvRender.render(data, template);
  }

  function setTemplate(next) {
    template = next;

    tabs.forEach(function (tab) {
      const active = tab.dataset.template === next;
      tab.classList.toggle("tab--active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    // Pilihan template ikut tersimpan, jadi tetap sama saat halaman dibuka lagi
    data = CvStore.patch({ template: next });
    draw();
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      setTemplate(tab.dataset.template);
    });
  });

  // Sementara pakai dialog print browser (bisa "Save as PDF").
  // Nanti bisa diganti endpoint backend yang menghasilkan PDF.
  downloadBtn.addEventListener("click", function () {
    window.print();
  });

  setTemplate(template);
})();
