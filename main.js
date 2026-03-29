const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const input = {
  left: false,
  right: false,
  up: false,
  down: false,
  attack: false
};

const player = {
  x: 40,
  y: 40,
  width: 8,
  height: 8,
  speed: 60,
  facing: "right"
};

const sword = {
  active: false,
  timer: 0,
  duration: 0.12,
  width: 10,
  height: 3,
  handleSize: 4
};

let lastTime = 0;
const blockedKeys = ["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s", " "];

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (blockedKeys.includes(key)) {
    event.preventDefault();
  }

  if (key === "arrowleft" || key === "a") input.left = true;
  if (key === "arrowright" || key === "d") input.right = true;
  if (key === "arrowup" || key === "w") input.up = true;
  if (key === "arrowdown" || key === "s") input.down = true;
  if (key === " " && !event.repeat) input.attack = true;
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowleft" || key === "a") input.left = false;
  if (key === "arrowright" || key === "d") input.right = false;
  if (key === "arrowup" || key === "w") input.up = false;
  if (key === "arrowdown" || key === "s") input.down = false;
});

function update(deltaTime) {
  if (input.left) {
    player.x -= player.speed * deltaTime;
    player.facing = "left";
  }

  if (input.right) {
    player.x += player.speed * deltaTime;
    player.facing = "right";
  }

  if (input.up) {
    player.y -= player.speed * deltaTime;
    player.facing = "up";
  }

  if (input.down) {
    player.y += player.speed * deltaTime;
    player.facing = "down";
  }

  if (input.attack && !sword.active) {
    sword.active = true;
    sword.timer = sword.duration;
    input.attack = false;
  }

  if (sword.active) {
    sword.timer -= deltaTime;

    if (sword.timer <= 0) {
      sword.active = false;
      sword.timer = 0;
    }
  }

  if (player.x < 0) player.x = 0;
  if (player.y < 0) player.y = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

function getSwordHitbox() {
  if (player.facing === "left") {
    return {
      x: player.x - sword.width,
      y: player.y + 1,
      width: sword.width,
      height: sword.height
    };
  }

  if (player.facing === "right") {
    return {
      x: player.x + player.width,
      y: player.y + player.height - sword.height - 1,
      width: sword.width,
      height: sword.height
    };
  }

  if (player.facing === "up") {
    return {
      x: player.x + player.width - sword.height - 1,
      y: player.y - sword.width,
      width: sword.height,
      height: sword.width
    };
  }

  return {
    x: player.x + 1,
    y: player.y + player.height,
    width: sword.height,
    height: sword.width
  };
}

function renderSword(hitbox) {
  ctx.fillStyle = "#7a4f24";

  if (player.facing === "left") {
    ctx.fillRect(hitbox.x + hitbox.width - sword.handleSize, hitbox.y, sword.handleSize, hitbox.height);
  } else if (player.facing === "right") {
    ctx.fillRect(hitbox.x, hitbox.y, sword.handleSize, hitbox.height);
  } else if (player.facing === "up") {
    ctx.fillRect(hitbox.x, hitbox.y + hitbox.height - sword.handleSize, hitbox.width, sword.handleSize);
  } else {
    ctx.fillRect(hitbox.x, hitbox.y, hitbox.width, sword.handleSize);
  }

  ctx.fillStyle = "#fff1e8";

  if (player.facing === "left") {
    ctx.fillRect(hitbox.x, hitbox.y, hitbox.width - sword.handleSize, hitbox.height);
  } else if (player.facing === "right") {
    ctx.fillRect(hitbox.x + sword.handleSize, hitbox.y, hitbox.width - sword.handleSize, hitbox.height);
  } else if (player.facing === "up") {
    ctx.fillRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height - sword.handleSize);
  } else {
    ctx.fillRect(hitbox.x, hitbox.y + sword.handleSize, hitbox.width, hitbox.height - sword.handleSize);
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#1d2b53";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffcc00";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  if (sword.active) {
    const hitbox = getSwordHitbox();
    renderSword(hitbox);
  }
}

function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  update(deltaTime);
  render();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
