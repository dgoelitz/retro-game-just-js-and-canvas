import {
  damagePlayerFromProjectiles,
  destroyProjectilesOnWalls,
  updateProjectiles
} from "../combat/projectiles.js";
import { handleDungeonRoomEntry, updateDungeonRoomRules } from "../dungeon/dungeon-rules.js";
import {
  blockEnemyWithShield,
  hitEnemy,
  resolveProjectileHitsOnEnemies,
  touchesEnemy,
  updateEnemy
} from "../enemies/enemy.js";
import {
  GAME_STATE_GAME_OVER,
  GAME_STATE_MAP,
  GAME_STATE_PLAYING,
  getActiveWorld,
  getDungeonRespawnDestination,
  getOverworldRespawnDestination,
  setGameOverDestination,
  travelToDestination
} from "../game-state.js";
import { tickTimer } from "../game-utils.js";
import { resolveNpcCollisions, tryTalkToNearbyNpc } from "../npcs/npc-interaction.js";
import {
  damagePlayer,
  getPlayerHitbox,
  getPlayerPosition,
  updatePlayer
} from "../player/player.js";
import { getShieldHitbox, getShieldSweep } from "../player/shield.js";
import { getAttackHitbox } from "../player/sword.js";
import {
  hitRoomProps,
  hitTargetProps,
  interactWithRoomProps,
  resolveWeightSwitches,
  resolveRoomPropCollisions
} from "../world/room-props.js";
import {
  constrainPlayerToRoom,
  resolveRoomGeometryCollisions,
  tryStartRoomTransition
} from "../world/world.js";
import { handleBlockedDoorAtRoomEdge } from "../world/door-interaction.js";

export function updatePlayingState(session, input, ctx, canvas, deltaTime, worldState) {
  tickTimer(session, "roomEntryGraceTimer", deltaTime);

  if (tryOpenMap(session, input)) {
    return;
  }

  handleDungeonRoomEntry(session, ctx, canvas);

  if (session.mode !== GAME_STATE_PLAYING) {
    return;
  }

  const roomState = getActiveRoomState(worldState);
  const previousPlayerPosition = getPlayerPosition(session.player);

  updatePlayer(
    session.player,
    session.sword,
    session.shield,
    input,
    deltaTime,
    session.inventory.hasSword,
    session.inventory.hasShield
  );

  resolvePlayerCollisions(session, previousPlayerPosition, roomState.roomNpcs, roomState.roomProps, worldState.activeWorld);

  if (handleBlockedDoorAtRoomEdge(session, roomState.roomEnemies, worldState.activeWorld, ctx, canvas)) {
    return;
  }

  if (tryHandleRoomTransition(session, roomState.roomIndex, worldState.activeProjectilesByRoom, canvas)) {
    return;
  }

  updateDungeonRoomRules(session, ctx, canvas);
  updateRoomCombat(session, previousPlayerPosition, deltaTime, canvas, roomState);
  resolveWeightSwitches(session, roomState.roomProps, getPlayerHitbox(session.player));
  updateDungeonRoomRules(session, ctx, canvas);
  handleRoomInteraction(session, input, roomState.roomNpcs, roomState.roomProps, ctx, canvas);
  updateGameOverStatus(session);
  input.map = false;
}

function tryOpenMap(session, input) {
  if (!input.map || session.activeWorldKey !== "dungeon") {
    return false;
  }

  session.mode = GAME_STATE_MAP;
  input.map = false;
  return true;
}

function getActiveRoomState(worldState) {
  const roomIndex = worldState.activeWorld.currentRoomIndex;

  return {
    roomIndex,
    room: worldState.activeWorld.rooms[roomIndex],
    roomEnemies: worldState.activeEnemiesByRoom[roomIndex] ?? [],
    roomNpcs: worldState.activeNpcsByRoom[roomIndex] ?? [],
    roomProps: worldState.activeRoomPropsByRoom[roomIndex] ?? [],
    roomProjectiles: getOrCreateRoomProjectiles(worldState.activeProjectilesByRoom, roomIndex)
  };
}

function getOrCreateRoomProjectiles(projectilesByRoom, roomIndex) {
  if (!projectilesByRoom[roomIndex]) {
    projectilesByRoom[roomIndex] = [];
  }

  return projectilesByRoom[roomIndex];
}

function resolvePlayerCollisions(session, previousPlayerPosition, roomNpcs, roomProps, activeWorld) {
  resolveRoomGeometryCollisions(session.player, previousPlayerPosition, activeWorld);
  resolveNpcCollisions(session.player, previousPlayerPosition, roomNpcs);
  resolveRoomPropCollisions(session.player, previousPlayerPosition, roomProps);
}

function tryHandleRoomTransition(session, roomIndex, activeProjectilesByRoom, canvas) {
  if (!tryStartRoomTransition(session, canvas)) {
    constrainPlayerToRoom(session.player, getActiveWorld(session), canvas, session.inventory);
    return false;
  }

  activeProjectilesByRoom[roomIndex] = [];
  return true;
}

function updateRoomCombat(session, previousPlayerPosition, deltaTime, canvas, roomState) {
  const attackHitbox = getAttackHitbox(session.player, session.sword);

  for (const enemy of roomState.roomEnemies) {
    updateEnemy(enemy, session.player, deltaTime, canvas, roomState.roomProjectiles, roomState.roomEnemies);
    hitEnemy(enemy, attackHitbox);
  }

  updateProjectiles(roomState.roomProjectiles, deltaTime, canvas);
  destroyProjectilesOnWalls(roomState.roomProjectiles, roomState.room.internalWalls ?? []);
  resolveProjectileHitsOnEnemies(roomState.roomEnemies, roomState.roomProjectiles);
  hitTargetProps(roomState.roomProps, roomState.roomProjectiles);
  hitRoomProps(roomState.roomProps, attackHitbox);
  resolvePlayerDamage(session, previousPlayerPosition, roomState.roomEnemies, roomState.roomProjectiles);
}

function resolvePlayerDamage(session, previousPlayerPosition, roomEnemies, roomProjectiles) {
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
}

function canUseRoomEntryGrace(enemy) {
  return enemy.type !== "boss" && enemy.type !== "miniboss";
}

function handleRoomInteraction(session, input, roomNpcs, roomProps, ctx, canvas) {
  if (!input.interact) {
    return;
  }

  const playerHitbox = getPlayerHitbox(session.player);
  const talkedToNpc = tryTalkToNearbyNpc(session, roomNpcs, ctx, canvas, playerHitbox);

  if (!talkedToNpc) {
    const interaction = interactWithRoomProps(session, roomProps, playerHitbox, ctx, canvas);

    if (interaction.destination) {
      travelToDestination(session, interaction.destination);
    }
  }

  input.interact = false;
}

function updateGameOverStatus(session) {
  if (session.player.health > 0) {
    return;
  }

  session.mode = GAME_STATE_GAME_OVER;
  session.sword.active = false;
  session.shield.active = false;

  if (session.activeWorldKey === "dungeon") {
    setGameOverDestination(session, getDungeonRespawnDestination());
    return;
  }

  setGameOverDestination(session, getOverworldRespawnDestination());
}
