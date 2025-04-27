const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  // Set canvas dimensions to match window size
  canvas.width = window.innerWidth * 1;
  canvas.height = window.innerHeight * 0.42;
  
  startX = Math.random() * (canvas.width - ship.width) + ship.width / 2;
  startY = canvas.height - ship.height - 20;

  ship.x = startX;
  ship.y = startY;
  
}

// Call resize function when page loads
window.addEventListener('load', resizeCanvas);
// Call resize function when window is resized
window.addEventListener('resize', resizeCanvas);


// Load config
const config = JSON.parse(localStorage.getItem("gameConfig")) || {
  shootKey: " ",
  gameTime: 2,
  playerColor: "#00ff00",
  enemyColor: "#ff0000"
};

// Load assets
const fireSound = document.getElementById("fireSound");
const hitSound = document.getElementById("hitSound");
const deathSound = document.getElementById("deathSound");
const backgroundMusic = document.getElementById("bgMusic");
document.addEventListener("click", () => {
  if (backgroundMusic && backgroundMusic.paused) {
    backgroundMusic.volume = 0.5;
    backgroundMusic.play().catch(e => console.warn("The Music blocked by the broswer", e));
  }
}, { once: true });



let startX = Math.random() * (canvas.width - 40) + 20;
let startY = canvas.height - 100

// Load player and enemy images
const playerImage = new Image();
playerImage.src = "../images/ship.png";
const enemyImages = [
  "../images/open.png",
  "../images/sami.png",
  "../images/technion.png",
  "../images/telaviv.png"
].map(src => {
  const img = new Image();
  img.src = src;
  return img;
});


const ship = {
  x: startX,
  y: startY,
  width: 60,
  height: 90,
  speed: 5,
  color: config.playerColor,
  lives: 3
};

const bullets = [];
const enemies = [];

const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => delete keys[e.key]);

// Enemies init
const enemyRows = 4;
const enemyCols = 5;
const spacingX = 60;
const spacingY = 50;
const offsetX = 90;
const offsetY = 50;

const rowScores = [20, 15, 10, 5];

for (let r = 0; r < enemyRows; r++) {
  const enemyImage = enemyImages[r % enemyImages.length]; 
  for (let c = 0; c < enemyCols; c++) {
    enemies.push({
      x: offsetX + c * spacingX,
      y: offsetY + r * spacingY,
      radius: 15,
      score: rowScores[r],
      row: r,
      image: enemyImage
    });
  }
}



console.log("🛠️ Enemies initialized:", enemies);


let canShoot = true;
let score = 0;
let gameOver = false;
let elapsedSeconds = 0;
let enemyDirection = 1; // 1 = move right, -1 = move left
let enemySpeed = 1.2;
let enemyBullet = null; // Placeholder for enemy bullet
let gameEndReason = ""; // Will store 'victory', 'time', 'lost'
let speedBoosts = 0;
let manualRestart = false;





function shoot() {
  if (canShoot) {
    bullets.push({ x: ship.x, y: ship.y, speed: 5 });
    fireSound.play();
    canShoot = false;
    setTimeout(() => canShoot = true, 300);
  }
}

function update() {
  // Horizontal movement
  if (keys["ArrowLeft"] && ship.x > 0) ship.x -= ship.speed;
  if (keys["ArrowRight"] && ship.x < canvas.width - ship.width) ship.x += ship.speed;

  // Vertical movement (limited to bottom 40%)
  const lowerBound = canvas.height * 0.6;
  const upperBound = canvas.height - ship.height;

  if (keys["ArrowUp"] && ship.y > lowerBound) ship.y -= ship.speed;
  if (keys["ArrowDown"] && ship.y < upperBound) ship.y += ship.speed;


  // Use selected shoot key
  if (keys[config.shootKey]) shoot();

  bullets.forEach(b => b.y -= b.speed);
  for (let i = bullets.length - 1; i >= 0; i--) {
    if (bullets[i].y < 0) bullets.splice(i, 1);
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    for (let j = bullets.length - 1; j >= 0; j--) {
      const dx = enemies[i].x - bullets[j].x;
      const dy = enemies[i].y - bullets[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 10) {
        score += enemies[i].score; 
        enemies.splice(i, 1);
        if (enemies.length === 0) {
          endGame("victory");
        }        
        bullets.splice(j, 1);
        hitSound.play();
        break;
      }
      
    }
  }

  moveEnemies();

  if (enemyBullet) {
    enemyBullet.y += enemyBullet.speed;
  
    // Check if enemy bullet hits the player
    if (
      enemyBullet.x > ship.x - ship.width / 2 &&
      enemyBullet.x < ship.x + ship.width / 2 &&
      enemyBullet.y > ship.y &&
      enemyBullet.y < ship.y + ship.height
    ) {
      ship.lives--;
      deathSound.play();
      console.log("☠️ Player hit! Lives left:", ship.lives);
      enemyBullet = null;

      ship.x = startX;
      ship.y = startY;
  
      if (ship.lives <= 0) {
        endGame("lost");
      }
      return;
    }
  
    // Allow new bullet after ¾ screen height
    if (enemyBullet.y > canvas.height * 0.75 && !enemyBullet.released) {
      enemyBullet.released = true;
      console.log("🔓 Enemy bullet released for new shot");
    }
  
    // Remove bullet if off screen
    if (enemyBullet.y > canvas.height) {
      enemyBullet = null;
      console.log("🗑️ Enemy bullet removed from screen");
    }
  }
  

}


