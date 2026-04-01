import { createInput } from "./input.js";
import { hitEnemy, renderEnemy, touchesEnemy, updateEnemy } from "./enemies/enemy.js";
import {
  createGameSession,
  GAME_STATE_DIALOGUE,
  GAME_STATE_GAME_OVER,
  GAME_STATE_PLAYING,
  resetGameSession
} from "./game-state.js";
import { getNpcDialogue } from "./npcs/npc-manager.js";
import { canTalkToNpc, renderNpc, touchesNpc } from "./npcs/npc.js";
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
  getPlayerPosition,
  renderPlayer,
  renderPlayerHealth,
  setPlayerPosition,
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

    for (const enemy of roomEnemies) {
      renderEnemy(ctx, enemy, offset);
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
    if (input.attack || input.interact) {
      advanceDialogue(session, input);
    }
  } else if (isTransitioning(session.world)) {
    updateWorldTransition(session.world, deltaTime);
  } else {
    const previousPlayerPosition = getPlayerPosition(session.player);
    updatePlayer(session.player, session.sword, input, deltaTime, session.hasSword);

    const roomNpcs = session.npcsByRoom[session.world.currentRoomIndex] ?? [];
    resolveNpcCollisions(session.player, previousPlayerPosition, roomNpcs);

    if (!tryStartRoomTransition(session.player, session.world, canvas)) {
      constrainPlayerToRoom(session.player, session.world, canvas);
    }

    const attackHitbox = getAttackHitbox(session.player, session.sword);
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
      tryTalkToNearbyNpc(session, currentPlayerHitbox);
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

function resolveNpcCollisions(player, previousPosition, roomNpcs) {
  const movedPosition = getPlayerPosition(player);

  if (!overlapsAnyNpc(roomNpcs, getPlayerHitbox(player))) {
    return;
  }

  setPlayerPosition(player, {
    x: previousPosition.x,
    y: movedPosition.y
  });

  if (!overlapsAnyNpc(roomNpcs, getPlayerHitbox(player))) {
    return;
  }

  setPlayerPosition(player, {
    x: movedPosition.x,
    y: previousPosition.y
  });

  if (!overlapsAnyNpc(roomNpcs, getPlayerHitbox(player))) {
    return;
  }

  setPlayerPosition(player, previousPosition);
}

function overlapsAnyNpc(roomNpcs, playerHitbox) {
  for (const npc of roomNpcs) {
    if (touchesNpc(npc, playerHitbox)) {
      return true;
    }
  }

  return false;
}

function tryTalkToNearbyNpc(session, playerHitbox) {
  const roomNpcs = session.npcsByRoom[session.world.currentRoomIndex] ?? [];

  for (const npc of roomNpcs) {
    if (!canTalkToNpc(npc, playerHitbox)) {
      continue;
    }

    const dialogueData = getNpcDialogue(npc, session);
    session.dialogue = {
      pages: dialogueData.pages,
      pageIndex: 0,
      rewardSword: dialogueData.rewardSword
    };
    session.mode = GAME_STATE_DIALOGUE;
    session.sword.active = false;
    return;
  }
}

function advanceDialogue(session, input) {
  input.attack = false;
  input.interact = false;

  if (!session.dialogue) {
    session.mode = session.player.health === 0 ? GAME_STATE_GAME_OVER : GAME_STATE_PLAYING;
    return;
  }

  if (session.dialogue.pageIndex < session.dialogue.pages.length - 1) {
    session.dialogue.pageIndex += 1;
    return;
  }

  if (session.dialogue.rewardSword) {
    session.hasSword = true;
  }

  session.dialogue = null;
  session.mode = GAME_STATE_PLAYING;
}
