document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("aboutModal");
    const openBtn = document.getElementById("openAboutBtn");
    const closeBtn = document.getElementById("closeModalBtn");
  
    openBtn.addEventListener("click", () => {
      modal.style.display = "block";
    });
  
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        modal.style.display = "none";
      }
    });
  });
  