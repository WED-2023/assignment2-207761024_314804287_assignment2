document.addEventListener("DOMContentLoaded", () => {
  const shootKeySelect = document.getElementById("shootKey");

  for (let code = 65; code <= 90; code++) {
    const char = String.fromCharCode(code);
    const option = document.createElement("option");
    option.value = char;
    option.textContent = char;
    shootKeySelect.appendChild(option);
  }

  document.getElementById("configForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const shootKey = document.getElementById("shootKey").value;
    const gameTime = parseInt(document.getElementById("gameTime").value);

    if (gameTime < 2) {
      alert("Game time must be at least 2 minutes.");
      return;
    }

    const config = {
      shootKey,
      gameTime
    };

    localStorage.setItem("gameConfig", JSON.stringify(config));

    const bgAudio = new Audio("../audios/zaguri.mp3");
    bgAudio.loop = true;
    bgAudio.volume = 0.5;
    bgAudio.play().then(() => {
      window.location.href = "game.html";
    }).catch(() => {
      window.location.href = "game.html";
    });
    // bgAudio.play().then(() => {
    //   window.open("../htmlPages/game.html", "_blank");
    // }).catch(() => {
    //   window.open("../htmlPages/game.html", "_blank");
    // });    
  });
});


  