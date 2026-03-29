import { createInput } from "./input.js";
import { createEnemy, hitEnemy, renderEnemy, touchesEnemy, updateEnemy } from "./enemy.js";
import {
  createPlayer,
  createSword,
  damagePlayer,
  getAttackHitbox,
  getPlayerHitbox,
  renderPlayer,
  renderPlayerHealth,
  updatePlayer
} from "./player.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const input = createInput();
const player = createPlayer();
const sword = createSword();
const enemy = createEnemy();

ctx.imageSmoothingEnabled = false;

let lastTime = 0;

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#1d2b53";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  renderEnemy(ctx, enemy);
  renderPlayer(ctx, player, sword);
  renderPlayerHealth(ctx, player);
}

function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  updatePlayer(player, sword, input, deltaTime, canvas);
  updateEnemy(enemy, player, deltaTime, canvas);
  hitEnemy(enemy, getAttackHitbox(player, sword));
  if (touchesEnemy(enemy, getPlayerHitbox(player))) {
    damagePlayer(player);
  }
  render();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
