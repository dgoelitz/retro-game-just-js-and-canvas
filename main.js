import { createInput } from "./input.js";
import { hitEnemy, renderEnemy, touchesEnemy, updateEnemy } from "./enemies/enemy.js";
import { createEnemiesByRoom } from "./enemies/enemy-manager.js";
import {
  constrainPlayerToRoom,
  createWorld,
  isTransitioning,
  renderWorld,
  tryStartRoomTransition,
  updateWorldTransition
} from "./world.js";
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

const GAME_STATE_PLAYING = "playing";
const GAME_STATE_GAME_OVER = "game-over";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const input = createInput();
let player = createPlayer();
let sword = createSword();
let world = createWorld();
let enemiesByRoom = createEnemiesByRoom();
let gameState = GAME_STATE_PLAYING;

ctx.imageSmoothingEnabled = false;

let lastTime = 0;

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  renderWorld(ctx, world, canvas, (roomIndex, offsetX, offsetY) => {
    const roomEnemies = enemiesByRoom[roomIndex] ?? [];

    for (const enemy of roomEnemies) {
      renderEnemy(ctx, enemy, offsetX, offsetY);
    }

    if (roomIndex === world.currentRoomIndex) {
      renderPlayer(ctx, player, sword, offsetX, offsetY);
    }
  });

  renderPlayerHealth(ctx, player);

  if (gameState === GAME_STATE_GAME_OVER) {
    renderGameOverScreen();
  }
}

function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (gameState === GAME_STATE_GAME_OVER) {
    if (input.attack) {
      resetGame();
      input.attack = false;
    }
  } else if (isTransitioning(world)) {
    updateWorldTransition(world, deltaTime);
  } else {
    updatePlayer(player, sword, input, deltaTime, canvas);
    if (!tryStartRoomTransition(player, world, canvas)) {
      constrainPlayerToRoom(player, world, canvas);
    }

    const roomEnemies = enemiesByRoom[world.currentRoomIndex] ?? [];

    for (const enemy of roomEnemies) {
      updateEnemy(enemy, player, deltaTime, canvas);
      hitEnemy(enemy, getAttackHitbox(player, sword));
      if (touchesEnemy(enemy, getPlayerHitbox(player))) {
        damagePlayer(player);
      }
    }

    if (player.health === 0) {
      gameState = GAME_STATE_GAME_OVER;
      sword.active = false;
    }
  }

  render();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

function resetGame() {
  player = createPlayer();
  sword = createSword();
  world = createWorld();
  enemiesByRoom = createEnemiesByRoom();
  gameState = GAME_STATE_PLAYING;
}

function renderGameOverScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ff004d";
  ctx.font = "16px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);

  ctx.fillStyle = "#fff1e8";
  ctx.font = "8px 'Trebuchet MS', sans-serif";
  ctx.fillText("Press Space to continue", canvas.width / 2, canvas.height / 2 + 10);
}
