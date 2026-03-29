import { createInput } from "./input.js";
import { createEnemy, hitEnemy, renderEnemy, touchesEnemy, updateEnemy } from "./enemy.js";
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

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const input = createInput();
const player = createPlayer();
const sword = createSword();
const enemy = createEnemy();
const world = createWorld();

const ENEMY_ROOM_INDEX = 0;

ctx.imageSmoothingEnabled = false;

let lastTime = 0;

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  renderWorld(ctx, world, canvas, (roomIndex, offsetX) => {
    if (roomIndex === ENEMY_ROOM_INDEX) {
      renderEnemy(ctx, enemy, offsetX);
    }

    if (roomIndex === world.currentRoomIndex) {
      renderPlayer(ctx, player, sword, offsetX);
    }
  });

  renderPlayerHealth(ctx, player);
}

function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (isTransitioning(world)) {
    updateWorldTransition(world, deltaTime);
  } else {
    updatePlayer(player, sword, input, deltaTime, canvas);
    if (!tryStartRoomTransition(player, world, canvas)) {
      constrainPlayerToRoom(player, world, canvas);
    }

    if (world.currentRoomIndex === ENEMY_ROOM_INDEX) {
      updateEnemy(enemy, player, deltaTime, canvas);
      hitEnemy(enemy, getAttackHitbox(player, sword));
      if (touchesEnemy(enemy, getPlayerHitbox(player))) {
        damagePlayer(player);
      }
    }
  }

  render();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
