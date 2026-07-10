(function () {
  const root = document.documentElement;
  const hero = document.querySelector(".dantist-hero");
  const image = document.querySelector(".dantist-hero__image");
  const form = document.querySelector(".dantist-hero__form");

  if (hero && image && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const resetParallax = () => {
      root.style.setProperty("--parallax-x", "0");
      root.style.setProperty("--parallax-y", "0");
    };

    window.addEventListener("pointermove", (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;

      root.style.setProperty("--parallax-x", x.toFixed(4));
      root.style.setProperty("--parallax-y", y.toFixed(4));
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

    if (!validate()) {
      message.textContent = "Заполните имя, телефон и подтвердите согласие.";
      message.classList.add("is-error");
      return;
    }

    const phone = phoneInput.value.trim();
    message.textContent = `Ваша заявка отправлена! Мы перезвоним на номер ${phone} в самое ближайшее время.`;
    form.reset();
    setFieldState(nameInput, true);
    setFieldState(phoneInput, true);
    setConsentState(true);
  });

  [nameInput, phoneInput].forEach((input) => {
    const field = input.closest(".dantist-hero__field");
    field.classList.toggle("is-disabled", input.disabled);

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
})();
