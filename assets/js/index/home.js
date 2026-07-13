// export các function dùng cho home
import { customDropdown, createFilterTab } from "../../main/js/global.min.js";
import {} from "../../main/js/helpers.min.js";
("use strict");
$ = jQuery;

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

export function contactForm() {
  if (document.documentElement.dataset.contactFormInitialized) return;
  document.documentElement.dataset.contactFormInitialized = "true";

  document.addEventListener("click", function (e) {
    const item = e.target.closest(".contact-form .dropdown-custom-item");
    if (!item) return;

    const dropdown = item.closest(".dropdown-custom-select");
    const input = dropdown?.querySelector("input[type='hidden']");
    const displayText = dropdown?.querySelector(".dropdown-custom-text");
    const optionText = item.textContent.trim();

    if (input) input.value = optionText;
    if (displayText) displayText.textContent = optionText;
    if (dropdown) dropdown.classList.add("selected");
  });

  document.addEventListener("submit", function (e) {
    const form = e.target.closest(".contact-form");
    if (!form) return;

    e.preventDefault();

    const submitButton = form.querySelector("[type='submit']");
    const formMessage = form.querySelector(".form-message, .form-mesage");
    let hasError = false;

    form
      .querySelectorAll(".label.error, .dropdown-custom-text.error")
      .forEach((label) => label.classList.remove("error"));

    if (formMessage) formMessage.classList.remove("active");

    form.querySelectorAll(".required").forEach((field) => {
      const value = field.value ? field.value.trim() : "";
      if (value) return;

      hasError = true;

      const formInput = field.closest(".form-input");
      const label = formInput?.querySelector(".label");
      const dropdownLabel = formInput?.querySelector(".dropdown-custom-text");

      if (label) {
        label.classList.add("error");
      } else if (dropdownLabel) {
        dropdownLabel.classList.add("error");
      }
    });

    if (hasError) return;

    const ajax = window.jQuery;

    ajax.ajax({
      url: window.AjaxUrl,
      type: "POST",
      data: ajax(form).serialize(),
      beforeSend: function () {
        if (submitButton) submitButton.classList.add("aloading");
      },
      success: function () {
        if (submitButton) submitButton.classList.remove("aloading");
        if (formMessage) formMessage.classList.add("active");
      },
      error: function () {
        if (submitButton) submitButton.classList.remove("aloading");
      }
    });
  });
}

const init = () => {
  gsap.registerPlugin(ScrollTrigger);
  customDropdown();
  createFilterTab();
};
document.addEventListener("DOMContentLoaded", () => {
  init();
});

// event click element a
let isLinkClicked = false;

document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (
    link?.href &&
    !link.href.startsWith("#") &&
    !link.href.startsWith("javascript:")
  ) {
    isLinkClicked = true;
  }
});

window.addEventListener("beforeunload", () => {
  if (!isLinkClicked) window.scrollTo(0, 0);
  isLinkClicked = false;
});
