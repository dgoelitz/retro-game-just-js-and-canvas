import { createInput } from "./input.js";
import { advanceDialogue, updateDialogue } from "./dialogue/dialogue-state.js";
import { hitEnemy, renderEnemy, touchesEnemy, updateEnemy } from "./enemies/enemy.js";
import {
  createGameSession,
  GAME_STATE_DIALOGUE,
  GAME_STATE_GAME_OVER,
  resetGameSession
} from "./game-state.js";
import { renderNpc } from "./npcs/npc.js";
import { resolveNpcCollisions, tryTalkToNearbyNpc } from "./npcs/npc-interaction.js";
import {
  hitRoomProps,
  pushPlayerOutOfEdgeBlockers,
  renderRoomProp,
  resolveRoomPropCollisions
} from "./world/room-props.js";
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
import { renderDialogueBox } from "./ui/dialogue-box.js";
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
    const roomNpcs = session.npcsByRoom[roomIndex] ?? [];
    const roomProps = session.roomPropsByRoom[roomIndex] ?? [];

    for (const enemy of roomEnemies) {
      renderEnemy(ctx, enemy, offset);
    }

    for (const prop of roomProps) {
      renderRoomProp(ctx, prop, offset);
    }

    for (const npc of roomNpcs) {
      renderNpc(ctx, npc, offset);
    }

    if (roomIndex === session.world.currentRoomIndex) {
      renderPlayer(ctx, session.player, session.sword, offset);
    }
  });

  renderPlayerHealth(ctx, session.player);

  if (session.mode === GAME_STATE_GAME_OVER) {
    renderGameOverScreen(ctx, canvas);
  } else if (session.mode === GAME_STATE_DIALOGUE) {
    renderDialogueBox(ctx, canvas, session.dialogue);
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
  } else if (session.mode === GAME_STATE_DIALOGUE) {
    updateDialogue(session.dialogue, deltaTime);

    if (input.attack || input.interact) {
      advanceDialogue(session, input);
    }
  } else if (isTransitioning(session.world)) {
    const completedTransition = session.world.transition;
    updateWorldTransition(session.world, deltaTime);

    if (!isTransitioning(session.world)) {
      const currentRoomProps = session.roomPropsByRoom[session.world.currentRoomIndex] ?? [];
      const enteredFromEdge = getEnteredRoomEdge(completedTransition);
      if (enteredFromEdge) {
        pushPlayerOutOfEdgeBlockers(session.player, currentRoomProps, enteredFromEdge, canvas);
      }
    }
  } else {
    const previousPlayerPosition = {
      x: session.player.x,
      y: session.player.y
    };
    updatePlayer(session.player, session.sword, input, deltaTime, session.hasSword);

    const roomNpcs = session.npcsByRoom[session.world.currentRoomIndex] ?? [];
    const roomProps = session.roomPropsByRoom[session.world.currentRoomIndex] ?? [];
    resolveNpcCollisions(session.player, previousPlayerPosition, roomNpcs);
    resolveRoomPropCollisions(session.player, previousPlayerPosition, roomProps);

    if (!tryStartRoomTransition(session.player, session.world, canvas)) {
      constrainPlayerToRoom(session.player, session.world, canvas);
    }

    const attackHitbox = getAttackHitbox(session.player, session.sword);
    hitRoomProps(roomProps, attackHitbox);
    const currentPlayerHitbox = getPlayerHitbox(session.player);
    const roomEnemies = session.enemiesByRoom[session.world.currentRoomIndex] ?? [];

    for (const enemy of roomEnemies) {
      updateEnemy(enemy, session.player, deltaTime, canvas);
      hitEnemy(enemy, attackHitbox);
      if (touchesEnemy(enemy, currentPlayerHitbox)) {
        damagePlayer(session.player);
      }
    }

    if (input.interact) {
      tryTalkToNearbyNpc(session, ctx, canvas, currentPlayerHitbox);
      input.interact = false;
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

function getEnteredRoomEdge(completedTransition) {
  if (!completedTransition) {
    return null;
  }

  if (completedTransition.directionX > 0) {
    return "right";
  }

  if (completedTransition.directionX < 0) {
    return "left";
  }

  return null;
}
