import { createInput } from "./input.js";
import { hitEnemy, renderEnemy, touchesEnemy, updateEnemy } from "./enemies/enemy.js";
import { createGameSession, GAME_STATE_GAME_OVER, resetGameSession } from "./game-state.js";
import {
  constrainPlayerToRoom,
  isTransitioning,
  renderWorld,
  tryStartRoomTransition,
  updateWorldTransition
} from "./world/world.js";
import {
  damagePlayer,
  getPlayerHitbox,
  renderPlayer,
  renderPlayerHealth,
  updatePlayer
} from "./player/player.js";
import { getAttackHitbox } from "./player/sword.js";
import { renderGameOverScreen } from "./ui/game-over-screen.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const input = createInput();
const session = createGameSession();

ctx.imageSmoothingEnabled = false;

let lastTime = 0;

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  renderWorld(ctx, session.world, canvas, (roomIndex, offset) => {
    const roomEnemies = session.enemiesByRoom[roomIndex] ?? [];

    for (const enemy of roomEnemies) {
      renderEnemy(ctx, enemy, offset);
    }

    if (roomIndex === session.world.currentRoomIndex) {
      renderPlayer(ctx, session.player, session.sword, offset);
    }
  });

  renderPlayerHealth(ctx, session.player);

  if (session.mode === GAME_STATE_GAME_OVER) {
    renderGameOverScreen(ctx, canvas);
  }
}

function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (session.mode === GAME_STATE_GAME_OVER) {
    if (input.attack) {
      resetGameSession(session);
      input.attack = false;
    }
  } else if (isTransitioning(session.world)) {
    updateWorldTransition(session.world, deltaTime);
  } else {
    updatePlayer(session.player, session.sword, input, deltaTime);
    if (!tryStartRoomTransition(session.player, session.world, canvas)) {
      constrainPlayerToRoom(session.player, session.world, canvas);
    }

    const attackHitbox = getAttackHitbox(session.player, session.sword);
    const playerHitbox = getPlayerHitbox(session.player);
    const roomEnemies = session.enemiesByRoom[session.world.currentRoomIndex] ?? [];

    for (const enemy of roomEnemies) {
      updateEnemy(enemy, session.player, deltaTime, canvas);
      hitEnemy(enemy, attackHitbox);
      if (touchesEnemy(enemy, playerHitbox)) {
        damagePlayer(session.player);
      }
    }

    if (session.player.health === 0) {
      session.mode = GAME_STATE_GAME_OVER;
      session.sword.active = false;
    }
  }

  render();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