function draw() {
  // === Background ===
  const backgroundImage = new Image();
  backgroundImage.src = "../images/back.png";
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);


  // === Player ===
  ctx.drawImage(playerImage, ship.x - ship.width / 2, ship.y, ship.width, ship.height);

  // === Bullets ===
  ctx.fillStyle = "orange";
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });

  // === Enemies ===
  enemies.forEach(e => {
    ctx.drawImage(e.image, e.x - 20, e.y - 20, 60, 40);
  });

  // === Enemy Bullet ===
  if (!gameOver && enemyBullet && enemyBullet.color) {
    ctx.fillStyle = enemyBullet.color;
    ctx.beginPath();
    ctx.arc(enemyBullet.x, enemyBullet.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }

  // === Score / Lives / Timer ===
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "white";
  ctx.font = document.fonts && document.fonts.check('20px Orbitron')
    ? "20px Orbitron, sans-serif"
    : "20px Arial";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("Lives: " + ship.lives, 10, 40);
  const timeLeft = config.gameTime * 60 - elapsedSeconds;
  ctx.fillText("Time Left: " + formatTime(Math.max(0, timeLeft)), 10, 60);
  ctx.shadowBlur = 0; 

  // === Game Over Screen ===
  if (gameOver) {
    ctx.font = "40px Arial";
    ctx.fillStyle = "white";

    let message = "";
    if (gameEndReason === "victory") {
      message = "Champion!";
    } else if (gameEndReason === "lost") {
      message = "You Lost!";
    } else if (gameEndReason === "time") {
      message = score >= 100 ? "Winner!" : "You can do better";
    }

    ctx.fillText(message, canvas.width / 2 - ctx.measureText(message).width / 2, canvas.height / 2);

    // === Score History ===
    const username = localStorage.getItem("currentUser");
    if (username) {
      const key = `scores_${username}`;
      let scores = JSON.parse(localStorage.getItem(key)) || [];

      ctx.font = document.fonts && document.fonts.check('20px Orbitron')
        ? "20px Orbitron, sans-serif"
        : "20px Arial";
      ctx.fillStyle = "white";
      ctx.fillText("Score History:", 10, canvas.height / 2 + 40);

      scores.slice(0, 5).forEach((s, index) => {
        ctx.fillText(`${index + 1}. ${s}`, 30, canvas.height / 2 + 70 + index * 25);
      });
    }
  }
}


function loop() {
  if (gameOver) {
    draw(); // still draw the end message
    return;
  }

  update();
  draw();
  requestAnimationFrame(loop);
}


// Background music
if (backgroundMusic && backgroundMusic.paused) {
  backgroundMusic.volume = 0.5;
  backgroundMusic.play();
}

// Timer to end the game
setInterval(() => {
  if (!gameOver) {
    elapsedSeconds++;
    if (elapsedSeconds >= config.gameTime * 60) {
      endGame("time");
    }
  }
}, 1000);

function endGame(reason = "") {
  gameOver = true;
  gameEndReason = reason;
  enemyBullet = null; //prevent update/draw error after end

  if (backgroundMusic) backgroundMusic.pause();
  if (deathSound) deathSound.play();

  console.log("💀 Game Over triggered due to:", reason);
  document.getElementById("newGameBtn").style.display = "block";
  // Save score history for current user
  const username = localStorage.getItem("currentUser");
  if (!manualRestart && username) {
    const key = `scores_${username}`;
    let scores = JSON.parse(localStorage.getItem(key)) || [];

    scores.push(score);
    scores.sort((a, b) => b - a); // highest first
    localStorage.setItem(key, JSON.stringify(scores));
  }

}




function moveEnemies() {
  let edgeReached = false;

  enemies.forEach(e => {
    e.x += enemyDirection * enemySpeed;

    if (e.x + e.radius >= canvas.width || e.x - e.radius <= 0) {
      edgeReached = true;
    }
  });

  if (edgeReached) {
    enemyDirection *= -1;
    console.log("🔁 Changed direction to", enemyDirection === 1 ? "RIGHT" : "LEFT");
  }
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

document.getElementById("newGameBtn").addEventListener("click", () => {
  manualRestart = true;
  window.location.href = "game.html";
});


loop();

setInterval(() => {
  if (gameOver || (enemyBullet && !enemyBullet.released)) return;

  const shooter = enemies[Math.floor(Math.random() * enemies.length)];
  if (shooter) {
    enemyBullet = {
      x: shooter.x,
      y: shooter.y,
      speed: 3.5,
      color: "red",
      released: false
    };
    console.log("💥 Enemy fired!");
  }
}, 1500);


setInterval(() => {
  if (gameOver || speedBoosts >= 4) return;

  speedBoosts++;
  enemySpeed += 0.5;

  if (enemyBullet) {
    enemyBullet.speed += 0.5;
  }

  console.log(`🚀 Speed boosted (${speedBoosts}/4): enemySpeed=${enemySpeed}`);
}, 5000);




