(function () {
  const hero = document.querySelector(".dantist-hero");
  const image = document.querySelector(".dantist-hero__image");
  const form = document.querySelector(".dantist-hero__form");

  if (hero && image && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const resetParallax = () => {
      hero.style.setProperty("--parallax-x", "0");
      hero.style.setProperty("--parallax-y", "0");
    };

    window.addEventListener("pointermove", (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;

      hero.style.setProperty("--parallax-x", x.toFixed(4));
      hero.style.setProperty("--parallax-y", y.toFixed(4));
    });

    window.addEventListener("pointerleave", resetParallax);
    window.addEventListener("blur", resetParallax);
  }

  if (!form) {
    return;
  }

  const nameInput = form.querySelector('input[name="name"]');
  const phoneInput = form.querySelector('input[name="phone"]');
  const consentInput = form.querySelector('input[name="consent"]');
  const message = form.querySelector(".dantist-hero__message");
  const success = hero.querySelector(".dantist-hero__success");
  const successPhone = hero.querySelector("[data-success-phone]");
  const successButton = hero.querySelector(".dantist-hero__success-button");

  const setFieldState = (input, isValid) => {
    const field = input.closest(".dantist-hero__field");
    field.classList.toggle("is-invalid", !isValid);
    input.setAttribute("aria-invalid", String(!isValid));
  };

  const setConsentState = (isValid) => {
    const consent = consentInput.closest(".dantist-hero__consent");
    consent.classList.toggle("is-invalid", !isValid);
    consentInput.setAttribute("aria-invalid", String(!isValid));
  };

  const triggerShake = (element) => {
    element.classList.remove("is-shaking");
    void element.offsetWidth;
    element.classList.add("is-shaking");
  };

  const shakeInvalidControls = () => {
    if (nameInput.value.trim().length === 0) {
      triggerShake(nameInput.closest(".dantist-hero__field"));
    }

    if (phoneInput.value.trim().length === 0) {
      triggerShake(phoneInput.closest(".dantist-hero__field"));
    }

    if (!consentInput.checked) {
      triggerShake(consentInput.closest(".dantist-hero__consent"));
    }
  };

  const sanitizePhone = () => {
    phoneInput.value = phoneInput.value.replace(/[^0-9+\s()-]/g, "");
  };

  const validate = () => {
    const isNameValid = nameInput.value.trim().length > 0;
    const isPhoneValid = phoneInput.value.trim().length > 0;
    const isConsentValid = consentInput.checked;

    setFieldState(nameInput, isNameValid);
    setFieldState(phoneInput, isPhoneValid);
    setConsentState(isConsentValid);

    return isNameValid && isPhoneValid && isConsentValid;
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.classList.remove("is-error");
    message.textContent = "";

    if (!validate()) {
      message.textContent = "Заполните имя, телефон и подтвердите согласие.";
      message.classList.add("is-error");
      shakeInvalidControls();
      return;
    }

    const phone = phoneInput.value.trim();
    successPhone.textContent = phone;
    hero.classList.add("is-submitted");
    success.setAttribute("aria-hidden", "false");
    form.reset();
    setFieldState(nameInput, true);
    setFieldState(phoneInput, true);
    setConsentState(true);
  });

  successButton.addEventListener("click", () => {
    hero.classList.remove("is-submitted");
    success.setAttribute("aria-hidden", "true");
    message.textContent = "";
    message.classList.remove("is-error");
    setFieldState(nameInput, true);
    setFieldState(phoneInput, true);
    setConsentState(true);
  });

  [nameInput, phoneInput].forEach((input) => {
    const field = input.closest(".dantist-hero__field");
    field.classList.toggle("is-disabled", input.disabled);

    field.addEventListener("animationend", () => {
      field.classList.remove("is-shaking");
    });

    input.addEventListener("focus", () => {
      field.classList.add("is-focused");
    });

    input.addEventListener("blur", () => {
      field.classList.remove("is-focused");
    });

    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true") {
        setFieldState(input, input.value.trim().length > 0);
      }
    });
  });

  phoneInput.addEventListener("input", sanitizePhone);

  consentInput.addEventListener("change", () => {
    if (consentInput.getAttribute("aria-invalid") === "true") {
      setConsentState(consentInput.checked);
    }
  });

  consentInput.closest(".dantist-hero__consent").addEventListener("animationend", (event) => {
    if (event.target.classList.contains("dantist-hero__checkbox")) {
      consentInput.closest(".dantist-hero__consent").classList.remove("is-shaking");
    }
  });
})();
