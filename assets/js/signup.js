(function () {
  "use strict";

  const form = document.getElementById("signupForm");
  const alertBox = document.getElementById("signupAlert");
  const submitBtn = document.getElementById("signupSubmit");
  const FIELDS = ["name", "email", "password", "passwordConfirm", "terms"];

  form.querySelectorAll("[data-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      const input = document.getElementById(button.dataset.toggle);
      const hidden = input.type === "password";
      input.type = hidden ? "text" : "password";
      button.setAttribute(
        "aria-label",
        hidden ? "Sembunyikan password" : "Tampilkan password"
      );
    });
  });


  function setFieldError(name, message) {
    const input = form.elements[name];
    const slot = form.querySelector('[data-error-for="' + name + '"]');
    if (input.type !== "checkbox") {
      input.classList.toggle("is-invalid", Boolean(message));
    }
    if (slot) slot.textContent = message || "";
  }

  function clearErrors() {
    FIELDS.forEach(function (name) {
      setFieldError(name, "");
    });
    alertBox.hidden = true;
    alertBox.textContent = "";
  }

  function validate(values) {
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!values.name) {
      errors.name = "Nama wajib diisi.";
    } else if (values.name.length < 3) {
      errors.name = "Nama minimal 3 karakter.";
    }

    if (!values.email) {
      errors.email = "Email wajib diisi.";
    } else if (!emailPattern.test(values.email)) {
      errors.email = "Format email tidak valid.";
    }

    if (!values.password) {
      errors.password = "Password wajib diisi.";
    } else if (values.password.length < 8) {
      errors.password = "Password minimal 8 karakter.";
    }

    if (!values.passwordConfirm) {
      errors.passwordConfirm = "Konfirmasi password wajib diisi.";
    } else if (values.passwordConfirm !== values.password) {
      errors.passwordConfirm = "Konfirmasi password tidak sama.";
    }

    if (!values.terms) {
      errors.terms = "Kamu harus menyetujui Terms dan Privacy Policy.";
    }

    return errors;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearErrors();

    const values = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      password: form.elements.password.value,
      passwordConfirm: form.elements.passwordConfirm.value,
      terms: form.elements.terms.checked,
    };

    const errors = validate(values);
    const errorNames = Object.keys(errors);

    if (errorNames.length > 0) {
      errorNames.forEach(function (name) {
        setFieldError(name, errors[name]);
      });
      form.elements[errorNames[0]].focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    try {
      // TODO (langkah 4): ganti dengan Api.register(values)
      await new Promise(function (resolve) {
        setTimeout(resolve, 600);
      });

      window.location.href = "dashboard.html";
    } catch (error) {
      alertBox.textContent = "Gagal membuat akun. Coba lagi sebentar.";
      alertBox.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign Up";
    }
  });

  FIELDS.forEach(function (name) {
    const input = form.elements[name];
    const eventName = input.type === "checkbox" ? "change" : "input";
    input.addEventListener(eventName, function () {
      setFieldError(name, "");
    });
  });
})();
