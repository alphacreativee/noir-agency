"use strict";
import {
  customDropdown,
  createFilterTab,
  footerOverlayHeight,
  headerScroll,
} from "../../main/js/global.min.js";

const $ = jQuery;

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

function initParallaxSwiper(swiperEl, options = {}) {
  const interleaveOffset = 0.85;

  return new Swiper(swiperEl, {
    slidesPerView: 1,
    loop: true,
    speed: 1500,
    // autoplay: {
    //   delay: 3000,
    //   disableOnInteraction: false
    // },
    watchSlidesProgress: true,
    grabCursor: true,
    ...options,
    on: {
      progress(swiper) {
        swiper.slides.forEach((slide) => {
          const slideProgress = slide.progress || 0;
          const innerOffset = swiper.width * interleaveOffset;
          const innerTranslate = slideProgress * innerOffset;

          if (!isNaN(innerTranslate)) {
            const image = slide.querySelector(".image");
            if (image) {
              image.style.transform = `translate3d(${innerTranslate}px, 0, 0)`;
            }
          }
        });
      },
      touchStart(swiper) {
        swiper.slides.forEach((slide) => {
          slide.style.transition = "";
        });
      },
      setTransition(swiper, speed) {
        const easing = "cubic-bezier(0.25, 0.1, 0.25, 1)";
        swiper.slides.forEach((slide) => {
          slide.style.transition = `${speed}ms ${easing}`;
          const image = slide.querySelector(".image");
          if (image) image.style.transition = `${speed}ms ${easing}`;
        });
      },
      ...(options.on || {}),
    },
  });
}

function initSwiper() {
  const containerSwiperEl = document.querySelector(".container-swiper");
  if (!containerSwiperEl) return;

  const swiperEl = containerSwiperEl.querySelector(".swiper-el-parallax");
  if (!swiperEl) return;

  initParallaxSwiper(swiperEl, {
    navigation: {
      nextEl: containerSwiperEl.querySelector(".swiper-button-next"),
      prevEl: containerSwiperEl.querySelector(".swiper-button-prev"),
    },
    pagination: {
      el: containerSwiperEl.querySelector(".swiper-pagination"),
      clickable: true,
    },
  });
}

function brandingDetail() {
  const brandingDetailSliderEl = document.querySelector(
    ".branding-detail__slider",
  );
  if (!brandingDetailSliderEl) return;

  new Swiper(brandingDetailSliderEl, {
    slidesPerView: "auto",
    spaceBetween: 24,
    centeredSlides: true,
    loop: true,
    speed: 800,
    grabCursor: true,
    breakpoints: {
      992: {
        spaceBetween: 40,
      },
    },
  });
}

function sectionProcess() {
  const sectionProcessEl = document.querySelector("[data-section-process]");
  if (!sectionProcessEl) return;

  const revealEls = sectionProcessEl.querySelectorAll("[data-process-reveal]");
  const lineEl = sectionProcessEl.querySelector("[data-process-line]");

  revealEls.forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0,
      y: 48,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        once: true,
      },
    });
  });

  if (lineEl) {
    let isLineComplete = false;

    ScrollTrigger.create({
      trigger: sectionProcessEl.querySelector(".section-process__timeline"),
      start: "top 70%",
      end: "bottom 65%",
      scrub: true,
      onUpdate(self) {
        if (isLineComplete) return;

        gsap.set(lineEl, { scaleY: self.progress });

        if (self.progress >= 1) {
          isLineComplete = true;
          gsap.set(lineEl, { scaleY: 1 });
        }
      },
      onLeave() {
        isLineComplete = true;
        gsap.set(lineEl, { scaleY: 1 });
      },
    });
  }
}

function marqueeSection() {
  document.querySelectorAll(".marquee-component").forEach((element) => {
    if (element.dataset.scriptInitialized) return;
    element.dataset.scriptInitialized = "true";

    document
      .querySelectorAll("[data-marquee-scroll-direction-target]")
      .forEach((marquee) => {
        // Query marquee elements
        const marqueeContent = marquee.querySelector(
          "[data-marquee-collection-target]",
        );
        const marqueeScroll = marquee.querySelector(
          "[data-marquee-scroll-target]",
        );
        if (!marqueeContent || !marqueeScroll) return;

        // Get data attributes
        const {
          marqueeSpeed: speed,
          marqueeDirection: direction,
          marqueeDuplicate: duplicate,
          marqueeScrollSpeed: scrollSpeed,
        } = marquee.dataset;

        // Convert data attributes to usable types
        const marqueeSpeedAttr = parseFloat(speed);
        const marqueeDirectionAttr = direction === "right" ? 1 : -1;
        // 1 for right, -1 for left
        const duplicateAmount = parseInt(duplicate || 0);
        const scrollSpeedAttr = parseFloat(scrollSpeed);
        const speedMultiplier =
          window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1;

        let marqueeSpeed =
          marqueeSpeedAttr *
          (marqueeContent.offsetWidth / window.innerWidth) *
          speedMultiplier;

        // Precompute styles for the scroll container
        marqueeScroll.style.marginLeft = `${scrollSpeedAttr * -1}%`;
        marqueeScroll.style.width = `${scrollSpeedAttr * 2 + 100}%`;

        // Duplicate marquee content
        if (duplicateAmount > 0) {
          const fragment = document.createDocumentFragment();
          for (let i = 0; i < duplicateAmount; i++) {
            fragment.appendChild(marqueeContent.cloneNode(true));
          }
          marqueeScroll.appendChild(fragment);
        }

        // GSAP animation for marquee content
        const marqueeItems = marquee.querySelectorAll(
          "[data-marquee-collection-target]",
        );
        const animation = gsap
          .to(marqueeItems, {
            xPercent: -100,
            // Move completely out of view
            repeat: -1,
            duration: marqueeSpeed,
            ease: "linear",
          })
          .totalProgress(0.5);

        // Initialize marquee in the correct direction
        gsap.set(marqueeItems, {
          xPercent: marqueeDirectionAttr === 1 ? 100 : -100,
        });
        animation.timeScale(marqueeDirectionAttr);
        // Set correct direction
        animation.play();
        // Start animation immediately

        // Set initial marquee status
        marquee.setAttribute("data-marquee-status", "normal");

        // ScrollTrigger logic for direction inversion
        ScrollTrigger.create({
          trigger: marquee,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const isInverted = self.direction === 1;
            // Scrolling down
            const currentDirection = isInverted
              ? -marqueeDirectionAttr
              : marqueeDirectionAttr;

            // Update animation direction and marquee status
            animation.timeScale(currentDirection);
            marquee.setAttribute(
              "data-marquee-status",
              isInverted ? "normal" : "inverted",
            );
          },
        });

        // Extra speed effect on scroll
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: marquee,
            start: "0% 100%",
            end: "100% 0%",
            scrub: 0,
          },
        });

        const scrollStart =
          marqueeDirectionAttr === -1 ? scrollSpeedAttr : -scrollSpeedAttr;
        const scrollEnd = -scrollStart;

        tl.fromTo(
          marqueeScroll,
          {
            x: `${scrollStart}vw`,
          },
          {
            x: `${scrollEnd}vw`,
            ease: "none",
          },
        );
      });
  });
}

