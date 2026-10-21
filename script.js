const resume = document.querySelector("#resume");
const languageButtons = document.querySelectorAll("[data-language]");
const printButton = document.querySelector("[data-print]");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector(".lightbox-image");
const lightboxTitle = lightbox.querySelector("#lightbox-title");
const lightboxText = lightbox.querySelector("[data-lightbox-text]");
const lightboxCounter = lightbox.querySelector("[data-lightbox-counter]");
const videoDialog = document.querySelector(".video-dialog");
const videoPlayer = videoDialog.querySelector("video");
const videoSeek = videoDialog.querySelector("[data-video-seek]");
const videoPlay = videoDialog.querySelector("[data-video-play]");
const videoMute = videoDialog.querySelector("[data-video-mute]");
const videoVolume = videoDialog.querySelector("[data-video-volume]");
const videoTime = videoDialog.querySelector("[data-video-time]");
const videoStatus = videoDialog.querySelector(".video-status");
const videoLabels = {
  en: { play: "Play", pause: "Pause", mute: "Mute", unmute: "Unmute", seek: "Seek", volume: "Volume", error: "Unable to play this video. Please close and try again." },
  zh: { play: "播放", pause: "暫停", mute: "靜音", unmute: "取消靜音", seek: "播放進度", volume: "音量", error: "影片無法播放，請關閉後重試。" },
  ja: { play: "再生", pause: "一時停止", mute: "ミュート", unmute: "ミュート解除", seek: "再生位置", volume: "音量", error: "動画を再生できません。閉じて再試行してください。" },
};
let activeVideoLabels = videoLabels.en;

function formatVideoTime(seconds) {
  const value = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

function updateVideoControls() {
  const duration = videoPlayer.duration;
  videoSeek.disabled = !Number.isFinite(duration) || duration <= 0;
  videoSeek.max = videoSeek.disabled ? 100 : duration;
  videoSeek.value = videoPlayer.currentTime;
  videoSeek.setAttribute("aria-valuetext", `${formatVideoTime(videoPlayer.currentTime)} / ${formatVideoTime(duration)}`);
  videoTime.textContent = `${formatVideoTime(videoPlayer.currentTime)} / ${formatVideoTime(duration)}`;
  const playLabel = videoPlayer.paused ? activeVideoLabels.play : activeVideoLabels.pause;
  videoPlay.setAttribute("aria-label", playLabel);
  videoPlay.title = playLabel;
  videoPlay.classList.toggle("is-playing", !videoPlayer.paused);
  const muteLabel = videoPlayer.muted ? activeVideoLabels.unmute : activeVideoLabels.mute;
  videoMute.setAttribute("aria-label", muteLabel);
  videoMute.title = muteLabel;
  videoMute.classList.toggle("is-muted", videoPlayer.muted || videoPlayer.volume === 0);
  videoMute.setAttribute("aria-pressed", String(videoPlayer.muted));
  videoVolume.value = videoPlayer.muted ? 0 : videoPlayer.volume;
}

videoPlay.addEventListener("click", async () => {
  if (!videoPlayer.paused) return videoPlayer.pause();
  try {
    await videoPlayer.play();
    videoStatus.textContent = "";
  } catch {
    if (videoDialog.open) videoStatus.textContent = activeVideoLabels.error;
  }
});
videoSeek.addEventListener("input", () => { videoPlayer.currentTime = Number(videoSeek.value); });
videoMute.addEventListener("click", () => { videoPlayer.muted = !videoPlayer.muted; });
videoVolume.addEventListener("input", () => {
  videoPlayer.volume = Number(videoVolume.value);
  videoPlayer.muted = videoPlayer.volume === 0;
});
for (const event of ["loadedmetadata", "durationchange", "timeupdate", "play", "pause", "ended", "volumechange", "emptied"]) {
  videoPlayer.addEventListener(event, updateVideoControls);
}
videoPlayer.addEventListener("error", () => {
  if (videoDialog.open) videoStatus.textContent = activeVideoLabels.error;
});

const languageMeta = {
  en: { lang: "en", title: "Rex Ying Resume", close: "Close", previous: "Previous image", next: "Next image" },
  zh: { lang: "zh-Hant", title: "Rex Ying 履歷", close: "關閉", previous: "上一張", next: "下一張" },
  ja: { lang: "ja", title: "Rex Ying 履歴書", close: "閉じる", previous: "前の画像", next: "次の画像" },
};

const screenLabels = {
  en: {
    navigation: "Page sections", language: "Language", experience: "Experience", work: "Selected work", expertise: "Expertise",
    print: "Print / PDF",
  },
  zh: {
    navigation: "頁面導覽", language: "語言", experience: "工作經歷", work: "精選作品", expertise: "專業技能",
    print: "列印 / PDF",
  },
  ja: {
    navigation: "ページ内ナビゲーション", language: "言語", experience: "職務経歴", work: "制作実績", expertise: "専門スキル",
    print: "印刷 / PDF",
  },
};

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealSelector = [
  ".experience > .section-heading",
  ".company-row",
  ".experience > .achievement-list",
  ".projects > .section-heading",
  ".project",
  ".additional-work > .section-heading",
  ".mini-project-list article",
  ".bottom-grid > section",
].join(", ");

const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(revealEntries, { rootMargin: "0px 0px -5% 0px", threshold: 0.01 })
    : null;

let lightboxIndex = 0;
let activeLanguage = "en";
let scrollFrame = null;
let disposeLiquidFrames = () => {};

function renderResume(language, preservePosition = false) {
  const template = document.querySelector(`#resume-${language}`);

  if (!template) return;

  const position = preservePosition ? captureReadingPosition() : null;
  disposeLiquidFrames();
  revealObserver?.disconnect();
  if (resume.dataset.renderedLanguage !== language || !resume.firstElementChild) {
    resume.replaceChildren(template.content.cloneNode(true));
  }
  resume.dataset.renderedLanguage = language;
  const meta = languageMeta[language];
  activeLanguage = language;

  document.documentElement.lang = meta.lang;
  document.title = meta.title;
  try {
    localStorage.setItem("resume-language", language);
  } catch {
    // The resume also works when browser storage is unavailable.
  }

  decorateResume(screenLabels[language]);
  disposeLiquidFrames = observeLiquidFrames();

  languageButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });

  lightbox.querySelector("[data-lightbox-close]").setAttribute("aria-label", meta.close);
  lightbox.querySelector('[data-lightbox-step="-1"]').setAttribute("aria-label", meta.previous);
  lightbox.querySelector('[data-lightbox-step="1"]').setAttribute("aria-label", meta.next);
  const videoClose = videoDialog.querySelector("[data-video-close]");
  videoClose.setAttribute("aria-label", meta.close);
  videoClose.title = meta.close;
  activeVideoLabels = videoLabels[language];
  videoSeek.setAttribute("aria-label", activeVideoLabels.seek);
  videoVolume.setAttribute("aria-label", activeVideoLabels.volume);
  updateVideoControls();

  if (position) restoreReadingPosition(position);
  observeReveals();
  scheduleScrollUpdate();
}

