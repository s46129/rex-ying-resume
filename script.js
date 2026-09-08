const resume = document.querySelector("#resume");
const languageButtons = document.querySelectorAll("[data-language]");
const printButton = document.querySelector("[data-print]");

function renderResume(language) {
  const template = document.querySelector(`#resume-${language}`);

  if (!template) return;

  resume.replaceChildren(template.content.cloneNode(true));
  document.documentElement.lang = language === "zh" ? "zh-Hant" : "en";
  document.title = language === "zh" ? "Rex Ying 履歷" : "Rex Ying Resume";
  localStorage.setItem("resume-language", language);

  languageButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => renderResume(button.dataset.language));
});

printButton.addEventListener("click", () => window.print());

const savedLanguage = localStorage.getItem("resume-language");
renderResume(savedLanguage === "zh" ? "zh" : "en");