function formContact() {
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

function animationText() {
  gsap.registerPlugin(ScrollTrigger);
  document.querySelectorAll(".tl-text").forEach((el) => {
    const tlTextOne = el.querySelectorAll(".tl-text-one");
    const tlTextTwo = el.querySelectorAll(".tl-text-two");
    const tlTextThree = el.querySelectorAll(".tl-text-three");
    const tlTextFour = el.querySelectorAll(".tl-text-four");
    const tlTextFive = el.querySelectorAll(".tl-text-five");
    const tlTextSix = el.querySelectorAll(".tl-text-six");
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top 65%",
        once: true,
      },
    });
    const animFrom = { y: 20, opacity: 0 };
    const animTo = {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: "power2.out",
    };

    if (tlTextOne.length) tl.fromTo(tlTextOne, animFrom, animTo);
    if (tlTextTwo.length) tl.fromTo(tlTextTwo, animFrom, animTo, "-=0.4");
    if (tlTextThree.length) tl.fromTo(tlTextThree, animFrom, animTo, "-=0.4");
    if (tlTextFour.length) tl.fromTo(tlTextFour, animFrom, animTo, "-=0.4");
    if (tlTextFive.length) tl.fromTo(tlTextFive, animFrom, animTo, "-=0.4");
    if (tlTextSix.length) tl.fromTo(tlTextSix, animFrom, animTo, "-=0.4");
  });
}
function headerMobile() {
  if (window.innerWidth >= 992) return;
  const hamburger = document.getElementById("hamburger");
  const header = document.querySelector("header");
  const subMenu = document.querySelector(".header-main");
  const isChromeIOS = /CriOS/.test(navigator.userAgent);
  // const preventScroll = (e) => {
  //   if (!subMenu.contains(e.target)) {
  //     e.preventDefault();
  //   }
  // };

  hamburger.addEventListener("click", function () {
    this.classList.toggle("active");
    header.classList.toggle("active-menu");
    subMenu.classList.toggle("active");
  });

  const menuSub = document.querySelectorAll("li.menu-item-has-children > a");

  menuSub.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      console.log(this);

      const subMenu = this.parentElement.querySelector(".sub-menu");
      const allSubMenus = Array.from(
        document.querySelectorAll("#header .sub-menu"),
      ).filter((el) => el !== subMenu);

      allSubMenus.forEach((el) => {
        el.style.maxHeight = el.scrollHeight + "px";
        el.offsetHeight; // force reflow
        el.style.maxHeight = 0;
        el.classList.remove("open");
      });

      if (subMenu.classList.contains("open")) {
        subMenu.style.maxHeight = subMenu.scrollHeight + "px";
        subMenu.offsetHeight; // force reflow
        subMenu.style.maxHeight = 0;
        subMenu.classList.remove("open");
      } else {
        subMenu.classList.add("open");
        subMenu.style.maxHeight = subMenu.scrollHeight + "px";

        subMenu.addEventListener(
          "transitionend",
          function handler() {
            if (subMenu.classList.contains("open")) {
              subMenu.style.maxHeight = "none";
            }
            subMenu.removeEventListener("transitionend", handler);
          },
          { once: true },
        );
      }
    });
  });
}
function init() {
  gsap.registerPlugin(ScrollTrigger);
  customDropdown();
  formContact();
  createFilterTab();
  footerOverlayHeight();
  headerScroll();
  marqueeSection();
  animationText();
  headerMobile();
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  initSwiper();
  brandingDetail();
  sectionProcess();
});

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
document.querySelectorAll(".distortion-img").forEach((wrapper) => {
  new hoverEffect({
    parent: wrapper,
    intensity: parseFloat(wrapper.getAttribute("data-intensity")) || 0.03,
    angle: Math.PI / 4,
    image1: wrapper.getAttribute("data-image-default"),
    image2: wrapper.getAttribute("data-image-hover"),
    displacementImage: wrapper.getAttribute("data-displacement"),
  });
});