function decorateResume(labels) {
  const hero = resume.querySelector(".hero");
  hero.id = "top";
  resume.querySelector(".experience").id = "experience";
  resume.querySelector(".projects").id = "work";
  resume.querySelector(".bottom-grid").id = "expertise";

  resume.querySelectorAll(".project").forEach((project, index) => {
    project.id = ["birdie-wing", "pili-universe", "monster-fruit"][index];
  });
  resume.querySelectorAll(".video-link").forEach((link) => {
    const label = link.textContent;
    link.setAttribute("aria-label", label);
    link.title = label;
    link.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7z" /></svg>';
    const text = document.createElement("span");
    text.className = "sr-only";
    text.textContent = label;
    link.append(text);
  });

  document.querySelector(".section-nav")?.setAttribute("aria-label", labels.navigation);
  document.querySelector(".language-switch")?.setAttribute("aria-label", labels.language);
  for (const key of ["experience", "work", "expertise"]) {
    const link = document.querySelector(`[data-nav="${key}"]`);
    if (link) link.textContent = labels[key];
  }
  printButton.setAttribute("aria-label", labels.print);
  printButton.title = labels.print;
}

function observeLiquidFrames() {
  const disposers = [];
  const projects = [...resume.querySelectorAll(".project")];
  if (!("IntersectionObserver" in window)) {
    projects.forEach(project => disposers.push(setupLiquidFrames(project)));
    return () => disposers.forEach(dispose => dispose());
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      disposers.push(setupLiquidFrames(entry.target));
      observer.unobserve(entry.target);
    }
  }, { rootMargin: "300px" });
  projects.forEach(project => observer.observe(project));
  return () => { observer.disconnect(); disposers.forEach(dispose => dispose()); };
}

