import { createInput } from "./input.js";
import { advanceDialogue, startDialogue, updateDialogue } from "./dialogue/dialogue-state.js";
import { createDialoguePages } from "./dialogue/dialogue-pages.js";
import {
  damagePlayerFromProjectiles,
  destroyProjectilesOnWalls,
  renderProjectiles,
  updateProjectiles
} from "./combat/projectiles.js";
import { handleDungeonRoomEntry, updateDungeonRoomRules } from "./dungeon/dungeon-rules.js";
import {
  blockEnemyWithShield,
  hitEnemy,
  renderEnemy,
  resolveProjectileHitsOnEnemies,
  touchesEnemy,
  updateEnemy
} from "./enemies/enemy.js";
import {
  applyDebugStart,
  createGameSession,
  GAME_STATE_DIALOGUE,
  GAME_STATE_GAME_OVER,
  GAME_STATE_MAP,
  GAME_STATE_PLAYING,
  getActiveEnemiesByRoom,
  getActiveNpcsByRoom,
  getActiveProjectilesByRoom,
  getActiveRoomPropsByRoom,
  getActiveWorld,
  getDungeonRespawnDestination,
  getOverworldRespawnDestination,
  respawnAfterGameOver,
  setGameOverDestination,
  travelToDestination
} from "./game-state.js";
import { renderNpc } from "./npcs/npc.js";
import { resolveNpcCollisions, tryTalkToNearbyNpc } from "./npcs/npc-interaction.js";
import {
  hitRoomProps,
  hitTargetProps,
  interactWithRoomProps,
  renderRoomProp,
  resolveRoomPropCollisions
} from "./world/room-props.js";
import {
  constrainPlayerToRoom,
  getBlockedDoorKindAtRoomEdge,
  handleWorldTransition,
  isTransitioning,
  renderWorld,
  resolveRoomGeometryCollisions,
  tryStartRoomTransition
} from "./world/world.js";
import {
  damagePlayer,
  getPlayerHitbox,
  getPlayerPosition,
  renderPlayer,
  renderPlayerHealth,
  updatePlayer
} from "./player/player.js";
import { getShieldHitbox, getShieldSweep } from "./player/shield.js";
import { getAttackHitbox } from "./player/sword.js";
import { renderDialogueBox } from "./ui/dialogue-box.js";
import { renderGameOverScreen } from "./ui/game-over-screen.js";
import { renderMapScreen } from "./ui/map-screen.js";
import { tickTimer } from "./game-utils.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const input = createInput();
const session = createGameSession();
const debugStartKey = window.location.hash.replace("#", "");
const BLOCKED_DOOR_MESSAGE_BY_KIND = {
  barred: "Some big old metal bars are in the way. What's the point of having a door here if they were gong to do that?",
  key: "There's a little keyhole on this door. Don't tell it I said it's little in case it's sensitive about that.",
  "boss-key": "The keyhole on this door is big and fancy. They've really got class around here."
};

ctx.imageSmoothingEnabled = false;

if (debugStartKey) {
  applyDebugStart(session, debugStartKey);
}

let lastTime = 0;

