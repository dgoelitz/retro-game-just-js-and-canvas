import { createInput } from "./input.js";
import { createPlayer, createSword, renderPlayer, updatePlayer } from "./player.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const input = createInput();
const player = createPlayer();
const sword = createSword();

ctx.imageSmoothingEnabled = false;

let lastTime = 0;

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#1d2b53";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  renderPlayer(ctx, player, sword);
}

function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  updatePlayer(player, sword, input, deltaTime, canvas);
  render();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
