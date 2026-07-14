export function customDropdown() {
  const dropdowns = document.querySelectorAll(
    ".dropdown-custom, .dropdown-custom-select",
  );
  if (!dropdowns.length) return;
  dropdowns.forEach((dropdown) => {
    const btnDropdown = dropdown.querySelector(".dropdown-custom-btn");
    const dropdownMenu = dropdown.querySelector(".dropdown-custom-menu");
    const dropdownItems = dropdown.querySelectorAll(".dropdown-custom-item");
    const valueSelect = dropdown.querySelector(".value-select");
    const displayText = dropdown.querySelector(".dropdown-custom-text");

    const isSelectType = dropdown.classList.contains("dropdown-custom-select");

    btnDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
      closeAllDropdowns(dropdown);
      dropdownMenu.classList.toggle("dropdown--active");
      btnDropdown.classList.toggle("--active");
    });

    document.addEventListener("click", function () {
      closeAllDropdowns();
    });

    dropdownItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        e.stopPropagation();

        if (isSelectType) {
          const optionText = item.textContent;
          const input = dropdown.querySelector("input[type='hidden']");
          displayText.textContent = optionText;
          if (input) input.value = optionText.trim();
          dropdown.classList.add("selected");
        } else {
          const currentImgEl = valueSelect.querySelector("img");
          const currentImg = currentImgEl ? currentImgEl.src : "";
          const currentText = valueSelect.querySelector("span").textContent;
          const clickedHtml = item.innerHTML;

          valueSelect.innerHTML = clickedHtml;

          const isSelectTime = currentText.trim() === "Time";

          if (!isSelectTime) {
            if (currentImg) {
              item.innerHTML = `<span>${currentText}</span><img src="${currentImg}" alt="" />`;
            } else {
              item.innerHTML = `<span>${currentText}</span>`;
            }
          }
        }

        closeAllDropdowns();
      });
    });

    window.addEventListener("scroll", function () {
      if (dropdownMenu.closest(".header-lang")) {
        dropdownMenu.classList.remove("dropdown--active");
        btnDropdown.classList.remove("--active");
      }
    });
  });

  function closeAllDropdowns(exception) {
    dropdowns.forEach((dropdown) => {
      const menu = dropdown.querySelector(".dropdown-custom-menu");
      const btn = dropdown.querySelector(".dropdown-custom-btn");

      if (!exception || dropdown !== exception) {
        menu.classList.remove("dropdown--active");
        btn.classList.remove("--active");
      }
    });
  }
}
export function headerScroll() {
  const header = document.getElementById("header");
  if (!header) return null;

  const THRESHOLD = 10; // px, gần đầu trang thì remove luôn

  const trigger = ScrollTrigger.create({
    start: "top top",
    end: 9999,
    onUpdate: (self) => {
      const currentScroll = self.scroll();

      if (currentScroll <= THRESHOLD) {
        header.classList.remove("scrolled");
      } else if (self.direction === 1) {
        // scrolling down
        header.classList.add("scrolled");
      }
    },
  });

  return trigger;
}

/////// thêm class select-tab vào thì vẫn filter theo đúng type đó, không show hết item.
export function createFilterTab() {
  document.querySelectorAll(".filter-section").forEach((section) => {
    let result;

    const targetSelector = section.dataset.target;
    if (targetSelector) {
      result = document.querySelector(targetSelector);
    } else {
      result = section.querySelector(".filter-section-result");
      if (!result) {
        result = section.nextElementSibling;
        if (!result?.classList.contains("filter-section-result")) return;
      }
    }

    if (!result) return;
    //check select tab
    const isSelectTab = section.classList.contains("select-tab");
    const buttons = section.querySelectorAll(".filter-button[data-type]");

    const activeBtn = section.querySelector(".filter-button.active");
    if (activeBtn) {
      const activeType = activeBtn.dataset.type;
      if (activeType !== "all") {
        result.querySelectorAll(".filter-item").forEach((item) => {
          item.style.display = item.classList.contains(activeType)
            ? ""
            : "none";
        });
      }
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", function () {
        section
          .querySelectorAll(".filter-button")
          .forEach((b) => b.classList.remove("active"));
        this.classList.add("active");

        const type = this.dataset.type;
        const items = result.querySelectorAll(".filter-item");

        gsap
          .timeline()
          .to(result, { autoAlpha: 0, duration: 0.3 })
          .call(() => {
            items.forEach((item) => {
              // Nếu là select-tab thì không có trường hợp "all" → luôn filter theo type
              if (!isSelectTab && type === "all") {
                item.style.display = "";
              } else {
                item.style.display = item.classList.contains(type)
                  ? ""
                  : "none";
              }
            });
          })
          .to(result, { autoAlpha: 1, duration: 0.3 });
      });
    });
  });
}