function render() {
  const activeWorld = getActiveWorld(session);
  const activeEnemiesByRoom = getActiveEnemiesByRoom(session);
  const activeNpcsByRoom = getActiveNpcsByRoom(session);
  const activeRoomPropsByRoom = getActiveRoomPropsByRoom(session);
  const activeProjectilesByRoom = getActiveProjectilesByRoom(session);

  if (session.mode === GAME_STATE_MAP) {
    renderMapScreen(ctx, canvas, activeWorld, session.inventory, session.progress.dungeon);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  renderWorld(ctx, activeWorld, canvas, (roomIndex, offset) => {
    const roomEnemies = activeEnemiesByRoom[roomIndex] ?? [];
    const roomProjectiles = activeProjectilesByRoom[roomIndex] ?? [];
    const roomNpcs = activeNpcsByRoom[roomIndex] ?? [];
    const roomProps = activeRoomPropsByRoom[roomIndex] ?? [];

    for (const enemy of roomEnemies) {
      enemy.transparent = canUseRoomEntryGrace(enemy) && roomIndex === activeWorld.currentRoomIndex && session.roomEntryGraceTimer > 0;
      renderEnemy(ctx, enemy, offset);
    }

    renderProjectiles(ctx, roomProjectiles, offset);

    for (const prop of roomProps) {
      renderRoomProp(ctx, prop, offset);
    }

    for (const npc of roomNpcs) {
      renderNpc(ctx, npc, offset);
    }

    if (roomIndex === activeWorld.currentRoomIndex) {
      renderPlayer(ctx, session.player, session.sword, session.shield, offset);
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

  const activeWorld = getActiveWorld(session);
  const activeEnemiesByRoom = getActiveEnemiesByRoom(session);
  const activeNpcsByRoom = getActiveNpcsByRoom(session);
  const activeRoomPropsByRoom = getActiveRoomPropsByRoom(session);
  const activeProjectilesByRoom = getActiveProjectilesByRoom(session);

  if (session.mode === GAME_STATE_GAME_OVER) {
    if (input.attack || input.interact) {
      respawnAfterGameOver(session);
      input.attack = false;
      input.interact = false;
    }
  } else if (session.mode === GAME_STATE_DIALOGUE) {
    updateDialogue(session.dialogue, deltaTime);

    if (input.attack || input.interact) {
      advanceDialogue(session, input);
    }
  } else if (session.mode === GAME_STATE_MAP) {
    if (input.map) {
      session.mode = GAME_STATE_PLAYING;
      input.map = false;
    }
  } else if (isTransitioning(activeWorld)) {
    handleWorldTransition(activeWorld, session.player, activeRoomPropsByRoom, canvas, deltaTime);
  } else {
    tickTimer(session, "roomEntryGraceTimer", deltaTime);

    if (input.map && session.activeWorldKey === "dungeon") {
      session.mode = GAME_STATE_MAP;
      input.map = false;
      render();
      requestAnimationFrame(gameLoop);
      return;
    }

    handleDungeonRoomEntry(session, ctx, canvas);

    if (session.mode !== GAME_STATE_PLAYING) {
      render();
      requestAnimationFrame(gameLoop);
      return;
    }

    const previousPlayerPosition = getPlayerPosition(session.player);
    const roomIndex = activeWorld.currentRoomIndex;
    const roomEnemies = activeEnemiesByRoom[roomIndex] ?? [];
    const roomNpcs = activeNpcsByRoom[roomIndex] ?? [];
    const roomProps = activeRoomPropsByRoom[roomIndex] ?? [];
    const roomProjectiles = getRoomProjectiles(activeProjectilesByRoom, roomIndex);
    const room = activeWorld.rooms[roomIndex];

    updatePlayer(
      session.player,
      session.sword,
      session.shield,
      input,
      deltaTime,
      session.inventory.hasSword,
      session.inventory.hasShield
    );

    resolveRoomGeometryCollisions(session.player, previousPlayerPosition, activeWorld);
    resolveNpcCollisions(session.player, previousPlayerPosition, roomNpcs);
    resolveRoomPropCollisions(session.player, previousPlayerPosition, roomProps);

    const blockedDoorKind = getBlockedDoorKindAtRoomEdge(session.player, activeWorld, canvas, session.inventory);

    if (blockedDoorKind && !session.blockedDoorMessageShown) {
      session.blockedDoorMessageShown = true;
      constrainPlayerToRoom(session.player, activeWorld, canvas, session.inventory);
      startBlockedDoorDialogue(session, blockedDoorKind);
      render();
      requestAnimationFrame(gameLoop);
      return;
    }

    if (!tryStartRoomTransition(session, canvas)) {
      constrainPlayerToRoom(session.player, activeWorld, canvas, session.inventory);
    } else {
      activeProjectilesByRoom[roomIndex] = [];
      render();
      requestAnimationFrame(gameLoop);
      return;
    }

    updateDungeonRoomRules(session, ctx, canvas);

    for (const enemy of roomEnemies) {
      updateEnemy(enemy, session.player, deltaTime, canvas, roomProjectiles, roomEnemies);
      hitEnemy(enemy, getAttackHitbox(session.player, session.sword));
    }

    updateProjectiles(roomProjectiles, deltaTime, canvas);
    destroyProjectilesOnWalls(roomProjectiles, room.internalWalls ?? []);
    resolveProjectileHitsOnEnemies(roomEnemies, roomProjectiles);
    hitTargetProps(roomProps, roomProjectiles);
    hitRoomProps(roomProps, getAttackHitbox(session.player, session.sword));

    const playerHitbox = getPlayerHitbox(session.player);
    const shieldHitbox = getShieldHitbox(session.player, session.shield);
    const shieldSweep = getShieldSweep(session.player, session.shield, previousPlayerPosition);

    for (const enemy of roomEnemies) {
      if (blockEnemyWithShield(enemy, shieldHitbox, session.player.facing)) {
        continue;
      }

      if (canUseRoomEntryGrace(enemy) && session.roomEntryGraceTimer > 0) {
        continue;
      }

      if (touchesEnemy(enemy, playerHitbox)) {
        damagePlayer(session.player);
      }
    }

    if (damagePlayerFromProjectiles(roomProjectiles, playerHitbox, shieldHitbox, shieldSweep)) {
      damagePlayer(session.player);
    }

    updateDungeonRoomRules(session, ctx, canvas);

    if (input.interact) {
      const talkedToNpc = tryTalkToNearbyNpc(session, roomNpcs, ctx, canvas, playerHitbox);

      if (!talkedToNpc) {
        const interaction = interactWithRoomProps(session, roomProps, playerHitbox, ctx, canvas);

        if (interaction.destination) {
          travelToDestination(session, interaction.destination);
        }
      }

      input.interact = false;
    }

    if (session.player.health === 0) {
      session.mode = GAME_STATE_GAME_OVER;
      session.sword.active = false;
      session.shield.active = false;

      if (session.activeWorldKey === "dungeon") {
        setGameOverDestination(session, getDungeonRespawnDestination());
      } else {
        setGameOverDestination(session, getOverworldRespawnDestination());
      }
    }

    input.map = false;
  }

  render();

  requestAnimationFrame(gameLoop);
}

function getRoomProjectiles(projectilesByRoom, roomIndex) {
  if (!projectilesByRoom[roomIndex]) {
    projectilesByRoom[roomIndex] = [];
  }

  return projectilesByRoom[roomIndex];
}

function startBlockedDoorDialogue(session, doorKind) {
  const message = BLOCKED_DOOR_MESSAGE_BY_KIND[doorKind];

  if (!message) {
    return;
  }

  startDialogue(session, createDialoguePages(ctx, canvas, message));
}

function canUseRoomEntryGrace(enemy) {
  return enemy.type !== "boss" && enemy.type !== "miniboss";
}

requestAnimationFrame(gameLoop);