function setupLiquidFrames(project) {
  if (!window.ResizeObserver) return () => {};
  const controller = new AbortController();
  const options = { signal: controller.signal, passive: true };
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  let frame = null;
  const items = [...project.querySelectorAll(".project-visual")].map((figure, index) => {
    const button = figure.querySelector(".visual-trigger");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("liquid-frame", "screen-only");
    svg.setAttribute("aria-hidden", "true");
    const id = `liquid-${project.id}-${index}`;
    svg.innerHTML = `<defs><filter id="${id}" x="-20%" y="-30%" width="140%" height="160%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="7"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/></filter></defs><rect x="33" y="33" rx="27"/><g filter="url(#${id})"><circle class="liquid-anchor" r="0"/><circle class="liquid-drop" r="0"/></g>`;
    figure.prepend(svg);
    return { figure, button, svg, rect: svg.querySelector("rect"), drop: svg.querySelector(".liquid-drop"), anchor: svg.querySelector(".liquid-anchor"), x: 40, y: 40, tx: 40, ty: 40, r: 0, target: 0 };
  });
  const resize = new ResizeObserver(() => {
    for (const item of items) {
      const { width, height } = item.button.getBoundingClientRect();
      item.svg.setAttribute("width", width + 80);
      item.svg.setAttribute("height", height + 80);
      item.rect.setAttribute("width", width + 14);
      item.rect.setAttribute("height", height + 14);
    }
  });
  items.forEach(item => resize.observe(item.button));
  function tick() {
    frame = null;
    let moving = false;
    for (const item of items) {
      item.x += (item.tx - item.x) * .23;
      item.y += (item.ty - item.y) * .23;
      item.r += (item.target - item.r) * .18;
      item.drop.setAttribute("cx", item.x);
      item.drop.setAttribute("cy", item.y);
      item.drop.setAttribute("r", item.r);
      item.anchor.setAttribute("r", item.r * .65);
      moving ||= Math.abs(item.tx - item.x) + Math.abs(item.ty - item.y) + Math.abs(item.target - item.r) > .1;
    }
    if (moving) frame = requestAnimationFrame(tick);
  }
  const schedule = () => { if (frame === null) frame = requestAnimationFrame(tick); };
  function reset() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    for (const item of items) { item.r = item.target = 0; item.drop.setAttribute("r", "0"); item.anchor.setAttribute("r", "0"); }
  }
  document.addEventListener("pointermove", event => {
    if (!finePointer.matches || motionPreference.matches || event.pointerType === "touch") return;
    for (const item of items) {
      const box = item.button.getBoundingClientRect();
      const x = event.clientX - box.left, y = event.clientY - box.top;
      const distance = Math.hypot(Math.max(-x, 0, x - box.width), Math.max(-y, 0, y - box.height));
      item.target = distance < 52 && box.bottom > 0 && box.top < innerHeight ? 19 * (1 - distance / 65) : 0;
      if (item.target) {
        item.tx = x + 40;
        item.ty = y + 40;
        item.anchor.setAttribute("cx", Math.max(20, Math.min(box.width - 20, x)) + 40);
        item.anchor.setAttribute("cy", Math.max(0, Math.min(box.height, y)) + 40);
        if (item.r < .1) { item.x = item.tx; item.y = item.ty; }
      }
    }
    schedule();
  }, options);
  document.documentElement.addEventListener("pointerleave", reset, options);
  window.addEventListener("scroll", reset, options);
  window.addEventListener("blur", reset, options);
  document.addEventListener("visibilitychange", reset, options);
  motionPreference.addEventListener("change", reset, options);
  finePointer.addEventListener("change", reset, options);
  return () => { reset(); controller.abort(); resize.disconnect(); };
}

const readingBlockSelector = ".hero, .summary, .experience, .project, .additional-work, .bottom-grid";

function captureReadingPosition() {
  if (window.scrollY === 0) return null;
  const inset = (document.querySelector(".screen-toolbar")?.getBoundingClientRect().height || 0) + 24;
  const blocks = [...resume.querySelectorAll(readingBlockSelector)];
  let index = 0;
  blocks.forEach((block, blockIndex) => {
    if (block.getBoundingClientRect().top <= inset) index = blockIndex;
  });
  const rect = blocks[index].getBoundingClientRect();
  return { index, inset, fraction: Math.max(0, (inset - rect.top) / Math.max(rect.height, 1)) };
}