export function getDateLightPick() {
  var picker = new Lightpick({
    field: document.getElementById("datepicker"),
    minDate: new Date(),
    singleDate: false,
    numberOfMonths: 2,
    // lang: "en-US",
  });
}

export function footerOverlayHeight() {
  if (window.innerWidth < 992) return;
  const footer = document.getElementById("footer");
  if (!footer) return;

  const updateFooterHeight = () => {
    const footerContainer = footer.querySelector(".footer-container");
    const footerOverlay = footer.querySelector(".footer-ovl");
    if (!footerContainer || !footerOverlay) return;

    footerOverlay.style.height = `${footerContainer.offsetHeight}px`;
  };

  updateFooterHeight();

  const resizeObserver = new ResizeObserver(updateFooterHeight);
  const mutationObserver = new MutationObserver(() => {
    updateFooterHeight();

    const footerContainer = footer.querySelector(".footer-container");
    if (footerContainer && !footerContainer.dataset.footerResizeObserved) {
      footerContainer.dataset.footerResizeObserved = "true";
      resizeObserver.observe(footerContainer);
    }
  });

  const footerContainer = footer.querySelector(".footer-container");
  if (footerContainer) {
    footerContainer.dataset.footerResizeObserved = "true";
    resizeObserver.observe(footerContainer);
  }

  mutationObserver.observe(footer, { childList: true, subtree: true });
  window.addEventListener("resize", updateFooterHeight);
  window.addEventListener("load", updateFooterHeight);
}

export function formContact() {
  $(document).on("click", ".contact-form .dropdown-custom-item", function () {
    const $item = $(this);
    const $dropdown = $item.closest(".dropdown-custom-select");
    const optionText = $.trim($item.text());

    $dropdown.find("input[type='hidden']").val(optionText);
    $dropdown.find(".dropdown-custom-text").text(optionText);
    $dropdown.addClass("selected");
  });

  $(document).on("submit", ".contact-form", function (e) {
    e.preventDefault();

    const $form = $(this);
    const $submitButton = $form.find("[type='submit']");
    const $formMessage = $form.find(".form-message, .form-mesage");
    let hasError = false;

    $form
      .find(".label.error, .dropdown-custom-text.error")
      .removeClass("error");
    $formMessage.removeClass("active").hide();

    $form.find(".required").each(function () {
      const $field = $(this);
      const value = $.trim($field.val());

      if (value) return;

      hasError = true;

      const $formInput = $field.closest(".form-input");
      const $label = $formInput.find(".label").first();
      const $dropdownLabel = $formInput.find(".dropdown-custom-text").first();

      if ($label.length) {
        $label.addClass("error");
      } else {
        $dropdownLabel.addClass("error");
      }
    });

    if (hasError) return;

    $.ajax({
      url: AjaxUrl,
      type: "POST",
      data: $form.serialize(),
      beforeSend: function () {
        $submitButton.addClass("aloading");
      },
      success: function () {
        $submitButton.removeClass("aloading");
        $formMessage.addClass("active").show();
      },
      error: function () {
        $submitButton.removeClass("aloading");
      },
    });
  });
}
