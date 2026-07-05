document.addEventListener("DOMContentLoaded", function () {
  let siteData = null;
  // Initialize current language from localStorage or default to Arabic ('ar')
  let currentLang = localStorage.getItem("preferredLang") || "ar";

  // Theme Manager (Dark / Original Light Theme)
  let currentTheme = localStorage.getItem("preferredTheme") || "light";
  let currentBannerImage = "img/profile-banner.jpg";
  const desktopMediaQuery = window.matchMedia("(min-width: 992px)");

  function isDesktopView() {
    return desktopMediaQuery.matches;
  }

  function getEffectiveTheme() {
    return isDesktopView() ? "dark" : currentTheme;
  }

  const ABOUT_SOCIAL_PLATFORMS = [
    { key: "mailRu", label: "Mail.ru", type: "image", image: "img/social/mailru-logo.png", brandColor: "#005FF9" },
    { key: "facebook", label: "Facebook", type: "fa", icon: "facebook", brandColor: "#4267b2" },
    { key: "telegram", label: "Telegram", type: "fa", icon: "telegram", brandColor: "#0088cc" },
    { key: "max", label: "Max", type: "image", image: "img/social/max-logo.png", brandColor: "#8B5CF6" },
    { key: "whatsapp", label: "WhatsApp", type: "fa", icon: "whatsapp", brandColor: "#25D366" },
  ];

  function normalizeSocialUrl(url) {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (!trimmed || trimmed === "#") return "";
    if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
    return "https://" + trimmed.replace(/^\/\//, "");
  }

  function hasSocialLink(socials, platform) {
    return Boolean(normalizeSocialUrl(socials && socials[platform.key]));
  }

  function renderAboutSocialIcon(platform) {
    if (platform.type === "fa") {
      return `<i class="fa fa-${platform.icon} fa-stack-1x fa-inverse"></i>`;
    }

    return `<img src="${platform.image}" alt="" class="social-brand-img fa-stack-1x" aria-hidden="true">`;
  }

  function renderAboutSocialLinkContent(platform) {
    const circleColor = platform.type === "image" ? "#ffffff" : platform.brandColor;

    return `
      <span class="fa-stack fa-lg social-icon-unified">
        <i class="fa fa-circle fa-stack-2x" style="color: ${circleColor};"></i>
        ${renderAboutSocialIcon(platform)}
      </span>
    `;
  }

  function renderAboutSocials(socials) {
    if (!socials) return "";

    return ABOUT_SOCIAL_PLATFORMS.filter(function (platform) {
      return hasSocialLink(socials, platform);
    }).map(function (platform) {
      const url = normalizeSocialUrl(socials[platform.key]);
      return `
        <li class="list-inline-item">
          <a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${platform.label}">
            ${renderAboutSocialLinkContent(platform)}
          </a>
        </li>
      `;
    }).join("");
  }

  function renderContactSocialInner(platform) {
    if (platform.type === "fa") {
      return `<i class="fa fa-${platform.icon}" style="color: ${platform.brandColor};"></i>`;
    }

    return `<img src="${platform.image}" alt="" class="social-contact-icon-img">`;
  }

  function renderContactSocials(socials) {
    if (!socials) return "";

    return ABOUT_SOCIAL_PLATFORMS.filter(function (platform) {
      return hasSocialLink(socials, platform);
    }).map(function (platform) {
      const url = normalizeSocialUrl(socials[platform.key]);
      const content = `
        <span class="social-contact-slot" style="border-color:${platform.brandColor};">
          ${renderContactSocialInner(platform)}
        </span>
      `;

      return `
        <li>
          <a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${platform.label}">
            ${content}
          </a>
        </li>
      `;
    }).join("");
  }
  function toRootImageUrl(imagePath) {
    if (!imagePath) return "/img/profile-banner.jpg";
    if (/^(https?:|\/)/.test(imagePath)) return imagePath;
    return "/" + imagePath.replace(/^\.\//, "");
  }

  function getMobileBannerImage() {
    return document.querySelector(".about-mobile-banner__media");
  }

function applyAboutBanner(bannerPath, animate) {
    const aboutSection = document.getElementById("about");
    if (!aboutSection) return;
    
    let shouldAnimate = animate !== false;
    currentBannerImage = bannerPath || "img/profile-banner.jpg";
    const bannerUrl = toRootImageUrl(currentBannerImage);
    const bannerImg = getMobileBannerImage();
    
    // Check if image is already loaded and matches the target URL
    const isImageLoaded = function() {
        if (!bannerImg) return false;
        if (!bannerImg.src || !bannerImg.src.endsWith(bannerUrl)) return false;
        return bannerImg.complete && bannerImg.naturalHeight !== 0;
    };

    // Prevent flickering ONLY if the correct image is already loaded
    if (shouldAnimate && isImageLoaded()) {
        shouldAnimate = false;
        aboutSection.classList.remove("about-banner-loading");
        aboutSection.classList.add("about-banner-loaded");
        document.body.classList.add("hero-ready");
    }

    let isBannerSet = false;
    const setBanner = function () {
        if (isBannerSet) return;
        isBannerSet = true;
        
        if (bannerImg && (!bannerImg.src || !bannerImg.src.endsWith(bannerUrl))) {
            bannerImg.src = bannerUrl;
        }
        aboutSection.style.removeProperty("background-image");
        
        if (!shouldAnimate) {
            aboutSection.classList.remove("about-banner-loading");
            aboutSection.classList.add("about-banner-loaded");
            document.body.classList.add("hero-ready");
            return;
        }
        
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                aboutSection.classList.remove("about-banner-loading");
                aboutSection.classList.add("about-banner-loaded");
                document.body.classList.add("hero-ready");
            });
        });
    };
    
    if (!shouldAnimate) {
        setBanner();
        return;
    }
    
    // For animated case, hide and show
    aboutSection.classList.remove("about-banner-loaded");
    aboutSection.classList.add("about-banner-loading");
    document.body.classList.remove("hero-ready");
    
    if (bannerImg) {
        // Use a new Image object for reliable onload/onerror events
        const img = new Image();
        img.onload = setBanner;
        img.onerror = setBanner;
        img.src = bannerUrl;
        
        // Update DOM element immediately to start loading
        if (!bannerImg.src || !bannerImg.src.endsWith(bannerUrl)) {
            bannerImg.src = bannerUrl;
        }
        
        // Fallback to ensure it never gets stuck invisible
        setTimeout(setBanner, 1500);
    } else {
        setBanner();
    }
}

  function applyTheme(theme) {
    if (theme) {
      currentTheme = theme;
    }

    const body = document.body;
    // Support both old standalone #theme-toggle and new panel-embedded one
    const toggleIcons = document.querySelectorAll("#theme-toggle i");
    const effectiveTheme = getEffectiveTheme();
    const shouldAnimateThemeSwitch = !isDesktopView();

    if (shouldAnimateThemeSwitch) {
      body.classList.add("theme-switching");
      window.clearTimeout(applyTheme._switchTimer);
      applyTheme._switchTimer = window.setTimeout(function () {
        body.classList.remove("theme-switching");
      }, 700);
    }

    if (effectiveTheme === "dark") {
      body.classList.add("dark-theme");
      toggleIcons.forEach(function(icon) { icon.className = "fa fa-sun-o"; });
    } else {
      body.classList.remove("dark-theme");
      toggleIcons.forEach(function(icon) { icon.className = "fa fa-moon-o"; });
    }
    applyAboutBanner(currentBannerImage, false);
  }

  window.toggleTheme = function () {
    if (isDesktopView()) return;

    currentTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("preferredTheme", currentTheme);
    applyTheme(currentTheme);
  };

  desktopMediaQuery.addEventListener("change", function () {
    applyTheme();
  });

  // Apply saved theme immediately on startup
  applyTheme(currentTheme);

  function initProfileLightbox() {
    const lightbox = document.getElementById("profile-lightbox");
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector(".profile-lightbox-img");
    const lightboxTitle = lightbox.querySelector("#profile-lightbox-title");
    const closeTriggers = lightbox.querySelectorAll("[data-profile-lightbox-close]");
    let closeTimer = null;

    function openProfileLightbox(src, alt) {
      if (!isDesktopView() || !src || !lightboxImg) return;

      lightboxImg.src = src;
      lightboxImg.alt = alt || "Profile photo";
      if (lightboxTitle) {
        lightboxTitle.textContent = alt || "Profile photo";
      }

      window.clearTimeout(closeTimer);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("profile-lightbox-open");
      lightbox.querySelector(".profile-lightbox-close")?.focus();
    }

    function closeProfileLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("profile-lightbox-open");

      closeTimer = window.setTimeout(function () {
        if (!lightbox.classList.contains("is-open") && lightboxImg) {
          lightboxImg.removeAttribute("src");
        }
      }, 500);
    }

    document.querySelectorAll("#sideNav .navbar-brand .img-profile").forEach(function (img) {
      img.setAttribute("role", "button");
      img.setAttribute("tabindex", "0");

      img.addEventListener("click", function (event) {
        if (!isDesktopView()) return;
        event.preventDefault();
        event.stopPropagation();
        openProfileLightbox(img.currentSrc || img.src, img.alt);
      });

      img.addEventListener("keydown", function (event) {
        if (!isDesktopView()) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProfileLightbox(img.currentSrc || img.src, img.alt);
        }
      });
    });

    closeTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", closeProfileLightbox);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeProfileLightbox();
      }
    });
  }

  initProfileLightbox();

  // Expose setLanguage globally
  window.setLanguage = function (lang) {
    currentLang = lang;
    localStorage.setItem("preferredLang", lang);
    updateLanguageButtons();
    if (siteData) {
      renderAll(siteData);
    }
  };

  // Fetch website data from API when server is running, else static file
  const dataEndpoint =
    window.location.protocol === "file:"
      ? "data.json?v=" + Date.now()
      : "/api/data?v=" + Date.now();

  fetch(dataEndpoint)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load data.json");
      }
      return response.json();
    })
    .then((data) => {
      siteData = data;
      if (!siteData.testimonials) siteData.testimonials = { heading: {}, subtitle: {}, items: [] };
      if (!siteData.testimonials.items) siteData.testimonials.items = [];
      if (!siteData.whyMe) siteData.whyMe = { heading: {}, subtitle: {}, intro: {}, tableHeaders: {}, rows: [], highlights: [] };
      if (!siteData.workflow) siteData.workflow = { heading: {}, subtitle: {}, steps: [] };
      if (!siteData.ui) siteData.ui = {};
      updateLanguageButtons();
      renderAll(siteData);
    })
    .catch((err) => {
      console.warn("Could not load dynamic website data. Falling back to default static HTML.", err);
      applyAboutBanner("img/profile-banner.jpg", true);
    });

  function updateLanguageButtons() {
    const langs = ["ar", "en", "ru"];
    langs.forEach((l) => {
      // Desktop buttons
      const btn = document.getElementById("lang-btn-" + l);
      if (btn) {
        if (l === currentLang) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      }
      // Mobile chips inside unified panel
      const chip = document.getElementById("mobile-lang-btn-" + l);
      if (chip) {
        if (l === currentLang) {
          chip.classList.add("active");
        } else {
          chip.classList.remove("active");
        }
      }
    });
  }

  function renderAll(data) {
    // Set Direction (RTL for Arabic, LTR for others)
    if (currentLang === "ar") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = currentLang;
    }

    renderUI(data.ui);
    renderAbout(data.about);
    renderExperience(data.experience);
    renderPortfolio(data.portfolio, data.ui);
    renderSkills(data.skills);
    renderAwards(data.awards);
    renderTestimonials(data.testimonials);
    renderWhyMe(data.whyMe);
    renderWorkflow(data.workflow);
    renderFooter(data.about);
    initAwardsBgAnimation();

    // Render Tools & Skills section
    if (typeof window.renderTools === 'function') window.renderTools(data);
    if (typeof window.updateToolsFooterLink === 'function') window.updateToolsFooterLink();
    if (typeof window.updateToolsNavLink === 'function') window.updateToolsNavLink();

    // Trigger scroll animations
    initScrollReveal();
  }

  // Get value for current language
  function getLocValue(field, fallback = "") {
    if (!field) return fallback;
    if (typeof field === "object") {
      return field[currentLang] || field["en"] || field["ar"] || field["ru"] || fallback;
    }
    return field;
  }

  // Render static UI labels
  function renderUI(ui) {
    if (!ui) return;

    // Sidebar Links
    const linksMap = {
      'a[href="#about"]': ui.navAbout,
      'a[href="#experience"]': ui.navExperience,
      'a[href="#portfolio"]': ui.navPortfolio,
      'a[href="#skills"]': ui.navSkills,
      'a[href="#awards"]': ui.navAwards,
      'a[href="#testimonials"]': ui.navTestimonials,
      'a[href="#workflow"]': ui.navWorkflow,
      'a[href="#why-me"]': ui.navWhyMe,
      'a[href="#tools"]': ui.navTools || (siteData && siteData.tools && siteData.tools.heading),
    };

    for (const selector in linksMap) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.textContent = getLocValue(linksMap[selector]);
      });
    }

    // Section Titles
    const titleMap = {
      '#experience h2': ui.experienceHeading,
      '#portfolio h2': ui.portfolioHeading,
      '#skills h3': ui.skillsHeading,
      '#awards h2': ui.awardsHeading,
      '#testimonials-heading': ui.testimonialsHeading,
      '#workflow-heading': ui.workflowHeading,
      '#why-me-heading': ui.whyMeHeading,
    };

    for (const selector in titleMap) {
      const el = document.querySelector(selector);
      if (el && titleMap[selector]) {
        el.innerText = getLocValue(titleMap[selector]);
      }
    }
  }

  // Render About section
  function renderAbout(about) {
    if (!about) return;

    // Profile Images
    const profileImgs = document.querySelectorAll(".img-profile");
    const profileAlt = `${getLocValue(about.firstName)} ${getLocValue(about.lastName)}`.trim() || "Profile photo";
    profileImgs.forEach((img) => {
      img.src = about.profileImage || "img/profile.jpg";
      img.alt = profileAlt;
      img.setAttribute("aria-label", profileAlt);
    });

    // Logo
    const logoS = document.querySelector("#about img.about-logo");
    if (logoS && about.logoS) {
      logoS.src = about.logoS;
    }

    // Background banner (animated on first load)
    applyAboutBanner(about.bannerImage, true);

    // Name
    const nameHeader = document.querySelector("#about h1");
    if (nameHeader) {
      const first = getLocValue(about.firstName);
      const last = getLocValue(about.lastName);
      nameHeader.innerHTML = `${first} <span class="text-primary">${last}</span>`;
    }

    // Subheading
    const subheading = document.querySelector("#about .subheading");
    if (subheading) {
      subheading.innerHTML = getLocValue(about.subheading);
    }

    // Description
    const description = document.querySelector("#about p");
    if (description) {
      description.textContent = getLocValue(about.description);
    }

    // Social Links
    const socialContainer = document.querySelector("#about ul.list-social-icons");
    if (socialContainer && about.socials) {
      socialContainer.innerHTML = renderAboutSocials(about.socials);
    }
  }

  // Render Experience section
  function renderExperience(experienceList) {
    const container = document.getElementById("experience-list");
    if (!container || !experienceList || experienceList.length === 0) return;

    let html = "";
    experienceList.forEach((item) => {
      let borderColor = "#2196f3"; // default primary
      if (item.color === "info") borderColor = "#17a2b8";
      else if (item.color === "warning") borderColor = "#ffc107";
      else if (item.color === "success") borderColor = "#28a745";
      else if (item.color === "primary") borderColor = "#2196f3";
      else if (item.color && item.color.startsWith("#")) borderColor = item.color;

      html += `
        <div class="resume-item col-md-6 col-sm-12"> 
          <div class="card mx-0 p-4 mb-5" style="border-color: ${borderColor}; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.21); min-height: 250px;">
            <div class="resume-content mr-auto">
                <h4 class="mb-3"><i class="fa ${item.icon || "fa-briefcase"} mr-3 text-${item.color || "primary"}"></i> ${getLocValue(item.title)}</h4>
                <p>${getLocValue(item.description)}</p>
            </div>
            <div class="resume-date text-md-right">
                <span class="text-primary">${getLocValue(item.date)}</span>
            </div>
          </div>  
        </div>
      `;
    });
    container.innerHTML = html;
  }

  // Helper to check if a file path is a video
  function isVideoFile(filePath) {
    if (!filePath) return false;
    var videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    var lowerPath = filePath.toLowerCase();
    return videoExtensions.some(function(ext) { return lowerPath.endsWith(ext); });
  }

  // Helper to render a media element (image or video)
  function renderMediaElement(src, alt, style) {
    if (isVideoFile(src)) {
      return `<video class="d-block w-100 img-fluid img-centered" src="${src}" controls style="${style || 'max-height: 400px; object-fit: contain; margin-bottom: 20px;'}"></video>`;
    }
    return `<img class="d-block w-100 img-fluid img-centered" src="${src}" alt="${alt || ''}" style="${style || 'max-height: 400px; object-fit: contain; margin-bottom: 20px;'}">`;
  }

  // Helper to render image/video browser carousel or single media inside Portfolio modal
  function renderPortfolioImagesHTML(projectId, images) {
    if (!images || images.length === 0) {
      return `<img class="img-fluid img-centered" src="img/portfolio/p-1.jpg" alt="No image">`;
    }
    if (images.length === 1) {
      if (isVideoFile(images[0])) {
        return `<video class="img-fluid img-centered" src="${images[0]}" controls style="max-height: 400px; width: 100%; object-fit: contain; margin-bottom: 20px;"></video>`;
      }
      return `<img class="img-fluid img-centered" src="${images[0]}" alt="Project Image" style="max-height: 400px; width: 100%; object-fit: contain; margin-bottom: 20px;">`;
    }

    // Build Carousel
    let indicators = "";
    let slides = "";
    images.forEach((img, index) => {
      indicators += `<li data-target="#carousel_${projectId}" data-slide-to="${index}" class="${index === 0 ? "active" : ""}"></li>`;
      let mediaContent;
      if (isVideoFile(img)) {
        mediaContent = `<video class="d-block w-100 img-fluid img-centered" src="${img}" controls style="max-height: 400px; object-fit: contain; margin-bottom: 20px;"></video>`;
      } else {
        mediaContent = `<img class="d-block w-100 img-fluid img-centered" src="${img}" alt="Project image ${index + 1}" style="max-height: 400px; object-fit: contain; margin-bottom: 20px;">`;
      }
      slides += `
        <div class="carousel-item ${index === 0 ? "active" : ""}">
          ${mediaContent}
        </div>
      `;
    });

    return `
      <div id="carousel_${projectId}" class="carousel slide" data-ride="carousel" style="background: #f8f9fa; border-radius: 8px; padding: 10px; margin-bottom: 25px;">
        <ol class="carousel-indicators" style="bottom: 0px;">
          ${indicators}
        </ol>
        <div class="carousel-inner">
          ${slides}
        </div>
        <a class="carousel-control-prev" href="#carousel_${projectId}" role="button" data-slide="prev" style="filter: invert(1);">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next" href="#carousel_${projectId}" role="button" data-slide="next" style="filter: invert(1);">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="sr-only">Next</span>
        </a>
      </div>
    `;
  }

  // Render Portfolio section
  function renderPortfolio(portfolioList, ui) {
    const gridContainer = document.getElementById("portfolio-grid");
    const modalsContainer = document.getElementById("portfolio-modals");
    if (!gridContainer || !portfolioList || !ui) return;

    let gridHtml = "";
    let modalsHtml = "";

    portfolioList.forEach((item) => {
      const category = (item.category || "all").toLowerCase().trim();
      const firstImage = (item.images && item.images.length > 0) ? item.images[0] : "img/portfolio/p-1.jpg";

      // Render Grid Item - support video as cover
      let coverElement;
      if (isVideoFile(firstImage)) {
        coverElement = `<video class="img-fluid" src="${firstImage}" muted loop autoplay playsinline style="width: 100%; height: 250px; object-fit: cover;"></video>`;
      } else {
        coverElement = `<img class="img-fluid" src="${firstImage}" alt="${getLocValue(item.title)}" style="width: 100%; height: 250px; object-fit: cover;">`;
      }

      gridHtml += `
        <div class="col-sm-4 portfolio-item filter ${category}">
            <a class="portfolio-link" href="#portfolioModal_${item.id}" data-toggle="modal">
                <div class="caption-port">
                    <div class="caption-port-content">
                        <i class="fa fa-search-plus fa-3x"></i>
                    </div>
                </div>
                ${coverElement}
            </a>
        </div>
      `;

      // Render Modal with Carousel and Delivery Time
      const imagesContainerHTML = renderPortfolioImagesHTML(item.id, item.images);
      
      modalsHtml += `
        <div class="portfolio-modal modal fade" id="portfolioModal_${item.id}" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="close-modal" data-dismiss="modal">
                        <div class="lr">
                            <div class="rl"></div>
                        </div>
                    </div>
                    <div class="container">
                        <div class="row">
                            <div class="modal-body">
                                <div class="title-bar">
                                  <div class="col-md-12">
                                    <h2 class="text-center">${getLocValue(item.title)}</h2>
                                    <div class="heading-border"></div>
                                  </div>
                                </div>
                                <div class="row">
                                  <div class="col-md-6">
                                    ${imagesContainerHTML}
                                  </div>
                                  <div class="col-md-6">
                                    <p>${getLocValue(item.description)}</p>
                                    <ul class="list-inline item-details">
                                        <li>${getLocValue(ui.clientLabel)}:
                                            <strong><a href="#">${getLocValue(item.client) || "N/A"}</a></strong>
                                        </li>
                                        <li>${getLocValue(ui.dateLabel)}:
                                            <strong><a href="#">${getLocValue(item.date) || "N/A"}</a></strong>
                                        </li>
                                        <li>${getLocValue(ui.serviceLabel)}:
                                            <strong><a href="#">${getLocValue(item.service) || "N/A"}</a></strong>
                                        </li>
                                        <li>${getLocValue(ui.deliveryLabel)}:
                                            <strong><a href="#" style="color: #28a745;">${getLocValue(item.deliveryTime) || "N/A"}</a></strong>
                                        </li>
                                    </ul>
                                    <button class="btn btn-general btn-white" type="button" data-dismiss="modal">
                                        <i class="fa fa-times"></i> ${getLocValue(ui.closeBtn)}
                                    </button>
                                  </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      `;
    });

    gridContainer.innerHTML = gridHtml;
    if (modalsContainer) {
      modalsContainer.innerHTML = modalsHtml;
    }

    // Trigger carousel auto-start on dynamically loaded bootstrap carousels
    if (typeof jQuery !== "undefined") {
      jQuery('.carousel').carousel({
        interval: 3000
      });
    }
  }

  // Render Skills section
  function normalizeSkillIcon(icon) {
    if (!icon || typeof icon !== "string") return "fa-code";
    let value = icon.trim();
    if (!value) return "fa-code";
    value = value.replace(/^fa\s+fa-/, "fa-").replace(/^fa\s+/, "fa-");
    if (!value.startsWith("fa-")) {
      value = "fa-" + value.replace(/^fa-?/, "");
    }
    return value;
  }

  function renderSkills(skillsList) {
    const container = document.getElementById("skills-grid");
    if (!container || !skillsList || skillsList.length === 0) return;

    let html = "";
    skillsList.forEach((item) => {
      const iconClass = normalizeSkillIcon(item.icon);
      const skillName = getLocValue(item.name);
      html += `
        <div class="col-md-3 col-sm-6">
            <div class="skill-item skill-item-interactive" role="button" tabindex="0" data-skill-id="${item.id}" aria-label="${skillName}">
                <span class="skill-icon-display" aria-hidden="true">
                    <i class="fa ${iconClass}"></i>
                </span>
                <h2><span class="counter">${item.percentage}</span><span>%</span></h2>
                <p>${skillName}</p>
                <span class="skill-item-hint">${getSkillHintText()}</span>
            </div>
        </div>
      `;
    });
    container.innerHTML = html;

    if (typeof jQuery !== "undefined" && jQuery.fn.counterUp) {
      jQuery(".counter").counterUp({
        delay: 10,
        time: 2000,
      });
    }
  }

  function getSkillHintText() {
    const hints = {
      ar: "اضغط للشرح",
      en: "Tap to learn more",
      ru: "Нажмите, чтобы узнать",
    };
    return hints[currentLang] || hints.en;
  }

  function initSkillDetailModal() {
    const modal = document.getElementById("skill-detail-modal");
    const container = document.getElementById("skills-grid");
    if (!modal || !container || container.dataset.skillModalBound === "true") return;

    container.dataset.skillModalBound = "true";
    const closeTriggers = modal.querySelectorAll("[data-skill-modal-close]");

    function closeSkillModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("skill-modal-open");
    }

    function openSkillModal(id) {
      const skill = siteData?.skills?.find(function (item) {
        return item.id === id;
      });
      if (!skill) return;

      const description = getLocValue(skill.description);
      if (!description) return;

      const iconEl = document.getElementById("skill-detail-icon");
      const titleEl = document.getElementById("skill-detail-title");
      const percentEl = document.getElementById("skill-detail-percent");
      const textEl = document.getElementById("skill-detail-text");

      if (iconEl) {
        iconEl.innerHTML = `<i class="fa ${normalizeSkillIcon(skill.icon)}"></i>`;
      }
      if (titleEl) titleEl.textContent = getLocValue(skill.name);
      if (percentEl) percentEl.textContent = `${skill.percentage}%`;
      if (textEl) textEl.textContent = description;

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("skill-modal-open");
      modal.querySelector(".skill-detail-close")?.focus();
    }

    container.addEventListener("click", function (event) {
      const item = event.target.closest(".skill-item-interactive");
      if (!item) return;
      openSkillModal(item.getAttribute("data-skill-id"));
    });

    container.addEventListener("keydown", function (event) {
      const item = event.target.closest(".skill-item-interactive");
      if (!item) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openSkillModal(item.getAttribute("data-skill-id"));
      }
    });

    closeTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", closeSkillModal);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.classList.contains("is-open")) {
        closeSkillModal();
      }
    });
  }

  initSkillDetailModal();

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function getAwardViewLabel() {
    const labels = {
      ar: "عرض التفاصيل",
      en: "View details",
      ru: "Подробнее"
    };
    return labels[currentLang] || labels.en;
  }

  function getAwardBadgeLabel() {
    const labels = {
      ar: "شهادة / جائزة",
      en: "Certificate / Award",
      ru: "Сертификат / Награда"
    };
    return labels[currentLang] || labels.en;
  }

  function initAwardDetailModal() {
    const modal = document.getElementById("award-detail-modal");
    const container = document.getElementById("awards-list");
    if (!modal || !container || container.dataset.awardModalBound === "true") return;

    container.dataset.awardModalBound = "true";
    const closeTriggers = modal.querySelectorAll("[data-award-modal-close]");
    const visualEl = document.getElementById("award-detail-visual");
    const imageEl = document.getElementById("award-detail-image");
    const dateEl = document.getElementById("award-detail-date");
    const titleEl = document.getElementById("award-detail-title");
    const descEl = document.getElementById("award-detail-description");
    const badgeTextEl = document.getElementById("award-detail-badge-text");
    const layoutEl = modal.querySelector(".award-detail-layout");

    function closeAwardModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("award-modal-open");
    }

    function openAwardModal(awardId) {
      const award = siteData?.awards?.find(function (item) {
        return item.id === awardId;
      });
      if (!award) return;

      const title = getLocValue(award.title);
      const date = getLocValue(award.date);
      const description = getLocValue(award.description);
      const certImage = award.certificateImage || "";

      if (badgeTextEl) badgeTextEl.textContent = getAwardBadgeLabel();
      if (dateEl) dateEl.textContent = date;
      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = description;

      if (visualEl && imageEl) {
        if (certImage) {
          visualEl.classList.remove("is-hidden");
          imageEl.src = certImage;
          imageEl.alt = title;
          layoutEl?.classList.remove("award-detail-layout--text-only");
        } else {
          visualEl.classList.add("is-hidden");
          imageEl.removeAttribute("src");
          imageEl.alt = "";
          layoutEl?.classList.add("award-detail-layout--text-only");
        }
      }

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("award-modal-open");
      modal.querySelector(".award-detail-close")?.focus();
    }

    container.addEventListener("click", function (event) {
      const card = event.target.closest(".award-showcase-card");
      if (!card) return;
      openAwardModal(card.getAttribute("data-award-id"));
    });

    container.addEventListener("keydown", function (event) {
      const card = event.target.closest(".award-showcase-card");
      if (!card) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openAwardModal(card.getAttribute("data-award-id"));
      }
    });

    closeTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", closeAwardModal);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.classList.contains("is-open")) {
        closeAwardModal();
      }
    });
  }

  initAwardDetailModal();

  // Render Awards section
  function renderAwards(awardsList) {
    const container = document.getElementById("awards-list");
    if (!container || !awardsList || awardsList.length === 0) return;

    const withCertificate = awardsList.filter(function (item) {
      return item.certificateImage;
    });
    const withoutCertificate = awardsList.filter(function (item) {
      return !item.certificateImage;
    });

    let html = "";
    const viewLabel = getAwardViewLabel();

    if (withCertificate.length) {
      html += '<div class="awards-showcase-grid">';
      withCertificate.forEach(function (item) {
        const title = getLocValue(item.title);
        const date = getLocValue(item.date);
        html += `
          <article class="award-showcase-card" data-award-id="${escapeHtml(item.id)}" tabindex="0" role="button" aria-label="${escapeHtml(title)}">
            <div class="award-showcase-card-inner">
              <div class="award-showcase-media">
                <img class="award-showcase-img" src="${escapeHtml(item.certificateImage)}" alt="${escapeHtml(title)}" loading="lazy">
                <span class="award-showcase-glow" aria-hidden="true"></span>
                <span class="award-showcase-overlay">
                  <span class="award-showcase-overlay-icon"><i class="fa fa-expand" aria-hidden="true"></i></span>
                  <span class="award-showcase-overlay-text">${escapeHtml(viewLabel)}</span>
                </span>
              </div>
              <div class="award-showcase-footer">
                <span class="award-showcase-date">${escapeHtml(date)}</span>
                <h5 class="award-showcase-title">${escapeHtml(title)}</h5>
              </div>
            </div>
          </article>
        `;
      });
      html += "</div>";
    }

    withoutCertificate.forEach(function (item) {
      const title = getLocValue(item.title);
      html += `
        <div class="award">
            <div class="award-icon"></div>
            <div class="award-content">
                <span class="date">${escapeHtml(getLocValue(item.date))}</span>
                <h5 class="title">${escapeHtml(title)}</h5>
                <p class="description">${escapeHtml(getLocValue(item.description))}</p>
            </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // Render Testimonials section
  function renderTestimonialStars(rating) {
    const count = Math.max(0, Math.min(5, parseInt(rating, 10) || 0));
    let html = "";
    for (let i = 0; i < 5; i++) {
      html += `<i class="fa fa-star${i < count ? "" : "-o"}" aria-hidden="true"></i>`;
    }
    return html;
  }

  function getTestimonialViewLabel() {
    const labels = { ar: "عرض الشهادة", en: "View testimonial", ru: "Подробнее" };
    return labels[currentLang] || labels.en;
  }

  function initTestimonialDetailModal() {
    const modal = document.getElementById("testimonial-detail-modal");
    const container = document.getElementById("testimonials-grid");
    if (!modal || !container || container.dataset.testimonialModalBound === "true") return;

    container.dataset.testimonialModalBound = "true";
    const closeTriggers = modal.querySelectorAll("[data-testimonial-modal-close]");
    const visualEl = document.getElementById("testimonial-detail-visual");
    const imageEl = document.getElementById("testimonial-detail-image");
    const starsEl = document.getElementById("testimonial-detail-stars");
    const titleEl = document.getElementById("testimonial-detail-title");
    const roleEl = document.getElementById("testimonial-detail-role");
    const quoteEl = document.getElementById("testimonial-detail-quote");
    const layoutEl = modal.querySelector(".testimonial-detail-layout");

    function closeTestimonialModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("testimonial-modal-open");
    }

    function openTestimonialModal(testimonialId) {
      const item = siteData?.testimonials?.items?.find(function (entry) {
        return entry.id === testimonialId;
      });
      if (!item) return;

      const name = getLocValue(item.clientName);
      const role = getLocValue(item.role);
      const quote = getLocValue(item.quote);
      const image = item.image || "";

      if (titleEl) titleEl.textContent = name;
      if (roleEl) roleEl.textContent = role;
      if (quoteEl) quoteEl.textContent = quote;
      if (starsEl) starsEl.innerHTML = renderTestimonialStars(item.rating);

      if (visualEl && imageEl) {
        if (image) {
          visualEl.classList.remove("is-hidden");
          imageEl.src = image;
          imageEl.alt = name;
          layoutEl?.classList.remove("testimonial-detail-layout--text-only");
        } else {
          visualEl.classList.add("is-hidden");
          imageEl.removeAttribute("src");
          imageEl.alt = "";
          layoutEl?.classList.add("testimonial-detail-layout--text-only");
        }
      }

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("testimonial-modal-open");
      modal.querySelector(".testimonial-detail-close")?.focus();
    }

    container.addEventListener("click", function (event) {
      const card = event.target.closest(".testimonial-card");
      if (!card) return;
      openTestimonialModal(card.getAttribute("data-testimonial-id"));
    });

    container.addEventListener("keydown", function (event) {
      const card = event.target.closest(".testimonial-card");
      if (!card) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openTestimonialModal(card.getAttribute("data-testimonial-id"));
      }
    });

    closeTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", closeTestimonialModal);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.classList.contains("is-open")) {
        closeTestimonialModal();
      }
    });
  }

  initTestimonialDetailModal();

  function renderTestimonials(testimonials) {
    const grid = document.getElementById("testimonials-grid");
    const subtitle = document.getElementById("testimonials-subtitle");
    const headingEl = document.getElementById("testimonials-heading");
    if (!grid || !testimonials) return;

    if (headingEl) headingEl.textContent = getLocValue(testimonials.heading);
    if (subtitle) subtitle.textContent = getLocValue(testimonials.subtitle);

    const items = testimonials.items || [];
    if (items.length === 0) {
      grid.innerHTML = "";
      return;
    }

    const viewLabel = getTestimonialViewLabel();
    let html = "";

    items.forEach(function (item) {
      const name = getLocValue(item.clientName);
      const role = getLocValue(item.role);
      const image = item.image || "";
      const stars = renderTestimonialStars(item.rating);
      const mediaHtml = image
        ? `<img class="testimonial-card-img" src="${escapeHtml(image)}" alt="${escapeHtml(name)}" loading="lazy">`
        : `<div class="testimonial-card-quote-preview"><i class="fa fa-quote-left" aria-hidden="true"></i><p>${escapeHtml(getLocValue(item.quote).substring(0, 120))}${getLocValue(item.quote).length > 120 ? "..." : ""}</p></div>`;

      html += `
        <article class="testimonial-card" data-testimonial-id="${escapeHtml(item.id)}" tabindex="0" role="button" aria-label="${escapeHtml(name)}">
          <div class="testimonial-card-inner">
            <div class="testimonial-card-media">
              ${mediaHtml}
              <span class="testimonial-card-overlay">
                <span class="testimonial-card-overlay-icon"><i class="fa fa-expand" aria-hidden="true"></i></span>
                <span class="testimonial-card-overlay-text">${escapeHtml(viewLabel)}</span>
              </span>
            </div>
            <div class="testimonial-card-footer">
              <div class="testimonial-card-stars">${stars}</div>
              <h5 class="testimonial-card-name">${escapeHtml(name)}</h5>
              <span class="testimonial-card-role">${escapeHtml(role)}</span>
            </div>
          </div>
        </article>
      `;
    });

    grid.innerHTML = html;
  }

  function renderWhyMeValueCell(value, isPositive) {
    const icon = isPositive
      ? '<i class="fa fa-check-circle why-me-icon-positive" aria-hidden="true"></i>'
      : '<i class="fa fa-times-circle why-me-icon-negative" aria-hidden="true"></i>';
    return `<span class="why-me-cell-value ${isPositive ? "is-positive" : "is-negative"}">${icon}<span>${escapeHtml(value)}</span></span>`;
  }

  function renderWhyMe(whyMe) {
    const introEl = document.getElementById("why-me-intro");
    const subtitleEl = document.getElementById("why-me-subtitle");
    const headingEl = document.getElementById("why-me-heading");
    const comparisonEl = document.getElementById("why-me-comparison");
    const highlightsEl = document.getElementById("why-me-highlights");
    if (!whyMe || !comparisonEl || !highlightsEl) return;

    if (headingEl) headingEl.textContent = getLocValue(whyMe.heading);
    if (subtitleEl) subtitleEl.textContent = getLocValue(whyMe.subtitle);
    if (introEl) introEl.textContent = getLocValue(whyMe.intro);

    const headers = whyMe.tableHeaders || {};
    const rows = whyMe.rows || [];
    let tableHtml = `
      <div class="why-me-table-wrap">
        <table class="why-me-table">
          <thead>
            <tr>
              <th scope="col">${escapeHtml(getLocValue(headers.feature))}</th>
              <th scope="col" class="why-me-col-me">${escapeHtml(getLocValue(headers.me))}</th>
              <th scope="col" class="why-me-col-others">${escapeHtml(getLocValue(headers.others))}</th>
            </tr>
          </thead>
          <tbody>
    `;

    rows.forEach(function (row, index) {
      tableHtml += `
        <tr class="why-me-row" style="--row-delay:${index * 0.08}s">
          <th scope="row">${escapeHtml(getLocValue(row.feature))}</th>
          <td class="why-me-col-me">${renderWhyMeValueCell(getLocValue(row.meValue), row.mePositive !== false)}</td>
          <td class="why-me-col-others">${renderWhyMeValueCell(getLocValue(row.othersValue), row.othersPositive === true)}</td>
        </tr>
      `;
    });

    tableHtml += "</tbody></table></div>";
    comparisonEl.innerHTML = tableHtml;

    const highlights = whyMe.highlights || [];
    let highlightsHtml = '<div class="why-me-highlights-grid">';
    highlights.forEach(function (item) {
      highlightsHtml += `
        <article class="why-me-highlight-card">
          <span class="why-me-highlight-icon"><i class="fa ${escapeHtml(item.icon || "fa-star")}" aria-hidden="true"></i></span>
          <h4>${escapeHtml(getLocValue(item.title))}</h4>
          <p>${escapeHtml(getLocValue(item.description))}</p>
        </article>
      `;
    });
    highlightsHtml += "</div>";
    highlightsEl.innerHTML = highlightsHtml;
  }

  function renderWorkflow(workflow) {
    const container = document.getElementById("workflow-container");
    if (!container || !workflow) return;

    const subtitleEl = document.getElementById("workflow-subtitle");
    if (subtitleEl) {
      subtitleEl.textContent = getLocValue(workflow.subtitle);
    }

    const steps = workflow.steps || [];
    
    const getStepIcon = (num) => {
      switch (num) {
        case 1: return "fa-comments-o";
        case 2: return "fa-search";
        case 3: return "fa-clock-o";
        case 4: return "fa-handshake-o";
        case 5: return "fa-check-circle";
        case 6: return "fa-heart";
        default: return "fa-cog";
      }
    };

    let stepsHtml = "";
    steps.forEach((step, idx) => {
      const title = getLocValue(step.title);
      const desc = getLocValue(step.description);
      const icon = getStepIcon(step.stepNumber);
      
      stepsHtml += `
        <div class="workflow-step-node" style="--i:${idx};">
          <!-- Connector line from hub to card (desktop only) -->
          <div class="step-connector-line" style="--i:${idx};">
            <div class="step-connector-line-active" style="--i:${idx};"></div>
          </div>
          <!-- Card container positioned at end of connector -->
          <div class="step-card-container" style="--i:${idx};">
            <div class="step-card" style="--i:${idx};">
              <div class="step-number">${step.stepNumber}</div>
              <div class="step-icon-wrap">
                <i class="fa ${icon}"></i>
              </div>
              <h5 class="step-title">${escapeHtml(title)}</h5>
              <p class="step-desc">${escapeHtml(desc)}</p>
            </div>
          </div>
        </div>
      `;
    });

    let hubTitle = "Workflow";
    if (currentLang === "ar") hubTitle = "\u062e\u0637\u0629 \u0627\u0644\u0639\u0645\u0644";
    else if (currentLang === "ru") hubTitle = "\u041f\u043b\u0430\u043d \u0440\u0430\u0431\u043e\u0442\u044b";

    container.innerHTML = `
      <div class="workflow-outer">
        <!-- Desktop SVG Circular Track -->
        <svg class="workflow-svg-circle" viewBox="0 0 600 600">
          <circle cx="300" cy="300" r="220" class="workflow-circle-track" />
          <circle cx="300" cy="300" r="220" class="workflow-circle-active" />
        </svg>
        
        <!-- Desktop Central Hub -->
        <div class="workflow-center-hub">
          <div class="hub-icon"><i class="fa fa-cogs"></i></div>
          <div class="hub-title">${escapeHtml(hubTitle)}</div>
        </div>

        <!-- Mobile progress line -->
        <div class="workflow-progress-line"></div>

        <!-- Steps Nodes -->
        ${stepsHtml}
      </div>
    `;

    const workflowSection = document.getElementById("workflow");
    if (workflowSection) {
      // Remove stale class in case of language switch re-render
      workflowSection.classList.remove("workflow-active");
      if (window.IntersectionObserver) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              workflowSection.classList.add("workflow-active");
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.12
        });
        observer.observe(workflowSection);
      } else {
        workflowSection.classList.add("workflow-active");
      }
    }
  }

  function renderFooter(about) {
    if (!about) return;

    // Logo & Name
    const logoNameEl = document.getElementById("footer-logo-name");
    if (logoNameEl) {
      const first = getLocValue(about.firstName);
      const last = getLocValue(about.lastName);
      logoNameEl.innerHTML = `${first} <span>${last}</span>`;
    }

    // Description text
    const descTextEl = document.getElementById("footer-desc-text");
    if (descTextEl) {
      if (currentLang === "ar") {
        descTextEl.textContent = "مهندس برمجيات متخصص في بناء تطبيقات ومواقع إلكترونية حديثة بأفضل تجربة مستخدم.";
      } else if (currentLang === "ru") {
        descTextEl.textContent = "Инженер-программиست, специализирующийся на создании современных веб- и мобильных приложений с отличным пользовательским опытом.";
      } else {
        descTextEl.textContent = "Software Engineer specializing in modern web and mobile applications with outstanding user experiences.";
      }
    }

    // Copyright text
    const copyTextEl = document.getElementById("footer-copy-text");
    if (copyTextEl) {
      const year = new Date().getFullYear();
      const first = getLocValue(about.firstName);
      const last = getLocValue(about.lastName);
      const fullName = `${first} ${last}`.trim();
      if (currentLang === "ar") {
        copyTextEl.textContent = `© ${year} ${fullName}. جميع الحقوق محفوظة.`;
      } else if (currentLang === "ru") {
        copyTextEl.textContent = `© ${year} ${fullName}. Все права защищены.`;
      } else {
        copyTextEl.textContent = `© ${year} ${fullName}. All rights reserved.`;
      }
    }

    // Titles
    const linksTitleEl = document.getElementById("footer-links-title");
    if (linksTitleEl) {
      if (currentLang === "ar") linksTitleEl.textContent = "روابط سريعة";
      else if (currentLang === "ru") linksTitleEl.textContent = "Быстрые ссылки";
      else linksTitleEl.textContent = "Quick Links";
    }

    const contactTitleEl = document.getElementById("footer-contact-title");
    if (contactTitleEl) {
      if (currentLang === "ar") contactTitleEl.textContent = "اتصل بي والشبكات";
      else if (currentLang === "ru") contactTitleEl.textContent = "Контакты и соцсети";
      else contactTitleEl.textContent = "Contact & Social";
    }

    // Link labels translation from UI config
    const ui = siteData.ui || {};
    const linkMap = {
      "footer-link-about": ui.navAbout,
      "footer-link-experience": ui.navExperience,
      "footer-link-portfolio": ui.navPortfolio,
      "footer-link-skills": ui.navSkills,
      "footer-link-awards": ui.navAwards,
      "footer-link-testimonials": ui.navTestimonials,
      "footer-link-workflow": ui.navWorkflow,
      "footer-link-why-me": ui.navWhyMe
    };
    for (const id in linkMap) {
      const el = document.getElementById(id);
      if (el) el.textContent = getLocValue(linkMap[id]);
    }

    // Social Links
    const socialContainer = document.getElementById("footer-social-container");
    if (socialContainer && about.socials) {
      let socialHtml = "";
      ABOUT_SOCIAL_PLATFORMS.filter(function (platform) {
        return hasSocialLink(about.socials, platform);
      }).forEach(function (platform) {
        const url = normalizeSocialUrl(about.socials[platform.key]);
        const inner = platform.type === "fa" 
          ? `<i class="fa fa-${platform.icon}"></i>`
          : `<img src="${platform.image}" alt="${platform.label}">`;
        
        socialHtml += `
          <a href="${url}" target="_blank" rel="noopener noreferrer" 
             class="footer-social-link" aria-label="${platform.label}"
             style="--hover-bg: ${platform.brandColor}24; --hover-border: ${platform.brandColor}">
            ${inner}
          </a>
        `;
      });
      socialContainer.innerHTML = socialHtml;
    }
  }

  function initAwardsBgAnimation() {
    const awardsSection = document.getElementById("awards");
    if (!awardsSection) return;

    let bgContainer = awardsSection.querySelector(".awards-bg-shapes");
    if (!bgContainer) {
      bgContainer = document.createElement("div");
      bgContainer.className = "awards-bg-shapes";
      awardsSection.insertBefore(bgContainer, awardsSection.firstChild);
    }

    const shapeCount = 15;
    bgContainer.innerHTML = "";
    for (let i = 0; i < shapeCount; i++) {
      const shape = document.createElement("div");
      const types = ["star", "sparkle", "gem"];
      const type = types[Math.floor(Math.random() * types.length)];
      shape.className = `award-shape ${type}`;
      
      const size = Math.random() * 18 + 12; // 12px to 30px
      shape.style.width = `${size}px`;
      shape.style.height = `${size}px`;
      shape.style.left = `${Math.random() * 90 + 5}%`;
      
      shape.style.animationDelay = `${Math.random() * 12}s`;
      shape.style.animationDuration = `${Math.random() * 12 + 18}s`; // 18s to 30s
      
      const drift = Math.random() * 60 - 30; // -30px to 30px
      const maxOpacity = Math.random() * 0.15 + 0.15; // 0.15 to 0.30
      shape.style.setProperty("--drift", `${drift}px`);
      shape.style.setProperty("--max-opacity", maxOpacity);
      
      bgContainer.appendChild(shape);
    }

    if (window.IntersectionObserver) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            awardsSection.classList.add("awards-animating");
          } else {
            awardsSection.classList.remove("awards-animating");
          }
        });
      }, {
        threshold: 0.05
      });
      observer.observe(awardsSection);
    } else {
      awardsSection.classList.add("awards-animating");
    }
  }

  // Intersection Observer for scroll animation reveals
  function initScrollReveal() {
    if (!window.IntersectionObserver) {
      document.querySelectorAll("section, .resume-item, .skill-item, .award, .portfolio-item").forEach((el) => {
        el.classList.remove("reveal");
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px 0px -40px 0px"
    });

    const selectors = [
      "section.resume-section:not(#about)",
      "#experience-list .resume-item",
      "#skills-grid .skill-item",
      "#awards-list .award-showcase-card",
      "#awards-list .award",
      "#testimonials-grid .testimonial-card",
      ".why-me-table-wrap",
      ".why-me-highlight-card",
      "#portfolio-grid .portfolio-item"
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach((el) => {
        el.classList.remove("active");
        el.classList.add("reveal");
        observer.observe(el);
      });
    });
  }

  // Smart Auto-Hiding Navbar on Mobile
  let lastScrollTop = 0;
  const delta = 8;
  const navbar = document.getElementById("sideNav");

  window.addEventListener("scroll", function () {
    if (window.innerWidth >= 992 || !navbar) return;

    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Make sure they scroll more than delta
    if (Math.abs(lastScrollTop - scrollTop) <= delta) return;

    // Check if collapsed mobile menu is open
    const isMenuOpen = document.getElementById("navbarSupportedContent")?.classList.contains("show");
    if (isMenuOpen) return;

    // If scroll down and past navbar height, hide it
    if (scrollTop > lastScrollTop && scrollTop > 60) {
      navbar.classList.add("nav-hidden");
    } else {
      // Scroll Up
      navbar.classList.remove("nav-hidden");
    }

    lastScrollTop = scrollTop;
  });
});

// ============================================================
// Mobile Unified Controls Panel (Language + Theme)
// ============================================================

(function () {
  // currentLang for tools rendering - reads from localStorage (kept in sync with main DOMContentLoaded)
  var currentLang = localStorage.getItem('preferredLang') || 'ar';
  var isOpen = false;

  function openPanel() {
    var btn   = document.getElementById('mobile-controls-btn');
    var panel = document.getElementById('mobile-controls-panel');
    if (!btn || !panel) return;
    isOpen = true;
    btn.classList.add('is-open');
    panel.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    // Ripple effect
    btn.classList.remove('ripple');
    void btn.offsetWidth; // reflow
    btn.classList.add('ripple');
    setTimeout(function() { btn.classList.remove('ripple'); }, 500);
  }

  function closePanel() {
    var btn   = document.getElementById('mobile-controls-btn');
    var panel = document.getElementById('mobile-controls-panel');
    if (!btn || !panel) return;
    isOpen = false;
    btn.classList.remove('is-open');
    panel.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  }

  window.toggleMobileControls = function () {
    if (isOpen) { closePanel(); } else { openPanel(); }
  };

  // Close when clicking outside
  document.addEventListener('click', function (e) {
    var wrapper = document.getElementById('mobile-controls-wrapper');
    if (isOpen && wrapper && !wrapper.contains(e.target)) {
      closePanel();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) { closePanel(); }
  });

  // Update chip active state to match current language
  function syncLangChips(lang) {
    var chips = document.querySelectorAll('.mobile-lang-chip');
    chips.forEach(function (chip) {
      if (chip.getAttribute('data-lang') === lang) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  window.selectMobileLang = function (lang) {
    if (window.setLanguage) { window.setLanguage(lang); }
    syncLangChips(lang);
    // Keep panel open so user can also toggle theme
  };

  // Backward compat: keep old toggleMobileLangDropdown as no-op
  window.toggleMobileLangDropdown = function () {};

  // Sync chips on page load based on saved language
  document.addEventListener('DOMContentLoaded', function () {
    var savedLang = localStorage.getItem('preferredLang') || 'ar';
    syncLangChips(savedLang);
  });

  // ===== TOOLS & SKILLS SECTION =====
  function renderTools(data) {
    // Always read the latest language from localStorage before rendering
    currentLang = localStorage.getItem('preferredLang') || 'ar';
    if (!data.tools) return;
    
    const toolsHeading = document.getElementById('tools-heading');
    const toolsSubtitle = document.getElementById('tools-subtitle');
    const toolsContainer = document.getElementById('tools-container');
    
    if (!toolsContainer) return;
    
    // Update heading and subtitle
    if (toolsHeading && data.tools.heading) {
      toolsHeading.textContent = data.tools.heading[currentLang] || data.tools.heading.en;
    }
    if (toolsSubtitle && data.tools.subtitle) {
      toolsSubtitle.textContent = data.tools.subtitle[currentLang] || data.tools.subtitle.en;
    }
    
    // Clear container
    toolsContainer.innerHTML = '';
    
    // Render categories
    if (data.tools.categories && Array.isArray(data.tools.categories)) {
      data.tools.categories.forEach(function(category) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'tools-category';
        
        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'tools-category-title';
        categoryTitle.textContent = category.title[currentLang] || category.title.en;
        categoryDiv.appendChild(categoryTitle);
        
        // Render tool items
        if (category.items && Array.isArray(category.items)) {
          category.items.forEach(function(tool) {
            const toolDiv = document.createElement('div');
            toolDiv.className = 'tool-item';
            toolDiv.style.cursor = 'pointer';
            
            const iconDiv = document.createElement('div');
            iconDiv.className = 'tool-icon';
            
            // Check if it's a Font Awesome icon or a custom class
            if (tool.icon.includes('devicon')) {
              const i = document.createElement('i');
              i.className = tool.icon;
              iconDiv.appendChild(i);
            } else {
              const i = document.createElement('i');
              i.className = 'fa ' + tool.icon;
              iconDiv.appendChild(i);
            }
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'tool-name';
            nameDiv.textContent = tool.name[currentLang] || tool.name.en;

            // Hint text
            const hintTexts = { ar: '← اضغط للشرح', en: 'Tap to learn why →', ru: 'Нажмите →' };
            const hintDiv = document.createElement('div');
            hintDiv.className = 'tool-item-hint';
            hintDiv.innerHTML = `<i class="fa fa-info-circle"></i> ${hintTexts[currentLang] || hintTexts.en}`;
            
            toolDiv.appendChild(iconDiv);
            toolDiv.appendChild(nameDiv);
            toolDiv.appendChild(hintDiv);
            
            // Add click event to show detail modal
            toolDiv.addEventListener('click', function() {
              showToolDetail(tool);
            });
            
            categoryDiv.appendChild(toolDiv);
          });
        }
        
        toolsContainer.appendChild(categoryDiv);
      });
    }
  }
  
  function showToolDetail(tool) {
    // Create or get modal
    let modal = document.getElementById('tool-detail-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'tool-detail-modal';
      modal.className = 'tool-detail-modal';
      modal.innerHTML = `
        <div class="tool-detail-backdrop"></div>
        <div class="tool-detail-dialog">
          <button class="tool-detail-close" onclick="closeToolDetail()">&times;</button>
          <div class="tool-detail-header">
            <div class="tool-detail-icon"></div>
            <h3 class="tool-detail-title"></h3>
          </div>
          <div class="tool-detail-content"></div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Close on backdrop click
      modal.querySelector('.tool-detail-backdrop').addEventListener('click', closeToolDetail);
      
      // Close on Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
          closeToolDetail();
        }
      });
    }
    
    // Populate modal content
    const icon = modal.querySelector('.tool-detail-icon');
    const title = modal.querySelector('.tool-detail-title');
    const content = modal.querySelector('.tool-detail-content');
    
    icon.innerHTML = '';
    if (tool.icon.includes('devicon')) {
      const i = document.createElement('i');
      i.className = tool.icon;
      icon.appendChild(i);
    } else {
      const i = document.createElement('i');
      i.className = 'fa ' + tool.icon;
      icon.appendChild(i);
    }
    
    title.textContent = tool.name[currentLang] || tool.name.en;

    // Build modal content with "Why I prefer this" label
    const whyLabels = { ar: 'لماذا أفضل هذا بالتحديد؟', en: 'Why I prefer this specifically?', ru: 'Почему именно это?' };
    const whyLabel = whyLabels[currentLang] || whyLabels.en;
    const descText = tool.description[currentLang] || tool.description.en || '';
    content.innerHTML = `<div class="tool-why-label"><i class="fa fa-lightbulb-o"></i> ${whyLabel}</div><p>${descText}</p>`;
    
    // Show modal with animation
    modal.classList.add('is-open');
  }
  
  window.closeToolDetail = function() {
    const modal = document.getElementById('tool-detail-modal');
    if (modal) {
      modal.classList.remove('is-open');
    }
  };
  
  // Update footer link text for Tools
  function updateToolsFooterLink() {
    const footerLink = document.getElementById('footer-link-tools');
    if (footerLink && siteData && siteData.tools) {
      footerLink.textContent = siteData.tools.heading[currentLang] || siteData.tools.heading.en || 'Tools';
    }
  }

  // Update nav link text for Tools (sidebar navigation)
  function updateToolsNavLink() {
    const navLink = document.getElementById('nav-link-tools');
    if (navLink && siteData) {
      // Use ui.navTools if available, else fall back to tools.heading
      const navText = (siteData.ui && siteData.ui.navTools)
        ? (siteData.ui.navTools[currentLang] || siteData.ui.navTools.en)
        : (siteData.tools && siteData.tools.heading
            ? (siteData.tools.heading[currentLang] || siteData.tools.heading.en)
            : 'Tools');
      navLink.textContent = navText;
    }
  }
  
  // Expose renderTools globally so the main DOMContentLoaded renderAll can call it
  window.renderTools = renderTools;
  window.updateToolsFooterLink = updateToolsFooterLink;
  window.updateToolsNavLink = updateToolsNavLink;
}());