function restoreReadingPosition({ index, inset, fraction }) {
  const block = resume.querySelectorAll(readingBlockSelector)[index];
  if (!block) return;
  const rect = block.getBoundingClientRect();
  window.scrollTo({ top: window.scrollY + rect.top + rect.height * fraction - inset, behavior: "instant" });
}

function scheduleScrollUpdate() {
  if (scrollFrame !== null) return;
  scrollFrame = window.requestAnimationFrame(updateScrollState);
}

function updateScrollState() {
  scrollFrame = null;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
  const progressBar = document.querySelector(".reading-progress > span");
  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;

  const inset = (document.querySelector(".screen-toolbar")?.getBoundingClientRect().height || 0) + 80;
  const links = [...document.querySelectorAll("[data-nav]")];
  let current = null;
  for (const link of links) {
    const section = document.getElementById(link.dataset.nav);
    if (section && section.getBoundingClientRect().top <= inset) current = link;
  }
  for (const link of links) {
    if (link === current) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}

function observeReveals() {
  if (!revealObserver) return;

  revealObserver.disconnect();
  resume.querySelectorAll(revealSelector).forEach((element) => {
    if (motionPreference.matches || element.getBoundingClientRect().top < innerHeight) {
      element.classList.add("is-visible");
      return;
    }
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
}

function revealEntries(entries, observer) {
  entries
    .filter((entry) => entry.isIntersecting)
    .forEach((entry, index) => {
      entry.target.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 70}ms`);
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
}

function projectImages() {
  return [...resume.querySelectorAll(".project-visual img")];
}

function showLightboxImage(index) {
  const images = projectImages();
  lightboxIndex = (index + images.length) % images.length;
  const image = images[lightboxIndex];

  // Show the cached thumbnail first so opening feels instant, then swap in the full-size file.
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxTitle.textContent = image.closest("article").querySelector("h3").textContent;
  lightboxText.textContent = image.closest("figure").querySelector("figcaption").textContent;
  lightboxCounter.textContent = `${lightboxIndex + 1} / ${images.length}`;

  const fullImage = new Image();
  fullImage.src = image.dataset.full;
  fullImage.decode().then(
    () => {
      if (projectImages()[lightboxIndex] === image) lightboxImage.src = fullImage.src;
    },
    () => {},
  );
}

// Lazy images that never scrolled into view would otherwise print blank.
function loadAllImages() {
  const images = [...resume.querySelectorAll("img")];
  images.forEach((image) => {
    image.loading = "eager";
  });
  return Promise.allSettled(images.map((image) => image.decode()));
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.language !== activeLanguage) renderResume(button.dataset.language, true);
  });
});

window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
window.addEventListener("resize", scheduleScrollUpdate, { passive: true });
window.addEventListener("load", scheduleScrollUpdate);
motionPreference.addEventListener("change", observeReveals);

resume.addEventListener("click", (event) => {
  const videoLink = event.target.closest(".video-link");
  if (videoLink) {
    event.preventDefault();
    videoDialog.querySelector("#video-title").textContent = videoLink.closest("article").querySelector("h3").textContent;
    videoPlayer.poster = videoLink.dataset.videoPoster;
    videoStatus.textContent = "";
    videoPlayer.src = videoLink.href;
    videoDialog.showModal();
    return;
  }
  const trigger = event.target.closest(".visual-trigger");

  if (!trigger) return;

  showLightboxImage(projectImages().indexOf(trigger.querySelector("img")));
  lightbox.showModal();
});

videoDialog.querySelector("[data-video-close]").addEventListener("click", () => videoDialog.close());
videoDialog.addEventListener("close", () => {
  videoPlayer.pause();
  videoPlayer.removeAttribute("src");
  videoPlayer.load();
});

lightbox.addEventListener("click", (event) => {
  const stepButton = event.target.closest("[data-lightbox-step]");

  if (stepButton) {
    showLightboxImage(lightboxIndex + Number(stepButton.dataset.lightboxStep));
  } else if (!event.target.closest(".lightbox-image, .lightbox-caption")) {
    lightbox.close();
  }
});

lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showLightboxImage(lightboxIndex - 1);
  if (event.key === "ArrowRight") showLightboxImage(lightboxIndex + 1);
});

printButton.addEventListener("click", async () => {
  await loadAllImages();
  window.print();
});

window.addEventListener("beforeprint", loadAllImages);

let savedLanguage;
try {
  savedLanguage = localStorage.getItem("resume-language");
} catch {
  // Use English when browser storage is unavailable.
}
renderResume(["en", "zh", "ja"].includes(savedLanguage) ? savedLanguage : "en");
