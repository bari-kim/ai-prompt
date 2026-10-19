document.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.image) {
    document.getElementById("selected-image").src = button.dataset.image;
    document.querySelectorAll("[data-image]").forEach((item) => item.classList.toggle("selected", item === button));
  }
  if (button.hasAttribute("data-copy")) {
    const text = button.classList.contains("copy-all") ? button.nextElementSibling.textContent : button.closest("section").querySelector("pre").textContent;
    const status = document.getElementById("copy-status");
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "복사했습니다.";
    } catch {
      status.textContent = "복사하지 못했습니다. 프롬프트를 직접 선택해 복사해 주세요.";
    }
  }
});
