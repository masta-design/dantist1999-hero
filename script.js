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
  const phonePrefix = "+7 ";
  const phoneMaxDigits = 10;
  const phoneDigitPositions = [3, 4, 5, 7, 8, 9, 11, 12, 14, 15];
  let phoneDigits = "";

  const getPhoneDigitsFromValue = (value) => {
    const digits = value.replace(/\D/g, "");

    if (digits.startsWith("7")) {
      return digits.slice(1, phoneMaxDigits + 1);
    }

    return digits.slice(0, phoneMaxDigits);
  };

  const formatPhone = () => {
    const mask = "___ ___-__-__".split("");
    let digitIndex = 0;

    mask.forEach((symbol, index) => {
      if (symbol === "_" && phoneDigits[digitIndex]) {
        mask[index] = phoneDigits[digitIndex];
        digitIndex += 1;
      } else if (symbol === "_") {
        digitIndex += 1;
      }
    });

    return phonePrefix + mask.join("");
  };

  const getPhoneCaretPosition = () => {
    if (phoneDigits.length === 0) {
      return phonePrefix.length;
    }

    return phoneDigitPositions[phoneDigits.length - 1] + 1;
  };

  const hasPhoneTail = () => phoneDigits.length > 0;

  const removeSelectedPhoneDigits = () => {
    const selectionStart = phoneInput.selectionStart || 0;
    const selectionEnd = phoneInput.selectionEnd || 0;

    if (selectionStart === selectionEnd) {
      return false;
    }

    const nextDigits = phoneDigits
      .split("")
      .filter((_, index) => {
        const digitPosition = phoneDigitPositions[index];
        return digitPosition < selectionStart || digitPosition >= selectionEnd;
      })
      .join("");

    phoneDigits = nextDigits;
    return true;
  };

  const setPhoneCaret = () => {
    if (document.activeElement !== phoneInput) {
      return;
    }

    const caretPosition = getPhoneCaretPosition();
    phoneInput.setSelectionRange(caretPosition, caretPosition);
  };

  const normalizePhone = () => {
    phoneDigits = getPhoneDigitsFromValue(phoneInput.value);
    phoneInput.value = formatPhone();
    setPhoneCaret();
    refreshPhoneFieldState();
  };

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

  const refreshPhoneFieldState = () => {
    if (phoneInput.getAttribute("aria-invalid") === "true") {
      setFieldState(phoneInput, hasPhoneTail());
    }
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

    if (!hasPhoneTail()) {
      triggerShake(phoneInput.closest(".dantist-hero__field"));
    }

    if (!consentInput.checked) {
      triggerShake(consentInput.closest(".dantist-hero__consent"));
    }
  };

  const sanitizePhone = () => {
    normalizePhone();
  };

  const validate = () => {
    const isNameValid = nameInput.value.trim().length > 0;
    const isPhoneValid = hasPhoneTail();
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
    normalizePhone();
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
        const isInputValid = input === phoneInput ? hasPhoneTail() : input.value.trim().length > 0;
        setFieldState(input, isInputValid);
      }
    });
  });

  normalizePhone();
  phoneInput.addEventListener("focus", setPhoneCaret);
  phoneInput.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.key === "Tab") {
      return;
    }

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      removeSelectedPhoneDigits();

      if (phoneDigits.length < phoneMaxDigits) {
        phoneDigits += event.key;
        phoneInput.value = formatPhone();
        setPhoneCaret();
        refreshPhoneFieldState();
      }

      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      if (!removeSelectedPhoneDigits()) {
        phoneDigits = phoneDigits.slice(0, -1);
      }
      phoneInput.value = formatPhone();
      setPhoneCaret();
      refreshPhoneFieldState();
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      removeSelectedPhoneDigits();
      phoneInput.value = formatPhone();
      setPhoneCaret();
      refreshPhoneFieldState();
    }
  });
  phoneInput.addEventListener("paste", (event) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text");
    phoneDigits = getPhoneDigitsFromValue(pastedText);
    phoneInput.value = formatPhone();
    setPhoneCaret();
    refreshPhoneFieldState();
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
