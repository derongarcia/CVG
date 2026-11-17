(function () {
  "use strict";

  const form = document.getElementById("loginForm");
  const alertBox = document.getElementById("loginAlert");
  const submitBtn = document.getElementById("loginSubmit");
  const toggleBtn = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  toggleBtn.addEventListener("click", function () {
    const hidden = passwordInput.type === "password";
    passwordInput.type = hidden ? "text" : "password";
    toggleBtn.setAttribute(
      "aria-label",
      hidden ? "Sembunyikan password" : "Tampilkan password"
    );
  });

  function setFieldError(name, message) {
    const input = form.elements[name];
    const slot = form.querySelector('[data-error-for="' + name + '"]');
    input.classList.toggle("is-invalid", Boolean(message));
    slot.textContent = message || "";
  }

  function clearErrors() {
    ["email", "password"].forEach(function (name) {
      setFieldError(name, "");
    });
    alertBox.hidden = true;
    alertBox.textContent = "";
  }

  function validate(values) {
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    return errors;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearErrors();

    const values = {
      email: form.elements.email.value.trim(),
      password: form.elements.password.value,
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
    submitBtn.textContent = "Logging in...";

    try {
      // TODO (langkah 4): ganti blok ini dengan Api.login(values)
      // yang memanggil endpoint backend dan membaca respons JSON-nya.
      await new Promise(function (resolve) {
        setTimeout(resolve, 600);
      });

      window.location.href = "dashboard.html";
    } catch (error) {
      alertBox.textContent = "Gagal masuk. Coba lagi sebentar.";
      alertBox.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Log in";
    }
  });

  ["email", "password"].forEach(function (name) {
    form.elements[name].addEventListener("input", function () {
      setFieldError(name, "");
    });
  });
})();
